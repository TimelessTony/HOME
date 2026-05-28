# Writing a `create_form` Specification

`create_form` takes ONE natural-language `description`. Treat it like a precise
brief to a form designer. The more structured and explicit you are, the better
the generated form. Do **not** mention internal field types/IDs — describe
*intent*.

## Spec checklist

1. **Form title + one-line purpose.**
2. **Sections in order**, each with a heading.
3. **Each question:** the label, whether it's **required**, the field intent
   ("dropdown", "checklist / select all", "single-choice cards", "file
   upload"), and — for choice fields — **every option, verbatim**.
4. **Uploads:** accepted types, multiple?, max size.
5. **Conditional logic:** stated as if/then sentences.
6. **Multi-page?** Where the page breaks go.
7. **Submit button label** + the **privacy / response-time line** beneath it.
8. **Where submissions should be emailed** (notification recipient), if known —
   e.g. tonyj@timelessco.com.

## Template

```
Create a form titled "<TITLE>". Purpose: <one line>.

Section 1 — "<Heading>"
- <Label> (required): <field intent>. Options: A, B, C, Other.
- <Label>: <field intent>.

Section 2 — "<Heading>"
- ...

Uploads: File upload, allow multiple, accept PDF/DWG/DXF/JPG/PNG/ZIP/DOCX/XLSX,
max 50MB per file. Also add a "Link to online plans" URL field.

Logic: If <field> = <value>, show <section/field>; otherwise hide it.
Pages: Put a page break before "Your Information".

Submit button: "<Label> →".
Under the button: "We respond within one business day. Your information is
never shared." Send submission notifications to tonyj@timelessco.com.
```

## Worked example (Strategy Call intake)

```
Create a form titled "Schedule a Design-Build Strategy Call". Purpose: capture
a concept-stage commercial project lead for Timeless Construction.

Section 1 — "Where Are You in the Process?"
- What best describes your situation (required): single-choice cards —
  Concept Stage; Early Planning; Active Developer; Expanding Brand.

Section 2 — "Project Details"
- Project Type (required): dropdown — Restaurant; Retail; Entertainment Venue;
  Fitness & Wellness; Medical / Healthcare; Industrial / Flex / Warehouse;
  Butler Pre-Engineered Building; Multi-Tenant Commercial; Ground-Up
  Commercial; Other.
- Approximate Project Size: dropdown — Under 2,000 SF; 2,000–5,000 SF;
  5,000–15,000 SF; 15,000–30,000 SF; 30,000–60,000 SF; 60,000 SF+; Not yet
  determined.
- Project Location (required): short text, placeholder "City, State".
- Target Start Date: dropdown — ASAP; 1–3 months; 3–6 months; 6–12 months;
  Planning stage 12+ months out.
- Approximate Budget Range (required): dropdown — Under $1M; $1M–$3M; $3M–$5M;
  $5M–$10M; $10M–$20M; Over $20M; Not yet defined.
- Describe your project or idea: long text.

Section 3 — "Your Information"
- Full Name (required).
- Title / Role: short text.
- Company / Organization: short text.
- Email Address (required).
- Phone Number (required).
- Preferred Contact Method: dropdown — Phone call; Email; Text message; No
  preference.
- How did you hear about Timeless?: dropdown — Google Search; Referral;
  Drove by a project; LinkedIn; Past client; Industry event; Google Business
  Profile; Other.

Pages: page break before "Your Information".
Submit button: "Schedule My Strategy Call →".
Under the button: "A member of the Timeless team will respond within one
business day. We never share your information." Notify tonyj@timelessco.com.
```

## Editing later

Use `edit_form` with one instruction at a time:
- "Make Budget Range required."
- "Add a file upload after the project description that accepts PDF and images."
- "Move the Company field above Email."
- "Split the form into two pages, breaking before contact details."
- "Add logic: if Project Type is 'Butler Pre-Engineered Building', show a new
  section asking building width, length, and eave height."

Always `display_form` after editing to verify.
