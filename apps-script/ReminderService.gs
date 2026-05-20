function baFoxPreviewDueReminders(request) {
  var normalized = baFoxNormalizeRequest(request);
  return baFoxOk({
    dryRun: true,
    date: baFoxDateOrToday(normalized.date),
    timezone: BA_FOX_CONFIG.TIMEZONE,
    reminders: [],
    message: 'Reminder selection is scaffold-only. No triggers are enabled in Stage V2.2.'
  });
}

function baFoxInstallReminderTriggersDryRun() {
  return baFoxOk({
    dryRun: true,
    installed: false,
    message: 'Trigger installation is intentionally disabled in Stage V2.2.'
  });
}
