/**
 * DOM manipulation for provider card selection, workspace updates, wizard and advanced rendering.
 * Receives data as arguments — no direct dependency on state.js.
 */

import { AWS_FEATURES } from './data/aws.js';
import { AZURE_FEATURES } from './data/azure.js';
import { GCP_FEATURES } from './data/gcp.js';

const PROVIDER_NAMES = {
  aws: 'Amazon Web Services (AWS)',
  azure: 'Microsoft Azure',
  gcp: 'Google Cloud Platform (GCP)'
};

/**
 * Update provider card visual states based on the active provider.
 * @param {string|null} activeProvider - The currently active provider ID.
 * @param {function} hasDataFn - Function that takes a providerId and returns boolean.
 */
export function updateProviderCards(activeProvider, hasDataFn) {
  const cards = document.querySelectorAll('.provider-card[data-provider]');

  cards.forEach((card) => {
    const providerId = card.dataset.provider;

    // Remove all state classes
    card.classList.remove('provider-card--selected', 'provider-card--has-data');

    if (providerId === activeProvider) {
      card.classList.add('provider-card--selected');
      card.setAttribute('aria-pressed', 'true');
    } else {
      card.setAttribute('aria-pressed', 'false');

      // Show has-data indicator for non-active providers with stored data
      if (hasDataFn(providerId)) {
        card.classList.add('provider-card--has-data');
      }
    }
  });
}

/**
 * Update the workspace panel content based on the active provider.
 * Shows workspace header + content when provider selected, hides empty state.
 * @param {string|null} activeProvider - The currently active provider ID, or null to show empty state.
 */
export function updateWorkspace(activeProvider) {
  const workspace = document.querySelector('.workspace');
  if (!workspace) return;

  const title = document.getElementById('workspace-title');
  const empty = workspace.querySelector('.workspace__empty');

  if (!activeProvider) {
    workspace.classList.add('workspace--hidden');
    workspace.classList.remove('workspace--active');
    if (empty) empty.style.display = '';
  } else {
    workspace.classList.remove('workspace--hidden');
    workspace.classList.add('workspace--active');
    if (title) {
      const displayName = PROVIDER_NAMES[activeProvider] || activeProvider;
      title.textContent = displayName + ' Features';
    }
    if (empty) empty.style.display = 'none';
  }
}

/**
 * Determine the status of each question based on current feature selections.
 *
 * Walk questions in order:
 * - A standalone question is "answered" if its featureId key exists in features (true or false).
 * - A parent question (with subQuestions) is "answered" if all sub-featureIds have explicit
 *   false values (user said No to parent), or at least one sub-feature is true.
 * - The first non-answered question is "active".
 * - All after active are "locked".
 *
 * @param {Array} questions - Question array from getQuestionsForProvider.
 * @param {object} features - Current features object from state.
 * @returns {Array<{question: object, status: string, parentAnsweredYes?: boolean}>}
 */
function resolveQuestionStates(questions, features) {
  const results = [];
  let foundActive = false;

  for (const q of questions) {
    let status;
    let parentAnsweredYes = false;

    if (q.subQuestions && q.subQuestions.length > 0) {
      // Parent question with sub-questions
      const subFeatureIds = q.subQuestions.map(sq => sq.featureId);
      const allExplicitFalse = subFeatureIds.every(id => features[id] === false);
      const anyTrue = subFeatureIds.some(id => features[id] === true);
      const anyAnswered = subFeatureIds.some(id => id in features);

      if (allExplicitFalse) {
        // User said No to the parent
        status = 'answered';
        parentAnsweredYes = false;
      } else if (anyTrue) {
        // User picked at least one sub-option
        status = 'answered';
        parentAnsweredYes = true;
      } else if (anyAnswered) {
        // Some answered but none true — still in progress if parent said Yes
        // This state means parent was answered Yes but no sub selected yet
        status = foundActive ? 'locked' : 'active';
        parentAnsweredYes = true;
      } else {
        status = foundActive ? 'locked' : 'active';
      }
    } else {
      // Standalone question
      const featureId = q.featureIds[0];
      if (featureId && featureId in features) {
        status = 'answered';
      } else {
        status = foundActive ? 'locked' : 'active';
      }
    }

    if (status === 'active') {
      foundActive = true;
    }

    results.push({ question: q, status, parentAnsweredYes });
  }

  return results;
}

