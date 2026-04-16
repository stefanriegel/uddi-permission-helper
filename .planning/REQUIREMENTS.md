# Requirements: UDDI Permission Scope Helper

**Defined:** 2026-04-16
**Core Value:** Customer can generate a minimal, security-team-approved permission policy in under 2 minutes

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Provider Selection

- [x] **PROV-01**: User can select AWS, Azure, or GCP as their cloud provider
- [x] **PROV-02**: Selecting a provider loads that provider's feature wizard and output templates
- [x] **PROV-03**: User can switch between providers without losing state of other providers

### Feature Selection

- [x] **FEAT-01**: User can answer wizard-style yes/no questions to scope needed features
- [x] **FEAT-02**: Wizard questions are sequential — one active at a time, upcoming questions previewed
- [x] **FEAT-03**: Sub-questions appear conditionally (e.g., DNS → read-only or bidirectional)
- [x] **FEAT-04**: User can switch to advanced mode showing direct feature checkboxes
- [x] **FEAT-05**: Advanced mode shows permission count per feature category
- [x] **FEAT-06**: State is preserved when switching between wizard and advanced mode

### AWS Permissions

- [x] **AWS-01**: VPC/IPAM Discovery generates correct 21-permission policy
- [x] **AWS-02**: EC2 & Networking generates correct 8-permission policy
- [x] **AWS-03**: S3 Bucket Visibility generates correct 3-permission policy
- [x] **AWS-04**: DNS (Route 53) read-only generates correct 7-permission policy
- [x] **AWS-05**: DNS (Route 53) bidirectional generates correct 14-permission policy
- [x] **AWS-06**: Cloud Forwarding discovery-only generates correct 6-permission policy (read-only)
- [x] **AWS-07**: Cloud Forwarding full management generates correct 12-permission policy (includes write)
- [x] **AWS-08**: Multi-account generates trust policy template + Organizations policy + STS policy
- [x] **AWS-09**: Permissions are deduplicated when multiple features share the same action

### Azure Permissions

- [x] **AZR-01**: IPAM/Asset Discovery outputs Reader role assignment at subscription scope
- [x] **AZR-02**: Public DNS read-only is covered by Reader role (no additional assignment)
- [x] **AZR-03**: Public DNS read-write outputs DNS Zone Contributor assignment
- [x] **AZR-04**: Private DNS outputs Private DNS Zone Contributor assignment
- [x] **AZR-05**: Cloud Forwarding discovery outputs custom role with 6 read-only permissions
- [x] **AZR-06**: Cloud Forwarding management outputs custom role with 21 permissions
- [x] **AZR-07**: Multi-subscription outputs guidance for management group scope assignment

### GCP Permissions

- [x] **GCP-01**: Asset Discovery outputs Compute Viewer + Compute Network Viewer roles + 25 custom permissions
- [x] **GCP-02**: Storage Buckets outputs 2 custom permissions (buckets.list, buckets.getIamPolicy)
- [x] **GCP-03**: DNS read-only outputs dns.reader predefined role
- [x] **GCP-04**: DNS read-write outputs dns.admin predefined role
- [x] **GCP-05**: Cloud Forwarding inbound outputs 10 custom permissions
- [x] **GCP-06**: Cloud Forwarding outbound outputs 15 custom permissions
- [x] **GCP-07**: Cloud Forwarding both outputs combined 22 custom permissions
- [x] **GCP-08**: Internal Ranges outputs 13 networkconnectivity permissions
- [x] **GCP-09**: Multi-project/org outputs organizationViewer + folderViewer roles + 5 resourcemanager permissions

### Output

- [x] **OUT-01**: Policy tab shows native format (AWS JSON, Azure CLI commands + custom role JSON, GCP gcloud commands)
- [x] **OUT-02**: Terraform tab shows provider-appropriate resource blocks
- [x] **OUT-03**: Setup Guide tab shows step-by-step instructions per provider
- [x] **OUT-04**: Copy button copies current tab content to clipboard
- [x] **OUT-05**: Download button saves current output as file (.json, .tf, .txt, .sh)
- [x] **OUT-06**: Permission count badge updates live as user selects features
- [x] **OUT-07**: Each permission includes rationale explaining why it is needed
- [x] **OUT-08**: Output updates in real-time as wizard answers change

