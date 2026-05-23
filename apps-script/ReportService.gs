function baFoxBuildDailyReportDraft(request) {
  var normalized = baFoxNormalizeRequest(request);
  var date = baFoxDateOrToday(normalized.date);
  var format = normalized.format || 'ba_daily';

  if (!baFoxValidateEnum(format, BA_FOX_CONFIG.REPORT_FORMATS)) {
    return baFoxError('VALIDATION_ERROR', 'Invalid report format.', { format: format });
  }

  var todayResult = baFoxListTodayTasks({ date: date });
  var reportId = 'REPORT-' + date.replace(/-/g, '') + '-DRYRUN';
  var draft = [
    'Daily BA report draft',
    '',
    'Date: ' + date,
    '',
    'Completed:',
    '- Report write remains dry-run; source task rows may be read live.',
    '',
    'In progress / control:',
    '- Review the read-only task results before enabling future writes.',
    '',
    'Blockers:',
    '- None captured by scaffold.',
    '',
    'Next actions:',
    '- Keep report persistence disabled until a separately approved stage.'
  ].join('\n');

  var reportRow = [
    reportId,
    date,
    format,
    'draft',
    draft,
    '',
    baFoxIsoNow(),
    baFoxIsoNow(),
    '',
    'Read-only Stage V2.4 draft; no report row written.'
  ];

  return baFoxOk({
    reportId: reportId,
    draft: draft,
    dryRun: true,
    sourceTaskCount: todayResult.tasks.length,
    appendResult: baFoxAppendReportRow(reportRow)
  });
}