/**
 * Render the wizard mode into #workspace-content.
 *
 * @param {Array} questions - Question array from getQuestionsForProvider.
 * @param {object} features - Current features object from state.
 * @param {function} onAnswer - Callback: (featureId, enabled) => void.
 */
export function renderWizard(questions, features, onAnswer) {
  const container = document.getElementById('workspace-content');
  if (!container) return;

  const states = resolveQuestionStates(questions, features);

  // Count answered and total top-level questions
  const totalQuestions = states.length;
  const answeredCount = states.filter(s => s.status === 'answered').length;
  const currentNum = Math.min(answeredCount + 1, totalQuestions);

  // Build HTML
  const parts = [];

  // Progress indicator
  parts.push(`<p class="wizard__progress">Question ${currentNum} of ${totalQuestions}</p>`);

  for (const { question, status, parentAnsweredYes } of states) {
    const cardClass = `wizard-card wizard-card--${status}`;
    const isParent = question.subQuestions && question.subQuestions.length > 0;

    parts.push(`<div class="${cardClass}" data-question-id="${question.id}">`);
    parts.push(`<p class="wizard-card__question">${escapeHtml(question.text)}</p>`);

    if (status !== 'locked') {
      if (isParent) {
        // Parent question — Yes/No determines whether sub-questions appear
        const yesSelected = parentAnsweredYes ? ' wizard-card__btn--selected' : '';
        const noSelected = (!parentAnsweredYes && status === 'answered') ? ' wizard-card__btn--selected-no' : '';

        parts.push('<div class="wizard-card__actions">');
        parts.push(`<button type="button" class="wizard-card__btn${yesSelected}" data-answer="yes" data-question-id="${question.id}">Yes</button>`);
        parts.push(`<button type="button" class="wizard-card__btn${noSelected}" data-answer="no" data-question-id="${question.id}">No</button>`);
        parts.push('</div>');
      } else {
        // Standalone question — Yes/No toggles the feature
        const featureId = question.featureIds[0];
        const answered = featureId && featureId in features;
        const yesSelected = (answered && features[featureId] === true) ? ' wizard-card__btn--selected' : '';
        const noSelected = (answered && features[featureId] === false) ? ' wizard-card__btn--selected-no' : '';

        parts.push('<div class="wizard-card__actions">');
        parts.push(`<button type="button" class="wizard-card__btn${yesSelected}" data-answer="yes" data-feature-id="${featureId}">Yes</button>`);
        parts.push(`<button type="button" class="wizard-card__btn${noSelected}" data-answer="no" data-feature-id="${featureId}">No</button>`);
        parts.push('</div>');
      }
    }

    parts.push('</div>');

    // Render sub-question cards if parent answered Yes
    if (isParent && parentAnsweredYes) {
      for (const sub of question.subQuestions) {
        const isSelected = features[sub.featureId] === true;
        const subSelectedClass = isSelected ? ' wizard-card__option--selected' : '';

        parts.push(`<div class="wizard-card wizard-card--sub" data-sub-question-id="${sub.id}">`);
        parts.push('<div class="wizard-card__options">');
        parts.push(`<button type="button" class="wizard-card__option${subSelectedClass}" data-sub-feature-id="${sub.featureId}" data-exclusive="${sub.exclusive}" data-parent-question="${question.id}">${escapeHtml(sub.text)}</button>`);
        parts.push('</div>');
        parts.push('</div>');
      }
    }
  }

  container.innerHTML = parts.join('\n');

  // Wire event listeners
  wireWizardEvents(container, questions, features, onAnswer);
}

/**
 * Wire click handlers for wizard buttons.
 */
