# CRM architecture and lifecycle

## Admission policy

HubSpot receives relationships that are active, replied, qualified, proposal-requested or won. Unanswered outreach, rejected work, malformed intake and review-only acquisition records stay in the upstream operating system.

This boundary prevents the CRM from becoming a second copy of every prospecting list.

## Stable keys

Each object carries a source-controlled external key:

| Object | Key |
| --- | --- |
| Company | `company_external_id` |
| Contact | `contact_external_id` |
| Deal | `sm_systems_deal_id` |

Creation follows a search-before-write sequence. A rerun with the same keys must return `matched_existing` for all three objects.

## Association checks

The record set is complete only when all three edges are readable through HubSpot:

1. company to contact;
2. company to deal;
3. contact to deal.

The association result is stored separately from the create-or-match result so a partially linked record cannot appear complete.

## Cleanup

Commissioning objects are tagged with a run identifier. Cleanup accepts the exact object IDs from the signed run manifest, archives only those objects, then repeats the stable-key searches to confirm they are absent from the active CRM.

The pipeline definition and custom deal-key property are retained.

## Release boundary

This repository excludes portal IDs, owner IDs, service keys, provider receipts and real contact details. The controlled examples use non-routable domains.
