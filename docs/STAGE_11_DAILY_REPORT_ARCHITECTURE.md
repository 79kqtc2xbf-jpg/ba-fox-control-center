# Stage 11 Daily Report Architecture

## Goal

Prepare a future daily report button that produces a concise Executive Fox status summary from BA Fox tasks.

No report write/send action is implemented in Stage 11.

## Report Sections

Daily report should include:

- Done today
- In progress
- Waiting
- Pushes
- Blockers
- New tasks
- Overdue
- Tomorrow focus

## Executive Fox Format

```text
✅ Сделано

🔄 В работе

⏳ Ожидания

⚠️ Блокеры

🎯 Фокус
```

## Data Sources

Use loaded `fullDashboard` data first:

- `today.tasks`
- `open.tasks`
- `pushes.tasks`
- completed/recent completed tasks if available

Future read-only backend support may add recent completed tasks.

## Rules

- Do not invent completed tasks if they are not loaded.
- Show a clear empty state when completed data is unavailable.
- Do not send the report automatically in the first version.
- Report generation should be read-only until a later send/share stage.

## Future Button Behavior

Button label:

```text
Собрать отчёт
```

First action:

```text
Render report preview in BA Fox UI
```

Later actions:

- Copy to clipboard.
- Send to Telegram.
- Save to Reports sheet.

Each send/save action should append `AuditLog`.

## Stage 11.1+ Implementation Notes

- Build report preview from current client-side data.
- Add read-only completed task support before claiming "Done today".
- Add send channels only after reminder and Telegram foundations are safe.
