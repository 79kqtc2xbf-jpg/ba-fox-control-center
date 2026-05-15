# BA Fox — Stage 1 Summary

## Chat title

Recommended title for the completed chat:

**BA Fox — Этап 1: Telegram-бот, задачи, Google Sheets и почта**

## Current state

Stage 1 produced a working MVP for Executive Fox / BA Fox Control Center.

Core flow:

```text
Google Sheets ↔ Telegram Bot ↔ ChatGPT/Gmail analysis
```

## Working components

### Telegram bot

Bot: `@ba_executive_fox_bot` / **Executive Fox 🦊**

Working:

- local launch on Mac with `python -m bot.main`;
- `/start`;
- main menu buttons;
- today dashboard;
- category buttons;
- task cards;
- status updates into Google Sheets;
- free-text task creation with preview and confirmation.

### Google Sheets

Main Google Sheet: **BA Fox Control Center**

Working:

- reading rows from `Tasks`;
- updating status;
- appending manual tasks;
- storing daily reports.

### Dashboard logic

Approved logic to preserve:

- Today view is a dashboard, not a long list.
- Top blocks: `🔥 Фокус`, `⚠️ Срочно сегодня`, `📣 Пуш`.
- Tasks with status `Пуш` appear only in `📣 Пуш`.
- Push tasks must not duplicate in Focus or Urgent.
- Main navigation is category buttons with counts.

Dashboard categories:

```text
📄 Документы
💌 Почта/пуш
📞 Коммуникация
⏳ Ждём/контроль
🌈 Доп
🤝 HR
❤️ Теодор
🗂 Все
```

### Main Telegram menu

Latest intended layout:

```text
🗓 Задачи на сегодня   ➕ Добавить задачу
📝 Собрать итоги       ✅ Выполненные
⏰ Напоминания         ⚙️ Настройки
📥 Отчёты встреч
```

If Telegram still shows old keyboard:

```text
Ctrl + C
GitHub Desktop → Fetch origin → Pull origin
python -m bot.main
/start
```

### Add task flow

Approved UX:

```text
➕ Добавить задачу
→ Lisa writes task in natural language
→ bot parses it
→ preview with category / organization / priority / deadline / status / steps
→ buttons: ✅ Добавить в таблицу / ✏️ Написать заново / ❌ Отмена
→ on confirmation, append task to Google Sheet
```

Important: user must not be forced into a strict format.

Current parser is rule-based. Future improvement: replace/add LLM parsing.

## Gmail setup

Central inbox for analysis: `liza.ba@mfstream.io`.

Active forwarded source inboxes for Stage 1:

- Thai company inbox
- Lao company inbox

Forwarding was confirmed and tested from an external sender. Messages stay visible in source inboxes and also arrive in the central inbox.

Central Gmail labels:

```text
EA Thai
EA Lao
```

Filters created manually:

```text
to:<thai-source-inbox> → EA Thai
to:<lao-source-inbox> → EA Lao
```

Important Gmail note: testing forwarding from the central inbox to a source inbox may not forward back because Gmail may prevent forwarding loops. Test from a third/external mailbox.

## First email reconciliation findings

Initial manual Gmail/task check found:

- Bitazza: fresh KYB/additional requirements thread; keep in Focus.
- BCEL: no visible response after Lisa’s Lao QR / BCEL Pay message; keep as Push.
- P3 Estates / Cape Yamu: no visible incoming reply after outreach; set/keep Push.
- GLN: no visible reply after PromptPay outreach; Push / new channel.
- APEC / Andrey: chain exists; needs internal push/control.
- JDB: no fresh thread found in broad search; needs exact contact/topic search.

## GitHub issue

Issue #1 preserves approved logic and next work:

**Preserve EA Fox dashboard logic and add Gmail task reconciliation**

Use it as an additional source of project memory.

## Next priorities

1. Confirm the last local keyboard UI patch is pulled and visible in Telegram.
2. Build daily email reconciliation:
   - read today’s tasks;
   - search Gmail and labels;
   - identify latest email status;
   - decide who owes whom a reply;
   - recommend task status updates;
   - draft follow-up text;
   - update Google Sheet after confirmation.
3. Improve free-text task parsing with smarter AI/LLM logic.
4. Implement scheduled reminders.
5. Implement meeting reports intake for Read AI / Gemini.

## New chat prompt

```text
Продолжаем проект BA Fox / Executive Fox после Этапа 1.
Используй docs/STAGE_1_SUMMARY.md и GitHub issue #1 как источник состояния.

Контекст:
- Telegram bot @ba_executive_fox_bot создан и работает локально;
- Google Sheet BA Fox Control Center подключён;
- задачи читаются и обновляются через Telegram;
- дашборд работает через категории-кнопки;
- пуши не дублируются в фокусе;
- кнопка ➕ Добавить задачу работает через свободный текст, предпросмотр и подтверждение;
- Gmail forwarding настроен для Thai/Lao inboxes в центральную почту;
- ярлыки EA Thai / EA Lao созданы;
- следующий фокус: анализ почты, сверка с задачами, обновление статусов и тексты follow-up.

Формат ответов:
1. Что сделала
2. Идеи и предложения, что сделать
3. Вопросы ко мне, если есть
4. От меня: подтверждение в формате “окей” и мои предложения

Работай как “я твои руки”: давай пошаговые действия для Mac/iPhone/Telegram/Gmail/GitHub, не перегружай и фиксируй важные решения в репозитории.
```
