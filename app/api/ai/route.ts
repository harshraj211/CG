import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assessmentAiCoding } from "@/data";
import { EXECUTION_CONTRACT } from "@/config/ai";
import { groqCompletion, groqConfigured, GroqError } from "@/services/groq";
import { isSameOriginRequest } from "@/lib/request-origin";
import {
  approachSchema,
  evaluationSchema,
  parseEvaluation,
} from "@/lib/ai-validation";
export const runtime = "nodejs";
const bodySchema = z.object({
  problemId: z.string().max(80),
  mode: z.enum(["evaluate", "generate"]),
  language: z.enum(["Python", "JavaScript", "Java", "C++"]),
  approach: approachSchema,
});
const limits = new Map<string, { count: number; reset: number }>();
const fail = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!isSameOriginRequest(origin, req.nextUrl.href, req.headers.get("host")))
    return fail("Cross-origin requests are not allowed.", 403);
  if (Number(req.headers.get("content-length") ?? 0) > 16000)
    return fail("Approach is too long. Keep the request below 16 KB.", 413);
  let text: string;
  try {
    text = await req.text();
  } catch {
    return fail("Request body could not be read.", 400);
  }
  if (text.length > 16000) return fail("Approach is too long.", 413);
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(JSON.parse(text));
  } catch {
    return fail(
      "Explain your understanding, algorithm, data structure, variables, edge cases, and both complexities before asking for code.",
      400,
    );
  }
  const problem = assessmentAiCoding.find((p) => p.id === body.problemId);
  if (!problem) return fail("Unknown AI coding problem.", 404);
  if (!groqConfigured())
    return fail(
      "Groq is not configured. Add GROQ_API_KEY to .env or .env.local and restart the server. Your approach is saved locally.",
      503,
    );
  const now = Date.now();
  for (const [key, v] of limits) if (v.reset < now) limits.delete(key);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const rate = limits.get(ip) ?? { count: 0, reset: now + 60000 };
  if (rate.count >= 8)
    return fail("Too many AI requests. Try again in a minute.", 429);
  rate.count++;
  limits.set(ip, rate);
  const context = JSON.stringify({
    problem: {
      title: problem.title,
      statement: problem.statement,
      constraints: problem.constraints,
      inputFormat: problem.inputFormat,
      outputFormat: problem.outputFormat,
      examples: problem.tests
        .filter((test) => !test.hidden)
        .map(({ input, expected }) => ({ input, expected })),
    },
    executionContract: EXECUTION_CONTRACT,
    candidateApproach: body.approach,
    language: body.language,
  });
  try {
    // All evaluation attempts and generation share a deadline shorter than the
    // browser's 95-second timeout; response repair cannot extend it indefinitely.
    const signal = AbortSignal.any([req.signal, AbortSignal.timeout(80000)]);
    let evaluation: ReturnType<typeof parseEvaluation> | undefined;
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await groqCompletion({
        prompt:
          (attempt === 0
            ? "Evaluate this candidate approach. Return scores and targeted coaching only, never solution code. Each missing or incorrect reasoning component must appear in missing. "
            : "Your previous evaluation could not be validated. Evaluate the same approach again and return the required JSON object only. All six component scores must be integers within their specified maxima. feedback must be a string, missing an array of strings, and eligibleForSolution a boolean. Never include code. ") +
          "Candidate data: " +
          context,
        schema: z.toJSONSchema(evaluationSchema),
        maxTokens: 2500,
        signal,
      });
      try {
        evaluation = parseEvaluation(response);
        break;
      } catch {
        /* One bounded format repair; invalid output never unlocks code. */
      }
    }
    if (!evaluation) {
      return fail(
        "Groq did not return valid scores and feedback, even after one retry. Your approach is saved; no solution has been unlocked. Try evaluating again shortly.",
        502,
      );
    }
    if (body.mode === "evaluate") return NextResponse.json({ evaluation });
    // No client-provided score or eligibility flag is ever trusted.
    if (!evaluation.eligibleForSolution)
      return NextResponse.json(
        {
          evaluation,
          error:
            "Your approach needs improvement. Address the feedback before requesting an implementation.",
        },
        { status: 422 },
      );
    const generated = await groqCompletion({
      prompt:
        "This candidate approach has passed server evaluation. Generate exactly one fenced code block containing the COMPLETE, syntactically valid, executable solution in the requested language. No pseudocode, algorithm sketches, placeholders, or 'for each' pseudo-syntax inside code blocks. Obey executionContract, inputFormat and outputFormat exactly. Accept the decoded input value and RETURN the answer; do not print or read stdin. Check the actual code mentally against every visible example. Then explain important lines, edge cases, and time/space complexity outside the code block. Candidate data: " +
        context,
      maxTokens: 5000,
      signal,
    });
    return NextResponse.json({ evaluation, solution: generated });
  } catch (e) {
    if (e instanceof GroqError)
      return NextResponse.json(
        { error: e.message },
        {
          status: e.status,
          headers: e.retryAfter ? { "Retry-After": e.retryAfter } : {},
        },
      );
    return fail(
      "The AI coach is temporarily unavailable. Your approach is saved; try again.",
      502,
    );
  }
}
