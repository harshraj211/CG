"use client";
import { useMemo, useRef } from "react";
import {
  COGNITIVE_GAMES,
  COGNITIVE_GAME_IDS,
  makeCognitiveRound,
} from "@/lib/cognitive";
import { GameRound } from "./cognitive-games";
import { Button } from "@/components/ui/button";
import type { MockAttempt } from "@/types";

export function MockCognitive({
  attempt,
  record,
  complete,
}: {
  attempt: MockAttempt;
  record: (answers: boolean[]) => void;
  complete: (score: number) => void;
}) {
  const answers = attempt.cognitiveAnswers ?? [];
  const index = answers.length;
  const game = COGNITIVE_GAMES.find((g) => g.id === COGNITIVE_GAME_IDS[index]);
  // A separate deterministic assessment namespace keeps puzzles stable on rerender.
  const round = useMemo(
    () =>
      index < 7
        ? makeCognitiveRound(
            COGNITIVE_GAME_IDS[index],
            "hard",
            0x6f100000 + (attempt.finalSet ?? 1) * 104729 + index * 7919,
          )
        : null,
    [attempt.finalSet, index],
  );
  const submittedIndex = useRef(-1);
  function answer(correct: boolean) {
    if (submittedIndex.current === index || index >= 7) return;
    submittedIndex.current = index;
    const next = [...answers, correct];
    record(next);
    if (next.length === 7)
      complete(Math.round((next.filter(Boolean).length / 7) * 100));
  }
  if (!game || !round) return null;
  return (
    <section className="mock-cognitive cg-page">
      <div className="panel">
        <span className="eyebrow">FINAL STAGE · PUZZLE {index + 1} OF 7</span>
        <h1>{game.title}</h1>
        <p>{game.rules}</p>
        <p className="muted">
          One submission per puzzle. Answers are final. Correctness is revealed
          in the result. Reach 70% (at least 5 of 7) to qualify.
        </p>
      </div>
      <div className="panel cg-arena">
        <GameRound
          key={`${attempt.id}-${index}`}
          game={game.id}
          round={round}
          disabled={false}
          answer={answer}
        />
      </div>
      <Button variant="outline" onClick={() => answer(false)}>
        Skip this puzzle (scores zero)
      </Button>
    </section>
  );
}
