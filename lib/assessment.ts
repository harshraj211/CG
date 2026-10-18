import {
  allQuestions,
  assessmentQuestions,
  mcqs,
  reasoning,
  debugging,
  aiCoding,
  finalQuestionSets,
  finalDebugging,
  finalCoding,
  finalAiCoding,
} from "@/data";
import type { MockAttempt, MockTest, MockStage, UserProgress } from "@/types";
export const shuffle = <T>(values: T[]): T[] => {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
export const dateKey = (d: Date) => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const today = () => dateKey(new Date());
export function createMock(
  blueprint: MockTest,
  threshold: number,
  previous?: MockAttempt,
): MockAttempt {
  const choose = (pool: typeof mcqs, n: number) => {
    const fresh = pool.filter((q) => !previous?.questions.includes(q.id));
    return [
      ...shuffle(fresh),
      ...shuffle(pool.filter((q) => !fresh.includes(q))),
    ]
      .slice(0, n)
      .map((q) => q.id);
  };
  const pool = blueprint.finalSet
    ? finalQuestionSets[blueprint.finalSet - 1]
    : blueprint.difficulty
      ? mcqs.filter((q) => q.difficulty === blueprint.difficulty)
      : mcqs;
  const ai = choose(
    pool.filter((q) => q.topic === "AI Literacy"),
    blueprint.ai,
  );
  const proportions: [string, number][] = [
    ["DBMS", 5],
    ["SQL", 5],
    ["OOP", 3],
    ["OS", 4],
    ["CN", 3],
  ];
  const technical = proportions.flatMap(([topic, n]) =>
    choose(
      pool.filter((q) => q.topic === topic),
      Math.floor((n * blueprint.technical) / 20),
    ),
  );
  // Fill rounding gaps from remaining technical questions.
  const remaining = pool.filter(
    (q) => q.topic !== "AI Literacy" && !technical.includes(q.id),
  );
  technical.push(...choose(remaining, blueprint.technical - technical.length));
  const questions = shuffle([...ai, ...technical]);
  const reasoningIds = choose(reasoning, blueprint.reasoning);
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    blueprint: blueprint.id,
    questions,
    reasoning: reasoningIds,
    options: Object.fromEntries(
      [...questions, ...reasoningIds].map((id) => [id, shuffle([0, 1, 2, 3])]),
    ),
    answers: {},
    marked: [],
    current: 0,
    stage: "mcq",
    startedAt: now,
    stageStartedAt: now,
    deadline: now + blueprint.minutes * 60000,
    threshold,
    scores: {},
    stageSeconds: {},
    ...(blueprint.finalSet
      ? {
          finalSet: blueprint.finalSet,
          codingId: finalCoding[blueprint.finalSet - 1].id,
          cognitiveAnswers: [],
        }
      : {}),
    debugId: blueprint.finalSet
      ? finalDebugging[blueprint.finalSet - 1].id
      : shuffle(
          debugging.filter(
            (p) =>
              !blueprint.difficulty || p.difficulty === blueprint.difficulty,
          ),
        )[0].id,
    aiId: blueprint.finalSet
      ? finalAiCoding[blueprint.finalSet - 1].id
      : shuffle(
          aiCoding.filter(
            (p) =>
              !blueprint.difficulty || p.difficulty === blueprint.difficulty,
          ),
        )[0].id,
    qualified: false,
  };
}
export function scoreQuestions(ids: string[], answers: Record<string, number>) {
  const found = ids
    .map((id) => assessmentQuestions.find((q) => q.id === id))
    .filter((q) => q !== undefined);
  return found.length
    ? Math.round(
        (found.filter((q) => answers[q.id] === q.correctAnswer).length /
          found.length) *
          100,
      )
    : 0;
}
export function advanceMock(
  attempt: MockAttempt,
  score: number,
  now = Date.now(),
): MockAttempt {
  const a = {
    ...attempt,
    scores: { ...attempt.scores, [attempt.stage]: score },
    stageSeconds: {
      ...attempt.stageSeconds,
      [attempt.stage]: Math.max(
        0,
        Math.round((now - attempt.stageStartedAt) / 1000),
      ),
    },
    current: 0,
    stageStartedAt: now,
  };
  const passes =
    attempt.stage === "mcq"
      ? score >= a.threshold
      : attempt.stage === "debugging" ||
          attempt.stage === "coding" ||
          attempt.stage === "cognitive"
        ? score >= 70
        : attempt.stage === "ai"
          ? score >= 70
          : score === 100;
  if (!passes) {
    a.stage = "result";
    a.qualified = false;
    a.completedAt = now;
    return a;
  }
  if (attempt.stage === "mcq") {
    a.stage = "debugging";
    a.deadline = now + 20 * 60000;
  } else if (attempt.stage === "debugging") {
    a.stage = attempt.finalSet ? "coding" : "ai";
    a.deadline = now + 30 * 60000;
  } else if (attempt.stage === "coding") {
    a.stage = "ai";
    a.deadline = now + 30 * 60000;
  } else if (attempt.stage === "ai" && attempt.finalSet) {
    a.stage = "cognitive";
    a.deadline = now + 14 * 60000;
  } else if (attempt.stage === "ai" && a.reasoning.length) {
    a.stage = "reasoning";
    a.deadline = now + 20 * 60000;
  } else {
    a.stage = "result";
    a.qualified = true;
    a.completedAt = now;
  }
  return a;
}
export function mockStages(
  a: Pick<MockAttempt, "finalSet" | "reasoning">,
): MockStage[] {
  return a.finalSet
    ? ["mcq", "debugging", "coding", "ai", "cognitive"]
    : [
        "mcq",
        "debugging",
        "ai",
        ...(a.reasoning.length ? ["reasoning" as const] : []),
      ];
}
export function endMockForIntegrity(
  attempt: MockAttempt,
  reason: string,
  now = Date.now(),
): MockAttempt {
  if (attempt.stage === "result") return attempt;
  return {
    ...attempt,
    stage: "result",
    qualified: false,
    completedAt: now,
    integrityReason: reason,
    stageSeconds: {
      ...attempt.stageSeconds,
      [attempt.stage]: Math.max(
        0,
        Math.round((now - attempt.stageStartedAt) / 1000),
      ),
    },
  };
}
export function topicStats(p: UserProgress) {
  return [...new Set(allQuestions.map((q) => q.topic))].map((topic) => {
    const qs = allQuestions.filter((q) => q.topic === topic);
    const attempted = qs.filter((q) => p.answers[q.id]);
    const correct = attempted.filter((q) => p.answers[q.id].correct).length;
    return {
      topic,
      total: qs.length,
      attempted: attempted.length,
      correct,
      accuracy: attempted.length
        ? Math.round((correct / attempted.length) * 100)
        : 0,
      completion: Math.round((correct / qs.length) * 100),
    };
  });
}
export function streak(p: UserProgress) {
  const d = new Date();
  let count = 0;
  if (!p.activity[today()]) d.setDate(d.getDate() - 1);
  while (
    p.activity[
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    ]
  ) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}
export const solved = (status?: string) =>
  status === "Solved" || status === "Solved With Hint";
export function readiness(p: UserProgress) {
  const stats = topicStats(p);
  const ai = stats.find((t) => t.topic === "AI Literacy")!;
  const tech = stats.filter((t) =>
    ["DBMS", "SQL", "OOP", "OS", "CN"].includes(t.topic),
  );
  const ratio = (kind: string, total: number) =>
    (Object.values(p.problems).filter(
      (v) => v.kind === kind && solved(v.status),
    ).length /
      total) *
    100;
  return Math.round(
    (tech.reduce((s, t) => s + t.correct, 0) / 150) * 25 +
      (ai.correct / 100) * 15 +
      ratio("coding", 75) * 0.2 +
      ratio("debugging", 50) * 0.15 +
      ratio("ai", 30) * 0.15 +
      Math.min(p.mocks.filter((m) => m.qualified).length / 6, 1) * 10,
  );
}
