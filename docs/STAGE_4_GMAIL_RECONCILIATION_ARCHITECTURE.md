# Stage 4 — Gmail Reconciliation Architecture

## Goal

Stage 4 adds Gmail reconciliation logic to BA Fox.

The bot should help Lisa understand which tasks changed because of new email activity, who owes the next action, what the status should be, and what follow-up text should be sent.

The goal is not to auto-send emails or auto-change tasks without confirmation.

The goal is:

```text
Task → Gmail search → Latest thread status → Who owes action → Suggested status → Follow-up text → Lisa confirms → Sheet update
```

## Product principle

BA Fox should not behave like a passive inbox reader.

It should behave like an EA control layer:

- detect relevant email movement;
- connect emails to existing tasks;
- identify owner of next action;
- prevent tasks from dragging indefinitely;
- suggest owner-style status updates;
- prepare follow-up text;
- update Google Sheet only after Lisa confirms.

## Current inputs

### Google Sheet

Main source of tasks:

```text
BA Fox Control Center / Tasks
```

Expected task fields:

- task_id;
- date;
- category;
- organization;
- title;
- steps;
- source;
- priority;
- deadline;
- reminder_mode;
- status;
- next_reminder;
- result / comment;
- channel.

### Gmail

Current Gmail sources:

- central mailbox;
- `EA Thai` label;
- `EA Lao` label;
- future granular labels if created later.

Known current state:

- `EA Thai` contains forwarded Thai inbox messages.
- `EA Lao` exists but may currently be empty.
- granular labels like `EA / mfcorpthai`, `EA / mfcorplao`, `EA / promindspro` were not visible during first check.

## Reconciliation object

For every task, Stage 4 should produce a structured reconciliation result:

```json
{
  "task_id": "...",
  "organization": "...",
  "current_status": "...",
  "latest_email_date": "...",
  "latest_email_subject": "...",
  "latest_email_direction": "incoming | outgoing | none",
  "action_owner": "Lisa/team | counterparty | internal person | unknown",
  "recommended_status": "...",
  "recommended_comment": "...",
  "next_action": "...",
  "control_date": "...",
  "follow_up_draft": "...",
  "confidence": "high | medium | low"
}
```

## Gmail matching logic

### Search by organization

Use organization keywords first:

```text
Bitazza
Kasikorn / KBankLao
BCEL
Super Rich / Super Rich Exchange
P3 Estates / Cape Yamu
Niche / Andrew Hamilton
GLN
APEC
JDB
Shobana / India
PayConnect
```

### Search by task title keywords

If organization is missing or too generic, use title keywords.

Examples:

```text
PromptPay
Lao QR
KYB
corporate onboarding
account opening
virtual card
Cape Yamu
translation
US fee
```

### Search by labels

Preferred label filters:

```text
label:"EA Thai"
label:"EA Lao"
```

Use broad central search only when label search does not find relevant results.

## Direction detection

For each latest relevant thread/message:

- if latest message is from Lisa / MF mailbox → status may be waiting for external reply;
- if latest message is from counterparty → Lisa/team likely owes action;
- if latest message is internal forward → inspect the forwarded body to identify real action owner;
- if no fresh thread is found → treat as `Пуш` or `Alternative channel`, not as invisible waiting.

## Status recommendation rules

### В работе

Use when Lisa/team owns the next action.

Examples:

- Bitazza: documents need correction/submission.
- Kasikorn: package needs preparation/sending.
- Super Rich: offer not sent yet.

### Пуш

Use when the latest action was from Lisa/team and the counterparty owes reply.

Examples:

- BCEL after follow-up sent.
- P3 Estates after outreach sent.
- GLN after no response and new channel needed.

### Ждём ответ

Use only when there is a clear external dependency and a control date.

Do not use as a passive status without control.

Format:

```text
Ждём ответ до [date], затем [next action]
```

### Wait list

Use when Lisa does not currently own a direct operational action or the fact is already fixed.

Examples:

- JDB virtual card: vendor does not provide it.
- Flow: signing in Ministry of Justice.

### Выполнено / Закрыто управленчески

Use when the task is completed or a thread is intentionally closed.

Examples:

- Shobana: no answer, interaction closed.
- Vendor does not have requested product and this is accepted as final information.