function wireWizardEvents(container, questions, features, onAnswer) {
  // Yes/No on standalone questions
  container.querySelectorAll('.wizard-card__btn[data-feature-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const featureId = btn.dataset.featureId;
      const enabled = btn.dataset.answer === 'yes';
      onAnswer(featureId, enabled);
    });
  });

  // Yes/No on parent questions (with sub-questions)
  container.querySelectorAll('.wizard-card__btn[data-question-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const questionId = btn.dataset.questionId;
      const answeredYes = btn.dataset.answer === 'yes';
      const question = questions.find(q => q.id === questionId);
      if (!question || !question.subQuestions) return;

      if (answeredYes) {
        // Reveal sub-questions — don't select any yet, but we need to trigger a re-render
        // Set a sentinel: mark all sub-features as explicitly not-yet-selected
        // Actually, we just need to re-render with the parent "open" state.
        // We do this by ensuring no sub-features are set — the re-render picks up parent=yes
        // We need at least one entry to signal "parent answered yes" — remove all false entries
        // and the re-render logic checks anyAnswered.
        // Simplest: clear all sub-feature entries and set a temporary marker
        for (const sub of question.subQuestions) {
          // Remove any previous "No" selections to reset
          if (features[sub.featureId] === false) {
            delete features[sub.featureId];
          }
        }
        // If no sub-features are in features at all, we need to signal parent=Yes.
        // We use a convention: set first sub-feature to undefined marker.
        // Actually let's just set them to false temporarily to signal "answered but not picked".
        // Wait — the resolve logic checks anyAnswered. Let's set first sub to false.
        const anySet = question.subQuestions.some(sq => sq.featureId in features);
        if (!anySet) {
          // Temporarily mark one sub-feature so anyAnswered triggers
          onAnswer(question.subQuestions[0].featureId, false);
          return; // onAnswer will trigger re-render
        }
        onAnswer(question.subQuestions[0].featureId, features[question.subQuestions[0].featureId] || false);
      } else {
        // No — disable all sub-features
        for (const sub of question.subQuestions) {
          onAnswer(sub.featureId, false);
        }
      }
    });
  });

  // Sub-question option buttons
  container.querySelectorAll('.wizard-card__option[data-sub-feature-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const featureId = btn.dataset.subFeatureId;
      const exclusive = btn.dataset.exclusive === 'true';
      const parentQuestionId = btn.dataset.parentQuestion;
      const question = questions.find(q => q.id === parentQuestionId);

      if (exclusive && question) {
        // Radio-style: select this, deselect others
        for (const sub of question.subQuestions) {
          onAnswer(sub.featureId, sub.featureId === featureId);
        }
      } else {
        // Toggle-style: flip this one
        const currentlySelected = features[featureId] === true;
        onAnswer(featureId, !currentlySelected);
      }
    });
  });
}

/**
 * Escape HTML special characters.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------------------------------------------------------------------------
// Permission count helpers
// ---------------------------------------------------------------------------

const PROVIDER_FEATURES_MAP = {
  aws: AWS_FEATURES,
  azure: AZURE_FEATURES,
  gcp: GCP_FEATURES
};

/**
 * Get a human-readable permission count string for a feature.
 *
 * @param {string} providerId - 'aws', 'azure', or 'gcp'.
 * @param {string} featureId - Feature key from the provider's FEATURES object.
 * @returns {string} Display string like "21 actions", "3 roles", "10 permissions".
 */
function getPermissionCount(providerId, featureId) {
  const features = PROVIDER_FEATURES_MAP[providerId];
  if (!features) return '';
  const feature = features[featureId];
  if (!feature) return '';

  if (providerId === 'aws') {
    if (feature.actions && feature.actions.length > 0) {
      return `${feature.actions.length} actions`;
    }
    if (feature.policies && feature.policies.length > 0) {
      return `${feature.policies.length} policies`;
    }
    return '0 actions';
  }

  if (providerId === 'azure') {
    const roleCount = feature.roles ? feature.roles.length : 0;
    const customPermCount = feature.customRole ? feature.customRole.permissions.length : 0;
    const parts = [];
    if (roleCount > 0) parts.push(`${roleCount} role${roleCount !== 1 ? 's' : ''}`);
    if (customPermCount > 0) parts.push(`${customPermCount} permissions`);
    if (feature.guidance) parts.push('guidance');
    return parts.join(' + ') || '0 roles';
  }

  if (providerId === 'gcp') {
    const roleCount = feature.predefinedRoles ? feature.predefinedRoles.length : 0;
    const permCount = feature.customPermissions ? feature.customPermissions.length : 0;
    const parts = [];
    if (roleCount > 0) parts.push(`${roleCount} role${roleCount !== 1 ? 's' : ''}`);
    if (permCount > 0) parts.push(`${permCount} permissions`);
    return parts.join(' + ') || '0 permissions';
  }

  return '';
}

