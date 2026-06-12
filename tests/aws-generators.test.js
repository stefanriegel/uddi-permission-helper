/**
 * Tests for AWS data module generator functions.
 *
 * Covers: getAwsActions, generateAwsPolicy, generateAwsTerraform, generateAwsGuide
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  AWS_FEATURES,
  AWS_READ_ONLY_POLICY_STATEMENTS,
  getAwsActions,
  generateAwsPolicy,
  generateAwsCli,
  generateAwsTerraform,
  generateAwsGuide
} from '../js/data/aws.js';
import { buildAnnotatedAwsPolicy } from '../js/output.js';

// --- getAwsActions ---

describe('getAwsActions', () => {
  it('returns empty array for empty input', () => {
    const result = getAwsActions([]);
    assert.deepStrictEqual(result, []);
  });

  it('returns empty array for multiAccount (no actions property)', () => {
    const result = getAwsActions(['multiAccount']);
    assert.deepStrictEqual(result, []);
  });

  it('returns the complete 68-action shared read-only baseline for an AWS discovery capability', () => {
    const result = getAwsActions(['vpcIpamDiscovery']);
    assert.equal(result.length, 68);
    assert.equal(result.length, new Set(result).size, 'should have no duplicates');
    const sorted = [...result].sort();
    assert.deepStrictEqual(result, sorted, 'should be sorted alphabetically');
  });

  it('does not duplicate the shared baseline when multiple read-only capabilities are selected', () => {
    const result = getAwsActions(['vpcIpamDiscovery', 'ec2Networking']);
    assert.equal(result.length, 68);
    assert.equal(result.length, new Set(result).size, 'should have no duplicates');
  });

  it('adds only bidirectional DNS management actions to the shared baseline', () => {
    const result = getAwsActions(['vpcIpamDiscovery', 'dnsRoute53Bidirectional']);
    assert.equal(result.length, 74);
    assert.equal(result.length, new Set(result).size, 'should have no duplicates');
  });

  it('does not duplicate the shared baseline for cloud forwarding discovery', () => {
    const result = getAwsActions(['vpcIpamDiscovery', 'cloudForwardingDiscovery']);
    assert.equal(result.length, 68);
    assert.equal(result.length, new Set(result).size, 'should have no duplicates');
  });

  it('returns sorted array', () => {
    const result = getAwsActions(['ec2Networking', 'vpcIpamDiscovery']);
    for (let i = 1; i < result.length; i++) {
      assert.ok(result[i] >= result[i - 1], `${result[i]} should come after ${result[i - 1]}`);
    }
  });

  it('selecting all features produces deduplicated superset', () => {
    const allIds = Object.keys(AWS_FEATURES);
    const result = getAwsActions(allIds);
    assert.equal(result.length, new Set(result).size, 'should have no duplicates');
    assert.ok(result.length > 0, 'should have some actions');
  });
});

// --- generateAwsPolicy ---

describe('generateAwsPolicy', () => {
  it('matches the Infoblox least-privilege policy snapshot exactly', () => {
    const expected = JSON.parse(
      readFileSync(
        new URL('./fixtures/aws-read-only-policy.json', import.meta.url),
        'utf8'
      )
    );

    assert.deepStrictEqual(
      JSON.parse(generateAwsPolicy(['vpcIpamDiscovery'])),
      expected
    );
  });

  it('produces valid JSON for the policy shown and downloaded by the UI', () => {
    const policyOutput = buildAnnotatedAwsPolicy(['vpcIpamDiscovery']);
    const parsed = JSON.parse(policyOutput);

    assert.equal(parsed.Statement.length, 10);
  });

  it('emits the documented 68-action read-only policy as 10 named statements', () => {
    const parsed = JSON.parse(generateAwsPolicy(['vpcIpamDiscovery']));
    const actions = parsed.Statement.flatMap(statement => statement.Action);

    assert.equal(parsed.Statement.length, 10);
    assert.equal(actions.length, 68);
    assert.equal(new Set(actions).size, 68);
    assert.deepStrictEqual(
      parsed.Statement.map(statement => statement.Sid),
      [
        'S3BucketMetadataReadOnly',
        'VPCSubnetRouteReadOnly',
        'IPAMReadOnly',
        'SecurityGroupReadOnly',
        'StorageVolumeReadOnly',
        'LoadBalancerReadOnly',
        'DirectConnectReadOnly',
        'CloudWatchReadOnly',
        'Route53ReadOnly',
        'Route53ResolverReadOnly'
      ]
    );
    assert.ok(parsed.Statement.every(statement => statement.Resource === '*'));
  });

  it('returns valid JSON with correct IAM structure for vpcIpamDiscovery', () => {
    const json = generateAwsPolicy(['vpcIpamDiscovery']);
    const parsed = JSON.parse(json);
    assert.equal(parsed.Version, '2012-10-17');
    assert.ok(Array.isArray(parsed.Statement), 'Statement should be an array');
    assert.equal(parsed.Statement.length, 10);
    assert.ok(parsed.Statement.every(statement => statement.Effect === 'Allow'));
    assert.ok(parsed.Statement.every(statement => statement.Resource === '*'));
  });

  it('includes Sid field in statement', () => {
    const json = generateAwsPolicy(['vpcIpamDiscovery']);
    const parsed = JSON.parse(json);
    assert.ok(parsed.Statement[0].Sid, 'Statement should have Sid');
  });

  it('deduplicates actions in policy output', () => {
    const json = generateAwsPolicy(['vpcIpamDiscovery', 'dnsRoute53Bidirectional']);
    const parsed = JSON.parse(json);
    const actions = parsed.Statement.flatMap(statement => statement.Action);
    assert.equal(parsed.Statement.length, 11);
    assert.equal(actions.length, 74);
    assert.equal(new Set(actions).size, 74);
  });

  it('returns empty statement actions for empty input', () => {
    const json = generateAwsPolicy([]);
    const parsed = JSON.parse(json);
    assert.equal(parsed.Statement[0].Action.length, 0);
  });

  it('preserves named audit blocks for non-S3 feature selections', () => {
    const json = generateAwsPolicy(['vpcIpamDiscovery']);
    const parsed = JSON.parse(json);
    assert.equal(parsed.Statement.length, 10);
    assert.equal(parsed.Statement[0].Sid, 'S3BucketMetadataReadOnly');
  });

  it('uses the documented wildcard resource for S3 metadata reads', () => {
    const json = generateAwsPolicy(['s3BucketVisibility']);
    const parsed = JSON.parse(json);
    const s3Statement = parsed.Statement.find(
      statement => statement.Sid === 'S3BucketMetadataReadOnly'
    );

    assert.equal(parsed.Statement.length, 10);
    assert.equal(s3Statement.Action.length, 7);
    assert.equal(s3Statement.Resource, '*');
  });

  it('mixed read-only features still produce one shared documented policy', () => {
    const json = generateAwsPolicy(['vpcIpamDiscovery', 's3BucketVisibility']);
    const parsed = JSON.parse(json);
    assert.equal(parsed.Statement.length, 10);
    assert.equal(parsed.Statement.flatMap(statement => statement.Action).length, 68);
  });
});

// --- generateAwsTerraform ---

describe('generateAwsCli', () => {
  it('contains create-policy and attach-role-policy for standard features', () => {
    const cli = generateAwsCli(['vpcIpamDiscovery']);
    assert.ok(cli.includes('aws iam create-policy'));
    assert.ok(cli.includes('aws iam attach-role-policy'));
    assert.ok(cli.includes('infoblox-uddi-policy.json'));
  });

  it('creates only the direct Infoblox-trusted member-account role for multi-account discovery', () => {
    const cli = generateAwsCli(['multiAccount']);
    assert.ok(cli.includes('aws iam create-role'));
    assert.ok(cli.includes('InfobloxUDDI-DiscoveryRole'));
    assert.ok(cli.includes('902917483333'));
    assert.ok(cli.includes('sts:ExternalId'));
    assert.ok(!cli.includes('AWSOrganizationsReadOnlyAccess'));
    assert.ok(!cli.includes('InfobloxUDDI-ManagementRole'));
    assert.ok(!cli.includes('InfobloxUDDI-STSAssumeRole'));
  });
});

describe('generateAwsTerraform', () => {
  it('contains the complete documented read-only policy with matching statement IDs', () => {
    const tf = generateAwsTerraform(['vpcIpamDiscovery']);

    for (const statement of AWS_READ_ONLY_POLICY_STATEMENTS) {
      assert.ok(tf.includes(statement.Sid), `missing Terraform statement ${statement.Sid}`);
      for (const action of statement.Action) {
        assert.ok(tf.includes(`"${action}"`), `missing Terraform action ${action}`);
      }
    }
    assert.ok(!tf.includes('arn:aws:s3:::*'));
  });

  it('contains aws_iam_policy resource for standard features', () => {
    const tf = generateAwsTerraform(['vpcIpamDiscovery']);
    assert.ok(tf.includes('resource "aws_iam_policy"'), 'should contain aws_iam_policy resource');
  });

  it('creates only the directly Infoblox-trusted role for multiAccount', () => {
    const tf = generateAwsTerraform(['multiAccount']);
    assert.ok(tf.includes('resource "aws_iam_role" "infoblox_uddi_discovery_role"'));
    assert.ok(tf.includes('arn:aws:iam::902917483333:root'));
    assert.ok(tf.includes('"sts:ExternalId"'));
    assert.ok(!tf.includes('infoblox_uddi_management_role'));
    assert.ok(!tf.includes('AWSOrganizationsReadOnlyAccess'));
    assert.ok(!tf.includes('infoblox_uddi_sts_assume_role'));
  });

  it('contains combined policy for multiple features', () => {
    const tf = generateAwsTerraform(['vpcIpamDiscovery', 'ec2Networking']);
    assert.ok(tf.includes('resource "aws_iam_policy"'), 'should contain aws_iam_policy');
  });

  it('includes multiAccount role AND standard policy when both selected', () => {
    const tf = generateAwsTerraform(['vpcIpamDiscovery', 'multiAccount']);
    assert.ok(tf.includes('resource "aws_iam_policy"'), 'should have policy');
    assert.ok(tf.includes('aws_iam_role'), 'should have role');
    assert.ok(tf.includes('policy_arn = aws_iam_policy.infoblox_uddi_discovery.arn'), 'should attach discovery policy to sub-account role');
  });

  it('uses wildcard resources for the documented S3 metadata statement', () => {
    const tf = generateAwsTerraform(['s3BucketVisibility']);
    assert.ok(tf.includes('S3BucketMetadataReadOnly'));
    assert.ok(tf.includes('Resource = "*"'));
    assert.ok(!tf.includes('arn:aws:s3:::*'));
  });
});

// --- generateAwsGuide ---

describe('generateAwsGuide', () => {
  it('returns numbered steps for standard features', () => {
    const guide = generateAwsGuide(['vpcIpamDiscovery']);
    assert.ok(guide.includes('1.'), 'should have step 1');
    assert.ok(guide.includes('IAM'), 'should mention IAM');
    assert.ok(guide.length > 50, 'guide should be substantive');
  });

  it('includes multi-account steps when multiAccount selected', () => {
    const guide = generateAwsGuide(['multiAccount']);
    assert.ok(guide.includes('every AWS account'));
    assert.ok(guide.includes('arn:aws:iam::902917483333:root'));
    assert.ok(guide.includes('External ID'));
    assert.ok(guide.includes('every account role ARN'));
    assert.ok(!guide.includes('management account'));
    assert.ok(!guide.includes('AWSOrganizationsReadOnlyAccess'));
    assert.ok(!guide.includes('STS AssumeRole policy'));
  });

  it('combines standard and multi-account guidance', () => {
    const guide = generateAwsGuide(['vpcIpamDiscovery', 'multiAccount']);
    assert.ok(guide.includes('1.'), 'should have numbered steps');
    assert.ok(guide.length > 100, 'combined guide should be longer');
  });
});
