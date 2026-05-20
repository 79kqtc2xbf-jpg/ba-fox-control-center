# BA Fox V2 — Apps Script / Web / Google Chat Plan

## Decision

BA Fox V2 moves to a Google-native architecture:

```text
Google Sheets → Apps Script → Web/PWA
                         ↘ Google Chat / Email / Calendar notifications
ChatGPT → planning, reporting, Gmail reconciliation, and operator intelligence
```

Telegram/Railway remains in the repository as a legacy/paused path. Do not delete the Telegram bot code yet, and do not pay Railway for V2 unless a separate decision is made.

## Target architecture

### Google Sheets — source of truth

Google Sheets remains the canonical task database for the V2 MVP.

Responsibilities:

- store task rows, statuses, comments, reminder metadata, report drafts, settings, and lightweight audit fields;
- stay readable/editable by Lisa and ChatGPT workflows;
- act as the stable bridge between manual operations and automation.

### Apps Script — backend, automation, reminders

Apps Script becomes the primary backend and automation layer.

Responsibilities:

- expose Web/PWA API functions;
- read and write Google Sheets;
- run time-based triggers for reminders;
- send notifications through Google Chat, Email, and Calendar;
- build daily report drafts from task rows;
- keep secrets inside Apps Script properties, not in GitHub.

### Web/PWA — main mobile dashboard

The Web/PWA becomes the primary daily interface.

Responsibilities:

- show task dashboards on mobile;
- support status updates, comments, and quick task creation;
- show work/personal separation clearly;
- later become installable as a PWA.

### Google Chat — notification and quick-command layer

Google Chat starts as a notification-only MVP.

Responsibilities:

- send reminders and daily prompts;
- provide links back to the Web/PWA or Google Sheet;
- later support slash commands and interactive cards.

### ChatGPT — planning, reporting, reconciliation

ChatGPT remains the intelligence layer.

Responsibilities:

- turn raw plans into structured tasks;
- draft daily and weekly reports;
- reconcile Gmail manually/hybrid through user-approved workflows;
- propose updates for Google Sheets and Apps Script behavior.

## Proposed Apps Script file structure

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

Suggested responsibilities:

- `Code.gs`: Apps Script entrypoints and trigger registration helpers.
- `Config.gs`: sheet names, status values, timezone, property keys, feature flags.
- `SheetsStore.gs`: low-level read/write helpers for Google Sheets ranges.
- `TaskService.gs`: task filtering, creation, status updates, and comments.
- `ReportService.gs`: daily report draft builder.
- `ReminderService.gs`: weekday/daily reminder selection and trigger handlers.
- `NotificationService.gs`: shared send interface for Chat, Email, Calendar.
- `ChatService.gs`: Google Chat webhook/app message formatting.
- `WebApi.gs`: public API functions called by the Web/PWA.
- `WebApp.gs`: `doGet` shell for serving the Web/PWA if hosted from Apps Script.
- `Validation.gs`: request validation and safe enum checks.
- `DateTime.gs`: Asia/Bangkok date helpers.
- `AuditLog.gs`: optional append-only event log helpers.

## Web/PWA ↔ Apps Script API contract

All responses should use this shape:

```json
{
  "ok": true,
  "data": {},
  "error": null
}
```

