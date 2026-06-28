# Stage 37 — Controlled Pilot Readiness

## Confirmed Starting State

Stage 36 passed live QA:

- PR #90 is merged.
- Apps Script is redeployed.
- Dashboard opens successfully.
- Settings visibility dry-run works.
- `VISIBILITY_ENFORCEMENT=false`.
- Visibility mode is `profile_only`.
- Real dashboard filtering is off.
- `createTask` smoke test passed.
- Old tasks remain visible.
- Task identity schema is partial.
- Missing optional task identity fields are `Collaborator Emails` and `Collaborator User IDs`.

Stage 37 prepares a reversible controlled pilot readiness check. It does not start the pilot and does not enable production member filtering.

## Hard Safety Rules

- Do not enable `VISIBILITY_ENFORCEMENT`.
- Do not switch identity enforcement to enforced mode.
- Do not turn on real dashboard filtering.
- Do not auto-run migration.
- Do not add columns automatically on app load.
- Do not change `createTask` legacy compatibility.
- Do not create duplicate identity columns.
- All write-like migration actions must remain guarded by `SAFE_WRITE_MODE=true`, `confirm=true`, and admin profile or action token.
- The pilot must remain reversible.

## Stage 37 Scope

Stage 37 is a readiness step for Liza/admin, Andrey, and Daniil visibility preview QA.

In scope:

- document the controlled runbook;
- make Settings copy clearer about optional/manual migration, enforcement off, dry-run preview, and paused pilot status;
- verify current safe behavior after any optional migration;
- document rollback and do-not-proceed conditions.

Out of scope:

- Stage 38;
- member-only dashboards;
- production dashboard filtering;
- automatic migration;
- changing write authorization.

## Runbook

### 1. Backup First

Before using the confirmed migration action, create a backup of the Google Sheet.

Minimum acceptable backup:

- duplicate the whole spreadsheet, or
- export/download the workbook, and
- record the backup name and time in the QA notes.

Do not proceed with any confirmed migration unless the backup opens and contains the `Tasks` tab.

### 2. Before Migration

1. Open the dashboard.
2. Sign in as Liza/admin.
3. Open Settings.
4. Confirm:
   - profile is verified;
   - visibility mode is `profile_only`;
   - `VISIBILITY_ENFORCEMENT=false`;
   - dashboard filtering says off/not applied;
   - pilot status says paused/not active;
   - task identity schema is partial;
   - missing columns are exactly `Collaborator Emails` and `Collaborator User IDs`.
5. Run task identity schema check from Settings.
6. Confirm no columns are added by simply opening the app or checking schema.
7. Create a task before migration and confirm it still writes successfully.
8. Confirm old tasks remain visible.

### 3. Optional Manual Migration

Migration is optional for Stage 37 and must be manual.

Only run it if:

- the Sheet backup is complete;
- Liza/admin explicitly approves the migration;
- Settings still reports missing optional identity columns;
- the user running it is verified admin or the request includes the action token;
- `SAFE_WRITE_MODE=true`.

Expected migration behavior:

- only missing optional identity columns are appended;
- existing columns are not reordered;
- existing columns are not renamed;
- existing columns are not duplicated;
- existing task rows remain visible.

Current expected appended columns:

```text
Collaborator Emails
Collaborator User IDs
```

### 4. After Migration

1. Open the `Tasks` tab.
2. Confirm only the missing optional columns were appended.
3. Confirm there are no duplicate identity columns.
4. Open the dashboard.
5. Confirm Settings schema is ready or no longer missing those two fields.
6. Create one Stage 37 test task.
7. Confirm the new row still has the legacy `Owner` value.
8. Confirm owner identity fields populate where owner can be resolved.
9. Confirm created-by identity fields populate for the signed-in creator.
10. Confirm collaborator fields can remain blank for the test task.
11. Confirm old tasks remain visible.

### 5. Pilot Preview

Run visibility preview only; do not enable real filtering.

Preview users:

