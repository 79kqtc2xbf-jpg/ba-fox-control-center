# Stage 39 — Secure Full Test Contour

## Goal

Prepare one controlled test contour where approved MF Group users can:

- sign in with a registered `@mfstream.io` Google account;
- view the live dashboard;
- create a task;
- edit safe task fields;
- change status and reminder;
- verify task identity fields in `Tasks`;
- test role and visibility behavior without any GitHub token.

Do not invite employees until every release gate below passes.

## Security Model

- GitHub Pages must never serialize `BA_FOX_ACTION_TOKEN`.
- Browser writes require a Google ID token that the Apps Script backend verifies.
- The verified email must belong to `mfstream.io`.
- The user must exist in `Users`, be active, and have a write-capable role.
- A server-side action token remains an optional legacy integration fallback only. It is never delivered to the browser.
- Before Google sign-in, the web UI must show a read-only state and disable write controls.
- `SAFE_WRITE_MODE=true` remains required for every supported write.

## Release Gates

### 1. Source and deployment

- [ ] Both GitHub Pages workflows contain no `BA_FOX_ACTION_TOKEN`.
- [ ] Automated secure-write tests pass.
- [ ] Apps Script contains the Google-profile write authorization change.
- [ ] Apps Script `GOOGLE_CLIENT_ID` is configured for audience validation.
- [ ] New Apps Script deployment is live.
- [ ] New GitHub Pages deployment is live.
- [ ] Published runtime configuration contains no action-token key or value.

### 2. Identity

- [ ] Liza signs in as `google_token_verified`.
- [ ] Liza resolves to an active registered `admin`.
- [ ] Wrong-domain account is denied.
- [ ] Unregistered `@mfstream.io` account is denied.
- [ ] Sign-out disables all write controls.

### 3. Task identity schema

- [ ] Verified backup opens and contains `Tasks`.
- [ ] Pre-migration schema is the expected seven-column missing state.
- [ ] Liza explicitly approves the manual migration.
- [ ] Migration runs with `confirm=true` and verified admin identity.
- [ ] Exactly seven optional identity columns are appended once.
- [ ] Existing columns are not renamed or reordered.

### 4. Full write smoke test

- [ ] Create one clearly named Stage 39 QA task.
- [ ] New task appears in `Все задачи`.
- [ ] Legacy `Owner` is populated.
- [ ] `Owner Email` and `Owner User ID` populate when the owner resolves.
- [ ] `Created By Email` and `Created By User ID` identify the signed-in creator.
- [ ] Safe edit succeeds.
- [ ] Status change succeeds.
- [ ] Reminder/snooze succeeds.
- [ ] Audit records are created.
- [ ] Existing tasks remain visible and unchanged.

### 5. Employee readiness

- [ ] Andrey exists in `Users` with the correct email, owner label, active status, and role.
- [ ] Daniil exists in `Users` with the correct email, owner label, active status, and role.
- [ ] Both accounts sign in as `google_token_verified`.
- [ ] Both can create and update only through the verified-profile path.
- [ ] Visibility preview counts are recorded and explained.
- [ ] A final go/no-go decision is recorded before sharing the dashboard link.

## Stop Conditions

Stop testing and do not invite employees if:

- a browser-delivered action token reappears;
- Apps Script does not validate the token audience;
- Google sign-in is not `google_token_verified`;
- a wrong-domain, unregistered, inactive, or viewer profile can write;
- migration differs from the seven expected append-only columns;
- task creation, edit, status, reminder, or audit verification fails;
- old tasks disappear or existing columns change.

## Rollback

1. Keep the verified spreadsheet backup unchanged.
2. Keep employee access paused.
3. Keep visibility enforcement off until identity evidence is accepted.
4. Redeploy the previous Apps Script version if the write authorization change regresses.
5. Redeploy the previous GitHub Pages version if the frontend regresses.
6. Prefer hiding newly appended identity columns during investigation; delete them only after confirming they contain no required data.

