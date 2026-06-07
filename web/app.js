const viewLabels = Object.freeze({
  inbox: ['📥 Inbox', 'Новые задачи и входящий поток'],
  focus: ['🎯 Focus', '3–5 задач, которые двигают день'],
  today: ['🔥 Today', 'Сроки, контроль и напоминания на сегодня'],
  documents: ['Документы', 'Документы, договоры и KYC'],
  communication: ['Коммуникация', 'Ответы, письма и касания'],
  presentations: ['Презентации', 'Деки, офферы и материалы'],
  brokers: ['Брокеры', 'Брокеры, партнёры и внешние касания'],
  waiting: ['⏰ Waiting', 'Ожидания, контрольные даты и пуши'],
  all: ['📋 All Tasks', 'Поиск, фильтры и обслуживание очереди'],
  completed: ['Completed', 'Архив, история и память для отчётов'],
  calendar: ['Календарь', 'Задачи по срокам и напоминаниям'],
  reports: ['📈 Reports', 'Дневной и недельный отчёт'],
  system: ['Система', 'Безопасный режим'],
});

const elements = {
  tabBar: document.querySelector('.tabs'),
  tabs: document.querySelectorAll('.tab'),
  summaryCards: document.querySelector('#summaryCards'),
  panelEyebrow: document.querySelector('#panelEyebrow'),
  panelTitle: document.querySelector('#panelTitle'),
  panelBadge: document.querySelector('#panelBadge'),
  statusMessage: document.querySelector('#statusMessage'),
  workspaceControls: document.querySelector('#workspaceControls'),
  taskList: document.querySelector('#taskList'),
  todayLabel: document.querySelector('#todayLabel'),
  modeBanner: document.querySelector('#modeBanner'),
  writeModePill: document.querySelector('#writeModePill'),
  createTaskButton: document.querySelector('#createTaskButton'),
  createTaskModal: document.querySelector('#createTaskModal'),
  createTaskForm: document.querySelector('#createTaskForm'),
  createTaskMessage: document.querySelector('#createTaskMessage'),
  submitCreateTask: document.querySelector('#submitCreateTask'),
  cancelCreateTask: document.querySelector('#cancelCreateTask'),
  cancelCreateTaskTop: document.querySelector('#cancelCreateTaskTop'),
  editTaskModal: document.querySelector('#editTaskModal'),
  editTaskForm: document.querySelector('#editTaskForm'),
  editTaskBody: document.querySelector('#editTaskBody'),
  editTaskMessage: document.querySelector('#editTaskMessage'),
  submitEditTask: document.querySelector('#submitEditTask'),
  closeEditTask: document.querySelector('#closeEditTask'),
  closeEditTaskTop: document.querySelector('#closeEditTaskTop'),
};

const auditFilters = Object.freeze([
  { id: 'all', label: 'Все', issueTypes: [] },
  { id: 'duplicates', label: 'Дубликаты', issueTypes: ['DUPLICATE_ID', 'NEAR_DUPLICATE'] },
  { id: 'statuses', label: 'Статусы', issueTypes: ['STATUS_NORMALIZATION'] },
  { id: 'priorities', label: 'Приоритеты', issueTypes: ['PRIORITY_NORMALIZATION'] },
  { id: 'dates', label: 'Даты', issueTypes: ['CORRUPTED_FIELD'] },
  { id: 'missingV2', label: 'Поля V2', issueTypes: ['TASK_TYPE_MISSING', 'OWNER_MISSING'] },
  { id: 'archive', label: 'Архив-кандидаты', issueTypes: ['ARCHIVE_CANDIDATE'] },
]);

const severityRank = Object.freeze({
  high: 1,
  medium: 2,
  low: 3,
});

const taskFilters = Object.freeze([
  { id: 'all', label: 'Все' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'focus', label: 'Focus' },
  { id: 'urgent', label: 'Срочно' },
  { id: 'high', label: 'Высокий приоритет' },
  { id: 'active', label: 'Active' },
  { id: 'waiting', label: 'Ждут ответа' },
  { id: 'push', label: 'Пуши' },
  { id: 'blockers', label: 'Блокеры' },
  { id: 'today', label: 'Сегодня' },
  { id: 'overdue', label: 'Просрочено' },
  { id: 'cleanup', label: 'Review' },
]);

const waitingStatuses = Object.freeze([
  'Ждём ответ',
  'Ждём подтверждение',
  'Ждём подписание',
  'Wait list',
  'Пуш',
]);

const actionLabels = Object.freeze({
  moveToWork: 'В работе',
  moveToPush: 'Пуш',
  moveToWaiting: 'Ждёт ответа',
  markDone: 'Готово',
  snoozeOneDay: 'Завтра',
  snoozeThreeDays: '+3 дня',
  snoozeNextWeek: 'Следующая неделя',
});

const allowedTaskActions = Object.freeze([
  'moveToWork',
  'moveToPush',
  'moveToWaiting',
  'markDone',
  'snoozeOneDay',
  'snoozeThreeDays',
  'snoozeNextWeek',
]);

const actionStatusUpdates = Object.freeze({
  moveToWork: 'В работе',
  moveToPush: 'Пуш',
  moveToWaiting: 'Ждём ответ',
  markDone: 'Выполнено',
});

const sidebarOrder = Object.freeze([
  'inbox',
  'focus',
  'today',
  'documents',
  'communication',
  'presentations',
  'brokers',
  'waiting',
  'all',
  'completed',
  'calendar',
  'reports',
  'system',
]);

const workflowGroupLabels = Object.freeze({
  urgent: ['Urgent', 'Просрочено, сегодня, высокий приоритет'],
  active: ['In Progress', 'Активная операционная работа'],
  waiting: ['Waiting', 'Нужен ответ или подтверждение'],
  pushes: ['Pushes', 'Нужно следующее касание'],
  blockers: ['Blockers', 'Нужна разблокировка'],
  review: ['Needs Review', 'Требуется разбор или очистка'],
});

const actionSuccessMessages = Object.freeze({
  moveToWork: 'Задача переведена в работу.',
  moveToPush: 'Задача переведена в пуши.',
  moveToWaiting: 'Задача переведена в ожидание ответа.',
  markDone: 'Задача отмечена готовой.',
  snoozeOneDay: 'Напоминание поставлено на завтра.',
  snoozeThreeDays: 'Напоминание поставлено через 3 дня.',
  snoozeNextWeek: 'Напоминание поставлено на следующую неделю.',
});

const taskGroupLabels = Object.freeze({
  urgent: ['Срочно', 'Нужно решить первым'],
  waiting: ['Ждут ответа', 'Ответы и подтверждения'],
  pushes: ['Пуши', 'Нужно следующее касание'],
  overdue: ['Просрочено', 'Просрочено или горит'],
  remaining: ['Остальные задачи', 'Остальная очередь'],
});

const todaySectionLabels = Object.freeze({
  documents: 'Документы',
  communication: 'Коммуникация',
  presentations: 'Презентации',
  brokers: 'Брокеры / партнёры',
  reminders: 'Напомнить',
  other: 'Остальное',
});

let activeTab = 'inbox';
let activeTaskFilter = 'all';
let taskSearchQuery = '';
let activeAuditFilter = 'all';
let manualFocusTaskIds = {};
let reportPreview = { type: '', text: '' };
let dashboardState = BAFoxClient.createLoadingState('dashboard');
let scaffoldState = BAFoxClient.createLoadingState('scaffoldInfo');
let cleanupAuditState = BAFoxClient.createLoadingState('cleanupAudit');
cleanupAuditState.status = 'idle';
let taskActionState = {};
let createTaskState = { status: 'idle', message: '' };
let editTaskState = { status: 'idle', message: '', taskId: '' };
let flashMessage = '';

function stateFromFullDashboard(fullState, route, data) {
  return {
    status: fullState.status,
    route: route,
    message: fullState.message,
    data: data || null,
    error: fullState.error,
    isMock: fullState.isMock,
  };
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatBangkokTime() {
  const formatter = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok',
  });
  elements.todayLabel.textContent = formatter.format(new Date()) + ' · Бангкок';
}

function dashboardData() {
  return dashboardState.data || {};
}

function scaffoldData() {
  return scaffoldState.data || dashboardData().scaffoldInfo || {};
}

function cleanupAuditData() {
  return cleanupAuditState.data || {};
}

function allOpenTasks() {
  const data = dashboardData();
  return data.open && Array.isArray(data.open.tasks) ? data.open.tasks : [];
}

function uniqueTasks(tasks) {
  const seen = {};
  return tasks.filter(function (task) {
    const key = task.id || [task.title, task.organization, task.deadline].map(normalizeText).join('|');
    if (seen[key]) {
      return false;
    }
    seen[key] = true;
    return true;
  });
}

function sectionTasks(section) {
  return section && Array.isArray(section.tasks) ? section.tasks : [];
}

function allLoadedTasks() {
  const data = dashboardData();
  return uniqueTasks([]
    .concat(sectionTasks(data.inbox))
    .concat(sectionTasks(data.focus))
    .concat(sectionTasks(data.today))
    .concat(sectionTasks(data.open))
    .concat(sectionTasks(data.pushes))
    .concat(sectionTasks(data.completed))
    .concat(sectionTasks(data.done))
    .concat(sectionTasks(data.recentCompleted)));
}

function todayIsoBangkok() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date()).reduce(function (acc, part) {
    acc[part.type] = part.value;
    return acc;
  }, {});
  return parts.year + '-' + parts.month + '-' + parts.day;
}

function addDaysIso(dateIso, days) {
  const date = new Date(dateIso + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function normalizeText(value) {
  return String(value == null ? '' : value).trim().toLowerCase();
}

function isoDateFromValue(value) {
  const match = String(value || '').match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : '';
}

function humanDate(value) {
  const text = String(value || '').trim();
  const isoDate = isoDateFromValue(text);
  if (!isoDate) {
    return text;
  }

  const normalizedTime = text.match(/\b\d{1,2}:\d{2}\b/);
  const formatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Asia/Bangkok',
  });
  const formattedDate = formatter.format(new Date(isoDate + 'T00:00:00Z'));
  return normalizedTime ? formattedDate + ', ' + normalizedTime[0] : formattedDate;
}

function removeIsoDateNoise(value) {
  return String(value || '').replace(/\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2})?(?:[+-]\d{2}:?\d{2}|Z)?)?/g, function (match) {
    return humanDate(match);
  });
}

