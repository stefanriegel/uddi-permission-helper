---
phase: quick
plan: 03
subsystem: gcp-permissions
tags: [gcp, iam, custom-roles, least-privilege]
dependency-graph:
  requires: []
  provides: [gcp-custom-only-permissions]
  affects: [js/data/gcp.js, tests/gcp-generators.test.js]
tech-stack:
  added: []
  patterns: [custom-roles-over-predefined]
key-files:
  created: []
  modified:
    - js/data/gcp.js
    - tests/gcp-generators.test.js
decisions:
  - Replace all GCP predefined roles with custom permissions except multiProjectOrg
  - dnsReadOnly gets 7 dns.* read permissions matching roles/dns.reader scope
  - dnsReadWrite gets 16 dns.* read+write permissions narrower than roles/dns.admin
metrics:
  duration: 193s
  completed: 2026-04-16T23:28:29Z
---

# Quick Plan 03: GCP Predefined Roles Replaced with Custom Permissions

Replaced four overly broad GCP predefined roles (compute.viewer, compute.networkViewer, dns.reader, dns.admin) with granular custom permissions across assetDiscovery, dnsReadOnly, and dnsReadWrite features -- multiProjectOrg remains the sole feature using predefined roles (org/folder scope).

## Task Results

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Replace predefined roles with custom permissions in GCP data | 1f891b7 | js/data/gcp.js |
| 2 | Update GCP tests for custom-only permissions model | e4f3231 | tests/gcp-generators.test.js |

## Changes Made

### Task 1: GCP Data Updates

**assetDiscovery:**
- Cleared `predefinedRoles` (was compute.viewer + compute.networkViewer)
- Retained existing 25 custom permissions (unchanged)
- Removed predefined role rationale entries
- Replaced terraform with `google_project_iam_custom_role` block (role_id: infobloxUddiAssetDiscovery)
- Updated setupGuide with custom role creation instructions and gcloud CLI example

**dnsReadOnly:**
- Cleared `predefinedRoles` (was roles/dns.reader)
- Populated `customPermissions` with 7 dns.* read permissions
- Added per-permission rationale entries
- Replaced terraform with `google_project_iam_custom_role` block (role_id: infobloxUddiDnsReadOnly)
- Updated setupGuide with custom role creation instructions

**dnsReadWrite:**
- Cleared `predefinedRoles` (was roles/dns.admin)
- Populated `customPermissions` with 16 dns.* read+write permissions (narrower than dns.admin)
- Added per-permission rationale entries
- Replaced terraform with `google_project_iam_custom_role` block (role_id: infobloxUddiDnsReadWrite)
- Updated setupGuide with custom role creation instructions

**JSDoc comments:** Updated to reflect custom-only model with multiProjectOrg as sole exception.

### Task 2: Test Updates

- Updated getGcpRoles tests: assetDiscovery, dnsReadOnly, dnsReadWrite all return empty
- Added tests for dnsReadOnly (7 perms) and dnsReadWrite (16 perms) custom permission counts
- Added test verifying dnsReadWrite is a strict superset of dnsReadOnly permissions
- Updated generateGcpPolicy tests: verify custom role commands, no predefined roles for compute/DNS
- Updated generateGcpTerraform tests: verify custom role terraform for DNS and compute features
- Updated deduplication test: all features combined returns only 2 predefined roles (multiProjectOrg)

## Verification

- `node --test tests/gcp-generators.test.js` -- 37 tests pass, 0 failures
- `node --test tests/*.test.js` -- 92 tests pass across all three providers, 0 regressions
- `getGcpRoles(Object.keys(GCP_FEATURES))` returns only organizationViewer and folderViewer

## Deviations from Plan

None -- plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED
