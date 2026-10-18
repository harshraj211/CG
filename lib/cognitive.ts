export const COGNITIVE_GAME_IDS = [
  "switch",
  "shapes",
  "digits",
  "grid",
  "motion",
  "deductive",
  "inductive",
] as const;
export type CognitiveGameId = (typeof COGNITIVE_GAME_IDS)[number];
export type CognitiveDifficulty = "easy" | "standard" | "hard";
export interface CognitiveSession {
  id: string;
  game: CognitiveGameId;
  mode: "practice" | "timed";
  difficulty: CognitiveDifficulty;
  correct: number;
  attempted: number;
  seconds: number;
  completedAt: string;
}
export const COGNITIVE_GAMES: {
  id: CognitiveGameId;
  title: string;
  skill: string;
  description: string;
  rules: string;
}[] = [
  {
    id: "switch",
    title: "Switch Challenge",
    skill: "Rule mapping",
    description: "Trace a position operator from an input row to its output.",
    rules:
      "An operator lists the input positions in output order. 3142 takes the third symbol first, then the first, fourth and second. Hard mode adds a known first operator; apply it before the unknown operator.",
  },
  {
    id: "shapes",
    title: "Shape Switch",
    skill: "Visual flexibility",
    description:
      "Track shapes through a rearrangement without relying on color.",
    rules:
      "Match the input shapes to the output shapes. Choose the position operator that rearranges them. Positions are numbered from left to right; shapes remain unchanged.",
  },
  {
    id: "digits",
    title: "Digit Challenge",
    skill: "Mental arithmetic",
    description: "Place every digit once to make the target expression.",
    rules:
      "Tap the supplied digits in the order you want to place them. Use every digit exactly once. The operators are fixed: multiplication happens before addition and subtraction. Multiple arrangements may be correct.",
  },
  {
    id: "grid",
    title: "Grid Memory",
    skill: "Memory + attention",
    description:
      "Remember locations, judge a mirror pattern, then recall the order.",
    rules:
      "Start the sequence and remember each lit cell. Next, judge whether the second pattern is the left-to-right mirror of the first. Finally select the remembered cells in their original order. Both the mirror judgment and recall must be correct.",
  },
  {
    id: "motion",
    title: "Motion Challenge",
    skill: "Spatial planning",
    description: "Slide pieces along their permitted axis and free the exit.",
    rules:
      "Select a block and use its direction buttons to slide one cell. Horizontal blocks only move left/right; vertical blocks only move up/down. Blocks cannot overlap or leave the 6×6 board. Bring block A to the right edge of its row. Reset restarts this board.",
  },
  {
    id: "deductive",
    title: "Deductive Challenge",
    skill: "Logical elimination",
    description: "Find the missing symbol in a row-and-column puzzle.",
    rules:
      "Each row and column must contain each of the four symbols exactly once. Solve the highlighted question-mark cell using the visible clues. Other empty cells are not being asked for.",
  },
  {
    id: "inductive",
    title: "Inductive Challenge",
    skill: "Pattern recognition",
    description: "Find the next arrow-and-dot figure in a visual sequence.",
    rules:
      "Look for a repeating rotation rule and a dot-count rule. Dots wrap from four back to one. Hard mode can alternate quarter-turn and half-turn rotations. Choose the figure that continues both rules.",
  },
];
export function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(1664525, value) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}
function shuffled<T>(values: T[], random: () => number): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function int(random: () => number, max: number) {
  return Math.floor(random() * max);
}
export function permute<T>(input: T[], operator: number[]) {
  return operator.map((position) => input[position - 1]);
}
export type DigitOperator = "+" | "−" | "×";
export function evaluateDigits(digits: number[], ops: DigitOperator[]) {
  let total = 0,
    term = digits[0];
  for (let i = 0; i < ops.length; i++) {
    if (ops[i] === "×") term *= digits[i + 1];
    else {
      total += term;
      term = ops[i] === "−" ? -digits[i + 1] : digits[i + 1];
    }
  }
  return total + term;
}
export interface SwitchRound {
  kind: "switch";
  input: number[];
  output: number[];
  first?: number[];
  options: number[][];
  answer: number[];
  explanation: string;
}
export interface DigitRound {
  kind: "digits";
  digits: number[];
  operators: DigitOperator[];
  target: number;
  solution: number[];
  explanation: string;
}
export interface GridRound {
  kind: "grid";
  sequence: number[];
  left: boolean[];
  right: boolean[];
  symmetric: boolean;
  explanation: string;
}
export interface DeductiveRound {
  kind: "deductive";
  board: number[][];
  row: number;
  column: number;
  answer: number;
  explanation: string;
}
export interface Figure {
  direction: number;
  dots: number;
}
export interface InductiveRound {
  kind: "inductive";
  frames: Figure[];
  options: Figure[];
  answer: Figure;
  explanation: string;
}
export interface MotionBlock {
  id: string;
  row: number;
  column: number;
  length: number;
  axis: "h" | "v";
}
export interface MotionRound {
  kind: "motion";
  blocks: MotionBlock[];
  explanation: string;
}
export type CognitiveRound =
  | SwitchRound
  | DigitRound
  | GridRound
  | DeductiveRound
  | InductiveRound
  | MotionRound;