function canonicalStatus(task) {
  const status = normalizeText(task.status);
  if (['выполнено', 'done', 'completed', 'complete'].some(function (signal) { return status.includes(signal); })) return 'completed';
  if (['cancelled', 'canceled', 'отмен', 'cancel'].some(function (signal) { return status.includes(signal); })) return 'cancelled';
  if (['duplicate', 'дубликат', 'дубль'].some(function (signal) { return status.includes(signal); })) return 'duplicate';
  if (['not relevant', 'irrelevant', 'неакту', 'не акту'].some(function (signal) { return status.includes(signal); })) return 'notRelevant';
  if (isBlockerTask(task)) return 'blocker';
  if (isPushTask(task)) return 'push';
  if (isWaitingTask(task)) return 'waiting';
  return 'active';
}

function isCompletedStatus(task) {
  return canonicalStatus(task) === 'completed';
}

function isNonReportableFinal(task) {
  return ['cancelled', 'duplicate', 'notRelevant'].includes(canonicalStatus(task));
}

function isFinalTask(task) {
  return ['completed', 'cancelled', 'duplicate', 'notRelevant'].includes(canonicalStatus(task)) || task.archived === true;
}

function taskControlDate(task) {
  return isoDateFromValue(task.controlDate || task.control_date || task.nextReminder || task.next_reminder || '');
}

function taskDueDate(task) {
  return isoDateFromValue(task.deadline || task.dueDate || task.due_date || '');
}

function taskReportDate(task) {
  return isoDateFromValue(task.completedAt || task.updatedAt || task.deadline || taskControlDate(task));
}

function isTodayRelevantTask(task) {
  if (isFinalTask(task)) return false;
  const today = todayIsoBangkok();
  const dueDate = taskDueDate(task);
  const controlDate = taskControlDate(task);
  return isOverdueTask(task)
    || dueDate === today
    || controlDate === today
    || dateSignalIsDue(task.nextReminder, today);
}

function dateSignalIsDue(value, today) {
  const text = normalizeText(value);
  const match = text.match(/\d{4}-\d{2}-\d{2}/);
  if (match) {
    return match[0] <= today;
  }
  return ['сегодня', 'today', 'overdue', 'просрочено'].some(function (signal) {
    return text.includes(signal);
  });
}

function dateSignalIsOverdue(value, today) {
  const text = normalizeText(value);
  const match = text.match(/\d{4}-\d{2}-\d{2}/);
  if (match) {
    return match[0] < today;
  }
  return ['overdue', 'просрочено'].some(function (signal) {
    return text.includes(signal);
  });
}

function isHighPriority(task) {
  const priority = normalizeText(task.priority);
  return ['high', 'высокий', 'высокая', 'важно'].some(function (signal) {
    return priority.includes(signal);
  });
}

function taskSearchText(task) {
  return [
    task.id,
    task.title,
    task.organization,
    task.nextAction,
    task.steps,
    task.comment,
    task.comments,
    task.source,
    task.appSource,
    task.channel,
    task.category,
    task.taskType,
    task.status,
    task.priority,
  ].map(normalizeText).join(' ');
}

function textHasAny(text, signals) {
  return signals.some(function (signal) {
    return text.includes(signal);
  });
}

function isWaitingTask(task) {
  const status = normalizeText(task.status);
  const text = taskSearchText(task);
  return ['ждём ответ', 'ждем ответ', 'ждём подтверждение', 'ждём подписание', 'wait list', 'waiting', 'ожид'].some(function (signal) {
    return status.includes(signal) || text.includes(signal);
  });
}

function isPushTask(task) {
  const status = normalizeText(task.status);
  const category = normalizeText(task.category);
  const reminderMode = normalizeText(task.reminderMode);
  return status.includes('пуш') || status.includes('push') || category.includes('push') || reminderMode.includes('push');
}

function isBlockerTask(task) {
  const status = normalizeText(task.status);
  return status.includes('блокер') || status.includes('blocked') || status.includes('blocker');
}

function isOverdueTask(task) {
  const today = todayIsoBangkok();
  const status = normalizeText(task.status);
  const dueDate = taskDueDate(task);
  const controlDate = taskControlDate(task);
  return !isFinalTask(task) && (
    status.includes('просроч') || status.includes('overdue') || (dueDate && dueDate < today) || (controlDate && controlDate < today)
  );
}

function isUrgentTask(task) {
  return !isFinalTask(task) && (isHighPriority(task) || isBlockerTask(task));
}

function isManualFocusTask(task) {
  const text = taskSearchText(task);
  return task.focus === true || manualFocusTaskIds[task.id] === true || text.includes('focus') || text.includes('фокус') || text.includes('главное');
}

function derivedTodayTasks() {
  return allOpenTasks().filter(isTodayRelevantTask).sort(compareTaskUrgency);
}

function inboxTasks() {
  const data = dashboardData();
  if (data.inbox && Array.isArray(data.inbox.tasks)) {
    return data.inbox.tasks;
  }
  return allOpenTasks().filter(function (task) {
    if (isFinalTask(task) || isTodayRelevantTask(task)) {
      return false;
    }
    const source = normalizeText([task.source, task.appSource, task.channel].join(' '));
    const category = normalizeText(task.category);
    const nextAction = normalizeText(nextActionText(task));
    return source.includes('ba fox web')
      || source.includes('telegram')
      || source.includes('chatgpt')
      || source.includes('gmail')
      || !category
      || !nextAction
      || nextAction === 'определить следующий шаг';
  }).sort(compareTaskUrgency);
}

function waitListTasks() {
  return allOpenTasks().filter(function (task) {
    return waitingStatuses.some(function (status) {
      return normalizeText(status) === normalizeText(task.status);
    });
  });
}

function focusTasks() {
  const data = dashboardData();
  if (data.focus && Array.isArray(data.focus.tasks)) {
    return data.focus.tasks.slice(0, 5);
  }
  const combined = allOpenTasks().filter(function (task) {
    return !isFinalTask(task) && (
      isManualFocusTask(task)
      || isOverdueTask(task)
      || isTodayRelevantTask(task)
      || isHighPriority(task)
      || isBlockerTask(task)
      || isPushTask(task)
    );
  });
  const seen = {};
  return combined.filter(function (task) {
    const key = task.id || task.title;
    if (seen[key]) {
      return false;
    }
    seen[key] = true;
    return !isFinalTask(task);
  }).sort(function (left, right) {
    return taskScore(right) - taskScore(left);
  }).slice(0, 5);
}

function brokerTasks() {
  return allOpenTasks().filter(function (task) {
    return taskSectionKey(task) === 'brokers';
  });
}

function reminderTasks() {
  return allOpenTasks().filter(function (task) {
    return taskSectionKey(task) === 'reminders';
  });
}

function communicationTasks() {
  return allOpenTasks().filter(function (task) {
    const text = taskSearchText(task);
    return textHasAny(text, ['communication', 'email', 'telegram', 'reply', 'message', 'follow-up', 'partner follow-up', 'письм', 'ответ', 'сообщ', 'чат', 'телеграм', 'звон']);
  });
}

function documentTasks() {
  return allOpenTasks().filter(function (task) {
    const text = taskSearchText(task);
    return textHasAny(text, ['document', 'documents', 'docs', 'kyc', 'onboarding', 'package', 'agreement', 'contract', 'документ', 'договор', 'пакет', 'онбординг']);
  });
}

function presentationTasks() {
  return allOpenTasks().filter(function (task) {
    const text = taskSearchText(task);
    return textHasAny(text, ['presentation', 'deck', 'offer', 'slides', 'sber', 'sansiri', 'tri vananda', 'grusha', 'презентац', 'дек', 'оффер', 'слайды', 'сбер']);
  });
}

function completedTasks() {
  return allLoadedTasks().filter(isFinalTask);
}

function reportableCompletedTasks() {
  return completedTasks().filter(function (task) {
    return isCompletedStatus(task) && !isNonReportableFinal(task);
  });
}

function completedThisWeekTasks() {
  const today = todayIsoBangkok();
  const weekStart = addDaysIso(today, -6);
  return reportableCompletedTasks().filter(function (task) {
    const date = taskReportDate(task);
    return date && date >= weekStart && date <= today;
  });
}

function navCountForTab(tabName) {
  if (dashboardState.status === 'loading') {
    return '...';
  }
  const counts = {
    inbox: inboxTasks().length,
    focus: focusTasks().length,
    today: derivedTodayTasks().length,
    documents: documentTasks().length,
    communication: communicationTasks().length,
    presentations: presentationTasks().length,
    brokers: brokerTasks().length,
    waiting: waitListTasks().length,
    all: allOpenTasks().length,
    completed: completedTasks().length,
    calendar: allLoadedTasks().length,
    reports: completedThisWeekTasks().length,
    system: '',
  };
  return counts[tabName];
}

function taskSectionKey(task) {
  const text = taskSearchText(task);
  if (textHasAny(text, ['document', 'documents', 'docs', 'kyc', 'onboarding', 'package', 'agreement', 'contract', 'документ', 'договор', 'пакет', 'онбординг'])) {
    return 'documents';
  }
  if (textHasAny(text, ['presentation', 'deck', 'offer', 'slides', 'sber', 'sansiri', 'tri vananda', 'grusha', 'презентац', 'дек', 'оффер', 'слайды', 'сбер'])) {
    return 'presentations';
  }
  if (textHasAny(text, ['broker', 'agent', 'partner', 'брокер', 'партнёр', 'партнер', 'агент'])) {
    return 'brokers';
  }
  if (isPushTask(task) || task.nextReminder || textHasAny(text, ['reminder', 'напомнить', 'контроль', 'follow-up'])) {
    return 'reminders';
  }
  if (textHasAny(text, ['communication', 'email', 'telegram', 'reply', 'message', 'follow-up', 'письм', 'ответ', 'сообщ', 'чат', 'телеграм', 'звон'])) {
    return 'communication';
  }
  return 'other';
}

function taskScore(task) {
  let score = 0;
  const status = normalizeText(task.status);
  if (isManualFocusTask(task)) score += 8;
  if (isOverdueTask(task)) score += 7;
  if (isTodayRelevantTask(task)) score += 6;
  if (isHighPriority(task)) score += 5;
  if (status === 'блокер' || isBlockerTask(task)) score += 5;
  if (status === 'пуш' || isPushTask(task)) score += 4;
  if (status.includes('ждём') || status.includes('wait')) score += 3;
  if (taskDueDate(task) === todayIsoBangkok()) score += 4;
  if (taskControlDate(task) === todayIsoBangkok()) score += 4;
  return score;
}

