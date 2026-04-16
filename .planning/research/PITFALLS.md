# Domain Pitfalls: Cloud IAM Policy Generator

**Domain:** Static site — Infoblox Universal DDI least-privilege policy generator (AWS/Azure/GCP)
**Researched:** 2026-04-16
**Applies to:** UDDI Permission Scope Helper

---

## Critical Pitfalls

Mistakes that will require rewrites, generate wrong policies, or damage trust with security teams.

---

### Pitfall 1: Hardcoded Permission Data That Silently Drifts

**What goes wrong:** Cloud providers add, rename, or deprecate IAM permissions as their APIs evolve. AWS creates a new managed policy and deprecates the old one without removing it; GCP predefined roles gain or lose permissions when services update; Azure built-in role definitions change their `Actions` arrays. A static site with hardcoded permission data has no mechanism to detect or signal this drift. Customers receive policies that either fail silently (missing a now-required permission) or include permissions that no longer exist (policy validation error on apply).

**Why it happens:** The "permissions rarely change" assumption is directionally true for stable services but breaks for newer or fast-moving services. EC2 networking APIs (Transit Gateway, IPAM), Azure Private DNS, and GCP Cloud DNS have all had permission-level changes in recent years. Because the site is pure static with no backend, there is no nightly job to verify the permission set.

**Consequences:**
- Security teams apply the generated policy and see validation errors — destroys trust immediately.
- Policies silently under-grant: discovery fails at runtime with an opaque IAM error; customer blames the tool.
- Policies over-grant via stale permissions: security team rejects the policy on audit.

**Warning signs:**
- No version date or "last verified" stamp visible in the UI.
- No changelog for the permission data JS files.
- Cloud provider release notes mention a service the tool covers.

**Prevention:**
- Stamp each permission dataset with a `lastVerified` date and surface it in the UI ("AWS permissions last verified against Infoblox docs: 2026-04-16").
- Treat each provider's permission data as a versioned module (e.g., `data/aws-permissions.js` with a top-of-file version comment).
- Add a `PERMISSION_MAINTENANCE.md` that documents which official Infoblox doc page each permission set was sourced from and what the manual re-verification process is.
- Flag all three providers' permission files in the repo README with a "requires manual re-check when Infoblox releases a new version" note.

**Phase to address:** Foundation / data modeling phase. Version stamps must be present before any output is rendered.

---

### Pitfall 2: Generating Policies That Exceed Cloud Provider Size Limits

**What goes wrong:** AWS managed policies have a hard 6,144-character limit. Inline policies differ: 2,048 characters for users, 10,240 for roles. If the tool generates a large combined policy (many feature categories selected, all providers), the raw JSON output may exceed these limits silently — the UI shows valid-looking JSON but AWS rejects it on `CreatePolicy` with `MalformedPolicyDocument` or a quota error.

Azure custom role definitions also have size constraints, and GCP custom roles cap at 64 KB total.

**Why it happens:** During development, small test selections work fine. Only a "select everything" case hits the limit, which developers rarely test. Output length is not checked against provider limits.

**Consequences:**
- Customer copies the generated policy, pastes it into AWS Console, and gets a confusing error with no indication that the tool is the cause.
- Terraform apply fails on the `aws_iam_policy` resource with a size error — the customer must manually split the policy.

**Warning signs:**
- No character/size counter on the output panel.
- No "select all" test case in manual testing.

**Prevention:**
- Instrument the output generation: compute character count after JSON serialization and compare against known limits.
- Display a visible warning in the output panel when the policy exceeds the threshold (e.g., "This policy is 6,312 characters. AWS managed policies are limited to 6,144 characters. Consider splitting into two policies or using an inline role policy.").
- For AWS, suggest using the `roles` inline policy limit (10,240) instead of managed policy if size is the concern.

**Phase to address:** Output rendering phase.

---

### Pitfall 3: Terraform Output That Looks Valid But Fails on Apply

**What goes wrong:** The Terraform snippet output for IAM policies has multiple format traps that look correct in a textarea but fail when applied:

1. Using raw JSON heredoc strings instead of `jsonencode()` — typos in the raw string are not caught by Terraform's parser until `plan` time.
2. Mixing trust policies and permission policies in the same `aws_iam_policy_document` data source — trust policies require `Principal`, permission policies use `Resource`; mixing them produces a `MalformedPolicyDocument` error.
3. Azure Terraform (`azurerm_role_definition`) uses a different structure than the Azure CLI JSON for the same custom role — generating Azure CLI JSON and labeling it as Terraform HCL is a high-probability mistake.
4. GCP Terraform (`google_project_iam_custom_role`) permission lists must be plain strings like `"compute.instances.list"`, not the `roles/` prefix format.

**Why it happens:** The tool author knows IAM policy semantics but may not be a Terraform expert for all three providers. The formats look superficially similar but have distinct schemas.

**Consequences:** Customer runs `terraform plan` and gets a provider-level error. They assume the permissions are wrong, not the format. They manually fix without understanding the underlying issue, and may introduce over-privileged policies.

**Warning signs:**
- Terraform output is a single template not verified against the Terraform provider's official resource schema.
- No provider version pinned in the generated snippet.

**Prevention:**
- Maintain separate output templates for each format (native JSON, Terraform HCL, CLI commands) — never derive one by string-transforming another.
- Pin a provider version in all generated Terraform snippets (e.g., `required_providers { aws = { source = "hashicorp/aws", version = "~> 5.0" } }`).
- Add comments in generated Terraform snippets explaining the structure so customers understand what they are applying.
- Reference and test snippets against the official Terraform registry docs for each provider's IAM resources.

**Phase to address:** Output template phase. Each format needs its own explicitly-designed template, not a derived one.

---

### Pitfall 4: Cross-Provider Conceptual Model Bleeding

**What goes wrong:** AWS, Azure, and GCP have fundamentally different IAM models:

- **AWS:** Permission policies are JSON documents attached to roles/users. Actions are namespaced (`ec2:DescribeInstances`). Deny is explicit.
- **Azure:** RBAC uses role assignments combining a built-in or custom role definition with a scope. For this tool, most Azure needs are met by built-in roles (Reader, DNS Zone Contributor) — only DNS Resolver integration needs a custom role. Generating full Azure custom role JSON when a built-in role assignment would suffice is over-engineering.
- **GCP:** Policies bind members to roles (predefined or custom). Custom roles use `includedPermissions` arrays with plain permission strings. The gcloud CLI command format (`add-iam-policy-binding`) differs significantly from the Console JSON format.

A tool that treats all three providers as "just a list of permissions" will produce Azure output that looks like an AWS policy JSON, or GCP output that uses AWS-style action namespacing.

**Why it happens:** Developer builds the AWS case first, then adapts the same data structure and output template for Azure and GCP without deeply reading the provider's actual policy format.

**Consequences:** Generated output is syntactically invalid or semantically wrong for the provider. A customer applying an Azure role definition with AWS-style JSON syntax will get an immediate API error.

**Warning signs:**
- Single `PolicyStatement` data model used for all three providers.
- Azure output contains `Action` instead of `actions`.
- GCP output uses `arn:aws:` or `Microsoft.` namespace formats.

**Prevention:**
- Treat each provider as a completely separate output domain with its own data structure and template.
- For Azure: explicitly decide per feature whether to use a built-in role assignment (preferred, simpler) or a custom role definition (only when no built-in fits). The generator should default to built-in role assignments and only emit custom role HCL when required.
- Validate each provider's output format against one real example from the provider's official documentation before shipping.

**Phase to address:** Data modeling phase (before output templates are written).

---

## Moderate Pitfalls

---

### Pitfall 5: Wizard State Not Surviving Mode Switch

**What goes wrong:** The tool offers a wizard mode (guided questions) and an advanced mode (direct checkbox selection). If switching between modes resets the user's selections, a customer who spent 2 minutes in the wizard loses all their answers the moment they click "Advanced Mode" to fine-tune one setting.

**Why it happens:** The wizard state and the checkbox state are stored separately and not reconciled. The simplest implementation just re-renders from scratch on mode switch.

