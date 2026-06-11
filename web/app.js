const viewLabels = Object.freeze({
  dashboard: ['Dashboard', 'Executive operations overview'],
  myTasks: ['My Tasks', 'Lisa ownership, control dates and reportable work'],
  myFocus: ['My Focus', 'Personal focus queue derived from team operations'],
  team: ['Team', 'Employees, workload, blockers and reporting status'],
  departments: ['Departments', 'Department health, leads and dependencies'],
  dependencies: ['Dependencies / Blockers', 'Who is waiting for whom'],
  reports: ['Reports', 'Daily, weekly, department and executive summaries'],
  settings: ['Settings', 'Employees, roles, Telegram identity and permissions preview'],
  inbox: ['📥 Inbox', 'Новые задачи и входящий поток'],
  focus: ['🎯 Фокус', '3–5 задач, которые двигают день'],
  today: ['🔥 Today', 'Сроки, контроль и напоминания на сегодня'],
  documents: ['Документы', 'Документы, договоры и KYC'],
  communication: ['Коммуникация', 'Ответы, письма и касания'],
  presentations: ['Презентации', 'Деки, офферы и материалы'],
  brokers: ['Брокеры', 'Брокеры, партнёры и внешние касания'],
  waiting: ['⏰ Ждут ответа', 'Ожидания, контрольные даты и пуши'],
  all: ['📋 Все задачи', 'Фокус, очередь и быстрые действия'],
  completed: ['Завершённые', 'Архив, история и память для отчётов'],
  calendar: ['Календарь', 'Задачи по срокам и напоминаниям'],
  legacyReports: ['📈 Отчёты', 'Дневной и недельный отчёт'],
  mail: ['📬 Почта', 'Сверка писем и follow-up'],
  telegram: ['Telegram', 'Быстрые действия и уведомления'],
  system: ['⚙️ Настройки', 'Безопасный режим'],
});

const elements = {
  sidebarToggle: document.querySelector('#sidebarToggle'),
  sidebarShell: document.querySelector('#sidebarShell'),
  sidebarBackdrop: document.querySelector('#sidebarBackdrop'),
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
  { id: 'waiting', label: 'Ждут ответа' },
  { id: 'completed', label: 'Завершённые' },
]);

const categoryFilters = Object.freeze([
  { id: 'all', label: 'Все категории' },
  { id: 'documents', label: 'Документы' },
  { id: 'communication', label: 'Коммуникация' },
  { id: 'presentations', label: 'Презентации' },
  { id: 'brokers', label: 'Брокеры' },
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
  'all',
  'focus',
  'mail',
  'reports',
  'system',
]);

const reportTypes = Object.freeze({
  daySummary: {
    title: 'Итог дня',
    button: 'Создать отчёт',
  },
  dayPlan: {
    title: 'План дня',
    button: 'План дня',
  },
  weekly: {
    title: 'Недельный отчёт',
    button: 'Недельный отчёт',
  },
  telegram: {
    title: 'Telegram-ready',
    button: 'Telegram-ready',
  },
});

const gmailReconciliationFields = Object.freeze([
  ['actionOwner', 'Кто следующий владелец действия'],
  ['recommendedStatus', 'Рекомендуемый статус задачи'],
  ['nextAction', 'Следующий шаг после письма'],
  ['followUpDraft', 'Черновик follow-up без автоотправки'],
  ['confidence', 'Уверенность рекомендации'],
]);

const telegramPlannedActions = Object.freeze([
  ['openToday', 'Открыть задачи на сегодня', 'Планируется'],
  ['sendReportPreview', 'Отправить preview отчёта в Telegram', 'Только после подтверждения'],
  ['pushReminders', 'Пушить напоминания', 'Планируется'],
  ['taskStatusSync', 'Синхронизировать статусы задач', 'Планируется'],
]);

const workflowGroupLabels = Object.freeze({
  urgent: ['Срочно', 'Просрочено, сегодня, высокий приоритет'],
  active: ['В работе', 'Активная операционная работа'],
  waiting: ['Ждут ответа', 'Нужен ответ или подтверждение'],
  pushes: ['Пуши', 'Нужно следующее касание'],
  blockers: ['Блокеры', 'Нужна разблокировка'],
  review: ['Нужен разбор', 'Требуется разбор или очистка'],
});

const mfCurrentUserId = 'emp_lisa';

const mfEmployees = Object.freeze([
  {
    id: 'emp_lisa',
    name: 'Lisa',
    role: 'Operations lead',
    departmentId: 'dept_ops',
    telegram: '@lisa_ops',
    status: 'Active',
    reports: 'Daily ready',
  },
  {
    id: 'emp_teodor',
    name: 'Teodor',
    role: 'Manager',
    departmentId: 'dept_management',
    telegram: '@teodor_mf',
    status: 'Active',
    reports: 'Reviewing',
  },
  {
    id: 'emp_finance',
    name: 'Finance owner',
    role: 'Finance',
    departmentId: 'dept_finance',
    telegram: 'Pending map',
    status: 'Active',
    reports: 'Pending',
  },
  {
    id: 'emp_legal',
    name: 'Legal owner',
    role: 'Legal',
    departmentId: 'dept_legal',
    telegram: 'Pending map',
    status: 'Active',
    reports: 'Submitted',
  },
  {
    id: 'emp_sales',
    name: 'Sales lead',
    role: 'Real estate sales',
    departmentId: 'dept_sales',
    telegram: '@mf_sales',
    status: 'Active',
    reports: 'Pending',
  },
  {
    id: 'emp_marketing',
    name: 'Marketing lead',
    role: 'Presentations',
    departmentId: 'dept_marketing',
    telegram: '@mf_decks',
    status: 'Active',
    reports: 'Draft',
  },
  {
    id: 'emp_compliance',
    name: 'Compliance owner',
    role: 'Onboarding',
    departmentId: 'dept_compliance',
    telegram: 'Pending map',
    status: 'Active',
    reports: 'Blocked',
  },
]);

const mfDepartments = Object.freeze([
  { id: 'dept_ops', name: 'Operations', leadId: 'emp_lisa', status: 'Active', mission: 'Daily control loop, owners, blockers and reporting.' },
  { id: 'dept_management', name: 'Management', leadId: 'emp_teodor', status: 'Active', mission: 'Executive overview, escalation and priority decisions.' },
  { id: 'dept_finance', name: 'Finance', leadId: 'emp_finance', status: 'Active', mission: 'Payment flows, bank follow-ups and finance dependencies.' },
  { id: 'dept_legal', name: 'Legal', leadId: 'emp_legal', status: 'Active', mission: 'Agreement review, contract risk and approvals.' },
  { id: 'dept_sales', name: 'Sales / Real Estate', leadId: 'emp_sales', status: 'Active', mission: 'Developer, agency and real-estate partner pipeline.' },
  { id: 'dept_marketing', name: 'Marketing / Presentations', leadId: 'emp_marketing', status: 'Active', mission: 'Investor decks, offers and presentation materials.' },
  { id: 'dept_compliance', name: 'Compliance / Onboarding', leadId: 'emp_compliance', status: 'Active', mission: 'KYB, onboarding packets and source-of-funds checks.' },
]);

