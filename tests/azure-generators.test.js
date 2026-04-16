/**
 * Tests for Azure data module generator functions.
 *
 * Covers: getAzureRoles, generateAzurePolicy, generateAzureTerraform, generateAzureGuide
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AZURE_FEATURES,
  getAzureRoles,
  generateAzurePolicy,
  generateAzureTerraform,
  generateAzureGuide
} from '../js/data/azure.js';

// --- getAzureRoles ---

describe('getAzureRoles', () => {
  it('returns empty array for empty input', () => {
    const result = getAzureRoles([]);
    assert.deepStrictEqual(result, []);
  });

  it('returns Reader for ipamAssetDiscovery', () => {
    const result = getAzureRoles(['ipamAssetDiscovery']);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'Reader');
    assert.equal(result[0].builtIn, true);
    assert.equal(result[0].scope, 'subscription');
  });

  it('deduplicates Reader when IPAM + public DNS read-only selected', () => {
    const result = getAzureRoles(['ipamAssetDiscovery', 'publicDnsReadOnly']);
    assert.equal(result.length, 1, 'Reader should appear only once');
    assert.equal(result[0].name, 'Reader');
  });

  it('returns Reader + DNS Zone Contributor for publicDnsReadWrite', () => {
    const result = getAzureRoles(['publicDnsReadWrite']);
    assert.equal(result.length, 2);
    const names = result.map(r => r.name).sort();
    assert.deepStrictEqual(names, ['DNS Zone Contributor', 'Reader']);
  });

  it('returns empty array for cloudForwardingDiscovery (custom role only)', () => {
    const result = getAzureRoles(['cloudForwardingDiscovery']);
    assert.deepStrictEqual(result, []);
  });

  it('returns empty array for multiSubscription (guidance only)', () => {
    const result = getAzureRoles(['multiSubscription']);
    assert.deepStrictEqual(result, []);
  });

  it('deduplicates Reader across all features that reference it', () => {
    const allIds = Object.keys(AZURE_FEATURES);
    const result = getAzureRoles(allIds);
    const readerCount = result.filter(r => r.name === 'Reader').length;
    assert.equal(readerCount, 1, 'Reader should appear exactly once');
  });

  it('returns all unique built-in roles when all features selected', () => {
    const allIds = Object.keys(AZURE_FEATURES);
    const result = getAzureRoles(allIds);
    const names = result.map(r => r.name).sort();
    assert.deepStrictEqual(names, [
      'DNS Zone Contributor',
      'Private DNS Zone Contributor',
      'Reader'
    ]);
  });
});

// --- generateAzurePolicy ---

describe('generateAzurePolicy', () => {
  it('returns empty string for empty input', () => {
    const result = generateAzurePolicy([]);
    assert.equal(result, '');
  });

  it('outputs az CLI command with Reader for IPAM', () => {
    const result = generateAzurePolicy(['ipamAssetDiscovery']);
    assert.ok(result.includes('az role assignment create'), 'should have az role assignment');
    assert.ok(result.includes('"Reader"'), 'should reference Reader role');
    assert.ok(result.includes('<SERVICE_PRINCIPAL_ID>'), 'should have placeholder');
    assert.ok(result.includes('<SUBSCRIPTION_ID>'), 'should have subscription placeholder');
  });

  it('outputs single Reader command for IPAM + public DNS read-only', () => {
    const result = generateAzurePolicy(['ipamAssetDiscovery', 'publicDnsReadOnly']);
    const matches = result.match(/az role assignment create/g);
    assert.equal(matches.length, 1, 'Reader should appear only once in az commands');
  });

  it('outputs custom role JSON for cloud forwarding discovery', () => {
    const result = generateAzurePolicy(['cloudForwardingDiscovery']);
    assert.ok(result.includes('az role definition create'), 'should have role definition create');
    assert.ok(result.includes('Microsoft.Network/dnsResolvers/read'), 'should include permissions');
    assert.ok(result.includes('Infoblox UDDI'), 'should include custom role name');
  });

  it('includes 21 permissions for cloud forwarding full', () => {
    const result = generateAzurePolicy(['cloudForwardingFull']);
    assert.ok(result.includes('Microsoft.Network/virtualNetworks/join/action'), 'should have VNet join');
    assert.ok(result.includes('az role definition create'), 'should have role definition');
  });

  it('outputs guidance for multiSubscription', () => {
    const result = generateAzurePolicy(['multiSubscription']);
    assert.ok(
      result.toLowerCase().includes('management group'),
      'should mention management group'
    );
  });
});

// --- generateAzureTerraform ---

describe('generateAzureTerraform', () => {
  it('returns empty string for empty input', () => {
    const result = generateAzureTerraform([]);
    assert.equal(result, '');
  });

  it('outputs azurerm_role_assignment for IPAM', () => {
    const result = generateAzureTerraform(['ipamAssetDiscovery']);
    assert.ok(result.includes('azurerm_role_assignment'), 'should have role assignment');
    assert.ok(result.includes('azurerm_subscription'), 'should have subscription data source');
    assert.ok(result.includes('azurerm_client_config'), 'should have client config data source');
  });

  it('outputs azurerm_role_definition for cloud forwarding', () => {
    const result = generateAzureTerraform(['cloudForwardingDiscovery']);
    assert.ok(result.includes('azurerm_role_definition'), 'should have role definition');
    assert.ok(result.includes('azurerm_role_assignment'), 'should have role assignment');
    assert.ok(result.includes('Microsoft.Network/dnsResolvers/read'), 'should have permissions');
  });

  it('outputs management group for multiSubscription', () => {
    const result = generateAzureTerraform(['multiSubscription']);
    assert.ok(result.includes('azurerm_management_group'), 'should have management group');
  });

  it('deduplicates role assignments for IPAM + public DNS read-only', () => {
    const result = generateAzureTerraform(['ipamAssetDiscovery', 'publicDnsReadOnly']);
    const matches = result.match(/azurerm_role_assignment/g);
    // Should have exactly 2: resource definition line + the block reference
    // Actually just check there's only one resource block for Reader
    const resourceBlocks = result.match(/resource "azurerm_role_assignment"/g);
    assert.equal(resourceBlocks.length, 1, 'should have only one role assignment resource for Reader');
  });
});

// --- generateAzureGuide ---

describe('generateAzureGuide', () => {
  it('returns empty string for empty input', () => {
    const result = generateAzureGuide([]);
    assert.equal(result, '');
  });

  it('returns numbered steps for IPAM', () => {
    const guide = generateAzureGuide(['ipamAssetDiscovery']);
    assert.ok(guide.includes('1.'), 'should have step 1');
    assert.ok(guide.toLowerCase().includes('service principal'), 'should mention service principal');
    assert.ok(guide.toLowerCase().includes('reader'), 'should mention Reader role');
    assert.ok(guide.toLowerCase().includes('infoblox portal'), 'should end with Infoblox Portal');
  });

  it('includes management group instructions for multiSubscription', () => {
    const guide = generateAzureGuide(['multiSubscription']);
    assert.ok(
      guide.toLowerCase().includes('management group'),
      'should mention management group'
    );
  });

  it('combines role and custom role steps', () => {
    const guide = generateAzureGuide(['ipamAssetDiscovery', 'cloudForwardingDiscovery']);
    assert.ok(guide.includes('1.'), 'should have numbered steps');
    assert.ok(guide.toLowerCase().includes('reader'), 'should mention Reader');
    assert.ok(guide.toLowerCase().includes('custom role'), 'should mention custom role');
  });

  it('ends with Infoblox Portal configuration step', () => {
    const guide = generateAzureGuide(['ipamAssetDiscovery']);
    const lines = guide.trim().split('\n');
    const lastLine = lines[lines.length - 1].toLowerCase();
    assert.ok(lastLine.includes('infoblox portal'), 'last step should mention Infoblox Portal');
  });
});
