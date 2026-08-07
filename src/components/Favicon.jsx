import { useState } from "react";
import { faviconFor } from "../utils/url";

// Real favicon via Google's favicon service, with a graceful fallback to initials if the
// image fails to load (unreachable domain, no favicon, blocked request, etc.) — never a
// broken-image icon.
export default function Favicon({ url, name, size = 32, className = "" }) {
  const [failed, setFailed] = useState(false);
  const src = faviconFor(url);
  const initial = (name || "?")[0]?.toUpperCase() || "?";

  if (!src || failed) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex shrink-0 items-center justify-center rounded bg-panel-2 font-bold text-text-dim ${className}`}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      style={{ width: size, height: size }}
      className={`shrink-0 rounded bg-panel-2 object-contain ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
