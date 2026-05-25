# BA Fox Web MVP

## Purpose

This is a safe standalone web MVP for BA Fox.

It does not touch the Telegram bot.
It does not read Google Sheet yet.
It contains a read-only API client skeleton, but no live endpoint is committed or connected to the visible MVP yet.

Current goal:

```text
Preview the future BA Fox web app / PWA direction in a Cozy-style interface.
```

## Files

```text
web/index.html
web/styles.css
web/app.js
web/config.example.js
web/api/baFoxConfig.js
web/api/baFoxClient.js
web/api/baFoxMockData.js
web/api/baFoxUiState.js
```

## Current mode

```text
Static demo / mock data by default
```

Stage V2.6A adds a read-only mock client skeleton. Existing screens remain unchanged until a separately reviewed UI integration step.

## Read-only client skeleton

The client is prepared for GET-only routes:

```text
scaffoldInfo
today
open
pushes
dashboard
```

It exposes:

```js
BAFoxClient.getScaffoldInfo()
BAFoxClient.getTodayTasks({ date: '2026-05-25' })
BAFoxClient.getOpenTasks({ taskType: 'work' })
BAFoxClient.getPushTasks({ dateRange: 'today' })
BAFoxClient.getDashboard()
```

There are no task creation, status update, comment update, POST, notification, or cleanup methods in this client.

## Configuration

The committed safe example is:

```js
window.BA_FOX_CONFIG = {
  APPS_SCRIPT_ENDPOINT: '',
  USE_MOCK_DATA: true
};
```

If no endpoint is configured, mock mode is always used.

For a future local read-only check, create `web/config.local.js` manually and keep it only on your machine. That filename is ignored by Git. Do not put a live endpoint URL, secrets, tokens, webhooks, or Sheet IDs in committed files.

## Client smoke test

The visible MVP is not wired to this layer in Stage V2.6A. To smoke-test the skeleton in browser DevTools, load the scripts in this order from a temporary local test page or a later UI integration:

```html
<script src="config.example.js"></script>
<script src="api/baFoxConfig.js"></script>
<script src="api/baFoxMockData.js"></script>
<script src="api/baFoxUiState.js"></script>
<script src="api/baFoxClient.js"></script>
```

Then run:

```js
await BAFoxClient.getDashboard()
```

Expected default behavior:

```text
status: success
isMock: true
message: Demo mode / mock data
```

Prepared UI-state helpers cover `loading`, `success`, `empty`, `error`, and `mock` states. A locally configured endpoint is accepted only for GET reads, and live data is treated as connected only when read-only safety flags are present.

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

Future V2 work:

```text
1. Wire the visible dashboard to the read-only mock client.
2. Test local-only read endpoint configuration outside Git.
3. Add installable PWA behavior.
4. Design writes only as a separately approved later stage.
```

## Safety rule

Do not commit a live endpoint URL. Do not add writes, notifications, triggers, Gmail automation, Google Chat, or Telegram/Railway changes in this frontend stage.
