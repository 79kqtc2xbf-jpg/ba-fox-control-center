# GQueues integration notes

## Decision summary

GQueues is useful as an optional personal task UI for Lisa, but it should not be the main technical source of truth for BA Fox MVP.

Reason: GQueues currently does not expose a public API, so the Telegram bot cannot reliably create/update/complete/read tasks directly through an official API.

## Possible integration paths

### 1. Email tasks to a queue

GQueues supports creating tasks by sending emails to unique queue email addresses.

- Email subject becomes task name.
- Email body becomes task notes.
- Quick Add syntax can set date, time, duration, reminders, tags, and assignments.

Possible use:

BA Fox creates a task in Google Sheets and also sends an email to Lisa's GQueues queue address.

Limitations:

- One-way creation only.
- Completion status in GQueues does not automatically return to BA Fox.
- Queue email address must be stored securely as configuration.

### 2. Google Calendar sync

GQueues supports two-way Google Calendar sync. Tasks with dates can appear in Google Calendar.

Possible use:

- Use GQueues/Calendar for visual time blocking.
- BA Fox can inspect Google Calendar events separately.

Limitations:

- Calendar events are not a reliable full task database.
- Task completion and Telegram button states should still live in Google Sheets.

### 3. Google Workspace Add-on

GQueues has a Google Workspace Add-on for Gmail, Calendar, and Drive.

Possible use:

- Lisa can turn emails into GQueues tasks from Gmail.
- Lisa can link Gmail/Drive content to tasks.

Limitations:

- Manual user action.
- Not a bot-level API integration.

## Recommended BA Fox MVP choice

Keep Google Sheets as the source of truth.

Telegram bot buttons update Google Sheets.

GQueues can be optional:

- mirror important tasks into GQueues via email-to-queue;
- use GQueues for personal visual task management;
- do not rely on it for automation state.

## Proposed environment variables

```env
GQUEUES_ENABLED=false
GQUEUES_INBOX_EMAIL=
GQUEUES_BA_QUEUE_EMAIL=
```

## Future module

`services/gqueues_email.py`

Responsibilities:

- build email subject using Quick Add syntax;
- send task email via Gmail/SMTP;
- include steps in email body;
- include BA Fox task ID for traceability.
