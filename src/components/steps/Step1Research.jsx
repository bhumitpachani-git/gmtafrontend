import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isRealValue } from "../../utils/text";
import { domainOf } from "../../utils/url";
import Favicon from "../Favicon";

// Presentational only — the backend's job model only reports processing/done, not
// sub-steps of a single crawl, so this is a timed narrative shown while the real job
// polls in the background. It never claims a fact the backend didn't actually produce.
const SCRIPT = [
  "fetching {domain}...",
  "reading /pricing and /about...",
  "extracting what you sell and to whom...",
];

function ResearchingChecklist({ url }) {
  const [index, setIndex] = useState(0);
  const domain = domainOf(url);

  useEffect(() => {
    if (index >= SCRIPT.length - 1) return;
    const t = setTimeout(() => setIndex((i) => i + 1), 2200);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div>
      <div className="mb-4 text-sm text-text-dim">Explee agent is working on step 1 of 6</div>
      <div className="flex flex-col gap-2 font-mono text-sm">
        {SCRIPT.slice(0, index + 1).map((line, i) => (
          <div key={i} className={i < index ? "text-text-faint" : "text-text"}>
            {i < index ? "✓" : "›"} {line.replace("{domain}", domain)}
          </div>
        ))}
      </div>

      <div className="mt-24 text-center">
        <div className="text-sm text-text-faint">Researching</div>
        <div className="mt-2 text-2xl font-bold text-text-dim">{domain}</div>
      </div>
    </div>
  );
}

function StatPill({ icon, children }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-panel-2 px-3 py-1.5 text-sm text-text-dim">
      <span>{icon}</span>
      {children}
    </div>
  );
}

function CompanyCard({ company, url }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-panel p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Favicon url={url} name={company.companyName} size={40} className="rounded-lg text-lg" />
          <div>
            <div className="text-lg font-bold text-text">{company.companyName}</div>
            <div className="text-sm text-text-faint">{domainOf(url)}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-text-dim">
          ✓ Found
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-text-dim">{company.whatTheyDo}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {isRealValue(company.foundedYear, { maxLength: 24 }) && (
          <StatPill icon="📅">{company.foundedYear}</StatPill>
        )}
        {isRealValue(company.teamSize, { maxLength: 24 }) && (
          <StatPill icon="👥">{company.teamSize}</StatPill>
        )}
        {company.headquarters?.city && (
          <StatPill icon="📍">
            {company.headquarters.city}
            {company.headquarters.country ? `, ${company.headquarters.country}` : ""}
          </StatPill>
        )}
      </div>
    </motion.div>
  );
}

export default function Step1Research({ url, company, loading, onNext }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <AnimatePresence mode="wait">
        {loading || !company ? (
          <motion.div key="loading" exit={{ opacity: 0 }}>
            <ResearchingChecklist url={url} />
          </motion.div>
        ) : (
          <motion.div key="result">
            <CompanyCard company={company} url={url} />
            <button
              onClick={onNext}
              className="mt-6 w-full rounded-lg bg-accent py-3 font-semibold text-black transition hover:bg-accent-2"
            >
              Continue to competitors →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
