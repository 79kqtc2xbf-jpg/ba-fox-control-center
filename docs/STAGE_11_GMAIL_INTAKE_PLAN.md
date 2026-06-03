# Stage 11 Gmail Intake Plan

## Goal

Prepare Gmail as a task candidate source without automatic writes from email.

Stage 11 does not create Gmail tasks automatically.

## Labels

Recommended Gmail labels:

- `BA Fox`
- `BA Fox/Task`
- `BA Fox/Waiting`

## Future Intake Flow

```text
Starred/labeled email -> task candidate -> user confirms in BA Fox or Telegram -> route=createTask
```

First version should require user action before writing to Tasks.

## Extracted Fields

Task candidates may include:

- sender
- subject
- snippet
- obvious due date
- organization guess
- next action suggestion
- Gmail message id or thread id

Suggested task shape:

```json
{
  "title": "Reply to [sender/subject]",
  "organization": "",
  "nextAction": "",
  "deadline": "",
  "source": "Gmail",
  "sourceRef": "gmail-thread-id"
}
```

## Confirmation Rules

- No automatic write from Gmail in the first version.
- BA Fox should show candidates as drafts.
- User chooses "Создать задачу" or dismisses the candidate.
- Waiting tasks can be suggested from sent emails, but should not be created automatically.

## Privacy And Security

- Store only the minimum needed email metadata in Tasks.
- Avoid copying long email bodies into Google Sheets.
- Do not expose Gmail content in public logs.
- Do not send Gmail snippets to unapproved external services.
- Keep OAuth scopes narrow and documented.

## Stage 11.1+ Implementation Notes

- Start with read-only candidate preview.
- Add explicit create action that reuses `route=createTask`.
- Add `AuditLog` entries for created tasks with source `Gmail`.
- Add Gmail thread link only if safe for the workspace.
