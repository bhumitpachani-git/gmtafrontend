import { useState } from "react";
import { motion } from "framer-motion";

function initials(name) {
  return (name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Our system tries one method at a time (crawl the site, then fall back to an SMTP-verified
// guess), not several parallel third-party providers — this badge reflects which one
// actually succeeded, rather than faking simultaneous attempts that didn't happen.
const SOURCE_STYLE = {
  website: { label: "found on website", cls: "bg-emerald-500/15 text-emerald-400" },
  "pattern-verified": { label: "SMTP verified", cls: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30" },
  "pattern-guess": { label: "unverified guess", cls: "bg-amber-500/15 text-amber-400" },
};

function SourceBadge({ source }) {
  if (!source) {
    return <span className="rounded-full bg-panel-2 px-2 py-0.5 text-[11px] text-text-faint">no email found</span>;
  }
  const style = SOURCE_STYLE[source] || SOURCE_STYLE["pattern-guess"];
  return <span className={`rounded-full px-2 py-0.5 text-[11px] ${style.cls}`}>{style.label}</span>;
}

function PendingBadge() {
  return (
    <span className="flex items-center gap-1 rounded-full bg-panel-2 px-2 py-0.5 text-[11px] text-text-faint">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
      writing...
    </span>
  );
}

// people is known immediately from step 5's results; emails grows one entry at a time as
// each person's write finishes, so the list and the selected draft update independently
// instead of waiting on one long batch job that can time out with many people queued up.
export default function Step6WriteEmails({ people, emails, loading }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!people || people.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center text-text-dim">
        No decision-makers were carried into this step — nothing to email.
      </div>
    );
  }

  const rows = people.map((p, i) => ({ person: p, result: emails?.[i] || null, done: i < (emails?.length || 0) }));
  const active = rows[activeIndex] || rows[0];

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 py-10 md:grid-cols-[320px_1fr]">
      <div className="flex flex-col gap-2 overflow-y-auto">
        {loading && (
          <div className="mb-1 font-mono text-xs text-text-dim">
            Writing emails — {emails?.length || 0}/{people.length} done
          </div>
        )}
        {rows.map((row, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`rounded-lg border p-3 text-left transition ${
              i === activeIndex ? "border-accent bg-panel" : "border-border bg-panel hover:border-text-faint"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-panel-2 text-[11px] font-semibold text-text-dim">
                {initials(row.person.personName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-text">
                  {row.person.personName}
                  {row.person.personLinkedIn && <span className="ml-1 text-text-faint">in</span>}
                </div>
                <div className="truncate text-xs text-text-faint">
                  {row.person.personTitle} · {row.person.company}
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              {row.done ? <SourceBadge source={row.result?.emailSource} /> : <PendingBadge />}
              {row.done && row.result?.email && (
                <span className="truncate text-[11px] text-text-faint">{row.result.email}</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <motion.div
        key={activeIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-border bg-panel p-6"
      >
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-panel-2 text-sm font-semibold text-text-dim">
            {initials(active.person.personName)}
          </div>
          <div>
            <div className="font-medium text-text">{active.person.personName}</div>
            <div className="text-xs text-text-faint">
              {active.person.personTitle} · {active.person.company}
            </div>
          </div>
        </div>

        {!active.done ? (
          <div className="mt-4 flex flex-col gap-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-panel-2" />
            <div className="h-24 animate-pulse rounded bg-panel-2" />
            <p className="text-xs text-text-faint">Writing this email…</p>
          </div>
        ) : active.result?.outreachEmail ? (
          <div className="mt-4">
            <div className="text-sm font-semibold text-text">{active.result.outreachEmail.subject}</div>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-text-dim">
              {active.result.outreachEmail.body}
            </p>
            <p className="mt-4 text-xs text-text-faint">
              AI-generated draft — review before sending. Not sent automatically.
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-text-faint">
            No email draft was generated for this person — no contact address was found.
          </p>
        )}
      </motion.div>
    </div>
  );
}
