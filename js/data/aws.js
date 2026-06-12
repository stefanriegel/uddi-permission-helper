/**
 * AWS permission data for UDDI Permission Scope Helper.
 *
 * AWS IAM permission data, Terraform HCL templates, setup guides, and
 * per-action rationale strings. The shared read-only baseline is sourced
 * from the Infoblox AWS Least Privilege IAM Permissions article.
 */

export const AWS_READ_ONLY_POLICY_STATEMENTS = [
  {
    Sid: 'S3BucketMetadataReadOnly',
    Effect: 'Allow',
    Action: [
      's3:ListAllMyBuckets',
      's3:GetBucketLocation',
      's3:GetBucketWebsite',
      's3:GetBucketPublicAccessBlock',
      's3:GetBucketAcl',
      's3:GetBucketPolicy',
      's3:GetBucketPolicyStatus'
    ],
    Resource: '*'
  },
  {
    Sid: 'VPCSubnetRouteReadOnly',
    Effect: 'Allow',
    Action: [
      'ec2:DescribeRegions',
      'ec2:DescribeVpcs',
      'ec2:DescribeVpcAttribute',
      'ec2:DescribeVpcPeeringConnections',
      'ec2:DescribeSubnets',
      'ec2:DescribeRouteTables',
      'ec2:DescribeAvailabilityZones',
      'ec2:DescribeManagedPrefixLists',
      'ec2:DescribeInternetGateways',
      'ec2:DescribeEgressOnlyInternetGateways',
      'ec2:DescribeNatGateways',
      'ec2:DescribeTransitGateways',
      'ec2:DescribeTransitGatewayVpcAttachments',
      'ec2:DescribeTransitGatewayPeeringAttachments',
      'ec2:DescribeAddresses',
      'ec2:DescribeNetworkAcls',
      'ec2:DescribeNetworkInterfaces',
      'ec2:DescribeVpcEndpoints',
      'ec2:DescribeVpnConnections',
      'ec2:DescribeVpnGateways',
      'ec2:DescribeCustomerGateways'
    ],
    Resource: '*'
  },
  {
    Sid: 'IPAMReadOnly',
    Effect: 'Allow',
    Action: [
      'ec2:DescribeIpams',
      'ec2:DescribeIpamPools',
      'ec2:DescribeIpamScopes',
      'ec2:DescribeIpamResourceDiscoveries',
      'ec2:GetIpamPoolCidrs',
      'ec2:GetIpamPoolAllocations',
      'ec2:GetIpamResourceCidrs'
    ],
    Resource: '*'
  },
  {
    Sid: 'SecurityGroupReadOnly',
    Effect: 'Allow',
    Action: [
      'ec2:DescribeSecurityGroups',
      'ec2:DescribeSecurityGroupRules',
      'ec2:DescribeSecurityGroupReferences',
      'ec2:DescribeStaleSecurityGroups',
      'ec2:DescribeInstances'
    ],
    Resource: '*'
  },
  {
    Sid: 'StorageVolumeReadOnly',
    Effect: 'Allow',
    Action: [
      'ec2:DescribeVolumes',
      'ec2:DescribeVolumeStatus',
      'ec2:DescribeSnapshots',
      'ec2:DescribeSnapshotAttribute'
    ],
    Resource: '*'
  },
  {
    Sid: 'LoadBalancerReadOnly',
    Effect: 'Allow',
    Action: [
      'elasticloadbalancing:DescribeLoadBalancers',
      'elasticloadbalancing:DescribeLoadBalancerAttributes',
      'elasticloadbalancing:DescribeListeners',
      'elasticloadbalancing:DescribeRules',
      'elasticloadbalancing:DescribeTargetGroups',
      'elasticloadbalancing:DescribeTargetHealth'
    ],
    Resource: '*'
  },
  {
    Sid: 'DirectConnectReadOnly',
    Effect: 'Allow',
    Action: [
      'directconnect:DescribeDirectConnectGateways',
      'directconnect:DescribeDirectConnectGatewayAttachments',
      'directconnect:DescribeConnections',
      'directconnect:DescribeVirtualInterfaces'
    ],
    Resource: '*'
  },
  {
    Sid: 'CloudWatchReadOnly',
    Effect: 'Allow',
    Action: [
      'cloudwatch:ListMetrics',
      'cloudwatch:GetMetricStatistics',
      'cloudwatch:GetMetricData'
    ],
    Resource: '*'
  },
  {
    Sid: 'Route53ReadOnly',
    Effect: 'Allow',
    Action: [
      'route53:GetHostedZone',
      'route53:ListHostedZones',
      'route53:ListResourceRecordSets',
      'route53:ListTagsForResources',
      'route53:ListQueryLoggingConfigs',
      'route53:GetHealthCheck',
      'route53:ListHealthChecks'
    ],
    Resource: '*'
  },
  {
    Sid: 'Route53ResolverReadOnly',
    Effect: 'Allow',
    Action: [
      'route53resolver:ListResolverEndpoints',
      'route53resolver:ListResolverEndpointIpAddresses',
      'route53resolver:ListResolverRules',
      'route53resolver:ListResolverRuleAssociations'
    ],
    Resource: '*'
  }
];

