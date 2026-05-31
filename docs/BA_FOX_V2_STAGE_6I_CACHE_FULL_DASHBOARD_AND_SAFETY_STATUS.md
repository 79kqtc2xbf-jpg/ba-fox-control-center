# BA Fox V2.6I - Cache, full dashboard, and safety status

## Purpose

Stage V2.6I reduces Google Sheets API read pressure for the read-only Web/PWA and cleanup audit flows.

The stage keeps BA Fox read-only. It does not add write calls, task cleanup, approvals, exports, triggers, notifications, or any Telegram/Railway changes.

## Apps Script changes

`doGet(e)` now uses Apps Script `CacheService` for successful read-only route responses.

```text
TTL: 45 seconds
```

Cache failures are ignored so large read-only payloads can still be served uncached.

The existing `dashboard` route now reads `Tasks` once and derives:

```text
scaffoldInfo
today
open
pushes
```

The new preferred route is:

```text
?route=fullDashboard
```

It reads `Tasks` once and returns:

```text
scaffoldInfo
today
open
pushes
cleanupAudit
```

The cleanup audit is built from the same in-memory `Tasks` rows used by the dashboard sections, so one request does not perform several independent `Tasks` reads.

## Safety status route

The new read-only safety route is:

```text
?route=safetyStatus
```

It returns status and data-row counts for:

```text
AuditLog
Reports
NotificationQueue
```

This route only reads sheet metadata/counts. It does not write to those tabs and does not create `CleanupReview`.

## JSON and JSONP

Normal JSON remains supported.

Restricted JSONP remains supported with generated callbacks such as:

```text
?route=fullDashboard&callback=BAFoxJsonpCallback_1
?route=safetyStatus&callback=BAFoxJsonpCallback_1
```

Invalid callback names still return a safe JSON error.

## Frontend changes

The Web/PWA now prefers:

```js
BAFoxClient.getFullDashboard()
```

It derives dashboard, scaffold, and audit UI state from that single response.

If Google Sheets temporarily rate-limits reads, the client retries once with a short backoff. If the retry still fails, the UI falls back to safe mock data and shows:

```text
Google Sheets временно ограничил чтение. BA Fox повторит попытку позже.
```

## Safety boundaries

This stage does not:

```text
- add POST/write calls;
- enable doPost writes;
- write to Tasks;
- write to CleanupReview;
- write to AuditLog, Reports, or NotificationQueue;
- add cleanup, archive, normalize, approve, export, or task-change buttons;
- enable Google Chat, Gmail, Calendar, notifications, or triggers;
- modify bot/;
- modify Telegram or Railway behavior;
- commit endpoint URLs, web/config.local.js, secrets, Sheet IDs, or webhooks.
```

## Manual smoke test

1. Test `<WEB_APP_URL>?route=fullDashboard`.
2. Test `<WEB_APP_URL>?route=safetyStatus`.
3. Test JSONP for both routes.
4. Open the local dashboard.
5. Confirm the dashboard renders.
6. Open `Аудит данных`.
7. Confirm the audit view renders.
8. Confirm there are no POST requests.
9. Confirm there are no action/write buttons.
10. Confirm `AuditLog`, `Reports`, and `NotificationQueue` remain headers-only.
11. Confirm no endpoint URL, `config.local.js`, secrets, Sheet ID, or webhook are committed.
