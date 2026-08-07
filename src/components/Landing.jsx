import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Favicon from "./Favicon";
import { domainOf } from "../utils/url";
import { searchCompaniesByName } from "../api/pipeline";

function normalizeUrl(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function useDebounced(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export default function Landing({ onSubmit, loading, error }) {
  const [value, setValue] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const debouncedValue = useDebounced(value, 500);
  const abortRef = useRef(null);

  // Real web search (a few seconds — this is our own search + AI classification, not a
  // pre-built company database, so it's genuinely slower than an instant autocomplete).
  useEffect(() => {
    const query = debouncedValue.trim();
    if (query.length < 2) {
      setResults(null);
      setSearching(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSearching(true);
    searchCompaniesByName(query, controller.signal)
      .then((data) => {
        setResults(data.companies);
        setSearching(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setSearching(false);
      });

    return () => controller.abort();
  }, [debouncedValue]);

  function handleSubmit(e) {
    e.preventDefault();
    const url = normalizeUrl(value);
    if (url) onSubmit(url);
  }

  function selectResult(company) {
    setValue(company.website);
    onSubmit(company.website);
  }

  const showDropdown = value.trim().length >= 2 && !loading;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl text-4xl font-semibold leading-tight text-text sm:text-5xl"
      >
        Find your customers <span className="text-accent">automatically</span>
      </motion.h1>
      <p className="mt-4 max-w-lg text-text-dim">
        Enter your business name or website. We'll research it, find your customers, and
        draft outreach — end to end.
      </p>

      <form onSubmit={handleSubmit} className="relative mt-10 w-full max-w-xl">
        <div className="flex items-center gap-2 rounded-xl border border-accent/60 bg-panel px-4 py-3 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="your company name or yourcompany.com"
            className="flex-1 bg-transparent text-text placeholder:text-text-faint outline-none"
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-black disabled:opacity-40"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
            ) : (
              "→"
            )}
          </button>
        </div>

        <AnimatePresence>
          {showDropdown && (searching || results?.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl border border-border bg-panel text-left shadow-lg"
            >
              {searching && (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-text-faint">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-text-faint/40 border-t-text-faint" />
                  Searching the web for real matches...
                </div>
              )}

              {!searching &&
                results?.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectResult(c)}
                    className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left last:border-0 hover:bg-panel-2"
                  >
                    <Favicon url={c.website} name={c.name} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="shrink-0 text-sm font-semibold text-text">{c.name}</span>
                        <span className="truncate text-xs text-text-faint">{domainOf(c.website)}</span>
                      </div>
                      {c.description && (
                        <div className="truncate text-xs text-text-dim">{c.description}</div>
                      )}
                    </div>
                  </button>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {error && <p className="mt-4 text-sm text-negative">{error}</p>}
    </div>
  );
}
