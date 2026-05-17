# BA Fox — Web MVP Handover and New Chat Prompt

## Current context

BA Fox / Executive Fox is evolving from Telegram-only task control into a broader EA operating system.

Current live stack:

```text
ChatGPT → thinking / reporting / Gmail reconciliation
Telegram bot → quick task control / reminders / dashboard
Google Sheet → source of truth
GitHub → technical memory and project docs
Web MVP → early static preview of future control center / PWA
```

## Telegram bot current status

Telegram bot `@ba_executive_fox_bot` works locally.

Confirmed:

- bot starts locally;
- `/start` works;
- `/myid` works;
- `🗓 Задачи на сегодня` works;
- `➕ Добавить задачу` works;
- free-text task preview works;
- user-entered task text is deleted after preview;
- main menu has 6 buttons;
- `📝 Собрать итоги` moved inside `📥 Отчёты`.

Current menu:

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

Do not change Telegram bot logic before Monday QA unless explicitly requested.

## Gmail reconciliation status

Approved MVP:

```text
ChatGPT → Gmail reconciliation intelligence
Telegram bot → task/status UI
Google Sheet → control center / source of truth
```

Direct Gmail API inside the bot is deferred.

After Monday QA, add inside Telegram:

```text
📥 Отчёты → 📬 Сверить почту
```

MVP text:

```text
Сверка почты пока запускается через ChatGPT.
Напиши в setup-чате: “запусти Gmail reconciliation”.
После анализа я покажу статусы, follow-up тексты и что обновить в таблице.
```

## Web MVP current status

A safe standalone static web MVP exists in:

```text
web/
```

Files:

```text
web/index.html
web/styles.css
web/app.js
web/README.md
```

This web MVP does not touch Telegram bot, Google Sheet, Gmail, or live tasks yet.

Current mode:

```text
Static demo / mock data
```

Design direction approved by Lisa:

```text
Cozy-style BA Fox web app / personal executive command center
```

UX direction:

- warm;
- mobile-friendly;
- soft but professional;
- not a heavy CRM;
- clear sections;
- work and personal separation;
- daily focus;
- fast task tracking;
- supportive but executive tone.

Current web sections:

```text
Сегодня
Работа
Личное
Пуши
Неделя
```

Recent user feedback:

- design is good;
- replace “Bangkok” text with actual current Bangkok time;
- `Сегодня / Фокус дня` should later use AI to determine main tasks;
- tasks should be checkable like a tracker;
- checked tasks should be visually crossed out / marked done;
- push reminders must work by tasks, not only as a visual section;
- unclear English labels should be changed to Russian;
- expand web version further.

Implemented after feedback:

- current Bangkok date/time in header;
- Russian action buttons:
  - `Скопировать итог дня`;
  - `Скопировать чек-лист на понедельник`;
- task completion buttons;
- checked tasks get `Выполнено`, line-through and visual done state;
- done state is stored in browser localStorage;
- `Сбросить отметки` button;
- AI-focus v0 note;
- Pushes explanation note.

## Important product decision

BA Fox web app can be developed in parallel before Monday QA only if it remains separate from live Telegram flow.

Safe rule:

```text
Web can evolve in web/ as static/mock UI.
Do not connect it to live Google Sheet or Telegram before Monday QA passes.
```

## Hosting / preview issue

Main repository is private.

GitHub Pages preview from the private repo may be inconvenient or unavailable depending on GitHub plan/settings.

Possible preview options:

1. open locally on Mac:

```bash
git pull origin main
open web/index.html
```

2. create a separate public repo only for static `web/` preview, without secrets or bot code;
3. use Vercel / Netlify for static preview;
4. wait and keep local preview only.

## Deployment status

Deployment docs are prepared, but deployment is not started.

Important decision:

```text
Do not deploy / pay for hosting before Monday QA unless Lisa explicitly confirms.
```

Repo now includes:

```text
.env.example
Procfile
README deployment instructions
```

Recommended future hosting:

```text
Railway first for MVP worker
Render as alternative
VPS later for long-term stability
```

## Reminder rules

Approved:

```text
Work reminders — weekdays only.
Personal reminders — every day.
Timezone — Asia/Bangkok.
```

A Monday reminder exists:

```text
2026-05-18 10:10 Asia/Bangkok — check Monday QA and then start Stage 4 if dashboard works.
```

## Response format for setup / automation chats

Always answer in this structure:

