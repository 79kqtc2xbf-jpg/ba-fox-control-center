const viewLabels = Object.freeze({
  today: ['Сегодня', 'Задачи на сегодня'],
  open: ['Открытые', 'Все открытые задачи'],
  pushes: ['Пуши', 'Ожидают следующего шага'],
  audit: ['Аудит данных', 'Audit-only cleanup report'],
  system: ['Система', 'Безопасный режим'],
});

const elements = {
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

let activeTab = 'today';
let activeAuditFilter = 'all';
let dashboardState = BAFoxClient.createLoadingState('dashboard');
let scaffoldState = BAFoxClient.createLoadingState('scaffoldInfo');
let cleanupAuditState = BAFoxClient.createLoadingState('cleanupAudit');

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

function taskRowsForTab() {
  const data = dashboardData();
  const collection = {
    today: data.today,
    open: data.open,
    pushes: data.pushes,
  }[activeTab];
  return collection && Array.isArray(collection.tasks) ? collection.tasks : [];
}

function summaryCount(sectionName) {
  const section = dashboardData()[sectionName];
  return section && Array.isArray(section.tasks) ? section.tasks.length : '-';
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
    ? '<strong>Demo mode / mock data</strong><span>Read-only источник недоступен. Показаны безопасные демо-данные.</span>'
    : isMock
      ? '<strong>Demo mode / mock data</strong><span>Без подключения к рабочей таблице и без изменений задач.</span>'
      : '<strong>Read-only data</strong><span>Данные загружены только для просмотра.</span>';
}

function renderSummary() {
  if (dashboardState.status === 'loading') {
    elements.summaryCards.innerHTML = ['Сегодня', 'Открытые', 'Пуши', 'Аудит', 'Режим'].map(function (label) {
      return '<article class="summary-card loading"><strong>...</strong><span>' + label + '</span></article>';
    }).join('');
    return;
  }

  const auditSummary = cleanupAuditData().summary || {};
  const cards = [
    { value: summaryCount('today'), label: 'Сегодня' },
    { value: summaryCount('open'), label: 'Открытые' },
    { value: summaryCount('pushes'), label: 'Пуши' },
    { value: auditSummary.rowsChecked == null ? '-' : auditSummary.rowsChecked, label: 'Строк аудита' },
    { value: dashboardState.isMock ? 'Demo' : 'Read', label: 'Режим' },
  ];

  elements.summaryCards.innerHTML = cards.map(function (card) {
    return '<article class="summary-card"><strong>' + escapeHtml(card.value) + '</strong><span>' + card.label + '</span></article>';
  }).join('');
}

function statusText() {
  if (dashboardState.status === 'loading') {
    return 'Загружаю безопасный обзор...';
  }
  if (dashboardState.status === 'error' || scaffoldState.status === 'error') {
    return 'Ошибка чтения: рабочие данные не открыты, ниже показан demo-набор.';
  }
  if (activeTab === 'system') {
    return 'Этот экран показывает только состояние read-only контура.';
  }
  if (activeTab === 'audit') {
    if (cleanupAuditState.status === 'error') {
      return 'Ошибка чтения audit-only отчета: показан безопасный demo-набор.';
    }
    return 'Аудит только показывает предложения. Кнопок очистки, архивации и нормализации здесь нет.';
  }
  return dashboardState.isMock
    ? 'Это демонстрационные задачи. Изменение статуса и отправка данных отключены.'
    : 'Данные доступны только для чтения.';
}

function renderEmpty() {
  elements.taskList.innerHTML = [
    '<article class="empty-state">',
    '<strong>В этом разделе пока нет задач</strong>',
    '<span>Это корректное пустое состояние read-only dashboard.</span>',
    '</article>',
  ].join('');
}

function taskMeta(task) {
  return [task.organization, task.priority ? 'Приоритет: ' + task.priority : '', task.deadline ? 'Срок: ' + task.deadline : '']
    .filter(Boolean)
    .join(' · ');
}

function renderTasks() {
  const tasks = taskRowsForTab();
  if (!tasks.length) {
    renderEmpty();
    return;
  }

  elements.taskList.innerHTML = tasks.map(function (task) {
    return [
      '<article class="task-card" data-status="' + escapeHtml(task.status) + '">',
      '<div class="status-dot" aria-hidden="true"></div>',
      '<div>',
      '<div class="task-title">' + escapeHtml(task.title) + '</div>',
      '<div class="task-meta">' + escapeHtml(taskMeta(task)) + '</div>',
      '</div>',
      '<span class="task-chip">' + escapeHtml(task.status) + '</span>',
      '</article>',
    ].join('');
  }).join('');
}

function renderSystem() {
  const info = scaffoldData();
  const rows = [
    ['Источник', dashboardState.isMock ? 'Mock fixture' : 'Read-only API'],
    ['Запись', info.dryRun === true ? 'Отключена (dry-run)' : 'Не подтверждено'],
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
  elements.panelBadge.textContent = dashboardState.isMock || cleanupAuditState.isMock ? 'Demo / Read-only' : 'Read-only';
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
  activeTab = tabName;
  elements.tabs.forEach(function (tab) {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  renderPanel();
}

async function loadDashboard() {
  dashboardState = BAFoxClient.createLoadingState('dashboard');
  scaffoldState = BAFoxClient.createLoadingState('scaffoldInfo');
  cleanupAuditState = BAFoxClient.createLoadingState('cleanupAudit');
  render();
  const states = await Promise.all([
    BAFoxClient.getDashboard(),
    BAFoxClient.getScaffoldInfo(),
    BAFoxClient.getCleanupAudit(),
  ]);
  dashboardState = states[0];
  scaffoldState = states[1];
  cleanupAuditState = states[2];
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

elements.tabs.forEach(function (tab) {
  tab.addEventListener('click', function () {
    setTab(tab.dataset.tab);
  });
});

elements.taskList.addEventListener('click', function (event) {
  const filterButton = event.target.closest('[data-audit-filter]');
  if (!filterButton) {
    return;
  }
  activeAuditFilter = filterButton.dataset.auditFilter || 'all';
  renderAudit();
});

async function initializeDashboard() {
  formatBangkokTime();
  setInterval(formatBangkokTime, 30000);
  render();
  await loadOptionalLocalConfig();
  await loadDashboard();
}

initializeDashboard();
