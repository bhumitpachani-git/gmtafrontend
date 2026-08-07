import { useState } from "react";
import { display } from "../../utils/text";

function initials(name) {
  return (name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Step5DecisionMakers({ decisionMakers, loading, onNext }) {
  const [selected, setSelected] = useState(new Set());

  function toggle(i) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  if (loading || !decisionMakers) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-panel-2" />
          ))}
        </div>
      </div>
    );
  }

  const usable = decisionMakers
    .map((p, originalIndex) => ({ ...p, originalIndex }))
    .filter((p) => p.personName);

  if (usable.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-text-dim">
          No named decision-makers were found for the selected companies. This is common for
          large, well-known companies whose leadership isn't publicly listed on a simple page
          — try selecting different/smaller companies in the previous step.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-text-faint">
              <th className="w-10 px-4 py-3" />
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Job title</th>
              <th className="px-4 py-3">Company</th>
            </tr>
          </thead>
          <tbody>
            {usable.map((p) => (
              <tr key={p.originalIndex} className="border-b border-border last:border-0 hover:bg-panel">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(p.originalIndex)}
                    onChange={() => toggle(p.originalIndex)}
                    className="accent-emerald-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-panel-2 text-[11px] font-semibold text-text-dim">
                      {initials(p.personName)}
                    </div>
                    <span className="font-medium text-text">{p.personName}</span>
                    {p.personLinkedIn && (
                      <a
                        href={p.personLinkedIn}
                        target="_blank"
                        rel="noreferrer"
                        className="text-text-faint hover:text-accent"
                        title="LinkedIn profile"
                      >
                        in
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-text-dim">{display(p.personTitle)}</td>
                <td className="px-4 py-3 text-text-dim">{p.company}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => onNext([...selected])}
        disabled={selected.size === 0}
        className="mt-6 w-full rounded-lg bg-accent py-3 font-semibold text-black transition hover:bg-accent-2 disabled:opacity-40"
      >
        Write emails to {selected.size || ""} selected person{selected.size === 1 ? "" : "s"} →
      </button>
    </div>
  );
}
