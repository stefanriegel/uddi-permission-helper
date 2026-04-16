/**
 * GCP permission data for UDDI Permission Scope Helper.
 *
 * Eight feature categories with predefined role bindings and/or custom
 * permission lists, Terraform HCL templates, setup guides, and per-role/
 * permission rationale strings. All data sourced from the Infoblox
 * Universal DDI Admin Guide.
 *
 * GCP uses a hybrid model: predefined roles (like Azure built-in roles)
 * plus custom permissions (like AWS IAM actions). Some features use only
 * predefined roles, some use only custom permissions, and some use both.
 */

const assetDiscovery = {
  id: 'assetDiscovery',
  name: 'Asset Discovery',
  question: 'Discover VMs, disks, networking resources?',
  predefinedRoles: [
    { role: 'roles/compute.viewer', scope: 'project' },
    { role: 'roles/compute.networkViewer', scope: 'project' }
  ],
  customPermissions: [
    'compute.instances.list',
    'compute.instances.get',
    'compute.disks.list',
    'compute.disks.get',
    'compute.networks.list',
    'compute.networks.get',
    'compute.subnetworks.list',
    'compute.subnetworks.get',
    'compute.addresses.list',
    'compute.addresses.get',
    'compute.firewalls.list',
    'compute.firewalls.get',
    'compute.routes.list',
    'compute.routes.get',
    'compute.routers.list',
    'compute.routers.get',
    'compute.forwardingRules.list',
    'compute.forwardingRules.get',
    'compute.globalAddresses.list',
    'compute.globalAddresses.get',
    'compute.globalForwardingRules.list',
    'compute.globalForwardingRules.get',
    'compute.zones.list',
    'compute.regions.list',
    'compute.projects.get'
  ],
  rationale: {
    'roles/compute.viewer': 'Read-only access to Compute Engine resources for VM and disk inventory',
    'roles/compute.networkViewer': 'Read-only access to networking resources for topology discovery',
    'compute.instances.list': 'Enumerate VM instances for asset inventory',
    'compute.instances.get': 'Retrieve VM instance details and metadata',
    'compute.disks.list': 'Enumerate persistent disks across the project',
    'compute.disks.get': 'Retrieve disk size, type, and attachment details',
    'compute.networks.list': 'Enumerate VPC networks for topology mapping',
    'compute.networks.get': 'Retrieve VPC network configuration and peering details',
    'compute.subnetworks.list': 'Enumerate subnets within each VPC network',
    'compute.subnetworks.get': 'Retrieve subnet CIDR ranges and secondary ranges',
    'compute.addresses.list': 'Enumerate reserved IP addresses in the project',
    'compute.addresses.get': 'Retrieve IP address allocation details',
    'compute.firewalls.list': 'Enumerate firewall rules for network access analysis',
    'compute.firewalls.get': 'Retrieve firewall rule priority, direction, and targets',
    'compute.routes.list': 'Enumerate custom routes for routing topology',
    'compute.routes.get': 'Retrieve route next-hop and destination details',
    'compute.routers.list': 'Enumerate Cloud Routers for dynamic routing discovery',
    'compute.routers.get': 'Retrieve Cloud Router BGP and NAT configuration',
    'compute.forwardingRules.list': 'Enumerate regional forwarding rules for load balancing',
    'compute.forwardingRules.get': 'Retrieve forwarding rule target and port configuration',
    'compute.globalAddresses.list': 'Enumerate global IP addresses for global load balancers',
    'compute.globalAddresses.get': 'Retrieve global address allocation details',
    'compute.globalForwardingRules.list': 'Enumerate global forwarding rules for cross-region load balancing',
    'compute.globalForwardingRules.get': 'Retrieve global forwarding rule target proxy configuration',
    'compute.zones.list': 'Enumerate available zones for resource placement context',
    'compute.regions.list': 'Enumerate available regions for multi-region discovery',
    'compute.projects.get': 'Retrieve project-level compute quotas and metadata'
  },
  terraform: `resource "google_project_iam_member" "infoblox_uddi_compute_viewer" {
  project = var.project_id
  role    = "roles/compute.viewer"
  member  = "serviceAccount:\${var.service_account_email}"
}

resource "google_project_iam_member" "infoblox_uddi_network_viewer" {
  project = var.project_id
  role    = "roles/compute.networkViewer"
  member  = "serviceAccount:\${var.service_account_email}"
}`,
  setupGuide: `1. Open the GCP Console and navigate to IAM & Admin > Service Accounts.
2. Create a service account named "infoblox-uddi-discovery" (or use an existing one).
3. Navigate to IAM & Admin > IAM.
4. Click "Grant Access" and add the service account as a principal.
5. Assign the role "Compute Viewer" (roles/compute.viewer).
6. Click "Add Another Role" and assign "Compute Network Viewer" (roles/compute.networkViewer).
7. Click "Save".

Alternatively, use gcloud CLI:
gcloud projects add-iam-policy-binding <PROJECT_ID> \\
  --member="serviceAccount:<SA_EMAIL>" \\
  --role="roles/compute.viewer"

gcloud projects add-iam-policy-binding <PROJECT_ID> \\
  --member="serviceAccount:<SA_EMAIL>" \\
  --role="roles/compute.networkViewer"`
};

