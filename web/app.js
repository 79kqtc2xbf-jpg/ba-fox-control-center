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

let activeTab = 'today';
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

function groupAuditItems(items) {
  return items.reduce(function (groups, item) {
    const key = item.issueType || 'UNKNOWN';
    groups[key] = groups[key] || [];
    groups[key].push(item);
    return groups;
  }, {});
}

function renderAudit() {
  if (cleanupAuditState.status === 'loading') {
    elements.taskList.innerHTML = '<article class="loading-state">Загружаю audit-only отчет...</article>';
    return;
  }

  const audit = cleanupAuditData();
  const summary = audit.summary || {};
  const items = Array.isArray(audit.items) ? audit.items : [];
  const groups = groupAuditItems(items);
  const summaryHtml = auditSummaryRows(summary).map(function (row) {
    return '<article class="audit-summary-card"><strong>' + escapeHtml(row[1] == null ? '-' : row[1]) + '</strong><span>' + escapeHtml(row[0]) + '</span></article>';
  }).join('');
  const groupHtml = Object.keys(groups).sort().map(function (issueType) {
    return '<span class="audit-group-chip">' + escapeHtml(issueType) + ': ' + groups[issueType].length + '</span>';
  }).join('');

  if (!items.length) {
    elements.taskList.innerHTML = [
      '<section class="audit-section">',
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
    '<div class="audit-summary-grid">' + summaryHtml + '</div>',
    '<div class="audit-groups" aria-label="Группы проблем">' + groupHtml + '</div>',
    '<div class="audit-items">',
    items.map(function (item) {
      return [
        '<article class="audit-card">',
        '<div>',
        '<div class="audit-card-title">' + escapeHtml(item.issueType) + ' · row ' + escapeHtml(item.rowNumber) + '</div>',
        '<div class="task-meta">Task ID: ' + escapeHtml(item.taskId || '-') + '</div>',
        '</div>',
        '<div class="audit-values">',
        '<span><strong>Сейчас:</strong> ' + escapeHtml(item.currentValue || '-') + '</span>',
        '<span><strong>Предложение:</strong> ' + escapeHtml(item.proposedValue || '-') + '</span>',
        '<span><strong>Действие:</strong> ' + escapeHtml(item.suggestedAction || 'REVIEW_REQUIRED') + '</span>',
        '<span><strong>Approval:</strong> ' + (item.needsLisaApproval ? 'Lisa required' : 'not required') + '</span>',
        '</div>',
        '<p>' + escapeHtml(item.notes || '') + '</p>',
        '</article>',
      ].join('');
    }).join(''),
    '</div>',
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

async function initializeDashboard() {
  formatBangkokTime();
  setInterval(formatBangkokTime, 30000);
  render();
  await loadOptionalLocalConfig();
  await loadDashboard();
}

initializeDashboard();
