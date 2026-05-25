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

Do not commit a live endpoint URL, secrets, tokens, webhooks, or Sheet IDs. `web/config.local.js` is reserved for a separately approved future local read-only test and is ignored by Git.

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
