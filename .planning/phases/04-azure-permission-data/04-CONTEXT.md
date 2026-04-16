# Phase 4: Azure Permission Data - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning
**Mode:** Auto-generated (consistent with Phase 3 architecture decisions)

<domain>
## Phase Boundary

Hardcode all five Azure feature categories with correct built-in role assignments, custom role JSON, Terraform HCL templates, and setup guide text. Follow the same data architecture as js/data/aws.js.

</domain>

<decisions>
## Implementation Decisions

### Data File Structure
- Layout: `js/data/azure.js` — one file, same pattern as aws.js
- Shape: object with `features` map → each feature has `roles[]` (built-in) or `customRole` (JSON), `terraform`, `setupGuide`
- Azure uses built-in roles (Reader, DNS Zone Contributor) + custom roles for some features — different from AWS IAM actions

### Output Format Templates
- Policy output: Azure CLI commands for role assignments + custom role JSON where applicable
- Terraform: azurerm provider resource blocks
- Setup guide: step-by-step Azure portal instructions

### Claude's Discretion
- All implementation details — follow aws.js patterns for consistency

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `js/data/aws.js` — reference implementation for data module pattern
- `js/state.js` — provider state management

### Established Patterns
- ES modules with named exports
- Feature map → actions/roles → template strings
- Dedup/generator functions in same module

### Integration Points
- `js/data/azure.js` exports consumed by Phase 6 (wizard) and Phase 7 (output engine)
- Feature categories map to REQUIREMENTS.md AZR-01 through AZR-07

</code_context>

<specifics>
## Specific Ideas

- Permission data sourced from design spec: `docs/superpowers/specs/2026-04-16-permission-scope-helper-design.md`
- Five categories: IPAM/Asset Discovery, Public DNS (read-only/read-write), Private DNS, Cloud Forwarding (discovery/management), Multi-subscription

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
