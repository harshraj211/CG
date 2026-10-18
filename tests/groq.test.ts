import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { groqCompletion, GroqError } from "../services/groq";
import { POST } from "../app/api/ai/route";
import { aiCoding, finalAiCoding } from "../data";
import { parseEvaluation, normalizeEvaluation } from "../lib/ai-validation";

const approach = {
  understanding: "Find two distinct indices that sum to the target.",
  algorithm:
    "Scan numbers and find each complement in a map before inserting the current index.",
  dataStructure: "A hash map from value to index.",
  variables: "Current index, value, complement and previously seen map.",
  edgeCases:
    "Handle duplicate values with different indices and return empty if no pair exists.",
  timeComplexity: "O(n) expected time.",
  spaceComplexity: "O(n) auxiliary space.",
};
const evaluation = {
  problemUnderstanding: 20,
  algorithm: 25,
  dataStructure: 15,
  edgeCases: 15,
  complexity: 15,
  promptClarity: 10,
  total: 100,
  missing: [],
  feedback: "Your reasoning covers the required cases.",
  eligibleForSolution: true,
};
const reply = (text: string) =>
  Response.json({
    choices: [{ finish_reason: "stop", message: { content: text } }],
  });

function keyForTest(t: TestContext) {
  const previous = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = "test-only-key";
  t.after(() => {
    if (previous === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = previous;
  });
}
function request(mode: "evaluate" | "generate", tag: string) {
  return new NextRequest("http://127.0.0.1:3000/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": tag },
    body: JSON.stringify({
      problemId: "ai-code-001",
      language: "Python",
      mode,
      approach,
    }),
  });
}

test("Groq quota errors retain retry guidance without exposing upstream secrets", async (t) => {
  keyForTest(t);
  const fake: typeof fetch = async () =>
    Response.json(
      { error: "sensitive provider response" },
      { status: 429, headers: { "retry-after": "12" } },
    );
  await assert.rejects(
    groqCompletion({ prompt: "Check", maxTokens: 100 }, fake),
    (e: unknown) =>
      e instanceof GroqError &&
      e.status === 429 &&
      e.retryAfter === "12" &&
      !e.message.includes("sensitive"),
  );
});
test("Groq cancellation returns a timeout rather than a quota error", async (t) => {
  keyForTest(t);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    groqCompletion(
      { prompt: "Check", maxTokens: 100, signal: controller.signal },
      async () => {
        throw new Error("aborted");
      },
    ),
    (e: unknown) => e instanceof GroqError && e.status === 504,
  );
});
test("truncated model output is rejected", async (t) => {
  keyForTest(t);
  await assert.rejects(
    groqCompletion({ prompt: "Check", maxTokens: 100 }, async () =>
      Response.json({
        choices: [{ finish_reason: "length", message: { content: "partial" } }],
      }),
    ),
    /output limit/,
  );
});
test("strict-output parsing failure retries once in JSON mode with the same deadline", async (t) => {
  keyForTest(t);
  let calls = 0;
  let firstSignal: AbortSignal | null | undefined;
  const result = await groqCompletion(
    {
      prompt: "Evaluate",
      schema: { type: "object", properties: {}, additionalProperties: false },
      maxTokens: 100,
    },
    async (_url, options) => {
      calls++;
      const body = JSON.parse(String(options?.body));
      if (calls === 1) {
        firstSignal = options?.signal;
        assert.equal(body.response_format.type, "json_schema");
        return Response.json(
          { error: { code: "output_parse_failed" } },
          { status: 400 },
        );
      }
      assert.equal(options?.signal, firstSignal);
      assert.equal(body.response_format.type, "json_object");
      return reply(JSON.stringify(evaluation));
    },
  );
  assert.equal(calls, 2);
  assert.equal(JSON.parse(result).total, 100);
});
test("generation cannot bypass server evaluation even if the model claims eligibility", async (t) => {
  keyForTest(t);
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    calls++;
    return reply(JSON.stringify({ ...evaluation, algorithm: 0, total: 100 }));
  });
  const result = await POST(request("generate", "groq-gate-test"));
  const data = await result.json();
  assert.equal(result.status, 422);
  assert.equal(calls, 1);
  assert.equal(data.evaluation.total, 75);
  assert.equal(data.evaluation.eligibleForSolution, false);
  assert.equal(data.solution, undefined);
});
test("successful generation re-evaluates first and returns the implementation", async (t) => {
  keyForTest(t);
  const requests: Record<string, unknown>[] = [];
  t.mock.method(
    globalThis,
    "fetch",
    async (_url: string, options: RequestInit) => {
      requests.push(JSON.parse(String(options.body)));
      return reply(
        requests.length === 1
          ? JSON.stringify(evaluation)
          : "def solve(data):\n    return []",
      );
    },
  );
  const result = await POST(request("generate", "groq-success-test"));
  assert.equal(result.status, 200);
  assert.equal(requests.length, 2);
  assert.ok(requests[0].response_format);
  assert.equal(requests[1].response_format, undefined);
  const messages = requests[1].messages as { content: string }[];
  const context = JSON.parse(messages[1].content.split("Candidate data: ")[1]);
  const problem = aiCoding.find((p) => p.id === "ai-code-001")!;
  assert.equal(context.problem.inputFormat, problem.inputFormat);
  assert.equal(context.problem.outputFormat, problem.outputFormat);
  assert.deepEqual(
    context.problem.examples,
    problem.tests
      .filter((test) => !test.hidden)
      .map(({ input, expected }) => ({ input, expected })),
  );
  assert.match(context.executionContract, /already-decoded JSON/);
  assert.match(context.executionContract, /Never print/);
  assert.match((await result.json()).solution, /def solve/);
});
test("malformed scoring never unlocks code", async (t) => {
  keyForTest(t);
  t.mock.method(globalThis, "fetch", async () =>
    reply('{"total":100,"eligibleForSolution":true}'),
  );
  const result = await POST(request("generate", "groq-malformed-test"));
  assert.equal(result.status, 502);
  assert.equal((await result.json()).solution, undefined);
});

