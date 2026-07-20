const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function runAudit(headers, details) {
  let appendedRow = null;
  const sheet = {
    appendRow(values) {
      appendedRow = values;
    },
  };
  const context = vm.createContext({
    BA_FOX_CONFIG: { SHEETS: { AUDIT_LOG: 'AuditLog' } },
    JSON,
    Object,
  });
  context.baFoxSafeString = function (value) {
    return value === undefined || value === null ? '' : String(value).trim();
  };
  context.baFoxIsoNow = function () {
    return '2026-07-20T14:30:00+07:00';
  };
  context.baFoxGetSheetByName_ = function () {
    return sheet;
  };
  context.baFoxReadSheetHeaders_ = function () {
    return headers;
  };
  vm.runInContext(fs.readFileSync(path.join(root, 'apps-script/AuditLog.gs'), 'utf8'), context);
  const result = context.baFoxAuditTaskAction(details);
  return { result, appendedRow };
}

test('audit log fills the current sheet schema with task identity and before/after values', function () {
  const headers = ['Event ID', 'Timestamp', 'Actor', 'Action', 'Entity type', 'Entity ID', 'Before', 'After', 'Source', 'Notes'];
  const { result, appendedRow } = runAudit(headers, {
    timestamp: '2026-07-20T14:29:00+07:00',
    actor: 'tester@example.com',
    taskId: 'TASK-123',
    action: 'moveToWork',
    previousStatus: 'Не начато',
    newStatus: 'В работе',
    routeAction: 'taskAction/moveToWork',
    source: 'web',
  });

  assert.equal(result.appended, true);
  assert.match(appendedRow[0], /^AUD-/);
  assert.equal(appendedRow[4], 'task');
  assert.equal(appendedRow[5], 'TASK-123');
  assert.deepEqual(JSON.parse(appendedRow[6]), { status: 'Не начато' });
  assert.deepEqual(JSON.parse(appendedRow[7]), { status: 'В работе' });
  assert.equal(appendedRow[8], 'web');
  assert.equal(appendedRow[9], 'taskAction/moveToWork');
});

test('audit log preserves explicit edit snapshots for Before and After columns', function () {
  const headers = ['Before', 'After', 'Entity ID', 'Notes'];
  const { appendedRow } = runAudit(headers, {
    taskId: 'TASK-456',
    action: 'editTask',
    previousValues: '{"controlDate":"2026-07-23"}',
    newValues: '{"controlDate":"2026-07-24"}',
    changedFields: 'controlDate,nextAction',
  });

  assert.equal(appendedRow[0], '{"controlDate":"2026-07-23"}');
  assert.equal(appendedRow[1], '{"controlDate":"2026-07-24"}');
  assert.equal(appendedRow[2], 'TASK-456');
  assert.equal(appendedRow[3], 'controlDate,nextAction');
});
