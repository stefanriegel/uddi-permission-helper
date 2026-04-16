# Project Research Summary

**Project:** UDDI Permission Scope Helper
**Domain:** Static single-page cloud IAM least-privilege policy generator
**Researched:** 2026-04-16
**Confidence:** HIGH

## Executive Summary

The UDDI Permission Scope Helper is a micro-tool that fills a documented gap in the IAM tooling landscape: neither generic action pickers nor activity-based generators serve a customer who is starting a fresh Infoblox POC and needs a minimal, security-team-legible policy without cloud account access or historical activity data. The correct approach is a fully static, zero-dependency, zero-backend HTML/CSS/Vanilla JS site — no framework, no build step — deployed to GitHub Pages. This constraint is not a limitation but a feature: the tool works offline after first load, never phones home, and can be audited by security-conscious customers by viewing source.

The recommended architecture is a three-layer unidirectional data flow: static per-provider permission data objects drive a data-generated form UI, user selections accumulate in a Proxy-backed singleton store, and the store projects into pure formatter functions that output native policy JSON, Terraform HCL, and a step-by-step setup guide. The most important isolation boundary is keeping all permission strings in `data/` files and all formatting logic in pure `formatters/` functions — never mixed into views or event handlers.

The primary risk is permission data drift and cross-provider conceptual model bleeding. Hardcoded permission data will silently become stale as cloud providers evolve their APIs; every data file must carry a `lastVerified` timestamp and be sourced to a specific Infoblox documentation page. Each of the three providers (AWS, Azure, GCP) has a fundamentally different IAM model and must be treated as a completely separate output domain with its own data structure and output template. Building AWS first and adapting that structure for Azure or GCP is the highest-probability mistake.

---

## Key Findings

### Recommended Stack

The project is pure vanilla browser tech. Every framework and preprocessor was evaluated and rejected because they either require a build step or add CDN weight that exceeds the value delivered. The single external dependency is Prism.js 1.30.0 (pinned) from jsDelivr for syntax highlighting; it must be loaded via targeted component URLs (JSON + bash + HCL only) to stay under 30 KiB. All clipboard, file download, state management, and pub/sub functionality uses native browser APIs.

**Core technologies:**
- Semantic HTML5 + native ES2022 modules (`type="module"`) — structure, scoping, and deferred execution with zero configuration
- CSS Custom Properties (`:root` token file) — Infoblox brand tokens at runtime; no preprocessor required
- Prism.js 1.30.0 via jsDelivr CDN — syntax highlighting for JSON/bash/HCL; pinned version avoids the v2 transition regression risk; do NOT use `@latest`
- `navigator.clipboard.writeText` with `document.execCommand('copy')` fallback — all target hosting platforms serve HTTPS; fallback covers Safari and HTTP-localhost development
- `Blob` + `URL.createObjectURL` + `a[download]` — client-side file download with no backend; call `URL.revokeObjectURL` immediately to prevent memory leaks
- GitHub Pages — zero-config static hosting; migrate to Cloudflare Pages only if bandwidth warrants

### Expected Features

The competitive gap is a use-case-first, vendor-specific, zero-credential tool. Customers should say "I need DNS sync" and receive a copy-pasteable, security-team-legible policy with rationale — not a generic action picker where they must already know IAM action names.

**Must have (table stakes):**
- Provider selection (AWS / Azure / GCP) — entry point; nothing else works without it
- Feature / use-case selection — the core value; user picks what they need, tool maps to permissions
- Native policy output (AWS JSON, Azure CLI/ARM JSON, GCP gcloud YAML) — per-console format, not an abstraction
- Copy to clipboard per output block — standard expectation; friction without it
- Download as file (.json, .tf, .sh) — security teams paste into tickets and IaC repos
- Correct minimum permissions per selected feature — accuracy is make-or-break; wrong output destroys trust on first use
- Inline annotation of what each permission enables — users must justify each permission to their security team
- Step-by-step setup guide — differentiates from raw JSON dump; addresses the POC unblocking use case directly

