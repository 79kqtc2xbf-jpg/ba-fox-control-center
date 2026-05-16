# Stage 7 — BA Fox API / Web Architecture

## Purpose

Stage 7 describes the future BA Fox web/API architecture.

The goal is to evolve BA Fox from a Telegram-only task bot into a multi-interface operating system:

```text
BA Fox API / Core
→ Telegram bot
→ Web dashboard
→ PWA / iPhone-style app
→ ChatGPT workflows
→ Gmail reconciliation
→ Google Sheet / future database
```

This document is architecture only. No implementation should happen before the current Telegram MVP and Monday QA are stable.

## Product direction

Lisa likes the idea of making BA Fox as a web app similar in spirit to Cozy Foodie:

- mobile-friendly;
- soft and pleasant to use;
- not overwhelming;
- clear sections;
- fast actions;
- daily focus;
- supportive microcopy;
- work and personal separation;
- simple enough to use every day.

The web version should feel like a calm executive control center, not a heavy corporate CRM.

## Current architecture

Current MVP:

```text
ChatGPT
  ↓
Google Sheet: BA Fox Control Center
  ↓
Telegram bot @ba_executive_fox_bot
```

Current responsibilities:

- ChatGPT: planning, reports, Gmail analysis, architecture decisions;
- Google Sheet: source of truth for tasks;
- Telegram bot: quick mobile interface, task dashboard, status buttons;
- GitHub: project memory and technical documentation.

## Target architecture

Future target:

```text
                 ChatGPT
                    ↓
              BA Fox API/Core
          ↙        ↓        ↘
 Telegram Bot   Web App      PWA / iPhone app
          ↘        ↓        ↙
        Google Sheet / Future DB
                    ↓
              Gmail / Reports
```

## Why add an API layer

Without API:

- Telegram bot talks directly to Google Sheets;
- web app would also need to talk directly to Google Sheets;
- ChatGPT/manual workflows update Sheet separately;
- logic becomes duplicated.

With API:

- one core business logic layer;
- Telegram and web use the same task logic;
- status rules live in one place;
- Gmail reconciliation can become a service;
- future PWA/app is easier to build;
- Google Sheet can later be replaced by a real database.

## Proposed API stack

Recommended backend:

```text
FastAPI
```

Why:

- Python-native;
- good for current codebase;
- simple REST endpoints;
- good for Telegram bot integration;
- supports future background jobs;
- can run on Railway / Render / VPS.

## Proposed frontend stack

Recommended first web app option:

```text
Simple PWA web app
```

Possible stack:

```text
HTML / CSS / JavaScript first
```

or later:

```text
React / Next.js
```

Recommendation:

Start simple, Cozy-style:

```text
static responsive web app + API
```

Do not overbuild with heavy enterprise UI.

## Data source strategy

### Stage 7 MVP

Keep Google Sheet as source of truth:

```text
API → Google Sheet
```

### Later

Move to real DB only if needed:

```text
API → PostgreSQL / SQLite / Supabase
```

Google Sheet can stay as export/control layer.

## Core API endpoints

### Tasks

```text
GET /tasks/today
GET /tasks/week
GET /tasks/open
GET /tasks/{task_id}
POST /tasks
PATCH /tasks/{task_id}/status
PATCH /tasks/{task_id}/comment
PATCH /tasks/{task_id}/date
```

### Dashboard

```text
GET /dashboard/today
GET /dashboard/week
GET /dashboard/focus
GET /dashboard/pushes
GET /dashboard/wait-list
```

### Reports

```text
GET /reports/daily/draft
GET /reports/weekly/draft
POST /reports/daily/finalize
POST /reports/weekly/finalize
```

### Gmail reconciliation

Hybrid MVP:

```text
POST /gmail/reconciliation/manual-result
```

Later direct Gmail API:

```text
POST /gmail/reconcile
GET /gmail/reconcile/{task_id}
```

### Personal tasks

```text
GET /personal/today
POST /personal/tasks
PATCH /personal/tasks/{task_id}/status
```

## Web app sections

Recommended main navigation:

```text
Сегодня
Работа
Личное
Пуши
Почта
Неделя
Отчёты
Настройки
```

## Web app screens

### 1. Today / Сегодня

Purpose:

