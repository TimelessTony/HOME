// Sage Construction Management REST client.
//
// SCM's REST API base URL and auth flow vary by tenant/region, so everything
// is driven by env vars. Two auth modes are supported:
//   1. OAuth2 client-credentials (preferred): SAGECM_CLIENT_ID + SECRET + TOKEN_URL
//   2. Static bearer/API key: SAGECM_API_KEY
//
// Fill SAGECM_BASE_URL with the root your tenant gives you (e.g. something
// like https://api.sagecm.example.com/v1). We won't guess it.

class SageCmError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "SageCmError";
    this.status = status;
    this.body = body;
  }
}

function requireBase() {
  const base = process.env.SAGECM_BASE_URL;
  if (!base) {
    throw new Error(
      "SAGECM_BASE_URL is not set. Set it to your tenant's REST API root.",
    );
  }
  return base.replace(/\/+$/, "");
}

let tokenCache = { token: null, expiresAt: 0 };

async function fetchOAuthToken() {
  const clientId = process.env.SAGECM_CLIENT_ID;
  const clientSecret = process.env.SAGECM_CLIENT_SECRET;
  const tokenUrl = process.env.SAGECM_TOKEN_URL;
  if (!clientId || !clientSecret || !tokenUrl) return null;

  const now = Date.now();
  if (tokenCache.token && tokenCache.expiresAt > now + 30_000) {
    return tokenCache.token;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new SageCmError(
      `OAuth token request failed: ${res.status}`,
      res.status,
      await res.text(),
    );
  }
  const json = await res.json();
  const expiresInMs = (json.expires_in ?? 3600) * 1000;
  tokenCache = {
    token: json.access_token,
    expiresAt: now + expiresInMs,
  };
  return tokenCache.token;
}

async function authHeader() {
  const oauth = await fetchOAuthToken();
  if (oauth) return { Authorization: `Bearer ${oauth}` };
  const key = process.env.SAGECM_API_KEY;
  if (key) return { Authorization: `Bearer ${key}` };
  throw new Error(
    "No Sage CM credentials set: provide OAuth2 client creds or SAGECM_API_KEY.",
  );
}

async function request(path, { method = "GET", query, body } = {}) {
  const base = requireBase();
  const url = new URL(path.startsWith("/") ? path : `/${path}`, base + "/");
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  const headers = {
    Accept: "application/json",
    ...(await authHeader()),
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  const parsed = text ? safeJson(text) : null;
  if (!res.ok) {
    throw new SageCmError(
      `Sage CM ${method} ${url.pathname} -> ${res.status}`,
      res.status,
      parsed ?? text,
    );
  }
  return parsed;
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Public API --------------------------------------------------------------
// Paths below are placeholders following common REST conventions. Confirm
// them against your tenant's API docs and adjust as needed.

export function listProjects({ page = 1, pageSize = 50, status } = {}) {
  return request("projects", { query: { page, pageSize, status } });
}

export function getProject(id) {
  return request(`projects/${encodeURIComponent(id)}`);
}

export function listRfis({ projectId, status, page = 1, pageSize = 50 } = {}) {
  return request("rfis", {
    query: { projectId, status, page, pageSize },
  });
}

export function getRfi(id) {
  return request(`rfis/${encodeURIComponent(id)}`);
}

export function listDailyLogs({ projectId, from, to } = {}) {
  return request("daily-logs", { query: { projectId, from, to } });
}

export function listCommitments({ projectId, page = 1, pageSize = 50 } = {}) {
  return request("commitments", { query: { projectId, page, pageSize } });
}

// Escape hatch for endpoints we haven't wrapped yet.
export function rawRequest(path, opts) {
  return request(path, opts);
}
