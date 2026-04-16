# Phase 5: GCP Permission Data - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning
**Mode:** Auto-generated (consistent with Phase 3/4 architecture decisions)

<domain>
## Phase Boundary

Hardcode all six GCP feature categories with correct predefined role bindings, custom role definitions, Terraform HCL templates, and setup guide text. Follow the same data architecture as js/data/aws.js and js/data/azure.js.

</domain>

<decisions>
## Implementation Decisions

### Data File Structure
- Layout: `js/data/gcp.js` — one file, same pattern as aws.js and azure.js
- Shape: object with `features` map → each feature has `predefinedRoles[]` and/or `customPermissions[]`, `terraform`, `setupGuide`
- GCP uses predefined roles + custom role definitions — hybrid model

### Output Format Templates
- Policy output: gcloud CLI commands for role bindings + custom role create commands
- Terraform: google provider resource blocks (google_project_iam_member, google_project_iam_custom_role)
- Setup guide: step-by-step GCP Console instructions

### Claude's Discretion
- All implementation details — follow aws.js/azure.js patterns for consistency

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `js/data/aws.js` and `js/data/azure.js` — reference implementations
- Generator function pattern established (getActions/getRoles, generatePolicy, generateTerraform, generateGuide)

### Integration Points
- `js/data/gcp.js` exports consumed by Phase 6 (wizard) and Phase 7 (output engine)
- Feature categories map to REQUIREMENTS.md GCP-01 through GCP-09

</code_context>

<specifics>
## Specific Ideas

- Permission data sourced from design spec: `docs/superpowers/specs/2026-04-16-permission-scope-helper-design.md`
- Six categories: Asset Discovery, Storage Buckets, DNS (read-only/read-write), Cloud Forwarding (inbound/outbound/both), Internal Ranges, Multi-project/org

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
