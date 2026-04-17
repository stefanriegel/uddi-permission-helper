/**
 * Azure permission data for UDDI Permission Scope Helper.
 *
 * Feature categories with built-in role assignments and/or custom role
 * definitions, Terraform HCL templates, setup guides, and per-role/permission
 * rationale strings. All data sourced from the Infoblox Universal DDI Admin Guide.
 *
 * Azure uses a role-based model:
 * - Discovery/asset features (network, compute, storage, monitoring) use the
 *   built-in **Reader** role which grants read-only access to view all resources.
 * - DNS sync uses built-in **DNS Zone Contributor** / **Private DNS Zone
 *   Contributor** for write access, plus Reader for read access, and a custom
 *   role for resource group management.
 * - Cloud Forwarding uses custom roles scoped to DNS Private Resolver and
 *   forwarding ruleset permissions.
 */

const readerTerraform = `data "azurerm_subscription" "current" {}

data "azurerm_role_definition" "reader" {
  name  = "Reader"
  scope = data.azurerm_subscription.current.id
}

resource "azurerm_role_assignment" "infoblox_uddi_reader" {
  scope              = data.azurerm_subscription.current.id
  role_definition_id = data.azurerm_role_definition.reader.role_definition_id
  principal_id       = var.infoblox_service_principal_id
}`;

const readerSetupGuide = `1. Navigate to Subscriptions > your subscription > Access control (IAM).
2. Click "Add role assignment" and select the "Reader" built-in role.
3. Assign it to the Infoblox Universal DDI service principal.
4. The Reader role grants read-only access to view all resources in the subscription.`;

const vnetNetworkDiscovery = {
  id: 'vnetNetworkDiscovery',
  product: 'assetInsight',
  name: 'VNet / Network Discovery',
  question: 'Discover VNets, subnets, network topology?',
  roles: [
    { name: 'Reader', builtIn: true, scope: 'subscription' }
  ],
  rationale: {
    'Reader': 'Grants read-only access to view all resources — covers VNets, subnets, NICs, public IPs, NSGs, route tables, and all other network resource types'
  },
  terraform: readerTerraform,
  setupGuide: readerSetupGuide
};

const computeDiscovery = {
  id: 'computeDiscovery',
  product: 'assetInsight',
  name: 'Compute Discovery',
  question: 'VMs, disks, VM Scale Sets?',
  roles: [
    { name: 'Reader', builtIn: true, scope: 'subscription' }
  ],
  rationale: {
    'Reader': 'Grants read-only access to view all resources — covers VMs, VM Scale Sets, managed disks, and compute configurations'
  },
  terraform: readerTerraform,
  setupGuide: readerSetupGuide
};

const storageDiscovery = {
  id: 'storageDiscovery',
  product: 'assetInsight',
  name: 'Storage Discovery',
  question: 'Discover storage accounts and containers?',
  roles: [
    { name: 'Reader', builtIn: true, scope: 'subscription' }
  ],
  rationale: {
    'Reader': 'Grants read-only access to view all resources — covers storage accounts and blob containers'
  },
  terraform: readerTerraform,
  setupGuide: readerSetupGuide
};

const azureMonitoringStats = {
  id: 'azureMonitoringStats',
  product: 'assetInsight',
  name: 'Monitoring Stats',
  question: 'Discover VM monitoring metrics?',
  roles: [
    { name: 'Reader', builtIn: true, scope: 'subscription' }
  ],
  rationale: {
    'Reader': 'Grants read-only access to view all resources — covers monitoring metrics and resource health data'
  },
  terraform: readerTerraform,
  setupGuide: readerSetupGuide
};

const publicDnsReadOnly = {
  id: 'publicDnsReadOnly',
  product: 'ddi',
  name: 'Public DNS - Read-Only',
  question: 'Sync public DNS zones?',
  subQuestion: 'Read-only',
  roles: [
    { name: 'Reader', builtIn: true, scope: 'subscription' }
  ],
  rationale: {
    'Reader': 'Grants read-only access to view all resources — covers public and private DNS zones and record sets'
  },
  terraform: readerTerraform,
  setupGuide: `1. Navigate to Subscriptions > your subscription > Access control (IAM).
2. Click "Add role assignment" and select the "Reader" built-in role.
3. Assign it to the Infoblox Universal DDI service principal.
4. The Reader role grants read-only access to all DNS zones and records in the subscription.`
};

