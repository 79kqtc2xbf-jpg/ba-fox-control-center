# BA Fox V2.6E - Task Data Cleanup and Normalization Plan

## Purpose

Stage V2.6E defines how the existing `Tasks` data should be reviewed and normalized before any Web/PWA write actions are designed or enabled.

Current confirmed position:

- Web/PWA can read live task data through the read-only Apps Script endpoint;
- writes, notifications, and triggers remain disabled;
- `AuditLog`, `Reports`, and `NotificationQueue` remained headers-only after read-only testing;
- legacy rows and V2 rows coexist in `Tasks`.

This stage is documentation-first and audit-first. It does not change any live Google Sheet rows.

## Safety boundary

This plan permits read-only inspection and preparation of review proposals only.

Do not in this stage:

- edit, delete, archive, merge, or reorder live `Tasks` rows;
- populate a live `CleanupReview` tab without separate approval;
- add Web/PWA write functions, POST calls, status buttons, or comment writes;
- enable Apps Script writes, Google Chat, Gmail, Calendar, notifications, or triggers;
- modify `bot/`, Telegram, or Railway behavior;
- commit an endpoint URL, `web/config.local.js`, a Sheet ID, token, secret, private ID, or webhook URL.

## Data surface being reviewed

The `Tasks` tab preserves the legacy columns A:N and adds V2 fields O:Y.

| Columns | Responsibility | Cleanup rule |
| --- | --- | --- |
| A:N | Existing task content and legacy behavior | Never move or delete during initial cleanup. |
| O:Y | V2 classification and metadata | Populate or normalize only after row-by-row approval in a later write stage. |

V2 review particularly concerns:

| Column | Field | Review focus |
| --- | --- | --- |
| B | `Дата` | Canonical task date. |
| D | `Организация / контакт` | Organization naming. |
| H | `Приоритет` | Canonical priority. |
| I | `Дедлайн` | Canonical due/control date. |
| K | `Статус` | Canonical status. |
| O | `Task type` | Work/personal/system classification. |
| P | `Owner` | Responsible owner. |
| Q:S | Timestamps | Do not backfill by guesswork. |
| Y | `Archived` | Soft archive only in a later approved stage. |

## Why normalization is required

Read-only display can tolerate legacy variation. Future write behavior cannot safely infer intent from:

- mixed Russian and English statuses;
- mixed priority labels;
- empty V2 fields on older rows;
- natural-language deadlines such as `Сегодня` or `Понедельник`;
- repeated or near-duplicate tasks;
- organization names containing contact or project context;
- completed historical rows mixed with active operational rows.

The rule is simple: ambiguity becomes a review item, never an automatic edit.

## Canonical values

### Status

Canonical status set for future reviewed rows:

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

Meaning:

| Canonical status | Meaning |
| --- | --- |
| `Не начато` | Valid task exists, action has not begun. |
| `В работе` | Lisa or the team is actively executing it. |
| `Ждём ответ` | Next movement depends on an external answer. |
| `Пуш` | An explicit follow-up action is due or planned. |
| `Блокер` | Work cannot proceed until a blocking condition is removed. |
| `Нужно уточнить` | Row cannot yet be safely classified or acted upon. |
| `На проверке` | Result exists and is waiting for review/acceptance. |
| `Частично выполнено` | Some result delivered; material next steps remain. |
| `Перенести` | Task is valid but must be rescheduled by review. |
| `Выполнено` | Work is completed; retain as history. |
| `Отменено` | Task is intentionally no longer required; retain as history. |
| `Архив` | Historical/non-active record excluded from operational views. |

Status mapping candidates:

| Current value | Proposed canonical value | Confidence | Rule |
| --- | --- | --- | --- |
| `In progress` | `В работе` | High | Safe proposal. |
| `Push` | `Пуш` | High | Safe proposal. |
| `Done` | `Выполнено` | High | Safe proposal. |
| `Archived` | `Архив` | High | Safe proposal. |
| `Cancelled` | `Отменено` | High | Safe proposal. |
| `Waiting` | `Ждём ответ` | Medium | Confirm dependency/control date. |
| `Wait list` | `Ждём ответ` or `Архив` | Low | Lisa chooses whether still active. |
| empty status | `Нужно уточнить` | Low | Never infer execution state automatically. |

Already canonical Russian values require no mapping, but still participate in duplicate and date review.

### Priority

Canonical priority set:

```text
Высокий
Средний
Низкий
```

| Current value | Canonical value | Confidence |
| --- | --- | --- |
| `High` | `Высокий` | High |
| `Medium` | `Средний` | High |
| `Low` | `Низкий` | High |
| empty | blank pending review | Low |

An empty priority must not automatically become `Средний`: lack of classification is different from medium urgency.

### Task type

