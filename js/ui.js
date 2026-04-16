/**
 * DOM manipulation for provider card selection and workspace updates.
 * Receives data as arguments — no direct dependency on state.js.
 */

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
 * @param {string|null} activeProvider - The currently active provider ID, or null to show empty state.
 */
export function updateWorkspace(activeProvider) {
  const workspace = document.querySelector('.workspace');
  if (!workspace) return;

  if (!activeProvider) {
    workspace.classList.add('workspace--hidden');
    workspace.classList.remove('workspace--active');
    workspace.innerHTML = '<p class="workspace__empty">Select a cloud provider above to begin.</p>';
  } else {
    workspace.classList.remove('workspace--hidden');
    workspace.classList.add('workspace--active');
    const displayName = PROVIDER_NAMES[activeProvider] || activeProvider;
    workspace.innerHTML = `<p class="workspace__provider-label">${displayName} features will appear here</p>`;
  }
}