function taskRowsForBaseTab(tabName) {
  const data = dashboardData();
  const collection = {
    today: data.today,
    open: data.open,
    pushes: data.pushes,
  }[tabName];
  return collection && Array.isArray(collection.tasks) ? collection.tasks : [];
}

function taskRowsForTab() {
  if (activeTab === 'inbox') {
    return inboxTasks();
  }
  if (activeTab === 'focus') {
    return focusTasks();
  }
  if (activeTab === 'today') {
    return derivedTodayTasks();
  }
  if (activeTab === 'waiting') {
    return waitListTasks();
  }
  if (activeTab === 'communication') {
    return communicationTasks();
  }
  if (activeTab === 'documents') {
    return documentTasks();
  }
  if (activeTab === 'presentations') {
    return presentationTasks();
  }
  if (activeTab === 'brokers') {
    return brokerTasks();
  }
  if (activeTab === 'all') {
    return allOpenTasks();
  }
  if (activeTab === 'completed') {
    return completedTasks();
  }
  if (activeTab === 'calendar') {
    return allLoadedTasks();
  }
  if (activeTab === 'reports') {
    return allLoadedTasks();
  }
  return allOpenTasks();
}

function taskUrgencyBucket(task) {
  const today = todayIsoBangkok();
  const tomorrow = addDaysIso(today, 1);
  const relevantDate = taskDueDate(task) || taskControlDate(task);
  const text = normalizeText([task.deadline, task.nextReminder, task.status].join(' '));
  if (isOverdueTask(task) || (relevantDate && relevantDate < today)) {
    return 0;
  }
  if (relevantDate === today || text.includes('сегодня') || text.includes('today')) {
    return 1;
  }
  if (relevantDate === tomorrow || text.includes('завтра') || text.includes('tomorrow')) {
    return 2;
  }
  return 3;
}

function compareTaskUrgency(left, right) {
  const bucketDiff = taskUrgencyBucket(left) - taskUrgencyBucket(right);
  if (bucketDiff !== 0) {
    return bucketDiff;
  }
  const scoreDiff = taskScore(right) - taskScore(left);
  if (scoreDiff !== 0) {
    return scoreDiff;
  }
  return String(left.title || '').localeCompare(String(right.title || ''), 'ru');
}

function groupedTasks(tasks) {
  const groups = {
    urgent: [],
    waiting: [],
    pushes: [],
    overdue: [],
    remaining: [],
  };

  tasks.forEach(function (task) {
    if (isUrgentTask(task)) {
      groups.urgent.push(task);
    } else if (isWaitingTask(task)) {
      groups.waiting.push(task);
    } else if (isPushTask(task)) {
      groups.pushes.push(task);
    } else if (isOverdueTask(task)) {
      groups.overdue.push(task);
    } else {
      groups.remaining.push(task);
    }
  });

  Object.keys(groups).forEach(function (key) {
    groups[key].sort(compareTaskUrgency);
  });

  return groups;
}

function workflowGroupedTasks(tasks) {
  const groups = {
    urgent: [],
    active: [],
    waiting: [],
    pushes: [],
    blockers: [],
    review: [],
  };

  tasks.forEach(function (task) {
    if (isNonReportableFinal(task) || !task.id || !nextActionText(task)) {
      groups.review.push(task);
    } else if (isBlockerTask(task)) {
      groups.blockers.push(task);
    } else if (isOverdueTask(task) || isTodayRelevantTask(task) || isHighPriority(task)) {
      groups.urgent.push(task);
    } else if (isWaitingTask(task)) {
      groups.waiting.push(task);
    } else if (isPushTask(task)) {
      groups.pushes.push(task);
    } else {
      groups.active.push(task);
    }
  });

  Object.keys(groups).forEach(function (key) {
    groups[key].sort(compareTaskUrgency);
  });

  return groups;
}

function summaryCount(sectionName) {
  if (sectionName === 'waiting') {
    return waitListTasks().length;
  }
  if (sectionName === 'focus') {
    return focusTasks().slice(0, 5).length;
  }
  const section = dashboardData()[sectionName];
  return section && Array.isArray(section.tasks) ? section.tasks.length : '-';
}

function safeWritesEnabled() {
  const info = scaffoldData();
  return info.safeWritesEnabled === true && !dashboardState.isMock;
}

function writeModeLabel() {
  return safeWritesEnabled() ? 'БЕЗОПАСНАЯ ЗАПИСЬ ВКЛЮЧЕНА' : 'ТОЛЬКО ЧТЕНИЕ';
}

function renderModeBanner() {
  const loading = dashboardState.status === 'loading' || scaffoldState.status === 'loading';
  const isMock = dashboardState.isMock || scaffoldState.isMock || cleanupAuditState.isMock;
  const failed = dashboardState.status === 'error' || scaffoldState.status === 'error' || cleanupAuditState.status === 'error';
  if (loading) {
    elements.modeBanner.className = 'mode-banner';
    elements.modeBanner.innerHTML = '<strong>Проверка режима</strong><span>Проверяю безопасную конфигурацию источника данных...</span>';
    return;
  }
  elements.modeBanner.className = 'mode-banner ' + (failed ? 'warning' : isMock ? 'mock' : 'live');
  elements.modeBanner.innerHTML = failed
    ? '<strong>Демо-режим</strong><span>' + escapeHtml(dashboardState.message || cleanupAuditState.message || 'Источник недоступен. Показаны безопасные демо-данные.') + '</span>'
    : isMock
      ? '<strong>Демо-режим</strong><span>Без подключения к рабочей таблице и без изменений задач.</span>'
      : safeWritesEnabled()
        ? '<strong>БЕЗОПАСНАЯ ЗАПИСЬ ВКЛЮЧЕНА</strong><span>Доступны только безопасное создание, статус, напоминание и обновление этапа.</span>'
        : '<strong>ТОЛЬКО ЧТЕНИЕ</strong><span>Данные загружены только для просмотра. Безопасные действия отключены.</span>';
}

function renderCreateTaskButton() {
  const loading = dashboardState.status === 'loading' || scaffoldState.status === 'loading';
  elements.createTaskButton.disabled = loading || !safeWritesEnabled();
  elements.writeModePill.textContent = safeWritesEnabled() ? 'Безопасная запись' : 'Только просмотр';
  elements.createTaskButton.title = safeWritesEnabled()
    ? 'Создать новую задачу'
    : 'Создание доступно только при SAFE WRITE ENABLED и настроенном action token.';
}

function renderSummary() {
  if (dashboardState.status === 'loading') {
    elements.summaryCards.innerHTML = ['Total', 'Today', 'Focus', 'Overdue'].map(function (label) {
      return '<article class="summary-card loading"><strong>...</strong><span>' + label + '</span></article>';
    }).join('');
    return;
  }

  const openTasks = allOpenTasks();
  const cards = [
    { value: openTasks.length, label: 'Total tasks', tone: 'total' },
    { value: derivedTodayTasks().length, label: 'Today', tone: 'today' },
    { value: focusTasks().length, label: 'Focus', tone: 'focus' },
    { value: openTasks.filter(isWaitingTask).length, label: 'Waiting', tone: 'waiting' },
    { value: openTasks.filter(isPushTask).length, label: 'Pushes', tone: 'push' },
    { value: openTasks.filter(isBlockerTask).length, label: 'Blockers', tone: 'blocker' },
    { value: completedThisWeekTasks().length, label: 'Completed this week', tone: 'completed' },
    { value: openTasks.filter(isOverdueTask).length, label: 'Просрочено', tone: 'overdue' },
  ];

  elements.summaryCards.innerHTML = cards.map(function (card) {
    return '<article class="summary-card ' + escapeHtml(card.tone) + '"><strong>' + escapeHtml(card.value) + '</strong><span>' + card.label + '</span></article>';
  }).join('');
}

function statusText() {
  if (flashMessage) {
    return flashMessage;
  }
  if (dashboardState.status === 'loading') {
    return 'Загружаю безопасный обзор...';
  }
  if (dashboardState.status === 'error' || scaffoldState.status === 'error') {
    return dashboardState.message || 'Ошибка чтения: рабочие данные не открыты, ниже показан demo-набор.';
  }
  if (activeTab === 'system') {
    return 'Этот экран показывает состояние live read, safe writes и отключенной автоматизации.';
  }
  if (activeTab === 'inbox') {
    return 'Inbox собирает новые и неразобранные задачи. Они не попадают в Today, пока не появится срок или контрольная дата.';
  }
  if (activeTab === 'focus') {
    return 'Focus показывает максимум 5 задач: просрочено, сегодня, высокий приоритет, blocker/push или ручная отметка.';
  }
  if (activeTab === 'today') {
    return 'Today показывает только просроченные, due today, control date today и reminder today задачи.';
  }
  if (activeTab === 'all') {
    return 'All Tasks — место для поиска, фильтров, статус-ревью и будущей очистки дублей.';
  }
  if (activeTab === 'reports') {
    return 'Reports генерирует структурированный текст из активных и выполненных задач. PDF и запись в Sheets не выполняются.';
  }
  if (activeTab === 'audit') {
    if (cleanupAuditState.status === 'error') {
      return cleanupAuditState.message || 'Ошибка чтения audit-only отчета: показан безопасный demo-набор.';
    }
    return 'Аудит только показывает предложения. Кнопок очистки, архивации и нормализации здесь нет.';
  }
  return dashboardState.isMock
    ? 'Это демонстрационные задачи. Изменение статуса и отправка данных отключены.'
    : safeWritesEnabled()
      ? 'Безопасные действия создают задачу, меняют статус/напоминание и обновляют этап.'
      : 'Данные доступны только для чтения. Безопасные действия отключены.';
}

function renderEmpty() {
  elements.taskList.innerHTML = [
    '<article class="empty-state">',
    '<strong>Очередь пуста</strong>',
    '<span>В этом разделе нет задач для действия.</span>',
    '</article>',
  ].join('');
}

function taskMeta(task) {
  return [
    task.organization || 'Без компании',
    taskDueDate(task) ? 'Срок: ' + humanDate(taskDueDate(task)) : 'Без срока',
    taskControlDate(task) ? 'Контроль: ' + humanDate(taskControlDate(task)) : '',
  ].filter(Boolean);
}

