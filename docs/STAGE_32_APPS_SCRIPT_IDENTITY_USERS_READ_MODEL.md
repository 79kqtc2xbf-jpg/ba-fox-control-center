# Stage 32 — Apps Script Identity Verification And Users Read Model

## Purpose

Stage 32 moves identity from a frontend-only model to an Apps Script-backed profile/users read foundation.

This stage does not complete task visibility enforcement. It adds a safe `profile` / `me` read route, a `Users` sheet model, and backend helpers for reading the current Apps Script active user email when the deployment context exposes it.

## What Was Implemented

- Added Apps Script `Users` sheet config:
  - sheet name: `Users`
  - allowed domain: `mfstream.io`
  - column constants for the Users registry.
- Added `apps-script/IdentityService.gs` with helpers:
  - `getUsersSheet_()`
  - `getUsers_()`
  - `normalizeUserRecord_()`
  - `findUserByEmail_(email)`
  - `isAllowedWorkspaceEmail_(email)`
  - `getFallbackUserProfile_()`
  - `getCurrentUserProfile_(request, context)`
- Added safe read routes:
  - `route=profile`
  - `route=me`
- Added frontend client support for the profile route.
- Updated Settings/Profile to show backend profile route status when available.
- Added mock profile route response for local read-only preview.

## Users Sheet Schema

Preferred sheet name:

```text
Users
```

Headers, in this exact order:

| Column | Header |
| --- | --- |
| A | `userId` |
| B | `email` |
| C | `displayName` |
| D | `title` |
| E | `accessRole` |
| F | `status` |
| G | `department` |
| H | `defaultOwnerLabel` |
| I | `accentColor` |
| J | `canSeeAll` |
| K | `createdAt` |
| L | `updatedAt` |

## Initial Users

Use these rows as a setup checklist. Replace every placeholder email before live enforcement.

| displayName | title | accessRole | defaultOwnerLabel | canSeeAll |
| --- | --- | --- | --- | --- |
| Liza Kiseleva | Executive Support | `admin` | Лиза | `TRUE` |
| Andrey Zaytsev | HRG | `member` | Андрей | `FALSE` |
| Teodor Shoshiashvili | Co-founder, CEO | `executive` | Teodor | `TRUE` |
| Andrey Branov | Co-founder, Grusha Strategic | `executive` | Andrey Branov | `TRUE` |
| Aleksandra Pamukhina | CBDO | `member` | Aleksandra | `FALSE` |
| Daniil Lebedev | Analyst & Engineer | `member` | Даниил | `FALSE` |
| Karim Amirov | Product Owner · Grusha | `member` | Karim | `FALSE` |
| Ani Gevorgyan | Head of Operations | `member` | Ani | `FALSE` |
| Vitaliy Sushkov | CFO | `member` | Vitaliy | `FALSE` |
| Asya Sundareva | Junior Operations · High Risk | `member` | Asya | `FALSE` |

Use placeholder emails only while preparing:

```text
TODO_EMAIL@mfstream.io
```

Do not treat placeholder emails as real access records.

## Manual Users Sheet Setup

1. Create a `Users` tab in the bound Google Sheet.
2. Add the headers exactly as listed above.
3. Add the initial users.
4. Replace all placeholder emails with real `@mfstream.io` work emails.
5. Set `status` to `active` for enabled users.
6. Set `canSeeAll` to `TRUE` only for Liza, Teodor, and Andrey Branov initially.
7. Do not delete or rename the existing Owner column in `Tasks`.

Stage 32 does not include a public bootstrap route that writes the sheet. This avoids exposing setup writes through the web app route surface.

## Profile Route Behavior

Routes:

```text
?route=profile
?route=me
```

Response data includes:

- `identityMode`
- `profile`
- `allowedDomain`
- `isBackendEnforced`
- `usersSheet`
- `limitations`

Example identity modes:

