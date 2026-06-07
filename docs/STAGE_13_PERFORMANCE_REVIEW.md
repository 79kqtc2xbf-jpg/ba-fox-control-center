# Stage 13 Performance Review

## Scope

Reviewed `editTask`, `taskAction`, `createTask`, `fullDashboard`, JSONP, cache behavior, completed loading, and route execution shape.

No backend optimizations were implemented in Stage 13.

## Findings

### editTask

`editTask` is a write route and bypasses read cache through `baFoxIsWriteRoute_`.

Safety path remains:

- ACTION_TOKEN required
- SAFE_WRITE_MODE required
- one row by taskId
- duplicate taskId rejected
- allowlisted fields only
- AuditLog records previous/new values

Likely timeout source is not client rendering. The write path does:

1. find row by taskId
2. scan taskId match count
3. update one row
4. append AuditLog
5. client refreshes fullDashboard after success

If perceived edit timeout happens after a successful write, the expensive part may be the post-write fullDashboard refresh.

### fullDashboard

`fullDashboard` currently builds:

- scaffoldInfo
- today
- open
- pushes
- completed
- cleanupAudit

This means one JSONP call can read and normalize task rows, build completed data, and run cleanup audit together.

Likely timeout pressure points:

- large `open.tasks` payload
- completed loading up to 50 rows
- cleanupAudit running inside fullDashboard
- JSONP script transport carrying a large payload
- browser waits on one all-or-nothing route

### Cache Logic

Read routes can cache successful responses for 45 seconds.

Write routes bypass both cache read and cache write:

- taskAction
- createTask
- editTask

This is correct and should be preserved.

### JSONP Usage

JSONP is still used for local browser compatibility with Apps Script Web App.

Risks:

- large payloads are harder to retry or partially render
- errors can appear as script load/timeout failures
- route-level payload splitting is harder than with normal JSON fetch and CORS

## Recommended Future Optimization Order

1. Split `cleanupAudit` out of default `fullDashboard`.
2. Add lightweight `workspaceDashboard` route with counts and active slices only.
3. Load completed/reports lazily only when opening Completed or Reports.
4. Add route-level limits for open tasks and completed tasks.
5. Consider a non-JSONP fetch path only if deployment/CORS model supports it.

## Do Not Change Without Separate Review

- write route cache bypass
- ACTION_TOKEN guard
- SAFE_WRITE_MODE guard
- AuditLog append
- Google Sheets as source of truth
- existing Apps Script deployment model