Canonical values for column O:

```text
work
personal
system
```

| Situation | Proposed task type | Confidence / action |
| --- | --- | --- |
| Business partner, bank, document, follow-up or deal task | `work` | High when clear from title/category. |
| Explicitly personal/home task | `personal` | High when clearly labeled. |
| BA Fox setup, migration, technical maintenance or operations meta-task | `system` | Lisa review required before writing. |
| Legacy row with no clear classification | blank | Add review item; do not default automatically. |

The earlier migration default of `work` remains a possible approved bulk rule for clearly business legacy rows, not an automatic operation in this stage.

### Owner

Canonical owner set for column P:

```text
Lisa
Theodor
Team
External
```

| Situation | Proposed owner | Rule |
| --- | --- | --- |
| Action explicitly assigned to Lisa | `Lisa` | Safe proposal. |
| Action explicitly assigned to Theodor | `Theodor` | Safe proposal. |
| Internal joint execution | `Team` | Review assignment wording. |
| Waiting entirely on counterparty action | `External` | Use only when responsibility is truly external. |
| Empty or unclear owner | blank | Lisa must approve; do not infer from row creator. |

`Owner` describes current responsibility, not the source that created the row. `App source` in column W is separate.

### Dates and deadlines

Operational timezone:

```text
Asia/Bangkok
```

Canonical values:

| Field | Canonical format | Example |
| --- | --- | --- |
| Task date in column B | `YYYY-MM-DD` | `2026-05-26` |
| Deadline/control date in column I | `YYYY-MM-DD` where a day is known | `2026-05-28` |
| V2 timestamps Q:S | ISO datetime with Bangkok offset | `2026-05-26T10:30:00+07:00` |

Review rules:

| Current pattern | Proposed handling |
| --- | --- |
| ISO date already present | Preserve if semantically correct. |
| `26.05` | Resolve year and meaning with Lisa before proposal. |
| `Сегодня` | Translate only against the row creation/context date if verifiable; otherwise flag. |
| `Понедельник` | Resolve the intended Monday manually. |
| Date range such as `22.05 / 23.05` | Choose task deadline versus control date manually. |
| Narrative timing such as `После первого клиента` | Keep in notes; require an explicit date before reminders. |
| Blank | Keep blank unless Lisa supplies a date. |

No cleanup pass should silently turn relative text into a date based on the day the cleanup happens.

### Organization naming

The goal is consistent grouping without losing contact or project context.

Canonical organization rule:

- column D should begin with one stable organization or project display name;
- people, roles, alternate organizations, and relationship context belong in notes or the future `Contacts` mapping;
- retain the original text in review evidence until Lisa approves a canonical value.

Examples requiring review:

| Current form | Possible primary organization | Review note |
| --- | --- | --- |
| `Bitazza / Катика` | `Bitazza` | Retain contact reference separately. |
| `Bitazza / Катика / Thailand Director` | `Bitazza` | Retain person and role separately. |
| `RT Consulting / Деловой Совет` | `RT Consulting` | Confirm whether council is project or organization. |
| `Руслан / RT Consulting / Grusha` | undecided | Lisa chooses primary business context. |
| `Trisara / Tri Vanada` | undecided | Confirm whether one is parent/project/context. |
| `DONG / Tri Vanada` | undecided | Do not merge by text alone. |

Normalization should not erase relationship information and must not join unlike tasks merely because one token matches.

## Duplicate and near-duplicate handling

Duplicates must be grouped for human review before any archive or status changes.

### Duplicate categories

| Issue type | Definition | Suggested handling |
| --- | --- | --- |
| `DUPLICATE_ID` | Same Task ID on multiple rows. | Block future writes for that ID until primary row is approved. |
| `EXACT_DUPLICATE` | Same normalized title, organization, date and status. | Propose one primary row and archival review for the others. |
| `NEAR_DUPLICATE` | Strongly similar title/organization but possibly different actions or dates. | Compare comments, deadline and result manually. |
| `FOLLOW_UP_CHAIN` | Related rows represent sequential actions, not duplicates. | Keep all rows; optionally link in notes later. |
| `HISTORICAL_REPEAT` | Completed row resembles a current task. | Preserve completed history; do not collapse into active row. |

### Grouping signals for an audit-only report

An eventual audit-only helper may report candidates using:

- exact Task ID equality;
- normalized title equality after case/whitespace cleanup;
- normalized organization equality;
- same date or deadline;
- key tokens shared in title and organization;
- active/final status difference.

It must not automatically decide that two rows are duplicates.

### Review decision for each group

Lisa selects one decision:

```text
KEEP_BOTH
PRIMARY_AND_ARCHIVE_CANDIDATE
FOLLOW_UP_CHAIN
MERGE_INFORMATION_LATER
NOT_DUPLICATE
NEEDS_MORE_CONTEXT
```

