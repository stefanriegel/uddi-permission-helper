# Product Selector + Permission Gap Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add product selector (Universal DDI / Universal Asset Insight) as first step, filter features by product, and fix Azure+GCP permission gaps against official Infoblox docs.

**Architecture:** New product selection step added before cloud provider selection. Each feature gains a `product` field ('ddi' | 'assetInsight' | 'both'). `questions.js` filters features by selected products before building the question list. Azure discoveryReaderCustomRole expanded from 22→38 permissions. GCP assetDiscovery expanded from 25→41 permissions plus new monitoringStats feature.

**Tech Stack:** Vanilla JS (ES modules), CSS custom properties, node:test

---

### Task 1: Add `product` field to AWS features

**Files:**
- Modify: `js/data/aws.js` (add `product` field to each feature object)

- [ ] **Step 1: Add product field to each AWS feature**

Add `product` field after the `id` field in each feature constant:

```js
// vpcIpamDiscovery — after line: id: 'vpcIpamDiscovery',
product: 'assetInsight',

// ec2Networking — after line: id: 'ec2Networking',
product: 'assetInsight',

// s3BucketVisibility — after line: id: 's3BucketVisibility',
product: 'assetInsight',

// dnsRoute53ReadOnly — after line: id: 'dnsRoute53ReadOnly',
product: 'ddi',

// dnsRoute53Bidirectional — after line: id: 'dnsRoute53Bidirectional',
product: 'ddi',

// cloudForwardingDiscovery — after line: id: 'cloudForwardingDiscovery',
product: 'ddi',

// cloudForwardingFull — after line: id: 'cloudForwardingFull',
product: 'ddi',

// multiAccount — after line: id: 'multiAccount',
product: 'both',
```

- [ ] **Step 2: Run existing AWS tests to verify no regression**

