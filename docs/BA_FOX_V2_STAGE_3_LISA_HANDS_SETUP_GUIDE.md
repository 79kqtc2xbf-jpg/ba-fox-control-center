# BA Fox V2.3 - инструкция для Лизы: Google Sheets и Apps Script dry-run

## 1. Что делаем сейчас

Цель этого шага - руками подготовить реальную Google Sheet для BA Fox V2 и перенести туда Apps Script scaffold в безопасном режиме.

После этого можно будет проверить, что Apps Script проект запускается, но ничего живого пока не автоматизирует.

Важно: на этом этапе мы не включаем напоминания, не отправляем сообщения, не подключаем Gmail и не меняем Telegram/Railway.

## 2. Правила безопасности перед стартом

Перед началом держим эти правила как красную линию:

- не вставлять секреты в Google Sheet;
- не вставлять секреты в GitHub;
- не вставлять Google Chat webhook URL;
- не добавлять реальный Sheet ID в репозиторий;
- не включать Apps Script triggers;
- не подключать live Gmail automation;
- не менять Telegram/Railway;
- не менять код в `bot/`;
- не менять код в `web/`;
- не менять файлы `apps-script/*.gs`.

Если Google попросит доступ к Gmail, настройку триггера, webhook, токен или что-то похожее - остановись и пришли это в ChatGPT.

## 3. Подготовка Google Sheets

### 3.1 Открыть таблицу

1. Открой реальную Google Sheet:

```text
BA Fox Control Center / Tasks
```

2. Открой вкладку:

```text
Tasks
```

3. Проверь, что существующие колонки A:N на месте и не сдвинулись.

Они должны начинаться так:

```text
A = ID
B = Дата
C = Категория
D = Организация / контакт
E = Задача
...
N = Канал
```

Ничего не вставляй перед колонкой A и не вставляй внутрь A:N.

### 3.2 Добавить заголовки Tasks O:Y

1. Перейди в ячейку:

```text
Tasks!O1
```

2. Вставь в `O1:Y1` этот блок:

```csv
Task type,Owner,Created at,Updated at,Completed at,Reminder recurrence,Notification channels,Notification status,App source,External ref,Archived
```

3. Проверь, что последний новый заголовок `Archived` оказался в колонке Y.

Пока не заполняй старые строки массово. Старые задачи лучше разметить позже аккуратно.

## 4. Создать новые вкладки

Создай 5 новых вкладок с точными названиями:

```text
Settings
AuditLog
Reports
NotificationQueue
Contacts
```

Названия должны совпадать буква в букву.

## 5. Вставить заголовки и стартовые настройки

### 5.1 Settings

1. Открой вкладку `Settings`.
2. Вставь в ячейку `A1`:

```csv
Key,Value,Type,Description,Updated at
```

3. Вставь в ячейку `A2`:

```csv
timezone,Asia/Bangkok,string,Operational timezone,
work_reminder_days,"MON,TUE,WED,THU,FRI",csv,Work reminders weekdays only,
personal_reminder_days,DAILY,string,Personal reminders daily,
default_work_reminder_time,10:00,time,Morning work reminder,
default_personal_reminder_time,14:00,time,Daily personal reminder,
notifications_google_chat_enabled,FALSE,boolean,Enable only after Chat setup,
notifications_email_enabled,FALSE,boolean,Enable after confirmation,
notifications_calendar_enabled,FALSE,boolean,Enable after confirmation,
live_gmail_automation_enabled,FALSE,boolean,Must remain false until separately approved,
```

Проверь главное:

```text
notifications_google_chat_enabled = FALSE
notifications_email_enabled = FALSE
notifications_calendar_enabled = FALSE
live_gmail_automation_enabled = FALSE
```

### 5.2 AuditLog

1. Открой вкладку `AuditLog`.
2. Вставь в `A1`:

```csv
Event ID,Timestamp,Actor,Action,Entity type,Entity ID,Before,After,Source,Notes
```

### 5.3 Reports

1. Открой вкладку `Reports`.
2. Вставь в `A1`:

```csv
Report ID,Report date,Report type,Status,Draft text,Source task IDs,Created at,Updated at,Finalized at,Notes
```

### 5.4 NotificationQueue

1. Открой вкладку `NotificationQueue`.
2. Вставь в `A1`:

```csv
Queue ID,Task ID,Notification type,Channel,Scheduled for,Status,Attempts,Last attempt at,Last error,Payload summary,Created at,Updated at
```

### 5.5 Contacts

1. Открой вкладку `Contacts`.
2. Вставь в `A1`:

```csv
Contact ID,Display name,Type,Organization,Role,Email,Notes,Status,Created at,Updated at
```

## 6. Проверка таблицы перед Apps Script

Перед переходом в Apps Script проверь:

- `Tasks` содержит новые колонки O:Y;
- `Archived` находится в колонке Y;
- есть вкладки `Settings`, `AuditLog`, `Reports`, `NotificationQueue`, `Contacts`;
- в каждой новой вкладке есть заголовок в строке 1;
- в `Settings` заполнены строки A2:E10;
- нигде нет токенов, приватных ключей, webhook URL или реального Sheet ID;
- все notification/Gmail настройки стоят `FALSE`.

Если что-то не совпало, остановись и пришли скрин или текст ошибки в ChatGPT.

## 7. Apps Script setup

### 7.1 Открыть Apps Script

1. В Google Sheet нажми:

```text
Extensions -> Apps Script
```

2. Откроется Apps Script проект, привязанный к этой таблице.

Если Google предложит создать проект - создай.

### 7.2 Создать файлы

В Apps Script создай файлы с такими точными именами:

```text
Code.gs
Config.gs
SheetsStore.gs
TaskService.gs
ReportService.gs
ReminderService.gs
NotificationService.gs
ChatService.gs
WebApi.gs
WebApp.gs
Validation.gs
DateTime.gs
AuditLog.gs
```

### 7.3 Вставить scaffold-код

1. Открой репозиторий.
2. Открой папку:

```text
apps-script/
```

3. По очереди открой каждый `.gs` файл.
4. Скопируй содержимое файла из репозитория.
5. Вставь в одноименный файл в Apps Script.
6. После вставки всех файлов нажми Save.

Не создавай triggers. Не нажимай deploy. Не добавляй webhook. Не добавляй Sheet ID.

## 8. Smoke test

### 8.1 Запустить `baFoxScaffoldInfo`

1. В Apps Script выбери функцию:

```text
baFoxScaffoldInfo
```

2. Нажми Run.

Ожидаем:

```text
ok: true
dryRun: true
timezone: Asia/Bangkok
liveAutomationEnabled: false
triggersEnabled: false
```

Это хороший результат. Он означает: scaffold работает, но автоматика выключена.

### 8.2 Запустить `baFoxManualSmokeTest`

1. В Apps Script выбери функцию:

```text
baFoxManualSmokeTest
```

2. Нажми Run.

Ожидаем:

```text
ok: true
dryRun: true
today: ok
open: ok
pushes: ok
report: ok
```

Нормально, если список задач пустой. На этом этапе важно не количество задач, а то, что scaffold отвечает и остается в dry-run режиме.

## 9. Когда остановиться

Остановись и ничего дальше не нажимай, если:

- Google просит доступ к Gmail;
- открылась настройка triggers;
- Apps Script просит webhook URL;
- где-то понадобился секрет, токен, private key или real Sheet ID;
- функция пытается отправить Google Chat, Email или Calendar notification;
- в таблице появились неожиданные новые строки;
- dry-run оказался не `true`;
- `triggersEnabled` оказался не `false`;
- появилась ошибка, которую ты не понимаешь.

В этих случаях просто пришли текст ошибки или скрин в ChatGPT.

## 10. Что отправить обратно в ChatGPT

После выполнения пришли короткий отчет:

```text
таблица подготовлена
Apps Script файлы созданы
baFoxScaffoldInfo: ok / ошибка
baFoxManualSmokeTest: ok / ошибка
```

Если была ошибка, пришли:

- текст ошибки;
- на каком шаге она появилась;
- скрин без секретов;
- вывод smoke test без секретов.

Не присылай токены, webhook URL, private keys или реальные секреты.

## 11. Что не делаем в этом шаге

В Stage V2.3 hands-on setup мы не делаем:

- live Sheet write integration;
- live Google Chat notification;
- Email notification;
- Calendar notification;
- Gmail automation;
- Apps Script triggers;
- Telegram/Railway cleanup;
- изменения в `bot/`;
- изменения в `web/`;
- изменения в `apps-script/*.gs`.

Следующий этап можно начинать только после того, как dry-run setup пройдет спокойно.
