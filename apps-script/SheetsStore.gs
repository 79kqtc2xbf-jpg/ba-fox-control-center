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

function baFoxOptionalTaskFieldNames_(field) {
  var names = {
    CONTROL_DATE: ['controlDate', 'control_date', 'Control Date', 'Контрольная дата', 'Дата контроля'],
    FOCUS: ['focus', 'isFocus', 'manualFocus', 'Focus', 'Фокус'],
    OWNER_EMAIL: ['ownerEmail', 'owner_email', 'Owner Email', 'Email ответственного'],
    OWNER_USER_ID: ['ownerUserId', 'owner_user_id', 'Owner User ID', 'ID ответственного'],
    COLLABORATOR_EMAILS: ['collaboratorEmails', 'collaborator_emails', 'Collaborator Emails', 'Участники email'],
    COLLABORATOR_USER_IDS: ['collaboratorUserIds', 'collaborator_user_ids', 'Collaborator User IDs', 'Участники userId'],
    CREATED_BY_EMAIL: ['createdByEmail', 'created_by_email', 'Created By Email', 'Создал email'],
    CREATED_BY_USER_ID: ['createdByUserId', 'created_by_user_id', 'Created By User ID', 'Создал userId'],
    VISIBILITY: ['visibility', 'Visibility', 'Видимость']
  };
  return names[field] || [];
}

function baFoxTaskIdentityColumnDefinitions_() {
  return [
    { key: 'ownerEmail', field: 'OWNER_EMAIL', header: 'Owner Email' },
    { key: 'ownerUserId', field: 'OWNER_USER_ID', header: 'Owner User ID' },
    { key: 'collaboratorEmails', field: 'COLLABORATOR_EMAILS', header: 'Collaborator Emails' },
    { key: 'collaboratorUserIds', field: 'COLLABORATOR_USER_IDS', header: 'Collaborator User IDs' },
    { key: 'createdByEmail', field: 'CREATED_BY_EMAIL', header: 'Created By Email' },
    { key: 'createdByUserId', field: 'CREATED_BY_USER_ID', header: 'Created By User ID' },
    { key: 'visibility', field: 'VISIBILITY', header: 'Visibility' }
  ];
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

function baFoxAppendSafeCreateTaskRow(rowValues) {
  var sheet = baFoxGetSheetByName_(BA_FOX_CONFIG.SHEETS.TASKS);
  if (!sheet) {
    return baFoxError('TASKS_SHEET_MISSING', 'Tasks sheet is not available.', {});
  }

  try {
    var startedAt = new Date().getTime();
    sheet.appendRow(rowValues);
    return baFoxOk({
      dryRun: false,
      appended: true,
      rowNumber: sheet.getLastRow(),
      performance: {
        operation: 'sheetAppend',
        sheetWriteMs: new Date().getTime() - startedAt,
        timestamp: baFoxIsoNow()
      }
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
