/**
 * Azure permission data for UDDI Permission Scope Helper.
 *
 * Seven feature categories with built-in role assignments and/or custom role
 * definitions, Terraform HCL templates, setup guides, and per-role/permission
 * rationale strings. All data sourced from the Infoblox Universal DDI Admin Guide.
 *
 * Azure uses a role-based model: built-in roles (Reader, DNS Zone Contributor,
 * Private DNS Zone Contributor) and custom roles (for Cloud Forwarding features).
 */

const ipamAssetDiscovery = {
  id: 'ipamAssetDiscovery',
  name: 'IPAM / Asset Discovery',
  question: 'Discover VNets, subnets, VMs, IP addresses?',
  roles: [
    { name: 'Reader', builtIn: true, scope: 'subscription' }
  ],
  rationale: {
    'Reader': 'Read-only access to all Azure resources for network topology and IP address discovery'
  },
  terraform: `data "azurerm_subscription" "current" {}

data "azurerm_role_definition" "reader" {
  name  = "Reader"
  scope = data.azurerm_subscription.current.id
}

resource "azurerm_role_assignment" "infoblox_uddi_reader" {
  scope              = data.azurerm_subscription.current.id
  role_definition_id = data.azurerm_role_definition.reader.role_definition_id
  principal_id       = var.infoblox_service_principal_id
}`,
  setupGuide: `1. In Azure Portal, navigate to Azure Active Directory > App registrations.
2. Register a new application (or use an existing one) for Infoblox Universal DDI.
3. Create a client secret under Certificates & secrets and note the value.
4. Navigate to Subscriptions > select your subscription > Access control (IAM).
5. Click "Add role assignment", select the "Reader" role.
6. Assign it to the application (service principal) registered in step 2.
7. In the Infoblox Portal, configure the Azure connection with the Tenant ID, Client ID, and Client Secret.`
};

const publicDnsReadOnly = {
  id: 'publicDnsReadOnly',
  name: 'Public DNS - Read-Only',
  question: 'Sync public DNS zones?',
  subQuestion: 'Read-only',
  roles: [
    {
      name: 'Reader',
      builtIn: true,
      scope: 'subscription',
      note: 'Covered by Reader role — no additional assignment needed if IPAM/Asset Discovery is also selected'
    }
  ],
  rationale: {
    'Reader': 'Read-only access includes DNS zone enumeration and record listing'
  },
  terraform: `# Reader role covers public DNS read-only — no additional assignment needed
# If IPAM/Asset Discovery is also selected, the Reader role is already assigned.

data "azurerm_subscription" "current" {}

data "azurerm_role_definition" "reader" {
  name  = "Reader"
  scope = data.azurerm_subscription.current.id
}

resource "azurerm_role_assignment" "infoblox_uddi_reader" {
  scope              = data.azurerm_subscription.current.id
  role_definition_id = data.azurerm_role_definition.reader.role_definition_id
  principal_id       = var.infoblox_service_principal_id
}`,
  setupGuide: `1. The Reader role covers public DNS read-only access (zone enumeration and record listing).
2. If you have already assigned the Reader role for IPAM/Asset Discovery, no additional step is needed.
3. Otherwise, navigate to Subscriptions > your subscription > Access control (IAM).
4. Click "Add role assignment", select the "Reader" role.
5. Assign it to the Infoblox Universal DDI service principal.`
};

