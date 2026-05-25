const viewLabels = Object.freeze({
  today: ['Сегодня', 'Задачи на сегодня'],
  open: ['Открытые', 'Все открытые задачи'],
  pushes: ['Пуши', 'Ожидают следующего шага'],
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
  const isMock = dashboardState.isMock || scaffoldState.isMock;
  const failed = dashboardState.status === 'error' || scaffoldState.status === 'error';
  elements.modeBanner.className = 'mode-banner ' + (failed ? 'warning' : isMock ? 'mock' : 'live');
  elements.modeBanner.innerHTML = failed
    ? '<strong>Demo mode / mock data</strong><span>Read-only источник недоступен. Показаны безопасные демо-данные.</span>'
    : isMock
      ? '<strong>Demo mode / mock data</strong><span>Без подключения к рабочей таблице и без изменений задач.</span>'
      : '<strong>Read-only data</strong><span>Данные загружены только для просмотра.</span>';
}

function renderSummary() {
  if (dashboardState.status === 'loading') {
    elements.summaryCards.innerHTML = ['Сегодня', 'Открытые', 'Пуши', 'Режим'].map(function (label) {
      return '<article class="summary-card loading"><strong>...</strong><span>' + label + '</span></article>';
    }).join('');
    return;
  }

  const cards = [
    { value: summaryCount('today'), label: 'Сегодня' },
    { value: summaryCount('open'), label: 'Открытые' },
    { value: summaryCount('pushes'), label: 'Пуши' },
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

function renderPanel() {
  const label = viewLabels[activeTab];
  elements.panelEyebrow.textContent = label[0];
  elements.panelTitle.textContent = label[1];
  elements.panelBadge.textContent = dashboardState.isMock ? 'Demo / Read-only' : 'Read-only';
  elements.statusMessage.textContent = statusText();
  elements.statusMessage.classList.toggle('error', dashboardState.status === 'error' || scaffoldState.status === 'error');

  if (dashboardState.status === 'loading') {
    elements.taskList.innerHTML = '<article class="loading-state">Загружаю данные для просмотра...</article>';
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
  render();
  const states = await Promise.all([
    BAFoxClient.getDashboard(),
    BAFoxClient.getScaffoldInfo(),
  ]);
  dashboardState = states[0];
  scaffoldState = states[1];
  render();
}

elements.tabs.forEach(function (tab) {
  tab.addEventListener('click', function () {
    setTab(tab.dataset.tab);
  });
});

formatBangkokTime();
setInterval(formatBangkokTime, 30000);
loadDashboard();