**Should have (differentiators):**
- Wizard mode ("what do you need?") — converts business intent into permissions for non-IAM-expert customers
- Permission count badge (live-updating) — security reviewers evaluate blast radius by count
- Advanced / direct checkbox mode — power user escape hatch; forces through wizard is friction for SEs
- Terraform output (HCL) alongside native output — IaC-first enterprise teams; separate templates required per provider
- Works offline after first load — differentiates from SaaS CIEM tools on locked-down networks
- Infoblox-specific feature language — generic tools make users translate; this tool speaks the product UI directly

**Defer (v2+):**
- Multi-account / subscription / project support — real enterprise need, but validate core output is correct first
- Permission rationale per action (tooltips/comments) — high authoring cost; risks being incomplete
- Multi-account Terraform `for_each` patterns — validate demand before building

**Explicitly not building:**
- Live policy validation against real cloud accounts (requires backend, kills offline use)
- Activity-based generation from CloudTrail/Audit Logs (out-of-scope; AWS Access Analyzer's domain)
- Analytics or telemetry (security audience is rightly suspicious)
- User accounts or saved configurations (violates offline constraint)

### Architecture Approach

A three-layer unidirectional data flow with 13 total files and no package.json. Permission data files export static schema objects; the form view renders from schema (data-driven, not hardcoded markup); a Proxy-backed ES module singleton stores state and dispatches `CustomEvent('state-change')`; pure formatter functions (`selectedFeatureIds → { native, terraform, guide }`) compute output strings with no side effects; the output view subscribes to state changes and re-renders. Derived values (resolved feature list, permission list) are computed at render time — never stored — to prevent synchronisation bugs.

**Major components:**
1. `js/data/{aws,azure,gcp}.js` — hardcoded permission schema objects (features, wizard questions, permission strings); the single source of truth for all permission data; never mutated at runtime
2. `js/formatters/{aws,azure,gcp}.js` — pure functions with no imports except data utilities; return `{ native, terraform, guide }` strings; independently testable by pasting into a browser console
3. `js/store.js` — Proxy-backed singleton with `EventTarget` pub/sub; all state mutations go through here; views never talk to each other
4. `js/form-view.js` — renders wizard questions OR advanced checkboxes from schema; writes to store only
5. `js/output-view.js` — subscribes to `state-change`; calls formatter for active tab; drives copy/download buttons
6. `js/utils.js` — clipboard write, file download (Blob pattern), DOM helpers
7. `js/app.js` — entry point; wires modules; owns provider picker and mode toggle

**Build order (bottom-up, respects dependencies):**
1. `data/` — shapes must be settled before anything else
2. `formatters/` — pure functions; validate output correctness before any UI exists
3. `store.js` + `utils.js` — core contracts; no dependencies
4. `output-view.js` — testable by injecting state directly
5. `form-view.js` — writes to store; output-view already reacts
6. `app.js` — wires everything
7. `index.html` + `css/main.css` — can be written in parallel; bind at end

### Critical Pitfalls

1. **Permission data silently drifting** — stamp every `data/*.js` file with `lastVerified` date; source every permission to a specific Infoblox doc page with an inline comment; maintain `PERMISSION_MAINTENANCE.md` documenting re-verification process. Address in data modeling phase before any output is rendered.

2. **Cross-provider conceptual model bleeding** — AWS, Azure, and GCP have different IAM models; building Azure and GCP by adapting the AWS data structure produces syntactically or semantically invalid output. Treat each as a completely separate output domain. For Azure, default to built-in role assignments; emit custom role HCL only when no built-in role fits. Address in data modeling phase.

3. **Terraform output that fails on apply** — use separate, independently-designed templates for each output format; never derive Terraform HCL by string-transforming native JSON. Pin provider versions in generated snippets. Use `jsonencode()` not raw heredoc strings for AWS policy documents in HCL. Address in output template phase.

4. **Wizard-to-advanced mode state loss** — a single canonical Set of selected feature IDs must back both modes; wizard and advanced are views over the same state, not separate state objects. When switching to advanced, translate wizard answers to feature IDs. Address in UI/state architecture phase.

5. **AWS managed policy 6,144-character size limit exceeded silently** — compute character count after serialization; show a visible warning when approaching the limit with guidance on using inline role policy (10,240-char limit). Address in output rendering phase.

---

## Implications for Roadmap

### Phase 1: Data Modeling and Schema Foundation

**Rationale:** All other components depend on the permission schema shape. Formatters, form view, and state shape all derive from the data contract. Getting this right — and wrong assumptions surfaced — before writing any UI prevents rework across all subsequent phases. This is also where the two highest-severity pitfalls (data drift, cross-provider model bleeding) must be addressed.

**Delivers:** `data/aws.js`, `data/azure.js`, `data/gcp.js` with versioned, doc-sourced permission schemas; `PERMISSION_MAINTENANCE.md`; two-layer structure (wizard questions → features → permissions).

**Addresses:** Provider selection data, feature/use-case selection data, wizard question mapping, Infoblox-specific feature language.

**Avoids:** Silent permission drift (version stamps + doc sources from day one); cross-provider model bleeding (separate schemas, Azure built-in vs custom role decision made upfront); wizard mapping errors (two-layer structure enforced in schema).

**Research flag:** Needs validation — Infoblox documentation must be cross-referenced for each provider's actual required permissions. This is the most content-sensitive phase and cannot be fully validated from public IAM docs alone.

---

### Phase 2: Core State and Output Engine

**Rationale:** With settled data schemas, build the computing engine before any UI. Pure formatter functions can be tested by pasting into a browser console with a known input. Validating output correctness at this stage — before form UI exists — means bugs are caught in isolation, not buried in user interaction flows.

**Delivers:** `js/store.js` (Proxy singleton, EventTarget pub/sub), `js/formatters/aws.js` with native JSON output, `js/utils.js` (clipboard, download).

**Addresses:** Correct minimum permissions, native policy output (AWS first), copy to clipboard, download as file.

**Avoids:** Logic in event handlers (formatters are pure functions with no DOM access); DOM as source of truth (store is canonical); invalid JSON emission (always use `JSON.stringify`, never string concatenation); policy size limit (character count check added at this stage).

**Research flag:** Standard patterns — Proxy/EventTarget state management is well-documented. No additional research needed.

---

### Phase 3: UI Shell and Form View

**Rationale:** With state and output logic proven, build the interaction layer. Rendering from the schema data structure means form markup is never hardcoded. Provider selection and mode toggle belong here — they are entry-point interactions that gate everything else.

**Delivers:** `index.html` skeleton, `css/main.css` with Infoblox brand tokens, `js/form-view.js` (wizard + advanced modes), `js/app.js` entry point, provider picker, mode toggle.

**Addresses:** Provider selection UI, wizard mode, advanced/direct checkbox mode, permission count badge.

**Avoids:** Wizard state loss on mode switch (single canonical feature-ID Set backing both modes); terminology collision on "CSP" (naming convention established before any copy is written); no visual separation between providers in advanced mode (provider scopes the entire form, not just a tab).

**Research flag:** Standard patterns — form rendering from schema and vanilla state management are established. No additional research needed.

---

### Phase 4: Output Views and Interaction

**Rationale:** With state engine and form view complete, wire the output panel. This phase adds the output tabs, copy/download buttons, permission badge, and syntax highlighting. All browser compatibility edge cases (clipboard in Safari, file download on iOS) are addressed here.

**Delivers:** `js/output-view.js` (tab rendering, copy/download wiring), Prism.js integration, permission count badge, visual feedback states (Copied!, error fallback), setup guide output.

**Addresses:** Copy to clipboard, download as file, syntax highlighting, permission count badge, inline permission annotations, step-by-step setup guide.

**Avoids:** Clipboard failure on Safari (sync handler, execCommand fallback, explicit visual feedback); file download broken on iOS (detect `download` attribute support; data-URI fallback); Prism loaded at body end after DOM is parsed; permission count badge deduplicated per-provider logic.

**Research flag:** Standard patterns for clipboard and file download — but Safari clipboard async behavior needs explicit test before marking done. Do not ship without manual Safari test.

---

### Phase 5: Azure and GCP Parity

**Rationale:** AWS is the most complex and most-requested case; validate the output engine with AWS before building Azure and GCP. Adding Azure and GCP after the core loop is solid means the architecture is proven — adding `formatters/azure.js` and `formatters/gcp.js` does not require architectural changes.

**Delivers:** `data/azure.js`, `data/gcp.js` (permission schemas), `js/formatters/azure.js`, `js/formatters/gcp.js` (native policy + Terraform + guide output for each).

**Addresses:** Azure native output (built-in role assignments + custom role HCL), GCP native output (gcloud CLI + custom role YAML), Azure/GCP Terraform HCL.

**Avoids:** Cross-provider model bleeding (separate formatter per provider, validated against one real official example before shipping each); Terraform format errors for Azure (`azurerm_role_definition` structure vs. Azure CLI JSON) and GCP (plain permission strings, not `roles/` prefix format).

**Research flag:** Needs research during planning — Azure's built-in vs. custom role decision per Infoblox feature requires reading the Azure RBAC docs for each feature. GCP gcloud command syntax for `add-iam-policy-binding` vs. console JSON format must be verified against current provider docs.

---

### Phase 6: Hardening and Deployment

**Rationale:** Before release, validate all browser compatibility edge cases, offline behavior, policy size warnings, and deploy to GitHub Pages. This phase has no new features — only correctness and reliability.

**Delivers:** GitHub Pages deployment, offline cache behavior verified (DevTools Network > Offline test), policy size limit warnings displayed for all three providers, `PERMISSION_MAINTENANCE.md` finalized, manual cross-browser test (Chrome, Firefox, Safari, iOS Safari).

**Addresses:** Offline / works after first load requirement, policy size limit exceeded warning, iOS file download fallback verified.

**Avoids:** Offline behavior assumed but not tested (explicit offline test before deploy); unverified offline = Service Worker clarification resolved.

**Research flag:** Standard — GitHub Pages deployment is zero-config. Offline caching behavior requires one explicit manual test to confirm browser default cache headers are sufficient (no Service Worker needed for this deployment target).

---

### Phase Ordering Rationale

- **Data before UI:** All form markup and output formatting derive from the permission schema shape. Settling that contract first prevents rework cascade.
- **Formatters before form view:** Pure functions with no DOM access can be tested in a browser console with hardcoded input — this validates correctness before any interaction is possible.
- **AWS before Azure/GCP:** Most complex case first; architecture is proven before multiplying across providers. Adding providers requires only new data files and formatter files, no architectural changes.
- **Output interaction (Phase 4) after form view (Phase 3):** Output view subscribes to store state; store must exist and form must be able to write to it before output can react.
- **Hardening last:** Offline verification, cross-browser testing, and size warnings are correctness checks, not features. They belong at the end when the full feature surface is stable.

### Research Flags

Phases needing deeper research during planning:
- **Phase 1 (Data Modeling):** Infoblox-specific permission accuracy cannot be fully validated from public cloud IAM docs. The actual required permissions for each Infoblox UDDI feature must be cross-referenced against Infoblox product documentation (UDDI Admin Guide). This is the single highest-risk dependency.
- **Phase 5 (Azure/GCP Parity):** Azure built-in role assignments per Infoblox feature need explicit mapping against Azure RBAC docs. GCP gcloud command format for IAM bindings has changed across CLI versions — current syntax must be verified.

Phases with standard patterns (skip research-phase):
- **Phase 2 (State/Output Engine):** Proxy + EventTarget pattern is well-documented; pure formatter functions follow established separation-of-concerns patterns.
- **Phase 3 (UI Shell):** Data-driven form rendering from schema objects is a standard pattern with multiple high-confidence sources.
- **Phase 6 (Hardening):** GitHub Pages deployment and browser cache behavior are well-understood; Safari clipboard behavior is documented and the fix is known.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All core choices are native browser APIs; only Prism.js CDN URL is MEDIUM (pinned to confirmed 1.30.0) |
| Features | HIGH for table stakes, MEDIUM for differentiators | Table stakes derived from surveying 8 reference tools; differentiators based on fewer comparators |
| Architecture | HIGH | Proxy/EventTarget patterns sourced from multiple authoritative references (MDN, patterns.dev, Go Make Things) |
| Pitfalls | HIGH for cloud provider limits and policy formats | AWS/Azure/GCP quota docs are official; Safari clipboard async pitfall confirmed by multiple sources |

**Overall confidence:** HIGH

### Gaps to Address

- **Infoblox-specific permission accuracy:** The correctness of the actual permission lists for each Infoblox UDDI feature is the most important unresolved question. This requires access to Infoblox product documentation (UDDI Admin Guide) — not resolvable from public cloud IAM docs. Address in Phase 1 data modeling.
- **Azure built-in role sufficiency per feature:** For each Infoblox feature on Azure, a decision is needed: does an existing built-in role (e.g., DNS Zone Contributor, Reader) cover the need, or is a custom role required? This mapping is not resolvable from public sources alone.
- **Offline caching definition:** PROJECT.md states "works offline after first load" but does not specify whether this means browser default HTTP caching or an explicit Service Worker. Clarify during Phase 6 — a quick DevTools offline test will resolve it.
- **Prism HCL language accuracy for Terraform output:** Prism's HCL grammar covers common patterns but has known accuracy caveats for complex HCL. If generated Terraform output uses advanced HCL constructs, syntax highlighting may be incorrect (cosmetic issue only, not a correctness risk).

---

## Sources

### Primary (HIGH confidence)
- [AWS IAM quotas — character limits](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_iam-quotas.html)
- [AWS IAM policy grammar reference](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_grammar.html)
- [GCP IAM custom roles — limits](https://docs.cloud.google.com/iam/docs/creating-custom-roles)
- [Azure custom roles — limits](https://learn.microsoft.com/en-us/azure/role-based-access-control/custom-roles)
- [Clipboard API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
- [Blob API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
- [JavaScript modules — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Observer Pattern — Patterns.dev](https://www.patterns.dev/vanilla/observer-pattern/)
- [Singleton Pattern — Patterns.dev](https://www.patterns.dev/vanilla/singleton-pattern/)
- [policy_sentry (Salesforce) — feature comparison](https://policy-sentry.readthedocs.io/en/latest/appendices/comparison-to-related-tools/)
- [GCP IAM Recommender overview](https://cloud.google.com/blog/products/identity-security/achieve-least-privilege-with-less-effort-using-iam-recommender)
- [Azure RBAC best practices](https://learn.microsoft.com/en-us/azure/role-based-access-control/best-practices)
- [Prism.js GitHub — v1.30.0 March 2025](https://github.com/PrismJS/prism)

### Secondary (MEDIUM confidence)
- [Prism.js vs Highlight.js performance comparison (January 2025)](https://chsm.dev/blog/2025/01/08/comparing-web-code-highlighters)
- [ClipboardItem.supports() Baseline announcement (March 2025)](https://web.dev/blog/baseline-clipboard-item-supports)
- [Safari Clipboard API async workaround](https://wolfgangrittner.dev/how-to-use-clipboard-api-in-safari/)
- [Clipboard API: HTTPS requirement, Safari async pitfall](https://medium.com/@seeranjeeviramavel/the-pitfall-of-using-navigator-clipboard-in-non-https-web-apps-b47e3f065ab6)
- [Terraform: mixing trust and permission policies — MalformedPolicyDocument](https://oneuptime.com/blog/post/2026-02-23-how-to-fix-error-creating-iam-role-malformedpolicydocument/view)
- [GitHub Pages vs Netlify comparison 2025](https://www.freetiers.com/blog/netlify-vs-github-pages-comparison)
- [Wizard UX: state management and mode transitions — NNGroup](https://www.nngroup.com/articles/wizards/)
- [Reactivity Without a Framework — OpenReplay](https://blog.openreplay.com/reactivity-without-framework-native-js/)
- [Simple reactive data stores with vanilla JS and Proxies — Go Make Things](https://gomakethings.com/simple-reactive-data-stores-with-vanilla-javascript-and-proxies/)
- [Managing large IAM policies: overcoming character limits](https://www.virtuability.com/blog/2025-08-30-managing-large-iam-policies-overcoming-character-limits/)

---
*Research completed: 2026-04-16*
*Ready for roadmap: yes*
