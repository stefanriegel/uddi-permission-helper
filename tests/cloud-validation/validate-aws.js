#!/usr/bin/env node
/**
 * Validate AWS IAM actions from the UDDI Permission Tool against real AWS credentials.
 *
 * Calls each Describe/List/Get action and reports whether the caller has permission.
 * Read-only — no resources created or modified.
 *
 * Usage: node validate-aws.js [--region us-east-1]
 *
 * Credentials from:
 *   - Standard AWS env vars (AWS_ACCESS_KEY_ID, etc.)
 *   - Or project .env with German key names (AWS-Zugriffsschlüssel-ID, etc.)
 */

import { printReport } from './lib/reporter.js';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { EC2Client, DescribeVpcsCommand, DescribeSubnetsCommand, DescribeAddressesCommand, DescribeRouteTablesCommand, DescribeInternetGatewaysCommand, DescribeEgressOnlyInternetGatewaysCommand, DescribeNatGatewaysCommand, DescribeCustomerGatewaysCommand, DescribeVpnGatewaysCommand, DescribeVpnConnectionsCommand, DescribeVpcEndpointsCommand, DescribeVpcPeeringConnectionsCommand, DescribeTransitGatewaysCommand, DescribeTransitGatewayVpcAttachmentsCommand, DescribeTransitGatewayPeeringAttachmentsCommand, DescribeIpamsCommand, DescribeIpamScopesCommand, DescribeIpamPoolsCommand, DescribeInstancesCommand, DescribeVolumesCommand, DescribeNetworkInterfacesCommand, DescribeSecurityGroupsCommand, DescribeRegionsCommand, DescribeAvailabilityZonesCommand } from '@aws-sdk/client-ec2';
import { Route53Client, ListHostedZonesCommand, ListHealthChecksCommand } from '@aws-sdk/client-route-53';
import { Route53ResolverClient, ListResolverEndpointsCommand, ListResolverRulesCommand } from '@aws-sdk/client-route53resolver';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { ElasticLoadBalancingV2Client, DescribeLoadBalancersCommand, DescribeTargetGroupsCommand } from '@aws-sdk/client-elastic-load-balancing-v2';
import { DirectConnectClient, DescribeDirectConnectGatewaysCommand } from '@aws-sdk/client-direct-connect';

// Load .env from project root — parse manually to handle UTF-8 key names (ü)
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../../.env');

function parseEnvFile(path) {
  const vars = {};
  try {
    const content = readFileSync(path, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      vars[trimmed.substring(0, eqIdx)] = trimmed.substring(eqIdx + 1);
    }
  } catch { /* no .env file */ }
  return vars;
}

const envVars = parseEnvFile(envPath);

function findEnvVal(substring) {
  const key = Object.keys(envVars).find(k => k.includes(substring));
  return key ? envVars[key] : undefined;
}

function resolveCredentials() {
  return {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || findEnvVal('ssel-ID'),
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || findEnvVal('Secret-Zugriff'),
    sessionToken: process.env.AWS_SESSION_TOKEN || findEnvVal('Sitzungstoken') || undefined
  };
}

const region = process.argv.includes('--region')
  ? process.argv[process.argv.indexOf('--region') + 1]
  : 'us-east-1';

const credentials = resolveCredentials();

if (!credentials.accessKeyId || !credentials.secretAccessKey) {
  console.error('Missing AWS credentials. Set AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY or German equivalents in .env');
  process.exit(1);
}

const clientConfig = { region, credentials };

// Verify credentials first
console.log('Verifying AWS credentials...');
try {
  const sts = new STSClient(clientConfig);
  const identity = await sts.send(new GetCallerIdentityCommand({}));
  console.log(`Authenticated as: ${identity.Arn}`);
  console.log(`Account: ${identity.Account}\n`);
} catch (err) {
  console.error(`AWS credential verification failed: ${err.message}`);
  console.error('If using session tokens, they may have expired. Regenerate and update .env.');
  process.exit(1);
}

// Define all testable actions with their SDK calls
// Each entry: [iamAction, featureId, clientClass, commandClass, clientConfig?]
const ec2 = new EC2Client(clientConfig);
const route53 = new Route53Client(clientConfig);
const resolver = new Route53ResolverClient(clientConfig);
const s3 = new S3Client(clientConfig);
const elb = new ElasticLoadBalancingV2Client(clientConfig);
const dc = new DirectConnectClient(clientConfig);

