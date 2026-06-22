# Stage 33 — Google Identity Enforcement And Visibility Foundation

## Current Stage 32 State

Stage 32 is deployed and provides:

- `Users` sheet read model.
- `route=profile` and `route=me`.
- allowed domain `mfstream.io`.
- Settings/Profile backend identity status.
- Users sheet detection.

Stage 32 does not enforce dashboard visibility or write authorization by Google identity.

## What Stage 33 Implements

Stage 33 adds a safe enforcement foundation:

- frontend Google Identity Services sign-in hook using runtime `GOOGLE_CLIENT_ID`;
- Apps Script Google ID token verification through Google's tokeninfo endpoint;
- registered user lookup through the `Users` sheet;
- central role/permission helpers;
- identity-aware dashboard metadata;
- optional enforced mode for protected reads/writes;
- non-breaking default mode so the current live dashboard and task creation keep working.

## No-Secrets Rule

Do not commit OAuth client secrets.

Allowed runtime/config values:

```text
GOOGLE_CLIENT_ID
GOOGLE_ALLOWED_DOMAIN=mfstream.io
IDENTITY_ENFORCEMENT_MODE=profile_only
VISIBILITY_ENFORCEMENT=false
```

Apps Script may also read `GOOGLE_CLIENT_ID` from Script Properties.

## Google Client ID Setup

Frontend runtime config can include:

```js
window.BA_FOX_RUNTIME_CONFIG = {
  GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  GOOGLE_ALLOWED_DOMAIN: 'mfstream.io',
  IDENTITY_ENFORCEMENT_MODE: 'profile_only',
  VISIBILITY_ENFORCEMENT: false,
};
```

Apps Script Script Properties should include the same Client ID before audience enforcement QA:

