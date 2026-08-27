# Intent: Add pull-request CI gates

- Work ID: `ci-gates`
- Risk: medium

## Problem

Pull requests have no repository-owned automated checks, so changes cannot
produce the CI evidence required for Flow42's reviewed, CI-green terminal
state. GitHub issue 3 tracks this gap:
https://github.com/stefanriegel/uddi-permission-helper/issues/3.

## Desired outcome

Add a minimal pull-request CI workflow that runs the repository's complete
Node test suite and JavaScript syntax checks, yielding deterministic check
results reviewers can use before merge.

## Users

- Maintainers reviewing changes to the permission helper.
- Contributors who need prompt, reproducible feedback on pull requests.
- Security reviewers who need evidence that generated cloud-permission output
  remains covered by the repository's checks.

## Constraints

- Preserve the static, dependency-free product and make no product behavior
  changes.
- Run only on pull requests and grant the workflow least privilege.
- Pin every third-party GitHub Action to an immutable full commit SHA.
- Use reproducible direct-argv commands; do not use `eval`, command
  substitution, dynamically constructed shell commands, or untrusted values as
  executable input.
- Cover the complete Node test suite and syntax-check the repository's
  JavaScript sources and tests.
- Do not deploy, release, publish, add dependencies, or change repository
  secrets.

## Non-goals

- Changing application code, tests, generated policies, or user-visible
  behavior.
- Adding deployment, release, scheduled, or push-triggered automation.
- Configuring branch protection or repository rulesets.
- Approving, merging, or otherwise authorizing the resulting change.

## Acceptance signals

- A pull-request workflow exists with explicit read-only permissions and a
  pull-request trigger.
- All third-party Action references are immutable full commit SHAs.
- The workflow runs the complete Node test suite and syntax checks using the
  approved direct-argv command boundary.
- A local validation of the workflow and its exact commands passes before any
  PR is created or updated.
- Verification records the resulting named GitHub checks and confirms they
  succeed on the change request before it can reach `ready-for-human`.

## Assumptions and risks

- Current read-only Forge evidence shows zero check runs on branch
  `fix/aws-multi-account-policy-rendering`; the only listed workflow is GitHub's
  dynamic Pages deployment workflow, not a repository-owned pull-request gate.
- CI configuration executes in a privileged repository automation context;
  unsafe triggers, excessive permissions, or mutable Actions could create a
  supply-chain or token-exposure risk.
- The change is classified medium risk because it is reversible and does not
  alter product or production behavior, while still crossing the CI permission
  and third-party Action trust boundary.
- Exact test and syntax-check argv must be specified and verified after intent
  approval; this intent does not authorize workflow implementation.
