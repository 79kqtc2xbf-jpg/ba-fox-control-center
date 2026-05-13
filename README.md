# BA Fox Control Center 🦊

Personal Executive Assistant task-control system for Lisa.

## Purpose

BA Fox Control Center turns Lisa's daily Telegram-style BA workflow into a controlled task system:

1. Lisa sends daily `#итоги #ba` and `#план #ba` to ChatGPT.
2. ChatGPT parses the plan into structured tasks.
3. Tasks are stored in Google Sheets.
4. Telegram bot sends task cards with buttons.
5. Lisa updates task status by tapping buttons.
6. Evening summary is generated for review.
7. After Lisa confirms, the final text can be copied or later sent to a work chat.

## MVP stack

- Python
- aiogram 3.x
- Google Sheets as task database
- APScheduler for reminders
- Google Drive/Gmail/Zoom/Read AI/Gemini integration later

## Current Google Sheet

BA Fox Control Center:
https://docs.google.com/spreadsheets/d/1TJjQ0Uc_olOxL8kGW3tmd-e2wCfRoPkxbOEDOBs60F4/edit

## MVP scope

### Included

- Telegram bot main menu
- Task list for today
- Task cards with inline buttons
- Status updates: done, in progress, remind later, postpone
- Google Sheets storage
- Daily report builder
- Reminder scheduler skeleton

### Not included yet

- Direct WhatsApp reading
- Direct work-chat sending without Lisa confirmation
- Full Read AI/Gemini/Zoom automation
- ClickUp integration

## Security

Never commit real tokens, API keys, Google service account credentials, Telegram bot tokens, OpenAI keys, or personal data.

Use `.env` locally or hosting environment variables.
