# Infoblox Universal DDI — Permission Scope Helper

**Date:** 2026-04-16
**Status:** Design approved

## Overview

A static micro site that helps Infoblox Universal DDI customers generate least-privilege permission policies for AWS, Azure, and GCP. Customers select which discovery and management features they need, and the site outputs ready-to-use IAM policies, Terraform snippets, and setup instructions.

### Problem

Infoblox documentation recommends broad read-only policies (e.g., AWS `ReadOnlyAccess`, Azure `Reader` at management group level). Customer security teams push back — they want least-privilege. Currently no self-service tool exists to generate scoped policies based on actual feature needs.

### Target Audience

Customers directly — self-service tool used independently. Must be simple enough for someone unfamiliar with Infoblox internals. Linked from docs or shared during POCs.

## Architecture

Pure static site. Single HTML page, no framework, no backend, no build step. Deployable to GitHub Pages, Netlify, or any static hosting.

### File Structure

```
uddi-permission/
├── index.html          # Main page, layout, wizard UI
├── css/
│   └── style.css       # Infoblox-branded styles
├── js/
│   ├── app.js          # Wizard logic, state management, output rendering
│   ├── providers/
│   │   ├── aws.js      # AWS feature→permission mappings + templates
│   │   ├── azure.js    # Azure feature→permission mappings + templates
│   │   └── gcp.js      # GCP feature→permission mappings + templates
│   └── output.js       # JSON/Terraform/CLI generators + copy/download
└── img/
    └── infoblox-logo.svg
```

### How It Works

1. User picks cloud provider (AWS / Azure / GCP) → loads that provider's wizard questions
2. Each answer toggles feature flags in a JS state object
3. State change triggers re-render of output panel — permission array built from enabled features
4. Output generators format the permission array into JSON policy / Terraform / CLI commands
5. Copy/download buttons operate on the rendered output

No backend, no API calls, no cookies, no analytics. Pure client-side. Works offline after first load.

## Page Layout

Single-page, three-zone layout:

### Zone 1: Cloud Provider Selection (top)

Three cards: AWS, Azure, GCP. Selecting one loads that provider's wizard and output templates. Infoblox-branded header above.

### Zone 2: Feature Wizard (left panel)

Two modes:

- **Wizard mode** (default): Sequential yes/no questions, one active at a time. Upcoming questions shown dimmed as preview. Sub-questions appear conditionally (e.g., DNS → "Read-only or bidirectional?").
- **Advanced mode**: Toggle link switches to direct feature checkboxes grouped by category. For power users who know what they need.

### Zone 3: Policy Output (right panel)

Live-updating output with three tabs per provider:
- Tab 1: Native policy format (AWS JSON / Azure CLI / GCP gcloud)
- Tab 2: Terraform snippet
- Tab 3: Step-by-step setup guide

Actions: Copy to clipboard, Download as file (.json or .tf), Permission count badge.

## Feature Categories

### AWS (6 categories)

#### 1. VPC/IPAM Discovery
Question: "Discover VPCs, subnets, IP address management?"
Permissions (21):
- `ec2:DescribeVpcs`, `ec2:DescribeSubnets`, `ec2:DescribeAddresses`, `ec2:DescribeRouteTables`
- `ec2:DescribeInternetGateways`, `ec2:DescribeEgressOnlyInternetGateways`, `ec2:DescribeNatGateways`
- `ec2:DescribeCustomerGateways`, `ec2:DescribeVpnGateways`, `ec2:DescribeVpnConnections`
- `ec2:DescribeVpcEndpoints`, `ec2:DescribeVpcPeeringConnections`
- `ec2:DescribeTransitGateways`, `ec2:DescribeTransitGatewayVpcAttachments`, `ec2:DescribeTransitGatewayPeeringAttachments`
- `ec2:DescribeIpams`, `ec2:DescribeIpamScopes`, `ec2:DescribeIpamPools`
- `ec2:GetIpamPoolAllocations`, `ec2:GetIpamPoolCidrs`
- `directconnect:DescribeDirectConnectGateways`