const mfTasks = Object.freeze([
  {
    id: 'MF-001',
    title: 'Sansiri agreement review',
    ownerId: 'emp_legal',
    requestedById: 'emp_teodor',
    departmentId: 'dept_legal',
    collaborators: ['emp_lisa', 'emp_sales'],
    watchers: ['emp_teodor'],
    company: 'Sansiri',
    project: 'Developer agreements',
    category: 'Legal',
    priority: 'High',
    status: 'Blocked',
    deadline: '2026-06-13',
    controlDate: '2026-06-11',
    reminderDate: '2026-06-11',
    dependencyOwnerId: 'emp_teodor',
    dependencyDepartmentId: 'dept_management',
    blockerType: 'Decision',
    blockerDescription: 'Commercial position needs manager confirmation before redlines are final.',
    nextAction: 'Confirm negotiation limits, then Legal can return the redline package.',
    reportable: true,
    source: 'Meeting',
    channel: 'Management sync',
    escalation: 'Needs Teodor today',
  },
  {
    id: 'MF-002',
    title: 'Bitazza KYB package',
    ownerId: 'emp_compliance',
    requestedById: 'emp_lisa',
    departmentId: 'dept_compliance',
    collaborators: ['emp_finance'],
    watchers: ['emp_teodor'],
    company: 'Bitazza',
    project: 'KYB onboarding',
    category: 'Compliance',
    priority: 'High',
    status: 'Waiting',
    deadline: '2026-06-14',
    controlDate: '2026-06-11',
    reminderDate: '2026-06-11',
    dependencyOwnerId: 'emp_finance',
    dependencyDepartmentId: 'dept_finance',
    blockerType: 'Info',
    blockerDescription: 'Waiting for final payment-flow explanation and bank document list.',
    nextAction: 'Finance to confirm payment flow wording and missing bank references.',
    reportable: true,
    source: 'Telegram',
    channel: 'Compliance chat',
    escalation: 'Control today',
  },
  {
    id: 'MF-003',
    title: 'MontAzur agency agreement',
    ownerId: 'emp_sales',
    requestedById: 'emp_lisa',
    departmentId: 'dept_sales',
    collaborators: ['emp_legal'],
    watchers: ['emp_teodor'],
    company: 'MontAzur',
    project: 'Agency agreements',
    category: 'Sales / Real Estate',
    priority: 'Medium',
    status: 'In progress',
    deadline: '2026-06-18',
    controlDate: '2026-06-12',
    reminderDate: '2026-06-12',
    dependencyOwnerId: 'emp_legal',
    dependencyDepartmentId: 'dept_legal',
    blockerType: 'Approval',
    blockerDescription: 'Legal needs to approve commission clause before partner send.',
    nextAction: 'Sales to attach latest draft and Legal to approve commission clause.',
    reportable: true,
    source: 'Web',
    channel: 'Partner pipeline',
    escalation: 'Normal',
  },
  {
    id: 'MF-004',
    title: 'Sber Private Phuket deck',
    ownerId: 'emp_marketing',
    requestedById: 'emp_teodor',
    departmentId: 'dept_marketing',
    collaborators: ['emp_sales', 'emp_lisa'],
    watchers: ['emp_teodor'],
    company: 'Sber Private',
    project: 'Phuket investor deck',
    category: 'Presentations',
    priority: 'High',
    status: 'In progress',
    deadline: '2026-06-12',
    controlDate: '2026-06-11',
    reminderDate: '2026-06-11',
    dependencyOwnerId: 'emp_sales',
    dependencyDepartmentId: 'dept_sales',
    blockerType: 'Info',
    blockerDescription: 'Waiting for updated villa availability and pricing bullets.',
    nextAction: 'Sales to send latest availability; Marketing finalizes executive deck.',
    reportable: true,
    source: 'Meeting',
    channel: 'Deck request',
    escalation: 'Due tomorrow',
  },
  {
    id: 'MF-005',
    title: 'Payment flow clarification',
    ownerId: 'emp_finance',
    requestedById: 'emp_compliance',
    departmentId: 'dept_finance',
    collaborators: ['emp_lisa'],
    watchers: ['emp_teodor'],
    company: 'Bitazza',
    project: 'KYB onboarding',
    category: 'Finance',
    priority: 'High',
    status: 'Overdue',
    deadline: '2026-06-10',
    controlDate: '2026-06-10',
    reminderDate: '2026-06-11',
    dependencyOwnerId: 'emp_teodor',
    dependencyDepartmentId: 'dept_management',
    blockerType: 'Decision',
    blockerDescription: 'Need approved wording for cross-border payment explanation.',
    nextAction: 'Finance drafts final explanation and Teodor approves the wording.',
    reportable: true,
    source: 'Telegram',
    channel: 'Finance chat',
    escalation: 'Escalated',
  },
  {
    id: 'MF-006',
    title: 'Bank onboarding follow-up',
    ownerId: 'emp_lisa',
    requestedById: 'emp_teodor',
    departmentId: 'dept_ops',
    collaborators: ['emp_finance', 'emp_compliance'],
    watchers: ['emp_teodor'],
    company: 'Private bank',
    project: 'Bank onboarding',
    category: 'Operations',
    priority: 'Medium',
    status: 'Waiting',
    deadline: '2026-06-17',
    controlDate: '2026-06-11',
    reminderDate: '2026-06-11',
    dependencyOwnerId: 'emp_finance',
    dependencyDepartmentId: 'dept_finance',
    blockerType: 'External',
    blockerDescription: 'Waiting for bank confirmation on next onboarding slot.',
    nextAction: 'Lisa to send follow-up and update Finance/Compliance when bank replies.',
    reportable: true,
    source: 'Email',
    channel: 'Bank thread',
    escalation: 'Control today',
  },
  {
    id: 'MF-007',
    title: 'Weekly report collection',
    ownerId: 'emp_lisa',
    requestedById: 'emp_teodor',
    departmentId: 'dept_ops',
    collaborators: ['emp_finance', 'emp_legal', 'emp_sales', 'emp_marketing', 'emp_compliance'],
    watchers: ['emp_teodor'],
    company: 'MF Group',
    project: 'Weekly management report',
    category: 'Reports',
    priority: 'High',
    status: 'In progress',
    deadline: '2026-06-14',
    controlDate: '2026-06-12',
    reminderDate: '2026-06-12',
    dependencyOwnerId: 'emp_finance',
    dependencyDepartmentId: 'dept_finance',
    blockerType: 'Report',
    blockerDescription: 'Finance and Sales summaries are still pending.',
    nextAction: 'Collect pending department summaries and prepare manager executive summary.',
    reportable: true,
    source: 'Web',
    channel: 'Reports',
    escalation: 'Pending reports',
  },
  {
    id: 'MF-008',
    title: 'Marketing weekly materials update',
    ownerId: 'emp_marketing',
    requestedById: 'emp_lisa',
    departmentId: 'dept_marketing',
    collaborators: [],
    watchers: ['emp_teodor'],
    company: 'MF Group',
    project: 'Weekly management report',
    category: 'Presentations',
    priority: 'Low',
    status: 'Done',
    deadline: '2026-06-09',
    controlDate: '2026-06-09',
    reminderDate: '',
    dependencyOwnerId: '',
    dependencyDepartmentId: '',
    blockerType: 'None',
    blockerDescription: '',
    nextAction: 'Summary sent to Operations for weekly report.',
    reportable: true,
    source: 'Web',
    channel: 'Reports',
    escalation: 'Closed',
  },
]);

