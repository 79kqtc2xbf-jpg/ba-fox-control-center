# BA Fox / Executive Fox — Project Map

## Purpose

This document is the current map of the BA Fox / Executive Fox project.

It shows:

- what has already been built;
- what works now;
- what is pending;
- what rules are approved;
- what stages are next;
- what is blocked until Monday QA.

## Current project role

BA Fox / Executive Fox is Lisa's EA operating system.

It connects:

```text
ChatGPT → thinking / analysis / reporting / Gmail reconciliation
Telegram bot → task UI / dashboard / quick status control
Google Sheet → source of truth / task database
Gmail → inbox context / partner follow-up / reconciliation source
GitHub → project memory / technical documentation / stage tracking
```

## Source of truth

Main sources:

```text
Google Sheet: BA Fox Control Center / Tasks
GitHub repo: 79kqtc2xbf-jpg/ba-fox-control-center
GitHub issue #1: operational stage tracking
```

Key docs:

```text
docs/STAGE_1_SUMMARY.md
docs/REPORTING_STANDARD.md
docs/WEEKLY_REPORTING_STANDARD.md
docs/REPORTS_CHAT_RULES.md
docs/REPORTS_CHAT_PROMPT.md
docs/REMINDER_RULES.md
docs/SETUP_CHAT_RESPONSE_RULES.md
docs/STAGE_4_GMAIL_RECONCILIATION_ARCHITECTURE.md
docs/PROJECT_MAP.md
```

## Chat separation

### Setup / automation chat

Recommended title:

```text
BA Fox — Setup & Automation / Control Center
```

Purpose:

- bot setup;
- Google Sheets logic;
- Gmail reconciliation architecture;
- reminders;
- GitHub memory;
- integration planning;
- technical QA;
- deployment planning.

Approved response format in this chat:

```text
1) что сделал
2) предложение
3) этап из плана
4) подтверждение от меня в формате окей
```

### Reports chat

Recommended title:

```text
BA Fox — EA Reports / День и Неделя
```

Purpose:

- daily EA reports;
- weekly EA reports;
- raw notes;
- plans;
- final reports for Theodor / team;
- owner-style rewriting.

## Approved reporting principles

Daily reports use:

```text
✅ DONE / финализация
🔄 В работе / под контролем
⚠️ Блокеры / управление рисками
⏳ Wait list / зафиксировано
🎯 Фокус
```

Weekly reports use:

```text
📌 Executive summary
✅ Закрыто / финализировано
🔄 Продвинуто / под контролем
⚠️ Блокеры / управление рисками
⏳ Wait list / внешние зависимости
📂 По направлениям
🎯 Фокус следующей недели
🧩 Нужно решение / ресурс
```

Core reporting rule:

```text
result → status → next action → deadline / control point
```

Reports should not sound like tasks are dragging.

Weak standalone wording to avoid:

```text
жду
в процессе
попробую
пинговала
делала
занималась
нет ответа
не успела
```

## Reminder rules

Approved rule:

```text
Рабочие — только будние.
Личные — каждый день.
Часовой пояс — Bangkok / Asia/Bangkok.
```

Work reminders:

```text
Monday–Friday, 10:00 Asia/Bangkok
```

Personal reminders:

```text
Daily, 14:00 Asia/Bangkok
```

Work and personal tasks must stay visually and logically separate.

## Stage status

## Stage 1 — Foundation / Telegram MVP

Status:

```text
Complete
```

Built:

- Telegram bot `@ba_executive_fox_bot`;
- Google Sheet connection;
- task reading from Google Sheet;
- Telegram dashboard;
- category buttons;
- task status buttons;
- free-text task creation;
- preview and confirmation flow;
- Gmail forwarding setup for Thai/Lao inboxes;
- labels `EA Thai` and `EA Lao`.

## Stage 2 — Gmail reconciliation v1 / manual hybrid check

Status:

```text
Complete enough for MVP / manually tested
```

Done:

- Gmail was checked manually through ChatGPT;
- relevant tasks were reconciled with email status;
- confirmed updates were applied to Google Sheet;
- follow-up texts were drafted;
- PayConnect was identified but not activated because Lisa did not recognize the context.

Key status decisions:

