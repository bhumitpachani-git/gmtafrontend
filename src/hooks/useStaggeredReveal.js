import { useState, useEffect } from "react";

// For steps whose real data arrives as one batch (a single AI/search call, not a
// per-item backend loop), this reveals it one item at a time instead of dumping the
// whole list in at once — every item is real data already received, just paced out on
// the frontend so it reads the same way as steps that do stream from the backend.
export function useStaggeredReveal(items, intervalMs = 200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
  }, [items]);

  useEffect(() => {
    if (!items || count >= items.length) return;
    const t = setTimeout(() => setCount((c) => c + 1), intervalMs);
    return () => clearTimeout(t);
  }, [items, count, intervalMs]);

  return items ? items.slice(0, count) : [];
}
