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
    '- Dry-run scaffold: no live task rows read yet.',
    '',
    'In progress / control:',
    '- Connect to SheetsStore after schema migration is approved.',
    '',
    'Blockers:',
    '- None captured by scaffold.',
    '',
    'Next actions:',
    '- Implement read/write logic after Stage V2.2 review.'
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
    'Dry-run scaffold report.'
  ];

  return baFoxOk({
    reportId: reportId,
    draft: draft,
    dryRun: true,
    sourceTaskCount: todayResult.tasks.length,
    appendResult: baFoxAppendReportRow(reportRow)
  });
}
