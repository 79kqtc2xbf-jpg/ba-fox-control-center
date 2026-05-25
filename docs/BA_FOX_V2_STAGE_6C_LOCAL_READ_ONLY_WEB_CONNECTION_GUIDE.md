# BA Fox V2.6C: локальное подключение Web/PWA только для чтения

## Зачем этот этап

На этом этапе Лиза может на своем компьютере проверить, что dashboard показывает реальные задачи из Google Sheets через уже подготовленный Apps Script endpoint.

Это не включение рабочей автоматизации. Экран остается только для просмотра:

- задачи не создаются и не изменяются;
- уведомления не отправляются;
- триггеры не включаются;
- Telegram/Railway остается legacy/paused.

## Что уже защищено в репозитории

- `web/config.local.js` добавлен в `.gitignore`.
- В committed configuration остается только пустой placeholder:

```js
window.BA_FOX_CONFIG = {
  APPS_SCRIPT_ENDPOINT: '',
  USE_MOCK_DATA: true
};
```

- Dashboard запрашивает только `BAFoxClient.getDashboard()` и `BAFoxClient.getScaffoldInfo()`.
- Клиент принимает live data только при безопасных признаках:

```text
dryRun = true
readLiveSheets = true или readLive = true
liveAutomationEnabled = false
triggersEnabled = false
```

- Если endpoint недоступен или признаки небезопасны, dashboard показывает безопасные mock/error data.

## Настройка на компьютере Лизы

1. Открыть папку `web/` в локальной копии проекта.
2. Скопировать `web/config.example.js` в новый файл `web/config.local.js`.
3. В `web/config.local.js` вставить live Apps Script endpoint только локально:

```js
window.BA_FOX_CONFIG = {
  APPS_SCRIPT_ENDPOINT: '<вставить endpoint только на своем компьютере>',
  USE_MOCK_DATA: false
};
```

4. Не отправлять этот файл в GitHub, чат или документы.
5. Перед любым commit проверить, что `web/config.local.js` не появляется в списке измененных файлов.

## Локальный smoke test

1. Убедиться, что `web/config.local.js` игнорируется Git и не будет опубликован.
2. Открыть dashboard через локальный static server.
3. Проверить, что сверху показано `Read-only data`, а не `Demo mode / mock data`.
4. Проверить разделы `Сегодня`, `Открытые`, `Пуши` и `Система`.
5. Убедиться, что видны ожидаемые строки из Google Sheets `Tasks`.
6. На вкладке `Система` убедиться, что запись отключена (`dry-run`), автоматизация отключена и триггеры отключены.
7. Убедиться, что на экране нет кнопок добавления, закрытия, редактирования задачи или изменения статуса.
8. В инструментах браузера на вкладке Network убедиться, что к endpoint уходят только GET-запросы и нет POST-запросов.
9. Если вместо live data показался demo/error режим, прекратить проверку и не пытаться включать дополнительные функции.

## Проверка безопасности после теста

Открыть Google Sheet `BA Fox Control Center / Tasks` и проверить:

| Вкладка | Ожидаемый результат после read-only теста |
| --- | --- |
| `Tasks` | Данные не изменились из-за открытия dashboard |
| `AuditLog` | Только строка заголовков, новых записей нет |
| `Reports` | Только строка заголовков, новых черновиков нет |
| `NotificationQueue` | Только строка заголовков, новых уведомлений нет |

Дополнительно убедиться:

- Google Chat не получал тестовых уведомлений;
- Gmail и Calendar не получили новых автоматических действий;
- в Apps Script не появились включенные triggers;
- локальный `web/config.local.js` не попал в GitHub.

## Если проверка не прошла

1. Вернуть `USE_MOCK_DATA: true` в локальном `web/config.local.js` или удалить этот локальный файл.
2. Не менять Apps Script write-функции и не включать triggers.
3. Зафиксировать, какой экран или safety flag не подтвердился, без публикации endpoint URL.

## Граница этапа

V2.6C разрешает только локальное чтение. Запись задач, cleanup, notifications, Google Chat, Gmail, Calendar triggers, изменения `bot/` и Telegram/Railway в этот этап не входят.