const publicDnsReadWrite = {
  id: 'publicDnsReadWrite',
  name: 'Public DNS - Read-Write',
  question: 'Sync public DNS zones?',
  subQuestion: 'Read-write (bidirectional)',
  roles: [
    { name: 'Reader', builtIn: true, scope: 'subscription' },
    { name: 'DNS Zone Contributor', builtIn: true, scope: 'subscription' }
  ],
  rationale: {
    'Reader': 'Read-only access to discover existing DNS zones and records',
    'DNS Zone Contributor': 'Create, update, and delete DNS zones and records for bidirectional sync'
  },
  terraform: `data "azurerm_subscription" "current" {}

data "azurerm_role_definition" "reader" {
  name  = "Reader"
  scope = data.azurerm_subscription.current.id
}

data "azurerm_role_definition" "dns_zone_contributor" {
  name  = "DNS Zone Contributor"
  scope = data.azurerm_subscription.current.id
}

resource "azurerm_role_assignment" "infoblox_uddi_reader" {
  scope              = data.azurerm_subscription.current.id
  role_definition_id = data.azurerm_role_definition.reader.role_definition_id
  principal_id       = var.infoblox_service_principal_id
}

resource "azurerm_role_assignment" "infoblox_uddi_dns_zone_contributor" {
  scope              = data.azurerm_subscription.current.id
  role_definition_id = data.azurerm_role_definition.dns_zone_contributor.role_definition_id
  principal_id       = var.infoblox_service_principal_id
}`,
  setupGuide: `1. Navigate to Subscriptions > your subscription > Access control (IAM).
2. Click "Add role assignment" and select the "Reader" role.
3. Assign it to the Infoblox Universal DDI service principal.
4. Click "Add role assignment" again and select the "DNS Zone Contributor" role.
5. Assign it to the same service principal.
6. The Reader role provides discovery of existing zones; DNS Zone Contributor enables creating, updating, and deleting DNS zones and records.`
};

const privateDns = {
  id: 'privateDns',
  name: 'Private DNS Sync',
  question: 'Sync private DNS zones?',
  roles: [
    { name: 'Private DNS Zone Contributor', builtIn: true, scope: 'subscription' }
  ],
  rationale: {
    'Private DNS Zone Contributor': 'Manage private DNS zones and records for internal name resolution sync'
  },
  terraform: `data "azurerm_subscription" "current" {}

data "azurerm_role_definition" "private_dns_zone_contributor" {
  name  = "Private DNS Zone Contributor"
  scope = data.azurerm_subscription.current.id
}

resource "azurerm_role_assignment" "infoblox_uddi_private_dns_zone_contributor" {
  scope              = data.azurerm_subscription.current.id
  role_definition_id = data.azurerm_role_definition.private_dns_zone_contributor.role_definition_id
  principal_id       = var.infoblox_service_principal_id
}`,
  setupGuide: `1. Navigate to Subscriptions > your subscription > Access control (IAM).
2. Click "Add role assignment" and select the "Private DNS Zone Contributor" role.
3. Assign it to the Infoblox Universal DDI service principal.
4. This role allows managing private DNS zones and their records for internal name resolution sync.`
};

