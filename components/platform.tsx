"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Code2,
  Sparkles,
  ClipboardCheck,
  MessageSquare,
  BarChart3,
  Bookmark,
  NotebookPen,
  Settings,
  ChevronDown,
  ArrowUpRight,
  Menu,
  Search,
  ChevronRight,
  GraduationCap,
  PanelLeftClose,
  Moon,
  Sun,
  BrainCircuit,
} from "lucide-react";
import { useProgress } from "@/hooks/progress";
import { ReadingControls } from "./reading-controls";
import { lessons, allProblems, allQuestions, interviews } from "@/data";
import { Dashboard, Analytics } from "@/features/dashboard";
import { Preparation } from "@/features/preparation";
import { Practice } from "@/features/mcq";
import { ProblemList, ProblemWorkspace } from "@/features/coding";
import { AICoding } from "@/features/ai-coding";
import { MockTests } from "@/features/mock-tests";
import { CognitiveGames } from "@/features/cognitive-games";
import {
  Interview,
  Notes,
  Bookmarks,
  SettingsPage,
  Communication,
} from "@/features/other";
const nav = [
  ["Dashboard", "/", LayoutDashboard],
  ["Coding Practice", "/coding", Code2],
  ["AI Coding", "/ai-coding", Sparkles],
  ["Mock Tests", "/mocks", ClipboardCheck],
  ["Communication", "/communication", MessageSquare],
  ["Cognitive Games", "/cognitive", BrainCircuit],
  ["Interview Prep", "/interview", GraduationCap],
  ["Analytics", "/analytics", BarChart3],
  ["Bookmarks", "/bookmarks", Bookmark],
  ["Notes", "/notes", NotebookPen],
] as const;
export function Platform() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const section = segments[0] ?? "dashboard";
  const id = segments[1];
  const { ready, error, progress, update } = useProgress();
  const [mobile, setMobile] = useState(false);
  const [prep, setPrep] = useState(section === "preparation");
  const [practice, setPractice] = useState(section === "practice");
  const [search, setSearch] = useState("");
  const exam = section === "mocks" && !!progress.activeMock;
  const links = [
    {
      title: "Cognitive games: switch, memory, digits and spatial reasoning",
      type: "Games",
      url: "/cognitive",
    },
    ...lessons.map((l) => ({
      title: l.title,
      type: "Learn",
      url: "/preparation/" + l.id,
    })),
    ...allProblems.map((p) => ({
      title: p.title,
      type: p.id.startsWith("debug")
        ? "Debugging"
        : p.id.startsWith("ai-")
          ? "AI Coding"
          : "Coding",
      url: `/${p.id.startsWith("debug") ? "debugging" : p.id.startsWith("ai-") ? "ai-coding" : "coding"}/${p.id}`,
    })),
    ...allQuestions.map((q) => ({
      title: q.question,
      type: q.topic,
      url: "/practice/" + q.id,
    })),
    ...interviews.map((q) => ({
      title: q.question,
      type: "Interview",
      url: "/interview/" + q.id,
    })),
  ];
  let content: React.ReactNode;
  switch (section) {
    case "dashboard":
      content = <Dashboard />;
      break;
    case "preparation":
      content = <Preparation id={id} />;
      break;
    case "practice":
      content = <Practice key={id} filter={id} />;
      break;
    case "coding":
    case "debugging": {
      const p = allProblems.find((p) => p.id === id);
      content = p ? (
        <ProblemWorkspace
          key={p.id}
          problem={p}
          kind={section === "debugging" ? "debugging" : "coding"}
        />
      ) : (
        <ProblemList kind={section === "debugging" ? "debugging" : "coding"} />
      );
      break;
    }
    case "ai-coding":
      content = <AICoding id={id} />;
      break;
    case "mocks":
      content = <MockTests />;
      break;
    case "cognitive":
      content = <CognitiveGames key={id ?? "hub"} id={id} />;
      break;
    case "analytics":
      content = <Analytics />;
      break;
    case "interview":
      content = <Interview id={id} />;
      break;
    case "bookmarks":
      content = <Bookmarks />;
      break;
    case "notes":
      content = <Notes />;
      break;
    case "settings":
      content = <SettingsPage />;
      break;
    case "communication":
      content = <Communication />;
      break;
    default:
      content = (
        <div className="empty">
          <h1>Page not found</h1>
          <Link href="/">Return to dashboard</Link>
        </div>
      );
  }
  return (
    <div className={`app-shell ${exam ? "exam-shell" : ""}`}>
      {!exam && (
        <>
          <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
            <Link className="brand" href="/">
              <span className="brand-mark">
                <Layers size={23} />
              </span>
              <span>
                exceller<span className="brand-light">prep</span>
                <small>YOUR NEXT CHAPTER</small>
              </span>
            </Link>
            <div className="cohort">
              <span className="cohort-icon">27</span>
              <div>
                Capgemini Exceller<small>Class of 2027</small>
              </div>
              <ChevronDown size={14} />
            </div>
            <div className="nav-label">WORKSPACE</div>
            <nav>
              <Link
                className={`nav-item ${section === "dashboard" ? "active" : ""}`}
                href="/"
                onClick={() => setMobile(false)}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <button
                className={`nav-item ${section === "preparation" ? "active" : ""}`}
                onClick={() => setPrep(!prep)}
              >
                <BookOpen size={18} />
                Preparation
                <ChevronDown size={14} className={prep ? "rotate" : ""} />
              </button>
              {prep && (
                <div className="subnav">
                  {lessons.map((l) => (
                    <Link
                      key={l.id}
                      href={"/preparation/" + l.id}
                      onClick={() => setMobile(false)}
                    >
                      {l.title}
                    </Link>
                  ))}
                </div>
              )}
              <button
                className={`nav-item ${section === "practice" || section === "debugging" ? "active" : ""}`}
                onClick={() => setPractice(!practice)}
              >
                <Layers size={18} />
                Practice
                <ChevronDown size={14} className={practice ? "rotate" : ""} />
              </button>
              {practice && (
                <div className="subnav">
                  {[
                    ["AI MCQs", "ai"],
                    ["Technical MCQs", "technical"],
                    ["SQL", "SQL"],
                    ["Reasoning", "reasoning"],
                    ["Revision Queue", "revision"],
                  ].map(([label, key]) => (
                    <Link
                      key={key}
                      href={"/practice/" + key}
                      onClick={() => setMobile(false)}
                    >
                      {label}
                    </Link>
                  ))}
                  <Link href="/debugging">Debugging</Link>
                </div>
              )}
              {nav.slice(1).map(([label, url, Icon], i) => (
                <div key={url}>
                  {i === 6 && (
                    <div className="nav-label spaced">YOUR LIBRARY</div>
                  )}
                  <Link
                    className={`nav-item ${pathname.startsWith(url) ? "active" : ""}`}
                    href={url}
                    onClick={() => setMobile(false)}
                  >
                    <Icon size={18} />
                    {label}
                    {label === "AI Coding" && (
                      <span className="nav-badge">AI</span>
                    )}
                  </Link>
                </div>
              ))}
            </nav>
            <div className="sidebar-bottom">
              <div className="prep-note">
                <span className="live-dot" /> A little progress, every day.
                <p>Your next role starts here.</p>
              </div>
              <Link
                className={`nav-item ${section === "settings" ? "active" : ""}`}
                href="/settings"
              >
                <Settings size={18} />
                Settings
              </Link>
              <div className="profile">
                <div className="avatar">Y</div>
                <div>
                  Your workspace<small>Local preparation profile</small>
                </div>
                <Link href="/settings" aria-label="Workspace settings">
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </aside>
          {mobile && (
            <button
              className="mobile-scrim"
              aria-label="Close menu"
              onClick={() => setMobile(false)}
            />
          )}
        </>
      )}
      <div className="main-shell">
        {!exam && (
          <header className="topbar">
            <div className="breadcrumb">
              <button
                className="mobile-menu"
                aria-label="Open menu"
                onClick={() => setMobile(!mobile)}
              >
                <Menu size={20} />
              </button>
              <PanelLeftClose size={16} />
              <span>Workspace</span>
              <ChevronRight size={13} />
              <strong>
                {section === "dashboard"
                  ? "Dashboard"
                  : section.replaceAll("-", " ")}
              </strong>
            </div>
            <div className="top-actions">
              <button
                className="theme-toggle"
                type="button"
                disabled={!ready}
                aria-label={
                  progress.settings.theme === "dark"
                    ? "Switch to light theme"
                    : "Switch to pure black theme"
                }
                title={
                  progress.settings.theme === "dark"
                    ? "Switch to light theme"
                    : "Switch to pure black theme"
                }
                onClick={() =>
                  update((p) => ({
                    ...p,
                    settings: {
                      ...p.settings,
                      theme: p.settings.theme === "dark" ? "light" : "dark",
                    },
                  }))
                }
              >
                {progress.settings.theme === "dark" ? (
                  <Sun size={18} />
                ) : (
                  <Moon size={18} />
                )}
                <span>
                  {progress.settings.theme === "dark" ? "Light" : "Dark"}
                </span>
              </button>
              <ReadingControls />
              <div className="global-search">
                <Search size={16} />
                <input
                  aria-label="Search preparation"
                  placeholder="Search anything..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <kbd>⌕</kbd>
                {search && (
                  <div className="search-results">
                    {links
                      .filter((l) =>
                        l.title.toLowerCase().includes(search.toLowerCase()),
                      )
                      .slice(0, 7)
                      .map((l, i) => (
                        <Link
                          key={i}
                          href={l.url}
                          onClick={() => setSearch("")}
                        >
                          <small>{l.type}</small>
                          {l.title}
                        </Link>
                      ))}
                  </div>
                )}
              </div>
              <span className="local-status">
                <span className="live-dot" />
                Saved locally
              </span>
              <div className="avatar small-avatar">Y</div>
            </div>
          </header>
        )}
        <main className={exam ? "exam-main" : "main-content"}>
          {error && (
            <div role="alert" className="alert">
              {error}
            </div>
          )}
          {ready ? (
            content
          ) : (
            <div className="loading">Loading your preparation workspace…</div>
          )}
        </main>
        {!exam && (
          <footer>
            Independent preparation platform · Not affiliated with Capgemini
            <span>
              Built for your next chapter <ArrowUpRight size={12} />
            </span>
          </footer>
        )}
      </div>
    </div>
  );
}
