function baFoxNormalizeTaskRow(row) {
  return {
    id: row[BA_FOX_CONFIG.TASK_COLUMNS.ID - 1] || '',
    date: baFoxTaskDateValue(row[BA_FOX_CONFIG.TASK_COLUMNS.DATE - 1]),
    category: row[BA_FOX_CONFIG.TASK_COLUMNS.CATEGORY - 1] || '',
    organization: row[BA_FOX_CONFIG.TASK_COLUMNS.ORGANIZATION - 1] || '',
    title: row[BA_FOX_CONFIG.TASK_COLUMNS.TITLE - 1] || '',
    steps: row[BA_FOX_CONFIG.TASK_COLUMNS.STEPS - 1] || '',
    source: row[BA_FOX_CONFIG.TASK_COLUMNS.SOURCE - 1] || '',
    priority: row[BA_FOX_CONFIG.TASK_COLUMNS.PRIORITY - 1] || '',
    deadline: baFoxTaskDateValue(row[BA_FOX_CONFIG.TASK_COLUMNS.DEADLINE - 1]),
    reminderMode: row[BA_FOX_CONFIG.TASK_COLUMNS.REMINDER_MODE - 1] || '',
    status: row[BA_FOX_CONFIG.TASK_COLUMNS.STATUS - 1] || '',
    nextReminder: row[BA_FOX_CONFIG.TASK_COLUMNS.NEXT_REMINDER - 1] || '',
    comment: row[BA_FOX_CONFIG.TASK_COLUMNS.COMMENT - 1] || '',
    channel: row[BA_FOX_CONFIG.TASK_COLUMNS.CHANNEL - 1] || '',
    taskType: row[BA_FOX_CONFIG.TASK_COLUMNS.TASK_TYPE - 1] || 'work',
    owner: row[BA_FOX_CONFIG.TASK_COLUMNS.OWNER - 1] || 'Lisa',
    createdAt: row[BA_FOX_CONFIG.TASK_COLUMNS.CREATED_AT - 1] || '',
    updatedAt: row[BA_FOX_CONFIG.TASK_COLUMNS.UPDATED_AT - 1] || '',
    completedAt: row[BA_FOX_CONFIG.TASK_COLUMNS.COMPLETED_AT - 1] || '',
    reminderRecurrence: row[BA_FOX_CONFIG.TASK_COLUMNS.REMINDER_RECURRENCE - 1] || '',
    notificationChannels: row[BA_FOX_CONFIG.TASK_COLUMNS.NOTIFICATION_CHANNELS - 1] || '',
    notificationStatus: row[BA_FOX_CONFIG.TASK_COLUMNS.NOTIFICATION_STATUS - 1] || '',
    appSource: row[BA_FOX_CONFIG.TASK_COLUMNS.APP_SOURCE - 1] || '',
    externalRef: row[BA_FOX_CONFIG.TASK_COLUMNS.EXTERNAL_REF - 1] || '',
    archived: baFoxIsTrueValue_(row[BA_FOX_CONFIG.TASK_COLUMNS.ARCHIVED - 1])
  };
}

function baFoxIsTrueValue_(value) {
  return value === true || baFoxSafeString(value).toUpperCase() === 'TRUE';
}

function baFoxNormalizeMatchValue_(value) {
  return baFoxSafeString(value).toLowerCase();
}

function baFoxStatusMatches_(status, values) {
  var normalizedStatus = baFoxNormalizeMatchValue_(status);
  return values.some(function(value) {
    return normalizedStatus === baFoxNormalizeMatchValue_(value);
  });
}

function baFoxTaskNeedsControl_(task) {
  var signalText = [
    task.status,
    task.category,
    task.reminderMode
  ].map(baFoxNormalizeMatchValue_).join(' ');

  return BA_FOX_CONFIG.CONTROL_SIGNALS.some(function(signal) {
    return signalText.indexOf(baFoxNormalizeMatchValue_(signal)) !== -1;
  });
}

function baFoxListTodayTasks(request, storeResult) {
  var normalized = baFoxNormalizeRequest(request);
  var date = baFoxDateOrToday(normalized.date);
  storeResult = storeResult || baFoxReadTasksRows();

  return {
    date: date,
    dryRun: storeResult.dryRun,
    readLive: storeResult.readLive,
    warning: storeResult.warning,
    tasks: storeResult.rows.map(baFoxNormalizeTaskRow).filter(function(task) {
      var taskDate = baFoxNormalizeMatchValue_(task.date);
      return !task.archived && (task.date === date || taskDate === 'сегодня');
    })
  };
}

function baFoxListOpenTasks(request, storeResult) {
  var normalized = baFoxNormalizeRequest(request);
  var taskType = baFoxSafeString(normalized.taskType || normalized.scope || 'all');
  storeResult = storeResult || baFoxReadTasksRows();

  return {
    taskType: taskType,
    dryRun: storeResult.dryRun,
    readLive: storeResult.readLive,
    warning: storeResult.warning,
    tasks: storeResult.rows.map(baFoxNormalizeTaskRow).filter(function(task) {
      var finalStatus = baFoxStatusMatches_(task.status, BA_FOX_CONFIG.FINAL_STATUSES);
      var typeMatches = taskType === 'all' || task.taskType === taskType;
      return !task.archived && !finalStatus && typeMatches;
    })
  };
}

