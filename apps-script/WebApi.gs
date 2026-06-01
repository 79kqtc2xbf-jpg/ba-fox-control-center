function getTodayTasks(request) {
  return baFoxOk(baFoxListTodayTasks(request));
}

function getOpenTasks(request) {
  return baFoxOk(baFoxListOpenTasks(request));
}

function getPushTasks(request) {
  return baFoxOk(baFoxListPushTasks(request));
}

function addTask(request) {
  return baFoxCreateTask(request);
}

function updateTaskStatus(request) {
  return baFoxSetTaskStatus(request);
}

function updateTaskComment(request) {
  return baFoxSetTaskComment(request);
}

function taskAction(request) {
  return baFoxTaskAction(request);
}

function buildDailyReportDraft(request) {
  return baFoxBuildDailyReportDraft(request);
}
