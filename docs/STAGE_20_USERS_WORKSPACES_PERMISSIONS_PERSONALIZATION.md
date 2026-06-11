# Stage 20: Users, Workspaces, Permissions and Personalization Architecture

## Purpose

Stage 20 defines the future architecture for users, workspaces, permissions, Google login, and profile personalization in MF Group Tracker.

This is a documentation-only stage. It does not change the web app, Apps Script, Google Sheets, Telegram bot, Gmail integrations, or any live write behavior.

## 1. Product Decision

MF Group Tracker must support multiple users.

The initial team size is small, around 9 people. The system should support team operations without overbuilding enterprise identity and access management too early.

The recommended access model is simple workspace-based access:

- One main MF Group workspace first.
- Users belong to workspaces through workspace memberships.
- Workspace membership determines role, department, status, and operational permissions.
- Personalization is stored separately from permissions.
- Colors are user preferences and visual cues, not access-control logic.

Important personalization decision:

- Do not pre-assign a unique color to each employee.
- Users should choose their own profile customization.
- Workspace can provide defaults, but each user can personalize their own experience.
- External interactions use one fixed external marker color.

## 2. Core Concepts

### User

A person who can log in to MF Group Tracker. A user has identity fields such as email, Google account id, display name, status, and login timestamps.

### Workspace

A shared operational space. The first workspace should be the main MF Group workspace. Future workspaces can be added later without changing the core user model.

### Workspace Membership

The relationship between a user and a workspace. Membership stores the user's role, department, title, status, and notification preferences inside that workspace.

### Department

An organizational unit inside a workspace, such as Operations, Finance, Legal, Sales / Real Estate, Marketing / Presentations, or Compliance / Onboarding.

### Role

A simple named permission level inside a workspace. Stage 20 recommends: `admin`, `manager`, `department_lead`, `employee`, and `viewer`.

### Permission

A concrete capability, such as viewing tasks, assigning tasks, editing department tasks, reviewing reports, or managing workspace settings.

### Profile

A user's personal settings, separate from workspace membership. Profile settings include theme, accent color, timezone, language, compact mode, and dashboard preferences.

### Theme

A UI preset that controls the broad visual mode. Allowed values are `neon_dark`, `classic_dark`, and `light`.

### Accent Color

A user-selected approved accent color. Allowed values are `cyan`, `green`, `blue`, `violet`, `yellow`, `orange`, and `magenta`.

### External Marker

A fixed visual marker for external counterparties, vendor blockers, outside-company owners, and external dependencies. This is not user-customizable.

## 3. Workspace Model

The first implementation should support one main workspace:

- `MF Group`

The architecture should leave room for multiple workspaces later:

- `MF Group`
- `Grusha`
- `MF Corporation`
- `Prominds`
- `Test / Sandbox`

Workspace support should include:

- Shared workspace tasks.
- Workspace-level settings.
- Workspace default theme.
- Workspace members.
- Workspace departments.
- Workspace-level role and permission policy.

Recommended workspace fields:

| Field | Purpose |
| --- | --- |
| workspace_id | Stable workspace id. |
| workspace_name | Display name, such as MF Group. |
| status | Active, paused, archived. |
| default_theme_preset | Default theme for members without personal override. |
| default_timezone | Default timezone for workspace reporting and reminders. |
| settings_json | Compact workspace-level settings. |
| created_at | Creation timestamp. |
| updated_at | Last update timestamp. |

Design notes:

- Workspace ids should be stable and not derived from display names.
- Tasks should eventually include `workspace_id`.
- Departments should eventually belong to a workspace.
- Multi-workspace support should not be exposed in the UI until there is a real operational need.

## 4. User Model

Recommended fields:

| Field | Purpose |
| --- | --- |
| user_id | Stable internal user id. |
| email | Login email address. |
| google_account_id | Stable Google account subject/id from Google login. |
| display_name | Name shown in the UI. |
| full_name | Full working name. |
| avatar_url | Optional Google or uploaded avatar URL. |
| status | Active, invited, suspended, inactive, archived. |
| default_workspace_id | Workspace opened by default after login. |
| created_at | Creation timestamp. |
| updated_at | Last update timestamp. |
| last_login_at | Last successful login timestamp. |

Design notes:

- `google_account_id` should be preferred over email as the durable Google identity key.
- Email can change; internal references should use `user_id`.
- `display_name` should be editable by the user or admin.
- App permissions should come from workspace membership, not the global user record.

## 5. Workspace Membership Model

Recommended fields:

