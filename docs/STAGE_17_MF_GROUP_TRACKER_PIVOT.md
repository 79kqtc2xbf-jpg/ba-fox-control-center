# Stage 17: MF Group Tracker Pivot

## 1. Product decision

EA FOX as a personal task tracker is paused and deprecated as the primary product direction.

Personal tasks should live in Google Tasks and Google Calendar. That layer is already better suited for individual reminders, private personal planning, calendar-native due dates, and quick personal capture.

The new product direction is **MF Group Tracker**: an internal team operations tracker for MF Group.

The Stages 13-16 EA FOX foundation is not discarded. It becomes the starting point for a team tracker focused on ownership, visibility, dependencies, reporting, and operational control across colleagues and departments.

## 2. What we reuse from the existing system

The existing system remains valuable as a foundation:

- Google Sheets source of truth.
- Apps Script API and deployment model.
- Web app shell and frontend architecture.
- Task status model and safe write patterns.
- `controlDate` as a first-class control workflow.
- `focus` as a prioritization signal.
- Reports shell and local report preview concepts.
- Telegram bot architecture and safe task workflow concepts.
- Gmail/mail reconciliation concepts.
- Audit logging and guarded write routes.
- Lightweight dashboard and lazy-loading route ideas from Stage 14.

## 3. What becomes deprecated or hidden

The following product framing should be deprecated or hidden in future UI:

- Personal-only positioning.
- Overly individual EA language.
- Personal productivity framing as the primary purpose.
- Personal task capture as the main workflow.
- Assistant-style visual tone that feels too private or feminine for team operations.
- UI sections that imply one-person task management instead of shared ownership.

The code can remain while the product language and IA move toward team operations.

## 4. New core entities

MF Group Tracker should support these entities:

- Employee: a person who owns, updates, or follows tasks.
- Department: a team or operational area.
- Role: employee role, access level, and responsibility context.
- Task Owner: the accountable person for delivery.
- Collaborator: a person actively contributing to the task.
- Watcher: a person who needs visibility but is not responsible for action.
- Department Owner: department-level accountable lead.
- Dependency: another person, department, task, meeting, or external input required before progress.
- Blocking Department: the team currently blocking progress.
- Control Date: the date when the task must be checked or pushed.
- Deadline: the real due date or delivery date.
- Report Status: whether the task should appear in daily or weekly reports.
- Manager Review Status: whether a manager needs to review, approve, unblock, or request an update.

## 5. Proposed Google Sheet schema v2

Proposed tabs:

- Employees
- Departments
- Team Tasks
- Reports
- Meetings Inbox
- Settings
- Audit Log

### Employees

Suggested columns:

- Employee ID
- Name
- Telegram username
- Telegram user ID
- Email
- Department
- Role
- Manager
- Active
- Report required
- Time zone
- Notes

### Departments

Suggested columns:

- Department ID
- Department name
- Department owner
- Parent department
- Active
- Default report channel
- Notes

### Team Tasks

Suggested columns:

- ID
- Created at
- Updated at
- Task title
- Description / next action
- Owner
- Owner department
- Collaborators
- Watchers
- Requested by
- Related contact / company
- Category
- Priority
- Status
- Deadline
- Control date
- Reminder date
- Dependency owner
- Dependency department
- Blocker
- Result / comment
- Reportable
- Archived
- Source
- Channel

### Reports

Suggested columns:

- Report ID
- Created at
- Report date
- Report type
- Employee
- Department
- Submitted by
- Status
- Done
- In progress
- Waiting
- Blockers
- Tomorrow focus
- Manager notes
- Source
- Channel

### Meetings Inbox

Suggested columns:

- Item ID
- Created at
- Meeting date
- Meeting title
- Source
- Owner
- Department
- Extracted task
- Suggested owner
- Suggested control date
- Suggested deadline
- Confidence
- Review status
- Converted task ID
- Notes

### Settings

Suggested columns:

- Key
- Value
- Scope
- Updated at
- Updated by
- Notes

### Audit Log

Suggested columns:

- Timestamp
- Actor
- Route
- Entity type
- Entity ID
- Action
- Previous values
- New values
- Result
- Error code
- Source

## 6. Proposed web IA

Navigation:

- Dashboard
- My Tasks
- My Focus
- Team
- Departments
- Dependencies / Blockers
- Reports
- Settings

Views:

- Employee view: my tasks, my focus, my reminders, my reports, my blockers.
- Manager view: owned team, overdue items, pending updates, blockers, review queue.
- Department view: department workload, owner distribution, cross-department dependencies, department report.
- Executive dashboard: high-level operational overview, blockers, overdue items, priority tasks, report completeness.

Individualization remains important. Every colleague should have:

- My Tasks
- My Focus
- My Reports
- My reminders / control dates

But the same system should also support:

- Team tasks
- Department tasks
- Manager view
- Cross-team dependencies
- Blocking / waiting relationships

## 7. Proposed Telegram workflow

### Employee commands

- My tasks
- Add task
- Update status
- Submit daily report
- Submit weekly report
- Show blockers

Employee Telegram flow should be fast and low-friction:

1. Employee opens My tasks.
2. Employee updates status or control date.
3. Employee submits daily or weekly report.
4. Bot asks only the minimum needed clarification.
5. Updates are written to Team Tasks and Audit Log through safe guarded routes.

### Manager/admin commands

- Team dashboard
- Department tasks
- Overdue tasks
- Blockers
- Reports pending
- Ask for update

Manager/admin Telegram flow should focus on visibility and follow-up:

1. Manager checks team or department dashboard.
2. Bot shows overdue tasks, blockers, and missing reports.
3. Manager can ask a specific owner for an update.
4. Bot records the update request and optionally notifies the employee.
5. No destructive changes happen without explicit confirmation.

## 8. Reporting workflow

MF Group Tracker should support:

- Individual daily reports.
- Individual weekly reports.
- Department summaries.
- Manager executive summary.
- Task-to-report logic.

### Individual daily report

Suggested sections:

- Done today
- In progress
- Waiting / dependencies
- Blockers
- Tomorrow focus

### Individual weekly report

Suggested sections:

- Completed this week
- Key progress
- Still open
- Blockers
- Next week focus

### Department summary

Suggested sections:

- Completed by department
- High-priority active work
- Cross-department dependencies
- Blockers
- Overdue tasks
- Missing updates

### Manager executive summary

Suggested sections:

- Executive highlights
- Critical blockers
- Overdue by owner
- Overdue by department
- Work requiring decision
- Report completeness
- Next operational focus

### Task-to-report logic

Tasks should appear in reports when:

- `Reportable` is true.
- Status is Done, In Progress, Waiting, Push, or Blocker.
- The task changed during the report period.
- The control date, deadline, or blocker state requires management attention.

Tasks should not appear in reports when:

- Archived is true.
- Reportable is false.
- Status is Duplicate, Cancelled, or Not Relevant.

## 9. Migration plan from EA FOX to MF Group Tracker

### Stage 17: documentation only

Define the pivot, product decision, reuse strategy, new entities, proposed schema, IA, Telegram workflow, reporting workflow, risks, and next stage.

### Stage 18: schema design / sheet migration plan

Create the exact schema migration plan for Employees, Departments, Team Tasks, Reports, Meetings Inbox, Settings, and Audit Log.

Deliverables should include:

- Column definitions.
- Required vs optional fields.
- Backward compatibility mapping from existing Tasks.
- Safe migration plan.
- Rollback plan.
- Test spreadsheet plan.

### Stage 19: web IA redesign for team tracker

Redesign the web shell around Dashboard, My Tasks, My Focus, Team, Departments, Dependencies / Blockers, Reports, and Settings.

Keep the implementation incremental and compatibility-first.

### Stage 20: Telegram team workflow

Implement employee and manager Telegram flows with identity mapping, safe write routes, and audit logging.

### Stage 21: reporting automation

Automate individual, department, and manager reports.

Start with previews and confirmation before any send/write automation.

### Stage 22: Gmail/meeting reconciliation for team tasks

Use Gmail and meeting notes as task intake and reconciliation sources.

Keep review-first behavior before creating or updating team tasks.

## 10. Risks

- Scope creep: the product can become a CRM, HR system, project management system, and reporting system at once.
- Permission model: employees, managers, and executives need different visibility and write access.
- Employee adoption: Telegram and web workflows must be faster than manual chat/status updates.
- Data privacy: employee tasks, performance signals, and manager notes require careful access boundaries.
- Telegram identity mapping: Telegram username is not enough; stable user ID mapping is required.
- Google Sheet scalability: the sheet may become slow as team tasks, reports, and audit logs grow.
- Too much CRM complexity: the product should remain an operations tracker, not a sales CRM or enterprise PM suite.
- Reporting quality: reports become noisy if task statuses and reportability are not maintained.
- Cross-department dependencies: dependency modeling can become complex quickly.
- Migration risk: existing EA FOX code and sheets must keep working until the team tracker is ready.

## 11. Recommended next PR

Recommended next stage: **Stage 18: MF Group Tracker schema design / sheet migration plan**.

Do not implement schema migration yet. The next PR should be documentation and design only, with:

- Final proposed sheet tabs.
- Exact columns and field types.
- Required vs optional fields.
- Mapping from current EA FOX Tasks to Team Tasks.
- Identity mapping for Employees and Telegram users.
- Permission assumptions.
- Safe migration and rollback plan.

This is the most practical next step because it reduces implementation risk before touching Apps Script, web routes, Telegram, or production Sheets.
