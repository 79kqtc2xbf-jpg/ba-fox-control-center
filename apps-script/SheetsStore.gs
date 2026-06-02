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
  Object.keys(patch).forEach(function(field) {
    var column = BA_FOX_CONFIG.TASK_COLUMNS[field];
    if (column && column <= sheet.getLastColumn()) {
      updates.push({
        column: column,
        value: patch[field]
      });
    }
  });

  updates.forEach(function(update) {
    sheet.getRange(match.rowNumber, update.column).setValue(update.value);
  });

  return baFoxOk({
    taskId: taskId,
    rowNumber: match.rowNumber,
    updatedFields: updates.map(function(update) { return update.column; })
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
    sheet.appendRow(rowValues);
    return baFoxOk({
      dryRun: false,
      appended: true,
      rowNumber: sheet.getLastRow()
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