// ---------------------------------------------------------------------------
// Advanced mode rendering
// ---------------------------------------------------------------------------

/**
 * Render the advanced mode into #workspace-content.
 *
 * Shows all features as checkboxes grouped by category with permission count badges.
 * Exclusive sub-features (DNS) render as radio inputs; non-exclusive (GCP Cloud Forwarding)
 * render as independent checkboxes.
 *
 * @param {Array} questions - Question array from getQuestionsForProvider.
 * @param {object} features - Current features object from state.
 * @param {function} onToggle - Callback: (featureId, enabled) => void.
 */
export function renderAdvanced(questions, features, onToggle) {
  const container = document.getElementById('workspace-content');
  if (!container) return;

  // Derive the providerId from the first question's id prefix
  const providerId = questions.length > 0 ? questions[0].id.split('-')[0] : 'aws';

  const parts = [];

  for (const q of questions) {
    parts.push('<div class="advanced__category">');
    parts.push(`<h3 class="advanced__category-title">${escapeHtml(q.text)}</h3>`);

    if (q.subQuestions && q.subQuestions.length > 0) {
      // Parent question with sub-features
      const radioName = `advanced-radio-${q.id}`;

      for (const sub of q.subQuestions) {
        const isChecked = features[sub.featureId] === true;
        const inputType = sub.exclusive ? 'radio' : 'checkbox';
        const nameAttr = sub.exclusive ? ` name="${radioName}"` : '';
        const checkedAttr = isChecked ? ' checked' : '';
        const badge = getPermissionCount(providerId, sub.featureId);
        const inputId = `advanced-${sub.featureId}`;

        parts.push(`<label class="advanced__row advanced__row--sub">`);
        parts.push(`<input type="${inputType}" class="advanced__input" id="${inputId}"${nameAttr}${checkedAttr} data-feature-id="${sub.featureId}" data-exclusive="${sub.exclusive}" data-parent-question="${q.id}">`);
        parts.push(`<span class="advanced__label">${escapeHtml(sub.text)}</span>`);
        if (badge) {
          parts.push(`<span class="advanced__badge">${badge}</span>`);
        }
        parts.push('</label>');
      }
    } else {
      // Standalone feature
      const featureId = q.featureIds[0];
      const isChecked = features[featureId] === true;
      const checkedAttr = isChecked ? ' checked' : '';
      const badge = getPermissionCount(providerId, featureId);
      const featureData = PROVIDER_FEATURES_MAP[providerId]?.[featureId];
      const displayName = featureData?.name || q.text;
      const inputId = `advanced-${featureId}`;

      parts.push(`<label class="advanced__row">`);
      parts.push(`<input type="checkbox" class="advanced__input" id="${inputId}"${checkedAttr} data-feature-id="${featureId}">`);
      parts.push(`<span class="advanced__label">${escapeHtml(displayName)}</span>`);
      if (badge) {
        parts.push(`<span class="advanced__badge">${badge}</span>`);
      }
      parts.push('</label>');
    }

    parts.push('</div>');
  }

  container.innerHTML = parts.join('\n');

  // Wire event listeners
  wireAdvancedEvents(container, questions, features, onToggle);
}

/**
 * Wire change handlers for advanced mode inputs.
 */
function wireAdvancedEvents(container, questions, features, onToggle) {
  container.querySelectorAll('.advanced__input').forEach(input => {
    input.addEventListener('change', () => {
      const featureId = input.dataset.featureId;
      const exclusive = input.dataset.exclusive === 'true';
      const parentQuestionId = input.dataset.parentQuestion;

      if (exclusive && parentQuestionId) {
        // Radio-style: select this one, deselect siblings
        const question = questions.find(q => q.id === parentQuestionId);
        if (question && question.subQuestions) {
          for (const sub of question.subQuestions) {
            onToggle(sub.featureId, sub.featureId === featureId);
          }
        }
      } else {
        // Checkbox toggle
        onToggle(featureId, input.checked);
      }
    });
  });
}
