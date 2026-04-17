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

  it('returns empty roles for ipamAssetDiscovery (uses custom role)', () => {
    const result = getAzureRoles(['ipamAssetDiscovery']);
    assert.equal(result.length, 0, 'ipamAssetDiscovery uses custom role, no built-in roles');
  });

  it('returns empty roles for IPAM + public DNS read-only (both use custom role)', () => {
    const result = getAzureRoles(['ipamAssetDiscovery', 'publicDnsReadOnly']);
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

  it('returns Discovery Reader for ipamAssetDiscovery', () => {
    const result = getAzureCustomRoles(['ipamAssetDiscovery']);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'Infoblox UDDI - Discovery Reader');
  });

  it('deduplicates Discovery Reader across IPAM + public DNS read-only', () => {
    const result = getAzureCustomRoles(['ipamAssetDiscovery', 'publicDnsReadOnly']);
    assert.equal(result.length, 1, 'should deduplicate shared custom role');
    assert.equal(result[0].name, 'Infoblox UDDI - Discovery Reader');
  });

  it('deduplicates Discovery Reader across all three features that share it', () => {
    const result = getAzureCustomRoles(['ipamAssetDiscovery', 'publicDnsReadOnly', 'publicDnsReadWrite']);
    assert.equal(result.length, 1, 'should deduplicate to single Discovery Reader');
  });

  it('returns all unique custom roles when all features selected', () => {
    const allIds = Object.keys(AZURE_FEATURES);
    const result = getAzureCustomRoles(allIds);
    const names = result.map(r => r.name).sort();
    assert.deepStrictEqual(names, [
      'Infoblox UDDI - DNS Resolver Discovery',
      'Infoblox UDDI - DNS Resolver Full Management',
      'Infoblox UDDI - Discovery Reader'
    ]);
  });

  it('Discovery Reader has expected permissions', () => {
    const result = getAzureCustomRoles(['ipamAssetDiscovery']);
    const perms = result[0].permissions;
    assert.ok(perms.includes('Microsoft.Network/virtualNetworks/read'), 'should have VNet read');
    assert.ok(perms.includes('Microsoft.Compute/virtualMachines/read'), 'should have VM read');
    assert.ok(perms.includes('Microsoft.Network/dnsZones/read'), 'should have DNS zone read');
    assert.ok(perms.includes('Microsoft.Resources/subscriptions/resourceGroups/read'), 'should have RG read');
    assert.ok(perms.includes('Microsoft.Storage/storageAccounts/read'), 'should have Storage read');
    assert.ok(perms.includes('Microsoft.Compute/virtualMachineScaleSets/read'), 'should have VMSS read');
    assert.ok(perms.includes('Microsoft.Network/applicationGateways/read'), 'should have App Gateway read');
    assert.ok(perms.includes('Microsoft.Insights/metrics/read'), 'should have metrics read');
    // Should NOT include unrelated services
    assert.ok(!perms.some(p => p.startsWith('Microsoft.KeyVault')), 'should not have KeyVault');
    assert.ok(!perms.some(p => p.startsWith('Microsoft.Sql')), 'should not have SQL');
  });
});

// --- generateAzurePolicy ---

