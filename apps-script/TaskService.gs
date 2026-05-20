function baFoxNormalizeTaskRow(row) {
  return {
    id: row[BA_FOX_CONFIG.TASK_COLUMNS.ID - 1] || '',
    date: row[BA_FOX_CONFIG.TASK_COLUMNS.DATE - 1] || '',
    category: row[BA_FOX_CONFIG.TASK_COLUMNS.CATEGORY - 1] || '',
    organization: row[BA_FOX_CONFIG.TASK_COLUMNS.ORGANIZATION - 1] || '',
    title: row[BA_FOX_CONFIG.TASK_COLUMNS.TITLE - 1] || '',
    priority: row[BA_FOX_CONFIG.TASK_COLUMNS.PRIORITY - 1] || '',
    deadline: row[BA_FOX_CONFIG.TASK_COLUMNS.DEADLINE - 1] || '',
    status: row[BA_FOX_CONFIG.TASK_COLUMNS.STATUS - 1] || '',
    comment: row[BA_FOX_CONFIG.TASK_COLUMNS.COMMENT - 1] || '',
    channel: row[BA_FOX_CONFIG.TASK_COLUMNS.CHANNEL - 1] || '',
    taskType: row[BA_FOX_CONFIG.TASK_COLUMNS.TASK_TYPE - 1] || 'work',
    archived: row[BA_FOX_CONFIG.TASK_COLUMNS.ARCHIVED - 1] === true
  };
}

function baFoxListTodayTasks(request) {
  var normalized = baFoxNormalizeRequest(request);
  var date = baFoxDateOrToday(normalized.date);
  var storeResult = baFoxReadTasksRows();

  return {
    date: date,
    dryRun: storeResult.dryRun,
    tasks: storeResult.rows.map(baFoxNormalizeTaskRow).filter(function(task) {
      return !task.archived && (task.date === date || task.date === 'Сегодня');
    })
  };
}

function baFoxListOpenTasks(request) {
  var normalized = baFoxNormalizeRequest(request);
  var taskType = baFoxSafeString(normalized.taskType || normalized.scope || 'all');
  var storeResult = baFoxReadTasksRows();

  return {
    taskType: taskType,
    dryRun: storeResult.dryRun,
    tasks: storeResult.rows.map(baFoxNormalizeTaskRow).filter(function(task) {
      var finalStatus = BA_FOX_CONFIG.FINAL_STATUSES.indexOf(task.status) !== -1;
      var typeMatches = taskType === 'all' || task.taskType === taskType;
      return !task.archived && !finalStatus && typeMatches;
    })
  };
}

function baFoxListPushTasks(request) {
  var normalized = baFoxNormalizeRequest(request);
  var dateRange = baFoxSafeString(normalized.dateRange || 'today');
  var storeResult = baFoxReadTasksRows();

  return {
    dateRange: dateRange,
    dryRun: storeResult.dryRun,
    tasks: storeResult.rows.map(baFoxNormalizeTaskRow).filter(function(task) {
      return !task.archived && task.status === 'Push';
    })
  };
}

function baFoxCreateTask(request) {
  var normalized = baFoxNormalizeRequest(request);
  var missing = baFoxRequired(normalized, ['title', 'taskType']);
  if (missing.length) {
    return baFoxError('VALIDATION_ERROR', 'Missing required fields.', { missing: missing });
  }

  if (!baFoxValidateTaskType(normalized.taskType)) {
    return baFoxError('VALIDATION_ERROR', 'Invalid task type.', { taskType: normalized.taskType });
  }

  var now = baFoxIsoNow();
  var taskId = baFoxBuildTaskId(normalized.deadline || normalized.date);
  var rowValues = [
    taskId,
    normalized.date || '',
    normalized.category || '',
    normalized.organization || '',
    normalized.title,
    normalized.steps || '',
    normalized.source || 'Web',
    normalized.priority || '',
    normalized.deadline || '',
    normalized.reminderMode || '',
    normalized.status || 'Not started',
    '',
    normalized.comment || '',
    normalized.channel || 'Web',
    normalized.taskType,
    normalized.owner || 'Lisa',
    now,
    now,
    '',
    normalized.reminderRecurrence || 'none',
    normalized.notificationChannels || '',
    '',
    normalized.appSource || 'web',
    normalized.externalRef || '',
    false
  ];

  var appendResult = baFoxAppendTaskRow(rowValues);
  var auditResult = baFoxAuditEvent('task.create', 'task', taskId, {
    actor: normalized.actor || 'Lisa'
  });

  return baFoxOk({
    taskId: taskId,
    dryRun: true,
    appendResult: appendResult,
    auditResult: auditResult
  });
}

function baFoxSetTaskStatus(request) {
  var normalized = baFoxNormalizeRequest(request);
  var missing = baFoxRequired(normalized, ['taskId', 'status']);
  if (missing.length) {
    return baFoxError('VALIDATION_ERROR', 'Missing required fields.', { missing: missing });
  }

  if (!baFoxValidateStatus(normalized.status)) {
    return baFoxError('VALIDATION_ERROR', 'Invalid status.', { status: normalized.status });
  }

  var patch = {
    status: normalized.status,
    updatedAt: baFoxIsoNow()
  };

  if (BA_FOX_CONFIG.FINAL_STATUSES.indexOf(normalized.status) !== -1) {
    patch.completedAt = patch.updatedAt;
  }

  return baFoxOk({
    taskId: normalized.taskId,
    dryRun: true,
    updateResult: baFoxUpdateTaskRow(normalized.taskId, patch),
    auditResult: baFoxAuditEvent('task.status.update', 'task', normalized.taskId, {
      actor: normalized.actor || 'Lisa',
      status: normalized.status
    })
  });
}

function baFoxSetTaskComment(request) {
  var normalized = baFoxNormalizeRequest(request);
  var missing = baFoxRequired(normalized, ['taskId', 'comment']);
  if (missing.length) {
    return baFoxError('VALIDATION_ERROR', 'Missing required fields.', { missing: missing });
  }

  var mode = normalized.mode || 'append';
  if (!baFoxValidateCommentMode(mode)) {
    return baFoxError('VALIDATION_ERROR', 'Invalid comment mode.', { mode: mode });
  }

  var patch = {
    comment: normalized.comment,
    mode: mode,
    updatedAt: baFoxIsoNow()
  };

  return baFoxOk({
    taskId: normalized.taskId,
    dryRun: true,
    updateResult: baFoxUpdateTaskRow(normalized.taskId, patch),
    auditResult: baFoxAuditEvent('task.comment.update', 'task', normalized.taskId, {
      actor: normalized.actor || 'Lisa',
      mode: mode
    })
  });
}
