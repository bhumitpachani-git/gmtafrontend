import { useState } from "react";
import { motion } from "framer-motion";

const ICONS = ["🎯", "🏢", "💼", "📦", "🔧", "🚀"];

export default function Step3Campaigns({ campaigns, loading, onNext }) {
  const [selected, setSelected] = useState(new Set());

  function toggle(i) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  if (loading || !campaigns) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-panel-2" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-4 text-sm text-text-dim">
        Select which customer segments to search for
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {campaigns.map((c, i) => {
          const isSelected = selected.has(i);
          return (
            <motion.button
              key={i}
              data-testid="campaign-card"
              onClick={() => toggle(i)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-xl border p-5 text-left transition ${
                isSelected ? "border-accent bg-panel" : "border-border bg-panel hover:border-text-faint"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{ICONS[i % ICONS.length]}</span>
                  <span className="font-semibold capitalize text-text">{c.searchQuery}</span>
                </div>
                <span className="rounded-full bg-panel-2 px-2 py-0.5 text-[11px] uppercase text-text-faint">
                  {c.type}
                </span>
              </div>

              <p className="mt-3 text-sm text-text-dim">{c.reason}</p>

              {c.pain && (
                <div className="mt-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-text-faint">
                    Pain
                  </div>
                  <div className="mt-1 border-l-2 border-border pl-2 text-sm text-text-dim">
                    {c.pain}
                  </div>
                </div>
              )}

              {c.criteria?.length > 0 && (
                <div className="mt-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-text-faint">
                    Criteria
                  </div>
                  <ul className="mt-1 flex flex-col gap-1">
                    {c.criteria.map((crit, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-text-dim">
                        <span className="h-1.5 w-1.5 rounded-full bg-text-faint" />
                        {crit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <button
        onClick={() => onNext([...selected])}
        disabled={selected.size === 0}
        className="mt-8 w-full rounded-lg bg-accent py-3 font-semibold text-black transition hover:bg-accent-2 disabled:opacity-40"
      >
        Find customers for {selected.size || ""} selected campaign{selected.size === 1 ? "" : "s"} →
      </button>
    </div>
  );
}
