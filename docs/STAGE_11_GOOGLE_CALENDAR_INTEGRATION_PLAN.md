# Stage 11 Google Calendar Integration Plan

## Goal

Prepare a future reminder/calendar bridge while keeping Google Sheets as the source of truth.

Calendar sync is not automatic in Stage 11.

## Future Flow

```text
Tasks.deadline / Tasks.nextReminder -> calendar sync job -> Google Calendar event/reminder
```

The first implementation should create events only. It should not delete calendar events.

## Safe Fields

Only these task fields should be used for calendar event creation:

- `taskId`
- `title`
- `deadline`
- `nextReminder`
- `organization`

Optional future storage:

- `calendarEventId`
- `calendarSyncedAt`
- `calendarSyncStatus`

Store `calendarEventId` in the sheet only after event creation succeeds.

## Event Format

Calendar event title:

```text
BA Fox: [task title]
```

Suggested description:

```text
Organization: [organization]
Task ID: [taskId]
Source: BA Fox
```

## Sync Rules Needed

- Deadline and reminder may create different calendar artifacts.
- If both fields exist, prefer `nextReminder` for reminder timing and keep `deadline` in description.
- Do not create duplicate events for the same `taskId`.
- If `calendarEventId` exists, first version should skip or report conflict rather than update/delete.
- Manual calendar changes should not overwrite the sheet.

## Conflict Handling

Before enabling writes, define:

- What happens when a task deadline changes after event creation.
- Whether BA Fox updates existing events or creates a new event.
- How to handle missing `calendarEventId`.
- How to surface sync errors in BA Fox UI.

## Stage 11.1+ Implementation Notes

- Add read-only preview in Calendar tab before write sync.
- Add `calendarEventId` only through a guarded route.
- Require `SAFE_WRITE_MODE=true` for any sheet write.
- Append `AuditLog` for calendar event creation metadata.