const mfReportRows = Object.freeze([
  { type: 'Individual daily', owner: 'Lisa', period: '2026-06-11', status: 'Draft ready', summary: 'Bank onboarding, report collection and cross-department controls.' },
  { type: 'Individual weekly', owner: 'Finance owner', period: '2026-06-08 - 2026-06-14', status: 'Pending', summary: 'Payment flow clarification and bank onboarding inputs still open.' },
  { type: 'Department summary', owner: 'Legal', period: '2026-06-08 - 2026-06-14', status: 'Submitted', summary: 'Sansiri and MontAzur agreement risk items ready for manager review.' },
  { type: 'Manager executive summary', owner: 'Teodor', period: '2026-06-08 - 2026-06-14', status: 'Placeholder', summary: 'Executive summary will aggregate blockers, overdue items and department status.' },
]);

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

let activeTab = 'dashboard';
let activeTaskFilter = 'all';
let activeCategoryFilter = 'all';
let taskSearchQuery = '';
let activeAuditFilter = 'all';
let sidebarOpen = false;
let manualFocusTaskIds = {};
let reportPreview = { type: 'daySummary', text: '' };
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
      || source.includes('ea fox web')
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

function mfEmployee(employeeId) {
  return mfEmployees.find(function (employee) {
    return employee.id === employeeId;
  }) || {};
}

function mfDepartment(departmentId) {
  return mfDepartments.find(function (department) {
    return department.id === departmentId;
  }) || {};
}

function mfOpenTasks() {
  return mfTasks.filter(function (task) {
    return !['Done', 'Archived', 'Canceled'].includes(task.status);
  });
}

function mfBlockedTasks() {
  return mfOpenTasks().filter(function (task) {
    return ['Blocked', 'Overdue'].includes(task.status) || normalizeText(task.blockerType) !== 'none';
  });
}

function mfOverdueTasks() {
  const today = todayIsoBangkok();
  return mfOpenTasks().filter(function (task) {
    return task.status === 'Overdue' || (task.deadline && task.deadline < today) || (task.controlDate && task.controlDate < today);
  });
}

function mfControlTodayTasks() {
  const today = todayIsoBangkok();
  return mfOpenTasks().filter(function (task) {
    return task.controlDate === today || task.reminderDate === today;
  });
}

function mfWaitingTasks() {
  return mfOpenTasks().filter(function (task) {
    return task.status === 'Waiting' || task.blockerType === 'External' || task.dependencyDepartmentId;
  });
}

function mfReportableTasks() {
  return mfTasks.filter(function (task) {
    return task.reportable === true;
  });
}

function mfTasksForEmployee(employeeId) {
  return mfTasks.filter(function (task) {
    return task.ownerId === employeeId || (Array.isArray(task.collaborators) && task.collaborators.includes(employeeId));
  });
}

function mfTasksForDepartment(departmentId) {
  return mfTasks.filter(function (task) {
    return task.departmentId === departmentId;
  });
}

function mfDependencyDepartmentName(task) {
  return mfDepartment(task.dependencyDepartmentId).name || 'None';
}

function mfOwnerName(task) {
  return mfEmployee(task.ownerId).name || 'Unassigned';
}

function mfDepartmentName(task) {
  return mfDepartment(task.departmentId).name || 'Unassigned';
}

function mfStatusTone(task) {
  if (task.status === 'Overdue') return 'critical';
  if (task.status === 'Blocked') return 'critical';
  if (task.status === 'Waiting') return 'waiting';
  if (task.status === 'Done') return 'done';
  return 'active';
}

function mfMetricCards() {
  const open = mfOpenTasks();
  return [
    { label: 'Open tasks', value: open.length, tone: 'cyan' },
    { label: 'Control today', value: mfControlTodayTasks().length, tone: 'green' },
    { label: 'Overdue', value: mfOverdueTasks().length, tone: 'critical' },
    { label: 'Blockers', value: mfBlockedTasks().length, tone: 'critical' },
    { label: 'Waiting departments', value: new Set(mfWaitingTasks().map(function (task) { return task.dependencyDepartmentId; }).filter(Boolean)).size, tone: 'cyan' },
    { label: 'Reports pending', value: mfReportRows.filter(function (report) { return ['Pending', 'Draft ready', 'Placeholder'].includes(report.status); }).length, tone: 'green' },
    { label: 'Reportable', value: mfReportableTasks().length, tone: 'cyan' },
    { label: 'Departments', value: mfDepartments.length, tone: 'green' },
  ];
}

function navCountForTab(tabName) {
  if (dashboardState.status === 'loading') {
    return '...';
  }
  const counts = {
    dashboard: mfOpenTasks().length,
    myTasks: mfTasksForEmployee(mfCurrentUserId).filter(function (task) { return task.status !== 'Done'; }).length,
    myFocus: mfTasksForEmployee(mfCurrentUserId).filter(function (task) { return task.priority === 'High' || task.controlDate === todayIsoBangkok() || task.status === 'Overdue'; }).length,
    team: mfEmployees.length,
    departments: mfDepartments.length,
    dependencies: mfBlockedTasks().length,
    reports: mfReportRows.length,
    settings: '',
    inbox: inboxTasks().length,
    focus: focusTasks().length,
    today: derivedTodayTasks().length,
    documents: documentTasks().length,
    communication: communicationTasks().length,
    presentations: presentationTasks().length,
    brokers: brokerTasks().length,
    waiting: waitListTasks().length,
    all: allLoadedTasks().length,
    completed: completedTasks().length,
    calendar: allLoadedTasks().length,
    legacyReports: completedThisWeekTasks().length,
    mail: '',
    telegram: '',
    system: '',
  };
  return counts[tabName];
}

function taskSectionKey(task) {
  const category = normalizeText(task.category || task.taskType);
  if (textHasAny(category, ['documents', 'document', 'документы', 'документ'])) {
    return 'documents';
  }
  if (textHasAny(category, ['communication', 'mail', 'email', 'коммуникация', 'почта'])) {
    return 'communication';
  }
  if (textHasAny(category, ['presentations', 'presentation', 'презентации', 'презентация'])) {
    return 'presentations';
  }
  if (textHasAny(category, ['brokers', 'broker', 'брокеры', 'брокер'])) {
    return 'brokers';
  }
  if (textHasAny(category, ['waiting', 'reminder', 'reminders', 'waiting reply', 'ожидание', 'напомнить'])) {
    return 'waiting';
  }
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
    return 'waiting';
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
    return allLoadedTasks();
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
    ? '<strong>MF Group mock fallback</strong><span>' + escapeHtml(dashboardState.message || cleanupAuditState.message || 'Live source unavailable. Showing read-only MF mock data.') + '</span>'
    : isMock
      ? '<strong>MF Group mock mode</strong><span>Read-only design preview. No Sheet migration, writes, Telegram, Gmail, or Apps Script changes.</span>'
      : safeWritesEnabled()
        ? '<strong>БЕЗОПАСНАЯ ЗАПИСЬ ВКЛЮЧЕНА</strong><span>Доступны только безопасное создание, статус, напоминание и обновление этапа.</span>'
        : '<strong>ТОЛЬКО ЧТЕНИЕ</strong><span>Данные загружены только для просмотра. Безопасные действия отключены.</span>';
}

