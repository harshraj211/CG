"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BrainCircuit,
  ArrowRight,
  Clock,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { useProgress } from "@/hooks/progress";
import { Heading } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  COGNITIVE_GAMES,
  makeCognitiveRound,
  evaluateDigits,
  moveBlock,
  motionSolved,
  type CognitiveGameId,
  type CognitiveDifficulty,
  type CognitiveRound,
  type CognitiveSession,
  type Figure,
  type GridRound,
  type MotionRound,
} from "@/lib/cognitive";

const symbols = ["●", "▲", "■", "◆", "✚"];
const names = ["circle", "triangle", "square", "diamond", "plus"];
function SymbolRow({
  values,
  shapes = false,
}: {
  values: number[];
  shapes?: boolean;
}) {
  return (
    <div className="cg-symbol-row">
      {values.map((value, i) => (
        <span
          className="cg-symbol"
          key={i}
          aria-label={shapes ? names[value - 1] : String(value)}
        >
          {shapes ? symbols[value - 1] : value}
          <small>position {i + 1}</small>
        </span>
      ))}
    </div>
  );
}
function FigureView({ figure }: { figure: Figure }) {
  return (
    <span
      className="cg-figure"
      aria-label={`${["up", "right", "down", "left"][figure.direction]} arrow, ${figure.dots} dots`}
    >
      <span
        className="cg-arrow"
        style={{ transform: `rotate(${figure.direction * 90}deg)` }}
      >
        ↑
      </span>
      <span className="cg-dots" aria-hidden="true">
        {"●".repeat(figure.dots)}
      </span>
    </span>
  );
}
function MirrorPattern({ cells, label }: { cells: boolean[]; label: string }) {
  return (
    <div
      className="cg-mirror"
      role="img"
      aria-label={`${label}: ${cells
        .map((v, i) => (v ? `${Math.floor(i / 3) + 1},${(i % 3) + 1}` : ""))
        .filter(Boolean)
        .join("; ")}`}
    >
      <span>{label}</span>
      <div>
        {cells.map((value, i) => (
          <i key={i} className={value ? "filled" : ""} />
        ))}
      </div>
    </div>
  );
}

