// Product owner: Liza Kiseleva. Product concept and workflow architecture for BA Fox / MF Group Tracker.
const viewLabels = Object.freeze({
  dashboard: ['Обзор', 'Что требует внимания руководителя'],
  myTasks: ['Мои задачи', 'Ответственность Lisa, контрольные даты и задачи для отчётов'],
  myFocus: ['Мой фокус', 'Личный фокус из командной операционной очереди'],
  team: ['Кто чем занят', 'Ответственные, нагрузка, блокеры и ожидания'],
  departments: ['Отделы / направления', 'Активная работа по временной модели направлений'],
  dependencies: ['Риски и зависшие', 'Просрочка, блокеры, ожидания и задачи без владельца'],
  reports: ['Отчёты', 'Дневные, недельные, отделовые и управленческие сводки'],
  settings: ['Настройки', 'Сотрудники, роли, Telegram и права доступа'],
  inbox: ['📥 Inbox', 'Новые задачи и входящий поток'],
  focus: ['🎯 Фокус', '3–5 задач, которые двигают день'],
  today: ['🔥 Today', 'Сроки, контроль и напоминания на сегодня'],
  documents: ['Документы', 'Документы, договоры и KYC'],
  communication: ['Коммуникация', 'Ответы, письма и касания'],
  presentations: ['Презентации', 'Деки, офферы и материалы'],
  brokers: ['Брокеры', 'Брокеры, партнёры и внешние касания'],
  waiting: ['⏰ Ждут ответа', 'Ожидания, контрольные даты и пуши'],
  all: ['📋 Все задачи', 'Все строки задач из dashboard/read API'],
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
  liveDataStatus: document.querySelector('#liveDataStatus'),
  liveStatusMessage: document.querySelector('#liveStatusMessage'),
  liveLastUpdated: document.querySelector('#liveLastUpdated'),
  liveDataSource: document.querySelector('#liveDataSource'),
  refreshDashboardButton: document.querySelector('#refreshDashboardButton'),
  writeModePill: document.querySelector('#writeModePill'),
  createTaskButton: document.querySelector('#createTaskButton'),
  createTaskModal: document.querySelector('#createTaskModal'),
  createTaskForm: document.querySelector('#createTaskForm'),
  createTaskMessage: document.querySelector('#createTaskMessage'),
  submitCreateTask: document.querySelector('#submitCreateTask'),
  cancelCreateTask: document.querySelector('#cancelCreateTask'),
  cancelCreateTaskTop: document.querySelector('#cancelCreateTaskTop'),
  createTaskSuccessModal: document.querySelector('#createTaskSuccessModal'),
  closeCreateTaskSuccess: document.querySelector('#closeCreateTaskSuccess'),
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
  { id: 'active', label: 'Активные' },
  { id: 'all', label: 'Все' },
  { id: 'completed', label: 'Выполненные' },
  { id: 'blocked', label: 'Блокеры' },
  { id: 'waiting', label: 'Ждут ответа' },
]);

const ownerFilters = Object.freeze([
  { id: 'all', label: 'Все ответственные' },
  { id: 'liza', label: 'Лиза' },
  { id: 'andrey', label: 'Андрей' },
  { id: 'daniil', label: 'Даниил' },
  { id: 'unassigned', label: 'Не назначено' },
]);

