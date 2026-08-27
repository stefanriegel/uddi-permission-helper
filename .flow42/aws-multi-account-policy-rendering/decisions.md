# Decisions: Render AWS Multi-Account trust policy

For each decision record context, options, decision, rationale, consequences,
actor, timestamp, and the approved artifact hash when applicable.

## 2026-08-27 — Intent approved for specification

- Context: the work item was waiting at the intent gate.
- Decision: accept OWNER comment 5445284977 as approval of the exact intent
  artifact with SHA-256
  `53e2c3ecc35e0aa8d21cc2e026983eb568414ccf09e87a9be941108e439c704b`.
- Rationale: GitHub author association, comment body, and the local artifact
  digest were independently verified and match.
- Consequence: specification drafting is authorized; implementation, merge,
  deployment, publication, and irreversible action remain unauthorized.
- Actor: `stefanriegel` (approval), verified by `codex-worker`.
- Timestamp: `2026-08-27T21:17:37Z`.

## 2026-08-27 — Keep IAM document types structurally separate

- Context: a mixed selection must expose an identity permissions policy and a
  role trust policy without producing invalid JSON or combining different IAM
  semantics.
- Options: concatenate two JSON values; merge their statements; always wrap;
  preserve legacy single-document shapes and wrap only mixed output.
- Decision: preserve direct permissions-only and trust-only JSON documents;
  use a typed `documents` envelope only for a mixed selection, ordered as
  permissions then trust.
- Rationale: this keeps existing permissions-only consumers compatible,
  satisfies direct trust-policy usability, and makes the security boundary
  explicit for mixed output.
- Consequence: the mixed envelope is not directly deployable as one IAM policy;
  implementation and UI review must preserve that distinction.
- Actor: `codex-worker`.
- Timestamp: `2026-08-27T21:17:37Z`.

## 2026-08-27 — Specification approved for planning

- Context: the work item was waiting at the specification gate.
- Decision: accept OWNER comment 5445354047 as approval of the exact
  specification artifact with SHA-256
  `59b39f42a0ddea8ec03893d87c60a2efecf9b6cdc2505df4a6287e0cf8b630eb`.
- Rationale: GitHub authentication, author association, comment body, and the
  local artifact digest were independently verified and match.
- Consequence: medium-risk planning and reversible implementation/verification
  are authorized; commit, push, PR, merge, deployment, publication, and other
  irreversible actions remain unauthorized.
- Actor: `stefanriegel` (approval), verified by `codex-worker`.
- Timestamp: `2026-08-27T21:22:45Z`.
