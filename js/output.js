/**
 * Output rendering module for UDDI Permission Scope Helper.
 *
 * Dispatches to provider-specific generators and renders Policy, Cloud CLI,
 * Terraform, and Setup Guide content into the output panel tabs, and updates
 * the permission count badge.
 */

import { getAwsActions, generateAwsPolicy, generateAwsCli, generateAwsTerraform, generateAwsGuide } from './data/aws.js';
import { AZURE_FEATURES, getAzureRoles, getAzureCustomRoles, generateAzurePolicy, generateAzureTerraform, generateAzureGuide } from './data/azure.js';
import { GCP_FEATURES, getGcpRoles, getGcpCustomPermissions, generateGcpPolicy, generateGcpTerraform, generateGcpGuide } from './data/gcp.js';

/** AWS managed policy character limit */
const AWS_POLICY_SIZE_LIMIT = 6144;
/** Warning threshold as fraction of the limit (80% = 4915 chars) */
const AWS_POLICY_SIZE_WARN_THRESHOLD = 0.8;

/**
 * Escape HTML special characters to prevent XSS in rendered output.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Build the deployable AWS IAM policy shown and downloaded by the UI.
 *
 * @param {string[]} selectedIds - Selected feature IDs
 * @returns {string} Valid JSON policy
 */
export function buildAnnotatedAwsPolicy(selectedIds) {
  return getAwsActions(selectedIds).length > 0
    ? generateAwsPolicy(selectedIds)
    : '';
}

/**
 * Add rationale comments to AWS CLI command output.
 *
 * @param {string[]} selectedIds - Selected feature IDs
 * @returns {string} AWS CLI commands with comment headers
 */
function buildAnnotatedAwsCli(selectedIds) {
  const rawOutput = generateAwsCli(selectedIds);
  if (!rawOutput) return '';

  const sections = [];

  if (getAwsActions(selectedIds).length > 0) {
    sections.push('# Create and attach the AWS managed policy for the selected discovery permissions');
  }

  if (selectedIds.includes('multiAccount')) {
    sections.push('# Create the directly trusted discovery role in each configured AWS account');
  }

  return sections.length > 0 ? `${sections.join('\n')}\n\n${rawOutput}` : rawOutput;
}

/**
 * Build a structured Azure policy summary.
 *
 * @param {string[]} selectedIds
 * @returns {string}
 */
function buildAzurePolicySummary(selectedIds) {
  const builtInRoles = getAzureRoles(selectedIds);
  const customRoles = getAzureCustomRoles(selectedIds);
  const includesMultiSubscription = selectedIds.includes('multiSubscription');

  if (builtInRoles.length === 0 && customRoles.length === 0 && !includesMultiSubscription) {
    return '';
  }

  const summary = {
    platform: 'azure',
    assignmentModel: 'rbac',
    builtInRoles: builtInRoles.map(role => ({
      name: role.name,
      scope: role.scope
    })),
    customRoles: customRoles.map(role => ({
      name: role.name,
      scope: role.scope,
      permissions: [...role.permissions].sort()
    })),
    guidance: includesMultiSubscription ? [
      {
        type: 'managementGroupScope',
        message: 'Assign the required roles at management group scope for multi-subscription discovery.'
      }
    ] : []
  };

  return JSON.stringify(summary, null, 2);
}

/**
 * Add rationale comments to Azure CLI command output.
 *
 * @param {string[]} selectedIds - Selected feature IDs
 * @returns {string} Azure CLI commands with # rationale comments
 */