const storageBuckets = {
  id: 'storageBuckets',
  name: 'Storage Buckets',
  question: 'Discover storage buckets and IAM policies?',
  predefinedRoles: [],
  customPermissions: [
    'storage.buckets.list',
    'storage.buckets.getIamPolicy'
  ],
  rationale: {
    'storage.buckets.list': 'Enumerate all Cloud Storage buckets in the project',
    'storage.buckets.getIamPolicy': 'Read bucket-level IAM policies for access analysis'
  },
  terraform: `resource "google_project_iam_custom_role" "infoblox_uddi_storage_discovery" {
  project     = var.project_id
  role_id     = "infobloxUddiStorageDiscovery"
  title       = "Infoblox UDDI - Storage Discovery"
  description = "Infoblox Universal DDI - Storage bucket discovery permissions"
  permissions = [
    "storage.buckets.list",
    "storage.buckets.getIamPolicy"
  ]
}

resource "google_project_iam_member" "infoblox_uddi_storage_discovery" {
  project = var.project_id
  role    = google_project_iam_custom_role.infoblox_uddi_storage_discovery.id
  member  = "serviceAccount:\${var.service_account_email}"
}`,
  setupGuide: `1. Open the GCP Console and navigate to IAM & Admin > Roles.
2. Click "Create Role".
3. Name: "Infoblox UDDI - Storage Discovery", ID: "infobloxUddiStorageDiscovery".
4. Click "Add Permissions" and add:
   - storage.buckets.list
   - storage.buckets.getIamPolicy
5. Click "Create".
6. Navigate to IAM & Admin > IAM.
7. Click "Grant Access", add the service account, and assign the custom role.

Alternatively, use gcloud CLI:
gcloud iam roles create infobloxUddiStorageDiscovery \\
  --project=<PROJECT_ID> \\
  --title="Infoblox UDDI - Storage Discovery" \\
  --permissions="storage.buckets.list,storage.buckets.getIamPolicy"

gcloud projects add-iam-policy-binding <PROJECT_ID> \\
  --member="serviceAccount:<SA_EMAIL>" \\
  --role="projects/<PROJECT_ID>/roles/infobloxUddiStorageDiscovery"`
};

const dnsReadOnly = {
  id: 'dnsReadOnly',
  name: 'DNS - Read-Only',
  question: 'Sync Cloud DNS zones?',
  subQuestion: 'Read-only',
  predefinedRoles: [
    { role: 'roles/dns.reader', scope: 'project' }
  ],
  customPermissions: [],
  rationale: {
    'roles/dns.reader': 'Read-only access to Cloud DNS zones and records for one-way sync'
  },
  terraform: `resource "google_project_iam_member" "infoblox_uddi_dns_reader" {
  project = var.project_id
  role    = "roles/dns.reader"
  member  = "serviceAccount:\${var.service_account_email}"
}`,
  setupGuide: `1. Navigate to IAM & Admin > IAM in the GCP Console.
2. Click "Grant Access" and add the service account as a principal.
3. Assign the role "DNS Reader" (roles/dns.reader).
4. Click "Save".

Alternatively, use gcloud CLI:
gcloud projects add-iam-policy-binding <PROJECT_ID> \\
  --member="serviceAccount:<SA_EMAIL>" \\
  --role="roles/dns.reader"`
};

