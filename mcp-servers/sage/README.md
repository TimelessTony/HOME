# Sage MCP server

Exposes **Sage Intacct** (XML gateway) and **Sage Construction Management**
(REST) as Model Context Protocol tools for Claude Code.

## Setup

1. Install deps (only inside this subfolder — won't pollute the ROM app):
   ```
   cd mcp-servers/sage
   npm install
   ```

2. Get credentials:

   **Intacct** — in your Intacct company go to *Company → Setup → Company
   → Subscriptions → Web Services* and make sure Web Services is enabled.
   The **sender id / password** come from Sage (partner-level); the
   **user id / company id / user password** are for a dedicated Web
   Services user you create under *Company → Web Services Users*.

   **Sage Construction Management** — in SCM open *Settings → Integrations
   / API* (exact menu varies). Either generate an API key or, preferred,
   register an OAuth2 client and note the client id, secret, and token
   URL. Also copy the REST base URL for your tenant.

3. Copy `/.claude/settings.example.json` to `/.claude/settings.local.json`
   and paste the values in. `settings.local.json` is gitignored.

   Alternatively, put them in `mcp-servers/sage/.env` and launch the
   server with `node --env-file=.env src/index.js`.

4. Restart Claude Code so it picks up the new MCP server. You should see
   tools prefixed `mcp__sage__` become available.

## Tool surface

See `.claude/skills/sage/SKILL.md` for the full list and operating rules.
Short version:

- Intacct: `intacct_query`, `intacct_read`, `intacct_read_more`,
  `intacct_inspect_object`
- SCM: `sagecm_list_projects`, `sagecm_get_project`, `sagecm_list_rfis`,
  `sagecm_get_rfi`, `sagecm_list_daily_logs`, `sagecm_list_commitments`,
  `sagecm_raw_request`

## Extending

- **New Intacct function** — add a wrapper to `src/intacct.js` that calls
  `callFunction({ ... })` with the right XML shape, then register a tool
  in `src/index.js`.
- **New SCM endpoint** — add a helper in `src/sageCm.js` (or just use
  `sagecm_raw_request` ad-hoc), then register it in `src/index.js`.

## Security notes

- Credentials live only in env vars — never commit `.env` or
  `settings.local.json`.
- The server logs nothing by default. If you add logging, scrub auth
  headers and session ids.
- Write operations are intentionally not scaffolded; add them only after
  deciding on a confirmation flow.