function buildAnnotatedAzureCli(selectedIds) {
  const rawOutput = generateAzurePolicy(selectedIds);
  if (!rawOutput) return '';

  // Build rationale map from features
  const rationaleMap = {};
  for (const id of selectedIds) {
    const feature = AZURE_FEATURES[id];
    if (feature && feature.rationale) {
      for (const [key, reason] of Object.entries(feature.rationale)) {
        rationaleMap[key] = reason;
      }
    }
  }

  // Insert rationale before each az command
  const lines = rawOutput.split('\n');
  const annotated = [];
  let searchOffset = 0;
  for (const line of lines) {
    // Before each az role assignment create line, find the role in THIS command block
    if (line.startsWith('az role assignment create')) {
      const blockStart = rawOutput.indexOf(line, searchOffset);
      const blockEnd = rawOutput.indexOf('\n\n', blockStart);
      const block = rawOutput.substring(blockStart, blockEnd > blockStart ? blockEnd : rawOutput.length);
      const roleMatch = block.match(/--role\s+"([^"]+)"/);
      if (roleMatch) {
        const roleName = roleMatch[1];
        if (rationaleMap[roleName]) {
          annotated.push(`# ${rationaleMap[roleName]}`);
        }
      }
      searchOffset = blockStart + line.length;
    }
    // Before az role definition create, find the custom role name
    if (line.startsWith('az role definition create')) {
      const blockStart = rawOutput.indexOf(line, searchOffset);
      const blockEnd = rawOutput.indexOf('\n\n', blockStart);
      const block = rawOutput.substring(blockStart, blockEnd > blockStart ? blockEnd : rawOutput.length);
      const nameMatch = block.match(/"Name":\s*"([^"]+)"/);
      if (nameMatch) {
        const crName = nameMatch[1];
        for (const id of selectedIds) {
          const feature = AZURE_FEATURES[id];
          if (feature && feature.customRole && feature.customRole.name === crName) {
            annotated.push(`# Custom role for ${feature.name}`);
            break;
          }
        }
      }
      searchOffset = blockStart + line.length;
    }
    annotated.push(line);
  }

  return annotated.join('\n');
}

/**
 * Build a structured GCP policy summary.
 *
 * @param {string[]} selectedIds
 * @returns {string}
 */
function buildGcpPolicySummary(selectedIds) {
  const predefinedRoles = getGcpRoles(selectedIds);
  const allCustomPermissions = getGcpCustomPermissions(selectedIds);
  const organizationCustomPermissions = selectedIds.includes('multiProjectOrg')
    ? [...GCP_FEATURES.multiProjectOrg.customPermissions].sort()
    : [];
  const organizationPermissionSet = new Set(organizationCustomPermissions);
  const projectCustomPermissions = allCustomPermissions.filter(permission => !organizationPermissionSet.has(permission));

  if (predefinedRoles.length === 0 && organizationCustomPermissions.length === 0 && projectCustomPermissions.length === 0) {
    return '';
  }

  const summary = {
    platform: 'gcp',
    assignmentModel: 'iam',
    predefinedRoles: predefinedRoles.map(role => ({
      role: role.role,
      scope: role.scope
    })),
    customRoles: []
  };

  if (organizationCustomPermissions.length > 0) {
    summary.customRoles.push({
      scope: 'organization',
      title: 'Infoblox UDDI Organization Custom Role',
      permissions: organizationCustomPermissions
    });
  }

  if (projectCustomPermissions.length > 0) {
    summary.customRoles.push({
      scope: 'project',
      title: 'Infoblox UDDI Custom Role',
      permissions: projectCustomPermissions
    });
  }

  return JSON.stringify(summary, null, 2);
}

/**
 * Add rationale comments to GCP gcloud command output.
 *
 * @param {string[]} selectedIds - Selected feature IDs
 * @returns {string} gcloud commands with # rationale comments
 */
function buildAnnotatedGcpCli(selectedIds) {
  const rawOutput = generateGcpPolicy(selectedIds);
  if (!rawOutput) return '';

  // Build rationale map from features
  const rationaleMap = {};
  for (const id of selectedIds) {
    const feature = GCP_FEATURES[id];
    if (feature && feature.rationale) {
      for (const [key, reason] of Object.entries(feature.rationale)) {
        rationaleMap[key] = reason;
      }
    }
  }

  // Insert rationale before each gcloud command
  const lines = rawOutput.split('\n');
  const annotated = [];
  for (const line of lines) {
    if (line.startsWith('gcloud projects add-iam-policy-binding') || line.startsWith('gcloud organizations add-iam-policy-binding') || line.startsWith('gcloud resource-manager folders add-iam-policy-binding')) {
      // Find the role in the command block
      const blockStart = rawOutput.indexOf(line);
      const blockText = rawOutput.substring(blockStart, rawOutput.indexOf('\n\n', blockStart + 1) === -1 ? rawOutput.length : rawOutput.indexOf('\n\n', blockStart + 1));
      const roleMatch = blockText.match(/--role="([^"]+)"/);
      if (roleMatch) {
        const role = roleMatch[1];
        if (rationaleMap[role]) {
          annotated.push(`# ${rationaleMap[role]}`);
        }
      }
    }
    if (line.startsWith('gcloud iam roles create')) {
      annotated.push('# Custom role with combined permissions for selected features');
    }
    annotated.push(line);
  }

  return annotated.join('\n');
}

