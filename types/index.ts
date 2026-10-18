import type { CognitiveSession } from "@/lib/cognitive";
export type Difficulty = "easy" | "medium";
export interface Question {
  id: string;
  topic: string;
  difficulty: Difficulty;
  tags: string[];
}
export interface MCQQuestion extends Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  context?: string;
  optionExplanations?: string[];
  takeAway?: string;
  contentVersion?: number;
}
export interface TestCase {
  input: unknown;
  expected: unknown;
  hidden?: boolean;
}
export interface CodingProblem extends Question {
  title: string;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  tests: TestCase[];
  hints: string[];
  approach: string;
  complexity: string;
  solution: string;
  buggyCode?: string;
}
export interface DebuggingProblem extends CodingProblem {
  buggyCode: string;
}
export interface Lesson {
  id: string;
  title: string;
  summary: string;
  concepts: {
    name: string;
    explanation: string;
    example: string;
    trap: string;
  }[];
  interview: string[];
  cheatSheet: string[];
}
export interface AIApproachEvaluation {
  problemUnderstanding: number;
  algorithm: number;
  dataStructure: number;
  edgeCases: number;
  complexity: number;
  promptClarity: number;
  total: number;
  missing: string[];
  feedback: string;
  eligibleForSolution: boolean;
}
export interface Approach {
  understanding: string;
  algorithm: string;
  dataStructure: string;
  variables: string;
  edgeCases: string;
  timeComplexity: string;
  spaceComplexity: string;
}
export type ProblemStatus =
  "Attempted" | "Solved" | "Solved With Hint" | "Solution Viewed";
export interface ProblemProgress {
  status: ProblemStatus;
  attempts: number;
  passed: number;
  total: number;
  seconds: number;
  kind: "coding" | "debugging" | "ai";
  hint: boolean;
  viewed: boolean;
}
export interface TopicProgress {
  status: "Learning" | "Completed" | "Revision Needed";
}
export interface AnswerRecord {
  correct: boolean;
  attempts: number;
  selected: number;
  seconds: number;
  due: string;
  interval: number;
  date: string;
}
export interface MockTest {
  id: string;
  title: string;
  description: string;
  ai: number;
  technical: number;
  reasoning: number;
  minutes: number;
  difficulty?: Difficulty;
  finalSet?: number;
}
export type MockStage =
  "mcq" | "debugging" | "coding" | "ai" | "cognitive" | "reasoning" | "result";
export interface MockAttempt {
  id: string;
  blueprint: string;
  questions: string[];
  reasoning: string[];
  options: Record<string, number[]>;
  answers: Record<string, number>;
  marked: string[];
  current: number;
  stage: MockStage;
  startedAt: number;
  deadline: number;
  threshold: number;
  scores: Record<string, number>;
  stageSeconds?: Record<string, number>;
  debugId: string;
  aiId: string;
  codingId?: string;
  finalSet?: number;
  cognitiveAnswers?: boolean[];
  integrityReason?: string;
  qualified: boolean;
  completedAt?: number;
  stageStartedAt: number;
}
export interface UserProgress {
  version: 1;
  onboarded: boolean;
  bookmarks: string[];
  notes: Record<
    string,
    { text: string; updatedAt: string; attachment: string }
  >;
  answers: Record<string, AnswerRecord>;
  problems: Record<string, ProblemProgress>;
  lessons: Record<string, TopicProgress>;
  interview: Record<string, string>;
  activity: Record<string, number>;
  promptScores: { date: string; score: number }[];
  cognitiveSessions: CognitiveSession[];
  mocks: MockAttempt[];
  activeMock: MockAttempt | null;
  drafts: Record<string, string>;
  settings: {
    language: string;
    threshold: number;
    theme: "light" | "dark";
    timers: boolean;
    tokenBudget: boolean;
    textSize: "comfortable" | "large" | "extra-large";
  };
}
