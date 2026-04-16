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

  it('returns empty array for assetDiscovery (custom perms only)', () => {
    const result = getGcpRoles(['assetDiscovery']);
    assert.deepStrictEqual(result, []);
  });

  it('returns empty array for dnsReadOnly (custom perms only)', () => {
    const result = getGcpRoles(['dnsReadOnly']);
    assert.deepStrictEqual(result, []);
  });

  it('returns empty array for dnsReadWrite (custom perms only)', () => {
    const result = getGcpRoles(['dnsReadWrite']);
    assert.deepStrictEqual(result, []);
  });

  it('returns empty array for cloudForwardingInbound (custom perms only)', () => {
    const result = getGcpRoles(['cloudForwardingInbound']);
    assert.deepStrictEqual(result, []);
  });

  it('returns empty for assetDiscovery + dnsReadOnly (all custom)', () => {
    const result = getGcpRoles(['assetDiscovery', 'dnsReadOnly']);
    assert.deepStrictEqual(result, []);
  });

  it('returns 2 org/folder roles for multiProjectOrg', () => {
    const result = getGcpRoles(['multiProjectOrg']);
    assert.equal(result.length, 2);
    const scopes = result.map(r => r.scope).sort();
    assert.deepStrictEqual(scopes, ['folder', 'organization']);
  });

  it('returns only 2 roles for all features combined (multiProjectOrg only)', () => {
    const allIds = Object.keys(GCP_FEATURES);
    const result = getGcpRoles(allIds);
    assert.equal(result.length, 2);
    const roleNames = result.map(r => r.role).sort();
    assert.deepStrictEqual(roleNames, [
      'roles/resourcemanager.folderViewer',
      'roles/resourcemanager.organizationViewer'
    ]);
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

  it('returns exactly 7 permissions for dnsReadOnly', () => {
    const result = getGcpCustomPermissions(['dnsReadOnly']);
    assert.equal(result.length, 7);
    assert.ok(result.includes('dns.managedZones.get'));
    assert.ok(result.includes('dns.resourceRecordSets.list'));
  });

  it('returns exactly 16 permissions for dnsReadWrite', () => {
    const result = getGcpCustomPermissions(['dnsReadWrite']);
    assert.equal(result.length, 16);
    assert.ok(result.includes('dns.managedZones.create'));
    assert.ok(result.includes('dns.resourceRecordSets.delete'));
    assert.ok(result.includes('dns.changes.create'));
  });

  it('dnsReadWrite permissions include all dnsReadOnly permissions plus write actions', () => {
    const readOnly = getGcpCustomPermissions(['dnsReadOnly']);
    const readWrite = getGcpCustomPermissions(['dnsReadWrite']);
    for (const perm of readOnly) {
      assert.ok(readWrite.includes(perm), `dnsReadWrite should include ${perm} from dnsReadOnly`);
    }
    assert.ok(readWrite.length > readOnly.length, 'dnsReadWrite should have more permissions than dnsReadOnly');
  });

  it('returns sorted permissions', () => {
    const result = getGcpCustomPermissions(['cloudForwardingInbound']);
    const sorted = [...result].sort();
    assert.deepStrictEqual(result, sorted);
  });
});

// --- generateGcpPolicy ---

describe('generateGcpPolicy', () => {
  it('returns empty string for empty input', () => {
    const result = generateGcpPolicy([]);
    assert.equal(result, '');
  });

  it('includes gcloud iam roles create for dnsReadOnly custom permissions', () => {
    const result = generateGcpPolicy(['dnsReadOnly']);
    assert.ok(result.includes('gcloud iam roles create'));
    assert.ok(result.includes('dns.managedZones.get'));
  });

  it('includes gcloud iam roles create for storageBuckets custom permissions', () => {
    const result = generateGcpPolicy(['storageBuckets']);
    assert.ok(result.includes('gcloud iam roles create'));
    assert.ok(result.includes('storage.buckets.list'));
  });

  it('generates only custom role commands for assetDiscovery (no predefined)', () => {
    const result = generateGcpPolicy(['assetDiscovery']);
    assert.ok(result.includes('gcloud iam roles create'));
    assert.ok(result.includes('compute.instances.list'));
    // Should not contain predefined compute roles
    assert.ok(!result.includes('roles/compute.viewer'));
    assert.ok(!result.includes('roles/compute.networkViewer'));
  });

  it('includes organization and folder commands for multiProjectOrg', () => {
    const result = generateGcpPolicy(['multiProjectOrg']);
    assert.ok(result.includes('organizations add-iam-policy-binding'));
    assert.ok(result.includes('folders add-iam-policy-binding') || result.includes('resource-manager folders add-iam-policy-binding'));
  });

  it('includes predefined role binding only for multiProjectOrg', () => {
    const result = generateGcpPolicy(['multiProjectOrg']);
    assert.ok(result.includes('roles/resourcemanager.organizationViewer'));
    assert.ok(result.includes('roles/resourcemanager.folderViewer'));
  });
});

// --- generateGcpTerraform ---

describe('generateGcpTerraform', () => {
  it('returns empty string for empty input', () => {
    const result = generateGcpTerraform([]);
    assert.equal(result, '');
  });

  it('generates custom role terraform for dnsReadOnly (no predefined role)', () => {
    const result = generateGcpTerraform(['dnsReadOnly']);
    assert.ok(result.includes('google_project_iam_custom_role'));
    assert.ok(result.includes('google_project_iam_member'));
    assert.ok(!result.includes('roles/dns.reader'));
  });

  it('generates custom role terraform for assetDiscovery (no predefined roles)', () => {
    const result = generateGcpTerraform(['assetDiscovery']);
    assert.ok(result.includes('google_project_iam_custom_role'));
    assert.ok(!result.includes('roles/compute.viewer'));
    assert.ok(!result.includes('roles/compute.networkViewer'));
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