**Consequences:** Users stop trusting the tool, or avoid using the wizard entirely and go straight to advanced mode — defeating the wizard's purpose as an on-ramp for non-experts.

**Warning signs:**
- Wizard and advanced mode use separate state objects.
- Mode switch triggers a page-section show/hide with no state translation.

**Prevention:**
- Use a single canonical state object: a flat set of selected feature IDs. Both the wizard and the advanced mode are views over this same state.
- When switching from wizard to advanced mode, translate the answered questions into the corresponding feature IDs and pre-check them.
- When switching from advanced back to wizard, infer which wizard answers are implied by the selected features.

**Phase to address:** UI/state architecture phase.

---

### Pitfall 6: Clipboard Copy Failing Silently in Non-HTTPS Contexts

**What goes wrong:** `navigator.clipboard.writeText()` requires a secure context (HTTPS). During development (served over `file://` or `http://localhost`), it will throw `NotAllowedError` or be undefined entirely. GitHub Pages serves over HTTPS, but internal preview environments, local file opens, or customer intranet mirrors may not.

Safari also requires the clipboard API call to happen synchronously within a user gesture handler — wrapping the write in an `async/await` chain breaks it in Safari.

**Why it happens:** Developers test on `localhost` over HTTP during development. The clipboard call silently fails and there is no feedback. Production HTTPS masks the issue, but the Safari async context bug remains.

**Consequences:** Customer clicks "Copy to Clipboard," nothing happens, no error message is shown. They assume the tool is broken.

**Warning signs:**
- No fallback for `navigator.clipboard` unavailability.
- Copy button shows no failure state (spinner, error, or fallback text selection).
- No test on Safari.

**Prevention:**
- Check `navigator.clipboard` availability before calling it; fall back to `document.execCommand('copy')` on a programmatically selected `<textarea>`.
- Always show explicit visual feedback: green "Copied!" on success, and a visible error (or auto-select the text) on failure.
- For Safari: do not chain `navigator.clipboard.writeText()` inside an `async` function that awaits anything before the call. Construct the text content first, then call `writeText()` directly in the click handler.

**Phase to address:** Output/interaction phase.

---

### Pitfall 7: File Download Breaking on iOS / Content Security Policy Restrictive Headers

**What goes wrong:** The `<a href="blob:..." download="policy.json">` pattern for client-side file downloads works in desktop Chrome/Firefox/Edge but has known issues:

- **iOS Safari:** Does not support the `download` attribute on blob URLs — the link opens the file in a new tab instead of downloading it.
- **Restrictive CSP headers on the hosting provider:** Some static hosting services (Netlify, Vercel) add a `Content-Security-Policy` header that blocks `blob:` URLs unless explicitly whitelisted.

**Why it happens:** Developer tests on desktop Chrome, which works. Mobile and hosting-level CSP are not tested.

**Consequences:** iOS customers (common for security/network engineers who use mobile devices) cannot download files. The "Download as .json" button silently opens a blob URL in the browser.

**Warning signs:**
- No mobile test of the download button.
- Hosting platform CSP headers not reviewed.

**Prevention:**
- For iOS: detect iOS User-Agent or test the `download` attribute support; fall back to opening the content in a `<pre>` with a "Select all and copy" instruction, or use a `data:` URI instead of `blob:`.
- Review Netlify/GitHub Pages default CSP headers and ensure `blob:` is not blocked for the content type being served.
- Add a `<noscript>` or fallback path for browsers where blob creation fails.

**Phase to address:** Output/interaction phase.

---

### Pitfall 8: Wizard Question Design Mapping Incorrectly to Permission Sets

**What goes wrong:** Wizard questions ask about business intent ("Do you need asset discovery?") and the tool translates those answers into a specific permission set. If the mapping is wrong — e.g., "asset discovery" maps to only EC2 describe permissions but actually also requires VPC and Route53 describe permissions for full Infoblox vDiscovery — the generated policy will be incomplete. The customer applies it, discovery fails, and they have to debug IAM errors to figure out what's missing.

