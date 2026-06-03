# Stage 11.1 Task Intake Options

## Goal

Keep Google Sheets as the source of truth while giving Lisa several safe ways to add tasks over time.

## Short Term: BA Fox UI

Current production-safe intake:

- Use `+ Новая задача` in BA Fox.
- Required fields: title and next action.
- Optional fields: organization and deadline.
- Route: `createTask`.
- Guards: `ACTION_TOKEN`, `SAFE_WRITE_MODE=true`, allowed fields only, AuditLog.

This remains the primary supported task intake path for Stage 11.1.

## Next: Telegram Fast-Add

Planned flow:

```text
Добавь задачу: написать Chanda по встрече завтра
```

Telegram bot parses:

- title
- organization if obvious
- nextAction
- deadline if obvious

If title and next action are clear, the bot can call `createTask`. If not, it asks one short clarification question.

Safety:

- allowlisted Telegram user ids
- `ACTION_TOKEN` or separate `TELEGRAM_ACTION_TOKEN`
- no arbitrary edit
- no delete
- AuditLog source `Telegram`

## Later: ChatGPT Task Intake

ChatGPT can prepare structured task JSON:

```json
{
  "title": "",
  "organization": "",
  "nextAction": "",
  "deadline": "",
  "priority": "",
  "category": "",
  "source": "ChatGPT"
}
```

First version should be review-first:

- Lisa asks ChatGPT to structure tasks.
- Lisa reviews the JSON or pasted draft.
- BA Fox creates tasks through guarded `createTask`.

Future connector/API calls must keep `ACTION_TOKEN`, `SAFE_WRITE_MODE=true`, allowed fields, and AuditLog.

## Later: Gmail Labeled Emails

Planned flow:

```text
Gmail label BA Fox/Task -> task candidate -> user confirms -> createTask
```

Gmail should not write tasks automatically in the first version.

Candidate extraction:

- sender
- subject
- snippet
- due date if obvious
- suggested next action
- Gmail thread id

Privacy:

- do not copy full email bodies by default
- keep OAuth scopes narrow
- do not expose email content in public logs

## Recommended Order

1. Keep BA Fox UI create as the stable path.
2. Add Telegram read-only commands.
3. Add Telegram fast-add with allowlisted users.
4. Add ChatGPT structured JSON intake.
5. Add Gmail task candidates with explicit user confirmation.