test("evaluation formatting differences keep validated scores and recompute totals", () => {
  const { total: ignored, ...withoutTotal } = evaluation;
  void ignored;
  const wrapped = {
    evaluation: { ...withoutTotal, algorithm: "25", total: 9999 },
  };
  const parsed = parseEvaluation(
    "```json\n" + JSON.stringify(wrapped) + "\n```",
  );
  assert.equal(parsed.total, 100);
  assert.equal(parsed.eligibleForSolution, true);
  assert.equal(normalizeEvaluation(withoutTotal).total, 100);
});
test("format normalization never manufactures eligibility or clamps invalid scores", () => {
  assert.throws(() => normalizeEvaluation({ ...evaluation, algorithm: "26" }));
  assert.throws(() =>
    normalizeEvaluation({ ...evaluation, algorithm: "15.9" }),
  );
  assert.throws(() =>
    normalizeEvaluation({ ...evaluation, eligibleForSolution: "false" }),
  );
  const { missing: ignored, ...incomplete } = evaluation;
  void ignored;
  assert.throws(() => normalizeEvaluation(incomplete));
  assert.equal(
    normalizeEvaluation({ ...evaluation, eligibleForSolution: false })
      .eligibleForSolution,
    false,
  );
});
test("a malformed evaluation gets one repair before a valid evaluation is returned", async (t) => {
  keyForTest(t);
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    calls++;
    return reply(
      calls === 1 ? JSON.stringify({ total: 100 }) : JSON.stringify(evaluation),
    );
  });
  const result = await POST(request("evaluate", "groq-repair-test"));
  assert.equal(result.status, 200);
  assert.equal(calls, 2);
  assert.equal((await result.json()).evaluation.total, 100);
});
test("failed evaluation repair is bounded and cannot trigger generation", async (t) => {
  keyForTest(t);
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    calls++;
    return reply(JSON.stringify({ ...evaluation, algorithm: 999 }));
  });
  const result = await POST(request("generate", "groq-failed-repair-test"));
  const data = await result.json();
  assert.equal(result.status, 502);
  assert.equal(calls, 2);
  assert.equal(data.solution, undefined);
  assert.match(data.error, /even after one retry/);
});

test("reserved final AI problems are accepted and supply their own visible contract", async (t) => {
  keyForTest(t);
  let sent = "";
  const fake: typeof fetch = async (_url, options) => {
    sent = String(options?.body);
    return reply(JSON.stringify(evaluation));
  };
  t.mock.method(globalThis, "fetch", fake);
  const problem = finalAiCoding[4];
  const req = new NextRequest("http://127.0.0.1:3000/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "reserved-ai-test",
    },
    body: JSON.stringify({
      problemId: problem.id,
      language: "Python",
      mode: "evaluate",
      approach,
    }),
  });
  const result = await POST(req);
  assert.equal(result.status, 200);
  assert.ok(sent.includes(problem.title));
  assert.ok(sent.includes(problem.outputFormat));
  assert.ok(!sent.includes((problem.tests[6].input as { log: string }).log));
});