Errors should use:

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable safe error"
  }
}
```

### `getTodayTasks`

Purpose: return tasks for the current Asia/Bangkok day.

Request:

```json
{
  "date": "2026-05-21"
}
```

Response data:

```json
{
  "tasks": []
}
```

### `getOpenTasks`

Purpose: return all tasks not in a final status.

Request:

```json
{
  "scope": "all"
}
```

Response data:

```json
{
  "tasks": []
}
```

### `getPushTasks`

Purpose: return tasks that require follow-up or active control.

Request:

```json
{
  "dateRange": "today"
}
```

Response data:

```json
{
  "tasks": []
}
```

### `addTask`

Purpose: create a task row from Web/PWA or ChatGPT-approved input.

Request:

```json
{
  "title": "Send updated KYB package",
  "taskType": "work",
  "category": "Documentation",
  "organization": "Bitazza",
  "priority": "High",
  "deadline": "2026-05-21",
  "source": "Web",
  "channel": "Web",
  "steps": "",
  "comment": ""
}
```

Response data:

```json
{
  "taskId": "BA-20260521-001"
}
```

### `updateTaskStatus`

Purpose: update the status of one task.

Request:

```json
{
  "taskId": "BA-20260521-001",
  "status": "Done",
  "actor": "Lisa"
}
```

Response data:

```json
{
  "task": {}
}
```

### `updateTaskComment`

Purpose: update or append a task comment.

Request:

```json
{
  "taskId": "BA-20260521-001",
  "comment": "Sent follow-up, waiting for reply.",
  "mode": "append",
  "actor": "Lisa"
}
```

Response data:

```json
{
  "task": {}
}
```

### `buildDailyReportDraft`

Purpose: build a daily report draft from task statuses.

Request:

```json
{
  "date": "2026-05-21",
  "format": "ba_daily"
}
```

Response data:

```json
{
  "draft": "#итоги #ba\n..."
}
```

## Google Sheets schema updates for V2

Keep the current `Tasks` sheet as the base. Add V2 fields after the existing A:N columns to avoid breaking legacy Telegram reads.

Recommended new columns:

| Column | Name | Purpose |
|---|---|---|
| O | Task type | `work` / `personal` |
| P | Owner | Lisa or future assignee |
| Q | Created at | ISO timestamp |
| R | Updated at | ISO timestamp |
| S | Completed at | ISO timestamp |
| T | Reminder recurrence | `weekday` / `daily` / `none` |
| U | Notification channels | `google_chat,email,calendar` |
| V | Notification status | Last send status or error |
| W | App source | `web`, `chatgpt`, `apps_script`, `telegram_legacy` |
| X | External ref | Optional Gmail/Drive/Calendar/Chat reference |
| Y | Archived | TRUE/FALSE |

Recommended additional sheets:

- `Settings`: status values, timezone, channel config, feature flags.
- `AuditLog`: append-only events for task create/update/notification.
- `Reports`: daily and weekly report drafts.
- `NotificationQueue`: optional queue for retries and failure tracking.
- `Contacts`: lightweight organization/contact metadata.

## Reminder and notification flow

Timezone:

```text
Asia/Bangkok
```

Rules:

- work reminders run on weekdays only;
- personal reminders run daily;
- reminder selection reads from Google Sheets;
- notification state is written back to Google Sheets;
- failed notifications are visible in `NotificationQueue` or `AuditLog`.

Initial notification channels:

- Google Chat: primary notification path for prompts and reminders;
- Email: fallback for important daily prompts or failures;
- Calendar: optional visible reminder blocks for time-sensitive items.

MVP flow:

1. Apps Script time-based trigger runs in Asia/Bangkok.
2. `ReminderService` selects due work or personal tasks.
3. `NotificationService` sends Google Chat and optional Email/Calendar notifications.
4. Apps Script writes notification result back to Sheets.
5. Lisa opens Web/PWA to update status or comment.

## Web/PWA screens

### Today

Daily focus view: urgent tasks, open work, personal reminders, push list, and report entrypoint.

### Work

Work tasks grouped by status, priority, organization, and category.

### Personal

Personal tasks and daily personal reminders, separate from work.

### Pushes

Follow-up tasks, waiting tasks, and control points.

### Week

Weekly overview by due date, priority, and blocked/waiting items.

### Reports

Daily report draft, weekly report draft, copy/export actions, and future finalization.

### Settings

Timezone, notification channels, status labels, Apps Script connection status, and troubleshooting notes.

## Google Chat layer

### MVP: notification-only

Google Chat should first send simple messages:

- morning work focus;
- personal daily reminder;
- push/follow-up prompts;
- evening report prompt;
- failure alerts for Apps Script automation.

Messages should include:

- short summary;
- top 3–5 task items;
- link to Web/PWA or Google Sheet;
- no secrets or private credentials.

### Later: slash commands and cards

Future Google Chat capabilities:

- `/today`;
- `/pushes`;
- `/add`;
- `/done TASK_ID`;
- interactive task cards;
- quick comment capture.

Do not implement slash commands until notification-only MVP is stable.

## Migration notes

- Telegram/Railway remains a legacy/paused path.
- Do not delete Telegram bot code.
- Do not pay Railway for V2 unless explicitly re-approved.
- Do not expose `.env`, Telegram tokens, service account JSON, Apps Script deployment keys, or Google Chat webhooks.
- Do not connect live Gmail automation yet.
- Keep Gmail reconciliation as ChatGPT-assisted/manual until a separate Gmail automation plan is approved.
- Keep the current static `web/` MVP intact until the Web/PWA implementation plan replaces it.
- Prefer additive Google Sheets schema changes so legacy Telegram reads do not break.

## Implementation phases

### Phase V2.1 — Documentation and schema design

- approve this architecture;
- create V2 schema update plan;
- define Apps Script module boundaries;
- document API contract.

### Phase V2.2 — Apps Script backend MVP

- create Apps Script project;
- connect to Google Sheet;
- implement task read/update functions;
- implement report draft builder;
- add basic audit logging.

### Phase V2.3 — Web/PWA MVP

- connect Web/PWA to Apps Script API;
- implement Today, Work, Personal, Pushes, Reports;
- keep UI mobile-first and simple.

### Phase V2.4 — Google Chat notifications

- configure Google Chat webhook/app;
- send notification-only reminders;
- record send status in Sheets.

### Phase V2.5 — Later automations

- slash commands/cards;
- Calendar integration;
- Gmail automation only after separate approval.