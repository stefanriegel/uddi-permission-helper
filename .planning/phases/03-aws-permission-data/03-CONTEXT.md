# Phase 3: AWS Permission Data - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Hardcode all six AWS feature categories with exact IAM actions, Terraform HCL templates, and setup guide text. Implement deduplication logic for overlapping permissions. No UI changes — data module only.

</domain>

<decisions>
## Implementation Decisions

### Data File Structure
- Layout: `js/data/aws.js` — one file per cloud provider, exports feature categories
- Shape: object with `features` map → each feature has `actions[]`, `terraform` (HCL template string), `setupGuide` (markdown text)
- Deduplication: function in `js/data/aws.js` that merges selected features and returns deduplicated actions array

### Output Format Templates
- Policy JSON: template string in data file with `{actions}` placeholder filled from selected features
- Terraform: HCL template string per feature category, composed by concatenation

### Claude's Discretion
- Exact function signatures for dedup and template composition
- Internal helper functions
- JSDoc comments vs no comments

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `js/state.js` — provider state management, can store feature selections per provider
- `js/ui.js` — DOM update patterns, will need extension for feature rendering (Phase 6)

### Established Patterns
- ES modules with named exports
- BEM CSS naming
- In-memory state (no localStorage)

### Integration Points
- `js/data/aws.js` exports consumed by Phase 6 (wizard) and Phase 7 (output engine)
- Feature categories map to REQUIREMENTS.md AWS-01 through AWS-09
- Dedup function consumed by output engine to merge selected features

</code_context>

<specifics>
## Specific Ideas

- Permission data sourced from Infoblox UDDI Admin Guide (exact counts in REQUIREMENTS.md)
- Full design spec at: `docs/superpowers/specs/2026-04-16-permission-scope-helper-design.md`
- Six categories: VPC/IPAM Discovery, EC2 & Networking, S3 Bucket Visibility, DNS (Route 53), Cloud Forwarding, Multi-account

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
