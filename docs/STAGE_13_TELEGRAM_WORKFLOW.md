# Stage 13 Telegram Workflow

## Purpose

Telegram should feed BA Fox Inbox, not Today directly.

## Inbox Flow

1. Lisa sends a fast note to Telegram.
2. Telegram creates a structured task draft.
3. BA Fox stores the task in Google Sheets with source `Telegram`.
4. The task appears in Inbox for triage.
5. Lisa assigns category, next action, and control date before it enters workflow sections.

## Fast-Add Flow

Recommended first syntax:

```text
/task title | company | next action | control date
```

If fields are missing, create the task as Inbox-only and require triage in BA Fox.

## Reminder Flow

Telegram reminders should map to the same control-date concept used by BA Fox:

- Tomorrow
- +3 days
- +7 days
- +14 days
- Pick date
- No control date

Until a first-class `controlDate` backend field exists, Telegram can map reminders to the existing reminder/control field used by BA Fox.

## Task Update Flow

Telegram updates should use the same safe edit concept as BA Fox Web:

- taskId required
- allowed fields only
- ACTION_TOKEN required
- SAFE_WRITE_MODE required
- AuditLog entry required

Telegram must not introduce delete, archive, arbitrary column edit, or batch operations.

## Not In Scope Yet

- Telegram bot implementation
- webhook hosting
- production token setup
- task creation from voice notes
- automatic Gmail or ChatGPT intake