- Bitazza → urgent / in progress;
- Kasikorn → urgent / in progress;
- BCEL → push until Monday;
- P3 → push / alternative channel;
- GLN → push / alternative channel;
- APEC → push / remind Andrey;
- Shobana → completed / interaction closed;
- JDB virtual card → wait list / vendor does not provide it;
- Super Rich → offer not sent yet.

## Stage 3 — Telegram bot QA

Status:

```text
Functionally passed, pending Monday task rollover QA
```

Confirmed working:

- local bot startup;
- Telegram API connectivity after network/VPN fix;
- `/start`;
- `/myid`;
- `🗓 Задачи на сегодня`;
- `➕ Добавить задачу`;
- free-text task preview;
- user-entered free task text is removed after preview generation;
- main menu works with 6 buttons;
- `📝 Собрать итоги` moved into `📥 Отчёты`.

Current main menu:

```text
🗓 Задачи на сегодня | ➕ Добавить задачу
✅ Выполненные       | ⏰ Напоминания
📥 Отчёты            | ⚙️ Настройки
```

Inside `📥 Отчёты`:

```text
📝 Собрать итоги
📥 Отчёты встреч
```

Pending:

```text
Monday QA — verify tasks for 2026-05-18 in Telegram dashboard.
```

## Stage 4 — Gmail reconciliation automation

Status:

```text
Architecture approved, implementation blocked until Monday QA passes
```

Approved MVP model:

```text
ChatGPT → Gmail reconciliation intelligence
Telegram bot → task/status UI
Google Sheet → control center / source of truth
```

Deferred:

```text
Direct Gmail API integration inside local Telegram bot.
```

Stage 4.1 after Monday QA:

```text
Add 📬 Сверить почту inside 📥 Отчёты.
```

MVP behavior:

```text
Сверка почты пока запускается через ChatGPT.
Напиши в setup-чате: “запусти Gmail reconciliation”.
После анализа я покажу статусы, follow-up тексты и что обновить в таблице.
```

## Stage 5 — Hosting / deployment

Status:

```text
Not started / safe to prepare before Monday
```

Goal:

Make the bot run without Lisa keeping Terminal open.

Possible options:

- Render;
- Railway;
- Fly.io;
- VPS;
- lightweight cloud instance.

This needs a separate decision because it involves credentials, environment variables and reliability.

## Stage 6 — Personal tasks architecture

Status:

```text
Not started / safe to design before Monday
```

Known personal tasks:

- order Nikita's shampoo, conditioner and styling gel;
- open oils and record a review;
- buy / order kettle;
- order cat litter;
- check Tuleo diffuser.

Current rule:

```text
Personal reminders are daily at 14:00 Asia/Bangkok.
```

Future decision:

- separate personal mode inside BA Fox;
- separate Telegram button;
- separate bot;
- or future app with work/personal separation.

## Monday QA checklist

Date:

```text
2026-05-18
```

Time:

```text
10:10 Asia/Bangkok reminder created
```

Checklist:

1. Start local bot if needed.
2. Open `@ba_executive_fox_bot`.
3. Click `🗓 Задачи на сегодня`.
4. Verify tasks for `2026-05-18` appear.
5. Confirm urgent focus includes:
   - Bitazza;
   - Kasikorn / KBankLao;
   - Super Rich;
   - BCEL;
   - P3;
   - GLN;
   - APEC;
   - relevant JDB wait-list items.
6. If tasks appear correctly: close Stage 3.
7. If tasks do not appear: debug date filtering before Stage 4.1.

## Safe work before Monday

Allowed before Monday:

```text
Stage 3.4 — docs cleanup
Stage 4.0.1 — Gmail reconciliation scenarios
Stage 4.0.2 — follow-up template library
Stage 5.0 — hosting/deploy plan
Stage 6.0 — personal tasks architecture
```

Blocked before Monday:

```text
Stage 4.1 — implement 📬 Сверить почту button inside Telegram.
```

## Current next action

Continue safe preparation work before Monday:

1. Create Gmail reconciliation scenarios.
2. Create follow-up template library.
3. Create hosting/deploy plan.
4. Create personal tasks architecture.

Do not change the live Telegram workflow further until Monday QA unless Lisa explicitly requests a small safe fix.
