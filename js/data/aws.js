/**
 * AWS permission data for UDDI Permission Scope Helper.
 *
 * Six feature categories with exact IAM actions, Terraform HCL templates,
 * setup guides, and per-action rationale strings. All data sourced from
 * the Infoblox Universal DDI Admin Guide.
 */

const vpcIpamDiscovery = {
  id: 'vpcIpamDiscovery',
  name: 'VPC/IPAM Discovery',
  question: 'Discover VPCs, subnets, IP address management?',
  actions: [
    'ec2:DescribeVpcs',
    'ec2:DescribeSubnets',
    'ec2:DescribeAddresses',
    'ec2:DescribeRouteTables',
    'ec2:DescribeInternetGateways',
    'ec2:DescribeEgressOnlyInternetGateways',
    'ec2:DescribeNatGateways',
    'ec2:DescribeCustomerGateways',
    'ec2:DescribeVpnGateways',
    'ec2:DescribeVpnConnections',
    'ec2:DescribeVpcEndpoints',
    'ec2:DescribeVpcPeeringConnections',
    'ec2:DescribeTransitGateways',
    'ec2:DescribeTransitGatewayVpcAttachments',
    'ec2:DescribeTransitGatewayPeeringAttachments',
    'ec2:DescribeIpams',
    'ec2:DescribeIpamScopes',
    'ec2:DescribeIpamPools',
    'ec2:GetIpamPoolAllocations',
    'ec2:GetIpamPoolCidrs',
    'directconnect:DescribeDirectConnectGateways'
  ],
  rationale: {
    'ec2:DescribeVpcs': 'List VPCs for network topology discovery',
    'ec2:DescribeSubnets': 'Enumerate subnets within each VPC',
    'ec2:DescribeAddresses': 'Discover Elastic IP allocations',
    'ec2:DescribeRouteTables': 'Map routing paths between subnets and gateways',
    'ec2:DescribeInternetGateways': 'Identify internet-facing VPC attachments',
    'ec2:DescribeEgressOnlyInternetGateways': 'Detect IPv6 egress-only gateways',
    'ec2:DescribeNatGateways': 'Discover NAT gateways for private subnet egress',
    'ec2:DescribeCustomerGateways': 'List on-premises VPN endpoints',
    'ec2:DescribeVpnGateways': 'Identify AWS-side VPN gateway resources',
    'ec2:DescribeVpnConnections': 'Enumerate site-to-site VPN tunnels',
    'ec2:DescribeVpcEndpoints': 'Discover VPC endpoints for AWS services',
    'ec2:DescribeVpcPeeringConnections': 'Map VPC peering relationships',
    'ec2:DescribeTransitGateways': 'List transit gateways for multi-VPC routing',
    'ec2:DescribeTransitGatewayVpcAttachments': 'Identify VPCs attached to transit gateways',
    'ec2:DescribeTransitGatewayPeeringAttachments': 'Discover cross-region transit gateway peering',
    'ec2:DescribeIpams': 'List IPAM instances for IP address management',
    'ec2:DescribeIpamScopes': 'Enumerate IPAM scopes (public and private)',
    'ec2:DescribeIpamPools': 'List IPAM pools and their CIDR allocations',
    'ec2:GetIpamPoolAllocations': 'Retrieve individual IP allocations within pools',
    'ec2:GetIpamPoolCidrs': 'Get CIDR blocks provisioned to IPAM pools',
    'directconnect:DescribeDirectConnectGateways': 'Discover Direct Connect gateways for hybrid connectivity'
  },
  terraform: `resource "aws_iam_policy" "infoblox_uddi_vpc_ipam_discovery" {
  name        = "InfobloxUDDI-VpcIpamDiscovery"
  description = "Infoblox Universal DDI - VPC and IPAM discovery permissions"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeVpcs",
          "ec2:DescribeSubnets",
          "ec2:DescribeAddresses",
          "ec2:DescribeRouteTables",
          "ec2:DescribeInternetGateways",
          "ec2:DescribeEgressOnlyInternetGateways",
          "ec2:DescribeNatGateways",
          "ec2:DescribeCustomerGateways",
          "ec2:DescribeVpnGateways",
          "ec2:DescribeVpnConnections",
          "ec2:DescribeVpcEndpoints",
          "ec2:DescribeVpcPeeringConnections",
          "ec2:DescribeTransitGateways",
          "ec2:DescribeTransitGatewayVpcAttachments",
          "ec2:DescribeTransitGatewayPeeringAttachments",
          "ec2:DescribeIpams",
          "ec2:DescribeIpamScopes",
          "ec2:DescribeIpamPools",
          "ec2:GetIpamPoolAllocations",
          "ec2:GetIpamPoolCidrs",
          "directconnect:DescribeDirectConnectGateways"
        ]
        Resource = "*"
      }
    ]
  })
}`,
  setupGuide: `1. Open IAM Console > Policies > Create Policy.
2. Select the JSON tab and paste the policy document.
3. Name the policy "InfobloxUDDI-VpcIpamDiscovery".
4. Attach the policy to the IAM role used by Infoblox Universal DDI.`
};