| identityMode | Meaning |
| --- | --- |
| `missing_active_user_email` | Apps Script did not expose an active user email. |
| `active_user_email_wrong_domain` | Apps Script saw an email outside `mfstream.io`. |
| `users_sheet_missing` | Email/domain may be available, but `Users` sheet is missing. |
| `active_user_email_unregistered` | Email is from `mfstream.io`, but no Users row matched it. |
| `active_user_email_registered` | Email is from `mfstream.io` and matched a Users row. |
| `mock_profile_route` | Local frontend mock response. |

## Allowed Domain Rule

Allowed:

```text
*@mfstream.io
```

All other domains fail the domain check.

Important: if Apps Script does not expose a verified active user email, Stage 32 does not enforce access based on a user-provided email parameter.

## Identity Verification Status

Current PR state:

```text
Backend profile route implemented, but auth enforcement is not complete.
```

What is real now:

- Apps Script can attempt to read `Session.getActiveUser().getEmail()`.
- Apps Script checks whether that email ends with `@mfstream.io`.
- Apps Script reads the `Users` sheet and matches by email.
- The profile route reports identity mode and limitations honestly.

What is not complete:

- Google Identity Services token verification is not implemented.
- Dashboard reads are not filtered by role/user.
- Writes are not authorized by Google identity.
- `createTask`, `taskAction`, and `editTask` still rely on existing safe-write/action-token behavior.
- Users sheet setup is manual.

## Apps Script Deployment Notes

`Session.getActiveUser().getEmail()` can be blank depending on:

- web app execution mode;
- who the app is deployed as;
- Workspace/domain settings;
- whether the user is in the same Google Workspace domain;
- consent and deployment configuration.

Manual deployment QA must check the actual deployed web app behavior with a real `@mfstream.io` account.

Apps Script redeploy is required after merging this stage because Apps Script files changed.

## Manual QA Checklist

1. Deploy a new Apps Script web app version.
2. Open:

```text
<WEB_APP_URL>?route=profile
```

3. Open:

```text
<WEB_APP_URL>?route=profile&callback=BAFoxJsonpCallback_1
```

4. Confirm both return `ok: true`.
5. Confirm `allowedDomain` is `mfstream.io`.
6. Confirm `isBackendEnforced` is `false`.
7. Confirm `identityMode` is honest for the deployment context.
8. Create/populate the `Users` sheet.
9. Retest `route=profile`.
10. If active user email is available, confirm the matching Users row is returned.
11. Confirm dashboard routes still load.
12. Confirm `createTask` still works with the existing action token flow.
13. Confirm no Telegram behavior changed.

## Frontend QA Checklist

1. Open the dashboard.
2. Confirm dashboard loads even if profile route fails.
3. Open `Настройки`.
4. Confirm profile/settings render.
5. Confirm backend profile route status appears when available.
6. Confirm success modal text remains `Задача добавлена`.
7. Confirm owner filter and direction filter still render.
8. Confirm product attribution remains visible.

## What Moves To Stage 33

Recommended Stage 33:

```text
Backend-enforced dashboard visibility.
```

Scope:

- Add approved task identity fields:
  - `ownerEmail` or `ownerUserId`
  - `collaboratorEmails` or `collaboratorUserIds`
  - `createdByEmail` or `createdByUserId`
  - `visibility`
- Preserve existing Owner label.
- Filter dashboard reads by current profile role.
- Keep admin/executive full visibility.
- Make member visibility explicit and testable.

## What Moves To Stage 34

Recommended Stage 34:

```text
Google Identity Services token verification and write authorization.
```

Scope:

- Verify frontend Google ID token server-side.
- Decide whether to continue using Apps Script active user email or explicit ID token verification.
- Enforce write permissions for `createTask`, `taskAction`, and `editTask`.
- Add collaborator/co-participant UI after backend visibility is stable.
- Align Telegram identity mapping after web auth is reliable.
