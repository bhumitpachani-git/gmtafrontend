import { useState, useEffect } from "react";

// Presentational only — the backend's job model reports processing/done, not granular
// sub-steps of a single job, so this is a timed narrative shown while the real job
// polls in the background. It describes real ongoing work generically; it never
// claims a specific fact the backend hasn't actually produced yet.
export default function AgentLog({ step, lines, intervalMs = 1500 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [lines]);

  useEffect(() => {
    if (index >= lines.length - 1) return;
    const t = setTimeout(() => setIndex((i) => i + 1), intervalMs);
    return () => clearTimeout(t);
  }, [index, lines.length, intervalMs]);

  return (
    <div className="mb-4 flex flex-col gap-1.5 font-mono text-xs">
      <div className="text-text-dim">Agent is working on step {step} of 6</div>
      {lines.slice(0, index + 1).map((line, i) => (
        <div key={i} className={i < index ? "text-text-faint" : "text-accent"}>
          {i < index ? "✓" : "›"} {line}
        </div>
      ))}
    </div>
  );
}
