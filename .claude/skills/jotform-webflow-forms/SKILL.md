---
name: jotform-webflow-forms
description: >-
  Build, edit, and embed professional Jotform forms for the Timeless
  Construction Webflow site (timelessco.com). Use whenever the user wants to
  create or change a web form — intake, quote, contact, lead-capture, booking,
  application, or survey forms — or anything involving form fields, file
  uploads, multiple choice, checkboxes, dropdowns, ratings, conditional
  (skip) logic, multi-page steps, or embedding a form into Webflow. The
  Jotform MCP server is natural-language driven (create_form, edit_form,
  display_form, analyze_submissions), so this skill teaches how to write a
  complete form specification, pick the right field type for each question,
  apply submission-friendly UX, carry the Timeless brand (Barlow fonts;
  deep-red / yellow / orange palette), and publish the finished form into
  Webflow via JavaScript or iframe embed.
---

# Jotform → Webflow Form Builder

Build clean, professional, high-converting Jotform forms and embed them in the
Timeless Construction Webflow site.

## How the tools actually work (read first)

The Jotform MCP server is **natural-language driven**. You do NOT pass field
types, control IDs, or JSON schemas. A second agent maps your plain-English
intent to real Jotform field types. Your leverage is the **quality of the
description you write**.

Available Jotform MCP tools:
- `create_form` — give it a full natural-language spec; returns a new form.
- `edit_form` — give `form_id` + high-level instruction ("Add a phone field
  after email", "Make budget required", "Split into two pages"). No internal
  types/IDs.
- `display_form` — show/preview a form by `form_id` (use after create/edit).
- `search` — find a form's ID by name before displaying/editing.
- `list_submissions` / `analyze_submissions` — read and summarize responses.

Webflow MCP tools (server prefix `mcp__b43afb9b...`) exist too — call
`webflow_guide_tool` ONCE before using them. For most cases you just hand the
client the embed code (see references/webflow-embed.md).

## Standard workflow

1. **Gather requirements.** Purpose, audience, what data must be captured,
   which fields are required, any file uploads, any conditional logic, single
   page vs. multi-step. If unclear, ask 2–3 focused questions before building.
2. **Draft the spec.** Write a complete form description following
   `references/spec-writing.md`. Group into labeled sections, name every
   question, mark required fields, list every choice option verbatim, and
   describe field type intent in plain words ("a multi-select checklist",
   "a file upload accepting PDF/DWG up to 50MB", "a single-choice card group").
3. **Create.** Call `create_form` with that spec.
4. **Preview & iterate.** Call `display_form`; refine with `edit_form` using
   one clear instruction at a time. Confirm required fields, option lists,
   and upload settings landed correctly.
5. **Brand it.** Apply the Timeless look — Barlow Condensed headings, the
   red/yellow/orange palette, orange submit button. See
   `references/timeless-brand.md` for tokens and the inject-CSS approach.
6. **Embed in Webflow.** Hand off the JavaScript embed (default) or iframe
   embed per `references/webflow-embed.md`.
7. **Confirm.** Tell the user the live form URL, what's required, and where
   submissions land. Offer `analyze_submissions` once responses arrive.

## Non-negotiable UX rules

- **Ask only what you'll use.** Every extra field lowers completion.
- **Required = truly required.** Default required: Name, Email, Phone (and the
  one routing question — e.g. Project Type). Everything else optional.
- **Right field for the job:** Full Name (not two text boxes), Email/Phone
  with validation, Dropdown for long lists, single-choice cards for ≤5 routing
  options, checkboxes for "select all that apply", File Upload for documents.
  Full catalog: `references/field-catalog.md`.
- **Logical order:** what they're here for → project details → uploads →
  their contact info last.
- **Multi-page** any form longer than ~10 fields; show a progress bar.
- **Mobile-first, accessible:** clear labels (not placeholder-only), helpful
  hint text, large tap targets, sensible validation messages.
- **Trust at the submit:** privacy note + response-time promise under button.

## References

- `references/field-catalog.md` — every Jotform field/widget and when to use it.
- `references/spec-writing.md` — how to write a `create_form` description, with
  a worked example modeled on the Timeless intake forms.
- `references/timeless-brand.md` — brand colors, fonts, voice, required-field
  conventions, and Jotform Inject-CSS styling.
- `references/webflow-embed.md` — JavaScript vs. iframe embed, steps, and the
  10,000-character limit gotcha.