const cloudForwardingDiscovery = {
  id: 'cloudForwardingDiscovery',
  name: 'Cloud Forwarding - Discovery Only',
  question: 'Manage Azure DNS Private Resolvers?',
  subQuestion: 'Discovery only',
  roles: [],
  customRole: {
    name: 'Infoblox UDDI - DNS Resolver Discovery',
    permissions: [
      'Microsoft.Network/dnsResolvers/read',
      'Microsoft.Network/dnsResolvers/inboundEndpoints/read',
      'Microsoft.Network/dnsResolvers/outboundEndpoints/read',
      'Microsoft.Network/dnsForwardingRulesets/read',
      'Microsoft.Network/dnsForwardingRulesets/forwardingRules/read',
      'Microsoft.Network/dnsForwardingRulesets/virtualNetworkLinks/read'
    ],
    scope: 'subscription'
  },
  rationale: {
    'Microsoft.Network/dnsResolvers/read': 'List and read DNS Private Resolver instances',
    'Microsoft.Network/dnsResolvers/inboundEndpoints/read': 'Read inbound endpoint configurations',
    'Microsoft.Network/dnsResolvers/outboundEndpoints/read': 'Read outbound endpoint configurations',
    'Microsoft.Network/dnsForwardingRulesets/read': 'List and read DNS forwarding rulesets',
    'Microsoft.Network/dnsForwardingRulesets/forwardingRules/read': 'Read individual forwarding rules',
    'Microsoft.Network/dnsForwardingRulesets/virtualNetworkLinks/read': 'Read VNet links associated with forwarding rulesets'
  },
  terraform: `data "azurerm_subscription" "current" {}

resource "azurerm_role_definition" "infoblox_uddi_dns_resolver_discovery" {
  name        = "Infoblox UDDI - DNS Resolver Discovery"
  scope       = data.azurerm_subscription.current.id
  description = "Infoblox Universal DDI - Read-only access to DNS Private Resolvers and forwarding rulesets"

  permissions {
    actions = [
      "Microsoft.Network/dnsResolvers/read",
      "Microsoft.Network/dnsResolvers/inboundEndpoints/read",
      "Microsoft.Network/dnsResolvers/outboundEndpoints/read",
      "Microsoft.Network/dnsForwardingRulesets/read",
      "Microsoft.Network/dnsForwardingRulesets/forwardingRules/read",
      "Microsoft.Network/dnsForwardingRulesets/virtualNetworkLinks/read"
    ]
    not_actions = []
  }

  assignable_scopes = [
    data.azurerm_subscription.current.id
  ]
}

resource "azurerm_role_assignment" "infoblox_uddi_dns_resolver_discovery" {
  scope              = data.azurerm_subscription.current.id
  role_definition_id = azurerm_role_definition.infoblox_uddi_dns_resolver_discovery.role_definition_resource_id
  principal_id       = var.infoblox_service_principal_id
}`,
  setupGuide: `1. Navigate to Subscriptions > your subscription > Access control (IAM) > Roles.
2. Click "Add custom role" and name it "Infoblox UDDI - DNS Resolver Discovery".
3. Under Permissions, click "Add permissions" and add the following actions:
   - Microsoft.Network/dnsResolvers/read
   - Microsoft.Network/dnsResolvers/inboundEndpoints/read
   - Microsoft.Network/dnsResolvers/outboundEndpoints/read
   - Microsoft.Network/dnsForwardingRulesets/read
   - Microsoft.Network/dnsForwardingRulesets/forwardingRules/read
   - Microsoft.Network/dnsForwardingRulesets/virtualNetworkLinks/read
4. Set the assignable scope to the target subscription.
5. Create the custom role.
6. Go back to Access control (IAM) > Add role assignment.
7. Select the "Infoblox UDDI - DNS Resolver Discovery" custom role.
8. Assign it to the Infoblox Universal DDI service principal.

Alternatively, use Azure CLI:
az role definition create --role-definition '{
  "Name": "Infoblox UDDI - DNS Resolver Discovery",
  "Actions": [
    "Microsoft.Network/dnsResolvers/read",
    "Microsoft.Network/dnsResolvers/inboundEndpoints/read",
    "Microsoft.Network/dnsResolvers/outboundEndpoints/read",
    "Microsoft.Network/dnsForwardingRulesets/read",
    "Microsoft.Network/dnsForwardingRulesets/forwardingRules/read",
    "Microsoft.Network/dnsForwardingRulesets/virtualNetworkLinks/read"
  ],
  "AssignableScopes": ["/subscriptions/<SUBSCRIPTION_ID>"]
}'

az role assignment create --assignee <SP_ID> --role "Infoblox UDDI - DNS Resolver Discovery" --scope /subscriptions/<SUBSCRIPTION_ID>`
};

