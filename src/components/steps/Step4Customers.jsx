import { display } from "../../utils/text";
import { domainOf } from "../../utils/url";
import Favicon from "../Favicon";
import AgentLog from "../AgentLog";

const AGENT_LOG = [
  "searching for potential customers...",
  "checking company websites...",
  "collecting company details...",
  "filtering out dead links...",
];

// Rows stream in live via SSE as the backend finds each one, so this renders whatever's
// arrived so far immediately rather than waiting for `loading` to clear — the agent log
// only covers the gap before the very first result shows up.
export default function Step4Customers({ customers, loading }) {
  if (!customers || (customers.length === 0 && loading)) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <AgentLog step={4} lines={AGENT_LOG} />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-panel-2" />
          ))}
        </div>
      </div>
    );
  }

  // Keep the original array index attached — the backend's customerIndexes refer to
  // positions in the full `customers` array, not this filtered display list.
  const usable = customers
    .map((c, originalIndex) => ({ ...c, originalIndex }))
    .filter((c) => c.name && !c.error);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-text-faint">
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Location</th>
            </tr>
          </thead>
          <tbody>
            {usable.map((c) => (
              <tr key={c.originalIndex} className="border-b border-border last:border-0 hover:bg-panel">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Favicon url={c.website} name={c.name} size={16} className="rounded-sm" />
                    <div>
                      <div className="font-medium text-text">{c.name}</div>
                      <div className="text-xs text-text-faint">{domainOf(c.website) || "—"}</div>
                    </div>
                  </div>
                </td>
                <td className="max-w-xs px-4 py-3 text-text-dim">
                  {display(c.description) !== "—" ? display(c.description) : display(c.category)}
                </td>
                <td className="px-4 py-3 text-text-dim">{display(c.address)}</td>
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
