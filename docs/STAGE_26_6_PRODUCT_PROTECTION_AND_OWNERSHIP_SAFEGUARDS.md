# Stage 26.6 Product Protection and Ownership Safeguards

## Purpose

This document defines a professional product protection layer for BA Fox / MF Group Tracker. It is a governance, access, recovery, and audit plan only. It must never be implemented as hidden destructive logic, app-breaking attribution enforcement, obfuscation, backdoors, token exposure, sabotage triggers, or anti-user behavior.

## Ownership

- Product owner: Liza Kiseleva
- Product concept and workflow architecture: Liza Kiseleva
- Product: MF Group Tracker / BA Fox Control Center
- Primary attribution: Made by Liza Kiseleva
- Russian attribution: Сделано Лизой Киселёвой
- Technical audit trail: GitHub pull request history

Ownership attribution is intentional product metadata. It should not be removed from visible UI, Settings/About metadata, README/docs, or source comments without explicit product owner approval.

## Protection Principles

- Keep source of truth visible and documented.
- Keep ownership metadata professional, readable, and maintainable.
- Use GitHub PR history as the technical audit trail for implementation changes.
- Prefer access review, backups, CODEOWNERS proposals, branch protection, and deployment notes over runtime enforcement.
- Do not add hidden traps, destructive behavior, malware-like behavior, obfuscation, backdoors, secrets, or app-breaking logic.
- Do not change admin ownership, deployment ownership, or source-of-truth locations silently.
- Review all protection-related changes through pull requests.

## Access Inventory Checklist

Track who owns and can recover each surface. Do not store secrets in this document.

| Surface | What To Confirm | Owner / Recovery Notes |
| --- | --- | --- |
| GitHub repository | Repository owner, admins, branch protection, PR review rules, backup/export path | Confirm product owner has appropriate long-term access or documented recovery path. |
| Google Sheet | Sheet owner, editors, protected ranges, export/copy rights | Confirm owner can copy/export the workbook and preserve schema/history where needed. |
| Apps Script project | Script owner, deployment owner, deployment IDs, project editor list | Confirm script source can be exported and redeployed if account access is lost. |
| Telegram bot | BotFather owner, token rotation process, bot username, admin chat IDs | Record ownership notes without exposing the token. |
| GPT / project docs | Location of prompts, handover docs, project maps, operating rules | Keep copies in GitHub docs when safe and non-secret. |
| Hosting / domain | Host account, deployment URL, environment variable owner, domain/DNS owner if applicable | Document where production is deployed and who can roll back. |
| Local backups / exported packages | Export cadence, storage location, restore test status | Keep dated exports in a safe personal or organization-controlled location. |

## Recovery Plan

If working Google account access is lost:

1. Use the GitHub repository as the source of truth for code, docs, schemas, and Apps Script source files committed to the repo.
2. Recover or recreate the Google Sheet from the latest safe workbook copy/export.
3. Recreate the Apps Script project from exported Apps Script code or the `apps-script/` source directory.
4. Redeploy Apps Script and record the new deployment URL in deployment notes or hosting configuration, not in committed secrets.
5. Rotate Telegram bot token through the owning BotFather account if the token may be exposed or unavailable.
6. Reconnect hosting/runtime environment variables from secure storage.
7. Verify dashboard read routes before enabling live write QA.
8. Record the recovery PR or incident note in GitHub so the audit trail remains complete.

What should be backed up:

- GitHub repository export or clone bundle.
- Apps Script source export.
- Google Sheet copy/export.
- README and project docs.
- Apps Script deployment notes and URLs.
- Telegram bot ownership notes without token values.
- Hosting provider names, deployment URLs, and environment variable inventory without secret values.

What should be copied to personal ownership where legal and safe:

- A private copy/export of product docs and operating rules.
- A copy of non-secret Apps Script source.
- A copy/export of the Google Sheet structure and non-sensitive sample data.
- A list of deployment and recovery locations without tokens or credentials.

Deployment/source of truth:

- Code and implementation history: GitHub repository and PR history.
- Runtime data: Google Sheet, subject to current owner/editor access.
- Web API runtime: Apps Script deployment.
- Telegram runtime: BotFather-managed bot and hosting worker if enabled.

## Backup Checklist

Use this checklist before live write QA, employee testing, or ownership transitions.

- [ ] GitHub repository exported or mirrored.
- [ ] Apps Script code exported from the project or matched to `apps-script/` source.
- [ ] Google Sheet copied/exported with schema intact.
- [ ] Telegram bot owner confirmed in BotFather.
- [ ] Telegram bot token rotation process documented without exposing the token.
- [ ] README and docs exported or mirrored.
- [ ] Apps Script deployment IDs and URLs recorded in a secure non-secret note.
- [ ] Hosting service, project name, deployment URL, and rollback path documented.
- [ ] Environment variable inventory documented without values.
- [ ] Restore path reviewed by product owner.

## Governance Rules

- Do not remove ownership attribution without explicit approval from Liza Kiseleva.
- Do not move source of truth without documenting the new location and migration reason.
- Do not change GitHub, Google Sheet, Apps Script, Telegram, hosting, or domain admin ownership silently.
- Do not commit tokens, secrets, credentials, private keys, or service account files.
- Do not add destructive protection mechanisms or app-breaking attribution checks.
- All protection-related changes should go through pull request review.
- Major access or ownership changes should include a short audit note in docs or PR description.
- Product ownership metadata should remain visible in UI, Settings/About, README/docs, and source comments.

## CODEOWNERS Recommendation

No CODEOWNERS file is added in Stage 26.6 because the product owner's GitHub username is not explicitly confirmed in repository metadata. A CODEOWNERS rule can be added later when the correct GitHub username is confirmed.

Recommended future pattern:

```text
# Product ownership and protection metadata
/README.md @confirmed-product-owner
/docs/ @confirmed-product-owner
/web/index.html @confirmed-product-owner
/web/app.js @confirmed-product-owner
/web/styles.css @confirmed-product-owner
```

Before adding CODEOWNERS, confirm that it will not block normal repository workflow and that the username is valid, active, and approved by the product owner.

## Non-Goals

This protection layer does not add authentication, authorization, secrets management, runtime locks, attribution enforcement, or destructive behavior. Those topics require separate design and approval before implementation.
