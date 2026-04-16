---
phase: quick
plan: 01
subsystem: aws
tags: [iam, s3, resource-scoping, least-privilege]

# Dependency graph
requires: []
provides:
  - S3 bucket actions use resource-scoped ARN (arn:aws:s3:::*) in generated policies
  - Split statement pattern for future resource narrowing
affects: [output.js annotated policy builder]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "S3 bucket-level actions split into separate IAM statement with arn:aws:s3:::* Resource"

key-files:
  created: []
  modified:
    - js/data/aws.js
    - tests/aws-generators.test.js

key-decisions:
  - "Split S3 Get actions (GetBucketPolicy, GetBucketPublicAccessBlock) into separate statement with arn:aws:s3:::* rather than keeping all actions under Resource: *"
  - "s3:ListAllMyBuckets remains in main statement because it does not support resource-level permissions"

patterns-established:
  - "Resource narrowing: when AWS actions support resource-level ARNs, split them into a separate statement"

requirements-completed: []

# Metrics
duration: 4min
completed: 2026-04-16
---

# Quick-01: AWS S3 Resource Scoping Summary

**S3 bucket-level IAM actions (GetBucketPolicy, GetBucketPublicAccessBlock) narrowed from Resource: * to arn:aws:s3:::* in generated policies and Terraform**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-16T23:18:04Z
- **Completed:** 2026-04-16T23:23:22Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- generateAwsPolicy now produces two IAM statements when S3 features are selected: one with Resource: * for actions that require it, and one with Resource: arn:aws:s3:::* for S3 bucket-level actions
- generateAwsTerraform applies the same split logic in HCL output
- 7 new test assertions covering S3 statement split, single-statement fallback, and mixed feature combinations

## Task Commits

Each task was committed atomically:

1. **Task 1: Split S3 statement and add Resource rationale** - `ad3cea9` (feat)
2. **Task 2: Update AWS tests for split S3 statement** - `1b3cd1f` (test)

## Files Created/Modified
- `js/data/aws.js` - Split S3 bucket actions into separate resource-scoped IAM statement in both generateAwsPolicy and generateAwsTerraform
- `tests/aws-generators.test.js` - Added tests for S3 split behavior and updated existing tests with statement count assertions

## Decisions Made
- Split only s3:GetBucketPolicy and s3:GetBucketPublicAccessBlock (they support bucket-level ARNs); s3:ListAllMyBuckets stays in the wildcard statement because AWS requires Resource: * for it
- Did not modify per-feature terraform templates (they are reference-only; the combined generators are what customers use)
- Did not modify output.js annotated policy builder (out of scope per plan; logged as deferred item)

## Deviations from Plan

None - plan executed exactly as written.

## Deferred Items

- `js/output.js` buildAnnotatedAwsPolicy function still generates a single-statement structure with Resource: *. It should be updated to reflect the S3 split for annotated output mode. Low priority since the standard policy generator (generateAwsPolicy) is the primary output.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- S3 resource scoping complete and tested
- Annotated policy builder (output.js) can be updated in a follow-up task

---
*Phase: quick*
*Completed: 2026-04-16*
