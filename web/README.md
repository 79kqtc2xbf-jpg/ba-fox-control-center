# BA Fox Web MVP

## Purpose

This is a safe standalone web MVP for BA Fox.

It does not touch the Telegram bot.
It does not read Google Sheet yet.
It does not require API yet.

Current goal:

```text
Preview the future BA Fox web app / PWA direction in a Cozy-style interface.
```

## Files

```text
web/index.html
web/styles.css
web/app.js
```

## Current mode

```text
Static demo / mock data
```

## Sections

```text
Сегодня
Работа
Личное
Пуши
Неделя
```

## How to open locally

From repository root:

```bash
open web/index.html
```

Or open the file manually in browser.

## Design direction

The app should feel like:

```text
less CRM, more personal executive command center
```

Inspired by Cozy-style simplicity:

- warm;
- mobile-first;
- calm;
- not overloaded;
- work and personal separated;
- clear focus for the day.

## Future steps

After Monday QA:

```text
1. Decide whether to keep web static or add API.
2. Add FastAPI backend.
3. Replace mock data with Google Sheet data.
4. Add status update buttons.
5. Make installable PWA.
```

## Safety rule

Do not connect this web MVP to live tasks before Telegram Monday QA passes.
