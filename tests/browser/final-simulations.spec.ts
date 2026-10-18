import { test, expect, type Page } from "@playwright/test";
import {
  mocks,
  finalQuestionSets,
  finalDebugging,
  finalCoding,
  finalAiCoding,
} from "../../data";
import { createMock, advanceMock } from "../../lib/assessment";
import { initialProgress } from "../../services/storage";
import { COGNITIVE_GAME_IDS, makeCognitiveRound } from "../../lib/cognitive";

const paper = mocks.find((m) => m.finalSet === 1)!;
const card = (page: Page) =>
  page.locator(".mock-card").filter({
    has: page.getByRole("heading", { name: paper.title, exact: true }),
  });
async function start(page: Page) {
  await page.goto("/mocks");
  await card(page).getByRole("button", { name: "Start fresh paper" }).click();
  await expect(page.getByText("Question palette")).toBeVisible();
}
async function state(page: Page) {
  return page.evaluate(() =>
    JSON.parse(localStorage.getItem("exceller-prep-v1")!),
  );
}
async function setCode(page: Page, code: string) {
  await expect(page.locator(".monaco-editor")).toBeVisible({ timeout: 30000 });
  await page.evaluate((value) => {
    const editor = (
      window as unknown as {
        monaco: {
          editor: { getModels(): { setValue(value: string): void }[] };
        };
      }
    ).monaco.editor;
    editor.getModels().at(-1)!.setValue(value);
  }, code);
}

test("five papers start in real fullscreen; exiting saves an ended attempt", async ({
  page,
}) => {
  await page.goto("/mocks");
  await expect(
    page.getByRole("heading", { name: /^Fresh Final Exceller Simulation/ }),
  ).toHaveCount(5);
  await expect(card(page)).toContainText(
    "1 debugging · 1 coding · 1 AI coding",
  );
  await expect(card(page)).toContainText("7 cognitive puzzles");
  await card(page).getByRole("button", { name: "Start fresh paper" }).click();
  await expect(page.getByText("Question palette")).toBeVisible();
  expect(await page.evaluate(() => !!document.fullscreenElement)).toBe(true);
  await expect(page.locator(".exam-stage-strip > div")).toHaveCount(5);
  await expect(
    page.getByRole("region", { name: "Question context" }),
  ).toBeVisible();
  await expect(
    page.getByText("Why this answer is correct", { exact: true }),
  ).toHaveCount(0);
  await page.locator(".answer-option").first().click();
  await page.evaluate(() => document.exitFullscreen());
  await expect(
    page.getByText("Attempt ended: Fullscreen was exited."),
  ).toBeVisible();
  const saved = await state(page);
  expect(saved.activeMock).toBeNull();
  expect(saved.mocks).toHaveLength(1);
  expect(saved.mocks[0].qualified).toBe(false);
  expect(Object.keys(saved.mocks[0].answers)).toHaveLength(1);
  expect(saved.answers).toEqual({});
  await page
    .getByRole("button", { name: "All assessments", exact: true })
    .click();
  await expect(
    card(page).getByRole("button", { name: "Retake this paper" }),
  ).toBeVisible();
});

for (const signal of ["hidden", "blur"] as const)
  test(`${signal} browser signal ends the fullscreen attempt once`, async ({
    page,
  }) => {
    await start(page);
    // Playwright emulates every tab as visible/focused, even after bringToFront.
    // Deliver the actual browser signals explicitly to test enforcement reliably.
    await page.evaluate((kind) => {
      if (kind === "hidden") {
        Object.defineProperty(document, "hidden", {
          configurable: true,
          value: true,
        });
        document.dispatchEvent(new Event("visibilitychange"));
      } else window.dispatchEvent(new Event("blur"));
      window.dispatchEvent(new Event("blur"));
    }, signal);
    await expect.poll(async () => (await state(page)).activeMock).toBeNull();
    await expect(page.getByText(/Attempt ended:/)).toBeVisible();
    expect((await state(page)).mocks).toHaveLength(1);
    expect((await state(page)).mocks[0].integrityReason).toMatch(
      /focus|tab|hidden|Fullscreen/,
    );
  });