export const AWS_SHARED_READ_ONLY_ACTIONS = [
  ...new Set(AWS_READ_ONLY_POLICY_STATEMENTS.flatMap(statement => statement.Action))
].sort();

const vpcIpamDiscovery = {
  id: 'vpcIpamDiscovery',
  product: 'assetInsight',
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
  product: 'assetInsight',
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
  product: 'assetInsight',
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
  product: 'ddi',
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
  product: 'ddi',
  name: 'DNS (Route 53) - Bidirectional',
  question: 'Sync DNS zones?',
  subQuestion: 'Bidirectional (read and write)',
  actions: [
    'route53:GetHostedZone',
    'route53:ListHostedZones',
    'route53:ListResourceRecordSets',
    'route53:ListTagsForResources',
    'route53:ListQueryLoggingConfigs',
    'route53:CreateHostedZone',
    'route53:DeleteHostedZone',
    'route53:ChangeResourceRecordSets',
    'route53:UpdateHostedZoneComment',
    'route53:ListVPCAssociationAuthorizations',
    'route53:ListTrafficPolicyInstancesByHostedZone',
    'ec2:DescribeRegions',
    'ec2:DescribeVpcs'
  ],
  rationale: {
    'route53:GetHostedZone': 'Retrieve hosted zone details and configuration',
    'route53:ListHostedZones': 'Enumerate all Route 53 hosted zones',
    'route53:ListResourceRecordSets': 'Read DNS records within hosted zones',
    'route53:ListTagsForResources': 'Read tags on hosted zones for organization and filtering',
    'route53:ListQueryLoggingConfigs': 'Discover DNS query logging configurations',
    'route53:CreateHostedZone': 'Create new hosted zones for bidirectional DNS sync',
    'route53:DeleteHostedZone': 'Remove hosted zones during bidirectional cleanup',
    'route53:ChangeResourceRecordSets': 'Create, update, and delete DNS records',
    'route53:UpdateHostedZoneComment': 'Update hosted zone descriptions',
    'route53:ListVPCAssociationAuthorizations': 'List VPC association authorizations for private zones',
    'route53:ListTrafficPolicyInstancesByHostedZone': 'Enumerate traffic policy instances per zone',
    'ec2:DescribeRegions': 'List available AWS regions for zone association',
    'ec2:DescribeVpcs': 'List VPCs for private hosted zone VPC associations'
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
          "route53:CreateHostedZone",
          "route53:DeleteHostedZone",
          "route53:ChangeResourceRecordSets",
          "route53:UpdateHostedZoneComment",
          "route53:ListVPCAssociationAuthorizations",
          "route53:ListTrafficPolicyInstancesByHostedZone",
          "ec2:DescribeRegions",
          "ec2:DescribeVpcs"
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
  product: 'ddi',
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
  product: 'ddi',
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
  product: 'both',
  name: 'Multi-Account',
  question: 'Discovery across multiple AWS accounts?',
  policies: [
    {
      name: 'Trust Policy',
      type: 'trust',
      description: 'IAM role trust policy for each account. Allows the Infoblox UDDI service to assume the role with External ID verification.',
      document: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: 'arn:aws:iam::902917483333:root' },
            Action: 'sts:AssumeRole',
            Condition: {
              'ForAnyValue:StringEquals': { 'sts:ExternalId': ['<YOUR_EXTERNAL_ID>'] }
            }
          }
        ]
      }
    }
  ],
  rationale: {
    'Trust Policy': 'Allows the Infoblox UDDI service account to assume the discovery role directly in each configured AWS account with External ID verification'
  },
  terraform: `# Repeat this role in every AWS account that Infoblox should discover.
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
          "ForAnyValue:StringEquals" = {
            "sts:ExternalId" = [var.infoblox_external_id]
          }
        }
      }
    ]
  })
}`,
  setupGuide: `1. In every AWS account to discover, create IAM role "InfobloxUDDI-DiscoveryRole" with the Infoblox trust policy.
2. Require the External ID supplied by the Infoblox Portal.
3. Attach the generated discovery policy to the role in each account.
4. Configure each account role ARN in the Infoblox Portal.`
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

