const demoTasks = [
  {
    id: 'bitazza',
    section: 'work',
    title: 'Bitazza — отправить исправленный KYB пакет',
    meta: '🔥 Срочно · действие за нами · контроль понедельник',
    status: 'В работе',
    priority: 100,
  },
  {
    id: 'kasikorn',
    section: 'work',
    title: 'Kasikorn / KBankLao — подготовить пакет документов',
    meta: '🔥 Срочно · документы / onboarding · контроль понедельник',
    status: 'В работе',
    priority: 95,
  },
  {
    id: 'super-rich',
    section: 'work',
    title: 'Super Rich — подготовить и отправить оффер',
    meta: 'Действие за нами · после отправки перевести в Пуш',
    status: 'В работе',
    priority: 82,
  },
  {
    id: 'bcel',
    section: 'push',
    title: 'BCEL — follow-up по BCEL Pay / Lao QR',
    meta: '📣 Пуш · ответ за контрагентом · контроль до понедельника',
    status: 'Пуш',
    priority: 78,
  },
  {
    id: 'p3',
    section: 'push',
    title: 'P3 Estates — пуш + альтернативный senior contact',
    meta: '📣 Пуш · недвижимость / партнёры',
    status: 'Пуш',
    priority: 72,
  },
  {
    id: 'gln',
    section: 'push',
    title: 'GLN — выйти через альтернативные контакты',
    meta: '📣 Пуш · новый канал коммуникации',
    status: 'Пуш',
    priority: 70,
  },
  {
    id: 'jdb-card',
    section: 'week',
    title: 'JDB virtual card — у них её нет',
    meta: '⏳ Wait list · результат зафиксирован',
    status: 'Wait list',
    priority: 30,
  },
  {
    id: 'personal-1',
    section: 'personal',
    title: 'Никита — заказать шампунь, кондиционер и гель',
    meta: 'Личное · ежедневное напоминание 14:00 по Бангкоку',
    status: 'Личное',
    priority: 40,
  },
  {
    id: 'personal-2',
    section: 'personal',
    title: 'Коты — заказать наполнитель',
    meta: 'Личное · дом / коты',
    status: 'Личное',
    priority: 44,
  },
  {
    id: 'personal-3',
    section: 'personal',
    title: 'Масла — открыть и записать обзор',
    meta: 'Личное · обзор / уход',
    status: 'Личное',
    priority: 34,
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
const focusNote = document.querySelector('#focusNote');

let activeTab = 'today';
const doneStorageKey = 'baFoxDoneDemoTasks';
let doneTaskIds = new Set(JSON.parse(localStorage.getItem(doneStorageKey) || '[]'));

function saveDoneState() {
  localStorage.setItem(doneStorageKey, JSON.stringify([...doneTaskIds]));
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
  todayLabel.textContent = `${formatter.format(new Date())} · время Бангкока`;
}

function getAiFocusTasks() {
  return demoTasks
    .filter((task) => ['work', 'push'].includes(task.section))
    .filter((task) => !doneTaskIds.has(task.id))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4);
}

function getVisibleTasks() {
  if (activeTab === 'today') {
    return getAiFocusTasks();
  }
  if (activeTab === 'week') {
    return demoTasks.filter((task) => ['work', 'push', 'week'].includes(task.section));
  }
  return demoTasks.filter((task) => task.section === activeTab);
}

function renderSummary() {
  const openTasks = demoTasks.filter((task) => !doneTaskIds.has(task.id));
  const cards = [
    { value: openTasks.filter((task) => task.section === 'work').length, label: 'В работе' },
    { value: openTasks.filter((task) => task.section === 'push').length, label: 'Пуши' },
    { value: openTasks.filter((task) => task.section === 'personal').length, label: 'Личное' },
    { value: demoTasks.filter((task) => doneTaskIds.has(task.id)).length, label: 'Закрыто' },
  ];

  summaryCards.innerHTML = cards.map((card) => `
    <article class="summary-card">
      <strong>${card.value}</strong>
      <span>${card.label}</span>
    </article>
  `).join('');
}

function renderFocusNote() {
  if (activeTab === 'today') {
    focusNote.textContent = 'AI-фокус v0: сначала показываем срочные задачи, где действие за нами, потом пуши с контрольной датой. Позже подключим реальные данные из таблицы.';
    focusNote.hidden = false;
    return;
  }

  if (activeTab === 'push') {
    focusNote.textContent = 'Пуши v0: здесь будут задачи, по которым нужен follow-up и отдельное напоминание. Реальные пуш-уведомления подключим через Telegram/hosting.';
    focusNote.hidden = false;
    return;
  }

  focusNote.hidden = true;
}

function renderTasks() {
  const [eyebrow, title] = labels[activeTab];
  panelEyebrow.textContent = eyebrow;
  panelTitle.textContent = title;
  renderFocusNote();

  const tasks = getVisibleTasks();
  if (!tasks.length) {
    taskList.innerHTML = '<article class="task-card"><div class="status-dot"></div><div><div class="task-title">Все задачи в этом разделе закрыты</div><div class="task-meta">Лисичка довольна. Можно переключиться на другой раздел 🦊</div></div></article>';
    return;
  }

  taskList.innerHTML = tasks.map((task) => {
    const isDone = doneTaskIds.has(task.id);
    return `
      <article class="task-card ${isDone ? 'done' : ''}" data-status="${isDone ? 'Выполнено' : task.status}">
        <button class="done-toggle" data-task-id="${task.id}" aria-label="Отметить задачу">${isDone ? '✓' : ''}</button>
        <div>
          <div class="task-title">${task.title}</div>
          <div class="task-meta">${task.meta}</div>
        </div>
        <span class="task-chip">${isDone ? 'Выполнено' : task.status}</span>
      </article>
    `;
  }).join('');

  document.querySelectorAll('.done-toggle').forEach((button) => {
    button.addEventListener('click', () => toggleDone(button.dataset.taskId));
  });
}

function toggleDone(taskId) {
  if (doneTaskIds.has(taskId)) {
    doneTaskIds.delete(taskId);
  } else {
    doneTaskIds.add(taskId);
  }
  saveDoneState();
  renderSummary();
  renderTasks();
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

document.querySelector('#resetDemo').addEventListener('click', () => {
  doneTaskIds = new Set();
  saveDoneState();
  setTab('today');
  renderSummary();
});

document.querySelector('#copyDaily').addEventListener('click', () => {
  copyText('Итог дня: фокус — Bitazza и Kasikorn; пуши — BCEL, P3, GLN; личные задачи идут отдельным блоком с напоминанием в 14:00 по Бангкоку.');
});

document.querySelector('#copyMonday').addEventListener('click', () => {
  copyText('Чек-лист на понедельник: открыть @ba_executive_fox_bot → нажать 🗓 Задачи на сегодня → проверить задачи на 18.05 → если всё отображается корректно, закрыть Этап 3 и перейти к Этапу 4.1.');
});

formatBangkokTime();
setInterval(formatBangkokTime, 30000);
renderSummary();
renderTasks();