const cloudForwardingFull = {
  id: 'cloudForwardingFull',
  name: 'Cloud Forwarding - Full Management',
  question: 'Manage Azure DNS Private Resolvers?',
  subQuestion: 'Full management',
  roles: [],
  customRole: {
    name: 'Infoblox UDDI - DNS Resolver Full Management',
    permissions: [
      'Microsoft.Network/dnsResolvers/read',
      'Microsoft.Network/dnsResolvers/write',
      'Microsoft.Network/dnsResolvers/delete',
      'Microsoft.Network/dnsResolvers/join/action',
      'Microsoft.Network/dnsResolvers/inboundEndpoints/read',
      'Microsoft.Network/dnsResolvers/inboundEndpoints/write',
      'Microsoft.Network/dnsResolvers/inboundEndpoints/delete',
      'Microsoft.Network/dnsResolvers/outboundEndpoints/read',
      'Microsoft.Network/dnsResolvers/outboundEndpoints/write',
      'Microsoft.Network/dnsResolvers/outboundEndpoints/delete',
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
      'Microsoft.Network/virtualNetworks/join/action'
    ],
    scope: 'subscription'
  },
  rationale: {
    'Microsoft.Network/dnsResolvers/read': 'List and read DNS Private Resolver instances',
    'Microsoft.Network/dnsResolvers/write': 'Create and update DNS Private Resolver instances',
    'Microsoft.Network/dnsResolvers/delete': 'Delete DNS Private Resolver instances',
    'Microsoft.Network/dnsResolvers/join/action': 'Join DNS Private Resolvers to virtual networks',
    'Microsoft.Network/dnsResolvers/inboundEndpoints/read': 'Read inbound endpoint configurations',
    'Microsoft.Network/dnsResolvers/inboundEndpoints/write': 'Create and update inbound endpoints',
    'Microsoft.Network/dnsResolvers/inboundEndpoints/delete': 'Delete inbound endpoints',
    'Microsoft.Network/dnsResolvers/outboundEndpoints/read': 'Read outbound endpoint configurations',
    'Microsoft.Network/dnsResolvers/outboundEndpoints/write': 'Create and update outbound endpoints',
    'Microsoft.Network/dnsResolvers/outboundEndpoints/delete': 'Delete outbound endpoints',
    'Microsoft.Network/dnsForwardingRulesets/read': 'List and read DNS forwarding rulesets',
    'Microsoft.Network/dnsForwardingRulesets/write': 'Create and update DNS forwarding rulesets',
    'Microsoft.Network/dnsForwardingRulesets/delete': 'Delete DNS forwarding rulesets',
    'Microsoft.Network/dnsForwardingRulesets/join/action': 'Join forwarding rulesets to outbound endpoints',
    'Microsoft.Network/dnsForwardingRulesets/forwardingRules/read': 'Read individual forwarding rules',
    'Microsoft.Network/dnsForwardingRulesets/forwardingRules/write': 'Create and update forwarding rules',
    'Microsoft.Network/dnsForwardingRulesets/forwardingRules/delete': 'Delete forwarding rules',
    'Microsoft.Network/dnsForwardingRulesets/virtualNetworkLinks/read': 'Read VNet links associated with forwarding rulesets',
    'Microsoft.Network/dnsForwardingRulesets/virtualNetworkLinks/write': 'Create and update VNet links for forwarding rulesets',
    'Microsoft.Network/dnsForwardingRulesets/virtualNetworkLinks/delete': 'Delete VNet links from forwarding rulesets',
    'Microsoft.Network/virtualNetworks/join/action': 'Allow resolvers to attach to virtual networks'
  },
  terraform: `data "azurerm_subscription" "current" {}

resource "azurerm_role_definition" "infoblox_uddi_dns_resolver_full" {
  name        = "Infoblox UDDI - DNS Resolver Full Management"
  scope       = data.azurerm_subscription.current.id
  description = "Infoblox Universal DDI - Full management of DNS Private Resolvers, forwarding rulesets, and VNet links"

  permissions {
    actions = [
      "Microsoft.Network/dnsResolvers/read",
      "Microsoft.Network/dnsResolvers/write",
      "Microsoft.Network/dnsResolvers/delete",
      "Microsoft.Network/dnsResolvers/join/action",
      "Microsoft.Network/dnsResolvers/inboundEndpoints/read",
      "Microsoft.Network/dnsResolvers/inboundEndpoints/write",
      "Microsoft.Network/dnsResolvers/inboundEndpoints/delete",
      "Microsoft.Network/dnsResolvers/outboundEndpoints/read",
      "Microsoft.Network/dnsResolvers/outboundEndpoints/write",
      "Microsoft.Network/dnsResolvers/outboundEndpoints/delete",
      "Microsoft.Network/dnsForwardingRulesets/read",
      "Microsoft.Network/dnsForwardingRulesets/write",
      "Microsoft.Network/dnsForwardingRulesets/delete",
      "Microsoft.Network/dnsForwardingRulesets/join/action",
      "Microsoft.Network/dnsForwardingRulesets/forwardingRules/read",
      "Microsoft.Network/dnsForwardingRulesets/forwardingRules/write",
      "Microsoft.Network/dnsForwardingRulesets/forwardingRules/delete",
      "Microsoft.Network/dnsForwardingRulesets/virtualNetworkLinks/read",
      "Microsoft.Network/dnsForwardingRulesets/virtualNetworkLinks/write",
      "Microsoft.Network/dnsForwardingRulesets/virtualNetworkLinks/delete",
      "Microsoft.Network/virtualNetworks/join/action"
    ]
    not_actions = []
  }

  assignable_scopes = [
    data.azurerm_subscription.current.id
  ]
}

resource "azurerm_role_assignment" "infoblox_uddi_dns_resolver_full" {
  scope              = data.azurerm_subscription.current.id
  role_definition_id = azurerm_role_definition.infoblox_uddi_dns_resolver_full.role_definition_resource_id
  principal_id       = var.infoblox_service_principal_id
}`,
  setupGuide: `1. Navigate to Subscriptions > your subscription > Access control (IAM) > Roles.
2. Click "Add custom role" and name it "Infoblox UDDI - DNS Resolver Full Management".
3. Under Permissions, click "Add permissions" and add all 21 actions:
   - Microsoft.Network/dnsResolvers/read, write, delete, join/action
   - Microsoft.Network/dnsResolvers/inboundEndpoints/read, write, delete
   - Microsoft.Network/dnsResolvers/outboundEndpoints/read, write, delete
   - Microsoft.Network/dnsForwardingRulesets/read, write, delete, join/action
   - Microsoft.Network/dnsForwardingRulesets/forwardingRules/read, write, delete
   - Microsoft.Network/dnsForwardingRulesets/virtualNetworkLinks/read, write, delete
   - Microsoft.Network/virtualNetworks/join/action
4. Set the assignable scope to the target subscription.
5. Create the custom role.
6. Go back to Access control (IAM) > Add role assignment.
7. Select the "Infoblox UDDI - DNS Resolver Full Management" custom role.
8. Assign it to the Infoblox Universal DDI service principal.

Alternatively, use Azure CLI:
az role definition create --role-definition '{
  "Name": "Infoblox UDDI - DNS Resolver Full Management",
  "Actions": [
    "Microsoft.Network/dnsResolvers/read",
    "Microsoft.Network/dnsResolvers/write",
    "Microsoft.Network/dnsResolvers/delete",
    "Microsoft.Network/dnsResolvers/join/action",
    "Microsoft.Network/dnsResolvers/inboundEndpoints/read",
    "Microsoft.Network/dnsResolvers/inboundEndpoints/write",
    "Microsoft.Network/dnsResolvers/inboundEndpoints/delete",
    "Microsoft.Network/dnsResolvers/outboundEndpoints/read",
    "Microsoft.Network/dnsResolvers/outboundEndpoints/write",
    "Microsoft.Network/dnsResolvers/outboundEndpoints/delete",
    "Microsoft.Network/dnsForwardingRulesets/read",
    "Microsoft.Network/dnsForwardingRulesets/write",
    "Microsoft.Network/dnsForwardingRulesets/delete",
    "Microsoft.Network/dnsForwardingRulesets/join/action",
    "Microsoft.Network/dnsForwardingRulesets/forwardingRules/read",
    "Microsoft.Network/dnsForwardingRulesets/forwardingRules/write",
    "Microsoft.Network/dnsForwardingRulesets/forwardingRules/delete",
    "Microsoft.Network/dnsForwardingRulesets/virtualNetworkLinks/read",
    "Microsoft.Network/dnsForwardingRulesets/virtualNetworkLinks/write",
    "Microsoft.Network/dnsForwardingRulesets/virtualNetworkLinks/delete",
    "Microsoft.Network/virtualNetworks/join/action"
  ],
  "AssignableScopes": ["/subscriptions/<SUBSCRIPTION_ID>"]
}'

az role assignment create --assignee <SP_ID> --role "Infoblox UDDI - DNS Resolver Full Management" --scope /subscriptions/<SUBSCRIPTION_ID>`
};