| Field | Purpose |
| --- | --- |
| workspace_id | Workspace the user belongs to. |
| user_id | User in the workspace. |
| department_id | Department assignment inside the workspace. |
| role | `admin`, `manager`, `department_lead`, `employee`, or `viewer`. |
| title | Working title inside the workspace. |
| status | Active, invited, suspended, removed. |
| joined_at | Membership start timestamp. |
| invited_by | User id of inviter. |
| notification_preferences | Workspace-specific notification preferences. |

Design notes:

- A user may eventually belong to more than one workspace.
- A user can have different roles in different workspaces.
- Department assignment belongs to membership because it can differ per workspace.
- Membership status should be checked before allowing access to workspace data.

## 6. Profile Personalization Model

Recommended fields:

| Field | Purpose |
| --- | --- |
| user_id | User whose profile is being customized. |
| theme_preset | UI theme preset. |
| accent_color | User-selected approved accent color. |
| avatar_mode | Google avatar, initials, uploaded, or hidden. |
| compact_mode | Boolean preference for denser UI. |
| timezone | User timezone for personal reminders and date display. |
| language | UI language preference. |
| personal_dashboard_preferences | Compact JSON or structured settings for dashboard layout. |

Allowed `theme_preset` values:

- `neon_dark`
- `classic_dark`
- `light`

Allowed `accent_color` values:

- `cyan`
- `green`
- `blue`
- `violet`
- `yellow`
- `orange`
- `magenta`

Design notes:

- Do not hardcode accent colors per employee.
- Do not use accent color to determine permissions.
- Workspace default theme applies only when the user has not chosen a personal theme.
- Personalization should be safe to reset without affecting tasks, reports, permissions, or audit history.

## 7. External Color Rule

External dependencies always use one fixed external color.

Recommended external color:

- Amber/orange.

This color should visually mean:

- External counterparty.
- External blocker.
- External dependency.
- Outside-company owner.
- Vendor or partner waiting state.

External marker rules:

- External color is not customizable per user.
- External color is not assigned to an employee.
- External color should not be used for internal departments.
- External color should not be confused with priority.
- External color should not be used for permission logic.

Example uses:

- Waiting on bank confirmation.
- Vendor blocker.
- External counterparty needs to sign.
- Outside-company document pending.
- Partner agency has not replied.

## 8. Google Login Architecture

Recommended plan:

- Login via Google account / Gmail.
- Allow any Gmail initially for early internal testing.
- Later optionally restrict access by domain or invite list.
- Store no passwords in MF Group Tracker.
- Map Google account identity to internal `user_id`.
- Link Telegram identity later through a separate verified mapping flow.

Login flow:

1. User signs in with Google.
2. App receives verified Google identity.
3. App looks up or creates a `User` record.
4. App checks workspace memberships.
5. App opens the user's default workspace if active.
6. App applies workspace role and personal profile settings.

Security notes:

- Do not trust email text alone if Google provides a stable account subject/id.
- Suspended users should not access workspace data even if Google login succeeds.
- Invite-list restriction can be added after the first internal prototype.
- Telegram identity should not be automatically trusted from username alone.

## 9. Permissions Model

Keep the permission model simple for a 9-person team.

| Role | Can view | Can create | Can assign | Can edit own tasks | Can edit department tasks | Can edit all tasks | Can manage users | Can review reports | Can manage workspace settings |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| admin | All workspace data | Yes | Yes, all | Yes | Yes | Yes | Yes | Yes | Yes |
| manager | All workspace operational data | Yes | Yes, all | Yes | Yes | Yes, except admin-only settings | No, except invite/request flow if enabled | Yes, all reports | Limited management settings |
| department_lead | Own department, own tasks, assigned/collaborated tasks, permitted cross-department dependencies | Yes | Yes, within department; request cross-department assignment | Yes | Yes | No | No | Yes, department reports | No |
| employee | Own tasks, collaborated/watched tasks, permitted department-visible tasks | Yes, if enabled | Self-assign or request assignment | Yes | No, except assigned tasks | No | No | Own reports before submission | No |
| viewer | Read-only permitted workspace views | No | No | No | No | No | No | No | No |

Permission notes:

- Permissions should be enforced in Apps Script or a backend layer, not only by hiding UI.
- Frontend role checks are useful for UI clarity but are not security boundaries.
- Role should come from workspace membership.
- Admin should be rare.
- Manager and admin should not be treated as the same role.
- Department leads should not automatically see private management settings.

## 10. Data Storage Recommendation

The current source is Google Sheets / Apps Script. For a future implementation, document these simple tabs:

- `Users`
- `Workspaces`
- `Workspace Members`
- `User Profiles`
- `Permissions`
- `Theme Presets`

Do not create these tabs yet.

Suggested tab purpose:

