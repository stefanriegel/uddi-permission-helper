/**
 * Tests for Azure data module generator functions.
 *
 * Covers: getAzureRoles, getAzureCustomRoles, generateAzurePolicy, generateAzureTerraform, generateAzureGuide
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AZURE_FEATURES,
  getAzureRoles,
  getAzureCustomRoles,
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

  it('returns Reader role for vnetNetworkDiscovery', () => {
    const result = getAzureRoles(['vnetNetworkDiscovery']);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'Reader');
    assert.equal(result[0].builtIn, true);
    assert.equal(result[0].scope, 'subscription');
  });

  it('deduplicates Reader across vnetNetworkDiscovery + publicDnsReadOnly', () => {
    const result = getAzureRoles(['vnetNetworkDiscovery', 'publicDnsReadOnly']);
    assert.equal(result.length, 1, 'Reader should be deduplicated');
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

// --- getAzureCustomRoles ---

describe('getAzureCustomRoles', () => {
  it('returns empty array for empty input', () => {
    const result = getAzureCustomRoles([]);
    assert.deepStrictEqual(result, []);
  });

  it('returns empty array for vnetNetworkDiscovery (uses Reader built-in)', () => {
    const result = getAzureCustomRoles(['vnetNetworkDiscovery']);
    assert.equal(result.length, 0, 'vnetNetworkDiscovery uses Reader, no custom role');
  });

  it('returns empty array for computeDiscovery (uses Reader built-in)', () => {
    const result = getAzureCustomRoles(['computeDiscovery']);
    assert.equal(result.length, 0);
  });

  it('returns empty array for storageDiscovery (uses Reader built-in)', () => {
    const result = getAzureCustomRoles(['storageDiscovery']);
    assert.equal(result.length, 0);
  });

  it('returns empty array for azureMonitoringStats (uses Reader built-in)', () => {
    const result = getAzureCustomRoles(['azureMonitoringStats']);
    assert.equal(result.length, 0);
  });

  it('returns empty array for publicDnsReadOnly (uses Reader built-in)', () => {
    const result = getAzureCustomRoles(['publicDnsReadOnly']);
    assert.equal(result.length, 0);
  });

  it('returns Resource Group Management custom role for publicDnsReadWrite', () => {
    const result = getAzureCustomRoles(['publicDnsReadWrite']);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'Infoblox UDDI - Resource Group Management');
    assert.equal(result[0].permissions.length, 2);
  });

  it('deduplicates Resource Group Management across publicDnsReadWrite + privateDns', () => {
    const result = getAzureCustomRoles(['publicDnsReadWrite', 'privateDns']);
    assert.equal(result.length, 1, 'should deduplicate Resource Group Management');
    assert.equal(result[0].name, 'Infoblox UDDI - Resource Group Management');
  });

  it('returns DNS Resolver Discovery custom role for cloudForwardingDiscovery', () => {
    const result = getAzureCustomRoles(['cloudForwardingDiscovery']);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'Infoblox UDDI - DNS Resolver Discovery');
    assert.equal(result[0].permissions.length, 6);
  });

  it('returns all unique custom roles when all features selected', () => {
    const allIds = Object.keys(AZURE_FEATURES);
    const result = getAzureCustomRoles(allIds);
    const names = result.map(r => r.name).sort();
    assert.deepStrictEqual(names, [
      'Infoblox UDDI - DNS Resolver Discovery',
      'Infoblox UDDI - DNS Resolver Full Management',
      'Infoblox UDDI - Resource Group Management'
    ]);
  });
});

// --- generateAzurePolicy ---

describe('generateAzurePolicy', () => {
  it('returns empty string for empty input', () => {
    const result = generateAzurePolicy([]);
    assert.equal(result, '');
  });

  it('outputs Reader built-in role assignment for vnetNetworkDiscovery', () => {
    const result = generateAzurePolicy(['vnetNetworkDiscovery']);
    assert.ok(result.includes('az role assignment create'), 'should have role assignment');
    assert.ok(result.includes('"Reader"'), 'should reference Reader role');
    assert.ok(!result.includes('az role definition create'), 'should NOT have custom role definition');
  });

  it('outputs Reader + DNS Zone Contributor + Resource Group Management for publicDnsReadWrite', () => {
    const result = generateAzurePolicy(['publicDnsReadWrite']);
    assert.ok(result.includes('"Reader"'), 'should have Reader');
    assert.ok(result.includes('"DNS Zone Contributor"'), 'should have DNS Zone Contributor');
    assert.ok(result.includes('az role definition create'), 'should have custom role definition');
    assert.ok(result.includes('Resource Group Management'), 'should have Resource Group Management');
    // Should have 3 role assignment commands: Reader, DNS Zone Contributor, custom role
    const assignCount = (result.match(/az role assignment create/g) || []).length;
    assert.equal(assignCount, 3, 'should have 3 role assignments');
  });

  it('deduplicates Resource Group Management across publicDnsReadWrite + privateDns', () => {
    const result = generateAzurePolicy(['publicDnsReadWrite', 'privateDns']);
    const roleDefCount = (result.match(/az role definition create/g) || []).length;
    assert.equal(roleDefCount, 1, 'only 1 Resource Group Management definition');
  });

  it('outputs custom role JSON for cloud forwarding discovery', () => {
    const result = generateAzurePolicy(['cloudForwardingDiscovery']);
    assert.ok(result.includes('az role definition create'), 'should have role definition create');
    assert.ok(result.includes('Microsoft.Network/dnsResolvers/read'), 'should include permissions');
    assert.ok(result.includes('Infoblox UDDI'), 'should include custom role name');
  });

  it('includes 21 permissions for cloud forwarding full (outbound only, no inbound)', () => {
    const result = generateAzurePolicy(['cloudForwardingFull']);
    assert.ok(result.includes('Microsoft.Network/virtualNetworks/subnets/join/action'), 'should have subnets join');
    assert.ok(result.includes('Microsoft.Network/dnsResolvers/outboundEndpoints/join/action'), 'should have outbound join');
    assert.ok(!result.includes('Microsoft.Network/dnsResolvers/inboundEndpoints/write'), 'should NOT have inbound write');
    assert.ok(!result.includes('Microsoft.Network/dnsResolvers/inboundEndpoints/delete'), 'should NOT have inbound delete');
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

  it('outputs Reader built-in role assignment for vnetNetworkDiscovery', () => {
    const result = generateAzureTerraform(['vnetNetworkDiscovery']);
    assert.ok(result.includes('azurerm_role_definition'), 'should have role definition data source');
    assert.ok(result.includes('"Reader"'), 'should reference Reader');
    assert.ok(result.includes('azurerm_role_assignment'), 'should have role assignment');
    assert.ok(result.includes('azurerm_subscription'), 'should have subscription data source');
    assert.ok(result.includes('azurerm_client_config'), 'should have client config data source');
    // Should NOT have a custom role definition resource
    assert.ok(!result.includes('resource "azurerm_role_definition"'), 'should NOT create custom role definition');
  });

  it('outputs Reader + custom role for publicDnsReadWrite', () => {
    const result = generateAzureTerraform(['publicDnsReadWrite']);
    assert.ok(result.includes('"Reader"'), 'should have Reader');
    assert.ok(result.includes('"DNS Zone Contributor"'), 'should have DNS Zone Contributor');
    const resourceBlocks = result.match(/resource "azurerm_role_definition"/g);
    assert.equal(resourceBlocks.length, 1, 'should have 1 custom role definition for Resource Group Management');
  });

  it('deduplicates Resource Group Management for publicDnsReadWrite + privateDns', () => {
    const result = generateAzureTerraform(['publicDnsReadWrite', 'privateDns']);
    const resourceBlocks = result.match(/resource "azurerm_role_definition"/g);
    assert.equal(resourceBlocks.length, 1, 'should have only one Resource Group Management definition');
  });

  it('outputs azurerm_role_definition for cloud forwarding', () => {
    const result = generateAzureTerraform(['cloudForwardingDiscovery']);
    assert.ok(result.includes('resource "azurerm_role_definition"'), 'should have role definition');
    assert.ok(result.includes('azurerm_role_assignment'), 'should have role assignment');
    assert.ok(result.includes('Microsoft.Network/dnsResolvers/read'), 'should have permissions');
  });

  it('outputs management group for multiSubscription', () => {
    const result = generateAzureTerraform(['multiSubscription']);
    assert.ok(result.includes('azurerm_management_group'), 'should have management group');
  });
});

// --- generateAzureGuide ---

describe('generateAzureGuide', () => {
  it('returns empty string for empty input', () => {
    const result = generateAzureGuide([]);
    assert.equal(result, '');
  });

  it('returns numbered steps for vnetNetworkDiscovery with Reader role', () => {
    const guide = generateAzureGuide(['vnetNetworkDiscovery']);
    assert.ok(guide.includes('1.'), 'should have step 1');
    assert.ok(guide.toLowerCase().includes('service principal'), 'should mention service principal');
    assert.ok(guide.includes('"Reader"'), 'should mention Reader role');
    assert.ok(guide.toLowerCase().includes('infoblox portal'), 'should end with Infoblox Portal');
  });

  it('includes management group instructions for multiSubscription', () => {
    const guide = generateAzureGuide(['multiSubscription']);
    assert.ok(
      guide.toLowerCase().includes('management group'),
      'should mention management group'
    );
  });

  it('combines Reader and cloud forwarding custom role steps', () => {
    const guide = generateAzureGuide(['vnetNetworkDiscovery', 'cloudForwardingDiscovery']);
    assert.ok(guide.includes('1.'), 'should have numbered steps');
    assert.ok(guide.includes('"Reader"'), 'should mention Reader role');
    assert.ok(guide.toLowerCase().includes('dns resolver discovery'), 'should mention DNS Resolver custom role');
  });

  it('ends with Infoblox Portal configuration step', () => {
    const guide = generateAzureGuide(['vnetNetworkDiscovery']);
    const lines = guide.trim().split('\n');
    const lastLine = lines[lines.length - 1].toLowerCase();
    assert.ok(lastLine.includes('infoblox portal'), 'last step should mention Infoblox Portal');
  });

  it('deduplicates Resource Group Management in guide for publicDnsReadWrite + privateDns', () => {
    const guide = generateAzureGuide(['publicDnsReadWrite', 'privateDns']);
    const customRoleMentions = (guide.match(/custom role named "Infoblox UDDI - Resource Group Management"/g) || []).length;
    assert.equal(customRoleMentions, 1, 'should mention Resource Group Management creation only once');
  });
});