const ec2Networking = {
  id: 'ec2Networking',
  name: 'EC2 & Networking',
  question: 'EC2 instances, network interfaces, security groups, load balancers?',
  actions: [
    'ec2:DescribeInstances',
    'ec2:DescribeVolumes',
    'ec2:DescribeNetworkInterfaces',
    'ec2:DescribeSecurityGroups',
    'elasticloadbalancing:DescribeLoadBalancers',
    'elasticloadbalancing:DescribeListeners',
    'elasticloadbalancing:DescribeTargetGroups',
    'elasticloadbalancing:DescribeTargetHealth'
  ],
  rationale: {
    'ec2:DescribeInstances': 'List EC2 instances for asset inventory',
    'ec2:DescribeVolumes': 'Discover EBS volumes attached to instances',
    'ec2:DescribeNetworkInterfaces': 'Enumerate ENIs and their IP assignments',
    'ec2:DescribeSecurityGroups': 'Map security group rules for network access analysis',
    'elasticloadbalancing:DescribeLoadBalancers': 'List ALB/NLB/CLB load balancers',
    'elasticloadbalancing:DescribeListeners': 'Discover listener configurations on load balancers',
    'elasticloadbalancing:DescribeTargetGroups': 'Enumerate target groups and their health check settings',
    'elasticloadbalancing:DescribeTargetHealth': 'Check registered target health status'
  },
  terraform: `resource "aws_iam_policy" "infoblox_uddi_ec2_networking" {
  name        = "InfobloxUDDI-Ec2Networking"
  description = "Infoblox Universal DDI - EC2 and networking discovery permissions"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeInstances",
          "ec2:DescribeVolumes",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DescribeSecurityGroups",
          "elasticloadbalancing:DescribeLoadBalancers",
          "elasticloadbalancing:DescribeListeners",
          "elasticloadbalancing:DescribeTargetGroups",
          "elasticloadbalancing:DescribeTargetHealth"
        ]
        Resource = "*"
      }
    ]
  })
}`,
  setupGuide: `1. Open IAM Console > Policies > Create Policy.
2. Select the JSON tab and paste the policy document.
3. Name the policy "InfobloxUDDI-Ec2Networking".
4. Attach the policy to the IAM role used by Infoblox Universal DDI.`
};