function taskMatchesFilter(task, filterId) {
  const text = taskSearchText(task);
  const today = todayIsoBangkok();
  if (filterId === 'all') return true;
  if (filterId === 'inbox') return inboxTasks().some(function (inboxTask) { return inboxTask.id === task.id; });
  if (filterId === 'focus') return focusTasks().some(function (focusTask) { return focusTask.id === task.id; });
  if (filterId === 'urgent') return isUrgentTask(task) || dateSignalIsDue(task.deadline, today);
  if (filterId === 'high') return isHighPriority(task);
  if (filterId === 'active') return canonicalStatus(task) === 'active';
  if (filterId === 'waiting') return isWaitingTask(task);
  if (filterId === 'push') return isPushTask(task);
  if (filterId === 'blockers') return isBlockerTask(task);
  if (filterId === 'today') return isTodayRelevantTask(task);
  if (filterId === 'overdue') return isOverdueTask(task);
  if (filterId === 'cleanup') return isNonReportableFinal(task) || !task.category || !task.id || nextActionText(task) === 'Определить следующий шаг';
  return true;
}

function taskMatchesSearch(task) {
  const query = normalizeText(taskSearchQuery);
  if (!query) {
    return true;
  }
  return taskSearchText(task).includes(query);
}

function shouldShowWorkspaceControls() {
  return !['system', 'audit', 'reports'].includes(activeTab);
}

function taskFilterHtml(tasks) {
  if (!shouldShowWorkspaceControls() || activeTab === 'calendar') {
    return '';
  }
  return '<div class="task-filters" aria-label="Фильтры задач">' + taskFilters.map(function (filter) {
    const count = tasks.filter(function (task) { return taskMatchesFilter(task, filter.id); }).length;
    const activeClass = filter.id === activeTaskFilter ? ' active' : '';
    return '<button class="task-filter' + activeClass + '" type="button" data-task-filter="' + escapeHtml(filter.id) + '">' + escapeHtml(filter.label) + ' <span>' + count + '</span></button>';
  }).join('') + '</div>';
}

function renderWorkspaceControls(tasks) {
  if (!shouldShowWorkspaceControls()) {
    elements.workspaceControls.innerHTML = '';
    return;
  }
  elements.workspaceControls.innerHTML = [
    '<label class="task-search">',
    '<span>Поиск задач</span>',
    '<input type="search" id="taskSearchInput" placeholder="Поиск задач..." value="' + escapeHtml(taskSearchQuery) + '" autocomplete="off" />',
    '</label>',
    taskFilterHtml(tasks),
  ].join('');
}

function taskDetailHtml(label, value) {
  if (!value) {
    return '';
  }
  return '<span><strong>' + escapeHtml(label) + ':</strong> ' + escapeHtml(value) + '</span>';
}

function firstUsefulLine(value) {
  return String(value || '')
    .split(/\n+/)
    .map(function (line) {
      return line.replace(/^\s*\d+[\).\s-]*/, '').trim();
    })
    .find(function (line) {
      return line.length > 0;
    }) || '';
}

function nextActionText(task) {
  return removeIsoDateNoise(firstUsefulLine(task.nextAction) || firstUsefulLine(task.steps) || firstUsefulLine(task.comment) || humanDate(task.nextReminder) || 'Определить следующий шаг');
}

function taskTone(task) {
  if (isOverdueTask(task)) return 'overdue';
  if (isBlockerTask(task)) return 'blocker';
  if (isPushTask(task)) return 'push';
  if (isWaitingTask(task)) return 'waiting';
  return 'work';
}

function actionButtonsHtml(task) {
  const disabled = !safeWritesEnabled();
  const state = taskActionState[task.id] || {};
  const busy = state.status === 'loading';
  const moveOptions = [
    ['moveToWork', 'В работе', 'status-chip', false],
    ['moveToWaiting', 'Ждёт ответа', 'status-chip', false],
    ['moveToPush', 'Пуш', 'status-chip', false],
    ['moveToBlocker', 'Блокер', 'status-chip muted', true],
  ];
  const reminderOptions = [
    ['snoozeOneDay', 'Tomorrow'],
    ['snoozeThreeDays', '+3 days'],
    ['snoozeNextWeek', '+7 days'],
  ];
  const completeLabel = busy && state.action === 'markDone' ? '...' : '✓ Выполнено';
  const moveButtons = moveOptions.map(function (option) {
    const action = option[0];
    const label = busy && state.action === action ? '...' : option[1];
    return '<button class="task-action chip ' + escapeHtml(option[2]) + '" type="button" data-task-id="' + escapeHtml(task.id) + '" data-task-action="' + escapeHtml(action) + '"' + (disabled || busy || option[3] ? ' disabled' : '') + '>' + escapeHtml(label) + '</button>';
  }).join('');
  const reminderButtons = reminderOptions.map(function (option) {
    const action = option[0];
    const label = busy && state.action === action ? '...' : option[1];
    return '<button class="task-action chip reminder-chip" type="button" data-task-id="' + escapeHtml(task.id) + '" data-task-action="' + escapeHtml(action) + '"' + (disabled || busy ? ' disabled' : '') + '>' + escapeHtml(label) + '</button>';
  }).join('');
  const message = state.status === 'error'
    ? '<div class="task-error">' + escapeHtml(state.message || 'Действие не выполнено') + '</div>'
    : state.status === 'success'
      ? '<div class="task-success">' + escapeHtml(state.message || 'Готово. Данные обновлены.') + '</div>'
      : disabled
        ? '<div class="task-notice">Безопасные действия отключены.</div>'
        : '';
  return [
    '<div class="task-actions" aria-label="Действия задачи">',
    '<div class="task-chip-row" aria-label="Статус">' + moveButtons + '</div>',
    '<div class="task-chip-row reminder-row" aria-label="Контрольная дата"><span class="chip-row-label">Control date</span>' + reminderButtons + '<span class="chip-row-label muted">Pick date через обновление этапа</span></div>',
    '<button class="task-action chip focus-chip" type="button" data-task-focus="' + escapeHtml(task.id) + '">' + (isManualFocusTask(task) ? '✓ В фокусе' : 'Mark as Focus') + '</button>',
    '<button class="task-action chip edit-chip" type="button" data-task-id="' + escapeHtml(task.id) + '" data-task-edit="' + escapeHtml(task.id) + '">Обновить этап</button>',
    '</div>',
    message,
  ].join('');
}

function taskCardHtml(task) {
  const meta = taskMeta(task);
  return [
    '<article class="task-card" data-tone="' + escapeHtml(taskTone(task)) + '">',
    '<div class="task-main">',
    '<div class="task-topline">',
    '<span class="task-chip">' + escapeHtml(task.status || 'Без статуса') + '</span>',
    task.priority ? '<span class="priority-label">' + escapeHtml(task.priority) + '</span>' : '',
    '</div>',
    '<div class="task-title">' + escapeHtml(removeIsoDateNoise(task.title)) + '</div>',
    '<div class="task-meta">' + meta.map(function (item) { return '<span>' + escapeHtml(item) + '</span>'; }).join('') + '</div>',
    '<div class="next-action"><strong>Следующее действие</strong><span>' + escapeHtml(nextActionText(task)) + '</span></div>',
    '<div class="task-details">',
    taskDetailHtml('Источник', task.source || task.appSource || task.channel),
    taskDetailHtml('ID задачи', task.id),
    '</div>',
    actionButtonsHtml(task),
    '</div>',
    '<aside class="task-primary">',
    '<button class="complete-task-button" type="button" data-task-id="' + escapeHtml(task.id) + '" data-task-action="markDone"' + (!safeWritesEnabled() || (taskActionState[task.id] || {}).status === 'loading' ? ' disabled' : '') + '>' + escapeHtml(((taskActionState[task.id] || {}).status === 'loading' && (taskActionState[task.id] || {}).action === 'markDone') ? '...' : '✓ Выполнено') + '</button>',
    '</aside>',
    '</div>',
    '</article>',
  ].join('');
}

function completedTaskCardHtml(task) {
  return [
    '<article class="task-card completed-card" data-tone="' + escapeHtml(taskTone(task)) + '">',
    '<div class="task-main">',
    '<div class="task-topline">',
    '<span class="task-chip">' + escapeHtml(task.status || 'Выполнено') + '</span>',
    isNonReportableFinal(task) ? '<span class="priority-label">Не для отчётов</span>' : '<span class="priority-label">Для отчётов</span>',
    task.completedAt ? '<span class="priority-label">Закрыта: ' + escapeHtml(humanDate(task.completedAt)) + '</span>' : '',
    '</div>',
    '<div class="task-title">' + escapeHtml(removeIsoDateNoise(task.title)) + '</div>',
    '<div class="task-meta">' + [
      task.organization || 'Без компании',
      task.source || task.appSource || task.channel || '',
      task.id ? 'ID: ' + task.id : '',
    ].filter(Boolean).map(function (item) { return '<span>' + escapeHtml(item) + '</span>'; }).join('') + '</div>',
    '<div class="next-action completed-summary"><strong>История / следующий след</strong><span>' + escapeHtml(nextActionText(task)) + '</span></div>',
    '</div>',
    '</article>',
  ].join('');
}

function taskGroupsHtml(tasks) {
  const groups = workflowGroupedTasks(tasks);
  return Object.keys(workflowGroupLabels).map(function (groupId) {
    const groupTasks = groups[groupId];
    if (!groupTasks.length) {
      return '';
    }
    const label = workflowGroupLabels[groupId];
    return [
      '<section class="task-group" data-group="' + escapeHtml(groupId) + '">',
      '<div class="task-group-header"><div><h3>' + escapeHtml(label[0]) + '</h3><span>' + escapeHtml(label[1]) + '</span></div><strong>' + groupTasks.length + '</strong></div>',
      '<div class="task-group-list">',
      groupTasks.map(taskCardHtml).join(''),
      '</div>',
      '</section>',
    ].join('');
  }).join('');
}

function todaySectionGroups(tasks) {
  return tasks.reduce(function (groups, task) {
    const key = taskSectionKey(task);
    groups[key] = groups[key] || [];
    groups[key].push(task);
    return groups;
  }, {
    documents: [],
    communication: [],
    presentations: [],
    brokers: [],
    reminders: [],
    other: [],
  });
}