const multiSubscription = {
  id: 'multiSubscription',
  name: 'Multi-Subscription',
  question: 'Discover across multiple subscriptions?',
  guidance: true,
  roles: [],
  rationale: {
    'Management Group Scope': 'Assigning roles at management group level grants access to all subscriptions within that group'
  },
  terraform: `# Multi-subscription: Assign roles at management group scope instead of subscription scope.
# This grants access to all subscriptions within the management group.

data "azurerm_management_group" "target" {
  name = var.management_group_name
}

# Example: Assign Reader role at management group scope
data "azurerm_role_definition" "reader" {
  name  = "Reader"
  scope = data.azurerm_management_group.target.id
}

resource "azurerm_role_assignment" "infoblox_uddi_reader_mg" {
  scope              = data.azurerm_management_group.target.id
  role_definition_id = data.azurerm_role_definition.reader.role_definition_id
  principal_id       = var.infoblox_service_principal_id
}

# Repeat for additional roles (DNS Zone Contributor, Private DNS Zone Contributor, etc.)
# by changing the role definition data source and assignment resource name.`,
  setupGuide: `Multi-subscription discovery can be configured in two ways:

Option 1: Per-subscription assignment
1. Repeat the role assignments (Reader, DNS Zone Contributor, etc.) in each subscription individually.
2. Navigate to each subscription's Access control (IAM) and add the required roles.

Option 2: Management group scope (recommended for many subscriptions)
1. Navigate to Management groups in the Azure Portal.
2. Select the management group that contains your target subscriptions.
3. Go to Access control (IAM) > Add role assignment.
4. Assign the required roles (Reader, DNS Zone Contributor, etc.) to the Infoblox Universal DDI service principal at the management group scope.
5. This grants access to all subscriptions within the management group.

Azure CLI example (management group scope):
az role assignment create --assignee <SP_ID> --role "Reader" --scope /providers/Microsoft.Management/managementGroups/<MG_ID>
az role assignment create --assignee <SP_ID> --role "DNS Zone Contributor" --scope /providers/Microsoft.Management/managementGroups/<MG_ID>`
};

