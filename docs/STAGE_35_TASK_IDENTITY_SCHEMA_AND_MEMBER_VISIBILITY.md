# Stage 35 — Task Identity Schema And Member Visibility Foundation

## Goal

Prepare task-level identity fields for future team visibility without changing the current live behavior.

Stage 35 keeps the dashboard in safe/default mode:

- `IDENTITY_ENFORCEMENT_MODE=profile_only`
- `VISIBILITY_ENFORCEMENT=false`
- dashboard filtering by user is not enabled
- action-token task creation remains supported
- new task identity columns are optional

The pilot with Andrey and Daniil remains paused.

## Why This Stage Is Needed

The current Tasks sheet can show an `Owner / Ответственный` label, but a label alone is not enough for reliable member visibility.

Future team mode needs stable identity fields so the backend can answer:

- who owns the task;
- who collaborates on the task;
- who created the task;
- whether the task is team-visible, private, admin-only, executive-only, or unassigned.

This stage prepares that model while preserving the existing live workflow.

## Current Legacy Tasks Schema

Current known legacy fields:

| Column | Header |
| --- | --- |
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
| P | Owner / Ответственный |

Do not delete, rename, or move existing columns.

## Recommended Optional Columns

Add these columns manually later, after the current owner column or after the current last operational task column if the live sheet already has post-owner operational fields:

```text
Owner Email
Owner User ID
Collaborator Emails
Collaborator User IDs
Created By Email
Created By User ID
Visibility
```

Recommended `Visibility` values:

```text
team
private
admin_only
executive
unassigned
```

## Is Migration Required Now?

No.

Deploy Stage 35 code first. The current dashboard and task creation must continue to work even if none of the new columns exist.

Adding the columns later is safe because Apps Script resolves these fields by header name and skips them when missing.

## Header-Based Optional Reads

Apps Script now supports optional identity columns through header lookup.

Supported aliases:

| Field | Headers / aliases |
| --- | --- |
| Owner Email | `Owner Email`, `ownerEmail`, `owner_email`, `Email ответственного` |
| Owner User ID | `Owner User ID`, `ownerUserId`, `owner_user_id`, `ID ответственного` |
| Collaborator Emails | `Collaborator Emails`, `collaboratorEmails`, `collaborator_emails`, `Участники email` |
| Collaborator User IDs | `Collaborator User IDs`, `collaboratorUserIds`, `collaborator_user_ids`, `Участники userId` |
| Created By Email | `Created By Email`, `createdByEmail`, `created_by_email`, `Создал email` |
| Created By User ID | `Created By User ID`, `createdByUserId`, `created_by_user_id`, `Создал userId` |
| Visibility | `Visibility`, `visibility`, `Видимость` |

If a column is missing, Apps Script returns an empty value and continues.

## Normalized Task Identity Fields

Task objects can now include:

```text
ownerLabel
ownerEmail
ownerUserId
collaboratorEmails
collaboratorUserIds
collaboratorEmailList
collaboratorUserIdList
createdByEmail
createdByUserId
visibility
identityFieldsAvailable
```

Comma-separated collaborators are parsed into trimmed arrays. Emails are normalized to lowercase for future visibility checks.

Existing task fields remain unchanged for frontend compatibility.

## Create Task Behavior

Create task still writes the legacy `Owner / Ответственный` label as before.

If the optional identity columns exist:

- `Created By Email` is populated when a verified profile is available;
- `Created By User ID` is populated when a verified profile is available;
- `Owner Email` and `Owner User ID` are populated when the selected owner label maps to exactly one Users row;
- `Visibility` defaults to `team`.

If the optional identity columns do not exist:

- task creation does not fail;
- current action-token behavior remains available;
- the response includes metadata showing the columns are absent.

In `profile_only` mode, create task does not require verified Google identity.

In `enforced` mode, Stage 33 write authorization rules still apply.

## Owner Lookup

Apps Script can map:

- email to user;
- user ID to user;
- owner label to user through `Users.defaultOwnerLabel`.

Owner label matching is exact after trimming/lowercasing.

If a label is ambiguous, Apps Script does not guess. It returns warning metadata and leaves owner email/user ID blank.

Examples:

