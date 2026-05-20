# BA Fox V2.3 Sheets Setup And Apps Script Deploy Checklist

## Goal

Stage V2.3 prepares Lisa to migrate the real Google Sheet and manually deploy the Apps Script scaffold from the repository.

This stage is documentation/checklist only. It does not enable live automation.

Source documents:

```text
docs/BA_FOX_V2_APPS_SCRIPT_WEB_CHAT_PLAN.md
docs/BA_FOX_V2_STAGE_1_SCHEMA_AND_APPS_SCRIPT_SCAFFOLD.md
apps-script/README.md
```

## Safety rules

- Do not add a real Google Sheet ID to this repository.
- Do not paste secrets into GitHub or visible Google Sheet cells.
- Do not add Google Chat webhook URLs yet.
- Do not enable Apps Script triggers yet.
- Do not enable live Google Sheets writes beyond manual setup.
- Do not enable live notifications.
- Do not enable Gmail automation.
- Do not change Telegram/Railway.
- Do not modify `bot/`.
- Do not modify `web/`.

## Stage V2.3 outcome

V2.3 is complete when:

- the real `Tasks` tab has V2 columns O:Y;
- supporting tabs exist with approved headers;
- initial `Settings` rows are filled with safe non-secret values;
- Apps Script files from `apps-script/` are copied into the bound Apps Script project;
- Lisa can run `baFoxScaffoldInfo()` and `baFoxManualSmokeTest()`;
- both smoke-test outputs confirm `dryRun: true`;
- no triggers, webhooks, secrets, or live notification channels are enabled.

## Manual Google Sheets migration checklist

Use the real Google Sheet `BA Fox Control Center / Tasks`.

1. Open the Google Sheet.
2. Confirm the existing `Tasks` tab still has columns A:N unchanged.
3. Add new columns after N, starting at O and ending at Y.
4. Paste the Tasks V2 header block into cells O1:Y1.
5. Create tabs with exact names:
   - `Settings`
   - `AuditLog`
   - `Reports`
   - `NotificationQueue`
   - `Contacts`
6. Paste each tab header block into cell A1 of the matching tab.
7. Paste the initial Settings values into `Settings` starting at A2.
8. Confirm there are no secrets, private keys, tokens, webhook URLs, or real Sheet IDs in visible cells.
9. Keep Gmail automation disabled.
10. Keep Google Chat disabled until a separate notification-only review.

## Copy-paste blocks

### Tasks columns O:Y

Paste into `Tasks!O1:Y1`.

```csv
Task type,Owner,Created at,Updated at,Completed at,Reminder recurrence,Notification channels,Notification status,App source,External ref,Archived
```

Recommended defaults for old rows:

```csv
work,Lisa,,,,none,,,manual_sheet,,FALSE
```

Use the default row only as a guide. Do not bulk-fill old rows until Lisa has reviewed task type and source.

### Settings header

Paste into `Settings!A1:E1`.

```csv
Key,Value,Type,Description,Updated at
```

Paste initial values into `Settings!A2:E10`.

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

### AuditLog header

Paste into `AuditLog!A1:J1`.

```csv
Event ID,Timestamp,Actor,Action,Entity type,Entity ID,Before,After,Source,Notes
```

### Reports header

Paste into `Reports!A1:J1`.

```csv
Report ID,Report date,Report type,Status,Draft text,Source task IDs,Created at,Updated at,Finalized at,Notes
```

### NotificationQueue header

Paste into `NotificationQueue!A1:L1`.

```csv
Queue ID,Task ID,Notification type,Channel,Scheduled for,Status,Attempts,Last attempt at,Last error,Payload summary,Created at,Updated at
```

### Contacts header

Paste into `Contacts!A1:J1`.

```csv
Contact ID,Display name,Type,Organization,Role,Email,Notes,Status,Created at,Updated at
```

## Apps Script manual deployment checklist

Do this only after the Google Sheet tabs and headers are ready.

1. Open the real Google Sheet.
2. Go to `Extensions` -> `Apps Script`.
3. Create a new Apps Script project bound to the Sheet if one does not exist.
4. Create these files in Apps Script:

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

5. From the repository `apps-script/` folder, paste each matching file into Apps Script.
6. Save the Apps Script project.
7. Do not add a real Sheet ID.
8. Do not add secrets.
9. Do not add a Google Chat webhook URL.
10. Do not create triggers.
11. Do not deploy the Web App yet unless Lisa explicitly approves that as a separate task.

## Manual smoke test

Run these functions inside Apps Script.

### 1. Run scaffold info

Function:

```text
baFoxScaffoldInfo
```

Expected result:

```json
{
  "ok": true,
  "data": {
    "version": "v2.2-scaffold",
    "dryRun": true,
    "timezone": "Asia/Bangkok",
    "liveAutomationEnabled": false,
    "triggersEnabled": false
  },
  "error": null
}
```

Pass criteria:

- `ok` is `true`;
- `dryRun` is `true`;
- `liveAutomationEnabled` is `false`;
- `triggersEnabled` is `false`.

### 2. Run manual smoke test

Function:

```text
baFoxManualSmokeTest
```

Expected result:

```json
{
  "ok": true,
  "data": {
    "info": {
      "dryRun": true,
      "triggersEnabled": false
    },
    "today": {
      "ok": true
    },
    "open": {
      "ok": true
    },
    "pushes": {
      "ok": true
    },
    "report": {
      "ok": true
    }
  },
  "error": null
}
```

Pass criteria:

- top-level `ok` is `true`;
- nested checks are present;
- all write-like results are dry-run only;
- no rows are written to the live Google Sheet by the scaffold.

## Stop conditions

Stop and ask for review if any of these happen:

- Apps Script asks for permissions that seem unrelated to Sheets.
- Any function tries to send Google Chat, Email, or Calendar notifications.
- A real webhook URL is needed.
- A real Sheet ID is requested.
- A trigger setup screen is opened.
- A Gmail permission or Gmail API prompt appears.
- Any test writes unexpected rows into the Sheet.

## What remains for later stages

- Implement real, reviewed Google Sheets reads.
- Implement real, reviewed Google Sheets writes.
- Add audit logging after write behavior is reviewed.
- Add notification-only Google Chat MVP.
- Add dry-run reminder selection tests.
- Enable Apps Script triggers only after a separate approval.
- Keep Telegram/Railway as legacy/paused until a separate cleanup decision.
