# Apps Script Manual Setup Checklist

Use this checklist when copying the Stage V2.2 scaffold into the real Google Sheet Apps Script project.

## Before copying files

- The real `Tasks` tab has columns O:Y.
- Tabs exist: `Settings`, `AuditLog`, `Reports`, `NotificationQueue`, `Contacts`.
- Initial `Settings` values are filled.
- No secrets are stored in visible cells.
- No real Sheet ID is stored in the repo.
- No Google Chat webhook URL is stored in the repo or visible cells.

## Copy files

Create these files in Apps Script and paste from this folder:

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

## Smoke test

Run:

```text
baFoxScaffoldInfo
```

Confirm:

```text
dryRun: true
liveAutomationEnabled: false
triggersEnabled: false
```

Run:

```text
baFoxManualSmokeTest
```

Confirm:

```text
ok: true
dryRun: true
```

## Do not do in V2.3

- Do not enable triggers.
- Do not deploy live web endpoints.
- Do not add Google Chat webhook URLs.
- Do not enable Email or Calendar sends.
- Do not enable Gmail automation.
- Do not change Telegram/Railway.
