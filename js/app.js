/**
 * Entry point — wires event listeners to state and UI modules.
 */

import { setActiveProvider, getActiveProvider, hasProviderData } from './state.js';
import { updateProviderCards, updateWorkspace } from './ui.js';

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
    });
  });
});