#### 2. EC2 & Networking
Question: "EC2 instances, network interfaces, security groups, load balancers?"
Permissions (8):
- `ec2:DescribeInstances`, `ec2:DescribeVolumes`, `ec2:DescribeNetworkInterfaces`, `ec2:DescribeSecurityGroups`
- `elasticloadbalancing:DescribeLoadBalancers`, `elasticloadbalancing:DescribeListeners`
- `elasticloadbalancing:DescribeTargetGroups`, `elasticloadbalancing:DescribeTargetHealth`

#### 3. S3 Bucket Visibility
Question: "Detect dangling DNS or publicly accessible buckets?"
Permissions (3):
- `s3:ListAllMyBuckets`, `s3:GetBucketPolicy`, `s3:GetBucketPublicAccessBlock`

#### 4. DNS (Route 53)
Question: "Sync DNS zones?" → Sub: "Read-only or bidirectional?"

Read-only permissions (7):
- `route53:GetHostedZone`, `route53:ListHostedZones`, `route53:ListResourceRecordSets`
- `route53:ListTagsForResources`, `route53:ListQueryLoggingConfigs`
- `route53:GetHealthCheck`, `route53:ListHealthChecks`

Bidirectional adds (7):
- `route53:CreateHostedZone`, `route53:DeleteHostedZone`, `route53:ChangeResourceRecordSets`
- `route53:UpdateHostedZoneComment`, `route53:ListVPCAssociationAuthorizations`
- `route53:ListTrafficPolicyInstancesByHostedZone`
- `ec2:DescribeRegions`, `ec2:DescribeVpcs` (if not already included)

#### 5. Cloud Forwarding
Question: "Route 53 Resolver endpoint management?" → Sub: "Full management or discovery only?"

Discovery-only permissions (6):
- `route53resolver:ListResolverEndpoints`, `route53resolver:ListResolverEndpointIpAddresses`
- `route53resolver:ListResolverRules`, `route53resolver:ListResolverRuleAssociations`
- `ec2:DescribeVpcs`, `ec2:DescribeSubnets` (if not already included)

Full management permissions (12):
- `route53resolver:*`
- `ec2:DescribeNetworkInterfaces`, `ec2:CreateNetworkInterface`, `ec2:DeleteNetworkInterface`
- `ec2:GetSecurityGroupsForVpc`, `ec2:DescribeRegions`, `ec2:DescribeVpcs`, `ec2:DescribeSubnets`
- `ec2:DescribeAvailabilityZones`, `ec2:ModifyNetworkInterfaceAttribute`
- `ec2:CreateNetworkInterfacePermission`, `ec2:DescribeSecurityGroups`

#### 6. Multi-Account
Question: "Cross-account discovery via AWS Organizations?"
Outputs:
- `AWSOrganizationsReadOnlyAccess` managed policy (management account)
- `sts:AssumeRole` policy for management account IAM user
- Trust policy template for sub-account roles (with Infoblox principal `arn:aws:iam::902917483333:root` and ExternalId placeholder)

### Azure (5 categories)

#### 1. IPAM / Asset Discovery
Question: "Discover VNets, subnets, VMs, IP addresses?"
Role: `Reader` (built-in) at subscription scope

#### 2. Public DNS Sync
Question: "Sync public DNS zones?" → Sub: "Read-only or read-write?"
Read-only: Covered by `Reader` role
Read-write: Add `DNS Zone Contributor` (built-in) at subscription scope

#### 3. Private DNS Sync
Question: "Sync private DNS zones?"
Role: `Private DNS Zone Contributor` (built-in) at subscription scope

#### 4. Cloud Forwarding
Question: "Manage Azure DNS Private Resolvers?" → Sub: "Full management or discovery only?"

Discovery-only permissions (6):
- `Microsoft.Network/dnsResolvers/read`
- `Microsoft.Network/dnsResolvers/inboundEndpoints/read`
- `Microsoft.Network/dnsResolvers/outboundEndpoints/read`
- `Microsoft.Network/dnsForwardingRulesets/read`
- `Microsoft.Network/dnsForwardingRulesets/forwardingRules/read`
- `Microsoft.Network/dnsForwardingRulesets/virtualNetworkLinks/read`

Full management: Custom role "Custom DNS Resolver Full Management" with 21 actions on `Microsoft.Network/dnsResolvers/*`, `Microsoft.Network/dnsForwardingRulesets/*`, and `Microsoft.Network/virtualNetworks/*`

