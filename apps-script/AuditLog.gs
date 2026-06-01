function baFoxAuditEvent(action, entityType, entityId, details) {
  return {
    dryRun: true,
    event: {
      timestamp: baFoxIsoNow(),
      actor: baFoxSafeString(details && details.actor) || 'apps_script_scaffold',
      action: action,
      entityType: entityType,
      entityId: entityId || '',
      source: 'apps_script',
      notes: details || {}
    },
    message: 'Stage V2.2 scaffold does not append audit rows.'
  };
}

function baFoxAuditTaskAction(details) {
  var sheet = baFoxGetSheetByName_(BA_FOX_CONFIG.SHEETS.AUDIT_LOG);
  if (!sheet) {
    return {
      dryRun: false,
      warning: 'AuditLog sheet is not available.'
    };
  }

  try {
    var headers = baFoxReadSheetHeaders_(sheet);
    if (!headers.length) {
      return {
        dryRun: false,
        warning: 'AuditLog has no headers.'
      };
    }

    var values = headers.map(function(header) {
      var key = baFoxSafeString(header).toLowerCase();
      if (key === 'timestamp') return details.timestamp || baFoxIsoNow();
      if (key === 'actor') return details.actor || 'BA Fox Web';
      if (key === 'taskid' || key === 'task id' || key === 'entityid') return details.taskId || '';
      if (key === 'action') return details.action || '';
      if (key === 'previousstatus') return details.previousStatus || '';
      if (key === 'newstatus') return details.newStatus || '';
      if (key === 'previousnextreminder') return details.previousNextReminder || '';
      if (key === 'newnextreminder') return details.newNextReminder || '';
      if (key === 'route/action' || key === 'routeaction' || key === 'route') return details.routeAction || 'taskAction/' + (details.action || '');
      if (key === 'source') return details.source || 'web';
      if (key === 'result') return details.result || '';
      if (key === 'errorcode') return details.errorCode || '';
      return '';
    });

    sheet.appendRow(values);
    return {
      dryRun: false,
      appended: true
    };
  } catch (err) {
    return {
      dryRun: false,
      warning: err && err.message ? err.message : 'AuditLog append failed.'
    };
  }
}
