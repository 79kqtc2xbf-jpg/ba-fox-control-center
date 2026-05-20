# BA Fox V2.1 — Schema and Apps Script Scaffold Plan

## Purpose

Stage V2.1 prepares the Google-native BA Fox architecture for implementation without changing live behavior.

This is a documentation-only implementation plan for:

- Google Sheets V2 schema migration;
- new supporting tabs;
- Apps Script file/module scaffold;
- first Apps Script MVP functions;
- manual setup steps for Lisa.

Source architecture:

```text
docs/BA_FOX_V2_APPS_SCRIPT_WEB_CHAT_PLAN.md
```

No live code should be implemented in this stage. Do not modify `bot/` or `web/` for V2.1.

## Current base

The existing `Tasks` sheet uses columns A:N:

| Column | Existing field |
|---|---|
| A | ID |
| B | Дата |
| C | Категория |
| D | Организация / контакт |
| E | Задача |
| F | Шаги для Лизы |
| G | Источник |
| H | Приоритет |
| I | Дедлайн |
| J | Режим напоминаний |
| K | Статус |
| L | Следующее напоминание |
| M | Итог / комментарий |
| N | Канал |

V2 must preserve A:N so the legacy Telegram code can keep reading the existing range while it remains paused/available.

## Exact `Tasks` column additions after A:N

Add these columns starting at O. Do not insert columns before A:N.

| Column | Field | Type | Required | Example | Purpose |
|---|---|---|---|---|---|
| O | Task type | enum | Yes | `work` | Work/personal separation. Allowed: `work`, `personal`. |
| P | Owner | text | No | `Lisa` | Owner or future assignee. |
| Q | Created at | ISO datetime | Yes for new V2 rows | `2026-05-21T09:30:00+07:00` | Creation timestamp in Asia/Bangkok context. |
| R | Updated at | ISO datetime | Yes for V2 updates | `2026-05-21T10:15:00+07:00` | Last update timestamp. |
| S | Completed at | ISO datetime | No | `2026-05-21T18:20:00+07:00` | Completion timestamp for final statuses. |
| T | Reminder recurrence | enum | No | `weekday` | Reminder cadence. Allowed: `weekday`, `daily`, `none`. |
| U | Notification channels | CSV enum | No | `google_chat,email` | Initial channels. Allowed values: `google_chat`, `email`, `calendar`. |
| V | Notification status | text | No | `sent:2026-05-21T10:00:00+07:00` | Last notification result or safe error summary. |
| W | App source | enum | Yes for V2 rows | `web` | Source of last app write. Allowed: `web`, `chatgpt`, `apps_script`, `telegram_legacy`, `manual_sheet`. |
| X | External ref | text | No | `gmail:thread-id` | Optional Gmail/Drive/Calendar/Chat reference. No secrets. |
| Y | Archived | boolean | No | `FALSE` | Soft archive flag. |

Recommended defaults for old rows:

| Field | Default |
|---|---|
| Task type | `work` unless clearly personal |
| Owner | `Lisa` |
| Created at | blank until row is touched by V2 |
| Updated at | blank until row is touched by V2 |
| Completed at | blank |
| Reminder recurrence | `none` until reminder logic is configured |
| Notification channels | blank |
| Notification status | blank |
| App source | `telegram_legacy` or `manual_sheet` if known |
| External ref | blank |
| Archived | `FALSE` |

## New tabs

Create these tabs in the same Google Sheet. Use exact tab names.

### `Settings`

Purpose: central configuration and controlled values for Apps Script and Web/PWA.

Recommended columns:

| Column | Field | Example |
|---|---|---|
| A | Key | `timezone` |
| B | Value | `Asia/Bangkok` |
| C | Type | `string` |
| D | Description | `Operational timezone` |
| E | Updated at | `2026-05-21T09:00:00+07:00` |

Initial rows:

| Key | Value | Type | Description |
|---|---|---|---|
| timezone | `Asia/Bangkok` | string | Operational timezone. |
| work_reminder_days | `MON,TUE,WED,THU,FRI` | csv | Work reminders weekdays only. |
| personal_reminder_days | `DAILY` | string | Personal reminders daily. |
| default_work_reminder_time | `10:00` | time | Morning work reminder. |
| default_personal_reminder_time | `14:00` | time | Daily personal reminder. |
| notifications_google_chat_enabled | `FALSE` | boolean | Enable only after Chat setup. |
| notifications_email_enabled | `FALSE` | boolean | Enable after confirmation. |
| notifications_calendar_enabled | `FALSE` | boolean | Enable after confirmation. |
| live_gmail_automation_enabled | `FALSE` | boolean | Must remain false until separately approved. |