const s3BucketVisibility = {
  id: 's3BucketVisibility',
  name: 'S3 Bucket Visibility',
  question: 'Detect dangling DNS or publicly accessible buckets?',
  actions: [
    's3:ListAllMyBuckets',
    's3:GetBucketPolicy',
    's3:GetBucketPublicAccessBlock'
  ],
  rationale: {
    's3:ListAllMyBuckets': 'Enumerate all S3 buckets in the account',
    's3:GetBucketPolicy': 'Read bucket policies to identify public access configurations',
    's3:GetBucketPublicAccessBlock': 'Check public access block settings for security posture'
  },
  terraform: `resource "aws_iam_policy" "infoblox_uddi_s3_bucket_visibility" {
  name        = "InfobloxUDDI-S3BucketVisibility"
  description = "Infoblox Universal DDI - S3 bucket visibility permissions"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:ListAllMyBuckets",
          "s3:GetBucketPolicy",
          "s3:GetBucketPublicAccessBlock"
        ]
        Resource = "*"
      }
    ]
  })
}`,
  setupGuide: `1. Open IAM Console > Policies > Create Policy.
2. Select the JSON tab and paste the policy document.
3. Name the policy "InfobloxUDDI-S3BucketVisibility".
4. Attach the policy to the IAM role used by Infoblox Universal DDI.`
};

const dnsRoute53ReadOnly = {
  id: 'dnsRoute53ReadOnly',
  name: 'DNS (Route 53) - Read-Only',
  question: 'Sync DNS zones?',
  subQuestion: 'Read-only',
  actions: [
    'route53:GetHostedZone',
    'route53:ListHostedZones',
    'route53:ListResourceRecordSets',
    'route53:ListTagsForResources',
    'route53:ListQueryLoggingConfigs',
    'route53:GetHealthCheck',
    'route53:ListHealthChecks'
  ],
  rationale: {
    'route53:GetHostedZone': 'Retrieve hosted zone details and configuration',
    'route53:ListHostedZones': 'Enumerate all Route 53 hosted zones',
    'route53:ListResourceRecordSets': 'Read DNS records within hosted zones',
    'route53:ListTagsForResources': 'Read tags on hosted zones for organization and filtering',
    'route53:ListQueryLoggingConfigs': 'Discover DNS query logging configurations',
    'route53:GetHealthCheck': 'Retrieve health check configurations',
    'route53:ListHealthChecks': 'Enumerate Route 53 health checks'
  },
  terraform: `resource "aws_iam_policy" "infoblox_uddi_dns_route53_read_only" {
  name        = "InfobloxUDDI-DnsRoute53-ReadOnly"
  description = "Infoblox Universal DDI - Route 53 DNS read-only permissions"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "route53:GetHostedZone",
          "route53:ListHostedZones",
          "route53:ListResourceRecordSets",
          "route53:ListTagsForResources",
          "route53:ListQueryLoggingConfigs",
          "route53:GetHealthCheck",
          "route53:ListHealthChecks"
        ]
        Resource = "*"
      }
    ]
  })
}`,
  setupGuide: `1. Open IAM Console > Policies > Create Policy.
2. Select the JSON tab and paste the policy document.
3. Name the policy "InfobloxUDDI-DnsRoute53-ReadOnly".
4. Attach the policy to the IAM role used by Infoblox Universal DDI.`
};