**Why it happens:** The question-to-permission mapping is written from memory or a partial reading of the Infoblox docs, not systematically cross-referenced against every sub-feature of the discovery capability.

**Consequences:** Incomplete policies that fail at runtime. Customer loses trust. Each failure requires a support ticket that includes IAM debugging — expensive.

**Warning signs:**
- Mapping defined in one JS object without comments linking each permission to a documentation source.
- No cross-reference between wizard questions and the full feature permission matrix.

**Prevention:**
- Source every permission to a specific line in the official Infoblox documentation. Add inline comments in the data file: `// Source: Infoblox UDDI Admin Guide v9.x, Chapter 4: AWS Discovery setup`.
- Build the permission data as a two-layer structure: features define their required permissions, and wizard questions map to features. Never map questions directly to permissions.
- Review the mapping end-to-end against the Infoblox documentation before shipping each provider.

**Phase to address:** Data modeling phase, and regression check at each deployment.

---

### Pitfall 9: Permission Count Badge Misleading Users

**What goes wrong:** The "total permissions granted" badge is meant to help users understand the scope of what they are requesting. If the count is computed incorrectly — counting duplicate permissions once across features (correct) vs. once per feature that includes them (inflated) — the badge will either over-report or under-report.

More subtly: Azure uses role-based assignments, not individual permissions. Counting "Reader" as "1 permission" is accurate from an assignment standpoint but misleading to a security reviewer who wants to know the actual underlying Azure RBAC action count.

**Why it happens:** The badge logic is added late in development as a UI flourish without deep thought about deduplication across providers with fundamentally different permission granularity models.

**Consequences:** Security team sees "18 permissions" on the badge but when they read the generated Azure policy it contains the Reader role which grants hundreds of individual actions. Trust is undermined.

**Prevention:**
- For AWS/GCP: deduplicate the action/permission list before counting.
- For Azure: count role assignments (not implied actions) AND add a tooltip explaining "X role assignments; actual Azure RBAC actions vary by role."
- Write a unit test that asserts the count for a known selection set.

**Phase to address:** Output rendering phase.

---

## Minor Pitfalls

---

### Pitfall 10: Terminology Collision: "CSP"

**What goes wrong:** In standard cloud industry usage, "CSP" means "Cloud Service Provider" (AWS, Azure, GCP). In the Infoblox ecosystem, "CSP" means "Cloud Services Platform" — the Infoblox management plane itself. Using "CSP" in UI copy, code comments, or variable names causes immediate confusion when an Infoblox customer reads the tool.

**Prevention:** Never use the abbreviation "CSP" in any UI text, code comments, or variable names. Use "cloud provider," "AWS/Azure/GCP," or "provider" instead. Add a lint comment or code review note to enforce this.

**Phase to address:** Foundation phase (establish naming convention before any UI copy is written).

---

### Pitfall 11: Offline / PWA Support Not Actually Tested

**What goes wrong:** The requirement states "site works offline after first load." This implies the assets are cached by the browser. However, a plain static site without an explicit Service Worker or Cache-Control header strategy does not guarantee offline operation — browsers may evict the cache, or the host may send `no-store` headers.

**Prevention:** Explicitly test offline behavior: load the site, go offline (DevTools > Network > Offline), reload. Confirm it serves from cache. Add a Service Worker or verify that GitHub Pages / Netlify default cache headers allow offline use. Clarify in the requirement whether "offline" means "works on flaky connections" (which browser caching alone may satisfy) or "works with device airplane mode after first load" (which needs a Service Worker).

**Phase to address:** Deployment / hardening phase.

---

### Pitfall 12: Output Not Validated Before Display

**What goes wrong:** The JSON output for AWS policies is generated by string concatenation or object serialization. If the data contains characters that need JSON escaping (e.g., a description string with a quote), the output may be syntactically invalid JSON that looks correct in a textarea but fails to parse when the customer uses it.

**Prevention:** Always generate the policy object in memory as a proper JS object, then use `JSON.stringify(obj, null, 2)` for output. Never construct JSON by string concatenation. Add a `JSON.parse()` assertion in the generation function to catch invalid output before rendering.

**Phase to address:** Output template phase.

---

