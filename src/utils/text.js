// The extraction model doesn't always return a clean value or real null — sometimes it's
// the literal string "null", sometimes an explanatory sentence instead of a short field.
// Use this anywhere a field is rendered directly, not just where it happened to be noticed.
export function isRealValue(v, { maxLength = 200 } = {}) {
  if (!v || typeof v !== "string") return false;
  const trimmed = v.trim();
  if (!trimmed || trimmed.toLowerCase() === "null") return false;
  if (trimmed.length > maxLength) return false;
  return true;
}

export function display(v, fallback = "—") {
  return isRealValue(v) ? v : fallback;
}
