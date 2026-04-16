---
phase: quick
plan: 02
subsystem: azure-permissions
tags: [azure, iam, custom-role, least-privilege]
dependency_graph:
  requires: []
  provides: [azure-discovery-reader-custom-role]
  affects: [js/data/azure.js, tests/azure-generators.test.js]
tech_stack:
  added: []
  patterns: [shared-custom-role-object, custom-role-deduplication]
key_files:
  created: []
  modified:
    - js/data/azure.js
    - tests/azure-generators.test.js
decisions:
  - Shared discoveryReaderCustomRole object referenced by 3 features (IPAM, DNS RO, DNS RW)
  - 22 specific Microsoft.* read actions covering network, compute, DNS, and resource group reads
  - Deduplication added to all 3 generator functions (policy, terraform, guide)
metrics:
  duration: ~3min
  completed: 2026-04-16
---

# Quick 02: Azure Reader Role Replacement Summary

Custom Discovery Reader role with 22 specific Microsoft.* read actions replacing the overly broad built-in Reader role across IPAM, Public DNS Read-Only, and Public DNS Read-Write features.

## Changes Made

### Task 1: Replace Reader built-in role with custom Discovery Reader

**Commit:** 3c60dac

- Added `discoveryReaderCustomRole` shared constant with 22 permissions scoped to Microsoft.Network/*, Microsoft.Compute/virtualMachines+disks, Microsoft.Network/dnsZones+privateDnsZones, and Microsoft.Resources/subscriptions/resourceGroups
- Replaced `roles: [{ name: 'Reader' }]` with `roles: [], customRole: discoveryReaderCustomRole` in ipamAssetDiscovery, publicDnsReadOnly, publicDnsReadWrite
- publicDnsReadWrite retains DNS Zone Contributor as its only built-in role
- Added `getAzureCustomRoles()` export function for standalone custom role collection
- Added `seenCustomRoles` deduplication to `generateAzurePolicy()`, `generateAzureTerraform()`, and `generateAzureGuide()`
- Updated terraform and setupGuide strings for all 3 features to reference the custom role
- Cloud Forwarding custom roles (DNS Resolver Discovery, DNS Resolver Full Management) unchanged

### Task 2: Update Azure tests

**Commit:** 71c2df7

- Updated getAzureRoles tests: ipamAssetDiscovery and publicDnsReadOnly now return empty, publicDnsReadWrite returns only DNS Zone Contributor, all-features returns 2 roles (no Reader)
- Added getAzureCustomRoles test suite (6 tests): deduplication, permission content, no unrelated services
- Updated generateAzurePolicy tests: custom role definition output, deduplication across 3 features
- Updated generateAzureTerraform tests: azurerm_role_definition output, deduplication
- Updated generateAzureGuide tests: custom role references, Discovery Reader deduplication
- All 32 tests passing

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `node --test tests/azure-generators.test.js` -- 32 tests, 0 failures
- No Azure feature references the Reader built-in role
- `getAzureRoles(allFeatures)` returns only DNS Zone Contributor and Private DNS Zone Contributor
- Selecting IPAM + Public DNS RO + Public DNS RW produces exactly 1 custom role definition (deduplicated)

## Self-Check: PASSED
