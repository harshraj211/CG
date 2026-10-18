"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Download,
  Trash2,
  Volume2,
  Clock,
  Check,
} from "lucide-react";
import {
  allQuestions,
  allProblems,
  lessons,
  interviews,
  communication,
} from "@/data";
import { useProgress } from "@/hooks/progress";
import {
  Heading,
  BookmarkButton,
  AttachedNote,
  Empty,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { MCQCard } from "./mcq";
export function Interview({ id }: { id?: string }) {
  const { progress, update } = useProgress();
  const [topic, setTopic] = useState("all");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = interviews.filter(
    (q) =>
      (!id || q.id === id) &&
      (topic === "all" || q.topic === topic) &&
      (status === "all" || progress.interview[q.id] === status) &&
      q.question.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <Heading
        eyebrow="THE FINAL CONVERSATION"
        title="Make your experience speak for itself."
        description="Capgemini final interview preparation. 110 prompts across technical foundations, projects, AI and behavioural questions."
      />
      <div className="filter-bar">
        <div className="input-icon">
          <Search size={16} />
          <input
            aria-label="Search interview questions"
            placeholder="Search interview questions"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          aria-label="Interview section"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          <option value="all">All sections</option>
          {[...new Set(interviews.map((q) => q.topic))].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select
          aria-label="Interview status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All statuses</option>
          {["Known", "Needs Revision", "Practice Again"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="interview-list">
        {filtered.map((q) => (
          <section className="panel interview-card" key={q.id}>
            <div className="question-meta">
              <span className="tag blue">{q.topic}</span>
              <BookmarkButton id={q.id} />
            </div>
            <h3>{q.question}</h3>
            <details>
              <summary>Response guidance</summary>
              <p>{q.guide}</p>
            </details>
            <div className="button-row">
              {["Known", "Needs Revision", "Practice Again"].map((s) => (
                <Button
                  size="sm"
                  key={s}
                  variant={
                    progress.interview[q.id] === s ? "default" : "outline"
                  }
                  onClick={() =>
                    update((p) => ({
                      ...p,
                      interview: { ...p.interview, [q.id]: s },
                    }))
                  }
                >
                  {s === "Known" && <Check size={13} />} {s}
                </Button>
              ))}
            </div>
            <AttachedNote id={q.id} />
          </section>
        ))}
      </div>
      {!filtered.length && (
        <Empty
          title="No matching questions"
          description="Try another section or status."
        />
      )}
    </>
  );
}
export function Notes() {
  const { progress, update } = useProgress();
  const [search, setSearch] = useState("");
  const entries = Object.entries(progress.notes).filter(([id, n]) =>
    `${id} ${n.text}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <Heading
        eyebrow="YOUR PERSONAL PLAYBOOK"
        title="Keep what you learn."
        description="Personal revision notes, autosaved on this device. Attach notes directly inside questions, problems and learning modules."
        action={
          <Button
            onClick={() => {
              const id = "personal-" + crypto.randomUUID();
              update((p) => ({
                ...p,
                notes: {
                  ...p.notes,
                  [id]: {
                    text: "",
                    attachment: "General",
                    updatedAt: new Date().toISOString(),
                  },
                },
              }));
            }}
          >
            <Plus size={16} />
            New note
          </Button>
        }
      />
      <div className="filter-bar">
        <div className="input-icon">
          <Search size={16} />
          <input
            aria-label="Search notes"
            placeholder="Search notes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="notes-grid">
        {entries.map(([id, n]) => (
          <section className="panel note-card" key={id}>
            <div className="question-meta">
              <input
                aria-label="Note attachment"
                value={n.attachment}
                onChange={(e) => {
                  const value = e.target.value;
                  update((p) => ({
                    ...p,
                    notes: {
                      ...p.notes,
                      [id]: { ...p.notes[id], attachment: value },
                    },
                  }));
                }}
              />
              <BookmarkButton id={"note-" + id} />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete note"
                onClick={() => {
                  if (window.confirm("Delete this note?"))
                    update((p) => ({
                      ...p,
                      notes: Object.fromEntries(
                        Object.entries(p.notes).filter(([key]) => key !== id),
                      ),
                    }));
                }}
              >
                <Trash2 size={16} />
              </Button>
            </div>
            <textarea
              aria-label="Note text"
              placeholder="Write your revision note…"
              value={n.text}
              onChange={(e) => {
                const text = e.target.value;
                update((p) => ({
                  ...p,
                  notes: {
                    ...p.notes,
                    [id]: {
                      ...p.notes[id],
                      text,
                      updatedAt: new Date().toISOString(),
                    },
                  },
                }));
              }}
            />
            <small className="muted">
              Saved {new Date(n.updatedAt).toLocaleString()}
            </small>
          </section>
        ))}
      </div>
      {!entries.length && (
        <Empty
          title="Make your first note"
          description="Capture a useful pattern, an interview story, or a mistake to revisit."
        />
      )}
    </>
  );
}
export function Bookmarks() {
  const { progress } = useProgress();
  const [filter, setFilter] = useState("all");
  const items = progress.bookmarks
    .map((id) => {
      const q = allQuestions.find((q) => q.id === id);
      if (q)
        return { id, title: q.question, type: "MCQ", url: "/practice/" + id };
      const p = allProblems.find((p) => p.id === id);
      if (p)
        return {
          id,
          title: p.title,
          type: id.startsWith("debug") ? "Debugging" : "Coding",
          url: `/${id.startsWith("debug") ? "debugging" : id.startsWith("ai-") ? "ai-coding" : "coding"}/${id}`,
        };
      const i = interviews.find((i) => i.id === id);
      if (i)
        return {
          id,
          title: i.question,
          type: "Interview",
          url: "/interview/" + id,
        };
      const lesson = lessons.find((l) => "lesson-" + l.id === id);
      if (lesson)
        return {
          id,
          title: lesson.title,
          type: "Notes",
          url: "/preparation/" + lesson.id,
        };
      for (const l of lessons) {
        const index = l.concepts.findIndex(
          (_, i) => id === `note-${l.id}-${i}`,
        );
        if (index >= 0)
          return {
            id,
            title: l.concepts[index].name,
            type: "Notes",
            url: "/preparation/" + l.id,
          };
      }
      return {
        id,
        title: progress.notes[id.replace(/^note-/, "")]?.attachment ?? id,
        type: "Notes",
        url: "/notes",
      };
    })
    .filter((x) => filter === "all" || x.type === filter);
  return (
    <>
      <Heading
        eyebrow="YOUR SAVED COLLECTION"
        title="Good questions deserve another look."
        description="Keep useful concepts and challenges close. Your bookmarks follow your progress on this device."
      />
      <div className="tab-row">
        {["all", "MCQ", "Coding", "Debugging", "Interview", "Notes"].map(
          (t) => (
            <Button
              size="sm"
              key={t}
              variant={filter === t ? "default" : "outline"}
              onClick={() => setFilter(t)}
            >
              {t === "all" ? "All bookmarks" : t}
            </Button>
          ),
        )}
      </div>
      <section className="panel">
        {items.map((x) => (
          <div className="bookmark-row" key={x.id}>
            <span className="tag neutral">{x.type}</span>
            <Link href={x.url}>{x.title}</Link>
            <BookmarkButton id={x.id} />
          </div>
        ))}
        {!items.length && (
          <Empty
            title="Nothing saved yet"
            description="Use the bookmark icon on a question, problem, or learning module."
          />
        )}
      </section>
    </>
  );
}
export function SettingsPage() {
  const { progress, update, reset } = useProgress();
  const [aiConnection, setAIConnection] = useState("Checking configuration…");
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/ai/status")
      .then((r) => r.json())
      .then((d) =>
        setAIConnection(
          d.configured
            ? `Groq · ${d.model} · key configured; tested on your next request`
            : "Not configured · add GROQ_API_KEY to .env or .env.local",
        ),
      )
      .catch(() => setAIConnection("Could not check server configuration"));
  }, []);
  function setting<K extends keyof typeof progress.settings>(
    key: K,
    value: (typeof progress.settings)[K],
  ) {
    update((p) => ({ ...p, settings: { ...p.settings, [key]: value } }));
  }
  function download() {
    const blob = new Blob([JSON.stringify(progress, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exceller-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <Heading
        eyebrow="MAKE IT YOUR WORKSPACE"
        title="Preparation, on your terms."
        description="Choose your defaults, manage your progress, and configure your practice benchmarks."
      />
      <div className="settings-layout">
        <section className="panel">
          <h3>Practice preferences</h3>
          <label className="settings-row">
            <span>
              Programming language<small>Default for coding practice</small>
            </span>
            <select
              value={progress.settings.language}
              onChange={(e) => setting("language", e.target.value)}
            >
              {["Python", "JavaScript", "Java", "C++"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <label className="settings-row">
            <span>
              Practice qualification threshold
              <small>
                This is a personal preparation benchmark, not an official
                Capgemini cutoff.
              </small>
            </span>
            <select
              aria-label="Practice qualification threshold"
              value={progress.settings.threshold}
              onChange={(e) => setting("threshold", Number(e.target.value))}
            >
              {[60, 65, 70, 75, 80, 85, 90].map((t) => (
                <option value={t} key={t}>
                  {t}%
                </option>
              ))}
            </select>
          </label>
          <label className="settings-row">
            <span>
              Theme<small>Light or pure black reading surface</small>
            </span>
            <select
              aria-label="Theme"
              value={progress.settings.theme}
              onChange={(e) =>
                setting("theme", e.target.value as "light" | "dark")
              }
            >
              <option value="light">Light</option>
              <option value="dark">Pure black</option>
            </select>
          </label>
          <label className="settings-row">
            <span>
              Text size
              <small>
                Applies to learning, practice and mock assessments. Saved on
                this device.
              </small>
            </span>
            <select
              aria-label="Text size"
              value={progress.settings.textSize}
              onChange={(e) =>
                setting(
                  "textSize",
                  e.target.value as "comfortable" | "large" | "extra-large",
                )
              }
            >
              <option value="comfortable">Comfortable</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra large</option>
            </select>
          </label>
          <label className="settings-row">
            <span>
              Practice timers
              <small>
                Communication timers enabled by default. Mock timers are always
                enforced.
              </small>
            </span>
            <input
              type="checkbox"
              checked={progress.settings.timers}
              onChange={(e) => setting("timers", e.target.checked)}
            />
          </label>
          <label className="settings-row">
            <span>
              AI token budget simulation
              <small>Optional 2000-token constraint; not Groq billing</small>
            </span>
            <input
              type="checkbox"
              checked={progress.settings.tokenBudget}
              onChange={(e) => setting("tokenBudget", e.target.checked)}
            />
          </label>
        </section>
        <div>
          <section className="panel">
            <h3>Groq connection</h3>
            <div className="callout">{aiConnection}</div>
            <p>
              Copy .env.local.example to .env.local, set your key, then restart
              the server. The key stays on the server.
            </p>
            <small className="muted">
              Change the model in config/ai.ts. Configuration status does not
              validate the key.
            </small>
          </section>
          <section className="panel">
            <h3>Your data</h3>
            <p>
              No account required. Progress, attempts, bookmarks, and notes stay
              in this browser. Export a backup before clearing browser data.
            </p>
            <div className="button-row">
              <Button variant="outline" onClick={download}>
                <Download size={15} />
                Export progress
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (
                    window.confirm(
                      "Reset all preparation progress, notes, bookmarks and mock attempts on this device? This cannot be undone.",
                    )
                  )
                    reset();
                }}
              >
                <Trash2 size={15} />
                Reset progress
              </Button>
            </div>
            {error && <p className="error-text">{error}</p>}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                try {
                  localStorage.removeItem("exceller-prep-v1");
                  setError("Raw saved data cleared. Reload to start fresh.");
                } catch {
                  setError("Browser storage is not available.");
                }
              }}
            >
              Clear unreadable saved data
            </Button>
          </section>
        </div>
      </div>
    </>
  );
}
export function Communication() {
  const { progress, update } = useProgress();
  const [mode, setMode] = useState("Grammar");
  const [time, setTime] = useState(60);
  const [phase, setPhase] = useState<
    "ready" | "preparation" | "response" | "complete"
  >("ready");
  const [text, setText] = useState(
    progress.drafts["communication-response"] ?? "",
  );
  useEffect(() => {
    if (phase !== "preparation" && phase !== "response") return;
    if (!progress.settings.timers) return;
    const timer = setInterval(
      () =>
        setTime((t) => {
          if (t <= 1) {
            setPhase(phase === "preparation" ? "response" : "complete");
            return phase === "preparation" ? 90 : 0;
          }
          return t - 1;
        }),
      1000,
    );
    return () => clearInterval(timer);
  }, [phase, progress.settings.timers]);
  const modes = [
    "Grammar",
    "Sentence correction",
    "Reading comprehension",
    "Listening-style",
    "Speaking prompts",
    "Professional email",
    "Workplace situations",
  ];
  const q = communication.find((q) => q.topic === mode);
  const prompts: Record<string, string> = {
    "Speaking prompts":
      "Describe a time you learned a new technical skill. Explain the challenge, your practice plan and how you checked your improvement.",
    "Professional email":
      "Write a professional email to your project lead explaining a one-day delay, its impact, and your recovery plan. Include a clear subject line.",
    "Workplace situations":
      "A teammate disagrees with your design during a deadline. Explain how you would understand their concerns, compare alternatives, and agree on a next step.",
  };
  return (
    <>
      <Heading
        eyebrow="COMMUNICATE WITH CONFIDENCE"
        title="Clear thinking. Clear communication."
        description="Practice language, comprehension, spoken responses, professional email writing and workplace judgement."
      />
      <div className="tab-row">
        {modes.map((m) => (
          <Button
            key={m}
            size="sm"
            variant={mode === m ? "default" : "outline"}
            onClick={() => {
              setMode(m);
              setPhase("ready");
              setTime(60);
            }}
          >
            {m}
          </Button>
        ))}
      </div>
      {q ? (
        <>
          {mode === "Listening-style" && (
            <Button
              className="listen-button"
              variant="outline"
              onClick={() => {
                if (typeof window.speechSynthesis !== "undefined") {
                  window.speechSynthesis.cancel();
                  window.speechSynthesis.speak(
                    new SpeechSynthesisUtterance(
                      "The review is moved from Tuesday to Thursday at 3 PM.",
                    ),
                  );
                } else
                  window.alert(
                    "Speech playback is unavailable in this browser. Read the briefing in the question.",
                  );
              }}
            >
              <Volume2 size={16} />
              Play briefing
            </Button>
          )}
          <MCQCard key={q.id} question={q} />
        </>
      ) : (
        <section className="panel communication-panel">
          <span className="tag blue">{mode}</span>
          <h2>{prompts[mode]}</h2>
          <div className="speaking-timer">
            <Clock size={20} />
            <strong>
              {Math.floor(time / 60)}:{String(time % 60).padStart(2, "0")}
            </strong>
            <span>
              {phase === "ready"
                ? "60-second preparation · 90-second response"
                : phase === "preparation"
                  ? "Prepare your response"
                  : phase === "response"
                    ? "Deliver your response"
                    : "Practice completed"}
            </span>
          </div>
          <div className="button-row">
            <Button
              onClick={() => {
                setPhase("preparation");
                setTime(60);
              }}
            >
              Start practice
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPhase("response");
                setTime(90);
              }}
            >
              Start response
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPhase("complete");
                setTime(0);
                update((p) => ({
                  ...p,
                  lessons: {
                    ...p.lessons,
                    communication: { status: "Completed" },
                  },
                }));
              }}
            >
              Complete practice
            </Button>
          </div>
          <label className="form-field">
            <span>Your response / practice notes</span>
            <textarea
              aria-label="Communication response"
              rows={10}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                const value = e.target.value;
                update((p) => ({
                  ...p,
                  drafts: { ...p.drafts, "communication-response": value },
                }));
              }}
              placeholder="Write your response here. For speaking practice, respond aloud and capture what you want to improve."
            />
          </label>
          <div className="callout">
            <strong>Self-review checklist</strong>
            <p>
              Clear opening · Logical structure · Specific details ·
              Professional tone · Concise closing. Spoken and written responses
              are self-reviewed in this version.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
