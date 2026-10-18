import { test, expect } from "@playwright/test";
import { coding, mcqs } from "../../data";
import { createMock } from "../../lib/assessment";
import { mocks } from "../../data";
import { initialProgress } from "../../services/storage";
test("dashboard, MCQ scoring, bookmark, note and local persistence", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Ready for your next chapter?" }),
  ).toBeVisible();
  await expect(page.getByText("0/100", { exact: false })).toBeVisible();
  await page.goto("/practice/dbms-001");
  await page
    .getByLabel("A primary key may contain duplicate values", { exact: false })
    .count();
  const option = page.locator(".answer-option").filter({
    hasText: "An RDBMS organizes relations with relational constraints",
  });
  await option.click();
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByText("Well done. You’ve got it.")).toBeVisible();
  await page.getByRole("button", { name: "Bookmark", exact: true }).click();
  await page.getByText("Personal notes", { exact: true }).click();
  await page
    .getByRole("textbox", { name: "Personal notes" })
    .fill("Relations have keys and constraints.");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Remove bookmark", exact: true }),
  ).toBeVisible();
  await page.getByText("Personal notes", { exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Personal notes" }),
  ).toHaveValue("Relations have keys and constraints.");
  await page.goto("/bookmarks");
  await expect(
    page.getByText(mcqs.find((q) => q.id === "dbms-001")!.question),
  ).toBeVisible();
  await page.goto("/notes");
  await expect(page.getByRole("textbox", { name: "Note text" })).toHaveValue(
    "Relations have keys and constraints.",
  );
});
test("all main routes load without browser exceptions and mobile avoids overflow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const route of [
    "/preparation",
    "/preparation/rag",
    "/practice/ai",
    "/practice/technical",
    "/practice/reasoning",
    "/coding",
    "/coding/code-001",
    "/debugging",
    "/debugging/debug-001",
    "/ai-coding",
    "/ai-coding/ai-code-001",
    "/mocks",
    "/communication",
    "/interview",
    "/analytics",
    "/bookmarks",
    "/notes",
    "/settings",
  ]) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    await expect(
      page.getByText("Loading your preparation workspace…"),
    ).not.toBeVisible();
  }
  expect(errors).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Ready for your next chapter?" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/dashboard-mobile.png",
    fullPage: true,
  });
});
test("mock failure saves result and locks later stages", async ({ page }) => {
  await page.goto("/mocks");
  await page.getByRole("button", { name: "Start assessment" }).first().click();
  await expect(page.locator(".sidebar")).toHaveCount(0);
  await expect(page.getByText("Question palette")).toBeVisible();
  await page.getByRole("button", { name: "Submit stage", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Submit stage" })
    .click();
  await expect(
    page.getByText("Assessment ended at Technical/AI MCQ stage."),
  ).toBeVisible();
  await expect(page.locator(".result-stats").getByText("Locked")).toHaveCount(
    3,
  );
  await page.reload();
  await expect(page.getByText("Assessment history")).toBeVisible();
});
test("qualified MCQ stage unlocks only debugging, with hints hidden", async ({
  page,
}) => {
  const a = createMock(mocks[5], 75);
  const p = { ...initialProgress(), activeMock: a };
  a.questions.forEach((id) => (a.answers[id] = 0));
  await page.goto("/");
  await page.evaluate(
    (value) => localStorage.setItem("exceller-prep-v1", JSON.stringify(value)),
    p,
  );
  await page.goto("/mocks");
  await page.getByRole("button", { name: "Submit stage", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Submit stage" })
    .click();
  await expect(
    page.getByText("DEBUGGING WORKSPACE", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "View solution" })).toHaveCount(
    0,
  );
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("exceller-prep-v1")!).activeMock.stage,
    ),
  ).toBe("debugging");
});
test("AI endpoints reject bypass attempts and explain missing configuration when unset", async ({
  request,
}) => {
  const bad = await request.post("/api/ai", {
    data: {
      problemId: "ai-code-001",
      mode: "generate",
      language: "Python",
      approach: { understanding: "Solve this" },
    },
  });
  expect(bad.status()).toBe(400);
  const configuration = await request.get("/api/ai/status");
  const status = await configuration.json();
  // Do not spend the user's real API quota during ordinary UI regression runs.
  if (status.configured) {
    expect(status.configured).toBe(true);
    return;
  }
  const valid = await request.post("/api/ai", {
    data: {
      problemId: "ai-code-001",
      mode: "evaluate",
      language: "Python",
      approach: {
        understanding: "Find two distinct indices adding to the target.",
        algorithm:
          "Scan each number, look up its complement in a map, then insert it.",
        dataStructure: "Hash map from value to index.",
        variables: "Current index, current value, complement, and seen map.",
        edgeCases:
          "Empty input returns an empty list, duplicate values use separate indices.",
        timeComplexity: "O(n) expected due to hash lookups.",
        spaceComplexity: "O(n) for the map.",
      },
    },
  });
  expect(valid.status()).toBe(503);
  expect((await valid.json()).error).toContain("not configured");
});

test("scenario context is visible in mocks while answers and coaching remain hidden", async ({
  page,
}) => {
  const a = createMock(mocks[0], 75);
  a.questions[0] = "sql-026";
  a.options["sql-026"] = [0, 1, 2, 3];
  await page.goto("/");
  await page.evaluate(
    (p) => localStorage.setItem("exceller-prep-v1", JSON.stringify(p)),
    { ...initialProgress(), activeMock: a },
  );
  await page.goto("/mocks");
  await expect(
    page.getByRole("region", { name: "Question context" }),
  ).toBeVisible();
  await expect(
    page.getByText("Scores(value) contains 10,NULL,20.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText("Why this answer is correct", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText("Understand every option")).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Reading text size" })
    .selectOption("extra-large");
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Reading text size" }),
  ).toHaveValue("extra-large");
});