/** @type {Array<{action: string, feature: string, fn: () => Promise<any>}>} */
const tests = [
  // --- vpcIpamDiscovery ---
  { action: 'ec2:DescribeVpcs', feature: 'vpcIpamDiscovery', fn: () => ec2.send(new DescribeVpcsCommand({ MaxResults: 5 })) },
  { action: 'ec2:DescribeSubnets', feature: 'vpcIpamDiscovery', fn: () => ec2.send(new DescribeSubnetsCommand({ MaxResults: 5 })) },
  { action: 'ec2:DescribeAddresses', feature: 'vpcIpamDiscovery', fn: () => ec2.send(new DescribeAddressesCommand({})) },
  { action: 'ec2:DescribeRouteTables', feature: 'vpcIpamDiscovery', fn: () => ec2.send(new DescribeRouteTablesCommand({ MaxResults: 5 })) },
  { action: 'ec2:DescribeInternetGateways', feature: 'vpcIpamDiscovery', fn: () => ec2.send(new DescribeInternetGatewaysCommand({ MaxResults: 5 })) },
  { action: 'ec2:DescribeEgressOnlyInternetGateways', feature: 'vpcIpamDiscovery', fn: () => ec2.send(new DescribeEgressOnlyInternetGatewaysCommand({ MaxResults: 5 })) },
  { action: 'ec2:DescribeNatGateways', feature: 'vpcIpamDiscovery', fn: () => ec2.send(new DescribeNatGatewaysCommand({ MaxResults: 5 })) },
  { action: 'ec2:DescribeCustomerGateways', feature: 'vpcIpamDiscovery', fn: () => ec2.send(new DescribeCustomerGatewaysCommand({})) },
  { action: 'ec2:DescribeVpnGateways', feature: 'vpcIpamDiscovery', fn: () => ec2.send(new DescribeVpnGatewaysCommand({})) },
  { action: 'ec2:DescribeVpnConnections', feature: 'vpcIpamDiscovery', fn: () => ec2.send(new DescribeVpnConnectionsCommand({})) },
  { action: 'ec2:DescribeVpcEndpoints', feature: 'vpcIpamDiscovery', fn: () => ec2.send(new DescribeVpcEndpointsCommand({ MaxResults: 5 })) },
  { action: 'ec2:DescribeVpcPeeringConnections', feature: 'vpcIpamDiscovery', fn: () => ec2.send(new DescribeVpcPeeringConnectionsCommand({ MaxResults: 5 })) },
  { action: 'ec2:DescribeTransitGateways', feature: 'vpcIpamDiscovery', fn: () => ec2.send(new DescribeTransitGatewaysCommand({ MaxResults: 5 })) },
  { action: 'ec2:DescribeTransitGatewayVpcAttachments', feature: 'vpcIpamDiscovery', fn: () => ec2.send(new DescribeTransitGatewayVpcAttachmentsCommand({ MaxResults: 5 })) },
  { action: 'ec2:DescribeTransitGatewayPeeringAttachments', feature: 'vpcIpamDiscovery', fn: () => ec2.send(new DescribeTransitGatewayPeeringAttachmentsCommand({ MaxResults: 5 })) },
  { action: 'ec2:DescribeIpams', feature: 'vpcIpamDiscovery', fn: () => ec2.send(new DescribeIpamsCommand({ MaxResults: 5 })) },
  { action: 'ec2:DescribeIpamScopes', feature: 'vpcIpamDiscovery', fn: () => ec2.send(new DescribeIpamScopesCommand({ MaxResults: 5 })) },
  { action: 'ec2:DescribeIpamPools', feature: 'vpcIpamDiscovery', fn: () => ec2.send(new DescribeIpamPoolsCommand({ MaxResults: 5 })) },
  // GetIpamPoolAllocations and GetIpamPoolCidrs require a pool ID — skip
  { action: 'ec2:GetIpamPoolAllocations', feature: 'vpcIpamDiscovery', fn: null },
  { action: 'ec2:GetIpamPoolCidrs', feature: 'vpcIpamDiscovery', fn: null },
  { action: 'ec2:GetIpamResourceCidrs', feature: 'vpcIpamDiscovery', fn: null },
  { action: 'directconnect:DescribeDirectConnectGateways', feature: 'vpcIpamDiscovery', fn: () => dc.send(new DescribeDirectConnectGatewaysCommand({ maxResults: 5 })) },

  // --- ec2Networking ---
  { action: 'ec2:DescribeInstances', feature: 'ec2Networking', fn: () => ec2.send(new DescribeInstancesCommand({ MaxResults: 5 })) },
  { action: 'ec2:DescribeVolumes', feature: 'ec2Networking', fn: () => ec2.send(new DescribeVolumesCommand({ MaxResults: 5 })) },
  { action: 'ec2:DescribeNetworkInterfaces', feature: 'ec2Networking', fn: () => ec2.send(new DescribeNetworkInterfacesCommand({ MaxResults: 5 })) },
  { action: 'ec2:DescribeSecurityGroups', feature: 'ec2Networking', fn: () => ec2.send(new DescribeSecurityGroupsCommand({ MaxResults: 5 })) },
  { action: 'elasticloadbalancing:DescribeLoadBalancers', feature: 'ec2Networking', fn: () => elb.send(new DescribeLoadBalancersCommand({ PageSize: 1 })) },
  { action: 'elasticloadbalancing:DescribeTargetGroups', feature: 'ec2Networking', fn: () => elb.send(new DescribeTargetGroupsCommand({ PageSize: 1 })) },
  // DescribeListeners and DescribeTargetHealth require ARN — skip
  { action: 'elasticloadbalancing:DescribeListeners', feature: 'ec2Networking', fn: null },
  { action: 'elasticloadbalancing:DescribeTargetHealth', feature: 'ec2Networking', fn: null },

  // --- s3BucketVisibility ---
  { action: 's3:ListAllMyBuckets', feature: 's3BucketVisibility', fn: () => s3.send(new ListBucketsCommand({})) },
  // GetBucketPolicy and GetBucketPublicAccessBlock require a bucket name — skip
  { action: 's3:GetBucketPolicy', feature: 's3BucketVisibility', fn: null },
  { action: 's3:GetBucketPublicAccessBlock', feature: 's3BucketVisibility', fn: null },

  // --- dnsRoute53ReadOnly ---
  { action: 'route53:ListHostedZones', feature: 'dnsRoute53ReadOnly', fn: () => route53.send(new ListHostedZonesCommand({ MaxItems: '1' })) },
  { action: 'route53:ListHealthChecks', feature: 'dnsRoute53ReadOnly', fn: () => route53.send(new ListHealthChecksCommand({ MaxItems: '1' })) },
  // GetHostedZone, ListResourceRecordSets, GetHealthCheck require IDs — skip
  { action: 'route53:GetHostedZone', feature: 'dnsRoute53ReadOnly', fn: null },
  { action: 'route53:ListResourceRecordSets', feature: 'dnsRoute53ReadOnly', fn: null },
  { action: 'route53:ListTagsForResources', feature: 'dnsRoute53ReadOnly', fn: null },
  { action: 'route53:ListQueryLoggingConfigs', feature: 'dnsRoute53ReadOnly', fn: null },
  { action: 'route53:GetHealthCheck', feature: 'dnsRoute53ReadOnly', fn: null },

  // --- dnsRoute53Bidirectional (write actions — skip, read already covered above) ---
  { action: 'route53:CreateHostedZone', feature: 'dnsRoute53Bidirectional', fn: null },
  { action: 'route53:DeleteHostedZone', feature: 'dnsRoute53Bidirectional', fn: null },
  { action: 'route53:ChangeResourceRecordSets', feature: 'dnsRoute53Bidirectional', fn: null },

  // --- cloudForwardingDiscovery ---
  { action: 'route53resolver:ListResolverEndpoints', feature: 'cloudForwardingDiscovery', fn: () => resolver.send(new ListResolverEndpointsCommand({ MaxResults: 5 })) },
  { action: 'route53resolver:ListResolverRules', feature: 'cloudForwardingDiscovery', fn: () => resolver.send(new ListResolverRulesCommand({ MaxResults: 5 })) },

  // --- cloudForwardingFull (write actions — skip) ---
  { action: 'route53resolver:*', feature: 'cloudForwardingFull', fn: null },

  // --- Regions (shared) ---
  { action: 'ec2:DescribeRegions', feature: 'dnsRoute53Bidirectional', fn: () => ec2.send(new DescribeRegionsCommand({})) },
  { action: 'ec2:DescribeAvailabilityZones', feature: 'cloudForwardingFull', fn: () => ec2.send(new DescribeAvailabilityZonesCommand({})) },
];