/**
 * Merge and deduplicate IAM actions from selected feature IDs.
 *
 * Skips features that lack an `actions` array (e.g., multiAccount).
 * Returns a sorted, unique array of IAM action strings.
 *
 * @param {string[]} selectedFeatureIds - Array of feature ID keys from AWS_FEATURES
 * @returns {string[]} Sorted, deduplicated IAM action strings
 */
export function getAwsActions(selectedFeatureIds) {
  const selectedCapabilities = selectedFeatureIds.filter(id => {
    const feature = AWS_FEATURES[id];
    return feature && Array.isArray(feature.actions);
  });

  if (selectedCapabilities.length === 0) {
    return [];
  }

  const allActions = [...AWS_SHARED_READ_ONLY_ACTIONS];
  for (const id of selectedFeatureIds) {
    const feature = AWS_FEATURES[id];
    if (feature && Array.isArray(feature.actions)) {
      allActions.push(...feature.actions);
    }
  }
  return [...new Set(allActions)].sort();
}

/**
 * Generate a complete AWS IAM policy JSON document from selected features.
 *
 * Produces the documented shared least-privilege read-only statements.
 * Selected management capabilities add their extra actions in a separate
 * statement while preserving the canonical read-only baseline.
 *
 * @param {string[]} selectedFeatureIds - Array of feature ID keys from AWS_FEATURES
 * @returns {string} Pretty-printed JSON policy string
 */
export function generateAwsPolicy(selectedFeatureIds) {
  const actions = getAwsActions(selectedFeatureIds);

  const statements = actions.length > 0
    ? AWS_READ_ONLY_POLICY_STATEMENTS.map(statement => ({
        ...statement,
        Action: [...statement.Action]
      }))
    : [];

  const additionalActions = actions.filter(
    action => !AWS_SHARED_READ_ONLY_ACTIONS.includes(action)
  );

  if (additionalActions.length > 0) {
    statements.push({
      Sid: 'InfobloxUDDIAdditionalManagement',
      Effect: 'Allow',
      Action: additionalActions,
      Resource: '*'
    });
  }

  // Fallback: if no actions at all, produce an empty statement
  if (statements.length === 0) {
    statements.push({
      Sid: 'InfobloxUDDIPermissions',
      Effect: 'Allow',
      Action: [],
      Resource: '*'
    });
  }

  const policy = {
    Version: '2012-10-17',
    Statement: statements
  };

  return JSON.stringify(policy, null, 2);
}

/**
 * Generate AWS CLI commands for the selected feature set.
 *
 * Produces CLI-ready commands using `aws iam create-policy`, `aws iam create-role`,
 * and `aws iam attach-role-policy`, with heredocs for the policy documents.
 *
 * @param {string[]} selectedFeatureIds - Array of feature ID keys from AWS_FEATURES
 * @returns {string} AWS CLI command sequence
 */
export function generateAwsCli(selectedFeatureIds) {
  const actions = getAwsActions(selectedFeatureIds);
  const parts = [];
  const hasMultiAccount = selectedFeatureIds.includes('multiAccount');

  if (actions.length > 0) {
    const policyJson = generateAwsPolicy(selectedFeatureIds);
    parts.push(`# Create the managed policy for the selected AWS permissions
cat > infoblox-uddi-policy.json <<'EOF'
${policyJson}
EOF

aws iam create-policy \\
  --policy-name "InfobloxUDDI-Discovery" \\
  --description "Infoblox Universal DDI - Combined discovery permissions" \\
  --policy-document file://infoblox-uddi-policy.json

aws iam attach-role-policy \\
  --role-name "<DISCOVERY_ROLE_NAME>" \\
  --policy-arn "arn:aws:iam::<ACCOUNT_ID>:policy/InfobloxUDDI-Discovery"`);
  }

  if (hasMultiAccount) {
    parts.push(`# Run in every AWS account that Infoblox should discover
cat > infoblox-uddi-discovery-trust-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::902917483333:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "ForAnyValue:StringEquals": {
          "sts:ExternalId": [
            "<INFOBLOX_EXTERNAL_ID>"
          ]
        }
      }
    }
  ]
}
EOF

aws iam create-role \\
  --role-name "InfobloxUDDI-DiscoveryRole" \\
  --assume-role-policy-document file://infoblox-uddi-discovery-trust-policy.json`);
  }

  return parts.join('\n\n');
}

