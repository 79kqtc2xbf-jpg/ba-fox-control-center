# BA Fox V2 Apps Script Scaffold

This folder contains the Stage V2.2 repository scaffold for the BA Fox Apps Script backend.

It is intentionally safe by default:

- no real Google Sheet ID;
- no secrets;
- no Google Chat webhook URLs;
- no trigger installation;
- no live notification sends;
- no live Gmail automation;
- no changes to the legacy Telegram/Railway path.

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

All write-like functions return dry-run responses in Stage V2.2. They validate inputs and prepare the intended data shape, but do not write to Google Sheets.

## Manual setup note

Copy these files into a Google Apps Script project only after the Google Sheet V2 schema from `docs/BA_FOX_V2_STAGE_1_SCHEMA_AND_APPS_SCRIPT_SCAFFOLD.md` is reviewed.

Keep secrets in Apps Script Properties, never in this repository and never in visible sheet cells.
