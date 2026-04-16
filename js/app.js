/**
 * Entry point — wires event listeners to state and UI modules.
 */

import { setActiveProvider, getActiveProvider, hasProviderData, setFeature, getFeatures, getSelectionMode } from './state.js';
import { updateProviderCards, updateWorkspace, renderWizard } from './ui.js';
import { getQuestionsForProvider } from './questions.js';

/**
 * Re-render the wizard for the current active provider.
 */
function refreshWizard() {
  const providerId = getActiveProvider();
  if (!providerId) return;

  if (getSelectionMode() !== 'wizard') return;

  const questions = getQuestionsForProvider(providerId);
  const features = getFeatures(providerId);

  renderWizard(questions, features, (featureId, enabled) => {
    setFeature(providerId, featureId, enabled);
    updateProviderCards(providerId, hasProviderData);
    refreshWizard();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const workspace = document.querySelector('.workspace');
  const cards = document.querySelectorAll('.provider-card[data-provider]');

  // Hide workspace on init (JS-enhanced state)
  if (workspace) {
    workspace.classList.add('workspace--hidden');
  }

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const providerId = card.dataset.provider;

      // No-op if clicking the already-active provider
      if (getActiveProvider() === providerId) {
        return;
      }

      setActiveProvider(providerId);
      updateProviderCards(providerId, hasProviderData);
      updateWorkspace(providerId);
      refreshWizard();
    });
  });
});