Run: `node --test tests/aws-generators.test.js`
Expected: All 23 tests pass (product field doesn't affect generators)

- [ ] **Step 3: Commit**

```bash
git add js/data/aws.js
git commit -m "feat(aws): add product field to all feature definitions"
```

---

### Task 2: Fix Azure permission gaps + add `product` field

**Files:**
- Modify: `js/data/azure.js`
- Modify: `tests/azure-generators.test.js`

- [ ] **Step 1: Add 16 missing permissions to discoveryReaderCustomRole**

In `discoveryReaderCustomRole.permissions` array, add these after the existing entries (before `'Microsoft.Resources/subscriptions/resourceGroups/read'`):

```js
    // Subscription and tenant metadata
    'Microsoft.Resources/subscriptions/read',
    'Microsoft.Resources/tenants/read',
    // VM Scale Sets
    'Microsoft.Compute/virtualMachineScaleSets/read',
    // Network interface IP configurations
    'Microsoft.Network/networkInterfaces/ipConfigurations/read',
    // Application gateways and firewalls
    'Microsoft.Network/applicationGateways/read',
    'Microsoft.Network/azureFirewalls/read',
    // Virtual WAN
    'Microsoft.Network/virtualHubs/read',
    'Microsoft.Network/virtualWans/read',
    'Microsoft.Network/vpnGateways/read',
    // Network watchers
    'Microsoft.Network/networkWatchers/read',
    'Microsoft.Network/networkWatchers/flowLogs/read',
    // Storage
    'Microsoft.Storage/storageAccounts/read',
    'Microsoft.Storage/storageAccounts/blobServices/containers/read',
    // Management groups
    'Microsoft.Management/managementGroups/read',
    // Monitoring
    'Microsoft.Insights/metrics/read',
    // Traffic manager
    'Microsoft.Network/trafficManagerProfiles/read',
```

- [ ] **Step 2: Fix cloudForwardingFull permissions**

Replace the `cloudForwardingFull.customRole.permissions` array with:

```js
permissions: [
  'Microsoft.Network/dnsResolvers/read',
  'Microsoft.Network/dnsResolvers/write',
  'Microsoft.Network/dnsResolvers/delete',
  'Microsoft.Network/dnsResolvers/outboundEndpoints/read',
  'Microsoft.Network/dnsResolvers/outboundEndpoints/write',
  'Microsoft.Network/dnsResolvers/outboundEndpoints/delete',
  'Microsoft.Network/dnsResolvers/outboundEndpoints/join/action',
  'Microsoft.Network/dnsForwardingRulesets/read',
  'Microsoft.Network/dnsForwardingRulesets/write',
  'Microsoft.Network/dnsForwardingRulesets/delete',
  'Microsoft.Network/dnsForwardingRulesets/join/action',
  'Microsoft.Network/dnsForwardingRulesets/forwardingRules/read',
  'Microsoft.Network/dnsForwardingRulesets/forwardingRules/write',
  'Microsoft.Network/dnsForwardingRulesets/forwardingRules/delete',
  'Microsoft.Network/dnsForwardingRulesets/virtualNetworkLinks/read',
  'Microsoft.Network/dnsForwardingRulesets/virtualNetworkLinks/write',
  'Microsoft.Network/dnsForwardingRulesets/virtualNetworkLinks/delete',
  'Microsoft.Network/virtualNetworks/read',
  'Microsoft.Network/virtualNetworks/listDnsResolvers/action',
  'Microsoft.Network/virtualNetworks/subnets/read',
  'Microsoft.Network/virtualNetworks/subnets/join/action'
],
```

Also update the `rationale` object to match — remove inboundEndpoints/join entries, add the new ones.

- [ ] **Step 3: Update cloudForwardingFull Terraform template + setup guide**

Update the inline Terraform HCL string and setup guide text in `cloudForwardingFull` to reflect the new 21 permissions (remove inbound endpoints, add outboundEndpoints/join, virtualNetworks/read, listDnsResolvers, subnets/read, subnets/join).

- [ ] **Step 4: Update discoveryReaderCustomRole Terraform templates**

Update the inline Terraform HCL strings in `ipamAssetDiscovery`, `publicDnsReadOnly`, and `publicDnsReadWrite` to include all 38 permissions (existing 22 + 16 new). Also update setup guide step counts.

- [ ] **Step 5: Add product field to each Azure feature**

```js
// ipamAssetDiscovery — after id line
product: 'assetInsight',

// publicDnsReadOnly
product: 'ddi',

// publicDnsReadWrite
product: 'ddi',

// privateDns
product: 'ddi',

// cloudForwardingDiscovery
product: 'ddi',

// cloudForwardingFull
product: 'ddi',

// multiSubscription
product: 'both',
```

- [ ] **Step 6: Update Azure tests**

In `tests/azure-generators.test.js`, update the `Discovery Reader has expected permissions` test to also assert the new permissions exist:

```js
assert.ok(perms.includes('Microsoft.Storage/storageAccounts/read'), 'should have Storage read');
assert.ok(perms.includes('Microsoft.Compute/virtualMachineScaleSets/read'), 'should have VMSS read');
assert.ok(perms.includes('Microsoft.Network/applicationGateways/read'), 'should have App Gateway read');
assert.ok(perms.includes('Microsoft.Insights/metrics/read'), 'should have metrics read');
```

Remove the line:
```js
assert.ok(!perms.some(p => p.startsWith('Microsoft.Storage')), 'should not have Storage');
```

Update the `includes 21 permissions for cloud forwarding full` test to check for new permissions:
```js
it('includes 21 permissions for cloud forwarding full', () => {
  const result = generateAzurePolicy(['cloudForwardingFull']);
  assert.ok(result.includes('Microsoft.Network/virtualNetworks/subnets/join/action'), 'should have subnets join');
  assert.ok(result.includes('Microsoft.Network/dnsResolvers/outboundEndpoints/join/action'), 'should have outbound join');
  assert.ok(!result.includes('Microsoft.Network/dnsResolvers/inboundEndpoints/read'), 'should NOT have inbound read');
  assert.ok(result.includes('az role definition create'), 'should have role definition');
});
```

- [ ] **Step 7: Run Azure tests**

Run: `node --test tests/azure-generators.test.js`
Expected: All tests pass

- [ ] **Step 8: Commit**

```bash
git add js/data/azure.js tests/azure-generators.test.js
git commit -m "fix(azure): align permissions with official Infoblox docs

Add 16 missing permissions to Discovery Reader custom role matching
the Cloud Inventory Viewer policy. Fix Cloud Forwarding Full to match
docs (remove inbound endpoints, add outbound join and subnet actions).
Add product field to all Azure features."
```

---

### Task 3: Fix GCP permission gaps + add `product` field + monitoring feature

**Files:**
- Modify: `js/data/gcp.js`
- Modify: `tests/gcp-generators.test.js`

- [ ] **Step 1: Add 16 missing permissions to assetDiscovery**

Add to `assetDiscovery.customPermissions` array (after existing entries, maintaining alphabetical groups):

```js
    'compute.backendBuckets.list',
    'compute.backendServices.list',
    'compute.healthChecks.list',
    'compute.instanceGroups.list',
    'compute.networkEndpointGroups.list',
    'compute.sslCertificates.list',
    'compute.targetHttpProxies.list',
    'compute.targetHttpsProxies.list',
    'compute.targetPools.list',
    'compute.targetSslProxies.list',
    'compute.targetTcpProxies.list',
    'compute.targetVpnGateways.list',
    'compute.urlMaps.list',
    'compute.vpnGateways.list',
    'compute.vpnTunnels.list',
    'resourcemanager.projects.get',
```

Also add corresponding rationale entries for each new permission.

- [ ] **Step 2: Update assetDiscovery Terraform template + setup guide**

Update the inline Terraform HCL `permissions` list and the setup guide text to include all 41 permissions.

- [ ] **Step 3: Add storage.objects.list to storageBuckets**

Add `'storage.objects.list'` to `storageBuckets.customPermissions` array and add rationale:

```js
'storage.objects.list': 'Enumerate objects within storage buckets for inventory'
```

Update storageBuckets Terraform template and setup guide to include the 3rd permission.

- [ ] **Step 4: Add monitoringStats feature**

Add new feature constant before `multiProjectOrg`:

```js
const monitoringStats = {
  id: 'monitoringStats',
  name: 'Monitoring Stats',
  product: 'assetInsight',
  question: 'Discover VM monitoring metrics and alerts?',
  predefinedRoles: [],
  customPermissions: [
    'monitoring.alertPolicies.list',
    'monitoring.groups.list',
    'monitoring.metricDescriptors.list',
    'monitoring.timeSeries.list'
  ],
  rationale: {
    'monitoring.alertPolicies.list': 'Enumerate monitoring alert policies for inventory',
    'monitoring.groups.list': 'List monitoring groups for resource grouping',
    'monitoring.metricDescriptors.list': 'Enumerate available metric types for VM monitoring',
    'monitoring.timeSeries.list': 'Read time series data for VM monitoring stats'
  },
  terraform: `resource "google_project_iam_custom_role" "infoblox_uddi_monitoring" {
  project     = var.project_id
  role_id     = "infobloxUddiMonitoring"
  title       = "Infoblox UDDI - Monitoring Stats"
  description = "Infoblox Universal DDI - Monitoring discovery permissions"
  permissions = [
    "monitoring.alertPolicies.list",
    "monitoring.groups.list",
    "monitoring.metricDescriptors.list",
    "monitoring.timeSeries.list"
  ]
}

resource "google_project_iam_member" "infoblox_uddi_monitoring" {
  project = var.project_id
  role    = google_project_iam_custom_role.infoblox_uddi_monitoring.id
  member  = "serviceAccount:\${var.service_account_email}"
}`,
  setupGuide: `1. Navigate to IAM & Admin > Roles in the GCP Console.
2. Click "Create Role".
3. Name: "Infoblox UDDI - Monitoring Stats", ID: "infobloxUddiMonitoring".
4. Click "Add Permissions" and add:
   - monitoring.alertPolicies.list
   - monitoring.groups.list
   - monitoring.metricDescriptors.list
   - monitoring.timeSeries.list
5. Click "Create".
6. Navigate to IAM & Admin > IAM.
7. Click "Grant Access", add the service account, and assign the custom role.

Alternatively, use gcloud CLI:
gcloud iam roles create infobloxUddiMonitoring \\
  --project=<PROJECT_ID> \\
  --title="Infoblox UDDI - Monitoring Stats" \\
  --permissions="monitoring.alertPolicies.list,monitoring.groups.list,monitoring.metricDescriptors.list,monitoring.timeSeries.list"

gcloud projects add-iam-policy-binding <PROJECT_ID> \\
  --member="serviceAccount:<SA_EMAIL>" \\
  --role="projects/<PROJECT_ID>/roles/infobloxUddiMonitoring"`
};
```

Add `monitoringStats` to the `GCP_FEATURES` export object.

- [ ] **Step 5: Add product field to all GCP features**

```js
// assetDiscovery
product: 'assetInsight',

// storageBuckets
product: 'assetInsight',

// dnsReadOnly
product: 'ddi',

// dnsReadWrite
product: 'ddi',

// cloudForwardingInbound
product: 'ddi',

// cloudForwardingOutbound
product: 'ddi',

// internalRanges
product: 'ddi',

// monitoringStats (already has product: 'assetInsight' from Step 4)

// multiProjectOrg
product: 'both',
```

- [ ] **Step 6: Update GCP tests**

In `tests/gcp-generators.test.js`:

Update `assetDiscovery` count from 25 to 41:
```js
it('returns exactly 41 permissions for assetDiscovery', () => {
  const result = getGcpCustomPermissions(['assetDiscovery']);
  assert.equal(result.length, 41);
});
```

Update `storageBuckets` count from 2 to 3:
```js
it('returns exactly 3 permissions for storageBuckets', () => {
  const result = getGcpCustomPermissions(['storageBuckets']);
  assert.equal(result.length, 3);
  assert.ok(result.includes('storage.buckets.getIamPolicy'));
  assert.ok(result.includes('storage.buckets.list'));
  assert.ok(result.includes('storage.objects.list'));
});
```

Add test for monitoringStats:
```js
it('returns exactly 4 permissions for monitoringStats', () => {
  const result = getGcpCustomPermissions(['monitoringStats']);
  assert.equal(result.length, 4);
  assert.ok(result.includes('monitoring.timeSeries.list'));
  assert.ok(result.includes('monitoring.alertPolicies.list'));
});
```

Add test for monitoringStats feature existence:
```js
it('monitoringStats feature exists in GCP_FEATURES', () => {
  assert.ok(GCP_FEATURES.monitoringStats, 'monitoringStats should exist');
  assert.equal(GCP_FEATURES.monitoringStats.product, 'assetInsight');
});
```

- [ ] **Step 7: Run GCP tests**

Run: `node --test tests/gcp-generators.test.js`
Expected: All tests pass

- [ ] **Step 8: Commit**

```bash
git add js/data/gcp.js tests/gcp-generators.test.js
git commit -m "fix(gcp): align permissions with official Infoblox docs

Add 16 missing compute permissions to assetDiscovery matching Cloud
Inventory Viewer policy. Add storage.objects.list to storageBuckets.
Add monitoringStats feature with 4 monitoring permissions.
Add product field to all GCP features."
```

---

### Task 4: Add product state management

**Files:**
- Modify: `js/state.js`

- [ ] **Step 1: Add selectedProducts to state and export functions**

Add to the `state` object:
```js
selectedProducts: [],  // Array of 'ddi' | 'assetInsight'
```

Add new exported functions after `getSelectionMode`:

```js
const VALID_PRODUCTS = ['ddi', 'assetInsight'];

/**
 * Get the currently selected products.
 * @returns {string[]} Array of selected product IDs.
 */
export function getSelectedProducts() {
  return state.selectedProducts;
}

/**
 * Toggle a product selection. If already selected, removes it.
 * If not selected, adds it. Resets all provider feature selections
 * when products change (features may appear/disappear).
 * @param {string} productId - One of 'ddi' or 'assetInsight'.
 * @returns {string[]} Updated selectedProducts array.
 */
export function toggleProduct(productId) {
  if (!VALID_PRODUCTS.includes(productId)) {
    return state.selectedProducts;
  }
  const idx = state.selectedProducts.indexOf(productId);
  if (idx >= 0) {
    state.selectedProducts.splice(idx, 1);
  } else {
    state.selectedProducts.push(productId);
  }
  // Reset all provider features when products change
  for (const provider of VALID_PROVIDERS) {
    state.providers[provider].features = {};
  }
  return state.selectedProducts;
}

/**
 * Check if any product is selected.
 * @returns {boolean}
 */
export function hasProductSelected() {
  return state.selectedProducts.length > 0;
}
```

- [ ] **Step 2: Commit**

```bash
git add js/state.js
git commit -m "feat(state): add product selection state management"
```

---

### Task 5: Add product filtering to questions engine

**Files:**
- Modify: `js/questions.js`

- [ ] **Step 1: Add product filtering to getQuestionsForProvider**

Update the function signature and add filtering logic. The function now accepts an optional `selectedProducts` parameter:

```js
/**
 * Derive wizard questions from a provider's feature data.
 *
 * @param {string} providerId - One of 'aws', 'azure', 'gcp'.
 * @param {string[]} [selectedProducts] - Optional product filter. If provided, only features
 *   matching a selected product are included. Features with product 'both' are always included
 *   when any product is selected.
 * @returns {Array<object>} Array of question objects for the wizard.
 */
export function getQuestionsForProvider(providerId, selectedProducts) {
  const features = PROVIDER_FEATURES[providerId];
  if (!features) return [];

  const exclusiveTexts = EXCLUSIVE_GROUPS[providerId] || [];
  const questions = [];
  const questionMap = new Map();

  for (const [featureId, feature] of Object.entries(features)) {
    const questionText = feature.question;
    if (!questionText) continue;

    // Product filtering: skip features that don't match selected products
    if (selectedProducts && selectedProducts.length > 0 && feature.product) {
      if (feature.product === 'ddi' && !selectedProducts.includes('ddi')) continue;
      if (feature.product === 'assetInsight' && !selectedProducts.includes('assetInsight')) continue;
      // 'both' always passes when any product is selected
    }

    // ... rest of the function unchanged
```

- [ ] **Step 2: Commit**

```bash
git add js/questions.js
git commit -m "feat(questions): filter features by selected products"
```

---

### Task 6: Add product selector HTML + CSS

**Files:**
- Modify: `index.html`
- Modify: `css/styles.css`

- [ ] **Step 1: Add product selector section to HTML**

Insert before the cloud provider selection section (before `<section aria-label="Cloud provider selection">`):

```html
    <section aria-label="Product selection" id="product-selector">
      <h1 class="section-heading">Select Product</h1>
      <nav class="products" aria-label="Product selection">
        <button class="product-card" type="button" data-product="ddi" aria-label="Select Universal DDI" aria-pressed="false">
          <span class="product-card__name">Universal DDI</span>
          <span class="product-card__desc">DNS management, IPAM, DHCP, cloud forwarding</span>
        </button>
        <button class="product-card" type="button" data-product="assetInsight" aria-label="Select Universal Asset Insight" aria-pressed="false">
          <span class="product-card__name">Universal Asset Insight</span>
          <span class="product-card__desc">Cloud infrastructure discovery and inventory</span>
        </button>
      </nav>
    </section>
```

Change the provider section heading from `<h1>` to `<h2>`:
```html
    <section aria-label="Cloud provider selection" id="provider-selector">
      <h2 class="section-heading">Select Cloud Provider</h2>
```

Add `id="provider-selector"` to the provider section for JS targeting.

- [ ] **Step 2: Add product card CSS**

Add after the provider card styles in `css/styles.css`:

```css
/* 5b. Product Cards
   -------------------------------------------------------------------------- */

.products {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.product-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-xs);
  padding: var(--space-lg);
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-shadow: var(--shadow-card);
  text-align: left;
}

.product-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-card-hover);
}

.product-card--selected {
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(58, 143, 214, 0.15);
}

.product-card__name {
  font-size: var(--text-heading);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
}

.product-card__desc {
  font-size: var(--text-label);
  color: var(--color-text-secondary);
}

/* Provider section hidden until product selected */
#provider-selector.provider-selector--hidden {
  display: none;
}

@media (max-width: 600px) {
  .products {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat(ui): add product selector section with card styles"
```

---

### Task 7: Wire product selection into app.js

**Files:**
- Modify: `js/app.js`
- Modify: `js/ui.js`

- [ ] **Step 1: Add updateProductCards function to ui.js**

Add after the `updateProviderCards` function:

```js
/**
 * Update product card visual states.
 * @param {string[]} selectedProducts - Array of selected product IDs.
 */
export function updateProductCards(selectedProducts) {
  const cards = document.querySelectorAll('.product-card[data-product]');
  cards.forEach((card) => {
    const productId = card.dataset.product;
    if (selectedProducts.includes(productId)) {
      card.classList.add('product-card--selected');
      card.setAttribute('aria-pressed', 'true');
    } else {
      card.classList.remove('product-card--selected');
      card.setAttribute('aria-pressed', 'false');
    }
  });
}

/**
 * Show or hide the provider selector section.
 * @param {boolean} visible
 */
export function setProviderSelectorVisible(visible) {
  const section = document.getElementById('provider-selector');
  if (section) {
    section.classList.toggle('provider-selector--hidden', !visible);
  }
}
```

- [ ] **Step 2: Wire product card clicks in app.js**

Add imports for new state and UI functions:

```js
import { setActiveProvider, getActiveProvider, hasProviderData, setFeature, getFeatures, setSelectionMode, getSelectionMode, getSelectedProducts, toggleProduct, hasProductSelected } from './state.js';
import { updateProviderCards, updateWorkspace, renderWizard, renderAdvanced, updateProductCards, setProviderSelectorVisible } from './ui.js';
```

Update `getQuestionsForProvider` call in `renderCurrentMode` to pass selectedProducts:

```js
function renderCurrentMode() {
  const providerId = getActiveProvider();
  if (!providerId) return;

  const mode = getSelectionMode();
  const questions = getQuestionsForProvider(providerId, getSelectedProducts());
  const features = getFeatures(providerId);

  if (mode === 'wizard') {
    renderWizard(questions, features, handleAnswer);
  } else {
    renderAdvanced(questions, features, handleAnswer);
  }
}
```

Add product card click handler inside `DOMContentLoaded`:

```js
  // Hide provider selector on init
  setProviderSelectorVisible(false);

  // Product card click handler
  const productCards = document.querySelectorAll('.product-card[data-product]');
  productCards.forEach((card) => {
    card.addEventListener('click', () => {
      const productId = card.dataset.product;
      toggleProduct(productId);

      const selected = getSelectedProducts();
      updateProductCards(selected);
      setProviderSelectorVisible(selected.length > 0);

      // Reset workspace if products changed (features may have disappeared)
      if (getActiveProvider()) {
        renderCurrentMode();
        refreshOutput();
      }
    });
  });
```

- [ ] **Step 3: Update workspace empty state text**

In `index.html`, update the empty state message:
```html
<p class="workspace__empty">Select a product and cloud provider above to begin.</p>
```

- [ ] **Step 4: Commit**

```bash
git add js/app.js js/ui.js index.html
git commit -m "feat(app): wire product selector with feature filtering"
```

---

### Task 8: Run all tests + manual verification

**Files:** None (verification only)

- [ ] **Step 1: Run all test suites**

Run: `node --test tests/aws-generators.test.js tests/azure-generators.test.js tests/gcp-generators.test.js`
Expected: All tests pass

- [ ] **Step 2: Start local server and verify UI flow**

Run: `python3 -m http.server 8000 &`

Open http://localhost:8000 and verify:
1. Product cards appear first (DDI / Asset Insight)
2. Provider cards hidden until product selected
3. Selecting DDI → only DNS/forwarding features visible
4. Selecting Asset Insight → only discovery features visible
5. Selecting both → all features visible
6. Multi-account/subscription/project visible for any product
7. Output generates correct permissions

- [ ] **Step 3: Push to GitHub Pages**

```bash
git push origin main
```

- [ ] **Step 4: Commit any fixes found during verification**

If any issues found, fix and commit individually.
