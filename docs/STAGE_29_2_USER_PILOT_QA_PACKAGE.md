# Stage 29 — 2-User Pilot QA Package

## Pilot Goal

Run a controlled pilot with two employees before broader team rollout.

The pilot should confirm that real users can open the BA Fox web dashboard, create tasks, assign an owner through `Ответственный`, see the success modal `Задача добавлена`, find created tasks in `Все задачи`, use owner/status/search filters, and report issues clearly.

This stage is documentation-first. Do not change Apps Script, Google Sheet schema, Telegram bot, auth, secrets, or product attribution for this pilot unless a verified blocker requires a separately approved fix.

## Participants

| Participant | Role | Main responsibility |
| --- | --- | --- |
| Liza | Product owner / QA owner | Coordinate pilot, give access/instructions, verify Google Sheet rows, collect issues, decide go/no-go. |
| Employee 1 | Pilot tester | Create one assigned test task and confirm it is findable through dashboard views and filters. |
| Employee 2 | Pilot tester | Create one assigned test task and confirm it is findable through dashboard views and filters. |

## Pilot Test Tasks

Use these exact task names so test rows are easy to find and clean up:

| Tester | Exact task name |
| --- | --- |
| Employee 1 | `PILOT_EMPLOYEE_1_TASK_DO_NOT_USE` |
| Employee 2 | `PILOT_EMPLOYEE_2_TASK_DO_NOT_USE` |
| Liza admin check | `PILOT_LIZA_OWNER_CHECK_DO_NOT_USE` |

Recommended shared values:

| Field | Value |
| --- | --- |
| Контакт | `Pilot QA` plus tester name |
| Следующее действие | `Проверить создание задачи в пилоте` |
| Контрольная дата | Next working day |
| Приоритет | `Средний` |
| Статус | `Не начато` |
| Категория | `QA` if available, otherwise any work category already used by the dashboard |
| Комментарий | `Stage 29 two-user pilot QA` |

## What Each Participant Should Test

### Liza

1. Open the dashboard and confirm it loads.
2. Confirm old tasks without owner remain visible and show as `Не назначено`.
3. Create `PILOT_LIZA_OWNER_CHECK_DO_NOT_USE`.
4. Choose an `Ответственный`.
5. Confirm the success modal shows exact text `Задача добавлена`.
6. Find the task in `Все задачи`.
7. Filter by `Ответственный`.
8. Filter by `Активные`.
9. Search by task title and by contact.
10. Verify all three pilot tasks exist in the Google Sheet.
11. Collect issue reports and decide go/no-go.

### Employee 1

1. Open the dashboard.
2. Create `PILOT_EMPLOYEE_1_TASK_DO_NOT_USE`.
3. Select the correct `Ответственный`.
4. Confirm the success modal shows `Задача добавлена`.
5. Open `Все задачи`.
6. Find the task by title.
7. Find the task by contact.
8. Filter by `Ответственный`.
9. Filter by `Активные`.
10. Report any confusion, error, or missing task to Liza.

### Employee 2

1. Open the dashboard.
2. Create `PILOT_EMPLOYEE_2_TASK_DO_NOT_USE`.
3. Select the correct `Ответственный`.
4. Confirm the success modal shows `Задача добавлена`.
5. Open `Все задачи`.
6. Find the task by title.
7. Find the task by contact.
8. Filter by `Ответственный`.
9. Filter by `Активные`.
10. Report any confusion, error, or missing task to Liza.

## Short Pilot Instruction For Employees

1. Откройте приложение BA Fox по ссылке, которую даст Лиза.
2. Нажмите `Новая задача`.
3. Заполните поля:
   - `Название задачи`: используйте свое тестовое название из инструкции.
   - `Ответственный`: выберите себя или ответственного, которого сказала Лиза.
   - `Контакт`: напишите `Pilot QA` и свое имя.
   - `Следующее действие`: напишите `Проверить создание задачи в пилоте`.
   - `Контрольная дата`: выберите ближайший рабочий день.
   - Остальные поля оставьте как есть, если Лиза не сказала иначе.
4. Нажмите `Сохранить`.
5. Убедитесь, что появилось сообщение `Задача добавлена`.
6. Откройте `Все задачи`.
7. Найдите задачу по названию или контакту.
8. Проверьте фильтр `Ответственный` и фильтр `Активные`.
9. Если что-то не работает или непонятно, напишите Лизе по шаблону ниже.

## Test Matrix

