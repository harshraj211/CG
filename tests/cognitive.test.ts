import { test } from "node:test";
import assert from "node:assert/strict";
import {
  makeCognitiveRound,
  permute,
  evaluateDigits,
  solveMotion,
  moveBlock,
  motionSolved,
  COGNITIVE_GAME_IDS,
  type CognitiveDifficulty,
} from "../lib/cognitive";
import { initialProgress, progressSchema } from "../services/storage";
const difficulties: CognitiveDifficulty[] = ["easy", "standard", "hard"];

test("switch mappings have exactly one answer, including stacked operators", () => {
  for (const difficulty of difficulties)
    for (let seed = 0; seed < 100; seed++)
      for (const game of ["switch", "shapes"] as const) {
        const r = makeCognitiveRound(game, difficulty, seed);
        assert.equal(r.kind, "switch");
        if (r.kind !== "switch") continue;
        const input = r.first ? permute(r.input, r.first) : r.input;
        assert.equal(
          r.options.filter(
            (option) => permute(input, option).join() === r.output.join(),
          ).length,
          1,
        );
        assert.deepEqual(permute(input, r.answer), r.output);
        assert.equal(new Set(r.options.map((o) => o.join())).size, 4);
      }
});
test("digit puzzles are achievable with each supplied digit once and correct precedence", () => {
  assert.equal(evaluateDigits([3, 4, 2], ["−", "×"]), -5);
  assert.equal(evaluateDigits([3, 4, 2], ["+", "×"]), 11);
  for (const difficulty of difficulties)
    for (let seed = 0; seed < 150; seed++) {
      const r = makeCognitiveRound("digits", difficulty, seed);
      if (r.kind !== "digits") throw Error();
      assert.deepEqual([...r.digits].sort(), [...r.solution].sort());
      assert.equal(new Set(r.digits).size, r.digits.length);
      assert.equal(evaluateDigits(r.solution, r.operators), r.target);
    }
});
test("grid memory uses distinct locations and accurately labels mirrored patterns", () => {
  for (const difficulty of difficulties)
    for (let seed = 0; seed < 100; seed++) {
      const r = makeCognitiveRound("grid", difficulty, seed);
      if (r.kind !== "grid") throw Error();
      assert.equal(new Set(r.sequence).size, r.sequence.length);
      assert.ok(r.sequence.every((cell) => cell >= 0 && cell < 16));
      const mirror = r.left.map(
        (_, i) => r.left[Math.floor(i / 3) * 3 + 2 - (i % 3)],
      );
      assert.equal(
        mirror.every((v, i) => v === r.right[i]),
        r.symmetric,
      );
    }
});
test("deductive questions have exactly one valid symbol in the requested cell", () => {
  for (const difficulty of difficulties)
    for (let seed = 0; seed < 150; seed++) {
      const r = makeCognitiveRound("deductive", difficulty, seed);
      if (r.kind !== "deductive") throw Error();
      const allowed = [1, 2, 3, 4].filter(
        (n) =>
          !r.board[r.row].includes(n) &&
          !r.board.some((line) => line[r.column] === n),
      );
      assert.deepEqual(allowed, [r.answer]);
      for (let i = 0; i < 4; i++)
        for (const line of [r.board[i], r.board.map((row) => row[i])]) {
          const values = line.filter(Boolean);
          assert.equal(new Set(values).size, values.length);
        }
    }
});
test("inductive sequences continue a consistent rotation and dot rule", () => {
  for (const difficulty of difficulties)
    for (let seed = 0; seed < 100; seed++) {
      const r = makeCognitiveRound("inductive", difficulty, seed);
      if (r.kind !== "inductive") throw Error();
      const frames = [...r.frames, r.answer],
        turn = (frames[1].direction - frames[0].direction + 4) % 4;
      for (let i = 1; i < frames.length; i++) {
        assert.equal(
          (frames[i].direction - frames[i - 1].direction + 4) % 4,
          difficulty === "hard" ? (i % 2 ? 1 : 2) : turn,
        );
        assert.equal(
          frames[i].dots,
          difficulty === "easy" ? frames[0].dots : (frames[i - 1].dots % 4) + 1,
        );
      }
      assert.equal(
        r.options.filter(
          (f) => f.direction === r.answer.direction && f.dots === r.answer.dots,
        ).length,
        1,
      );
    }
});
test("motion puzzles are solvable through legal moves without overlap", () => {
  for (const difficulty of difficulties)
    for (let seed = 0; seed < 12; seed++) {
      const r = makeCognitiveRound("motion", difficulty, seed);
      if (r.kind !== "motion") throw Error();
      assert.equal(motionSolved(r.blocks), false);
      const path = solveMotion(r.blocks);
      assert.ok(path, `${difficulty} seed ${seed} unsolvable`);
      let blocks = r.blocks;
      for (const move of path) {
        const next = moveBlock(blocks, move.id, move.delta);
        assert.ok(next);
        blocks = next;
        const cells = blocks.flatMap((b) =>
          Array.from(
            { length: b.length },
            (_, i) =>
              (b.row + (b.axis === "v" ? i : 0)) * 6 +
              b.column +
              (b.axis === "h" ? i : 0),
          ),
        );
        assert.equal(new Set(cells).size, cells.length);
      }
      assert.equal(motionSolved(blocks), true);
      assert.equal(moveBlock(blocks, "missing", 1), null);
      assert.equal(moveBlock(blocks, "A", 2), null);
      assert.equal(moveBlock(blocks, "A", 1), null);
    }
});
test("saved progress migrates without losing notes, and invalid game scores are rejected", () => {
  const old = initialProgress();
  const { cognitiveSessions: removed, ...legacy } = old;
  void removed;
  legacy.notes = {
    personal: { text: "Keep this", attachment: "SQL", updatedAt: "2026-10-17" },
  };
  const loaded = progressSchema.parse(legacy);
  assert.deepEqual(loaded.cognitiveSessions, []);
  assert.equal(loaded.notes.personal.text, "Keep this");
  const session = {
    id: "test",
    game: COGNITIVE_GAME_IDS[0],
    mode: "practice",
    difficulty: "easy",
    correct: 2,
    attempted: 1,
    seconds: 10,
    completedAt: "2026-10-17",
  };
  assert.equal(
    progressSchema.safeParse({ ...old, cognitiveSessions: [session] }).success,
    false,
  );
});
