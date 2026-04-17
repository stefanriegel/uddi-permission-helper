/**
 * Shared reporting utilities for cloud permission validation.
 * Formats results as a table with pass/fail/error status per action.
 */

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m'
};

/**
 * @typedef {Object} ActionResult
 * @property {string} action - IAM action string (e.g., 'ec2:DescribeVpcs')
 * @property {string} feature - Feature ID from the tool
 * @property {'pass'|'denied'|'error'|'skip'} status
 * @property {string} [detail] - Additional info (error message, count, etc.)
 */

/**
 * Print a validation report to stdout.
 * @param {string} provider - Cloud provider name
 * @param {ActionResult[]} results
 */
export function printReport(provider, results) {
  const passed = results.filter(r => r.status === 'pass');
  const denied = results.filter(r => r.status === 'denied');
  const errors = results.filter(r => r.status === 'error');
  const skipped = results.filter(r => r.status === 'skip');

  console.log('\n' + '='.repeat(70));
  console.log(`${COLORS.bold} ${provider} Permission Validation Report${COLORS.reset}`);
  console.log('='.repeat(70));

  // Summary
  console.log(`\n  ${COLORS.green}✔ Pass:${COLORS.reset}    ${passed.length}`);
  console.log(`  ${COLORS.red}✘ Denied:${COLORS.reset}  ${denied.length}`);
  console.log(`  ${COLORS.yellow}⚠ Error:${COLORS.reset}   ${errors.length}`);
  console.log(`  ${COLORS.dim}○ Skip:${COLORS.reset}    ${skipped.length}`);
  console.log(`  Total:     ${results.length}\n`);

  // Detail table
  const maxAction = Math.max(...results.map(r => r.action.length), 10);
  const maxFeature = Math.max(...results.map(r => r.feature.length), 7);

  const header = `  ${'Action'.padEnd(maxAction)}  ${'Feature'.padEnd(maxFeature)}  Status   Detail`;
  console.log(header);
  console.log('  ' + '-'.repeat(header.length - 2));

  for (const r of results) {
    let statusIcon;
    switch (r.status) {
      case 'pass': statusIcon = `${COLORS.green}✔ pass${COLORS.reset}  `; break;
      case 'denied': statusIcon = `${COLORS.red}✘ denied${COLORS.reset}`; break;
      case 'error': statusIcon = `${COLORS.yellow}⚠ error${COLORS.reset} `; break;
      case 'skip': statusIcon = `${COLORS.dim}○ skip${COLORS.reset}  `; break;
    }
    const detail = r.detail || '';
    console.log(`  ${r.action.padEnd(maxAction)}  ${r.feature.padEnd(maxFeature)}  ${statusIcon}  ${COLORS.dim}${detail}${COLORS.reset}`);
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

/**
 * Load .env from project root or validation directory.
 * @param {string} envPath
 */
export async function loadEnv(envPath) {
  const dotenv = await import('dotenv');
  dotenv.config({ path: envPath });
}
