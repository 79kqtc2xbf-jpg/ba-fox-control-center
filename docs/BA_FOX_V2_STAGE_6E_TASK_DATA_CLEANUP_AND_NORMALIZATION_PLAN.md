# BA Fox V2.6E — Task data cleanup and normalization plan

## Purpose

V2.6E prepares BA Fox for future write functions by documenting how to clean and normalize the live `Tasks` data safely.

V2.6D confirmed that the local Web/PWA can read live Google Sheets data through the Apps Script JSONP read-only endpoint. Before any UI action can create, update, close, archive, comment, notify, or clean tasks, the data model must be predictable.

This stage is documentation-first and audit-first. It must not modify live Google Sheet rows.

## Current runtime state

```text
Google Sheets = source of truth
Apps Script Web App = read-only JSON / JSONP endpoint
Web/PWA = local read-only dashboard
Writes = disabled / dry-run only
doPost = disabled
Google Chat = disabled
Gmail automation = disabled
Triggers = disabled
Telegram/Railway = legacy / paused
```

## Safety boundaries

Do not:

```text
- modify live Tasks rows;
- delete rows;
- archive rows automatically;
- change statuses automatically;
- create or populate CleanupReview rows unless separately approved;
- enable Web/PWA writes;
- add POST/write calls;
- add task mutation functions;
- enable Google Chat, Gmail, Calendar, notifications, or Apps Script triggers;
- modify bot/;
- modify Telegram/Railway behavior;
- commit endpoint URL, web/config.local.js, secrets, tokens, webhook URLs, Sheet IDs, or private IDs.
```

Allowed:

```text
- documentation;
- read-only audit notes;
- canonical value design;
- CleanupReview schema design;
- backup and migration plan;
- future dry-run helper design.
```

## Observed data risks

The `Tasks` sheet contains legacy data from Telegram MVP, manual fast-add, ChatGPT reconciliation, transcript-analysis tasks, V2 schema columns, completed legacy rows, and active current rows.

Main risks:

```text
- mixed statuses: В работе, Ждём ответ, Wait list, Пуш, На проверке, Частично выполнено;
- mixed priorities: Высокий, Средний, Низкий, High, Medium;
- mixed dates: Сегодня, Понедельник, 26.05, 2026-05-26, mixed control-date text;
- duplicate or near-duplicate rows for Bitazza, BCEL, Super Rich, BOL, Sansiri, IHL;
- empty V2 fields in older rows;
- active rows mixed with completed historical rows;
- organization names used as context strings rather than strict entities.
```

These are acceptable for read-only display, but unsafe for future write buttons.

## Canonical values

### Statuses

Recommended canonical status set:

```text
Не начато
В работе
Ждём ответ
Пуш
Блокер
Нужно уточнить
На проверке
Частично выполнено
Перенести
Выполнено
Отменено
Архив
```

Mapping candidates:

| Source value | Canonical value | Notes |
|---|---|---|
| `In progress` | `В работе` | safe |
| `Waiting` | `Ждём ответ` | safe only with a control date |
| `Wait list` | review required | can mean waiting or archived dependency |
| `Push` | `Пуш` | safe |
| `Done` | `Выполнено` | safe |
| `Archived` | `Архив` | safe |
| `Cancelled` | `Отменено` | safe |
| empty | `Нужно уточнить` | review required |

### Priorities

Canonical priority set:

```text
Высокий
Средний
Низкий
```

Mapping:

| Source value | Canonical value |
|---|---|
| `High` | `Высокий` |
| `Medium` | `Средний` |
| `Low` | `Низкий` |

### Task types

Canonical task types:

```text
work
personal
system
```

Rules:

```text
- empty legacy rows default to work for display only, not permanent cleanup;
- clearly personal rows can become personal after review;
- BA Fox technical/meta tasks can become system after review.
```

### Owners

Canonical owners:

```text
Lisa
Theodor
Team
External
```

Rules:

```text
- empty owner defaults to Lisa for display only;
- external dependency rows can become External only after review;
- do not infer Theodor or Team from organization name alone.
```

### Dates

Recommended machine-readable date format:

