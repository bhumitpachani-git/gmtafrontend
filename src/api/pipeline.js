const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function postJson(path, body, signal) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
    signal,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

async function getJson(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// Polls a job until it's done or errored. onTick is called after every poll with the
// raw job payload, so callers can drive progress UI off `job.stage` while waiting.
export async function pollJob(jobId, { intervalMs = 2500, maxAttempts = 120, onTick } = {}) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const job = await getJson(`/pipeline/jobs/${jobId}`);
    if (onTick) onTick(job);
    if (job.status === "done") return job.result;
    if (job.status === "error") {
      const err = new Error(job.error);
      err.partialResult = job.partialResult;
      throw err;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error("This step is taking too long — gave up polling.");
}

export function startResearch(url) {
  return postJson("/pipeline/start", { url });
}

export function startCompetitors(sessionId) {
  return postJson(`/pipeline/${sessionId}/competitors`);
}

export function startCampaigns(sessionId) {
  return postJson(`/pipeline/${sessionId}/campaigns`);
}

export function startCustomers(sessionId, { campaignIndexes, maxPerCampaign } = {}) {
  return postJson(`/pipeline/${sessionId}/customers`, { campaignIndexes, maxPerCampaign });
}

export function startDecisionMakers(sessionId, { customerIndexes } = {}) {
  return postJson(`/pipeline/${sessionId}/decision-makers`, { customerIndexes });
}

export function startEmails(sessionId, { personIndexes } = {}) {
  return postJson(`/pipeline/${sessionId}/emails`, { personIndexes });
}

export function getSession(sessionId) {
  return getJson(`/pipeline/${sessionId}`);
}

// One SSE connection covers every step for this session — the backend pushes each
// competitor/customer/decision-maker the moment a step handler finds it, so the UI can
// fill lists in live instead of only seeing them once a step's job/poll cycle finishes.
// Returns a close() function; onEvent receives { step, type, item|items } payloads.
export function openSessionStream(sessionId, onEvent) {
  const source = new EventSource(`${BASE_URL}/pipeline/${sessionId}/stream`);
  source.onmessage = (msg) => {
    try {
      onEvent(JSON.parse(msg.data));
    } catch {
      // ignore malformed/heartbeat frames
    }
  };
  return () => source.close();
}

// Real web search (a few seconds, not instant) — pass an AbortSignal so a stale in-flight
// search from an earlier keystroke can be cancelled once the user keeps typing.
export function searchCompaniesByName(query, signal) {
  return postJson("/company-search", { query }, signal);
}
