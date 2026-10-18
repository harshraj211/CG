import { test, expect } from "@playwright/test";
import { aiCoding } from "../../data";

test("maximum-subarray Python accepts decoded lists and returns all sample/hidden results", async ({
  page,
}) => {
  await page.goto("/ai-coding/ai-code-005");
  const problem = aiCoding.find((p) => p.id === "ai-code-005")!;
  const code = `def solve(data):
    curr_max = max_so_far = data[0]
    for x in data[1:]:
        curr_max = max(x, curr_max + x)
        max_so_far = max(max_so_far, curr_max)
    return max_so_far
`;
  const result = await page.evaluate(
    async ({ code, tests }) => {
      const worker = new Worker("/workers/runner.js");
      return await new Promise<{
        passed: number;
        total: number;
        error?: string;
      }>((resolve) => {
        const timeout = setTimeout(() => {
          worker.terminate();
          resolve({
            passed: 0,
            total: tests.length,
            error: "Worker timed out",
          });
        }, 45000);
        worker.onmessage = (event) => {
          clearTimeout(timeout);
          worker.terminate();
          resolve(event.data);
        };
        worker.postMessage({ code, language: "Python", tests });
      });
    },
    {
      code,
      tests: [
        ...problem.tests,
        { input: [-8, -3, -6], expected: -3 },
        { input: [-4], expected: -4 },
      ],
    },
  );
  expect(result.error).toBeUndefined();
  expect(result.passed).toBe(result.total);
});