const directionFilters = Object.freeze([
  { id: 'all', label: 'Все отделы' },
  { id: 'management', label: 'Руководство', aliases: ['management', 'руководство', 'управление', 'teodor', 'theodor'] },
  { id: 'operations', label: 'Операции', aliases: ['operations', 'операции', 'ops', 'операц'] },
  { id: 'finance', label: 'Финансы / платежи', aliases: ['finance', 'финансы', 'платеж', 'платёж', 'bank', 'банк', 'kyb'] },
  { id: 'legal', label: 'Юридическое / compliance', aliases: ['legal', 'юрид', 'compliance', 'комплаенс', 'kyc', 'contract', 'договор', 'document', 'documents', 'документ'] },
  { id: 'sales', label: 'Продажи / партнёры', aliases: ['sales', 'продажи', 'partner', 'partners', 'партнер', 'партнёр', 'broker', 'brokers', 'брокер'] },
  { id: 'marketing', label: 'Маркетинг / презентации', aliases: ['marketing', 'маркетинг', 'presentation', 'presentations', 'презентац', 'deck', 'дек', 'offer'] },
  { id: 'product_it', label: 'Продукт / IT', aliases: ['product', 'продукт', 'it', 'айти', 'tech', 'web', 'app', 'qa'] },
  { id: 'admin_ea', label: 'Админ / EA', aliases: ['admin', 'админ', 'ea', 'assistant', 'отчёт', 'report', 'reminder', 'waiting', 'напомнить'] },
  { id: 'unassigned', label: 'Не назначено', aliases: [] },
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

const allowedWorkspaceDomain = 'mfstream.io';

const usersSheetColumns = Object.freeze([
  'userId',
  'email',
  'displayName',
  'title',
  'accessRole',
  'status',
  'department',
  'defaultOwnerLabel',
  'accentColor',
  'canSeeAll',
  'createdAt',
  'updatedAt',
]);

const accessRoleLabels = Object.freeze({
  admin: 'admin · полный доступ / системная настройка',
  executive: 'executive · полная видимость',
  member: 'member · свои задачи и участие',
  viewer: 'viewer · только просмотр',
});

const usersRegistry = Object.freeze([
  {
    userId: 'user_liza_kiseleva',
    email: 'TODO_LIZA@mfstream.io',
    displayName: 'Liza Kiseleva',
    title: 'Executive Support',
    accessRole: 'admin',
    status: 'active',
    department: 'Админ / EA',
    defaultOwnerLabel: 'Лиза',
    accentColor: 'green',
    canSeeAll: true,
  },
  {
    userId: 'user_andrey_zaytsev',
    email: 'TODO_ANDREY_ZAYTSEV@mfstream.io',
    displayName: 'Andrey Zaytsev',
    title: 'HRG',
    accessRole: 'member',
    status: 'active',
    department: 'Операции',
    defaultOwnerLabel: 'Андрей',
    accentColor: 'blue',
    canSeeAll: false,
  },
  {
    userId: 'user_teodor_shoshiashvili',
    email: 'TODO_TEODOR@mfstream.io',
    displayName: 'Teodor Shoshiashvili',
    title: 'Co-founder, CEO',
    accessRole: 'executive',
    status: 'active',
    department: 'Руководство',
    defaultOwnerLabel: 'Teodor',
    accentColor: 'cyan',
    canSeeAll: true,
  },
  {
    userId: 'user_andrey_branov',
    email: 'TODO_ANDREY_BRANOV@mfstream.io',
    displayName: 'Andrey Branov',
    title: 'Co-founder, Grusha Strategic',
    accessRole: 'executive',
    status: 'active',
    department: 'Руководство',
    defaultOwnerLabel: 'Andrey Branov',
    accentColor: 'violet',
    canSeeAll: true,
  },
  {
    userId: 'user_aleksandra_pamukhina',
    email: 'TODO_ALEKSANDRA@mfstream.io',
    displayName: 'Aleksandra Pamukhina',
    title: 'CBDO',
    accessRole: 'member',
    status: 'active',
    department: 'Продажи / партнёры',
    defaultOwnerLabel: 'Aleksandra',
    accentColor: 'magenta',
    canSeeAll: false,
  },
  {
    userId: 'user_daniil_lebedev',
    email: 'TODO_DANIIL@mfstream.io',
    displayName: 'Daniil Lebedev',
    title: 'Analyst & Engineer',
    accessRole: 'member',
    status: 'active',
    department: 'Продукт / IT',
    defaultOwnerLabel: 'Даниил',
    accentColor: 'cyan',
    canSeeAll: false,
  },
  {
    userId: 'user_karim_amirov',
    email: 'TODO_KARIM@mfstream.io',
    displayName: 'Karim Amirov',
    title: 'Product Owner · Grusha',
    accessRole: 'member',
    status: 'active',
    department: 'Продукт / IT',
    defaultOwnerLabel: 'Karim',
    accentColor: 'orange',
    canSeeAll: false,
  },
  {
    userId: 'user_ani_gevorgyan',
    email: 'TODO_ANI@mfstream.io',
    displayName: 'Ani Gevorgyan',
    title: 'Head of Operations',
    accessRole: 'member',
    status: 'active',
    department: 'Операции',
    defaultOwnerLabel: 'Ani',
    accentColor: 'green',
    canSeeAll: false,
  },
  {
    userId: 'user_vitaliy_sushkov',
    email: 'TODO_VITALIY@mfstream.io',
    displayName: 'Vitaliy Sushkov',
    title: 'CFO',
    accessRole: 'member',
    status: 'active',
    department: 'Финансы / платежи',
    defaultOwnerLabel: 'Vitaliy',
    accentColor: 'yellow',
    canSeeAll: false,
  },
  {
    userId: 'user_asya_sundareva',
    email: 'TODO_ASYA@mfstream.io',
    displayName: 'Asya Sundareva',
    title: 'Junior Operations · High Risk',
    accessRole: 'member',
    status: 'active',
    department: 'Операции',
    defaultOwnerLabel: 'Asya',
    accentColor: 'blue',
    canSeeAll: false,
  },
]);

const mfCurrentUserId = 'emp_lisa';

const identityStorageKey = 'mfGroupTracker.identityPrepared';
const personalizationStoragePrefix = 'mfGroupTracker.personalizationPreview';

const mfThemePresets = Object.freeze([
  { id: 'neon_dark', label: 'Neon dark', description: 'Тёмная операционная тема с неоновыми акцентами.' },
  { id: 'classic_dark', label: 'Classic dark', description: 'Более спокойная тёмная тема для долгой работы.' },
  { id: 'light', label: 'Light', description: 'Светлая тема для дневного просмотра.' },
]);

const mfAccentColors = Object.freeze([
  { id: 'cyan', label: 'Cyan' },
  { id: 'green', label: 'Green' },
  { id: 'blue', label: 'Blue' },
  { id: 'violet', label: 'Violet' },
  { id: 'yellow', label: 'Yellow' },
  { id: 'orange', label: 'Orange' },
  { id: 'magenta', label: 'Magenta' },
]);

const mfEmployees = Object.freeze([
  {
    id: 'emp_lisa',
    name: 'Lisa',
    role: 'Операционный лидер',
    departmentId: 'dept_ops',
    telegram: '@lisa_ops',
    status: 'Активна',
    reports: 'Дневной готов',
  },
  {
    id: 'emp_teodor',
    name: 'Teodor',
    role: 'Руководитель',
    departmentId: 'dept_management',
    telegram: '@teodor_mf',
    status: 'Активен',
    reports: 'На проверке',
  },
  {
    id: 'emp_finance',
    name: 'Ответственный за финансы',
    role: 'Финансы',
    departmentId: 'dept_finance',
    telegram: 'Нужно связать',
    status: 'Активен',
    reports: 'Ждём',
  },
  {
    id: 'emp_legal',
    name: 'Ответственный юрист',
    role: 'Юридический отдел',
    departmentId: 'dept_legal',
    telegram: 'Нужно связать',
    status: 'Активен',
    reports: 'Отправлен',
  },
  {
    id: 'emp_sales',
    name: 'Лидер продаж',
    role: 'Продажи недвижимости',
    departmentId: 'dept_sales',
    telegram: '@mf_sales',
    status: 'Активен',
    reports: 'Ждём',
  },
  {
    id: 'emp_marketing',
    name: 'Лидер маркетинга',
    role: 'Презентации',
    departmentId: 'dept_marketing',
    telegram: '@mf_decks',
    status: 'Активен',
    reports: 'Черновик',
  },
  {
    id: 'emp_compliance',
    name: 'Ответственный за комплаенс',
    role: 'Онбординг',
    departmentId: 'dept_compliance',
    telegram: 'Нужно связать',
    status: 'Активен',
    reports: 'Блокер',
  },
]);

const mfDepartments = Object.freeze([
  { id: 'dept_ops', name: 'Операции', leadId: 'emp_lisa', status: 'Активен', mission: 'Ежедневный контроль, ответственные, блокеры и отчётность.' },
  { id: 'dept_management', name: 'Руководство', leadId: 'emp_teodor', status: 'Активен', mission: 'Управленческий обзор, эскалации и приоритетные решения.' },
  { id: 'dept_finance', name: 'Финансы', leadId: 'emp_finance', status: 'Активен', mission: 'Платёжные потоки, банки и финансовые зависимости.' },
  { id: 'dept_legal', name: 'Юридический отдел', leadId: 'emp_legal', status: 'Активен', mission: 'Договоры, юридические риски и согласования.' },
  { id: 'dept_sales', name: 'Продажи / недвижимость', leadId: 'emp_sales', status: 'Активен', mission: 'Девелоперы, агентские договоры и партнёрская воронка.' },
  { id: 'dept_marketing', name: 'Маркетинг / презентации', leadId: 'emp_marketing', status: 'Активен', mission: 'Инвесторские деки, офферы и презентационные материалы.' },
  { id: 'dept_compliance', name: 'Комплаенс / онбординг', leadId: 'emp_compliance', status: 'Активен', mission: 'KYB, пакеты онбординга и проверки источников средств.' },
]);

let profileState = BAFoxClient.createLoadingState('profile');
profileState.status = 'idle';

let identityState = loadIdentityState();
let personalizationState = loadPersonalizationState();

const mfTasks = Object.freeze([
  {
    id: 'MF-001',
    title: 'Проверка договора Sansiri',
    ownerId: 'emp_legal',
    requestedById: 'emp_teodor',
    departmentId: 'dept_legal',
    collaborators: ['emp_lisa', 'emp_sales'],
    watchers: ['emp_teodor'],
    company: 'Sansiri',
    project: 'Договоры с девелоперами',
    category: 'Юридический отдел',
    priority: 'Высокий',
    status: 'Блокер',
    deadline: '2026-06-13',
    controlDate: '2026-06-11',
    reminderDate: '2026-06-11',
    dependencyOwnerId: 'emp_teodor',
    dependencyDepartmentId: 'dept_management',
    blockerType: 'Решение',
    blockerDescription: 'Коммерческую позицию нужно подтвердить у руководства до финальной версии правок.',
    nextAction: 'Подтвердить границы переговоров, после этого юристы вернут пакет правок.',
    reportable: true,
    source: 'Встреча',
    channel: 'Синк руководства',
    escalation: 'Нужен Teodor сегодня',
  },
  {
    id: 'MF-002',
    title: 'KYB-пакет Bitazza',
    ownerId: 'emp_compliance',
    requestedById: 'emp_lisa',
    departmentId: 'dept_compliance',
    collaborators: ['emp_finance'],
    watchers: ['emp_teodor'],
    company: 'Bitazza',
    project: 'KYB-онбординг',
    category: 'Комплаенс',
    priority: 'Высокий',
    status: 'Ждём',
    deadline: '2026-06-14',
    controlDate: '2026-06-11',
    reminderDate: '2026-06-11',
    dependencyOwnerId: 'emp_finance',
    dependencyDepartmentId: 'dept_finance',
    blockerType: 'Инфо',
    blockerDescription: 'Ждём финальное описание платёжного потока и список банковских документов.',
    nextAction: 'Финансы подтверждают формулировку платёжного потока и недостающие банковские ссылки.',
    reportable: true,
    source: 'Telegram',
    channel: 'Чат комплаенса',
    escalation: 'Контроль сегодня',
  },
  {
    id: 'MF-003',
    title: 'Агентский договор MontAzur',
    ownerId: 'emp_sales',
    requestedById: 'emp_lisa',
    departmentId: 'dept_sales',
    collaborators: ['emp_legal'],
    watchers: ['emp_teodor'],
    company: 'MontAzur',
    project: 'Агентские договоры',
    category: 'Продажи / недвижимость',
    priority: 'Средний',
    status: 'В работе',
    deadline: '2026-06-18',
    controlDate: '2026-06-12',
    reminderDate: '2026-06-12',
    dependencyOwnerId: 'emp_legal',
    dependencyDepartmentId: 'dept_legal',
    blockerType: 'Согласование',
    blockerDescription: 'Юристы должны согласовать пункт о комиссии до отправки партнёру.',
    nextAction: 'Продажи прикладывают последнюю версию, юристы согласуют пункт о комиссии.',
    reportable: true,
    source: 'Веб',
    channel: 'Партнёрская воронка',
    escalation: 'Обычный контроль',
  },
  {
    id: 'MF-004',
    title: 'Дек Sber Private Phuket',
    ownerId: 'emp_marketing',
    requestedById: 'emp_teodor',
    departmentId: 'dept_marketing',
    collaborators: ['emp_sales', 'emp_lisa'],
    watchers: ['emp_teodor'],
    company: 'Sber Private',
    project: 'Инвесторский дек Phuket',
    category: 'Презентации',
    priority: 'Высокий',
    status: 'В работе',
    deadline: '2026-06-12',
    controlDate: '2026-06-11',
    reminderDate: '2026-06-11',
    dependencyOwnerId: 'emp_sales',
    dependencyDepartmentId: 'dept_sales',
    blockerType: 'Инфо',
    blockerDescription: 'Ждём обновлённую доступность вилл и тезисы по ценам.',
    nextAction: 'Продажи отправляют актуальную доступность, маркетинг финализирует управленческий дек.',
    reportable: true,
    source: 'Встреча',
    channel: 'Запрос на дек',
    escalation: 'Дедлайн завтра',
  },
  {
    id: 'MF-005',
    title: 'Уточнение платёжного потока',
    ownerId: 'emp_finance',
    requestedById: 'emp_compliance',
    departmentId: 'dept_finance',
    collaborators: ['emp_lisa'],
    watchers: ['emp_teodor'],
    company: 'Bitazza',
    project: 'KYB-онбординг',
    category: 'Финансы',
    priority: 'Высокий',
    status: 'Просрочено',
    deadline: '2026-06-10',
    controlDate: '2026-06-10',
    reminderDate: '2026-06-11',
    dependencyOwnerId: 'emp_teodor',
    dependencyDepartmentId: 'dept_management',
    blockerType: 'Решение',
    blockerDescription: 'Нужна утверждённая формулировка для описания трансграничного платежа.',
    nextAction: 'Финансы готовят финальное описание, Teodor утверждает формулировку.',
    reportable: true,
    source: 'Telegram',
    channel: 'Финансовый чат',
    escalation: 'Эскалировано',
  },
  {
    id: 'MF-006',
    title: 'Follow-up по банковскому онбордингу',
    ownerId: 'emp_lisa',
    requestedById: 'emp_teodor',
    departmentId: 'dept_ops',
    collaborators: ['emp_finance', 'emp_compliance'],
    watchers: ['emp_teodor'],
    company: 'Private bank',
    project: 'Банковский онбординг',
    category: 'Операции',
    priority: 'Средний',
    status: 'Ждём',
    deadline: '2026-06-17',
    controlDate: '2026-06-11',
    reminderDate: '2026-06-11',
    dependencyOwnerId: 'emp_finance',
    dependencyDepartmentId: 'dept_finance',
    blockerType: 'Внешнее',
    blockerDescription: 'Ждём подтверждение банка по следующему слоту онбординга.',
    nextAction: 'Lisa отправляет follow-up и обновляет финансы/комплаенс после ответа банка.',
    reportable: true,
    source: 'Email',
    channel: 'Банковская переписка',
    escalation: 'Контроль сегодня',
  },
  {
    id: 'MF-007',
    title: 'Сбор недельных отчётов',
    ownerId: 'emp_lisa',
    requestedById: 'emp_teodor',
    departmentId: 'dept_ops',
    collaborators: ['emp_finance', 'emp_legal', 'emp_sales', 'emp_marketing', 'emp_compliance'],
    watchers: ['emp_teodor'],
    company: 'MF Group',
    project: 'Недельный управленческий отчёт',
    category: 'Отчёты',
    priority: 'Высокий',
    status: 'В работе',
    deadline: '2026-06-14',
    controlDate: '2026-06-12',
    reminderDate: '2026-06-12',
    dependencyOwnerId: 'emp_finance',
    dependencyDepartmentId: 'dept_finance',
    blockerType: 'Отчёт',
    blockerDescription: 'Сводки финансов и продаж ещё не сданы.',
    nextAction: 'Собрать недостающие сводки отделов и подготовить управленческое резюме.',
    reportable: true,
    source: 'Веб',
    channel: 'Отчёты',
    escalation: 'Ждём отчёты',
  },
  {
    id: 'MF-008',
    title: 'Обновление недельных материалов маркетинга',
    ownerId: 'emp_marketing',
    requestedById: 'emp_lisa',
    departmentId: 'dept_marketing',
    collaborators: [],
    watchers: ['emp_teodor'],
    company: 'MF Group',
    project: 'Недельный управленческий отчёт',
    category: 'Презентации',
    priority: 'Низкий',
    status: 'Готово',
    deadline: '2026-06-09',
    controlDate: '2026-06-09',
    reminderDate: '',
    dependencyOwnerId: '',
    dependencyDepartmentId: '',
    blockerType: 'Нет',
    blockerDescription: '',
    nextAction: 'Сводка отправлена в операции для недельного отчёта.',
    reportable: true,
    source: 'Веб',
    channel: 'Отчёты',
    escalation: 'Закрыто',
  },
]);

const mfReportRows = Object.freeze([
  { type: 'Индивидуальный дневной', owner: 'Lisa', period: '2026-06-11', status: 'Черновик готов', summary: 'Банковский онбординг, сбор отчётов и межотдельные контрольные точки.' },
  { type: 'Индивидуальный недельный', owner: 'Ответственный за финансы', period: '2026-06-08 - 2026-06-14', status: 'Ждём', summary: 'Уточнение платёжного потока и вводные по банковскому онбордингу ещё открыты.' },
  { type: 'Сводка отдела', owner: 'Юридический отдел', period: '2026-06-08 - 2026-06-14', status: 'Отправлен', summary: 'Риски по договорам Sansiri и MontAzur готовы для проверки руководителем.' },
  { type: 'Управленческое резюме', owner: 'Teodor', period: '2026-06-08 - 2026-06-14', status: 'Заглушка', summary: 'Управленческое резюме будет собирать блокеры, просрочку и статус отделов.' },
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
let activeOwnerFilter = 'all';
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
let liveRefreshState = {
  status: 'loading',
  message: 'Обновляем данные…',
  source: 'Demo fallback',
  lastUpdatedAt: null,
  isForced: false,
};

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

function formatLastUpdatedTime(date) {
  if (!date) {
    return '--:--';
  }
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok',
  }).format(date);
}

function liveSourceLabel(state) {
  return state && state.isMock ? 'Demo fallback' : 'Live';
}

function updateLiveRefreshStateFromDashboard(state, options) {
  const settings = options || {};
  const failed = state.status === 'error';
  liveRefreshState = {
    status: failed ? 'error' : 'success',
    message: failed
      ? 'Не удалось обновить live-данные, показана последняя доступная версия / mock fallback'
      : 'Данные обновлены',
    source: liveSourceLabel(state),
    lastUpdatedAt: new Date(),
    isForced: Boolean(settings.isForced),
  };
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
  if (data.all && Array.isArray(data.all.tasks)) {
    return data.all.tasks;
  }
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

function ownerKey(value) {
  const owner = normalizeText(value);
  if (!owner) return 'unassigned';
  if (['не назначено', 'не назначен', 'unassigned'].some(function (signal) { return owner === signal; })) return 'unassigned';
  if (['lisa', 'liza kiseleva', 'лиза'].some(function (signal) { return owner === signal; })) return 'liza';
  if (['андрей', 'andrey', 'andrei', 'сотрудник 1', 'employee 1', 'employee_1'].some(function (signal) { return owner === signal; })) return 'andrey';
  if (['даниил', 'данил', 'daniil', 'danil', 'daniel', 'сотрудник 2', 'employee 2', 'employee_2'].some(function (signal) { return owner === signal; })) return 'daniil';
  return owner;
}

function ownerLabel(value) {
  const key = ownerKey(value);
  const option = ownerFilters.find(function (filter) {
    return filter.id === key;
  });
  return option && key !== 'all' ? option.label : (String(value || '').trim() || 'Не назначено');
}

function taskOwnerLabel(task) {
  return ownerLabel(task && task.owner);
}

function taskDirectionRawValue(task) {
  return String((task && (task.department || task.direction || task.category || task.taskType)) || '').trim();
}

function taskDirectionKey(task) {
  const raw = normalizeText(taskDirectionRawValue(task));
  if (!raw || raw === 'без категории' || raw === 'none' || raw === 'unassigned') {
    return 'unassigned';
  }
  const matched = directionFilters.find(function (direction) {
    if (direction.id === 'all' || direction.id === 'unassigned') {
      return false;
    }
    return direction.id === raw || direction.aliases.some(function (alias) {
      return raw.includes(alias);
    });
  });
  return matched ? matched.id : 'admin_ea';
}

function directionLabelByKey(key) {
  const direction = directionFilters.find(function (filter) {
    return filter.id === key;
  });
  return direction && key !== 'all' ? direction.label : 'Не назначено';
}

function taskDirectionLabel(task) {
  return directionLabelByKey(taskDirectionKey(task));
}

const statusLabels = Object.freeze({
  not_started: 'Не начато',
  in_progress: 'В работе',
  waiting: 'Ждём',
  push: 'Пуш',
  blocked: 'Блокер',
  done: 'Выполнено',
  external: 'Внешнее',
  unknown: 'Не уточнено',
});

const statusClasses = Object.freeze({
  not_started: 'neutral',
  in_progress: 'active',
  waiting: 'waiting',
  push: 'push',
  blocked: 'critical',
  done: 'done',
  external: 'external',
  unknown: 'neutral',
});

// Raw statuses can arrive from Google Sheets, Apps Script, or local mock data.
// UI logic should normalize them into stable keys; labels remain a separate display concern.
function normalizeStatus(rawStatus) {
  const status = normalizeText(rawStatus);
  if (!status) return 'unknown';
  if (['not started', 'not_started', 'todo', 'to do', 'new', 'не начато', 'не начата', 'новая'].some(function (signal) { return status === signal || status.includes(signal); })) return 'not_started';
  if (['in progress', 'in_progress', 'active', 'work', 'working', 'в работе', 'делаем', 'актив'].some(function (signal) { return status === signal || status.includes(signal); })) return 'in_progress';
  if (['waiting', 'wait', 'wait list', 'ждём', 'ждем', 'ожид', 'ждёт', 'ждет'].some(function (signal) { return status === signal || status.includes(signal); })) return 'waiting';
  if (['push', 'пуш'].some(function (signal) { return status === signal || status.includes(signal); })) return 'push';
  if (['blocked', 'blocker', 'блокер', 'заблок'].some(function (signal) { return status === signal || status.includes(signal); })) return 'blocked';
  if (['done', 'completed', 'complete', 'готово', 'выполнено', 'закрыто', 'closed'].some(function (signal) { return status === signal || status.includes(signal); })) return 'done';
  if (['external', 'внешнее', 'внешний', 'outside'].some(function (signal) { return status === signal || status.includes(signal); })) return 'external';
  return 'unknown';
}

function getStatusLabel(statusKey) {
  return statusLabels[statusKey] || statusLabels.unknown;
}

function getStatusClass(statusKey) {
  return statusClasses[statusKey] || statusClasses.unknown;
}

function taskStatusKey(task) {
  return normalizeStatus(task && task.status);
}

function reportStatusKey(report) {
  return normalizeStatus(report && report.status);
}

function isOverdueStatus(rawStatus) {
  const status = normalizeText(rawStatus);
  return status.includes('просроч') || status.includes('overdue');
}

function getTaskStatusLabel(task) {
  if (task && isOverdueStatus(task.status)) {
    return String(task.status || '').trim();
  }
  return getStatusLabel(taskStatusKey(task));
}

window.BAFoxStatusContract = Object.freeze({
  normalizeStatus: normalizeStatus,
  getStatusLabel: getStatusLabel,
  getStatusClass: getStatusClass,
});

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
  if (taskStatusKey(task) === 'done') return 'completed';
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
    task.owner,
    taskOwnerLabel(task),
    task.nextAction,
    task.steps,
    task.comment,
    task.comments,
    task.source,
    task.appSource,
    task.channel,
    task.category,
    taskDirectionLabel(task),
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
  if (taskStatusKey(task) === 'waiting') {
    return true;
  }
  const text = taskSearchText(task);
  return ['ждём ответ', 'ждем ответ', 'ждём подтверждение', 'ждём подписание', 'wait list', 'waiting', 'ожид'].some(function (signal) {
    return text.includes(signal);
  });
}

function isPushTask(task) {
  if (taskStatusKey(task) === 'push') {
    return true;
  }
  const category = normalizeText(task.category);
  const reminderMode = normalizeText(task.reminderMode);
  return category.includes('push') || reminderMode.includes('push');
}

function isBlockerTask(task) {
  return taskStatusKey(task) === 'blocked';
}

function isOverdueTask(task) {
  const today = todayIsoBangkok();
  const dueDate = taskDueDate(task);
  const controlDate = taskControlDate(task);
  return !isFinalTask(task) && (
    isOverdueStatus(task.status) || (dueDate && dueDate < today) || (controlDate && controlDate < today)
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
    return isWaitingTask(task);
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

function activeTasks() {
  return allLoadedTasks().filter(function (task) {
    return !isFinalTask(task);
  });
}

function tasksWithoutOwner(tasks) {
  return tasks.filter(function (task) {
    return ownerKey(task && task.owner) === 'unassigned';
  });
}

function tasksWithoutDirection(tasks) {
  return tasks.filter(function (task) {
    return taskDirectionKey(task) === 'unassigned';
  });
}

function tasksWithoutNextAction(tasks) {
  return tasks.filter(function (task) {
    const raw = String((task && (task.nextAction || task.steps || task.comment)) || '').trim();
    return !raw;
  });
}

function tasksWithoutControlDate(tasks) {
  return tasks.filter(function (task) {
    return !taskDueDate(task) && !taskControlDate(task);
  });
}

function blockedTasks(tasks) {
  return tasks.filter(isBlockerTask);
}

function waitingTasks(tasks) {
  return tasks.filter(isWaitingTask);
}

function overdueTasks(tasks) {
  return tasks.filter(isOverdueTask);
}

function stage30ManagementMetrics() {
  const loaded = allLoadedTasks();
  const active = activeTasks();
  const completed = loaded.filter(isCompletedStatus);
  return {
    active: active,
    completed: completed,
    overdue: overdueTasks(active),
    blockers: blockedTasks(active),
    waiting: waitingTasks(active),
    withoutOwner: tasksWithoutOwner(active),
    withoutDirection: tasksWithoutDirection(active),
    withoutNextAction: tasksWithoutNextAction(active),
    withoutControlDate: tasksWithoutControlDate(active),
  };
}

function ownerWorkloadRows(tasks) {
  return ownerFilters.filter(function (owner) {
    return owner.id !== 'all';
  }).map(function (owner) {
    const ownerTasks = tasks.filter(function (task) {
      return ownerKey(task && task.owner) === owner.id;
    });
    return {
      id: owner.id,
      label: owner.label,
      tasks: ownerTasks,
      active: ownerTasks.filter(function (task) { return !isFinalTask(task); }),
      blockers: ownerTasks.filter(isBlockerTask),
      waiting: ownerTasks.filter(isWaitingTask),
      overdue: ownerTasks.filter(isOverdueTask),
    };
  });
}

function directionWorkloadRows(tasks) {
  return directionFilters.filter(function (direction) {
    return direction.id !== 'all';
  }).map(function (direction) {
    const directionTasks = tasks.filter(function (task) {
      return taskDirectionKey(task) === direction.id;
    });
    return {
      id: direction.id,
      label: direction.label,
      tasks: directionTasks,
      active: directionTasks.filter(function (task) { return !isFinalTask(task); }),
      blockers: directionTasks.filter(isBlockerTask),
      waiting: directionTasks.filter(isWaitingTask),
      overdue: directionTasks.filter(isOverdueTask),
    };
  });
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

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function emailDomain(value) {
  const normalized = normalizeEmail(value);
  const parts = normalized.split('@');
  return parts.length === 2 ? parts[1] : '';
}

function findRegistryUserByEmail(email) {
  const normalized = normalizeEmail(email);
  return usersRegistry.find(function (user) {
    return normalizeEmail(user.email) === normalized;
  }) || null;
}

function identityStorageProfileKey() {
  return normalizeEmail(identityState && identityState.email) || 'not_signed_in';
}

function personalizationStorageKey() {
  return personalizationStoragePrefix + '.' + identityStorageProfileKey();
}

function loadIdentityState() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(identityStorageKey) || '{}');
    const email = normalizeEmail(stored.email);
    const registryUser = findRegistryUserByEmail(email);
    if (!email || emailDomain(email) !== allowedWorkspaceDomain || !registryUser) {
      return {
        status: 'prepared',
        email: '',
        displayName: '',
        registryUser: null,
        message: 'Google-вход готовится. Доступ пока не защищён этим экраном.',
      };
    }
    return {
      status: 'signed_in_preview',
      email: email,
      displayName: registryUser.displayName,
      registryUser: registryUser,
      message: 'Профиль найден локально. Backend enforcement ещё не включён.',
    };
  } catch (error) {
    return {
      status: 'prepared',
      email: '',
      displayName: '',
      registryUser: null,
      message: 'Google-вход готовится. Доступ пока не защищён этим экраном.',
    };
  }
}

function identityDisplayProfile() {
  const fallbackUser = usersRegistry[0];
  const backendProfileData = profileState.status === 'success' && profileState.data ? profileState.data : null;
  const backendProfile = backendProfileData && backendProfileData.profile ? backendProfileData.profile : null;
  const registryUser = identityState.registryUser || fallbackUser;
  const profileEmail = backendProfile && backendProfile.email ? backendProfile.email : identityState.email;
  return {
    isSignedIn: Boolean(backendProfile && backendProfile.isAuthenticated) || identityState.status === 'signed_in_preview',
    email: profileEmail || 'не выполнен вход',
    domain: profileEmail ? emailDomain(profileEmail) : (backendProfileData && backendProfileData.allowedDomain) || allowedWorkspaceDomain,
    displayName: backendProfile && backendProfile.displayName ? backendProfile.displayName : identityState.displayName || registryUser.displayName,
    title: backendProfile && backendProfile.title ? backendProfile.title : registryUser.title,
    accessRole: backendProfile && backendProfile.accessRole ? backendProfile.accessRole : registryUser.accessRole,
    status: backendProfile && backendProfile.status ? backendProfile.status : registryUser.status,
    department: backendProfile && backendProfile.department ? backendProfile.department : registryUser.department,
    defaultOwnerLabel: backendProfile && backendProfile.defaultOwnerLabel ? backendProfile.defaultOwnerLabel : registryUser.defaultOwnerLabel,
    accentColor: backendProfile && backendProfile.accentColor ? backendProfile.accentColor : registryUser.accentColor,
    canSeeAll: backendProfile ? backendProfile.canSeeAll === true : registryUser.canSeeAll === true,
    message: backendProfileData
      ? 'Backend profile route: ' + backendProfileData.identityMode + '. Enforcement: ' + (backendProfileData.isBackendEnforced ? 'on' : 'not complete')
      : identityState.message,
    backendProfileData: backendProfileData,
  };
}

function isAllowedPersonalizationValue(options, value) {
  return options.some(function (option) {
    return option.id === value;
  });
}

function loadPersonalizationState() {
  const profile = identityDisplayProfile();
  const fallback = {
    theme: 'neon_dark',
    accent: isAllowedPersonalizationValue(mfAccentColors, profile.accentColor) ? profile.accentColor : 'cyan',
  };
  try {
    const stored = JSON.parse(window.localStorage.getItem(personalizationStorageKey()) || '{}');
    return {
      theme: isAllowedPersonalizationValue(mfThemePresets, stored.theme) ? stored.theme : fallback.theme,
      accent: isAllowedPersonalizationValue(mfAccentColors, stored.accent) ? stored.accent : fallback.accent,
    };
  } catch (error) {
    return fallback;
  }
}

function savePersonalizationState() {
  try {
    window.localStorage.setItem(personalizationStorageKey(), JSON.stringify(personalizationState));
  } catch (error) {
    // Preview persistence is optional; the mock should still work without storage.
  }
}

function applyPersonalizationState() {
  document.body.dataset.mfTheme = personalizationState.theme;
  document.body.dataset.mfAccent = personalizationState.accent;
}

function updatePersonalizationSetting(setting, value) {
  if (setting === 'theme' && isAllowedPersonalizationValue(mfThemePresets, value)) {
    personalizationState = Object.assign({}, personalizationState, { theme: value });
  } else if (setting === 'accent' && isAllowedPersonalizationValue(mfAccentColors, value)) {
    personalizationState = Object.assign({}, personalizationState, { accent: value });
  } else {
    return;
  }
  applyPersonalizationState();
  savePersonalizationState();
  if (activeTab === 'settings') {
    renderPanel();
  }
}

function mfSelectOptions(options, selectedId) {
  return options.map(function (option) {
    return '<option value="' + escapeHtml(option.id) + '"' + (option.id === selectedId ? ' selected' : '') + '>' + escapeHtml(option.label) + '</option>';
  }).join('');
}

function mfThemeDescription(themeId) {
  const preset = mfThemePresets.find(function (theme) {
    return theme.id === themeId;
  });
  return preset ? preset.description : '';
}

function mfInitials(name) {
  return String(name || 'MF')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(function (part) {
      return part.charAt(0).toUpperCase();
    })
    .join('') || 'MF';
}

function mfOpenTasks() {
  return mfTasks.filter(function (task) {
    return isMfOpenTask(task) && !['архив', 'отменено'].includes(normalizeText(task.status));
  });
}

function mfBlockedTasks() {
  return mfOpenTasks().filter(function (task) {
    return isMfBlockedTask(task)
      || !['нет', 'none'].includes(normalizeText(task.blockerType));
  });
}

function mfOverdueTasks() {
  const today = todayIsoBangkok();
  return mfOpenTasks().filter(function (task) {
    return isOverdueStatus(task.status) || (task.deadline && task.deadline < today) || (task.controlDate && task.controlDate < today);
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
    return taskStatusKey(task) === 'waiting' || normalizeStatus(task.blockerType) === 'external' || task.dependencyDepartmentId;
  });
}

function mfReportableTasks() {
  return mfTasks.filter(function (task) {
    return task.reportable === true;
  });
}

function isMfOpenTask(task) {
  return taskStatusKey(task) !== 'done';
}

function isMfBlockedTask(task) {
  return taskStatusKey(task) === 'blocked' || isOverdueStatus(task.status);
}

function isMfWaitingTask(task) {
  return taskStatusKey(task) === 'waiting';
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
  return mfDepartment(task.dependencyDepartmentId).name || 'Нет';
}

function mfOwnerName(task) {
  return mfEmployee(task.ownerId).name || 'Не назначен';
}

function mfDepartmentName(task) {
  return mfDepartment(task.departmentId).name || 'Не назначен';
}

function mfStatusTone(task) {
  if (isOverdueStatus(task.status)) return 'critical';
  return getStatusClass(taskStatusKey(task));
}

function mfMetricCards() {
  const open = mfOpenTasks();
  return [
    { label: 'Открытые задачи', value: open.length, tone: 'cyan' },
    { label: 'Контроль сегодня', value: mfControlTodayTasks().length, tone: 'green' },
    { label: 'Просрочено', value: mfOverdueTasks().length, tone: 'critical' },
    { label: 'Блокеры', value: mfBlockedTasks().length, tone: 'critical' },
    { label: 'Ждём отделы', value: new Set(mfWaitingTasks().map(function (task) { return task.dependencyDepartmentId; }).filter(Boolean)).size, tone: 'cyan' },
    { label: 'Отчёты ждём', value: mfReportRows.filter(function (report) { return reportStatusKey(report) !== 'done'; }).length, tone: 'green' },
    { label: 'Для отчёта', value: mfReportableTasks().length, tone: 'cyan' },
    { label: 'Отделы', value: mfDepartments.length, tone: 'green' },
  ];
}

function navCountForTab(tabName) {
  if (dashboardState.status === 'loading') {
    return '...';
  }
  const counts = {
    dashboard: activeTasks().length,
    myTasks: mfTasksForEmployee(mfCurrentUserId).filter(isMfOpenTask).length,
    myFocus: mfTasksForEmployee(mfCurrentUserId).filter(function (task) { return isMfOpenTask(task) && (task.priority === 'Высокий' || task.controlDate === todayIsoBangkok() || isOverdueStatus(task.status)); }).length,
    team: ownerWorkloadRows(activeTasks()).filter(function (row) { return row.active.length; }).length,
    departments: directionWorkloadRows(activeTasks()).filter(function (row) { return row.active.length; }).length,
    dependencies: stage30ManagementMetrics().overdue.length + stage30ManagementMetrics().blockers.length + stage30ManagementMetrics().withoutOwner.length,
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
    all: activeTasks().length,
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
  const statusKey = taskStatusKey(task);
  if (isManualFocusTask(task)) score += 8;
  if (isOverdueTask(task)) score += 7;
  if (isTodayRelevantTask(task)) score += 6;
  if (isHighPriority(task)) score += 5;
  if (statusKey === 'blocked') score += 5;
  if (statusKey === 'push') score += 4;
  if (statusKey === 'waiting') score += 3;
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
    ? '<strong>Демо-данные MF Group</strong><span>' + escapeHtml(dashboardState.message || cleanupAuditState.message || 'Живой источник недоступен. Показываю временные данные MF.') + '</span>'
    : isMock
      ? '<strong>Демо-режим MF Group</strong><span>Макет только для просмотра. Без миграции таблиц, записей, Telegram, Gmail и изменений Apps Script.</span>'
      : safeWritesEnabled()
        ? '<strong>БЕЗОПАСНАЯ ЗАПИСЬ ВКЛЮЧЕНА</strong><span>Доступны только безопасное создание, статус, напоминание и обновление этапа.</span>'
        : '<strong>ТОЛЬКО ЧТЕНИЕ</strong><span>Данные загружены только для просмотра. Безопасные действия отключены.</span>';
}

function renderCreateTaskButton() {
  const loading = dashboardState.status === 'loading' || scaffoldState.status === 'loading';
  elements.createTaskButton.disabled = loading || !safeWritesEnabled();
  elements.writeModePill.textContent = safeWritesEnabled() ? 'Запись включена' : 'Только просмотр';
  elements.createTaskButton.textContent = safeWritesEnabled() ? 'Новая задача' : 'Только просмотр';
  elements.createTaskButton.title = safeWritesEnabled()
    ? 'Создать новую задачу'
    : 'Макет только для просмотра. Существующая безопасная запись остаётся за runtime-флагами.';
}

function renderLiveDataStatus() {
  const loading = liveRefreshState.status === 'loading' || dashboardState.status === 'loading';
  const hasError = liveRefreshState.status === 'error' || dashboardState.status === 'error' || scaffoldState.status === 'error';
  elements.liveDataStatus.classList.toggle('loading', loading);
  elements.liveDataStatus.classList.toggle('error', hasError);
  elements.liveStatusMessage.textContent = loading
    ? 'Обновляем данные…'
    : liveRefreshState.message || 'Данные обновлены';
  elements.liveLastUpdated.textContent = 'Последнее обновление: ' + formatLastUpdatedTime(liveRefreshState.lastUpdatedAt);
  elements.liveDataSource.textContent = 'Источник: ' + liveRefreshState.source;
  elements.refreshDashboardButton.disabled = loading;
  elements.refreshDashboardButton.textContent = loading ? 'Обновляем…' : 'Обновить';
}

function renderSummary() {
  if (dashboardState.status === 'loading') {
    elements.summaryCards.innerHTML = ['Активные', 'Просрочено', 'Блокеры', 'Ждут ответа'].map(function (label) {
      return '<article class="summary-card loading"><strong>...</strong><span>' + label + '</span></article>';
    }).join('');
    return;
  }

  const metrics = stage30ManagementMetrics();
  const cards = [
    { label: 'Активные задачи', value: metrics.active.length, tone: 'active' },
    { label: 'Просрочено', value: metrics.overdue.length, tone: 'overdue' },
    { label: 'Блокеры', value: metrics.blockers.length, tone: 'critical' },
    { label: 'Ждут ответа', value: metrics.waiting.length, tone: 'waiting' },
    { label: 'Без ответственного', value: metrics.withoutOwner.length, tone: 'neutral' },
    { label: 'Без отдела / направления', value: metrics.withoutDirection.length, tone: 'neutral' },
    { label: 'Выполнено', value: metrics.completed.length, tone: 'done' },
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
    return 'Обновляем данные…';
  }
  if (dashboardState.status === 'error' || scaffoldState.status === 'error') {
    return 'Не удалось обновить live-данные, показана последняя доступная версия / mock fallback.';
  }
  if (activeTab === 'dashboard') {
    return dashboardState.isMock
      ? 'Обзор показывает управленческие метрики на демо fallback. Живой источник не меняется.'
      : 'Обзор показывает активные задачи, просрочку, блокеры, ожидания и пустые поля из live-данных.';
  }
  if (activeTab === 'myTasks') {
    return 'Личный вид Lisa: свои задачи, совместная работа, контрольные даты и задачи для отчётов.';
  }
  if (activeTab === 'myFocus') {
    return 'Личный фокус считается из приоритета, блокеров и контрольных дат. Это не новое поле для записи.';
  }
  if (activeTab === 'team') {
    return 'Кто чем занят показывает нагрузку по ответственным: активные задачи, блокеры, ожидания, просрочку и 3 главные задачи.';
  }
  if (activeTab === 'departments') {
    return 'Отдел / направление временно считается из существующей категории задачи. Это можно переименовать без изменения схемы.';
  }
  if (activeTab === 'dependencies') {
    return 'Риски и зависшие показывают просрочку, блокеры, ожидания и задачи без владельца, направления, следующего шага или даты.';
  }
  if (activeTab === 'settings') {
    return 'Настройки пока показывают макет сотрудников, отделов, ролей, Telegram-связки и прав доступа.';
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
    return 'Все задачи сохраняют фильтры по статусу, ответственному, направлению и поиску по названию или контакту.';
  }
  if (activeTab === 'reports') {
    return 'Отчёты генерируют локальный предпросмотр. PDF, запись в Sheets и отправка выполняются только отдельным подтверждённым шагом.';
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
  if (activeTab === 'all') {
    elements.taskList.innerHTML = [
      '<article class="empty-state">',
      '<strong>Задач пока нет</strong>',
      '<span>После создания задачи обновите данные, и она появится в этом разделе.</span>',
      '</article>',
    ].join('');
    return;
  }
  elements.taskList.innerHTML = [
    '<article class="empty-state">',
    '<strong>Очередь пуста</strong>',
    '<span>В этом разделе нет задач для действия.</span>',
    '</article>',
  ].join('');
}

function taskMeta(task) {
  return [
    'Ответственный: ' + taskOwnerLabel(task),
    'Отдел / направление: ' + taskDirectionLabel(task),
    'Контакт: ' + (task.organization || 'Без контакта'),
    taskDueDate(task) ? 'Срок: ' + humanDate(taskDueDate(task)) : 'Без срока',
    taskControlDate(task) ? 'Контроль: ' + humanDate(taskControlDate(task)) : '',
  ].filter(Boolean);
}

function taskMatchesFilter(task, filterId) {
  if (filterId === 'active') return !isFinalTask(task);
  if (filterId === 'all') return true;
  if (filterId === 'completed') return isFinalTask(task);
  if (filterId === 'blocked') return isBlockerTask(task);
  if (filterId === 'waiting') return isWaitingTask(task) || taskSectionKey(task) === 'waiting';
  return true;
}

function taskMatchesCategoryFilter(task) {
  if (activeCategoryFilter === 'all') {
    return true;
  }
  return taskDirectionKey(task) === activeCategoryFilter;
}

function taskMatchesOwnerFilter(task) {
  if (activeOwnerFilter === 'all') {
    return true;
  }
  return ownerKey(task && task.owner) === activeOwnerFilter;
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
  const categoryOptionsHtml = directionFilters.map(function (filter) {
    const count = filter.id === 'all'
      ? tasks.length
      : tasks.filter(function (task) { return taskDirectionKey(task) === filter.id; }).length;
    const selected = filter.id === activeCategoryFilter ? ' selected' : '';
    return '<option value="' + escapeHtml(filter.id) + '"' + selected + '>' + escapeHtml(filter.label) + ' · ' + count + '</option>';
  }).join('');
  const ownerOptionsHtml = ownerFilters.map(function (filter) {
    const count = filter.id === 'all'
      ? tasks.length
      : tasks.filter(function (task) { return ownerKey(task.owner) === filter.id; }).length;
    const selected = filter.id === activeOwnerFilter ? ' selected' : '';
    return '<option value="' + escapeHtml(filter.id) + '"' + selected + '>' + escapeHtml(filter.label) + ' · ' + count + '</option>';
  }).join('');
  return [
    primaryFiltersHtml,
    '<label class="owner-filter">',
    '<span>Ответственный</span>',
    '<select id="ownerFilterSelect">' + ownerOptionsHtml + '</select>',
    '</label>',
    '<label class="category-filter">',
    '<span>Отдел / направление</span>',
    '<select id="categoryFilterSelect">' + categoryOptionsHtml + '</select>',
    '</label>',
  ].join('');
}

function renderWorkspaceControls(tasks) {
  if (!shouldShowWorkspaceControls()) {
    elements.workspaceControls.innerHTML = '';
    return;
  }
  const activeCount = tasks.filter(function (task) { return taskMatchesFilter(task, 'active'); }).length;
  const completedCount = tasks.filter(function (task) { return taskMatchesFilter(task, 'completed'); }).length;
  const blockedCount = tasks.filter(function (task) { return taskMatchesFilter(task, 'blocked'); }).length;
  const lizaCount = tasks.filter(function (task) { return ownerKey(task.owner) === 'liza' && taskMatchesFilter(task, 'active'); }).length;
  const andreyCount = tasks.filter(function (task) { return ownerKey(task.owner) === 'andrey' && taskMatchesFilter(task, 'active'); }).length;
  const daniilCount = tasks.filter(function (task) { return ownerKey(task.owner) === 'daniil' && taskMatchesFilter(task, 'active'); }).length;
  elements.workspaceControls.innerHTML = [
    '<div class="all-task-counters" aria-label="Счётчики задач">',
    '<span>Активные: <strong>' + activeCount + '</strong></span>',
    '<span>Всего: <strong>' + tasks.length + '</strong></span>',
    '<span>Выполнено: <strong>' + completedCount + '</strong></span>',
    '<span>Блокеры: <strong>' + blockedCount + '</strong></span>',
    '<span>Лиза: <strong>' + lizaCount + '</strong></span>',
    '<span>Андрей: <strong>' + andreyCount + '</strong></span>',
    '<span>Даниил: <strong>' + daniilCount + '</strong></span>',
    '</div>',
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
    '<span class="task-chip">' + escapeHtml(getTaskStatusLabel(task)) + '</span>',
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
  const statusKey = taskStatusKey(task);
  return [
    '<article class="task-card completed-card" data-tone="' + escapeHtml(taskTone(task)) + '">',
    '<div class="task-main">',
    '<div class="task-topline">',
    '<span class="task-chip">' + escapeHtml(getStatusLabel(statusKey === 'unknown' ? 'done' : statusKey)) + '</span>',
    isNonReportableFinal(task) ? '<span class="priority-label">Не для отчётов</span>' : '<span class="priority-label">Для отчётов</span>',
    task.completedAt ? '<span class="priority-label">Закрыта: ' + escapeHtml(humanDate(task.completedAt)) + '</span>' : '',
    '</div>',
    '<div class="task-title">' + escapeHtml(removeIsoDateNoise(task.title)) + '</div>',
    '<div class="task-meta">' + [
      'Ответственный: ' + taskOwnerLabel(task),
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
    '<article><strong>2. Назначить</strong><span>Ответственный, направление, следующий шаг, контрольная дата.</span></article>',
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
  const emptyTitle = taskSearchQuery
    ? 'Ничего не найдено'
    : activeTaskFilter === 'active'
      ? 'Активных задач нет'
      : activeTaskFilter === 'completed'
        ? 'Выполненных задач нет'
        : activeTaskFilter === 'blocked'
          ? 'Блокеров нет'
          : activeTaskFilter === 'waiting'
            ? 'Задач, которые ждут ответа, нет'
            : 'Нет задач для отображения';
  const emptyText = taskSearchQuery
    ? 'Измените поиск или фильтр, чтобы снова увидеть задачи.'
    : activeTaskFilter === 'all'
      ? 'После создания задачи обновите данные, и она появится в этом разделе.'
      : 'Переключите фильтр или обновите данные.';
  const queueHtml = visibleTasks.length
    ? activeTaskFilter === 'completed'
      ? '<div class="task-group-list">' + visibleTasks.map(completedTaskCardHtml).join('') + '</div>'
      : taskGroupsHtml(visibleTasks)
    : [
      '<article class="empty-state">',
      '<strong>' + escapeHtml(emptyTitle) + '</strong>',
      '<span>' + escapeHtml(emptyText) + '</span>',
      '</article>',
    ].join('');
  elements.taskList.innerHTML = [
    '<section class="all-task-queue">',
    '<div class="task-group-header"><div><h3>Очередь задач</h3><span>Отделы / направления работают как фильтры, а не отдельные разделы.</span></div><strong>' + visibleTasks.length + '</strong></div>',
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
    '<span>' + escapeHtml(getTaskStatusLabel(task)) + ' · ' + escapeHtml(calendarDateLabel(task)) + '</span>',
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
    '<p class="integration-note">Telegram-ready отчёт можно сформировать в разделе «Отчёты» как предпросмотр. Отправка будет отдельным подтверждённым действием в будущем этапе.</p>',
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
    return taskMatchesFilter(task, activeTaskFilter)
      && (!shouldShowWorkspaceControls() || taskMatchesCategoryFilter(task))
      && (!shouldShowWorkspaceControls() || taskMatchesOwnerFilter(task))
      && taskMatchesSearch(task);
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
    mfPill(getTaskStatusLabel(task), mfStatusTone(task)),
    '</div>',
    '<p>' + escapeHtml(task.nextAction) + '</p>',
    '<div class="mf-task-meta">',
    '<span>Ответственный: <strong>' + escapeHtml(owner) + '</strong></span>',
    '<span>Отдел: <strong>' + escapeHtml(department) + '</strong></span>',
    '<span>Контроль: <strong>' + escapeHtml(task.controlDate || '-') + '</strong></span>',
    '<span>Дедлайн: <strong>' + escapeHtml(task.deadline || '-') + '</strong></span>',
    '<span>Ждём от: <strong>' + escapeHtml(dependency) + '</strong></span>',
    '<span>Канал: <strong>' + escapeHtml(task.channel || '-') + '</strong></span>',
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

function managementTaskCardHtml(task) {
  return [
    '<article class="mf-task-card" data-tone="' + escapeHtml(taskTone(task) === 'overdue' ? 'critical' : getStatusClass(taskStatusKey(task))) + '">',
    '<div class="mf-task-head">',
    '<div>',
    '<span class="mf-id">' + escapeHtml(task.id || 'без ID') + '</span>',
    '<h3>' + escapeHtml(removeIsoDateNoise(task.title || 'Без названия')) + '</h3>',
    '</div>',
    mfPill(getTaskStatusLabel(task), taskTone(task) === 'overdue' ? 'critical' : getStatusClass(taskStatusKey(task))),
    '</div>',
    '<p>' + escapeHtml(nextActionText(task)) + '</p>',
    '<div class="mf-task-meta">',
    '<span>Ответственный: <strong>' + escapeHtml(taskOwnerLabel(task)) + '</strong></span>',
    '<span>Отдел / направление: <strong>' + escapeHtml(taskDirectionLabel(task)) + '</strong></span>',
    '<span>Контакт: <strong>' + escapeHtml(task.organization || 'Без контакта') + '</strong></span>',
    '<span>Контроль: <strong>' + escapeHtml(taskControlDate(task) ? humanDate(taskControlDate(task)) : '-') + '</strong></span>',
    '<span>Срок: <strong>' + escapeHtml(taskDueDate(task) ? humanDate(taskDueDate(task)) : '-') + '</strong></span>',
    '</div>',
    '</article>',
  ].join('');
}

function managementTaskList(tasks, emptyTitle, emptyText, limit) {
  const visibleTasks = tasks.slice().sort(compareTaskUrgency).slice(0, limit || tasks.length);
  if (!visibleTasks.length) {
    return '<article class="empty-state"><strong>' + escapeHtml(emptyTitle) + '</strong><span>' + escapeHtml(emptyText) + '</span></article>';
  }
  return '<div class="mf-task-list">' + visibleTasks.map(managementTaskCardHtml).join('') + '</div>';
}

function managementMiniGrid(metrics) {
  return [
    '<div class="mf-mini-grid">',
    mfMiniStat('Активные задачи', metrics.active.length, 'cyan'),
    mfMiniStat('Просрочено', metrics.overdue.length, metrics.overdue.length ? 'critical' : 'green'),
    mfMiniStat('Блокеры', metrics.blockers.length, metrics.blockers.length ? 'critical' : 'green'),
    mfMiniStat('Ждут ответа', metrics.waiting.length, 'neutral'),
    mfMiniStat('Без ответственного', metrics.withoutOwner.length, metrics.withoutOwner.length ? 'critical' : 'green'),
    mfMiniStat('Без направления', metrics.withoutDirection.length, metrics.withoutDirection.length ? 'critical' : 'green'),
    '</div>',
  ].join('');
}

function renderStage30Dashboard() {
  const metrics = stage30ManagementMetrics();
  const firstLook = uniqueTasks([]
    .concat(metrics.overdue)
    .concat(metrics.blockers)
    .concat(metrics.waiting)
    .concat(metrics.withoutOwner)
    .concat(metrics.withoutDirection))
    .filter(function (task) { return !isFinalTask(task); })
    .sort(compareTaskUrgency)
    .slice(0, 5);
  const ownerRows = ownerWorkloadRows(metrics.active);
  const directionRows = directionWorkloadRows(metrics.active).filter(function (row) {
    return row.active.length || row.id === 'unassigned';
  });
  const ownerDensity = ownerRows.map(function (row) {
    return [
      '<article class="mf-density-row">',
      '<div><strong>' + escapeHtml(row.label) + '</strong><span>Активные: ' + row.active.length + ' · Блокеры: ' + row.blockers.length + ' · Ждут: ' + row.waiting.length + '</span></div>',
      '<div class="mf-density-bar"><span style="width: ' + Math.min(100, row.active.length * 16) + '%"></span></div>',
      '<em>' + row.overdue.length + ' просрочено</em>',
      '</article>',
    ].join('');
  }).join('');
  const directionDensity = directionRows.map(function (row) {
    return [
      '<article class="mf-density-row">',
      '<div><strong>' + escapeHtml(row.label) + '</strong><span>Временная группировка из поля Категория</span></div>',
      '<div class="mf-density-bar"><span style="width: ' + Math.min(100, row.active.length * 16) + '%"></span></div>',
      '<em>' + row.active.length + ' активно / ' + row.blockers.length + ' блокер</em>',
      '</article>',
    ].join('');
  }).join('');

  elements.taskList.innerHTML = [
    '<section class="mf-dashboard stage30-dashboard">',
    '<article class="mf-exec-card">',
    '<span>Что Лизе смотреть первым</span>',
    '<h3>' + escapeHtml(firstLook.length ? 'Сначала просрочка, блокеры, ожидания и задачи без владельца.' : 'Критических управленческих сигналов сейчас нет.') + '</h3>',
    '<p>Обзор считается из live-задач: ответственный берётся из Owner, направление временно берётся из существующей категории задачи.</p>',
    '<div class="mf-pill-row">',
    mfPill('Без Google login', 'neutral'),
    mfPill('Без новой схемы Sheets', 'green'),
    mfPill('Без изменений Telegram', 'neutral'),
    '</div>',
    '</article>',
    managementMiniGrid(metrics),
    '<div class="mf-two-column">',
    '<section><div class="mf-section-title"><h3>Что смотреть первым</h3><span>' + firstLook.length + '</span></div>' + managementTaskList(firstLook, 'Нет срочных сигналов', 'Просроченных задач, блокеров или пустых владельцев не найдено.', 5) + '</section>',
    '<section><div class="mf-section-title"><h3>Риски и зависшие</h3><span>' + (metrics.overdue.length + metrics.blockers.length + metrics.waiting.length) + '</span></div>' + managementTaskList(uniqueTasks([].concat(metrics.overdue).concat(metrics.blockers).concat(metrics.waiting)), 'Риски не найдены', 'Просрочки, блокеров и ожиданий в текущей выборке нет.', 5) + '</section>',
    '</div>',
    '<section><div class="mf-section-title"><h3>Кто чем занят</h3><span>' + ownerRows.length + '</span></div><div class="mf-density-list">' + ownerDensity + '</div></section>',
    '<section><div class="mf-section-title"><h3>Отделы / направления</h3><span>' + directionRows.length + '</span></div><div class="mf-density-list">' + directionDensity + '</div></section>',
    '</section>',
  ].join('');
}

function renderMfDashboard() {
  renderStage30Dashboard();
}

function renderMfMyTasks() {
  const tasks = mfTasksForEmployee(mfCurrentUserId);
  const owned = tasks.filter(function (task) { return task.ownerId === mfCurrentUserId && isMfOpenTask(task); });
  const reportable = tasks.filter(function (task) { return task.reportable; });
  elements.taskList.innerHTML = [
    '<section class="mf-page-grid">',
    '<div class="mf-mini-grid">',
    mfMiniStat('Мои открытые', owned.length, 'cyan'),
    mfMiniStat('Контроль сегодня', owned.filter(function (task) { return task.controlDate === todayIsoBangkok(); }).length, 'green'),
    mfMiniStat('Для отчёта', reportable.length, 'green'),
    mfMiniStat('Совместные', tasks.filter(function (task) { return task.ownerId !== mfCurrentUserId; }).length, 'cyan'),
    '</div>',
    '<section><div class="mf-section-title"><h3>Задачи Lisa</h3><span>' + owned.length + '</span></div>' + mfTaskList(owned, 'Нет задач Lisa', 'Очередь ответственного в демо-данных пуста.') + '</section>',
    '<section><div class="mf-section-title"><h3>Мои задачи для отчёта</h3><span>' + reportable.length + '</span></div>' + mfTaskList(reportable, 'Нет задач для отчёта', 'Список источников для отчёта пуст.') + '</section>',
    '</section>',
  ].join('');
}

function renderMfMyFocus() {
  const focus = mfTasksForEmployee(mfCurrentUserId).filter(function (task) {
    return isMfOpenTask(task) && (task.priority === 'Высокий' || task.controlDate === todayIsoBangkok() || isOverdueStatus(task.status) || taskStatusKey(task) === 'blocked');
  });
  elements.taskList.innerHTML = [
    '<section class="mf-page-grid">',
    '<article class="mf-exec-card compact">',
    '<span>Личный фокус</span>',
    '<h3>Индивидуальность остаётся: у Lisa есть «Мои задачи», «Мой фокус», «Мои отчёты» и свои контрольные даты.</h3>',
    '<p>Этот список считается из демо-командных задач и остаётся только для просмотра.</p>',
    '</article>',
    mfTaskList(focus, 'Фокус пуст', 'У Lisa нет приоритетных задач, блокеров или контрольных дат.'),
    '</section>',
  ].join('');
}

function renderMfTeam() {
  const rows = ownerWorkloadRows(activeTasks()).map(function (owner) {
    const urgentTasks = owner.active.slice().sort(compareTaskUrgency).slice(0, 3);
    return [
      '<article class="mf-person-card">',
      '<div><strong>' + escapeHtml(owner.label) + '</strong><span>Активная нагрузка из live-задач</span></div>',
      '<div class="mf-person-stats">',
      mfMiniStat('Активные', owner.active.length, 'cyan'),
      mfMiniStat('Блокеры', owner.blockers.length, owner.blockers.length ? 'critical' : 'green'),
      mfMiniStat('Ждут', owner.waiting.length, 'neutral'),
      mfMiniStat('Просрочено', owner.overdue.length, owner.overdue.length ? 'critical' : 'green'),
      '</div>',
      '<div class="mf-section-title compact"><h3>Главные 3 задачи</h3><span>' + urgentTasks.length + '</span></div>',
      managementTaskList(urgentTasks, 'Нет активных задач', 'У этого ответственного нет активных задач в текущей выборке.', 3),
      '</article>',
    ].join('');
  }).join('');
  elements.taskList.innerHTML = '<section class="mf-card-grid">' + rows + '</section>';
}

function renderMfDepartments() {
  const cards = directionWorkloadRows(activeTasks()).map(function (direction) {
    const urgentTasks = direction.active.slice().sort(compareTaskUrgency).slice(0, 3);
    return [
      '<article class="mf-department-card">',
      '<div class="mf-task-head"><div><span class="mf-id">' + escapeHtml(direction.id) + '</span><h3>' + escapeHtml(direction.label) + '</h3></div>' + mfPill('Временная модель', direction.id === 'unassigned' ? 'neutral' : 'green') + '</div>',
      '<p>Группировка по существующему полю «Категория». Это направление можно переименовать позже без новой колонки.</p>',
      '<div class="mf-task-meta">',
      '<span>Активные задачи: <strong>' + direction.active.length + '</strong></span>',
      '<span>Блокеры: <strong>' + direction.blockers.length + '</strong></span>',
      '<span>Ждут ответа: <strong>' + direction.waiting.length + '</strong></span>',
      '<span>Просрочено: <strong>' + direction.overdue.length + '</strong></span>',
      '</div>',
      '<div class="mf-section-title compact"><h3>Последние / срочные</h3><span>' + urgentTasks.length + '</span></div>',
      managementTaskList(urgentTasks, 'Нет активных задач', 'Для этого направления нет активных задач.', 3),
      '</article>',
    ].join('');
  }).join('');
  elements.taskList.innerHTML = '<section class="mf-card-grid departments">' + cards + '</section>';
}

function renderMfDependencies() {
  const metrics = stage30ManagementMetrics();
  const riskGroups = [
    ['Просрочено', metrics.overdue, 'critical'],
    ['Блокеры', metrics.blockers, 'critical'],
    ['Ждут ответа', metrics.waiting, 'neutral'],
    ['Без ответственного', metrics.withoutOwner, 'critical'],
    ['Без отдела / направления', metrics.withoutDirection, 'critical'],
    ['Без следующего действия', metrics.withoutNextAction, 'neutral'],
    ['Без контрольной даты / срока', metrics.withoutControlDate, 'neutral'],
  ];
  const rows = riskGroups.map(function (group) {
    const title = group[0];
    const tasks = uniqueTasks(group[1]).filter(function (task) { return !isFinalTask(task); }).sort(compareTaskUrgency);
    return [
      '<section class="risk-group">',
      '<div class="mf-section-title"><h3>' + escapeHtml(title) + '</h3><span>' + tasks.length + '</span></div>',
      managementTaskList(tasks, 'Нет задач', 'По этому риску задач не найдено.', 6),
      '</section>',
    ].join('');
  }).join('');
  elements.taskList.innerHTML = [
    '<section class="mf-dashboard risks-dashboard">',
    managementMiniGrid(metrics),
    rows,
    '</section>',
  ].join('');
}

function renderMfReports() {
  const rows = mfReportRows.map(function (report) {
    const statusKey = reportStatusKey(report);
    return [
      '<article class="mf-report-card">',
      '<div class="mf-task-head"><div><span class="mf-id">' + escapeHtml(report.type) + '</span><h3>' + escapeHtml(report.owner) + '</h3></div>' + mfPill(statusKey === 'unknown' ? report.status : getStatusLabel(statusKey), statusKey === 'waiting' ? 'critical' : 'green') + '</div>',
      '<p>' + escapeHtml(report.summary) + '</p>',
      '<div class="mf-task-meta"><span>Период: <strong>' + escapeHtml(report.period) + '</strong></span><span>Источник: <strong>Демо-записи отчётов</strong></span></div>',
      '</article>',
    ].join('');
  }).join('');
  elements.taskList.innerHTML = [
    '<section class="mf-page-grid">',
    '<article class="mf-exec-card compact"><span>Отчёты</span><h3>Дневные, недельные, отделовые и управленческие сводки пока показаны как демо-заглушки.</h3><p>Отчёт не генерируется, не отправляется, не проверяется, не пишется в Sheets и не отправляется в Telegram.</p></article>',
    '<div class="mf-card-grid reports">' + rows + '</div>',
    '</section>',
  ].join('');
}

function usersRegistryRowsHtml() {
  return usersRegistry.map(function (user) {
    return [
      '<article class="mf-settings-row">',
      '<strong>' + escapeHtml(user.displayName) + '</strong>',
      '<span>' + escapeHtml(user.title) + ' · ' + escapeHtml(user.accessRole) + ' · ' + escapeHtml(user.email) + '</span>',
      '</article>',
    ].join('');
  }).join('');
}

function usersSheetColumnsHtml() {
  return usersSheetColumns.map(function (column) {
    return '<span>' + escapeHtml(column) + '</span>';
  }).join('');
}

function renderMfSettings() {
  const config = BAFoxConfig.getConfig();
  const profile = identityDisplayProfile();
  const backendProfile = profile.backendProfileData;
  const usersSheet = backendProfile && backendProfile.usersSheet ? backendProfile.usersSheet : null;
  const workspaceName = 'MF Group';
  const roleRows = Object.keys(accessRoleLabels).map(function (role) {
    const visibility = role === 'admin' || role === 'executive'
      ? 'Видит все задачи после backend enforcement.'
      : role === 'viewer'
        ? 'Только просмотр после backend enforcement.'
        : 'Видит свои задачи, участие и созданные задачи после добавления identity fields.';
    return '<article class="mf-settings-row"><strong>' + escapeHtml(role) + '</strong><span>' + escapeHtml(accessRoleLabels[role]) + ' · ' + escapeHtml(visibility) + '</span></article>';
  }).join('');
  const googleStatus = config.hasGoogleClientId
    ? 'Google Client ID задан, backend-проверка ещё не включена'
    : 'Google-вход готовится';
  const profileRouteStatus = profileState.status === 'success'
    ? 'profile route: ' + (backendProfile.identityMode || 'unknown')
    : profileState.status === 'error'
      ? 'profile route недоступен'
      : 'profile route готовится';
  const signInDisabled = ' disabled title="Google Identity Services будет включён после OAuth/runtime config и backend token verification"';
  const signOutDisabled = profile.isSignedIn ? '' : ' disabled';
  elements.taskList.innerHTML = [
    '<section class="mf-settings-page">',
    '<section class="mf-two-column settings">',
    '<article class="mf-settings-card mf-profile-card">',
    '<div class="mf-section-title"><h3>Профиль</h3><span>' + escapeHtml(profile.isSignedIn ? 'local preview' : 'готовится') + '</span></div>',
    '<div class="mf-profile-head"><div class="mf-avatar" aria-hidden="true">' + escapeHtml(mfInitials(profile.displayName)) + '</div><div><strong>' + escapeHtml(profile.displayName) + '</strong><span>' + escapeHtml(profile.email) + '</span></div></div>',
    '<div class="mf-readonly-grid">',
    '<span>Рабочий аккаунт <strong>' + escapeHtml(profile.domain) + '</strong></span>',
    '<span>Роль доступа <strong>' + escapeHtml(profile.accessRole) + '</strong></span>',
    '<span>Должность <strong>' + escapeHtml(profile.title) + '</strong></span>',
    '<span>Отдел / направление <strong>' + escapeHtml(profile.department) + '</strong></span>',
    '<span>Owner label <strong>' + escapeHtml(profile.defaultOwnerLabel) + '</strong></span>',
    '<span>Полная видимость <strong>' + escapeHtml(profile.canSeeAll ? 'да' : 'нет') + '</strong></span>',
    '<span>Текущий workspace <strong>' + workspaceName + '</strong></span>',
    '<span>Статус защиты <strong>Подготовлено, не enforced</strong></span>',
    '</div>',
    '</article>',
    '<article class="mf-settings-card">',
    '<div class="mf-section-title"><h3>Вход через Google</h3><span>' + escapeHtml(profileRouteStatus) + '</span></div>',
    '<div class="mf-readonly-grid">',
    '<span>Разрешённый домен <strong>' + escapeHtml(config.googleAllowedDomain || allowedWorkspaceDomain) + '</strong></span>',
    '<span>OAuth Client ID <strong>' + escapeHtml(config.hasGoogleClientId ? 'задан в runtime config' : 'не задан') + '</strong></span>',
    '<span>Backend enforcement <strong>' + escapeHtml(backendProfile && backendProfile.isBackendEnforced ? 'включён' : 'не завершён') + '</strong></span>',
    '<span>Identity mode <strong>' + escapeHtml(backendProfile && backendProfile.identityMode ? backendProfile.identityMode : googleStatus) + '</strong></span>',
    '<span>Users sheet <strong>' + escapeHtml(usersSheet ? usersSheet.status + ' · rows: ' + usersSheet.dataRows : 'не проверен') + '</strong></span>',
    '<span>Текущий статус <strong>' + escapeHtml(profile.message) + '</strong></span>',
    '</div>',
    '<div class="mf-action-row">',
    '<button class="secondary-button" type="button" data-identity-action="signin"' + signInDisabled + '>Войти через Google</button>',
    '<button class="secondary-button" type="button" data-identity-action="signout"' + signOutDisabled + '>Выйти</button>',
    '</div>',
    '</article>',
    '</section>',
    '<section class="mf-two-column settings">',
    '<article class="mf-settings-card">',
    '<div class="mf-section-title"><h3>Цвет интерфейса</h3><span>localStorage fallback</span></div>',
    '<label class="mf-form-control" for="personalizationThemeSelect"><span>Тема интерфейса</span><select id="personalizationThemeSelect" data-personalization-setting="theme">' + mfSelectOptions(mfThemePresets, personalizationState.theme) + '</select></label>',
    '<label class="mf-form-control" for="personalizationAccentSelect"><span>Цвет интерфейса</span><select id="personalizationAccentSelect" data-personalization-setting="accent">' + mfSelectOptions(mfAccentColors, personalizationState.accent) + '</select></label>',
    '<div class="mf-theme-preview"><span>Текущий preview</span><strong>' + escapeHtml(mfThemeDescription(personalizationState.theme)) + '</strong><div class="mf-accent-row">' + mfAccentColors.map(function (color) {
      return '<span class="mf-color-dot' + (color.id === personalizationState.accent ? ' active' : '') + '" data-color="' + escapeHtml(color.id) + '" title="' + escapeHtml(color.label) + '"></span>';
    }).join('') + '</div><p>Сейчас цвет хранится только в этом браузере. В Users sheet он должен стать account-level настройкой.</p></div>',
    '</article>',
    '<article class="mf-settings-card">',
    '<div class="mf-section-title"><h3>Product ownership</h3><span>intentional metadata</span></div>',
    '<div class="mf-readonly-grid product-owner-grid">',
    '<span>Product owner <strong>Liza Kiseleva</strong></span>',
    '<span>Product <strong>MF Group Tracker / BA Fox Control Center</strong></span>',
    '<span>Role <strong>Product concept, workflow architecture, QA ownership</strong></span>',
    '<span>Attribution <strong>Made by Liza Kiseleva</strong></span>',
    '</div>',
    '</article>',
    '</section>',
    '<section class="mf-two-column settings">',
    '<article class="mf-settings-card">',
    '<div class="mf-section-title"><h3>Рабочее пространство</h3><span>preview</span></div>',
    '<div class="mf-readonly-grid">',
    '<span>Название <strong>' + workspaceName + '</strong></span>',
    '<span>Allowed domain <strong>' + escapeHtml(allowedWorkspaceDomain) + '</strong></span>',
    '<span>Users registry <strong>' + usersRegistry.length + ' пользователей</strong></span>',
    '<span>Настройки workspace <strong>Роли, Users sheet, Telegram mapping, аудит</strong></span>',
    '</div>',
    '</article>',
    '<article class="mf-settings-card mf-external-card">',
    '<div class="mf-section-title"><h3>Модель видимости</h3><span class="mf-external-marker">prepared only</span></div>',
    '<p>admin и executive должны видеть все задачи после backend enforcement. member видит свои задачи, участие и, возможно, созданные им задачи.</p>',
    '<p>Текущий dashboard пока не фильтрует live-данные по пользователю, потому что Apps Script ещё не проверяет Google identity token.</p>',
    '</article>',
    '</section>',
    '<section class="mf-two-column settings">',
    '<section><div class="mf-section-title"><h3>Роли доступа</h3><span>model</span></div><div class="mf-settings-list">' + roleRows + '</div></section>',
    '<section><div class="mf-section-title"><h3>Users registry</h3><span>Users sheet draft</span></div><div class="mf-settings-list">' + usersRegistryRowsHtml() + '</div></section>',
    '</section>',
    '<section class="mf-settings-card">',
    '<div class="mf-section-title"><h3>Users sheet columns</h3><span>schema draft</span></div>',
    '<div class="mf-column-list">' + usersSheetColumnsHtml() + '</div>',
    '</section>',
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
  renderLiveDataStatus();
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
  activeTaskFilter = tabName === 'all' ? 'active' : 'all';
  activeCategoryFilter = 'all';
  activeOwnerFilter = 'all';
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
  elements.submitCreateTask.textContent = busy
    ? 'Сохраняем…'
    : createTaskState.status === 'success'
      ? 'Добавить ещё'
      : 'Сохранить';
  elements.createTaskMessage.textContent = createTaskState.message || '';
  elements.createTaskMessage.classList.toggle('error', createTaskState.status === 'error');
  elements.createTaskMessage.classList.toggle('success', createTaskState.status === 'success');
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

function openCreateTaskSuccessModal() {
  elements.createTaskSuccessModal.hidden = false;
  elements.closeCreateTaskSuccess.focus();
}

function closeCreateTaskSuccessModal() {
  elements.createTaskSuccessModal.hidden = true;
  elements.createTaskButton.focus();
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

function handleIdentityAction(action) {
  if (action === 'signout') {
    try {
      window.localStorage.removeItem(identityStorageKey);
    } catch (error) {
      // Local identity preview is optional.
    }
    identityState = loadIdentityState();
    personalizationState = loadPersonalizationState();
    applyPersonalizationState();
    flashMessage = 'Выход выполнен локально. Google-вход пока не enforced.';
    render();
    return;
  }
  if (action === 'signin') {
    flashMessage = 'Google-вход готовится: нужен OAuth Client ID и backend token verification.';
    render();
  }
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
    owner: String(formData.get('owner') || '').trim(),
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
    missing.push('Введите название задачи');
  }
  if (!payload.nextAction) {
    payload.nextAction = payload.title;
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
  if (createTaskState.status === 'loading') {
    return;
  }

  const payload = createTaskPayloadFromForm();
  const missing = validateCreateTaskPayload(payload);
  if (missing.length) {
    createTaskState = {
      status: 'error',
      message: missing.includes('Введите название задачи')
        ? 'Введите название задачи'
        : 'Проверьте: ' + missing.join(', ') + '.',
    };
    renderCreateTaskModal();
    return;
  }

  createTaskState = {
    status: 'loading',
    message: 'Сохраняем задачу...',
  };
  renderCreateTaskModal();

  try {
    await BAFoxClient.createTask(payload);
    elements.createTaskForm.reset();
    createTaskState = { status: 'success', message: 'Задача добавлена' };
    elements.createTaskModal.hidden = true;
    activeTab = 'all';
    activeTaskFilter = 'active';
    activeCategoryFilter = 'all';
    activeOwnerFilter = 'all';
    taskSearchQuery = '';
    await loadDashboard({ forceRefresh: true });
    flashMessage = 'Задача добавлена';
    render();
    renderCreateTaskModal();
    openCreateTaskSuccessModal();
  } catch (error) {
    createTaskState = {
      status: 'error',
      message: error && error.message && !String(error.message).includes('JSONP')
        ? error.message
        : 'Не удалось добавить задачу. Проверьте данные и попробуйте ещё раз.',
    };
    renderCreateTaskModal();
  }
}

async function loadDashboard(options) {
  const settings = options || {};
  const forceRefresh = Boolean(settings.forceRefresh);
  liveRefreshState = Object.assign({}, liveRefreshState, {
    status: 'loading',
    message: 'Обновляем данные…',
    isForced: forceRefresh,
  });
  dashboardState = BAFoxClient.createLoadingState('dashboard');
  scaffoldState = BAFoxClient.createLoadingState('scaffoldInfo');
  render();
  const workspaceState = await BAFoxClient.getDashboard(forceRefresh ? { refresh: '1' } : {});
  const data = workspaceState.data || {};
  dashboardState = stateFromFullDashboard(workspaceState, 'dashboard', data);
  scaffoldState = stateFromFullDashboard(workspaceState, 'scaffoldInfo', data.scaffoldInfo);
  updateLiveRefreshStateFromDashboard(workspaceState, { isForced: forceRefresh });
  render();
}

async function loadProfile() {
  profileState = BAFoxClient.createLoadingState('profile');
  if (activeTab === 'settings') {
    renderPanel();
  }
  profileState = await BAFoxClient.getProfile();
  if (activeTab === 'settings') {
    renderPanel();
  }
}

async function handleManualRefresh() {
  if (liveRefreshState.status === 'loading' || dashboardState.status === 'loading') {
    return;
  }
  await loadDashboard({ forceRefresh: true });
  loadProfile();
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
  if (event.key === 'Escape' && !elements.createTaskSuccessModal.hidden) {
    closeCreateTaskSuccessModal();
    return;
  }
  if (event.key === 'Escape' && !elements.createTaskModal.hidden) {
    closeCreateTaskModal();
    return;
  }
  if (event.key === 'Escape' && !elements.editTaskModal.hidden) {
    closeEditTaskModal();
    return;
  }
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
elements.refreshDashboardButton.addEventListener('click', handleManualRefresh);
elements.cancelCreateTask.addEventListener('click', closeCreateTaskModal);
elements.cancelCreateTaskTop.addEventListener('click', closeCreateTaskModal);
elements.closeCreateTaskSuccess.addEventListener('click', closeCreateTaskSuccessModal);
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
elements.createTaskSuccessModal.addEventListener('click', function (event) {
  if (event.target === elements.createTaskSuccessModal) {
    closeCreateTaskSuccessModal();
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
  if (event.target && event.target.id === 'ownerFilterSelect') {
    activeOwnerFilter = event.target.value || 'all';
    renderTasks();
    return;
  }
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
  const identityActionButton = event.target.closest('[data-identity-action]');
  if (identityActionButton) {
    handleIdentityAction(identityActionButton.dataset.identityAction);
    return;
  }

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

elements.taskList.addEventListener('change', function (event) {
  const control = event.target && event.target.closest('[data-personalization-setting]');
  if (!control || !elements.taskList.contains(control)) {
    return;
  }
  updatePersonalizationSetting(control.dataset.personalizationSetting, control.value);
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
  if (taskStatusKey(updated) === 'done') {
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
  const statusKey = taskStatusKey(task);
  const text = [task.status, task.category, task.reminderMode].map(normalizeText).join(' ');
  return statusKey === 'push' || statusKey === 'waiting' || ['control', 'follow-up', 'контроль'].some(function (signal) {
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
  const isDone = taskStatusKey(updatedTask) === 'done';

  updateSectionTasks(data.open, taskId, updatedTask, function () {
    return !isDone;
  });
  updateSectionTasks(data.today, taskId, updatedTask, function (task) {
    return !isDone && (
      dateSignalIsDue(task.nextReminder, todayIsoBangkok())
      || dateSignalIsDue(task.deadline, todayIsoBangkok())
      || isHighPriority(task)
      || ['push', 'waiting'].includes(taskStatusKey(task))
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
  applyPersonalizationState();
  formatBangkokTime();
  setInterval(formatBangkokTime, 30000);
  render();
  await loadOptionalLocalConfig();
  await Promise.all([
    loadDashboard(),
    loadProfile(),
  ]);
}

initializeDashboard();
