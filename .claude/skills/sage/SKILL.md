---
name: sage
description: Query and update Sage Intacct (financials) and Sage Construction Management (project ops). Use when the user asks about jobs, projects, vendors, bills, cost reports, RFIs, daily logs, commitments, or any record that lives in either Sage system. TRIGGER on mentions of "Intacct", "Sage CM", "SCM", "Corecon", job numbers, cost codes, GL accounts, RFI/submittal/daily-log workflows, or reconciling data between the two systems.
---

# Sage (Intacct + Construction Management) skill

This skill wraps two MCP servers worth of tools exposed by the `sage-mcp`
server (see `mcp-servers/sage/`). Use them instead of asking the user to
paste screenshots or CSVs.

## Tool map

**Sage Intacct (financial system of record):**
- `intacct_query` — readByQuery against any object (PROJECT, VENDOR, CUSTOMER, GLACCOUNT, APBILL, etc.)
- `intacct_read` — read by key (RECORDNO or NAME)
- `intacct_read_more` — paginate a prior query via `resultId`
- `intacct_inspect_object` — get the field list for an object (use this first when you're unsure of field names)

**Sage Construction Management (project / field ops):**
- `sagecm_list_projects`, `sagecm_get_project`
- `sagecm_list_rfis`, `sagecm_get_rfi`
- `sagecm_list_daily_logs`
- `sagecm_list_commitments`
- `sagecm_raw_request` — escape hatch for endpoints not yet wrapped

## Operating rules

1. **Inspect before you query.** When touching an Intacct object for the
   first time in a session, call `intacct_inspect_object` to confirm field
   names — they vary by company customization.
2. **Narrow field lists.** Prefer `fields: "RECORDNO,NAME,STATUS,WHENMODIFIED"`
   over `"*"` to keep responses small.
3. **Paginate.** If `numRemaining > 0`, call `intacct_read_more` with the
   `resultId` rather than raising `pageSize` unbounded.
4. **Cross-system joins.** Intacct is the financial source of truth. SCM
   holds field data. When a project exists in both, match on the job
   number field the user designates (commonly `PROJECTID` in Intacct ↔
   `projectNumber` in SCM — confirm with the user first).
5. **No writes without confirmation.** Even if a write tool exists, surface
   the intended payload to the user and wait for approval before calling it.
6. **Never log credentials.** Env vars stay in the server process; don't
   echo them back.

## Common workflows

- "Pull an over/under report for job 2501" → `sagecm_get_project` for the
  budgeted values, `intacct_query` on `APBILL` / `GLBATCH` for actuals,
  then reconcile in the response.
- "What RFIs are open on the Smith project?" → `sagecm_list_rfis` with
  `status=open` and the project id.
- "Which vendors on this job have unpaid bills?" →
  `intacct_query` on `APBILL` filtered by `PROJECTID` and `STATE='Posted'`
  with `TOTALDUE > 0`.

## When the tool surface is missing something

If a workflow needs an endpoint that isn't wrapped yet, use
`sagecm_raw_request` (SCM) or extend `mcp-servers/sage/src/intacct.js`
(Intacct) and add a new tool in `src/index.js`. Don't silently fall back
to asking the user to export data manually.
