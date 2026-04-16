/**
 * Tests for AWS data module generator functions.
 *
 * Covers: getAwsActions, generateAwsPolicy, generateAwsTerraform, generateAwsGuide
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AWS_FEATURES,
  getAwsActions,
  generateAwsPolicy,
  generateAwsTerraform,
  generateAwsGuide
} from '../js/data/aws.js';

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

  it('returns 21 sorted unique actions for vpcIpamDiscovery alone', () => {
    const result = getAwsActions(['vpcIpamDiscovery']);
    assert.equal(result.length, 21);
    assert.equal(result.length, new Set(result).size, 'should have no duplicates');
    const sorted = [...result].sort();
    assert.deepStrictEqual(result, sorted, 'should be sorted alphabetically');
  });

  it('returns 29 actions for vpcIpamDiscovery + ec2Networking (no overlap)', () => {
    const result = getAwsActions(['vpcIpamDiscovery', 'ec2Networking']);
    assert.equal(result.length, 29);
    assert.equal(result.length, new Set(result).size, 'should have no duplicates');
  });

  it('returns 35 actions for vpcIpamDiscovery + dnsRoute53Bidirectional (no overlap in data)', () => {
    const result = getAwsActions(['vpcIpamDiscovery', 'dnsRoute53Bidirectional']);
    assert.equal(result.length, 35);
    assert.equal(result.length, new Set(result).size, 'should have no duplicates');
  });

  it('returns 25 actions for vpcIpamDiscovery + cloudForwardingDiscovery (2 overlaps)', () => {
    const result = getAwsActions(['vpcIpamDiscovery', 'cloudForwardingDiscovery']);
    assert.equal(result.length, 25);
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
  it('returns valid JSON with correct IAM structure for vpcIpamDiscovery', () => {
    const json = generateAwsPolicy(['vpcIpamDiscovery']);
    const parsed = JSON.parse(json);
    assert.equal(parsed.Version, '2012-10-17');
    assert.ok(Array.isArray(parsed.Statement), 'Statement should be an array');
    assert.equal(parsed.Statement[0].Effect, 'Allow');
    assert.equal(parsed.Statement[0].Action.length, 21);
    assert.equal(parsed.Statement[0].Resource, '*');
  });

  it('includes Sid field in statement', () => {
    const json = generateAwsPolicy(['vpcIpamDiscovery']);
    const parsed = JSON.parse(json);
    assert.ok(parsed.Statement[0].Sid, 'Statement should have Sid');
  });

  it('deduplicates actions in policy output', () => {
    const json = generateAwsPolicy(['vpcIpamDiscovery', 'dnsRoute53Bidirectional']);
    const parsed = JSON.parse(json);
    assert.equal(parsed.Statement[0].Action.length, 35);
  });

  it('returns empty statement actions for empty input', () => {
    const json = generateAwsPolicy([]);
    const parsed = JSON.parse(json);
    assert.equal(parsed.Statement[0].Action.length, 0);
  });
});

// --- generateAwsTerraform ---

describe('generateAwsTerraform', () => {
  it('contains aws_iam_policy resource for standard features', () => {
    const tf = generateAwsTerraform(['vpcIpamDiscovery']);
    assert.ok(tf.includes('resource "aws_iam_policy"'), 'should contain aws_iam_policy resource');
  });

  it('contains aws_iam_role for multiAccount', () => {
    const tf = generateAwsTerraform(['multiAccount']);
    assert.ok(tf.includes('aws_iam_role'), 'should contain aws_iam_role');
    assert.ok(tf.includes('assume_role_policy'), 'should contain assume_role_policy');
  });

  it('contains combined policy for multiple features', () => {
    const tf = generateAwsTerraform(['vpcIpamDiscovery', 'ec2Networking']);
    assert.ok(tf.includes('resource "aws_iam_policy"'), 'should contain aws_iam_policy');
  });

  it('includes multiAccount role AND standard policy when both selected', () => {
    const tf = generateAwsTerraform(['vpcIpamDiscovery', 'multiAccount']);
    assert.ok(tf.includes('resource "aws_iam_policy"'), 'should have policy');
    assert.ok(tf.includes('aws_iam_role'), 'should have role');
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
    assert.ok(
      guide.toLowerCase().includes('sub-account') || guide.toLowerCase().includes('management account'),
      'should mention sub-account or management account'
    );
  });

  it('combines standard and multi-account guidance', () => {
    const guide = generateAwsGuide(['vpcIpamDiscovery', 'multiAccount']);
    assert.ok(guide.includes('1.'), 'should have numbered steps');
    assert.ok(guide.length > 100, 'combined guide should be longer');
  });
});
