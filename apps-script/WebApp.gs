function baFoxJsonOutput_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function baFoxJsonpCallbackIsValid_(callback) {
  return typeof callback === 'string'
    && callback.length <= 128
    && /^BAFoxJsonpCallback_[A-Za-z0-9_$]+$/.test(callback);
}

function baFoxReadOutput_(payload, callback) {
  if (!callback) {
    return baFoxJsonOutput_(payload);
  }

  return ContentService
    .createTextOutput(callback + '(' + JSON.stringify(payload) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function baFoxRequestParameters_(event) {
  return event && event.parameter ? event.parameter : {};
}

function baFoxCacheTtlSeconds_() {
  return 45;
}

function baFoxCacheKey_(route, parameters) {
  var keyParts = [route];
  ['date', 'taskType', 'scope', 'dateRange', 'limit', 'completedLimit'].forEach(function(name) {
    if (parameters[name]) {
      keyParts.push(name + '=' + parameters[name]);
    }
  });
  return 'baFoxRead:' + keyParts.join('|');
}

function baFoxIsWriteRoute_(route) {
  return ['taskAction', 'createTask', 'editTask'].indexOf(route) !== -1;
}

function baFoxReadCache_() {
  if (typeof CacheService === 'undefined') {
    return null;
  }
  return CacheService.getScriptCache();
}

function baFoxGetCachedResponse_(route, parameters) {
  var cache = baFoxReadCache_();
  if (!cache) {
    return null;
  }

  try {
    var cached = cache.get(baFoxCacheKey_(route, parameters));
    if (!cached) {
      return null;
    }

    return JSON.parse(cached);
  } catch (err) {
    return null;
  }
}

function baFoxPutCachedResponse_(route, parameters, response) {
  var cache = baFoxReadCache_();
  if (!cache || !response || response.ok !== true) {
    return;
  }
  try {
    cache.put(baFoxCacheKey_(route, parameters), JSON.stringify(response), baFoxCacheTtlSeconds_());
  } catch (err) {
    // Large read-only payloads may exceed CacheService limits; serving uncached is safer than failing.
  }
}

function baFoxBuildTaskViewsFromRows_(parameters, storeResult) {
  return {
    scaffoldInfo: baFoxScaffoldInfo().data,
    inbox: baFoxListInboxTasks({ date: parameters.date }, storeResult),
    focus: baFoxListFocusTasks({ date: parameters.date }, storeResult),
    today: baFoxListTodayTasks({ date: parameters.date }, storeResult),
    open: baFoxListOpenTasks({ taskType: parameters.taskType || parameters.scope || 'all' }, storeResult),
    pushes: baFoxListPushTasks({ dateRange: parameters.dateRange || 'today' }, storeResult),
    completed: baFoxListCompletedTasks({ limit: parameters.completedLimit || 50 }, storeResult)
  };
}

function baFoxBuildWorkspaceViewsFromRows_(parameters, storeResult) {
  return {
    scaffoldInfo: baFoxScaffoldInfo().data,
    inbox: baFoxListInboxTasks({ date: parameters.date }, storeResult),
    focus: baFoxListFocusTasks({ date: parameters.date }, storeResult),
    today: baFoxListTodayTasks({ date: parameters.date }, storeResult),
    open: baFoxListOpenTasks({ taskType: parameters.taskType || parameters.scope || 'all' }, storeResult),
    pushes: baFoxListPushTasks({ dateRange: parameters.dateRange || 'today' }, storeResult)
  };
}

function baFoxGetDashboard_(parameters) {
  var storeResult = baFoxReadTasksRows();
  return baFoxOk(baFoxBuildWorkspaceViewsFromRows_(parameters, storeResult));
}

function baFoxGetWorkspaceDashboard_(parameters) {
  var storeResult = baFoxReadTasksRows();
  return baFoxOk(baFoxBuildWorkspaceViewsFromRows_(parameters, storeResult));
}

function baFoxGetFullDashboard_(parameters) {
  var storeResult = baFoxReadTasksRows();
  var dashboard = baFoxBuildTaskViewsFromRows_(parameters, storeResult);
  var auditResponse = baFoxBuildCleanupAuditDryRun(storeResult);
  if (!auditResponse.ok) {
    return auditResponse;
  }
  dashboard.cleanupAudit = auditResponse.data;
  return baFoxOk(dashboard);
}

function baFoxReadSheetStatus_(sheetName) {
  var sheet = baFoxGetSheetByName_(sheetName);
  if (!sheet) {
    return {
      sheet: sheetName,
      exists: false,
      status: 'missing',
      headerColumns: 0,
      dataRows: 0,
      headersOnly: false
    };
  }

  return {
    sheet: sheetName,
    exists: true,
    status: sheet.getLastRow() <= 1 ? 'headers_only' : 'has_data',
    headerColumns: sheet.getLastColumn(),
    dataRows: Math.max(sheet.getLastRow() - 1, 0),
    headersOnly: sheet.getLastRow() <= 1
  };
}

function baFoxGetSafetyStatus_() {
  var auditLog = baFoxReadSheetStatus_(BA_FOX_CONFIG.SHEETS.AUDIT_LOG);
  var reports = baFoxReadSheetStatus_(BA_FOX_CONFIG.SHEETS.REPORTS);
  var notificationQueue = baFoxReadSheetStatus_(BA_FOX_CONFIG.SHEETS.NOTIFICATION_QUEUE);

  return baFoxOk({
    dryRun: BA_FOX_CONFIG.DRY_RUN,
    readLive: BA_FOX_CONFIG.READ_LIVE_SHEETS,
    readLiveSheets: BA_FOX_CONFIG.READ_LIVE_SHEETS,
    safeWritesEnabled: BA_FOX_CONFIG.SAFE_WRITE_MODE === true,
    liveAutomationEnabled: false,
    triggersEnabled: false,
    sheets: {
      AuditLog: auditLog,
      Reports: reports,
      NotificationQueue: notificationQueue
    },
    counts: {
      AuditLog: auditLog.dataRows,
      Reports: reports.dataRows,
      NotificationQueue: notificationQueue.dataRows
    }
  });
}

function baFoxIsRateLimitError_(err) {
  var message = err && err.message ? String(err.message).toLowerCase() : '';
  return message.indexOf('too many requests') !== -1
    || message.indexOf('rate limit') !== -1
    || message.indexOf('quota') !== -1
    || message.indexOf('429') !== -1;
}

function baFoxReadErrorResponse_(err) {
  if (baFoxIsRateLimitError_(err)) {
    return baFoxError(
      'SHEETS_RATE_LIMITED',
      'Google Sheets temporarily limited read requests.',
      { retryAfterSeconds: baFoxCacheTtlSeconds_() }
    );
  }

  return baFoxError(
    'READ_ROUTE_ERROR',
    err && err.message ? err.message : 'Read-only route failed.',
    {}
  );
}

function baFoxBuildRouteResponse_(route, parameters) {
  var response;

  switch (route) {
    case 'scaffoldInfo':
      response = baFoxScaffoldInfo();
      break;
    case 'today':
      response = getTodayTasks({ date: parameters.date });
      break;
    case 'inbox':
      response = getInboxTasks({ date: parameters.date });
      break;
    case 'focus':
      response = getFocusTasks({ date: parameters.date });
      break;
    case 'open':
      response = getOpenTasks({ taskType: parameters.taskType || parameters.scope || 'all' });
      break;
    case 'pushes':
      response = getPushTasks({ dateRange: parameters.dateRange || 'today' });
      break;
    case 'completed':
      response = getCompletedTasks({ limit: parameters.limit || 50 });
      break;
    case 'dashboard':
      response = baFoxGetDashboard_(parameters);
      break;
    case 'workspaceDashboard':
      response = baFoxGetWorkspaceDashboard_(parameters);
      break;
    case 'fullDashboard':
      response = baFoxGetFullDashboard_(parameters);
      break;
    case 'cleanupAudit':
      response = baFoxBuildCleanupAuditDryRun();
      break;
    case 'safetyStatus':
      response = baFoxGetSafetyStatus_();
      break;
    case 'taskAction':
      response = taskAction(parameters);
      break;
    case 'createTask':
      response = createTask(parameters);
      break;
    case 'editTask':
      response = editTask(parameters);
      break;
    default:
      response = baFoxError(
        'ROUTE_NOT_FOUND',
        'Unknown route.',
        { route: route }
      );
  }

  return response;
}

function doGet(event) {
  var parameters = baFoxRequestParameters_(event);
  var route = parameters.route || 'scaffoldInfo';
  var callback = parameters.callback || '';
  var response;

  if (callback && !baFoxJsonpCallbackIsValid_(callback)) {
    return baFoxJsonOutput_(baFoxError(
      'INVALID_CALLBACK',
      'Callback name is not allowed.',
      {}
    ));
  }

  try {
    if (baFoxIsWriteRoute_(route)) {
      response = baFoxBuildRouteResponse_(route, parameters);
    } else {
      response = baFoxGetCachedResponse_(route, parameters);
      if (!response) {
        response = baFoxBuildRouteResponse_(route, parameters);
        baFoxPutCachedResponse_(route, parameters, response);
      }
    }
  } catch (err) {
    response = baFoxReadErrorResponse_(err);
  }

  return baFoxReadOutput_(response, callback);
}

function doPost(event) {
  var body = event && event.postData && event.postData.contents;
  var payload = baFoxNormalizeRequest(body);
  var route = payload.route || 'scaffoldInfo';
  return baFoxJsonOutput_(baFoxBuildRouteResponse_(route, payload));
}