- Liza/admin;
- Andrey;
- Daniil.

For each preview, record:

- user;
- role;
- total tasks;
- visible if enforced;
- hidden if enforced;
- legacy unclassified count;
- reason counts.

Expected behavior:

- Liza/admin preview can see all tasks.
- Andrey/Daniil preview may show fewer visible tasks.
- Legacy unclassified tasks are counted, not silently hidden.
- Real dashboard task lists remain unfiltered.
- `filteredByUser=false`.

### 6. Rollback Plan

If migration adds the two collaborator columns and a rollback is needed:

1. Stop pilot readiness testing.
2. Keep `VISIBILITY_ENFORCEMENT=false`.
3. Keep dashboard filtering off.
4. Use the backup as the source of truth.
5. Prefer hiding the appended optional columns during investigation.
6. Delete appended optional columns only after confirming they are the exact Stage 37 columns and no one has entered needed data into them.
7. If the web app regresses, redeploy the previous Apps Script version.

Rollback must not delete existing legacy task columns or task rows.

## QA Checklist

### A. Before Migration

- [ ] Sheet backup created and opened successfully.
- [ ] Dashboard opens.
- [ ] Liza/admin profile is verified.
- [ ] Visibility mode is `profile_only`.
- [ ] `VISIBILITY_ENFORCEMENT=false`.
- [ ] Real dashboard filtering is off.
- [ ] Pilot status is paused/not active.
- [ ] Schema is partial.
- [ ] Missing fields are `Collaborator Emails` and `Collaborator User IDs`.
- [ ] Opening dashboard/settings does not add columns.
- [ ] `createTask` works before migration.
- [ ] Old tasks remain visible.

### B. After Optional Migration

- [ ] Migration was run manually only.
- [ ] Migration required `confirm=true`.
- [ ] Migration required admin profile or action token.
- [ ] Only missing optional columns were appended.
- [ ] Existing columns were not reordered.
- [ ] Existing columns were not renamed.
- [ ] No duplicate identity columns were created.
- [ ] `createTask` works after migration.
- [ ] New task keeps legacy `Owner`.
- [ ] Owner identity fields populate where resolvable.
- [ ] Created-by identity fields populate for signed-in creator.
- [ ] Old tasks remain visible.

### C. Pilot Preview

- [ ] Liza/admin preview recorded.
- [ ] Andrey preview recorded.
- [ ] Daniil preview recorded.
- [ ] Legacy unclassified count reviewed.
- [ ] Reason counts reviewed.
- [ ] Real dashboard filtering remains off.
- [ ] `filteredByUser=false`.
- [ ] No employee-facing pilot has started.

### D. Rollback

- [ ] Backup location recorded.
- [ ] Exact appended columns recorded.
- [ ] Rollback owner assigned.
- [ ] Previous Apps Script deployment version known.
- [ ] Decision made to hide columns first before deleting.

## Do Not Proceed Warnings

Stop Stage 37 if any of these happen:

- no usable Sheet backup exists;
- Apps Script is not the redeployed Stage 36+ version;
- dashboard does not open;
- Liza/admin profile is not verified;
- visibility mode is not `profile_only`;
- `VISIBILITY_ENFORCEMENT` is true;
- dashboard filtering is on;
- migration tries to add columns on app load;
- migration would add duplicate identity columns;
- `createTask` fails before migration;
- old tasks disappear;
- preview results cannot be explained;
- Andrey/Daniil access is unclear or unapproved.

## Exit Criteria

Stage 37 is complete when:

- runbook has been followed;
- backup is confirmed;
- optional migration is either skipped with reasons or completed safely;
- post-migration `createTask` smoke test passes if migration was used;
- Liza/admin, Andrey, and Daniil dry-run previews are recorded;
- real dashboard filtering remains off;
- pilot remains paused until a later explicit go decision.

## Next Stage

Stage 38 may consider a controlled employee pilot or enforcement design only after Stage 37 evidence is reviewed. Do not implement Stage 38 in this stage.
