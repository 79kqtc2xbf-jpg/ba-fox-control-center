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

function baFoxGetDashboard_(parameters) {
  return baFoxOk({
    scaffoldInfo: baFoxScaffoldInfo().data,
    today: getTodayTasks({ date: parameters.date }).data,
    open: getOpenTasks({ taskType: parameters.taskType || parameters.scope || 'all' }).data,
    pushes: getPushTasks({ dateRange: parameters.dateRange || 'today' }).data
  });
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

  switch (route) {
    case 'scaffoldInfo':
      response = baFoxScaffoldInfo();
      break;
    case 'today':
      response = getTodayTasks({ date: parameters.date });
      break;
    case 'open':
      response = getOpenTasks({ taskType: parameters.taskType || parameters.scope || 'all' });
      break;
    case 'pushes':
      response = getPushTasks({ dateRange: parameters.dateRange || 'today' });
      break;
    case 'dashboard':
      response = baFoxGetDashboard_(parameters);
      break;
    default:
      response = baFoxError(
        'ROUTE_NOT_FOUND',
        'Unknown read-only route.',
        { route: route }
      );
  }

  return baFoxReadOutput_(response, callback);
}

function doPost(event) {
  var body = event && event.postData && event.postData.contents;
  return baFoxJsonOutput_(baFoxError(
      'NOT_IMPLEMENTED',
      'Stage V2.5 does not expose write endpoints.',
      { receivedBody: Boolean(body) }
    ));
}