const dnsRoute53Bidirectional = {
  id: 'dnsRoute53Bidirectional',
  name: 'DNS (Route 53) - Bidirectional',
  question: 'Sync DNS zones?',
  subQuestion: 'Bidirectional (read and write)',
  actions: [
    'route53:GetHostedZone',
    'route53:ListHostedZones',
    'route53:ListResourceRecordSets',
    'route53:ListTagsForResources',
    'route53:ListQueryLoggingConfigs',
    'route53:GetHealthCheck',
    'route53:ListHealthChecks',
    'route53:CreateHostedZone',
    'route53:DeleteHostedZone',
    'route53:ChangeResourceRecordSets',
    'route53:UpdateHostedZoneComment',
    'route53:ListVPCAssociationAuthorizations',
    'route53:ListTrafficPolicyInstancesByHostedZone',
    'ec2:DescribeRegions'
  ],
  rationale: {
    'route53:GetHostedZone': 'Retrieve hosted zone details and configuration',
    'route53:ListHostedZones': 'Enumerate all Route 53 hosted zones',
    'route53:ListResourceRecordSets': 'Read DNS records within hosted zones',
    'route53:ListTagsForResources': 'Read tags on hosted zones for organization and filtering',
    'route53:ListQueryLoggingConfigs': 'Discover DNS query logging configurations',
    'route53:GetHealthCheck': 'Retrieve health check configurations',
    'route53:ListHealthChecks': 'Enumerate Route 53 health checks',
    'route53:CreateHostedZone': 'Create new hosted zones for bidirectional DNS sync',
    'route53:DeleteHostedZone': 'Remove hosted zones during bidirectional cleanup',
    'route53:ChangeResourceRecordSets': 'Create, update, and delete DNS records',
    'route53:UpdateHostedZoneComment': 'Update hosted zone descriptions',
    'route53:ListVPCAssociationAuthorizations': 'List VPC association authorizations for private zones',
    'route53:ListTrafficPolicyInstancesByHostedZone': 'Enumerate traffic policy instances per zone',
    'ec2:DescribeRegions': 'List available AWS regions for zone association'
  },
  terraform: `resource "aws_iam_policy" "infoblox_uddi_dns_route53_bidirectional" {
  name        = "InfobloxUDDI-DnsRoute53-Bidirectional"
  description = "Infoblox Universal DDI - Route 53 DNS bidirectional permissions"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "route53:GetHostedZone",
          "route53:ListHostedZones",
          "route53:ListResourceRecordSets",
          "route53:ListTagsForResources",
          "route53:ListQueryLoggingConfigs",
          "route53:GetHealthCheck",
          "route53:ListHealthChecks",
          "route53:CreateHostedZone",
          "route53:DeleteHostedZone",
          "route53:ChangeResourceRecordSets",
          "route53:UpdateHostedZoneComment",
          "route53:ListVPCAssociationAuthorizations",
          "route53:ListTrafficPolicyInstancesByHostedZone",
          "ec2:DescribeRegions"
        ]
        Resource = "*"
      }
    ]
  })
}`,
  setupGuide: `1. Open IAM Console > Policies > Create Policy.
2. Select the JSON tab and paste the policy document.
3. Name the policy "InfobloxUDDI-DnsRoute53-Bidirectional".
4. Attach the policy to the IAM role used by Infoblox Universal DDI.`
};

const cloudForwardingDiscovery = {
  id: 'cloudForwardingDiscovery',
  name: 'Cloud Forwarding - Discovery Only',
  question: 'Route 53 Resolver endpoint management?',
  subQuestion: 'Discovery only',
  actions: [
    'route53resolver:ListResolverEndpoints',
    'route53resolver:ListResolverEndpointIpAddresses',
    'route53resolver:ListResolverRules',
    'route53resolver:ListResolverRuleAssociations',
    'ec2:DescribeVpcs',
    'ec2:DescribeSubnets'
  ],
  rationale: {
    'route53resolver:ListResolverEndpoints': 'Enumerate Route 53 Resolver inbound and outbound endpoints',
    'route53resolver:ListResolverEndpointIpAddresses': 'Get IP addresses assigned to resolver endpoints',
    'route53resolver:ListResolverRules': 'List DNS forwarding rules configured on resolver',
    'route53resolver:ListResolverRuleAssociations': 'Discover which VPCs are associated with forwarding rules',
    'ec2:DescribeVpcs': 'List VPCs for resolver endpoint placement context',
    'ec2:DescribeSubnets': 'Enumerate subnets available for resolver endpoints'
  },
  terraform: `resource "aws_iam_policy" "infoblox_uddi_cloud_forwarding_discovery" {
  name        = "InfobloxUDDI-CloudForwarding-Discovery"
  description = "Infoblox Universal DDI - Cloud forwarding discovery-only permissions"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "route53resolver:ListResolverEndpoints",
          "route53resolver:ListResolverEndpointIpAddresses",
          "route53resolver:ListResolverRules",
          "route53resolver:ListResolverRuleAssociations",
          "ec2:DescribeVpcs",
          "ec2:DescribeSubnets"
        ]
        Resource = "*"
      }
    ]
  })
}`,
  setupGuide: `1. Open IAM Console > Policies > Create Policy.
2. Select the JSON tab and paste the policy document.
3. Name the policy "InfobloxUDDI-CloudForwarding-Discovery".
4. Attach the policy to the IAM role used by Infoblox Universal DDI.`
};