const publicDnsReadWrite = {
  id: 'publicDnsReadWrite',
  product: 'ddi',
  name: 'Public DNS - Read-Write',
  question: 'Sync public DNS zones?',
  subQuestion: 'Read-write (bidirectional)',
  roles: [
    { name: 'Reader', builtIn: true, scope: 'subscription' },
    { name: 'DNS Zone Contributor', builtIn: true, scope: 'subscription' }
  ],
  customRole: {
    name: 'Infoblox UDDI - Resource Group Management',
    permissions: [
      'Microsoft.Resources/subscriptions/resourceGroups/write',
      'Microsoft.Resources/subscriptions/resourceGroups/delete'
    ],
    scope: 'subscription'
  },
  rationale: {
    'Reader': 'Grants read-only access to view all resources — covers discovery of existing DNS zones and records',
    'DNS Zone Contributor': 'Create, update, and delete public DNS zones and records for bidirectional sync',
    'Microsoft.Resources/subscriptions/resourceGroups/write': 'Create resource groups for DNS zone management',
    'Microsoft.Resources/subscriptions/resourceGroups/delete': 'Delete resource groups during DNS zone cleanup'
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
}

data "azurerm_role_definition" "dns_zone_contributor" {
  name  = "DNS Zone Contributor"
  scope = data.azurerm_subscription.current.id
}

resource "azurerm_role_assignment" "infoblox_uddi_dns_zone_contributor" {
  scope              = data.azurerm_subscription.current.id
  role_definition_id = data.azurerm_role_definition.dns_zone_contributor.role_definition_id
  principal_id       = var.infoblox_service_principal_id
}

resource "azurerm_role_definition" "infoblox_uddi_resource_group_mgmt" {
  name        = "Infoblox UDDI - Resource Group Management"
  scope       = data.azurerm_subscription.current.id
  description = "Infoblox Universal DDI - Resource group write and delete for DNS zone management"

  permissions {
    actions = [
      "Microsoft.Resources/subscriptions/resourceGroups/write",
      "Microsoft.Resources/subscriptions/resourceGroups/delete"
    ]
    not_actions = []
  }

  assignable_scopes = [
    data.azurerm_subscription.current.id
  ]
}

resource "azurerm_role_assignment" "infoblox_uddi_resource_group_mgmt" {
  scope              = data.azurerm_subscription.current.id
  role_definition_id = azurerm_role_definition.infoblox_uddi_resource_group_mgmt.role_definition_resource_id
  principal_id       = var.infoblox_service_principal_id
}`,
  setupGuide: `1. Navigate to Subscriptions > your subscription > Access control (IAM).
2. Click "Add role assignment" and assign the "Reader" built-in role to the service principal.
3. Click "Add role assignment" again and assign the "DNS Zone Contributor" built-in role to the same service principal.
4. Create a custom role named "Infoblox UDDI - Resource Group Management" with 2 permissions: Microsoft.Resources/subscriptions/resourceGroups/write and Microsoft.Resources/subscriptions/resourceGroups/delete.
5. Assign the custom role to the service principal.
6. Reader provides discovery of existing zones; DNS Zone Contributor enables creating, updating, and deleting DNS zones and records; the custom role allows resource group management.`
};

const privateDns = {
  id: 'privateDns',
  product: 'ddi',
  name: 'Private DNS Sync',
  question: 'Sync private DNS zones?',
  roles: [
    { name: 'Reader', builtIn: true, scope: 'subscription' },
    { name: 'Private DNS Zone Contributor', builtIn: true, scope: 'subscription' }
  ],
  customRole: {
    name: 'Infoblox UDDI - Resource Group Management',
    permissions: [
      'Microsoft.Resources/subscriptions/resourceGroups/write',
      'Microsoft.Resources/subscriptions/resourceGroups/delete'
    ],
    scope: 'subscription'
  },
  rationale: {
    'Reader': 'Grants read-only access to view all resources — covers discovery of private DNS zones and records',
    'Private DNS Zone Contributor': 'Write access to private DNS zones and records for bidirectional sync',
    'Microsoft.Resources/subscriptions/resourceGroups/write': 'Create resource groups for DNS zone management',
    'Microsoft.Resources/subscriptions/resourceGroups/delete': 'Delete resource groups during DNS zone cleanup'
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
}

data "azurerm_role_definition" "private_dns_zone_contributor" {
  name  = "Private DNS Zone Contributor"
  scope = data.azurerm_subscription.current.id
}

resource "azurerm_role_assignment" "infoblox_uddi_private_dns_zone_contributor" {
  scope              = data.azurerm_subscription.current.id
  role_definition_id = data.azurerm_role_definition.private_dns_zone_contributor.role_definition_id
  principal_id       = var.infoblox_service_principal_id
}

resource "azurerm_role_definition" "infoblox_uddi_resource_group_mgmt" {
  name        = "Infoblox UDDI - Resource Group Management"
  scope       = data.azurerm_subscription.current.id
  description = "Infoblox Universal DDI - Resource group write and delete for DNS zone management"

  permissions {
    actions = [
      "Microsoft.Resources/subscriptions/resourceGroups/write",
      "Microsoft.Resources/subscriptions/resourceGroups/delete"
    ]
    not_actions = []
  }

  assignable_scopes = [
    data.azurerm_subscription.current.id
  ]
}

resource "azurerm_role_assignment" "infoblox_uddi_resource_group_mgmt" {
  scope              = data.azurerm_subscription.current.id
  role_definition_id = azurerm_role_definition.infoblox_uddi_resource_group_mgmt.role_definition_resource_id
  principal_id       = var.infoblox_service_principal_id
}`,
  setupGuide: `1. Navigate to Subscriptions > your subscription > Access control (IAM).
2. Click "Add role assignment" and assign the "Reader" built-in role to the service principal.
3. Click "Add role assignment" again and assign the "Private DNS Zone Contributor" built-in role to the same service principal.
4. Create a custom role named "Infoblox UDDI - Resource Group Management" with 2 permissions: Microsoft.Resources/subscriptions/resourceGroups/write and Microsoft.Resources/subscriptions/resourceGroups/delete.
5. Assign the custom role to the service principal.
6. Reader provides discovery of private DNS zones; Private DNS Zone Contributor enables creating, updating, and deleting private DNS zones and records; the custom role allows resource group management.`
};

