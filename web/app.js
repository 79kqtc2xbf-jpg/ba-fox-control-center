const viewLabels = Object.freeze({
  today: ['Сегодня', 'Задачи на сегодня'],
  open: ['Открытые', 'Все открытые задачи'],
  pushes: ['Пуши', 'Ожидают следующего шага'],
  waitList: ['Wait List', 'Ответы и пуши'],
  focus: ['Daily Focus', 'Главное на сегодня'],
  audit: ['Аудит данных', 'Audit-only cleanup report'],
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
  taskList: document.querySelector('#taskList'),
  todayLabel: document.querySelector('#todayLabel'),
  modeBanner: document.querySelector('#modeBanner'),
};

const auditFilters = Object.freeze([
  { id: 'all', label: 'All', issueTypes: [] },
  { id: 'duplicates', label: 'Duplicates', issueTypes: ['DUPLICATE_ID', 'NEAR_DUPLICATE'] },
  { id: 'statuses', label: 'Statuses', issueTypes: ['STATUS_NORMALIZATION'] },
  { id: 'priorities', label: 'Priorities', issueTypes: ['PRIORITY_NORMALIZATION'] },
  { id: 'dates', label: 'Dates', issueTypes: ['CORRUPTED_FIELD'] },
  { id: 'missingV2', label: 'Missing V2 fields', issueTypes: ['TASK_TYPE_MISSING', 'OWNER_MISSING'] },
  { id: 'archive', label: 'Archive candidates', issueTypes: ['ARCHIVE_CANDIDATE'] },
]);

const severityRank = Object.freeze({
  high: 1,
  medium: 2,
  low: 3,
});

const taskFilters = Object.freeze([
  { id: 'all', label: 'All' },
  { id: 'high', label: 'High priority' },
  { id: 'blockers', label: 'Blockers' },
  { id: 'push', label: 'Push' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'documents', label: 'Documents' },
  { id: 'communication', label: 'Communication' },
  { id: 'automation', label: 'Automation' },
]);

const waitingStatuses = Object.freeze([
  'Ждём ответ',
  'Ждём подтверждение',
  'Ждём подписание',
  'Wait list',
  'Пуш',
]);

const actionLabels = Object.freeze({
  moveToWork: 'In Progress',
  moveToPush: 'Push',
  moveToWaiting: 'Waiting',
  markDone: 'Complete',
  snoozeOneDay: 'Tomorrow',
  snoozeThreeDays: '+3 дня',
  snoozeNextWeek: 'Next week',
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

const taskGroupLabels = Object.freeze({
  urgent: ['Urgent', 'Нужно решить первым'],
  waiting: ['Waiting for response', 'Ответы и подтверждения'],
  pushes: ['Pushes', 'Нужен следующий касание'],
  overdue: ['Overdue', 'Просрочено или горит'],
  remaining: ['Remaining tasks', 'Остальная очередь'],
});

let activeTab = 'today';
let activeTaskFilter = 'all';
let activeAuditFilter = 'all';
let dashboardState = BAFoxClient.createLoadingState('dashboard');
let scaffoldState = BAFoxClient.createLoadingState('scaffoldInfo');
let cleanupAuditState = BAFoxClient.createLoadingState('cleanupAudit');
let taskActionState = {};

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

function normalizeText(value) {
  return String(value == null ? '' : value).trim().toLowerCase();
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

function isWaitingTask(task) {
  const status = normalizeText(task.status);
  return ['ждём ответ', 'ждём подтверждение', 'ждём подписание', 'wait list', 'waiting'].some(function (signal) {
    return status.includes(signal);
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
  if (activeTab === 'waitList') {
    return waitListTasks();
  }
  if (activeTab === 'focus') {
    return focusTasks().slice(0, 15);
  }
  return taskRowsForBaseTab(activeTab);
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
  return safeWritesEnabled() ? 'SAFE WRITE ENABLED' : 'READ ONLY MODE';
}

function renderModeBanner() {
  const loading = dashboardState.status === 'loading' || scaffoldState.status === 'loading';
  const isMock = dashboardState.isMock || scaffoldState.isMock || cleanupAuditState.isMock;
  const failed = dashboardState.status === 'error' || scaffoldState.status === 'error' || cleanupAuditState.status === 'error';
  if (loading) {
    elements.modeBanner.className = 'mode-banner';
    elements.modeBanner.innerHTML = '<strong>Read-only dashboard</strong><span>Проверяю безопасную конфигурацию источника данных...</span>';
    return;
  }
  elements.modeBanner.className = 'mode-banner ' + (failed ? 'warning' : isMock ? 'mock' : 'live');
  elements.modeBanner.innerHTML = failed
    ? '<strong>Demo mode / mock data</strong><span>' + escapeHtml(dashboardState.message || cleanupAuditState.message || 'Read-only источник недоступен. Показаны безопасные демо-данные.') + '</span>'
    : isMock
      ? '<strong>Demo mode / mock data</strong><span>Без подключения к рабочей таблице и без изменений задач.</span>'
      : safeWritesEnabled()
        ? '<strong>SAFE WRITE ENABLED</strong><span>Доступны только безопасные изменения статуса и напоминаний.</span>'
        : '<strong>READ ONLY MODE</strong><span>Данные загружены только для просмотра. Safe actions отключены.</span>';
}

function renderSummary() {
  if (dashboardState.status === 'loading') {
    elements.summaryCards.innerHTML = ['Urgent', 'Waiting', 'Pushes', 'Overdue'].map(function (label) {
      return '<article class="summary-card loading"><strong>...</strong><span>' + label + '</span></article>';
    }).join('');
    return;
  }

  const openTasks = allOpenTasks();
  const cards = [
    { value: openTasks.filter(isUrgentTask).length, label: 'Urgent', tone: 'urgent' },
    { value: openTasks.filter(isWaitingTask).length, label: 'Waiting', tone: 'waiting' },
    { value: openTasks.filter(isPushTask).length, label: 'Pushes', tone: 'push' },
    { value: openTasks.filter(isOverdueTask).length, label: 'Overdue', tone: 'overdue' },
  ];

  elements.summaryCards.innerHTML = cards.map(function (card) {
    return '<article class="summary-card ' + escapeHtml(card.tone) + '"><strong>' + escapeHtml(card.value) + '</strong><span>' + card.label + '</span></article>';
  }).join('');
}

function statusText() {
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
      ? 'Safe actions меняют только статус или nextReminder.'
      : 'Данные доступны только для чтения. Safe actions отключены.';
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
  return [task.organization, task.priority ? 'Приоритет: ' + task.priority : '', task.deadline ? 'Срок: ' + task.deadline : '', task.nextReminder ? 'Напоминание: ' + task.nextReminder : '']
    .filter(Boolean)
    .join(' · ');
}

function taskMatchesFilter(task, filterId) {
  const text = [task.status, task.priority, task.category, task.title, task.comment, task.source, task.channel].map(normalizeText).join(' ');
  if (filterId === 'all') return true;
  if (filterId === 'high') return isHighPriority(task);
  if (filterId === 'blockers') return text.includes('блокер') || text.includes('blocked');
  if (filterId === 'push') return text.includes('пуш') || text.includes('push');
  if (filterId === 'waiting') return text.includes('ждём') || text.includes('ждем') || text.includes('waiting') || text.includes('wait list');
  if (filterId === 'documents') return text.includes('документ') || text.includes('document') || text.includes('contract');
  if (filterId === 'communication') return text.includes('письм') || text.includes('email') || text.includes('звон') || text.includes('call') || text.includes('чат');
  if (filterId === 'automation') return text.includes('automation') || text.includes('автомат');
  return true;
}

function taskFilterHtml(tasks) {
  if (!['open', 'pushes', 'waitList', 'focus'].includes(activeTab)) {
    return '';
  }
  return '<div class="task-filters" aria-label="Фильтры задач">' + taskFilters.map(function (filter) {
    const count = tasks.filter(function (task) { return taskMatchesFilter(task, filter.id); }).length;
    const activeClass = filter.id === activeTaskFilter ? ' active' : '';
    return '<button class="task-filter' + activeClass + '" type="button" data-task-filter="' + escapeHtml(filter.id) + '">' + escapeHtml(filter.label) + ' <span>' + count + '</span></button>';
  }).join('') + '</div>';
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
  return firstUsefulLine(task.steps) || firstUsefulLine(task.comment) || firstUsefulLine(task.nextReminder) || 'Определить следующий шаг';
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
    ['moveToWork', 'In Progress', false],
    ['moveToWaiting', 'Waiting', false],
    ['moveToPush', 'Push', false],
    ['moveToBlocker', 'Blocker', true],
  ];
  const reminderOptions = [
    ['snoozeOneDay', 'Tomorrow'],
    ['snoozeThreeDays', '+3 days'],
    ['snoozeNextWeek', 'Next week'],
  ];
  const completeLabel = busy && state.action === 'markDone' ? '...' : '✓ Complete';
  const moveButtons = moveOptions.map(function (option) {
    const action = option[0];
    const label = busy && state.action === action ? '...' : option[1];
    return '<button class="menu-action" type="button" data-task-id="' + escapeHtml(task.id) + '" data-task-action="' + escapeHtml(action) + '"' + (disabled || busy || option[2] ? ' disabled' : '') + '>' + escapeHtml(label) + '</button>';
  }).join('');
  const reminderButtons = reminderOptions.map(function (option) {
    const action = option[0];
    const label = busy && state.action === action ? '...' : option[1];
    return '<button class="menu-action" type="button" data-task-id="' + escapeHtml(task.id) + '" data-task-action="' + escapeHtml(action) + '"' + (disabled || busy ? ' disabled' : '') + '>' + escapeHtml(label) + '</button>';
  }).join('');
  const message = state.status === 'error'
    ? '<div class="task-error">' + escapeHtml(state.message || 'Action failed') + '</div>'
    : disabled
      ? '<div class="task-notice">Safe actions отключены.</div>'
      : '';
  return [
    '<div class="task-actions">',
    '<button class="task-action primary" type="button" data-task-id="' + escapeHtml(task.id) + '" data-task-action="markDone"' + (disabled || busy ? ' disabled' : '') + '>' + escapeHtml(completeLabel) + '</button>',
    '<details class="action-menu"><summary>Move to...</summary><div>' + moveButtons + '</div></details>',
    '<details class="action-menu"><summary>Reminder</summary><div>' + reminderButtons + '</div></details>',
    '</div>',
    message,
  ].join('');
}

function taskCardHtml(task) {
  return [
    '<article class="task-card" data-tone="' + escapeHtml(taskTone(task)) + '">',
    '<div class="task-body">',
    '<div class="task-topline">',
    '<span class="task-chip">' + escapeHtml(task.status || 'No status') + '</span>',
    task.priority ? '<span class="priority-label">' + escapeHtml(task.priority) + '</span>' : '',
    '</div>',
    '<div class="task-title">' + escapeHtml(task.title) + '</div>',
    '<div class="next-action"><strong>Next Action</strong><span>' + escapeHtml(nextActionText(task)) + '</span></div>',
    '<div class="task-meta">' + escapeHtml(taskMeta(task)) + '</div>',
    '<div class="task-details">',
    taskDetailHtml('Источник', task.source || task.appSource || task.channel),
    taskDetailHtml('Task ID', task.id),
    '</div>',
    actionButtonsHtml(task),
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

function renderTasks() {
  const tasks = taskRowsForTab();
  const visibleTasks = tasks.filter(function (task) {
    return taskMatchesFilter(task, activeTaskFilter);
  });
  if (!tasks.length) {
    renderEmpty();
    return;
  }

  if (!visibleTasks.length) {
    elements.taskList.innerHTML = taskFilterHtml(tasks) + [
      '<article class="empty-state">',
      '<strong>Для фильтра нет задач</strong>',
      '<span>Выберите All или другой фильтр.</span>',
      '</article>',
    ].join('');
    return;
  }

  elements.taskList.innerHTML = taskFilterHtml(tasks) + taskGroupsHtml(visibleTasks);
}

function renderSystem() {
  const info = scaffoldData();
  const rows = [
    ['Источник', dashboardState.isMock ? 'Mock fixture' : 'Read-only API'],
    ['Safe writes', info.safeWritesEnabled === true ? 'Включены' : 'Отключены'],
    ['Read live Sheets', info.readLiveSheets === true ? 'Включено' : 'Отключено'],
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
    ['Near-duplicates', summary.nearDuplicateGroups],
    ['Статусы', summary.nonCanonicalStatuses],
    ['Приоритеты', summary.nonCanonicalPriorities],
    ['V2 поля', summary.missingV2Fields],
    ['Даты', summary.vagueDates],
    ['Legacy active', summary.activeLegacyRows],
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
      item.needsLisaApproval ? 'Lisa approval' : 'no approval flag',
    ].join(' | ');
  });
}

function renderReviewPreview(items) {
  const rows = reviewPreviewRows(items);
  if (!rows.length) {
    return '';
  }
  return [
    '<aside class="review-preview" aria-label="Review format preview">',
    '<div>',
    '<strong>Review format preview</strong>',
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
    ['High', severities.high, 'high'],
    ['Medium', severities.medium, 'medium'],
    ['Low', severities.low, 'low'],
    ['Visible', visibleItems.length, 'visible'],
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
        '<div class="task-meta">Task ID: ' + escapeHtml(item.taskId || '-') + '</div>',
        '</div>',
        '<div class="audit-values">',
        '<span><strong>Сейчас:</strong> ' + escapeHtml(item.currentValue || '-') + '</span>',
        '<span><strong>Предложение:</strong> ' + escapeHtml(item.proposedValue || '-') + '</span>',
        '<span><strong>Confidence:</strong> ' + escapeHtml(item.confidence == null ? '-' : item.confidence) + '</span>',
        '<span><strong>Действие:</strong> ' + escapeHtml(item.suggestedAction || 'REVIEW_REQUIRED') + '</span>',
        '<span><strong>Approval:</strong> ' + (item.needsLisaApproval ? 'Lisa required' : 'not required') + '</span>',
        '</div>',
        '<p>' + escapeHtml(item.notes || '') + '</p>',
        '</article>',
      ].join('');
    }).join(''),
    '</div>',
    visibleItems.length ? renderReviewPreview(visibleItems) : '<article class="empty-state"><strong>Для фильтра нет элементов</strong><span>Выберите All или другой фильтр.</span></article>',
    '</section>',
  ].join('');
}

function renderPanel() {
  const label = viewLabels[activeTab];
  elements.panelEyebrow.textContent = label[0];
  elements.panelTitle.textContent = label[1];
  elements.panelBadge.textContent = dashboardState.isMock || cleanupAuditState.isMock ? 'Demo / READ ONLY MODE' : writeModeLabel();
  elements.statusMessage.textContent = statusText();
  elements.statusMessage.classList.toggle('error', dashboardState.status === 'error' || scaffoldState.status === 'error' || cleanupAuditState.status === 'error');

  if (dashboardState.status === 'loading' || (activeTab === 'audit' && cleanupAuditState.status === 'loading')) {
    elements.taskList.innerHTML = '<article class="loading-state">Загружаю данные для просмотра...</article>';
    return;
  }
  if (activeTab === 'audit') {
    renderAudit();
    return;
  }
  if (activeTab === 'system') {
    renderSystem();
    return;
  }
  renderTasks();
}

function render() {
  renderModeBanner();
  renderSummary();
  renderPanel();
}

function setTab(tabName) {
  if (!Object.prototype.hasOwnProperty.call(viewLabels, tabName)) {
    return;
  }
  activeTab = tabName;
  activeTaskFilter = 'all';
  elements.tabs.forEach(function (tab) {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  renderPanel();
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

elements.taskList.addEventListener('click', function (event) {
  const filterButton = event.target.closest('[data-audit-filter]');
  if (filterButton) {
    activeAuditFilter = filterButton.dataset.auditFilter || 'all';
    renderAudit();
    return;
  }

  const taskFilterButton = event.target.closest('[data-task-filter]');
  if (taskFilterButton) {
    activeTaskFilter = taskFilterButton.dataset.taskFilter || 'all';
    renderTasks();
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
    };
    render();
  } catch (error) {
    taskActionState[taskId] = {
      status: 'error',
      action: action,
      message: error && error.message ? error.message : 'Action failed',
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
