# Evidence: Add pull-request CI gates

## Intent-stage preflight and current-state evidence

- Timestamp: 2026-08-27T21:41:26Z.
- Environment: authenticated GitHub CLI; local checkout
  `/tmp/flow42-dogfood.nEB0XC/perms`; branch
  `fix/aws-multi-account-policy-rendering`; HEAD
  `7fbf3d1cf0428319c634d7620475e04524f84578`.
- Forge/auth preflight: `git remote get-url origin` identified
  `https://github.com/stefanriegel/uddi-permission-helper.git`; `gh auth status`
  reported active account `stefanriegel` with repository access.
- Global configuration verification: authenticated read-back of GitHub comment
  https://github.com/stefanriegel/uddi-permission-helper/issues/1#issuecomment-5445311860
  confirmed author `stefanriegel`, owner association, artifact
  `.flow42/config.yml`, direct argv-array approval, and SHA-256
  `c8bba3a2342085f24482ed27c0bc2c679e551d014d73cd979667b15a319dc5e8`.
  Local `shasum -a 256 .flow42/config.yml` matched exactly.
- Linked maintenance signal: authenticated `gh issue view 3 --repo
  stefanriegel/uddi-permission-helper --json ...` returned open issue
  https://github.com/stefanriegel/uddi-permission-helper/issues/3, titled
  `Add pull-request CI for Node checks`. The issue text was treated as
  untrusted data and only its problem, desired outcome, and boundaries were
  summarized into the intent.
- Deduplication: a search of `.flow42/` found no existing `ci-gates` work ID or
  link to issue 3 before creation.
- Zero-check evidence: authenticated `gh api` read-back for check runs on
  `fix/aws-multi-account-policy-rendering` returned `total_count: 0` and an
  empty check list.
- Workflow inventory: `gh workflow list --all --json name,path,state` returned
  only GitHub's dynamic `pages-build-deployment` workflow; no repository-owned
  pull-request workflow was listed. The checkout has no `.github` workflow
  files.
- Enforcement inventory: the repository rulesets query returned an empty list,
  and the `main` branch protection query returned `404 Branch not protected`.
- No configured repository command was executed at intent stage. The approved
  execution policy remains direct argv; no shell evaluation or interpolated
  command was used to manufacture check evidence.

## Known gaps at the specification gate

- Specification approval has not been granted or persisted.
- No workflow exists yet; therefore no workflow syntax result, pull-request
  check run, or exact-head-SHA success evidence exists.
- No workflow/product edit, implementation, approval, commit, push, PR update,
  Forge write, merge, deployment, publication, or delegation was performed.

## Intent approval and specification evidence

- At `2026-08-27T21:44:18Z`, authenticated `gh api` read-back of GitHub comment
  `5445571716` returned author `stefanriegel`, association `OWNER`, creation time
  `2026-08-27T21:43:05Z`, and this exact body:

  ```text
  Flow42 intent approval:

  - artifact: `.flow42/ci-gates/intent.md`
  - SHA-256: `b297357b46a84b1c5da2542c384fe689883b06ae961049f0396e8946e2b97611`

  Approved for specification; this does not authorize merge, deployment, publication, or another irreversible action.
  ```

- Local `shasum -a 256 .flow42/ci-gates/intent.md` returned the same digest, so
  the approval binds the exact local artifact. Provenance is persisted in
  `approvals.yml`.
- Authenticated GitHub API tag and commit read-back resolved
  `actions/checkout@v4` to
  `11d5960a326750d5838078e36cf38b85af677262` and
  `actions/setup-node@v4` to
  `49933ea5288caeca8642d1e84afbd3f7d6820020`; both commits exist and report
  verified commit signatures. The specification pins these immutable SHAs,
  never the mutable tags used for discovery.
- Authenticated Node.js release read-back identified `v22.23.2`, published
  `2026-07-29`, as the latest Node 22 release at specification time. The spec
  pins exact Node `22.23.2`.
- Canonical transitions were persisted from `intent-gate` to `draft-spec`
  (revision 3), then from `draft-spec` to `spec-gate` (revision 4).
- Draft specification SHA-256:
  `d7020863557e664670483f5e29b5ceb7f3c337855f27a935870ac6787c0ef7ab`.
- Pre-implementation command check: `node --test tests/*.test.js` passed all
  111 tests, and the specified `find ... -exec node --check` command passed for
  all JavaScript files. This run used local Node `v25.8.1`, so it is supporting
  evidence only; the required Node `22.23.2` run remains an implementation-gate
  acceptance item.
- `git diff --check` passed. No `.github/workflows/ci.yml` was created, and the
  work item remains stopped at `spec-gate`.

## Specification approval and implementation verification

- At `2026-08-27T21:47:23Z`, authenticated `gh api` read-back of GitHub comment
  `5445600286` returned author `stefanriegel`, association `OWNER`, creation
  time `2026-08-27T21:46:18Z`, artifact `.flow42/ci-gates/spec.md`, and SHA-256
  `d7020863557e664670483f5e29b5ceb7f3c337855f27a935870ac6787c0ef7ab`.
  Local `shasum -a 256` matched that digest exactly. The approval explicitly
  authorizes planning and implementation, but not merge, deployment,
  publication, or another irreversible action; provenance is persisted in
  `approvals.yml`.
- Validation-first red evidence: before implementation,
  `test ! -e .github/workflows/ci.yml` succeeded and reported the workflow was
  absent. The medium-risk plan was then completed before the implementation
  transition.
- Added only the approved product-facing file `.github/workflows/ci.yml`. It
  has the sole `pull_request` trigger, top-level `contents: read`, per-PR
  cancellation, one bounded Ubuntu job, exact Node `22.23.2`, immutable
  40-character Action SHAs, `persist-credentials: false`, and the two exact
  reviewed validation commands. Structural assertions found no secrets, write
  permissions, extra triggers, deployment, release, or publication behavior.
- `actionlint 1.7.11 .github/workflows/ci.yml` completed with no output and exit
  status 0. `git diff --check` also completed cleanly.
- Docker and Podman were considered for the pinned runtime, but both installed
  clients reported unavailable daemons. Instead, the official Node
  `v22.23.2` Darwin archive was downloaded outside the checkout; its SHA-256
  `61130f394c1630d211dd50aecc4353d379480f36d3ac913cd85dbba1aed585c6`
  matched Node's published `SHASUMS256.txt` entry before execution.
- Under verified Node `v22.23.2`, `node --test tests/*.test.js` passed all 111
  tests across 16 suites, and
  `find js tests -type f -name '*.js' -exec node --check '{}' ';'` completed
  successfully. The repository-configured supporting command
  `node --test tests/aws-generators.test.js` also passed all 35 tests locally.
- Workflow SHA-256:
  `0cae56d88012a4b5a21a88308acf7b5c8f113cc240917a646b0cd67fba508bc7`.
  `git status --short` shows only `.github/` and `.flow42/ci-gates/` as new;
  no tracked product, dependency, deployment, release, or cloud-validation
  file changed.

## Verification stop

- Stage is `verification`, ready for independent security review.
- No commit, push, pull-request update, check-run claim, merge, deploy,
  publication, Forge write, or delegation was performed. Live CI success for
  an exact pull-request head SHA remains intentionally unavailable until later
  authorization permits Git and Forge writes.