function renderCreateTaskButton() {
  const loading = dashboardState.status === 'loading' || scaffoldState.status === 'loading';
  elements.createTaskButton.disabled = loading || !safeWritesEnabled();
  elements.writeModePill.textContent = safeWritesEnabled() ? 'Safe write enabled' : 'Read-only mock';
  elements.createTaskButton.textContent = safeWritesEnabled() ? '+ New task' : 'Read-only mock';
  elements.createTaskButton.title = safeWritesEnabled()
    ? 'Создать новую задачу'
    : 'Stage 19 is mock/read-only. Existing safe-write code remains isolated behind runtime flags.';
}

function renderSummary() {
  if (dashboardState.status === 'loading') {
    elements.summaryCards.innerHTML = ['Open tasks', 'Control today', 'Blockers', 'Reports'].map(function (label) {
      return '<article class="summary-card loading"><strong>...</strong><span>' + label + '</span></article>';
    }).join('');
    return;
  }

  const cards = mfMetricCards();

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
  if (activeTab === 'dashboard') {
    return 'Read-only executive overview built from Stage 19 mock data. It does not read or write the future Team Tasks schema yet.';
  }
  if (activeTab === 'myTasks') {
    return 'Lisa view: owned and collaborated work, preserving individualization inside the team operations model.';
  }
  if (activeTab === 'myFocus') {
    return 'Personal focus is derived from priority, blockers and control dates, not a new writable field.';
  }
  if (activeTab === 'team') {
    return 'Team view shows mock employee workload, blockers, waiting items and report status.';
  }
  if (activeTab === 'departments') {
    return 'Department cards show lead, open work, blockers and cross-department dependencies.';
  }
  if (activeTab === 'dependencies') {
    return 'Dependencies and blockers show who is waiting for whom, blocker type, control date and escalation.';
  }
  if (activeTab === 'settings') {
    return 'Settings is a placeholder for employees, departments, roles, Telegram identity mapping and permissions.';
  }
  if (activeTab === 'system') {
    return 'Настройки показывают состояние live read, safe writes и отключенной автоматизации.';
  }
  if (activeTab === 'inbox') {
    return 'Inbox собирает новые и неразобранные задачи. Они не попадают в Today, пока не появится срок или контрольная дата.';
  }
  if (activeTab === 'focus') {
    return 'Фокус показывает максимум 5 задач: просрочено, сегодня, высокий приоритет, блокер, пуш или ручная отметка.';
  }
  if (activeTab === 'today') {
    return 'Today показывает только просроченные, due today, control date today и reminder today задачи.';
  }
  if (activeTab === 'all') {
    return 'Все задачи — главный рабочий экран: фокус дня, быстрые действия, поиск и фильтры категорий.';
  }
  if (activeTab === 'reports') {
    return 'Reports генерирует локальный preview. PDF, Sheets-запись и отправка выполняются только отдельным подтверждённым шагом.';
  }
  if (activeTab === 'mail') {
    return 'Сверка почты пока запускается через ChatGPT. После анализа можно обновить задачи и follow-up.';
  }
  if (activeTab === 'telegram') {
    return 'Telegram-интеграции подготовлены как план. Автоотправки и bot token здесь не добавляются.';
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
  if (filterId === 'all') return true;
  if (filterId === 'waiting') return isWaitingTask(task) || taskSectionKey(task) === 'waiting';
  if (filterId === 'completed') return isFinalTask(task);
  return true;
}

function taskMatchesCategoryFilter(task) {
  if (activeCategoryFilter === 'all') {
    return true;
  }
  return taskSectionKey(task) === activeCategoryFilter;
}

function taskMatchesSearch(task) {
  const query = normalizeText(taskSearchQuery);
  if (!query) {
    return true;
  }
  return taskSearchText(task).includes(query);
}

function shouldShowWorkspaceControls() {
  return activeTab === 'all';
}

function taskFilterHtml(tasks) {
  if (!shouldShowWorkspaceControls() || activeTab === 'calendar') {
    return '';
  }
  const primaryFiltersHtml = '<div class="task-filters" aria-label="Фильтры задач">' + taskFilters.map(function (filter) {
    const count = tasks.filter(function (task) { return taskMatchesFilter(task, filter.id); }).length;
    const activeClass = filter.id === activeTaskFilter ? ' active' : '';
    return '<button class="task-filter' + activeClass + '" type="button" data-task-filter="' + escapeHtml(filter.id) + '">' + escapeHtml(filter.label) + ' <span>' + count + '</span></button>';
  }).join('') + '</div>';
  const categoryOptionsHtml = categoryFilters.map(function (filter) {
    const count = filter.id === 'all'
      ? tasks.length
      : tasks.filter(function (task) { return taskSectionKey(task) === filter.id; }).length;
    const selected = filter.id === activeCategoryFilter ? ' selected' : '';
    return '<option value="' + escapeHtml(filter.id) + '"' + selected + '>' + escapeHtml(filter.label) + ' · ' + count + '</option>';
  }).join('');
  return [
    primaryFiltersHtml,
    '<label class="category-filter">',
    '<span>Категория</span>',
    '<select id="categoryFilterSelect">' + categoryOptionsHtml + '</select>',
    '</label>',
  ].join('');
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
    '<div class="task-chip-row reminder-row" aria-label="Контрольная дата"><span class="chip-row-label">Контроль</span>' + reminderButtons + '<span class="chip-row-label muted">Выбор даты через обновление этапа</span></div>',
    '<button class="task-action chip focus-chip" type="button" data-task-focus="' + escapeHtml(task.id) + '">' + (isManualFocusTask(task) ? '✓ В фокусе' : 'В фокус') + '</button>',
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
    return taskMatchesFilter(task, activeTaskFilter) && taskMatchesCategoryFilter(task) && taskMatchesSearch(task);
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
    return taskMatchesFilter(task, activeTaskFilter) && taskMatchesCategoryFilter(task) && taskMatchesSearch(task);
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
    : '<article class="empty-state"><strong>Inbox пуст</strong><span>Новые задачи из EA FOX, Telegram, ChatGPT и Gmail будут появляться здесь для triage.</span></article>');
}

