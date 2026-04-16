# Architecture Patterns

**Domain:** Static single-page permission policy generator (vanilla JS, no framework, no build step)
**Researched:** 2026-04-16

---

## Recommended Architecture

A three-layer unidirectional data flow, where permission data schema drives everything: the form UI renders from it, user selections accumulate into app state, and state is projected into formatted output. No framework. No build step. Native ES modules loaded via `<script type="module">`.

```
┌─────────────────────────────────────────────────────────┐
│                    index.html                           │
│    <script type="module" src="js/app.js"></script>      │
└───────────────────┬─────────────────────────────────────┘
                    │ bootstraps
                    ▼
┌─────────────────────────────────────────────────────────┐
│  app.js  — entry point                                  │
│  Imports all modules. Wires store → renderer → output.  │
│  Owns the top-level event listeners.                    │
└───┬───────────────┬───────────────┬─────────────────────┘
    │               │               │
    ▼               ▼               ▼
┌──────────┐  ┌──────────────┐  ┌──────────────────────┐
│ store.js │  │ form-view.js │  │  output-view.js       │
│ (state)  │  │ (wizard +    │  │  (native policy JSON, │
│          │  │  advanced    │  │   Terraform, guide)   │
│ Proxy +  │  │  checkboxes) │  │                       │
│ EventBus │  │              │  │  formatter modules    │
└──────────┘  └──────────────┘  └──────────────────────┘
    ▲               │                       │
    │  writes       │  reads                │  reads
    └───────────────┘                       │
    ▲                                       │
    │              reads                    │
    └───────────────────────────────────────┘

Data layer (no I/O, pure JS objects):
┌──────────────────────────────────────────────────────────┐
│  data/aws.js   data/azure.js   data/gcp.js               │
│  Each exports: { features, wizardQuestions, permissions }│
└──────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

| Component | File | Responsibility | Communicates With |
|-----------|------|---------------|-------------------|
| Entry point | `js/app.js` | Bootstrap, wire modules, top-level event delegation | Imports all other modules |
| State store | `js/store.js` | Single source of truth for selected cloud provider, wizard answers, feature flags, active tab | Dispatches `state-change` CustomEvent on mutation; read by form-view and output-view |
| Form view | `js/form-view.js` | Renders wizard questions OR advanced checkboxes based on store state; handles input events | Writes to store; reads permission schema from data/ |
| Output view | `js/output-view.js` | Subscribes to state changes; calls formatter for active tab; injects HTML into output pane; drives copy/download | Reads from store; calls formatter modules |
| Formatters | `js/formatters/aws.js`, `azure.js`, `gcp.js` | Pure functions: `(selectedFeatures) → { nativePolicy, terraform, guide }` | No side effects; return strings only |
| Permission data | `js/data/aws.js`, `azure.js`, `gcp.js` | Hardcoded permission schema objects: features, wizard questions, permission strings | Imported by form-view and formatters; never mutated |
| Utilities | `js/utils.js` | Clipboard write, file download, DOM helpers | Called by output-view |
| Styles | `css/main.css` | All layout and branding | No JS dependency |

---

## State Shape

```javascript
// store.js — internal state object (managed via Proxy)
{
  provider: 'aws' | 'azure' | 'gcp' | null,
  mode: 'wizard' | 'advanced',
  wizardStep: 0,                    // current wizard page index
  wizardAnswers: {},                // { questionId: true/false }
  advancedSelections: new Set(),    // feature IDs checked directly
  activeOutputTab: 'native' | 'terraform' | 'guide',
  // derived (computed at read time, not stored):
  // selectedFeatureIds — union of wizard-resolved + advanced selections
}
```

Derived values (the resolved feature list and permission list) are computed at render time by pure functions, not stored. This avoids synchronisation bugs.

---

## Data Flow

**Selection change (unidirectional, strict):**

```
User interaction
  → DOM event on form-view element
  → form-view calls store.set(key, value)
  → Proxy trap fires
  → store dispatches CustomEvent('state-change', { detail: snapshot })
  → output-view listener receives snapshot
  → output-view calls formatters with resolved features
  → output-view updates DOM
```

**No back-channel.** Formatters never touch DOM. store.js never imports views. Views never talk to each other directly.

---

## State Management Pattern

Use a module-singleton store with a `Proxy` for automatic change detection and the native `EventTarget` for pub/sub. ES modules are singletons by default — importing `store.js` from multiple modules yields the same object.

```javascript
// js/store.js
const _state = { provider: null, mode: 'wizard', ... }
const bus = new EventTarget()

