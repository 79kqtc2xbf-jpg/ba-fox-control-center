# Stage 31 — Identity, Users, Roles, Profile Foundation

## Current State

Stage 30 team dashboard architecture is in place, but the external pilot with Andrey and Daniil remains paused.

Before a real team pilot, BA Fox needs a real identity foundation. Stage 31 prepares that foundation without pretending that frontend UI equals security.

Current implementation state:

- Dashboard reads and task creation continue to use existing routes.
- Owner assignment still uses the existing Owner label.
- Google login is prepared in UI/runtime config, but is not backend-enforced yet.
- Apps Script does not yet verify Google identity tokens.
- Users registry is modeled and documented, but not yet persisted/enforced by Apps Script.
- Profile accent color still uses browser `localStorage` fallback, now scoped by signed-in email when available.

## Decisions From Liza

- Users will sign in with Google Workspace accounts.
- Allowed domain: `mfstream.io`.
- All users from `mfstream.io` should be eligible for access.
- Role/profile data should come from a controlled `Users` registry.
- Liza Kiseleva is system/product admin.
- Teodor Shoshiashvili and Andrey Branov should have full visibility.
- Regular members should see their own/participating tasks after backend enforcement.
- True pilot must not start until identity and visibility enforcement are ready.

## Runtime Config

Frontend runtime config now has prepared identity fields:

```js
GOOGLE_CLIENT_ID: ''
GOOGLE_ALLOWED_DOMAIN: 'mfstream.io'
```

`GOOGLE_CLIENT_ID` is not a secret, but it should still be supplied through runtime config rather than hardcoded into app logic.

## Users Sheet Model

Preferred sheet name:

```text
Users
```

Suggested columns:

| Column | Purpose |
| --- | --- |
| `userId` | Stable internal user id. |
| `email` | Google Workspace email. |
| `displayName` | Human-readable name. |
| `title` | Business title. |
| `accessRole` | `admin`, `executive`, `member`, or `viewer`. |
| `status` | `active`, `paused`, or future lifecycle status. |
| `department` | Current department/direction label. |
| `defaultOwnerLabel` | Backward-compatible Owner label used in existing tasks. |
| `accentColor` | Account-level UI color preference. |
| `canSeeAll` | Explicit full-visibility flag. |
| `createdAt` | Registry row creation timestamp. |
| `updatedAt` | Registry row update timestamp. |

## Initial Users Registry

Emails are placeholders until Liza replaces them with real `mfstream.io` addresses.

| userId | email | displayName | title | accessRole | department | defaultOwnerLabel | accentColor | canSeeAll |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `user_liza_kiseleva` | `TODO_LIZA@mfstream.io` | Liza Kiseleva | Executive Support | `admin` | Админ / EA | Лиза | green | true |
| `user_andrey_zaytsev` | `TODO_ANDREY_ZAYTSEV@mfstream.io` | Andrey Zaytsev | HRG | `member` | Операции | Андрей | blue | false |
| `user_teodor_shoshiashvili` | `TODO_TEODOR@mfstream.io` | Teodor Shoshiashvili | Co-founder, CEO | `executive` | Руководство | Teodor | cyan | true |
| `user_andrey_branov` | `TODO_ANDREY_BRANOV@mfstream.io` | Andrey Branov | Co-founder, Grusha Strategic | `executive` | Руководство | Andrey Branov | violet | true |
| `user_aleksandra_pamukhina` | `TODO_ALEKSANDRA@mfstream.io` | Aleksandra Pamukhina | CBDO | `member` | Продажи / партнёры | Aleksandra | magenta | false |
| `user_daniil_lebedev` | `TODO_DANIIL@mfstream.io` | Daniil Lebedev | Analyst & Engineer | `member` | Продукт / IT | Даниил | cyan | false |
| `user_karim_amirov` | `TODO_KARIM@mfstream.io` | Karim Amirov | Product Owner · Grusha | `member` | Продукт / IT | Karim | orange | false |
| `user_ani_gevorgyan` | `TODO_ANI@mfstream.io` | Ani Gevorgyan | Head of Operations | `member` | Операции | Ani | green | false |
| `user_vitaliy_sushkov` | `TODO_VITALIY@mfstream.io` | Vitaliy Sushkov | CFO | `member` | Финансы / платежи | Vitaliy | yellow | false |
| `user_asya_sundareva` | `TODO_ASYA@mfstream.io` | Asya Sundareva | Junior Operations · High Risk | `member` | Операции | Asya | blue | false |

