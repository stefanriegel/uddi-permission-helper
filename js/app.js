/**
 * Entry point — wires event listeners to state and UI modules.
 */

import { setActiveProvider, getActiveProvider, hasProviderData, setFeature, getFeatures, setSelectionMode, getSelectionMode, getSelectedProducts, toggleProduct, hasProductSelected } from './state.js';
import { updateProviderCards, updateWorkspace, renderWizard, renderAdvanced, updateProductCards, setProviderSelectorVisible } from './ui.js';
import { getQuestionsForProvider } from './questions.js';
import { renderOutput, updateBadge, getActiveTabContent, getActiveTabId, getDownloadFilename, setButtonsDisabled } from './output.js';

/**
 * Refresh the output panel content and badge for the current provider state.
 */
function refreshOutput() {
  const providerId = getActiveProvider();
  const features = providerId ? getFeatures(providerId) : null;
  if (providerId && features) {
    renderOutput(providerId, features);
    updateBadge(providerId, features);
  }
}

/**
 * Handle a feature answer from either wizard or advanced mode.
 * Updates state, re-renders the current mode, and refreshes provider cards.
 *
 * @param {string} featureId - Feature key.
 * @param {boolean} enabled - Whether the feature is enabled.
 */
function handleAnswer(featureId, enabled) {
  const providerId = getActiveProvider();
  if (!providerId) return;
  setFeature(providerId, featureId, enabled);
  updateProviderCards(providerId, hasProviderData);
  renderCurrentMode();
  refreshOutput();
}

/**
 * Render the current mode (wizard or advanced) for the active provider.
 */
function renderCurrentMode() {
  const providerId = getActiveProvider();
  if (!providerId) return;

  const mode = getSelectionMode();
  const questions = getQuestionsForProvider(providerId, getSelectedProducts());
  const features = getFeatures(providerId);

  if (mode === 'wizard') {
    renderWizard(questions, features, handleAnswer);
  } else {
    renderAdvanced(questions, features, handleAnswer);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const workspace = document.querySelector('.workspace');
  const cards = document.querySelectorAll('.provider-card[data-provider]');
  const modeSwitch = document.querySelector('.mode-toggle__switch');

  // Hide workspace on init (JS-enhanced state)
  if (workspace) {
    workspace.classList.add('workspace--hidden');
  }

  // Hide provider selector on init (no product selected yet)
  setProviderSelectorVisible(false);

  // Product card click handler
  const productCards = document.querySelectorAll('.product-card[data-product]');
  productCards.forEach((card) => {
    card.addEventListener('click', () => {
      const productId = card.dataset.product;
      toggleProduct(productId);

      const selected = getSelectedProducts();
      updateProductCards(selected);
      setProviderSelectorVisible(selected.length > 0);

      // Re-render workspace if provider active (features may have changed)
      if (getActiveProvider()) {
        renderCurrentMode();
        refreshOutput();
        updateProviderCards(getActiveProvider(), hasProviderData);
      }
    });
  });

  // Provider card click handler
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
      renderCurrentMode();
      refreshOutput();
    });
  });

  // Mode toggle handler
  if (modeSwitch) {
    modeSwitch.addEventListener('click', () => {
      const currentMode = getSelectionMode();
      const newMode = currentMode === 'wizard' ? 'advanced' : 'wizard';
      setSelectionMode(newMode);

      // Update toggle visual state
      modeSwitch.setAttribute('aria-checked', newMode === 'advanced' ? 'true' : 'false');

      // Update label active states
      document.querySelectorAll('.mode-toggle__label').forEach(label => {
        label.classList.toggle('mode-toggle__label--active', label.dataset.mode === newMode);
      });

      // Crossfade: fade out, swap content, fade in
      const content = document.getElementById('workspace-content');
      if (content) {
        content.classList.add('workspace__content--fading');
        setTimeout(() => {
          renderCurrentMode();
          refreshOutput();
          content.classList.remove('workspace__content--fading');
        }, 200);
      }
    });
  }

  // Output tab switching
  const tabs = document.querySelectorAll('.output__tab[role="tab"]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const panelId = tab.getAttribute('aria-controls');

      // Deactivate all tabs and hide all panels
      tabs.forEach(t => {
        t.classList.remove('output__tab--active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.output__panel[role="tabpanel"]').forEach(panel => {
        panel.hidden = true;
      });

      // Activate clicked tab and show its panel
      tab.classList.add('output__tab--active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(panelId);
      if (panel) panel.hidden = false;
    });
  });

  // Copy button handler
  const copyBtn = document.querySelector('[data-action="copy"]');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const content = getActiveTabContent();
      if (!content) return;

      try {
        await navigator.clipboard.writeText(content);
      } catch {
        // Fallback for HTTP localhost
        const textarea = document.createElement('textarea');
        textarea.value = content;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      // Confirmation UX: text changes to "Copied!" for 2s with green flash
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('output__action--copied');
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.classList.remove('output__action--copied');
      }, 2000);
    });
  }

  // Download button handler
  const downloadBtn = document.querySelector('[data-action="download"]');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const content = getActiveTabContent();
      if (!content) return;

      const providerId = getActiveProvider();
      const tabId = getActiveTabId();
      const filename = getDownloadFilename(providerId, tabId);

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // Disable copy/download buttons initially (no features selected)
  setButtonsDisabled(true);
});
