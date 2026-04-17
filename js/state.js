/**
 * State management for UDDI Permission Scope Helper.
 * In-memory per-provider state — no localStorage, no persistence across reloads.
 */

const VALID_PROVIDERS = ['aws', 'azure', 'gcp'];
const VALID_PRODUCTS = ['ddi', 'assetInsight'];

const state = {
  activeProvider: null,
  selectionMode: 'wizard',
  selectedProducts: [],
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
  return Object.values(state.providers[providerId].features).some(v => v === true);
}

/**
 * Set a feature selection for a provider.
 * If enabled is false, stores explicitly as false (not deleted) to distinguish
 * "answered No" from "not yet answered" (key absent).
 * @param {string} providerId - One of 'aws', 'azure', 'gcp'.
 * @param {string} featureId - Feature key from the provider's FEATURES object.
 * @param {boolean} enabled - True to enable, false to explicitly disable.
 * @returns {object|null} The updated features object, or null if invalid provider.
 */
export function setFeature(providerId, featureId, enabled) {
  if (!VALID_PROVIDERS.includes(providerId)) {
    return null;
  }
  if (enabled) {
    state.providers[providerId].features[featureId] = true;
  } else {
    state.providers[providerId].features[featureId] = false;
  }
  return state.providers[providerId].features;
}

/**
 * Get all feature selections for a provider.
 * @param {string} providerId - One of 'aws', 'azure', 'gcp'.
 * @returns {object|null} Features object (keys are feature IDs, values are boolean), or null if invalid.
 */
export function getFeatures(providerId) {
  if (!VALID_PROVIDERS.includes(providerId)) {
    return null;
  }
  return state.providers[providerId].features;
}

/**
 * Set the selection mode (wizard or advanced).
 * @param {string} mode - 'wizard' or 'advanced'.
 */
export function setSelectionMode(mode) {
  if (mode === 'wizard' || mode === 'advanced') {
    state.selectionMode = mode;
  }
}

/**
 * Get the current selection mode.
 * @returns {string} 'wizard' or 'advanced'.
 */
export function getSelectionMode() {
  return state.selectionMode;
}

/**
 * Get the currently selected products.
 * @returns {string[]} Array of selected product IDs.
 */
export function getSelectedProducts() {
  return state.selectedProducts;
}

/**
 * Toggle a product selection. If already selected, removes it.
 * If not selected, adds it. Resets all provider feature selections
 * when products change (features may appear/disappear).
 * @param {string} productId - One of 'ddi' or 'assetInsight'.
 * @returns {string[]} Updated selectedProducts array.
 */
export function toggleProduct(productId) {
  if (!VALID_PRODUCTS.includes(productId)) {
    return state.selectedProducts;
  }
  const idx = state.selectedProducts.indexOf(productId);
  if (idx >= 0) {
    state.selectedProducts.splice(idx, 1);
  } else {
    state.selectedProducts.push(productId);
  }
  // Reset all provider features when products change
  for (const provider of VALID_PROVIDERS) {
    state.providers[provider].features = {};
  }
  return state.selectedProducts;
}

/**
 * Check if any product is selected.
 * @returns {boolean}
 */
export function hasProductSelected() {
  return state.selectedProducts.length > 0;
}

/**
 * Get the full state object (for debugging and future use).
 * @returns {object} The complete state object.
 */
export function getState() {
  return state;
}
