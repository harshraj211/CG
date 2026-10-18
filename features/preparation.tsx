"use client";
import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  Check,
  Database,
  Search,
  Sparkles,
} from "lucide-react";
import { lessons, mcqs } from "@/data";
import { useProgress } from "@/hooks/progress";
import {
  Heading,
  BookmarkButton,
  AttachedNote,
  Bar,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
export function Preparation({ id }: { id?: string }) {
  const { progress, update } = useProgress();
  const lesson = lessons.find((l) => l.id === id);
  if (!lesson)
    return (
      <>
        <Heading
          eyebrow="LEARN WITH INTENTION"
          title="Your technical foundation."
          description="Clear concepts, practical examples, common traps, and revision notes — built for assessment preparation."
        />
        <div className="module-grid">
          {lessons.map((l, i) => (
            <section className="panel module-card" key={l.id}>
              <div className="module-top">
                <div className="daily-icon">
                  <BookOpen size={20} />
                </div>
                <BookmarkButton id={"lesson-" + l.id} />
              </div>
              <small className="eyebrow">
                MODULE {String(i + 1).padStart(2, "0")}
              </small>
              <h3>{l.title}</h3>
              <p>{l.summary}</p>
              <span className="muted small-text">
                {l.concepts.length} concepts ·{" "}
                {progress.lessons[l.id]?.status ?? "Not Started"}
              </span>
              <Bar
                value={
                  progress.lessons[l.id]?.status === "Completed"
                    ? 100
                    : progress.lessons[l.id]
                      ? 30
                      : 0
                }
              />
              <Link className="text-link" href={"/preparation/" + l.id}>
                Explore module
                <ArrowRight size={16} />
              </Link>
            </section>
          ))}
        </div>
      </>
    );
  const relevant = mcqs.filter((q) =>
    lesson.id === "rag"
      ? q.tags.some((t) =>
          [
            "rag",
            "chunking",
            "semantic-splitting",
            "recursive-splitting",
            "top-k-retrieval",
            "retriever",
            "reranking",
            "metadata-filtering",
            "hybrid-search",
            "rag-evaluation",
            "grounded-generation",
            "embedding-consistency",
            "index-freshness",
            "retrieval-access-control",
          ].includes(t),
        )
      : q.topic === lesson.title ||
        q.topic ===
          lesson.title
            .replace("Operating Systems", "OS")
            .replace("Computer Networks", "CN") ||
        (["generative-ai", "prompt-engineering"].includes(lesson.id) &&
          q.topic === "AI Literacy"),
  );
  return (
    <>
      <Link className="back-link" href="/preparation">
        ← All modules
      </Link>
      <Heading
        eyebrow="PREPARATION MODULE"
        title={lesson.title}
        description={lesson.summary}
        action={<BookmarkButton id={"lesson-" + lesson.id} />}
      />
      <div className="lesson-toolbar">
        <span className="tag blue">
          {lesson.concepts.length} IMPORTANT CONCEPTS
        </span>
        <div className="button-row">
          {["Learning", "Completed", "Revision Needed"].map((status) => (
            <Button
              key={status}
              variant={
                progress.lessons[lesson.id]?.status === status
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() =>
                update((p) => ({
                  ...p,
                  lessons: {
                    ...p.lessons,
                    [lesson.id]: {
                      status: status as
                        "Learning" | "Completed" | "Revision Needed",
                    },
                  },
                }))
              }
            >
              {status === "Completed" && <Check size={14} />} {status}
            </Button>
          ))}
        </div>
      </div>
      {lesson.id === "rag" && (
        <section className="panel rag-panel">
          <div className="eyebrow">FROM QUESTION TO GROUNDED ANSWER</div>
          <h3>The RAG pipeline</h3>
          <p>
            Retrieve external evidence at request time. Keep the retrieval index
            current and enforce access control before evidence reaches the
            model.
          </p>
          <div className="rag-flow">
            {[
              ["User query", Search],
              ["Embedding", Sparkles],
              ["Vector database", Database],
              ["Relevant chunks", BookOpen],
              ["Prompt + context", BookOpen],
              ["LLM", Sparkles],
              ["Answer", Check],
            ].map(([label, Icon], i) => {
              const I = Icon as typeof Search;
              return (
                <div key={String(label)}>
                  <span>
                    <I size={18} />
                    {String(label)}
                  </span>
                  {i < 6 && <ArrowRight size={17} />}
                </div>
              );
            })}
          </div>
          <div className="callout">
            RAG can reduce unsupported answers; it does not guarantee factual
            correctness. Evaluate retrieval recall, evidence relevance, and
            answer faithfulness separately. 36 RAG/GenAI-focused questions are
            included in the AI bank.
          </div>
        </section>
      )}
      <div className="learning-layout">
        <div>
          <section className="panel">
            <div className="eyebrow">UNDERSTAND & APPLY</div>
            <h3>Important & frequently tested concepts</h3>
            <div className="concept-list">
              {lesson.concepts.map((c, i) => (
                <details key={c.name} open={i === 0}>
                  <summary>
                    <span className="concept-index">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {c.name}
                  </summary>
                  <div className="concept-content">
                    <p>{c.explanation}.</p>
                    <div className="example">
                      <strong>Example</strong>
                      <p>{c.example}.</p>
                    </div>
                    <div className="trap">
                      <strong>Common trap</strong>
                      <p>Incorrect: {c.trap}.</p>
                    </div>
                    <BookmarkButton id={"note-" + lesson.id + "-" + i} />
                    <AttachedNote id={"note-" + lesson.id + "-" + i} />
                  </div>
                </details>
              ))}
            </div>
          </section>
          <section className="panel">
            <h3>Interview-style questions</h3>
            {lesson.interview.map((q) => (
              <p key={q} className="interview-prompt">
                {q}
              </p>
            ))}
            <Button asChild variant="outline">
              <Link href="/interview">
                Practice your responses
                <ArrowRight size={15} />
              </Link>
            </Button>
          </section>
        </div>
        <aside className="learning-aside">
          <section className="panel">
            <h3>Quick cheat sheet</h3>
            {lesson.cheatSheet.map((t) => (
              <p className="cheat-item" key={t}>
                {t}
              </p>
            ))}
          </section>
          <section className="panel">
            <h3>Test your understanding</h3>
            <p>
              {relevant.length || 100} related assessment questions. Put these
              concepts to work.
            </p>
            <Button asChild>
              <Link href={"/practice/" + (relevant[0]?.id ?? "ai")}>
                Start practice
                <ArrowRight size={15} />
              </Link>
            </Button>
          </section>
          <section className="panel">
            <h3>Revision notes</h3>
            <p>
              Before closing this module, explain one concept aloud and write a
              counterexample to a common misconception.
            </p>
            <AttachedNote id={"lesson-" + lesson.id} />
          </section>
        </aside>
      </div>
    </>
  );
}
