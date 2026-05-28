# BA Fox V2 Apps Script Scaffold

This folder contains the Stage V2 Apps Script backend scaffold. Stage V2.4 allows read-only access to the bound Google Sheet `Tasks` tab while keeping writes disabled.

It is intentionally safe by default:

- no real Google Sheet ID;
- no secrets;
- no Google Chat webhook URLs;
- no trigger installation;
- no live notification sends;
- no live Gmail automation;
- no changes to the legacy Telegram/Railway path.

## Stage V2.4 Read-only Mode

The runtime switches are intentionally separate:

```text
READ_LIVE_SHEETS: true
DRY_RUN: true
```

- `getTodayTasks`, `getOpenTasks`, and `getPushTasks` may read real rows from the bound `Tasks` tab.
- `addTask`, `updateTaskStatus`, `updateTaskComment`, and `buildDailyReportDraft` remain dry-run only.
- Reads support `Сегодня`, actual date cells, and legacy Russian statuses such as `Выполнено`, `Перенести`, `Ждём ответ`, `Пуш`, `В работе`, and `Не начато`.

## Files

```text
Code.gs
Config.gs
SheetsStore.gs
TaskService.gs
ReportService.gs
ReminderService.gs
NotificationService.gs
ChatService.gs
CleanupAudit.gs
WebApi.gs
WebApp.gs
Validation.gs
DateTime.gs
AuditLog.gs
```

## Public MVP functions

The Web/PWA contract starts with these safe scaffold functions:

- `getTodayTasks(request)`
- `getOpenTasks(request)`
- `getPushTasks(request)`
- `addTask(request)`
- `updateTaskStatus(request)`
- `updateTaskComment(request)`
- `buildDailyReportDraft(request)`

All write-like functions return dry-run responses. They validate inputs and prepare the intended data shape, but do not write to Google Sheets.

## Manual setup note

Copy these files into a Google Apps Script project only after the Google Sheet V2 schema from `docs/BA_FOX_V2_STAGE_1_SCHEMA_AND_APPS_SCRIPT_SCAFFOLD.md` is reviewed.

Keep secrets in Apps Script Properties, never in this repository and never in visible sheet cells.

## Manual V2.4 Smoke Test

After copying updated files into the bound Apps Script project:

1. Run `baFoxScaffoldInfo()` and confirm:

```text
dryRun: true
readLiveSheets: true
liveAutomationEnabled: false
triggersEnabled: false
```

2. Run `getTodayTasks({})`, `getOpenTasks({ taskType: 'all' })`, and `getPushTasks({ dateRange: 'today' })`.
3. Confirm each response has `ok: true`, `readLive: true`, and returns only expected rows from `Tasks`.
4. Run `baFoxManualSmokeTest()` and confirm it completes with `dryRun: true`.
5. Confirm no new rows appeared in `Tasks`, `AuditLog`, `Reports`, or `NotificationQueue`.

Do not enable triggers, notifications, Gmail automation, or webhook configuration during this test.

## Stage V2.5 Read-only Web Endpoint

`doGet(e)` exposes JSON-only read routes for a future Web/PWA dashboard:

```text
?route=scaffoldInfo
?route=today
?route=open
?route=pushes
?route=dashboard
```

Optional read-only filters:

```text
?route=today&date=2026-05-23
?route=open&taskType=work
?route=pushes&dateRange=today
```

The `dashboard` route combines scaffold information, today tasks, open tasks, and push tasks. Unknown routes return a safe JSON error. `doPost` remains disabled and returns `NOT_IMPLEMENTED`.

### Manual V2.5 Smoke Test

After copying the updated `WebApp.gs` into the bound Apps Script project:

1. Save the Apps Script project.
2. Run `baFoxScaffoldInfo()` and `baFoxManualSmokeTest()` in the editor first.
3. Confirm `dryRun: true`, `readLiveSheets: true`, `liveAutomationEnabled: false`, and `triggersEnabled: false`.
4. Deploy as a Web app only after Lisa explicitly confirms that manual action.
5. Keep the generated endpoint URL outside this repository.
6. Test these read-only browser routes:

```text
<WEB_APP_URL>?route=scaffoldInfo
<WEB_APP_URL>?route=today
<WEB_APP_URL>?route=open
<WEB_APP_URL>?route=pushes
<WEB_APP_URL>?route=dashboard
```

7. Confirm valid routes return JSON with `ok: true`.
8. Confirm read route data shows `readLive: true` where tasks are returned.
9. Confirm `Tasks`, `AuditLog`, `Reports`, and `NotificationQueue` have no unexpected added or updated rows.

The first Web/PWA integration must be read-only. Do not store endpoint credentials or secrets in frontend code, and do not enable triggers, notifications, webhooks, or Gmail automation.

## Stage V2.6D Local Read-only JSONP

Local Web/PWA pages can be blocked by browser CORS rules when reading the Apps Script Web App JSON endpoint. `doGet(e)` now supports an optional JSONP callback for the same read-only routes:

```text
<WEB_APP_URL>?route=dashboard&callback=BAFoxJsonpCallback_1
```

- Without `callback`, existing responses remain normal JSON.
- With a valid `callback`, the response is JavaScript containing that callback and the existing payload.
- Callback names accept only the generated `BAFoxJsonpCallback_...` prefix; invalid callbacks return a safe JSON error.
- `doPost` remains disabled, and no trigger, notification, or write behavior is enabled.

### Manual V2.6D Smoke Test

1. Copy the updated `WebApp.gs` into the bound Apps Script project and save it.
2. Run `baFoxScaffoldInfo()` and `baFoxManualSmokeTest()` before redeploying.
3. Confirm `dryRun: true`, `readLiveSheets: true`, `liveAutomationEnabled: false`, and `triggersEnabled: false`.
4. Deploy a new Web App version only as the manual deployment step.
5. Keep the Web App URL only in local `web/config.local.js`.
6. Open the local dashboard and confirm it switches to `Read-only data`.
7. Confirm the browser loads JSONP scripts for read routes and makes no POST requests.
8. Confirm `AuditLog`, `Reports`, and `NotificationQueue` still contain headers only.

## Stage V2.6F Audit-only Cleanup Report

`baFoxBuildCleanupAuditDryRun()` reads `Tasks` rows and returns cleanup review suggestions without writing anything.

It detects duplicate task IDs, near-duplicates, non-canonical statuses and priorities, missing V2 fields in active rows, vague dates, active legacy rows, possible corrupted fields, and archive candidates.

### Manual V2.6F Smoke Test

1. Copy `CleanupAudit.gs` into the bound Apps Script project and save it.
2. Run `baFoxBuildCleanupAuditDryRun()`.
3. Confirm the response has `ok: true`, `data.summary.rowsChecked`, and `data.items`.
4. Confirm `Tasks` was not edited.
5. Confirm `CleanupReview` was not created or populated.
6. Confirm `AuditLog`, `Reports`, and `NotificationQueue` were not edited.
7. Confirm no `doPost` write path, Web/PWA write behavior, trigger, Google Chat, Gmail, Telegram, Railway, endpoint URL, secret, Sheet ID, or webhook was added.
