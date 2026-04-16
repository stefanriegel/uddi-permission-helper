# Roadmap: UDDI Permission Scope Helper

## Overview

Build a fully static single-page site that generates least-privilege IAM policies for Infoblox Universal DDI integrations with AWS, Azure, and GCP. The path runs from HTML shell and branding through provider-specific permission data, feature selection wizard, output engine, and finally hardening for offline use and deployment. Each phase delivers a coherent, independently testable capability; data always precedes UI; AWS is validated before Azure and GCP are built.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: HTML Shell + Branding** - Infoblox-branded page skeleton with responsive layout and output panel chrome
- [ ] **Phase 2: Provider Selection UI** - Three provider cards with state management so customers pick AWS, Azure, or GCP as entry point
- [ ] **Phase 3: AWS Permission Data** - All six AWS feature categories with correct per-feature permission sets and deduplication
- [ ] **Phase 4: Azure Permission Data** - All five Azure feature categories with built-in role and custom role outputs
- [ ] **Phase 5: GCP Permission Data** - All six GCP feature categories with predefined roles and custom permissions
- [ ] **Phase 6: Feature Selection Wizard** - Wizard mode and advanced mode wired to state, with sub-questions and mode switching
- [ ] **Phase 7: Output Engine + Utilities** - Three output tabs (Policy/Terraform/Guide), copy, download, permission badge, syntax highlighting
- [ ] **Phase 8: Hardening + Deploy** - Offline verification, browser compatibility, policy size warnings, GitHub Pages deployment

## Phase Details

