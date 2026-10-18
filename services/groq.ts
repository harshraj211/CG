import { GROQ_MODEL, SYSTEM_PROMPT } from "../config/ai";

export class GroqError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryAfter?: string,
  ) {
    super(message);
    this.name = "GroqError";
  }
}

export function groqConfigured() {
  const key = process.env.GROQ_API_KEY?.trim();
  return !!key && !["your_key_here", "your_groq_key_here"].includes(key);
}

export function groqModel() {
  return process.env.GROQ_MODEL?.trim() || GROQ_MODEL;
}

// Keep the wire schema structural; Zod enforces score/string limits afterwards.
export function structuralSchema(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(structuralSchema);
  if (!value || typeof value !== "object") return value;
  const unsupported = new Set([
    "$schema",
    "minimum",
    "maximum",
    "exclusiveMinimum",
    "exclusiveMaximum",
    "minLength",
    "maxLength",
    "minItems",
    "maxItems",
    "multipleOf",
  ]);
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !unsupported.has(key))
      .map(([key, entry]) => [key, structuralSchema(entry)]),
  );
}

export async function groqCompletion(
  options: {
    prompt: string;
    schema?: unknown;
    maxTokens: number;
    signal?: AbortSignal;
  },
  fetcher: typeof fetch = fetch,
) {
  if (!groqConfigured())
    throw new GroqError(
      "Groq is not configured. Add GROQ_API_KEY to .env or .env.local and restart the server. Your approach is saved locally.",
      503,
    );
  const model = groqModel();
  const strict = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.8-27b",
  ].includes(model);
  const signal = options.signal
    ? AbortSignal.any([options.signal, AbortSignal.timeout(40000)])
    : AbortSignal.timeout(40000);
  let response: Response;
  let requestOptions: RequestInit;
  try {
    response = await fetcher(
      "https://api.groq.com/openai/v1/chat/completions",
      (requestOptions = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY!.trim()}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal,
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content:
                options.prompt +
                (options.schema
                  ? "\nReturn only JSON matching this schema: " +
                    JSON.stringify(options.schema)
                  : ""),
            },
          ],
          temperature: options.schema ? 0.1 : 0.2,
          max_completion_tokens: options.maxTokens,
          ...(model.startsWith("openai/gpt-oss-")
            ? { reasoning_effort: "low" }
            : {}),
          ...(options.schema
            ? {
                response_format: strict
                  ? {
                      type: "json_schema",
                      json_schema: {
                        name: "approach_evaluation",
                        strict: true,
                        schema: structuralSchema(options.schema),
                      },
                    }
                  : { type: "json_object" },
              }
            : {}),
        }),
      }),
    );
    if (options.schema && strict && response.status === 400) {
      const error = await response
        .clone()
        .json()
        .catch(() => null);
      if (error?.error?.code === "output_parse_failed") {
        // One format fallback, sharing the original deadline; Zod still gates code.
        const body = JSON.parse(String(requestOptions.body));
        body.response_format = { type: "json_object" };
        response = await fetcher(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            ...requestOptions,
            body: JSON.stringify(body),
          },
        );
      }
    }
  } catch {
    if (signal.aborted)
      throw new GroqError(
        "Groq timed out. Your approach is saved; try again.",
        504,
      );
    throw new GroqError(
      "Could not reach Groq. Check your connection and try again.",
      502,
    );
  }
  if (!response.ok) {
    if (response.status === 429) {
      const raw = response.headers.get("retry-after");
      const seconds =
        raw && /^\d+$/.test(raw)
          ? String(Math.min(Number(raw), 86400))
          : undefined;
      throw new GroqError(
        `Groq's rate limit has been reached.${seconds ? ` Try again in ${seconds} seconds.` : " Wait a moment before retrying."} Your approach is saved.`,
        429,
        seconds,
      );
    }
    if ([401, 403].includes(response.status))
      throw new GroqError(
        "Groq rejected the API key or model access. Check GROQ_API_KEY and your Groq project permissions.",
        502,
      );
    if ([400, 404, 413].includes(response.status))
      throw new GroqError(
        "Groq rejected the model or request. Check GROQ_MODEL, model access, and approach length.",
        502,
      );
    throw new GroqError(
      "Groq is temporarily unavailable. Your approach is saved; try again.",
      502,
    );
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new GroqError(
      "Groq returned an unreadable response. No solution has been unlocked.",
      502,
    );
  }
  const choice = data?.choices?.[0];
  if (choice?.finish_reason === "length")
    throw new GroqError(
      "Groq's response reached its output limit. Shorten your approach and retry; no new solution has been unlocked.",
      502,
    );
  const content = choice?.message?.content;
  if (typeof content !== "string" || !content.trim())
    throw new GroqError(
      "Groq returned an empty response. Your approach is saved; try again.",
      502,
    );
  return content;
}