test("practice explains each option and saved text settings survive refresh", async ({
  page,
}) => {
  await page.goto("/practice/sql-026");
  await expect(
    page.getByRole("region", { name: "Question context" }),
  ).toBeVisible();
  await page.locator(".answer-option").filter({ hasText: "3,2" }).click();
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(
    page.getByText("Why this answer is correct", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".option-explanation")).toHaveCount(4);
  await expect(page.getByText("Remember for next time")).toBeVisible();
  await page
    .getByRole("combobox", { name: "Reading text size" })
    .selectOption("large");
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Reading text size" }),
  ).toHaveValue("large");
});
test("Python and JavaScript execute real sample and hidden tests in workers", async ({
  page,
}) => {
  await page.goto("/coding/code-001");
  const result = await page.evaluate(
    async ({ code, tests }) => {
      const worker = new Worker("/workers/runner.js");
      return await new Promise<{
        passed: number;
        total: number;
        error?: string;
      }>((resolve) => {
        worker.onmessage = (e) => {
          worker.terminate();
          resolve(e.data);
        };
        worker.postMessage({ code, language: "Python", tests });
      });
    },
    { code: coding[0].solution, tests: coding[0].tests },
  );
  expect(result.error).toBeUndefined();
  expect(result.passed).toBe(result.total);
  const js = await page.evaluate(async () => {
    const worker = new Worker("/workers/runner.js");
    return await new Promise<{ passed: number; total: number }>((resolve) => {
      worker.onmessage = (e) => {
        worker.terminate();
        resolve(e.data);
      };
      worker.postMessage({
        code: "function solve(data) { return data.reduce((a,b)=>a+b,0); }",
        language: "JavaScript",
        tests: [
          { input: [1, 2], expected: 3 },
          { input: [], expected: 0, hidden: true },
        ],
      });
    });
  });
  expect(js.passed).toBe(2);
});
test("desktop dashboard screenshot", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Ready for your next chapter?" }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/dashboard-desktop.png",
    fullPage: true,
  });
});
test("Monaco editing, real submission, progress and solution confirmation work", async ({
  page,
}) => {
  await page.goto("/coding/code-001");
  await expect(page.locator(".monaco-editor")).toBeVisible({ timeout: 30000 });
  await page
    .getByRole("combobox", { name: "Programming language" })
    .selectOption("JavaScript");
  await page.locator(".monaco-editor").click();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(
    "function solve(data){const seen=new Map();for(let i=0;i<data.nums.length;i++){const x=data.nums[i],y=data.target-x;if(seen.has(y))return [seen.get(y),i];if(!seen.has(x))seen.set(x,i);}return [];}",
  );
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByText("3 / 3 test cases passed")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("exceller-prep-v1")!).problems[
          "code-001"
        ].status,
    ),
  ).toBe("Solved");
  await page
    .getByRole("button", { name: "View solution", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "View solution", exact: true })
    .click();
  await expect(page.getByText("Python reference solution")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("exceller-prep-v1")!).problems[
          "code-001"
        ].status,
    ),
  ).toBe("Solution Viewed");
});
test("AI interface requires complete reasoning, accepts evaluation and invalidates it after edits", async ({
  page,
}) => {
  await page.goto("/ai-coding/ai-code-001");
  await expect(
    page.getByRole("button", { name: "Generate AI solution" }),
  ).toBeDisabled();
  await page
    .getByRole("textbox", { name: "Problem understanding", exact: true })
    .fill("Solve this");
  await expect(
    page.getByRole("button", { name: "Evaluate my approach" }),
  ).toBeDisabled();
  const fields = {
    "Problem understanding":
      "Find two distinct indices whose values add to the target.",
    "Proposed algorithm":
      "Scan left to right, check the complement in a map before storing the current value.",
    "Data structure": "A hash map of seen values to first indices.",
    "Variables & logic":
      "Track index, current value, complement and previous entries.",
    "Edge cases":
      "Empty arrays return no pair; duplicates must have distinct indices.",
    "Time complexity": "Expected O(n) time from constant-time map lookup.",
    "Space complexity": "O(n) additional space for the map.",
  };
  for (const [label, value] of Object.entries(fields))
    await page.getByRole("textbox", { name: label, exact: true }).fill(value);
  await page.route("**/api/ai", (route) =>
    route.fulfill({
      json: {
        evaluation: {
          problemUnderstanding: 18,
          algorithm: 22,
          dataStructure: 13,
          edgeCases: 12,
          complexity: 12,
          promptClarity: 9,
          total: 86,
          missing: [],
          feedback: "Valid complement lookup invariant. Test duplicate inputs.",
          eligibleForSolution: true,
        },
      },
    }),
  );
  await page.getByRole("button", { name: "Evaluate my approach" }).click();
  await expect(page.getByText("Approach accepted")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Generate AI solution" }),
  ).toBeEnabled();
  await page
    .getByRole("textbox", { name: "Proposed algorithm", exact: true })
    .fill("I changed the approach and need a new evaluation.");
  await expect(
    page.getByRole("button", { name: "Generate AI solution" }),
  ).toBeDisabled();
});