```text
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

If `GOOGLE_CLIENT_ID` is missing, the UI must stay honest:

```text
Google-вход готовится
```

## Allowed Domain Rule

Only email addresses ending in:

```text
@mfstream.io
```

are accepted for workspace identity.

If a Google credential is valid but the email is outside the allowed domain, the profile route returns:

```text
domain_not_allowed
```

and the UI should show:

```text
Доступ запрещён: нужен аккаунт mfstream.io
```

## Token Verification Mode

Implemented now:

- frontend obtains a Google identity credential when `GOOGLE_CLIENT_ID` exists;
- frontend sends the credential to Apps Script as `idToken`;
- Apps Script calls Google's `tokeninfo` endpoint;
- Apps Script checks email, optional `email_verified`, optional audience match, allowed domain, Users row, and active status.

Important:

- this is real Google token validation through Google's endpoint;
- full hard enforcement is only safe after deployed OAuth/domain QA;
- default mode remains `profile_only`, not fully locked down.

## Users Sheet Lookup

Users are matched by normalized email in the `Users` sheet.

Registered active users can receive role permissions. Missing, inactive, wrong-domain, or invalid-token users get an honest profile response and no write permission from identity.

## Roles And Permissions

`admin`:

- can see all tasks;
- can create tasks;
- can manage Users metadata;
- can use dashboard.

`executive`:

- can see all tasks;
- can create tasks;
- can use dashboard.

`member`:

- can create tasks;
- can use dashboard;
- should see own/collaborator/created tasks once robust task identity columns exist.

`viewer`:

- can use dashboard when registered and active;
- read-only.

## Feature Flags

Identity modes:

```text
off
profile_only
soft
enforced
```

Default:

```text
profile_only
```

This keeps the live dashboard and current task creation path working.

`enforced` mode requires a verified Google token for protected dashboard and write routes.

## Profile Route Response

`route=profile` and `route=me` return:

- `identityMode`
- `profile`
- `allowedDomain`
- `isBackendEnforced`
- `enforcementMode`
- `backendEnforcementStatus`
- `usersSheet`
- `limitations`
- `permissions`
- `canSeeAll`
- `canCreateTasks`
- `canUseDashboard`
- `canManageUsers`
- `tokenVerification`

Expected identity modes include:

- `missing_token`
- `missing_active_user_email`
- `google_token_verified`
- `google_token_invalid`
- `domain_not_allowed`
- `user_not_registered`
- `user_inactive`
- `active_user_email_registered`

## Dashboard Visibility Model

Stage 33 adds identity metadata to dashboard responses:

- `visibilityMode`
- `filteredByUser`
- `effectiveRole`
- `canSeeAll`

Default behavior:

- dashboard still loads in `profile_only` and `soft` modes;
- `filteredByUser` remains `false`;
- unknown legacy tasks remain visible.

`enforced` behavior:

- dashboard requires a verified Google token and active registered user;
- robust member filtering still requires future task identity columns.

## Task Visibility Limitations

Current `Tasks` schema has an Owner label, but does not have robust identity columns.

Future columns needed for real member-level visibility:

- `ownerEmail` or `ownerUserId`
- `collaboratorEmails` or `collaboratorUserIds`
- `createdByEmail` or `createdByUserId`
- `visibility`

Until those exist, member visibility can only use the existing Owner/defaultOwnerLabel as a backwards-compatible fallback.

## Write Authorization Model

Current default:

- existing action token remains required;
- task creation still works through the current live flow;
- identity token is passed when available;
- identity actor is used in audit metadata where available.

`enforced` mode:

- requires verified Google token;
- requires active registered user;
- requires write permission;
- still keeps the action token check.

Viewer users are read-only.

## What Is Enforced Now

Now implemented:

- Google token can be verified by Apps Script.
- Domain check is implemented.
- Users sheet matching is implemented.
- Active/inactive user status is checked.
- Role permissions are computed centrally.
- Enforced mode can require a verified Google token.

## What Remains Not Enforced

Still not complete by default:

- dashboard is not filtered by user in `profile_only` mode;
- member-level task visibility is not robust without new task identity columns;
- write authorization is not identity-only;
- current action token remains part of write protection;
- employee pilot remains paused.

## Manual Deployment Notes

Apps Script changed. Redeploy is required.

Changed Apps Script files:

- `apps-script/Config.gs`
- `apps-script/IdentityService.gs`
- `apps-script/SheetsStore.gs`
- `apps-script/TaskService.gs`
- `apps-script/WebApp.gs`

Frontend/runtime files changed:

- `web/api/baFoxClient.js`
- `web/api/baFoxConfig.js`
- `web/api/baFoxMockData.js`
- `web/app.js`
- `web/config.example.js`

Manual setup:

1. Add the OAuth Client ID to frontend runtime config.
2. Add the same Client ID to Apps Script Script Properties as `GOOGLE_CLIENT_ID`.
3. Deploy a new Apps Script web app version.
4. Keep `IDENTITY_ENFORCEMENT_MODE=profile_only` for first QA.
5. Test `route=profile` with and without Google credential.
6. Only after QA, test `soft`, then separately test `enforced`.

## Manual QA Checklist

Without Google Client ID:

1. Open dashboard.
2. Confirm dashboard loads.
3. Open Settings/Profile.
4. Confirm UI says `Google-вход готовится`.
5. Confirm `Backend enforcement` says `Не завершён`.
6. Confirm task creation still works.
7. Confirm success modal says `Задача добавлена`.

With Google Client ID:

1. Click `Войти через Google`.
2. Sign in with `@mfstream.io`.
3. Confirm profile route returns `google_token_verified`.
4. Confirm UI says `Профиль подтверждён`.
5. Confirm role and permissions match the Users sheet.
6. Confirm wrong-domain account is rejected.
7. Confirm inactive/missing user is not treated as active.

Dashboard:

1. Confirm dashboard still loads in `profile_only`.
2. Confirm identity metadata is present.
3. Confirm `filteredByUser` is `false`.
4. Confirm owner and direction filters still work.

Writes:

1. Confirm create task works with existing action token.
2. Confirm task appears in `Все задачи`.
3. Confirm success modal still says `Задача добавлена`.
4. Confirm task actions/edit still require action token.

## Pilot Readiness Checklist

Pilot remains paused until:

- Google Client ID is configured and QA-tested;
- Liza can sign in as admin;
- Andrey and Daniil can sign in as registered active members;
- wrong-domain sign-in is rejected;
- current create task flow still works;
- dashboard read behavior is understood in `profile_only`;
- a decision is made on future task identity columns for real member visibility.

## Recommended Next Stage

Stage 34 should add the task identity schema needed for real member-level visibility:

- `ownerEmail` or `ownerUserId`
- `collaboratorEmails` or `collaboratorUserIds`
- `createdByEmail` or `createdByUserId`
- `visibility`

After that, backend filtering can move from prepared/soft metadata to real role-based task visibility.
