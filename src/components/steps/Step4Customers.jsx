import { useState } from "react";
import { display } from "../../utils/text";
import { domainOf } from "../../utils/url";
import Favicon from "../Favicon";

export default function Step4Customers({ customers, loading, onNext }) {
  const [selected, setSelected] = useState(new Set());

  function toggle(i) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  if (loading || !customers) {
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
              <th className="w-10 px-4 py-3" />
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Location</th>
            </tr>
          </thead>
          <tbody>
            {usable.map((c) => (
              <tr key={c.originalIndex} className="border-b border-border last:border-0 hover:bg-panel">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(c.originalIndex)}
                    onChange={() => toggle(c.originalIndex)}
                    className="accent-emerald-500"
                  />
                </td>
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

      <button
        onClick={() => onNext([...selected])}
        disabled={selected.size === 0}
        className="mt-6 w-full rounded-lg bg-accent py-3 font-semibold text-black transition hover:bg-accent-2 disabled:opacity-40"
      >
        Find decision makers for {selected.size || ""} selected compan
        {selected.size === 1 ? "y" : "ies"} →
      </button>
    </div>
  );
}
