# Stage 19: MF Group Tracker Web IA and Read-Only Design Redesign

## Purpose

Stage 19 redesigns the web app information architecture and visual direction for the pivot from EA FOX personal tracker to MF Group Tracker.

This stage is frontend-only and mock-first. It does not migrate Google Sheets, change Apps Script, create new Google Sheet tabs, change Telegram, change Gmail, or alter live task write behavior.

## Product Model

MF Group Tracker is an internal team operations dashboard for MF Group.

The product is no longer a personal EA assistant surface. Personal tasks should remain in Google Tasks and Google Calendar. MF Group Tracker is for visible team work:

- Individual task ownership.
- Department and team visibility.
- Cross-department dependencies.
- Blockers and escalation.
- Daily and weekly reports.
- Manager and executive overview.
- Future employee workflows through Telegram.

## New Information Architecture

The Stage 19 navigation model is:

| Section | Purpose |
| --- | --- |
| Dashboard | Executive operations overview with team metrics, control today, blockers, waiting departments, reports pending, and focus by department. |
| My Tasks | Current user's owned and collaborated work, including overdue/control dates and reportable tasks. |
| My Focus | Individual focus queue derived from team operations signals. |
| Team | Employee workload, blockers, waiting tasks, Telegram mapping status, and report status. |
| Departments | Department cards with lead, open work, blockers, dependencies, and mission. |
| Dependencies / Blockers | Cross-department dependency table showing who is waiting for whom, blocker type, control date, and escalation. |
| Reports | Mock report cards for individual daily, individual weekly, department summary, and manager executive summary. |
| Settings | Placeholder for employees, departments, roles, Telegram identity mapping, and permissions. |

## Design Direction

The visual direction moves away from the EA FOX personal/pink assistant style.

New visual language:

- Dark navy and deep black base.
- Neon cyan as the primary operational accent.
- Neon green for healthy/readiness states.
- Magenta/pink reserved for warnings, blockers, overdue, or critical highlights.
- Dense executive operations dashboard feel.
- More Linear/Raycast/Bloomberg-terminal/Stripe-operations than personal CRM.
- Less feminine, less assistant-like, and not CRM-heavy.

The UI is designed for scanning: cards, tables, dense metrics, owner labels, department labels, control dates, blocker notes, and report status are visible without requiring task editing.

## What Changed From EA FOX

Changed:

- Product title and shell copy now point to MF Group Tracker.
- Main navigation changed from personal task buckets to team operations sections.
- The default view is `Dashboard`, not the old personal all-task queue.
- Summary metrics now show open tasks, control today, overdue, blockers, waiting departments, reports pending, reportable tasks, and departments.
- Stage 19 mock data models employees, departments, owners, dependencies, blockers, and reports.
- The visual layer now uses dark operations styling with cyan/green accents.

Preserved:

- Existing create/edit/status code paths remain in the codebase.
- Existing safe-write behavior remains gated behind runtime flags.
- Existing modals are still present so the current deployed app is not destructively simplified.
- Existing Apps Script client and old live read logic remain available.

## Mock / Read-Only Scope

The Stage 19 UI is a read-only design preview.

Mock data includes:

- Lisa / Operations.
- Teodor / Management.
- Finance.
- Legal.
- Sales / Real Estate.
- Marketing / Presentations.
- Compliance / Onboarding.

Example mock tasks include:

- Sansiri agreement review.
- Bitazza KYB package.
- MontAzur agency agreement.
- Sber Private Phuket deck.
- Payment flow clarification.
- Bank onboarding follow-up.
- Weekly report collection.

Mock report types include:

- Individual daily report.
- Individual weekly report.
- Department summary.
- Manager executive summary placeholder.

No Stage 19 screen writes to the proposed Stage 18 `Team Tasks` schema. No new sheet tabs are created. No task migration is performed.

## Deferred Work

Deferred to later stages:

- Real Google Sheet `Team Tasks` tab creation.
- Apps Script schema changes.
- Apps Script read routes for Employees, Departments, Team Tasks, Reports, and Audit Log.
- Migration from old `Tasks` to `Team Tasks`.
- Permission enforcement in backend/API.
- Real Telegram identity mapping and Telegram task flows.
- Report generation, submission, review, and sending.
- Google Tasks and Google Calendar personal task integration.
- Gmail workflow changes.
- Actual role-aware filtering based on authenticated user.

## Risks

### Mock UI Divergence

The mock IA may feel right visually but still need adjustment once real Sheet data exists. The next stage should validate field names and row shapes before building write flows.

### Permissions Complexity

The UI shows role concepts, but real permission enforcement must happen in Apps Script or a backend layer. Frontend-only hiding is not sufficient.

### Existing Code Complexity

The current web shell still contains EA FOX routes, old task renderers, and safe-write modals. This is intentional for continuity, but later stages should isolate legacy and MF modes more cleanly.

### Data Density

The executive dashboard style is denser than the previous assistant UI. Mobile and small-screen ergonomics should be watched as real data volume increases.

### Report Noise

Reports can become noisy if every task update is treated as report-worthy. The future implementation should respect the Stage 18 `reportable` field and update types.

### Telegram Mapping

Telegram usernames are not stable identifiers. Future implementation should rely on verified numeric Telegram user IDs.

## Recommended Next Stage

Recommended next stage:

**Stage 20: MF Group Tracker Read-Only Data Contract**

Stage 20 should define and implement read-only frontend data contracts for the Stage 18 schema without performing migration or enabling writes.

Suggested outputs:

- Add typed/normalized frontend adapters for Employees, Departments, Team Tasks, Dependencies, and Reports.
- Keep mock data as the default.
- Add optional read-only Apps Script route planning or stubs only if needed.
- Validate the UI against mock data shaped exactly like the future Sheet tabs.
- Keep write paths disabled until schema migration is completed and reviewed.

## Validation Checklist

- Frontend-only change.
- No Apps Script changes.
- No schema migration.
- No Google Sheet tabs created.
- No Telegram bot changes.
- No Gmail API changes.
- Existing write paths not removed.
- New MF sections are read-only/mock-first.
- `node --check web/app.js` passes.
- `node --check web/api/baFoxClient.js` passes.
- `node --check web/api/baFoxUiState.js` passes.
- `git diff --check` passes.
- Browser smoke covers Dashboard, My Tasks, My Focus, Team, Departments, Dependencies / Blockers, Reports, Settings, responsive layout, and existing create modal presence.