/**
 * Render or remove the AWS policy size warning banner.
 *
 * Checks the raw IAM policy JSON (from generateAwsPolicy) against the
 * 6,144-character AWS managed policy limit. Shows a warning at 80% usage
 * and an error banner when the limit is exceeded.
 *
 * @param {string} providerId - Active provider ID
 * @param {string} policyText - Raw AWS IAM policy JSON string
 */
function renderPolicySizeWarning(providerId, policyText) {
  const container = document.querySelector('.output__content');
  if (!container) return;

  const existing = container.querySelector('.output__size-warning');

  // Only applies to AWS
  if (providerId !== 'aws') {
    if (existing) existing.remove();
    return;
  }

  const length = policyText.length;
  const threshold = AWS_POLICY_SIZE_LIMIT * AWS_POLICY_SIZE_WARN_THRESHOLD;

  if (length < threshold) {
    if (existing) existing.remove();
    return;
  }

  const warning = existing || document.createElement('div');
  warning.className = 'output__size-warning';

  if (length >= AWS_POLICY_SIZE_LIMIT) {
    warning.classList.add('output__size-warning--exceeded');
    warning.innerHTML = `\u26A0 Policy size: ${length.toLocaleString()} / 6,144 characters \u2014 EXCEEDS AWS managed policy limit!`;
  } else {
    warning.classList.remove('output__size-warning--exceeded');
    const percent = Math.round((length / AWS_POLICY_SIZE_LIMIT) * 100);
    warning.innerHTML = `\u26A0 Policy size: ${length.toLocaleString()} / 6,144 characters (${percent}%). AWS managed policies cannot exceed 6,144 characters.`;
  }

  if (!existing) {
    container.insertBefore(warning, container.firstChild);
  }
}

/**
 * Render output content into all four tab panels.
 *
 * @param {string} providerId - Active provider ID ('aws', 'azure', 'gcp')
 * @param {object} features - Features object from state {featureId: boolean}
 */
export function renderOutput(providerId, features) {
  const selectedIds = Object.keys(features).filter(id => features[id] === true);

  const policyPanel = document.getElementById('panel-policy');
  const cliPanel = document.getElementById('panel-cli');
  const terraformPanel = document.getElementById('panel-terraform');
  const guidePanel = document.getElementById('panel-guide');

  if (!policyPanel || !cliPanel || !terraformPanel || !guidePanel) return;

  // Empty state
  if (selectedIds.length === 0) {
    const placeholder = '<p class="output__placeholder">Select features to generate your permission policy.</p>';
    policyPanel.innerHTML = placeholder;
    cliPanel.innerHTML = placeholder;
    terraformPanel.innerHTML = placeholder;
    guidePanel.innerHTML = placeholder;
    setButtonsDisabled(true);
    return;
  }

  setButtonsDisabled(false);

  // Generate content per provider
  let policyContent = '';
  let cliContent = '';
  let terraformContent = '';
  let guideContent = '';
  let policyLang = 'language-json';
  let cliLang = 'language-bash';

  if (providerId === 'aws') {
    policyContent = buildAnnotatedAwsPolicy(selectedIds);
    cliContent = buildAnnotatedAwsCli(selectedIds);
    terraformContent = generateAwsTerraform(selectedIds);
    guideContent = generateAwsGuide(selectedIds);
    policyLang = 'language-json';
  } else if (providerId === 'azure') {
    policyContent = buildAzurePolicySummary(selectedIds);
    cliContent = buildAnnotatedAzureCli(selectedIds);
    terraformContent = generateAzureTerraform(selectedIds);
    guideContent = generateAzureGuide(selectedIds);
    policyLang = 'language-json';
  } else if (providerId === 'gcp') {
    policyContent = buildGcpPolicySummary(selectedIds);
    cliContent = buildAnnotatedGcpCli(selectedIds);
    terraformContent = generateGcpTerraform(selectedIds);
    guideContent = generateGcpGuide(selectedIds);
    policyLang = 'language-json';
  }

  // AWS policy size warning (uses raw JSON policy, not annotated version)
  const rawPolicy = providerId === 'aws' ? generateAwsPolicy(selectedIds) : '';
  renderPolicySizeWarning(providerId, rawPolicy);

  // Render policy tab
  policyPanel.innerHTML = `<pre><code class="${policyLang}">${escapeHtml(policyContent)}</code></pre>`;

  // Render cloud CLI tab
  cliPanel.innerHTML = `<pre><code class="${cliLang}">${escapeHtml(cliContent)}</code></pre>`;

  // Render terraform tab
  terraformPanel.innerHTML = `<pre><code class="language-hcl">${escapeHtml(terraformContent)}</code></pre>`;

  // Render guide tab (plain text, no language highlighting)
  guidePanel.innerHTML = `<pre><code>${escapeHtml(guideContent)}</code></pre>`;

  // Syntax highlighting via Prism.js (graceful degradation)
  if (window.Prism) {
    const outputSection = document.querySelector('.output__content');
    if (outputSection) {
      Prism.highlightAllUnder(outputSection);
    }
  }
}

