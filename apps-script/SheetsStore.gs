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

function baFoxAppendTaskRow(rowValues) {
  return {
    dryRun: true,
    rowValues: rowValues,
    message: 'Stage V2.4 read-only mode does not write to Google Sheets.'
  };
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