### Блокер

Use when progress is blocked by money, access, external approval, technical issue, or missing resource.

Always show:

```text
blocker → action → next control date
```

## Telegram UX proposal

Add a new section under main bot flow:

```text
📬 Почта / сверка
```

Because main menu already has 6 buttons, this may live inside:

```text
📥 Отчёты → 📬 Сверить почту
```

or later replace/extend `📥 Отчёты` into:

```text
📥 Отчёты / Почта
```

Recommended first MVP: add inside `📥 Отчёты` as an inline button:

```text
📬 Сверить почту
```

## Telegram reconciliation flow MVP

1. Lisa clicks:

```text
📥 Отчёты → 📬 Сверить почту
```

2. Bot reads open tasks from Google Sheet.

3. Bot selects tasks with organizations / email-related statuses:

- `Пуш`;
- `Ждём ответ`;
- `В работе` with email/channel dependency;
- high priority tasks.

4. Bot returns short summary:

```text
📬 Gmail reconciliation

Проверено: 12 задач
Найдено свежих писем: 3
Требуют действия от нас: 2
Требуют пуша: 4
Можно закрыть: 1
```

5. Bot shows grouped result:

```text
🔥 Действие за нами
• Bitazza — новые требования KYB → срочно отправить документы
• Kasikorn — банк ждёт пакет документов → подготовить и отправить

📣 Пуш
• BCEL — последнее наше письмо 05.05 → follow-up до понедельника
• P3 — нет ответа → альтернативный канал

⏳ Wait list
• JDB virtual card — у них её нет, зафиксировано
```

6. For each item, bot can show actions:

```text
✅ Обновить статус
✉️ Показать follow-up
🔁 Оставить как есть
```

## Follow-up draft rules

Follow-up should be:

- short;
- professional;
- context-aware;
- ready to copy;
- no invented facts;
- no auto-send in MVP.

## Safety / confirmation rules

Never auto-send emails.

Never auto-update Google Sheet without Lisa confirmation.

Allowed auto-actions:

- read task rows;
- read/search Gmail metadata and email body snippets;
- draft suggested status/comment;
- draft follow-up text.

Confirmation required for:

- updating Google Sheet status;
- adding new tasks;
- closing tasks;
- sending emails;
- forwarding emails.

## Implementation steps

### Step 4.0 — Architecture

- Fix this document.
- Define status mapping.
- Define Telegram UX.
- Confirm with Lisa.

### Step 4.1 — Local service layer

Create service module:

```text
services/gmail_reconciliation.py
```

Functions:

```python
search_relevant_threads(task)
classify_latest_email(thread, task)
build_reconciliation_result(task, email_context)
build_follow_up_draft(result)
```

### Step 4.2 — Gmail access method

Decide implementation path:

Option A: Gmail API credentials inside local bot.

Option B: assistant-side Gmail checks first, bot only receives manually confirmed results.

Option C: hybrid: bot handles sheet/status UI, ChatGPT handles Gmail intelligence until production hosting.

Recommended MVP:

```text
Hybrid first: assistant-side Gmail reconciliation + bot sheet/status UI.
```

Reason: faster and safer, because Gmail access and auth inside local bot adds complexity.

### Step 4.3 — Telegram UI

Add inline button under reports:

```text
📬 Сверить почту
```

For MVP, this can first return:

```text
Пока сверка почты выполняется через ChatGPT. Пришли команду в setup-чате: “запусти Gmail reconciliation”.
```

Then later connect real Gmail API.

### Step 4.4 — Status update flow

Add optional reconciliation actions:

```text
status:update:{task_id}:{status}
status:comment:{task_id}
```

Only after Lisa confirms.

### Step 4.5 — Production path

Later move bot from local Terminal to hosting:

- Render;
- Railway;
- Fly.io;
- VPS;
- or other lightweight host.

This is needed so reminders and reconciliation do not depend on Lisa keeping Terminal open.

## Monday dependency

Before implementing Stage 4 fully, Monday QA must confirm:

```text
Tasks for 2026-05-18 appear correctly in Telegram dashboard.
```

If Monday QA passes, proceed with Stage 4.1.

If Monday QA fails, fix date/task filtering before adding Gmail reconciliation complexity.
