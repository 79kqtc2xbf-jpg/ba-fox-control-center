# BA Fox Control Center — Product Spec

## Working name

- Project: BA Fox Control Center
- Telegram bot: Executive Fox 🦊
- User: Lisa

## Core workflow

Lisa keeps her existing BA routine:

1. In the morning she reviews yesterday's plan.
2. She writes `#итоги #ba` with completed items.
3. She writes `#план #ba` for today.
4. ChatGPT converts the plan into structured tasks.
5. Tasks are stored in Google Sheets.
6. Telegram bot sends task cards and reminders.
7. Lisa updates status with buttons.
8. Evening report is generated in Lisa's usual style.
9. Lisa approves before anything is sent to a work chat.

## MVP principles

- ChatGPT is the brain.
- Telegram bot is the execution interface.
- Google Sheets is the source of truth.
- No ClickUp in MVP.
- GQueues is optional mirror only.
- No direct WhatsApp reading in MVP.
- All external sending requires Lisa's confirmation.

## Task categories

- 📄 Документация
- 💌 Письма
- 📞 Коммуникация
- 🤝 HR
- ⛔️ Wait list
- 🌈 Дополнительные задачи
- ❤️ Напоминания для Теодора

## Task statuses

- Не начато
- В работе
- Ждём ответ
- Пуш
- Выполнено
- Перенести

## Telegram task actions

- ✅ Выполнено
- 🟡 В работе
- ⏰ Напомнить позже
- 🔁 Перенести
- 💬 Комментарий

## Reminder mode

Combo mode:

- soft daily checkpoints;
- hard task-level reminders for important tasks;
- repeated prompts until task status changes or Lisa postpones.

## Meeting reports

Meeting reports should flow into a dedicated Google Drive folder when possible.

Supported sources later:

- Read AI reports from Gmail / Drive
- Gemini Google Meet notes from Google Docs / Drive
- Zoom summaries / recordings / transcripts

All extracted action items should be written to the `Meetings Inbox` tab first, then promoted to `Tasks` after review or automatic parsing.
