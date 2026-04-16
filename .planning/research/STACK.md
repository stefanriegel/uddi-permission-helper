# Technology Stack

**Project:** UDDI Permission Scope Helper
**Researched:** 2026-04-16
**Constraint:** Pure static HTML/CSS/JS — no framework, no build step, no dependencies

---

## Recommended Stack

### Core Approach

| Layer | Choice | Version | Why |
|-------|--------|---------|-----|
| HTML | Semantic HTML5 | native | Structure + accessibility; no framework overhead |
| CSS | CSS Custom Properties + Flexbox/Grid | native | Runtime-capable theming; no preprocessor needed |
| JavaScript | Vanilla ES2022+ modules | native | `type="module"` in script tags gives scoped, cacheable code; `import`/`export` work natively in every modern browser |
| Module loading | No import maps | n/a | Project has no external JS dependencies — import maps add complexity with zero benefit here |

**Confidence:** HIGH — native browser APIs, no library choices to validate.

---

### Syntax Highlighting

**Recommended: Prism.js 1.30.0 via jsDelivr CDN**

| Technology | Version | CDN URL Pattern | Why |
|------------|---------|-----------------|-----|
| Prism.js core | 1.30.0 | `https://cdn.jsdelivr.net/npm/prismjs@1.30.0/prism.min.js` | 11.7 KiB compressed; 2x faster than Highlight.js; modular language loading |
| Prism theme (tomorrow) | 1.30.0 | `https://cdn.jsdelivr.net/npm/prismjs@1.30.0/themes/prism-tomorrow.min.css` | Dark code theme; legible for IAM policy JSON |
| Prism JSON lang | 1.30.0 | `https://cdn.jsdelivr.net/npm/prismjs@1.30.0/components/prism-json.min.js` | AWS/GCP policy output |
| Prism bash lang | 1.30.0 | `https://cdn.jsdelivr.net/npm/prismjs@1.30.0/components/prism-bash.min.js` | `gcloud`/`az cli` command snippets |
| Prism HCL lang | 1.30.0 | `https://cdn.jsdelivr.net/npm/prismjs@1.30.0/components/prism-hcl.min.js` | Terraform output (`.tf` files) |

**Why Prism over Highlight.js:**

- Prism is modular — load only JSON + bash + HCL rather than a monolithic bundle. Highlight.js 11 ships ~130 KiB even with CDN-assets package; a targeted Prism load is under 30 KiB total.
- Prism is ~2x faster at runtime (1400–2000 highlights/sec vs ~700 for Highlight.js).
- Prism's CSS class approach (`language-json` on `<code>`) maps directly to static HTML without JavaScript re-rendering.

**Caveat — Prism v2 transition:** The team is in active v2 development and only accepting security PRs against v1. v1.30.0 (March 2025) patched the last known CVE (CVE-2024-53382). Use v1.30.0 pinned; do not use `@latest`. v2 has no stable CDN release yet.

**Why not Shiki:** Shiki requires WASM and ships 279 KiB compressed. Incompatible with the no-build-step constraint and unacceptable for a lightweight micro site.

**Confidence:** MEDIUM — Prism v1.30.0 confirmed on GitHub (March 2025). HCL language support confirmed in Prism source. Performance benchmarks from January 2025 comparison article.

---

### Clipboard API

**Recommended: navigator.clipboard (Async Clipboard API) with execCommand fallback**

```
Primary:  navigator.clipboard.writeText(text)
Fallback: document.execCommand('copy') via temporary <textarea>
```

| API | Browser Support | Notes |
|-----|-----------------|-------|
| `navigator.clipboard.writeText` | All modern browsers (Baseline 2022) | Requires HTTPS — satisfied by GitHub Pages / Netlify / Cloudflare Pages |
| `document.execCommand('copy')` | Legacy fallback | Deprecated but still functional; catches Edge cases on HTTP localhost dev |

**Implementation pattern:**

```js
async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}
```

**Why this is sufficient:** All three target hosting platforms serve over HTTPS. `ClipboardItem.supports()` became Baseline on March 30, 2025 — the simpler `writeText` path has been universally supported since 2022. No library needed.

**Confidence:** HIGH — MDN documentation + Chrome for Developers official announcement.

---

### File Download

**Recommended: Blob + Anchor URL pattern (no library)**

