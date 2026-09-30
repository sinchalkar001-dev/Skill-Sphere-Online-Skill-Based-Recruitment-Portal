# Skill Sphere design system

Source of truth for the client UI. Page-specific overrides, if any, live in `pages/<page>.md` next to this file.

- **Product:** two-sided hiring platform. Candidates apply with projects; recruiters score applicants against a rubric.
- **Style:** flat, minimal (Swiss-leaning), light and dark themes both first-class.
- **Implementation:** tokens are CSS variables in `client/src/index.css`, mapped to Tailwind colors in `client/tailwind.config.js`. Components use semantic utilities (`bg-card`, `text-muted-foreground`, `bg-primary`) and never raw hex.

## Principles

1. **Evidence first.** Projects, rubric scores, and application status are the visual heroes. Decoration that doesn't carry information is removed.
2. **One motif.** The segmented rubric meter (`ScoreMeter`) and the five-step status pipeline (`StatusPipeline`) repeat across the landing page, cards, and detail views. The logo mark is a ring of four rubric segments.
3. **Flat and quiet.** Hairline borders separate surfaces. Shadows appear only on floating layers (menus, dialogs, the hero card).
4. **Plain copy.** Sentence case everywhere, no all-caps labels, active-voice buttons that say what happens ("Post job", "Submit application").

## Color tokens

Values are RGB channels in CSS (`--primary: 3 105 161`), shown here as hex. Every text pairing is checked for WCAG AA (4.5:1 text, 3:1 UI) in both themes.

| Token | Light | Dark | Use |
|---|---|---|---|
| `background` | `#F4F8FB` | `#0A1422` | Page |
| `card` | `#FFFFFF` | `#0F1C2D` | Panels, inputs |
| `muted` | `#EAF0F5` | `#15243A` | Chips, subtle fills |
| `foreground` | `#0F2A3D` | `#E6EEF7` | Primary text |
| `muted-foreground` | `#4A6378` | `#A3B4C8` | Secondary text |
| `subtle-foreground` | `#566A7F` | `#8597AD` | Timestamps, placeholders |
| `border` | `#D7E2EC` | `#1F3149` | Hairlines |
| `border-strong` | `#BECDDB` | `#2C4260` | Secondary button outline |
| `input` | `#778CA2` | `#546C8A` | Form field borders (3:1) |
| `primary` | `#0369A1` | `#38BDF8` | Actions, links, meters, focus ring |
| `primary-foreground` | `#FFFFFF` | `#062033` | Text on primary |
| `primary-soft` / `-foreground` | `#E0F2FE` / `#075985` | `#12324A` / `#7DD3FC` | Selected states, info badges |
| `success` | `#16A34A` | `#22C55E` | Accepted, active |
| `warning` | `#D97706` | `#F59E0B` | In review |
| `danger` | `#DC2626` | `#DC2626` | Rejected, destructive actions |
| `iris` | `#7C3AED` | `#A78BFA` | Assessed stage |
| `band` | `#075985` | `#12324A` | Call-to-action band |
| `meter-track` | `#CFE3F1` | `#1E344E` | Unlit rubric segments |

Each status tone (`success`, `warning`, `danger`, `iris`) also has `-soft` and `-soft-foreground` variants for badges and icon tiles.

### Application status mapping

| Status | Label | Badge |
|---|---|---|
| `applied` | Applied | `badge-neutral` |
| `reviewing` | In review | `badge-warning` |
| `shortlisted` | Shortlisted | `badge-info` |
| `assessed` | Assessed | `badge-iris` |
| `accepted` | Accepted | `badge-success` |
| `rejected` | Rejected | `badge-danger` |

Defined once in `APPLICATION_STATUSES` (`client/src/utils/helpers.js`). Badges always pair color with a text label and a dot, never color alone. Class names are written out in full there so Tailwind does not purge them; do not build class names dynamically.

## Typography

- **Family:** Plus Jakarta Sans, weights 400 to 800, loaded as one variable font from Google Fonts.
- **Scale:** Tailwind defaults. Hero 36/48/56px extrabold with tight tracking; page titles 24 to 30px bold; section titles 16px semibold; body 14 to 16px; minimum 12px.
- **Numbers:** proportional figures for large values; `tabular-nums` only where digits align (score readouts, pagination).
- **Measure:** long-form text (descriptions, cover letters) is capped at `max-w-prose`.

## Shape, elevation, spacing

- **Radius hierarchy:** chips 6px (`rounded-md`), buttons and inputs 8px (`rounded-lg`), cards 12px (`rounded-xl`), dialogs and hero 16px+ (`rounded-2xl`), badges fully rounded.
- **Elevation:** `shadow-overlay` for menus and dialogs, `shadow-lift` for the floating hero card. Cards have no shadow.
- **Layout:** left-aligned content. Containers are `max-w-7xl` for dashboards, `max-w-5xl` for lists, `max-w-3xl` for forms.

## Components (in `client/src/index.css` and `client/src/components/`)

| Component | Notes |
|---|---|
| `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-soft*` | 44px tall by default. Size modifiers (`.btn-sm`, `.btn-lg`, `.btn-icon`) are declared after variants so they win. |
| `.input` | Also styles `select` (custom chevron per theme) and `textarea`. `aria-invalid="true"` switches to the danger border. |
| `.label`, `.hint`, `.field-error` | Every field has a visible, associated label. Errors use `role="alert"`. |
| `.card`, `.chip`, `.badge-*` | See tokens above. |
| `ScoreMeter` | One segment per point up to 12, otherwise ten segments. Partial values fill a segment proportionally. Pass `decorative` when adjacent text already states the value. |
| `StatusPipeline` | Applied, In review, Shortlisted, Assessed, Decision. Vertical below 640px, horizontal above. |
| `Modal`, `ConfirmDialog` | Headless UI dialog with focus trap. `ConfirmDialog` focuses Cancel first. |
| `EmptyState` | Icon, title, one sentence of direction, one action. |

## Motion

- One orchestrated moment: hero rubric segments fill on load (320ms each, staggered 45ms).
- Everything else responds to the user: menus 150ms in / 100ms out, dialogs 200ms in / 150ms out, hover color changes 150ms.
- `prefers-reduced-motion` removes durations and delays globally.

## Accessibility checklist

- Skip link on every page; landmarks (`header`, `nav`, `main`, `footer`) and labeled sections.
- Visible focus ring (`ring` token) on all interactive elements, including stretched-link cards (`has-[:focus-visible]`).
- Icon-only buttons carry `aria-label`; decorative icons are `aria-hidden`.
- No emoji as icons; Heroicons only.
- Theme follows the OS until the user toggles; the choice is saved and applied before first paint.

## Avoid

- Gradient text, glow shadows, floating blurred orbs, glassmorphism (the previous design).
- All-caps labels and eyebrow text, middle-dot meta strings, arrows appended to link text.
- Raw hex or Tailwind palette colors in components; dynamically assembled class names.