```text
YYYY-MM-DD
```

Rules:

```text
- ISO dates are canonical;
- DD.MM can be converted only when year context is clear;
- Сегодня / Понедельник / mixed control text require review;
- human deadlines can remain as text, with a separate machine control date added later.
```

## CleanupReview design

Suggested future tab:

```text
CleanupReview
```

Suggested columns:

```csv
Review ID,Row number,Task ID,Issue type,Current value,Proposed value,Confidence,Suggested action,Needs Lisa approval,Notes
```

Issue types:

```text
DUPLICATE_ID
NEAR_DUPLICATE
STATUS_NORMALIZATION
PRIORITY_NORMALIZATION
TASK_TYPE_MISSING
OWNER_MISSING
DATE_REVIEW_REQUIRED
ORG_NORMALIZATION
LEGACY_ROW_REVIEW
CORRUPTED_FIELD
ACTIVE_ROW_REVIEW
ARCHIVE_CANDIDATE
```

Suggested actions:

```text
KEEP
NORMALIZE
ARCHIVE_AFTER_APPROVAL
MERGE_CONTEXT_ONLY
REVIEW_REQUIRED
NO_ACTION
```

## Duplicate handling rules

Detect duplicates by:

```text
- exact task ID match;
- same organization and normalized title;
- same organization, same date, and very similar title;
- repeated manual fast-add rows within a short time window.
```

Primary row selection should prefer:

```text
- newest relevant date;
- most complete steps;
- clearest current status;
- most useful comment;
- populated V2 fields;
- active next reminder if still active.
```

Never delete first. Future archive candidates should use `Archived = TRUE`, `Status = Архив`, and an appended cleanup note only after backup and approval.

## Active row vs history rule

Completed legacy rows are not garbage. They may contain important managerial closure notes. Preserve them unless a later approved cleanup stage archives them.

Historical rows should be hidden from active dashboard by filters, not deleted.

## Cleanup phases

### Phase 1 — Read-only audit

Produce a report listing duplicates, near-duplicates, non-canonical statuses, non-canonical priorities, empty V2 fields in active rows, vague dates, organization naming groups, legacy rows that still appear active, and possible corrupted fields.

No writes.

### Phase 2 — CleanupReview schema approval

Approve the review schema before creating or populating the tab.

### Phase 3 — Manual review

Lisa reviews proposed mappings and duplicate groups. Decision options: approve mapping, reject mapping, keep as-is, archive after backup, merge context into primary row, needs more context.

### Phase 4 — Backup before any write

Before any cleanup write:

```text
- duplicate Tasks tab as Tasks_Backup_YYYYMMDD;
- optionally export CSV/XLSX;
- confirm backup opens;
- record backup name in docs or GitHub issue.
```

### Phase 5 — Controlled cleanup write stage

Only after separate approval:

```text
- write only allowed columns;
- never delete rows on first pass;
- preserve existing comments;
- append cleanup notes instead of replacing history;
- write audit records if audit logging is enabled;
- send no notifications during cleanup.
```

### Phase 6 — Post-cleanup smoke test

After cleanup, confirm Web/PWA still loads, active counts are expected, completed/history rows are not shown in active sections, no notification queues are polluted, and no triggers are enabled.

## Future audit-only helper design

A future read-only helper may be added after this documentation stage:

```text
baFoxBuildCleanupAuditDryRun()
```

It should return a summary and review items, but must not write to `Tasks`, `CleanupReview`, `AuditLog`, `Reports`, or `NotificationQueue` until a separate write stage is approved.

## Acceptance checklist

V2.6E is complete when:

```text
- cleanup/normalization plan is documented;
- canonical statuses, priorities, task types, owners, and date rules are defined;
- duplicate handling rules are defined;
- CleanupReview schema is defined;
- backup-before-write rule is defined;
- no live rows are edited;
- no write functions are enabled;
- next safe stage is clear.
```

## Recommended next stage

```text
Stage V2.6F — audit-only cleanup report, no writes
```

Possible deliverable: Apps Script dry-run function or local script that reads `Tasks` and returns cleanup audit results without writing anything.