- show the day clearly;
- avoid overwhelm;
- separate urgent from background.

Blocks:

```text
🔥 Фокус дня
⚠️ Срочно
📣 Пуши
⏳ Wait list
✅ Закрыто сегодня
```

### 2. Work / Работа

Work categories:

```text
📄 Документы / онбординг
💌 Почта / партнёрские коммуникации
🏦 Банки / платежи
🏡 Недвижимость / партнёры
⚙️ Автоматизация / BA Fox
🤝 HR / организационные задачи
```

### 3. Personal / Личное

Personal task blocks:

```text
🛒 Купить / заказать
🏠 Дом
🐱 Коты
🧴 Никита / быт
✨ Обзоры / масла / уход
```

Rule:

```text
Work and personal tasks must stay visually separate.
```

### 4. Pushes / Пуши

Shows:

```text
who needs follow-up
last action date
next control date
ready follow-up draft
```

### 5. Mail / Почта

Hybrid MVP:

- explains that Gmail reconciliation is launched through ChatGPT;
- shows last reconciliation result if available;
- later connects direct Gmail API.

### 6. Week / Неделя

Shows:

```text
weekly focus
closed this week
moved forward
blockers
wait list
next week focus
```

### 7. Reports / Отчёты

Actions:

```text
Собрать итог дня
Собрать итог недели
Сделать версию для созвона
Сделать Telegram-ready version
```

### 8. Settings / Настройки

Settings:

```text
timezone: Asia/Bangkok
work reminders: weekdays only
personal reminders: daily
notification times
source sheet
Telegram chat id
```

## UX principles

BA Fox web app should be:

- calm;
- not overloaded;
- mobile-first;
- warm but professional;
- owner-style;
- visually separated by sections;
- easy to use when tired;
- fast for daily check-ins.

Inspired by Cozy-style simplicity:

```text
less CRM, more personal command center
```

## Suggested microcopy

Examples:

```text
🦊 Сегодня держим фокус спокойно.
🔥 Сначала закрываем самое важное.
📣 Здесь задачи, которые нельзя просто “ждать”.
⏳ Это внешние зависимости — они зафиксированы.
✅ Закрыто управленчески, не тянем дальше.
```

## Telegram vs Web responsibilities

### Telegram bot

Best for:

- quick check;
- reminders;
- marking tasks done;
- adding simple tasks;
- mobile status updates.

### Web app

Best for:

- full dashboard;
- weekly overview;
- reports;
- Gmail reconciliation review;
- task planning;
- separating work/personal;
- seeing history.

### ChatGPT

Best for:

- thinking;
- analysis;
- Gmail reconciliation intelligence;
- report rewriting;
- architecture decisions;
- follow-up drafting.

## PWA idea

BA Fox can later become a PWA, similar to Cozy Foodie technical direction:

- installable on iPhone home screen;
- mobile-first;
- works as a web app;
- later can be wrapped with Capacitor if needed.

Potential PWA tabs:

```text
Сегодня
Работа
Личное
Почта
Неделя
```

## Roadmap

### Stage 7.0 — Architecture

Status:

```text
In progress / documentation only
```

Tasks:

- write this document;
- decide web/API direction;
- confirm with Lisa.

### Stage 7.1 — API skeleton

Possible future tasks:

- create FastAPI app;
- expose `/tasks/today`;
- expose `/tasks/{task_id}/status`;
- keep Google Sheet as backend.

### Stage 7.2 — Telegram bot uses API

Move bot from direct Sheets calls to API calls.

### Stage 7.3 — Web dashboard MVP

Build first mobile-first web dashboard.

### Stage 7.4 — Personal/work separation

Add separate personal task model and UI.

### Stage 7.5 — Gmail reconciliation dashboard

Show Gmail reconciliation results in web UI.

### Stage 7.6 — PWA installable version

Make web app installable on iPhone.

## Important dependency

Do not start implementation before:

```text
Monday QA confirms tasks for 2026-05-18 appear correctly in Telegram dashboard.
```

## Current recommendation

Near-term:

```text
Keep Telegram MVP stable.
Prepare API/Web docs.
Do not implement web yet.
```

After Monday QA and Stage 4.1:

```text
Choose whether next big build is deployment or web/API skeleton.
```
