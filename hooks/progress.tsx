"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import type {
  UserProgress,
  MCQQuestion,
  ProblemProgress,
  MockAttempt,
} from "@/types";
import { initialProgress, LocalProgressRepository } from "@/services/storage";
import { today, dateKey } from "@/lib/assessment";
interface Store {
  progress: UserProgress;
  ready: boolean;
  error: string;
  update: (f: (p: UserProgress) => UserProgress) => void;
  bookmark: (id: string) => void;
  answer: (q: MCQQuestion, selected: number, seconds: number) => void;
  problem: (id: string, value: ProblemProgress) => void;
  saveMock: (a: MockAttempt) => void;
  reset: () => void;
}
const Context = createContext<Store | null>(null);
export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(initialProgress);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const writable = useRef(true);
  useEffect(() => {
    try {
      setProgress(new LocalProgressRepository().load());
    } catch (e) {
      writable.current = false;
      setError(
        e instanceof Error
          ? e.message
          : "Local storage unavailable. Progress is kept in memory.",
      );
    }
    setReady(true);
  }, []);
  const update = useCallback((f: (p: UserProgress) => UserProgress) => {
    setProgress((p) => {
      const next = f(p);
      try {
        if (writable.current) new LocalProgressRepository().save(next);
      } catch {
        setTimeout(
          () =>
            setError(
              "Local storage is unavailable or full. Export progress in Settings; this session remains usable.",
            ),
          0,
        );
      }
      return next;
    });
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = progress.settings.theme;
    document.documentElement.dataset.textSize = progress.settings.textSize;
  }, [progress.settings.theme, progress.settings.textSize]);
  const bookmark = (id: string) =>
    update((p) => ({
      ...p,
      bookmarks: p.bookmarks.includes(id)
        ? p.bookmarks.filter((x) => x !== id)
        : [...p.bookmarks, id],
    }));
  const answer = (q: MCQQuestion, selected: number, seconds: number) =>
    update((p) => {
      const prev = p.answers[q.id];
      const correct = selected === q.correctAnswer;
      const interval = correct ? Math.min((prev?.interval ?? -1) + 1, 3) : 0;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + [0, 1, 3, 7][interval]);
      return {
        ...p,
        answers: {
          ...p.answers,
          [q.id]: {
            correct,
            selected,
            seconds,
            attempts: (prev?.attempts ?? 0) + 1,
            interval,
            due: dateKey(dueDate),
            date: today(),
          },
        },
        activity: { ...p.activity, [today()]: (p.activity[today()] ?? 0) + 1 },
      };
    });
  const problem = (id: string, value: ProblemProgress) =>
    update((p) => ({
      ...p,
      problems: { ...p.problems, [id]: value },
      activity: { ...p.activity, [today()]: (p.activity[today()] ?? 0) + 1 },
    }));
  const saveMock = (a: MockAttempt) =>
    update((p) => ({
      ...p,
      activeMock: a.stage === "result" ? null : a,
      mocks:
        a.stage === "result"
          ? [...p.mocks.filter((m) => m.id !== a.id), a]
          : p.mocks,
      activity:
        a.stage === "result"
          ? { ...p.activity, [today()]: (p.activity[today()] ?? 0) + 1 }
          : p.activity,
    }));
  const reset = () => {
    writable.current = true;
    setError("");
    update(() => initialProgress());
  };
  return (
    <Context.Provider
      value={{
        progress,
        ready,
        error,
        update,
        bookmark,
        answer,
        problem,
        saveMock,
        reset,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useProgress() {
  const value = useContext(Context);
  if (!value) throw new Error("ProgressProvider required");
  return value;
}