function renderTodayWorkMode(tasks) {
  const visibleTasks = tasks.filter(function (task) {
    return taskMatchesFilter(task, activeTaskFilter) && taskMatchesSearch(task);
  });
  if (!visibleTasks.length) {
    elements.taskList.innerHTML = [
      '<article class="empty-state">',
      '<strong>Ничего не найдено</strong>',
      '<span>Измените поиск или выберите другой фильтр.</span>',
      '</article>',
    ].join('');
    return;
  }

  const groups = todaySectionGroups(visibleTasks);
  const sectionsHtml = Object.keys(todaySectionLabels).map(function (key) {
    const sectionTasks = groups[key].sort(compareTaskUrgency);
    if (!sectionTasks.length) {
      return '';
    }
    return [
      '<section class="task-group today-section" data-section="' + escapeHtml(key) + '">',
      '<div class="task-group-header"><div><h3>' + escapeHtml(todaySectionLabels[key]) + '</h3></div><strong>' + sectionTasks.length + '</strong></div>',
      '<div class="task-group-list">' + sectionTasks.map(taskCardHtml).join('') + '</div>',
      '</section>',
    ].join('');
  }).join('');

  elements.taskList.innerHTML = [
    '<section class="task-group today-section today-rule-note"><div class="task-group-header"><div><h3>Today queue</h3><span>Только overdue, due today, control date today и reminder today. Не вся активная очередь.</span></div><strong>' + visibleTasks.length + '</strong></div></section>',
    sectionsHtml || '<article class="empty-state"><strong>Рабочие секции пусты</strong><span>Сегодня нет задач по выбранным фильтрам.</span></article>',
  ].join('');
}

function renderInbox(tasks) {
  const visibleTasks = tasks.filter(function (task) {
    return taskMatchesFilter(task, activeTaskFilter) && taskMatchesSearch(task);
  });
  const intro = [
    '<section class="inbox-guide">',
    '<article><strong>1. Разобрать</strong><span>Проверить источник, компанию и смысл задачи.</span></article>',
    '<article><strong>2. Назначить</strong><span>Категория, следующий шаг, контрольная дата.</span></article>',
    '<article><strong>3. В работу</strong><span>После triage задача уходит в профильный раздел.</span></article>',
    '</section>',
  ].join('');
  elements.taskList.innerHTML = intro + (visibleTasks.length
    ? '<div class="task-group-list">' + visibleTasks.map(taskCardHtml).join('') + '</div>'
    : '<article class="empty-state"><strong>Inbox пуст</strong><span>Новые задачи из BA Fox, Telegram, ChatGPT и Gmail будут появляться здесь для triage.</span></article>');
}

function renderFocus(tasks) {
  const visibleTasks = tasks.filter(taskMatchesSearch).slice(0, 5);
  const focusHtml = visibleTasks.length
    ? visibleTasks.map(taskCardHtml).join('')
    : '<article class="empty-state"><strong>Фокус пока пуст</strong><span>Отметьте задачу как Focus или дождитесь срочных сигналов.</span></article>';
  elements.taskList.innerHTML = [
    '<section class="focus-day">',
    '<div class="task-group-header"><div><h3>🎯 Фокус</h3><span>Максимум 5 задач: overdue, today, high priority, blocker/push или ручная отметка.</span></div><strong>' + visibleTasks.length + '/5</strong></div>',
    '<div class="task-group-list focus-list">' + focusHtml + '</div>',
    '</section>',
  ].join('');
}

function calendarBucket(task) {
  const today = todayIsoBangkok();
  const tomorrow = addDaysIso(today, 1);
  const weekEnd = addDaysIso(today, 7);
  const date = taskDueDate(task) || taskControlDate(task);
  if (!date) {
    return 'none';
  }
  if (date <= today) {
    return 'today';
  }
  if (date === tomorrow) {
    return 'tomorrow';
  }
  if (date <= weekEnd) {
    return 'week';
  }
  return 'later';
}

function calendarDateLabel(task) {
  const dueDate = taskDueDate(task);
  const controlDate = taskControlDate(task);
  if (dueDate && controlDate && dueDate !== controlDate) {
    return 'Срок: ' + humanDate(dueDate) + ' · Контроль: ' + humanDate(controlDate);
  }
  return dueDate ? 'Срок: ' + humanDate(dueDate) : controlDate ? 'Контроль: ' + humanDate(controlDate) : 'Без даты';
}

function calendarTaskHtml(task) {
  return [
    '<article class="calendar-task" data-tone="' + escapeHtml(taskTone(task)) + '">',
    '<div>',
    '<strong>' + escapeHtml(removeIsoDateNoise(task.title)) + '</strong>',
    '<span>' + escapeHtml(task.status || 'Без статуса') + ' · ' + escapeHtml(calendarDateLabel(task)) + '</span>',
    '</div>',
    '<p>' + escapeHtml(nextActionText(task)) + '</p>',
    '</article>',
  ].join('');
}

function renderCalendar(tasks) {
  const searchedTasks = tasks.filter(taskMatchesSearch);
  const groups = {
    today: [],
    tomorrow: [],
    week: [],
    later: [],
    none: [],
  };
  searchedTasks.forEach(function (task) {
    groups[calendarBucket(task)].push(task);
  });
  const labels = {
    today: 'Сегодня',
    tomorrow: 'Завтра',
    week: 'Эта неделя',
    later: 'Позже',
    none: 'Без даты',
  };
  const html = Object.keys(labels).map(function (bucket) {
    const groupTasks = groups[bucket].sort(compareTaskUrgency);
    return [
      '<section class="calendar-section">',
      '<div class="calendar-section-header"><h3>' + escapeHtml(labels[bucket]) + '</h3><strong>' + groupTasks.length + '</strong></div>',
      groupTasks.length
        ? '<div class="calendar-task-list">' + groupTasks.map(calendarTaskHtml).join('') + '</div>'
        : '<div class="calendar-empty">Нет задач</div>',
      '</section>',
    ].join('');
  }).join('');
  elements.taskList.innerHTML = [
    '<div class="calendar-note">Календарь использует deadline и controlDate/nextReminder из Google Sheets. Интеграцию с Google Calendar добавим отдельно.</div>',
    '<div class="calendar-grid">' + html + '</div>',
  ].join('');
}

function reportSection(title, tasks, mapper) {
  const rows = tasks.slice(0, 12).map(mapper || function (task) {
    return '- ' + removeIsoDateNoise(task.title) + (task.organization ? ' / ' + task.organization : '');
  });
  return title + '\n' + (rows.length ? rows.join('\n') : '- Нет задач');
}

function buildReport(type) {
  const active = allOpenTasks().filter(function (task) { return !isFinalTask(task); });
  const done = reportableCompletedTasks();
  const today = derivedTodayTasks();
  const waiting = active.filter(isWaitingTask);
  const blockers = active.filter(isBlockerTask);
  const tomorrowFocus = focusTasks().slice(0, 5);
  const title = type === 'weekly' ? 'Weekly Report' : 'Daily Report';
  return [
    title + ' · ' + todayIsoBangkok(),
    '',
    reportSection('✅ Done', done, function (task) {
      return '- ' + removeIsoDateNoise(task.title) + (task.organization ? ' / ' + task.organization : '');
    }),
    '',
    reportSection('🔄 In Progress', active.filter(function (task) { return canonicalStatus(task) === 'active'; })),
    '',
    reportSection('⏳ Waiting', waiting),
    '',
    reportSection('⚠️ Blockers', blockers),
    '',
    reportSection('🎯 Tomorrow Focus', tomorrowFocus),
  ].join('\n');
}

function renderReports() {
  const preview = reportPreview.text || buildReport('daily');
  elements.taskList.innerHTML = [
    '<section class="reports-panel">',
    '<div class="report-actions">',
    '<button class="primary-button" type="button" data-report-action="daily">Generate Daily Report</button>',
    '<button class="secondary-button" type="button" data-report-action="weekly">Generate Weekly Report</button>',
    '</div>',
    '<div class="report-summary-grid">',
    '<article><strong>' + escapeHtml(reportableCompletedTasks().length) + '</strong><span>Done source</span></article>',
    '<article><strong>' + escapeHtml(allOpenTasks().length) + '</strong><span>Active source</span></article>',
    '<article><strong>' + escapeHtml(focusTasks().length) + '</strong><span>Tomorrow focus</span></article>',
    '</div>',
    '<pre class="report-preview">' + escapeHtml(preview) + '</pre>',
    '</section>',
  ].join('');
}

function renderTasks(options) {
  const skipControls = options && options.skipControls;
  const tasks = taskRowsForTab();
  if (!skipControls) {
    renderWorkspaceControls(tasks);
  }
  if (activeTab === 'calendar') {
    renderCalendar(tasks);
    return;
  }
  if (activeTab === 'reports') {
    renderReports();
    return;
  }
  if (activeTab === 'inbox') {
    renderInbox(tasks);
    return;
  }
  if (activeTab === 'focus') {
    renderFocus(tasks);
    return;
  }
  if (activeTab === 'today') {
    renderTodayWorkMode(tasks);
    return;
  }
  const visibleTasks = tasks.filter(function (task) {
    return taskMatchesFilter(task, activeTaskFilter) && taskMatchesSearch(task);
  });
  if (!tasks.length) {
    if (activeTab === 'completed') {
      elements.taskList.innerHTML = [
        '<article class="empty-state">',
        '<strong>Выполненные задачи пока не загружаются из источника.</strong>',
        '<span>Этот раздел будет памятью для дневных и недельных отчётов. BA Fox загружает архив отдельно от рабочей панели.</span>',
        '</article>',
      ].join('');
      return;
    }
    renderEmpty();
    return;
  }

  if (!visibleTasks.length) {
    elements.taskList.innerHTML = [
      '<article class="empty-state">',
      '<strong>Ничего не найдено</strong>',
      '<span>Измените поиск или выберите другой фильтр.</span>',
      '</article>',
    ].join('');
    return;
  }

  elements.taskList.innerHTML = activeTab === 'completed'
    ? '<div class="task-group-list">' + visibleTasks.map(completedTaskCardHtml).join('') + '</div>'
    : taskGroupsHtml(visibleTasks);
}

function renderSystem() {
  const info = scaffoldData();
  const rows = [
    ['Источник', dashboardState.isMock ? 'Демо-данные' : 'API только для чтения'],
    ['Безопасная запись', info.safeWritesEnabled === true ? 'Включена' : 'Отключена'],
    ['Обновление этапа', info.safeWritesEnabled === true ? 'editTask включён' : 'Отключено'],
    ['Живые данные Sheets', info.readLiveSheets === true ? 'Включены' : 'Отключены'],
    ['Автоматизация', info.liveAutomationEnabled === false ? 'Отключена' : 'Не подтверждено'],
    ['Триггеры', info.triggersEnabled === false ? 'Отключены' : 'Не подтверждено'],
    ['Версия', info.version || '-'],
  ];
  elements.taskList.innerHTML = '<div class="system-grid">' + rows.map(function (row) {
    return '<div class="system-row"><span>' + escapeHtml(row[0]) + '</span><strong>' + escapeHtml(row[1]) + '</strong></div>';
  }).join('') + '</div>';
}

