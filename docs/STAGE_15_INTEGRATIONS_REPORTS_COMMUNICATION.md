# Stage 15 — Integrations, Reports, Communication

Stage 15 keeps Stage 14 backend routes and write behavior intact. It adds EA FOX UI polish plus safe communication workflow placeholders.

## UI Changes

- Visible product branding is now `EA FOX`.
- The hero subtitle is: `Фокус, задачи и контроль — в одном рабочем центре.`
- The left workspace navigation is hidden by default and opens from the `Меню` button.
- The main content keeps counters and task routes, but no longer reserves a permanent left navigation column.

## Reports Flow

Reports are local previews only.

Implemented preview types:

- итог дня
- план дня
- weekly summary
- Telegram-ready version

The `Создать отчёт` action generates text from already loaded task data:

- completed/reportable tasks
- active tasks
- waiting and push tasks
- blockers
- focus tasks

Deferred:

- PDF generation
- automatic Telegram send
- automatic Sheets write
- saved report history

Any future send/save action must require explicit user confirmation and safe backend support.

## Gmail Reconciliation Placeholder

The `Почта` section exposes the intended workflow without connecting Gmail APIs or secrets.

Current copy:

`Сверка почты пока запускается через ChatGPT. После анализа можно обновить задачи и follow-up.`

Prepared future result shape:

- `actionOwner`
- `recommendedStatus`
- `nextAction`
- `followUpDraft`
- `confidence`

Deferred:

- Gmail API connection
- email sending
- label automation
- automatic task updates from email

## Telegram Plan

The `Telegram` section is a disabled planning surface.

Planned actions:

- open today tasks
- send report preview to Telegram
- push reminders
- task status sync

Deferred:

- Telegram backend route changes
- bot token/config changes
- automatic Telegram messages
- task sync writes

## Safety

- No secrets were added.
- No Apps Script routes were changed.
- No Telegram bot logic was changed.
- No Gmail integration was added.
- Create/edit/status writes still use existing safe routes.
- After writes, the frontend continues to refresh lightweight workspace data only.
- Completed, Reports, and Calendar still lazy-load completed data.

## Risks / Next Steps

- Add a confirmed Telegram send route only after message preview and audit behavior are defined.
- Add Gmail reconciliation via ChatGPT/connector first, then map results into `editTask` payloads.
- Add a report persistence route only if it can require `ACTION_TOKEN`, `SAFE_WRITE_MODE=true`, and AuditLog.
