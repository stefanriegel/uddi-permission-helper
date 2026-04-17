/**
 * GCP permission data for UDDI Permission Scope Helper.
 *
 * Eight feature categories with custom permission lists, Terraform HCL
 * templates, setup guides, and per-permission rationale strings. All data
 * sourced from the Infoblox Universal DDI Admin Guide.
 *
 * GCP uses custom roles with granular permissions for least-privilege
 * access. The sole exception is multiProjectOrg, which requires
 * predefined roles (organizationViewer, folderViewer) at org/folder
 * scope where custom project-level roles cannot reach.
 */

const assetDiscovery = {
  id: 'assetDiscovery',
  product: 'assetInsight',
  name: 'Asset Discovery',
  question: 'Discover VMs, disks, networking resources?',
  predefinedRoles: [],
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
    'compute.projects.get',
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
    'resourcemanager.projects.get'
  ],
  rationale: {
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
    'compute.projects.get': 'Retrieve project-level compute quotas and metadata',
    'compute.backendBuckets.list': 'Enumerate backend buckets for load balancer discovery',
    'compute.backendServices.list': 'Enumerate backend services for load balancer topology',
    'compute.healthChecks.list': 'List health check configurations for load balancers',
    'compute.instanceGroups.list': 'Enumerate instance groups for scaling and load balancing',
    'compute.networkEndpointGroups.list': 'List network endpoint groups for serverless load balancing',
    'compute.sslCertificates.list': 'Enumerate SSL certificates for HTTPS load balancers',
    'compute.targetHttpProxies.list': 'List HTTP proxy targets for load balancer routing',
    'compute.targetHttpsProxies.list': 'List HTTPS proxy targets for load balancer routing',
    'compute.targetPools.list': 'Enumerate target pools for network load balancers',
    'compute.targetSslProxies.list': 'List SSL proxy targets for load balancer routing',
    'compute.targetTcpProxies.list': 'List TCP proxy targets for load balancer routing',
    'compute.targetVpnGateways.list': 'Enumerate classic VPN gateway targets',
    'compute.urlMaps.list': 'List URL maps for HTTP(S) load balancer routing rules',
    'compute.vpnGateways.list': 'Enumerate HA VPN gateways',
    'compute.vpnTunnels.list': 'List VPN tunnels for site-to-site connectivity',
    'resourcemanager.projects.get': 'Retrieve project metadata and labels'
  },
  terraform: `resource "google_project_iam_custom_role" "infoblox_uddi_asset_discovery" {
  project     = var.project_id
  role_id     = "infobloxUddiAssetDiscovery"
  title       = "Infoblox UDDI - Asset Discovery"
  description = "Infoblox Universal DDI - Compute and network asset discovery permissions"
  permissions = [
    "compute.instances.list",
    "compute.instances.get",
    "compute.disks.list",
    "compute.disks.get",
    "compute.networks.list",
    "compute.networks.get",
    "compute.subnetworks.list",
    "compute.subnetworks.get",
    "compute.addresses.list",
    "compute.addresses.get",
    "compute.firewalls.list",
    "compute.firewalls.get",
    "compute.routes.list",
    "compute.routes.get",
    "compute.routers.list",
    "compute.routers.get",
    "compute.forwardingRules.list",
    "compute.forwardingRules.get",
    "compute.globalAddresses.list",
    "compute.globalAddresses.get",
    "compute.globalForwardingRules.list",
    "compute.globalForwardingRules.get",
    "compute.zones.list",
    "compute.regions.list",
    "compute.projects.get",
    "compute.backendBuckets.list",
    "compute.backendServices.list",
    "compute.healthChecks.list",
    "compute.instanceGroups.list",
    "compute.networkEndpointGroups.list",
    "compute.sslCertificates.list",
    "compute.targetHttpProxies.list",
    "compute.targetHttpsProxies.list",
    "compute.targetPools.list",
    "compute.targetSslProxies.list",
    "compute.targetTcpProxies.list",
    "compute.targetVpnGateways.list",
    "compute.urlMaps.list",
    "compute.vpnGateways.list",
    "compute.vpnTunnels.list",
    "resourcemanager.projects.get"
  ]
}

resource "google_project_iam_member" "infoblox_uddi_asset_discovery" {
  project = var.project_id
  role    = google_project_iam_custom_role.infoblox_uddi_asset_discovery.id
  member  = "serviceAccount:\${var.service_account_email}"
}`,
  setupGuide: `1. Open the GCP Console and navigate to IAM & Admin > Service Accounts.
2. Create a service account named "infoblox-uddi-discovery" (or use an existing one).
3. Navigate to IAM & Admin > Roles.
4. Click "Create Role".
5. Name: "Infoblox UDDI - Asset Discovery", ID: "infobloxUddiAssetDiscovery".
6. Click "Add Permissions" and add all 41 permissions:
   - compute.instances.list, compute.instances.get
   - compute.disks.list, compute.disks.get
   - compute.networks.list, compute.networks.get
   - compute.subnetworks.list, compute.subnetworks.get
   - compute.addresses.list, compute.addresses.get
   - compute.firewalls.list, compute.firewalls.get
   - compute.routes.list, compute.routes.get
   - compute.routers.list, compute.routers.get
   - compute.forwardingRules.list, compute.forwardingRules.get
   - compute.globalAddresses.list, compute.globalAddresses.get
   - compute.globalForwardingRules.list, compute.globalForwardingRules.get
   - compute.zones.list, compute.regions.list, compute.projects.get
   - compute.backendBuckets.list, compute.backendServices.list
   - compute.healthChecks.list, compute.instanceGroups.list
   - compute.networkEndpointGroups.list, compute.sslCertificates.list
   - compute.targetHttpProxies.list, compute.targetHttpsProxies.list
   - compute.targetPools.list, compute.targetSslProxies.list
   - compute.targetTcpProxies.list, compute.targetVpnGateways.list
   - compute.urlMaps.list, compute.vpnGateways.list, compute.vpnTunnels.list
   - resourcemanager.projects.get
7. Click "Create".
8. Navigate to IAM & Admin > IAM.
9. Click "Grant Access", add the service account, and assign the custom role.

Alternatively, use gcloud CLI:
gcloud iam roles create infobloxUddiAssetDiscovery \\
  --project=<PROJECT_ID> \\
  --title="Infoblox UDDI - Asset Discovery" \\
  --permissions="compute.instances.list,compute.instances.get,compute.disks.list,compute.disks.get,compute.networks.list,compute.networks.get,compute.subnetworks.list,compute.subnetworks.get,compute.addresses.list,compute.addresses.get,compute.firewalls.list,compute.firewalls.get,compute.routes.list,compute.routes.get,compute.routers.list,compute.routers.get,compute.forwardingRules.list,compute.forwardingRules.get,compute.globalAddresses.list,compute.globalAddresses.get,compute.globalForwardingRules.list,compute.globalForwardingRules.get,compute.zones.list,compute.regions.list,compute.projects.get,compute.backendBuckets.list,compute.backendServices.list,compute.healthChecks.list,compute.instanceGroups.list,compute.networkEndpointGroups.list,compute.sslCertificates.list,compute.targetHttpProxies.list,compute.targetHttpsProxies.list,compute.targetPools.list,compute.targetSslProxies.list,compute.targetTcpProxies.list,compute.targetVpnGateways.list,compute.urlMaps.list,compute.vpnGateways.list,compute.vpnTunnels.list,resourcemanager.projects.get"

gcloud projects add-iam-policy-binding <PROJECT_ID> \\
  --member="serviceAccount:<SA_EMAIL>" \\
  --role="projects/<PROJECT_ID>/roles/infobloxUddiAssetDiscovery"`
};

