import { test } from "node:test";
import assert from "node:assert/strict";
import { mcqs, reasoning } from "../data";
import { initialProgress, progressSchema } from "../services/storage";
test("every assessment MCQ carries context, a rationale for each option and a revision takeaway", () => {
  for (const q of [...mcqs, ...reasoning]) {
    assert.ok(
      q.context && q.context.length > 55,
      `${q.id}: insufficient context`,
    );
    assert.equal(q.optionExplanations?.length, 4, `${q.id}: option feedback`);
    assert.ok(
      q.optionExplanations?.every((text) => text.length > 25),
      q.id,
    );
    assert.ok(q.takeAway && q.takeAway.length > 25, q.id);
    assert.equal(q.contentVersion, 2);
    assert.ok(!q.question.includes("A candidate proposes this use case"), q.id);
  }
});
test("existing saved progress receives a reading preference without losing answers or notes", () => {
  const current = initialProgress();
  const legacy = {
    ...current,
    settings: Object.fromEntries(
      Object.entries(current.settings).filter(([key]) => key !== "textSize"),
    ),
    notes: {
      personal: {
        text: "Keep my notes",
        updatedAt: "2026-10-09",
        attachment: "SQL",
      },
    },
  };
  const restored = progressSchema.parse(legacy);
  assert.equal(restored.settings.textSize, "comfortable");
  assert.equal(restored.notes.personal.text, "Keep my notes");
});
test("core palette text meets normal-text contrast targets in both themes", () => {
  const luminance = (hex: string) => {
    const rgb = hex
      .match(/\w\w/g)!
      .map((c) => parseInt(c, 16) / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };
  const ratio = (a: string, b: string) => {
    const x = luminance(a),
      y = luminance(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };
  for (const [text, bg] of [
    ["19303b", "ffffff"],
    ["4d6472", "ffffff"],
    ["205ba6", "ffffff"],
    ["ffffff", "205ba6"],
    ["17684e", "eaf5ee"],
    ["963f36", "fff1ed"],
    ["e4eef3", "192d39"],
    ["b8cad4", "192d39"],
    ["a4cbfc", "223b50"],
    ["ffffff", "245faa"],
    ["94d8b8", "1d3b32"],
    ["ffc0b6", "422e2d"],
  ])
    assert.ok(ratio(text, bg) >= 4.5, `${text}/${bg}: ${ratio(text, bg)}`);
});