export function moveBlock(
  blocks: MotionBlock[],
  id: string,
  delta: number,
): MotionBlock[] | null {
  if (delta !== 1 && delta !== -1) return null;
  const block = blocks.find((b) => b.id === id);
  if (!block) return null;
  const next = {
    ...block,
    row: block.row + (block.axis === "v" ? delta : 0),
    column: block.column + (block.axis === "h" ? delta : 0),
  };
  if (
    next.row < 0 ||
    next.column < 0 ||
    next.row + (next.axis === "v" ? next.length : 1) > 6 ||
    next.column + (next.axis === "h" ? next.length : 1) > 6
  )
    return null;
  const occupied = new Set(
    blocks
      .filter((b) => b.id !== id)
      .flatMap((b) =>
        Array.from(
          { length: b.length },
          (_, i) =>
            (b.row + (b.axis === "v" ? i : 0)) * 6 +
            b.column +
            (b.axis === "h" ? i : 0),
        ),
      ),
  );
  if (
    Array.from(
      { length: next.length },
      (_, i) =>
        (next.row + (next.axis === "v" ? i : 0)) * 6 +
        next.column +
        (next.axis === "h" ? i : 0),
    ).some((cell) => occupied.has(cell))
  )
    return null;
  return blocks.map((b) => (b.id === id ? next : { ...b }));
}
export const motionSolved = (blocks: MotionBlock[]) =>
  blocks.some((b) => b.id === "A" && b.column + b.length === 6);
