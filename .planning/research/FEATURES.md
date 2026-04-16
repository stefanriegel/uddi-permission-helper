# Feature Landscape

**Domain:** Cloud IAM least-privilege policy generator / permission scoping tool
**Project:** UDDI Permission Scope Helper
**Researched:** 2026-04-16
**Overall confidence:** HIGH for table stakes (well-established pattern); MEDIUM for differentiators (fewer comparable tools)

---

## Reference Tools Surveyed

| Tool | Vendor | Type | Notes |
|------|--------|------|-------|
| AWS IAM Access Analyzer | AWS | Native, activity-based | CloudTrail-driven, 90-day window |
| AWS Policy Generator | AWS | Native, static UI | Broad action picker, not use-case scoped |
| GCP IAM Recommender | Google | Native, ML-based | Role replacement, not generation |
| Azure RBAC / PIM | Microsoft | Native, GUI + CLI | Role assignment, not a generator |
| policy_sentry | Salesforce OSS | CLI tool | ARN + access-level based generation |
| iamlive | OSS | CLI proxy | Captures live API calls, generates minimal policy |
| terraform-policymaker | OSS | CLI / Terraform | Generates Terraform IAM from crash logs |
| aws.permissions.cloud / gcp.permissions.cloud | Community | Reference site | Searchable permission database, no generation |

---

## Table Stakes

Features users expect. Missing = tool feels incomplete or unusable.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Provider selection** (AWS / Azure / GCP) | Every tool in the space does this; users need to know which cloud they're scoping | Low | Single-select or tabbed |
| **Feature/use-case selection** | Core value: user picks what they need, tool gives them the right permissions — not the user picking permissions directly | Medium | The wizard or checkbox model |
| **Native policy output** (JSON for AWS, Azure CLI / ARM JSON, GCP gcloud / YAML) | Users need the format their console or CLI accepts, not an abstraction | Medium | Three formats, each with its own schema |
| **Copy to clipboard** | Every code-output tool has this; lack of it is a friction point security teams notice | Low | Per-output-block button |
| **Download as file** (.json, .tf, .sh) | Security teams frequently paste into ticketing systems or IaC repos; they expect a file | Low | Client-side Blob API, no backend |
| **Minimum-permission guarantee / least-privilege framing** | The entire reason users come: to prove to a security team that the policy is minimal, not broad | Medium | Achieved by tight data mapping, not UI |
| **Correct permissions per selected feature** | If the output is wrong, the tool destroys trust on first use | High | Accuracy of underlying permission data is make-or-break |
| **Clear labeling of what each permission enables** | Users must justify each permission to their security team; blind lists fail that use case | Low | Inline annotations or a legend |
| **Step-by-step setup guide** | AWS/Azure/GCP console flows differ; users need walkthrough, not just a policy blob | Medium | Per-provider procedural steps alongside output |

---

## Differentiators

Features that set this tool apart. Not universally expected, but high value for the specific audience (Infoblox customers unblocking POCs).

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Wizard mode ("what do you need?")** | Lowers cognitive load for customers who know their use case but not the IAM action names. Converts "I need DNS sync" into permissions automatically | Medium | Questions map directly to Infoblox feature categories |
| **Advanced / direct checkbox mode** | Power users (SEs, architects) know exactly which features they want; forcing them through a wizard is friction | Low | Reveal all feature checkboxes directly |
| **Permission count badge** | Security teams evaluate "blast radius" by count. Showing "12 permissions granted" is immediately legible to a risk reviewer | Low | Count updates live as selections change |
| **Terraform output alongside native output** | IaC-first customers (common in enterprise cloud teams) need the HCL, not CLI commands | Medium | aws_iam_role / azurerm_role_assignment / google_project_iam_binding |
| **Multi-account / subscription / project support** | Real deployments span multiple AWS accounts or GCP projects; scoping per-account matters | Medium | Option to emit per-account policy blocks or a for_each pattern |
| **Works offline after first load** | Customers often run internal tools on locked-down networks; a pure static tool with no API calls works where SaaS doesn't | Low | Already a constraint in PROJECT.md; worth calling as differentiator vs. SaaS CIEM tools |
| **Infoblox-specific framing** | Generic IAM tools make users translate from "EC2 read" to "discovery works." This tool speaks Infoblox feature language directly | Low (content), Medium (data accuracy) | Feature names match Infoblox product UI |
| **Security-team-ready output** | Copy-pasteable blocks with headers like "Permissions required for VPC/IPAM Discovery" give the security reviewer immediate context for approval | Low | Framing / comment blocks in policy output |
| **Permission rationale per action** | Explains why `ec2:DescribeVpcs` is needed. Turns a list of actions into a justification document | Medium | Per-action comment in output or tooltip on hover |