const cloudForwardingDiscovery = {
  id: 'cloudForwardingDiscovery',
  product: 'ddi',
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
  product: 'ddi',
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
    scope: 'subscription'
  },
  rationale: {
    'Microsoft.Network/dnsResolvers/read': 'List and read DNS Private Resolver instances',
    'Microsoft.Network/dnsResolvers/write': 'Create and update DNS Private Resolver instances',
    'Microsoft.Network/dnsResolvers/delete': 'Delete DNS Private Resolver instances',
    'Microsoft.Network/dnsResolvers/outboundEndpoints/read': 'Read outbound endpoint configurations',
    'Microsoft.Network/dnsResolvers/outboundEndpoints/write': 'Create and update outbound endpoints',
    'Microsoft.Network/dnsResolvers/outboundEndpoints/delete': 'Delete outbound endpoints',
    'Microsoft.Network/dnsResolvers/outboundEndpoints/join/action': 'Join outbound endpoints to forwarding rulesets',
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
    'Microsoft.Network/virtualNetworks/read': 'List virtual networks for resolver placement',
    'Microsoft.Network/virtualNetworks/listDnsResolvers/action': 'List DNS resolvers associated with virtual networks',
    'Microsoft.Network/virtualNetworks/subnets/read': 'Read subnet configurations for resolver endpoint placement',
    'Microsoft.Network/virtualNetworks/subnets/join/action': 'Join resolver endpoints to virtual network subnets'
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
      "Microsoft.Network/dnsResolvers/outboundEndpoints/read",
      "Microsoft.Network/dnsResolvers/outboundEndpoints/write",
      "Microsoft.Network/dnsResolvers/outboundEndpoints/delete",
      "Microsoft.Network/dnsResolvers/outboundEndpoints/join/action",
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
      "Microsoft.Network/virtualNetworks/read",
      "Microsoft.Network/virtualNetworks/listDnsResolvers/action",
      "Microsoft.Network/virtualNetworks/subnets/read",
      "Microsoft.Network/virtualNetworks/subnets/join/action"
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
   - Microsoft.Network/dnsResolvers/read, write, delete
   - Microsoft.Network/dnsResolvers/outboundEndpoints/read, write, delete, join/action
   - Microsoft.Network/dnsForwardingRulesets/read, write, delete, join/action
   - Microsoft.Network/dnsForwardingRulesets/forwardingRules/read, write, delete
   - Microsoft.Network/dnsForwardingRulesets/virtualNetworkLinks/read, write, delete
   - Microsoft.Network/virtualNetworks/read
   - Microsoft.Network/virtualNetworks/listDnsResolvers/action
   - Microsoft.Network/virtualNetworks/subnets/read
   - Microsoft.Network/virtualNetworks/subnets/join/action
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
    "Microsoft.Network/dnsResolvers/outboundEndpoints/read",
    "Microsoft.Network/dnsResolvers/outboundEndpoints/write",
    "Microsoft.Network/dnsResolvers/outboundEndpoints/delete",
    "Microsoft.Network/dnsResolvers/outboundEndpoints/join/action",
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
    "Microsoft.Network/virtualNetworks/read",
    "Microsoft.Network/virtualNetworks/listDnsResolvers/action",
    "Microsoft.Network/virtualNetworks/subnets/read",
    "Microsoft.Network/virtualNetworks/subnets/join/action"
  ],
  "AssignableScopes": ["/subscriptions/<SUBSCRIPTION_ID>"]
}'