export function CognitiveGames({ id }: { id?: string }) {
  const { progress } = useProgress();
  const game = COGNITIVE_GAMES.find((g) => g.id === id);
  if (id && !game)
    return (
      <section className="panel">
        <h1>Game not found</h1>
        <Link href="/cognitive">Return to cognitive games</Link>
      </section>
    );
  if (game) return <GameSession key={game.id} game={game} />;
  const history = progress.cognitiveSessions;
  const attempted = history.reduce((sum, s) => sum + s.attempted, 0),
    correct = history.reduce((sum, s) => sum + s.correct, 0);
  return (
    <>
      <Heading
        eyebrow="THINK · REMEMBER · ADAPT"
        title="Cognitive games"
        description="Seven playable drills for mapping, memory, arithmetic and spatial reasoning. Build familiarity before your interview preparation."
      />
      <section className="panel cg-intro">
        <div>
          <span className="tag blue">Game-based practice</span>
          <h2>A different kind of preparation.</h2>
          <p>
            Start with five untimed puzzles, or try a three-minute run. Every
            session uses fresh puzzles and saves your result on this device.
          </p>
          <small>
            Independent practice simulations. Game selection, timing and scoring
            may differ from your assessment invitation. There is no official
            pass mark here.
          </small>
        </div>
        <BrainCircuit size={72} aria-hidden="true" />
      </section>
      <div className="cg-summary">
        <div>
          <strong>{history.length}</strong>
          <span>saved sessions</span>
        </div>
        <div>
          <strong>
            {attempted ? Math.round((correct / attempted) * 100) : 0}%
          </strong>
          <span>overall accuracy</span>
        </div>
        <div>
          <strong>{new Set(history.map((s) => s.game)).size}/7</strong>
          <span>games explored</span>
        </div>
      </div>
      <div className="cg-library">
        {COGNITIVE_GAMES.map((g, i) => {
          const played = history.filter((s) => s.game === g.id);
          return (
            <section className="panel cg-game-card" key={g.id}>
              <div className="cg-card-top">
                <span className="cg-game-number">0{i + 1}</span>
                <span className="tag neutral">{g.skill}</span>
              </div>
              <h2>{g.title}</h2>
              <p>{g.description}</p>
              <small>
                {played.length
                  ? `${played.length} sessions · best ${Math.max(...played.map((s) => (s.attempted ? Math.round((s.correct / s.attempted) * 100) : 0)))}% accuracy`
                  : "No session yet · start at your own pace"}
              </small>
              <Button asChild>
                <Link href={`/cognitive/${g.id}`}>
                  Open game <ArrowRight size={16} />
                </Link>
              </Button>
            </section>
          );
        })}
      </div>
      <section className="panel">
        <div className="panel-heading">
          <h2>Your recent sessions</h2>
          <Link className="text-link" href="/interview">
            Continue to interview prep →
          </Link>
        </div>
        {!history.length ? (
          <p>
            Your completed and ended runs will appear here. All results are
            personal practice scores.
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Game</th>
                  <th>Mode / level</th>
                  <th>Result</th>
                  <th>Accuracy</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {[...history]
                  .reverse()
                  .slice(0, 12)
                  .map((s) => (
                    <tr key={s.id}>
                      <td>
                        {COGNITIVE_GAMES.find((g) => g.id === s.game)?.title}
                      </td>
                      <td>
                        {s.mode} / {s.difficulty}
                      </td>
                      <td>
                        {s.correct}/{s.attempted}
                      </td>
                      <td>
                        {s.attempted
                          ? Math.round((s.correct / s.attempted) * 100)
                          : 0}
                        %
                      </td>
                      <td>{new Date(s.completedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="small-text">
        Game-type references:{" "}
        <a
          className="text-link"
          href="https://www.cognitivegames.me/games/cognitive"
          target="_blank"
          rel="noreferrer"
        >
          CognitiveGames
        </a>{" "}
        ·{" "}
        <a
          className="text-link"
          href="https://technicalhub.io/capgemini/"
          target="_blank"
          rel="noreferrer"
        >
          Technical Hub
        </a>
        . These implementations and practice scores are our own.
      </p>
    </>
  );
}

function GameSession({ game }: { game: (typeof COGNITIVE_GAMES)[number] }) {
  const { update } = useProgress();
  const [mode, setMode] = useState<"practice" | "timed">("practice"),
    [difficulty, setDifficulty] = useState<CognitiveDifficulty>("standard");
  const [phase, setPhase] = useState<"setup" | "playing" | "result">("setup"),
    [round, setRound] = useState<CognitiveRound | null>(null);
  const [correct, setCorrect] = useState(0),
    [attempted, setAttempted] = useState(0),
    [number, setNumber] = useState(1),
    [started, setStarted] = useState(0),
    [remaining, setRemaining] = useState(180);
  const [feedback, setFeedback] = useState<{
      correct: boolean;
      detail: string;
    } | null>(null),
    [result, setResult] = useState<CognitiveSession | null>(null);
  const seed = useRef(0),
    finished = useRef(false),
    judged = useRef(false);
  const finish = useCallback(
    (expired = false) => {
      if (finished.current || phase !== "playing") return;
      finished.current = true;
      const session: CognitiveSession = {
        id: `cg-${started}-${seed.current}`,
        game: game.id,
        mode,
        difficulty,
        correct,
        attempted: attempted + (expired && !feedback ? 1 : 0),
        seconds: Math.max(1, Math.round((Date.now() - started) / 1000)),
        completedAt: new Date().toISOString(),
      };
      update((p) => ({
        ...p,
        cognitiveSessions: [...p.cognitiveSessions, session].slice(-200),
      }));
      setResult(session);
      setPhase("result");
    },
    [
      phase,
      started,
      game.id,
      mode,
      difficulty,
      correct,
      attempted,
      feedback,
      update,
    ],
  );
  useEffect(() => {
    if (phase !== "playing" || mode !== "timed") return;
    const timer = setInterval(() => {
      const left = Math.max(
        0,
        Math.ceil((started + 180000 - Date.now()) / 1000),
      );
      setRemaining(left);
      if (left === 0) finish(true);
    }, 250);
    return () => clearInterval(timer);
  }, [phase, mode, started, finish]);
  function start() {
    seed.current = Math.floor(Math.random() * 0xffffffff);
    finished.current = false;
    judged.current = false;
    setCorrect(0);
    setAttempted(0);
    setNumber(1);
    setFeedback(null);
    setRemaining(180);
    setStarted(Date.now());
    setRound(makeCognitiveRound(game.id, difficulty, seed.current));
    setPhase("playing");
  }
  function answer(valid: boolean, detail = "") {
    if (judged.current || finished.current) return;
    judged.current = true;
    setAttempted((n) => n + 1);
    if (valid) setCorrect((n) => n + 1);
    setFeedback({ correct: valid, detail });
  }
  function next() {
    if (mode === "practice" && attempted >= 5) {
      finish();
      return;
    }
    judged.current = false;
    setFeedback(null);
    setNumber((n) => n + 1);
    setRound(
      makeCognitiveRound(game.id, difficulty, seed.current + number * 7919),
    );
  }
  return (
    <>
      <Link href="/cognitive" className="back-link">
        ← All cognitive games
      </Link>
      <Heading
        eyebrow={game.skill.toUpperCase()}
        title={game.title}
        description={game.description}
      />
      {phase === "setup" && (
        <div className="cg-setup">
          <section className="panel">
            <h2>How to play</h2>
            <p>{game.rules}</p>
            <div className="cg-rule-note">
              <strong>Practice first. Add pressure when ready.</strong>
              <p>
                Practice mode has five puzzles and no deadline. Timed mode lasts
                three minutes, including instructions between puzzles. An
                unfinished puzzle at timeout counts as an unsuccessful attempt.
              </p>
            </div>
            <p className="small-text">
              Your score is correct puzzles / attempted puzzles.{" "}
              {game.id === "motion"
                ? "A completed board counts as one puzzle; individual moves are not scored as answers."
                : "Each submitted or skipped puzzle counts once."}{" "}
              No official hiring cutoff is implied.
            </p>
          </section>
          <section className="panel">
            <h2>Set up your session</h2>
            <label className="cg-field">
              Mode
              <select
                aria-label="Mode"
                value={mode}
                onChange={(e) => setMode(e.target.value as typeof mode)}
              >
                <option value="practice">Practice · 5 puzzles · untimed</option>
                <option value="timed">Timed · 3 minutes</option>
              </select>
            </label>
            <label className="cg-field">
              Difficulty
              <select
                aria-label="Difficulty"
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as CognitiveDifficulty)
                }
              >
                <option value="easy">Easy</option>
                <option value="standard">Standard</option>
                <option value="hard">Hard</option>
              </select>
            </label>
            <Button onClick={start}>
              Start game <ArrowRight size={16} />
            </Button>
            <p className="small-text cg-spaced">
              Your result is saved when you finish or end the run. Leaving this
              page discards an unfinished run.
            </p>
          </section>
        </div>
      )}
      {phase === "playing" && round && (
        <>
          <div className="cg-session-bar">
            <span>
              Puzzle {number}
              {mode === "practice" ? " / 5" : ""} · {difficulty}
            </span>
            <strong>
              {correct}/{attempted} correct
            </strong>
            <span className="cg-clock" role="timer" aria-label="Time remaining">
              <Clock size={17} />
              {mode === "timed"
                ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`
                : "Untimed practice"}
            </span>
            <Button variant="outline" size="sm" onClick={() => finish()}>
              End run
            </Button>
          </div>
          <details className="panel cg-rules">
            <summary>Game rules</summary>
            <p>{game.rules}</p>
          </details>
          <section className="panel cg-arena">
            <GameRound
              key={number}
              game={game.id}
              round={round}
              disabled={!!feedback}
              answer={answer}
            />
          </section>
          {feedback ? (
            <section
              className={`cg-feedback ${feedback.correct ? "is-correct" : "is-wrong"}`}
              role="status"
            >
              <h2>
                {feedback.correct
                  ? "Correct. Nicely reasoned."
                  : "Review this puzzle."}
              </h2>
              {feedback.detail && <p>{feedback.detail}</p>}
              <p>{round.explanation}</p>
              <Button onClick={next}>
                {mode === "practice" && attempted >= 5
                  ? "See results"
                  : "Next puzzle"}
                <ArrowRight size={16} />
              </Button>
            </section>
          ) : (
            <Button
              variant="ghost"
              onClick={() => answer(false, "This puzzle was skipped.")}
            >
              Skip puzzle
            </Button>
          )}
        </>
      )}
      {phase === "result" && result && (
        <section className="panel cg-result">
          <CheckCircle2 size={44} />
          <h2>Session saved</h2>
          <strong className="cg-result-score">
            {result.correct}/{result.attempted}
          </strong>
          <p>
            {result.attempted
              ? Math.round((result.correct / result.attempted) * 100)
              : 0}
            % accuracy · {result.seconds} seconds · {difficulty}
          </p>
          <p>
            {result.attempted === 0
              ? "No puzzles were submitted. Start another run whenever you are ready."
              : "Review the rules and repeat the game to practise consistency. Accuracy and pace both matter; this is your personal benchmark."}
          </p>
          <div className="button-row">
            <Button onClick={start}>
              <RotateCcw size={16} />
              Play again
            </Button>
            <Button variant="outline" onClick={() => setPhase("setup")}>
              Change setup
            </Button>
            <Button asChild variant="outline">
              <Link href="/cognitive">Choose another game</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/interview">Interview preparation →</Link>
            </Button>
          </div>
        </section>
      )}
    </>
  );
}

type Answer = (correct: boolean, detail?: string) => void;
export function GameRound({
  game,
  round,
  disabled,
  answer,
}: {
  game: CognitiveGameId;
  round: CognitiveRound;
  disabled: boolean;
  answer: Answer;
}) {
  const [digits, setDigits] = useState<number[]>([]);
  if (round.kind === "grid")
    return <MemoryRound round={round} disabled={disabled} answer={answer} />;
  if (round.kind === "motion")
    return <MotionBoard round={round} disabled={disabled} answer={answer} />;
  if (round.kind === "switch")
    return (
      <>
        <h2>Which operator produces the output?</h2>
        <span className="eyebrow">INPUT ROW</span>
        <SymbolRow values={round.input} shapes={game === "shapes"} />
        {round.first && (
          <p className="cg-known">
            Known first operator: <strong>{round.first.join("")}</strong> → then
            apply your choice
          </p>
        )}
        <span className="eyebrow">OUTPUT ROW</span>
        <SymbolRow values={round.output} shapes={game === "shapes"} />
        <div className="cg-choice-grid">
          {round.options.map((option) => (
            <button
              className="cg-choice"
              disabled={disabled}
              key={option.join()}
              onClick={() => answer(option.join() === round.answer.join())}
            >
              {option.join("")}
            </button>
          ))}
        </div>
      </>
    );
  if (round.kind === "digits")
    return (
      <>
        <h2>
          Build the target: <span className="blue-text">{round.target}</span>
        </h2>
        <p>Tap every digit once. Multiplication comes first.</p>
        <div className="cg-expression">
          {round.digits.map((_, i) => (
            <span key={i}>
              <b>{digits[i] ?? "?"}</b>
              {round.operators[i] && <em>{round.operators[i]}</em>}
            </span>
          ))}
          <span>
            = <strong>{round.target}</strong>
          </span>
        </div>
        <div className="cg-digit-bank">
          {round.digits.map((digit) => (
            <button
              className="cg-choice"
              key={digit}
              disabled={disabled || digits.includes(digit)}
              onClick={() => setDigits([...digits, digit])}
            >
              {digit}
            </button>
          ))}
        </div>
        <div className="button-row">
          <Button
            variant="outline"
            disabled={disabled || !digits.length}
            onClick={() => setDigits(digits.slice(0, -1))}
          >
            Undo digit
          </Button>
          <Button
            disabled={disabled || digits.length !== round.digits.length}
            onClick={() =>
              answer(
                evaluateDigits(digits, round.operators) === round.target,
                `Your arrangement evaluates to ${evaluateDigits(digits, round.operators)}.`,
              )
            }
          >
            Check expression
          </Button>
        </div>
      </>
    );
  if (round.kind === "deductive")
    return (
      <>
        <h2>Which symbol belongs in the highlighted cell?</h2>
        <p>Each row and column contains all four symbols once.</p>
        <div className="cg-latin">
          {round.board.flatMap((row, r) =>
            row.map((cell, c) => (
              <span
                key={`${r}-${c}`}
                className={
                  r === round.row && c === round.column ? "cg-target-cell" : ""
                }
                aria-label={`Row ${r + 1}, column ${c + 1}: ${r === round.row && c === round.column ? "question mark" : cell ? names[cell - 1] : "blank"}`}
              >
                {cell
                  ? symbols[cell - 1]
                  : r === round.row && c === round.column
                    ? "?"
                    : "·"}
              </span>
            )),
          )}
        </div>
        <div className="cg-choice-grid">
          {[1, 2, 3, 4].map((value) => (
            <button
              className="cg-choice cg-shape-choice"
              aria-label={names[value - 1]}
              disabled={disabled}
              key={value}
              onClick={() => answer(value === round.answer)}
            >
              {symbols[value - 1]}
            </button>
          ))}
        </div>
      </>
    );
  return (
    <>
      <h2>What comes next?</h2>
      <p>Track the arrow direction and the number of dots.</p>
      <div className="cg-sequence">
        {round.frames.map((figure, i) => (
          <FigureView key={i} figure={figure} />
        ))}
        <span className="cg-next-figure">?</span>
      </div>
      <div className="cg-choice-grid">
        {round.options.map((figure, i) => (
          <button
            className="cg-choice"
            aria-label={`Option ${i + 1}: ${["up", "right", "down", "left"][figure.direction]} arrow, ${figure.dots} dots`}
            disabled={disabled}
            key={i}
            onClick={() =>
              answer(
                figure.direction === round.answer.direction &&
                  figure.dots === round.answer.dots,
              )
            }
          >
            <FigureView figure={figure} />
          </button>
        ))}
      </div>
    </>
  );
}

function MemoryRound({
  round,
  disabled,
  answer,
}: {
  round: GridRound;
  disabled: boolean;
  answer: Answer;
}) {
  const [stage, setStage] = useState<"ready" | "watch" | "symmetry" | "recall">(
      "ready",
    ),
    [flash, setFlash] = useState(-1),
    [chosen, setChosen] = useState<number[]>([]),
    [mirror, setMirror] = useState<boolean | null>(null);
  useEffect(() => {
    if (stage !== "watch" || disabled) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    round.sequence.forEach((cell, i) => {
      timers.push(setTimeout(() => setFlash(cell), i * 1200));
      timers.push(setTimeout(() => setFlash(-1), i * 1200 + 850));
    });
    timers.push(
      setTimeout(() => setStage("symmetry"), round.sequence.length * 1200),
    );
    return () => timers.forEach(clearTimeout);
  }, [stage, round, disabled]);
  return (
    <>
      <h2>
        {stage === "ready"
          ? "Remember the lit cells."
          : stage === "watch"
            ? "Watch the sequence."
            : stage === "symmetry"
              ? "Are these left-to-right mirrors?"
              : "Recall the cells in order."}
      </h2>
      <p aria-live="polite">
        {stage === "watch"
          ? flash >= 0
            ? `Lit cell: row ${Math.floor(flash / 4) + 1}, column ${(flash % 4) + 1}`
            : "Hold the sequence in memory."
          : stage === "recall"
            ? `${chosen.length} of ${round.sequence.length} cells selected.`
            : `Remember ${round.sequence.length} cells, then complete both tasks.`}
      </p>
      {stage === "symmetry" ? (
        <>
          <div className="cg-mirror-pair">
            <MirrorPattern cells={round.left} label="Pattern A" />
            <span>↔</span>
            <MirrorPattern cells={round.right} label="Pattern B" />
          </div>
          <div className="button-row">
            <Button
              disabled={disabled}
              onClick={() => {
                setMirror(true);
                setStage("recall");
              }}
            >
              Yes, mirrored
            </Button>
            <Button
              disabled={disabled}
              variant="outline"
              onClick={() => {
                setMirror(false);
                setStage("recall");
              }}
            >
              No, different
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="cg-memory-grid">
            {Array.from({ length: 16 }, (_, cell) => (
              <button
                key={cell}
                className={`${flash === cell ? "lit" : ""} ${chosen.includes(cell) ? "remembered" : ""}`}
                aria-label={`Row ${Math.floor(cell / 4) + 1}, column ${(cell % 4) + 1}`}
                disabled={
                  disabled ||
                  stage !== "recall" ||
                  chosen.includes(cell) ||
                  chosen.length >= round.sequence.length
                }
                onClick={() => setChosen([...chosen, cell])}
              >
                {stage === "recall" && chosen.includes(cell)
                  ? chosen.indexOf(cell) + 1
                  : flash === cell
                    ? "●"
                    : ""}
              </button>
            ))}
          </div>
          {stage === "ready" && (
            <Button disabled={disabled} onClick={() => setStage("watch")}>
              Start sequence
            </Button>
          )}
          {stage === "recall" && (
            <div className="button-row">
              <Button
                variant="outline"
                disabled={disabled || !chosen.length}
                onClick={() => setChosen(chosen.slice(0, -1))}
              >
                Undo cell
              </Button>
              <Button
                disabled={disabled || chosen.length !== round.sequence.length}
                onClick={() =>
                  answer(
                    mirror === round.symmetric &&
                      chosen.join() === round.sequence.join(),
                    `Mirror judgment: ${mirror === round.symmetric ? "correct" : "incorrect"}. Recall: ${chosen.join() === round.sequence.join() ? "correct" : "incorrect"}.`,
                  )
                }
              >
                Submit recall
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}

function MotionBoard({
  round,
  disabled,
  answer,
}: {
  round: MotionRound;
  disabled: boolean;
  answer: Answer;
}) {
  const [blocks, setBlocks] = useState(round.blocks),
    [selected, setSelected] = useState("A"),
    [moves, setMoves] = useState(0);
  const block = blocks.find((b) => b.id === selected)!;
  function move(delta: number) {
    if (disabled) return;
    const next = moveBlock(blocks, selected, delta);
    if (!next) return;
    setBlocks(next);
    setMoves((n) => n + 1);
    if (motionSolved(next))
      answer(true, `Exit cleared in ${moves + 1} single-cell moves.`);
  }
  return (
    <>
      <h2>Clear the exit for block A.</h2>
      <p>
        Select a block, then move it along its marked axis. Moves:{" "}
        <strong>{moves}</strong>.
      </p>
      <div className="cg-motion-wrap">
        <div className="cg-motion-board">
          {blocks.map((b) => (
            <button
              key={b.id}
              aria-label={`Block ${b.id}, ${b.axis === "h" ? "horizontal" : "vertical"}`}
              aria-pressed={selected === b.id}
              disabled={disabled}
              className={`cg-block ${b.id === "A" ? "cg-exit-block" : ""} ${selected === b.id ? "selected" : ""}`}
              style={{
                gridRow: `${b.row + 1} / span ${b.axis === "v" ? b.length : 1}`,
                gridColumn: `${b.column + 1} / span ${b.axis === "h" ? b.length : 1}`,
              }}
              onClick={() => setSelected(b.id)}
            >
              {b.id}
              <small>{b.axis === "h" ? "↔" : "↕"}</small>
            </button>
          ))}
        </div>
        <span
          className="cg-exit-marker"
          style={{
            top: `${((blocks.find((b) => b.id === "A")!.row + 0.5) / 6) * 100}%`,
          }}
        >
          EXIT →
        </span>
      </div>
      <p>
        Selected: <strong>block {selected}</strong> ·{" "}
        {block.axis === "h" ? "horizontal" : "vertical"}
      </p>
      <div className="button-row">
        <Button
          disabled={disabled || !moveBlock(blocks, selected, -1)}
          onClick={() => move(-1)}
        >
          {block.axis === "h" ? "Move left" : "Move up"}
        </Button>
        <Button
          disabled={disabled || !moveBlock(blocks, selected, 1)}
          onClick={() => move(1)}
        >
          {block.axis === "h" ? "Move right" : "Move down"}
        </Button>
        <Button
          variant="outline"
          disabled={disabled}
          onClick={() => {
            setBlocks(round.blocks);
            setSelected("A");
            setMoves(0);
          }}
        >
          Reset board
        </Button>
      </div>
    </>
  );
}