---

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Live policy validation against real cloud accounts** | Requires backend, credentials, OAuth flows — adds auth complexity, kills offline use, creates security risk | Generate the policy; let the user apply and verify it in their own console |
| **Activity-based policy generation (CloudTrail/Audit Log analysis)** | That's AWS IAM Access Analyzer's job; it requires cloud account access and is expensive to replicate | Scope by use case, not by observed activity |
| **All-services permission picker** | Generic tools like AWS Policy Generator already do this; it's noise for Infoblox customers who only need DDI permissions | Lock scope to Infoblox DDI features only |
| **Analytics / telemetry** | Security-conscious customers (the core audience) are rightly suspicious of tools that phone home when they're pasting IAM policies | No tracking, no beacon, no analytics |
| **User accounts / saved configurations** | Adds auth surface, requires backend, violates offline constraint | Stateless per-session; URL-based sharing if needed later |
| **Automated Terraform apply / AWS CLI execution** | Users need their security team to approve the policy before applying; auto-apply skips that step | Output only; human applies |
| **i18n / localization** | Adds significant build complexity for a v1 with unclear international demand | English only for v1 |
| **Role / group management UI** | Tools like ConductorOne, Okta, and Azure PIM cover this; it's a separate product category | Focus on generating the permission policy artifact |
| **Permission drift detection / ongoing monitoring** | CIEM tools (Wiz, Orca, Entitle) cover this; would require persistent agent/backend | Out of scope; recommend AWS Access Analyzer / GCP Recommender for drift |

---

## Feature Dependencies

```
Provider selection
  └─> Feature/use-case selection (per-provider data)
        └─> Permission computation (mapping engine)
              ├─> Native policy output (JSON / YAML / ARM)
              │     └─> Copy to clipboard
              │     └─> Download as file
              ├─> Terraform output
              │     └─> Copy to clipboard
              │     └─> Download as file
              ├─> Step-by-step setup guide (per-provider steps)
              └─> Permission count badge

Wizard mode → Feature selection (wizard drives checkbox state)
Advanced mode → Feature selection (user drives checkbox state directly)

Multi-account support → Native policy output (multiplied blocks) + Terraform output (for_each)
```

---

## MVP Recommendation

Prioritize in this order:

1. **Provider selection + feature selection** — Core loop; nothing else works without it
2. **Native policy output (AWS JSON first)** — AWS is the most requested use case based on PROJECT.md (50+ permissions, most complex)
3. **Copy to clipboard + Download** — Zero friction for getting the output into a ticket or console
4. **Step-by-step setup guide** — Differentiates from "raw JSON dump" tools; addresses the POC unblocking use case
5. **Permission count badge** — Low effort, high impact for security team reviewers
6. **Wizard mode** — Reduces cognitive load for non-IAM-expert customers
7. **Azure + GCP native output** — Bring parity; Azure uses built-in roles + custom roles, GCP uses predefined + custom roles
8. **Terraform output** — IaC users; medium complexity, high value for enterprise
9. **Advanced / direct checkbox mode** — Power user escape hatch
10. **Multi-account support** — Real enterprise need; defer until core output is solid

Defer indefinitely:
- Permission rationale per-action (useful but time-consuming to author; risks being incomplete)
- Multi-account Terraform for_each patterns (complex; validate demand first)

---

## Observations on the Competitive Gap

Existing tools fall into two camps:
1. **Generic action pickers** (AWS Policy Generator, policy_sentry): Work bottom-up from IAM actions. Users must already know what actions they need.
2. **Activity-based generators** (IAM Access Analyzer, GCP Recommender): Work from observed behavior. Require cloud account access and 30-90 days of activity data — useless for a fresh POC.

Neither camp serves the "I am a new Infoblox customer about to run a POC and my security team rejected ReadOnlyAccess" scenario. The gap is a **use-case-first, vendor-specific, zero-credential tool** that lets a customer say "I need discovery + DNS sync" and receive a copy-pasteable, security-team-legible policy. This tool fills exactly that gap.

---

## Sources

- [AWS IAM Access Analyzer Features](https://aws.amazon.com/iam/access-analyzer/features/) — HIGH confidence
- [IAM Access Analyzer policy generation blog](https://aws.amazon.com/blogs/security/iam-access-analyzer-makes-it-easier-to-implement-least-privilege-permissions-by-generating-iam-policies-based-on-access-activity/) — HIGH confidence
- [policy_sentry GitHub (Salesforce)](https://github.com/salesforce/policy_sentry) — HIGH confidence
- [policy_sentry comparison to related tools](https://policy-sentry.readthedocs.io/en/latest/appendices/comparison-to-related-tools/) — HIGH confidence
- [GCP IAM Recommender overview](https://cloud.google.com/blog/products/identity-security/achieve-least-privilege-with-less-effort-using-iam-recommender) — HIGH confidence
- [Azure RBAC best practices](https://learn.microsoft.com/en-us/azure/role-based-access-control/best-practices) — HIGH confidence
- [AWS IAM Security Best Practices 2026](https://dev.to/karaniph/aws-iam-security-best-practices-in-2026-a-complete-guide-o14) — MEDIUM confidence (community post)
- [Ermetic: Automated Analysis vs Native AWS Tools](https://ermetic.com/blog/aws/the-battle-for-least-privilege-policy-why-automated-analysis-trumps-native-aws-tools/) — MEDIUM confidence
- [Datadog: Least privilege AWS IAM best practices](https://www.datadoghq.com/blog/iam-least-privilege/) — MEDIUM confidence
