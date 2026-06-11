# Stage 18: MF Group Tracker Schema Design and Migration Plan

## Purpose

Stage 18 defines the future Google Sheet schema and migration plan for the product pivot from EA FOX personal tracker to MF Group Tracker.

This is a documentation-only stage. It does not change the existing app behavior, Apps Script API, web files, Telegram flows, or Google Sheet tabs.

## Product Direction

MF Group Tracker is a team operations tracker built on the existing EA FOX foundation:

- Google Sheet as the operational data store.
- Apps Script API as the backend layer.
- Existing web shell as the future team interface.
- Existing reporting and Telegram concepts as reusable workflow foundations.

Personal task management should not move into MF Group Tracker. Personal tasks belong in Google Tasks and Google Calendar. MF Group Tracker should track team-visible work, ownership, dependencies, follow-up, reporting, and management visibility.

## 1. Current State Summary

The existing `Tasks` sheet is EA/personal-oriented. It was designed around a single user's control loop rather than a multi-person operations model.

Existing fields include task id, category, organization/contact, task, next action or steps, priority, deadline/control date, status, reminder, comment, channel, and related task management metadata. Some fields are Russian-language operational fields, such as task title, steps for Lisa, organization/contact, status, priority, and outcome/comment.

The current web app is still single-user oriented. It can, however, become the foundation for a team tracker because it already has useful primitives:

- A read-oriented task shell.
- Sheet-backed data access.
- Filtering and status-oriented task views.
- Reporting concepts.
- Integration ideas for Telegram and reminders.

The pivot should reuse this foundation while introducing explicit team concepts: employees, departments, ownership, visibility, dependencies, report generation, and permission-aware views.

## 2. Target System Model

MF Group Tracker must support team operations rather than personal task capture.

The target model must support:

- Individual task ownership, with every active task assigned to a responsible employee.
- Team and department visibility, so department leads can see work inside their area.
- A manager dashboard for cross-team status, deadlines, blockers, and reporting.
- Cross-department dependencies, including who or which department is blocking progress.
- Daily and weekly reporting from task activity and manual edits.
- Telegram identity mapping so bot interactions can resolve to employees safely.
- Permissions and views so each role sees the right operational surface.

The core system should treat `Team Tasks` as the future source of truth for operational work. `Employees` and `Departments` provide the identity and organization model. `Reports`, `Task Comments / Updates`, and `Audit Log` preserve management history and accountability.

## 3. Proposed Tabs

### Employees

Stores team member identity, notification, role, and department mapping.

### Departments

Stores department structure, department leads, and department status.

### Team Tasks

Future primary work-tracking tab. Replaces the current single-user `Tasks` model after migration is proven.

### Task Comments / Updates

Append-only task timeline for status updates, comments, handoffs, blocker notes, and report source material.

Suggested fields:

| Field | Purpose |
| --- | --- |
| update_id | Stable update id. |
| task_id | Related task. |
| created_at | Update timestamp. |
| created_by_id | Employee who created the update. |
| update_type | Comment, status_change, blocker, dependency, result, report_note. |
| previous_value | Optional old value for tracked changes. |
| new_value | Optional new value for tracked changes. |
| comment | Human-readable update. |
| source | Web, Telegram, import, Apps Script, manual. |

### Reports

Stores generated and reviewed individual, department, and manager reports.

### Meetings Inbox

Captures meeting-derived action items before they become assigned team tasks.

Suggested fields:

| Field | Purpose |
| --- | --- |
| inbox_id | Stable inbox item id. |
| created_at | Capture timestamp. |
| meeting_date | Meeting date. |
| meeting_title | Meeting or source title. |
| raw_note | Raw action item or meeting note. |
| proposed_owner_id | Suggested owner. |
| proposed_department_id | Suggested department. |
| proposed_deadline | Suggested deadline. |
| status | New, triaged, converted, ignored. |
| converted_task_id | Team task id after conversion. |
| source | Manual, transcript, Telegram, import. |