```js
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);  // release immediately — single-use
}

// Usage
downloadFile(jsonString,  'aws-policy.json', 'application/json');
downloadFile(tfString,    'main.tf',         'text/plain');
downloadFile(guideString, 'setup-guide.txt', 'text/plain');
```

**Why this is the right approach:**

- `Blob` + `URL.createObjectURL` + `a[download]` is universally supported, requires zero libraries, and works entirely client-side.
- The File System Access API (`showSaveFilePicker`) is not used — it has incomplete browser support in 2025 and is unnecessary for a simple one-shot download.
- Always call `URL.revokeObjectURL` immediately after triggering the click to avoid memory leaks (blobs are not garbage-collected while object URLs remain live).

**Confidence:** HIGH — MDN Blob API + multiple corroborating 2025 sources.

---

### CSS Architecture

**Recommended: CSS Custom Properties for design tokens, no preprocessor**

```css
/* tokens.css — loaded first, scoped to :root */
:root {
  --color-brand:      #0058a2;  /* Infoblox primary blue */
  --color-brand-dark: #003d73;
  --color-surface:    #ffffff;
  --color-text:       #1a1a1a;
  --radius-card:      8px;
  --space-md:         1rem;
  --space-lg:         1.5rem;
}
```

CSS custom properties are runtime-capable (JS can update them) and require no build step. Infoblox brand color `#0058a2` is applied via token, making future brand changes a single-file edit.

**Why not Tailwind:** Tailwind requires a build step (JIT compilation). Even the CDN play mode outputs a large stylesheet and the team discourages it for production. Violates the no-build constraint.

**Why not Bootstrap/Bulma:** Adds 20–70 KiB of CSS for features this project does not use (grid framework, component styles). Overkill for a single-page micro site.

**Confidence:** HIGH — native CSS, no library version to validate.

---

### Static Hosting

**Recommended: GitHub Pages (primary) with Netlify/Cloudflare Pages as secondary options**

| Host | Free Plan | Custom Domain | HTTPS | CDN | Deploy Trigger | Verdict |
|------|-----------|---------------|-------|-----|----------------|---------|
| GitHub Pages | Yes | Yes | Yes | Partial (Fastly) | `git push` | Best for a repo-adjacent tool; zero config |
| Netlify | Yes | Yes | Yes | Full (global) | `git push` | Better CDN, deploy previews; slight over-engineering for this project |
| Cloudflare Pages | Yes (unlimited bandwidth) | Yes | Yes | Full (global, fastest) | `git push` | Best CDN performance; add if traffic warrants it |

**Recommendation:** Start with GitHub Pages. The project constraint explicitly lists it as a valid host. For pure static files with no build step, GitHub Pages has zero configuration overhead — push to `main`, enable Pages in repo settings, done. Migrate to Cloudflare Pages if performance or bandwidth become concerns.

**Confidence:** MEDIUM — based on 2025 comparison articles; actual latency varies by user geography.

---

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

---

## CDN Load Order (HTML `<head>`)

```html
<!-- 1. Brand tokens -->
<link rel="stylesheet" href="tokens.css">
<!-- 2. Page styles -->
<link rel="stylesheet" href="style.css">
<!-- 3. Syntax highlight theme -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.30.0/themes/prism-tomorrow.min.css">

<!-- Bottom of <body>, before </body> -->
<!-- 4. Prism core -->
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.30.0/prism.min.js"></script>
<!-- 5. Prism languages (only what's needed) -->
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.30.0/components/prism-json.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.30.0/components/prism-bash.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.30.0/components/prism-hcl.min.js"></script>
<!-- 6. App logic (type="module" for scoping) -->
<script type="module" src="app.js"></script>
```

Placing Prism scripts at the bottom of `<body>` ensures the DOM is parsed before `hljs.highlightAll()` runs. App logic uses `type="module"` for implicit deferred execution and lexical scoping.

---

## Confidence Summary

| Area | Confidence | Basis |
|------|------------|-------|
| Core HTML/CSS/JS | HIGH | Native browser APIs |
| Prism.js version/CDN URLs | MEDIUM | GitHub releases (March 2025) + cdnjs; pinned to 1.30.0 |
| Prism HCL language support | MEDIUM | Confirmed in Prism source; accuracy caveats noted for complex HCL |
| Clipboard API | HIGH | MDN + Baseline 2025 announcement |
| File download (Blob) | HIGH | MDN + multiple 2025 sources |
| Static hosting | MEDIUM | 2025 comparison articles; no first-hand latency benchmarks |

---

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