#### 5. Multi-Subscription
Question: "Discover across multiple subscriptions?"
Guidance: Assign same roles at each subscription, or assign at management group level for broader scope. Output includes Azure CLI commands for each pattern.

### GCP (6 categories)

#### 1. Asset Discovery
Question: "Discover VMs, disks, networking resources?"
Predefined roles: `roles/compute.viewer` + `roles/compute.networkViewer`
Custom alternative: 21 specific `compute.*` permissions

#### 2. Storage Buckets
Question: "Discover storage buckets and IAM policies?"
Permissions (2):
- `storage.buckets.list`, `storage.buckets.getIamPolicy`

#### 3. DNS Discovery
Question: "Sync Cloud DNS zones?" → Sub: "Read-only or read-write?"
Read-only: `roles/dns.reader`
Read-write: `roles/dns.admin`

#### 4. Cloud Forwarding
Question: "Manage DNS forwarding?" → Sub: "Inbound, outbound, or both?"

Inbound (10 permissions):
- `dns.projects.get`, `compute.networks.get`, `compute.networks.list`, `compute.addresses.list`
- `dns.networks.bindPrivateDNSPolicy`, `dns.policies.get`, `dns.policies.list`
- `dns.policies.create`, `dns.policies.update`, `dns.policies.delete`

Outbound (15 permissions):
- `dns.projects.get`, `compute.networks.get`, `compute.networks.list`
- `dns.managedZones.get`, `dns.managedZones.list`, `dns.managedZones.create`, `dns.managedZones.update`, `dns.managedZones.delete`
- `dns.networks.bindPrivateDNSZone`
- `dns.resourceRecordSets.get`, `dns.resourceRecordSets.list`, `dns.resourceRecordSets.create`, `dns.resourceRecordSets.update`, `dns.resourceRecordSets.delete`

#### 5. Internal Ranges
Question: "Manage GCP Internal Ranges (IPAM)?"
Permissions (13): All `networkconnectivity.internalRanges.*` + `networkconnectivity.locations.*` + `networkconnectivity.operations.*`

#### 6. Multi-Project/Org
Question: "Discover across projects/folders/org?"
Roles: `roles/resourcemanager.organizationViewer` (org level) + `roles/resourcemanager.folderViewer` (folder level)
Additional permissions: `resourcemanager.organizations.get`, `resourcemanager.folders.get`, `resourcemanager.folders.list`, `resourcemanager.projects.get`, `resourcemanager.projects.list`

## Output Formats

### AWS
- **JSON Policy**: Complete IAM policy document with `Version`, `Statement`, `Effect`, `Action`, `Resource`
- **Terraform**: `aws_iam_policy` resource block + `aws_iam_role` with trust policy (if multi-account)
- **Setup Guide**: Create policy → create role → attach policy → configure trust → enter External ID in Infoblox Portal

### Azure
- **Role Assignments**: Azure CLI `az role assignment create` commands for built-in roles + custom role JSON definition (if cloud forwarding)
- **Terraform**: `azurerm_role_assignment` + `azurerm_role_definition` blocks
- **Setup Guide**: Create service principal → assign roles at subscription → configure credentials in Infoblox Portal

### GCP
- **gcloud Commands**: `gcloud iam roles create` for custom roles + `gcloud projects add-iam-policy-binding` for predefined roles
- **Terraform**: `google_project_iam_custom_role` + `google_project_iam_member` blocks
- **Setup Guide**: Create service account → create custom role → bind roles → enable required APIs → configure in Infoblox Portal

All outputs include:
- Copy to clipboard button
- Download button (.json or .tf file)
- Permission count badge (e.g., "14 permissions")

## Visual Design

Infoblox-branded:
- Primary color: Infoblox blue (#0058a2)
- Header with Infoblox logo and product name
- Clean, professional look — white background, dark code panel for policy output
- Provider cards with respective brand colors (AWS orange, Azure blue, GCP multicolor)
- Responsive — works on desktop and tablet (wizard stacks vertically on mobile)

## Constraints

- English only
- No backend, no API calls, no cookies, no analytics
- Permission data hardcoded in provider JS files
- Works offline after first page load
- All permission data sourced from official Infoblox documentation
