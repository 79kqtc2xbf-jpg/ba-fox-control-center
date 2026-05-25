# BA Fox V2.6 — Read-only Web/PWA integration and task data cleanup plan

## 1. Purpose

Stage V2.6 prepares the next BA Fox V2 step after the live read-only Apps Script endpoint was verified.

The goal is to plan how the Web/PWA will consume the existing read-only Apps Script endpoint and to document the task data cleanup rules before any live write operations are enabled.

This stage is intentionally planning-first. It must not enable writes, notifications, triggers, Gmail automation, Google Chat, or Telegram/Railway changes.

## 2. Current confirmed status

Completed stages:

```text
V2.0 — Architecture documentation
V2.1 — Schema and Apps Script scaffold plan
V2.2 — Apps Script scaffold
V2.3 — Google Sheets setup and Apps Script dry-run smoke test
V2.4 — Live read-only Sheets functions
V2.5 — Live read-only Web endpoint
```

Current runtime state:

```text
Google Sheets = source of truth
Apps Script Web App = read-only JSON endpoint
Web/PWA = next read-only consumer
Writes / notifications / Google Chat / Gmail / triggers = disabled
Telegram/Railway = legacy / paused
```

V2.5 endpoint routes already tested manually:

```text
route=scaffoldInfo
route=today
route=open
route=pushes
route=dashboard
```

Post-test safety check:

```text
AuditLog = headers only
Reports = headers only
NotificationQueue = headers only
```

## 3. Safety boundaries for V2.6

Do not do any of the following in this stage:

```text
- Do not commit the live Apps Script endpoint URL.
- Do not commit secrets, tokens, webhook URLs, or private IDs.
- Do not enable Apps Script write operations.
- Do not enable doPost writes.
- Do not append rows to Tasks, AuditLog, Reports, or NotificationQueue.
- Do not update task statuses/comments from Web/PWA.
- Do not send Google Chat notifications.
- Do not add Google Chat webhook URLs.
- Do not send Email or Calendar notifications.
- Do not enable Apps Script triggers.
- Do not connect Gmail automation.
- Do not modify Telegram/Railway behavior.
- Do not automatically clean the live Tasks sheet.
```

Allowed:

```text
- Documentation.
- Read-only frontend client plan.
- Mock fallback plan.
- Read-only UI state plan.
- Data cleanup mapping rules.
- Future implementation checklist.
```

## 4. Read-only endpoint contract

The Web/PWA should treat the Apps Script endpoint as a read-only JSON API.

The live endpoint URL must be stored outside the repository. In docs and examples use only a placeholder:

```text
<BA_FOX_APPS_SCRIPT_ENDPOINT>
```

### 4.1 Routes

| Route | Purpose | Example |
|---|---|---|
| `scaffoldInfo` | Verify runtime switches and sheets config | `<BA_FOX_APPS_SCRIPT_ENDPOINT>?route=scaffoldInfo` |
| `today` | Fetch tasks for today or `Сегодня` rows | `<BA_FOX_APPS_SCRIPT_ENDPOINT>?route=today` |
| `open` | Fetch non-final, non-archived tasks | `<BA_FOX_APPS_SCRIPT_ENDPOINT>?route=open` |
| `pushes` | Fetch push/control/wait tasks | `<BA_FOX_APPS_SCRIPT_ENDPOINT>?route=pushes` |
| `dashboard` | Fetch scaffold info, today, open, and pushes in one response | `<BA_FOX_APPS_SCRIPT_ENDPOINT>?route=dashboard` |

### 4.2 Optional filters

```text
?route=today&date=2026-05-23
?route=open&taskType=work
?route=open&scope=all
?route=pushes&dateRange=today
```

### 4.3 Expected response shape

Success:

```json
{
  "ok": true,
  "data": {},
  "error": null
}
```