### `AuditLog`

Purpose: append-only operational history for task and notification events.

Recommended columns:

| Column | Field |
|---|---|
| A | Event ID |
| B | Timestamp |
| C | Actor |
| D | Action |
| E | Entity type |
| F | Entity ID |
| G | Before |
| H | After |
| I | Source |
| J | Notes |

Rules:

- Append only; do not edit historical rows manually unless correcting a private-data mistake.
- Store safe summaries, not secrets or full email bodies.
- Use for task create/update/status/comment/report/notification events.

### `Reports`

Purpose: store generated daily and weekly report drafts.

Recommended columns:

| Column | Field |
|---|---|
| A | Report ID |
| B | Report date |
| C | Report type |
| D | Status |
| E | Draft text |
| F | Source task IDs |
| G | Created at |
| H | Updated at |
| I | Finalized at |
| J | Notes |

Allowed report types:

```text
daily_ba
weekly_ba
manual
```

Allowed statuses:

```text
draft
reviewed
finalized
archived
```

### `NotificationQueue`

Purpose: optional queue for reminder sends, retries, and failure visibility.

Recommended columns:

| Column | Field |
|---|---|
| A | Queue ID |
| B | Task ID |
| C | Notification type |
| D | Channel |
| E | Scheduled for |
| F | Status |
| G | Attempts |
| H | Last attempt at |
| I | Last error |
| J | Payload summary |
| K | Created at |
| L | Updated at |

Allowed statuses:

```text
pending
sent
failed
cancelled
skipped
```

Initial channels:

```text
google_chat
email
calendar
```

### `Contacts`

Purpose: lightweight organization/contact metadata for task grouping and follow-up context.

Recommended columns:

| Column | Field |
|---|---|
| A | Contact ID |
| B | Display name |
| C | Type |
| D | Organization |
| E | Role |
| F | Email |
| G | Notes |
| H | Status |
| I | Created at |
| J | Updated at |

Allowed contact types:

```text
person
organization
project
vendor
internal
```

Do not store sensitive credentials, private tokens, or full private threads in this tab.

## Apps Script file/module scaffold

Create an Apps Script project bound to the Google Sheet. Use these files as the first scaffold.

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

### Module responsibilities

| File | Responsibility |
|---|---|
| `Code.gs` | Entrypoints, manual setup helpers, trigger registration wrappers. |
| `Config.gs` | Constants: sheet names, column indexes, timezone, allowed statuses, source values. |
| `SheetsStore.gs` | Low-level row reads/writes, header lookup, append row helpers. |
| `TaskService.gs` | Task list, filters, create, status update, comment update. |
| `ReportService.gs` | Daily report draft generation and `Reports` writes. |
| `ReminderService.gs` | Due task selection and trigger handlers. No live sends until enabled. |
| `NotificationService.gs` | Channel abstraction for Google Chat, Email, Calendar. |
| `ChatService.gs` | Google Chat message formatting and future slash-command/card helpers. |
| `WebApi.gs` | Public API wrapper functions for Web/PWA. |
| `WebApp.gs` | Optional `doGet` shell for serving Web/PWA from Apps Script. |
| `Validation.gs` | Request validation, enum checks, safe error objects. |
| `DateTime.gs` | Asia/Bangkok date parsing, today/week helpers. |
| `AuditLog.gs` | Append-only audit events. |

### Config constants to define first

```text
TIMEZONE = Asia/Bangkok
TASKS_SHEET = Tasks
SETTINGS_SHEET = Settings
AUDIT_LOG_SHEET = AuditLog
REPORTS_SHEET = Reports
NOTIFICATION_QUEUE_SHEET = NotificationQueue
CONTACTS_SHEET = Contacts
FINAL_STATUSES = Done, Cancelled, Archived
OPEN_STATUSES = Not started, In progress, Waiting, Push, Blocked, Postpone
TASK_TYPES = work, personal
APP_SOURCES = web, chatgpt, apps_script, telegram_legacy, manual_sheet
```

## First MVP functions

All MVP functions should return the shared response shape:

```json
{
  "ok": true,
  "data": {},
  "error": null
}
```

