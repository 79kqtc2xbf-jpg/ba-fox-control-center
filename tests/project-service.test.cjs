const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function projectContext() {
  const rows = [
    ['ID', 'Name', 'Department', 'Owner email', 'Owner user id', 'Status', 'Description', 'Created at', 'Created by email', 'Updated at'],
    ['PRJ-1', 'Old name', 'Operations', 'old@mfstream.io', 'USR-OLD', 'Active', 'Old description', '2026-07-01', 'admin@mfstream.io', '2026-07-01'],
  ];
  const sheet = {
    getDataRange() {
      return { getValues() { return rows.map((row) => row.slice()); } };
    },
    getRange(row, column) {
      return {
        setValue(value) {
          rows[row - 1][column - 1] = value;
        },
      };
    },
  };
  const context = vm.createContext({
    BA_FOX_CONFIG: {
      SAFE_WRITE_MODE: true,
      SHEETS: { PROJECTS: 'Projects' },
      PROJECT_COLUMNS: {
        ID: 1,
        NAME: 2,
        DEPARTMENT: 3,
        OWNER_EMAIL: 4,
        OWNER_USER_ID: 5,
        STATUS: 6,
        DESCRIPTION: 7,
        CREATED_AT: 8,
        CREATED_BY_EMAIL: 9,
        UPDATED_AT: 10,
      },
      PROJECT_STATUSES: ['Active', 'Paused', 'Completed', 'Archived'],
    },
    baFoxGetSheetByName_() { return sheet; },
    baFoxSafeString(value) { return String(value == null ? '' : value).trim(); },
    normalizeWorkspaceEmail_(value) { return String(value || '').trim().toLowerCase(); },
    baFoxNormalizeRequest(value) { return Object.assign({}, value); },
    baFoxError(code, message, details) { return { ok: false, error: { code, message, details } }; },
    baFoxOk(data) { return { ok: true, data, error: null }; },
    baFoxLooksLikeFormula_(value) { return /^[=+@]/.test(String(value || '')); },
    baFoxIsoNow() { return '2026-07-20T10:00:00Z'; },
    requireVerifiedProfile_() {
      return { ok: true, profile: { email: 'admin@mfstream.io', accessRole: 'admin' } };
    },
    profileCanManageProjects_() { return true; },
    findUserByEmail_(email) {
      return email === 'owner@mfstream.io' ? { email, userId: 'USR-OWNER' } : null;
    },
    baFoxAuditTaskAction(details) { return { appended: true, details }; },
    baFoxSafeJson_(value) { return JSON.stringify(value || {}); },
  });
  vm.runInContext(fs.readFileSync(path.join(root, 'apps-script/ProjectsService.gs'), 'utf8'), context);
  return { context, rows };
}

test('project update edits supported fields and keeps project identity', function () {
  const { context, rows } = projectContext();

  const result = context.baFoxUpdateProject_({
    projectId: 'PRJ-1',
    name: 'New name',
    department: 'Finance',
    ownerEmail: 'owner@mfstream.io',
    status: 'Paused',
    description: 'New description',
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.project.id, 'PRJ-1');
  assert.equal(result.data.project.ownerUserId, 'USR-OWNER');
  assert.deepEqual(rows[1].slice(0, 7), [
    'PRJ-1',
    'New name',
    'Finance',
    'owner@mfstream.io',
    'USR-OWNER',
    'Paused',
    'New description',
  ]);
  assert.equal(rows[1][9], '2026-07-20T10:00:00Z');
});

test('project archive remains reversible through status update', function () {
  const { context, rows } = projectContext();

  const archived = context.baFoxUpdateProject_({
    projectId: 'PRJ-1',
    status: 'Archived',
  });
  assert.equal(archived.ok, true);
  assert.equal(rows[1][5], 'Archived');

  const restored = context.baFoxUpdateProject_({
    projectId: 'PRJ-1',
    status: 'Active',
  });
  assert.equal(restored.ok, true);
  assert.equal(rows[1][5], 'Active');
});
