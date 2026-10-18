"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { loader } from "@monaco-editor/react";
import { useState, useRef, useEffect } from "react";
import {
  Search,
  Play,
  Send,
  Lightbulb,
  Code2,
  CheckCircle2,
} from "lucide-react";
import { coding, debugging } from "@/data";
import type { CodingProblem, ProblemProgress } from "@/types";
import { useProgress } from "@/hooks/progress";
import { executeCode, type ExecutionResult } from "@/services/execution";
import { today, solved } from "@/lib/assessment";
import {
  Heading,
  BookmarkButton,
  AttachedNote,
  Empty,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
loader.config({ paths: { vs: "/monaco/vs" } });
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="editor-loading">Loading code editor…</div>,
});
export const starter = (language: string) =>
  language === "Python"
    ? "def solve(data):\n    # Read the JSON input and return the requested result.\n    pass\n"
    : language === "JavaScript"
      ? "function solve(data) {\n  // Return the requested result.\n}\n"
      : language === "Java"
        ? "class Solution {\n    public Object solve(Object data) {\n        // Editor only: connect a sandbox to execute Java.\n        return null;\n    }\n}\n"
        : "// Editor only: connect a sandbox to execute C++.\n#include <vector>\nusing namespace std;\n// Implement the problem with the given input shape.\n";
