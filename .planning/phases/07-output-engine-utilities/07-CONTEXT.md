# Phase 7: Output Engine + Utilities - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire output panel to live-render Policy, Terraform, and Setup Guide content from feature selections. Add clipboard copy, file download, permission count badge, and Prism.js syntax highlighting.

</domain>

<decisions>
## Implementation Decisions

### Output Engine Architecture
- Module: `js/output.js` — imports all 3 provider generators, dispatches by active provider
- Prism.js: load CDN in Phase 7 for syntax highlighting (JSON, bash, HCL per CLAUDE.md tech stack)
- Real-time updates: feature state change → output.js re-renders active tab content immediately

### Copy/Download UX
- Copy confirmation: button text changes to "Copied!" for 2s with green flash, then reverts
- Download file naming: `{provider}-{format}.{ext}` e.g., `aws-policy.json`, `azure-terraform.tf`, `gcp-setup.sh`
- Empty state: Copy/Download buttons disabled when no features selected

### Claude's Discretion
- Prism.js CDN load order and initialization
- Tab switching animation details
- File extension mapping per provider/format

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `js/data/aws.js` — generateAwsPolicy, generateAwsTerraform, generateAwsGuide
- `js/data/azure.js` — generateAzurePolicy, generateAzureTerraform, generateAzureGuide
- `js/data/gcp.js` — generateGcpPolicy, generateGcpTerraform, generateGcpGuide
- `js/state.js` — getActiveProvider, getFeatures
- `js/app.js` — output tab switching already wired (from Phase 6)
- Output panel HTML with tabs, badge, Copy/Download buttons already in index.html

### Established Patterns
- ES modules, BEM CSS, data-* attributes
- State change → re-render pattern from wizard mode

### Integration Points
- Output renders from state.getFeatures(provider) → data module generators
- Badge count from getAwsActions/getAzureRoles/getGcpCustomPermissions length
- Prism.js CDN URLs from CLAUDE.md tech stack section

</code_context>

<specifics>
## Specific Ideas

- Prism.js 1.30.0 CDN: core + JSON + bash + HCL languages (per CLAUDE.md)
- Use `navigator.clipboard.writeText` with `document.execCommand('copy')` fallback
- Use `Blob` + `URL.createObjectURL` + `a[download]` for file download (per CLAUDE.md)
- Call `URL.revokeObjectURL` after download to prevent memory leaks

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
