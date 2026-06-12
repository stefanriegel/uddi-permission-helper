import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { AWS_SHARED_READ_ONLY_ACTIONS } from '../js/data/aws.js';
import { createAwsValidationTests } from './cloud-validation/aws-validation-tests.js';

describe('AWS cloud validation manifest', () => {
  it('covers every documented read-only action without drift', () => {
    const tests = createAwsValidationTests([]);
    const actions = tests.map(test => test.action).sort();

    assert.deepStrictEqual(actions, AWS_SHARED_READ_ONLY_ACTIONS);
  });
});