const storageBuckets = {
  id: 'storageBuckets',
  product: 'assetInsight',
  name: 'Storage Buckets',
  question: 'Discover storage buckets and IAM policies?',
  predefinedRoles: [],
  customPermissions: [
    'storage.buckets.list',
    'storage.buckets.getIamPolicy',
    'storage.objects.list'
  ],
  rationale: {
    'storage.buckets.list': 'Enumerate all Cloud Storage buckets in the project',
    'storage.buckets.getIamPolicy': 'Read bucket-level IAM policies for access analysis',
    'storage.objects.list': 'Enumerate objects within storage buckets for inventory'
  },
  terraform: `resource "google_project_iam_custom_role" "infoblox_uddi_storage_discovery" {
  project     = var.project_id
  role_id     = "infobloxUddiStorageDiscovery"
  title       = "Infoblox UDDI - Storage Discovery"
  description = "Infoblox Universal DDI - Storage bucket discovery permissions"
  permissions = [
    "storage.buckets.list",
    "storage.buckets.getIamPolicy",
    "storage.objects.list"
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
   - storage.objects.list
5. Click "Create".
6. Navigate to IAM & Admin > IAM.
7. Click "Grant Access", add the service account, and assign the custom role.

Alternatively, use gcloud CLI:
gcloud iam roles create infobloxUddiStorageDiscovery \\
  --project=<PROJECT_ID> \\
  --title="Infoblox UDDI - Storage Discovery" \\
  --permissions="storage.buckets.list,storage.buckets.getIamPolicy,storage.objects.list"

gcloud projects add-iam-policy-binding <PROJECT_ID> \\
  --member="serviceAccount:<SA_EMAIL>" \\
  --role="projects/<PROJECT_ID>/roles/infobloxUddiStorageDiscovery"`
};

