# Timeless Construction — Brand Kit for Forms

Apply this so Jotform forms match timelessco.com. Structure comes from the MCP
form; **look** is applied in the Jotform Builder (Form Designer → Inject Custom
CSS, or theme settings). Hand the CSS below to the user or paste it into the
form's custom-CSS box.

## Palette (CSS variables)

```
--red-deep:#6E2818;  /* form header bg, sidebar cards */
--red:#C74E37;       /* required asterisks, active states */
--red-dk:#a8412e;
--yellow:#FAC835;    /* accent borders, submit hover */
--orange:#F7911E;    /* submit button, focus border, section underlines */
--navy:#212E33;      /* body text, dark bars */
--gray:#525152;      /* hint/help text */
--off:#F5F4F0;       /* page background */
--light:#FDF1E8;     /* selected-card background */
--white:#FFFFFF;
--ink:#2a1c18;       /* button text */
```

## Typography

- Headings, labels, section titles, buttons: **Barlow Condensed**
  (700–900), UPPERCASE, letter-spacing ~2px.
- Body / inputs / help text: **Barlow** (300–500).
- Google Fonts import:
  `@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500&display=swap');`

## Visual signatures (from the reference pages)

- Form header: deep-red background with a **4px yellow top border**; white
  uppercase title.
- Section labels: small uppercase Barlow Condensed with a **2px orange bottom
  border**.
- Inputs: **square corners (border-radius:0)**, 2px subtle border that turns
  **orange on focus**.
- Required marker: red `*`.
- Single-choice "cards": bordered tiles; selected = red border + `--light`
  background.
- Submit button: full-width, **orange bg / ink text**, hover → **yellow**,
  uppercase Barlow Condensed, letter-spacing 3px, label ends with " →".
- Under submit: small gray privacy + one-business-day response line.

## Inject-CSS starter (paste into Jotform custom CSS)

```css
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500&display=swap');
.form-all{font-family:'Barlow',sans-serif;color:#212E33;background:#FFFFFF;}
.form-header,.form-section-header{font-family:'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:1px;}
.form-label{font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#212E33;font-size:12px;}
.form-required{color:#C74E37;}
.form-textbox,.form-textarea,.form-dropdown{border:2px solid rgba(33,46,51,.12);border-radius:0;padding:14px 16px;font-family:'Barlow',sans-serif;}
.form-textbox:focus,.form-textarea:focus,.form-dropdown:focus{border-color:#F7911E;outline:none;}
.form-submit-button{background:#F7911E !important;color:#2a1c18 !important;border:none;border-radius:0;font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:3px;padding:18px;width:100%;}
.form-submit-button:hover{background:#FAC835 !important;}
```

## Required-field convention (all Timeless forms)

Always required: **Full Name, Email, Phone**, and the primary routing question
(**Project Type** or building use). Budget/timeline are required on quote forms,
optional on exploratory ones. Everything else optional.

## Voice & microcopy

Direct, founder-led, no fluff. Header subtext invites detail ("The more detail
you share, the more useful our response"). Under submit, promise a timeframe
("respond within one business day") and reassure privacy ("never shared").
Where a form isn't the right fit, link the better path (e.g. Butler Quote vs.
Design-Build Consultation).

## Standard contact / notification

Founder: Tony Johnson · Office (910) 769-0308 · Cell (910) 550-6359 ·
tonyj@timelessco.com · M–F 8AM–5PM EST. Route lead notifications to
tonyj@timelessco.com (or info@timelessco.com for general inquiries).