export function solveMotion(
  blocks: MotionBlock[],
  limit = 30000,
): { id: string; delta: number }[] | null {
  const key = (state: MotionBlock[]) =>
    state.map((b) => `${b.row},${b.column}`).join(";");
  const queue = [{ blocks, path: [] as { id: string; delta: number }[] }],
    seen = new Set([key(blocks)]);
  for (let head = 0; head < queue.length && head < limit; head++) {
    const current = queue[head];
    if (motionSolved(current.blocks)) return current.path;
    for (const block of current.blocks)
      for (const delta of [-1, 1]) {
        const next = moveBlock(current.blocks, block.id, delta);
        if (next && !seen.has(key(next))) {
          seen.add(key(next));
          queue.push({
            blocks: next,
            path: [...current.path, { id: block.id, delta }],
          });
        }
      }
  }
  return null;
}
export function makeCognitiveRound(
  game: CognitiveGameId,
  difficulty: CognitiveDifficulty,
  seed: number,
): CognitiveRound {
  const random = seededRandom(seed),
    hard = difficulty === "hard",
    easy = difficulty === "easy";
  if (game === "switch" || game === "shapes") {
    const positions = Array.from(
        { length: easy ? 3 : hard ? 5 : 4 },
        (_, i) => i + 1,
      ),
      input = shuffled(positions, random);
    const first = hard ? shuffled(positions, random) : undefined,
      answer = shuffled(positions, random),
      options = [answer];
    while (options.length < 4) {
      const candidate = shuffled(positions, random);
      if (!options.some((o) => o.join() === candidate.join()))
        options.push(candidate);
    }
    return {
      kind: "switch",
      input,
      first,
      answer,
      options: shuffled(options, random),
      output: permute(first ? permute(input, first) : input, answer),
      explanation: `${first ? `First apply ${first.join("")}. Then ` : ""}Read ${answer.join("")} as positions: ${answer.join(" → ")}. Each output slot takes that numbered input position.`,
    };
  }
  if (game === "digits") {
    const digits = shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9], random).slice(
        0,
        easy ? 3 : hard ? 5 : 4,
      ),
      solution = shuffled(digits, random);
    const operators = Array.from(
      { length: digits.length - 1 },
      () =>
        ["+", "−", ...(easy ? [] : ["×"])][
          int(random, easy ? 2 : 3)
        ] as DigitOperator,
    );
    const target = evaluateDigits(solution, operators);
    return {
      kind: "digits",
      digits,
      solution,
      operators,
      target,
      explanation: `One valid arrangement is ${solution.map((n, i) => `${n}${operators[i] ? ` ${operators[i]} ` : ""}`).join("")} = ${target}. Multiply before adding or subtracting.`,
    };
  }
  if (game === "grid") {
    const sequence = shuffled(
        Array.from({ length: 16 }, (_, i) => i),
        random,
      ).slice(0, easy ? 3 : hard ? 5 : 4),
      left = Array.from({ length: 9 }, () => random() > 0.5);
    const right = left.map((_, i) => left[Math.floor(i / 3) * 3 + 2 - (i % 3)]),
      symmetric = random() > 0.5;
    if (!symmetric) {
      const cell = int(random, 9);
      right[cell] = !right[cell];
    }
    return {
      kind: "grid",
      sequence,
      left,
      right,
      symmetric,
      explanation: `Recall order (row, column): ${sequence.map((p) => `(${Math.floor(p / 4) + 1}, ${(p % 4) + 1})`).join(" → ")}. The patterns ${symmetric ? "are" : "are not"} left-to-right mirrors.`,
    };
  }
  if (game === "deductive") {
    const rows = shuffled([0, 1, 2, 3], random),
      cols = shuffled([0, 1, 2, 3], random),
      symbols = shuffled([1, 2, 3, 4], random);
    const board = rows.map((r) => cols.map((c) => symbols[(r + c) % 4])),
      row = int(random, 4),
      column = int(random, 4),
      answer = board[row][column];
    board[row][column] = 0;
    const candidates = () =>
      [1, 2, 3, 4].filter(
        (value) =>
          !board[row].includes(value) &&
          !board.some((line) => line[column] === value),
      );
    for (const cell of shuffled(
      Array.from({ length: 16 }, (_, i) => i),
      random,
    ).slice(0, easy ? 0 : hard ? 7 : 4)) {
      const r = Math.floor(cell / 4),
        c = cell % 4;
      if (r === row && c === column) continue;
      const old = board[r][c];
      board[r][c] = 0;
      if (candidates().length !== 1) board[r][c] = old;
    }
    return {
      kind: "deductive",
      board,
      row,
      column,
      answer,
      explanation: `The missing symbol is ${["circle", "triangle", "square", "diamond"][answer - 1]}. Eliminate every symbol already in row ${row + 1} or column ${column + 1}; only this symbol remains.`,
    };
  }
  if (game === "inductive") {
    const direction = int(random, 4),
      dots = int(random, 4) + 1,
      step = random() > 0.5 ? 1 : 3;
    const frames: Figure[] = [{ direction, dots }];
    for (let i = 0; i < 4; i++) {
      const previous = frames[i];
      frames.push({
        direction:
          (previous.direction + (hard ? (i % 2 === 0 ? 1 : 2) : step)) % 4,
        dots: easy ? dots : (previous.dots % 4) + 1,
      });
    }
    const answer = frames.pop()!,
      options = [answer];
    for (const alternative of shuffled(
      Array.from({ length: 16 }, (_, i) => ({
        direction: Math.floor(i / 4),
        dots: (i % 4) + 1,
      })),
      random,
    )) {
      if (options.length === 4) break;
      if (
        !options.some(
          (o) =>
            o.direction === alternative.direction &&
            o.dots === alternative.dots,
        )
      )
        options.push(alternative);
    }
    return {
      kind: "inductive",
      frames,
      answer,
      options: shuffled(options, random),
      explanation: `${hard ? "Rotations alternate 90° then 180° clockwise" : `Each arrow turns 90° ${step === 1 ? "clockwise" : "counterclockwise"}`}. ${easy ? "The dot count stays the same." : "Add one dot per frame, wrapping four back to one."}`,
    };
  }
  const base: MotionBlock[] = [
    { id: "A", row: 2, column: 0, length: 2, axis: "h" },
    { id: "B", row: 0, column: 2, length: 3, axis: "v" },
    { id: "C", row: 1, column: 4, length: 2, axis: "v" },
    ...(!easy
      ? [{ id: "D", row: 3, column: 1, length: 2, axis: "h" } as MotionBlock]
      : []),
    ...(hard
      ? [{ id: "E", row: 4, column: 1, length: 2, axis: "h" } as MotionBlock]
      : []),
  ];
  let blocks = base.map((b) => ({ ...b }));
  for (let i = 0; i < (easy ? 4 : hard ? 24 : 12); i++) {
    const legal = blocks.flatMap((b) =>
      [-1, 1]
        .map((delta) => moveBlock(blocks, b.id, delta))
        .filter((v): v is MotionBlock[] => !!v),
    );
    blocks = legal[int(random, legal.length)];
  }
  if (motionSolved(blocks)) blocks = base;
  return {
    kind: "motion",
    blocks,
    explanation:
      "Work backwards from A’s exit row. Move vertical obstructions completely above or below that row, making room for them first. Every move must respect the block’s axis and occupied cells.",
  };
}