### Design

- [x] **DSN-01**: Site uses Infoblox branding (blue #0058a2, logo, product name)
- [x] **DSN-02**: Provider cards show respective brand colors (AWS orange, Azure blue, GCP blue)
- [x] **DSN-03**: Output panel uses dark theme with syntax highlighting
- [x] **DSN-04**: Layout is responsive — stacks vertically on mobile/tablet
- [x] **DSN-05**: Site works offline after first page load (no backend calls, no external API)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Output

- **ENH-01**: URL-based sharing of selected configuration (encode state in URL hash)
- **ENH-02**: Side-by-side comparison of different scope configurations
- **ENH-03**: Export as PDF for security team approval workflows

### Data Management

- **DATA-01**: External JSON/YAML config files for permission data (easier non-dev updates)
- **DATA-02**: Version stamps on permission data with "last verified" dates displayed
- **DATA-03**: Automated test that validates generated policies against cloud provider APIs

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend / API | Pure client-side tool, no server needed |
| Analytics / telemetry | Security-conscious audience, no tracking |
| User accounts / saved configs | Adds auth surface, requires backend |
| Live policy validation | Requires cloud credentials, kills offline use |
| Activity-based generation | That's IAM Access Analyzer's job |
| All-services permission picker | Scope locked to Infoblox DDI features only |
| Automated apply (CLI execution) | Security team must approve before applying |
| i18n / localization | English only for v1 |
| Role/group management UI | Separate product category (PIM, CIEM) |
| Permission drift detection | CIEM tools cover this |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DSN-01 | Phase 1 | Complete |
| DSN-02 | Phase 1 | Complete |
| DSN-03 | Phase 1 | Complete |
| DSN-04 | Phase 1 | Complete |
| PROV-01 | Phase 2 | Complete |
| PROV-02 | Phase 2 | Complete |
| PROV-03 | Phase 2 | Complete |
| AWS-01 | Phase 3 | Complete |
| AWS-02 | Phase 3 | Complete |
| AWS-03 | Phase 3 | Complete |
| AWS-04 | Phase 3 | Complete |
| AWS-05 | Phase 3 | Complete |
| AWS-06 | Phase 3 | Complete |
| AWS-07 | Phase 3 | Complete |
| AWS-08 | Phase 3 | Complete |
| AWS-09 | Phase 3 | Complete |
| AZR-01 | Phase 4 | Complete |
| AZR-02 | Phase 4 | Complete |
| AZR-03 | Phase 4 | Complete |
| AZR-04 | Phase 4 | Complete |
| AZR-05 | Phase 4 | Complete |
| AZR-06 | Phase 4 | Complete |
| AZR-07 | Phase 4 | Complete |
| GCP-01 | Phase 5 | Complete |
| GCP-02 | Phase 5 | Complete |
| GCP-03 | Phase 5 | Complete |
| GCP-04 | Phase 5 | Complete |
| GCP-05 | Phase 5 | Complete |
| GCP-06 | Phase 5 | Complete |
| GCP-07 | Phase 5 | Complete |
| GCP-08 | Phase 5 | Complete |
| GCP-09 | Phase 5 | Complete |
| FEAT-01 | Phase 6 | Complete |
| FEAT-02 | Phase 6 | Complete |
| FEAT-03 | Phase 6 | Complete |
| FEAT-04 | Phase 6 | Complete |
| FEAT-05 | Phase 6 | Complete |
| FEAT-06 | Phase 6 | Complete |
| OUT-01 | Phase 7 | Complete |
| OUT-02 | Phase 7 | Complete |
| OUT-03 | Phase 7 | Complete |
| OUT-04 | Phase 7 | Complete |
| OUT-05 | Phase 7 | Complete |
| OUT-06 | Phase 7 | Complete |
| OUT-07 | Phase 7 | Complete |
| OUT-08 | Phase 7 | Complete |
| DSN-05 | Phase 8 | Complete |

**Coverage:**
- v1 requirements: 44 total
- Mapped to phases: 44
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-16*
*Last updated: 2026-04-16 after roadmap creation*
