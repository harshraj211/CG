import { test } from "node:test";
import assert from "node:assert/strict";
import {
  allQuestions,
  allProblems,
  mocks,
  finalQuestionSets,
  finalDebugging,
  finalCoding,
  finalAiCoding,
  assessmentQuestions,
} from "../data";
import {
  advanceMock,
  createMock,
  scoreQuestions,
  mockStages,
  endMockForIntegrity,
  readiness,
} from "../lib/assessment";
import { initialProgress, progressSchema } from "../services/storage";
import {
  COGNITIVE_GAME_IDS,
  makeCognitiveRound,
  solveMotion,
} from "../lib/cognitive";

const finals = mocks.filter((m) => m.finalSet);
test("five reserved papers contain disjoint, contextual questions outside the practice banks", () => {
  assert.equal(finals.length, 5);
  const ids = new Set(allQuestions.map((q) => q.id));
  const scenarios = new Set(
    allQuestions.map((q) => `${q.context}|${q.question}`),
  );
  for (const [index, paper] of finalQuestionSets.entries()) {
    assert.equal(paper.length, 30);
    assert.equal(paper.filter((q) => q.topic === "AI Literacy").length, 10);
    for (const [topic, count] of [
      ["DBMS", 5],
      ["SQL", 5],
      ["OOP", 3],
      ["OS", 4],
      ["CN", 3],
    ] as const) {
      assert.equal(paper.filter((q) => q.topic === topic).length, count);
    }
    for (const q of paper) {
      assert.equal(ids.has(q.id), false, q.id);
      assert.equal(scenarios.has(`${q.context}|${q.question}`), false, q.id);
      ids.add(q.id);
      scenarios.add(`${q.context}|${q.question}`);
      assert.ok(q.context && q.context.length > 55, q.id);
      assert.ok(q.explanation.length > 70, q.id);
      assert.equal(new Set(q.options).size, 4, q.id);
      assert.equal(q.options.length, 4);
      assert.ok(q.correctAnswer >= 0 && q.correctAnswer < 4);
    }
    const attempt = createMock(finals[index], 75);
    assert.deepEqual(
      new Set(attempt.questions),
      new Set(paper.map((q) => q.id)),
    );
    const answers = Object.fromEntries(
      paper.map((q) => [q.id, q.correctAnswer]),
    );
    assert.equal(scoreQuestions(attempt.questions, answers), 100);
    assert.equal(scoreQuestions(attempt.questions, {}), 0);
  }
  assert.equal(assessmentQuestions.length, allQuestions.length + 150);
});