### Phase 1: HTML Shell + Branding
**Goal**: Infoblox-branded page skeleton exists with correct layout, responsive behavior, and output panel chrome — ready for JS wiring
**Depends on**: Nothing (first phase)
**Requirements**: DSN-01, DSN-02, DSN-03, DSN-04
**Success Criteria** (what must be TRUE):
  1. Page loads with Infoblox blue (#0058a2) header, logo, and product name
  2. Provider cards display AWS orange, Azure blue, and GCP blue brand colors
  3. Output panel uses dark theme with correct chrome (tabs, action buttons, badge placeholder)
  4. Layout stacks vertically on a viewport narrower than 900px
**Plans**: 1 plan
Plans:
- [x] 01-01-PLAN.md — Infoblox-branded HTML/CSS shell with design tokens, semantic HTML, and responsive layout
**UI hint**: yes

### Phase 2: Provider Selection UI
**Goal**: Customer can select a cloud provider and the workspace activates for that provider — switching providers resets only the active provider's state
**Depends on**: Phase 1
**Requirements**: PROV-01, PROV-02, PROV-03
**Success Criteria** (what must be TRUE):
  1. Clicking a provider card highlights it and reveals the workspace panel
  2. Selecting AWS loads the AWS feature set; selecting Azure loads the Azure feature set; selecting GCP loads the GCP feature set
  3. Switching from AWS to Azure does not clear answers previously entered for AWS
**Plans**: 1 plan
Plans:
- [x] 02-01-PLAN.md — Provider card selection with state management, workspace reveal, and per-provider state preservation
**UI hint**: yes

### Phase 3: AWS Permission Data
**Goal**: All six AWS feature categories produce correct, deduplicated IAM policy JSON, Terraform HCL, and setup guide text when features are selected
**Depends on**: Phase 2
**Requirements**: AWS-01, AWS-02, AWS-03, AWS-04, AWS-05, AWS-06, AWS-07, AWS-08, AWS-09
**Success Criteria** (what must be TRUE):
  1. VPC/IPAM Discovery generates exactly 21 IAM actions
  2. DNS read-only generates 7 actions; DNS bidirectional generates 14 actions
  3. Cloud Forwarding discovery-only generates 6 actions (read-only); full management generates 12 actions
  4. Multi-account generates a trust policy template, Organizations policy, and STS policy
  5. Selecting VPC/IPAM and DNS bidirectional together produces no duplicate ec2 actions
**Plans**: 2 plans
Plans:
- [x] 03-01-PLAN.md — AWS feature data module with all 6 categories (21+8+3+7+14+6+12 actions, multi-account policies, Terraform HCL, setup guides)
- [ ] 03-02-PLAN.md — Deduplication logic and output generator functions (getAwsActions, generateAwsPolicy, generateAwsTerraform, generateAwsGuide)

### Phase 4: Azure Permission Data
**Goal**: All five Azure feature categories produce correct built-in role assignments, custom role JSON, Terraform HCL, and setup guide text
**Depends on**: Phase 3
**Requirements**: AZR-01, AZR-02, AZR-03, AZR-04, AZR-05, AZR-06, AZR-07
**Success Criteria** (what must be TRUE):
  1. IPAM/Asset Discovery outputs a Reader role assignment at subscription scope
  2. Public DNS read-write outputs a DNS Zone Contributor assignment; Private DNS outputs a Private DNS Zone Contributor assignment
  3. Cloud Forwarding discovery outputs a custom role with 6 read-only permissions; full management outputs a custom role with 21 permissions
  4. Multi-subscription outputs management group scope guidance
**Plans**: 1 plan
Plans:
- [ ] 01-01-PLAN.md — Infoblox-branded HTML/CSS shell with design tokens, semantic HTML, and responsive layout

### Phase 5: GCP Permission Data
**Goal**: All six GCP feature categories produce correct predefined role bindings, custom role definitions, Terraform HCL, and setup guide text
**Depends on**: Phase 4
**Requirements**: GCP-01, GCP-02, GCP-03, GCP-04, GCP-05, GCP-06, GCP-07, GCP-08, GCP-09
**Success Criteria** (what must be TRUE):
  1. Asset Discovery outputs Compute Viewer + Compute Network Viewer predefined roles plus 25 custom permissions
  2. DNS read-only outputs the dns.reader predefined role; DNS read-write outputs the dns.admin role
  3. Cloud Forwarding inbound outputs 10 custom permissions; outbound outputs 15; both outputs 21 combined
  4. Internal Ranges outputs 13 networkconnectivity permissions
  5. Multi-project/org outputs organizationViewer + folderViewer roles plus 5 resourcemanager permissions
**Plans**: 1 plan
Plans:
- [ ] 01-01-PLAN.md — Infoblox-branded HTML/CSS shell with design tokens, semantic HTML, and responsive layout

### Phase 6: Feature Selection Wizard
**Goal**: Customer can answer sequential yes/no questions to scope features, or switch to direct checkboxes — state is preserved when switching modes
**Depends on**: Phase 5
**Requirements**: FEAT-01, FEAT-02, FEAT-03, FEAT-04, FEAT-05, FEAT-06
**Success Criteria** (what must be TRUE):
  1. Wizard presents one active question at a time; unanswered future questions are visually previewed but locked
  2. A DNS sub-question (read-only vs. bidirectional) appears only after the parent DNS question is answered Yes
  3. Switching to Advanced mode shows feature checkboxes with per-category permission counts
  4. Switching back to Wizard mode reflects the same feature selections that were set in Advanced mode
**Plans**: 1 plan
Plans:
- [ ] 01-01-PLAN.md — Infoblox-branded HTML/CSS shell with design tokens, semantic HTML, and responsive layout
**UI hint**: yes

### Phase 7: Output Engine + Utilities
**Goal**: Customer can view Policy, Terraform, and Setup Guide output for their selections, copy to clipboard, download as file, and see a live permission count badge
**Depends on**: Phase 6
**Requirements**: OUT-01, OUT-02, OUT-03, OUT-04, OUT-05, OUT-06, OUT-07, OUT-08
**Success Criteria** (what must be TRUE):
  1. Selecting a feature updates the output panel in real-time without page reload
  2. Policy tab shows native format (AWS JSON, Azure CLI + role JSON, GCP gcloud commands); Terraform tab shows provider-appropriate HCL; Setup Guide tab shows numbered instructions
  3. Copy button copies the current tab's text to clipboard and briefly shows a confirmation state
  4. Download button saves the current output as an appropriately named file (.json, .tf, or .sh/.txt)
  5. Permission count badge updates live and reflects deduplication
  6. Each permission in Policy output includes an inline rationale comment
**Plans**: 1 plan
Plans:
- [ ] 01-01-PLAN.md — Infoblox-branded HTML/CSS shell with design tokens, semantic HTML, and responsive layout
**UI hint**: yes

### Phase 8: Hardening + Deploy
**Goal**: Site works offline after first load, passes manual browser compatibility tests, shows a warning when approaching the AWS policy size limit, and is deployed to GitHub Pages
**Depends on**: Phase 7
**Requirements**: DSN-05
**Success Criteria** (what must be TRUE):
  1. With DevTools Network set to Offline, the site loads and generates policies after having been visited once on a normal connection
  2. Copy-to-clipboard and file download work correctly in Chrome, Firefox, Safari, and iOS Safari
  3. A visible warning appears when the generated AWS policy approaches the 6,144-character managed policy limit
  4. Site is accessible at a public GitHub Pages URL
**Plans**: 1 plan
Plans:
- [ ] 01-01-PLAN.md — Infoblox-branded HTML/CSS shell with design tokens, semantic HTML, and responsive layout

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. HTML Shell + Branding | 1/1 | Complete | 2026-04-16 |
| 2. Provider Selection UI | 1/1 | Complete | 2026-04-16 |
| 3. AWS Permission Data | 0/2 | Not started | - |
| 4. Azure Permission Data | 0/? | Not started | - |
| 5. GCP Permission Data | 0/? | Not started | - |
| 6. Feature Selection Wizard | 0/? | Not started | - |
| 7. Output Engine + Utilities | 0/? | Not started | - |
| 8. Hardening + Deploy | 0/? | Not started | - |