export const store = new Proxy(_state, {
  set(target, prop, value) {
    Reflect.set(target, prop, value)
    bus.dispatchEvent(new CustomEvent('state-change', {
      detail: { ...target }   // snapshot, not reference
    }))
    return true
  }
})

export function onStateChange(fn) {
  bus.addEventListener('state-change', (e) => fn(e.detail))
}
```

This pattern:
- Requires zero libraries (HIGH confidence — native browser APIs)
- Fires synchronously on assignment (`store.provider = 'aws'`)
- Allows multiple subscribers (form-view and output-view both listen)
- Passes a snapshot to prevent stale reads

Limitation: nested object mutations (e.g. `store.wizardAnswers.q1 = true`) bypass the Proxy trap. Prevention: always replace at the top-level key (`store.wizardAnswers = { ...store.wizardAnswers, q1: true }`).

---

## Data-Driven Form Generation

Permission data files export a schema object. The form renderer loops over this schema to create DOM elements — no hardcoded form markup.

```javascript
// js/data/aws.js (schema shape)
export const awsData = {
  wizardQuestions: [
    {
      id: 'vpc_discovery',
      text: 'Do you need VPC/subnet discovery?',
      featureIds: ['vpc', 'subnets']
    },
    ...
  ],
  features: [
    {
      id: 'vpc',
      label: 'VPC Discovery',
      category: 'Networking',
      permissions: ['ec2:DescribeVpcs', 'ec2:DescribeSubnets', ...]
    },
    ...
  ]
}
```

`form-view.js` imports the active provider's schema and renders questions/checkboxes by iterating these arrays. Adding a new feature requires only a data change, not a markup change.

---

## Reactive Rendering Approach

Full DOM replacement (innerHTML) on each state change for the output panel — acceptable because output is a read-only display, not an interactive form with cursor state. Input elements (wizard and checkboxes) are rendered once on provider select and only updated when provider changes or mode switches.

Avoid virtual DOM or diffing for this scale. The output is at most a few hundred lines of text. Re-writing the `<pre>` content on each state change is imperceptible.

```javascript
// output-view.js pattern
onStateChange((state) => {
  const features = resolveFeatures(state)
  const output = formatters[state.provider](features)
  outputEl.textContent = output[state.activeOutputTab]
  badgeEl.textContent = countPermissions(output.native)
})
```

---

## Output Formatting

Each formatter is a pure function that accepts a list of resolved feature IDs and returns three string properties:

```javascript
// js/formatters/aws.js
export function formatAWS(selectedFeatureIds, allFeatures) {
  const permissions = collectPermissions(selectedFeatureIds, allFeatures)
  return {
    native: JSON.stringify(buildAWSPolicy(permissions), null, 2),
    terraform: buildTerraformHCL(permissions),
    guide: buildSetupGuide(selectedFeatureIds, allFeatures)
  }
}
```

Formatters have no imports except data utilities. They are independently testable by pasting into a browser console. This is the most important isolation boundary in the system.

---

## Clipboard and Download

```javascript
// js/utils.js
export async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text)
}

export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

`navigator.clipboard.writeText` requires a secure context (HTTPS or localhost). All static hosting targets (GitHub Pages, Netlify) satisfy this. Fallback to `document.execCommand('copy')` is not needed for this deployment context. (MEDIUM confidence — MDN docs confirm secure context requirement.)

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Shared mutable state via global variables
**What:** `window.appState = {}` or module-level `let state = {}` mutated from multiple files.
**Why bad:** Race conditions on async paths, no change detection, impossible to test.
**Instead:** Single Proxy-backed store module imported everywhere.

### Anti-Pattern 2: DOM as source of truth
**What:** Reading checkbox values from the DOM when generating output (e.g. `document.querySelectorAll('input:checked')`).
**Why bad:** Breaks when switching modes (wizard vs. advanced): DOM state and logical state diverge.
**Instead:** Store holds the canonical selection; DOM reflects it.

### Anti-Pattern 3: Logic in event handlers
**What:** Computing policy strings inside `addEventListener` callbacks.
**Why bad:** Untestable, hard to reuse for download vs. display.
**Instead:** Event handlers write to store only. Formatters compute. Views display.

