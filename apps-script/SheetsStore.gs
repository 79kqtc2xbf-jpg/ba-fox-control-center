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
  if (BA_FOX_CONFIG.DRY_RUN) {
    return {
      dryRun: true,
      rows: []
    };
  }

  var sheet = baFoxGetSheetByName_(BA_FOX_CONFIG.SHEETS.TASKS);
  if (!sheet) {
    return {
      dryRun: false,
      rows: []
    };
  }

  var values = sheet.getDataRange().getValues();
  return {
    dryRun: false,
    rows: values.slice(1)
  };
}

function baFoxAppendTaskRow(rowValues) {
  return {
    dryRun: true,
    rowValues: rowValues,
    message: 'Stage V2.2 scaffold does not write to Google Sheets.'
  };
}

function baFoxUpdateTaskRow(taskId, patch) {
  return {
    dryRun: true,
    taskId: taskId,
    patch: patch,
    message: 'Stage V2.2 scaffold does not update Google Sheets.'
  };
}

function baFoxAppendReportRow(rowValues) {
  return {
    dryRun: true,
    rowValues: rowValues,
    message: 'Stage V2.2 scaffold does not write reports.'
  };
}