function renderFocus(tasks) {
  const visibleTasks = tasks.filter(taskMatchesSearch).slice(0, 5);
  const focusHtml = visibleTasks.length
    ? visibleTasks.map(taskCardHtml).join('')
    : '<article class="empty-state"><strong>Фокус пока пуст</strong><span>Отметьте задачу как фокус или дождитесь срочных сигналов.</span></article>';
  elements.taskList.innerHTML = [
    '<section class="focus-day">',
    '<div class="task-group-header"><div><h3>🎯 Фокус</h3><span>Максимум 5 задач: просрочено, сегодня, высокий приоритет, блокер, пуш или ручная отметка.</span></div><strong>' + visibleTasks.length + '/5</strong></div>',
    '<div class="task-group-list focus-list">' + focusHtml + '</div>',
    '</section>',
  ].join('');
}

function homeQuickActionsHtml() {
  return [
    '<section class="home-actions" aria-label="Быстрые действия">',
    '<button class="home-action primary" type="button" data-quick-action="newTask"><strong>Новая задача</strong><span>Быстро зафиксировать</span></button>',
    '<button class="home-action" type="button" data-quick-action="createReport"><strong>Создать отчёт</strong><span>Собрать предпросмотр</span></button>',
    '<button class="home-action" type="button" data-quick-action="checkMail"><strong>Сверить почту</strong><span>Проверить ответы</span></button>',
    '</section>',
  ].join('');
}

function focusOfDayHtml() {
  const items = focusTasks().slice(0, 5);
  const tasksHtml = items.length
    ? items.map(taskCardHtml).join('')
    : '<article class="empty-state"><strong>Фокус дня пуст</strong><span>EA FOX покажет здесь до пяти главных задач.</span></article>';
  return [
    '<section class="focus-day home-focus">',
    '<div class="task-group-header"><div><h3>🎯 Фокус дня</h3><span>Максимум 5 задач для управляемого дня.</span></div><strong>' + items.length + '/5</strong></div>',
    '<div class="task-group-list focus-list">' + tasksHtml + '</div>',
    '</section>',
  ].join('');
}

