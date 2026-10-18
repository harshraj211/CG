"use client";
import { useProgress } from "@/hooks/progress";
export function ReadingControls() {
  const { progress, update } = useProgress();
  return (
    <label className="reading-control">
      <span>Text size</span>
      <select
        aria-label="Reading text size"
        value={progress.settings.textSize}
        onChange={(e) => {
          const textSize = e.target.value as
            "comfortable" | "large" | "extra-large";
          update((p) => ({ ...p, settings: { ...p.settings, textSize } }));
        }}
      >
        <option value="comfortable">A</option>
        <option value="large">A+</option>
        <option value="extra-large">A++</option>
      </select>
    </label>
  );
}
