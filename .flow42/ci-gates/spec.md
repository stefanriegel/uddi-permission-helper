# Specification: Add pull-request CI gates

- Work ID: `ci-gates`
- Risk: medium
- Approved intent SHA-256:
  `b297357b46a84b1c5da2542c384fe689883b06ae961049f0396e8946e2b97611`

## Scope

Add one repository-owned workflow at `.github/workflows/ci.yml`. It validates
pull requests only; it must not change product code, install project
dependencies, use cloud credentials, deploy, release, publish, or write to the
repository or pull request.

## Workflow contract

- Workflow name: `CI`.
- Trigger: `pull_request` with the default activity types (`opened`,
  `synchronize`, and `reopened`). No `push`, `pull_request_target`, schedule,
  manual-dispatch, deployment, or release trigger.
- Top-level permissions: `contents: read`. Do not grant any other GitHub token
  permission at workflow or job scope.
- Concurrency group: `ci-${{ github.event.pull_request.number }}` with
  `cancel-in-progress: true`, so a new revision cancels obsolete work for the
  same pull request without coupling unrelated pull requests.
- One job, ID `node-checks`, display name `Node tests and syntax`, on
  `ubuntu-24.04`, with a 10-minute timeout.
- The job checks out the pull-request merge commit using
  `actions/checkout@11d5960a326750d5838078e36cf38b85af677262` and explicitly
  sets `persist-credentials: false`.
- The job installs exact Node.js `22.23.2` using
  `actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020`. Do not enable
  package-manager caching: the unit suite has no root package manifest or
  dependency installation step.
- Action pins above are immutable 40-character commit SHAs. Authenticated
  GitHub API read-back verified both commits exist and have verified commit
  signatures; the workflow must not replace them with mutable tags or branch
  names.

## Exact validation commands

Run these as two separate steps from the repository root:

```text
node --test tests/*.test.js
find js tests -type f -name '*.js' -exec node --check '{}' ';'
```

The first command covers every current Node test file under `tests/`, including
the AWS validation-manifest contract. It intentionally does not invoke the
credentialed scripts under `tests/cloud-validation/`; those are live cloud
validators, not hermetic unit tests.

The second command discovers every JavaScript file under the product and test
trees and passes each path directly to `node --check`. It must remain a fixed
`find -exec` argv boundary: no `eval`, command substitution, generated shell
source, interpolated event data, or untrusted value may become executable
input. The step fails on the first non-zero syntax-check result.

## Required workflow structure

The implementation must be semantically equivalent to this reviewed shape;
the specification does not authorize creating it yet:

```yaml
name: CI

on:
  pull_request:

permissions:
  contents: read

concurrency:
  group: ci-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  node-checks:
    name: Node tests and syntax
    runs-on: ubuntu-24.04
    timeout-minutes: 10
    steps:
      - name: Check out pull request
        uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262
        with:
          persist-credentials: false
      - name: Set up Node.js
        uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020
        with:
          node-version: 22.23.2
      - name: Run complete Node test suite
        run: node --test tests/*.test.js
      - name: Check JavaScript syntax
        run: find js tests -type f -name '*.js' -exec node --check '{}' ';'
```

## Implementation and acceptance evidence

After separate OWNER approval of this specification, implementation may add
only `.github/workflows/ci.yml` plus Flow42 records required by the approved
process. Before any commit, push, or pull-request write, capture:

1. A clean `actionlint .github/workflows/ci.yml` result.
2. Successful local execution of both exact commands above with the Node
   version recorded. If Node `22.23.2` is unavailable locally, validate inside
   a clean, pinned Node `22.23.2` environment rather than substituting a
   different runtime without recording the variance.
3. A structural read-back showing the sole trigger is `pull_request`, top-level
   permissions are exactly `contents: read`, cancellation is enabled, both
   Action references are full 40-character SHAs, checkout credentials are not
   persisted, and no secrets or write permissions are present.
4. The workflow file SHA-256 and a scoped diff showing no product, dependency,
   deployment, release, or cloud-validation behavior changed.

After later, separately authorized commit/push/PR writes, acceptance additionally
requires authenticated GitHub read-back of the pull request's head SHA and its
named `CI / Node tests and syntax` check run, with conclusion `success` for that
exact head SHA. A skipped, neutral, stale-SHA, or absent check is not passing
evidence. Branch-protection or ruleset configuration remains out of scope.

## Stop condition

Stop at `spec-gate` until an OWNER approves the exact SHA-256 of this
specification. Specification approval alone will not authorize commit, push,
pull-request creation or update, merge, deployment, publication, or any other
irreversible action.