test("refresh cannot resume a reserved fullscreen final", async ({ page }) => {
  await start(page);
  await page.reload();
  await expect.poll(async () => (await state(page)).activeMock).toBeNull();
  expect((await state(page)).mocks).toHaveLength(1);
  expect((await state(page)).mocks[0].qualified).toBe(false);
});

test("denied fullscreen does not consume a fresh attempt", async ({ page }) => {
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = async () => {
      throw new Error("denied");
    };
  });
  await page.goto("/mocks");
  await card(page).getByRole("button", { name: "Start fresh paper" }).click();
  await expect(page.getByText(/Fullscreen could not start/)).toContainText(
    "No attempt has been created",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("exceller-prep-v1")),
  ).toBeNull();
});

test("reserved paper cards fit mobile and preserve the pure-black theme", async ({
  page,
}) => {
  await page.goto("/mocks");
  await page
    .getByRole("button", { name: "Switch to pure black theme" })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
  await expect(card(page)).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "test-results/fresh-finals-black.png",
    fullPage: true,
  });
});

test("fresh final runs MCQ, debugging, coding, gated AI and cognitive in order", async ({
  page,
}) => {
  test.setTimeout(120000);
  await start(page);
  const attempt = (await state(page)).activeMock;
  for (let i = 0; i < attempt.questions.length; i++) {
    const id = attempt.questions[i];
    const question = finalQuestionSets[0].find((q) => q.id === id)!;
    const visibleIndex = attempt.options[id].indexOf(question.correctAnswer);
    await page.locator(".answer-option").nth(visibleIndex).click();
    if (i < attempt.questions.length - 1)
      await page.getByRole("button", { name: "Next", exact: true }).click();
  }
  await page
    .getByRole("button", { name: "Submit stage", exact: true })
    .first()
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Submit stage", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: finalDebugging[0].title, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "View solution", exact: true }),
  ).toHaveCount(0);
  await setCode(page, finalDebugging[0].solution);
  expect(
    (await state(page)).drafts[`final-1-debug-Python-exam-${attempt.id}`],
  ).toBe(finalDebugging[0].solution);
  await page.getByRole("button", { name: "Run code", exact: true }).click();
  await expect(
    page.getByText("2 / 2 test cases passed", { exact: true }),
  ).toBeVisible({ timeout: 45000 });
  await page.getByRole("button", { name: "Submit stage", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: finalCoding[0].title, exact: true }),
  ).toBeVisible({ timeout: 45000 });
  expect((await state(page)).activeMock.stage).toBe("coding");
  expect((await state(page)).problems).toEqual({});
  await setCode(page, finalCoding[0].solution);
  await page.getByRole("button", { name: "Submit stage", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: finalAiCoding[0].title, exact: true }),
  ).toBeVisible({ timeout: 45000 });
  await expect(
    page.getByRole("button", { name: "Implementation & tests" }),
  ).toBeDisabled();
  await page.route("**/api/ai", async (route) => {
    expect(route.request().postDataJSON().problemId).toBe("final-1-ai");
    await route.fulfill({
      json: {
        evaluation: {
          problemUnderstanding: 20,
          algorithm: 25,
          dataStructure: 15,
          edgeCases: 15,
          complexity: 15,
          promptClarity: 10,
          total: 100,
          missing: [],
          feedback: "Test fixture: approach covers the required invariant.",
          eligibleForSolution: true,
        },
      },
    });
  });
  const fields = {
    "Problem understanding":
      "Count nonempty contiguous binary event segments with equal routine and alert counts.",
    "Proposed algorithm":
      "Map zero to minus one and one to plus one. Track prefix balances and count earlier occurrences before inserting the current prefix.",
    "Data structure": "Hash map from prefix balance to its frequency.",
    "Variables & logic":
      "Balance, total and frequency map initialized with balance zero occurring once.",
    "Edge cases":
      "Empty input gives zero; all identical events give zero; repeated balances count multiple segments.",
    "Time complexity": "O(n) expected, with one scan and hash-map operations.",
    "Space complexity": "O(n) for at most n+1 distinct prefix balances.",
  };
  for (const [label, value] of Object.entries(fields))
    await page.getByRole("textbox", { name: label, exact: true }).fill(value);
  await page.getByRole("button", { name: "Evaluate my approach" }).click();
  await expect(
    page.getByText("Approach accepted", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Implementation & tests" }).click();
  await setCode(page, finalAiCoding[0].solution);
  await page.getByRole("button", { name: "Submit stage", exact: true }).click();
  await expect(
    page.getByText("FINAL STAGE · PUZZLE 1 OF 7", { exact: true }),
  ).toBeVisible({ timeout: 45000 });
  expect((await state(page)).activeMock.stage).toBe("cognitive");
  expect((await state(page)).activeMock.scores).toEqual({
    mcq: 100,
    debugging: 100,
    coding: 100,
    ai: 100,
  });
  await page.getByRole("button", { name: "Leave assessment" }).click();
  await page.getByRole("button", { name: "End attempt", exact: true }).click();
  await expect(page.getByText(/Attempt ended: You chose/)).toBeVisible();
});

