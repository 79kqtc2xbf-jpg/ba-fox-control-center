# Stage 27 Live Task Creation QA

## Purpose

Verify that the web `Новая задача` fast-add flow creates one real task through the existing Apps Script `createTask` route and writes the expected values into the live Google Sheet `Tasks` tab.

This QA is intentionally manual because it writes a real test row. Do not change the Google Sheet schema, Apps Script write behavior, Telegram bot, auth, secrets, or product attribution as part of this test unless a verified incompatibility is found.

## Preconditions

- If Apps Script create-task compatibility changes have just merged, deploy a new Apps Script version before testing the live web UI.
- Web config points to the live Apps Script deployment.
- `USE_MOCK_DATA` is `false`.
- `BA_FOX_ACTION_TOKEN` is configured in runtime/hosting config, not committed to the repo.
- Apps Script `SAFE_WRITE_MODE` is enabled for safe task creation.
- The dashboard loads in live mode and the `Новая задача` button is enabled.
- Google Sheet `Tasks` tab is open in a separate browser tab for verification.
- The dashboard navigation includes `Все задачи`.

## Test Task Values

Use this exact marker so the row is easy to find and clean up:

| UI field | Test value |
| --- | --- |
| Название задачи | `TEST_STAGE_27_LIVE_WRITE_DO_NOT_USE` |
| Контакт | `QA / Liza` |
| Следующее действие | `Проверить запись задачи в Google Sheet` |
| Контрольная дата | Tomorrow's date in `YYYY-MM-DD` format |
| Напоминание | Empty |
| Приоритет | `Средний` |
| Статус | `Не начато` |
| Категория | `QA` |
| Комментарий | `Stage 27 live write verification` |

For Tuesday, June 16, 2026, the recommended control date is:

```text
2026-06-17
```

## Expected Frontend Payload Mapping

The current frontend builds the payload in `web/app.js` from `createTaskPayloadFromForm()`:

| UI field | Frontend payload key | Notes |
| --- | --- | --- |
| Название задачи | `title` | Required in UI. |
| Контакт | `organization` | Existing backend/sheet-compatible contact field; maps to column D. |
| Следующее действие | `nextAction` | If left empty, frontend backfills it with `title` for backend compatibility. |
| Контрольная дата | `controlDate` and `deadline` | Native date input; must be `YYYY-MM-DD`. |
| Напоминание | `reminder` | Optional native date input; must be empty or `YYYY-MM-DD`. |
| Приоритет | `priority` | Uses existing values such as `Medium`. |
| Статус | `status` | Uses backend-compatible value such as `Not Started`. UI label is Russian-first. |
| Категория | `category` | Selected category value; `QA` is available in the form for this live write test. |
| Комментарий | `comment` | Written to the comment/result field if route succeeds. |

`BAFoxClient.createTask()` sends the payload to the existing JSONP write route:

```text
route=createTask
```

The client also adds the configured action token at request time. Do not commit or expose the token.

## Expected Apps Script Mapping

The current Apps Script route is:

```text
WebApp.gs route=createTask -> WebApi.gs createTask(request) -> TaskService.gs baFoxSafeCreateTask(request)
```

`baFoxSafeCreateTask()` accepts only these create fields:

```text
title, organization, nextAction, deadline, controlDate, reminder, status, priority, category, comment
```

The expected `Tasks` row mapping is:

