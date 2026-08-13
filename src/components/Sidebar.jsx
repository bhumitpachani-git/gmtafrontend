import { useState } from "react";
import Favicon from "./Favicon";
import { domainOf } from "../utils/url";
import { isRealValue } from "../utils/text";

const STEP_LABELS = [
  "Research your company",
  "Explore competitors",
  "Define campaigns",
  "Find potential customers",
  "Find decision makers",
  "Write emails",
];

const CAMPAIGN_ICONS = ["🎯", "🏢", "💼", "📦", "🔧", "🚀"];
const COMPETITOR_PREVIEW_COUNT = 8;

function StatPill({ children }) {
  return (
    <div className="rounded bg-panel-2 px-2 py-1 text-[11px] text-text-dim">{children}</div>
  );
}

function CompanySummary({ company, url }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mb-5 border-b border-border pb-4">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center gap-2 text-left"
      >
        <Favicon url={url} name={company.companyName} size={32} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-text">{company.companyName}</div>
          <div className="truncate text-xs text-text-faint">{domainOf(url)}</div>
        </div>
        <span className="shrink-0 text-xs text-text-faint">{expanded ? "▾" : "▸"}</span>
      </button>

      {expanded && (
        <div className="mt-3">
          {company.whatTheyDo && (
            <p className="text-xs leading-relaxed text-text-dim">{company.whatTheyDo}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {isRealValue(company.foundedYear, { maxLength: 24 }) && (
              <StatPill>{company.foundedYear}</StatPill>
            )}
            {isRealValue(company.teamSize, { maxLength: 24 }) && (
              <StatPill>{company.teamSize} emp</StatPill>
            )}
            {company.headquarters?.city && <StatPill>{company.headquarters.city}</StatPill>}
          </div>
        </div>
      )}
    </div>
  );
}

function CompetitorsSummary({ competitors }) {
  const [showAll, setShowAll] = useState(false);
  if (!competitors?.length) return null;

  const shown = showAll ? competitors : competitors.slice(0, COMPETITOR_PREVIEW_COUNT);
  const remaining = competitors.length - shown.length;

  return (
    <div className="mb-5 border-b border-border pb-4">
      <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-text-faint">
        <span>Competitors</span>
        <span>{competitors.length}</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {shown.map((c, i) => (
          <a
            key={i}
            href={c.website}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 truncate rounded bg-panel-2 px-2 py-1.5 text-[11px] text-text-dim hover:bg-panel"
            title={domainOf(c.website)}
          >
            <Favicon url={c.website} name={c.name} size={14} className="rounded-sm" />
            <span className="truncate">{domainOf(c.website)}</span>
          </a>
        ))}
      </div>
      {remaining > 0 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-2 text-[11px] text-text-faint hover:text-text-dim"
        >
          +{remaining} more
        </button>
      )}
    </div>
  );
}

function CampaignsSummary({ campaigns }) {
  if (!campaigns?.length) return null;

  return (
    <div className="mb-5 border-b border-border pb-4">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-faint">
        Campaigns · {campaigns.length}
      </div>
      <div className="flex flex-col gap-1.5">
        {campaigns.map((c, i) => (
          <div
            key={i}
            className="flex items-center gap-2 truncate rounded bg-panel-2 px-2 py-1.5 text-xs text-text-dim"
          >
            <span>{CAMPAIGN_ICONS[i % CAMPAIGN_ICONS.length]}</span>
            <span className="truncate capitalize">{c.searchQuery}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Sidebar({ currentStep, company, url, competitors, campaigns }) {
  return (
    <aside className="hidden h-full w-72 shrink-0 overflow-y-auto border-r border-border p-5 md:block">
      {company && <CompanySummary company={company} url={url} />}
      {currentStep > 2 && <CompetitorsSummary competitors={competitors} />}
      {currentStep > 3 && <CampaignsSummary campaigns={campaigns} />}

      <div className="flex flex-col gap-2.5">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          if (stepNum >= currentStep) return null;
          return (
            <div key={stepNum} className="flex items-center gap-2 text-xs text-text-faint">
              <span className="text-accent">✓</span>
              <span>
                step {stepNum} · {label}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
