# Stage 13 Information Architecture

## New Workspace Model

BA Fox is organized around Executive Assistant workflow queues:

- Inbox
- Focus
- Today
- Documents
- Communication
- Presentations
- Brokers
- Waiting / Reminders
- All Tasks
- Completed
- Calendar
- Reports
- System

The left sidebar is the primary navigation. The top header is secondary context and safe-write status.

## Queue Rules

### Inbox

Inbox is triage. New or incomplete tasks appear here first and should not pollute Today.

Signals:

- source from BA Fox Web, Telegram, ChatGPT, or Gmail
- missing category
- missing usable next action
- no current Today/control-date signal

### Focus

Focus is capped at 5 visible tasks.

Signals:

- overdue
- due/control date today
- high priority
- blocker
- push
- manually marked focus in current UI session

### Today

Today is not an active-task dump.

It only includes:

- overdue
- deadline today
- control date today
- reminder today

### Sections

Documents, Communication, Presentations, Brokers, and Waiting group tasks internally:

- Urgent
- In Progress
- Waiting
- Pushes
- Blockers
- Needs Review

### Completed

Completed is archive/history for reporting and memory.

Cancelled, Duplicate, and Not Relevant are final statuses but not reportable done work.

### Reports

Reports generate a structured local preview:

- Done
- In Progress
- Waiting
- Blockers
- Tomorrow Focus

No PDF generation or writeback is included in Stage 13.

## Backend Compatibility

Stage 13 does not change Apps Script routes or Google Sheets schema.

`controlDate` is treated as a first-class frontend concept. Until the backend has a dedicated field, BA Fox derives it from existing `controlDate`-like properties or `nextReminder`.