const dnsReadWrite = {
  id: 'dnsReadWrite',
  name: 'DNS - Read-Write',
  question: 'Sync Cloud DNS zones?',
  subQuestion: 'Read-write (bidirectional)',
  predefinedRoles: [
    { role: 'roles/dns.admin', scope: 'project' }
  ],
  customPermissions: [],
  rationale: {
    'roles/dns.admin': 'Full access to Cloud DNS zones and records for bidirectional sync'
  },
  terraform: `resource "google_project_iam_member" "infoblox_uddi_dns_admin" {
  project = var.project_id
  role    = "roles/dns.admin"
  member  = "serviceAccount:\${var.service_account_email}"
}`,
  setupGuide: `1. Navigate to IAM & Admin > IAM in the GCP Console.
2. Click "Grant Access" and add the service account as a principal.
3. Assign the role "DNS Administrator" (roles/dns.admin).
4. Click "Save".

Alternatively, use gcloud CLI:
gcloud projects add-iam-policy-binding <PROJECT_ID> \\
  --member="serviceAccount:<SA_EMAIL>" \\
  --role="roles/dns.admin"`
};

const cloudForwardingInbound = {
  id: 'cloudForwardingInbound',
  name: 'Cloud Forwarding - Inbound',
  question: 'Manage DNS forwarding?',
  subQuestion: 'Inbound',
  predefinedRoles: [],
  customPermissions: [
    'dns.projects.get',
    'compute.networks.get',
    'compute.networks.list',
    'compute.addresses.list',
    'dns.networks.bindPrivateDNSPolicy',
    'dns.policies.get',
    'dns.policies.list',
    'dns.policies.create',
    'dns.policies.update',
    'dns.policies.delete'
  ],
  rationale: {
    'dns.projects.get': 'Read DNS project settings for policy configuration',
    'compute.networks.get': 'Retrieve VPC network details for DNS policy binding',
    'compute.networks.list': 'Enumerate VPC networks available for inbound forwarding',
    'compute.addresses.list': 'List reserved IP addresses for inbound resolver endpoints',
    'dns.networks.bindPrivateDNSPolicy': 'Bind DNS server policies to VPC networks for inbound forwarding',
    'dns.policies.get': 'Retrieve existing DNS policy configuration',
    'dns.policies.list': 'Enumerate DNS policies across the project',
    'dns.policies.create': 'Create new DNS server policies for inbound forwarding',
    'dns.policies.update': 'Modify DNS server policy settings',
    'dns.policies.delete': 'Remove DNS server policies when decommissioning'
  },
  terraform: `resource "google_project_iam_custom_role" "infoblox_uddi_cf_inbound" {
  project     = var.project_id
  role_id     = "infobloxUddiCloudForwardingInbound"
  title       = "Infoblox UDDI - Cloud Forwarding Inbound"
  description = "Infoblox Universal DDI - DNS inbound forwarding permissions"
  permissions = [
    "dns.projects.get",
    "compute.networks.get",
    "compute.networks.list",
    "compute.addresses.list",
    "dns.networks.bindPrivateDNSPolicy",
    "dns.policies.get",
    "dns.policies.list",
    "dns.policies.create",
    "dns.policies.update",
    "dns.policies.delete"
  ]
}

resource "google_project_iam_member" "infoblox_uddi_cf_inbound" {
  project = var.project_id
  role    = google_project_iam_custom_role.infoblox_uddi_cf_inbound.id
  member  = "serviceAccount:\${var.service_account_email}"
}`,
  setupGuide: `1. Navigate to IAM & Admin > Roles in the GCP Console.
2. Click "Create Role".
3. Name: "Infoblox UDDI - Cloud Forwarding Inbound", ID: "infobloxUddiCloudForwardingInbound".
4. Click "Add Permissions" and add all 10 permissions:
   - dns.projects.get
   - compute.networks.get, compute.networks.list, compute.addresses.list
   - dns.networks.bindPrivateDNSPolicy
   - dns.policies.get, dns.policies.list, dns.policies.create, dns.policies.update, dns.policies.delete
5. Click "Create".
6. Navigate to IAM & Admin > IAM.
7. Click "Grant Access", add the service account, and assign the custom role.

Alternatively, use gcloud CLI:
gcloud iam roles create infobloxUddiCloudForwardingInbound \\
  --project=<PROJECT_ID> \\
  --title="Infoblox UDDI - Cloud Forwarding Inbound" \\
  --permissions="dns.projects.get,compute.networks.get,compute.networks.list,compute.addresses.list,dns.networks.bindPrivateDNSPolicy,dns.policies.get,dns.policies.list,dns.policies.create,dns.policies.update,dns.policies.delete"

gcloud projects add-iam-policy-binding <PROJECT_ID> \\
  --member="serviceAccount:<SA_EMAIL>" \\
  --role="projects/<PROJECT_ID>/roles/infobloxUddiCloudForwardingInbound"`
};