Even after approval, the first future cleanup implementation should soft-archive only; it should never delete rows.

## Proposed `CleanupReview` schema

`CleanupReview` is a planned review tab only. Do not create or populate it in this stage.

Purpose:

- record one auditable proposed change or duplicate decision per review item;
- separate analysis from live task mutation;
- allow Lisa to approve uncertain cleanups explicitly.

Proposed columns:

| Column | Field | Purpose |
| --- | --- | --- |
| A | Review ID | Stable review record ID, for example `CR-20260526-001`. |
| B | Row number | Current `Tasks` row number at audit time. |
| C | Task ID | Existing task ID if present. |
| D | Issue type | Classification from allowed issue types. |
| E | Current value | Exact current value or group summary. |
| F | Proposed value | Proposed normalized value or decision. |
| G | Field/column | Affected field, such as `Status`, `Priority`, `Owner`, `Organization`, `Duplicate group`. |
| H | Confidence | `high`, `medium`, or `low`. |
| I | Suggested action | Proposed future action, never executed by the review sheet. |
| J | Primary row reference | For duplicate groups, the candidate row to retain. |
| K | Needs Lisa approval | `TRUE` or `FALSE`; default `TRUE`. |
| L | Lisa decision | `approved`, `rejected`, `revise`, or blank. |
| M | Decision notes | Reason or additional context. |
| N | Reviewed at | Timestamp only after manual review. |
| O | Applied at | Blank until a separately approved write stage. |

Allowed issue types:

```text
DUPLICATE_ID
EXACT_DUPLICATE
NEAR_DUPLICATE
FOLLOW_UP_CHAIN
STATUS_NORMALIZATION
PRIORITY_NORMALIZATION
TASK_TYPE_MISSING
OWNER_MISSING
DATE_REVIEW_REQUIRED
ORG_NORMALIZATION
LEGACY_ROW_REVIEW
CORRUPTED_FIELD
```

`CleanupReview` should hold safe task-operation context only. Do not store credentials, URLs containing access information, private message bodies, tokens, or webhooks.

## Backup-before-write rule

No cleanup writes may be approved until a backup is made and checked.

Required sequence for any future write stage:

1. Pause and confirm the exact approved review items to apply.
2. Duplicate the live `Tasks` tab to `Tasks_Backup_YYYYMMDD_HHMM`.
3. Export a separate backup copy in CSV or XLSX if practical.
4. Confirm the backup opens and includes A:Y headers plus expected row count.
5. Record who confirmed the backup and when.
6. Apply only approved changes, in a small batch.
7. Never delete rows in the first cleanup batch; use `Archived = TRUE` only after approval.
8. Reopen Web/PWA read-only dashboard and confirm expected results.
9. Verify no notifications or triggers were enabled as a side effect.

If the backup cannot be verified, no write may proceed.

## Cleanup phases

### Phase 1 - Read-only audit

Produce a report of:

- non-canonical statuses and priorities;
- active rows missing V2 task type or owner;
- unclear or relative dates;
- organization naming candidates;
- duplicate/near-duplicate candidate groups;
- potentially malformed fields.

Output only: a reviewable report or dry-run summary. No Sheet writes.

### Phase 2 - `CleanupReview` approval

After a separate approval, create or populate `CleanupReview` with proposals. Lisa reviews every low-confidence item and every duplicate group.

### Phase 3 - Backup

Before any accepted proposal is applied, follow the backup-before-write rule.

### Phase 4 - Controlled cleanup write

This requires a new task and approval. It may update approved cells or soft-archive approved duplicate candidates. It may not delete historical rows.

### Phase 5 - Verification

Verify dashboard counts and read views, preserve history, and confirm side-effect tabs/channels remain as intended.

## Acceptance gates before future Web/PWA writes

Write-function design should not proceed until:

- canonical values and ambiguous mappings have Lisa approval;
- duplicate candidate groups have decisions;
- active rows with missing required V2 values have a reviewed proposal;
- the backup procedure is tested manually;
- future write behavior includes an audit strategy;
- notifications and triggers remain separately gated.

## Next safe implementation task

After this document is approved, the next safe task is an audit-only report design or dry-run helper that identifies cleanup candidates without editing Google Sheets.

Any creation of `CleanupReview` rows or mutation of `Tasks` requires a separate, explicit approval and PR.

## Validation for this stage

- Documentation-only repository change.
- No live Google Sheet modification performed.
- No new write function or POST call.
- No endpoint URL, local config, secret, Sheet ID, token, or webhook URL.
- No Google Chat, Gmail, Calendar, notification, or trigger enablement.
- No `bot/`, Telegram, or Railway behavior change.