| Column | Sheet field | Expected value |
| --- | --- | --- |
| A | ID | Generated `BA-WEB-...` task id |
| B | Date | Empty |
| C | Category | `QA` |
| D | Organization / contact | `QA / Liza` |
| E | Title | `TEST_STAGE_27_LIVE_WRITE_DO_NOT_USE` |
| F | Steps / next action | `Проверить запись задачи в Google Sheet` |
| G | Source | `BA Fox Web` |
| H | Priority | `Medium` / backend-compatible value from UI |
| I | Deadline | `2026-06-17` |
| J | Reminder mode | Empty, because reminder is empty |
| K | Status | `Not Started` / backend-compatible value from UI |
| L | Next reminder | `2026-06-17`, because control date is used when reminder is empty |
| M | Comment | `Stage 27 live write verification` |
| N | Channel | `Web` |
| O | Task type | `work` |
| P | Owner | `Lisa` |
| Q | Created at | Apps Script timestamp |
| R | Updated at | Apps Script timestamp |
| S | Completed at | Empty |
| T | Reminder recurrence | `none` |
| U | Notification channels | Empty |
| V | Notification status | Empty |
| W | App source | `web` |
| X | External ref | Empty |
| Y | Archived | `false` |

## Manual Live QA Steps

1. Open the live web dashboard.
2. Confirm the footer attribution remains visible: `Made by Liza Kiseleva`.
3. Confirm the dashboard is using live data, not demo fallback.
4. Click `Новая задача`.
5. Enter the Stage 27 test values from this document.
6. Click `Сохранить` once.
7. Confirm the submit button shows `Сохраняем…` and is disabled while saving.
8. Confirm the UI shows `Задача добавлена`.
9. Confirm the form clears and offers `Добавить ещё`.
10. Confirm the dashboard refreshes with a live refresh/cache bypass after save.
11. Open `Все задачи`.
12. Search for `TEST_STAGE_27_LIVE_WRITE_DO_NOT_USE` in the dashboard.
13. Confirm the task is visible in `Все задачи`.
14. Open the Google Sheet `Tasks` tab.
15. Search for `TEST_STAGE_27_LIVE_WRITE_DO_NOT_USE`.
16. Verify the row values against the expected mapping table above.
17. Confirm only one row was created for the marker.
18. Confirm an audit entry exists if `AuditLog` is available and safe to inspect.

## Rollback / Cleanup

After verification, clean up the test task manually in the Google Sheet:

1. Find the row with title `TEST_STAGE_27_LIVE_WRITE_DO_NOT_USE`.
2. Prefer marking it clearly as test cleanup rather than deleting immediately if audit history matters.
3. If deletion is acceptable for the live QA sheet, delete only that single test row.
4. Do not run bulk cleanup scripts.
5. Do not change sheet headers or schema.
6. If an audit row was created, leave it as the historical write trail unless there is a separate approved cleanup policy.

Recommended cleanup note if editing the row instead of deleting:

```text
Stage 27 live write QA completed; test row safe to ignore/archive.
```

## Known Limitations

- This QA creates a real Google Sheet row.
- The web UI does not display the generated task id directly after save.
- After successful create, the web UI requests a cache-bypass dashboard refresh and opens `Все задачи`.
- If the deployed Apps Script version is older than Stage 27.3, `Все задачи` may not include the unfiltered `all.tasks` payload.
- The current frontend uses backend-compatible values internally while showing Russian-first labels.
- If `SAFE_WRITE_MODE` or action token is not configured, the UI should show a friendly create-task error and no row should be created.

## Compatibility Review Result

Reviewed on Stage 27 and Stage 27.2:

- Frontend payload is compatible with the Apps Script safe create route after Stage 27.2 is deployed.
- `Контакт` maps to the existing `organization` field and column D.
- Date values use native date inputs and `YYYY-MM-DD`.
- Duplicate submit is guarded by `createTaskState.status === 'loading'` and disabled submit button.
- Stage 27.2 updates Apps Script create-task validation only; no Google Sheet schema, Telegram, auth, secrets, or product attribution changes are required.
- Stage 27.3 adds a read-only `all.tasks` dashboard payload and the `Все задачи` frontend view so newly created tasks can be verified in the dashboard after a forced refresh.
- Small frontend-only compatibility note: the task category dropdown includes `QA` so the exact Stage 27 test value can be selected without changing backend/schema behavior.