/**
 * All Azure feature categories for the UDDI Permission Scope Helper.
 *
 * Keys are feature IDs, values contain roles (built-in), customRole (for Cloud Forwarding),
 * terraform HCL, setupGuide text, and per-role/permission rationale.
 * Public DNS and Cloud Forwarding have sub-feature variants as separate entries.
 * Multi-Subscription provides guidance for management group scope assignments.
 */
export const AZURE_FEATURES = {
  ipamAssetDiscovery,
  publicDnsReadOnly,
  publicDnsReadWrite,
  privateDns,
  cloudForwardingDiscovery,
  cloudForwardingFull,
  multiSubscription
};

/**
 * Merge and deduplicate built-in roles from selected Azure feature IDs.
 *
 * Collects all roles[] entries from selected features, deduplicates by role
 * name, and returns an array of unique { name, builtIn, scope } objects.
 * Features with empty roles (cloud forwarding, multi-subscription) contribute
 * nothing to the result.
 *
 * @param {string[]} selectedFeatureIds - Array of feature ID keys from AZURE_FEATURES
 * @returns {Array<{name: string, builtIn: boolean, scope: string}>} Deduplicated roles
 */
export function getAzureRoles(selectedFeatureIds) {
  const seen = new Map();
  for (const id of selectedFeatureIds) {
    const feature = AZURE_FEATURES[id];
    if (feature && Array.isArray(feature.roles)) {
      for (const role of feature.roles) {
        if (!seen.has(role.name)) {
          seen.set(role.name, { name: role.name, builtIn: role.builtIn, scope: role.scope });
        }
      }
    }
  }
  return [...seen.values()];
}

