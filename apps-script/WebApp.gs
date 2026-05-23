function baFoxJsonOutput_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
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
  var response;

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

  return baFoxJsonOutput_(response);
}

function doPost(event) {
  var body = event && event.postData && event.postData.contents;
  return baFoxJsonOutput_(baFoxError(
      'NOT_IMPLEMENTED',
      'Stage V2.5 does not expose write endpoints.',
      { receivedBody: Boolean(body) }
    ));
}
