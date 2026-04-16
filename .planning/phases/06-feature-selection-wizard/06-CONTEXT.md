# Phase 6: Feature Selection Wizard - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the feature selection UI with two modes: wizard (sequential yes/no questions) and advanced (direct checkboxes). Both modes read/write the same state. Provider-specific questions derived from data modules (aws.js, azure.js, gcp.js).

</domain>

<decisions>
## Implementation Decisions

### Wizard Question Flow
- Question card design: card with question text, Yes/No buttons, progress indicator — stacked vertically in workspace
- Future questions: grayed-out cards showing question text but locked (not clickable)
- Sub-question reveal: indented sub-card slides in below parent after "Yes" answer (e.g., DNS → read-only vs bidirectional)

### Advanced Mode UI
- Mode toggle: toggle switch at top of workspace, labeled "Wizard / Advanced"
- Checkbox layout: grouped by feature category with category headers + permission count badges
- Sub-feature handling: nested checkboxes indented under parent (e.g., DNS → Read-only / Bidirectional radio-style)

### State Sync Between Modes
- Source of truth: single features object in state.js per provider — both modes read/write same object
- Mode switch animation: crossfade 200ms — workspace content swaps smoothly

### Claude's Discretion
- Exact question wording derived from feature data modules
- CSS class naming for wizard/advanced mode elements
- Progress indicator style (dots, bar, fraction)
- Animation easing curves

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `js/state.js` — provider state with features object per provider
- `js/ui.js` — DOM update patterns, workspace content swapping
- `js/app.js` — event listener wiring pattern
- `js/data/aws.js`, `js/data/azure.js`, `js/data/gcp.js` — feature definitions with names and descriptions
- `css/styles.css` — design tokens, card patterns, transition utilities

### Established Patterns
- ES modules with named exports
- BEM CSS naming
- `data-*` attributes for JS hooks
- State management in state.js, DOM in ui.js, wiring in app.js

### Integration Points
- Wizard reads feature categories from data modules to generate questions
- Feature selections stored in state.js, consumed by Phase 7 output engine
- Mode toggle needs CSS for both wizard and advanced views within workspace panel

</code_context>

<specifics>
## Specific Ideas

- Questions derived from feature data: each feature category = one wizard question
- Sub-questions for DNS (read-only vs bidirectional) and Cloud Forwarding (discovery vs full management)
- Permission count badges in advanced mode show per-category action count from data modules
- FEAT-01 through FEAT-06 requirements from REQUIREMENTS.md

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