describe('generateAzurePolicy', () => {
  it('returns empty string for empty input', () => {
    const result = generateAzurePolicy([]);
    assert.equal(result, '');
  });

  it('outputs custom role definition for IPAM', () => {
    const result = generateAzurePolicy(['ipamAssetDiscovery']);
    assert.ok(result.includes('az role definition create'), 'should have role definition create');
    assert.ok(result.includes('Discovery Reader'), 'should reference Discovery Reader');
    assert.ok(result.includes('Microsoft.Network/virtualNetworks/read'), 'should have VNet read permission');
    assert.ok(result.includes('az role assignment create'), 'should have role assignment');
  });

  it('outputs single custom role definition for IPAM + public DNS read-only', () => {
    const result = generateAzurePolicy(['ipamAssetDiscovery', 'publicDnsReadOnly']);
    const roleDefCount = (result.match(/az role definition create/g) || []).length;
    assert.equal(roleDefCount, 1, 'Discovery Reader should appear only once');
  });

  it('outputs both custom Discovery Reader and DNS Zone Contributor for publicDnsReadWrite', () => {
    const result = generateAzurePolicy(['publicDnsReadWrite']);
    assert.ok(result.includes('az role definition create'), 'should have custom role definition');
    assert.ok(result.includes('Discovery Reader'), 'should have Discovery Reader');
    assert.ok(result.includes('"DNS Zone Contributor"'), 'should have DNS Zone Contributor');
    // Should have 2 role assignment create commands: one for custom role, one for DNS Zone Contributor
    const assignCount = (result.match(/az role assignment create/g) || []).length;
    assert.equal(assignCount, 2, 'should have 2 role assignments (custom + built-in)');
  });

  it('deduplicates Discovery Reader across IPAM + publicDnsReadOnly + publicDnsReadWrite', () => {
    const result = generateAzurePolicy(['ipamAssetDiscovery', 'publicDnsReadOnly', 'publicDnsReadWrite']);
    const roleDefCount = (result.match(/az role definition create/g) || []).length;
    assert.equal(roleDefCount, 1, 'only 1 Discovery Reader definition even with 3 features');
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

  it('outputs azurerm_role_definition for IPAM', () => {
    const result = generateAzureTerraform(['ipamAssetDiscovery']);
    assert.ok(result.includes('azurerm_role_definition'), 'should have role definition');
    assert.ok(result.includes('Discovery Reader'), 'should reference Discovery Reader');
    assert.ok(result.includes('azurerm_role_assignment'), 'should have role assignment');
    assert.ok(result.includes('azurerm_subscription'), 'should have subscription data source');
    assert.ok(result.includes('azurerm_client_config'), 'should have client config data source');
  });

  it('deduplicates Discovery Reader for IPAM + public DNS read-only', () => {
    const result = generateAzureTerraform(['ipamAssetDiscovery', 'publicDnsReadOnly']);
    const resourceBlocks = result.match(/resource "azurerm_role_definition"/g);
    assert.equal(resourceBlocks.length, 1, 'should have only one role definition for Discovery Reader');
    const assignBlocks = result.match(/resource "azurerm_role_assignment"/g);
    assert.equal(assignBlocks.length, 1, 'should have only one role assignment for Discovery Reader');
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

  it('returns numbered steps for IPAM with custom role', () => {
    const guide = generateAzureGuide(['ipamAssetDiscovery']);
    assert.ok(guide.includes('1.'), 'should have step 1');
    assert.ok(guide.toLowerCase().includes('service principal'), 'should mention service principal');
    assert.ok(guide.toLowerCase().includes('custom role'), 'should mention custom role');
    assert.ok(guide.toLowerCase().includes('discovery reader'), 'should mention Discovery Reader');
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
    const guide = generateAzureGuide(['ipamAssetDiscovery', 'cloudForwardingDiscovery']);
    assert.ok(guide.includes('1.'), 'should have numbered steps');
    assert.ok(guide.toLowerCase().includes('discovery reader'), 'should mention Discovery Reader');
    assert.ok(guide.toLowerCase().includes('dns resolver discovery'), 'should mention DNS Resolver custom role');
  });

  it('ends with Infoblox Portal configuration step', () => {
    const guide = generateAzureGuide(['ipamAssetDiscovery']);
    const lines = guide.trim().split('\n');
    const lastLine = lines[lines.length - 1].toLowerCase();
    assert.ok(lastLine.includes('infoblox portal'), 'last step should mention Infoblox Portal');
  });

  it('deduplicates Discovery Reader in guide for IPAM + publicDnsReadOnly', () => {
    const guide = generateAzureGuide(['ipamAssetDiscovery', 'publicDnsReadOnly']);
    const customRoleMentions = (guide.match(/custom role named "Infoblox UDDI - Discovery Reader"/g) || []).length;
    assert.equal(customRoleMentions, 1, 'should mention Discovery Reader creation only once');
  });
});