```text
1) что сделал
2) предложение
3) этап из плана
4) подтверждение от меня в формате окей
```

## Current stages

```text
Stage 3 — Telegram bot QA: functionally passed, pending Monday task rollover QA.
Stage 4.0 — Gmail reconciliation architecture: approved.
Stage 4.1 — Add 📬 Сверить почту: queued after Monday QA.
Stage 5.0 — Hosting/deployment plan: done.
Stage 5.1 — Repo prepared for deployment: done.
Stage 7.0 — API/Web architecture: documented.
Stage 7.1-lite — Static Web MVP: created and being iterated safely.
```

## Recommended next steps

Before Monday:

```text
1. Continue static Web MVP improvements only.
2. Do not change Telegram bot live logic.
3. Do not connect web to Google Sheet yet.
4. Prepare UX structure for expanded web app.
5. Optionally create public preview repo for web-only static demo.
```

After Monday QA:

```text
1. If tasks for 2026-05-18 appear correctly, close Stage 3.
2. Start Stage 4.1: add 📬 Сверить почту button inside 📥 Отчёты.
3. Decide whether next technical build is hosting or API/web connection.
```

---

# Prompt for new chat

Use this prompt when creating a new BA Fox Web / API chat:

```text
Продолжаем проект BA Fox / Executive Fox, отдельная ветка: Web MVP / API / PWA.

Используй как источники:
- docs/PROJECT_MAP.md
- docs/STAGE_7_API_WEB_ARCHITECTURE.md
- docs/WEB_MVP_HANDOVER_AND_NEW_CHAT_PROMPT.md
- docs/HOSTING_DEPLOYMENT_PLAN.md
- docs/STAGE_4_GMAIL_RECONCILIATION_ARCHITECTURE.md
- docs/GMAIL_RECONCILIATION_SCENARIOS.md
- docs/FOLLOW_UP_TEMPLATE_LIBRARY.md
- web/index.html
- web/styles.css
- web/app.js
- web/README.md

Контекст:
- Telegram bot @ba_executive_fox_bot уже работает локально и до Monday QA его не трогаем.
- Google Sheet BA Fox Control Center остаётся source of truth.
- Gmail reconciliation утверждён как гибридный MVP: сначала ChatGPT анализирует Gmail, бот показывает задачи/статусы, Gmail API внутрь бота подключаем позже.
- Сейчас развиваем web MVP отдельно в папке web/, без подключения к live Google Sheet и без изменения Telegram flow.
- Дизайн web MVP пользователю понравился, направление утверждено: Cozy-style BA Fox web app / personal executive command center.
- Web app должен быть мягким, мобильным, не перегруженным, но executive-style: Сегодня, Работа, Личное, Пуши, Неделя, Отчёты, Почта, Настройки.

Что уже реализовано в web MVP:
- static demo в web/;
- разделы Сегодня / Работа / Личное / Пуши / Неделя;
- mock-задачи Bitazza, Kasikorn, Super Rich, BCEL, P3, GLN, JDB, личные задачи;
- текущее время Бангкока в header;
- русские кнопки “Скопировать итог дня” и “Скопировать чек-лист на понедельник”;
- задачи можно отмечать галочкой;
- выполненные задачи зачёркиваются и получают статус “Выполнено”;
- выполненные задачи сохраняются через localStorage;
- есть “Сбросить отметки”;
- AI-фокус v0: сначала срочные задачи, где действие за нами, потом пуши;
- пояснение, что реальные push-уведомления позже будут через Telegram/hosting.

Важные правила:
- До Monday QA не менять Telegram bot live logic.
- До Monday QA не подключать web к live Google Sheet.
- Можно спокойно развивать статичный web MVP, mock JSON, дизайн, UX, структуру, PWA-shell.
- Не коммитить секреты, .env, Telegram token, Google credentials.
- Если нужен preview на iPhone, основной repo приватный; возможен отдельный public repo только для web/ без секретов.

Формат ответов всегда:
1) что сделал
2) предложение
3) этап из плана
4) подтверждение от меня в формате окей

Работай как “я твои руки”: давай пошаговые действия для Mac/iPhone/GitHub, не перегружай, фиксируй важные решения в репозитории.

Текущий следующий шаг:
Продолжить расширять web MVP: улучшить структуру разделов, подготовить mock JSON, продумать push/reminder logic, AI focus logic, work/personal separation и будущий путь к API/PWA.
```