### Pitfall 13: No Visual Separation Between Providers in Advanced Mode

**What goes wrong:** If the advanced mode shows all three providers' feature checkboxes on one screen without clear visual grouping, users may check a GCP feature while on the "AWS output" tab, leading to selections that don't affect the visible output. This creates a confusing "nothing changed" experience.

**Prevention:** Keep provider selection at the top level. Once a provider is selected, only show that provider's features. Switching providers either clears the selection (with a warning) or maintains per-provider selections separately.

**Phase to address:** UI/state architecture phase.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Data modeling (permission JS files) | Stale data, wrong mapping, cross-provider model bleeding | Version stamps, doc-sourced comments, separate data models per provider |
| Data modeling | Azure role type decision (built-in vs custom) | Default to built-in role assignments; custom only where required |
| Wizard question design | Question-to-feature mapping incomplete | Two-layer structure (question → feature → permission); trace to docs |
| UI/state architecture | Mode switch resets selections | Single canonical feature-ID state; wizard/advanced are views over it |
| UI/state architecture | Terminology collision on "CSP" | Naming convention established before any copy is written |
| Output rendering | Policy size limit exceeded | Character count check with visible warning before render completes |
| Output rendering | Terraform format errors | Separate templates per format, never derive one from another |
| Output rendering | Permission count badge misleading for Azure | Per-provider counting logic with tooltip explaining role vs. action distinction |
| Output/interaction | Clipboard failure on Safari / non-HTTPS | Sync handler, fallback to execCommand, explicit failure state |
| Output/interaction | File download broken on iOS | Detect download attribute support; fallback to select-and-copy |
| Output/interaction | Invalid JSON emitted | Always stringify via JSON.stringify, assert parsability before render |
| Deployment | Offline behavior not verified | Explicit offline test before each deploy; clarify "offline" definition |

---

## Sources

- [IAM and AWS STS quotas (character limits)](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_iam-quotas.html) — HIGH confidence
- [AWS deprecated managed policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_managed-deprecated.html) — HIGH confidence
- [AWS IAM policy validation reference](https://docs.aws.amazon.com/IAM/latest/UserGuide/access-analyzer-reference-policy-checks.html) — HIGH confidence
- [GCP IAM roles overview](https://docs.cloud.google.com/iam/docs/roles-overview) — HIGH confidence
- [GCP custom roles: 64 KB limit, etag pattern](https://docs.cloud.google.com/iam/docs/creating-custom-roles) — HIGH confidence
- [Azure custom roles: assignable scopes and limits](https://learn.microsoft.com/en-us/azure/role-based-access-control/custom-roles) — HIGH confidence
- [Azure RBAC limits (500 role assignments per management group)](https://learn.microsoft.com/en-us/azure/role-based-access-control/troubleshoot-limits) — HIGH confidence
- [Clipboard API: HTTPS requirement, Safari async pitfall](https://medium.com/@seeranjeeviramavel/the-pitfall-of-using-navigator-clipboard-in-non-https-web-apps-b47e3f065ab6) — MEDIUM confidence
- [Safari Clipboard API async workaround](https://wolfgangrittner.dev/how-to-use-clipboard-api-in-safari/) — MEDIUM confidence
- [Clipboard API browser baseline (March 2025)](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) — HIGH confidence
- [Terraform: mixing trust and permission policies — MalformedPolicyDocument](https://oneuptime.com/blog/post/2026-02-23-how-to-fix-error-creating-iam-role-malformedpolicydocument/view) — MEDIUM confidence
- [Wizard UX: state management and mode transitions](https://www.nngroup.com/articles/wizards/) — HIGH confidence
- [Wizard UX: context loss and drop-off risk](https://blog.logrocket.com/ux-design/creating-setup-wizard-when-you-shouldnt/) — MEDIUM confidence
- [AWS IAM policy JSON grammar and mutual exclusions](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_grammar.html) — HIGH confidence
- [Managing large IAM policies: overcoming character limits](https://www.virtuability.com/blog/2025-08-30-managing-large-iam-policies-overcoming-character-limits/) — MEDIUM confidence
