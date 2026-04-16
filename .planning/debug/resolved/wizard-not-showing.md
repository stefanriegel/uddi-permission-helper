---
status: awaiting_human_verify
trigger: "When user clicks a cloud provider card, workspace panel activates but no wizard questions or advanced mode UI appears"
created: 2026-04-16T00:00:00Z
updated: 2026-04-16T00:02:00Z
---

## Current Focus

hypothesis: CONFIRMED - file:// protocol blocks ES module loading
test: Puppeteer headless browser tests
expecting: HTTP works, file:// shows warning
next_action: Await human verification that running via local HTTP server resolves the issue

## Symptoms

expected: Selecting a provider card should show wizard questions (sequential yes/no cards) or advanced mode checkboxes in the workspace panel, with a Wizard/Advanced toggle at the top.
actual: Clicking a provider card highlights it and reveals the workspace panel, but no wizard questions or advanced mode content appears.
errors: Unknown - user did not report console errors. Check for JS errors.
reproduction: Open index.html in browser, click any provider card (AWS, Azure, GCP).
started: Initial v1.0 build - may have never worked in browser (all verification was code-level).

## Eliminated

- hypothesis: CSS specificity issue blocking workspace__content display
  evidence: Verified .workspace--active .workspace__content (0,2,0) overrides .workspace__content (0,1,0). Puppeteer confirms content display:block when workspace--active applied.
  timestamp: 2026-04-16T00:00:30Z

- hypothesis: JavaScript runtime error in renderWizard or data modules
  evidence: Node --check passes all files. Node execution of getQuestionsForProvider returns 6 questions for AWS. Puppeteer test shows 7 child elements rendered in workspace-content with correct wizard HTML.
  timestamp: 2026-04-16T00:00:45Z

- hypothesis: Import/export mismatch between modules
  evidence: All exports verified against imports. Node module loading test succeeds.
  timestamp: 2026-04-16T00:00:35Z

## Evidence

- timestamp: 2026-04-16T00:00:20Z
  checked: All JS files for syntax errors via node --check
  found: Zero syntax errors across all 8 JS files
  implication: No parse-time failures

- timestamp: 2026-04-16T00:00:25Z
  checked: getQuestionsForProvider('aws') output
  found: Returns 6 questions (4 standalone, 2 with sub-questions)
  implication: Data pipeline is correct

- timestamp: 2026-04-16T00:00:40Z
  checked: CSS workspace visibility rules
  found: workspace__header and workspace__content start display:none, workspace--active overrides to flex/block
  implication: CSS is correct, relies on JS adding workspace--active class

- timestamp: 2026-04-16T00:00:55Z
  checked: Full end-to-end test via Puppeteer headless Chrome with HTTP server
  found: Wizard renders perfectly - 7 child elements, correct HTML with progress indicator and 6 wizard cards. workspace--active class applied, content display:block, header display:flex. Only error: favicon 404.
  implication: Code is correct. The bug only manifests when NOT using HTTP server (file:// protocol).

- timestamp: 2026-04-16T00:01:00Z
  checked: Site behavior without JS (file:// protocol blocks ES modules)
  found: Without JS, workspace--hidden never added, workspace is visible by default but workspace__header and workspace__content stay display:none. Only workspace__empty paragraph shows. Card clicks have no handlers, so hover effect could be mistaken for "highlights".
  implication: ROOT CAUSE confirmed.

- timestamp: 2026-04-16T00:01:30Z
  checked: Fix verification via Puppeteer - two tests
  found: (1) HTTP test: wizard renders 7 children, no warning banner shown. (2) file:// test: warning banner shown with "Local server required" message, workspace content empty (0 children). Both tests pass.
  implication: Fix works correctly in both scenarios.

## Resolution

root_cause: ES modules loaded via `<script type="module">` are blocked by CORS policy when the page is opened via file:// protocol (double-clicking index.html). This causes the entire JS module tree (app.js and all imports) to fail silently. Without JS, the workspace panel shows by default (no workspace--hidden class) but only displays the empty state message. Provider cards have no click handlers, so the user sees static HTML that appears broken.
fix: Added a classic (non-module) inline script in index.html that detects file:// protocol and injects a visible warning banner with instructions to start a local HTTP server (`python3 -m http.server 8000`). Also added corresponding CSS styles for the warning banner.
verification: Puppeteer headless Chrome tests confirm (1) wizard works correctly via HTTP with 7 child elements rendered, (2) file:// protocol shows warning banner as expected.
files_changed: [index.html, css/styles.css]