function baFoxListPushTasks(request, storeResult) {
  var normalized = baFoxNormalizeRequest(request);
  var dateRange = baFoxSafeString(normalized.dateRange || 'today');
  storeResult = storeResult || baFoxReadTasksRows();

  return {
    dateRange: dateRange,
    dryRun: storeResult.dryRun,
    readLive: storeResult.readLive,
    warning: storeResult.warning,
    tasks: storeResult.rows.map(baFoxNormalizeTaskRow).filter(function(task) {
      var finalStatus = baFoxStatusMatches_(task.status, BA_FOX_CONFIG.FINAL_STATUSES);
      return !task.archived && !finalStatus && baFoxTaskNeedsControl_(task);
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

function baFoxTaskActionMap_() {
  return {
    markDone: { status: 'Выполнено' },
    moveToWork: { status: 'В работе' },
    moveToPush: { status: 'Пуш' },
    moveToWaiting: { status: 'Ждём ответ' },
    moveToBlocker: { status: 'Блокер' },
    archiveTask: { status: 'Архив', archived: true },
    snoozeTask: { snooze: true }
  };
}

function baFoxValidateSafeReminder_(value) {
  var reminder = baFoxSafeString(value);
  return /^\d{4}-\d{2}-\d{2}(T| )\d{2}:\d{2}(:\d{2})?$/.test(reminder);
}

function baFoxTaskAction(request) {
  var normalized = baFoxNormalizeRequest(request);
  var missing = baFoxRequired(normalized, ['taskId', 'action']);
  if (missing.length) {
    return baFoxError('VALIDATION_ERROR', 'Missing required fields.', { missing: missing });
  }

  if (BA_FOX_CONFIG.SAFE_WRITE_MODE !== true) {
    return baFoxError('SAFE_WRITES_DISABLED', 'Safe task actions are disabled.', {});
  }

  var actionMap = baFoxTaskActionMap_();
  var actionConfig = actionMap[normalized.action];
  if (!actionConfig) {
    return baFoxError('ACTION_NOT_ALLOWED', 'Task action is not allowed.', { action: normalized.action });
  }

  if (actionConfig.snooze && !baFoxValidateSafeReminder_(normalized.nextReminder)) {
    return baFoxError('VALIDATION_ERROR', 'Snooze requires a safe nextReminder date/time.', {
      nextReminder: normalized.nextReminder || ''
    });
  }

  var match = baFoxFindTaskRow_(normalized.taskId);
  if (!match.ok) {
    baFoxAuditTaskAction({
      timestamp: baFoxIsoNow(),
      actor: 'BA Fox Web',
      taskId: normalized.taskId,
      action: normalized.action,
      routeAction: 'taskAction/' + normalized.action,
      source: 'web',
      result: 'failed',
      errorCode: match.error.error && match.error.error.code
    });
    return match.error;
  }

  var previous = baFoxNormalizeTaskRow(match.row);
  var now = baFoxIsoNow();
  var patch = {
    UPDATED_AT: now
  };

  if (actionConfig.snooze) {
    patch.NEXT_REMINDER = baFoxSafeString(normalized.nextReminder);
  } else {
    patch.STATUS = actionConfig.status;
    if (normalized.action === 'markDone') {
      patch.COMPLETED_AT = now;
    }
    if (actionConfig.archived === true) {
      patch.ARCHIVED = true;
    }
  }

  var updateResponse = baFoxUpdateTaskActionRow(normalized.taskId, patch);
  if (!updateResponse.ok) {
    baFoxAuditTaskAction({
      timestamp: now,
      actor: 'BA Fox Web',
      taskId: normalized.taskId,
      action: normalized.action,
      previousStatus: previous.status,
      previousNextReminder: previous.nextReminder,
      routeAction: 'taskAction/' + normalized.action,
      source: 'web',
      result: 'failed',
      errorCode: updateResponse.error && updateResponse.error.code
    });
    return updateResponse;
  }

  var auditResult = baFoxAuditTaskAction({
    timestamp: now,
    actor: 'BA Fox Web',
    taskId: normalized.taskId,
    action: normalized.action,
    previousStatus: previous.status,
    newStatus: actionConfig.snooze ? previous.status : actionConfig.status,
    previousNextReminder: previous.nextReminder,
    newNextReminder: actionConfig.snooze ? patch.NEXT_REMINDER : previous.nextReminder,
    routeAction: 'taskAction/' + normalized.action,
    source: 'web',
    result: 'success',
    errorCode: ''
  });

  return baFoxOk({
    taskId: normalized.taskId,
    action: normalized.action,
    previousStatus: previous.status,
    newStatus: actionConfig.snooze ? previous.status : actionConfig.status,
    previousNextReminder: previous.nextReminder,
    newNextReminder: actionConfig.snooze ? patch.NEXT_REMINDER : previous.nextReminder,
    updateResult: updateResponse.data,
    auditResult: auditResult
  });
}
