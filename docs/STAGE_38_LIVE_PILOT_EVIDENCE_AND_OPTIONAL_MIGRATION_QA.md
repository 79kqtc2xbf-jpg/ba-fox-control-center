# Stage 38 — Live Pilot Evidence And Optional Migration QA

## Confirmed Starting State

Stage 37 is complete:

- PR #91 is merged.
- Stage 37 Settings copy and runbook are live.
- Apps Script redeploy was not required for PR #91.
- Pilot remains paused.
- `VISIBILITY_ENFORCEMENT=false`.
- Visibility mode remains `profile_only`.
- Real dashboard filtering remains off.

Stage 38 is an operational QA and evidence-collection stage. It does not enable enforcement and does not start member-only dashboards.

## Safety Gate

Stage 38 passes only after live evidence is recorded. It must not enable enforcement.

Do not proceed if any of these become false:

- `VISIBILITY_ENFORCEMENT=false`;
- visibility mode is `profile_only`;
- real dashboard filtering is off;
- `filteredByUser=false`;
- pilot status is paused/not active;
- `createTask` legacy compatibility still works;
- optional migration is manual only.

## Hard Safety Rules

- Do not enable `VISIBILITY_ENFORCEMENT`.
- Do not enable real dashboard filtering.
- Do not start member-only dashboards.
- Do not start Stage 39.
- Do not auto-run migration.
- Do not add columns automatically on app load.
- Do not change `createTask` legacy compatibility.
- Do not change Apps Script unless a real blocker is found and documented first.
- All writes must remain guarded by `SAFE_WRITE_MODE=true`, `confirm=true`, and admin profile or action token.

## Scope

Stage 38 prepares and guides live evidence collection for controlled pilot readiness.

In scope:

- backup confirmation;
- schema evidence before migration;
- optional manual migration QA when the legacy schema is recognized and missing identity fields are expected;
- post-migration task creation evidence;
- Liza/admin, Andrey, and Daniil visibility preview evidence;
- rollback readiness.

Out of scope:

- production visibility enforcement;
- member-only dashboards;
- employee-facing pilot start;
- automatic schema changes;
- new Apps Script behavior.

## Live Evidence Record

Copy this block into QA notes before starting:

```text
Stage 38 evidence date:
QA owner:
Google Sheet backup name/link:
Apps Script deployment version:
Dashboard URL:

Before migration:
- Visibility mode:
- VISIBILITY_ENFORCEMENT:
- filteredByUser:
- Pilot status:
- Schema status:
- Missing columns:
- createTask before migration:
- Old tasks visible:

Migration:
- Migration used: yes/no
- Reason if skipped:
- Confirmed backup before migration: yes/no
- Expected identity columns to append:
- Columns appended:
- Columns duplicated: yes/no
- Existing columns renamed/reordered: yes/no

After migration:
- Schema status:
- Missing columns:
- Stage 38 test task title:
- Legacy Owner populated:
- Owner Email populated:
- Owner User ID populated:
- Created By Email populated:
- Created By User ID populated:
- Old tasks visible:

Visibility preview:
- Liza/admin total / visible / hidden / legacy_unclassified:
- Andrey total / visible / hidden / legacy_unclassified:
- Daniil total / visible / hidden / legacy_unclassified:
- filteredByUser after previews:
- Pilot still paused:

Rollback:
- Backup verified:
- Appended columns documented:
- Rollback owner:
- Previous Apps Script deployment known:
```

## Runbook

### 1. Confirm Current State

1. Open the live dashboard.
2. Open Settings.
3. Confirm:
   - Stage 37 readiness copy is visible;
   - pilot is paused/not active;
   - visibility mode is `profile_only`;
   - `VISIBILITY_ENFORCEMENT=false`;
   - dashboard filtering is off;
   - visibility preview is labeled dry-run/preview only.
4. Record `filteredByUser=false` from the dashboard identity/preview metadata.
5. Confirm no task identity columns were added by opening the app.

### 2. Backup Google Sheet

Before any migration:

1. Duplicate or export the Google Sheet.
2. Open the backup.
3. Confirm the backup contains the `Tasks` tab.
4. Record backup name/link and time.

Do not run confirmed migration without a verified backup.

### 3. Schema Check Before Migration

1. In Settings, run the task identity schema check.
2. Confirm `Legacy Tasks` is `ok`.
3. Record missing columns.
4. For the current production sheet, continue to optional migration only if identity schema status is `missing` and missing identity fields are exactly:

```text
Owner Email
Owner User ID
Collaborator Emails
Collaborator User IDs
Created By Email
Created By User ID
Visibility
```

Stop if `Legacy Tasks` is not `ok`, if any existing legacy column is renamed/reordered, or if the missing identity list differs from the seven fields above.

### 4. Optional Manual Migration

Migration is optional. Run it only if all are true:

- backup exists and opens;
- Liza/admin explicitly approves;
- `Legacy Tasks` is `ok`;
- identity schema status is `missing`;
- missing identity fields are exactly the seven expected identity columns;
- Settings still says migration is manual/optional;
- the route is called with `confirm=true`;
- the request has verified admin profile or action token;
- `SAFE_WRITE_MODE=true`.

Expected result:

- append `Owner Email`;
- append `Owner User ID`;
- append `Collaborator Emails`;
- append `Collaborator User IDs`;
- append `Created By Email`;
- append `Created By User ID`;
- append `Visibility`;
- do not rename existing columns;
- do not reorder existing columns;
- do not create duplicate identity columns.

