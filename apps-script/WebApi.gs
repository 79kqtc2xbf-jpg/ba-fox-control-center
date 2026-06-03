function getTodayTasks(request) {
  return baFoxOk(baFoxListTodayTasks(request));
}

function getOpenTasks(request) {
  return baFoxOk(baFoxListOpenTasks(request));
}

function getPushTasks(request) {
  return baFoxOk(baFoxListPushTasks(request));
}

function getCompletedTasks(request) {
  return baFoxOk(baFoxListCompletedTasks(request));
}

function addTask(request) {
  return baFoxCreateTask(request);
}

function createTask(request) {
  return baFoxSafeCreateTask(request);
}

function editTask(request) {
  return baFoxSafeEditTask(request);
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