function auditSummaryRows(summary) {
  return [
    ['Проверено строк', summary.rowsChecked],
    ['Дубликаты ID', summary.duplicateGroups],
    ['Похожие дубликаты', summary.nearDuplicateGroups],
    ['Статусы', summary.nonCanonicalStatuses],
    ['Приоритеты', summary.nonCanonicalPriorities],
    ['V2 поля', summary.missingV2Fields],
    ['Даты', summary.vagueDates],
    ['Legacy активные', summary.activeLegacyRows],
    ['Архив-кандидаты', summary.archiveCandidates],
  ];
}

function auditSeverity(item) {
  const issueType = item.issueType || '';
  const confidence = Number(item.confidence || 0);
  if (['DUPLICATE_ID', 'NEAR_DUPLICATE', 'CORRUPTED_FIELD'].includes(issueType)) {
    return 'high';
  }
  if (item.needsLisaApproval || ['STATUS_NORMALIZATION', 'PRIORITY_NORMALIZATION', 'ARCHIVE_CANDIDATE'].includes(issueType)) {
    return 'medium';
  }
  if (confidence < 0.6 || ['TASK_TYPE_MISSING', 'OWNER_MISSING', 'ACTIVE_LEGACY_ROW'].includes(issueType)) {
    return 'medium';
  }
  return 'low';
}

function auditItemWithSeverity(item) {
  return Object.assign({}, item, {
    severity: auditSeverity(item),
  });
}

function sortedAuditItems(items) {
  return items.map(auditItemWithSeverity).sort(function (left, right) {
    var severityDiff = severityRank[left.severity] - severityRank[right.severity];
    if (severityDiff !== 0) {
      return severityDiff;
    }
    var typeDiff = String(left.issueType || '').localeCompare(String(right.issueType || ''));
    if (typeDiff !== 0) {
      return typeDiff;
    }
    return Number(left.rowNumber || 0) - Number(right.rowNumber || 0);
  });
}

function auditFilterConfig(filterId) {
  return auditFilters.find(function (filter) {
    return filter.id === filterId;
  }) || auditFilters[0];
}

function filteredAuditItems(items) {
  const filter = auditFilterConfig(activeAuditFilter);
  if (!filter.issueTypes.length) {
    return items;
  }
  return items.filter(function (item) {
    return filter.issueTypes.includes(item.issueType);
  });
}

function groupAuditItems(items) {
  return items.reduce(function (groups, item) {
    const key = item.issueType || 'UNKNOWN';
    groups[key] = groups[key] || [];
    groups[key].push(item);
    return groups;
  }, {});
}

function severityCounts(items) {
  return items.reduce(function (counts, item) {
    counts[item.severity] = (counts[item.severity] || 0) + 1;
    return counts;
  }, { high: 0, medium: 0, low: 0 });
}

function auditFilterHtml(items) {
  return auditFilters.map(function (filter) {
    const count = filter.issueTypes.length
      ? items.filter(function (item) { return filter.issueTypes.includes(item.issueType); }).length
      : items.length;
    const activeClass = filter.id === activeAuditFilter ? ' active' : '';
    return '<button class="audit-filter' + activeClass + '" type="button" data-audit-filter="' + escapeHtml(filter.id) + '">' + escapeHtml(filter.label) + ' <span>' + count + '</span></button>';
  }).join('');
}

function reviewPreviewRows(items) {
  return items.slice(0, 5).map(function (item) {
    return [
      'row ' + (item.rowNumber || '-'),
      item.taskId || '-',
      item.issueType || '-',
      item.severity,
      item.suggestedAction || 'REVIEW_REQUIRED',
      item.needsLisaApproval ? 'нужно согласование Lisa' : 'без согласования',
    ].join(' | ');
  });
}

function renderReviewPreview(items) {
  const rows = reviewPreviewRows(items);
  if (!rows.length) {
    return '';
  }
  return [
    '<aside class="review-preview" aria-label="Предпросмотр формата проверки">',
    '<div>',
    '<strong>Предпросмотр формата проверки</strong>',
      '<span>Только предварительный вид. Экспорта и записи нет.</span>',
    '</div>',
    '<pre>' + escapeHtml(rows.join('\n')) + '</pre>',
    '</aside>',
  ].join('');
}

function renderAudit() {
  if (cleanupAuditState.status === 'loading') {
    elements.taskList.innerHTML = [
      '<section class="audit-section">',
      '<article class="loading-state">',
      '<strong>Загружаю audit-only отчет...</strong>',
      '<span>Это только чтение. BA Fox ничего не меняет в таблице.</span>',
      '</article>',
      '</section>',
    ].join('');
    return;
  }
  if (cleanupAuditState.status === 'error') {
    elements.taskList.innerHTML = [
      '<section class="audit-section">',
      '<article class="empty-state error-state">',
      '<strong>Не удалось загрузить audit-only отчет</strong>',
      '<span>Показывать или применять cleanup-действия нельзя. Проверьте read-only endpoint.</span>',
      '</article>',
      '</section>',
    ].join('');
    return;
  }

  const audit = cleanupAuditData();
  const summary = audit.summary || {};
  const items = sortedAuditItems(Array.isArray(audit.items) ? audit.items : []);
  const visibleItems = filteredAuditItems(items);
  const groups = groupAuditItems(visibleItems);
  const severities = severityCounts(items);
  const summaryHtml = auditSummaryRows(summary).map(function (row) {
    return '<article class="audit-summary-card"><strong>' + escapeHtml(row[1] == null ? '-' : row[1]) + '</strong><span>' + escapeHtml(row[0]) + '</span></article>';
  }).join('');
  const groupHtml = Object.keys(groups).sort().map(function (issueType) {
    return '<span class="audit-group-chip">' + escapeHtml(issueType) + ': ' + groups[issueType].length + '</span>';
  }).join('');
  const compactSummaryHtml = [
    ['Высокий', severities.high, 'high'],
    ['Средний', severities.medium, 'medium'],
    ['Низкий', severities.low, 'low'],
    ['Видимо', visibleItems.length, 'visible'],
  ].map(function (row) {
    return '<article class="audit-compact-card ' + escapeHtml(row[2]) + '"><strong>' + escapeHtml(row[1]) + '</strong><span>' + escapeHtml(row[0]) + '</span></article>';
  }).join('');
  const explanation = '<p class="audit-explainer">Это только аудит. BA Fox ничего не меняет в таблице.</p>';

  if (!items.length) {
    elements.taskList.innerHTML = [
      '<section class="audit-section">',
      explanation,
      '<div class="audit-summary-grid">' + summaryHtml + '</div>',
      '<article class="empty-state">',
      '<strong>Audit-only отчет не нашел предложений</strong>',
      '<span>Это только экран просмотра. Никаких изменений в Tasks не выполняется.</span>',
      '</article>',
      '</section>',
    ].join('');
    return;
  }

  elements.taskList.innerHTML = [
    '<section class="audit-section">',
    explanation,
    '<div class="audit-summary-grid">' + summaryHtml + '</div>',
    '<div class="audit-compact-grid">' + compactSummaryHtml + '</div>',
    '<div class="audit-filters" aria-label="Фильтры аудита">' + auditFilterHtml(items) + '</div>',
    '<div class="audit-groups" aria-label="Группы проблем">' + (groupHtml || '<span class="audit-group-chip muted">Нет элементов для фильтра</span>') + '</div>',
    '<div class="audit-items">',
    visibleItems.map(function (item) {
      return [
        '<article class="audit-card" data-severity="' + escapeHtml(item.severity) + '">',
        '<div>',
        '<div class="audit-card-title"><span>' + escapeHtml(item.issueType) + ' · row ' + escapeHtml(item.rowNumber) + '</span><strong class="severity-pill ' + escapeHtml(item.severity) + '">' + escapeHtml(item.severity) + '</strong></div>',
        '<div class="task-meta">ID задачи: ' + escapeHtml(item.taskId || '-') + '</div>',
        '</div>',
        '<div class="audit-values">',
        '<span><strong>Сейчас:</strong> ' + escapeHtml(item.currentValue || '-') + '</span>',
        '<span><strong>Предложение:</strong> ' + escapeHtml(item.proposedValue || '-') + '</span>',
        '<span><strong>Уверенность:</strong> ' + escapeHtml(item.confidence == null ? '-' : item.confidence) + '</span>',
        '<span><strong>Действие:</strong> ' + escapeHtml(item.suggestedAction || 'REVIEW_REQUIRED') + '</span>',
        '<span><strong>Согласование:</strong> ' + (item.needsLisaApproval ? 'Нужно согласование Lisa' : 'Не требуется') + '</span>',
        '</div>',
        '<p>' + escapeHtml(item.notes || '') + '</p>',
        '</article>',
      ].join('');
    }).join(''),
    '</div>',
    visibleItems.length ? renderReviewPreview(visibleItems) : '<article class="empty-state"><strong>Для фильтра нет элементов</strong><span>Выберите «Все» или другой фильтр.</span></article>',
    '</section>',
  ].join('');
}

function renderPanel() {
  const label = viewLabels[activeTab];
  elements.panelEyebrow.textContent = label[0];
  elements.panelTitle.textContent = label[1];
  elements.panelBadge.textContent = dashboardState.isMock || cleanupAuditState.isMock ? 'ДЕМО / ТОЛЬКО ЧТЕНИЕ' : writeModeLabel();
  elements.statusMessage.textContent = statusText();
  elements.statusMessage.classList.toggle('error', dashboardState.status === 'error' || scaffoldState.status === 'error' || cleanupAuditState.status === 'error');

  if (dashboardState.status === 'loading' || (activeTab === 'audit' && cleanupAuditState.status === 'loading')) {
    elements.workspaceControls.innerHTML = '';
    elements.taskList.innerHTML = '<article class="loading-state">Загружаю данные для просмотра...</article>';
    return;
  }
  if (activeTab === 'audit') {
    elements.workspaceControls.innerHTML = '';
    renderAudit();
    return;
  }
  if (activeTab === 'system') {
    elements.workspaceControls.innerHTML = '';
    renderSystem();
    return;
  }
  renderTasks();
}

