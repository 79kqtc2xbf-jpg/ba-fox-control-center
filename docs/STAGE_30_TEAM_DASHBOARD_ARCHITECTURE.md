# Stage 30 — Team Dashboard Architecture Overhaul

## Purpose

Stage 30 prepares BA Fox Control Center for a future team pilot by making the dashboard answer management questions before external employee testing resumes.

The 2-user pilot with Andrey and Daniil remains paused. This stage does not add Google login, real user accounts, Telegram changes, secrets, destructive logic, or a new Google Sheet schema.

## What Changed

- `Обзор` now uses live loaded tasks instead of static MF demo task metrics.
- Overview metrics now show:
  - `Активные задачи`
  - `Просрочено`
  - `Блокеры`
  - `Ждут ответа`
  - `Без ответственного`
  - `Без отдела / направления`
  - `Выполнено`
- `Кто чем занят` now shows workload by responsible person:
  - `Лиза`
  - `Андрей`
  - `Даниил`
  - `Не назначено`
- Each owner block shows active tasks, blockers, waiting tasks, overdue tasks, and the latest/most urgent 3 tasks.
- `Отделы / направления` now groups active work by a temporary direction model.
- `Риски и зависшие` now shows:
  - overdue tasks
  - blockers
  - waiting tasks
  - tasks without owner
  - tasks without department/direction
  - tasks without next action
  - tasks without control date/deadline
- `Все задачи` keeps existing filters and adds a direction filter:
  - `Все отделы`
  - `Руководство`
  - `Операции`
  - `Финансы / платежи`
  - `Юридическое / compliance`
  - `Продажи / партнёры`
  - `Маркетинг / презентации`
  - `Продукт / IT`
  - `Админ / EA`
  - `Не назначено`
- Task cards show owner, direction, status, control date/deadline, next action, and contact.

## What The Dashboard Now Answers

1. Who is responsible for what?
2. Who has how many active tasks?
3. Which tasks are urgent, overdue, blocked, or waiting?
4. Which departments or directions have active work?
5. Which tasks have no owner or no department/direction?
6. What should Liza look at first?

## Department / Direction Model

Stage 30 uses a temporary direction model in frontend constants.

Visible labels:

| Direction | Notes |
| --- | --- |
| `Руководство` | Management and executive decisions. |
| `Операции` | Operational control and daily execution. |
| `Финансы / платежи` | Banks, payments, financial flows. |
| `Юридическое / compliance` | Legal, contracts, KYC/KYB, compliance. |
| `Продажи / партнёры` | Brokers, partners, sales follow-up. |
| `Маркетинг / презентации` | Decks, offers, presentation materials. |
| `Продукт / IT` | Product, web app, technical or QA work. |
| `Админ / EA` | EA/admin work, reporting, reminders. |
| `Не назначено` | Existing blank category/direction values. |

These are not final company departments. They are a dashboard grouping model that can be renamed later.

## Data Model Decision

No new Google Sheet column was added.

The app reuses the existing `Категория` / `category` value as a temporary dashboard direction and displays it as `Отдел / направление`.

Reason:

- The live task creation flow already writes `category`.
- Existing tasks already carry category-like data.
- Blank values can safely display as `Не назначено`.
- Adding a persisted department column before the team model is final would create schema churn.

Compatibility:

- Existing Owner column is still used for responsible person.
- Existing createTask payload shape is unchanged.
- Apps Script write behavior is unchanged.
- Google Sheet schema is unchanged.
- Existing blank direction/category values remain visible as `Не назначено`.

## Current Limitations

- Directions are inferred from existing category text and keyword aliases, not from a final company org chart.
- The direction model is frontend-only in this stage.
- There is no Google login.
- There are no real user accounts or permissions.
- Owner names are still task field values, not authenticated identities.
- Persistent profile/color per account is not implemented.
- Telegram bot views are not aligned with the team dashboard yet.
- Final sheet views and final management reporting views are not designed yet.

## What Still Blocks A Real Team Pilot

- Google login.
- Real user accounts.
- Persistent profile/color per account.
- Telegram bot alignment.
- Final users/permissions model.
- Final Google Sheet views.
- Final department/direction naming decision.
- A short internal Liza-only QA pass on the new dashboard logic.

## Pilot Readiness Decision

Stage 30 improves team-readiness, but it does not unblock external employee testing by itself.

Recommended decision:

```text
No-go for external employee pilot until identity, permissions, and final team model are approved.
Go for Liza-only dashboard QA.
```

## Redeploy Notes

Apps Script redeploy is not required for this stage if only frontend/docs changes are merged.

Frontend hosting must be redeployed or refreshed through the normal web deployment path for users to see the new dashboard UI.
