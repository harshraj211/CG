import { z } from "zod";
export const approachSchema = z.object({
  understanding: z.string().trim().min(15).max(2000),
  algorithm: z.string().trim().min(20).max(3000),
  dataStructure: z.string().trim().min(5).max(1000),
  variables: z.string().trim().min(10).max(1500),
  edgeCases: z.string().trim().min(10).max(1500),
  timeComplexity: z.string().trim().min(3).max(500),
  spaceComplexity: z.string().trim().min(3).max(500),
});
export const evaluationSchema = z.object({
  problemUnderstanding: z.number().int().min(0).max(20),
  algorithm: z.number().int().min(0).max(25),
  dataStructure: z.number().int().min(0).max(15),
  edgeCases: z.number().int().min(0).max(15),
  complexity: z.number().int().min(0).max(15),
  promptClarity: z.number().int().min(0).max(10),
  total: z.number().min(0).max(100),
  missing: z.array(z.string().max(500)).max(10),
  feedback: z.string().max(6000),
  eligibleForSolution: z.boolean(),
});
export function normalizeEvaluation(raw: unknown) {
  // Accept a conventional wrapper and integer strings without inventing scores.
  let candidate = raw;
  if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
    const record = candidate as Record<string, unknown>;
    if (
      record.evaluation &&
      typeof record.evaluation === "object" &&
      !Array.isArray(record.evaluation)
    )
      candidate = record.evaluation;
  }
  if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
    const record = { ...(candidate as Record<string, unknown>) };
    for (const key of [
      "problemUnderstanding",
      "algorithm",
      "dataStructure",
      "edgeCases",
      "complexity",
      "promptClarity",
    ]) {
      const value = record[key];
      if (typeof value === "string" && /^\d+$/.test(value.trim()))
        record[key] = Number(value.trim());
    }
    candidate = record;
  }
  // Model totals are redundant and never trusted. All six component scores,
  // feedback, missing components and the boolean eligibility flag stay required.
  const e = evaluationSchema.omit({ total: true }).parse(candidate);
  const total =
    e.problemUnderstanding +
    e.algorithm +
    e.dataStructure +
    e.edgeCases +
    e.complexity +
    e.promptClarity;
  return {
    ...e,
    total,
    eligibleForSolution:
      e.eligibleForSolution &&
      total >= 70 &&
      e.missing.length === 0 &&
      e.problemUnderstanding >= 12 &&
      e.algorithm >= 15 &&
      e.dataStructure >= 8 &&
      e.edgeCases >= 8 &&
      e.complexity >= 8,
  };
}

export function parseEvaluation(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*\n([\s\S]*?)\n```$/i);
  return normalizeEvaluation(JSON.parse(fenced ? fenced[1] : trimmed));
}
