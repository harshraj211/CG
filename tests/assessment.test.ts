import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mocks,
  mcqs,
  coding,
  debugging,
  aiCoding,
  reasoning,
  interviews,
  allQuestions,
  assessmentQuestions,
} from "../data";
import {
  createMock,
  advanceMock,
  scoreQuestions,
  readiness,
} from "../lib/assessment";
import { approachSchema, normalizeEvaluation } from "../lib/ai-validation";
import { initialProgress, progressSchema } from "../services/storage";
test("question banks meet requested counts and contain unambiguous options", () => {
  assert.equal(mcqs.length, 250);
  assert.equal(coding.length, 75);
  assert.equal(debugging.length, 50);
  assert.equal(aiCoding.length, 30);
  assert.equal(reasoning.length, 80);
  assert.ok(interviews.length >= 100);
  assert.equal(
    new Set(allQuestions.map((q) => q.id)).size,
    allQuestions.length,
  );
  for (const q of allQuestions) {
    assert.equal(q.options.length, 4, q.id);
    assert.equal(new Set(q.options).size, 4, q.id);
    assert.ok(q.correctAnswer >= 0 && q.correctAnswer < 4);
    assert.ok(q.explanation.length > 20);
  }
});
test("all coding exercises have complete metadata and boundary tests", () => {
  for (const p of [...coding, ...debugging, ...aiCoding]) {
    assert.ok(p.statement.length > 30, p.id);
    assert.ok(p.tests.length >= 3, p.id);
    assert.ok(p.tests.some((t) => t.hidden));
    assert.ok(p.solution.startsWith("def solve(data):"));
    assert.ok(p.tags.length);
    assert.ok(p.hints.length >= 2);
  }
});
test("mock blueprints maintain balanced technical selection and randomized option maps", () => {
  for (const m of mocks) {
    const a = createMock(m, 75);
    assert.equal(a.questions.length, m.ai + m.technical);
    assert.equal(a.reasoning.length, m.reasoning);
    assert.equal(new Set(a.questions).size, a.questions.length);
    assert.equal(
      a.questions.filter(
        (id) =>
          assessmentQuestions.find((q) => q.id === id)?.topic === "AI Literacy",
      ).length,
      m.ai,
    );
    for (const order of Object.values(a.options))
      assert.deepEqual([...order].sort(), [0, 1, 2, 3]);
  }
});
test("retakes prioritize a fresh subset where available", () => {
  const first = createMock(mocks[0], 75);
  const second = createMock(mocks[0], 75, first);
  assert.equal(
    second.questions.filter((id) => first.questions.includes(id)).length,
    0,
  );
});
test("unanswered MCQs cannot qualify and later stages remain locked", () => {
  const a = createMock(mocks[5], 75);
  assert.equal(scoreQuestions(a.questions, {}), 0);
  const ended = advanceMock(a, 0);
  assert.equal(ended.stage, "result");
  assert.equal(ended.qualified, false);
  assert.equal(ended.scores.debugging, undefined);
});
test("threshold boundary advances only qualifying candidates", () => {
  const a = createMock(mocks[5], 75);
  assert.equal(advanceMock(a, 74).stage, "result");
  assert.equal(advanceMock(a, 75).stage, "debugging");
  const debug = advanceMock(a, 75);
  assert.equal(advanceMock(debug, 69).stage, "result");
  assert.equal(advanceMock(debug, 70).stage, "ai");
});
test("complete staged qualification and cognitive completion", () => {
  let a = createMock(mocks[5], 75);
  a = advanceMock(a, 90);
  a = advanceMock(a, 100);
  a = advanceMock(a, 80);
  assert.equal(a.stage, "reasoning");
  a = advanceMock(a, 100);
  assert.equal(a.stage, "result");
  assert.equal(a.qualified, true);
  assert.ok(a.completedAt);
});
test("server evaluation recalculates score and rejects forged eligibility", () => {
  const e = {
    problemUnderstanding: 5,
    algorithm: 5,
    dataStructure: 5,
    edgeCases: 5,
    complexity: 5,
    promptClarity: 5,
    total: 100,
    missing: [],
    feedback: "Needs reasoning",
    eligibleForSolution: true,
  };
  assert.equal(normalizeEvaluation(e).total, 30);
  assert.equal(normalizeEvaluation(e).eligibleForSolution, false);
  assert.equal(
    normalizeEvaluation({
      ...e,
      problemUnderstanding: 20,
      algorithm: 25,
      dataStructure: 15,
      edgeCases: 15,
      complexity: 15,
      promptClarity: 10,
      missing: ["Incorrect algorithm"],
    }).eligibleForSolution,
    false,
  );
  assert.throws(() => normalizeEvaluation({ ...e, algorithm: 99 }));
});
test("brief requests cannot pass reasoning validation", () => {
  assert.equal(
    approachSchema.safeParse({
      understanding: "Solve this",
      algorithm: "Give code",
      dataStructure: "",
      variables: "",
      edgeCases: "",
      timeComplexity: "",
      spaceComplexity: "",
    }).success,
    false,
  );
});
test("new dashboard has honest zero progress and nested corruption is rejected", () => {
  const p = initialProgress();
  assert.equal(readiness(p), 0);
  assert.equal(progressSchema.safeParse(p).success, true);
  assert.equal(
    progressSchema.safeParse({ ...p, answers: { bad: null } }).success,
    false,
  );
  assert.equal(
    progressSchema.safeParse({ ...p, activeMock: { stage: "ai" } }).success,
    false,
  );
});
