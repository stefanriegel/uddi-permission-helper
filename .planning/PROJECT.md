# UDDI Permission Scope Helper

## What This Is

A static micro site that helps Infoblox Universal DDI customers generate least-privilege permission policies for AWS, Azure, and GCP. Customers pick which discovery and management features they need via a wizard or checkbox UI, and the site outputs ready-to-use IAM policies, Terraform snippets, and step-by-step setup instructions.

## Core Value

Customer can generate a minimal, security-team-approved permission policy in under 2 minutes — unblocking POCs that stall on broad read-only pushback.

## Requirements

### Validated

- Infoblox-branded design (Navy #002b49 + Orange #f37021) — v1.0
- Customer can select cloud provider (AWS, Azure, GCP) — v1.0
- Customer can answer wizard questions to scope needed features — v1.0
- Customer can switch to advanced mode for direct feature checkboxes — v1.0
- Site generates correct least-privilege permissions per selected features — v1.0
- Output includes native policy format (AWS JSON, Azure CLI, GCP gcloud) — v1.0
- Output includes Terraform snippets — v1.0
- Output includes step-by-step setup guide — v1.0
- Customer can copy output to clipboard — v1.0
- Customer can download output as file (.json, .tf) — v1.0
- Permission count badge shows total permissions granted — v1.0
- Multi-account/subscription/project scenarios supported — v1.0
- Site works offline after first load (pure static, no backend) — v1.0

### Active

(None yet — define in next milestone)

### Out of Scope

- Backend / API — pure client-side, no server needed
- Analytics / tracking — no cookies, no telemetry
- i18n — English only for v1
- Automated permission verification — we generate policies, not validate them
- SE/CSM-specific features — this is customer self-service

## Context

Shipped v1.0 with ~4,400 LOC across HTML/CSS/JS. Pure static, no build step.

- Tech stack: Vanilla HTML/CSS/JS with ES modules, Prism.js CDN for syntax highlighting
- Design: Infoblox Navy (#002b49) + Orange (#f37021) from UDDI-GO-Token-Calculator
- Permission data: Hardcoded from Infoblox UDDI Admin Guide
  - AWS: 8 feature entries, 50+ IAM actions with deduplication
  - Azure: 7 features using built-in roles + custom roles
  - GCP: 8 features with predefined roles + custom permissions
- 75 unit tests across AWS/Azure/GCP generators
- AWS policy size warning at 80% of 6,144-char managed policy limit

## Constraints

- **Tech stack**: Pure static HTML/CSS/JS — no framework, no build step, no dependencies
- **Hosting**: Must be deployable to GitHub Pages, Netlify, or any static hosting
- **Data**: Permission data hardcoded in JS files (sourced from Infoblox docs)
- **Terminology**: Never use "CSP" to mean cloud provider — in Infoblox context CSP = Cloud Service Platform (the Infoblox platform itself). Use "cloud provider" or "AWS/Azure/GCP"
- **Branding**: Infoblox Navy #002b49 + Orange #f37021 (Token Calculator design language)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Pure static site (no framework) | Zero dependencies, instant deploy, no build step, works offline | ✓ v1.0 |
| Single-page layout with wizard + live output | Simplest UX, single URL to share, minimal JS complexity | ✓ v1.0 |
| Token Calculator design language | Reuse Navy + Orange from UDDI-GO-Token-Calculator for brand consistency | ✓ v1.0 |
| Wizard + Advanced mode dual UI | Wizard for newcomers, checkboxes for power users | ✓ v1.0 |
| Hardcoded permission data | Permissions rarely change, simpler than external config, update via redeploy | ✓ v1.0 |
| Three output formats (native/Terraform/guide) | Covers console users, IaC users, and setup walkthroughs | ✓ v1.0 |
| In-memory state (no localStorage) | Simplest approach, no persistence needed for policy generation | ✓ v1.0 |
| ES modules without import maps | No external JS dependencies — import maps add zero value | ✓ v1.0 |
| GCP-07 combined CF permissions = 22 | Spec said 21 but math is 10+15-3=22 — corrected | ✓ v1.0 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-17 after v1.0 milestone*
