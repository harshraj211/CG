import { z } from "zod";
import type { UserProgress } from "@/types";
import {
  assessmentQuestions,
  assessmentDebugging,
  assessmentAiCoding,
  finalCoding,
  finalQuestionSets,
  finalDebugging,
  finalAiCoding,
  mocks,
} from "@/data";
import { COGNITIVE_GAME_IDS } from "@/lib/cognitive";
export const STORAGE_KEY = "exceller-prep-v1";
export const initialProgress = (): UserProgress => ({
  version: 1,
  onboarded: false,
  bookmarks: [],
  notes: {},
  answers: {},
  problems: {},
  lessons: {},
  interview: {},
  activity: {},
  promptScores: [],
  cognitiveSessions: [],
  mocks: [],
  activeMock: null,
  drafts: {},
  settings: {
    language: "Python",
    threshold: 75,
    theme: "light",
    timers: true,
    tokenBudget: false,
    textSize: "comfortable",
  },
});
const questionIds = new Set(assessmentQuestions.map((q) => q.id));
const mockSchema = z
  .object({
    id: z.string(),
    blueprint: z.string(),
    questions: z.array(z.string()).min(1),
    reasoning: z.array(z.string()),
    options: z.record(z.string(), z.array(z.number().int().min(0).max(3))),
    answers: z.record(z.string(), z.number().int().min(0).max(3)),
    marked: z.array(z.string()),
    current: z.number().int().nonnegative(),
    stage: z.enum([
      "mcq",
      "debugging",
      "coding",
      "ai",
      "cognitive",
      "reasoning",
      "result",
    ]),
    startedAt: z.number(),
    stageStartedAt: z.number(),
    deadline: z.number(),
    threshold: z.number().min(0).max(100),
    scores: z.record(z.string(), z.number().min(0).max(100)),
    stageSeconds: z.record(z.string(), z.number().nonnegative()).optional(),
    debugId: z.string(),
    aiId: z.string(),
    codingId: z.string().optional(),
    finalSet: z.number().int().min(1).max(5).optional(),
    cognitiveAnswers: z.array(z.boolean()).max(7).optional(),
    integrityReason: z.string().optional(),
    qualified: z.boolean(),
    completedAt: z.number().optional(),
  })
  .refine(
    (a) =>
      mocks.some((m) => m.id === a.blueprint) &&
      assessmentDebugging.some((p) => p.id === a.debugId) &&
      assessmentAiCoding.some((p) => p.id === a.aiId) &&
      (a.finalSet
        ? a.blueprint === `final-${a.finalSet}` &&
          a.codingId === finalCoding[a.finalSet - 1].id &&
          a.debugId === finalDebugging[a.finalSet - 1].id &&
          a.aiId === finalAiCoding[a.finalSet - 1].id &&
          a.questions.length === finalQuestionSets[a.finalSet - 1].length &&
          new Set(a.questions).size === a.questions.length &&
          a.questions.every((id) =>
            finalQuestionSets[a.finalSet! - 1].some((q) => q.id === id),
          ) &&
          a.reasoning.length === 0 &&
          a.stage !== "reasoning"
        : !a.blueprint.startsWith("final-") &&
          a.stage !== "coding" &&
          a.stage !== "cognitive") &&
      [...a.questions, ...a.reasoning].every((id) => questionIds.has(id)) &&
      (a.stage !== "mcq" || a.current < a.questions.length) &&
      (a.stage !== "reasoning" || a.current < a.reasoning.length),
    "Saved assessment references unknown content or an invalid question.",
  );
export const progressSchema = z.object({
  version: z.literal(1),
  onboarded: z.boolean(),
  bookmarks: z.array(z.string()),
  notes: z.record(
    z.string(),
    z.object({
      text: z.string(),
      updatedAt: z.string(),
      attachment: z.string(),
    }),
  ),
  answers: z.record(
    z.string(),
    z.object({
      correct: z.boolean(),
      attempts: z.number().nonnegative(),
      selected: z.number().int().min(0).max(3),
      seconds: z.number().nonnegative(),
      due: z.string(),
      interval: z.number().int().min(0).max(3),
      date: z.string(),
    }),
  ),
  problems: z.record(
    z.string(),
    z.object({
      status: z.enum([
        "Attempted",
        "Solved",
        "Solved With Hint",
        "Solution Viewed",
      ]),
      attempts: z.number().nonnegative(),
      passed: z.number().nonnegative(),
      total: z.number().positive(),
      seconds: z.number().nonnegative(),
      kind: z.enum(["coding", "debugging", "ai"]),
      hint: z.boolean(),
      viewed: z.boolean(),
    }),
  ),
  lessons: z.record(
    z.string(),
    z.object({ status: z.enum(["Learning", "Completed", "Revision Needed"]) }),
  ),
  interview: z.record(z.string(), z.string()),
  activity: z.record(z.string(), z.number()),
  promptScores: z.array(
    z.object({ date: z.string(), score: z.number().min(0).max(100) }),
  ),
  mocks: z.array(mockSchema),
  cognitiveSessions: z
    .array(
      z
        .object({
          id: z.string(),
          game: z.enum(COGNITIVE_GAME_IDS),
          mode: z.enum(["practice", "timed"]),
          difficulty: z.enum(["easy", "standard", "hard"]),
          correct: z.number().int().nonnegative(),
          attempted: z.number().int().nonnegative(),
          seconds: z.number().nonnegative(),
          completedAt: z.string(),
        })
        .refine(
          (s) => s.correct <= s.attempted,
          "Correct answers cannot exceed attempted puzzles.",
        ),
    )
    .max(200)
    .default([]),
  activeMock: mockSchema.nullable(),
  drafts: z.record(z.string(), z.string()),
  settings: z.object({
    language: z.enum(["Python", "JavaScript", "Java", "C++"]),
    threshold: z.number().min(0).max(100),
    theme: z.enum(["light", "dark"]),
    timers: z.boolean(),
    tokenBudget: z.boolean(),
    textSize: z
      .enum(["comfortable", "large", "extra-large"])
      .default("comfortable"),
  }),
});
export interface ProgressRepository {
  load(): UserProgress;
  save(p: UserProgress): void;
  reset(): void;
}
export class LocalProgressRepository implements ProgressRepository {
  load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialProgress();
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(
        "Saved progress contains unreadable JSON. The original data is preserved; use Settings to reset it.",
      );
    }
    const result = progressSchema.safeParse(parsed);
    if (!result.success)
      throw new Error(
        "Saved progress could not be read. Export or reset it from Settings.",
      );
    return result.data;
  }
  save(p: UserProgress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  }
  reset() {
    localStorage.removeItem(STORAGE_KEY);
  }
}