const dnsReadOnly = {
  id: 'dnsReadOnly',
  product: 'ddi',
  name: 'DNS - Read-Only',
  question: 'Sync Cloud DNS zones?',
  subQuestion: 'Read-only',
  predefinedRoles: [],
  customPermissions: [
    'dns.managedZones.get',
    'dns.managedZones.list',
    'dns.resourceRecordSets.get',
    'dns.resourceRecordSets.list',
    'dns.changes.get',
    'dns.changes.list',
    'dns.projects.get'
  ],
  rationale: {
    'dns.managedZones.get': 'Retrieve managed zone configuration and metadata',
    'dns.managedZones.list': 'Enumerate Cloud DNS managed zones in the project',
    'dns.resourceRecordSets.get': 'Retrieve individual DNS record details',
    'dns.resourceRecordSets.list': 'Enumerate DNS records within managed zones',
    'dns.changes.get': 'Check status of DNS record change operations',
    'dns.changes.list': 'List DNS record change history',
    'dns.projects.get': 'Read DNS project-level settings'
  },
  terraform: `resource "google_project_iam_custom_role" "infoblox_uddi_dns_read_only" {
  project     = var.project_id
  role_id     = "infobloxUddiDnsReadOnly"
  title       = "Infoblox UDDI - DNS Read-Only"
  description = "Infoblox Universal DDI - DNS read-only sync permissions"
  permissions = [
    "dns.managedZones.get",
    "dns.managedZones.list",
    "dns.resourceRecordSets.get",
    "dns.resourceRecordSets.list",
    "dns.changes.get",
    "dns.changes.list",
    "dns.projects.get"
  ]
}

resource "google_project_iam_member" "infoblox_uddi_dns_read_only" {
  project = var.project_id
  role    = google_project_iam_custom_role.infoblox_uddi_dns_read_only.id
  member  = "serviceAccount:\${var.service_account_email}"
}`,
  setupGuide: `1. Navigate to IAM & Admin > Roles in the GCP Console.
2. Click "Create Role".
3. Name: "Infoblox UDDI - DNS Read-Only", ID: "infobloxUddiDnsReadOnly".
4. Click "Add Permissions" and add the following 7 permissions:
   - dns.managedZones.get, dns.managedZones.list
   - dns.resourceRecordSets.get, dns.resourceRecordSets.list
   - dns.changes.get, dns.changes.list
   - dns.projects.get
5. Click "Create".
6. Navigate to IAM & Admin > IAM.
7. Click "Grant Access", add the service account, and assign the custom role.

Alternatively, use gcloud CLI:
gcloud iam roles create infobloxUddiDnsReadOnly \\
  --project=<PROJECT_ID> \\
  --title="Infoblox UDDI - DNS Read-Only" \\
  --permissions="dns.managedZones.get,dns.managedZones.list,dns.resourceRecordSets.get,dns.resourceRecordSets.list,dns.changes.get,dns.changes.list,dns.projects.get"

gcloud projects add-iam-policy-binding <PROJECT_ID> \\
  --member="serviceAccount:<SA_EMAIL>" \\
  --role="projects/<PROJECT_ID>/roles/infobloxUddiDnsReadOnly"`
};