### Settings

Stores system-level configuration, lists, defaults, and feature flags.

Suggested fields:

| Field | Purpose |
| --- | --- |
| key | Setting name. |
| value | Setting value. |
| description | Human-readable explanation. |
| updated_at | Last update timestamp. |
| updated_by | Employee or admin who changed it. |

### Audit Log

Append-only operational log for sensitive changes and migration traceability.

Suggested fields:

| Field | Purpose |
| --- | --- |
| audit_id | Stable audit id. |
| created_at | Event timestamp. |
| actor_id | Employee or system actor. |
| action | Created, updated, archived, assigned, permission_changed, migrated. |
| entity_type | Task, employee, department, report, setting. |
| entity_id | Related entity id. |
| before_json | Optional previous state snapshot. |
| after_json | Optional new state snapshot. |
| source | Web, Telegram, Apps Script, migration, manual. |

### Optional: Companies / Contacts

Use only if CRM-style data becomes large enough to justify separation from task fields.

Suggested fields:

| Field | Purpose |
| --- | --- |
| company_or_contact_id | Stable id. |
| type | Company, contact, partner, vendor, client. |
| name | Display name. |
| primary_contact | Main person or contact details. |
| owner_department_id | Responsible department. |
| status | Active, inactive, archived. |
| notes | Short context. |
| created_at | Creation timestamp. |
| updated_at | Last update timestamp. |

### Optional: Projects / Workstreams

Use if repeated work needs grouping beyond category and department.

Suggested fields:

| Field | Purpose |
| --- | --- |
| project_or_workstream_id | Stable id. |
| name | Display name. |
| department_id | Primary department. |
| lead_id | Responsible employee. |
| status | Active, paused, completed, archived. |
| description | Scope and notes. |
| created_at | Creation timestamp. |
| updated_at | Last update timestamp. |

## 4. Employees Schema

| Field | Purpose |
| --- | --- |
| employee_id | Stable internal employee id. |
| full_name | Legal or full working name. |
| display_name | Short name used in UI and reports. |
| telegram_user_id | Numeric Telegram id for reliable identity matching. |
| telegram_username | Telegram username for display and fallback lookup. |
| email | Work email. |
| role | Permission role: employee, department_lead, manager, admin. |
| department_id | Primary department. |
| manager_id | Direct manager employee id. |
| status | Active, invited, suspended, inactive, archived. |
| timezone | Employee timezone for reminders and reports. |
| notification_preferences | JSON or compact text for Telegram/email/report preferences. |
| created_at | Creation timestamp. |
| updated_at | Last update timestamp. |

Notes:

- `employee_id` should be the durable key used by tasks, reports, and audit entries.
- `telegram_user_id` should be preferred over username because usernames can change.
- `display_name` should be snapshotted onto tasks where historical readability matters.

## 5. Departments Schema

| Field | Purpose |
| --- | --- |
| department_id | Stable internal department id. |
| department_name | Display name. |
| department_lead_id | Employee id of the department lead. |
| description | Short description of scope. |
| status | Active, paused, inactive, archived. |
| created_at | Creation timestamp. |
| updated_at | Last update timestamp. |

Notes:

- Departments should be lightweight at first.
- Cross-department work should remain task-based through dependencies rather than creating complex hierarchy too early.

## 6. Team Tasks Schema

`Team Tasks` is the proposed future source of truth for operational work.

