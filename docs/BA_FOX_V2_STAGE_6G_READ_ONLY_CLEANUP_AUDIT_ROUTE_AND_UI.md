# BA Fox V2.6G - Read-only cleanup audit route and UI

## Purpose

Stage V2.6G exposes the V2.6F cleanup audit as a read-only Apps Script route and adds a local Web/PWA audit section for viewing suggestions.

This stage is display-only. It does not approve, normalize, archive, merge, or write cleanup decisions.

## Apps Script route

New read route:

```text
?route=cleanupAudit
```

The route calls:

```text
baFoxBuildCleanupAuditDryRun()
```

It keeps the existing `doGet(e)` response behavior:

```text
- normal JSON without callback;
- JSONP when a valid BAFoxJsonpCallback_* callback is supplied;
- invalid callbacks return a safe JSON error;
- doPost remains disabled.
```

## Web/PWA audit section

The local dashboard adds:

```text
Аудит данных
```

The section shows:

```text
- summary counts;
- issue group counts;
- audit item cards with row number, task ID, issue type, current value, proposed value, suggested action, approval flag, and notes.
```

The UI intentionally does not include:

```text
- cleanup buttons;
- archive buttons;
- normalize buttons;
- approve buttons;
- POST requests;
- task mutation controls.
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

## Manual smoke test

After copying the Apps Script change and opening the local dashboard:

1. Run `baFoxBuildCleanupAuditDryRun()`.
2. Test `<WEB_APP_URL>?route=cleanupAudit`.
3. Test JSONP with `<WEB_APP_URL>?route=cleanupAudit&callback=BAFoxJsonpCallback_1`.
4. Open the local dashboard.
5. Confirm `Аудит данных` renders summary counts, issue groups, and audit suggestions.
6. Confirm the browser makes no POST requests.
7. Confirm `Tasks` was not edited.
8. Confirm `CleanupReview` was not created or populated.
9. Confirm `AuditLog`, `Reports`, and `NotificationQueue` remain headers-only.

## Next safe stage

Stage V2.6H may refine audit grouping, labels, or filtering. Any cleanup write stage still requires separate approval and backup-first safeguards.