az role assignment create --assignee <SP_ID> --role "Infoblox UDDI - DNS Resolver Full Management" --scope /subscriptions/<SUBSCRIPTION_ID>`
};

const multiSubscription = {
  id: 'multiSubscription',
  product: 'both',
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
 * Keys are feature IDs, values contain roles (built-in), customRole (for DNS write
 * and Cloud Forwarding features), terraform HCL, setupGuide text, and per-role/permission
 * rationale. Discovery/asset features use the built-in Reader role. DNS sync features
 * combine Reader with DNS Zone Contributor or Private DNS Zone Contributor plus a custom
 * role for resource group management. Cloud Forwarding uses custom roles for DNS
 * Private Resolver permissions. Multi-Subscription provides guidance for management
 * group scope assignments.
 */
export const AZURE_FEATURES = {
  vnetNetworkDiscovery,
  computeDiscovery,
  storageDiscovery,
  azureMonitoringStats,
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
 * Collect and deduplicate custom roles from selected Azure feature IDs.
 *
 * Multiple features may share the same custom role object (e.g. Resource Group
 * Management is shared by Public DNS Read-Write and Private DNS). This
 * function deduplicates by custom role name.
 *
 * @param {string[]} selectedFeatureIds - Array of feature ID keys from AZURE_FEATURES
 * @returns {Array<{name: string, permissions: string[], scope: string}>} Deduplicated custom roles
 */
export function getAzureCustomRoles(selectedFeatureIds) {
  const seen = new Map();
  for (const id of selectedFeatureIds) {
    const feature = AZURE_FEATURES[id];
    if (feature && feature.customRole) {
      if (!seen.has(feature.customRole.name)) {
        seen.set(feature.customRole.name, feature.customRole);
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

  // Custom roles (Discovery Reader, Cloud Forwarding, etc.) — deduplicated
  const seenCustomRoles = new Set();
  for (const id of selectedFeatureIds) {
    const feature = AZURE_FEATURES[id];
    if (feature && feature.customRole && !seenCustomRoles.has(feature.customRole.name)) {
      seenCustomRoles.add(feature.customRole.name);
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

  // Custom role definitions (Discovery Reader, Cloud Forwarding, etc.) — deduplicated
  const seenCustomRoles = new Set();
  for (const id of selectedFeatureIds) {
    const feature = AZURE_FEATURES[id];
    if (feature && feature.customRole && !seenCustomRoles.has(feature.customRole.name)) {
      seenCustomRoles.add(feature.customRole.name);
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
  steps.push(`${stepNum}. In Azure Portal, navigate to Microsoft Entra ID > App registrations and register a new application (or use an existing service principal) for Infoblox Universal DDI.`);
  stepNum++;

  steps.push(`${stepNum}. Create a client secret under Certificates & secrets and note the Tenant ID, Client (Application) ID, and Client Secret.`);
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

  // Custom role creation — deduplicated
  const seenCustomRoles = new Set();
  for (const id of selectedFeatureIds) {
    const feature = AZURE_FEATURES[id];
    if (feature && feature.customRole && !seenCustomRoles.has(feature.customRole.name)) {
      seenCustomRoles.add(feature.customRole.name);
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
