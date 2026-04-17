# Product Selector + Permission Gap Fixes

**Date:** 2026-04-17
**Status:** Approved

## Problem

1. The permission helper doesn't distinguish between Universal DDI and Universal Asset Insight features. Customers must know which features belong to which product — selecting irrelevant features produces overly broad policies.
2. Azure and GCP discovery permissions are incomplete compared to official Infoblox docs ("Cloud Inventory Viewer" custom role policies).

## Design

### 1. Product Selector (New First Screen)

A new step before cloud provider selection. Two product cards, multi-selectable:

- **Universal DDI** — DNS management, IPAM, DHCP, cloud forwarding
- **Universal Asset Insight** — Cloud infrastructure discovery and inventory

Selecting one or both filters which features appear in the wizard/advanced mode. If both selected, all features visible.

**Visual treatment:** Same card style as cloud provider cards. Horizontal layout, product logo/icon, short description. Selected state matches existing `provider-card--selected` pattern.

### 2. State Changes

`state.js` gains:

```js
selectedProducts: []  // Array of 'ddi' | 'assetInsight'
```

Product selection persists across provider switches. Changing products resets feature selections for all providers (features may appear/disappear).

### 3. Data Model Changes

Each feature in `aws.js`, `azure.js`, `gcp.js` gains a `product` field:

```js
product: 'assetInsight'  // 'ddi' | 'assetInsight' | 'both'
```

#### Feature-to-Product Mapping

**AWS:**

| Feature ID | Product | Rationale |
|---|---|---|
| `vpcIpamDiscovery` | assetInsight | Discovery Sync Policy |
| `ec2Networking` | assetInsight | Discovery Sync Policy |
| `s3BucketVisibility` | assetInsight | Discovery Sync Policy |
| `dnsRoute53ReadOnly` | ddi | Route 53 Permissions page |
| `dnsRoute53Bidirectional` | ddi | Route 53 Permissions page |
| `cloudForwardingDiscovery` | ddi | Cloud Forwarding Permissions page |
| `cloudForwardingFull` | ddi | Cloud Forwarding Permissions page |
| `multiAccount` | both | Used by both products for cross-account access |

**Azure:**

| Feature ID | Product | Rationale |
|---|---|---|
| `ipamAssetDiscovery` | assetInsight | Cloud Inventory Viewer custom role |
| `publicDnsReadOnly` | ddi | Azure DNS Permissions page |
| `publicDnsReadWrite` | ddi | Azure DNS Permissions page |
| `privateDns` | ddi | Azure DNS Permissions page |
| `cloudForwardingDiscovery` | ddi | Cloud Forwarding Permissions page |
| `cloudForwardingFull` | ddi | Cloud Forwarding Permissions page |
| `multiSubscription` | both | Used by both products |

**GCP:**

| Feature ID | Product | Rationale |
|---|---|---|
| `assetDiscovery` | assetInsight | Cloud Inventory Viewer custom role |
| `storageBuckets` | assetInsight | Cloud Inventory Viewer custom role |
| `dnsReadOnly` | ddi | GCP DNS Permissions page |
| `dnsReadWrite` | ddi | GCP DNS Permissions page |
| `cloudForwardingInbound` | ddi | GCP DNS Forwarding page |
| `cloudForwardingOutbound` | ddi | GCP DNS Forwarding page |
| `internalRanges` | ddi | GCP Internal Range Integration page |
| `multiProjectOrg` | both | Used by both products |

### 4. Feature Filtering

`questions.js` `deriveQuestions()` receives selected products and filters features before grouping:

```js
// Skip features that don't match selected products
if (feature.product === 'ddi' && !selectedProducts.includes('ddi')) continue;
if (feature.product === 'assetInsight' && !selectedProducts.includes('assetInsight')) continue;
// 'both' features always shown when any product selected
```

Generator functions (`getAwsActions`, `generateAwsPolicy`, etc.) are unchanged — they receive already-filtered feature IDs from the UI layer.

### 5. Azure Permission Gap Fixes

#### 5a. Discovery Reader Custom Role — Add 14 Missing Permissions

Add to `discoveryReaderCustomRole.permissions`:

```
Microsoft.Resources/subscriptions/read
Microsoft.Compute/virtualMachineScaleSets/read
Microsoft.Network/networkInterfaces/ipConfigurations/read
Microsoft.Network/applicationGateways/read
Microsoft.Network/azureFirewalls/read
Microsoft.Network/virtualHubs/read
Microsoft.Network/virtualWans/read
Microsoft.Network/vpnGateways/read
Microsoft.Network/networkWatchers/read
Microsoft.Network/networkWatchers/flowLogs/read
Microsoft.Storage/storageAccounts/read
Microsoft.Storage/storageAccounts/blobServices/containers/read
Microsoft.Management/managementGroups/read
Microsoft.Insights/metrics/read
Microsoft.Resources/tenants/read
Microsoft.Network/trafficManagerProfiles/read
```

