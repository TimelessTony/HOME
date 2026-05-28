# Jotform Field & Widget Catalog

You describe these in plain English in your spec — Jotform maps the intent.
Pick the *simplest* field that captures the data correctly.

## Core fields

| Need | Field to ask for | Notes |
|---|---|---|
| Person's name | **Full Name** | One field, First + Last sub-boxes. Don't use two text boxes. |
| Email | **Email** | Built-in format validation. Almost always required. |
| Phone | **Phone** | Validation + input mask, e.g. `(910) 000-0000`. |
| Mailing/site address | **Address** | Street, city, state, zip sub-fields. |
| One short line | **Short Text** | City+State, company name, title/role. |
| Paragraph | **Long Text / Textarea** | Project description, notes, constraints. Add a guiding placeholder. |
| Pick one from a long list | **Dropdown** | Project type, budget range, square footage, timeline, "how did you hear about us". Always include a disabled "Select…" prompt and an "Other" option where relevant. |
| Pick one from ≤5 options | **Single Choice (radio)** — render as selectable cards | Routing/stage questions ("Concept Stage / Early Planning / Developer / Brand"). Cleaner than a dropdown for few rich options. |
| Select all that apply | **Multiple Choice (checkbox)** | Features wanted, scope inclusions, documents on hand. |
| Number | **Number** | Width/length in feet, quantities; set min/max. |
| Date | **Date Picker** | Target start/completion. |
| Time | **Time** | Best time to reach you (or use a dropdown of ranges). |
| Rating 1–5 | **Scale Rating / Star Rating** | Priority matrix ("rate what matters most"). |
| Grid of options | **Input Table / Matrix** | Rate several factors on the same scale in one block. |
| URL | **Short Text (URL)** | Link to plans on Dropbox/Drive. |
| Legal sign-off | **Signature** | Approvals/agreements. |

## File uploads

- Ask for a **File Upload** field; specify **multiple files**, **accepted
  types**, and **max size**.
- Construction default (from the Request-a-Quote form): accept
  `PDF, DWG, DXF, JPG, PNG, ZIP, DOCX, XLSX`, **multiple**, **50 MB/file**.
- Pair uploads with a **URL field** ("Link to online plans") so clients with
  large files can paste a Dropbox/Drive link instead.
- Tell the user where files are stored (Jotform storage / connected cloud).

## Structure & logic

- **Section / Heading** — labeled dividers ("Project Details", "Your
  Information"). Use to chunk long forms.
- **Page Break** — turn a long form into multi-step pages with a progress bar.
  Recommended past ~10 fields.
- **Conditional ("skip") logic** — show/hide fields based on earlier answers.
  Describe in words: *"If Project Type = Butler PEMB, show the building
  dimensions section; otherwise hide it."* Powerful for keeping forms short.
- **Calculation / payment** — order forms, deposits (Stripe/Square/PayPal),
  auto-totals. Only if the user needs to collect money.

## Useful widgets

- **Configurable List** — repeatable rows mixing dropdowns/text/dates (e.g.
  multiple locations, line items).
- **Input Table (multi-type columns)** — different input type per column.
- **Spinner / Slider** — quantities or ranges.
- **Terms & Conditions / E-sign** — consent capture.

## Anti-patterns

- Two text boxes for a name. → Full Name.
- Free-text where a dropdown belongs (states, budget bands). → Dropdown.
- One giant single page with 30 fields. → Page breaks + conditional logic.
- Required on "nice to have" fields. → Only require what you'll act on.
- Placeholder used *as* the label. → Always give a visible label.
