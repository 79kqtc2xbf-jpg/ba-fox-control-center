function baFoxGetActiveSpreadsheet_() {
  if (typeof SpreadsheetApp === 'undefined') {
    return null;
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function baFoxGetSheetByName_(sheetName) {
  var spreadsheet = baFoxGetActiveSpreadsheet_();
  if (!spreadsheet) {
    return null;
  }
  return spreadsheet.getSheetByName(sheetName);
}

function baFoxReadTasksRows() {
  if (!BA_FOX_CONFIG.READ_LIVE_SHEETS) {
    return {
      dryRun: BA_FOX_CONFIG.DRY_RUN,
      readLive: false,
      rows: [],
      warning: 'Live Sheets reads are disabled.'
    };
  }

  var sheet = baFoxGetSheetByName_(BA_FOX_CONFIG.SHEETS.TASKS);
  if (!sheet) {
    return {
      dryRun: BA_FOX_CONFIG.DRY_RUN,
      readLive: false,
      rows: [],
      warning: 'Bound spreadsheet or Tasks sheet is not available.'
    };
  }

  var values = sheet.getDataRange().getValues();
  return {
    dryRun: BA_FOX_CONFIG.DRY_RUN,
    readLive: true,
    headers: values[0].map(function(header) { return baFoxSafeString(header); }),
    rows: values.slice(1),
    warning: null
  };
}

function baFoxReadSheetHeaders_(sheet) {
  if (!sheet || sheet.getLastRow() < 1) {
    return [];
  }
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function(header) {
    return baFoxSafeString(header);
  });
}

function baFoxFindHeaderColumn_(headers, names) {
  var normalizedNames = names.map(function(name) {
    return baFoxSafeString(name).toLowerCase();
  });
  for (var index = 0; index < headers.length; index += 1) {
    if (normalizedNames.indexOf(baFoxSafeString(headers[index]).toLowerCase()) !== -1) {
      return index + 1;
    }
  }
  return 0;
}

function baFoxTaskIdentityColumnDefinitions_() {
  return [
    { field: 'OWNER_EMAIL', key: 'ownerEmail', header: 'Owner Email', aliases: ['Owner Email', 'ownerEmail', 'owner_email', 'Email ответственного'] },
    { field: 'OWNER_USER_ID', key: 'ownerUserId', header: 'Owner User ID', aliases: ['Owner User ID', 'ownerUserId', 'owner_user_id', 'ID ответственного'] },
    { field: 'COLLABORATOR_EMAILS', key: 'collaboratorEmails', header: 'Collaborator Emails', aliases: ['Collaborator Emails', 'collaboratorEmails', 'collaborator_emails', 'Участники email'] },
    { field: 'COLLABORATOR_USER_IDS', key: 'collaboratorUserIds', header: 'Collaborator User IDs', aliases: ['Collaborator User IDs', 'collaboratorUserIds', 'collaborator_user_ids', 'Участники userId'] },
    { field: 'CREATED_BY_EMAIL', key: 'createdByEmail', header: 'Created By Email', aliases: ['Created By Email', 'createdByEmail', 'created_by_email', 'Создал email'] },
    { field: 'CREATED_BY_USER_ID', key: 'createdByUserId', header: 'Created By User ID', aliases: ['Created By User ID', 'createdByUserId', 'created_by_user_id', 'Создал userId'] },
    { field: 'VISIBILITY', key: 'visibility', header: 'Visibility', aliases: ['Visibility', 'visibility', 'Видимость'] }
  ];
}

function getTaskHeaderMap_(sheetOrHeaders) {
  var headers = Array.isArray(sheetOrHeaders)
    ? sheetOrHeaders
    : baFoxReadSheetHeaders_(sheetOrHeaders);
  var byName = {};
  headers.forEach(function(header, index) {
    var normalized = baFoxSafeString(header).toLowerCase();
    if (normalized && !byName[normalized]) {
      byName[normalized] = index + 1;
    }
  });
  return {
    headers: headers,
    byName: byName,
    columnCount: headers.length
  };
}

function getOptionalColumnIndex_(headerMap, aliases) {
  var map = headerMap || { byName: {} };
  var names = aliases || [];
  for (var index = 0; index < names.length; index += 1) {
    var column = map.byName[baFoxSafeString(names[index]).toLowerCase()];
    if (column) {
      return column;
    }
  }
  return 0;
}

function readOptionalCell_(row, headerMap, aliases) {
  var column = getOptionalColumnIndex_(headerMap, aliases);
  return column ? row[column - 1] : '';
}

function writeOptionalCell_(rowValues, headerMap, aliases, value) {
  var column = getOptionalColumnIndex_(headerMap, aliases);
  if (!column) {
    return false;
  }
  while (rowValues.length < column) {
    rowValues.push('');
  }
  rowValues[column - 1] = value;
  return true;
}

function baFoxRecommendedTaskIdentityColumns_() {
  return baFoxTaskIdentityColumnDefinitions_().map(function(definition) {
    return definition.header;
  });
}

function baFoxTaskIdentitySchemaStatus_(sheetOrHeaders) {
  var sheet = Array.isArray(sheetOrHeaders) ? null : (sheetOrHeaders || baFoxGetSheetByName_(BA_FOX_CONFIG.SHEETS.TASKS));
  var headerMap = getTaskHeaderMap_(Array.isArray(sheetOrHeaders) ? sheetOrHeaders : sheet);
  var columns = {};
  var present = [];
  var missing = [];
  baFoxTaskIdentityColumnDefinitions_().forEach(function(definition) {
    var column = getOptionalColumnIndex_(headerMap, definition.aliases);
    columns[definition.key] = {
      header: definition.header,
      aliases: definition.aliases,
      present: Boolean(column),
      column: column || null
    };
    if (column) {
      present.push(definition.header);
    } else {
      missing.push(definition.header);
    }
  });
  return {
    sheet: BA_FOX_CONFIG.SHEETS.TASKS,
    exists: Array.isArray(sheetOrHeaders) ? true : Boolean(sheet),
    status: missing.length ? (present.length ? 'partial' : 'missing') : 'ready',
    allPresent: missing.length === 0,
    anyPresent: present.length > 0,
    presentColumns: present,
    missingColumns: missing,
    columns: columns,
    recommendedTaskIdentityColumns: baFoxRecommendedTaskIdentityColumns_()
  };
}

function baFoxOptionalTaskFieldNames_(field) {
  var names = {
    CONTROL_DATE: ['controlDate', 'control_date', 'Control Date', 'Контрольная дата', 'Дата контроля'],
    FOCUS: ['focus', 'isFocus', 'manualFocus', 'Focus', 'Фокус'],
    OWNER_EMAIL: ['Owner Email', 'ownerEmail', 'owner_email', 'Email ответственного'],
    OWNER_USER_ID: ['Owner User ID', 'ownerUserId', 'owner_user_id', 'ID ответственного'],
    COLLABORATOR_EMAILS: ['Collaborator Emails', 'collaboratorEmails', 'collaborator_emails', 'Участники email'],
    COLLABORATOR_USER_IDS: ['Collaborator User IDs', 'collaboratorUserIds', 'collaborator_user_ids', 'Участники userId'],
    CREATED_BY_EMAIL: ['Created By Email', 'createdByEmail', 'created_by_email', 'Создал email'],
    CREATED_BY_USER_ID: ['Created By User ID', 'createdByUserId', 'created_by_user_id', 'Создал userId'],
    VISIBILITY: ['Visibility', 'visibility', 'Видимость']
  };
  return names[field] || [];
}

function getTaskIdentitySchemaStatus_() {
  var sheet = baFoxGetSheetByName_(BA_FOX_CONFIG.SHEETS.TASKS);
  var definitions = baFoxTaskIdentityColumnDefinitions_();
  var recommendedColumns = definitions.map(function(definition) {
    return definition.header;
  });
  var fallback = {
    sheet: BA_FOX_CONFIG.SHEETS.TASKS,
    exists: false,
    status: 'missing',
    requiredLegacyColumnsOk: false,
    optionalColumnsPresent: {},
    optionalColumns: {},
    missingColumns: recommendedColumns.slice(),
    recommendedColumns: recommendedColumns,
    canSafelyMigrate: false,
    migrationAlreadyDone: false,
    optionalIdentityWriteActive: false,
    headerColumns: 0,
    dataRows: 0
  };

  definitions.forEach(function(definition) {
    fallback.optionalColumnsPresent[definition.key] = false;
    fallback.optionalColumns[definition.key] = {
      present: false,
      header: '',
      recommendedHeader: definition.header,
      column: 0
    };
  });

  if (!sheet) {
    return fallback;
  }

  var headers = baFoxReadSheetHeaders_(sheet);
  var lastLegacyColumn = BA_FOX_CONFIG.TASK_COLUMNS.ARCHIVED || 25;
  var requiredLegacyColumnsOk = sheet.getLastColumn() >= lastLegacyColumn
    && baFoxFindHeaderColumn_(headers, ['ID', 'id', 'Task ID'])
    && baFoxFindHeaderColumn_(headers, ['Title', 'title', 'Название'])
    && baFoxFindHeaderColumn_(headers, ['Owner', 'owner', 'Ответственный']);
  var missingColumns = [];
  var presentCount = 0;
  var optionalColumnsPresent = {};
  var optionalColumns = {};

  definitions.forEach(function(definition) {
    var column = baFoxFindHeaderColumn_(headers, baFoxOptionalTaskFieldNames_(definition.field));
    var present = column > 0;
    if (present) {
      presentCount += 1;
    } else {
      missingColumns.push(definition.header);
    }
    optionalColumnsPresent[definition.key] = present;
    optionalColumns[definition.key] = {
      present: present,
      header: present ? headers[column - 1] : '',
      recommendedHeader: definition.header,
      column: column
    };
  });

  return {
    sheet: BA_FOX_CONFIG.SHEETS.TASKS,
    exists: true,
    status: presentCount === 0 ? 'missing' : presentCount === definitions.length ? 'ready' : 'partial',
    requiredLegacyColumnsOk: Boolean(requiredLegacyColumnsOk),
    optionalColumnsPresent: optionalColumnsPresent,
    optionalColumns: optionalColumns,
    missingColumns: missingColumns,
    recommendedColumns: recommendedColumns,
    canSafelyMigrate: Boolean(requiredLegacyColumnsOk && missingColumns.length > 0),
    migrationAlreadyDone: missingColumns.length === 0,
    optionalIdentityWriteActive: missingColumns.length < definitions.length,
    headerColumns: sheet.getLastColumn(),
    dataRows: Math.max(sheet.getLastRow() - 1, 0)
  };
}

function ensureTaskIdentityColumns_(options) {
  var settings = options || {};
  var confirm = settings.confirm === true || baFoxSafeString(settings.confirm).toLowerCase() === 'true';
  var status = getTaskIdentitySchemaStatus_();
  var result = {
    dryRun: !confirm,
    confirmed: confirm,
    schemaBefore: status,
    addedColumns: [],
    skippedColumns: status.missingColumns.slice(),
    schemaAfter: status
  };

  if (!status.exists) {
    result.error = 'TASKS_SHEET_MISSING';
    return result;
  }
  if (!status.requiredLegacyColumnsOk) {
    result.error = 'LEGACY_TASK_COLUMNS_INCOMPLETE';
    return result;
  }
  if (!status.missingColumns.length) {
    result.skippedColumns = [];
    return result;
  }
  if (!confirm) {
    return result;
  }

  var sheet = baFoxGetSheetByName_(BA_FOX_CONFIG.SHEETS.TASKS);
  var startColumn = sheet.getLastColumn() + 1;
  sheet.getRange(1, startColumn, 1, status.missingColumns.length).setValues([status.missingColumns]);
  result.addedColumns = status.missingColumns.map(function(header, index) {
    return {
      header: header,
      column: startColumn + index
    };
  });
  result.skippedColumns = [];
  result.schemaAfter = getTaskIdentitySchemaStatus_();
  return result;
}

function baFoxTaskColumnForField_(sheet, headers, field) {
  var fixedColumn = BA_FOX_CONFIG.TASK_COLUMNS[field];
  if (fixedColumn && fixedColumn <= sheet.getLastColumn()) {
    return fixedColumn;
  }
  return baFoxFindHeaderColumn_(headers || [], baFoxOptionalTaskFieldNames_(field));
}

function baFoxFindTaskRow_(taskId) {
  var sheet = baFoxGetSheetByName_(BA_FOX_CONFIG.SHEETS.TASKS);
  if (!sheet) {
    return {
      ok: false,
      error: baFoxError('TASKS_SHEET_MISSING', 'Tasks sheet is not available.', {})
    };
  }

  var values = sheet.getDataRange().getValues();
  for (var index = 1; index < values.length; index += 1) {
    if (baFoxSafeString(values[index][BA_FOX_CONFIG.TASK_COLUMNS.ID - 1]) === baFoxSafeString(taskId)) {
      return {
        ok: true,
        sheet: sheet,
        rowNumber: index + 1,
        row: values[index],
        headers: values[0].map(function(header) { return baFoxSafeString(header); })
      };
    }
  }

  return {
    ok: false,
    error: baFoxError('TASK_NOT_FOUND', 'Task was not found.', { taskId: taskId })
  };
}

function baFoxUpdateTaskActionRow(taskId, patch) {
  var match = baFoxFindTaskRow_(taskId);
  if (!match.ok) {
    return match.error;
  }

  var sheet = match.sheet;
  var updates = [];
  var skippedFields = [];
  Object.keys(patch).forEach(function(field) {
    var column = baFoxTaskColumnForField_(sheet, match.headers, field);
    if (column && column <= sheet.getLastColumn()) {
      updates.push({
        field: field,
        column: column,
        value: patch[field]
      });
    } else {
      skippedFields.push(field);
    }
  });

  updates.forEach(function(update) {
    sheet.getRange(match.rowNumber, update.column).setValue(update.value);
  });

  return baFoxOk({
    taskId: taskId,
    rowNumber: match.rowNumber,
    updatedFields: updates.map(function(update) { return update.field; }),
    updatedColumns: updates.map(function(update) { return update.column; }),
    skippedFields: skippedFields
  });
}

function baFoxAppendTaskRow(rowValues) {
  return {
    dryRun: true,
    rowValues: rowValues,
    message: 'Stage V2.4 read-only mode does not write to Google Sheets.'
  };
}

function baFoxAppendSafeCreateTaskRow(rowValues, identityMetadata) {
  var sheet = baFoxGetSheetByName_(BA_FOX_CONFIG.SHEETS.TASKS);
  if (!sheet) {
    return baFoxError('TASKS_SHEET_MISSING', 'Tasks sheet is not available.', {});
  }

  try {
    var startedAt = new Date().getTime();
    var headerMap = getTaskHeaderMap_(sheet);
    var schema = baFoxTaskIdentitySchemaStatus_(headerMap.headers);
    var finalRowValues = rowValues.slice();
    while (finalRowValues.length < sheet.getLastColumn()) {
      finalRowValues.push('');
    }
    if (identityMetadata) {
      writeOptionalCell_(finalRowValues, headerMap, baFoxOptionalTaskFieldNames_('OWNER_EMAIL'), identityMetadata.ownerEmail || '');
      writeOptionalCell_(finalRowValues, headerMap, baFoxOptionalTaskFieldNames_('OWNER_USER_ID'), identityMetadata.ownerUserId || '');
      writeOptionalCell_(finalRowValues, headerMap, baFoxOptionalTaskFieldNames_('CREATED_BY_EMAIL'), identityMetadata.createdByEmail || '');
      writeOptionalCell_(finalRowValues, headerMap, baFoxOptionalTaskFieldNames_('CREATED_BY_USER_ID'), identityMetadata.createdByUserId || '');
      writeOptionalCell_(finalRowValues, headerMap, baFoxOptionalTaskFieldNames_('VISIBILITY'), identityMetadata.visibility || 'team');
    }
    sheet.appendRow(finalRowValues);
    return baFoxOk({
      dryRun: false,
      appended: true,
      rowNumber: sheet.getLastRow(),
      performance: {
        operation: 'sheetAppend',
        sheetWriteMs: new Date().getTime() - startedAt,
        timestamp: baFoxIsoNow()
      },
      taskIdentitySchema: schema,
      optionalIdentityColumnsPresent: schema.anyPresent,
      identityColumnsApplied: identityMetadata ? schema.presentColumns : [],
      identityColumnsMissing: schema.missingColumns
    });
  } catch (err) {
    return baFoxError(
      'TASK_APPEND_FAILED',
      err && err.message ? err.message : 'Task append failed.',
      {}
    );
  }
}

function baFoxUpdateTaskRow(taskId, patch) {
  return {
    dryRun: true,
    taskId: taskId,
    patch: patch,
    message: 'Stage V2.4 read-only mode does not update Google Sheets.'
  };
}

function baFoxAppendReportRow(rowValues) {
  return {
    dryRun: true,
    rowValues: rowValues,
    message: 'Stage V2.4 read-only mode does not write reports.'
  };
}
