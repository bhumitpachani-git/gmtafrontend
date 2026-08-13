import { display } from "../../utils/text";
import AgentLog from "../AgentLog";

const AGENT_LOG = [
  "searching each company's team...",
  "cross-referencing job titles...",
  "verifying LinkedIn profiles...",
];

function initials(name) {
  return (name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Rows stream in live via SSE as the backend finds each one, so this renders whatever's
// arrived so far immediately rather than waiting for `loading` to clear.
export default function Step5DecisionMakers({ decisionMakers, loading }) {
  if (!decisionMakers || (decisionMakers.length === 0 && loading)) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <AgentLog step={5} lines={AGENT_LOG} />
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

  if (usable.length === 0 && !loading) {
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
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Job title</th>
              <th className="px-4 py-3">Company</th>
            </tr>
          </thead>
          <tbody>
            {usable.map((p) => (
              <tr key={p.originalIndex} className="border-b border-border last:border-0 hover:bg-panel">
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

      {loading && (
        <div className="mt-3 flex items-center gap-1.5 font-mono text-xs text-text-faint">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          still searching for more...
        </div>
      )}
    </div>
  );
}
