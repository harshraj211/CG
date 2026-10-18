"use client";
import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Search,
  RotateCcw,
} from "lucide-react";
import { allQuestions, mcqs, reasoning, communication } from "@/data";
import type { MCQQuestion } from "@/types";
import { shuffle, today } from "@/lib/assessment";
import { useProgress } from "@/hooks/progress";
import {
  Heading,
  BookmarkButton,
  AttachedNote,
  Empty,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  QuestionContext,
  AnswerExplanation,
} from "@/components/question-content";
export function Practice({ filter }: { filter?: string }) {
  const { progress } = useProgress();
  const [topic, setTopic] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [index, setIndex] = useState(0);
  const direct = allQuestions.find((q) => q.id === filter);
  const base = direct
    ? [
        direct,
        ...allQuestions.filter(
          (q) => q.topic === direct.topic && q.id !== direct.id,
        ),
      ]
    : filter === "ai"
      ? mcqs.filter((q) => q.topic === "AI Literacy")
      : filter === "technical"
        ? mcqs.filter((q) => q.topic !== "AI Literacy")
        : filter === "reasoning"
          ? reasoning
          : filter === "communication"
            ? communication
            : filter === "revision"
              ? allQuestions.filter(
                  (q) =>
                    progress.answers[q.id] &&
                    (!progress.answers[q.id].correct ||
                      progress.answers[q.id].due <= today()),
                )
              : filter && allQuestions.some((q) => q.topic === filter)
                ? allQuestions.filter((q) => q.topic === filter)
                : mcqs;
  const questions = base.filter(
    (q) =>
      (topic === "all" || q.topic === topic) &&
      (difficulty === "all" || q.difficulty === difficulty) &&
      (status === "all" ||
        (status === "incorrect" &&
          !progress.answers[q.id]?.correct &&
          !!progress.answers[q.id]) ||
        (status === "bookmarked" && progress.bookmarks.includes(q.id))) &&
      `${q.question} ${q.context ?? ""} ${q.tags.join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const selected = questions[index % Math.max(questions.length, 1)];
  return (
    <>
      <Heading
        eyebrow="PRACTICE MAKES PROGRESS"
        title={
          filter === "revision"
            ? "Your revision queue."
            : filter === "reasoning"
              ? "Think clearly. Find the pattern."
              : "Build your assessment accuracy."
        }
        description={
          filter === "revision"
            ? "Wrong answers return today, then after 1, 3 and 7 days as you improve."
            : "Understand why an answer is right. Learn from every attempt."
        }
      />
      <div className="filter-bar">
        <div className="input-icon">
          <Search size={16} />
          <input
            aria-label="Search questions"
            value={search}
            placeholder="Search questions or concepts"
            onChange={(e) => {
              setSearch(e.target.value);
              setIndex(0);
            }}
          />
        </div>
        <select
          aria-label="Topic"
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            setIndex(0);
          }}
        >
          <option value="all">All topics</option>
          {[...new Set(base.map((q) => q.topic))].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select
          aria-label="Difficulty"
          value={difficulty}
          onChange={(e) => {
            setDifficulty(e.target.value);
            setIndex(0);
          }}
        >
          <option value="all">All difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
        </select>
        <select
          aria-label="Practice status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setIndex(0);
          }}
        >
          <option value="all">All questions</option>
          <option value="incorrect">Incorrect before</option>
          <option value="bookmarked">Bookmarked</option>
        </select>
      </div>
      <div className="practice-layout">
        <div>
          {selected ? (
            <MCQCard
              key={selected.id}
              question={selected}
              number={index + 1}
              total={questions.length}
              onNext={() => setIndex(index + 1)}
            />
          ) : (
            <section className="panel">
              <Empty
                title="No questions match"
                description="Try another filter, or finish a question to build your revision queue."
              />
            </section>
          )}
        </div>
        <aside>
          <section className="panel">
            <h3>Practice overview</h3>
            <div className="mini-stats">
              <span>
                Questions available<strong>{questions.length}</strong>
              </span>
              <span>
                Attempted
                <strong>
                  {base.filter((q) => progress.answers[q.id]).length}
                </strong>
              </span>
              <span>
                Correct
                <strong>
                  {base.filter((q) => progress.answers[q.id]?.correct).length}
                </strong>
              </span>
            </div>
            <p className="muted small-text">
              Your latest answer determines topic accuracy. Repeat attempts
              remain counted in your history.
            </p>
          </section>
          <section className="panel">
            <h3>Question navigator</h3>
            <div className="question-palette">
              {questions.slice(0, 100).map((q, i) => (
                <button
                  key={q.id}
                  className={`${selected?.id === q.id ? "current" : ""} ${progress.answers[q.id] ? (progress.answers[q.id].correct ? "answered" : "incorrect") : ""}`}
                  aria-label={"Go to question " + (i + 1)}
                  onClick={() => setIndex(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </section>
          <Link href="/analytics" className="text-link">
            See your topic performance
            <ArrowRight size={15} />
          </Link>
        </aside>
      </div>
    </>
  );
}
export function MCQCard({
  question: q,
  number,
  total,
  onNext,
}: {
  question: MCQQuestion;
  number?: number;
  total?: number;
  onNext?: () => void;
}) {
  const { answer } = useProgress();
  const order = useMemo(() => shuffle(q.options.map((_, i) => i)), [q]);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const start = useRef(0);
  useEffect(() => {
    start.current = Date.now();
  }, []);
  function submit() {
    if (selected === null) return;
    answer(q, selected, Math.round((Date.now() - start.current) / 1000));
    setSubmitted(true);
  }
  return (
    <section className="panel question-card">
      <div className="question-meta">
        <span className="tag blue">{q.topic}</span>
        <span className="tag neutral">{q.difficulty}</span>
        <span className="muted small-text">
          {number && `Question ${number} of ${total}`}
        </span>
        <BookmarkButton id={q.id} />
      </div>
      <h2>{q.question}</h2>
      <QuestionContext question={q} />
      <fieldset className="answer-options">
        <legend className="sr-only">Select an answer</legend>
        {order.map((option, i) => (
          <label
            className={`answer-option ${selected === option ? "selected" : ""} ${submitted && option === q.correctAnswer ? "correct" : ""} ${submitted && selected === option && option !== q.correctAnswer ? "wrong" : ""}`}
            key={option}
          >
            <input
              type="radio"
              name={q.id}
              checked={selected === option}
              disabled={submitted}
              onChange={() => setSelected(option)}
            />
            <span className="option-letter">{String.fromCharCode(65 + i)}</span>
            <span>{q.options[option]}</span>
            {submitted && option === q.correctAnswer && (
              <CheckCircle2 size={18} />
            )}
          </label>
        ))}
      </fieldset>
      {submitted && (
        <div
          role="status"
          className={`answer-feedback ${selected === q.correctAnswer ? "correct-feedback" : "wrong-feedback"}`}
        >
          <strong>
            {selected === q.correctAnswer ? (
              <CheckCircle2 size={18} />
            ) : (
              <XCircle size={18} />
            )}{" "}
            {selected === q.correctAnswer
              ? "Well done. You’ve got it."
              : "A useful mistake to learn from."}
          </strong>
          <AnswerExplanation question={q} selected={selected} />
          {selected !== q.correctAnswer && (
            <small>Added to your revision queue.</small>
          )}
        </div>
      )}
      <div className="question-footer">
        {!submitted ? (
          <Button onClick={submit} disabled={selected === null}>
            Check answer
            <ArrowRight size={16} />
          </Button>
        ) : (
          <>
            <Button
              onClick={
                onNext ??
                (() => {
                  setSubmitted(false);
                  setSelected(null);
                  start.current = Date.now();
                })
              }
            >
              {onNext ? "Next question" : "Try again"}
              <ArrowRight size={16} />
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setSubmitted(false);
                setSelected(null);
                start.current = Date.now();
              }}
            >
              <RotateCcw size={15} />
              Retry
            </Button>
          </>
        )}
        <span className="muted small-text">
          No negative marking in practice
        </span>
      </div>
      <AttachedNote id={q.id} />
    </section>
  );
}