function renderAllTasks(visibleTasks) {
  const queueHtml = visibleTasks.length
    ? activeTaskFilter === 'completed'
      ? '<div class="task-group-list">' + visibleTasks.map(completedTaskCardHtml).join('') + '</div>'
      : taskGroupsHtml(visibleTasks)
    : [
      '<article class="empty-state">',
      '<strong>Ничего не найдено</strong>',
      '<span>Измените поиск или выберите другой фильтр.</span>',
      '</article>',
    ].join('');
  elements.taskList.innerHTML = [
    focusOfDayHtml(),
    homeQuickActionsHtml(),
    '<section class="all-task-queue">',
    '<div class="task-group-header"><div><h3>Очередь задач</h3><span>Категории работают как фильтры, а не отдельные разделы.</span></div><strong>' + visibleTasks.length + '</strong></div>',
    queueHtml,
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

function reportLine(task) {
  return '- ' + removeIsoDateNoise(task.title)
    + (task.organization ? ' / ' + task.organization : '')
    + (nextActionText(task) ? ' — ' + removeIsoDateNoise(nextActionText(task)) : '');
}

function buildReport(type) {
  const active = allOpenTasks().filter(function (task) { return !isFinalTask(task); });
  const done = reportableCompletedTasks();
  const today = derivedTodayTasks();
  const waiting = active.filter(isWaitingTask);
  const blockers = active.filter(isBlockerTask);
  const tomorrowFocus = focusTasks().slice(0, 5);
  const pushes = active.filter(isPushTask);
  const title = (reportTypes[type] || reportTypes.daySummary).title;

  if (type === 'dayPlan') {
    return [
      title + ' · ' + todayIsoBangkok(),
      '',
      reportSection('🎯 Фокус дня', tomorrowFocus, reportLine),
      '',
      reportSection('🔥 Сегодня', today, reportLine),
      '',
      reportSection('⏳ Ждут ответа', waiting, reportLine),
      '',
      reportSection('⚠️ Блокеры', blockers, reportLine),
    ].join('\n');
  }

  if (type === 'telegram') {
    return [
      'EA FOX · ' + title + ' · ' + todayIsoBangkok(),
      '',
      reportSection('✅ Готово', done, reportLine),
      '',
      reportSection('🎯 Фокус', tomorrowFocus, reportLine),
      '',
      reportSection('⏳ Ждём / пуши', waiting.concat(pushes), reportLine),
      '',
      'Отправка в Telegram не выполняется автоматически. Это только preview.',
    ].join('\n');
  }

  return [
    title + ' · ' + todayIsoBangkok(),
    '',
    reportSection(type === 'weekly' ? '✅ Готово за неделю' : '✅ Итог дня', done, reportLine),
    '',
    reportSection('🔄 В работе', active.filter(function (task) { return canonicalStatus(task) === 'active'; })),
    '',
    reportSection('⏳ Ждут ответа', waiting),
    '',
    reportSection('⚠️ Блокеры', blockers),
    '',
    reportSection('🎯 Фокус на завтра', tomorrowFocus),
  ].join('\n');
}

function renderReports() {
  const preview = reportPreview.text || buildReport('daySummary');
  const activeType = reportPreview.type || 'daySummary';
  const typeButtons = Object.keys(reportTypes).map(function (type) {
    const config = reportTypes[type];
    const buttonClass = type === activeType ? 'primary-button' : 'secondary-button';
    return '<button class="' + buttonClass + '" type="button" data-report-action="' + escapeHtml(type) + '">' + escapeHtml(config.button) + '</button>';
  }).join('');
  elements.taskList.innerHTML = [
    '<section class="reports-panel">',
    '<div class="integration-hero">',
    '<div><strong>Создать отчёт</strong><span>Локальный предпросмотр из задач, статусов и архива. Ничего не отправляется и не записывается без отдельного подтверждения.</span></div>',
    '</div>',
    '<div class="report-actions">',
    typeButtons,
    '</div>',
    '<div class="report-summary-grid">',
    '<article><strong>' + escapeHtml(reportableCompletedTasks().length) + '</strong><span>Готово</span></article>',
    '<article><strong>' + escapeHtml(allOpenTasks().length) + '</strong><span>Активные</span></article>',
    '<article><strong>' + escapeHtml(focusTasks().length) + '</strong><span>Фокус</span></article>',
    '</div>',
    '<pre class="report-preview">' + escapeHtml(preview) + '</pre>',
    '</section>',
  ].join('');
}

function renderMailWorkflow() {
  const schemaHtml = gmailReconciliationFields.map(function (field) {
    return '<article><strong>' + escapeHtml(field[0]) + '</strong><span>' + escapeHtml(field[1]) + '</span></article>';
  }).join('');
  elements.taskList.innerHTML = [
    '<section class="integration-panel">',
    '<div class="integration-hero">',
    '<div>',
    '<strong>Сверить почту</strong>',
    '<span>Сверка почты пока запускается через ChatGPT. После анализа можно обновить задачи и follow-up.</span>',
    '</div>',
    '<button class="primary-button" type="button" disabled>Сверить почту</button>',
    '</div>',
    '<div class="integration-grid">',
    '<article><strong>Без автоотправки</strong><span>EA FOX не отправляет письма и не добавляет Gmail secrets.</span></article>',
    '<article><strong>Результаты как draft</strong><span>Follow-up остается черновиком до подтверждения Lisa.</span></article>',
    '<article><strong>Обновление задач</strong><span>После анализа можно вручную обновить этап через editTask.</span></article>',
    '</div>',
    '<div class="integration-schema">',
    '<h3>Будущая структура reconciliation result</h3>',
    '<div class="integration-grid">' + schemaHtml + '</div>',
    '</div>',
    '</section>',
  ].join('');
}

function renderTelegramWorkflow() {
  const actionsHtml = telegramPlannedActions.map(function (action) {
    return [
      '<article>',
      '<strong>' + escapeHtml(action[1]) + '</strong>',
      '<span>' + escapeHtml(action[2]) + '</span>',
      '</article>',
    ].join('');
  }).join('');
  elements.taskList.innerHTML = [
    '<section class="integration-panel">',
    '<div class="integration-hero">',
    '<div>',
    '<strong>Telegram workflow</strong>',
    '<span>Интеграция подготовлена как план. Bot token, backend routes и автоотправка в этом stage не добавляются.</span>',
    '</div>',
    '<button class="secondary-button" type="button" disabled>Telegram отключён</button>',
    '</div>',
    '<div class="integration-grid">' + actionsHtml + '</div>',
    '<p class="integration-note">Telegram-ready отчёт можно сформировать в Reports как preview. Отправка будет отдельным подтверждённым действием в будущем stage.</p>',
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
  if (activeTab === 'mail') {
    renderMailWorkflow();
    return;
  }
  if (activeTab === 'telegram') {
    renderTelegramWorkflow();
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
        '<span>Этот раздел будет памятью для дневных и недельных отчётов. EA FOX загружает архив отдельно от рабочей панели.</span>',
        '</article>',
      ].join('');
      return;
    }
    renderEmpty();
    return;
  }

  if (!visibleTasks.length) {
    if (activeTab === 'all') {
      renderAllTasks(visibleTasks);
      return;
    }
    elements.taskList.innerHTML = [
      '<article class="empty-state">',
      '<strong>Ничего не найдено</strong>',
      '<span>Измените поиск или выберите другой фильтр.</span>',
      '</article>',
    ].join('');
    return;
  }

  if (activeTab === 'all') {
    renderAllTasks(visibleTasks);
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
      '<span>Это только чтение. EA FOX ничего не меняет в таблице.</span>',
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
  const explanation = '<p class="audit-explainer">Это только аудит. EA FOX ничего не меняет в таблице.</p>';

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

function mfPill(label, tone) {
  return '<span class="mf-pill ' + escapeHtml(tone || 'neutral') + '">' + escapeHtml(label) + '</span>';
}

function mfMiniStat(label, value, tone) {
  return '<article class="mf-mini-stat ' + escapeHtml(tone || '') + '"><strong>' + escapeHtml(value) + '</strong><span>' + escapeHtml(label) + '</span></article>';
}

function mfTaskCard(task) {
  const owner = mfOwnerName(task);
  const department = mfDepartmentName(task);
  const dependency = mfDependencyDepartmentName(task);
  return [
    '<article class="mf-task-card" data-tone="' + escapeHtml(mfStatusTone(task)) + '">',
    '<div class="mf-task-head">',
    '<div>',
    '<span class="mf-id">' + escapeHtml(task.id) + '</span>',
    '<h3>' + escapeHtml(task.title) + '</h3>',
    '</div>',
    mfPill(task.status, mfStatusTone(task)),
    '</div>',
    '<p>' + escapeHtml(task.nextAction) + '</p>',
    '<div class="mf-task-meta">',
    '<span>Owner: <strong>' + escapeHtml(owner) + '</strong></span>',
    '<span>Department: <strong>' + escapeHtml(department) + '</strong></span>',
    '<span>Control: <strong>' + escapeHtml(task.controlDate || '-') + '</strong></span>',
    '<span>Deadline: <strong>' + escapeHtml(task.deadline || '-') + '</strong></span>',
    '<span>Waiting on: <strong>' + escapeHtml(dependency) + '</strong></span>',
    '<span>Channel: <strong>' + escapeHtml(task.channel || '-') + '</strong></span>',
    '</div>',
    task.blockerDescription ? '<div class="mf-blocker-note"><strong>' + escapeHtml(task.blockerType) + '</strong><span>' + escapeHtml(task.blockerDescription) + '</span></div>' : '',
    '</article>',
  ].join('');
}

function mfTaskList(tasks, emptyTitle, emptyText) {
  if (!tasks.length) {
    return '<article class="empty-state"><strong>' + escapeHtml(emptyTitle) + '</strong><span>' + escapeHtml(emptyText) + '</span></article>';
  }
  return '<div class="mf-task-list">' + tasks.map(mfTaskCard).join('') + '</div>';
}

function renderMfDashboard() {
  const blockers = mfBlockedTasks();
  const controlToday = mfControlTodayTasks();
  const waitingDepartments = Array.from(new Set(mfWaitingTasks().map(function (task) {
    return mfDependencyDepartmentName(task);
  }).filter(function (name) {
    return name && name !== 'None';
  })));
  const focusByDepartment = mfDepartments.map(function (department) {
    const tasks = mfTasksForDepartment(department.id).filter(function (task) { return task.status !== 'Done'; });
    const blocked = tasks.filter(function (task) { return ['Blocked', 'Overdue'].includes(task.status); });
    return [
      '<article class="mf-density-row">',
      '<div><strong>' + escapeHtml(department.name) + '</strong><span>' + escapeHtml(mfEmployee(department.leadId).name || 'No lead') + '</span></div>',
      '<div class="mf-density-bar"><span style="width: ' + Math.min(100, tasks.length * 18) + '%"></span></div>',
      '<em>' + tasks.length + ' open / ' + blocked.length + ' blocked</em>',
      '</article>',
    ].join('');
  }).join('');

  elements.taskList.innerHTML = [
    '<section class="mf-dashboard">',
    '<div class="mf-hero-grid">',
    '<article class="mf-exec-card">',
    '<span>Executive summary</span>',
    '<h3>Operations are moving, but Finance and Management decisions are constraining Compliance and Legal work.</h3>',
    '<p>Primary control today: payment-flow wording, Sansiri redline decision, Sber deck input, bank onboarding follow-up and weekly report collection.</p>',
    '<div class="mf-pill-row">',
    mfPill('Read-only mock', 'green'),
    mfPill('No schema migration', 'cyan'),
    mfPill('No Telegram writes', 'neutral'),
    '</div>',
    '</article>',
    '<div class="mf-mini-grid">',
    mfMiniStat('Control today', controlToday.length, 'green'),
    mfMiniStat('Blockers', blockers.length, 'critical'),
    mfMiniStat('Waiting depts', waitingDepartments.length, 'cyan'),
    mfMiniStat('Reports pending', mfReportRows.filter(function (report) { return report.status === 'Pending'; }).length, 'green'),
    '</div>',
    '</div>',
    '<div class="mf-two-column">',
    '<section><div class="mf-section-title"><h3>Overdue / control today</h3><span>' + controlToday.length + '</span></div>' + mfTaskList(controlToday, 'No controls today', 'The mock control queue is empty.') + '</section>',
    '<section><div class="mf-section-title"><h3>Blockers</h3><span>' + blockers.length + '</span></div>' + mfTaskList(blockers, 'No blockers', 'No blockers in the mock dataset.') + '</section>',
    '</div>',
    '<section><div class="mf-section-title"><h3>Focus by owner / department</h3><span>' + mfDepartments.length + '</span></div><div class="mf-density-list">' + focusByDepartment + '</div></section>',
    '</section>',
  ].join('');
}

function renderMfMyTasks() {
  const tasks = mfTasksForEmployee(mfCurrentUserId);
  const owned = tasks.filter(function (task) { return task.ownerId === mfCurrentUserId && task.status !== 'Done'; });
  const reportable = tasks.filter(function (task) { return task.reportable; });
  elements.taskList.innerHTML = [
    '<section class="mf-page-grid">',
    '<div class="mf-mini-grid">',
    mfMiniStat('Owned open', owned.length, 'cyan'),
    mfMiniStat('Control today', owned.filter(function (task) { return task.controlDate === todayIsoBangkok(); }).length, 'green'),
    mfMiniStat('Reportable', reportable.length, 'green'),
    mfMiniStat('Collaborations', tasks.filter(function (task) { return task.ownerId !== mfCurrentUserId; }).length, 'cyan'),
    '</div>',
    '<section><div class="mf-section-title"><h3>Lisa tasks</h3><span>' + owned.length + '</span></div>' + mfTaskList(owned, 'No Lisa-owned tasks', 'The mock owner queue is empty.') + '</section>',
    '<section><div class="mf-section-title"><h3>My reportable tasks</h3><span>' + reportable.length + '</span></div>' + mfTaskList(reportable, 'No reportable tasks', 'Report source list is empty.') + '</section>',
    '</section>',
  ].join('');
}

function renderMfMyFocus() {
  const focus = mfTasksForEmployee(mfCurrentUserId).filter(function (task) {
    return task.status !== 'Done' && (task.priority === 'High' || task.controlDate === todayIsoBangkok() || task.status === 'Overdue' || task.status === 'Blocked');
  });
  elements.taskList.innerHTML = [
    '<section class="mf-page-grid">',
    '<article class="mf-exec-card compact">',
    '<span>Personal focus</span>',
    '<h3>Individualization stays: Lisa still has My Tasks, My Focus, My Reports and own controls.</h3>',
    '<p>This focus list is derived from mock team work and remains read-only in Stage 19.</p>',
    '</article>',
    mfTaskList(focus, 'No focus items', 'No priority, blocker or control-date items for Lisa.'),
    '</section>',
  ].join('');
}

function renderMfTeam() {
  const rows = mfEmployees.map(function (employee) {
    const tasks = mfTasksForEmployee(employee.id).filter(function (task) { return task.status !== 'Done'; });
    const blocked = tasks.filter(function (task) { return ['Blocked', 'Overdue'].includes(task.status); });
    const waiting = tasks.filter(function (task) { return task.status === 'Waiting'; });
    return [
      '<article class="mf-person-card">',
      '<div><strong>' + escapeHtml(employee.name) + '</strong><span>' + escapeHtml(employee.role) + ' · ' + escapeHtml(mfDepartment(employee.departmentId).name || '-') + '</span></div>',
      '<div class="mf-person-stats">',
      mfMiniStat('Tasks', tasks.length, 'cyan'),
      mfMiniStat('Blockers', blocked.length, blocked.length ? 'critical' : 'green'),
      mfMiniStat('Waiting', waiting.length, 'neutral'),
      '</div>',
      '<div class="mf-pill-row">' + mfPill(employee.reports, employee.reports === 'Pending' || employee.reports === 'Blocked' ? 'critical' : 'green') + mfPill(employee.telegram, employee.telegram === 'Pending map' ? 'neutral' : 'cyan') + '</div>',
      '</article>',
    ].join('');
  }).join('');
  elements.taskList.innerHTML = '<section class="mf-card-grid">' + rows + '</section>';
}

function renderMfDepartments() {
  const cards = mfDepartments.map(function (department) {
    const tasks = mfTasksForDepartment(department.id).filter(function (task) { return task.status !== 'Done'; });
    const blockers = tasks.filter(function (task) { return ['Blocked', 'Overdue'].includes(task.status); });
    const deps = tasks.filter(function (task) { return task.dependencyDepartmentId; });
    return [
      '<article class="mf-department-card">',
      '<div class="mf-task-head"><div><span class="mf-id">' + escapeHtml(department.id) + '</span><h3>' + escapeHtml(department.name) + '</h3></div>' + mfPill(department.status, 'green') + '</div>',
      '<p>' + escapeHtml(department.mission) + '</p>',
      '<div class="mf-task-meta">',
      '<span>Lead: <strong>' + escapeHtml(mfEmployee(department.leadId).name || '-') + '</strong></span>',
      '<span>Open tasks: <strong>' + tasks.length + '</strong></span>',
      '<span>Blockers: <strong>' + blockers.length + '</strong></span>',
      '<span>Dependencies: <strong>' + deps.length + '</strong></span>',
      '</div>',
      '</article>',
    ].join('');
  }).join('');
  elements.taskList.innerHTML = '<section class="mf-card-grid departments">' + cards + '</section>';
}

function renderMfDependencies() {
  const rows = mfBlockedTasks().map(function (task) {
    return [
      '<article class="mf-dependency-row" data-tone="' + escapeHtml(mfStatusTone(task)) + '">',
      '<div><span class="mf-id">' + escapeHtml(task.id) + '</span><strong>' + escapeHtml(task.title) + '</strong><em>' + escapeHtml(task.company) + '</em></div>',
      '<span>' + escapeHtml(mfOwnerName(task)) + '</span>',
      '<span>' + escapeHtml(mfDependencyDepartmentName(task)) + '</span>',
      '<span>' + escapeHtml(task.blockerType) + '</span>',
      '<span>' + escapeHtml(task.controlDate || '-') + '</span>',
      mfPill(task.escalation, mfStatusTone(task)),
      '</article>',
    ].join('');
  }).join('');
  elements.taskList.innerHTML = [
    '<section class="mf-dependencies">',
    '<div class="mf-dependency-header"><span>Task</span><span>Owner</span><span>Blocking department</span><span>Type</span><span>Control</span><span>Escalation</span></div>',
    rows,
    '</section>',
  ].join('');
}

function renderMfReports() {
  const rows = mfReportRows.map(function (report) {
    return [
      '<article class="mf-report-card">',
      '<div class="mf-task-head"><div><span class="mf-id">' + escapeHtml(report.type) + '</span><h3>' + escapeHtml(report.owner) + '</h3></div>' + mfPill(report.status, report.status === 'Pending' ? 'critical' : 'green') + '</div>',
      '<p>' + escapeHtml(report.summary) + '</p>',
      '<div class="mf-task-meta"><span>Period: <strong>' + escapeHtml(report.period) + '</strong></span><span>Source: <strong>Mock report records</strong></span></div>',
      '</article>',
    ].join('');
  }).join('');
  elements.taskList.innerHTML = [
    '<section class="mf-page-grid">',
    '<article class="mf-exec-card compact"><span>Reports</span><h3>Daily, weekly, department and executive summaries are preview placeholders.</h3><p>No report is generated, submitted, reviewed, written to Sheets or sent to Telegram in Stage 19.</p></article>',
    '<div class="mf-card-grid reports">' + rows + '</div>',
    '</section>',
  ].join('');
}

function renderMfSettings() {
  const roleRows = [
    ['employee', 'Own tasks, own reports, permitted shared work'],
    ['department_lead', 'Department tasks, assignments and report review'],
    ['manager', 'All departments, blockers, executive reports'],
    ['admin', 'Settings, identity mapping, audit and restore'],
  ].map(function (row) {
    return '<article class="mf-settings-row"><strong>' + escapeHtml(row[0]) + '</strong><span>' + escapeHtml(row[1]) + '</span></article>';
  }).join('');
  const identityRows = mfEmployees.map(function (employee) {
    return '<article class="mf-settings-row"><strong>' + escapeHtml(employee.name) + '</strong><span>Telegram: ' + escapeHtml(employee.telegram) + ' · Role: ' + escapeHtml(employee.role) + '</span></article>';
  }).join('');
  elements.taskList.innerHTML = [
    '<section class="mf-two-column settings">',
    '<section><div class="mf-section-title"><h3>Roles and permissions</h3><span>placeholder</span></div><div class="mf-settings-list">' + roleRows + '</div></section>',
    '<section><div class="mf-section-title"><h3>Telegram identity mapping</h3><span>placeholder</span></div><div class="mf-settings-list">' + identityRows + '</div></section>',
    '</section>',
  ].join('');
}

function renderMfSection() {
  elements.workspaceControls.innerHTML = '';
  if (activeTab === 'dashboard') {
    renderMfDashboard();
    return true;
  }
  if (activeTab === 'myTasks') {
    renderMfMyTasks();
    return true;
  }
  if (activeTab === 'myFocus') {
    renderMfMyFocus();
    return true;
  }
  if (activeTab === 'team') {
    renderMfTeam();
    return true;
  }
  if (activeTab === 'departments') {
    renderMfDepartments();
    return true;
  }
  if (activeTab === 'dependencies') {
    renderMfDependencies();
    return true;
  }
  if (activeTab === 'reports') {
    renderMfReports();
    return true;
  }
  if (activeTab === 'settings') {
    renderMfSettings();
    return true;
  }
  return false;
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
  if (renderMfSection()) {
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
  renderSidebarState();
  renderModeBanner();
  renderCreateTaskButton();
  renderSummary();
  renderPanel();
}

function renderSidebarState() {
  if (!elements.sidebarShell || !elements.sidebarToggle || !elements.sidebarBackdrop) {
    return;
  }
  document.body.classList.toggle('sidebar-open', sidebarOpen);
  elements.sidebarShell.setAttribute('aria-hidden', sidebarOpen ? 'false' : 'true');
  elements.sidebarToggle.setAttribute('aria-expanded', sidebarOpen ? 'true' : 'false');
  elements.sidebarBackdrop.hidden = !sidebarOpen;
}

function setSidebarOpen(open) {
  sidebarOpen = open === true;
  renderSidebarState();
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
  activeCategoryFilter = 'all';
  taskSearchQuery = '';
  flashMessage = '';
  elements.tabs.forEach(function (tab) {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  setSidebarOpen(false);
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

function openCreateTaskDatePicker(fieldName) {
  const input = elements.createTaskForm && elements.createTaskForm.elements[fieldName];
  if (!input) {
    return;
  }
  input.focus();
  if (typeof input.showPicker === 'function') {
    try {
      input.showPicker();
      return;
    } catch (error) {
      // Some browsers only allow showPicker during direct user gestures.
    }
  }
  input.click();
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
  const controlDate = String(formData.get('controlDate') || '').trim();
  return {
    title: String(formData.get('title') || '').trim(),
    organization: String(formData.get('organization') || '').trim(),
    category: String(formData.get('category') || '').trim(),
    status: String(formData.get('status') || '').trim(),
    priority: String(formData.get('priority') || '').trim(),
    nextAction: String(formData.get('nextAction') || '').trim(),
    deadline: controlDate,
    controlDate: controlDate,
    reminder: String(formData.get('reminder') || '').trim(),
    comment: String(formData.get('comment') || '').trim(),
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
  ['deadline', 'controlDate', 'reminder'].forEach(function (field) {
    if (payload[field] && !/^\d{4}-\d{2}-\d{2}$/.test(payload[field])) {
      missing.push(field === 'reminder' ? 'Напоминание' : 'Контрольная дата');
    }
  });
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
  if (tabName === 'completed' || tabName === 'calendar') {
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

elements.sidebarToggle.addEventListener('click', function () {
  setSidebarOpen(!sidebarOpen);
});

elements.sidebarBackdrop.addEventListener('click', function () {
  setSidebarOpen(false);
});

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && sidebarOpen) {
    setSidebarOpen(false);
  }
});

elements.tabBar.addEventListener('click', function (event) {
  const tab = event.target.closest('[data-tab]');
  if (!tab || !elements.tabBar.contains(tab)) {
    return;
  }
  event.preventDefault();
  setTab(tab.dataset.tab);
});

elements.tabs.forEach(function (tab) {
  tab.addEventListener('click', function (event) {
    event.preventDefault();
    setTab(tab.dataset.tab);
  });
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
    return;
  }
  if (event.target && event.target.matches('input[type="date"]')) {
    return;
  }
  const datePickerControl = event.target.closest('[data-date-picker-for]');
  if (datePickerControl && elements.createTaskModal.contains(datePickerControl)) {
    openCreateTaskDatePicker(datePickerControl.dataset.datePickerFor);
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

elements.workspaceControls.addEventListener('change', function (event) {
  if (event.target && event.target.id === 'categoryFilterSelect') {
    activeCategoryFilter = event.target.value || 'all';
    renderTasks();
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
  const quickActionButton = event.target.closest('[data-quick-action]');
  if (quickActionButton) {
    const action = quickActionButton.dataset.quickAction;
    if (action === 'newTask') {
      openCreateTaskModal();
    } else if (action === 'createReport') {
      reportPreview = {
        type: 'daySummary',
        text: buildReport('daySummary'),
      };
      setTab('reports');
    } else if (action === 'checkMail') {
      setTab('mail');
    }
    return;
  }

  const reportButton = event.target.closest('[data-report-action]');
  if (reportButton) {
    const reportType = reportButton.dataset.reportAction || 'daySummary';
    reportPreview = {
      type: reportType,
      text: buildReport(reportType),
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
    await refreshDashboardAfterAction(taskId, nextFocus ? 'Задача добавлена в фокус.' : 'Задача убрана из фокуса.');
  } catch (error) {
    if (error && error.code === 'SCHEMA_FIELD_MISSING') {
      taskActionState[taskId] = {
        status: 'success',
        message: 'Фокус сохранён локально. Для постоянной отметки нужна колонка focus в Tasks.',
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
      message: error && error.message ? error.message : 'Не удалось сохранить фокус.',
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
