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

  it('returns empty roles for vnetNetworkDiscovery (uses custom role)', () => {
    const result = getAzureRoles(['vnetNetworkDiscovery']);
    assert.equal(result.length, 0, 'vnetNetworkDiscovery uses custom role, no built-in roles');
  });

  it('returns empty roles for vnetNetworkDiscovery + publicDnsReadOnly (both use custom role)', () => {
    const result = getAzureRoles(['vnetNetworkDiscovery', 'publicDnsReadOnly']);
    assert.equal(result.length, 0, 'both features use custom role, no built-in roles');
  });

  it('returns only DNS Zone Contributor for publicDnsReadWrite', () => {
    const result = getAzureRoles(['publicDnsReadWrite']);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'DNS Zone Contributor');
    assert.equal(result[0].builtIn, true);
    assert.equal(result[0].scope, 'subscription');
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
      'Private DNS Zone Contributor'
    ]);
  });
});

// --- getAzureCustomRoles ---

describe('getAzureCustomRoles', () => {
  it('returns empty array for empty input', () => {
    const result = getAzureCustomRoles([]);
    assert.deepStrictEqual(result, []);
  });

  it('returns Network Discovery custom role for vnetNetworkDiscovery', () => {
    const result = getAzureCustomRoles(['vnetNetworkDiscovery']);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'Infoblox UDDI - Network Discovery');
  });

  it('returns Compute Discovery custom role', () => {
    const result = getAzureCustomRoles(['computeDiscovery']);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'Infoblox UDDI - Compute Discovery');
    assert.equal(result[0].permissions.length, 3);
  });

  it('returns Storage Discovery custom role', () => {
    const result = getAzureCustomRoles(['storageDiscovery']);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'Infoblox UDDI - Storage Discovery');
    assert.equal(result[0].permissions.length, 2);
  });

  it('returns Monitoring Stats custom role', () => {
    const result = getAzureCustomRoles(['azureMonitoringStats']);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'Infoblox UDDI - Monitoring Stats');
    assert.equal(result[0].permissions.length, 1);
  });

  it('returns 2 custom roles for vnetNetworkDiscovery + publicDnsReadOnly', () => {
    const result = getAzureCustomRoles(['vnetNetworkDiscovery', 'publicDnsReadOnly']);
    assert.equal(result.length, 2, 'should have Network Discovery + DNS Reader');
  });

  it('deduplicates DNS Reader across publicDnsReadOnly + publicDnsReadWrite', () => {
    const result = getAzureCustomRoles(['publicDnsReadOnly', 'publicDnsReadWrite']);
    assert.equal(result.length, 1, 'should deduplicate DNS Reader');
    assert.equal(result[0].name, 'Infoblox UDDI - DNS Reader');
  });

  it('returns all unique custom roles when all features selected', () => {
    const allIds = Object.keys(AZURE_FEATURES);
    const result = getAzureCustomRoles(allIds);
    const names = result.map(r => r.name).sort();
    assert.deepStrictEqual(names, [
      'Infoblox UDDI - Compute Discovery',
      'Infoblox UDDI - DNS Reader',
      'Infoblox UDDI - DNS Resolver Discovery',
      'Infoblox UDDI - DNS Resolver Full Management',
      'Infoblox UDDI - Monitoring Stats',
      'Infoblox UDDI - Network Discovery',
      'Infoblox UDDI - Storage Discovery'
    ]);
  });

  it('Network Discovery has expected permissions', () => {
    const result = getAzureCustomRoles(['vnetNetworkDiscovery']);
    const perms = result[0].permissions;
    assert.ok(perms.includes('Microsoft.Network/virtualNetworks/read'), 'should have VNet read');
    assert.ok(perms.includes('Microsoft.Network/loadBalancers/read'), 'should have LB read');
    assert.ok(perms.includes('Microsoft.Network/applicationGateways/read'), 'should have App Gateway read');
    assert.ok(perms.includes('Microsoft.Management/managementGroups/read'), 'should have mgmt groups');
    assert.ok(!perms.some(p => p.startsWith('Microsoft.Compute')), 'should not have Compute');
    assert.ok(!perms.some(p => p.startsWith('Microsoft.Storage')), 'should not have Storage');
  });
});

// --- generateAzurePolicy ---

