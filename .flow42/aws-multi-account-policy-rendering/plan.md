# Plan: Render AWS Multi-Account trust policy

## Vertical slices

### Slice 1 — Render catalog-backed AWS document variants

- Outcome: `buildAnnotatedAwsPolicy()` returns empty, legacy permissions-only,
  direct trust-only, or a typed mixed envelope according to the specification;
  the existing render/copy/download path continues to consume that one string.
- Dependencies: approved specification digest
  `59b39f42a0ddea8ec03893d87c60a2efecf9b6cdc2505df4a6287e0cf8b630eb`
  and the existing `AWS_FEATURES[*].policies` catalog.
- Owned files: `js/output.js`, `tests/aws-generators.test.js`, and this work
  item's `.flow42` evidence and lifecycle records.
- Proving tests: extend the existing focused failing regression to cover empty,
  unknown, permissions-only, trust-only, mixed, deterministic, and catalog
  non-mutation cases; run the configured focused Node suite and all Node tests.
- Branch/worktree: `fix/aws-multi-account-policy-rendering` in
  `/tmp/flow42-dogfood.nEB0XC/perms` only.
- Integration order: tests red, minimal renderer implementation, focused green,
  complete Node suite, browser-free static checks, verification review.
- Rollback: revert the `buildAnnotatedAwsPolicy()` change and its new tests;
  no catalog data, dependencies, deployment, or external runtime is changed.

## Parallelization map

One tightly coupled slice; no parallel work or delegation.

## Integration order

1. Lock output contracts with focused tests.
2. Implement catalog-derived trust document selection and four-way rendering.
3. Verify legacy byte equality and mixed structural separation.
4. Run focused and repository-wide browser-free checks.

## Risks and rollback

- Trust weakening: preserve catalog fields through serialization and assert the
  exact principal, action, condition operator/key, and placeholder.
- Policy-type confusion: wrap only mixed output in ordered, typed entries and
  never combine `Statement` arrays.
- Compatibility regression: return `generateAwsPolicy(selectedIds)` unchanged
  for permissions-only selections.
- Catalog mutation: construct fresh envelope entries and prove repeatability and
  source equality after generation.
- Residual risk: the mixed envelope is a transport/display collection, not one
  deployable IAM document; typed entries keep that distinction explicit.