Error responses:

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Safe message for Lisa or the web app"
  }
}
```

### `getTodayTasks(request)`

Purpose: return tasks for the selected Asia/Bangkok date.

Input:

```json
{
  "date": "2026-05-21"
}
```

Behavior:

- Default `date` to today in `Asia/Bangkok` if missing.
- Read `Tasks` rows.
- Include rows where `Дата` matches the requested date or current legacy value `Сегодня`.
- Exclude archived rows where `Archived` is TRUE.
- Return normalized task objects.

### `getOpenTasks(request)`

Purpose: return all non-final tasks.

Input:

```json
{
  "taskType": "all"
}
```

Behavior:

- Include statuses not in `FINAL_STATUSES`.
- Respect optional `taskType`: `work`, `personal`, or `all`.
- Exclude archived rows.
- Sort by priority, deadline, and updated timestamp.

### `getPushTasks(request)`

Purpose: return follow-up/control tasks.

Input:

```json
{
  "dateRange": "today"
}
```

Behavior:

- Include rows where status is `Push` or legacy category/status/deadline suggests wait/control.
- Exclude final and archived rows.
- Prioritize high-priority work tasks first.
- Return enough metadata for the Pushes Web/PWA screen and Google Chat reminder summary.

### `addTask(request)`

Purpose: append a new task row.

Input:

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

Behavior:

- Validate required fields: `title`, `taskType`.
- Generate stable task ID, e.g. `BA-20260521-001`.
- Write A:N legacy fields and O:Y V2 fields.
- Set `Created at`, `Updated at`, `App source`.
- Append an `AuditLog` event.
- Return `taskId` and normalized task object.

### `updateTaskStatus(request)`

Purpose: update one task status.

Input:

```json
{
  "taskId": "BA-20260521-001",
  "status": "Done",
  "actor": "Lisa"
}
```

Behavior:

- Validate `taskId` and allowed `status`.
- Update status column K.
- Update `Updated at`.
- If status is final, set `Completed at` if blank.
- Append an `AuditLog` event.
- Return normalized task object.

### `updateTaskComment(request)`

Purpose: update or append task comment/result.

Input:

```json
{
  "taskId": "BA-20260521-001",
  "comment": "Sent follow-up, waiting for reply.",
  "mode": "append",
  "actor": "Lisa"
}
```

Behavior:

- Validate `taskId` and non-empty `comment`.
- Supported modes: `replace`, `append`.
- Write to legacy column M.
- Update `Updated at`.
- Append an `AuditLog` event.
- Return normalized task object.

### `buildDailyReportDraft(request)`

Purpose: build a daily BA report draft from task rows.

Input:

```json
{
  "date": "2026-05-21",
  "format": "ba_daily"
}
```

Behavior:

- Default date to today in Asia/Bangkok.
- Group tasks by completed, in progress/control, blockers, wait list, and focus.
- Use approved reporting principle: result → status → next action → deadline/control point.
- Write draft to `Reports` tab with status `draft`.
- Return `reportId` and `draft`.

## Manual setup steps for Lisa

### Google Sheets setup

1. Open Google Sheet `BA Fox Control Center / Tasks`.
2. Confirm the existing `Tasks` tab has columns A:N unchanged.
3. Add columns O:Y exactly as defined in this document.
4. Create tabs: `Settings`, `AuditLog`, `Reports`, `NotificationQueue`, `Contacts`.
5. Add the header rows exactly as defined above.
6. Fill initial `Settings` rows.
7. Do not paste secrets, tokens, private keys, or Google Chat webhook URLs into visible sheet cells.
8. Keep `live_gmail_automation_enabled` set to `FALSE`.

### Apps Script setup

1. In the Google Sheet, open Extensions → Apps Script.
2. Create the module files listed in this plan.
3. Add only scaffold code in the first implementation pass.
4. Store future secrets in Apps Script Properties, not in GitHub and not in visible sheet cells.
5. Do not enable Google Chat sends until notification-only MVP is reviewed.
6. Do not enable Gmail automation in this stage.
7. Add time-based triggers only after reminder selection is tested with dry-run mode.

### Web/PWA setup

1. Keep the existing static `web/` MVP unchanged for Stage V2.1.
2. Use this plan to define the future Apps Script API connection.
3. Do not connect the live Web/PWA to write operations until Apps Script validation and audit logging exist.

## Acceptance criteria for Stage V2.1

Stage V2.1 is complete when:

- this document is merged;
- the Google Sheets migration can be performed manually from exact column/tab instructions;
- the Apps Script scaffold file list is approved;
- first MVP functions have clear inputs, behavior, and outputs;
- no live code or automation has been enabled;
- Telegram/Railway remains untouched and paused.

## Safety constraints

- Documentation-only change.
- Do not modify `bot/`.
- Do not modify `web/`.
- Do not change live Telegram behavior.
- Do not add secrets.
- Do not connect live Gmail automation.
- Do not enable reminder sends before dry-run testing.
