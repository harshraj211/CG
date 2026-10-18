import ai from "./ai-literacy-mcqs.json";
import dbms from "./dbms-mcqs.json";
import sql from "./sql-mcqs.json";
import oop from "./oop-mcqs.json";
import os from "./os-mcqs.json";
import cn from "./cn-mcqs.json";
import reasoningData from "./reasoning-questions.json";
import codingData from "./coding-problems.json";
import debugData from "./debugging-problems.json";
import aiCodingData from "./ai-coding-problems.json";
import lessonData from "./lessons.json";
import communicationData from "./communication.json";
import interviewData from "./interview-questions.json";
import { finalQuestionSets } from "./final-mcqs";
import { finalDebugging, finalCoding, finalAiCoding } from "./final-problems";
import type {
  MCQQuestion,
  CodingProblem,
  DebuggingProblem,
  Lesson,
  MockTest,
} from "@/types";
export const mcqs = [
  ...ai,
  ...dbms,
  ...sql,
  ...oop,
  ...os,
  ...cn,
] as MCQQuestion[];
export const reasoning = reasoningData as MCQQuestion[];
export const communication = communicationData as MCQQuestion[];
export const coding = codingData as CodingProblem[];
export const debugging = debugData as DebuggingProblem[];
export const aiCoding = aiCodingData as CodingProblem[];
export const lessons = lessonData as Lesson[];
export const interviews = interviewData;
export const allQuestions = [...mcqs, ...reasoning, ...communication];
export const allProblems = [...coding, ...debugging, ...aiCoding];
export { finalQuestionSets, finalDebugging, finalCoding, finalAiCoding };
// Assessment lookups include reserved content; practice lists above do not.
export const assessmentQuestions = [
  ...allQuestions,
  ...finalQuestionSets.flat(),
];
export const assessmentDebugging = [...debugging, ...finalDebugging];
export const assessmentAiCoding = [...aiCoding, ...finalAiCoding];
export const assessmentCoding = [...coding, ...finalCoding];
export const mocks: MockTest[] = [
  {
    id: "mock-1",
    title: "Beginner Diagnostic",
    description:
      "Establish your technical and AI baseline, then try debugging and AI coding.",
    ai: 10,
    technical: 10,
    reasoning: 0,
    minutes: 25,
  },
  {
    id: "mock-2",
    title: "Intermediate Assessment",
    description:
      "Build accuracy across technical concepts, implementation and reasoning.",
    ai: 10,
    technical: 10,
    reasoning: 10,
    minutes: 30,
  },
  {
    id: "mock-3",
    title: "Capgemini Simulation A",
    description: "40 MCQs followed by debugging, AI coding and reasoning MCQs.",
    ai: 20,
    technical: 20,
    reasoning: 15,
    minutes: 45,
  },
  {
    id: "mock-4",
    title: "Capgemini Simulation B",
    description:
      "A fresh question mix with the same staged assessment architecture.",
    ai: 20,
    technical: 20,
    reasoning: 20,
    minutes: 40,
  },
  {
    id: "mock-5",
    title: "Hard Simulation",
    description:
      "Medium-level concepts and tighter time pressure across all stages.",
    ai: 20,
    technical: 20,
    reasoning: 20,
    minutes: 35,
    difficulty: "medium",
  },
  {
    id: "mock-6",
    title: "Final Exceller Simulation",
    description:
      "Your complete rehearsal. Qualify at each stage to unlock the next.",
    ai: 20,
    technical: 20,
    reasoning: 20,
    minutes: 40,
  },
  ...[1, 2, 3, 4, 5].map((finalSet): MockTest => ({
    id: `final-${finalSet}`,
    title: `Fresh Final Exceller Simulation ${finalSet}`,
    description:
      "A reserved paper with new scenarios and programming tasks. Qualify through five stages, finishing with seven cognitive games.",
    ai: 10,
    technical: 20,
    reasoning: 0,
    minutes: 40,
    difficulty: "medium",
    finalSet,
  })),
];