/**
 * Generate Azure CLI commands for role assignments and custom role definitions.
 *
 * Produces `az role assignment create` commands for deduplicated built-in roles,
 * custom role JSON + `az role definition create` for cloud forwarding features,
 * and management group guidance for multi-subscription.
 *
 * @param {string[]} selectedFeatureIds - Array of feature ID keys from AZURE_FEATURES
 * @returns {string} Azure CLI commands string
 */
export function generateAzurePolicy(selectedFeatureIds) {
  const roles = getAzureRoles(selectedFeatureIds);
  const parts = [];

  // Built-in role assignments
  for (const role of roles) {
    parts.push(`az role assignment create \\
  --assignee "<SERVICE_PRINCIPAL_ID>" \\
  --role "${role.name}" \\
  --scope "/subscriptions/<SUBSCRIPTION_ID>"`);
  }

  // Custom roles for cloud forwarding features
  for (const id of selectedFeatureIds) {
    const feature = AZURE_FEATURES[id];
    if (feature && feature.customRole) {
      const cr = feature.customRole;
      const actionsJson = cr.permissions.map(p => `    "${p}"`).join(',\n');
      parts.push(`# Custom Role: ${cr.name}
az role definition create --role-definition '{
  "Name": "${cr.name}",
  "Description": "Infoblox Universal DDI custom role",
  "Actions": [
${actionsJson}
  ],
  "AssignableScopes": ["/subscriptions/<SUBSCRIPTION_ID>"]
}'

az role assignment create \\
  --assignee "<SERVICE_PRINCIPAL_ID>" \\
  --role "${cr.name}" \\
  --scope "/subscriptions/<SUBSCRIPTION_ID>"`);
    }
  }

  // Multi-subscription guidance
  if (selectedFeatureIds.includes('multiSubscription')) {
    parts.push(`# Multi-Subscription: Assign roles at management group scope instead of subscription scope.
# Replace --scope with /providers/Microsoft.Management/managementGroups/<MANAGEMENT_GROUP_ID>
# This grants access to all subscriptions within the management group.`);
  }

  return parts.join('\n\n');
}

/**
 * Generate Terraform HCL for Azure role assignments and custom role definitions.
 *
 * Produces azurerm_role_assignment blocks for deduplicated built-in roles,
 * azurerm_role_definition + azurerm_role_assignment for custom roles,
 * and management group scoped resources for multi-subscription.
 *
 * @param {string[]} selectedFeatureIds - Array of feature ID keys from AZURE_FEATURES
 * @returns {string} Terraform HCL string
 */