## Role Mapping

| Role | Initial users | Intended visibility |
| --- | --- | --- |
| `admin` | Liza Kiseleva | Full visibility and system settings after backend enforcement. |
| `executive` | Teodor Shoshiashvili, Andrey Branov | Full visibility after backend enforcement. |
| `member` | Everyone else initially | Own tasks, collaborator tasks, and possibly created tasks after task identity fields exist. |
| `viewer` | None initially | Read-only future role. |

## Visibility Model

Target rules:

- `admin` and `executive` can see all tasks.
- `member` can see:
  - tasks where owner email/userId matches current user;
  - tasks where collaborator/co-participant includes current user;
  - optionally tasks created by current user, depending on final rule.
- `viewer` is read-only.

Current `Tasks` sheet does not safely support these rules yet because it only has a backward-compatible Owner label. Do not silently overload unrelated fields.

Future task columns required for real enforcement:

- `ownerEmail` or `ownerUserId`
- `collaboratorEmails` or `collaboratorUserIds`
- `createdByEmail` or `createdByUserId`
- `visibility`

Existing Owner label should remain for backward compatibility and human-readable dashboard display.

## Profile And Accent Color

Target persistence:

- `Users.accentColor` = account-level color preference.
- Browser `localStorage` = temporary fallback only.

Stage 31 implementation:

- Accent color remains local-only.
- The fallback key is now scoped by signed-in email when a verified/local preview email exists.
- Without sign-in, fallback uses a `not_signed_in` key.
- The Settings UI clearly says localStorage is browser-only and does not change permissions.

## What Is Implemented Now

- Runtime config fields for `GOOGLE_CLIENT_ID` and `GOOGLE_ALLOWED_DOMAIN`.
- Frontend Users registry constants with the initial user list and roles.
- Settings/Profile UI with:
  - `Профиль`
  - `Вход через Google`
  - `Рабочий аккаунт`
  - `Роль доступа`
  - `Должность`
  - `Цвет интерфейса`
  - `Google-вход готовится`
  - `Войти через Google`
  - `Выйти`
- Honest frontend status that Google login is prepared only.
- User-scoped localStorage fallback for personalization.
- Users sheet model shown in Settings and documented here.

## What Is Only Prepared

- Google Identity Services login.
- Backend verification of Google identity token.
- Domain enforcement for `mfstream.io`.
- User lookup from the real `Users` sheet.
- Per-user task filtering.
- Account-level accent color persistence.
- Role-based read/write protection.
- Telegram identity alignment.

## Security / Honesty Statement

Stage 31 does not implement real backend-enforced Google login.

Current state:

```text
Google login prepared but not enforced.
```

The frontend can show the planned model, but it must not be treated as access control. Protected data must remain protected by Apps Script after token verification is implemented.

## Apps Script Status

Apps Script was not changed in this stage.

Apps Script redeploy is not required for this stage.

## What Blocks Pilot

- Real Google Identity Services login.
- Apps Script token verification.
- Domain check for `mfstream.io`.
- Real `Users` sheet.
- Replacement of placeholder emails.
- Role lookup from `Users`.
- Task identity fields for owner/collaborator/creator.
- Backend-enforced visibility filtering.
- Backend-enforced write permissions.
- Telegram bot alignment.

## Stage 32

Recommended Stage 32:

```text
Implement Apps Script identity verification and Users sheet read model.
```

Scope:

- Add `Users` sheet read helpers.
- Verify Google identity token server-side.
- Enforce `mfstream.io` domain.
- Return current user profile from Apps Script.
- Keep existing task routes working while identity is introduced behind safe compatibility flags.

## Stage 33

Recommended Stage 33:

```text
Implement task visibility fields and backend-enforced filtered dashboard reads.
```

Scope:

- Add task identity fields after schema approval.
- Preserve existing Owner label.
- Filter dashboard reads by role and task participation.
- Add collaborator/co-participant UI.
- Align Telegram bot identity mapping after web enforcement is stable.
