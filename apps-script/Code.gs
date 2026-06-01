function baFoxScaffoldInfo() {
  return baFoxOk({
    version: BA_FOX_CONFIG.VERSION,
    dryRun: BA_FOX_CONFIG.DRY_RUN,
    readLiveSheets: BA_FOX_CONFIG.READ_LIVE_SHEETS,
    safeWritesEnabled: BA_FOX_CONFIG.SAFE_WRITE_MODE === true,
    timezone: BA_FOX_CONFIG.TIMEZONE,
    sheets: BA_FOX_CONFIG.SHEETS,
    liveAutomationEnabled: false,
    triggersEnabled: false
  });
}

function baFoxManualSmokeTest() {
  return baFoxOk({
    info: baFoxScaffoldInfo().data,
    today: getTodayTasks({}),
    open: getOpenTasks({ taskType: 'all' }),
    pushes: getPushTasks({ dateRange: 'today' }),
    report: buildDailyReportDraft({})
  });
}