Error:

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "ROUTE_NOT_FOUND",
    "message": "Unknown read-only route.",
    "details": {}
  }
}
```

### 4.4 Required safety flags

The frontend should verify these values before showing live endpoint data as connected:

```text
dryRun = true
readLiveSheets = true or readLive = true
liveAutomationEnabled = false
triggersEnabled = false
```

If the flags are missing or unsafe, the frontend should show an error state and avoid treating the response as trusted.

## 5. Frontend configuration pattern

The endpoint URL must not be committed to the repository.

Recommended patterns:

### Option A — local runtime config file, gitignored

```text
web/config.local.js   # not committed
```

Example content for local use only:

```js
window.BA_FOX_CONFIG = {
  APPS_SCRIPT_ENDPOINT: '<paste manually outside repo>',
  USE_MOCK_DATA: false
};
```

Repository-safe example file:

```text
web/config.example.js
```

```js
window.BA_FOX_CONFIG = {
  APPS_SCRIPT_ENDPOINT: '',
  USE_MOCK_DATA: true
};
```

### Option B — manual browser localStorage value

For local testing only:

```js
localStorage.setItem('BA_FOX_APPS_SCRIPT_ENDPOINT', '<paste manually outside repo>');
```

The frontend reads:

```js
const endpoint = localStorage.getItem('BA_FOX_APPS_SCRIPT_ENDPOINT');
```

This keeps the endpoint out of GitHub. It is not a security boundary, but it avoids committing the private URL.

### Option C — deploy-time environment variable later

For future hosting only:

```text
BA_FOX_APPS_SCRIPT_ENDPOINT=<stored in host settings, not repo>
```

Use only if/when the Web/PWA moves to a hosting platform that supports environment variables.

## 6. Read-only fetch client plan

The frontend should add a small API client layer instead of calling `fetch` directly from UI components.

Suggested structure:

```text
web/api/
  baFoxClient.js
  baFoxMockData.js
  baFoxConfig.js
