# Embedding a Jotform into Webflow

Build the form in Jotform first, then embed. Two methods — default to
JavaScript; fall back to iframe.

## JavaScript embed (default / recommended)

- Dynamically loads the form, **auto-adjusts height**, and **auto-updates** —
  edits in Jotform appear on the site without changing the embed code.
- Best general choice for the Timeless pages.

## iframe embed (fallback)

- Use when: the JavaScript source exceeds **Webflow's 10,000-character Embed
  limit**, or when JS conflicts with other page scripts/animations.
- Renders in an isolated iframe → fewer style/script collisions. Shorter code,
  so it stays under the 10k limit.

## Steps

1. In Jotform Form Builder: **Publish → Embed**.
2. Choose **JavaScript** (or **iFrame** if over the limit / conflicting).
3. **Copy** the code.
4. In Webflow Designer: drag an **Embed** element (Add panel → Components →
   Embed) into the spot on the page.
5. **Paste** the code, Save & Close.
6. **Publish** the Webflow site.

## Gotchas

- **Forms only render on the published site / Reader preview — NOT in the
  Webflow Designer canvas.** Don't panic when it looks blank in the editor.
- If the form is cut off or scrolls inside a box → JS embed (auto-height) fixes
  it; for iframe, set the wrapper height or enable Jotform's auto-resize
  script.
- Keep the Embed element full-width; let Jotform control internal layout.
- Style the form in **Jotform** (theme / Inject CSS — see
  `timeless-brand.md`), not in Webflow, so it stays consistent across embeds.
- One form per Embed element. For multiple forms, use multiple Embed elements
  or separate pages (Strategy Call, Design-Build, Butler Quote, Request a
  Quote, etc.).

## Optional: Webflow MCP

A Webflow MCP server is connected (tools prefixed `mcp__b43afb9b...`). Call
`webflow_guide_tool` **once** to see what's possible (it can place custom code
/ embeds on pages programmatically). For a simple hand-off, giving the client
the embed snippet + steps above is enough.

## What to tell the user when done

- The live form URL (from `display_form`).
- Which embed method to paste and where.
- Reminder: publish the Webflow site; the form won't show in Designer.
- Where submissions go (email notification + Jotform inbox), and that
  `analyze_submissions` can summarize responses later.
