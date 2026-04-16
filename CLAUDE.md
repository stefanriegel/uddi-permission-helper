<!-- GSD:project-start source:PROJECT.md -->
## Project

**UDDI Permission Scope Helper**

A static micro site that helps Infoblox Universal DDI customers generate least-privilege permission policies for AWS, Azure, and GCP. Customers pick which discovery and management features they need, and the site outputs ready-to-use IAM policies, Terraform snippets, and step-by-step setup instructions.

**Core Value:** Customer can generate a minimal, security-team-approved permission policy in under 2 minutes — unblocking POCs that stall on broad read-only pushback.

### Constraints

- **Tech stack**: Pure static HTML/CSS/JS — no framework, no build step, no dependencies
- **Hosting**: Must be deployable to GitHub Pages, Netlify, or any static hosting
- **Data**: Permission data hardcoded in JS files (sourced from Infoblox docs)
- **Terminology**: Never use "CSP" to mean cloud provider — in Infoblox context CSP = Cloud Service Platform (the Infoblox platform itself). Use "cloud provider" or "AWS/Azure/GCP"
- **Branding**: Infoblox-branded (blue #0058a2, logo, product name)
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Approach
| Layer | Choice | Version | Why |
|-------|--------|---------|-----|
| HTML | Semantic HTML5 | native | Structure + accessibility; no framework overhead |
| CSS | CSS Custom Properties + Flexbox/Grid | native | Runtime-capable theming; no preprocessor needed |
| JavaScript | Vanilla ES2022+ modules | native | `type="module"` in script tags gives scoped, cacheable code; `import`/`export` work natively in every modern browser |
| Module loading | No import maps | n/a | Project has no external JS dependencies — import maps add complexity with zero benefit here |
### Syntax Highlighting
| Technology | Version | CDN URL Pattern | Why |
|------------|---------|-----------------|-----|
| Prism.js core | 1.30.0 | `https://cdn.jsdelivr.net/npm/prismjs@1.30.0/prism.min.js` | 11.7 KiB compressed; 2x faster than Highlight.js; modular language loading |
| Prism theme (tomorrow) | 1.30.0 | `https://cdn.jsdelivr.net/npm/prismjs@1.30.0/themes/prism-tomorrow.min.css` | Dark code theme; legible for IAM policy JSON |
| Prism JSON lang | 1.30.0 | `https://cdn.jsdelivr.net/npm/prismjs@1.30.0/components/prism-json.min.js` | AWS/GCP policy output |
| Prism bash lang | 1.30.0 | `https://cdn.jsdelivr.net/npm/prismjs@1.30.0/components/prism-bash.min.js` | `gcloud`/`az cli` command snippets |
| Prism HCL lang | 1.30.0 | `https://cdn.jsdelivr.net/npm/prismjs@1.30.0/components/prism-hcl.min.js` | Terraform output (`.tf` files) |
- Prism is modular — load only JSON + bash + HCL rather than a monolithic bundle. Highlight.js 11 ships ~130 KiB even with CDN-assets package; a targeted Prism load is under 30 KiB total.
- Prism is ~2x faster at runtime (1400–2000 highlights/sec vs ~700 for Highlight.js).
- Prism's CSS class approach (`language-json` on `<code>`) maps directly to static HTML without JavaScript re-rendering.
### Clipboard API
| API | Browser Support | Notes |
|-----|-----------------|-------|
| `navigator.clipboard.writeText` | All modern browsers (Baseline 2022) | Requires HTTPS — satisfied by GitHub Pages / Netlify / Cloudflare Pages |
| `document.execCommand('copy')` | Legacy fallback | Deprecated but still functional; catches Edge cases on HTTP localhost dev |
### File Download
- `Blob` + `URL.createObjectURL` + `a[download]` is universally supported, requires zero libraries, and works entirely client-side.
- The File System Access API (`showSaveFilePicker`) is not used — it has incomplete browser support in 2025 and is unnecessary for a simple one-shot download.
- Always call `URL.revokeObjectURL` immediately after triggering the click to avoid memory leaks (blobs are not garbage-collected while object URLs remain live).
### CSS Architecture
### Static Hosting
| Host | Free Plan | Custom Domain | HTTPS | CDN | Deploy Trigger | Verdict |
|------|-----------|---------------|-------|-----|----------------|---------|
| GitHub Pages | Yes | Yes | Yes | Partial (Fastly) | `git push` | Best for a repo-adjacent tool; zero config |
| Netlify | Yes | Yes | Yes | Full (global) | `git push` | Better CDN, deploy previews; slight over-engineering for this project |
| Cloudflare Pages | Yes (unlimited bandwidth) | Yes | Yes | Full (global, fastest) | `git push` | Best CDN performance; add if traffic warrants it |
## Alternatives Considered and Rejected
| Category | Recommended | Rejected | Reason Rejected |
|----------|-------------|----------|-----------------|
| Syntax highlighting | Prism.js 1.30 | Shiki | WASM dependency; 279 KiB; requires bundler |
| Syntax highlighting | Prism.js 1.30 | Highlight.js 11 | Larger bundle; slower; monolithic CDN asset |
| CSS framework | None (custom properties) | Tailwind CSS | Requires build step (JIT); CDN play mode is not production-grade |
| CSS framework | None (custom properties) | Bootstrap 5 | 20–70 KiB for unused components; adds complexity |
| Module loading | Native ES modules | Import maps | No external JS deps; import maps add zero value |
| File download | Blob + anchor | File System Access API | Incomplete browser support in 2025 |
| Clipboard | navigator.clipboard | clipboard.js library | Zero-dependency native API covers all cases |
| JS framework | Vanilla JS | React, Vue, Svelte | All require build step; violate project constraint |
## CDN Load Order (HTML `<head>`)
## Confidence Summary
| Area | Confidence | Basis |
|------|------------|-------|
| Core HTML/CSS/JS | HIGH | Native browser APIs |
| Prism.js version/CDN URLs | MEDIUM | GitHub releases (March 2025) + cdnjs; pinned to 1.30.0 |
| Prism HCL language support | MEDIUM | Confirmed in Prism source; accuracy caveats noted for complex HCL |
| Clipboard API | HIGH | MDN + Baseline 2025 announcement |
| File download (Blob) | HIGH | MDN + multiple 2025 sources |
| Static hosting | MEDIUM | 2025 comparison articles; no first-hand latency benchmarks |
## Sources
- [Highlight.js official site — current version 11.11.1](https://highlightjs.org/)
- [Highlight.js GitHub releases](https://github.com/highlightjs/highlight.js/)
- [Prism.js GitHub — v1.30.0 released March 2025](https://github.com/PrismJS/prism)
- [Comparing web code highlighters (January 2025)](https://chsm.dev/blog/2025/01/08/comparing-web-code-highlighters)
- [Prism HCL support issue](https://github.com/PrismJS/prism/issues/3837)
- [Clipboard API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
- [ClipboardItem.supports() Baseline announcement (March 2025)](https://web.dev/blog/baseline-clipboard-item-supports)
- [Blob API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
- [Generate and Download files using JavaScript](https://dev.to/wanoo21/generate-and-download-files-using-javascript-3ob3)
- [GitHub Pages vs Netlify comparison 2025](https://www.freetiers.com/blog/netlify-vs-github-pages-comparison)
- [GitHub Pages vs Cloudflare Pages 2025](https://www.freetiers.com/blog/github-pages-vs-cloudflare-pages-comparison)
- [ES Modules + Import Maps — no bundler approach](https://www.stevendcoffey.com/blog/esmodules-importmaps-modern-js-stack/)
- [CSS Custom Properties design tokens 2025](https://www.frontendtools.tech/blog/css-variables-guide-design-tokens-theming-2025)
- [LogRocket: Programmatically downloading files in the browser](https://blog.logrocket.com/programmatically-downloading-files-browser/)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
