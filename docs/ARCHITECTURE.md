# Architecture

## MVP architecture

```text
ChatGPT
  ↓ writes structured tasks
Google Sheets = source of truth
  ↑↓
Telegram Bot = Lisa's task interface
  ↓
Lisa taps buttons and receives reminders
```

## Components

### ChatGPT

- Parses Lisa's morning plan.
- Searches Gmail / Drive / Zoom when needed.
- Writes or prepares rows for Google Sheets.
- Builds evening `#итоги #ba`.

### Google Sheets

- Stores tasks, statuses, comments, reminders, and generated reports.
- Remains the system source of truth for MVP.

### Telegram bot

- Reads today's tasks from Google Sheets.
- Sends task cards.
- Updates status based on button callbacks.
- Sends reminder prompts.
- Shows daily summary draft.

### Future integrations

- Read AI reports via Gmail/Drive.
- Gemini meeting notes via Google Drive folder.
- Zoom meeting assets via connected Zoom.
- GQueues optional mirror via email-to-task.
- ClickUp optional later if Google Sheets becomes too limited.

## Data flow: task update

```text
Lisa taps ✅ Выполнено
  ↓
Telegram callback handler receives task ID
  ↓
Google Sheets row status = Выполнено
  ↓
Task disappears from active reminder queue
```

## Data flow: evening report

```text
Bot reads today's task rows
  ↓
Groups by category and status
  ↓
Builds draft report
  ↓
Sends to Lisa for review
  ↓
Lisa confirms manually before work-chat send
```