function render() {
  localizeStaticLabels();
  renderModeBanner();
  renderCreateTaskButton();
  renderSummary();
  renderPanel();
}

function localizeStaticLabels() {
  elements.tabs.forEach(function (tab) {
    const label = viewLabels[tab.dataset.tab];
    if (label) {
      const count = navCountForTab(tab.dataset.tab);
      tab.innerHTML = '<span>' + escapeHtml(label[0]) + '</span>' + (count === '' || count == null ? '' : '<strong>' + escapeHtml(count) + '</strong>');
    }
  });
}

function setTab(tabName) {
  if (!Object.prototype.hasOwnProperty.call(viewLabels, tabName)) {
    return;
  }
  activeTab = tabName;
  activeTaskFilter = 'all';
  taskSearchQuery = '';
  flashMessage = '';
  elements.tabs.forEach(function (tab) {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  renderPanel();
  loadLazyTabData(tabName);
}

function renderCreateTaskModal() {
  const busy = createTaskState.status === 'loading';
  elements.submitCreateTask.disabled = busy;
  elements.cancelCreateTask.disabled = busy;
  elements.cancelCreateTaskTop.disabled = busy;
  elements.createTaskMessage.textContent = createTaskState.message || '';
  elements.createTaskMessage.classList.toggle('error', createTaskState.status === 'error');
}

function openCreateTaskModal() {
  if (!safeWritesEnabled()) {
    return;
  }
  createTaskState = { status: 'idle', message: '' };
  elements.createTaskForm.reset();
  elements.createTaskModal.hidden = false;
  renderCreateTaskModal();
  elements.createTaskForm.elements.title.focus();
}

function closeCreateTaskModal() {
  if (createTaskState.status === 'loading') {
    return;
  }
  elements.createTaskModal.hidden = true;
  createTaskState = { status: 'idle', message: '' };
  renderCreateTaskModal();
}

function findLoadedTask(taskId) {
  return allLoadedTasks().find(function (task) {
    return task.id === taskId;
  });
}

function renderEditTaskModal() {
  const busy = editTaskState.status === 'loading';
  elements.submitEditTask.disabled = busy || !safeWritesEnabled();
  elements.closeEditTask.disabled = busy;
  elements.closeEditTaskTop.disabled = busy;
  elements.editTaskMessage.textContent = editTaskState.message || '';
  elements.editTaskMessage.classList.toggle('error', editTaskState.status === 'error');
}

function openEditTaskModal(taskId) {
  const task = findLoadedTask(taskId);
  if (!task) {
    return;
  }
  editTaskState = { status: 'idle', message: '', taskId: taskId };
  elements.editTaskForm.reset();
  elements.editTaskForm.elements.taskId.value = taskId;
  elements.editTaskForm.elements.comment.value = '';
  elements.editTaskForm.elements.nextAction.value = nextActionText(task);
  elements.editTaskForm.elements.deadline.value = isoDateFromValue(task.deadline);
  elements.editTaskForm.elements.controlDate.value = taskControlDate(task);
  elements.editTaskForm.elements.priority.value = task.priority || '';
  elements.editTaskForm.elements.category.value = task.category || '';
  elements.editTaskBody.innerHTML = [
    '<div class="edit-task-summary">',
    '<strong>' + escapeHtml(removeIsoDateNoise(task.title)) + '</strong>',
    '<span>' + escapeHtml(task.organization || 'Без компании') + ' · ID: ' + escapeHtml(task.id) + '</span>',
    '</div>',
  ].join('');
  elements.editTaskModal.hidden = false;
  renderEditTaskModal();
  elements.editTaskForm.elements.comment.focus();
}

function closeEditTaskModal() {
  if (editTaskState.status === 'loading') {
    return;
  }
  elements.editTaskModal.hidden = true;
  elements.editTaskBody.innerHTML = '';
  editTaskState = { status: 'idle', message: '', taskId: '' };
  renderEditTaskModal();
}

function editTaskPayloadFromForm() {
  const formData = new FormData(elements.editTaskForm);
  return {
    taskId: String(formData.get('taskId') || '').trim(),
    comment: String(formData.get('comment') || '').trim(),
    nextAction: String(formData.get('nextAction') || '').trim(),
    deadline: String(formData.get('deadline') || '').trim(),
    controlDate: String(formData.get('controlDate') || '').trim(),
    priority: String(formData.get('priority') || '').trim(),
    category: String(formData.get('category') || '').trim(),
  };
}

function compactEditTaskPayload(payload) {
  const task = findLoadedTask(payload.taskId) || {};
  const compact = { taskId: payload.taskId };
  [
    ['comment', ''],
    ['nextAction', nextActionText(task)],
    ['deadline', isoDateFromValue(task.deadline)],
    ['controlDate', taskControlDate(task)],
    ['priority', task.priority || ''],
    ['category', task.category || ''],
  ].forEach(function (pair) {
    const field = pair[0];
    const previousValue = String(pair[1] || '').trim();
    const value = String(payload[field] || '').trim();
    if (field === 'comment') {
      if (value) compact.comment = value;
      return;
    }
    if (value !== previousValue) {
      compact[field] = value;
    }
  });
  return compact;
}

function validateEditTaskPayload(payload) {
  const errors = [];
  if (!payload.taskId) {
    errors.push('не найдена задача');
  }
  if (!payload.nextAction && !payload.comment && !payload.deadline && !payload.controlDate && !payload.priority && !payload.category) {
    errors.push('добавьте новые данные или измените следующий шаг');
  }
  if (payload.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(payload.deadline)) {
    errors.push('срок должен быть датой');
  }
  if (payload.controlDate && !/^\d{4}-\d{2}-\d{2}$/.test(payload.controlDate)) {
    errors.push('контрольная дата должна быть датой');
  }
  return errors;
}

async function handleEditTaskSubmit(event) {
  event.preventDefault();
  if (!safeWritesEnabled()) {
    return;
  }

  const compactPayload = compactEditTaskPayload(editTaskPayloadFromForm());
  const errors = validateEditTaskPayload(compactPayload);
  if (errors.length) {
    editTaskState = {
      status: 'error',
      message: 'Проверьте: ' + errors.join(', ') + '.',
      taskId: compactPayload.taskId,
    };
    renderEditTaskModal();
    return;
  }

  editTaskState = {
    status: 'loading',
    message: 'Сохраняю обновление этапа...',
    taskId: compactPayload.taskId,
  };
  renderEditTaskModal();

  try {
    await BAFoxClient.editTask(compactPayload);
    elements.editTaskModal.hidden = true;
    editTaskState = { status: 'idle', message: '', taskId: '' };
    await refreshDashboardAfterAction(compactPayload.taskId, 'Этап задачи обновлён.');
    flashMessage = 'Этап задачи обновлён.';
    render();
  } catch (error) {
    editTaskState = {
      status: 'error',
      message: error && error.message ? error.message : 'Не удалось обновить этап.',
      taskId: compactPayload.taskId,
    };
    renderEditTaskModal();
  }
}

function createTaskPayloadFromForm() {
  const formData = new FormData(elements.createTaskForm);
  return {
    title: String(formData.get('title') || '').trim(),
    organization: String(formData.get('organization') || '').trim(),
    nextAction: String(formData.get('nextAction') || '').trim(),
    deadline: String(formData.get('deadline') || '').trim(),
  };
}

function validateCreateTaskPayload(payload) {
  const missing = [];
  if (!payload.title) {
    missing.push('Название задачи');
  }
  if (!payload.nextAction) {
    missing.push('Следующее действие');
  }
  return missing;
}

async function handleCreateTaskSubmit(event) {
  event.preventDefault();
  if (!safeWritesEnabled()) {
    return;
  }

  const payload = createTaskPayloadFromForm();
  const missing = validateCreateTaskPayload(payload);
  if (missing.length) {
    createTaskState = {
      status: 'error',
      message: 'Заполните: ' + missing.join(', ') + '.',
    };
    renderCreateTaskModal();
    return;
  }

  createTaskState = {
    status: 'loading',
    message: 'Создаю задачу...',
  };
  renderCreateTaskModal();

  try {
    const result = await BAFoxClient.createTask(payload);
    elements.createTaskModal.hidden = true;
    createTaskState = { status: 'success', message: '' };
    await loadDashboard();
    flashMessage = 'Задача создана: ' + (result && result.taskId ? result.taskId : 'новая задача') + '.';
    render();
  } catch (error) {
    createTaskState = {
      status: 'error',
      message: error && error.message ? error.message : 'Не удалось создать задачу.',
    };
    renderCreateTaskModal();
  }
}

async function loadDashboard() {
  dashboardState = BAFoxClient.createLoadingState('dashboard');
  scaffoldState = BAFoxClient.createLoadingState('scaffoldInfo');
  render();
  const workspaceState = await BAFoxClient.getDashboard();
  const data = workspaceState.data || {};
  dashboardState = stateFromFullDashboard(workspaceState, 'dashboard', data);
  scaffoldState = stateFromFullDashboard(workspaceState, 'scaffoldInfo', data.scaffoldInfo);
  render();
}

async function refreshDashboardAfterAction(taskId, successMessage) {
  const previousTab = activeTab;
  const previousFilter = activeTaskFilter;
  const previousSearch = taskSearchQuery;
  const previousCompleted = dashboardData().completed;
  const workspaceState = await BAFoxClient.getDashboard();
  const data = Object.assign({}, workspaceState.data || {});
  if (previousCompleted && !data.completed) {
    data.completed = previousCompleted;
  }
  dashboardState = stateFromFullDashboard(workspaceState, 'dashboard', data);
  scaffoldState = stateFromFullDashboard(workspaceState, 'scaffoldInfo', data.scaffoldInfo);
  activeTab = previousTab;
  activeTaskFilter = previousFilter;
  taskSearchQuery = previousSearch;
  taskActionState[taskId] = {
    status: 'success',
    message: successMessage || 'Готово. Данные обновлены.',
  };
  render();
}

async function loadCompletedIfNeeded() {
  const data = dashboardData();
  if ((data.completed && Array.isArray(data.completed.tasks)) || dashboardState.status === 'loading') {
    return;
  }
  const completedState = await BAFoxClient.getCompletedTasks({ limit: 100 });
  if (completedState.status !== 'success' && completedState.status !== 'empty') {
    return;
  }
  dashboardState = Object.assign({}, dashboardState, {
    data: Object.assign({}, dashboardData(), {
      completed: completedState.data,
    }),
  });
  if (activeTab === 'reports' && reportPreview.type) {
    reportPreview = {
      type: reportPreview.type,
      text: buildReport(reportPreview.type),
    };
  }
  render();
}

async function loadCleanupAuditIfNeeded() {
  if (cleanupAuditState.status === 'success' || cleanupAuditState.status === 'loading') {
    return;
  }
  cleanupAuditState = BAFoxClient.createLoadingState('cleanupAudit');
  renderPanel();
  cleanupAuditState = await BAFoxClient.getCleanupAudit();
  renderPanel();
}

function loadLazyTabData(tabName) {
  if (tabName === 'completed' || tabName === 'reports' || tabName === 'calendar') {
    loadCompletedIfNeeded();
  }
  if (tabName === 'audit') {
    loadCleanupAuditIfNeeded();
  }
}

function loadOptionalLocalConfig() {
  return new Promise(function (resolve) {
    const localConfigScript = document.createElement('script');
    localConfigScript.src = 'config.local.js';
    localConfigScript.onload = resolve;
    localConfigScript.onerror = resolve;
    document.head.appendChild(localConfigScript);
  });
}

elements.tabBar.addEventListener('click', function (event) {
  const tab = event.target.closest('[data-tab]');
  if (!tab || !elements.tabBar.contains(tab)) {
    return;
  }
  event.preventDefault();
  setTab(tab.dataset.tab);
});

elements.createTaskButton.addEventListener('click', openCreateTaskModal);
elements.cancelCreateTask.addEventListener('click', closeCreateTaskModal);
elements.cancelCreateTaskTop.addEventListener('click', closeCreateTaskModal);
elements.closeEditTask.addEventListener('click', closeEditTaskModal);
elements.closeEditTaskTop.addEventListener('click', closeEditTaskModal);
elements.createTaskForm.addEventListener('submit', handleCreateTaskSubmit);
elements.editTaskForm.addEventListener('submit', handleEditTaskSubmit);
elements.createTaskModal.addEventListener('click', function (event) {
  if (event.target === elements.createTaskModal) {
    closeCreateTaskModal();
  }
});
elements.editTaskModal.addEventListener('click', function (event) {
  if (event.target === elements.editTaskModal) {
    closeEditTaskModal();
  }
});

elements.workspaceControls.addEventListener('input', function (event) {
  if (event.target && event.target.id === 'taskSearchInput') {
    taskSearchQuery = event.target.value || '';
    renderTasks({ skipControls: true });
  }
});

elements.workspaceControls.addEventListener('click', function (event) {
  const taskFilterButton = event.target.closest('[data-task-filter]');
  if (taskFilterButton) {
    activeTaskFilter = taskFilterButton.dataset.taskFilter || 'all';
    renderTasks();
  }
});

elements.taskList.addEventListener('click', function (event) {
  const reportButton = event.target.closest('[data-report-action]');
  if (reportButton) {
    reportPreview = {
      type: reportButton.dataset.reportAction || 'daily',
      text: buildReport(reportButton.dataset.reportAction || 'daily'),
    };
    renderReports();
    return;
  }

  const filterButton = event.target.closest('[data-audit-filter]');
  if (filterButton) {
    activeAuditFilter = filterButton.dataset.auditFilter || 'all';
    renderAudit();
    return;
  }

  const editButton = event.target.closest('[data-task-edit]');
  if (editButton) {
    openEditTaskModal(editButton.dataset.taskEdit);
    return;
  }

  const focusButton = event.target.closest('[data-task-focus]');
  if (focusButton) {
    handleFocusToggle(focusButton.dataset.taskFocus);
    return;
  }

  const actionButton = event.target.closest('[data-task-action]');
  if (actionButton) {
    handleTaskAction(actionButton);
  }
});

function safeReminderFor(action) {
  const today = todayIsoBangkok();
  const date = new Date(today + 'T00:00:00Z');
  if (action === 'snoozeOneDay') {
    date.setUTCDate(date.getUTCDate() + 1);
  } else if (action === 'snoozeThreeDays') {
    date.setUTCDate(date.getUTCDate() + 3);
  } else if (action === 'snoozeNextWeek') {
    const bangkokWeekday = date.getUTCDay();
    const daysUntilMonday = bangkokWeekday === 1 ? 7 : (8 - bangkokWeekday) % 7;
    date.setUTCDate(date.getUTCDate() + daysUntilMonday);
  }
  return date.toISOString().slice(0, 10) + ' 10:00';
}

function backendAction(action) {
  if (action === 'snoozeOneDay' || action === 'snoozeThreeDays' || action === 'snoozeNextWeek') {
    return 'snoozeTask';
  }
  return action;
}

function cloneTaskWithAction(task, actionData) {
  const updated = Object.assign({}, task);
  if (actionData.newStatus) {
    updated.status = actionData.newStatus;
  }
  if (actionData.newNextReminder !== undefined) {
    updated.nextReminder = actionData.newNextReminder;
  }
  if (updated.status === 'Выполнено') {
    updated.completedAt = updated.completedAt || new Date().toISOString();
  }
  return updated;
}

function findTaskForAction(taskId) {
  const data = dashboardData();
  const sections = [data.today, data.open, data.pushes];
  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
    const section = sections[sectionIndex];
    if (!section || !Array.isArray(section.tasks)) {
      continue;
    }
    const task = section.tasks.find(function (candidate) {
      return candidate.id === taskId;
    });
    if (task) {
      return task;
    }
  }
  return null;
}

async function handleFocusToggle(taskId) {
  if (!taskId) {
    return;
  }
  const task = findLoadedTask(taskId) || {};
  const nextFocus = !isManualFocusTask(task);
  manualFocusTaskIds[taskId] = nextFocus;
  if (!nextFocus) {
    delete manualFocusTaskIds[taskId];
  }
  render();
  if (!safeWritesEnabled()) {
    return;
  }

  try {
    await BAFoxClient.editTask({
      taskId: taskId,
      focus: nextFocus ? 'true' : 'false',
    });
    await refreshDashboardAfterAction(taskId, nextFocus ? 'Задача добавлена в Focus.' : 'Задача убрана из Focus.');
  } catch (error) {
    if (error && error.code === 'SCHEMA_FIELD_MISSING') {
      taskActionState[taskId] = {
        status: 'success',
        message: 'Focus сохранён локально. Для постоянной отметки нужна колонка focus в Tasks.',
      };
      renderPanel();
      return;
    }
    manualFocusTaskIds[taskId] = !nextFocus;
    if (nextFocus) {
      delete manualFocusTaskIds[taskId];
    }
    taskActionState[taskId] = {
      status: 'error',
      message: error && error.message ? error.message : 'Не удалось сохранить Focus.',
    };
    renderPanel();
  }
}

function taskBelongsInPushes(task) {
  const text = [task.status, task.category, task.reminderMode].map(normalizeText).join(' ');
  return ['пуш', 'ждём ответ', 'ждем ответ', 'waiting', 'push', 'control', 'follow-up', 'контроль'].some(function (signal) {
    return text.includes(signal);
  });
}

function updateSectionTasks(section, taskId, updatedTask, includeUpdatedTask) {
  if (!section || !Array.isArray(section.tasks)) {
    return;
  }
  let found = false;
  section.tasks = section.tasks.reduce(function (tasks, task) {
    if (task.id !== taskId) {
      tasks.push(task);
      return tasks;
    }
    found = true;
    if (includeUpdatedTask(updatedTask)) {
      tasks.push(updatedTask);
    }
    return tasks;
  }, []);
  if (!found && includeUpdatedTask(updatedTask)) {
    section.tasks.push(updatedTask);
  }
}

function applyTaskActionResult(taskId, action, actionData) {
  const data = dashboardData();
  const currentTask = findTaskForAction(taskId);
  if (!currentTask) {
    return;
  }
  const updatedTask = cloneTaskWithAction(currentTask, actionData);
  const isDone = normalizeText(updatedTask.status) === 'выполнено';

  updateSectionTasks(data.open, taskId, updatedTask, function () {
    return !isDone;
  });
  updateSectionTasks(data.today, taskId, updatedTask, function (task) {
    return !isDone && (
      dateSignalIsDue(task.nextReminder, todayIsoBangkok())
      || dateSignalIsDue(task.deadline, todayIsoBangkok())
      || isHighPriority(task)
      || ['пуш', 'ждём ответ', 'ждём подтверждение', 'ждём подписание'].includes(normalizeText(task.status))
    );
  });
  updateSectionTasks(data.pushes, taskId, updatedTask, function (task) {
    return !isDone && taskBelongsInPushes(task);
  });
}

async function handleTaskAction(button) {
  const taskId = button.dataset.taskId;
  const action = button.dataset.taskAction;
  if (!taskId || !action || !allowedTaskActions.includes(action) || !safeWritesEnabled()) {
    return;
  }
  if (action === 'markDone' && !window.confirm('Отметить задачу выполненной?')) {
    return;
  }

  const payload = {
    taskId: taskId,
    action: backendAction(action),
  };
  if (payload.action === 'snoozeTask') {
    payload.nextReminder = safeReminderFor(action);
  }

  taskActionState[taskId] = {
    status: 'loading',
    action: action,
  };
  renderPanel();

  try {
    const actionData = await BAFoxClient.runTaskAction(payload);
    applyTaskActionResult(taskId, action, Object.assign({
      newStatus: actionStatusUpdates[action],
      newNextReminder: payload.action === 'snoozeTask' ? payload.nextReminder : undefined,
    }, actionData || {}));
    taskActionState[taskId] = {
      status: 'success',
      action: action,
      message: actionSuccessMessages[action] || 'Готово. Данные обновлены.',
    };
    render();
    try {
      await refreshDashboardAfterAction(taskId, taskActionState[taskId].message);
    } catch (refreshError) {
      taskActionState[taskId] = {
        status: 'error',
        action: action,
        message: 'Действие выполнено, но не удалось обновить данные. Обновите экран вручную.',
      };
      renderPanel();
    }
  } catch (error) {
    taskActionState[taskId] = {
      status: 'error',
      action: action,
      message: error && error.message ? error.message : 'Действие не выполнено. Попробуйте ещё раз.',
    };
    renderPanel();
  }
}

async function initializeDashboard() {
  formatBangkokTime();
  setInterval(formatBangkokTime, 30000);
  render();
  await loadOptionalLocalConfig();
  await loadDashboard();
}

initializeDashboard();