export function ProblemList({ kind }: { kind: "coding" | "debugging" }) {
  const { progress } = useProgress();
  const bank = kind === "coding" ? coding : debugging;
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [status, setStatus] = useState("all");
  const [bookmarked, setBookmarked] = useState(false);
  const filtered = bank.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) &&
      (topic === "all" || topic === p.topic) &&
      (difficulty === "all" || difficulty === p.difficulty) &&
      (status === "all" ||
        status === (progress.problems[p.id]?.status ?? "Not Started")) &&
      (!bookmarked || progress.bookmarks.includes(p.id)),
  );
  return (
    <>
      <Heading
        eyebrow={
          kind === "coding" ? "THINK. BUILD. TEST." : "READ. TRACE. REPAIR."
        }
        title={
          kind === "coding"
            ? "A little sharper, every problem."
            : "Find the bug. Fix the thinking."
        }
        description={
          kind === "coding"
            ? "75 placement-focused challenges. Real sample and hidden test execution in Python and JavaScript."
            : "50 repair challenges with existing buggy code. Hints unlock only when you ask for them."
        }
      />
      <div className="bank-summary">
        <span>
          <strong>{bank.length}</strong> problems
        </span>
        <span>
          <strong>
            {bank.filter((p) => solved(progress.problems[p.id]?.status)).length}
          </strong>{" "}
          solved
        </span>
        <span>
          <strong>{bank.filter((p) => progress.problems[p.id]).length}</strong>{" "}
          attempted
        </span>
        {kind === "debugging" && (
          <span className="tag neutral">Python debugging bank</span>
        )}
      </div>
      <div className="filter-bar">
        <div className="input-icon">
          <Search size={16} />
          <input
            placeholder="Search problems"
            aria-label="Search problems"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          aria-label="Problem topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          <option value="all">All topics</option>
          {[...new Set(bank.map((p) => p.topic))].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select
          aria-label="Problem difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="all">All difficulties</option>
          <option value="easy">easy</option>
          <option value="medium">medium</option>
        </select>
        <select
          aria-label="Problem status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {[
            "all",
            "Not Started",
            "Attempted",
            "Solved",
            "Solved With Hint",
            "Solution Viewed",
          ].map((x) => (
            <option value={x} key={x}>
              {x === "all" ? "All statuses" : x}
            </option>
          ))}
        </select>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={bookmarked}
            onChange={(e) => setBookmarked(e.target.checked)}
          />
          Bookmarked
        </label>
      </div>
      <section className="panel problem-table">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Problem</th>
                <th>Topic</th>
                <th>Difficulty</th>
                <th>Save</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id}>
                  <td>
                    {solved(progress.problems[p.id]?.status) ? (
                      <CheckCircle2 className="green-text" size={18} />
                    ) : (
                      <span className="status-dot" />
                    )}
                  </td>
                  <td>
                    <Link
                      className="problem-title"
                      href={`/${kind === "coding" ? "coding" : "debugging"}/${p.id}`}
                    >
                      <small>{String(i + 1).padStart(2, "0")}</small>
                      {p.title}
                    </Link>
                    <small className="problem-status">
                      {progress.problems[p.id]?.status ?? "Not Started"}
                    </small>
                  </td>
                  <td>
                    <span className="tag neutral">{p.topic}</span>
                  </td>
                  <td>
                    <span className={`difficulty ${p.difficulty}`}>
                      {p.difficulty}
                    </span>
                  </td>
                  <td>
                    <BookmarkButton id={p.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <Empty
              title="No matching problems"
              description="Adjust the filters to see more challenges."
            />
          )}
        </div>
      </section>
    </>
  );
}
export function ProblemWorkspace({
  problem: p,
  kind,
  exam = false,
  initialLanguage,
  onComplete,
}: {
  problem: CodingProblem;
  kind: "coding" | "debugging" | "ai";
  exam?: boolean;
  initialLanguage?: string;
  onComplete?: (score: number) => void;
}) {
  const { progress, update, problem: record } = useProgress();
  const reservedExam = exam && !!progress.activeMock?.finalSet;
  const [language, setLanguage] = useState(
    kind === "debugging"
      ? "Python"
      : (initialLanguage ?? progress.settings.language),
  );
  const suffix = exam ? "-exam-" + (progress.activeMock?.id ?? "practice") : "";
  const draftKey = p.id + "-" + language + suffix;
  const [code, setCode] = useState(
    progress.drafts[draftKey] ??
      (kind === "debugging"
        ? (p.buggyCode ?? starter(language))
        : starter(language)),
  );
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [running, setRunning] = useState(false);
  const [hintCount, setHintCount] = useState(
    exam ? 0 : progress.problems[p.id]?.hint ? 1 : 0,
  );
  const [approach, setApproach] = useState(false);
  const [solution, setSolution] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const start = useRef(0);
  useEffect(() => {
    start.current = Date.now();
  }, []);
  const old = progress.problems[p.id];
  function saveCode(value: string) {
    setCode(value);
    update((s) => ({
      ...s,
      drafts: { ...s.drafts, [draftKey]: value },
      problems:
        reservedExam || s.problems[p.id]
          ? s.problems
          : {
              ...s.problems,
              [p.id]: {
                status: "Attempted",
                attempts: 0,
                passed: 0,
                total: p.tests.length,
                seconds: 0,
                kind,
                hint: false,
                viewed: false,
              },
            },
    }));
  }
  function changeLanguage(value: string) {
    setLanguage(value);
    setCode(progress.drafts[p.id + "-" + value + suffix] ?? starter(value));
    setResult(null);
  }
  async function run(submit = false) {
    setRunning(true);
    const tests = submit ? p.tests : p.tests.filter((t) => !t.hidden);
    const r = await executeCode(code, language, tests);
    setResult(r);
    setRunning(false);
    if (r.error) return;
    if (submit) {
      const isSolved = r.passed === r.total;
      const status: ProblemProgress["status"] =
        old?.viewed || solution
          ? "Solution Viewed"
          : isSolved
            ? hintCount || old?.hint
              ? "Solved With Hint"
              : "Solved"
            : "Attempted";
      if (!reservedExam)
        record(p.id, {
          status,
          attempts: (old?.attempts ?? 0) + 1,
          passed: r.passed,
          total: r.total,
          seconds: Math.round((Date.now() - start.current) / 1000),
          kind,
          hint: !!hintCount || !!old?.hint,
          viewed: solution || !!old?.viewed,
        });
      if (isSolved && !reservedExam)
        update((s) => ({
          ...s,
          drafts: { ...s.drafts, ["solved-date-" + p.id]: today() },
        }));
      onComplete?.(Math.round((r.passed / r.total) * 100));
    }
  }
  function revealHint() {
    const count = hintCount + 1;
    setHintCount(count);
    if (!exam)
      record(p.id, {
        status: old?.status ?? "Attempted",
        attempts: old?.attempts ?? 0,
        passed: old?.passed ?? 0,
        total: p.tests.length,
        seconds: old?.seconds ?? 0,
        kind,
        hint: true,
        viewed: old?.viewed ?? false,
      });
  }
  return (
    <>
      <div className="workspace-heading">
        {!exam && (
          <Link
            className="back-link"
            href={
              kind === "debugging"
                ? "/debugging"
                : kind === "ai"
                  ? "/ai-coding"
                  : "/coding"
            }
          >
            ← All problems
          </Link>
        )}
        <span className="tag neutral">
          {kind === "debugging" ? "DEBUGGING WORKSPACE" : "CODING WORKSPACE"}
        </span>
        <span className="mobile-tip">Best experienced on desktop.</span>
      </div>
      <div className="coding-workspace">
        <section className="panel problem-description">
          <div className="question-meta">
            <span className={`difficulty ${p.difficulty}`}>{p.difficulty}</span>
            <span className="tag neutral">{p.topic}</span>
            {!exam && <BookmarkButton id={p.id} />}
          </div>
          <h1>{p.title}</h1>
          <p>{p.statement}</p>
          {kind === "debugging" && (
            <div className="callout">
              Repair the supplied implementation. Submit when it meets the
              expected behaviour. The bug is not revealed automatically.
            </div>
          )}
          <h3>Input format</h3>
          <p>{p.inputFormat}</p>
          <h3>Output format</h3>
          <p>{p.outputFormat}</p>
          <h3>Constraints</h3>
          <p>{p.constraints}</p>
          <h3>Example</h3>
          {p.tests
            .filter((t) => !t.hidden)
            .map((t, i) => (
              <div className="test-example" key={i}>
                <span>Input</span>
                <pre>{JSON.stringify(t.input)}</pre>
                <span>Expected output</span>
                <pre>{JSON.stringify(t.expected)}</pre>
              </div>
            ))}
          <p className="muted small-text">
            Submission also runs {p.tests.filter((t) => t.hidden).length} hidden
            boundary cases. Hidden inputs and expected values stay out of the
            console; local practice datasets can still be inspected in the
            browser.
          </p>
          {!exam && kind !== "ai" && (
            <>
              <div className="button-row help-buttons">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={hintCount >= p.hints.length}
                  onClick={revealHint}
                >
                  <Lightbulb size={14} />
                  Hint {Math.min(hintCount + 1, p.hints.length)}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setApproach(!approach);
                    if (!approach && !hintCount) revealHint();
                  }}
                >
                  View approach
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirm(true)}
                >
                  View solution
                </Button>
              </div>
              {p.hints.slice(0, hintCount).map((hint, i) => (
                <div className="callout" key={i}>
                  <strong>Hint {i + 1}</strong>
                  <p>{hint}</p>
                </div>
              ))}
              {approach && (
                <div className="callout">
                  <strong>Approach</strong>
                  <p>{p.approach}</p>
                  <small>{p.complexity}</small>
                </div>
              )}
              {solution && (
                <div className="solution">
                  <h3>Python reference solution</h3>
                  <pre>{p.solution}</pre>
                  <p>{p.complexity}</p>
                </div>
              )}
              <AttachedNote id={p.id} />
            </>
          )}
          {!exam && kind === "ai" && <AttachedNote id={p.id} />}
        </section>
        <section className="panel editor-panel">
          <div className="editor-toolbar">
            <div>
              <Code2 size={17} />
              <strong>
                solution.
                {language === "Python"
                  ? "py"
                  : language === "JavaScript"
                    ? "js"
                    : language === "Java"
                      ? "java"
                      : "cpp"}
              </strong>
            </div>
            <select
              aria-label="Programming language"
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              disabled={kind === "debugging"}
            >
              {["Python", "JavaScript", "Java", "C++"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
            <Button
              variant="ghost"
              size="sm"
              disabled={running}
              onClick={() => {
                if (window.confirm("Reset this editor to its starter code?"))
                  saveCode(
                    kind === "debugging" ? p.buggyCode! : starter(language),
                  );
              }}
            >
              Reset
            </Button>
          </div>
          <Editor
            height="460px"
            language={
              language === "Python"
                ? "python"
                : language === "JavaScript"
                  ? "javascript"
                  : language === "Java"
                    ? "java"
                    : "cpp"
            }
            beforeMount={(monaco) => {
              monaco.editor.defineTheme("exceller-black", {
                base: "vs-dark",
                inherit: true,
                rules: [],
                colors: {
                  "editor.background": "#000000",
                  "editor.foreground": "#F3F3F3",
                  "editorGutter.background": "#000000",
                  "editor.lineHighlightBackground": "#000000",
                  "editor.lineHighlightBorder": "#333333",
                  "editorWidget.background": "#000000",
                  "editorSuggestWidget.background": "#000000",
                },
              });
            }}
            theme={progress.settings.theme === "dark" ? "exceller-black" : "vs"}
            value={code}
            onChange={(v) => saveCode(v ?? "")}
            options={{
              fontSize:
                progress.settings.textSize === "extra-large"
                  ? 22
                  : progress.settings.textSize === "large"
                    ? 20
                    : 18,
              lineHeight:
                progress.settings.textSize === "extra-large"
                  ? 34
                  : progress.settings.textSize === "large"
                    ? 32
                    : 30,
              minimap: { enabled: false },
              padding: { top: 20 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
            }}
          />
          <div className="run-toolbar">
            <span className="muted small-text">
              {running
                ? "Running in an isolated worker…"
                : "Draft autosaved · solve(data) → result"}
            </span>
            <Button variant="outline" disabled={running} onClick={() => run()}>
              <Play size={14} />
              Run code
            </Button>
            <Button disabled={running} onClick={() => run(true)}>
              <Send size={14} />
              {exam ? "Submit stage" : "Submit"}
            </Button>
          </div>
          <div className="console">
            <h3>
              Test results <span className="tag neutral">CONSOLE</span>
            </h3>
            {!result ? (
              <p className="muted">
                Run the sample to see your output. Submit to check all cases.
              </p>
            ) : result.error ? (
              <p role="alert" className="error-text">
                {result.error}
              </p>
            ) : (
              <>
                <div
                  role="status"
                  className={
                    result.passed === result.total ? "green-text" : "error-text"
                  }
                >
                  {result.passed} / {result.total} test cases passed
                </div>
                {result.results.map((r, i) => (
                  <details key={i} className="test-result">
                    <summary>
                      {r.passed ? "✓" : "✕"} Test {i + 1}
                      {r.hidden ? " · Hidden boundary case" : ""}
                    </summary>
                    {r.error ? (
                      <pre>{r.error}</pre>
                    ) : r.hidden ? (
                      <p>Hidden case result only.</p>
                    ) : (
                      <pre>
                        Input: {JSON.stringify(r.input)}
                        {"\n"}Expected: {JSON.stringify(r.expected)}
                        {"\n"}Actual: {JSON.stringify(r.actual)}
                      </pre>
                    )}
                  </details>
                ))}
              </>
            )}
          </div>
        </section>
      </div>
      {confirm && (
        <div className="modal-backdrop">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="solution-title"
            className="modal"
          >
            <h2 id="solution-title">Give your thinking a chance.</h2>
            <p>
              Try solving the problem yourself before viewing the complete
              solution.
            </p>
            <div className="button-row">
              <Button variant="outline" onClick={() => setConfirm(false)}>
                Keep trying
              </Button>
              <Button
                onClick={() => {
                  setConfirm(false);
                  setSolution(true);
                  record(p.id, {
                    status: "Solution Viewed",
                    attempts: old?.attempts ?? 0,
                    passed: old?.passed ?? 0,
                    total: p.tests.length,
                    seconds: old?.seconds ?? 0,
                    kind,
                    hint: !!hintCount,
                    viewed: true,
                  });
                }}
              >
                View solution
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
