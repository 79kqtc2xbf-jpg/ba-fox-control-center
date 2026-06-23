# Stage 36 — Visibility Dry-Run And Task Identity Migration

## Current State

Google OAuth is available for the web dashboard and `route=profile` can return `google_token_verified` after Apps Script has UrlFetchApp permission and the runtime Google Client ID is configured.

Stage 36 keeps the safe default:

- `IDENTITY_ENFORCEMENT_MODE=profile_only`
- `backendEnforcementStatus=partial`
- dashboard task lists are not filtered by user
- existing action-token write path is preserved
- optional task identity columns are not required for task creation

Pilot with Andrey and Daniil remains paused.

## Optional Task Identity Columns

Recommended optional `Tasks` columns:

```text
Owner Email
Owner User ID
Collaborator Emails
Collaborator User IDs
Created By Email
Created By User ID
Visibility
```

Stage 36 adds schema inspection through `route=taskIdentitySchema`. The response reports:

- whether each optional identity column is present;
- the exact header found and column index;
- missing headers;
- whether the legacy Tasks shape is safe to migrate;
- whether migration is already done;
- whether optional identity write is active.

Task creation still works if none of these columns exist. If some or all optional columns already exist, `createTask` fills the available owner/creator identity fields best-effort.

## Safe Migration Flow

Migration never runs on dashboard load.

`route=prepareTaskIdentityColumns` is dry-run by default. Actual column creation requires:

- `SAFE_WRITE_MODE=true`;
- `confirm=true`;
- action token or a Google-verified admin profile.

The helper appends missing optional columns after the current used columns. It does not reorder, rename, or delete existing columns.

## Visibility Dry-Run

Stage 36 adds dry-run visibility calculation only. It does not change the live task list.

Rules:

- `admin` and `executive` see all tasks.
- `member` can see a task when owner email, owner user ID, owner label, collaborator email, collaborator user ID, created-by email, or created-by user ID matches the profile.
- unknown legacy tasks are counted as `legacy_unclassified`.
- `viewer` stays conservative and read-only.

Dashboard metadata includes a current-user dry-run preview with `filteredByUser=false`.

Admin impersonation preview is available through `route=visibilityPreview` with `previewUserId`, gated by Google-verified admin profile. The frontend labels it `Предпросмотр видимости`, `Dry-run`, and `Фильтрация не применена к реальному дашборду`.

## Active Users Preview List

`route=activeUsers` returns safe active user summaries for Google-verified admin settings only:

- `userId`
- `email`
- `displayName`
- `accessRole`
- `defaultOwnerLabel`
- `department`
- `status`

No tokens or secrets are returned.

## Performance Instrumentation

Backend responses now include safe timing metadata:

- dashboard duration;
- dashboard sheet read duration;
- createTask total duration;
- createTask sheet write duration when available.

Frontend measures:

- submit-to-response time for task creation;
- dashboard refresh time after create/action;
- calm slow-save copy after five seconds.

Example UI text:

```text
Создание задачи: 2.4 сек
Обновление дашборда: 1.1 сек
Сохраняю задачу, Apps Script может отвечать несколько секунд…
```

## Manual QA Checklist

### A. Before Adding Columns

- Dashboard loads.
- Profile remains `google_token_verified` for Liza/admin after sign-in.
- Settings shows identity schema missing or partial.
- `createTask` works.
- No filtering is active.

### B. After Optional Column Migration

- Columns are appended, not reordered.
- Dashboard still loads.
- `createTask` works.
- New task populates identity fields where available.
- Old tasks remain visible.

### C. Visibility Dry-Run

- Admin preview sees all tasks.
- Member preview shows lower or expected visible count.
- Legacy tasks are counted as unclassified, not silently hidden.
- Actual dashboard remains unfiltered.

### D. Performance

- Task creation duration is visible in Settings or after task creation.
- Dashboard refresh duration is visible in Settings.
- Slow createTask does not falsely show failure if the operation succeeds.

## Rollback

- If migration adds columns, rollback is hiding or deleting the appended optional columns after a sheet backup. Avoid deleting during active QA.
- If frontend preview fails, `profile_only` mode keeps dashboard usable.
- If Apps Script deployment fails, revert to the previous deployment version.
- Do not switch to enforced mode until OAuth, dry-run counts, schema QA, and pilot checks pass.

## Pilot Readiness

Before Andrey/Daniil pilot:

- OAuth profile QA passes for Liza/admin.
- Optional identity columns are present or migration dry-run is reviewed.
- Member dry-run counts look reasonable.
- Legacy unclassified count is understood.
- Performance timings are observed during task creation.
- Product attribution remains visible.

## What Remains Before Pilot

Stage 37 should run optional identity column migration live QA and controlled Andrey/Daniil pilot readiness. Do not enable production member filtering until Stage 37 passes.
