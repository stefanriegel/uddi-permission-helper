# UDDI Permission Scope Helper

## What This Is

A static micro site that helps Infoblox Universal DDI customers generate least-privilege permission policies for AWS, Azure, and GCP. Customers pick which discovery and management features they need, and the site outputs ready-to-use IAM policies, Terraform snippets, and step-by-step setup instructions.

## Core Value

Customer can generate a minimal, security-team-approved permission policy in under 2 minutes — unblocking POCs that stall on broad read-only pushback.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Customer can select cloud provider (AWS, Azure, GCP)
- [ ] Customer can answer wizard questions to scope needed features
- [ ] Customer can switch to advanced mode for direct feature checkboxes
- [ ] Site generates correct least-privilege permissions per selected features
- [ ] Output includes native policy format (AWS JSON, Azure CLI, GCP gcloud)
- [ ] Output includes Terraform snippets
- [ ] Output includes step-by-step setup guide
- [ ] Customer can copy output to clipboard
- [ ] Customer can download output as file (.json, .tf)
- [ ] Permission count badge shows total permissions granted
- [ ] Multi-account/subscription/project scenarios supported
- [ ] Site works offline after first load (pure static, no backend)
- [ ] Infoblox-branded design

### Out of Scope

- Backend / API — pure client-side, no server needed
- Analytics / tracking — no cookies, no telemetry
- i18n — English only for v1
- Automated permission verification — we generate policies, not validate them
- SE/CSM-specific features — this is customer self-service

## Context

- Infoblox Universal DDI integrates with AWS, Azure, and GCP for IP address management, DNS sync, asset discovery, and cloud forwarding
- Current documentation recommends broad policies (AWS ReadOnlyAccess, Azure Reader at management group level) that security teams reject
- Real customer scenario: POC blocked because security team won't approve account-wide read-only access for VPC/IPAM/EC2/S3 discovery
- Permission data sourced from official Infoblox documentation:
  - AWS: 6 feature categories, 50+ granular permissions across EC2/VPC/IPAM/S3/Route53/Resolver
  - Azure: 5 categories using built-in roles (Reader, DNS Zone Contributor, Private DNS Zone Contributor) + custom roles for DNS Resolver
  - GCP: 6 categories with predefined roles + custom role definitions for compute, DNS, storage, networking
- Full design spec: `docs/superpowers/specs/2026-04-16-permission-scope-helper-design.md`
- Implementation plan: `docs/superpowers/plans/2026-04-16-permission-scope-helper.md`

## Constraints

- **Tech stack**: Pure static HTML/CSS/JS — no framework, no build step, no dependencies
- **Hosting**: Must be deployable to GitHub Pages, Netlify, or any static hosting
- **Data**: Permission data hardcoded in JS files (sourced from Infoblox docs)
- **Terminology**: Never use "CSP" to mean cloud provider — in Infoblox context CSP = Cloud Service Platform (the Infoblox platform itself). Use "cloud provider" or "AWS/Azure/GCP"
- **Branding**: Infoblox-branded (blue #0058a2, logo, product name)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Pure static site (no framework) | Zero dependencies, instant deploy, no build step, works offline | — Pending |
| Single-page layout with wizard + live output | Simplest UX, single URL to share, minimal JS complexity | — Pending |
| Wizard + Advanced mode dual UI | Wizard for newcomers, checkboxes for power users who know what they need | — Pending |
| Hardcoded permission data | Permissions rarely change, simpler than external config, update via redeploy | — Pending |
| Three output formats (native/Terraform/guide) | Covers console users, IaC users, and setup walkthroughs | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-16 after initialization*
