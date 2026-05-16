# BA Fox — Hosting / Deployment Plan

## Purpose

This document describes how to move BA Fox Telegram bot from Lisa's local Terminal to a stable hosting environment.

Current local mode works only while:

```text
Mac is on
Terminal is open
python -m bot.main is running
internet / VPN works
Mac does not sleep
```

The goal of Stage 5 is to make the bot run continuously without Lisa keeping Terminal open.

## Current bot mode

Current command:

```bash
source .venv/bin/activate
python -m bot.main
```

Current runtime:

```text
Local Mac / polling mode
```

Current issues:

- bot stops when Terminal closes;
- bot stops when Mac sleeps;
- bot depends on local internet/VPN;
- no automatic restart after crash;
- no production logs;
- reminders are unreliable unless bot/automation layer is always running.

## Deployment goal

Production-like mode should provide:

- always-on bot process;
- automatic restart;
- environment variables stored safely;
- stable internet access to Telegram API;
- stable access to Google Sheets;
- logs for debugging;
- low cost;
- simple maintenance.

## Required secrets / environment variables

The deployed bot will need the same `.env` values as local mode.

Expected variables:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_OWNER_CHAT_ID
GOOGLE_SHEET_ID
GOOGLE_APPLICATION_CREDENTIALS or equivalent Google credentials path/content
```

Important:

```text
Never commit .env or Google service credentials to GitHub.
```

## Hosting options

## Option 1 — Railway

### Pros

- simple for Python bots;
- supports environment variables;
- can run worker processes;
- good logs;
- easy GitHub integration;
- suitable for polling bot.

### Cons

- paid/usage-based after free limits;
- needs setup of Google credentials as env/secret;
- may need process configuration.

### Fit for BA Fox

```text
Recommended first choice for MVP deployment.
```

Reason: easiest balance between simplicity and always-on worker.

## Option 2 — Render

### Pros

- easy GitHub deploy;
- supports background workers;
- good logs;
- stable for small services.

### Cons

- free web services may sleep;
- background workers may require paid plan;
- needs env setup.

### Fit for BA Fox

```text
Good second choice.
```

Use if Railway is inconvenient.

## Option 3 — Fly.io

### Pros

- robust;
- good for Dockerized apps;
- can run globally;
- strong control.

### Cons

- more technical;
- Docker setup required;
- less convenient for Lisa's current workflow.

### Fit for BA Fox

```text
Possible later, not first MVP choice.
```

## Option 4 — VPS

### Pros

- maximum control;
- stable always-on process;
- can use systemd / supervisor;
- good for long-term setup.

### Cons

- more maintenance;
- security updates;
- SSH setup;
- more technical overhead.

### Fit for BA Fox

```text
Good long-term option if project grows.
```

## Option 5 — Keep local Mac

### Pros

- no external hosting cost;
- simplest while testing;
- everything already works.

### Cons

- not reliable;
- Terminal must stay open;
- Mac must not sleep;
- network issues can break bot;
- not good for reminders.

### Fit for BA Fox

```text
Only for testing and QA.
```

## Recommended deployment path

Recommended staged path:

```text
Stage 5.0 — write deployment plan
Stage 5.1 — prepare app for deployment
Stage 5.2 — choose Railway or Render
Stage 5.3 — configure env variables
Stage 5.4 — deploy bot as worker
Stage 5.5 — verify Telegram bot from hosting
Stage 5.6 — add monitoring / restart / logs
```

## Stage 5.1 — Prepare app for deployment

Check repository contains:

```text
requirements.txt
bot/main.py
bot/config.py
services/google_sheets.py
```

Add if missing:

```text
Procfile or railway.json / render.yaml
README deployment section
.env.example
```

Potential worker command:

```bash
python -m bot.main
```

## Stage 5.2 — Choose hosting

Recommended MVP decision:

```text
Railway first.
```

Alternative:

```text
Render background worker.
```

Decision criteria:

- easiest GitHub deploy;
- stable worker mode;
- environment variables UI;
- logs;
- price.

## Stage 5.3 — Environment variables

Add secrets in hosting dashboard, not in repo:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_OWNER_CHAT_ID
GOOGLE_SHEET_ID
```

Google credentials approach options:

### Option A — JSON as file

Upload service account JSON file to host and set path.

Pros:

- close to local setup.

Cons:

- file handling may be awkward.

### Option B — JSON content as env variable

Store full service account JSON in an env variable:

```text
GOOGLE_SERVICE_ACCOUNT_JSON
```

Then update app to load credentials from env content in production.

Pros:

- better for Railway/Render;
- no committed secret file;
- easier deploy.

Cons:

- requires small code change.

Recommended:

```text
Option B — GOOGLE_SERVICE_ACCOUNT_JSON env var.
```

## Stage 5.4 — Worker process

For polling Telegram bot, deploy as background worker, not website.

Worker command:

```bash
python -m bot.main
```

Do not expose public HTTP endpoint yet.

Webhook mode is optional later but not required for MVP.

## Stage 5.5 — Deployment QA checklist

After deployment:

1. Stop local bot on Mac.
2. Confirm hosted worker is running.
3. Open Telegram.
4. Send:

```text
/start
/myid
```

5. Check main menu.
6. Click:

```text
🗓 Задачи на сегодня
```

7. Test:

```text
➕ Добавить задачу
```

8. Confirm Google Sheet update works.
9. Confirm logs show no errors.
10. Confirm bot still responds after Mac sleeps / Terminal closes.

## Stage 5.6 — Monitoring and recovery

Minimum required:

- hosting logs visible;
- automatic restart on crash;
- simple note in docs on how to redeploy;
- backup local command for emergency.

Future:

- health check;
- error alerts;
- admin command `/status`;
- daily startup self-check.

## Risks

### Risk 1 — Google credentials fail in production

Mitigation:

- create `.env.example`;
- support `GOOGLE_SERVICE_ACCOUNT_JSON` env var;
- test sheet read before deployment.

### Risk 2 — Telegram duplicate bot instances

If local bot and hosted bot run at the same time in polling mode, they may conflict.

Rule:

```text
Only one polling instance should run at a time.
```

Before testing hosting:

```text
Stop local bot with Ctrl+C.
```

### Risk 3 — Free hosting sleeps

If platform sleeps background workers, reminders may be delayed.

Mitigation:

- choose always-on worker plan;
- or use VPS later.

### Risk 4 — Secrets exposure

Mitigation:

- never commit `.env`;
- never commit service account JSON;
- rotate tokens if accidentally exposed.

## Recommended immediate next steps

Before Monday, safe preparation:

1. Add `.env.example`.
2. Add deployment instructions to docs.
3. Check whether `services/google_sheets.py` can support env-based Google credentials.
4. Prepare Railway/Render worker config.

Do not deploy before Monday QA unless Lisa explicitly confirms, because Stage 3 still has one pending rollover check.

## Deployment decision

Recommended decision to confirm later:

```text
Use Railway as first production-like host for BA Fox Telegram bot.
```

## Current status

```text
Stage 5.0 — hosting/deployment plan created.
Stage 5.1 — prepare repo for deployment: pending.
Deployment itself: not started.
```
