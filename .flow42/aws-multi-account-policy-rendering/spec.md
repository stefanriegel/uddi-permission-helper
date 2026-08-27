# Specification: Render AWS Multi-Account trust policy

## Functional requirements

1. `buildAnnotatedAwsPolicy(selectedIds)` MUST derive trust-policy documents
   only from `AWS_FEATURES[id].policies`; it MUST NOT copy, reconstruct, weaken,
   or broaden the configured principal, action, or condition.
2. With no selected feature that supplies AWS actions or policies, the builder
   MUST retain the existing empty-string result.
3. With action-bearing features and no Multi-Account selection, the builder
   MUST retain the existing deployable permissions-policy JSON object byte for
   byte as produced by `generateAwsPolicy(selectedIds)`.
4. With only `multiAccount` selected, the builder MUST return the configured
   trust policy's `document` as one pretty-printed, valid JSON object. This
   preserves the Policy tab and `.json` download as directly usable IAM trust
   policy input.
5. With both action-bearing features and `multiAccount` selected, the builder
   MUST return one valid JSON envelope with this shape and order:

   ```json
   {
     "documents": [
       {
         "name": "Permissions Policy",
         "type": "permissions",
         "document": { "Version": "2012-10-17", "Statement": [] }
       },
       {
         "name": "Trust Policy",
         "type": "trust",
         "document": { "Version": "2012-10-17", "Statement": [] }
       }
     ]
   }
   ```

   The permissions document MUST be the parsed output of
   `generateAwsPolicy(selectedIds)`. Each trust entry MUST preserve the
   configured `name`, `type`, and `document`. Documents MUST NOT be merged,
   concatenated, or represented as multiple top-level JSON values.
6. The text rendered in the Policy tab MUST be the same text returned by
   `getActiveTabContent()` to copy and download. Existing UI HTML escaping MUST
   remain in effect.

## Non-functional requirements

- Keep the implementation dependency-free and compatible with the repository's
  native ES-module/static-hosting constraints.
- Serialize deterministically with two-space JSON indentation so tests and
  security review can compare stable content.
- Do not change permissions counting, CLI, Terraform, setup-guide, Azure, or
  GCP behavior.
- Do not add network calls, credentials, account discovery, deployment, or
  runtime configuration.
- Preserve the legacy permissions-only output shape to avoid breaking current
  consumers.

## Domain model and terminology

- **Permissions policy**: an identity policy containing AWS API actions and
  resources. It grants capabilities to the discovery role.
- **Trust policy**: an IAM role assume-role policy defining the external
  principal and the conditions under which it may call `sts:AssumeRole`.
- **Policy document envelope**: a display/download representation used only
  when both document types are selected. The envelope itself is not an IAM
  policy and MUST be presented as a collection of separately deployable IAM
  documents.
- **External ID placeholder**: `<YOUR_EXTERNAL_ID>` in the configured source.
  It is not a credential and MUST not be replaced or collected by this change.

## Interfaces and data

- Input remains `buildAnnotatedAwsPolicy(selectedIds: string[]): string`.
- The source of identity permissions remains `generateAwsPolicy(selectedIds)`.
- The source of trust semantics remains `AWS_FEATURES.multiAccount.policies`.
- Output variants are:
  - no applicable document: `''`;
  - permissions only: the legacy permissions-policy object;
  - trust only: the configured trust-policy object;
  - mixed: `{ "documents": PolicyDocumentEntry[] }` in permissions-then-trust
    order.
- Unknown feature IDs MUST contribute neither actions nor policy documents.
- Copy and download continue to consume visible panel text; the Policy download
  filename remains `aws-policy.json`.

## Security considerations

### Assets and trust boundaries

- Assets: least-privilege permission statements, the trusted Infoblox AWS
  principal, `sts:AssumeRole`, and the External ID condition.
- The hardcoded feature catalog is the trusted policy source. User selections
  are untrusted identifiers and may only select known catalog entries.
- The rendered browser DOM, clipboard, and downloaded file are output
  boundaries. Rendering MUST continue through `escapeHtml`; copy/download MUST
  use text content rather than HTML.

### Threats and controls

- **Confused deputy / unauthorized role assumption:** removing or altering the
  External ID condition could broaden trust. Control: emit a structural clone
  of the catalog document and assert the exact principal, action, condition
  operator, condition key, and placeholder value.
- **Policy-type confusion:** merging trust statements into an identity policy,
  or presenting a mixed envelope as one deployable IAM policy, could cause an
  unsafe manual workaround. Control: typed entries and explicit document
  separation; never merge `Statement` arrays.
- **Catalog mutation:** returning or modifying catalog object references could
  alter later output. Control: serialize fresh objects and test repeat calls do
  not mutate `AWS_FEATURES.multiAccount.policies`.
- **Injection/XSS:** future catalog strings or selections could contain markup.
  Control: accept only known feature records and retain HTML escaping at the
  render boundary.
- **Credential leakage:** a real External ID must not enter source, tests,
  telemetry, or output fixtures. Control: preserve the placeholder and add no
  logging or persistence.
- **Privilege broadening regression:** mixed rendering could accidentally
  change permissions statements. Control: compare the embedded permissions
  document to `generateAwsPolicy()` and keep existing snapshots green.

Residual risk: the mixed envelope is a transport/display container rather than
an AWS-deployable document. The typed structure and tests reduce ambiguity, but
the implementation review must ensure UI wording does not imply that the whole
envelope can be submitted to IAM.

## Acceptance criteria

1. Multi-Account-only output is non-empty valid JSON and exactly preserves the
   configured trust policy, including principal
   `arn:aws:iam::902917483333:root`, action `sts:AssumeRole`, and
   `ForAnyValue:StringEquals` External ID condition.
2. A mixed selection produces valid JSON with exactly two typed entries in
   permissions-then-trust order; the permissions entry equals parsed
   `generateAwsPolicy()` output and the trust entry equals the catalog source.
3. A permissions-only selection remains equal to the current generator output;
   an empty selection remains empty.
4. Repeated generation does not mutate the catalog or change output.
5. Policy-tab text, copied text, and downloaded text are identical for
   Multi-Account-only and mixed selections, with a `.json` filename.
6. Existing AWS snapshots and the complete repository test suite pass without
   changes to Azure/GCP behavior.

## Verification strategy

- Keep the observed failing regression as the red proof for Multi-Account-only
  rendering.
- Add focused Node tests for all four output variants, the exact trust-policy
  security fields, mixed-document typing/order/equality, unknown IDs,
  deterministic output, and non-mutation.
- Add or extend DOM-level output tests to prove the escaped rendered text is the
  same content consumed by copy/download and the filename remains JSON.
- Run the authenticated direct argv test command exactly as configured:
  `node --test tests/aws-generators.test.js`.
- Run the broader repository suite, if available, as supplementary regression
  evidence. No live AWS validation is required or authorized.