/**
 * Update the permission count badge based on selected features.
 *
 * @param {string} providerId - Active provider ID ('aws', 'azure', 'gcp')
 * @param {object} features - Features object from state {featureId: boolean}
 */
export function updateBadge(providerId, features) {
  const selectedIds = Object.keys(features).filter(id => features[id] === true);
  const badge = document.querySelector('.output__badge');
  if (!badge) return;

  let count = 0;

  if (providerId === 'aws') {
    count = getAwsActions(selectedIds).length;
  } else if (providerId === 'azure') {
    count = getAzureRoles(selectedIds).length;
    // Add deduplicated custom role permission counts
    const seenCustomRoles = new Set();
    for (const id of selectedIds) {
      const feature = AZURE_FEATURES[id];
      if (feature && feature.customRole && !seenCustomRoles.has(feature.customRole.name)) {
        seenCustomRoles.add(feature.customRole.name);
        count += feature.customRole.permissions.length;
      }
    }
  } else if (providerId === 'gcp') {
    count = getGcpRoles(selectedIds).length;
    count += getGcpCustomPermissions(selectedIds).length;
  }

  badge.textContent = `${count} permissions`;

  if (count > 0) {
    badge.classList.add('output__badge--active');
  } else {
    badge.classList.remove('output__badge--active');
  }
}

/**
 * Get the text content of the currently visible output panel.
 * @returns {string|null} Raw text content, or null if no visible panel or placeholder showing.
 */
export function getActiveTabContent() {
  const panel = document.querySelector('.output__panel:not([hidden])');
  if (!panel) return null;

  // If placeholder is showing, return null
  if (panel.querySelector('.output__placeholder')) return null;

  const text = panel.textContent;
  return text && text.trim() ? text.trim() : null;
}

/**
 * Get the ID of the currently active tab's controlled panel.
 * @returns {string|null} Panel ID (e.g., 'panel-policy'), or null if none active.
 */
export function getActiveTabId() {
  const activeTab = document.querySelector('.output__tab--active');
  if (!activeTab) return null;
  return activeTab.getAttribute('aria-controls');
}

/**
 * Get the appropriate download filename for the active provider and tab.
 * @param {string} providerId - Active provider ('aws', 'azure', 'gcp')
 * @param {string} tabId - Panel ID ('panel-policy', 'panel-cli', 'panel-terraform', 'panel-guide')
 * @returns {string} Filename with extension
 */
export function getDownloadFilename(providerId, tabId) {
  const extensions = {
    'panel-policy': {
      aws: 'aws-policy.json',
      azure: 'azure-policy.json',
      gcp: 'gcp-policy.json'
    },
    'panel-cli': {
      aws: 'aws-cli.sh',
      azure: 'azure-cli.sh',
      gcp: 'gcp-cli.sh'
    },
    'panel-terraform': {
      aws: 'aws-terraform.tf',
      azure: 'azure-terraform.tf',
      gcp: 'gcp-terraform.tf'
    },
    'panel-guide': {
      aws: 'aws-setup-guide.txt',
      azure: 'azure-setup-guide.txt',
      gcp: 'gcp-setup-guide.txt'
    }
  };

  const tabMap = extensions[tabId];
  if (tabMap && tabMap[providerId]) {
    return tabMap[providerId];
  }
  return `${providerId}-output.txt`;
}

/**
 * Enable or disable the Copy and Download action buttons.
 * @param {boolean} disabled - True to disable, false to enable.
 */
export function setButtonsDisabled(disabled) {
  const buttons = document.querySelectorAll('[data-action="copy"], [data-action="download"]');
  buttons.forEach(btn => {
    if (disabled) {
      btn.setAttribute('disabled', '');
      btn.classList.add('output__action--disabled');
    } else {
      btn.removeAttribute('disabled');
      btn.classList.remove('output__action--disabled');
    }
  });
}