const cloudForwardingOutbound = {
  id: 'cloudForwardingOutbound',
  name: 'Cloud Forwarding - Outbound',
  question: 'Manage DNS forwarding?',
  subQuestion: 'Outbound',
  predefinedRoles: [],
  customPermissions: [
    'dns.projects.get',
    'compute.networks.get',
    'compute.networks.list',
    'dns.managedZones.get',
    'dns.managedZones.list',
    'dns.managedZones.create',
    'dns.managedZones.update',
    'dns.managedZones.delete',
    'dns.networks.bindPrivateDNSZone',
    'dns.resourceRecordSets.get',
    'dns.resourceRecordSets.list',
    'dns.resourceRecordSets.create',
    'dns.resourceRecordSets.update',
    'dns.resourceRecordSets.delete',
    'dns.changes.create'
  ],
  rationale: {
    'dns.projects.get': 'Read DNS project settings for zone configuration',
    'compute.networks.get': 'Retrieve VPC network details for private zone binding',
    'compute.networks.list': 'Enumerate VPC networks available for outbound forwarding zones',
    'dns.managedZones.get': 'Retrieve managed zone configuration and metadata',
    'dns.managedZones.list': 'Enumerate Cloud DNS managed zones in the project',
    'dns.managedZones.create': 'Create private forwarding zones for outbound DNS resolution',
    'dns.managedZones.update': 'Modify forwarding zone configuration and target name servers',
    'dns.managedZones.delete': 'Remove forwarding zones when decommissioning',
    'dns.networks.bindPrivateDNSZone': 'Bind private DNS zones to VPC networks for outbound forwarding',
    'dns.resourceRecordSets.get': 'Retrieve individual DNS record details',
    'dns.resourceRecordSets.list': 'Enumerate DNS records within managed zones',
    'dns.resourceRecordSets.create': 'Create DNS records in managed zones',
    'dns.resourceRecordSets.update': 'Modify existing DNS records in managed zones',
    'dns.resourceRecordSets.delete': 'Remove DNS records from managed zones',
    'dns.changes.create': 'Submit record set change batches to Cloud DNS'
  },
  terraform: `resource "google_project_iam_custom_role" "infoblox_uddi_cf_outbound" {
  project     = var.project_id
  role_id     = "infobloxUddiCloudForwardingOutbound"
  title       = "Infoblox UDDI - Cloud Forwarding Outbound"
  description = "Infoblox Universal DDI - DNS outbound forwarding permissions"
  permissions = [
    "dns.projects.get",
    "compute.networks.get",
    "compute.networks.list",
    "dns.managedZones.get",
    "dns.managedZones.list",
    "dns.managedZones.create",
    "dns.managedZones.update",
    "dns.managedZones.delete",
    "dns.networks.bindPrivateDNSZone",
    "dns.resourceRecordSets.get",
    "dns.resourceRecordSets.list",
    "dns.resourceRecordSets.create",
    "dns.resourceRecordSets.update",
    "dns.resourceRecordSets.delete",
    "dns.changes.create"
  ]
}

resource "google_project_iam_member" "infoblox_uddi_cf_outbound" {
  project = var.project_id
  role    = google_project_iam_custom_role.infoblox_uddi_cf_outbound.id
  member  = "serviceAccount:\${var.service_account_email}"
}`,
  setupGuide: `1. Navigate to IAM & Admin > Roles in the GCP Console.
2. Click "Create Role".
3. Name: "Infoblox UDDI - Cloud Forwarding Outbound", ID: "infobloxUddiCloudForwardingOutbound".
4. Click "Add Permissions" and add all 15 permissions:
   - dns.projects.get
   - compute.networks.get, compute.networks.list
   - dns.managedZones.get, dns.managedZones.list, dns.managedZones.create, dns.managedZones.update, dns.managedZones.delete
   - dns.networks.bindPrivateDNSZone
   - dns.resourceRecordSets.get, dns.resourceRecordSets.list, dns.resourceRecordSets.create, dns.resourceRecordSets.update, dns.resourceRecordSets.delete
   - dns.changes.create
5. Click "Create".
6. Navigate to IAM & Admin > IAM.
7. Click "Grant Access", add the service account, and assign the custom role.

Alternatively, use gcloud CLI:
gcloud iam roles create infobloxUddiCloudForwardingOutbound \\
  --project=<PROJECT_ID> \\
  --title="Infoblox UDDI - Cloud Forwarding Outbound" \\
  --permissions="dns.projects.get,compute.networks.get,compute.networks.list,dns.managedZones.get,dns.managedZones.list,dns.managedZones.create,dns.managedZones.update,dns.managedZones.delete,dns.networks.bindPrivateDNSZone,dns.resourceRecordSets.get,dns.resourceRecordSets.list,dns.resourceRecordSets.create,dns.resourceRecordSets.update,dns.resourceRecordSets.delete,dns.changes.create"

gcloud projects add-iam-policy-binding <PROJECT_ID> \\
  --member="serviceAccount:<SA_EMAIL>" \\
  --role="projects/<PROJECT_ID>/roles/infobloxUddiCloudForwardingOutbound"`
};

