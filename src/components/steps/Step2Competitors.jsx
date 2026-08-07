import { motion } from "framer-motion";
import Favicon from "../Favicon";
import { domainOf } from "../../utils/url";

export default function Step2Competitors({ company, competitors, loading, onNext }) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-faint">
            Product
          </div>
          <div className="rounded-xl border border-border bg-panel p-4">
            <p className="text-sm font-semibold text-text">{company?.whatTheyDo}</p>
            {company?.keyFeatures?.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1.5 text-sm text-text-dim">
                {company.keyFeatures.slice(0, 4).map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-text-faint">
            <span>Competitors</span>
            {!loading && competitors && (
              <span className="rounded-full border border-border px-2 py-0.5 text-text-dim normal-case">
                ✓ {competitors.length} found
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {loading || !competitors
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-lg bg-panel-2" />
                ))
              : competitors.map((c, i) => (
                  <motion.a
                    key={i}
                    href={c.website}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-2 rounded-lg bg-panel-2 px-3 py-2.5 text-sm text-text hover:bg-panel"
                  >
                    <Favicon url={c.website} name={c.name} size={16} className="rounded-sm" />
                    <span className="truncate">{domainOf(c.website)}</span>
                  </motion.a>
                ))}
          </div>
        </div>
      </div>

      {!loading && competitors && (
        <button
          onClick={onNext}
          className="mt-8 w-full rounded-lg bg-accent py-3 font-semibold text-black transition hover:bg-accent-2"
        >
          Continue to campaigns →
        </button>
      )}
    </div>
  );
}
