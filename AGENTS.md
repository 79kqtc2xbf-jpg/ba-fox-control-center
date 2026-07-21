# BA Fox — instructions for coding agents

Start every task with [`docs/REPOSITORY_HANDOFF_RU.md`](docs/REPOSITORY_HANDOFF_RU.md). It is the concise current map of the repository; older `STAGE_*` documents are historical evidence unless the handoff explicitly points to one.

## Non-negotiable boundaries

- Google Sheets is the task data source. Never commit a Sheet ID, endpoint URL, OAuth client ID, token, webhook, `.env`, service-account file, or real task data.
- Do not change Apps Script deployment, Script Properties, Google Sheet schema, pilot access, user roles, visibility enforcement, or production data without the product owner's explicit approval.
- Keep browser writes behind verified Google identity and the server-side `SAFE_WRITE_MODE` guard. A browser must never receive `BA_FOX_ACTION_TOKEN`.
- Preserve legacy Telegram/Railway code unless the task specifically targets it. The active product direction is the web dashboard plus Apps Script.
- Make focused changes in a branch and do not edit `main` directly. Do not overwrite unrelated working-tree changes.

## Before handing off a change

Run the checks that match the changed area:

```bash
node --test tests/*.test.cjs
node --check web/app.js
node --check web/api/baFoxClient.js
python -m compileall bot services
git diff --check
```

For visible web changes, also check desktop and mobile layouts. In the handoff state what was changed, user impact, tests run, any required manual Apps Script or Sheet action, and rollback path.
