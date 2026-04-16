---
phase: 05-gcp-permission-data
verified: 2026-04-16T22:00:00Z
status: gaps_found
score: 4/5 must-haves verified
gaps:
  - truth: "Cloud Forwarding inbound+outbound combined produces exactly 21 unique permissions (GCP-07)"
    status: failed
    reason: "Actual combined count is 22 (10+15-3 overlap), not 21 as specified in ROADMAP success criteria and REQUIREMENTS GCP-07. The 3 overlapping permissions are dns.projects.get, compute.networks.get, compute.networks.list. The math yields 22, so either the spec's estimate of 21 was wrong or a permission is extraneous."
    artifacts:
      - path: "js/data/gcp.js"
        issue: "Cloud Forwarding inbound+outbound dedup produces 22, not 21"
      - path: "tests/gcp-generators.test.js"
        issue: "Test asserts 22 instead of 21, diverging from requirement GCP-07"
    missing:
      - "Resolve GCP-07 discrepancy: either update REQUIREMENTS.md and ROADMAP.md to say 22, or adjust permission lists to produce exactly 21"
---

# Phase 5: GCP Permission Data Verification Report

**Phase Goal:** All six GCP feature categories produce correct predefined role bindings, custom role definitions, Terraform HCL, and setup guide text
**Verified:** 2026-04-16T22:00:00Z
**Status:** gaps_found
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Asset Discovery outputs Compute Viewer + Compute Network Viewer predefined roles plus 25 custom permissions | VERIFIED | `predefinedRoles` has 2 entries (roles/compute.viewer, roles/compute.networkViewer); `customPermissions` has 25 entries; verified via `node -e` and test suite |
| 2 | DNS read-only outputs dns.reader role; DNS read-write outputs dns.admin role | VERIFIED | `dnsReadOnly.predefinedRoles[0].role === 'roles/dns.reader'`; `dnsReadWrite.predefinedRoles[0].role === 'roles/dns.admin'`; both have empty customPermissions |
| 3 | Cloud Forwarding inbound outputs 10 custom permissions; outbound outputs 15; both outputs 21 combined | FAILED | Inbound: 10 (correct). Outbound: 15 (correct). Combined: 22 (spec says 21). Overlap is 3 (dns.projects.get, compute.networks.get, compute.networks.list), yielding 10+15-3=22. |
| 4 | Internal Ranges outputs 13 networkconnectivity permissions | VERIFIED | `internalRanges.customPermissions.length === 13`; all start with `networkconnectivity.` |
| 5 | Multi-project/org outputs organizationViewer + folderViewer roles plus 5 resourcemanager permissions | VERIFIED | `multiProjectOrg.predefinedRoles` has 2 entries at org/folder scope; `customPermissions` has 5 entries all starting with `resourcemanager.` |

**Score:** 4/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `js/data/gcp.js` | GCP_FEATURES export with 8 feature objects + 5 generator functions | VERIFIED | 825 lines, exports GCP_FEATURES (8 features), getGcpRoles, getGcpCustomPermissions, generateGcpPolicy, generateGcpTerraform, generateGcpGuide |
| `tests/gcp-generators.test.js` | Unit tests for all 5 generator functions | VERIFIED | 222 lines, 32 tests across 5 describe blocks, all passing |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| tests/gcp-generators.test.js | js/data/gcp.js | import of all exported functions | WIRED | Line 10-17: imports GCP_FEATURES, getGcpRoles, getGcpCustomPermissions, generateGcpPolicy, generateGcpTerraform, generateGcpGuide |
| js/data/gcp.js | Phase 7 output engine | export of generator functions | VERIFIED (orphaned until Phase 7) | `export function generateGcpPolicy`, `generateGcpTerraform`, `generateGcpGuide` present; Phase 7 not yet built |
| js/data/gcp.js | Phase 7 output engine | export const GCP_FEATURES | VERIFIED (orphaned until Phase 7) | Export present on line 566 |

### Data-Flow Trace (Level 4)

