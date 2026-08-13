import { motion } from "framer-motion";
import AgentLog from "../AgentLog";
import { useStaggeredReveal } from "../../hooks/useStaggeredReveal";

const ICONS = ["🎯", "🏢", "💼", "📦", "🔧", "🚀"];

const AGENT_LOG = [
  "analyzing your customer base...",
  "identifying market segments...",
  "defining campaign criteria...",
];

export default function Step3Campaigns({ campaigns, loading }) {
  const visible = useStaggeredReveal(campaigns, 250);

  if (!campaigns) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <AgentLog step={3} lines={AGENT_LOG} />
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
      <div className="mb-4 text-sm text-text-dim">Customer segments found · {campaigns.length}</div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {visible.map((c, i) => {
          return (
            <motion.div
              key={i}
              data-testid="campaign-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-panel p-5 text-left"
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
            </motion.div>
          );
        })}
        {visible.length < campaigns.length &&
          Array.from({ length: campaigns.length - visible.length }).map((_, i) => (
            <div key={`pending-${i}`} className="h-48 animate-pulse rounded-xl bg-panel-2" />
          ))}
      </div>
    </div>
  );
}
