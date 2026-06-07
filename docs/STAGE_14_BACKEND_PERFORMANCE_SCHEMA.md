# Stage 14 — Backend Performance + Schema Support

Stage 14 keeps the Stage 13 workspace UI intact and reduces the expensive reads around daily work.

## What Changed

- `dashboard` is now the lightweight workspace payload:
  - `scaffoldInfo`
  - `inbox`
  - `focus`
  - `today`
  - `open`
  - `pushes`
- `workspaceDashboard` is added as an explicit lightweight alias for the same payload.
- `fullDashboard` remains backward-compatible and still includes `completed` and `cleanupAudit`.
- `completed` and `cleanupAudit` stay separate read routes for lazy loading.
- Frontend create/edit/status/focus actions refresh the lightweight `dashboard`, not `fullDashboard`.

## New Lightweight Routes

- `route=inbox`
- `route=focus`
- `route=today`
- `route=open`
- `route=pushes`
- `route=completed`
- `route=cleanupAudit`
- `route=workspaceDashboard`

Write routes remain unchanged and cache-bypassed:

- `taskAction`
- `createTask`
- `editTask`

## Schema Support

`controlDate` and `focus` are supported as optional schema fields.

The backend reads these headers if they exist in `Tasks`:

- `controlDate`, `control_date`, `Control Date`, `Контрольная дата`, `Дата контроля`
- `focus`, `isFocus`, `manualFocus`, `Focus`, `Фокус`

No automatic column migration is performed in this stage.

If the `controlDate` column is missing, `editTask` persists the control date through the existing `NEXT_REMINDER` fallback so Stage 13 behavior keeps working. If the `focus` column is missing, the backend reports it in `skippedFields`; the frontend still preserves local focus behavior for the current session.

## Today Logic

Backend `today` now matches the Stage 13 reduced Today model:

- overdue deadline/control date
- deadline today
- control date today
- reminder today

It no longer returns every active task.

## Performance Decisions

- Initial app load uses lightweight `dashboard`.
- Completed tasks are loaded only when `Completed`, `Reports`, or `Calendar` need them.
- Cleanup audit is loaded only from its dedicated route.
- `fullDashboard` remains available for older clients and deployment verification, but it is no longer used after simple writes.

## Risks / Follow-Up

- Add real `controlDate` and `focus` columns to `Tasks` during a controlled schema migration.
- Add backend counters if Google Sheets read time remains high after lightweight routes are deployed.
- Review whether `completed` should be paginated beyond the current safe limit.
- Measure Apps Script execution time after deployment with production row counts.