const internalRanges = {
  id: 'internalRanges',
  name: 'Internal Ranges',
  question: 'Manage GCP Internal Ranges (IPAM)?',
  predefinedRoles: [],
  customPermissions: [
    'networkconnectivity.internalRanges.get',
    'networkconnectivity.internalRanges.list',
    'networkconnectivity.internalRanges.create',
    'networkconnectivity.internalRanges.update',
    'networkconnectivity.internalRanges.delete',
    'networkconnectivity.internalRanges.getIamPolicy',
    'networkconnectivity.internalRanges.setIamPolicy',
    'networkconnectivity.locations.get',
    'networkconnectivity.locations.list',
    'networkconnectivity.operations.get',
    'networkconnectivity.operations.list',
    'networkconnectivity.operations.delete',
    'networkconnectivity.operations.cancel'
  ],
  rationale: {
    'networkconnectivity.internalRanges.get': 'Retrieve internal range allocation details',
    'networkconnectivity.internalRanges.list': 'Enumerate all internal ranges in the project',
    'networkconnectivity.internalRanges.create': 'Create new internal range allocations for IPAM',
    'networkconnectivity.internalRanges.update': 'Modify existing internal range configurations',
    'networkconnectivity.internalRanges.delete': 'Remove internal range allocations',
    'networkconnectivity.internalRanges.getIamPolicy': 'Read IAM policies on internal range resources',
    'networkconnectivity.internalRanges.setIamPolicy': 'Set IAM policies on internal range resources',
    'networkconnectivity.locations.get': 'Retrieve Network Connectivity Center location details',
    'networkconnectivity.locations.list': 'Enumerate available Network Connectivity Center locations',
    'networkconnectivity.operations.get': 'Check status of long-running internal range operations',
    'networkconnectivity.operations.list': 'Enumerate pending operations on internal ranges',
    'networkconnectivity.operations.delete': 'Remove completed operation records',
    'networkconnectivity.operations.cancel': 'Cancel in-progress internal range operations'
  },
  terraform: `resource "google_project_iam_custom_role" "infoblox_uddi_internal_ranges" {
  project     = var.project_id
  role_id     = "infobloxUddiInternalRanges"
  title       = "Infoblox UDDI - Internal Ranges"
  description = "Infoblox Universal DDI - GCP Internal Ranges (IPAM) permissions"
  permissions = [
    "networkconnectivity.internalRanges.get",
    "networkconnectivity.internalRanges.list",
    "networkconnectivity.internalRanges.create",
    "networkconnectivity.internalRanges.update",
    "networkconnectivity.internalRanges.delete",
    "networkconnectivity.internalRanges.getIamPolicy",
    "networkconnectivity.internalRanges.setIamPolicy",
    "networkconnectivity.locations.get",
    "networkconnectivity.locations.list",
    "networkconnectivity.operations.get",
    "networkconnectivity.operations.list",
    "networkconnectivity.operations.delete",
    "networkconnectivity.operations.cancel"
  ]
}

resource "google_project_iam_member" "infoblox_uddi_internal_ranges" {
  project = var.project_id
  role    = google_project_iam_custom_role.infoblox_uddi_internal_ranges.id
  member  = "serviceAccount:\${var.service_account_email}"
}`,
  setupGuide: `1. Navigate to IAM & Admin > Roles in the GCP Console.
2. Click "Create Role".
3. Name: "Infoblox UDDI - Internal Ranges", ID: "infobloxUddiInternalRanges".
4. Click "Add Permissions" and add all 13 permissions:
   - networkconnectivity.internalRanges.get, list, create, update, delete, getIamPolicy, setIamPolicy
   - networkconnectivity.locations.get, list
   - networkconnectivity.operations.get, list, delete, cancel
5. Click "Create".
6. Navigate to IAM & Admin > IAM.
7. Click "Grant Access", add the service account, and assign the custom role.

Alternatively, use gcloud CLI:
gcloud iam roles create infobloxUddiInternalRanges \\
  --project=<PROJECT_ID> \\
  --title="Infoblox UDDI - Internal Ranges" \\
  --permissions="networkconnectivity.internalRanges.get,networkconnectivity.internalRanges.list,networkconnectivity.internalRanges.create,networkconnectivity.internalRanges.update,networkconnectivity.internalRanges.delete,networkconnectivity.internalRanges.getIamPolicy,networkconnectivity.internalRanges.setIamPolicy,networkconnectivity.locations.get,networkconnectivity.locations.list,networkconnectivity.operations.get,networkconnectivity.operations.list,networkconnectivity.operations.delete,networkconnectivity.operations.cancel"

gcloud projects add-iam-policy-binding <PROJECT_ID> \\
  --member="serviceAccount:<SA_EMAIL>" \\
  --role="projects/<PROJECT_ID>/roles/infobloxUddiInternalRanges"`
};

