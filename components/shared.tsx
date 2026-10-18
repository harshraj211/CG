"use client";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useProgress } from "@/hooks/progress";
import { Button } from "./ui/button";
export function BookmarkButton({ id }: { id: string }) {
  const { progress, bookmark } = useProgress();
  const active = progress.bookmarks.includes(id);
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={active ? "Remove bookmark" : "Bookmark"}
      title={active ? "Remove bookmark" : "Bookmark"}
      onClick={() => bookmark(id)}
    >
      {active ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
    </Button>
  );
}
export function AttachedNote({ id }: { id: string }) {
  const { progress, update } = useProgress();
  return (
    <details className="attached-note">
      <summary>Personal notes</summary>
      <textarea
        aria-label="Personal notes"
        placeholder="Capture an insight or a mistake to revisit. Autosaved locally."
        value={progress.notes[id]?.text ?? ""}
        onChange={(e) => {
          const text = e.target.value;
          update((p) => ({
            ...p,
            notes: {
              ...p.notes,
              [id]: {
                text,
                attachment: id,
                updatedAt: new Date().toISOString(),
              },
            },
          }));
        }}
      />
      <span className="muted small-text">Saved on this device</span>
    </details>
  );
}
export function Heading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Bar({ value }: { value: number }) {
  return (
    <div className="progress-track">
      <div style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
export function Empty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="empty">
      <div className="empty-dot">↗</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
export const disclaimer =
  "Practice qualification thresholds are simulations and are not official Capgemini cutoffs.";