export function generateAzureTerraform(selectedFeatureIds) {
  const roles = getAzureRoles(selectedFeatureIds);
  const hasCustomRoles = selectedFeatureIds.some(id => AZURE_FEATURES[id]?.customRole);
  const hasMultiSub = selectedFeatureIds.includes('multiSubscription');

  if (roles.length === 0 && !hasCustomRoles && !hasMultiSub) {
    return '';
  }

  const parts = [];

  // Data sources
  parts.push(`data "azurerm_subscription" "current" {}

data "azurerm_client_config" "current" {}`);

  // Built-in role assignments
  for (const role of roles) {
    const resourceName = role.name.toLowerCase().replace(/\s+/g, '_');
    parts.push(`data "azurerm_role_definition" "${resourceName}" {
  name  = "${role.name}"
  scope = data.azurerm_subscription.current.id
}

resource "azurerm_role_assignment" "infoblox_uddi_${resourceName}" {
  scope              = data.azurerm_subscription.current.id
  role_definition_id = data.azurerm_role_definition.${resourceName}.role_definition_id
  principal_id       = data.azurerm_client_config.current.object_id
}`);
  }

  // Custom role definitions for cloud forwarding
  for (const id of selectedFeatureIds) {
    const feature = AZURE_FEATURES[id];
    if (feature && feature.customRole) {
      const cr = feature.customRole;
      const resourceName = cr.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      const actionsHcl = cr.permissions.map(p => `      "${p}"`).join(',\n');
      parts.push(`resource "azurerm_role_definition" "${resourceName}" {
  name        = "${cr.name}"
  scope       = data.azurerm_subscription.current.id
  description = "Infoblox Universal DDI custom role"

  permissions {
    actions = [
${actionsHcl}
    ]
    not_actions = []
  }

  assignable_scopes = [
    data.azurerm_subscription.current.id
  ]
}

resource "azurerm_role_assignment" "${resourceName}" {
  scope              = data.azurerm_subscription.current.id
  role_definition_id = azurerm_role_definition.${resourceName}.role_definition_resource_id
  principal_id       = data.azurerm_client_config.current.object_id
}`);
    }
  }

  // Multi-subscription: management group
  if (hasMultiSub) {
    parts.push(`# Multi-Subscription: Assign roles at management group scope
data "azurerm_management_group" "target" {
  name = var.management_group_name
}

# Assign roles at management group scope instead of subscription scope.
# Repeat for each required role, replacing scope with:
#   data.azurerm_management_group.target.id`);
  }

  return parts.join('\n\n');
}

/**
 * Generate a step-by-step setup guide for selected Azure features.
 *
 * Produces numbered plain text instructions starting with service principal
 * creation, followed by role assignments, and ending with Infoblox Portal
 * configuration.
 *
 * @param {string[]} selectedFeatureIds - Array of feature ID keys from AZURE_FEATURES
 * @returns {string} Plain text guide with numbered steps
 */
export function generateAzureGuide(selectedFeatureIds) {
  const roles = getAzureRoles(selectedFeatureIds);
  const hasCustomRoles = selectedFeatureIds.some(id => AZURE_FEATURES[id]?.customRole);
  const hasMultiSub = selectedFeatureIds.includes('multiSubscription');

  if (roles.length === 0 && !hasCustomRoles && !hasMultiSub) {
    return '';
  }

  const steps = [];
  let stepNum = 1;

  // Step 1: Service principal
  steps.push(`${stepNum}. In Azure Portal, navigate to Azure Active Directory > App registrations and register a new application (or use an existing service principal) for Infoblox Universal DDI.`);
  stepNum++;

  steps.push(`${stepNum}. Create a client secret under Certificates & secrets and note the Tenant ID, Client ID, and Client Secret.`);
  stepNum++;

  // Built-in role assignments
  if (roles.length > 0) {
    steps.push(`${stepNum}. Navigate to Subscriptions > your subscription > Access control (IAM).`);
    stepNum++;

    for (const role of roles) {
      steps.push(`${stepNum}. Click "Add role assignment" and assign the "${role.name}" role to the service principal.`);
      stepNum++;
    }
  }

  // Custom role creation
  for (const id of selectedFeatureIds) {
    const feature = AZURE_FEATURES[id];
    if (feature && feature.customRole) {
      const cr = feature.customRole;
      steps.push(`${stepNum}. Create a custom role named "${cr.name}" with ${cr.permissions.length} permissions (see policy output for the full list).`);
      stepNum++;
      steps.push(`${stepNum}. Assign the custom role "${cr.name}" to the service principal.`);
      stepNum++;
    }
  }

  // Multi-subscription guidance
  if (hasMultiSub) {
    steps.push(`${stepNum}. For multi-subscription access, assign roles at the management group scope instead of individual subscriptions.`);
    stepNum++;
    steps.push(`${stepNum}. Navigate to Management groups > select the target group > Access control (IAM) and add the required role assignments.`);
    stepNum++;
  }

  // Final step: Infoblox Portal
  steps.push(`${stepNum}. Configure the Azure connection credentials (Tenant ID, Client ID, Client Secret) in the Infoblox Portal.`);

  return steps.join('\n');
}