const dnsReadWrite = {
  id: 'dnsReadWrite',
  product: 'ddi',
  name: 'DNS - Read-Write',
  question: 'Sync Cloud DNS zones?',
  subQuestion: 'Read-write (bidirectional)',
  predefinedRoles: [],
  customPermissions: [
    'dns.managedZones.get',
    'dns.managedZones.list',
    'dns.managedZones.create',
    'dns.managedZones.update',
    'dns.managedZones.delete',
    'dns.resourceRecordSets.get',
    'dns.resourceRecordSets.list',
    'dns.resourceRecordSets.create',
    'dns.resourceRecordSets.update',
    'dns.resourceRecordSets.delete',
    'dns.changes.create',
    'dns.changes.get',
    'dns.changes.list',
    'dns.projects.get',
    'dns.networks.bindPrivateDNSZone',
    'dns.networks.bindPrivateDNSPolicy'
  ],
  rationale: {
    'dns.managedZones.get': 'Retrieve managed zone configuration and metadata',
    'dns.managedZones.list': 'Enumerate Cloud DNS managed zones in the project',
    'dns.managedZones.create': 'Create new managed zones for bidirectional DNS sync',
    'dns.managedZones.update': 'Modify managed zone configuration and DNSSEC settings',
    'dns.managedZones.delete': 'Remove managed zones when decommissioning',
    'dns.resourceRecordSets.get': 'Retrieve individual DNS record details',
    'dns.resourceRecordSets.list': 'Enumerate DNS records within managed zones',
    'dns.resourceRecordSets.create': 'Create DNS records in managed zones',
    'dns.resourceRecordSets.update': 'Modify existing DNS records in managed zones',
    'dns.resourceRecordSets.delete': 'Remove DNS records from managed zones',
    'dns.changes.create': 'Submit record set change batches to Cloud DNS',
    'dns.changes.get': 'Check status of DNS record change operations',
    'dns.changes.list': 'List DNS record change history',
    'dns.projects.get': 'Read DNS project-level settings',
    'dns.networks.bindPrivateDNSZone': 'Bind private DNS zones to VPC networks',
    'dns.networks.bindPrivateDNSPolicy': 'Bind DNS policies to VPC networks'
  },
  terraform: `resource "google_project_iam_custom_role" "infoblox_uddi_dns_read_write" {
  project     = var.project_id
  role_id     = "infobloxUddiDnsReadWrite"
  title       = "Infoblox UDDI - DNS Read-Write"
  description = "Infoblox Universal DDI - DNS bidirectional sync permissions"
  permissions = [
    "dns.managedZones.get",
    "dns.managedZones.list",
    "dns.managedZones.create",
    "dns.managedZones.update",
    "dns.managedZones.delete",
    "dns.resourceRecordSets.get",
    "dns.resourceRecordSets.list",
    "dns.resourceRecordSets.create",
    "dns.resourceRecordSets.update",
    "dns.resourceRecordSets.delete",
    "dns.changes.create",
    "dns.changes.get",
    "dns.changes.list",
    "dns.projects.get",
    "dns.networks.bindPrivateDNSZone",
    "dns.networks.bindPrivateDNSPolicy"
  ]
}

resource "google_project_iam_member" "infoblox_uddi_dns_read_write" {
  project = var.project_id
  role    = google_project_iam_custom_role.infoblox_uddi_dns_read_write.id
  member  = "serviceAccount:\${var.service_account_email}"
}`,
  setupGuide: `1. Navigate to IAM & Admin > Roles in the GCP Console.
2. Click "Create Role".
3. Name: "Infoblox UDDI - DNS Read-Write", ID: "infobloxUddiDnsReadWrite".
4. Click "Add Permissions" and add all 16 permissions:
   - dns.managedZones.get, dns.managedZones.list, dns.managedZones.create, dns.managedZones.update, dns.managedZones.delete
   - dns.resourceRecordSets.get, dns.resourceRecordSets.list, dns.resourceRecordSets.create, dns.resourceRecordSets.update, dns.resourceRecordSets.delete
   - dns.changes.create, dns.changes.get, dns.changes.list
   - dns.projects.get
   - dns.networks.bindPrivateDNSZone, dns.networks.bindPrivateDNSPolicy
5. Click "Create".
6. Navigate to IAM & Admin > IAM.
7. Click "Grant Access", add the service account, and assign the custom role.

Alternatively, use gcloud CLI:
gcloud iam roles create infobloxUddiDnsReadWrite \\
  --project=<PROJECT_ID> \\
  --title="Infoblox UDDI - DNS Read-Write" \\
  --permissions="dns.managedZones.get,dns.managedZones.list,dns.managedZones.create,dns.managedZones.update,dns.managedZones.delete,dns.resourceRecordSets.get,dns.resourceRecordSets.list,dns.resourceRecordSets.create,dns.resourceRecordSets.update,dns.resourceRecordSets.delete,dns.changes.create,dns.changes.get,dns.changes.list,dns.projects.get,dns.networks.bindPrivateDNSZone,dns.networks.bindPrivateDNSPolicy"

gcloud projects add-iam-policy-binding <PROJECT_ID> \\
  --member="serviceAccount:<SA_EMAIL>" \\
  --role="projects/<PROJECT_ID>/roles/infobloxUddiDnsReadWrite"`
};