test("all fifteen reserved programming tasks have independent IDs, boundaries and readable debug code", () => {
  const ids = new Set(allProblems.map((p) => p.id));
  const titles = new Set(allProblems.map((p) => p.title));
  for (const p of [...finalDebugging, ...finalCoding, ...finalAiCoding]) {
    assert.equal(ids.has(p.id), false);
    assert.equal(titles.has(p.title), false);
    ids.add(p.id);
    titles.add(p.title);
    assert.ok(p.statement.length > 150, p.id);
    assert.ok(p.inputFormat && p.outputFormat && p.constraints);
    assert.ok(p.tests.length >= 8, p.id);
    assert.equal(p.tests.filter((t) => !t.hidden).length, 2);
    assert.ok(p.solution.startsWith("def solve(data):"));
  }
  for (const p of finalDebugging) {
    assert.ok(p.buggyCode.split("\n").length >= 10);
    assert.equal(p.buggyCode.includes(";"), false);
    assert.equal(p.buggyCode.includes("lambda "), false);
    assert.equal(/\[[^\n]+ for /.test(p.buggyCode), false);
  }
});

test("fresh finals progress through MCQ, debugging, coding, AI and cognitive with correct timers", () => {
  for (const blueprint of finals) {
    let a = createMock(blueprint, 75);
    assert.deepEqual(mockStages(a), [
      "mcq",
      "debugging",
      "coding",
      "ai",
      "cognitive",
    ]);
    for (const [stage, minutes] of [
      ["debugging", 20],
      ["coding", 30],
      ["ai", 30],
      ["cognitive", 14],
    ] as const) {
      const now = a.stageStartedAt + 1000;
      a = advanceMock(a, 100, now);
      assert.equal(a.stage, stage);
      assert.equal(a.deadline, now + minutes * 60000);
      assert.equal(
        progressSchema.safeParse({ ...initialProgress(), activeMock: a })
          .success,
        true,
      );
    }
    const failed = advanceMock(a, 57);
    assert.equal(failed.qualified, false);
    a = advanceMock(
      { ...a, cognitiveAnswers: [true, true, true, true, true, false, false] },
      71,
    );
    assert.equal(a.stage, "result");
    assert.equal(a.qualified, true);
    assert.equal(
      progressSchema.safeParse({ ...initialProgress(), mocks: [a] }).success,
      true,
    );
  }
});

test("failed coding and integrity violations cannot unlock or qualify later stages", () => {
  let a = createMock(finals[0], 75);
  a = advanceMock(advanceMock(a, 100), 100);
  const failed = advanceMock(a, 69);
  assert.equal(failed.stage, "result");
  assert.equal(failed.scores.ai, undefined);
  assert.equal(failed.qualified, false);
  const ended = endMockForIntegrity(
    a,
    "Fullscreen was exited.",
    a.stageStartedAt + 5000,
  );
  assert.equal(ended.qualified, false);
  assert.equal(ended.stageSeconds?.coding, 5);
  assert.equal(ended.scores.ai, undefined);
  assert.equal(ended.integrityReason, "Fullscreen was exited.");
  assert.deepEqual(endMockForIntegrity(ended, "duplicate"), ended);
  const saved = progressSchema.parse({ ...initialProgress(), mocks: [ended] });
  assert.equal(saved.mocks[0].integrityReason, ended.integrityReason);
});

test("old progress survives; swapped reserved questions and coding IDs are rejected", () => {
  const legacy = createMock(mocks[0], 75);
  const progress = initialProgress();
  progress.notes.personal = {
    text: "Keep my work",
    attachment: "SQL",
    updatedAt: "2026-10-18",
  };
  progress.activeMock = legacy;
  assert.equal(
    progressSchema.parse(progress).notes.personal.text,
    "Keep my work",
  );
  assert.equal(readiness(progress), 0);
  const fresh = createMock(finals[0], 75);
  const wrongQuestion = {
    ...fresh,
    questions: [finalQuestionSets[1][0].id, ...fresh.questions.slice(1)],
  };
  assert.equal(
    progressSchema.safeParse({ ...progress, activeMock: wrongQuestion })
      .success,
    false,
  );
  assert.equal(
    progressSchema.safeParse({
      ...progress,
      activeMock: { ...fresh, codingId: finalCoding[1].id },
    }).success,
    false,
  );
  assert.equal(
    progressSchema.safeParse({
      ...progress,
      activeMock: { ...fresh, cognitiveAnswers: Array(8).fill(true) },
    }).success,
    false,
  );
});

test("each final has seven distinct seeded cognitive challenges and solvable motion puzzles", () => {
  for (const [index, game] of COGNITIVE_GAME_IDS.entries()) {
    const puzzles = new Set<string>();
    for (let paper = 1; paper <= 5; paper++) {
      const round = makeCognitiveRound(
        game,
        "hard",
        0x6f100000 + paper * 104729 + index * 7919,
      );
      const encoded = JSON.stringify(round);
      assert.equal(puzzles.has(encoded), false, `${paper}: ${game}`);
      puzzles.add(encoded);
      if (round.kind === "motion")
        assert.ok(solveMotion(round.blocks), `paper ${paper}`);
    }
  }
});