### Anti-Pattern 4: Hardcoding permission strings in view files
**What:** Putting `'ec2:DescribeVpcs'` strings inside `form-view.js` or `output-view.js`.
**Why bad:** Same permission needed by multiple output formats; drift risk.
**Instead:** All permission strings live only in `data/` files.

---

## File Structure

```
/
├── index.html              # Single page. Loads app.js as module. All markup skeletons.
├── css/
│   └── main.css            # All styles, Infoblox brand tokens as CSS custom properties
└── js/
    ├── app.js              # Entry: imports modules, initialises store, registers listeners
    ├── store.js            # State singleton: Proxy + EventTarget pub/sub
    ├── form-view.js        # Renders wizard steps and advanced checkbox grid
    ├── output-view.js      # Renders output tabs, drives copy/download buttons
    ├── utils.js            # clipboard, download, DOM helpers
    ├── data/
    │   ├── aws.js          # AWS permission schema (features, wizard questions, actions)
    │   ├── azure.js        # Azure permission schema
    │   └── gcp.js          # GCP permission schema
    └── formatters/
        ├── aws.js          # Pure fn: selectedIds → { native, terraform, guide }
        ├── azure.js
        └── gcp.js
```

Total: 11 JS files, 1 HTML file, 1 CSS file. No package.json. No build. Open `index.html` in a browser.

---

## Suggested Build Order

Dependencies flow bottom-up. Build in this order:

| Order | Component | Depends On | Why First |
|-------|-----------|------------|-----------|
| 1 | `data/aws.js`, `data/azure.js`, `data/gcp.js` | Nothing | All other modules consume data; shapes must be settled before anything else |
| 2 | `js/formatters/*.js` | data/ | Pure functions. Can be tested in isolation immediately. Defines what the output looks like. |
| 3 | `js/store.js` | Nothing | Core contract: what state shape exists. Views and formatters depend on it. |
| 4 | `js/utils.js` | Nothing | Clipboard/download helpers needed by output-view |
| 5 | `js/output-view.js` | store, formatters, utils | Output panel is testable without form interaction (inject test state into store) |
| 6 | `js/form-view.js` | store, data/ | Form writes to store; output-view already reacts |
| 7 | `js/app.js` | All above | Wire up everything, provider picker, mode toggle |
| 8 | `index.html` skeleton + `css/main.css` | None | Markup can be written at any point; bind it last |

This order lets you validate the most important logic (formatter correctness) before building any UI.

---

## Scalability Considerations

This is a micro-tool. Scale concerns are operational, not architectural.

| Concern | At current scope | If permissions data grows large |
|---------|-----------------|--------------------------------|
| Data file size | Inline JS objects, ~50-200 permissions per cloud | Split into separate fetch'd JSON; add loading state to store |
| Adding a 4th cloud | Add `data/newcloud.js` + `formatters/newcloud.js`; register in app.js | No architectural change |
| Unit testing | Paste formatter functions into browser console; no test runner needed | Add a test file that imports formatters as modules and asserts outputs |
| Offline | Pure static, works offline immediately | No change needed |

---

## Sources

- [Patterns for Reactivity with Modern Vanilla JavaScript — Frontend Masters Blog](https://frontendmasters.com/blog/vanilla-javascript-reactivity/) — HIGH confidence (direct technical article)
- [Reactivity Without a Framework: What Native JS Can Do Today — OpenReplay](https://blog.openreplay.com/reactivity-without-framework-native-js/) — HIGH confidence
- [Simple reactive data stores with vanilla JavaScript and Proxies — Go Make Things](https://gomakethings.com/simple-reactive-data-stores-with-vanilla-javascript-and-proxies/) — HIGH confidence
- [Building Modular Web Apps with Vanilla JavaScript — Dev Decodes / Medium](https://devdecodes.medium.com/building-modular-web-apps-with-vanilla-javascript-no-frameworks-needed-631710bae703) — MEDIUM confidence (community article)
- [Schema-Based Form System — Tania Rascia](https://www.taniarascia.com/schema-based-form-system/) — HIGH confidence (detailed technical walkthrough)
- [Observer Pattern — Patterns.dev](https://www.patterns.dev/vanilla/observer-pattern/) — HIGH confidence (authoritative patterns reference)
- [Singleton Pattern — Patterns.dev](https://www.patterns.dev/vanilla/singleton-pattern/) — HIGH confidence
- [JavaScript modules — MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) — HIGH confidence (official spec reference)
- [Clipboard API — MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText) — HIGH confidence (official API docs)
