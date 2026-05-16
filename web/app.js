const demoTasks = [
  {
    id: 'bitazza',
    section: 'work',
    title: 'Bitazza — отправить исправленный KYB пакет',
    meta: '🔥 Срочно · действие за нами · контроль понедельник',
    status: 'В работе',
  },
  {
    id: 'kasikorn',
    section: 'work',
    title: 'Kasikorn / KBankLao — подготовить пакет документов',
    meta: '🔥 Срочно · документы / onboarding · контроль понедельник',
    status: 'В работе',
  },
  {
    id: 'bcel',
    section: 'push',
    title: 'BCEL — follow-up по BCEL Pay / Lao QR',
    meta: '📣 Пуш · ответ за контрагентом · контроль до понедельника',
    status: 'Пуш',
  },
  {
    id: 'super-rich',
    section: 'work',
    title: 'Super Rich — подготовить и отправить оффер',
    meta: 'Действие за нами · после отправки перевести в Пуш',
    status: 'В работе',
  },
  {
    id: 'p3',
    section: 'push',
    title: 'P3 Estates — пуш + альтернативный senior contact',
    meta: '📣 Пуш · недвижимость / партнёры',
    status: 'Пуш',
  },
  {
    id: 'gln',
    section: 'push',
    title: 'GLN — выйти через альтернативные контакты',
    meta: '📣 Пуш · новый канал коммуникации',
    status: 'Пуш',
  },
  {
    id: 'jdb-card',
    section: 'week',
    title: 'JDB virtual card — у них её нет',
    meta: '⏳ Wait list · результат зафиксирован',
    status: 'Wait list',
  },
  {
    id: 'personal-1',
    section: 'personal',
    title: 'Никита — заказать шампунь, кондиционер и гель',
    meta: 'Личное · ежедневное напоминание 14:00 Bangkok',
    status: 'Личное',
  },
  {
    id: 'personal-2',
    section: 'personal',
    title: 'Коты — заказать наполнитель',
    meta: 'Личное · дом / коты',
    status: 'Личное',
  },
  {
    id: 'personal-3',
    section: 'personal',
    title: 'Масла — открыть и записать обзор',
    meta: 'Личное · обзор / уход',
    status: 'Личное',
  },
];

const labels = {
  today: ['Сегодня', 'Фокус дня'],
  work: ['Работа', 'Рабочие задачи'],
  personal: ['Личное', 'Личные задачи'],
  push: ['Пуши', 'Нельзя просто ждать'],
  week: ['Неделя', 'Контроль недели'],
};

const tabs = document.querySelectorAll('.tab');
const taskList = document.querySelector('#taskList');
const summaryCards = document.querySelector('#summaryCards');
const panelEyebrow = document.querySelector('#panelEyebrow');
const panelTitle = document.querySelector('#panelTitle');
const todayLabel = document.querySelector('#todayLabel');

let activeTab = 'today';

function formatDate() {
  const formatter = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone: 'Asia/Bangkok',
  });
  todayLabel.textContent = `${formatter.format(new Date())} · Bangkok`;
}

function getVisibleTasks() {
  if (activeTab === 'today') {
    return demoTasks.filter((task) => ['work', 'push'].includes(task.section)).slice(0, 7);
  }
  if (activeTab === 'week') {
    return demoTasks.filter((task) => ['work', 'push', 'week'].includes(task.section));
  }
  return demoTasks.filter((task) => task.section === activeTab);
}

function renderSummary() {
  const cards = [
    { value: demoTasks.filter((task) => task.section === 'work').length, label: 'В работе' },
    { value: demoTasks.filter((task) => task.section === 'push').length, label: 'Пуши' },
    { value: demoTasks.filter((task) => task.section === 'personal').length, label: 'Личное' },
    { value: demoTasks.filter((task) => task.status === 'Wait list').length, label: 'Wait list' },
  ];

  summaryCards.innerHTML = cards.map((card) => `
    <article class="summary-card">
      <strong>${card.value}</strong>
      <span>${card.label}</span>
    </article>
  `).join('');
}

function renderTasks() {
  const [eyebrow, title] = labels[activeTab];
  panelEyebrow.textContent = eyebrow;
  panelTitle.textContent = title;

  const tasks = getVisibleTasks();
  taskList.innerHTML = tasks.map((task) => `
    <article class="task-card" data-status="${task.status}">
      <div class="status-dot" aria-hidden="true"></div>
      <div>
        <div class="task-title">${task.title}</div>
        <div class="task-meta">${task.meta}</div>
      </div>
      <span class="task-chip">${task.status}</span>
    </article>
  `).join('');
}

function setTab(tabName) {
  activeTab = tabName;
  tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === tabName));
  renderTasks();
}

function copyText(text) {
  navigator.clipboard?.writeText(text).then(() => {
    alert('Скопировано 🦊');
  }).catch(() => {
    alert('Не удалось скопировать автоматически. Можно выделить текст вручную.');
  });
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => setTab(tab.dataset.tab));
});

document.querySelector('#resetDemo').addEventListener('click', () => setTab('today'));

document.querySelector('#copyDaily').addEventListener('click', () => {
  copyText('Daily summary draft: фокус — Bitazza и Kasikorn; пуши — BCEL, P3, GLN; личное — отдельный блок в 14:00 Bangkok.');
});

document.querySelector('#copyMonday').addEventListener('click', () => {
  copyText('Monday QA: открыть @ba_executive_fox_bot → 🗓 Задачи на сегодня → проверить задачи на 18.05 → если всё ок, перейти к Этапу 4.1.');
});

formatDate();
renderSummary();
renderTasks();