Keep existing extras (expressRouteCircuits, localNetworkGateways, VNet peering) — they are defensible additions for network topology discovery.

Update Terraform templates and setup guides to match.

#### 5b. Cloud Forwarding Full — Fix 5 Missing, Remove 4 Incorrect

**Add:**
- `Microsoft.Network/dnsResolvers/outboundEndpoints/join/action`
- `Microsoft.Network/virtualNetworks/read`
- `Microsoft.Network/virtualNetworks/listDnsResolvers/action`
- `Microsoft.Network/virtualNetworks/subnets/read`
- `Microsoft.Network/virtualNetworks/subnets/join/action`

**Remove:**
- `Microsoft.Network/dnsResolvers/join/action` (not in docs)
- `Microsoft.Network/dnsResolvers/inboundEndpoints/read` (not in docs)
- `Microsoft.Network/dnsResolvers/inboundEndpoints/write` (not in docs)
- `Microsoft.Network/dnsResolvers/inboundEndpoints/delete` (not in docs)
- `Microsoft.Network/virtualNetworks/join/action` (replace with subnets/join/action)

Update Terraform templates and setup guides to match.

### 6. GCP Permission Gap Fixes

#### 6a. Asset Discovery — Add Missing Permissions

Add to `assetDiscovery.customPermissions`:

```
compute.targetPools.list
compute.instanceGroups.list
compute.backendServices.list
compute.backendBuckets.list
compute.networkEndpointGroups.list
compute.targetHttpProxies.list
compute.targetHttpsProxies.list
compute.targetSslProxies.list
compute.targetTcpProxies.list
compute.urlMaps.list
compute.healthChecks.list
compute.sslCertificates.list
compute.vpnGateways.list
compute.vpnTunnels.list
compute.targetVpnGateways.list
resourcemanager.projects.get
```

Keep existing `.get` variants — they provide detail views that the `.list` permissions don't cover. The docs use `.list` only but `.get` is standard for asset detail retrieval.

#### 6b. Storage Buckets — Add Missing Permission

Add `storage.objects.list` to `storageBuckets.customPermissions`.

#### 6c. New Feature: Monitoring Stats

New GCP feature for monitoring discovery (tagged `assetInsight`):

```js
const monitoringStats = {
  id: 'monitoringStats',
  name: 'Monitoring Stats',
  product: 'assetInsight',
  question: 'Discover VM monitoring metrics and alerts?',
  customPermissions: [
    'monitoring.timeSeries.list',
    'monitoring.metricDescriptors.list',
    'monitoring.alertPolicies.list',
    'monitoring.groups.list'
  ]
};
```

Separate feature rather than adding to assetDiscovery — monitoring is optional and some customers may not want to grant monitoring access.

### 7. UI Updates

#### Product selector HTML

New `<section id="product-selector">` before `<section id="provider-selector">`. Same card grid pattern. Cards show:
- Product name
- One-line description
- Selected/unselected state

#### Workspace visibility

Workspace panel hidden until both product AND provider selected. Provider cards hidden until at least one product selected.

#### Output changes

None. Output renders whatever features are selected — product filtering happens upstream.

### 8. Test Updates

- Update AWS test counts (already done for bugfixes)
- Add Azure generator tests for new permissions
- Add GCP generator tests for new permissions
- Add product filtering tests in questions module
- Add state tests for selectedProducts

### 9. Files Changed

| File | Change |
|---|---|
| `index.html` | Add product selector section |
| `css/styles.css` | Product card styles (reuse provider card pattern) |
| `js/state.js` | Add `selectedProducts` to state |
| `js/data/aws.js` | Add `product` field to all features |
| `js/data/azure.js` | Add `product` field + fix 14+5 permission gaps |
| `js/data/gcp.js` | Add `product` field + fix 21 gaps + new monitoring feature |
| `js/questions.js` | Filter features by selected products |
| `js/ui.js` | Render product cards, manage visibility flow |
| `js/app.js` | Wire product selection events |
| `tests/aws-generators.test.js` | Already updated |
| `tests/azure-generators.test.js` | Update counts |
| `tests/gcp-generators.test.js` | Update counts + monitoring feature |

## Out of Scope

- AWS VPC IPAM write permissions (new feature — separate task)
- Kubernetes cluster discovery permissions (not in current docs)
- Threat Defense vs DDI licensing gate (UI doesn't need license enforcement)
- Product logos/branding (use text labels for now)
