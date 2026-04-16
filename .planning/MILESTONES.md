# Milestones

## v1.0 MVP (Shipped: 2026-04-16)

**Phases completed:** 8 phases, 13 plans, 20 tasks

**Key accomplishments:**

- Infoblox-branded HTML/CSS shell with Navy header, three provider cards (AWS/Azure/GCP), dark output panel with tab bar, and responsive layout at 899px breakpoint
- Interactive provider card selection with orange highlight, workspace reveal animation, and in-memory per-provider state via vanilla ES modules
- AWS permission data module with 8 feature entries across 6 categories: VPC/IPAM (21 actions), EC2 (8), S3 (3), DNS read-only (7), DNS bidirectional (14), Cloud Forwarding discovery (6), Cloud Forwarding full (12), and Multi-account (3 policy documents)
- Set-based IAM action deduplication with policy JSON, Terraform HCL, and setup guide generators for multi-feature AWS selections
- Azure RBAC permission data module with 7 features: Reader/DNS Zone Contributor/Private DNS Zone Contributor built-in roles plus custom roles with 6 and 21 permissions for Cloud Forwarding
- Four Azure generator functions with role-name deduplication: getAzureRoles, generateAzurePolicy, generateAzureTerraform, generateAzureGuide -- Reader role correctly deduplicated across 3 features
- GCP permission data module with 8 features: predefined roles for compute/DNS/org, custom permissions for storage/forwarding/IPAM, plus Terraform HCL and gcloud setup guides
- Five GCP generator functions with role dedup via Map, permission dedup via Set, and gcloud/Terraform/guide output matching AWS/Azure signatures for Phase 7 integration
- Wizard question engine deriving sequential yes/no cards from provider feature data with sub-question grouping for DNS and Cloud Forwarding
- Advanced mode checkbox UI with permission count badges and 200ms crossfade mode switching preserving bidirectional state
- Live output rendering with Prism.js syntax highlighting, per-action rationale comments, and real-time permission badge for all 3 providers
- Clipboard copy with confirmation flash and file download with provider-aware naming for all output tabs
- AWS policy size warning at 80%/100% of 6144-char IAM limit, offline cache hints, and deployment README for GitHub Pages/Netlify/static hosts

---