const cloudForwardingInbound = {
  id: 'cloudForwardingInbound',
  product: 'ddi',
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
  product: 'ddi',
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
  product: 'ddi',
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

const multiProjectOrg = {
  id: 'multiProjectOrg',
  product: 'both',
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
 * Keys are feature IDs, values contain customPermissions, terraform HCL,
 * setupGuide text, and per-permission rationale. All features use custom
 * roles with granular permissions only. The sole exception is
 * multiProjectOrg, which also uses predefined roles (organizationViewer,
 * folderViewer) at org/folder scope.
 *
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
  monitoringStats,
  multiProjectOrg
};

/**
 * Collect and deduplicate predefined roles from selected GCP features.
 *
 * Deduplicates by role string using a Map so that each predefined role
 * appears only once in the output regardless of how many features include it.
 *
 * @param {string[]} selectedFeatureIds - Array of feature ID keys from GCP_FEATURES
 * @returns {Array<{role: string, scope: string}>} Deduplicated predefined roles
 */
export function getGcpRoles(selectedFeatureIds) {
  const roleMap = new Map();
  for (const id of selectedFeatureIds) {
    const feature = GCP_FEATURES[id];
    if (feature && Array.isArray(feature.predefinedRoles)) {
      for (const r of feature.predefinedRoles) {
        if (!roleMap.has(r.role)) {
          roleMap.set(r.role, { role: r.role, scope: r.scope });
        }
      }
    }
  }
  return [...roleMap.values()];
}

/**
 * Collect and deduplicate custom permissions from selected GCP features.
 *
 * Merges customPermissions arrays across all selected features, removes
 * duplicates using a Set, and returns a sorted array.
 *
 * @param {string[]} selectedFeatureIds - Array of feature ID keys from GCP_FEATURES
 * @returns {string[]} Sorted, deduplicated custom permission strings
 */
export function getGcpCustomPermissions(selectedFeatureIds) {
  const permSet = new Set();
  for (const id of selectedFeatureIds) {
    const feature = GCP_FEATURES[id];
    if (feature && Array.isArray(feature.customPermissions)) {
      for (const p of feature.customPermissions) {
        permSet.add(p);
      }
    }
  }
  return [...permSet].sort();
}

/**
 * Generate gcloud CLI commands for the selected GCP features.
 *
 * Produces `gcloud projects add-iam-policy-binding` commands for predefined
 * roles and `gcloud iam roles create` plus binding commands for custom
 * permissions. For multiProjectOrg, includes organization-level and
 * folder-level gcloud commands.
 *
 * @param {string[]} selectedFeatureIds - Array of feature ID keys from GCP_FEATURES
 * @returns {string} gcloud CLI commands string
 */
export function generateGcpPolicy(selectedFeatureIds) {
  const roles = getGcpRoles(selectedFeatureIds);
  const customPerms = getGcpCustomPermissions(selectedFeatureIds);
  const hasMultiProject = selectedFeatureIds.includes('multiProjectOrg');

  if (roles.length === 0 && customPerms.length === 0) {
    return '';
  }

  const parts = [];

  // Predefined role bindings
  const projectRoles = roles.filter(r => r.scope === 'project');
  const orgRoles = roles.filter(r => r.scope === 'organization');
  const folderRoles = roles.filter(r => r.scope === 'folder');

  for (const r of projectRoles) {
    parts.push(`gcloud projects add-iam-policy-binding PROJECT_ID \\
  --member="serviceAccount:SA_EMAIL" \\
  --role="${r.role}"`);
  }

  for (const r of orgRoles) {
    parts.push(`gcloud organizations add-iam-policy-binding ORG_ID \\
  --member="serviceAccount:SA_EMAIL" \\
  --role="${r.role}"`);
  }

  for (const r of folderRoles) {
    parts.push(`gcloud resource-manager folders add-iam-policy-binding FOLDER_ID \\
  --member="serviceAccount:SA_EMAIL" \\
  --role="${r.role}"`);
  }

  // Custom role creation and binding
  if (customPerms.length > 0) {
    const permList = customPerms.join(',');
    parts.push(`gcloud iam roles create infoblox_uddi_custom \\
  --project=PROJECT_ID \\
  --title="Infoblox UDDI Custom Role" \\
  --permissions="${permList}"`);

    parts.push(`gcloud projects add-iam-policy-binding PROJECT_ID \\
  --member="serviceAccount:SA_EMAIL" \\
  --role="projects/PROJECT_ID/roles/infoblox_uddi_custom"`);
  }

  return parts.join('\n\n');
}

/**
 * Generate Terraform HCL for the selected GCP features.
 *
 * Produces google_project_iam_member resource blocks for predefined roles,
 * google_project_iam_custom_role + google_project_iam_member for custom
 * permissions, and google_organization_iam_member / google_folder_iam_member
 * blocks for multiProjectOrg.
 *
 * @param {string[]} selectedFeatureIds - Array of feature ID keys from GCP_FEATURES
 * @returns {string} Terraform HCL string
 */
export function generateGcpTerraform(selectedFeatureIds) {
  const roles = getGcpRoles(selectedFeatureIds);
  const customPerms = getGcpCustomPermissions(selectedFeatureIds);

  if (roles.length === 0 && customPerms.length === 0) {
    return '';
  }

  const parts = [];

  // Predefined role bindings
  const projectRoles = roles.filter(r => r.scope === 'project');
  const orgRoles = roles.filter(r => r.scope === 'organization');
  const folderRoles = roles.filter(r => r.scope === 'folder');

  for (const r of projectRoles) {
    const safeName = r.role.replace('roles/', '').replace(/\./g, '_');
    parts.push(`resource "google_project_iam_member" "infoblox_uddi_${safeName}" {
  project = var.project_id
  role    = "${r.role}"
  member  = "serviceAccount:\${var.service_account_email}"
}`);
  }

  for (const r of orgRoles) {
    const safeName = r.role.replace('roles/', '').replace(/\./g, '_');
    parts.push(`resource "google_organization_iam_member" "infoblox_uddi_${safeName}" {
  org_id = var.organization_id
  role   = "${r.role}"
  member = "serviceAccount:\${var.service_account_email}"
}`);
  }

  for (const r of folderRoles) {
    const safeName = r.role.replace('roles/', '').replace(/\./g, '_');
    parts.push(`resource "google_folder_iam_member" "infoblox_uddi_${safeName}" {
  folder = var.folder_id
  role   = "${r.role}"
  member = "serviceAccount:\${var.service_account_email}"
}`);
  }

  // Custom role + binding
  if (customPerms.length > 0) {
    const permsHcl = customPerms.map(p => `    "${p}"`).join(',\n');
    parts.push(`resource "google_project_iam_custom_role" "infoblox_uddi_custom" {
  project     = var.project_id
  role_id     = "infobloxUddiCustom"
  title       = "Infoblox UDDI Custom Role"
  description = "Infoblox Universal DDI - Combined custom permissions"
  permissions = [
${permsHcl}
  ]
}

resource "google_project_iam_member" "infoblox_uddi_custom" {
  project = var.project_id
  role    = google_project_iam_custom_role.infoblox_uddi_custom.id
  member  = "serviceAccount:\${var.service_account_email}"
}`);
  }

  return parts.join('\n\n');
}

/**
 * Generate a numbered step-by-step setup guide for the selected GCP features.
 *
 * Starts with service account creation, includes predefined role binding
 * steps, custom role creation steps, org/folder instructions for
 * multiProjectOrg, and ends with Infoblox Portal configuration.
 *
 * @param {string[]} selectedFeatureIds - Array of feature ID keys from GCP_FEATURES
 * @returns {string} Plain text guide with numbered steps
 */
export function generateGcpGuide(selectedFeatureIds) {
  const roles = getGcpRoles(selectedFeatureIds);
  const customPerms = getGcpCustomPermissions(selectedFeatureIds);
  const hasMultiProject = selectedFeatureIds.includes('multiProjectOrg');

  if (roles.length === 0 && customPerms.length === 0) {
    return '';
  }

  const steps = [];
  let stepNum = 1;

  // Step 1: Create service account
  steps.push(`${stepNum}. Open the GCP Console and navigate to IAM & Admin > Service Accounts. Create a service account named "infoblox-uddi" (or use an existing one).`);
  stepNum++;

  // Predefined role bindings
  const projectRoles = roles.filter(r => r.scope === 'project');
  const orgRoles = roles.filter(r => r.scope === 'organization');
  const folderRoles = roles.filter(r => r.scope === 'folder');

  if (projectRoles.length > 0) {
    const roleNames = projectRoles.map(r => `"${r.role}"`).join(', ');
    steps.push(`${stepNum}. Navigate to IAM & Admin > IAM. Click "Grant Access", add the service account, and assign the following predefined roles: ${roleNames}.`);
    stepNum++;
  }

  // Org-level bindings
  if (orgRoles.length > 0) {
    const roleNames = orgRoles.map(r => `"${r.role}"`).join(', ');
    steps.push(`${stepNum}. At the organization level in IAM & Admin > IAM, grant the service account the following roles: ${roleNames}.`);
    stepNum++;
  }

  // Folder-level bindings
  if (folderRoles.length > 0) {
    const roleNames = folderRoles.map(r => `"${r.role}"`).join(', ');
    steps.push(`${stepNum}. At the target folder level in IAM & Admin > IAM, grant the service account the following roles: ${roleNames}.`);
    stepNum++;
  }

  // Custom role creation
  if (customPerms.length > 0) {
    steps.push(`${stepNum}. Navigate to IAM & Admin > Roles and click "Create Role". Name it "Infoblox UDDI Custom Role" and add the following ${customPerms.length} permissions: ${customPerms.join(', ')}.`);
    stepNum++;

    steps.push(`${stepNum}. Navigate to IAM & Admin > IAM. Click "Grant Access", add the service account, and assign the custom role created in the previous step.`);
    stepNum++;
  }

  // Final step: Infoblox Portal
  steps.push(`${stepNum}. In the Infoblox Portal, navigate to cloud provider settings and configure the GCP service account credentials (key file or workload identity).`);

  return steps.join('\n');
}
