# BA Fox V2.6F - Audit-only cleanup report

## Purpose

Stage V2.6F adds a dry-run cleanup audit for the live `Tasks` data before any cleanup or write functions are approved.

The audit identifies risky legacy data patterns and returns review suggestions only. It must not modify the spreadsheet, create review tabs, send notifications, install triggers, or enable write behavior.

## Added function

```text
baFoxBuildCleanupAuditDryRun()
```

The function reads rows from the existing `Tasks` read path and returns a structured report:

```json
{
  "ok": true,
  "data": {
    "summary": {
      "rowsChecked": 0,
      "duplicateGroups": 0,
      "nearDuplicateGroups": 0,
      "nonCanonicalStatuses": 0,
      "nonCanonicalPriorities": 0,
      "missingV2Fields": 0,
      "vagueDates": 0,
      "activeLegacyRows": 0,
      "archiveCandidates": 0
    },
    "items": []
  },
  "error": null
}
```

Each item uses this shape:

```json
{
  "rowNumber": 2,
  "taskId": "BA-EXAMPLE",
  "issueType": "STATUS_NORMALIZATION",
  "currentValue": "In progress",
  "proposedValue": "В работе",
  "confidence": 0.85,
  "suggestedAction": "NORMALIZE",
  "needsLisaApproval": true,
  "notes": "Legacy status can be normalized after approval."
}
```

## Audit coverage

The dry run detects:

```text
- duplicate task IDs;
- near-duplicates by organization and normalized title;
- non-canonical statuses;
- non-canonical priorities;
- missing Task Type and Owner in active rows;
- vague or human-readable dates/deadlines/reminders;
- active legacy rows;
- possible corrupted fields;
- archive candidates as suggestions only.
```

## Issue types

```text
DUPLICATE_ID
NEAR_DUPLICATE
STATUS_NORMALIZATION
PRIORITY_NORMALIZATION
TASK_TYPE_MISSING
OWNER_MISSING
ACTIVE_LEGACY_ROW
ARCHIVE_CANDIDATE
CORRUPTED_FIELD
```

Vague dates are reported as `CORRUPTED_FIELD` items with `REVIEW_REQUIRED` action and date-review notes, because this stage keeps to the approved issue type list.

## Suggested actions

```text
KEEP
NORMALIZE
ARCHIVE_AFTER_APPROVAL
MERGE_CONTEXT_ONLY
REVIEW_REQUIRED
NO_ACTION
```

## Safety boundaries

This stage does not:

```text
- write to Tasks;
- create or populate CleanupReview;
- write to AuditLog, Reports, or NotificationQueue;
- enable doPost writes;
- add Web/PWA write behavior;
- enable Google Chat, Gmail, Calendar, notifications, or triggers;
- modify bot/;
- modify Telegram or Railway behavior;
- commit endpoint URLs, web/config.local.js, secrets, Sheet IDs, or webhooks.
```

Archive candidates are suggestions only. They are not deletions, status changes, or archive writes.

## Manual test

After copying `apps-script/CleanupAudit.gs` into the bound Apps Script project:

1. Run `baFoxBuildCleanupAuditDryRun()`.
2. Confirm the response has `ok: true`.
3. Confirm `data.summary.rowsChecked` matches the number of data rows in `Tasks`.
4. Review `data.items` for suggested cleanup review rows.
5. Confirm no rows were added or changed in `Tasks`, `CleanupReview`, `AuditLog`, `Reports`, or `NotificationQueue`.

Do not create `CleanupReview` or run any cleanup writes during this stage.

## Next safe stage

Stage V2.6G can review audit output and decide whether a manually approved `CleanupReview` tab should be created. Any write stage still requires a backup-first plan and separate approval.