describe('generateAzurePolicy', () => {
  it('returns empty string for empty input', () => {
    const result = generateAzurePolicy([]);
    assert.equal(result, '');
  });

  it('outputs custom role definition for vnetNetworkDiscovery', () => {
    const result = generateAzurePolicy(['vnetNetworkDiscovery']);
    assert.ok(result.includes('az role definition create'), 'should have role definition create');
    assert.ok(result.includes('Network Discovery'), 'should reference Network Discovery');
    assert.ok(result.includes('Microsoft.Network/virtualNetworks/read'), 'should have VNet read permission');
    assert.ok(result.includes('az role assignment create'), 'should have role assignment');
  });

  it('outputs single custom role definition for vnetNetworkDiscovery + publicDnsReadOnly', () => {
    const result = generateAzurePolicy(['vnetNetworkDiscovery', 'publicDnsReadOnly']);
    const roleDefCount = (result.match(/az role definition create/g) || []).length;
    assert.equal(roleDefCount, 2, 'Network Discovery and DNS Reader are separate roles');
  });

  it('outputs both custom DNS Reader and DNS Zone Contributor for publicDnsReadWrite', () => {
    const result = generateAzurePolicy(['publicDnsReadWrite']);
    assert.ok(result.includes('az role definition create'), 'should have custom role definition');
    assert.ok(result.includes('DNS Reader'), 'should have DNS Reader');
    assert.ok(result.includes('"DNS Zone Contributor"'), 'should have DNS Zone Contributor');
    // Should have 2 role assignment create commands: one for custom role, one for DNS Zone Contributor
    const assignCount = (result.match(/az role assignment create/g) || []).length;
    assert.equal(assignCount, 2, 'should have 2 role assignments (custom + built-in)');
  });

  it('deduplicates DNS Reader across publicDnsReadOnly + publicDnsReadWrite', () => {
    const result = generateAzurePolicy(['publicDnsReadOnly', 'publicDnsReadWrite']);
    const roleDefCount = (result.match(/az role definition create/g) || []).length;
    assert.equal(roleDefCount, 1, 'only 1 DNS Reader definition even with 2 features');
  });

  it('outputs custom role JSON for cloud forwarding discovery', () => {
    const result = generateAzurePolicy(['cloudForwardingDiscovery']);
    assert.ok(result.includes('az role definition create'), 'should have role definition create');
    assert.ok(result.includes('Microsoft.Network/dnsResolvers/read'), 'should include permissions');
    assert.ok(result.includes('Infoblox UDDI'), 'should include custom role name');
  });

  it('includes 21 permissions for cloud forwarding full', () => {
    const result = generateAzurePolicy(['cloudForwardingFull']);
    assert.ok(result.includes('Microsoft.Network/virtualNetworks/subnets/join/action'), 'should have subnets join');
    assert.ok(result.includes('Microsoft.Network/dnsResolvers/outboundEndpoints/join/action'), 'should have outbound join');
    assert.ok(!result.includes('Microsoft.Network/dnsResolvers/inboundEndpoints/read'), 'should NOT have inbound read');
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

  it('outputs azurerm_role_definition for vnetNetworkDiscovery', () => {
    const result = generateAzureTerraform(['vnetNetworkDiscovery']);
    assert.ok(result.includes('azurerm_role_definition'), 'should have role definition');
    assert.ok(result.includes('Network Discovery'), 'should reference Network Discovery');
    assert.ok(result.includes('azurerm_role_assignment'), 'should have role assignment');
    assert.ok(result.includes('azurerm_subscription'), 'should have subscription data source');
    assert.ok(result.includes('azurerm_client_config'), 'should have client config data source');
  });

  it('outputs separate role definitions for vnetNetworkDiscovery + publicDnsReadOnly', () => {
    const result = generateAzureTerraform(['vnetNetworkDiscovery', 'publicDnsReadOnly']);
    const resourceBlocks = result.match(/resource "azurerm_role_definition"/g);
    assert.equal(resourceBlocks.length, 2, 'should have separate role definitions for Network Discovery and DNS Reader');
  });

  it('deduplicates DNS Reader for publicDnsReadOnly + publicDnsReadWrite', () => {
    const result = generateAzureTerraform(['publicDnsReadOnly', 'publicDnsReadWrite']);
    const resourceBlocks = result.match(/resource "azurerm_role_definition"/g);
    assert.equal(resourceBlocks.length, 1, 'should have only one role definition for DNS Reader');
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
});

// --- generateAzureGuide ---

describe('generateAzureGuide', () => {
  it('returns empty string for empty input', () => {
    const result = generateAzureGuide([]);
    assert.equal(result, '');
  });

  it('returns numbered steps for vnetNetworkDiscovery with custom role', () => {
    const guide = generateAzureGuide(['vnetNetworkDiscovery']);
    assert.ok(guide.includes('1.'), 'should have step 1');
    assert.ok(guide.toLowerCase().includes('service principal'), 'should mention service principal');
    assert.ok(guide.toLowerCase().includes('custom role'), 'should mention custom role');
    assert.ok(guide.toLowerCase().includes('network discovery'), 'should mention Network Discovery');
    assert.ok(guide.toLowerCase().includes('infoblox portal'), 'should end with Infoblox Portal');
  });

  it('includes management group instructions for multiSubscription', () => {
    const guide = generateAzureGuide(['multiSubscription']);
    assert.ok(
      guide.toLowerCase().includes('management group'),
      'should mention management group'
    );
  });

  it('combines custom role and cloud forwarding steps', () => {
    const guide = generateAzureGuide(['vnetNetworkDiscovery', 'cloudForwardingDiscovery']);
    assert.ok(guide.includes('1.'), 'should have numbered steps');
    assert.ok(guide.toLowerCase().includes('network discovery'), 'should mention Network Discovery');
    assert.ok(guide.toLowerCase().includes('dns resolver discovery'), 'should mention DNS Resolver custom role');
  });

  it('ends with Infoblox Portal configuration step', () => {
    const guide = generateAzureGuide(['vnetNetworkDiscovery']);
    const lines = guide.trim().split('\n');
    const lastLine = lines[lines.length - 1].toLowerCase();
    assert.ok(lastLine.includes('infoblox portal'), 'last step should mention Infoblox Portal');
  });

  it('deduplicates DNS Reader in guide for publicDnsReadOnly + publicDnsReadWrite', () => {
    const guide = generateAzureGuide(['publicDnsReadOnly', 'publicDnsReadWrite']);
    const customRoleMentions = (guide.match(/custom role named "Infoblox UDDI - DNS Reader"/g) || []).length;
    assert.equal(customRoleMentions, 1, 'should mention DNS Reader creation only once');
  });
});