| Field | Purpose |
| --- | --- |
| task_id | Stable task id. |
| created_at | Creation timestamp. |
| updated_at | Last update timestamp. |
| title | Short task title. |
| description / next_action | Task details and next concrete action. |
| owner_id | Responsible employee id. |
| owner_name_snapshot | Owner display name at assignment time for readable history. |
| owner_department_id | Owner department id at assignment time. |
| collaborators | Employee ids for active contributors. |
| watchers | Employee ids or roles that should see updates. |
| requested_by_id | Employee id of requester. |
| related_company_or_contact | Company, client, partner, vendor, or contact context. |
| project_or_workstream | Optional project or workstream grouping. |
| category | Operational category. |
| priority | Priority value. |
| status | New, in_progress, waiting, blocked, done, canceled, archived. |
| deadline | External or committed due date. |
| control_date | Internal check/control date. |
| reminder_date | Reminder timestamp or date. |
| dependency_owner_id | Employee whose action is needed. |
| dependency_department_id | Department whose action is needed. |
| blocker_type | None, decision, info, approval, external, resource, technical, other. |
| blocker_description | Human-readable blocker detail. |
| result_comment | Outcome, completion note, or final comment. |
| reportable | Boolean flag for report inclusion. |
| archived | Boolean archive flag. |
| source | Manual, web, Telegram, meeting, import, migration, Apps Script. |
| channel | Origin or working channel. |
| external_ref | External id or link, such as email, chat, meeting, or document reference. |

Design decisions:

- `owner_id` is required for active tasks.
- `collaborators` and `watchers` may start as comma-separated employee ids in Sheets, but should be treated as arrays by the application layer.
- `owner_name_snapshot` and `owner_department_id` preserve report readability if the employee changes name or department.
- `deadline`, `control_date`, and `reminder_date` should remain separate because they answer different questions: commitment, management check, and notification.
- `archived` should be a field, not a destructive row move, during the first migration phase.

## 7. Reports Schema

Reports must support:

- Individual daily report.
- Individual weekly report.
- Department summary.
- Manager executive summary.

| Field | Purpose |
| --- | --- |
| report_id | Stable report id. |
| report_type | individual_daily, individual_weekly, department_summary, manager_executive_summary. |
| period_start | Start date of reporting period. |
| period_end | End date of reporting period. |
| employee_id | Employee id for individual reports. |
| department_id | Department id for department reports. |
| source_tasks | Task ids used to generate the report. |
| generated_summary | System-generated draft summary. |
| edited_summary | Human-edited final summary. |
| status | Draft, submitted, reviewed, returned, archived. |
| submitted_at | Submission timestamp. |
| reviewed_by | Employee id of reviewer. |
| reviewed_at | Review timestamp. |

Design decisions:

- Individual reports should usually be generated from tasks where `owner_id` matches the employee.
- Department summaries should aggregate by `owner_department_id`, dependency department, blockers, and reportable updates.
- Manager executive summaries should focus on deadlines, blockers, completed outcomes, and cross-department risks.
- `generated_summary` and `edited_summary` should both be retained so the system can distinguish generated text from approved reporting.

## 8. Permissions Model

Permissions should be enforced in the application and Apps Script layers, not by relying only on Google Sheet visibility. The Sheet itself should be treated as an admin/backend data store.

| Role | Can see | Can edit | Can assign | Can review reports | Can archive |
| --- | --- | --- | --- | --- | --- |
| employee | Own tasks, tasks where collaborator/watcher, own reports, permitted department-visible tasks | Own task updates, own comments, limited status/progress fields | Self-assign when allowed; request reassignment | Own generated reports before submission | No, except possibly own draft/report artifacts |
| department_lead | Department tasks, own tasks, department reports, department blockers and dependencies | Department task fields, owner/status/deadline/control dates within department | Assign within department; request or propose cross-department assignment | Review individual reports in department; prepare department summary | Archive completed or canceled department tasks |
| manager | All active team tasks, all departments, reports, blockers, dashboards | Management fields, priorities, deadlines, blockers, report review fields | Assign across departments | Review department summaries and executive summaries | Archive completed/canceled tasks across departments |
| admin | All data, settings, audit log, identity mappings | All operational and configuration data | Assign all tasks | Review or correct all report records | Archive and restore, subject to audit logging |

Permission notes:

- Employees should not see private tasks from unrelated departments unless they are collaborators, watchers, requesters, or the task is explicitly marked visible.
- Department leads should not automatically become admins.
- Admin actions should be logged in `Audit Log`.
- Telegram actions must resolve the actor through `telegram_user_id` before applying permissions.

## 9. View Model

### My Tasks

Employee-owned active tasks, sorted by priority, deadline, control date, and blocker state.

### My Focus

Short operational focus list derived from owned tasks. This should replace the old personal `focus` field with computed logic based on priority, status, deadline, control date, and reportability.

### Department Tasks

Department-level task board for department leads and managers. Includes owner, status, deadline, control date, blockers, and stale tasks.

### Team Dashboard

Manager view across departments. Shows active work, overdue tasks, upcoming deadlines, blocked tasks, department load, and reporting status.

### Dependencies / Blockers

Cross-department dependency view. Groups tasks by dependency owner, dependency department, blocker type, and age.

### Reports

Report generation, submission, review, and historical summaries for individuals, departments, and manager executive reporting.

### Admin Settings

Admin-only configuration area for employees, departments, identity mapping, settings, and audit review.

## 10. Mapping From Existing `Tasks` Sheet

| Existing field | Future field | Notes |
| --- | --- | --- |
| `ID` | `task_id` | Preserve existing id where possible. Prefix or remap only if collisions are found. |
| `Задача` | `title` | Existing task text becomes the short title. |
| `Шаги для Лизы` / `Следующее действие` | `description / next_action` | Preserve concrete next action language. |
| `Организация / контакт` / `Контакт / компания` | `related_company_or_contact` | Keep as text at first. Move to optional `Companies / Contacts` later only if needed. |
| `Категория` | `category` | Preserve category values initially. Normalize later. |
| `Приоритет` | `priority` | Preserve priority values initially. Normalize after UI design. |
| `Статус` | `status` | Map to new team status list during dry-run. |
| `Дедлайн` | `deadline` | Preserve date values. |
| `controlDate` | `control_date` | Preserve date values. |
| `focus` | Focus logic / future derived field | Do not migrate as a direct source-of-truth field unless needed for compatibility. |
| `Итог / комментарий` | `result_comment` | Preserve final result or comment text. |
| `Канал` | `channel` | Preserve source/working channel. |

Initial owner mapping:

- Existing Lisa-oriented tasks should map to `owner_id = Lisa`.
- `owner_name_snapshot` should be Lisa's display name from `Employees`.
- `owner_department_id` should come from Lisa's seeded `department_id`.
- `source` should be set to `migration` for migrated rows.

## 11. Migration Plan

### Phase 1: Prepare Schema

Create the new tabs in a copy or controlled migration environment:

- `Employees`
- `Departments`
- `Team Tasks`
- `Task Comments / Updates`
- `Reports`
- `Meetings Inbox`
- `Settings`
- `Audit Log`

Do not delete or alter the existing `Tasks` tab.

### Phase 2: Seed Organization Data

Seed `Employees` and `Departments` manually.

Minimum seed data:

- Lisa as an employee.
- Initial management/admin user.
- Real departments that will participate in the first team pilot.
- Department lead mappings where known.
- Telegram identity fields only when verified.

### Phase 3: Create Migration Mirror

Create a `Team Tasks` mirror or migration tab from existing `Tasks`.

This should be a dry-run first:

- Map existing fields to the target schema.
- Set `owner_id = Lisa` for Lisa tasks.
- Preserve existing ids where possible.
- Mark `source = migration`.
- Keep old task data untouched.

### Phase 4: Validate Data Shape

Review migrated rows for:

- Missing owner ids.
- Ambiguous statuses.
- Invalid dates.
- Empty titles.
- Overloaded company/contact fields.
- Tasks that should not become team-visible.

### Phase 5: Test Read-Only Team Dashboard

Point a mock or read-only dashboard at the migrated `Team Tasks` data.

