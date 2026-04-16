/**
 * Tests for GCP data module generator functions.
 *
 * Covers: getGcpRoles, getGcpCustomPermissions, generateGcpPolicy,
 *         generateGcpTerraform, generateGcpGuide
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  GCP_FEATURES,
  getGcpRoles,
  getGcpCustomPermissions,
  generateGcpPolicy,
  generateGcpTerraform,
  generateGcpGuide
} from '../js/data/gcp.js';

// --- getGcpRoles ---

describe('getGcpRoles', () => {
  it('returns empty array for empty input', () => {
    const result = getGcpRoles([]);
    assert.deepStrictEqual(result, []);
  });

  it('returns 2 roles for assetDiscovery', () => {
    const result = getGcpRoles(['assetDiscovery']);
    assert.equal(result.length, 2);
    const roles = result.map(r => r.role).sort();
    assert.deepStrictEqual(roles, ['roles/compute.networkViewer', 'roles/compute.viewer']);
    assert.equal(result[0].scope, 'project');
  });

  it('returns 1 role for dnsReadOnly', () => {
    const result = getGcpRoles(['dnsReadOnly']);
    assert.equal(result.length, 1);
    assert.equal(result[0].role, 'roles/dns.reader');
    assert.equal(result[0].scope, 'project');
  });

  it('returns empty array for cloudForwardingInbound (custom perms only)', () => {
    const result = getGcpRoles(['cloudForwardingInbound']);
    assert.deepStrictEqual(result, []);
  });

  it('returns 3 roles for assetDiscovery + dnsReadOnly (no overlap)', () => {
    const result = getGcpRoles(['assetDiscovery', 'dnsReadOnly']);
    assert.equal(result.length, 3);
  });

  it('returns 2 org/folder roles for multiProjectOrg', () => {
    const result = getGcpRoles(['multiProjectOrg']);
    assert.equal(result.length, 2);
    const scopes = result.map(r => r.scope).sort();
    assert.deepStrictEqual(scopes, ['folder', 'organization']);
  });

  it('deduplicates roles when same role appears in multiple features', () => {
    // assetDiscovery and dnsReadWrite both have predefined roles; no overlap
    // but selecting all features should deduplicate by role name
    const allIds = Object.keys(GCP_FEATURES);
    const result = getGcpRoles(allIds);
    const roleNames = result.map(r => r.role);
    const uniqueNames = [...new Set(roleNames)];
    assert.equal(roleNames.length, uniqueNames.length, 'should have no duplicate roles');
  });
});

// --- getGcpCustomPermissions ---

describe('getGcpCustomPermissions', () => {
  it('returns empty array for empty input', () => {
    const result = getGcpCustomPermissions([]);
    assert.deepStrictEqual(result, []);
  });

  it('returns exactly 2 permissions for storageBuckets', () => {
    const result = getGcpCustomPermissions(['storageBuckets']);
    assert.equal(result.length, 2);
    assert.deepStrictEqual(result, ['storage.buckets.getIamPolicy', 'storage.buckets.list']);
  });

  it('returns exactly 10 permissions for cloudForwardingInbound', () => {
    const result = getGcpCustomPermissions(['cloudForwardingInbound']);
    assert.equal(result.length, 10);
  });

  it('returns exactly 15 permissions for cloudForwardingOutbound', () => {
    const result = getGcpCustomPermissions(['cloudForwardingOutbound']);
    assert.equal(result.length, 15);
  });

  it('returns exactly 22 unique permissions for inbound + outbound combined', () => {
    const result = getGcpCustomPermissions(['cloudForwardingInbound', 'cloudForwardingOutbound']);
    assert.equal(result.length, 22);
  });

  it('returns exactly 25 permissions for assetDiscovery', () => {
    const result = getGcpCustomPermissions(['assetDiscovery']);
    assert.equal(result.length, 25);
  });

  it('returns exactly 13 permissions for internalRanges', () => {
    const result = getGcpCustomPermissions(['internalRanges']);
    assert.equal(result.length, 13);
  });

  it('returns sorted permissions', () => {
    const result = getGcpCustomPermissions(['cloudForwardingInbound']);
    const sorted = [...result].sort();
    assert.deepStrictEqual(result, sorted);
  });

  it('returns empty array for features with no custom permissions', () => {
    const result = getGcpCustomPermissions(['dnsReadOnly']);
    assert.deepStrictEqual(result, []);
  });
});

// --- generateGcpPolicy ---

describe('generateGcpPolicy', () => {
  it('returns empty string for empty input', () => {
    const result = generateGcpPolicy([]);
    assert.equal(result, '');
  });

  it('includes gcloud projects add-iam-policy-binding for predefined roles', () => {
    const result = generateGcpPolicy(['dnsReadOnly']);
    assert.ok(result.includes('gcloud projects add-iam-policy-binding'));
    assert.ok(result.includes('roles/dns.reader'));
  });

  it('includes gcloud iam roles create for custom permissions', () => {
    const result = generateGcpPolicy(['storageBuckets']);
    assert.ok(result.includes('gcloud iam roles create'));
    assert.ok(result.includes('storage.buckets.list'));
  });

  it('includes both predefined and custom commands for mixed features', () => {
    const result = generateGcpPolicy(['assetDiscovery']);
    assert.ok(result.includes('gcloud projects add-iam-policy-binding'));
    assert.ok(result.includes('gcloud iam roles create'));
  });

  it('includes organization and folder commands for multiProjectOrg', () => {
    const result = generateGcpPolicy(['multiProjectOrg']);
    assert.ok(result.includes('organizations add-iam-policy-binding'));
    assert.ok(result.includes('folders add-iam-policy-binding') || result.includes('resource-manager folders add-iam-policy-binding'));
  });
});

// --- generateGcpTerraform ---

describe('generateGcpTerraform', () => {
  it('returns empty string for empty input', () => {
    const result = generateGcpTerraform([]);
    assert.equal(result, '');
  });

  it('includes google_project_iam_member for predefined roles', () => {
    const result = generateGcpTerraform(['dnsReadOnly']);
    assert.ok(result.includes('google_project_iam_member'));
    assert.ok(result.includes('roles/dns.reader'));
  });

  it('includes google_project_iam_custom_role for custom permissions', () => {
    const result = generateGcpTerraform(['storageBuckets']);
    assert.ok(result.includes('google_project_iam_custom_role'));
    assert.ok(result.includes('google_project_iam_member'));
  });

  it('includes google_organization_iam_member for multiProjectOrg', () => {
    const result = generateGcpTerraform(['multiProjectOrg']);
    assert.ok(result.includes('google_organization_iam_member'));
    assert.ok(result.includes('google_folder_iam_member'));
  });
});

// --- generateGcpGuide ---

describe('generateGcpGuide', () => {
  it('returns empty string for empty input', () => {
    const result = generateGcpGuide([]);
    assert.equal(result, '');
  });

  it('includes service account creation step', () => {
    const guide = generateGcpGuide(['dnsReadOnly']);
    assert.ok(guide.toLowerCase().includes('service account'));
  });

  it('includes Infoblox Portal configuration step', () => {
    const guide = generateGcpGuide(['dnsReadOnly']);
    assert.ok(guide.toLowerCase().includes('infoblox portal'));
  });

  it('includes numbered steps', () => {
    const guide = generateGcpGuide(['dnsReadOnly']);
    assert.ok(guide.includes('1.'));
    assert.ok(guide.includes('2.'));
  });

  it('includes organization-level instructions for multiProjectOrg', () => {
    const guide = generateGcpGuide(['multiProjectOrg']);
    assert.ok(guide.toLowerCase().includes('organization'));
  });

  it('includes custom role creation steps when custom permissions present', () => {
    const guide = generateGcpGuide(['storageBuckets']);
    assert.ok(guide.toLowerCase().includes('custom role'));
  });

  it('ends with Infoblox Portal step', () => {
    const guide = generateGcpGuide(['assetDiscovery']);
    const lines = guide.trim().split('\n');
    const lastLine = lines[lines.length - 1].toLowerCase();
    assert.ok(lastLine.includes('infoblox portal'));
  });
});
