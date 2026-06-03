# Stage 11 Safe Edit And Completed Foundation

## Decision For This PR

Stage 11 keeps edit UI in read-only mode and does not add backend write routes.

Reason: existing production-safe routes (`createTask`, `taskAction`) are working and guarded. Adding `editTask` should be a separate Stage 11.1 backend PR with focused Apps Script review and deployment verification.

## Current UI Behavior

The `Редактировать` chip opens a read-only modal with:

- title
- organization
- next action
- deadline
- priority
- task id

The modal shows:

```text
Редактирование будет доступно после Stage 11.1 Safe Edit.
```

Future copy should be updated again when the backend route is implemented.

## Stage 11.1 editTask Route

Route:

```text
route=editTask
```

Required guards:

- require `ACTION_TOKEN`
- require `SAFE_WRITE_MODE=true`
- reject missing `taskId`
- update exactly one row by `taskId`
- append `AuditLog`
- no delete
- no archive
- no batch operations
- no arbitrary columns

Allowed fields:

- `title`
- `organization`
- `nextAction`
- `deadline`
- `priority`
- `taskType` or `category` only if the existing sheet schema supports the column

Validation:

- `title` cannot be blank if provided.
- `nextAction` cannot be blank if provided.
- unknown fields are rejected.
- no formula-like values in text fields.
- deadline must be blank or a safe date string.

AuditLog entry should include:

- timestamp
- actor/source
- route `editTask`
- taskId
- changed field names
- previous values if safe to log
- new values if safe to log
- result

## Apps Script Files Expected To Change In Stage 11.1

- `TaskService.gs`: implement allowlisted update by task id.
- `WebApi.gs`: validate route input and token guard.
- `WebApp.gs`: route dispatch for `editTask`.

## Frontend Stage 11.1 Changes

- Enable modal fields when `safeWritesEnabled()` is true.
- Submit only changed allowlisted fields.
- Show Russian validation errors.
- Refresh `fullDashboard` after success.
- Stay on current tab.
- Keep read-only fallback when safe write is disabled.

## Completed / Archive Foundation

Current completed tab uses loaded data only. It must not invent completed tasks.

If `fullDashboard` does not return completed rows, UI shows an empty state.

## Stage 11.1 Read-Only Completed Support

Optional read-only route extension:

```text
route=fullDashboard -> completed.tasks
```

Rules:

- read-only only
- return recent completed tasks, for example last 30 days or last 50 rows
- no archive writes
- no delete
- no permanent row removal
- include only safe display fields:
  - task id
  - title
  - organization
  - completedAt
  - final status
  - source
  - next action/history if available

Completed tab should render these rows with no write buttons.