Validation goals:

- Team task table renders.
- Department and owner filters work.
- Deadline/control date logic is understandable.
- Blocker and dependency fields can support a manager view.
- No user can accidentally edit data in this phase.

### Phase 6: Switch Web From `Tasks` to `Team Tasks`

After read-only validation, update the web data source from `Tasks` to `Team Tasks`.

This should be done in a separate implementation stage, not Stage 18.

### Phase 7: Switch Telegram Flows

Update Telegram flows to:

- Resolve users through `telegram_user_id`.
- Create or update `Team Tasks`.
- Respect role-based permissions.
- Add task updates to `Task Comments / Updates`.

This should happen after the web read-only model is stable.

### Phase 8: Archive Old `Tasks`

Archive old `Tasks` only after successful migration and operational validation.

Archiving means:

- Keep the tab available for historical reference.
- Stop writing new operational tasks to it.
- Do not destructively delete historical rows.

## 12. Rollback Plan

Rollback must remain simple and non-destructive.

Required safeguards:

- Keep the old `Tasks` tab untouched during migration.
- Back up the spreadsheet before migration.
- Run a migration dry-run before any production switch.
- Do not destructively delete tabs, rows, or columns.
- Keep old `Tasks` routes available until the new `Team Tasks` route is proven.
- If the web switch fails, fall back to the old `Tasks` routes.
- If Telegram flows fail, disable Team Tasks writes and return Telegram to the previous read or intake behavior.
- Record migration actions in `Audit Log` or a migration log tab.

Rollback decision points:

- Before web source switch.
- Before Telegram write switch.
- Before old `Tasks` archival.

## 13. Risks

### Scope Creep

The team tracker can easily expand into CRM, project management, HR, reporting, and chat automation at once. Stage 19 should keep the interface read-only or mock-first to control scope.

### Permissions Complexity

Team visibility rules are more complex than personal task rules. The first implementation should use a small role model and avoid edge-case exceptions until real usage proves them necessary.

### Telegram Identity Mapping

Telegram usernames can change and are not reliable as primary identifiers. `telegram_user_id` should be verified before enabling write actions.

### Google Sheets Scale

Google Sheets can support the pilot, but large task history, updates, audit logs, and reports may eventually create performance issues. Append-only logs should be watched carefully.

### Data Privacy Between Departments

Some tasks may include sensitive management or department-specific information. The view and permission model must prevent accidental cross-department exposure.

### Report Noise

If every small task update becomes report material, daily and weekly reports will become noisy. The `reportable` flag and update types should be used to separate signal from activity chatter.

### CRM Overload

`related_company_or_contact` should remain lightweight at first. A separate CRM-like tab should be introduced only when repeated contacts, ownership, and history require it.

### Unclear Ownership

Team trackers fail when tasks have many watchers but no accountable owner. Active tasks should require `owner_id`, and dashboards should highlight missing or unclear ownership.

## 14. Recommended Stage 19

Recommended next stage:

**Stage 19: MF Group Tracker Web IA and Read-Only Design Redesign**

Stage 19 should redesign the web information architecture around the new schema, preferably mock/read-only first.

Suggested Stage 19 outputs:

- Define navigation for My Tasks, My Focus, Department Tasks, Team Dashboard, Dependencies / Blockers, Reports, and Admin Settings.
- Create mock data based on the proposed Stage 18 schema.
- Redesign the current single-user web shell into a team operations interface.
- Keep all data writes disabled.
- Validate manager, department lead, and employee views before changing Apps Script or the real Google Sheet.

Stage 19 should not execute the migration. It should make the future product experience concrete enough to guide implementation safely.

## Validation Checklist

- Documentation only.
- No app behavior changed.
- No Apps Script changed.
- No web files changed.
- No Google Sheet tabs created or edited.
- No secrets added.
- No migration executed.
- `git diff --check` passes.
- Documentation reviewed against Stage 18 requirements.
