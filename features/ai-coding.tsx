"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { Sparkles, CheckCircle2, Circle, ArrowRight, Send } from "lucide-react";
import { aiCoding } from "@/data";
import type { AIApproachEvaluation, Approach, CodingProblem } from "@/types";
import { approachSchema } from "@/lib/ai-validation";
import { useProgress } from "@/hooks/progress";
import { Heading, BookmarkButton, AttachedNote } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ProblemWorkspace } from "./coding";
const fields: [keyof Approach, string, string][] = [
  [
    "understanding",
    "Problem understanding",
    "Describe the input, output, and what counts as a valid result.",
  ],
  [
    "algorithm",
    "Proposed algorithm",
    "Explain your steps and why they solve the problem.",
  ],
  [
    "dataStructure",
    "Data structure",
    "Which structures will you use, and why?",
  ],
  [
    "variables",
    "Variables & logic",
    "Describe the important variables and loop invariant.",
  ],
  [
    "edgeCases",
    "Edge cases",
    "Consider empty input (when valid), duplicates, negatives, and boundary sizes.",
  ],
  [
    "timeComplexity",
    "Time complexity",
    "Give the bound and explain the dominant operation.",
  ],
  [
    "spaceComplexity",
    "Space complexity",
    "Describe auxiliary memory, excluding required output if appropriate.",
  ],
];
const blank: Approach = {
  understanding: "",
  algorithm: "",
  dataStructure: "",
  variables: "",
  edgeCases: "",
  timeComplexity: "",
  spaceComplexity: "",
};
export function AICoding({ id }: { id?: string }) {
  const p = aiCoding.find((p) => p.id === id);
  const { progress } = useProgress();
  if (p) return <AICoach key={p.id} problem={p} />;
  return (
    <>
      <Heading
        eyebrow="REASON FIRST. THEN IMPLEMENT."
        title="Your thinking is the starting point."
        description="30 AI-assisted coding challenges. Explain your approach, get evaluated by Groq, then earn implementation help."
      />
      <div className="callout">
        <strong>How this works</strong>
        <p>
          1. Explain all seven reasoning fields. 2. Groq checks your algorithm
          and scores it out of 100. 3. An adequate approach scoring at least 70
          unlocks implementation help. 4. Test the implementation yourself.
        </p>
      </div>
      <div className="module-grid">
        {aiCoding.map((p) => (
          <section className="panel module-card" key={p.id}>
            <div className="module-top">
              <span className="daily-icon">
                <Sparkles size={20} />
              </span>
              <BookmarkButton id={p.id} />
            </div>
            <span className="tag neutral">{p.topic}</span>
            <h3>{p.title}</h3>
            <p>{p.statement}</p>
            <small className="muted">
              {progress.problems[p.id]?.status ?? "Not Started"}
            </small>
            <Link className="text-link" href={"/ai-coding/" + p.id}>
              Build your approach
              <ArrowRight size={15} />
            </Link>
          </section>
        ))}
      </div>
    </>
  );
}
export function AICoach({
  problem: p,
  exam = false,
  onComplete,
}: {
  problem: CodingProblem;
  exam?: boolean;
  onComplete?: (score: number) => void;
}) {
  const { progress, update } = useProgress();
  const key =
    p.id +
    (exam ? "-exam-" + (progress.activeMock?.id ?? "practice") : "") +
    "-approach";
  let saved = blank;
  try {
    saved = { ...blank, ...JSON.parse(progress.drafts[key] ?? "{}") };
  } catch {}
  const [approach, setApproach] = useState<Approach>(saved);
  const [evaluation, setEvaluation] = useState<AIApproachEvaluation | null>(
    null,
  );
  const [solution, setSolution] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tokens, setTokens] = useState(
    Number(progress.drafts[key + "-tokens"] ?? 0),
  );
  const [language, setLanguage] = useState(progress.settings.language);
  const [tab, setTab] = useState<"approach" | "editor">("approach");
  const evaluating = useRef(false);
  const ready = approachSchema.safeParse(approach).success;
  const budget = progress.settings.tokenBudget;
  const estimate = Math.ceil(JSON.stringify(approach).length / 4);
  const allowed = !!evaluation?.eligibleForSolution && evaluation.total >= 70;
  function edit(field: keyof Approach, value: string) {
    const next = { ...approach, [field]: value };
    setApproach(next);
    setEvaluation(null);
    setSolution("");
    update((s) => ({
      ...s,
      drafts: { ...s.drafts, [key]: JSON.stringify(next) },
    }));
  }
  async function ask(mode: "evaluate" | "generate") {
    if (evaluating.current) return;
    if (!ready) {
      setError("Explain each reasoning field before asking Groq for help.");
      return;
    }
    if (budget && tokens + estimate > 2000) {
      setError(
        "The simulated 2000-token budget has been used. Shorten your approach, or disable this optional constraint in Settings outside an assessment.",
      );
      return;
    }
    evaluating.current = true;
    setBusy(true);
    setError("");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 95000);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: p.id, mode, language, approach }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (data.evaluation) {
        setEvaluation(data.evaluation);
        update((s) => ({
          ...s,
          promptScores: [
            ...s.promptScores,
            { date: new Date().toISOString(), score: data.evaluation.total },
          ],
        }));
      }
      if (!response.ok) {
        setError(data.error ?? "AI request failed.");
        return;
      }
      if (data.solution) setSolution(data.solution);
      const usage = estimate + Math.ceil(JSON.stringify(data).length / 4);
      const next = tokens + usage;
      setTokens(next);
      update((s) => ({
        ...s,
        drafts: { ...s.drafts, [key + "-tokens"]: String(next) },
      }));
    } catch (e) {
      setError(
        e instanceof Error && e.name === "AbortError"
          ? "Groq timed out. Your approach is saved."
          : "Network error. Your approach is saved; try again.",
      );
    } finally {
      clearTimeout(timer);
      setBusy(false);
      evaluating.current = false;
    }
  }
  return (
    <>
      {!exam && (
        <Link className="back-link" href="/ai-coding">
          ← AI coding challenges
        </Link>
      )}
      <Heading
        eyebrow="AI-ASSISTED CODING"
        title={p.title}
        description="Demonstrate your reasoning before receiving implementation help."
        action={
          <span className="tag blue">
            <Sparkles size={14} />
            POWERED BY GROQ
          </span>
        }
      />
      <div className="tab-row">
        <Button
          variant={tab === "approach" ? "default" : "outline"}
          onClick={() => setTab("approach")}
        >
          Approach builder
        </Button>
        <Button
          variant={tab === "editor" ? "default" : "outline"}
          disabled={exam && !allowed}
          onClick={() => setTab("editor")}
        >
          Implementation & tests
        </Button>
      </div>
      {tab === "approach" ? (
        <div className="ai-layout">
          <section className="panel ai-problem">
            <div className="question-meta">
              <span className="tag neutral">{p.topic}</span>
              {!exam && <BookmarkButton id={p.id} />}
            </div>
            <h3>The challenge</h3>
            <p>{p.statement}</p>
            <h3>Sample</h3>
            <pre>{JSON.stringify(p.tests[0].input, null, 2)}</pre>
            <p>
              Expected: <code>{JSON.stringify(p.tests[0].expected)}</code>
            </p>
            <h3>AI coding readiness checklist</h3>
            <ul className="checklist">
              {fields.map(([field, label]) => (
                <li key={field}>
                  {approach[field].trim().length >=
                  {
                    understanding: 15,
                    algorithm: 20,
                    dataStructure: 5,
                    variables: 10,
                    edgeCases: 10,
                    timeComplexity: 3,
                    spaceComplexity: 3,
                  }[field] ? (
                    <CheckCircle2 className="green-text" size={16} />
                  ) : (
                    <Circle size={16} />
                  )}{" "}
                  {label}
                </li>
              ))}
            </ul>
            <div className="callout">
              Field completion enables evaluation. Only Groq’s evaluation of a
              valid approach can unlock code generation.
            </div>
            {budget && (
              <div className="token-card">
                <strong>
                  AI token budget <span className="tag neutral">SIMULATED</span>
                </strong>
                <p>
                  {tokens} used · {Math.max(0, 2000 - tokens)} remaining
                </p>
                <small>
                  Estimated from character count; this does not represent Groq
                  billing.
                </small>
              </div>
            )}
            {!exam && <AttachedNote id={p.id} />}
          </section>
          <section className="panel approach-builder">
            <h3>Your approach</h3>
            <p className="muted">
              Be specific. Explain the why, not just the steps.
            </p>
            {fields.map(([field, label, placeholder]) => (
              <label className="form-field" key={field}>
                <span>{label}</span>
                <textarea
                  aria-label={label}
                  placeholder={placeholder}
                  value={approach[field]}
                  maxLength={field === "algorithm" ? 3000 : 1500}
                  rows={field === "algorithm" ? 4 : 2}
                  onChange={(e) => edit(field, e.target.value)}
                />
              </label>
            ))}
            <select
              aria-label="AI solution language"
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setEvaluation(null);
              }}
            >
              {["Python", "JavaScript", "Java", "C++"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
            <Button disabled={!ready || busy} onClick={() => ask("evaluate")}>
              <Send size={15} />
              {busy ? "Groq is thinking…" : "Evaluate my approach"}
            </Button>
          </section>
          <section className="panel assistant-panel">
            <div className="assistant-header">
              <span className="daily-icon">
                <Sparkles size={18} />
              </span>
              <div>
                <strong>Groq coding coach</strong>
                <small>Better reasoning. Better code.</small>
              </div>
            </div>
            {error && (
              <div className="alert" role="alert">
                {error}
              </div>
            )}
            {evaluation ? (
              <>
                <div className="approach-score">
                  <strong>
                    {evaluation.total}
                    <span>/100</span>
                  </strong>
                  <p>
                    {allowed
                      ? "Approach accepted"
                      : "Your approach needs improvement."}
                  </p>
                </div>
                <div className="mini-stats">
                  {[
                    [
                      "Problem understanding",
                      evaluation.problemUnderstanding,
                      20,
                    ],
                    ["Algorithm", evaluation.algorithm, 25],
                    ["Data structure", evaluation.dataStructure, 15],
                    ["Edge cases", evaluation.edgeCases, 15],
                    ["Complexity", evaluation.complexity, 15],
                    ["Prompt clarity", evaluation.promptClarity, 10],
                  ].map(([label, value, max]) => (
                    <span key={String(label)}>
                      {label}
                      <strong>
                        {value}/{max}
                      </strong>
                    </span>
                  ))}
                </div>
                <div className="coach-feedback">
                  <h3>Coach feedback</h3>
                  <p>{evaluation.feedback}</p>
                  {evaluation.missing.map((m, i) => (
                    <p key={i}>• {m}</p>
                  ))}
                </div>
              </>
            ) : (
              <div className="assistant-welcome">
                <Sparkles size={28} />
                <h3>Let’s work through your thinking.</h3>
                <p>
                  I’ll review your approach, ask about gaps, and help implement
                  it once your reasoning is ready.
                </p>
                <small>“Give code” won’t skip the reasoning step.</small>
              </div>
            )}
            <Button disabled={!allowed || busy} onClick={() => ask("generate")}>
              <Sparkles size={15} />
              Generate AI solution
            </Button>
            {solution && (
              <div className="generated-solution">
                <h3>Implementation feedback</h3>
                <pre>{solution}</pre>
                <Button variant="outline" onClick={() => setTab("editor")}>
                  Test the implementation
                  <ArrowRight size={15} />
                </Button>
              </div>
            )}
          </section>
        </div>
      ) : (
        <ProblemWorkspace
          key={p.id + language}
          problem={p}
          kind="ai"
          initialLanguage={language}
          exam={exam}
          onComplete={(score) =>
            onComplete?.(allowed ? Math.min(evaluation!.total, score) : 0)
          }
        />
      )}
    </>
  );
}