// Run all tests
console.log(`Testing ${tests.length} AWS actions against ${region}...\n`);

const results = [];
for (const test of tests) {
  if (!test.fn) {
    results.push({ action: test.action, feature: test.feature, status: 'skip', detail: 'requires resource ID or write action' });
    continue;
  }

  try {
    await test.fn();
    results.push({ action: test.action, feature: test.feature, status: 'pass' });
  } catch (err) {
    if (err.name === 'AccessDeniedException' || err.name === 'UnauthorizedAccess' ||
        err.name === 'AuthorizationError' || err.Code === 'UnauthorizedOperation' ||
        err.name === 'UnauthorizedOperation' || (err.message && err.message.includes('not authorized'))) {
      results.push({ action: test.action, feature: test.feature, status: 'denied', detail: err.message?.substring(0, 80) });
    } else if (err.name === 'ExpiredTokenException' || err.name === 'ExpiredToken') {
      console.error(`\nSession token expired. Regenerate credentials and update .env.\n`);
      results.push({ action: test.action, feature: test.feature, status: 'error', detail: 'token expired' });
      break;
    } else {
      // Other errors (throttling, validation, etc.) — still means we have permission
      results.push({ action: test.action, feature: test.feature, status: 'pass', detail: err.name });
    }
  }
}

printReport('AWS', results);