for (const qualify of [false, true])
  test(`final cognitive stage records seven games and ${qualify ? "qualifies at five correct" : "fails at four correct"}`, async ({
    page,
  }) => {
    let attempt = createMock(paper, 75);
    for (let stage = 0; stage < 4; stage++) attempt = advanceMock(attempt, 100);
    await page.addInitScript(
      (saved) => {
        localStorage.setItem("exceller-prep-v1", JSON.stringify(saved));
        Object.defineProperty(document, "fullscreenElement", {
          get: () => document.documentElement,
        });
      },
      { ...initialProgress(), activeMock: attempt },
    );
    await page.goto("/mocks");
    for (let index = 0; index < 7; index++) {
      const round = makeCognitiveRound(
        COGNITIVE_GAME_IDS[index],
        "hard",
        0x6f100000 + 104729 + index * 7919,
      );
      await expect(
        page.getByText(`FINAL STAGE · PUZZLE ${index + 1} OF 7`, {
          exact: true,
        }),
      ).toBeVisible();
      if (round.kind === "switch")
        await page
          .getByRole("button", { name: round.answer.join(""), exact: true })
          .click();
      else if (round.kind === "deductive") {
        await page
          .getByRole("button", {
            name: ["circle", "triangle", "square", "diamond"][round.answer - 1],
            exact: true,
          })
          .click();
      } else if (round.kind === "inductive") {
        const option = round.options.findIndex(
          (o) =>
            o.direction === round.answer.direction &&
            o.dots === round.answer.dots,
        );
        await page
          .getByRole("button", { name: new RegExp(`^Option ${option + 1}:`) })
          .click();
      } else if (round.kind === "digits" && qualify) {
        for (const digit of round.solution)
          await page
            .getByRole("button", { name: String(digit), exact: true })
            .click();
        await page
          .getByRole("button", { name: "Check expression", exact: true })
          .click();
      } else
        await page.getByRole("button", { name: "Skip this puzzle" }).click();
    }
    await expect(
      page.getByRole("heading", { name: "Cognitive puzzle results" }),
    ).toBeVisible();
    const saved = await state(page);
    expect(saved.activeMock).toBeNull();
    expect(saved.mocks[0].cognitiveAnswers).toHaveLength(7);
    expect(saved.mocks[0].scores.cognitive).toBe(qualify ? 71 : 57);
    expect(saved.mocks[0].qualified).toBe(qualify);
  });
