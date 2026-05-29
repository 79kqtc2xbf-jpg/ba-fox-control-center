# BA Fox V2.6H - Read-only audit UI polish

## Purpose

Stage V2.6H improves the local Web/PWA cleanup audit view without adding cleanup, write, export, or approval functions.

The audit section remains read-only. It helps Lisa review audit suggestions more comfortably before any separate backup-first cleanup stage is considered.

## UI changes

The `Аудит данных` section now shows:

```text
- compact summary cards;
- severity counts: high, medium, low;
- issue groups by issueType;
- visual filters: All, Duplicates, Statuses, Priorities, Dates, Missing V2 fields, Archive candidates;
- sorted audit cards with row number, task ID, issue type, severity, current value, proposed value, confidence, suggested action, approval flag, and notes;
- review format preview only.
```

The section includes this reminder:

```text
Это только аудит. BA Fox ничего не меняет в таблице.
```

## Severity labels

Severity is computed in the browser for display only:

```text
high: duplicate IDs, near-duplicates, possible corrupted/date fields
medium: status/priority normalization, missing V2 fields, active legacy rows, archive candidates, Lisa approval flags
low: low-risk informational items
```

These labels do not change the spreadsheet and do not approve cleanup.

## Review format preview

The preview is a visual read-only format for future manual review. It does not:

```text
- export files;
- copy to a sheet;
- create CleanupReview;
- write to Tasks;
- write to AuditLog, Reports, or NotificationQueue.
```

## Safety boundaries

This stage does not:

```text
- add POST/write calls;
- enable doPost writes;
- write to Tasks;
- create or populate CleanupReview;
- write to AuditLog, Reports, or NotificationQueue;
- add cleanup, archive, normalize, approve, or export buttons;
- enable Google Chat, Gmail, Calendar, notifications, or triggers;
- modify bot/;
- modify Telegram or Railway behavior;
- commit endpoint URLs, web/config.local.js, secrets, Sheet IDs, or webhooks.
```

## Manual smoke test

1. Open the local dashboard.
2. Open `Аудит данных`.
3. Confirm filters switch the visible cards.
4. Confirm issue groups update for the selected filter.
5. Confirm severity labels appear.
6. Confirm the review format preview is display-only.
7. Confirm there are no action/write buttons.
8. Confirm the browser makes no POST requests.
9. Confirm `AuditLog`, `Reports`, and `NotificationQueue` remain headers-only.

## Next safe stage

Stage V2.6I may add more read-only audit sorting or text refinements. Any cleanup write stage still requires separate approval and backup-first safeguards.