const cloudForwardingFull = {
  id: 'cloudForwardingFull',
  name: 'Cloud Forwarding - Full Management',
  question: 'Route 53 Resolver endpoint management?',
  subQuestion: 'Full management',
  actions: [
    'route53resolver:*',
    'ec2:DescribeNetworkInterfaces',
    'ec2:CreateNetworkInterface',
    'ec2:DeleteNetworkInterface',
    'ec2:GetSecurityGroupsForVpc',
    'ec2:DescribeRegions',
    'ec2:DescribeVpcs',
    'ec2:DescribeSubnets',
    'ec2:DescribeAvailabilityZones',
    'ec2:ModifyNetworkInterfaceAttribute',
    'ec2:CreateNetworkInterfacePermission',
    'ec2:DescribeSecurityGroups'
  ],
  rationale: {
    'route53resolver:*': 'Full access to Route 53 Resolver for endpoint and rule management',
    'ec2:DescribeNetworkInterfaces': 'List ENIs used by resolver endpoints',
    'ec2:CreateNetworkInterface': 'Create ENIs for new resolver endpoints',
    'ec2:DeleteNetworkInterface': 'Clean up ENIs when removing resolver endpoints',
    'ec2:GetSecurityGroupsForVpc': 'List security groups available for resolver endpoint ENIs',
    'ec2:DescribeRegions': 'List available AWS regions for resolver deployment',
    'ec2:DescribeVpcs': 'List VPCs for resolver endpoint placement',
    'ec2:DescribeSubnets': 'Enumerate subnets for resolver endpoint IP assignment',
    'ec2:DescribeAvailabilityZones': 'List AZs for multi-AZ resolver endpoint deployment',
    'ec2:ModifyNetworkInterfaceAttribute': 'Update ENI attributes for resolver endpoint configuration',
    'ec2:CreateNetworkInterfacePermission': 'Grant cross-account ENI access for resolver endpoints',
    'ec2:DescribeSecurityGroups': 'List security groups for resolver endpoint network access control'
  },
  terraform: `resource "aws_iam_policy" "infoblox_uddi_cloud_forwarding_full" {
  name        = "InfobloxUDDI-CloudForwarding-FullManagement"
  description = "Infoblox Universal DDI - Cloud forwarding full management permissions"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "route53resolver:*",
          "ec2:DescribeNetworkInterfaces",
          "ec2:CreateNetworkInterface",
          "ec2:DeleteNetworkInterface",
          "ec2:GetSecurityGroupsForVpc",
          "ec2:DescribeRegions",
          "ec2:DescribeVpcs",
          "ec2:DescribeSubnets",
          "ec2:DescribeAvailabilityZones",
          "ec2:ModifyNetworkInterfaceAttribute",
          "ec2:CreateNetworkInterfacePermission",
          "ec2:DescribeSecurityGroups"
        ]
        Resource = "*"
      }
    ]
  })
}`,
  setupGuide: `1. Open IAM Console > Policies > Create Policy.
2. Select the JSON tab and paste the policy document.
3. Name the policy "InfobloxUDDI-CloudForwarding-FullManagement".
4. Attach the policy to the IAM role used by Infoblox Universal DDI.`
};