| Test ID | Tester | Scenario | Steps | Expected result | Pass/Fail | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| S29-001 | Employee 1 | Open dashboard | Open the app link from Liza. | Dashboard loads without critical error; product attribution remains visible. |  |  |
| S29-002 | Employee 1 | Create a task | Open `Новая задача`, enter `PILOT_EMPLOYEE_1_TASK_DO_NOT_USE`, fill required fields, select `Ответственный`, save. | Task saves successfully. |  |  |
| S29-003 | Employee 1 | Success modal | After saving the task, watch the confirmation. | Modal appears with exact text `Задача добавлена`. |  |  |
| S29-004 | Employee 1 | Find in all tasks | Open `Все задачи` and search for `PILOT_EMPLOYEE_1_TASK_DO_NOT_USE`. | Created task is visible in `Все задачи`. |  |  |
| S29-005 | Employee 1 | Filter by owner | Use `Ответственный` filter for the selected owner. | Created task remains visible when the matching owner is selected. |  |  |
| S29-006 | Employee 1 | Filter active tasks | Use `Активные` filter. | Created task is visible as an active task. |  |  |
| S29-007 | Employee 1 | Search by title/contact | Search by `PILOT_EMPLOYEE_1_TASK_DO_NOT_USE`, then by `Pilot QA`. | Search returns the created task in both cases. |  |  |
| S29-008 | Employee 2 | Open dashboard | Open the app link from Liza. | Dashboard loads without critical error; product attribution remains visible. |  |  |
| S29-009 | Employee 2 | Create a task | Open `Новая задача`, enter `PILOT_EMPLOYEE_2_TASK_DO_NOT_USE`, fill required fields, select `Ответственный`, save. | Task saves successfully. |  |  |
| S29-010 | Employee 2 | Success modal | After saving the task, watch the confirmation. | Modal appears with exact text `Задача добавлена`. |  |  |
| S29-011 | Employee 2 | Find in all tasks | Open `Все задачи` and search for `PILOT_EMPLOYEE_2_TASK_DO_NOT_USE`. | Created task is visible in `Все задачи`. |  |  |
| S29-012 | Employee 2 | Filter by owner | Use `Ответственный` filter for the selected owner. | Created task remains visible when the matching owner is selected. |  |  |
| S29-013 | Employee 2 | Filter active tasks | Use `Активные` filter. | Created task is visible as an active task. |  |  |
| S29-014 | Employee 2 | Search by title/contact | Search by `PILOT_EMPLOYEE_2_TASK_DO_NOT_USE`, then by `Pilot QA`. | Search returns the created task in both cases. |  |  |
| S29-015 | Liza | Admin owner check | Create `PILOT_LIZA_OWNER_CHECK_DO_NOT_USE`, assign owner, save. | Task saves and shows `Задача добавлена`. |  |  |
| S29-016 | Liza | Verify Google Sheet rows | Open the Google Sheet `Tasks` tab and search for all three pilot task names. | All three task rows exist; owner values are present in the existing Owner column P. |  |  |
| S29-017 | Liza | Old ownerless tasks | Open dashboard and inspect old tasks that have no owner. | Ownerless tasks are still visible and displayed as `Не назначено`. |  |  |
| S29-018 | Liza | Go/no-go review | Review matrix results and issue reports. | Decision is documented as Go or No-go using the criteria below. |  |  |

## Expected Results

- The dashboard opens for both employees.
- Each employee can create exactly one pilot task.
- `Ответственный` can be selected during task creation.
- After successful creation, the modal shows exact text `Задача добавлена`.
- Created tasks appear in `Все задачи`.
- Created tasks are visible with the matching `Ответственный` filter.
- Created tasks are visible with the `Активные` filter.
- Search works by task title and contact.
- Liza can verify pilot rows in the Google Sheet.
- Existing tasks without owner remain visible as `Не назначено`.
- No Apps Script redeploy is required for this documentation-only pilot package.

## Issue Report Template

Send issues to Liza in this format:

```text
Что делал(а):

Что ожидал(а):

Что произошло:

Скриншот:

Время:

Какая задача / фильтр / вкладка:
```

## Cleanup Instructions

After the pilot decision:

1. Liza opens the Google Sheet `Tasks` tab.
2. Search for:
   - `PILOT_EMPLOYEE_1_TASK_DO_NOT_USE`
   - `PILOT_EMPLOYEE_2_TASK_DO_NOT_USE`
   - `PILOT_LIZA_OWNER_CHECK_DO_NOT_USE`
3. Confirm each row is a pilot test row before editing.
4. Prefer marking the rows as completed/archived if audit history matters.
5. Delete only these exact rows if deletion is approved for the live sheet.
6. Do not run bulk cleanup scripts.
7. Do not change headers, formulas, columns, validation, or schema.

Recommended cleanup note:

```text
Stage 29 pilot QA completed; test row safe to ignore/archive.
```

## Go / No-Go Criteria

### Go if

- Both employees can create tasks.
- Owner assignment is visible.
- Each created task appears in `Все задачи`.
- Success modal appears with `Задача добавлена`.
- No critical errors occur.
- Liza can verify rows in the Google Sheet.
- Old tasks without owner are still visible as `Не назначено`.

### No-go if

- A task is not created.
- A task is created but not visible in the dashboard.
- Owner assignment is lost.
- Dashboard fails to load.
- Users cannot understand where to find tasks.
- Any critical error blocks normal task creation or task search.

## Pilot Completion Record

Use this section after the test:

| Item | Result |
| --- | --- |
| Pilot date |  |
| Employee 1 completed |  |
| Employee 2 completed |  |
| Liza admin check completed |  |
| Critical issues found |  |
| Decision | Go / No-go |
| Cleanup completed |  |

## Scope Confirmation

This package does not require:

- Apps Script changes.
- Google Sheet schema changes.
- Telegram bot changes.
- Auth changes.
- Secret changes.
- Product attribution removal.
- Apps Script redeploy.