/**
 * Generate combined Terraform HCL for selected AWS features.
 *
 * Produces a single aws_iam_policy resource with all deduplicated actions.
 * If multiAccount is selected, also generates the directly trusted discovery
 * role that must be deployed in each configured AWS account.
 *
 * @param {string[]} selectedFeatureIds - Array of feature ID keys from AWS_FEATURES
 * @returns {string} Terraform HCL string
 */
export function generateAwsTerraform(selectedFeatureIds) {
  const actions = getAwsActions(selectedFeatureIds);
  const parts = [];
  const hasMultiAccount = selectedFeatureIds.includes('multiAccount');

  if (actions.length > 0) {
    const policy = JSON.parse(generateAwsPolicy(selectedFeatureIds));
    const statementsHcl = policy.Statement.map(statement => {
      const actionsHcl = statement.Action
        .map(action => `          "${action}"`)
        .join(',\n');

      return `      {
        Sid    = "${statement.Sid}"
        Effect = "${statement.Effect}"
        Action = [
${actionsHcl}
        ]
        Resource = "${statement.Resource}"
      }`;
    });

    parts.push(`resource "aws_iam_policy" "infoblox_uddi_discovery" {
  name        = "InfobloxUDDI-Discovery"
  description = "Infoblox Universal DDI - Combined discovery permissions"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
${statementsHcl.join(',\n')}
    ]
  })
}`);
  }

  if (hasMultiAccount) {
    parts.push(`# Repeat this role in every AWS account that Infoblox should discover.
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
          "ForAnyValue:StringEquals" = {
            "sts:ExternalId" = [var.infoblox_external_id]
          }
        }
      }
    ]
  })
}`);
  }

  if (actions.length > 0 && hasMultiAccount) {
    parts.push(`resource "aws_iam_role_policy_attachment" "infoblox_uddi_discovery" {
  role       = aws_iam_role.infoblox_uddi_discovery_role.name
  policy_arn = aws_iam_policy.infoblox_uddi_discovery.arn
}`);
  }

  return parts.join('\n\n');
}

/**
 * Generate a combined step-by-step setup guide for selected AWS features.
 *
 * Standard features produce IAM Console instructions for creating policies
 * and roles. Multi-account adds sub-account role creation, trust policy
 * configuration, and External ID instructions.
 *
 * @param {string[]} selectedFeatureIds - Array of feature ID keys from AWS_FEATURES
 * @returns {string} Plain text guide with numbered steps
 */
export function generateAwsGuide(selectedFeatureIds) {
  const actions = getAwsActions(selectedFeatureIds);
  const hasMultiAccount = selectedFeatureIds.includes('multiAccount');
  const steps = [];
  let stepNum = 1;

  if (actions.length > 0) {
    steps.push(`${stepNum}. Open the AWS IAM Console and navigate to Policies > Create Policy.`);
    stepNum++;
    steps.push(`${stepNum}. Select the JSON tab and paste the generated policy document.`);
    stepNum++;
    steps.push(`${stepNum}. Name the policy "InfobloxUDDI-Discovery" and create it.`);
    stepNum++;
    steps.push(`${stepNum}. Create an IAM role named "InfobloxUDDI-DiscoveryRole". For the trusted entity, select "Another AWS account" and enter account ID 902917483333 (Infoblox service account).`);
    stepNum++;
    steps.push(`${stepNum}. Enable "Require external ID" and enter the External ID from the Infoblox Portal (found under cloud provider connection settings). This prevents confused deputy attacks.`);
    stepNum++;
    steps.push(`${stepNum}. Attach the "InfobloxUDDI-Discovery" policy to the role.`);
    stepNum++;
    steps.push(`${stepNum}. Copy the role ARN and configure it in the Infoblox Portal under cloud provider settings.`);
    stepNum++;
  }

  if (hasMultiAccount) {
    steps.push(`${stepNum}. Repeat the "InfobloxUDDI-DiscoveryRole" in every AWS account that Infoblox should discover, with the trust policy allowing arn:aws:iam::902917483333:root to assume it.`);
    stepNum++;
    steps.push(`${stepNum}. Require the External ID from the Infoblox Portal in each role trust policy.`);
    stepNum++;
    steps.push(`${stepNum}. Attach the generated "InfobloxUDDI-Discovery" policy to the role in each account.`);
    stepNum++;
    steps.push(`${stepNum}. Configure every account role ARN in the Infoblox Portal.`);
    stepNum++;
  }

  return steps.join('\n');
}
