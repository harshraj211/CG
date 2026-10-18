"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  Flag,
  ShieldCheck,
  ClipboardCheck,
  LockKeyhole,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import {
  assessmentQuestions as allQuestions,
  mocks,
  assessmentDebugging as debugging,
  assessmentAiCoding as aiCoding,
  assessmentCoding,
} from "@/data";
import type { MockAttempt } from "@/types";
import { useProgress } from "@/hooks/progress";
import {
  advanceMock,
  createMock,
  scoreQuestions,
  mockStages,
  endMockForIntegrity,
} from "@/lib/assessment";
import {
  enterExamFullscreen,
  leaveExamFullscreen,
  watchExamIntegrity,
} from "@/lib/exam-integrity";
import { COGNITIVE_GAMES } from "@/lib/cognitive";
import { MockCognitive } from "./mock-cognitive";
import { Heading, disclaimer, Bar } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ProblemWorkspace } from "./coding";
import { AICoach } from "./ai-coding";
import {
  QuestionContext,
  AnswerExplanation,
} from "@/components/question-content";
import { ReadingControls } from "@/components/reading-controls";
export function MockTests() {
  const { progress, saveMock } = useProgress();
  const [viewed, setViewed] = useState<MockAttempt | null>(null);
  const [startError, setStartError] = useState("");
  const [starting, setStarting] = useState(false);
  if (progress.activeMock)
    return (
      <MockExam
        key={progress.activeMock.id}
        attempt={progress.activeMock}
        finish={setViewed}
      />
    );
  if (viewed)
    return <MockResult attempt={viewed} back={() => setViewed(null)} />;
  return (
    <>
      <Heading
        eyebrow="REHEARSE THE REAL PRESSURE"
        title="Practice the process. Own the moment."
        description="Five fresh Final Exceller papers with reserved questions, plus six practice blueprints. New final papers include all five stages and a fullscreen exam mode."
      />
      <div className="benchmark-banner">
        <ShieldCheck size={20} />
        <div>
          <strong>
            SIMULATED PRACTICE THRESHOLD — NOT OFFICIAL CAPGEMINI CUTOFF
          </strong>
          <p>
            {disclaimer} Your MCQ benchmark is {progress.settings.threshold}%.
            Debugging and coding require 70% tests. AI coding requires an
            adequate approach and 70% tests. Final cognitive stage: 5 of 7
            puzzles correct.
          </p>
        </div>
        <Link className="text-link" href="/settings">
          Change benchmark
          <ArrowRight size={15} />
        </Link>
      </div>
      <section className="panel cg-mock-link">
        <div>
          <h2>Prepare for the game-based round too.</h2>
          <p>
            Play seven cognitive games with their own practice and timed
            sessions. Fresh final papers below include these seven game types as
            their last stage. Older blueprints use separate reasoning MCQs.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/cognitive">
            Open cognitive games <ArrowRight size={16} />
          </Link>
        </Button>
      </section>
      <section className="panel final-exam-rules">
        <h2>Five fresh final papers · exam rules</h2>
        <p>
          Each paper has 30 new MCQs (10 AI + 20 technical), one debugging task,
          one coding task, one AI coding task and seven cognitive puzzles.
          Questions and programming tasks are reserved for these papers and do
          not overlap across the five sets.
        </p>
        <p>
          Stage limits: 40 + 20 + 30 + 30 + 14 minutes (up to 134 minutes). Each
          stage unlocks after you meet its practice benchmark. Readable Python
          debugging code is provided.
        </p>
        <p>
          <strong>
            Start enters fullscreen. The first tab switch, window focus loss,
            fullscreen exit or page departure ends the attempt.
          </strong>{" "}
          There is no pause or save-and-leave in this mode. Browser controls
          cannot physically prevent switching apps; this mode detects it and
          ends the test.
        </p>
        <p className="muted">
          Each set is new on your first attempt. Retakes reuse that paper. These
          are independent practice simulations, not official exam papers or
          official proctoring.
        </p>
      </section>
      {startError && (
        <p className="error-feedback" role="alert">
          {startError}
        </p>
      )}
      <div className="module-grid mock-grid">
        {[
          ...mocks.filter((m) => m.finalSet),
          ...mocks.filter((m) => !m.finalSet),
        ].map((m, i) => (
          <section className="panel mock-card" key={m.id}>
            <div className="module-top">
              <span className="eyebrow">
                {m.finalSet
                  ? `RESERVED PAPER ${m.finalSet} · FULLSCREEN`
                  : `PRACTICE ${String(i - 4).padStart(2, "0")}`}
              </span>
              <span className="daily-icon">
                <ClipboardCheck size={21} />
              </span>
            </div>
            <h3>{m.title}</h3>
            <p>{m.description}</p>
            <div className="mock-specs">
              <span>
                <Clock size={14} />
                {m.minutes} min MCQ stage
              </span>
              <span>{m.ai + m.technical} MCQs</span>
              <span>
                {m.finalSet
                  ? "1 debugging · 1 coding · 1 AI coding"
                  : "1 debugging · 1 AI coding"}
              </span>
              <span>
                {m.finalSet
                  ? "7 cognitive puzzles · final stage"
                  : m.reasoning
                    ? `${m.reasoning} reasoning MCQs`
                    : "No reasoning MCQs"}
              </span>
            </div>
            <div className="mock-stages">
              <span>MCQ</span>
              <ArrowRight size={12} />
              <LockKeyhole size={12} />
              <span>Debug</span>
              {m.finalSet && (
                <>
                  <ArrowRight size={12} />
                  <span>Code</span>
                </>
              )}
              <ArrowRight size={12} />
              <LockKeyhole size={12} />
              <span>AI</span>
              {m.finalSet && (
                <>
                  <ArrowRight size={12} />
                  <span>Cognitive</span>
                </>
              )}
              {m.reasoning > 0 && (
                <>
                  <ArrowRight size={12} />
                  <span>Reasoning</span>
                </>
              )}
            </div>
            <Button
              disabled={starting}
              onClick={async () => {
                setStartError("");
                setStarting(true);
                try {
                  if (m.finalSet) await enterExamFullscreen();
                  saveMock(
                    createMock(
                      m,
                      progress.settings.threshold,
                      progress.mocks.filter((a) => a.blueprint === m.id).at(-1),
                    ),
                  );
                } catch (error) {
                  setStartError(
                    error instanceof Error
                      ? error.message
                      : "The assessment could not start.",
                  );
                } finally {
                  setStarting(false);
                }
              }}
            >
              {m.finalSet
                ? progress.mocks.some((a) => a.blueprint === m.id)
                  ? "Retake this paper · fullscreen"
                  : "Start fresh paper · fullscreen"
                : "Start assessment"}
              <ArrowRight size={15} />
            </Button>
            <small className="muted">
              {progress.mocks.filter((a) => a.blueprint === m.id).length}{" "}
              previous attempts
            </small>
          </section>
        ))}
      </div>
      {progress.mocks.length > 0 && (
        <section className="panel">
          <h3>Assessment history</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Assessment</th>
                  <th>Date</th>
                  <th>MCQ score</th>
                  <th>Simulated status</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {[...progress.mocks].reverse().map((a) => (
                  <tr key={a.id}>
                    <td>{mocks.find((m) => m.id === a.blueprint)?.title}</td>
                    <td>
                      {new Date(
                        a.completedAt ?? a.startedAt,
                      ).toLocaleDateString()}
                    </td>
                    <td>{a.scores.mcq ?? 0}%</td>
                    <td>
                      <span
                        className={`tag ${a.qualified ? "green" : "amber"}`}
                      >
                        {a.qualified ? "Practice qualified" : "Needs practice"}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewed(a)}
                      >
                        View result
                        <ArrowRight size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
function MockExam({
  attempt: a,
  finish,
}: {
  attempt: MockAttempt;
  finish: (a: MockAttempt) => void;
}) {
  const { saveMock, answer } = useProgress();
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const [confirm, setConfirm] = useState(false);
  const [exit, setExit] = useState(false);
  const submitted = useRef(false);
  const currentAttempt = useRef(a);
  useEffect(() => {
    currentAttempt.current = a;
  }, [a]);
  const ids = a.stage === "reasoning" ? a.reasoning : a.questions;
  const q = allQuestions.find((q) => q.id === ids[a.current]);
  const remaining = Math.max(0, Math.ceil((a.deadline - now) / 1000));
  const stages = mockStages(a);
  const stageNumber = stages.indexOf(a.stage) + 1;
  function endForViolation(reason: string) {
    const current = currentAttempt.current;
    if (current.stage === "result") return;
    submitted.current = true;
    const ended = endMockForIntegrity(current, reason);
    currentAttempt.current = ended;
    saveMock(ended);
    finish(ended);
    leaveExamFullscreen();
  }
  const violationRef = useRef(endForViolation);
  useEffect(() => {
    violationRef.current = endForViolation;
  });
  useEffect(() => {
    if (a.finalSet)
      return watchExamIntegrity((reason) => violationRef.current(reason));
  }, [a.finalSet]);
  function submitStage(score?: number) {
    const current = currentAttempt.current;
    if (submitted.current || current.stage === "result") return;
    submitted.current = true;
    let stageScore = Date.now() > current.deadline ? 0 : (score ?? 0);
    if (current.stage === "mcq" || current.stage === "reasoning") {
      const stageIds =
        current.stage === "mcq" ? current.questions : current.reasoning;
      stageScore =
        current.stage === "reasoning"
          ? stageIds.every((id) => current.answers[id] !== undefined)
            ? 100
            : 0
          : scoreQuestions(stageIds, current.answers);
      const perQuestion = Math.round(
        (Date.now() - current.stageStartedAt) /
          1000 /
          Math.max(stageIds.length, 1),
      );
      for (const id of stageIds) {
        const question = allQuestions.find((q) => q.id === id);
        if (!current.finalSet && question && current.answers[id] !== undefined)
          answer(question, current.answers[id], perQuestion);
      }
    }
    if (current.stage === "cognitive") {
      stageScore = Math.round(
        ((current.cognitiveAnswers ?? []).filter(Boolean).length / 7) * 100,
      );
    }
    const next = advanceMock(current, stageScore);
    currentAttempt.current = next;
    saveMock(next);
    setConfirm(false);
    if (next.stage === "result") {
      finish(next);
      if (current.finalSet) leaveExamFullscreen();
    }
    setTimeout(() => {
      submitted.current = false;
    }, 0);
  }
  const submitRef = useRef(submitStage);
  useEffect(() => {
    submitRef.current = submitStage;
  });
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= currentAttempt.current.deadline && !submitted.current)
        submitRef.current(0);
    }, 1000);
    const leave = (e: BeforeUnloadEvent) => {
      if (!currentAttempt.current.finalSet) e.preventDefault();
    };
    window.addEventListener("beforeunload", leave);
    return () => {
      clearInterval(timer);
      window.removeEventListener("beforeunload", leave);
    };
  }, []);
  const patch = (value: Partial<MockAttempt>) => {
    if (currentAttempt.current.stage === "result") return;
    const next = { ...currentAttempt.current, ...value };
    currentAttempt.current = next;
    saveMock(next);
  };
  return (
    <>
      <header className="exam-header">
        <ReadingControls />
        <div>
          <span className="brand-mark">
            <ShieldCheck size={22} />
          </span>
          <div>
            <strong>Capgemini Exceller Simulation</strong>
            <small>
              {mocks.find((m) => m.id === a.blueprint)?.title} · Practice
              assessment
            </small>
          </div>
        </div>
        <span className="tag blue">
          STAGE {stageNumber} · {a.stage.toUpperCase()}
        </span>
        <span className={`exam-timer ${remaining < 120 ? "error-text" : ""}`}>
          <Clock size={17} />
          {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
        </span>
        <Button variant="outline" size="sm" onClick={() => setExit(true)}>
          Leave assessment
        </Button>
      </header>
      <div className="exam-stage-strip">
        {stages.map((s, i) => (
          <div
            key={s}
            className={
              s === a.stage
                ? "current"
                : a.scores[s] !== undefined
                  ? "done"
                  : ""
            }
          >
            {a.scores[s] !== undefined ? (
              <CheckCircle2 size={15} />
            ) : s !== a.stage ? (
              <LockKeyhole size={14} />
            ) : (
              <span>{i + 1}</span>
            )}
            {s === "mcq"
              ? "AI + Technical"
              : s === "ai"
                ? "AI Coding"
                : s === "reasoning"
                  ? "Reasoning"
                  : s === "coding"
                    ? "Coding"
                    : s === "cognitive"
                      ? "Cognitive"
                      : "Debugging"}
          </div>
        ))}
      </div>
      {(a.stage === "mcq" || a.stage === "reasoning") && q ? (
        <div className="exam-layout">
          <section className="panel question-card">
            <div className="question-meta">
              <span className="eyebrow">
                QUESTION {a.current + 1} OF {ids.length}
              </span>
              <span className="tag neutral">{q.topic}</span>
              <Button
                variant={a.marked.includes(q.id) ? "secondary" : "ghost"}
                size="sm"
                onClick={() =>
                  patch({
                    marked: a.marked.includes(q.id)
                      ? a.marked.filter((x) => x !== q.id)
                      : [...a.marked, q.id],
                  })
                }
              >
                <Flag size={14} />
                Mark for review
              </Button>
            </div>
            <Bar
              value={
                (Object.keys(a.answers).filter((id) => ids.includes(id))
                  .length /
                  ids.length) *
                100
              }
            />
            <h2>{q.question}</h2>
            <QuestionContext question={q} />
            <fieldset className="answer-options">
              <legend className="sr-only">Select your answer</legend>
              {(a.options[q.id] ?? [0, 1, 2, 3]).map((option, i) => (
                <label
                  className={`answer-option ${a.answers[q.id] === option ? "selected" : ""}`}
                  key={option}
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={a.answers[q.id] === option}
                    onChange={() =>
                      patch({ answers: { ...a.answers, [q.id]: option } })
                    }
                  />
                  <span className="option-letter">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{q.options[option]}</span>
                </label>
              ))}
            </fieldset>
            <div className="question-footer">
              <Button
                variant="outline"
                disabled={a.current === 0}
                onClick={() => patch({ current: a.current - 1 })}
              >
                <ArrowLeft size={15} />
                Previous
              </Button>
              {a.current < ids.length - 1 ? (
                <Button onClick={() => patch({ current: a.current + 1 })}>
                  Next
                  <ArrowRight size={15} />
                </Button>
              ) : (
                <Button onClick={() => setConfirm(true)}>
                  Submit stage
                  <ArrowRight size={15} />
                </Button>
              )}
            </div>
          </section>
          <aside className="panel exam-palette">
            <h3>Question palette</h3>
            <p>
              {Object.keys(a.answers).filter((id) => ids.includes(id)).length}{" "}
              of {ids.length} answered
            </p>
            <div className="question-palette">
              {ids.map((id, i) => (
                <button
                  key={id}
                  onClick={() => patch({ current: i })}
                  className={`${a.answers[id] !== undefined ? "answered" : ""} ${a.marked.includes(id) ? "marked" : ""} ${i === a.current ? "current" : ""}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="palette-legend">
              <span>○ Unanswered</span>
              <span className="green-text">● Answered</span>
              <span>⚑ Marked</span>
              <span className="blue-text">◉ Current</span>
            </div>
            <Button onClick={() => setConfirm(true)}>Submit stage</Button>
            <p className="muted small-text">
              Answers and explanations are available only after the stage has
              been submitted. Your progress is saved on this device.
            </p>
          </aside>
        </div>
      ) : a.stage === "debugging" ? (
        <div className="exam-workspace">
          <ProblemWorkspace
            key={a.id + "-debug"}
            problem={debugging.find((p) => p.id === a.debugId)!}
            kind="debugging"
            exam
            onComplete={submitStage}
          />
        </div>
      ) : a.stage === "coding" ? (
        <div className="exam-workspace">
          <ProblemWorkspace
            key={a.id + "-code"}
            problem={assessmentCoding.find((p) => p.id === a.codingId)!}
            kind="coding"
            exam
            onComplete={submitStage}
          />
        </div>
      ) : a.stage === "cognitive" ? (
        <MockCognitive
          attempt={a}
          record={(answers) => patch({ cognitiveAnswers: answers })}
          complete={submitStage}
        />
      ) : a.stage === "ai" ? (
        <div className="exam-workspace">
          <AICoach
            key={a.id + "-ai"}
            problem={aiCoding.find((p) => p.id === a.aiId)!}
            exam
            onComplete={submitStage}
          />
        </div>
      ) : null}
      <div className="exam-disclaimer">{disclaimer}</div>
      {confirm && (
        <div className="modal-backdrop">
          <div className="modal" role="dialog" aria-modal="true">
            <h2>Submit this stage?</h2>
            <p>
              {ids.filter((id) => a.answers[id] === undefined).length} questions
              remain unanswered. Submission is final for this stage. Your next
              stage unlocks only if you meet the simulated benchmark.
            </p>
            <div className="button-row">
              <Button variant="outline" onClick={() => setConfirm(false)}>
                Keep reviewing
              </Button>
              <Button onClick={() => submitStage()}>Submit stage</Button>
            </div>
          </div>
        </div>
      )}
      {exit && (
        <div className="modal-backdrop">
          <div className="modal" role="dialog" aria-modal="true">
            <h2>Leave this assessment?</h2>
            <p>
              {a.finalSet
                ? "Leaving ends this fullscreen attempt. You can review submitted scores afterward, but cannot resume this attempt."
                : "Your current stage and answers are saved. The timer continues while you are away."}
            </p>
            <div className="button-row">
              <Button onClick={() => setExit(false)}>
                Continue assessment
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (a.finalSet)
                    endForViolation(
                      "You chose to end the fullscreen assessment.",
                    );
                  else router.push("/");
                }}
              >
                {a.finalSet ? "End attempt" : "Save & leave"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
function MockResult({
  attempt: a,
  back,
}: {
  attempt: MockAttempt;
  back: () => void;
}) {
  const { saveMock } = useProgress();
  const qs = a.questions.map((id) => allQuestions.find((q) => q.id === id)!);
  const correct = qs.filter((q) => a.answers[q.id] === q.correctAnswer).length;
  const attempted = qs.filter((q) => a.answers[q.id] !== undefined).length;
  const topicResults = [...new Set(qs.map((q) => q.topic))].map((topic) => {
    const questions = qs.filter((q) => q.topic === topic);
    return {
      topic,
      score: Math.round(
        (questions.filter((q) => a.answers[q.id] === q.correctAnswer).length /
          questions.length) *
          100,
      ),
    };
  });
  const sorted = [...topicResults].sort((a, b) => b.score - a.score);
  const overall = Math.round(
    Object.values(a.scores).reduce((s, x) => s + x, 0) /
      Math.max(Object.values(a.scores).length, 1),
  );
  return (
    <>
      <Heading
        eyebrow="CAPGEMINI EXCELLER · PRACTICE ASSESSMENT RESULT"
        title={
          a.qualified
            ? "Practice qualified. Keep building."
            : "Your next step starts here."
        }
        description="Based on your configured preparation benchmarks. This is not an official Capgemini result."
      />
      <section className="panel result-hero">
        <div>
          <span className={`tag ${a.qualified ? "green" : "amber"}`}>
            {a.qualified
              ? "PRACTICE QUALIFIED"
              : "NOT QUALIFIED · SIMULATED BENCHMARK"}
          </span>
          <h2>{mocks.find((m) => m.id === a.blueprint)?.title}</h2>
          <p>
            {a.integrityReason
              ? `Attempt ended: ${a.integrityReason}`
              : !a.qualified && a.scores.debugging === undefined
                ? "Assessment ended at Technical/AI MCQ stage."
                : a.qualified
                  ? "You completed every stage in this practice attempt."
                  : "Assessment ended before all stages were completed."}
          </p>
          <small className="muted">
            MCQ benchmark: {a.threshold}% · {disclaimer}
          </small>
        </div>
        <div className="result-score">
          <strong>{overall}%</strong>
          <small>Average of submitted stages</small>
        </div>
      </section>
      <div className="stats-grid result-stats">
        {[
          ["Technical + AI", a.scores.mcq],
          ["Debugging", a.scores.debugging],
          ...(a.finalSet ? [["Coding", a.scores.coding]] : []),
          ["AI Coding", a.scores.ai],
          ...(a.finalSet
            ? [["Cognitive", a.scores.cognitive]]
            : [
                [
                  "Reasoning MCQs",
                  a.reasoning.length ? a.scores.reasoning : undefined,
                ],
              ]),
        ].map(([label, value]) => (
          <section className="stat-card" key={String(label)}>
            <span>{label}</span>
            <strong className="stat-number">
              {value === undefined ? "Locked" : String(value) + "%"}
            </strong>
          </section>
        ))}
      </div>
      {a.finalSet && a.cognitiveAnswers && a.cognitiveAnswers.length > 0 && (
        <section className="panel">
          <h3>Cognitive puzzle results</h3>
          <p>
            {a.cognitiveAnswers.filter(Boolean).length} correct out of 7.
            Skipped or unanswered puzzles score zero.
          </p>
          {COGNITIVE_GAMES.map((game, i) => (
            <p key={game.id}>
              {game.title}:{" "}
              <strong>
                {a.cognitiveAnswers?.[i] === undefined
                  ? "Unanswered"
                  : a.cognitiveAnswers[i]
                    ? "Correct"
                    : "Incorrect / skipped"}
              </strong>
            </p>
          ))}
        </section>
      )}
      <div className="bank-summary">
        <span>
          Correct <strong>{correct}</strong>
        </span>
        <span>
          Incorrect <strong>{attempted - correct}</strong>
        </span>
        <span>
          Unattempted <strong>{qs.length - attempted}</strong>
        </span>
        <span>
          Accuracy{" "}
          <strong>
            {attempted ? Math.round((correct / attempted) * 100) : 0}%
          </strong>
        </span>
        <span>
          Time / question{" "}
          <strong>
            {Math.round(
              (a.stageSeconds?.mcq ??
                ((a.completedAt ?? a.stageStartedAt) - a.startedAt) / 1000) /
                Math.max(qs.length, 1),
            )}
            s
          </strong>
        </span>
      </div>
      <div className="dashboard-columns">
        <section className="panel">
          <h3>Top strengths</h3>
          {sorted.slice(0, 3).map((t) => (
            <p key={t.topic}>
              {t.topic}
              <strong className="float-right">{t.score}%</strong>
            </p>
          ))}
          <h3>Priority revision</h3>
          {sorted
            .slice(-3)
            .reverse()
            .map((t) => (
              <p key={t.topic}>
                <Link className="text-link" href={"/practice/" + t.topic}>
                  {t.topic} · {t.score}%<ArrowRight size={14} />
                </Link>
              </p>
            ))}
        </section>
        <section className="panel">
          <h3>Topic breakdown</h3>
          {topicResults.map((t) => (
            <div className="topic-bar" key={t.topic}>
              <div>
                <span>{t.topic}</span>
                <strong>{t.score}%</strong>
              </div>
              <Bar value={t.score} />
            </div>
          ))}
        </section>
      </div>
      <section className="panel">
        <h3>Incorrect answers & recommended next practice</h3>
        {qs
          .filter((q) => a.answers[q.id] !== q.correctAnswer)
          .map((q) => (
            <details className="review-question" key={q.id}>
              <summary>
                {q.question}
                <span className="tag neutral">{q.topic}</span>
              </summary>
              <p>
                Your answer:{" "}
                {a.answers[q.id] === undefined
                  ? "Unattempted"
                  : q.options[a.answers[q.id]]}
              </p>
              <p>
                <strong>Correct:</strong> {q.options[q.correctAnswer]}
              </p>
              <QuestionContext question={q} />
              <AnswerExplanation question={q} selected={a.answers[q.id]} />
              <Link
                href={
                  "/practice/" +
                  (a.finalSet
                    ? q.topic === "AI Literacy"
                      ? "ai"
                      : q.topic
                    : q.id)
                }
                className="text-link"
              >
                Review & practice
                <ArrowRight size={14} />
              </Link>
            </details>
          ))}
      </section>
      <div className="button-row">
        {!a.finalSet && (
          <Button
            onClick={() => {
              const blueprint = mocks.find((m) => m.id === a.blueprint)!;
              back();
              saveMock(createMock(blueprint, a.threshold, a));
            }}
          >
            <RotateCcw size={15} />
            Retake mock
          </Button>
        )}
        <Button variant="outline" onClick={back}>
          All assessments
        </Button>
        <Button variant="outline" asChild>
          <Link href="/analytics">See analytics</Link>
        </Button>
      </div>
    </>
  );
}
