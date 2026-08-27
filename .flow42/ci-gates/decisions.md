# Decisions: Add pull-request CI gates

For each decision record context, options, decision, rationale, consequences,
actor, timestamp, and the approved artifact hash when applicable.

## 2026-08-27 — Minimal hermetic pull-request gate

- Context: issue 3 requests repository-owned pull-request evidence for a
  dependency-free static project whose live cloud validators require external
  credentials.
- Options: run only unit tests; run unit tests plus all source/test syntax
  checks; or also run credentialed cloud validators.
- Decision: use exact Node.js `22.23.2`, run all `tests/*.test.js`, and syntax
  check every JavaScript file under `js/` and `tests/`; exclude live cloud
  validator execution.
- Rationale: this covers the complete hermetic suite and all checked-in
  JavaScript without adding dependencies, secrets, or flaky external calls.
- Consequences: live cloud behavior remains outside this CI gate; future test
  files matching `tests/*.test.js` and JavaScript files under the two trees are
  included automatically.
- Supply-chain boundary: pin checkout and setup-node to authenticated,
  signature-verified 40-character commit SHAs, disable persisted checkout
  credentials, and grant only `contents: read`.
- Actor: `codex-worker`.
- Timestamp: `2026-08-27T21:44:18Z`.
- Approved artifact hash:
  `b297357b46a84b1c5da2542c384fe689883b06ae961049f0396e8946e2b97611`
