"use client";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Code2,
  Bug,
  Sparkles,
  Target,
  Flame,
  Check,
  ChevronRight,
  Clock,
  ClipboardCheck,
  BrainCircuit,
  MessageSquare,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar as ChartBar,
} from "recharts";
import { useProgress } from "@/hooks/progress";
import {
  allQuestions,
  coding,
  debugging,
  aiCoding,
  lessons,
  mocks,
} from "@/data";
import { readiness, solved, streak, today, topicStats } from "@/lib/assessment";
import { Heading, Bar, Empty, disclaimer } from "@/components/shared";
import { Button } from "@/components/ui/button";
const roadmap = [
  ["Communication", MessageSquare],
  ["AI + technical MCQs", BrainCircuit],
  ["Debugging", Bug],
  ["AI-assisted coding", Sparkles],
  ["Cognitive games", Target],
  ["Technical + HR interview", GraduationCap],
] as const;
export function Dashboard() {
  const { progress: p, update } = useProgress();
  const score = readiness(p);
  const stats = topicStats(p);
  const attempted = Object.keys(p.answers).length;
  const correct = Object.values(p.answers).filter((a) => a.correct).length;
  const codeSolved = coding.filter((q) =>
    solved(p.problems[q.id]?.status),
  ).length;
  const debugSolved = debugging.filter((q) =>
    solved(p.problems[q.id]?.status),
  ).length;
  const weakest = stats
    .filter((s) => s.attempted)
    .sort((a, b) => a.accuracy - b.accuracy)[0];
  const strongest = stats
    .filter((s) => s.attempted)
    .sort((a, b) => b.accuracy - a.accuracy)[0];
  const mockScores = p.mocks.map((m) =>
    Math.round(
      Object.values(m.scores).reduce((s, x) => s + x, 0) /
        Math.max(Object.keys(m.scores).length, 1),
    ),
  );
  const average = mockScores.length
    ? Math.round(mockScores.reduce((a, b) => a + b, 0) / mockScores.length)
    : 0;
  const plan = [
    {
      label: "AI literacy",
      detail: "10 questions · Concepts to confidence",
      icon: BrainCircuit,
      url: "/practice/ai",
      done: allQuestions.filter(
        (q) => q.topic === "AI Literacy" && p.answers[q.id]?.date === today(),
      ).length,
      total: 10,
    },
    {
      label: "Technical fundamentals",
      detail: "10 questions · Strengthen your foundation",
      icon: LayersIcon,
      url: "/practice/technical",
      done: allQuestions.filter(
        (q) =>
          ["DBMS", "SQL", "OOP", "OS", "CN"].includes(q.topic) &&
          p.answers[q.id]?.date === today(),
      ).length,
      total: 10,
    },
    {
      label: "Coding practice",
      detail: "2 problems · Think, write, test",
      icon: Code2,
      url: "/coding",
      done: codeSolved
        ? coding.filter(
            (q) =>
              solved(p.problems[q.id]?.status) &&
              p.drafts["solved-date-" + q.id] === today(),
          ).length
        : 0,
      total: 2,
    },
    {
      label: "Debugging challenge",
      detail: "1 problem · Find the hidden mistake",
      icon: Bug,
      url: "/debugging",
      done: debugging.filter(
        (q) =>
          solved(p.problems[q.id]?.status) &&
          p.drafts["solved-date-" + q.id] === today(),
      ).length,
      total: 1,
    },
    {
      label: "AI-assisted coding",
      detail: "1 problem · Explain your approach first",
      icon: Sparkles,
      url: "/ai-coding",
      done: aiCoding.filter(
        (q) =>
          solved(p.problems[q.id]?.status) &&
          p.drafts["solved-date-" + q.id] === today(),
      ).length,
      total: 1,
    },
  ];
  const dailyDone = plan.filter((x) => x.done >= x.total).length;
  return (
    <>
      <Heading
        eyebrow="YOUR PREPARATION WORKSPACE"
        title="Ready for your next chapter?"
        description="Build the skills. Practice the process. Walk in with confidence."
        action={
          <Button asChild>
            <Link href="/mocks">
              <ClipboardCheck size={16} />
              Take a mock test
              <ArrowUpRight size={16} />
            </Link>
          </Button>
        }
      />
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-label">
            <span className="live-dot" />
            CAPGEMINI EXCELLER 2027
          </div>
          <h2>
            Preparation with purpose.
            <br />
            <span>Progress you can measure.</span>
          </h2>
          <p>
            A focused path from fundamentals to your final interview.
            <br />
            Your preparation journey, all in one place.
          </p>
          <Button asChild variant="secondary">
            <Link
              href={
                weakest
                  ? "/practice/" + weakest.topic
                  : "/preparation/ai-literacy"
              }
            >
              Continue preparation
              <ArrowRight size={16} />
            </Link>
          </Button>
          <span className="hero-foot">
            YOUR GOAL. YOUR PACE. YOUR NEXT OPPORTUNITY.
          </span>
        </div>
        <div className="readiness">
          <div
            className="readiness-ring"
            style={{
              background: `conic-gradient(#9fcbff ${score * 3.6}deg, #335078 0deg)`,
            }}
          >
            <div>
              <strong>
                {score}
                <span>/100</span>
              </strong>
              <small>READINESS SCORE</small>
            </div>
          </div>
          <div className="readiness-label">
            <span />{" "}
            {score < 40
              ? "Beginning"
              : score < 60
                ? "Developing"
                : score < 75
                  ? "Assessment Ready"
                  : score < 90
                    ? "Strong"
                    : "Highly Prepared"}
            <small>Internal preparation benchmark</small>
          </div>
        </div>
        <div className="hero-decoration" />
      </section>
      <div className="stats-grid">
        <Stat
          title="Preparation progress"
          value={`${Math.round((Object.values(p.lessons).filter((x) => x.status === "Completed").length / lessons.length) * 100)}%`}
          subtitle={`${Object.values(p.lessons).filter((x) => x.status === "Completed").length} of ${lessons.length} modules completed`}
          icon={<BookOpen size={19} />}
        />
        <Stat
          title="Questions solved"
          value={correct}
          subtitle={`${attempted} attempted · ${attempted ? Math.round((correct / attempted) * 100) : 0}% accuracy`}
          icon={<Target size={19} />}
        />
        <Stat
          title="Coding problems"
          value={codeSolved}
          subtitle={`of 75 problems · ${debugSolved} debugging solved`}
          icon={<Code2 size={19} />}
        />
        <Stat
          title="Current streak"
          value={`${streak(p)} days`}
          subtitle="Consistency builds confidence"
          icon={<Flame size={19} />}
        />
      </div>
      {!p.onboarded && (
        <div className="onboarding">
          <div>
            <span className="tag blue">START HERE</span>
            <h3>Let’s establish your baseline.</h3>
            <p>
              Capgemini Exceller 2027 Preparation · Start with 10 AI and 10
              technical questions.
            </p>
          </div>
          <div className="button-row">
            <Button asChild>
              <Link
                href="/mocks"
                onClick={() => update((x) => ({ ...x, onboarded: true }))}
              >
                Take diagnostic
                <ArrowRight size={15} />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link
                href="/preparation"
                onClick={() => update((x) => ({ ...x, onboarded: true }))}
              >
                Explore preparation
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link
                href="/coding"
                onClick={() => update((x) => ({ ...x, onboarded: true }))}
              >
                Start coding
              </Link>
            </Button>
          </div>
        </div>
      )}
      <div className="dashboard-columns">
        <section className="panel daily-panel">
          <div className="panel-heading">
            <div>
              <h3>
                Today’s Capgemini prep{" "}
                <span className="tag neutral">DAILY PLAN</span>
              </h3>
              <p>Small steps, real momentum.</p>
            </div>
            <span className="muted small-text">{dailyDone} of 5 completed</span>
          </div>
          <Bar value={(dailyDone / 5) * 100} />
          <div className="daily-list">
            {plan.map((x) => (
              <Link key={x.url} href={x.url} className="daily-row">
                <span
                  className={`daily-icon ${x.done >= x.total ? "done" : ""}`}
                >
                  {x.done >= x.total ? (
                    <Check size={18} />
                  ) : (
                    <x.icon size={18} />
                  )}
                </span>
                <div>
                  <strong>{x.label}</strong>
                  <small>{x.detail}</small>
                </div>
                <span className="daily-count">
                  {Math.min(x.done, x.total)}/{x.total}
                </span>
                <ChevronRight size={16} />
              </Link>
            ))}
          </div>
          <div className="panel-bottom">
            <Clock size={14} /> About 60–90 minutes. Make it your own.
          </div>
        </section>
        <section className="panel progress-panel">
          <div className="panel-heading">
            <div>
              <h3>Preparation progress</h3>
              <p>Your foundation, topic by topic.</p>
            </div>
            <Link href="/analytics" className="text-link">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="topic-bars">
            {[
              "AI Literacy",
              "DBMS",
              "SQL",
              "OOP",
              "OS",
              "CN",
              "DSA",
              "Debugging",
              "AI Coding",
              "Communication",
            ].map((topic) => {
              const stat = stats.find((x) => x.topic === topic);
              const lessonId =
                topic === "OS"
                  ? "os"
                  : topic === "CN"
                    ? "cn"
                    : topic.toLowerCase().replaceAll(" ", "-");
              const value =
                stat?.completion ??
                (topic === "Debugging"
                  ? (debugSolved / 50) * 100
                  : topic === "AI Coding"
                    ? (aiCoding.filter((q) => solved(p.problems[q.id]?.status))
                        .length /
                        30) *
                      100
                    : p.lessons[lessonId]?.status === "Completed"
                      ? 100
                      : 0);
              return (
                <div key={topic} className="topic-bar">
                  <div>
                    <span>{topic}</span>
                    <strong>{Math.round(value)}%</strong>
                  </div>
                  <Bar value={value} />
                </div>
              );
            })}
          </div>
        </section>
      </div>
      <section className="panel roadmap">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">UNDERSTAND THE JOURNEY</div>
            <h3>Capgemini Exceller simulated process</h3>
          </div>
          <span className="tag blue">6 STAGES</span>
        </div>
        <div className="roadmap-steps">
          {roadmap.map(([label, Icon], i) => (
            <Link
              key={label}
              href={
                i === 0
                  ? "/communication"
                  : i === 4
                    ? "/cognitive"
                    : i === 5
                      ? "/interview"
                      : "/mocks"
              }
            >
              <div className="stage-icon">
                <Icon size={20} />
              </div>
              <small>STAGE {String(i + 1).padStart(2, "0")}</small>
              <strong>{label}</strong>
              {i < 5 && <ArrowRight className="stage-arrow" size={15} />}
            </Link>
          ))}
        </div>
        <div className="roadmap-disclaimer">ⓘ {disclaimer}</div>
      </section>
      <div className="dashboard-columns bottom-columns">
        <section className="panel priority">
          <div className="panel-heading">
            <div>
              <h3>Make your next session count</h3>
              <p>Practice guided by your performance.</p>
            </div>
            <TrendingUp size={18} />
          </div>
          {weakest ? (
            <>
              <span className="tag amber">PRIORITY REVISION</span>
              <h2>{weakest.topic}</h2>
              <p>
                {weakest.accuracy}% accuracy across {weakest.attempted}{" "}
                questions. Revisit incorrect answers and close the gaps.
              </p>
              <Button variant="outline" asChild>
                <Link href={"/practice/" + weakest.topic}>
                  Practice this topic
                  <ArrowRight size={15} />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <span className="tag blue">BUILD YOUR BASELINE</span>
              <h2>Your path starts with a diagnostic.</h2>
              <p>
                Answer your first questions to discover your strengths and focus
                areas.
              </p>
              <Button variant="outline" asChild>
                <Link href="/practice/ai">
                  Start with AI literacy
                  <ArrowRight size={15} />
                </Link>
              </Button>
            </>
          )}
        </section>
        <section className="panel mock-summary">
          <div className="panel-heading">
            <div>
              <h3>Assessment snapshot</h3>
              <p>Real attempts. Measurable improvement.</p>
            </div>
            <Link className="text-link" href="/mocks">
              All mocks
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="snapshot-grid">
            <div>
              <strong>{p.mocks.length}</strong>
              <small>Mocks completed</small>
            </div>
            <div>
              <strong>{average}%</strong>
              <small>Average score</small>
            </div>
            <div>
              <strong>
                {mockScores.length ? Math.max(...mockScores) : 0}%
              </strong>
              <small>Best score</small>
            </div>
          </div>
          <div className="snapshot-topics">
            <span>
              Strongest topic
              <strong>{strongest?.topic ?? "Take a diagnostic"}</strong>
            </span>
            <span>
              Weakest topic
              <strong>{weakest?.topic ?? "Not assessed yet"}</strong>
            </span>
          </div>
          <Link className="mock-cta" href="/mocks">
            <span className="daily-icon">
              <ClipboardCheck size={18} />
            </span>
            <div>
              <strong>{mocks[0].title}</strong>
              <small>20 MCQs · Debugging · AI coding</small>
            </div>
            <ArrowUpRight size={18} />
          </Link>
        </section>
      </div>
    </>
  );
}
function LayersIcon({ size = 18 }: { size?: number }) {
  return <BrainCircuit size={size} />;
}
function Stat({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div>{icon}</div>
      </div>
      <strong className="stat-number">{value}</strong>
      <small>{subtitle}</small>
    </div>
  );
}
export function Analytics() {
  const { progress: p } = useProgress();
  const stats = topicStats(p);
  const attempts = Object.values(p.answers);
  const accuracy = attempts.length
    ? Math.round(
        (attempts.filter((x) => x.correct).length / attempts.length) * 100,
      )
    : 0;
  const mockData = p.mocks.map((m, i) => ({
    name: "Attempt " + (i + 1),
    score: Math.round(
      Object.values(m.scores).reduce((s, x) => s + x, 0) /
        Math.max(Object.values(m.scores).length, 1),
    ),
  }));
  const activity = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return {
      name: d.toLocaleDateString("en", { weekday: "short" }),
      count: p.activity[key] ?? 0,
    };
  });
  return (
    <>
      <Heading
        eyebrow="YOUR PERFORMANCE"
        title="Every attempt tells a story."
        description="Find patterns, identify weak topics, and decide what to practice next."
      />
      <div className="stats-grid">
        <Stat
          title="Questions attempted"
          value={attempts.length}
          subtitle="Unique questions"
          icon={<Target size={18} />}
        />
        <Stat
          title="Accuracy"
          value={accuracy + "%"}
          subtitle="Latest answer per question"
          icon={<Check size={18} />}
        />
        <Stat
          title="Average response"
          value={`${attempts.length ? Math.round(attempts.reduce((s, a) => s + a.seconds, 0) / attempts.length) : 0}s`}
          subtitle="Per MCQ attempt"
          icon={<Clock size={18} />}
        />
        <Stat
          title="Current streak"
          value={streak(p) + " days"}
          subtitle={`Readiness: ${readiness(p)}/100`}
          icon={<Flame size={18} />}
        />
      </div>
      <div className="chart-grid">
        <Chart title="Mock score trend" data={mockData} field="score" area />
        <Chart
          title="Topic accuracy"
          data={stats
            .filter((x) => x.attempted)
            .map((x) => ({ name: x.topic, score: x.accuracy }))}
          field="score"
        />
        <Chart title="Weekly activity" data={activity} field="count" />
        <Chart
          title="AI approach scores"
          data={p.promptScores.map((x, i) => ({
            name: String(i + 1),
            score: x.score,
          }))}
          field="score"
          area
        />
        <Chart
          title="Coding completion"
          data={[
            "Arrays",
            "Strings",
            "Hashing",
            "Two Pointers",
            "Sliding Window",
            "Stack",
            "Queue",
            "Linked List",
            "Binary Search",
            "Sorting",
            "Recursion",
            "Greedy",
            "Trees",
            "Graphs",
          ].map((topic) => ({
            name: topic,
            count: coding.filter(
              (x) => x.topic === topic && solved(p.problems[x.id]?.status),
            ).length,
          }))}
          field="count"
        />
        <Chart
          title="Debugging success rate"
          data={[
            {
              name: "Passed",
              count: Object.values(p.problems).filter(
                (x) => x.kind === "debugging" && solved(x.status),
              ).length,
            },
            {
              name: "In progress",
              count: Object.values(p.problems).filter(
                (x) => x.kind === "debugging" && !solved(x.status),
              ).length,
            },
          ]}
          field="count"
        />
      </div>
      <section className="panel">
        <h3>Topic performance & next practice</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Topic</th>
                <th>Attempted</th>
                <th>Accuracy</th>
                <th>Next step</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.topic}>
                  <td>{s.topic}</td>
                  <td>
                    {s.attempted}/{s.total}
                  </td>
                  <td>{s.attempted ? s.accuracy + "%" : "—"}</td>
                  <td>
                    <Link className="text-link" href={"/practice/" + s.topic}>
                      {s.accuracy < 70
                        ? "Review & practice"
                        : "Keep practicing"}{" "}
                      <ArrowUpRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
function Chart({
  title,
  data,
  field,
  area = false,
}: {
  title: string;
  data: { name: string; score?: number; count?: number }[];
  field: string;
  area?: boolean;
}) {
  return (
    <section className="panel chart-panel">
      <h3>{title}</h3>
      {data.length ? (
        <ResponsiveContainer width="100%" height={230}>
          {area ? (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: "1rem", fill: "var(--muted)" }}
                height={48}
              />
              <YAxis tick={{ fontSize: "1rem", fill: "var(--muted)" }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey={field}
                stroke="#3375df"
                fill="#e4efff"
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: "1rem", fill: "var(--muted)" }}
                height={48}
              />
              <YAxis tick={{ fontSize: "1rem", fill: "var(--muted)" }} />
              <Tooltip />
              <ChartBar dataKey={field} fill="#5188df" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      ) : (
        <Empty
          title="Your data will appear here"
          description="Complete an assessment to start tracking your progress."
        />
      )}
    </section>
  );
}