const multiAccount = {
  id: 'multiAccount',
  name: 'Multi-Account',
  question: 'Cross-account discovery via AWS Organizations?',
  policies: [
    {
      name: 'Trust Policy',
      type: 'trust',
      description: 'IAM role trust policy for sub-account discovery roles. Allows the Infoblox UDDI service to assume the role with External ID verification.',
      document: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: 'arn:aws:iam::902917483333:root' },
            Action: 'sts:AssumeRole',
            Condition: {
              StringEquals: { 'sts:ExternalId': '<YOUR_EXTERNAL_ID>' }
            }
          }
        ]
      }
    },
    {
      name: 'Organizations Read-Only',
      type: 'organizations',
      description: 'AWS managed policy for listing organization accounts. Attach to the management account IAM user or role.',
      managedPolicyArn: 'arn:aws:iam::aws:policy/AWSOrganizationsReadOnlyAccess',
      document: null
    },
    {
      name: 'STS AssumeRole',
      type: 'sts',
      description: 'Allows the management account to assume the discovery role in each sub-account.',
      document: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: 'sts:AssumeRole',
            Resource: 'arn:aws:iam::*:role/InfobloxUDDI-DiscoveryRole'
          }
        ]
      }
    }
  ],
  rationale: {
    'Trust Policy': 'Allows Infoblox UDDI service account to assume the discovery role in sub-accounts with External ID for security',
    'Organizations Read-Only': 'Enables listing all accounts in the AWS Organization for automated multi-account discovery',
    'STS AssumeRole': 'Permits the management account to assume the discovery role in each sub-account'
  },
  terraform: `# Sub-account: Discovery role with trust policy
resource "aws_iam_role" "infoblox_uddi_discovery_role" {
  name = "InfobloxUDDI-DiscoveryRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::902917483333:root"
        }
        Action = "sts:AssumeRole"
        Condition = {
          StringEquals = {
            "sts:ExternalId" = var.infoblox_external_id
          }
        }
      }
    ]
  })
}

# Sub-account: Attach discovery policies to the role
# (attach the individual feature policies created above)

# Management account: Organizations read-only access
resource "aws_iam_role_policy_attachment" "infoblox_uddi_org_readonly" {
  role       = aws_iam_role.infoblox_uddi_management_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSOrganizationsReadOnlyAccess"
}

# Management account: STS AssumeRole policy
resource "aws_iam_policy" "infoblox_uddi_sts_assume_role" {
  name        = "InfobloxUDDI-STSAssumeRole"
  description = "Infoblox Universal DDI - Allow assuming discovery role in sub-accounts"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "sts:AssumeRole"
        Resource = "arn:aws:iam::*:role/InfobloxUDDI-DiscoveryRole"
      }
    ]
  })
}`,
  setupGuide: `1. In each sub-account: Create IAM role "InfobloxUDDI-DiscoveryRole" with the trust policy.
2. Attach the relevant discovery policies (VPC/IPAM, EC2, DNS, etc.) to each sub-account role.
3. In the management account: Attach the "AWSOrganizationsReadOnlyAccess" managed policy.
4. Create the STS AssumeRole policy and attach it to the management account IAM user or role.
5. Enter the External ID from Infoblox Portal when configuring the trust policy.`
};

/**
 * All AWS feature categories for the UDDI Permission Scope Helper.
 *
 * Keys are feature IDs, values contain actions, terraform, setupGuide, and rationale.
 * DNS (Route 53) and Cloud Forwarding have sub-feature variants as separate entries.
 * Multi-Account uses a policies array instead of actions.
 */
export const AWS_FEATURES = {
  vpcIpamDiscovery,
  ec2Networking,
  s3BucketVisibility,
  dnsRoute53ReadOnly,
  dnsRoute53Bidirectional,
  cloudForwardingDiscovery,
  cloudForwardingFull,
  multiAccount
};
