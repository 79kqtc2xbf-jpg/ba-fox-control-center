function baFoxScaffoldInfo() {
  return baFoxOk({
    version: BA_FOX_CONFIG.VERSION,
    dryRun: BA_FOX_CONFIG.DRY_RUN,
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
