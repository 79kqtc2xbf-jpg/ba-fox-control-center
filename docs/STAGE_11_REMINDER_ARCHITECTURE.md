# Stage 11 Reminder Architecture

## Goal

Define reminder behavior across BA Fox UI, Telegram, and future calendar channels without changing task status automatically.

## Source Of Truth

`Tasks.nextReminder` is the primary reminder date/time source.

`Tasks.deadline` remains the due-date signal.

## Queue

`NotificationQueue` should hold reminder send work:

- `queueId`
- `taskId`
- `channel`
- `scheduledAt`
- `payload`
- `status`
- `sentAt`
- `retryCount`
- `lastError`

## Channels

Initial and future channels:

- BA Fox UI
- Telegram
- Google Calendar later
- Gmail later only if truly useful

## Scheduler

Apps Script time trigger checks due reminders and queues/sends messages.

Suggested behavior:

```text
time trigger -> find due nextReminder -> create/send queue item -> mark sentAt
```

## Safe Behavior

- No duplicate sends for the same `taskId` + `scheduledAt` + `channel`.
- Track `sentAt`.
- Track `retryCount`.
- Keep `lastError` for failed sends.
- Do not change task status after reminder sends.
- Do not delete queue rows automatically in the first version.

## UI Behavior

BA Fox UI should show reminders from loaded task data:

- Today
- Tomorrow
- This week
- Later
- No date

Calendar tab remains a task grouping view until real Google Calendar sync is implemented.

## Stage 11.1+ Implementation Notes

- Add queue preview before send job.
- Add one channel at a time.
- Start with Telegram or UI reminders before calendar writes.
- Add AuditLog for scheduler-created queue entries and sent reminders.
