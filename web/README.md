# BA Fox Web MVP

## Purpose

The BA Fox Web/PWA dashboard is now wired to the V2 read-only client in safe demo mode.

The visible screen renders:

```text
Today
Open tasks
Pushes
System status
```

No live endpoint URL is committed. The default configuration uses mock data only.

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
Demo mode / mock data
Read-only dashboard
```

`web/app.js` reads the view model only through:

```js
BAFoxClient.getDashboard()
BAFoxClient.getScaffoldInfo()
```

The client remains limited to GET-only routes:

```text
scaffoldInfo
today
open
pushes
dashboard
```

The dashboard has loading, success, empty, and error handling. An error uses safe mock fallback data instead of exposing or changing live tasks.

## Configuration

The committed safe configuration remains:

```js
window.BA_FOX_CONFIG = {
  APPS_SCRIPT_ENDPOINT: '',
  USE_MOCK_DATA: true
};
```

Do not commit a live endpoint URL, secrets, tokens, webhooks, or Sheet IDs. `web/config.local.js` is ignored by Git and is the only supported place for a local read-only endpoint check.

## Local-only live read test

The page attempts to load `web/config.local.js` at startup. If the file is absent, the dashboard stays in safe mock mode. The missing local file never prevents the page from loading.

For a local read-only verification only:

1. Copy `web/config.example.js` to `web/config.local.js` on your machine.
2. Paste the Apps Script endpoint URL into `APPS_SCRIPT_ENDPOINT` in that local file only.
3. Change `USE_MOCK_DATA` to `false` in that local file only.
4. Open the dashboard through a local static server and check the `Read-only data` banner.

The real URL must never appear in a committed file, documentation, screenshot, or pull request text. See `docs/BA_FOX_V2_STAGE_6C_LOCAL_READ_ONLY_WEB_CONNECTION_GUIDE.md` for the Lisa checklist and the after-test safety check.

## Manual smoke test

1. Open `web/index.html` in a browser.
2. Confirm the banner says `Demo mode / mock data` and `Только просмотр`.
3. Confirm the summary shows counts for `Сегодня`, `Открытые`, and `Пуши`.
4. Switch among `Сегодня`, `Открытые`, `Пуши`, and `Система`.
5. Confirm the system screen shows writes, automation, and triggers as disabled.
6. Confirm there are no buttons to add, close, edit, or change a task.

Optional browser console check:

```js
await BAFoxClient.getDashboard()
await BAFoxClient.getScaffoldInfo()
```

Expected default response state:

```text
status: success
isMock: true
message: Demo mode / mock data
```

## Safety boundary

This stage does not add write calls, notifications, triggers, Gmail automation, Google Chat, or live task cleanup. It does not change `bot/`, Telegram, or Railway behavior.
