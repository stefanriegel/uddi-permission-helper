# Plan: Add pull-request CI gates

## Approved boundary

Implement the exact medium-risk workflow described by the approved
specification. The only product-facing file in scope is
`.github/workflows/ci.yml`; Flow42 records may be updated to preserve approval,
transitions, and verification evidence. No commit, push, pull-request write,
merge, deploy, publication, credential use, dependency installation, or live
cloud validation is authorized.

## Execution

1. Verify the OWNER approval comment through authenticated GitHub API read-back
   and match its SHA-256 to the local specification before editing.
2. Run a validation-first negative check proving the required workflow is
   absent, then add the exact reviewed workflow with least permissions,
   immutable Action SHAs, per-PR concurrency, and fixed validation commands.
3. Validate YAML and GitHub Actions semantics with `actionlint`; structurally
   inspect triggers, permissions, concurrency, pins, credential persistence,
   secrets, and write capabilities.
4. Run the complete Node tests and JavaScript syntax checks under exact Node
   `22.23.2` in a clean pinned container, and repeat the repository's configured
   test command locally as supporting evidence.
5. Record hashes and a scoped diff, advance to `verification`, and stop before
   every Git or Forge write.

## Rollback

Before any commit, rollback is deletion of the new workflow and restoration of
the Flow42 records from the pre-implementation worktree state. No external
state is changed by this plan.
