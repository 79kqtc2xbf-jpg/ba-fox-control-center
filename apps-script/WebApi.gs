function getTodayTasks(request) {
  return baFoxOk(baFoxListTodayTasks(request));
}

function getInboxTasks(request) {
  return baFoxOk(baFoxListInboxTasks(request));
}

function getFocusTasks(request) {
  return baFoxOk(baFoxListFocusTasks(request));
}

function getOpenTasks(request) {
  return baFoxOk(baFoxListOpenTasks(request));
}

function getPushTasks(request) {
  return baFoxOk(baFoxListPushTasks(request));
}

function getCompletedTasks(request) {
  return baFoxOk(baFoxListCompletedTasks(request));
}

function addTask(request) {
  return baFoxCreateTask(request);
}

function createTask(request) {
  return baFoxSafeCreateTask(request);
}

function editTask(request) {
  return baFoxSafeEditTask(request);
}

function updateTaskStatus(request) {
  return baFoxSetTaskStatus(request);
}

function updateTaskComment(request) {
  return baFoxSetTaskComment(request);
}

function taskAction(request) {
  return baFoxTaskAction(request);
}

function getProfile(request) {
  return baFoxGetProfile(request);
}

function getTaskIdentitySchema(request) {
  return baFoxOk({
    taskIdentitySchema: getTaskIdentitySchemaStatus_()
  });
}

function baFoxPrepareTaskIdentityColumns(request) {
  var normalized = baFoxNormalizeRequest(request || {});
  var confirm = baFoxSafeString(normalized.confirm).toLowerCase() === 'true' || normalized.confirm === true;
  var identity = getCurrentUserProfile_(normalized, {});
  var hasActionToken = baFoxActionTokenMatches_(normalized.token);
  var hasAdminProfile = identity.identityMode === 'google_token_verified' && profileCanManageUsers_(identity.profile);

  if (confirm && BA_FOX_CONFIG.SAFE_WRITE_MODE !== true) {
    return baFoxError('SAFE_WRITES_DISABLED', 'Safe write mode is required to add task identity columns.', {});
  }
  if (confirm && !hasActionToken && !hasAdminProfile) {
    return baFoxError('ADMIN_OR_TOKEN_REQUIRED', 'Adding task identity columns requires action token or verified admin profile.', {
      identityMode: identity.identityMode
    });
  }

  var result = ensureTaskIdentityColumns_({ confirm: confirm });
  if (result.error === 'TASKS_SHEET_MISSING') {
    return baFoxError('TASKS_SHEET_MISSING', 'Tasks sheet is not available.', {});
  }
  if (result.error === 'LEGACY_TASK_COLUMNS_INCOMPLETE') {
    return baFoxError('LEGACY_TASK_COLUMNS_INCOMPLETE', 'Required legacy Tasks columns are incomplete.', {});
  }
  return baFoxOk({
    taskIdentitySchemaMigration: result
  });
}

function getActiveUsersForPreview(request) {
  return getSafeActiveUsersForPreview_(request);
}

function getVisibilityPreview(request) {
  return baFoxGetVisibilityPreview(request);
}

function buildDailyReportDraft(request) {
  return baFoxBuildDailyReportDraft(request);
}
