# Phase 8: Hardening + Deploy - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Add offline support, browser compatibility hardening, AWS policy size warning, and prepare for deployment. Skip actual GitHub Pages deployment (user handles repo setup).

</domain>

<decisions>
## Implementation Decisions

### Offline Support
- Approach: pure static site with proper cache headers — no Service Worker needed
- Add `<meta>` cache control hints for static hosting
- All assets are local (CSS, JS, SVG) except Prism.js CDN — add Prism.js fallback for offline
- Test criterion: DevTools Offline mode after first load should still render and generate

### Policy Size Warning
- AWS managed policy limit: 6,144 characters
- Warning threshold: 80% (4,915 chars)
- Display: inline warning banner in output panel when threshold exceeded
- Style: yellow/amber background with warning icon, shows character count

### Browser Compatibility
- Target: Chrome, Firefox, Safari, iOS Safari (latest 2 versions)
- Clipboard API fallback already in place (navigator.clipboard → execCommand)
- File download via Blob already works cross-browser
- ES modules supported by all targets

### Deploy
- SKIP actual GitHub Pages deployment
- DO create a minimal README.md with deployment instructions
- Ensure all paths are relative (no absolute URLs) for any static host

### Claude's Discretion
- Cache header meta tag specifics
- Warning banner exact styling
- README content and structure

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Complete site: index.html, css/styles.css, js/*.js, assets/
- Prism.js loaded from CDN in index.html
- All JS uses ES modules with relative imports

### Integration Points
- Policy size check hooks into output.js renderOutput flow
- Warning displayed in output panel content area

</code_context>

<specifics>
## Specific Ideas

- DSN-05 requirement: "Site works offline after first page load"
- Prism.js offline fallback: check if Prism global exists, skip highlighting if not
- Policy size warning only for AWS (other providers don't have same char limit concern)

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