- `Лиза` can resolve to Liza if exactly one Users row has `defaultOwnerLabel=Лиза`;
- `Андрей` must resolve to exactly one row before owner identity metadata is written.

## Member Visibility Rules Prepared

`profileCanSeeTask_(profile, task)` is prepared but not enabled by default.

Prepared rules:

- admin sees all;
- executive sees all;
- member can see a task when one of these matches:
  - task owner email equals profile email;
  - task owner user ID equals profile user ID;
  - task owner label equals profile default owner label;
  - collaborator emails include profile email;
  - collaborator user IDs include profile user ID;
  - created-by email equals profile email;
  - created-by user ID equals profile user ID.

Inactive, unregistered, and wrong-domain users do not get member visibility.

## Dashboard Metadata

Dashboard payloads can now include:

```text
taskIdentitySchema
optionalIdentityColumnsPresent
visibilityMode
filteredByUser
identityWarnings
recommendedTaskIdentityColumns
```

Expected current default:

```text
visibilityMode: profile_only
filteredByUser: false
optionalIdentityColumnsPresent: false
```

Missing optional identity fields are not treated as scary red errors. They are expected until the manual migration is done.

## Frontend Status

Settings/Profile can show:

```text
Права доступа
Поля видимости задач
Фильтрация по пользователю не включена
Поля участников пока не заполнены
Пилот не запущен
```

This is status/debug information only. It does not enable filtering.

## Manual Migration Instructions

Recommended sequence:

1. Merge and deploy Stage 35 Apps Script code.
2. Confirm dashboard and task creation still work before adding columns.
3. Open the live Tasks sheet.
4. Do not delete existing columns.
5. Do not rename existing columns.
6. Do not move existing columns.
7. Add these headers after the existing owner column, or after the current last operational task column if the live sheet already has additional post-owner columns:

```text
Owner Email
Owner User ID
Collaborator Emails
Collaborator User IDs
Created By Email
Created By User ID
Visibility
```

8. Save the sheet.
9. Create one test task.
10. Confirm the task is still visible in `Все задачи`.
11. Confirm the new identity columns populate where possible.

Migration is optional for the current dashboard.

## QA Checklist

Before manual column migration:

- dashboard loads;
- Settings/Profile renders;
- Google sign-in prepared state remains OK;
- product attribution remains visible;
- create task still works;
- success modal says `Задача добавлена`;
- task appears in `Все задачи`;
- owner label is preserved;
- dashboard metadata reports identity columns missing/optional;
- `filteredByUser` is `false`.

After optional column migration:

- create task still works;
- `Owner Email` / `Owner User ID` populate when owner label resolves exactly;
- `Created By Email` / `Created By User ID` populate when verified profile is available;
- `Visibility` defaults to `team`;
- missing or ambiguous owner labels do not block task creation;
- dashboard metadata reports partial or ready identity schema.

## Rollback Plan

If the Stage 35 Apps Script deployment causes problems:

1. Redeploy the previously accepted Apps Script version.
2. Keep `IDENTITY_ENFORCEMENT_MODE=profile_only`.
3. Keep `VISIBILITY_ENFORCEMENT=false`.
4. Leave optional columns in the sheet if already added; the old code can ignore extra columns.
5. Confirm dashboard loads.
6. Confirm task creation still works with the existing action token.

If the manual column migration causes confusion:

1. Do not delete data from old columns.
2. Leave new columns empty or hide them temporarily.
3. Re-test task creation and dashboard read.

## How This Prepares The Andrey/Daniil Pilot

After Google OAuth QA passes and optional identity columns exist, the backend will be able to test real member visibility for Andrey and Daniil:

- tasks assigned to their owner label;
- tasks assigned to their email/user ID;
- tasks where they are collaborators;
- tasks created by them.

The pilot should still not start until real OAuth sign-in is tested and member filtering is enabled in a separate controlled stage.

## Limitations

- Real Google OAuth sign-in is still pending manual Client ID setup.
- Member filtering is not enabled by default.
- Legacy tasks without identity columns stay visible in safe/profile-only mode.
- Owner label matching depends on `Users.defaultOwnerLabel` quality.
- Slow create-task response remains performance debt.

## Next Recommended Stage

Recommended Stage 36:

```text
Live OAuth QA, optional task identity column migration, and controlled member visibility dry run.
```
