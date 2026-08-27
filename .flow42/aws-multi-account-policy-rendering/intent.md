# Intent: Render AWS Multi-Account trust policy

- Work ID: `aws-multi-account-policy-rendering`
- Status: awaiting approval
- Risk: medium

## Problem

When an operator selects only AWS Multi-Account discovery, the Policy tab is
blank. The selection deliberately has no permission `actions`; its required
IAM role trust policy instead lives in `AWS_FEATURES.multiAccount.policies`.
`buildAnnotatedAwsPolicy()` currently treats the empty action list as evidence
that there is no policy to render and drops the configured trust document.

Tracked by https://github.com/stefanriegel/uddi-permission-helper/issues/1.

## Desired outcome

Render the configured AWS Multi-Account trust policy in the Policy tab and its
download payload. When Multi-Account is combined with discovery permissions,
make both distinct IAM documents visible without merging trust-policy fields
into an identity policy.

## Users

- Universal DDI evaluators configuring discovery across multiple AWS accounts.
- Cloud and security engineers reviewing the generated least-privilege setup.

## Constraints

- Keep the site dependency-free, static, and compatible with native ES modules.
- Preserve `AWS_FEATURES.multiAccount.policies` as the source of truth.
- Preserve the existing deployable least-privilege permissions-policy JSON for
  selections that do not include Multi-Account.
- Render valid JSON and keep the AWS principal, `sts:AssumeRole`, and External
  ID condition intact.
- Do not weaken trust conditions or introduce account-specific secrets.

## Non-goals

- Changing AWS permission actions, Terraform, CLI, or setup-guide semantics.
- Replacing the placeholder External ID with a real credential.
- Automating AWS deployment or validating against a live AWS account.
- Redesigning the output tabs or the other cloud-provider generators.

## Acceptance signals

- A focused test proves `buildAnnotatedAwsPolicy(['multiAccount'])` is non-empty,
  parses as JSON, and contains the configured trust-policy statement.
- A focused mixed-selection test proves both the discovery permissions policy
  and Multi-Account trust policy are represented as separate documents.
- Existing AWS policy snapshots and all repository tests remain green.
- Copy/download receives the same rendered policy content shown in the tab.

## Assumptions and risks

- Assumption: the `policies` document already encoded in `js/data/aws.js` is the
  approved source for Multi-Account trust semantics.
- Rendering two IAM document types requires an explicit JSON envelope or other
  unambiguous representation; concatenating documents would be invalid JSON.
- Consumers may expect the current single permissions-policy object, so the
  legacy shape must remain unchanged when Multi-Account is not selected.
- Risk is medium because misleading or incomplete IAM output can block setup or
  lead operators to construct trust configuration manually.