| Tab | Purpose |
| --- | --- |
| Users | Global user identity and Google login mapping. |
| Workspaces | Workspace records and workspace-level defaults. |
| Workspace Members | User-to-workspace membership, role, department, and membership status. |
| User Profiles | Personal theme, accent color, timezone, language, compact mode, and dashboard preferences. |
| Permissions | Simple role-to-permission matrix, initially mostly documentation/config. |
| Theme Presets | Approved theme presets and accent options. |

Storage notes:

- Keep the first implementation simple.
- Avoid row-level permission complexity in Sheets until real usage requires it.
- Prefer stable ids over display names.
- Treat Sheets as the source of operational truth only until a stronger backend is needed.

## 11. UI Implications

Future Settings should include:

- My Profile.
- Theme selection.
- Accent color selection.
- Workspace settings.
- Members.
- Roles.
- Departments.
- External marker explanation.

Recommended Settings structure:

| Settings area | Purpose |
| --- | --- |
| My Profile | Display name, avatar mode, timezone, language, compact mode. |
| Appearance | Theme preset and accent color selector. |
| Workspace | Workspace name, default theme, default timezone, workspace status. |
| Members | Workspace member list, status, role, department, title. |
| Roles | Simple role matrix explanation. |
| Departments | Department list and department leads. |
| External Marker | Explanation of fixed amber/orange external marker. |

UI rules:

- User accent color can style personal highlights, avatar rings, focus affordances, and small profile accents.
- Shared operational states should use system colors, not each user's accent.
- External dependencies should always use the fixed external marker color.
- Critical/blocker states should remain visually distinct from external dependency states.

## 12. Migration From Current Mock

Stage 19 mock should evolve as follows:

- Current mock employees become workspace members.
- Current mock departments remain departments.
- Current mock role labels become workspace membership roles.
- Current mock task owners should eventually reference `user_id`.
- Current mock department fields should eventually reference `department_id`.
- Current mock accent colors become user-chosen profile settings.
- External items use the fixed external marker.

Mapping examples:

| Stage 19 mock concept | Stage 20 architecture concept |
| --- | --- |
| Lisa / Operations | User + Workspace Member + Department assignment. |
| Teodor / Management | User + Manager membership. |
| Finance owner | User + Finance department membership. |
| Legal owner | User + Legal department membership. |
| Sales / Real Estate lead | User + Sales / Real Estate department membership. |
| Marketing / Presentations lead | User + Marketing / Presentations department membership. |
| Compliance / Onboarding owner | User + Compliance / Onboarding department membership. |
| Mock colors | User profile preferences, not hardcoded employee colors. |
| External blockers | Fixed amber/orange external marker. |

## 13. Risks

### Overbuilding Auth Too Early

The team is small. Building enterprise IAM too early would slow the product down. Start with Google login, workspace membership, and a simple role matrix.

### Google Login Setup Complexity

OAuth setup, redirect URLs, and Apps Script integration can become fiddly. Stage 21 should stay mock/read-only and avoid real auth setup until the data contract is clearer.

### Permission Confusion

Users may confuse visual access with actual security. Permissions must eventually be enforced in the backend/API layer.

### Personal Theme vs Shared Workspace Theme

Users may expect their theme to change shared workspace meaning. Personal themes should affect personal UI presentation only, not shared operational state.

### External Color Misuse

Amber/orange should consistently mean external dependency or outside-company interaction. If used for priority, warnings, and external state all at once, the signal will become noisy.

### Privacy Expectations

Team dashboards create visibility. The product should clearly define what employees, department leads, managers, and admins can see.

### Future Multi-Workspace Complexity

Multiple workspaces may eventually be useful, but exposing them too early can complicate navigation, permissions, reporting, and task assignment.

## 14. Recommended Stage 21

Recommended next stage:

**Stage 21: Read-Only Frontend Personalization Mock**

Stage 21 should be a frontend-only mock that demonstrates profile personalization without real auth.

Suggested Stage 21 scope:

- Theme switcher.
- Accent color selector.
- Profile/settings mock.
- External marker visible in dependency and blocker UI.
- Workspace default theme preview.
- No real Google login yet.
- No real permissions enforcement yet.
- No Apps Script changes.
- No Google Sheet tab creation.
- No secrets.

Stage 21 should prove the user experience before connecting Google login, profile storage, or workspace membership data.

## Validation Checklist

- Documentation only.
- No web files changed.
- No Apps Script changed.
- No Google Sheet tabs created.
- No Google login implemented.
- No secrets added.
- No Telegram bot changes.
- `git diff --check` passes.
- Documentation reviewed against Stage 20 requirements.
