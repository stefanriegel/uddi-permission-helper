# Phase 2: Provider Selection UI - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Add JavaScript behavior so clicking a provider card highlights it, reveals the workspace panel for that provider, and preserves per-provider state when switching. No feature selection or output generation — those come in later phases.

</domain>

<decisions>
## Implementation Decisions

### Selection Behavior & Visual Feedback
- Selected card: orange left border (4px --color-accent) + light blue background (#e8f0f8 --color-secondary-bg)
- Workspace reveal: slide-down with opacity transition, 200ms ease
- Previously-selected cards (with data): subtle indicator — thin left border in provider color showing "has data"

### State Management Architecture
- JS module structure: `js/app.js` (entry point, imports) + `js/state.js` (state management) + `js/ui.js` (DOM manipulation)
- State storage: in-memory JS object per provider — no localStorage, no persistence across reloads
- Provider switching: preserve all provider states in memory, swap the active workspace view

### Workspace Panel Content
- When provider selected: show placeholder text "{Provider} features will appear here" — real wizard wired in Phase 6
- Output panel: stays showing empty state regardless of provider selection — no output until features selected in Phase 7

### Claude's Discretion
- Exact transition timing/easing curves
- CSS class naming for JS-driven states (e.g., `--active`, `--selected`)
- Internal state object shape

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `index.html` — provider cards already `<button>` elements with aria-labels
- `css/styles.css` — design tokens, hover states, focus rings already defined
- Provider card BEM classes: `.provider-card`, `.provider-card--aws`, `.provider-card--azure`, `.provider-card--gcp`
- Workspace section: `.workspace` with `.workspace__empty` placeholder
- Output section: `.output` with tab structure already in HTML

### Established Patterns
- BEM naming convention for CSS classes
- CSS custom properties for all design tokens
- Semantic HTML with ARIA attributes
- System font stack, no external dependencies

### Integration Points
- Provider cards need click handlers → `js/app.js` wires event listeners
- Workspace `.workspace__empty` text needs dynamic update → `js/ui.js`
- State needs to be accessible by future phases (Phase 6 wizard, Phase 7 output)

</code_context>

<specifics>
## Specific Ideas

- Use ES modules (`type="module"` on script tag) per CLAUDE.md tech stack
- State object shape: `{ aws: { features: {} }, azure: { features: {} }, gcp: { features: {} }, activeProvider: null }`
- Add `data-provider` attributes to cards for clean JS selection

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
