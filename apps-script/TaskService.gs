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

function baFoxListCompletedTasks(request, storeResult) {
  var normalized = baFoxNormalizeRequest(request);
  var limit = Math.max(1, Math.min(Number(normalized.limit || 50), 100));
  storeResult = storeResult || baFoxReadTasksRows();

  return {
    limit: limit,
    dryRun: storeResult.dryRun,
    readLive: storeResult.readLive,
    warning: storeResult.warning,
    tasks: storeResult.rows.map(baFoxNormalizeTaskRow).filter(function(task) {
      return !task.archived && (baFoxStatusMatches_(task.status, BA_FOX_CONFIG.FINAL_STATUSES) || task.completedAt);
    }).sort(function(left, right) {
      return baFoxSafeString(right.completedAt || right.updatedAt || right.deadline)
        .localeCompare(baFoxSafeString(left.completedAt || left.updatedAt || left.deadline));
    }).slice(0, limit)
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

function baFoxCreateTaskAllowedKeys_() {
  return ['route', 'callback', 'token', 'title', 'organization', 'nextAction', 'deadline'];
}

function baFoxRejectedCreateTaskKeys_(request) {
  var allowed = baFoxCreateTaskAllowedKeys_();
  return Object.keys(request || {}).filter(function(key) {
    return allowed.indexOf(key) === -1 && baFoxSafeString(request[key]);
  });
}

function baFoxValidateCreateTaskScalar_(request, fields) {
  return fields.filter(function(field) {
    var value = request[field];
    return Array.isArray(value) || (value && typeof value === 'object');
  });
}

function baFoxValidateCreateTaskDeadline_(deadline) {
  var value = baFoxSafeString(deadline);
  return !value || /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function baFoxBuildSafeCreateTaskId_(now) {
  var compactNow = baFoxSafeString(now).replace(/[^0-9]/g, '').slice(0, 14);
  var suffix = Math.floor(Math.random() * 1000000).toString();
  while (suffix.length < 6) {
    suffix = '0' + suffix;
  }
  return 'BA-WEB-' + compactNow + '-' + suffix;
}

function baFoxSafeCreateTaskRow_(taskId, normalized, now) {
  return [
    taskId,
    '',
    '',
    baFoxSafeString(normalized.organization),
    baFoxSafeString(normalized.title),
    baFoxSafeString(normalized.nextAction),
    'BA Fox Web',
    '',
    baFoxSafeString(normalized.deadline),
    '',
    'В работе',
    '',
    '',
    'Web',
    'work',
    'Lisa',
    now,
    now,
    '',
    'none',
    '',
    '',
    'web',
    '',
    false
  ];
}

function baFoxSafeCreateTask(request) {
  var normalized = baFoxNormalizeRequest(request);
  var rejectedKeys = baFoxRejectedCreateTaskKeys_(normalized);
  if (rejectedKeys.length) {
    return baFoxError('FIELDS_NOT_ALLOWED', 'Only safe create task fields are allowed.', {
      rejectedFields: rejectedKeys
    });
  }

  var objectFields = baFoxValidateCreateTaskScalar_(normalized, ['title', 'organization', 'nextAction', 'deadline']);
  if (objectFields.length) {
    return baFoxError('VALIDATION_ERROR', 'Create task fields must be simple text values.', {
      fields: objectFields
    });
  }

  var missing = baFoxRequired(normalized, ['title', 'nextAction']);
  if (missing.length) {
    return baFoxError('VALIDATION_ERROR', 'Missing required fields.', { missing: missing });
  }

  if (!baFoxValidateCreateTaskDeadline_(normalized.deadline)) {
    return baFoxError('VALIDATION_ERROR', 'Deadline must use YYYY-MM-DD format.', {
      deadline: normalized.deadline || ''
    });
  }

  if (!baFoxActionTokenMatches_(normalized.token)) {
    return baFoxUnauthorized_();
  }

  if (BA_FOX_CONFIG.SAFE_WRITE_MODE !== true) {
    return baFoxError('SAFE_WRITES_DISABLED', 'Safe task creation is disabled.', {});
  }

  var now = baFoxIsoNow();
  var taskId = baFoxBuildSafeCreateTaskId_(now);
  var appendResponse = baFoxAppendSafeCreateTaskRow(baFoxSafeCreateTaskRow_(taskId, normalized, now));
  if (!appendResponse.ok) {
    baFoxAuditTaskAction({
      timestamp: now,
      actor: 'BA Fox Web',
      taskId: taskId,
      action: 'createTask',
      routeAction: 'createTask',
      source: 'web',
      result: 'failed',
      errorCode: appendResponse.error && appendResponse.error.code
    });
    return appendResponse;
  }

  var auditResult = baFoxAuditTaskAction({
    timestamp: now,
    actor: 'BA Fox Web',
    taskId: taskId,
    action: 'createTask',
    routeAction: 'createTask',
    source: 'web',
    result: 'success',
    errorCode: ''
  });

  return baFoxOk({
    taskId: taskId,
    status: 'В работе',
    source: 'BA Fox Web',
    createdAt: now,
    appendResult: appendResponse.data,
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
    snoozeTask: { snooze: true }
  };
}

function baFoxValidateSafeReminder_(value) {
  var reminder = baFoxSafeString(value);
  return /^\d{4}-\d{2}-\d{2}(T| )\d{2}:\d{2}(:\d{2})?$/.test(reminder);
}

function baFoxConfiguredActionToken_() {
  if (baFoxSafeString(BA_FOX_CONFIG.ACTION_TOKEN)) {
    return baFoxSafeString(BA_FOX_CONFIG.ACTION_TOKEN);
  }
  if (typeof PropertiesService === 'undefined') {
    return '';
  }
  try {
    return baFoxSafeString(PropertiesService.getScriptProperties().getProperty('BA_FOX_ACTION_TOKEN'));
  } catch (err) {
    return '';
  }
}

function baFoxActionTokenMatches_(token) {
  var expectedToken = baFoxConfiguredActionToken_();
  return Boolean(expectedToken) && baFoxSafeString(token) === expectedToken;
}

function baFoxUnauthorized_() {
  return {
    ok: false,
    data: null,
    error: 'UNAUTHORIZED'
  };
}

function baFoxTaskAction(request) {
  var normalized = baFoxNormalizeRequest(request);
  var missing = baFoxRequired(normalized, ['taskId', 'action']);
  if (missing.length) {
    return baFoxError('VALIDATION_ERROR', 'Missing required fields.', { missing: missing });
  }

  if (!baFoxActionTokenMatches_(normalized.token)) {
    return baFoxUnauthorized_();
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

function baFoxEditTaskAllowedKeys_() {
  return [
    'route',
    'callback',
    'token',
    'taskId',
    'title',
    'organization',
    'nextAction',
    'deadline',
    'priority',
    'category',
    'taskType',
    'comment',
    'note'
  ];
}

function baFoxRejectedEditTaskKeys_(request) {
  var allowed = baFoxEditTaskAllowedKeys_();
  return Object.keys(request || {}).filter(function(key) {
    return allowed.indexOf(key) === -1 && baFoxSafeString(request[key]);
  });
}

function baFoxValidateEditTaskScalar_(request, fields) {
  return fields.filter(function(field) {
    var value = request[field];
    return Array.isArray(value) || (value && typeof value === 'object');
  });
}

function baFoxLooksLikeFormula_(value) {
  return /^[=+\-@]/.test(baFoxSafeString(value));
}

function baFoxValidateEditTaskDeadline_(deadline) {
  var value = baFoxSafeString(deadline);
  return !value || /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function baFoxEditTaskFieldMap_() {
  return {
    title: 'TITLE',
    organization: 'ORGANIZATION',
    nextAction: 'STEPS',
    deadline: 'DEADLINE',
    priority: 'PRIORITY',
    category: 'CATEGORY',
    taskType: 'TASK_TYPE',
    comment: 'COMMENT'
  };
}

function baFoxEditTaskPreviousValue_(task, field) {
  if (field === 'nextAction') return task.steps;
  return task[field] || '';
}

function baFoxSafeJson_(value) {
  try {
    return JSON.stringify(value || {});
  } catch (err) {
    return '{}';
  }
}

function baFoxTaskIdMatchCount_(sheet, taskId) {
  var values = sheet.getDataRange().getValues();
  var count = 0;
  for (var index = 1; index < values.length; index += 1) {
    if (baFoxSafeString(values[index][BA_FOX_CONFIG.TASK_COLUMNS.ID - 1]) === baFoxSafeString(taskId)) {
      count += 1;
    }
  }
  return count;
}

function baFoxSafeEditTask(request) {
  var normalized = baFoxNormalizeRequest(request);
  var rejectedKeys = baFoxRejectedEditTaskKeys_(normalized);
  if (rejectedKeys.length) {
    return baFoxError('FIELDS_NOT_ALLOWED', 'Only safe edit task fields are allowed.', {
      rejectedFields: rejectedKeys
    });
  }

  var missing = baFoxRequired(normalized, ['taskId']);
  if (missing.length) {
    return baFoxError('VALIDATION_ERROR', 'Missing required fields.', { missing: missing });
  }

  if (!baFoxActionTokenMatches_(normalized.token)) {
    return baFoxUnauthorized_();
  }

  if (BA_FOX_CONFIG.SAFE_WRITE_MODE !== true) {
    return baFoxError('SAFE_WRITES_DISABLED', 'Safe task editing is disabled.', {});
  }

  if (baFoxSafeString(normalized.note) && !baFoxSafeString(normalized.comment)) {
    normalized.comment = normalized.note;
  }

  var editableFields = ['title', 'organization', 'nextAction', 'deadline', 'priority', 'category', 'taskType', 'comment'];
  var objectFields = baFoxValidateEditTaskScalar_(normalized, editableFields);
  if (objectFields.length) {
    return baFoxError('VALIDATION_ERROR', 'Edit task fields must be simple text values.', {
      fields: objectFields
    });
  }

  if (!baFoxValidateEditTaskDeadline_(normalized.deadline)) {
    return baFoxError('VALIDATION_ERROR', 'Deadline must use YYYY-MM-DD format.', {
      deadline: normalized.deadline || ''
    });
  }

  if (baFoxSafeString(normalized.taskType) && !baFoxValidateTaskType(baFoxSafeString(normalized.taskType))) {
    return baFoxError('VALIDATION_ERROR', 'Invalid task type.', { taskType: normalized.taskType });
  }

  var formulaFields = editableFields.filter(function(field) {
    return baFoxSafeString(normalized[field]) && baFoxLooksLikeFormula_(normalized[field]);
  });
  if (formulaFields.length) {
    return baFoxError('VALIDATION_ERROR', 'Formula-like values are not allowed.', {
      fields: formulaFields
    });
  }

  var match = baFoxFindTaskRow_(normalized.taskId);
  if (!match.ok) {
    baFoxAuditTaskAction({
      timestamp: baFoxIsoNow(),
      actor: 'BA Fox Web',
      taskId: normalized.taskId,
      action: 'editTask',
      routeAction: 'editTask',
      source: 'web',
      result: 'failed',
      errorCode: match.error.error && match.error.error.code
    });
    return match.error;
  }

  if (baFoxTaskIdMatchCount_(match.sheet, normalized.taskId) !== 1) {
    baFoxAuditTaskAction({
      timestamp: baFoxIsoNow(),
      actor: 'BA Fox Web',
      taskId: normalized.taskId,
      action: 'editTask',
      routeAction: 'editTask',
      source: 'web',
      result: 'failed',
      errorCode: 'DUPLICATE_TASK_ID'
    });
    return baFoxError('DUPLICATE_TASK_ID', 'Task id must match exactly one row.', {
      taskId: normalized.taskId
    });
  }

  var previous = baFoxNormalizeTaskRow(match.row);
  var fieldMap = baFoxEditTaskFieldMap_();
  var patch = {
    UPDATED_AT: baFoxIsoNow()
  };
  var changedFields = [];
  var previousValues = {};
  var newValues = {};

  editableFields.forEach(function(field) {
    if (!Object.prototype.hasOwnProperty.call(normalized, field)) {
      return;
    }
    var newValue = baFoxSafeString(normalized[field]);
    var previousValue = baFoxSafeString(baFoxEditTaskPreviousValue_(previous, field));
    if (newValue === previousValue) {
      return;
    }
    patch[fieldMap[field]] = newValue;
    changedFields.push(field);
    previousValues[field] = previousValue;
    newValues[field] = newValue;
  });

  if (!changedFields.length) {
    return baFoxError('NO_CHANGES', 'No editable fields changed.', {
      taskId: normalized.taskId
    });
  }

  var updateResponse = baFoxUpdateTaskActionRow(normalized.taskId, patch);
  if (!updateResponse.ok) {
    baFoxAuditTaskAction({
      timestamp: patch.UPDATED_AT,
      actor: 'BA Fox Web',
      taskId: normalized.taskId,
      action: 'editTask',
      routeAction: 'editTask',
      source: 'web',
      result: 'failed',
      errorCode: updateResponse.error && updateResponse.error.code,
      changedFields: changedFields.join(','),
      previousValues: baFoxSafeJson_(previousValues),
      newValues: baFoxSafeJson_(newValues)
    });
    return updateResponse;
  }

  var auditResult = baFoxAuditTaskAction({
    timestamp: patch.UPDATED_AT,
    actor: 'BA Fox Web',
    taskId: normalized.taskId,
    action: 'editTask',
    routeAction: 'editTask',
    source: 'web',
    result: 'success',
    errorCode: '',
    changedFields: changedFields.join(','),
    previousValues: baFoxSafeJson_(previousValues),
    newValues: baFoxSafeJson_(newValues)
  });

  return baFoxOk({
    taskId: normalized.taskId,
    changedFields: changedFields,
    previousValues: previousValues,
    newValues: newValues,
    updatedAt: patch.UPDATED_AT,
    updateResult: updateResponse.data,
    auditResult: auditResult
  });
}
