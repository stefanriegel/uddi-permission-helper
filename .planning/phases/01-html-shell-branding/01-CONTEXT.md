# Phase 1: HTML Shell + Branding - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the Infoblox-branded static HTML shell with correct layout, responsive behavior, and output panel chrome. No JavaScript behavior — pure HTML/CSS skeleton ready for JS wiring in later phases.

</domain>

<decisions>
## Implementation Decisions

### Logo & Provider Card Visuals
- Infoblox logo: inline SVG placeholder wordmark ("INFOBLOX" text), real logo swapped in later
- Provider card icons: CSS-only colored circle/square accents — no external icon libraries
- Provider card layout: icon/color accent left-aligned, text content right — visual anchor + info pattern

### HTML Structure & Semantics
- File structure: `index.html` + `css/styles.css` + `assets/` directory (per UI-SPEC)
- Section wrappers: `<section>` elements with descriptive `aria-label` for each major panel
- Provider cards container: `<nav>` with `aria-label="Cloud provider selection"`

### Interaction Polish
- Hover transition speed: 150ms ease — snappy, professional feel
- Focus ring: 2px solid `--color-infoblox` with 2px offset on all interactive elements (per UI-SPEC)
- Card selected state: left border thickens to 4px accent color + subtle background shift

### Claude's Discretion
- Specific SVG shapes for provider color accents
- Exact background shift value for selected card state
- CSS class naming conventions

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing source code — greenfield project

### Reference Design: UDDI-GO-Token-Calculator
- Located at: `/Users/mustermann/Documents/coding/UDDI-GO-Token-Calculator/frontend/`
- Uses React+Tailwind (different stack) but design language should be replicated
- Key files for reference:
  - `src/styles/theme.css` — color tokens (#002b49 navy, #f37021 orange, #3a8fd6 blue)
  - `src/app/components/ui/card.tsx` — card pattern (rounded-xl, border, padding px-6)
  - `src/app/components/ui/button.tsx` — button variants
  - `src/app/components/ui/tabs.tsx` — tab pattern (rounded, muted bg)

### Established Patterns (from Token Calculator)
- Navy (#002b49) as primary authority color, Orange (#f37021) as accent/CTA
- Cards: white bg, subtle navy-tinted border (rgba(0,43,73,0.12)), 12px border-radius
- Page bg: #f5f7fa, card bg: #ffffff
- System font stack (no external fonts)
- Shadows: subtle, navy-tinted (rgba(0,43,73,0.08))

### Integration Points
- UI-SPEC defines all tokens, spacing, typography, and color contracts (updated to match Token Calculator)
- Future phases will wire JS to the HTML shell produced here

</code_context>

<specifics>
## Specific Ideas

- Reuse UDDI-GO-Token-Calculator color palette and design language exactly — Navy + Orange Infoblox branding
- Translate Token Calculator's Tailwind/React patterns to vanilla CSS custom properties
- Output panel dark theme should use Infoblox Dark (#0a1628) not generic dark gray
- Card border-radius 12px (rounded-xl) matching Token Calculator, not 8px

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