### 5. Verify Sheet Columns

After migration, inspect the `Tasks` header row:

- `Owner Email` exists once;
- `Owner User ID` exists once;
- `Collaborator Emails` exists once;
- `Collaborator User IDs` exists once;
- `Created By Email` exists once;
- `Created By User ID` exists once;
- `Visibility` exists once;
- all seven identity columns were appended after existing used columns, currently after `focus`;
- existing legacy columns remain in place;
- no existing column was renamed.

Record the final column letters/numbers.

### 6. Create Task After Migration

Create one clearly named Stage 38 test task from the live dashboard.

Suggested title:

```text
STAGE38_IDENTITY_QA_DO_NOT_USE
```

Verify the new row:

- legacy `Owner` is populated;
- owner identity fields populate where owner can be resolved;
- creator identity fields populate for the signed-in creator;
- collaborator fields may remain blank;
- old tasks remain visible in the dashboard.

If `createTask` fails, stop Stage 38 and do not continue to pilot preview.

### 7. Visibility Preview Evidence

Run dry-run visibility preview for:

- Liza/admin;
- Andrey;
- Daniil.

For each user, record:

- role;
- total tasks;
- visible if enforced;
- hidden if enforced;
- `legacy_unclassified`;
- reason counts.

Expected:

- Liza/admin can see all or expected full-visibility count;
- Andrey and Daniil may have lower visible counts;
- legacy unclassified tasks are counted, not hidden silently;
- `filteredByUser=false`;
- real dashboard task lists remain unfiltered.

### 8. Confirm Pilot Still Paused

After all previews:

- do not invite employees to use member-only dashboards;
- do not enable enforcement;
- do not change runtime config;
- record that the pilot remains paused/not active.

## Rollback Plan

If optional migration was used:

1. Keep `VISIBILITY_ENFORCEMENT=false`.
2. Keep real dashboard filtering off.
3. Stop Stage 38 testing.
4. Use the backup as the source of truth.
5. Prefer hiding appended collaborator columns during investigation.
6. Delete appended collaborator columns only after confirming:
   - they are exactly the Stage 38 appended columns;
   - they contain no needed data;
   - a backup exists.
7. If the web UI regresses, redeploy the previous web/app version. Apps Script rollback is not expected unless an Apps Script blocker was separately patched.

Rollback must not delete legacy task columns or task rows.

## QA Checklist

### A. Before Migration

- [ ] Dashboard opens.
- [ ] Stage 37 Settings copy is live.
- [ ] Pilot status is paused/not active.
- [ ] Visibility mode is `profile_only`.
- [ ] `VISIBILITY_ENFORCEMENT=false`.
- [ ] Real dashboard filtering is off.
- [ ] `filteredByUser=false`.
- [ ] Schema check was run manually.
- [ ] `Legacy Tasks` is `ok`.
- [ ] Missing fields recorded.
- [ ] No columns were added automatically.
- [ ] Sheet backup created.
- [ ] Sheet backup opened and includes `Tasks`.

### B. Optional Migration

- [ ] Identity schema status is `missing`.
- [ ] Missing fields are exactly the seven identity columns.
- [ ] Liza/admin approved migration.
- [ ] Migration was manual only.
- [ ] Migration used `confirm=true`.
- [ ] Migration had verified admin profile or action token.
- [ ] Only the seven missing identity columns were appended.
- [ ] No duplicate identity columns were created.
- [ ] No existing columns were renamed.
- [ ] No existing columns were reordered.

### C. Post-Migration Task Test

- [ ] Stage 38 test task created.
- [ ] Legacy `Owner` is populated.
- [ ] Owner identity fields populate where resolvable.
- [ ] Creator identity fields populate for signed-in creator.
- [ ] Collaborator fields are present and may be blank.
- [ ] Old tasks remain visible.
- [ ] Dashboard still loads.

### D. Pilot Preview Evidence

- [ ] Liza/admin preview recorded.
- [ ] Andrey preview recorded.
- [ ] Daniil preview recorded.
- [ ] Visible counts recorded.
- [ ] Hidden counts recorded.
- [ ] `legacy_unclassified` counts recorded.
- [ ] Reason counts reviewed.
- [ ] `filteredByUser=false` after previews.
- [ ] Real dashboard filtering remains off.
- [ ] Pilot remains paused.

### E. Rollback Readiness

- [ ] Backup name/link recorded.
- [ ] Appended columns and positions recorded.
- [ ] Rollback owner recorded.
- [ ] Previous deployment/version known.
- [ ] Decision recorded to hide columns first before deleting.

## Do Not Proceed Warnings

Stop Stage 38 if:

- backup is missing or cannot be opened;
- legacy schema is not recognized as `ok`;
- schema is not the expected `missing` identity state;
- missing fields are not exactly the seven expected identity columns;
- migration would create duplicates;
- migration happens automatically;
- `VISIBILITY_ENFORCEMENT` becomes true;
- visibility mode is not `profile_only`;
- `filteredByUser` becomes true;
- real dashboard filtering appears active;
- `createTask` fails;
- old tasks disappear;
- preview data cannot be explained;
- pilot status is no longer paused.

## Exit Criteria

Stage 38 passes only when evidence is recorded for:

- backup;
- pre-migration schema;
- optional migration decision/result;
- post-migration task creation if migration was used;
- Liza/admin, Andrey, and Daniil previews;
- `filteredByUser=false`;
- pilot still paused;
- rollback readiness.

Do not proceed to Stage 39 until this evidence has been reviewed and explicitly accepted.