```

### 6.1 Client responsibilities

`baFoxClient.js` should:

```text
- build route URLs safely;
- call GET only;
- never call POST;
- parse JSON;
- validate ok/error shape;
- validate safety flags;
- return normalized frontend data;
- fall back to mock data if configured.
```

### 6.2 Client functions

```js
getScaffoldInfo()
getTodayTasks({ date })
getOpenTasks({ taskType })
getPushTasks({ dateRange })
getDashboard()
```

### 6.3 Route builder

Pseudo-code:

```js
function buildUrl(route, params = {}) {
  const endpoint = getEndpointOutsideRepo();
  const url = new URL(endpoint);
  url.searchParams.set('route', route);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  return url.toString();
}
```

### 6.4 GET-only rule

The client must not include any function named or behaving like:

```text
addTask
updateTaskStatus
updateTaskComment
saveReport
sendNotification
```

Those remain future stages.

## 7. Web/PWA read-only UI states

Each dashboard section should support the same state model.

### 7.1 Loading

Show while route is pending:

```text
Loading BA Fox tasks…
```

Russian UI copy option:

```text
Загружаю задачи BA Fox…
```

### 7.2 Success

Show cards grouped by source data:

```text
Today
Open
Pushes / Control
```

Minimum card fields:

```text
- title
- organization
- priority
- status
- deadline
- nextReminder
- comment
```

### 7.3 Empty state

If `today.tasks` is empty:

```text
Сегодня нет задач по дате. Проверь Open / Pushes.
```

If `pushes.tasks` is empty:

```text
Нет активных пушей. Можно выдохнуть, но недолго.
```

### 7.4 Error state

If endpoint fails:

```text
Не удалось загрузить BA Fox endpoint. Показываю mock/demo данные.
```

If response safety flags are unsafe:

```text
Endpoint вернул небезопасные runtime flags. Live UI отключён.
```

### 7.5 Offline / mock fallback

The Web/PWA should be usable in demo mode with mock data.

Mock mode should be clearly marked:

```text
Demo mode / mock data
```

## 8. Suggested first read-only screens

### 8.1 Today screen

Source:

```text
route=dashboard → data.today.tasks
```

Blocks:

```text
- Today focus
- High priority
- Due today / overdue
- Empty state if no date-matched tasks
```

### 8.2 Open tasks screen

Source:

```text
route=dashboard → data.open.tasks
```

Blocks:

```text
- High priority
- In progress
- Needs clarification
- Blockers
- Waiting / external dependency
```

### 8.3 Pushes screen

Source:

```text
route=dashboard → data.pushes.tasks
```

Blocks:

```text
- Follow-up needed
- Waiting answer
- Control date passed
- Partner communication
```

### 8.4 System status widget

Source:

```text
route=scaffoldInfo
```

Display internally or in Settings:

```text
Read-only connected
Dry-run writes enabled
Triggers disabled
Notifications disabled
```

## 9. Task normalization for frontend display

The frontend should not mutate source data. It can normalize for display only.

Suggested frontend display normalization:

| Source value | Display value |
|---|---|
| `В работе`, `In progress`, `работы`, `В работы` | `В работе` |
| `Ждём ответ`, `Ждем ответ`, `Waiting`, `Wait list`, `Список ожидания` | `Ждём ответ` |
| `Push`, `Пуш` | `Пуш` |
| `Нужно`, `Нужно уточнить`, `Нужно подробно` | `Нужно уточнить` |
| `Блокер`, `Blocked` | `Блокер` |
| `Выполнено`, `Done` | `Выполнено` |
| `work`, `работа` | `work` |
| `Lisa`, `Лиза` | `Lisa` |

The display layer should preserve original values for debugging if needed.

## 10. Task data cleanup plan

The live `Tasks` sheet should not be cleaned automatically in V2.6. Cleanup must first be planned and reviewed.

### 10.1 Cleanup phases

```text
Phase 1 — Audit only
Phase 2 — Proposed mapping table
Phase 3 — Manual review by Lisa
Phase 4 — Backup export
Phase 5 — Controlled cleanup script or manual edits
Phase 6 — Post-cleanup smoke test
```

### 10.2 Required backup before cleanup

Before any actual cleanup:

```text
- Duplicate the Tasks tab as Tasks_Backup_YYYYMMDD.
- Export the spreadsheet or Tasks tab to XLSX/CSV if needed.
- Confirm backup opens correctly.
```

### 10.3 Duplicate task IDs

Known risk:

```text
EA-20260522-019 appears in repeated/variant rows.
```

Plan:

```text
- Detect duplicate IDs.
- Compare title, organization, date, status, comment, and steps.
- Keep the most complete/current row.
- Mark older duplicates as archive candidates.
- Do not delete rows in the first cleanup pass.
```

Recommended duplicate resolution columns for review:

```text
Duplicate group
Primary row candidate
Archive candidate
Reason
Lisa approval
```

### 10.4 Status normalization

Suggested canonical statuses:

```text
Не начато
В работе
Ждём ответ
Пуш
Блокер
Нужно уточнить
Перенести
Выполнено
Отменено
Архив
```

Mapping table:

| Legacy value | Canonical value |
|---|---|
| `In progress` | `В работе` |
| `В работы` | `В работе` |
| `работы` | `В работе` |
| `Waiting` | `Ждём ответ` |
| `Ждем ответ` | `Ждём ответ` |
| `Wait list` | `Ждём ответ` or `Перенести`, review required |
| `Список ожидания` | `Ждём ответ` or `Перенести`, review required |
| `Push` | `Пуш` |
| `Нужно` | `Нужно уточнить` |
| `Нужно подробно` | `Нужно уточнить` |
| `Blocked` | `Блокер` |
| `Done` | `Выполнено` |
| `Archived` | `Архив` |
| `Cancelled` | `Отменено` |

### 10.5 Task type normalization

Canonical values:

```text
work
personal
```

Mapping table:

| Legacy value | Canonical value |
|---|---|
| `работа` | `work` |
| `Работа` | `work` |
| `личное` | `personal` |
| `Личное` | `personal` |
| empty | `work` unless category clearly personal |

### 10.6 Owner normalization

Canonical values:

```text
Lisa
Theodor
Team
External
```

Mapping table:

| Legacy value | Canonical value |
|---|---|
| `Лиза` | `Lisa` |
| `Lisa` | `Lisa` |
| empty | `Lisa` |
| `Теодор` | `Theodor` |
| `Команда` | `Team` |

### 10.7 Date normalization

Canonical date format:

```text
YYYY-MM-DD
```

Examples:

| Legacy value | Canonical example |
|---|---|
| `20 мая 2026` | `2026-05-20` |
| `20.05.2026` | `2026-05-20` |
| `Сегодня` | actual current date at cleanup time, review required |
| `Понедельник` | review required |
| `Следующий рабочий день` | review required |

Do not automatically convert vague dates without review.

### 10.8 Organization normalization

Proposed canonical names:

| Variants | Canonical value |
|---|---|
| `Trisara`, `Трисара` | `Trisara` |
| `Sansiri`, `Сансири` | `Sansiri` |
| `Tri Vanada`, `Три Ванада`, `Tri Ванада` | `Tri Vanada` |
| `Grusha`, `Груша` | `Grusha` |
| `Super Rich`, `Super Rich Exchange` | `Super Rich Exchange` |
| `Kasikorn`, `KBankLao`, `Kasikorn / KBankLao` | review required |
| `Prominds Laos`, `Prominds Лаос` | `Prominds Laos` |

### 10.9 Corrupted legacy fields

Known risk examples:

```text
notificationChannels with spaces or broken key fragments
source / источник mixed into row-like data
steps / шаги variants
```

Plan:

```text
- Do not attempt automatic repair in frontend.
- Detect rows where normalized object has unexpected keys or malformed content.
- Add these rows to a review list.
- Keep original source row untouched until cleanup is approved.
```

### 10.10 Archive vs delete rule

Never delete first.

First cleanup pass should use:

```text
Archived = TRUE
Status = Архив
Comment = cleanup note
```

Deletion can be considered only after a backup and separate approval.

## 11. Proposed future cleanup helper, not for V2.6 execution

Future helper could generate a review tab:

```text
CleanupReview
```

Headers:

```csv
Review ID,Task ID,Issue type,Current value,Proposed value,Row number,Confidence,Action,Approved by Lisa,Notes
```

Issue types:

```text
DUPLICATE_ID
STATUS_NORMALIZATION
TASK_TYPE_NORMALIZATION
OWNER_NORMALIZATION
DATE_REVIEW_REQUIRED
ORG_NORMALIZATION
CORRUPTED_LEGACY_FIELD
```

This helper must be read-only at first and write only to `CleanupReview` after separate approval.

## 12. Manual test plan for V2.6 implementation PR

If a later V2.6 implementation PR adds frontend read-only code, test with mock mode first:

```text
1. Open Web/PWA locally.
2. Confirm mock mode banner.
3. Confirm Today/Open/Pushes render from mock data.
4. Confirm error state by simulating endpoint failure.
5. Confirm no write buttons are active.
```

Then test with live endpoint manually, without committing URL:

```text
1. Paste endpoint into localStorage or local config file not committed.
2. Load dashboard.
3. Confirm route=dashboard is used.
4. Confirm read-only cards render.
5. Confirm no POST requests occur.
6. Confirm no rows are created in AuditLog, Reports, NotificationQueue.
```

## 13. Acceptance checklist

Before Stage V2.6 can be considered complete:

```text
- Read-only Web/PWA integration approach documented.
- Endpoint config pattern keeps URL outside repo.
- Route usage documented.
- Loading/success/empty/error states documented.
- Mock fallback documented.
- Data cleanup mappings documented.
- No live cleanup executed.
- No writes enabled.
- No notifications/triggers/Gmail/Google Chat enabled.
- No Telegram/Railway changes.
```

## 14. Next recommended work after this document

Recommended next PR after review:

```text
Stage V2.6A — add frontend read-only mock client skeleton without endpoint URL
```

Then:

```text
Stage V2.6B — add local-only endpoint config instructions
Stage V2.6C — create CleanupReview audit-only script, no live edits
Stage V2.7 — controlled write design, not implementation
```
