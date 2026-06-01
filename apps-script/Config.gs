var BA_FOX_CONFIG = {
  VERSION: 'v2.7.5-safe-real-actions',
  DRY_RUN: true,
  READ_LIVE_SHEETS: true,
  SAFE_WRITE_MODE: true,
  TIMEZONE: 'Asia/Bangkok',
  SHEETS: {
    TASKS: 'Tasks',
    SETTINGS: 'Settings',
    AUDIT_LOG: 'AuditLog',
    REPORTS: 'Reports',
    NOTIFICATION_QUEUE: 'NotificationQueue',
    CONTACTS: 'Contacts'
  },
  TASK_COLUMNS: {
    ID: 1,
    DATE: 2,
    CATEGORY: 3,
    ORGANIZATION: 4,
    TITLE: 5,
    STEPS: 6,
    SOURCE: 7,
    PRIORITY: 8,
    DEADLINE: 9,
    REMINDER_MODE: 10,
    STATUS: 11,
    NEXT_REMINDER: 12,
    COMMENT: 13,
    CHANNEL: 14,
    TASK_TYPE: 15,
    OWNER: 16,
    CREATED_AT: 17,
    UPDATED_AT: 18,
    COMPLETED_AT: 19,
    REMINDER_RECURRENCE: 20,
    NOTIFICATION_CHANNELS: 21,
    NOTIFICATION_STATUS: 22,
    APP_SOURCE: 23,
    EXTERNAL_REF: 24,
    ARCHIVED: 25
  },
  FINAL_STATUSES: ['Done', 'Cancelled', 'Archived', 'Выполнено', 'Архив'],
  OPEN_STATUSES: [
    'Not started',
    'In progress',
    'Waiting',
    'Push',
    'Blocked',
    'Postpone',
    'Не начато',
    'В работе',
    'Ждём ответ',
    'Ждём подтверждение',
    'Ждём подписание',
    'Перенести',
    'Пуш',
    'Блокер'
  ],
  CONTROL_SIGNALS: [
    'push',
    'waiting',
    'control',
    'follow-up',
    'пуш',
    'ждём ответ',
    'ждем ответ',
    'контроль'
  ],
  TASK_TYPES: ['work', 'personal'],
  APP_SOURCES: ['web', 'chatgpt', 'apps_script', 'telegram_legacy', 'manual_sheet'],
  COMMENT_MODES: ['replace', 'append'],
  REPORT_FORMATS: ['ba_daily'],
  NOTIFICATION_CHANNELS: ['google_chat', 'email', 'calendar']
};

function baFoxGetConfig() {
  return BA_FOX_CONFIG;
}
