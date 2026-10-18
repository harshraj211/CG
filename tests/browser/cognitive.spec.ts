import { test, expect } from "@playwright/test";
import {
  COGNITIVE_GAME_IDS,
  makeCognitiveRound,
  solveMotion,
} from "../../lib/cognitive";
const seed = Math.floor(0.314159 * 0xffffffff);
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.314159;
  });
});

for (const game of COGNITIVE_GAME_IDS)
  test(`${game} accepts a correct playable puzzle`, async ({ page }) => {
    if (game === "grid") await page.clock.install();
    await page.goto(`/cognitive/${game}`);
    await page.getByRole("button", { name: "Start game", exact: true }).click();
    const round = makeCognitiveRound(game, "standard", seed);
    if (round.kind === "switch")
      await page
        .getByRole("button", { name: round.answer.join(""), exact: true })
        .click();
    if (round.kind === "digits") {
      for (const digit of round.solution)
        await page
          .locator(".cg-digit-bank")
          .getByRole("button", { name: String(digit), exact: true })
          .click();
      await page.getByRole("button", { name: "Check expression" }).click();
    }
    if (round.kind === "deductive")
      await page
        .getByRole("button", {
          name: ["circle", "triangle", "square", "diamond"][round.answer - 1],
          exact: true,
        })
        .click();
    if (round.kind === "inductive") {
      const i = round.options.findIndex(
        (f) =>
          f.direction === round.answer.direction &&
          f.dots === round.answer.dots,
      );
      await page
        .getByRole("button", { name: new RegExp(`^Option ${i + 1}:`) })
        .click();
    }
    if (round.kind === "grid") {
      await page.getByRole("button", { name: "Start sequence" }).click();
      await expect(
        page.getByRole("heading", { name: "Watch the sequence." }),
      ).toBeVisible();
      await page.clock.fastForward(round.sequence.length * 1200 + 100);
      await page
        .getByRole("button", {
          name: round.symmetric ? "Yes, mirrored" : "No, different",
          exact: true,
        })
        .click();
      for (const cell of round.sequence)
        await page
          .getByRole("button", {
            name: `Row ${Math.floor(cell / 4) + 1}, column ${(cell % 4) + 1}`,
            exact: true,
          })
          .click();
      await page.getByRole("button", { name: "Submit recall" }).click();
    }
    if (round.kind === "motion") {
      const path = solveMotion(round.blocks);
      expect(path).not.toBeNull();
      for (const move of path!) {
        const block = round.blocks.find((b) => b.id === move.id)!;
        await page
          .getByRole("button", { name: new RegExp(`^Block ${block.id},`) })
          .click();
        await page
          .getByRole("button", {
            name:
              block.axis === "h"
                ? move.delta === 1
                  ? "Move right"
                  : "Move left"
                : move.delta === 1
                  ? "Move down"
                  : "Move up",
            exact: true,
          })
          .click();
      }
    }
    await expect(
      page.getByRole("heading", { name: "Correct. Nicely reasoned." }),
    ).toBeVisible();
    await page.getByRole("button", { name: "End run", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Session saved" }),
    ).toBeVisible();
    const saved = await page.evaluate(() =>
      JSON.parse(
        localStorage.getItem("exceller-prep-v1")!,
      ).cognitiveSessions.at(-1),
    );
    expect(saved.game).toBe(game);
    expect(saved.correct).toBe(1);
    expect(saved.attempted).toBe(1);
  });

test("five-puzzle practice finishes and persists once", async ({ page }) => {
  await page.goto("/cognitive/switch");
  await page.getByRole("button", { name: "Start game", exact: true }).click();
  for (let i = 0; i < 5; i++) {
    const r = makeCognitiveRound("switch", "standard", seed + i * 7919);
    if (r.kind !== "switch") throw Error();
    await page
      .getByRole("button", { name: r.answer.join(""), exact: true })
      .click();
    await page
      .getByRole("button", {
        name: i === 4 ? "See results" : "Next puzzle",
        exact: true,
      })
      .click();
  }
  await expect(page.locator(".cg-result-score")).toHaveText("5/5");
  await page.reload();
  await page.goto("/cognitive");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody tr").first()).toContainText("5/5");
});
test("timed expiry ends a run and counts the unfinished puzzle once", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/cognitive/switch");
  await page.getByLabel("Mode", { exact: true }).selectOption("timed");
  await page.getByRole("button", { name: "Start game", exact: true }).click();
  await expect(page.getByRole("timer")).toContainText("3:00");
  await page.clock.runFor(180500);
  await expect(
    page.getByRole("heading", { name: "Session saved" }),
  ).toBeVisible();
  await expect(page.locator(".cg-result-score")).toHaveText("0/1");
  await page.clock.fastForward(10000);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("exceller-prep-v1")!).cognitiveSessions
          .length,
    ),
  ).toBe(1);
});
test("all games fit mobile in pure black and the hub is accessible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/cognitive");
  await expect(page.locator(".cg-game-card")).toHaveCount(7);
  await page
    .getByRole("button", { name: "Switch to pure black theme" })
    .click();
  await expect(page.locator(".cg-intro")).toHaveCSS(
    "background-color",
    "rgb(0, 0, 0)",
  );
  await page.screenshot({
    path: "artifacts/cognitive-hub-mobile.png",
    fullPage: true,
  });
  for (const game of COGNITIVE_GAME_IDS) {
    await page.goto(`/cognitive/${game}`);
    await page.getByRole("button", { name: "Start game", exact: true }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      game,
    ).toBe(true);
    const bounds = await page.locator(".cg-arena").boundingBox();
    expect(bounds!.width).toBeGreaterThan(250);
    await page.screenshot({
      path: `artifacts/cognitive-${game}-mobile.png`,
      fullPage: true,
    });
  }
});