const multiProjectOrg = {
  id: 'multiProjectOrg',
  name: 'Multi-Project / Organization',
  question: 'Discover across projects/folders/org?',
  predefinedRoles: [
    { role: 'roles/resourcemanager.organizationViewer', scope: 'organization' },
    { role: 'roles/resourcemanager.folderViewer', scope: 'folder' }
  ],
  customPermissions: [
    'resourcemanager.organizations.get',
    'resourcemanager.folders.get',
    'resourcemanager.folders.list',
    'resourcemanager.projects.get',
    'resourcemanager.projects.list'
  ],
  rationale: {
    'roles/resourcemanager.organizationViewer': 'Read-only access to the organization node for cross-project discovery',
    'roles/resourcemanager.folderViewer': 'Read-only access to folder hierarchy for project enumeration',
    'resourcemanager.organizations.get': 'Retrieve organization metadata and display name',
    'resourcemanager.folders.get': 'Retrieve folder details within the organization hierarchy',
    'resourcemanager.folders.list': 'Enumerate folders for project grouping context',
    'resourcemanager.projects.get': 'Retrieve project metadata and labels',
    'resourcemanager.projects.list': 'Enumerate all projects within folders or organization'
  },
  terraform: `# Organization-level role binding
resource "google_organization_iam_member" "infoblox_uddi_org_viewer" {
  org_id = var.organization_id
  role   = "roles/resourcemanager.organizationViewer"
  member = "serviceAccount:\${var.service_account_email}"
}

# Folder-level role binding
resource "google_folder_iam_member" "infoblox_uddi_folder_viewer" {
  folder = var.folder_id
  role   = "roles/resourcemanager.folderViewer"
  member = "serviceAccount:\${var.service_account_email}"
}

# Custom role for additional resource manager permissions
resource "google_project_iam_custom_role" "infoblox_uddi_multi_project" {
  project     = var.project_id
  role_id     = "infobloxUddiMultiProject"
  title       = "Infoblox UDDI - Multi-Project Discovery"
  description = "Infoblox Universal DDI - Cross-project and organization discovery permissions"
  permissions = [
    "resourcemanager.organizations.get",
    "resourcemanager.folders.get",
    "resourcemanager.folders.list",
    "resourcemanager.projects.get",
    "resourcemanager.projects.list"
  ]
}

resource "google_project_iam_member" "infoblox_uddi_multi_project" {
  project = var.project_id
  role    = google_project_iam_custom_role.infoblox_uddi_multi_project.id
  member  = "serviceAccount:\${var.service_account_email}"
}`,
  setupGuide: `1. Navigate to the Organization level in the GCP Console > IAM & Admin > IAM.
2. Click "Grant Access" and add the service account as a principal.
3. Assign the role "Organization Viewer" (roles/resourcemanager.organizationViewer).
4. Navigate to the target Folder > IAM & Admin > IAM.
5. Click "Grant Access" and assign "Folder Viewer" (roles/resourcemanager.folderViewer).
6. For the additional custom permissions, create a custom role at the project level:
   - Navigate to IAM & Admin > Roles > Create Role.
   - Name: "Infoblox UDDI - Multi-Project Discovery".
   - Add permissions: resourcemanager.organizations.get, resourcemanager.folders.get, resourcemanager.folders.list, resourcemanager.projects.get, resourcemanager.projects.list.
7. Assign the custom role to the service account.

Alternatively, use gcloud CLI:
gcloud organizations add-iam-policy-binding <ORG_ID> \\
  --member="serviceAccount:<SA_EMAIL>" \\
  --role="roles/resourcemanager.organizationViewer"

gcloud resource-manager folders add-iam-policy-binding <FOLDER_ID> \\
  --member="serviceAccount:<SA_EMAIL>" \\
  --role="roles/resourcemanager.folderViewer"

gcloud iam roles create infobloxUddiMultiProject \\
  --project=<PROJECT_ID> \\
  --title="Infoblox UDDI - Multi-Project Discovery" \\
  --permissions="resourcemanager.organizations.get,resourcemanager.folders.get,resourcemanager.folders.list,resourcemanager.projects.get,resourcemanager.projects.list"

gcloud projects add-iam-policy-binding <PROJECT_ID> \\
  --member="serviceAccount:<SA_EMAIL>" \\
  --role="projects/<PROJECT_ID>/roles/infobloxUddiMultiProject"`
};

/**
 * All GCP feature categories for the UDDI Permission Scope Helper.
 *
 * Keys are feature IDs, values contain predefinedRoles, customPermissions,
 * terraform HCL, setupGuide text, and per-role/permission rationale.
 * DNS and Cloud Forwarding have sub-feature variants as separate entries.
 * Cloud Forwarding "Both" is not a separate entry — when both inbound and
 * outbound are selected, the generator functions merge and deduplicate to
 * 21 combined permissions.
 */
export const GCP_FEATURES = {
  assetDiscovery,
  storageBuckets,
  dnsReadOnly,
  dnsReadWrite,
  cloudForwardingInbound,
  cloudForwardingOutbound,
  internalRanges,
  multiProjectOrg
};
