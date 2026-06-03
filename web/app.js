const viewLabels = Object.freeze({
  today: ['Сегодня', 'Задачи на сегодня'],
  focus: ['Фокус', 'Главное для движения вперёд'],
  communication: ['Коммуникация', 'Ответы, письма и касания'],
  documents: ['Документы', 'Документы, договоры и KYC'],
  presentations: ['Презентации', 'Деки, офферы и материалы'],
  waiting: ['Ожидания', 'Ответы, пуши и напоминания'],
  completed: ['Выполненное', 'Закрытые задачи из загруженных данных'],
  calendar: ['Календарь', 'Задачи по срокам и напоминаниям'],
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
  editTaskBody: document.querySelector('#editTaskBody'),
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
  { id: 'urgent', label: 'Срочно' },
  { id: 'high', label: 'Высокий приоритет' },
  { id: 'work', label: 'В работе' },
  { id: 'waiting', label: 'Ждут ответа' },
  { id: 'push', label: 'Пуши' },
  { id: 'blockers', label: 'Блокеры' },
  { id: 'today', label: 'Сегодня' },
  { id: 'overdue', label: 'Просрочено' },
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

let activeTab = 'today';
let activeTaskFilter = 'all';
let taskSearchQuery = '';
let activeAuditFilter = 'all';
let dashboardState = BAFoxClient.createLoadingState('dashboard');
let scaffoldState = BAFoxClient.createLoadingState('scaffoldInfo');
let cleanupAuditState = BAFoxClient.createLoadingState('cleanupAudit');
let taskActionState = {};
let createTaskState = { status: 'idle', message: '' };
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

function isFinalTask(task) {
  return ['выполнено', 'done', 'cancelled', 'archived', 'архив'].includes(normalizeText(task.status)) || task.archived === true;
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
  return !isFinalTask(task) && (
    status.includes('просроч') || status.includes('overdue') || dateSignalIsOverdue(task.deadline, today)
  );
}

function isUrgentTask(task) {
  return !isFinalTask(task) && (isHighPriority(task) || isBlockerTask(task));
}

function derivedTodayTasks() {
  const data = dashboardData();
  const backendToday = data.today && Array.isArray(data.today.tasks) ? data.today.tasks : [];
  if (backendToday.length) {
    return backendToday;
  }
  const today = todayIsoBangkok();
  const priorityStatuses = ['пуш', 'блокер', 'ждём ответ', 'ждём подтверждение', 'ждём подписание'];
  return allOpenTasks().filter(function (task) {
    const status = normalizeText(task.status);
    return !isFinalTask(task) && (
      dateSignalIsDue(task.nextReminder, today)
      || dateSignalIsDue(task.deadline, today)
      || isHighPriority(task)
      || priorityStatuses.includes(status)
    );
  });
}

function waitListTasks() {
  return allOpenTasks().filter(function (task) {
    return waitingStatuses.some(function (status) {
      return normalizeText(status) === normalizeText(task.status);
    });
  });
}

function focusTasks() {
  const combined = derivedTodayTasks().concat(waitListTasks()).concat(taskRowsForBaseTab('pushes'));
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

function taskScore(task) {
  let score = 0;
  const status = normalizeText(task.status);
  if (isHighPriority(task)) score += 5;
  if (status === 'блокер') score += 5;
  if (status === 'пуш') score += 4;
  if (status.includes('ждём') || status.includes('wait')) score += 3;
  if (dateSignalIsDue(task.deadline, todayIsoBangkok())) score += 4;
  if (dateSignalIsDue(task.nextReminder, todayIsoBangkok())) score += 3;
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
  if (activeTab === 'today') {
    return derivedTodayTasks();
  }
  if (activeTab === 'waiting') {
    return waitListTasks();
  }
  if (activeTab === 'focus') {
    return focusTasks().slice(0, 15);
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
  if (activeTab === 'completed') {
    return completedTasks();
  }
  if (activeTab === 'calendar') {
    return allLoadedTasks();
  }
  return allOpenTasks();
}

function taskUrgencyBucket(task) {
  const today = todayIsoBangkok();
  const tomorrow = addDaysIso(today, 1);
  const relevantDate = isoDateFromValue(task.deadline) || isoDateFromValue(task.nextReminder);
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

function summaryCount(sectionName) {
  if (sectionName === 'waitList') {
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
        ? '<strong>БЕЗОПАСНАЯ ЗАПИСЬ ВКЛЮЧЕНА</strong><span>Доступны только безопасное создание задач, статус и напоминание.</span>'
        : '<strong>ТОЛЬКО ЧТЕНИЕ</strong><span>Данные загружены только для просмотра. Безопасные действия отключены.</span>';
}

function renderCreateTaskButton() {
  const loading = dashboardState.status === 'loading' || scaffoldState.status === 'loading';
  elements.createTaskButton.disabled = loading || !safeWritesEnabled();
  elements.writeModePill.textContent = safeWritesEnabled() ? 'Safe create' : 'Только просмотр';
  elements.createTaskButton.title = safeWritesEnabled()
    ? 'Создать новую задачу'
    : 'Создание доступно только при SAFE WRITE ENABLED и настроенном action token.';
}

function renderSummary() {
  if (dashboardState.status === 'loading') {
    elements.summaryCards.innerHTML = ['Срочно', 'Ждут ответа', 'Пуши', 'Просрочено'].map(function (label) {
      return '<article class="summary-card loading"><strong>...</strong><span>' + label + '</span></article>';
    }).join('');
    return;
  }

  const openTasks = allOpenTasks();
  const cards = [
    { value: openTasks.filter(isUrgentTask).length, label: 'Срочно', tone: 'urgent' },
    { value: openTasks.filter(isWaitingTask).length, label: 'Ждут ответа', tone: 'waiting' },
    { value: openTasks.filter(isPushTask).length, label: 'Пуши', tone: 'push' },
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
  if (activeTab === 'audit') {
    if (cleanupAuditState.status === 'error') {
      return cleanupAuditState.message || 'Ошибка чтения audit-only отчета: показан безопасный demo-набор.';
    }
    return 'Аудит только показывает предложения. Кнопок очистки, архивации и нормализации здесь нет.';
  }
  return dashboardState.isMock
    ? 'Это демонстрационные задачи. Изменение статуса и отправка данных отключены.'
    : safeWritesEnabled()
      ? 'Безопасные действия создают новую задачу или меняют только статус и напоминание.'
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
    task.deadline ? 'Срок: ' + humanDate(task.deadline) : 'Без срока',
    task.nextReminder ? 'Напомнить: ' + humanDate(task.nextReminder) : '',
  ].filter(Boolean);
}

function taskMatchesFilter(task, filterId) {
  const text = taskSearchText(task);
  const today = todayIsoBangkok();
  if (filterId === 'all') return true;
  if (filterId === 'urgent') return isUrgentTask(task) || dateSignalIsDue(task.deadline, today);
  if (filterId === 'high') return isHighPriority(task);
  if (filterId === 'work') return normalizeText(task.status).includes('в работе');
  if (filterId === 'waiting') return isWaitingTask(task);
  if (filterId === 'push') return isPushTask(task);
  if (filterId === 'blockers') return isBlockerTask(task);
  if (filterId === 'today') return dateSignalIsDue(task.nextReminder, today) || dateSignalIsDue(task.deadline, today);
  if (filterId === 'overdue') return isOverdueTask(task);
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
  return !['system', 'audit'].includes(activeTab);
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
  return removeIsoDateNoise(firstUsefulLine(task.steps) || firstUsefulLine(task.comment) || humanDate(task.nextReminder) || 'Определить следующий шаг');
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
    ['snoozeOneDay', 'Завтра'],
    ['snoozeThreeDays', '+3 дня'],
    ['snoozeNextWeek', 'Следующая неделя'],
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
    '<div class="task-chip-row" aria-label="Напоминание">' + reminderButtons + '</div>',
    '<button class="task-action chip edit-chip" type="button" data-task-id="' + escapeHtml(task.id) + '" data-task-edit="' + escapeHtml(task.id) + '">Редактировать</button>',
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

function taskGroupsHtml(tasks) {
  const groups = groupedTasks(tasks);
  return Object.keys(taskGroupLabels).map(function (groupId) {
    const groupTasks = groups[groupId];
    if (!groupTasks.length) {
      return '';
    }
    const label = taskGroupLabels[groupId];
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

function calendarBucket(task) {
  const today = todayIsoBangkok();
  const tomorrow = addDaysIso(today, 1);
  const weekEnd = addDaysIso(today, 7);
  const date = isoDateFromValue(task.deadline) || isoDateFromValue(task.nextReminder);
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
  const date = task.deadline || task.nextReminder || '';
  return date ? humanDate(date) : 'Без даты';
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
    '<div class="calendar-note">Напоминания сейчас хранятся в Google Sheets. Интеграцию с календарём добавим следующим этапом.</div>',
    '<div class="calendar-grid">' + html + '</div>',
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
  const visibleTasks = tasks.filter(function (task) {
    return taskMatchesFilter(task, activeTaskFilter) && taskMatchesSearch(task);
  });
  if (!tasks.length) {
    if (activeTab === 'completed') {
      elements.taskList.innerHTML = [
        '<article class="empty-state">',
        '<strong>Выполненные задачи пока не загружаются из источника.</strong>',
        '<span>Когда fullDashboard начнет отдавать закрытые задачи, они появятся здесь автоматически.</span>',
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

  elements.taskList.innerHTML = taskGroupsHtml(visibleTasks);
}

function renderSystem() {
  const info = scaffoldData();
  const rows = [
    ['Источник', dashboardState.isMock ? 'Демо-данные' : 'API только для чтения'],
    ['Безопасная запись', info.safeWritesEnabled === true ? 'Включена' : 'Отключена'],
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
      tab.textContent = label[0];
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

function editTaskFieldHtml(label, value) {
  return [
    '<label class="form-field readonly-field">',
    '<span>' + escapeHtml(label) + '</span>',
    '<input type="text" value="' + escapeHtml(value || '') + '" disabled />',
    '</label>',
  ].join('');
}

function openEditTaskModal(taskId) {
  const task = findLoadedTask(taskId);
  if (!task) {
    return;
  }
  elements.editTaskBody.innerHTML = [
    editTaskFieldHtml('Название задачи', removeIsoDateNoise(task.title)),
    editTaskFieldHtml('Компания', task.organization),
    editTaskFieldHtml('Следующее действие', nextActionText(task)),
    editTaskFieldHtml('Срок', task.deadline),
    editTaskFieldHtml('Приоритет', task.priority),
    editTaskFieldHtml('ID задачи', task.id),
  ].join('');
  elements.editTaskModal.hidden = false;
}

function closeEditTaskModal() {
  elements.editTaskModal.hidden = true;
  elements.editTaskBody.innerHTML = '';
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
  dashboardState = BAFoxClient.createLoadingState('fullDashboard');
  scaffoldState = BAFoxClient.createLoadingState('scaffoldInfo');
  cleanupAuditState = BAFoxClient.createLoadingState('cleanupAudit');
  render();
  const fullDashboardState = await BAFoxClient.getFullDashboard();
  const data = fullDashboardState.data || {};
  dashboardState = stateFromFullDashboard(fullDashboardState, 'dashboard', data);
  scaffoldState = stateFromFullDashboard(fullDashboardState, 'scaffoldInfo', data.scaffoldInfo);
  cleanupAuditState = stateFromFullDashboard(fullDashboardState, 'cleanupAudit', data.cleanupAudit);
  render();
}

async function refreshDashboardAfterAction(taskId, successMessage) {
  const previousTab = activeTab;
  const previousFilter = activeTaskFilter;
  const fullDashboardState = await BAFoxClient.getFullDashboard();
  const data = fullDashboardState.data || {};
  dashboardState = stateFromFullDashboard(fullDashboardState, 'dashboard', data);
  scaffoldState = stateFromFullDashboard(fullDashboardState, 'scaffoldInfo', data.scaffoldInfo);
  cleanupAuditState = stateFromFullDashboard(fullDashboardState, 'cleanupAudit', data.cleanupAudit);
  activeTab = previousTab;
  activeTaskFilter = previousFilter;
  taskActionState[taskId] = {
    status: 'success',
    message: successMessage || 'Готово. Данные обновлены.',
  };
  render();
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
