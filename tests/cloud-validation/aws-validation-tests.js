import { AWS_SHARED_READ_ONLY_ACTIONS } from '../../js/data/aws.js';

/**
 * Build a complete AWS validation manifest from executable SDK checks.
 *
 * Documented actions without an executable check remain visible as skipped
 * entries so the validator cannot silently drift below the canonical policy.
 *
 * @param {Array<{action: string, feature: string, fn: Function|null}>} implementedTests
 * @returns {Array<{action: string, feature: string, fn: Function|null}>}
 */
export function createAwsValidationTests(implementedTests) {
  const implementations = new Map(
    implementedTests.map(test => [test.action, test])
  );

  const documentedTests = AWS_SHARED_READ_ONLY_ACTIONS.map(action =>
    implementations.get(action) || {
      action,
      feature: 'sharedReadOnly',
      fn: null
    }
  );

  const additionalTests = implementedTests.filter(
    test => !AWS_SHARED_READ_ONLY_ACTIONS.includes(test.action)
  );

  return [...documentedTests, ...additionalTests];
}
