# Stage 11 Telegram Integration Plan

## Goal

Prepare Telegram as a fast Executive Fox task intake and reminder channel without exposing secrets or adding an unsafe public write surface.

This stage is architecture only. Bot token handling and production send jobs stay out of scope until a guarded implementation stage.

## Bot Commands

- `/add` creates a new task from a structured or natural-language message.
- `/today` returns today's active BA Fox tasks.
- `/push` returns tasks that need follow-up.
- `/wait` returns waiting tasks.
- `/done` marks one task done only after a clear task id or selected task is provided.
- `/report` returns the daily Executive Fox report draft.

## Fast-Add Flow

User message:

```text
Добавь задачу: написать Chanda по встрече завтра
```

Expected parsing:

```json
{
  "title": "Написать Chanda по встрече",
  "organization": "Chanda",
  "nextAction": "Написать Chanda по встрече",
  "deadline": "tomorrow",
  "source": "Telegram"
}
```

If title and next action are clear, the bot can call `route=createTask` without extra confirmation.

## Clarification Flow

If the message misses a required field, the bot asks one short question:

- Missing title: "Как назвать задачу?"
- Missing next action: "Какое следующее действие?"

The bot should avoid multi-question forms in chat. One clarification, then create if safe.

## Safe Write Model

Telegram write path:

```text
Telegram user -> Telegram bot webhook/job -> Apps Script route=createTask -> Tasks sheet -> AuditLog
```

Required guards:

- `ACTION_TOKEN` or a separate `TELEGRAM_ACTION_TOKEN`.
- `SAFE_WRITE_MODE=true`.
- Telegram user id allowlist.
- Only allow existing safe routes first: `createTask`, approved `taskAction` actions.
- No arbitrary edit endpoint.
- No delete route.

Every successful write appends an `AuditLog` entry with channel `Telegram`.

## Reminder Messages

Reminder send path:

```text
Tasks.nextReminder -> NotificationQueue -> Telegram send job -> sentAt / retryCount
```

Rules:

- Send only queued reminders.
- Mark each queue item with `sentAt`.
- Increment `retryCount` on failure.
- Do not change task status after sending a reminder.

## Security

- Store bot tokens only in Apps Script Properties or another approved secret store.
- Never commit bot tokens.
- Allowlist Telegram user IDs.
- Reject writes from unknown users.
- Do not expose public write endpoints without token checks.
- Do not support arbitrary edit, archive, or delete through Telegram in the first version.

## Stage 11.1 Implementation Notes

- Add a small parser for Telegram messages.
- Add a webhook or polling runner depending on deployment constraints.
- Reuse `createTask` validation and audit logging.
- Add read-only `/today`, `/push`, `/wait` before enabling write commands.