Not applicable -- this is a data module, not a rendering component. Data flows will be verified when Phase 7 (output engine) wires to these exports.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| 8 features exported | `Object.keys(GCP_FEATURES).length` | 8 | PASS |
| All 32 tests pass | `node --test tests/gcp-generators.test.js` | 32 pass, 0 fail | PASS |
| Permission counts correct | Programmatic check | 25, 2, 10, 15, 13, 5 -- all match | PASS |
| CF combined dedup | `getGcpCustomPermissions(['cloudForwardingInbound','cloudForwardingOutbound']).length` | 22 (spec says 21) | FAIL |
| All features have terraform/setupGuide/rationale | Property existence check | All non-empty | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| GCP-01 | 05-01 | Asset Discovery: Compute Viewer + Network Viewer + 25 permissions | SATISFIED | 2 predefined roles + 25 custom permissions verified |
| GCP-02 | 05-01 | Storage Buckets: 2 custom permissions | SATISFIED | storage.buckets.list, storage.buckets.getIamPolicy |
| GCP-03 | 05-01 | DNS read-only: dns.reader role | SATISFIED | predefinedRoles[0].role === 'roles/dns.reader' |
| GCP-04 | 05-01 | DNS read-write: dns.admin role | SATISFIED | predefinedRoles[0].role === 'roles/dns.admin' |
| GCP-05 | 05-01 | CF inbound: 10 custom permissions | SATISFIED | customPermissions.length === 10 |
| GCP-06 | 05-01 | CF outbound: 15 custom permissions | SATISFIED | customPermissions.length === 15 |
| GCP-07 | 05-02 | CF both: combined 21 custom permissions | BLOCKED | Actual combined count is 22, not 21 |
| GCP-08 | 05-01 | Internal Ranges: 13 networkconnectivity permissions | SATISFIED | customPermissions.length === 13 |
| GCP-09 | 05-01 | Multi-project/org: orgViewer + folderViewer + 5 resourcemanager | SATISFIED | 2 predefined roles + 5 custom permissions verified |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none found) | -- | No TODOs, FIXMEs, placeholders, or stubs detected | -- | -- |

No anti-patterns detected. All functions are fully implemented with real data.

### Human Verification Required

### 1. Permission Accuracy Against Infoblox Documentation

**Test:** Cross-reference each permission list against the actual Infoblox Universal DDI Admin Guide for GCP.
**Expected:** All permission strings match documented requirements exactly.
**Why human:** Verifier cannot access external Infoblox documentation to validate permission strings are the correct ones.

### 2. GCP-07 Combined Count Resolution

**Test:** Determine whether 21 or 22 is the correct combined count for Cloud Forwarding inbound+outbound.
**Expected:** Either the requirement is updated to 22 (if the math is correct and the spec had an estimation error) or one permission is identified as extraneous and removed.
**Why human:** Requires domain knowledge to determine if the 22-count is correct or if the original 21 estimate was intentional.

### Gaps Summary

There is one gap: **GCP-07 Cloud Forwarding combined count discrepancy**.

The ROADMAP success criterion and REQUIREMENTS.md both specify 21 combined permissions for Cloud Forwarding inbound+outbound. The actual implementation produces 22 unique permissions. The math is straightforward: 10 inbound + 15 outbound - 3 overlapping (dns.projects.get, compute.networks.get, compute.networks.list) = 22. The SUMMARY (05-02) documents this deviation and explains the correction.

This is likely a spec estimation error rather than an implementation bug. The individual counts (10 inbound, 15 outbound) are correct per requirements. The overlap of 3 is verified. The combined count of 22 follows mathematically. However, since the requirement explicitly states 21, this must be formally resolved -- either update GCP-07 to say 22, or identify which permission should be removed to achieve 21.

All other aspects of Phase 5 are fully verified: 8 feature objects with correct permission data, 5 generator functions with proper deduplication, Terraform HCL output, gcloud CLI output, setup guides, rationale strings, and 32 passing tests.

---

_Verified: 2026-04-16T22:00:00Z_
_Verifier: Claude (gsd-verifier)_
