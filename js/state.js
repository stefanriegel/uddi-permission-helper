/**
 * State management for UDDI Permission Scope Helper.
 * In-memory per-provider state — no localStorage, no persistence across reloads.
 */

const VALID_PROVIDERS = ['aws', 'azure', 'gcp'];

const state = {
  activeProvider: null,
  providers: {
    aws: { features: {} },
    azure: { features: {} },
    gcp: { features: {} }
  }
};

/**
 * Get the currently active provider ID.
 * @returns {string|null} Provider ID or null if none selected.
 */
export function getActiveProvider() {
  return state.activeProvider;
}

/**
 * Set the active provider. Validates that providerId is a known provider.
 * @param {string} providerId - One of 'aws', 'azure', 'gcp'.
 * @returns {object|null} The provider state object, or null if invalid.
 */
export function setActiveProvider(providerId) {
  if (!VALID_PROVIDERS.includes(providerId)) {
    return null;
  }
  state.activeProvider = providerId;
  return state.providers[providerId];
}

/**
 * Get the state object for a specific provider.
 * @param {string} providerId - One of 'aws', 'azure', 'gcp'.
 * @returns {object|null} The provider state object, or null if invalid.
 */
export function getProviderState(providerId) {
  if (!VALID_PROVIDERS.includes(providerId)) {
    return null;
  }
  return state.providers[providerId];
}

/**
 * Check if a provider has any feature data stored.
 * @param {string} providerId - One of 'aws', 'azure', 'gcp'.
 * @returns {boolean} True if the provider has features selected.
 */
export function hasProviderData(providerId) {
  if (!VALID_PROVIDERS.includes(providerId)) {
    return false;
  }
  return Object.keys(state.providers[providerId].features).length > 0;
}

/**
 * Get the full state object (for debugging and future use).
 * @returns {object} The complete state object.
 */
export function getState() {
  return state;
}
