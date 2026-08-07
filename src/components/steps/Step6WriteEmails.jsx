import { useState, useEffect } from "react";
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

const AGENT_LOG = [
  "picking the hottest lead...",
  "reading their company signals...",
  "drafting the first email...",
  "personalizing the opener...",
];

function AgentLog() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (index >= AGENT_LOG.length - 1) return;
    const t = setTimeout(() => setIndex((i) => i + 1), 1500);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div className="mb-4 flex flex-col gap-1.5 font-mono text-xs">
      <div className="text-text-dim">Agent is working on step 6 of 6</div>
      {AGENT_LOG.slice(0, index + 1).map((line, i) => (
        <div key={i} className={i < index ? "text-text-faint" : "text-accent"}>
          {i < index ? "✓" : "›"} {line}
        </div>
      ))}
    </div>
  );
}

export default function Step6WriteEmails({ emails, loading }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (loading || !emails) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <AgentLog />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-panel-2" />
          ))}
        </div>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center text-text-dim">
        No usable contact was found for the selected people — nothing to email.
      </div>
    );
  }

  const active = emails[activeIndex] || emails[0];

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 py-10 md:grid-cols-[320px_1fr]">
      <div className="flex flex-col gap-2 overflow-y-auto">
        {emails.map((p, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`rounded-lg border p-3 text-left transition ${
              i === activeIndex ? "border-accent bg-panel" : "border-border bg-panel hover:border-text-faint"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-panel-2 text-[11px] font-semibold text-text-dim">
                {initials(p.personName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-text">
                  {p.personName}
                  {p.personLinkedIn && <span className="ml-1 text-text-faint">in</span>}
                </div>
                <div className="truncate text-xs text-text-faint">
                  {p.personTitle} · {p.company}
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <SourceBadge source={p.emailSource} />
              {p.email && <span className="truncate text-[11px] text-text-faint">{p.email}</span>}
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
            {initials(active.personName)}
          </div>
          <div>
            <div className="font-medium text-text">{active.personName}</div>
            <div className="text-xs text-text-faint">
              {active.personTitle} · {active.company}
            </div>
          </div>
        </div>

        {active.outreachEmail ? (
          <div className="mt-4">
            <div className="text-sm font-semibold text-text">{active.outreachEmail.subject}</div>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-text-dim">
              {active.outreachEmail.body}
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
