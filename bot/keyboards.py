from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton

from services.google_sheets import Task


def main_menu() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text='🗓 Задачи на сегодня'), KeyboardButton(text='➕ Добавить задачу')],
            [KeyboardButton(text='📝 Собрать итоги'), KeyboardButton(text='✅ Выполненные')],
            [KeyboardButton(text='⏰ Напоминания'), KeyboardButton(text='⚙️ Настройки')],
            [KeyboardButton(text='📥 Отчёты встреч')],
        ],
        resize_keyboard=True,
        input_field_placeholder='Выбери действие 🦊',
    )


def dashboard_keyboard(counts: dict[str, int]) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=f'📄 Документы · {counts.get("docs", 0)}', callback_data='cat:docs'), InlineKeyboardButton(text=f'💌 Почта/пуш · {counts.get("mail", 0)}', callback_data='cat:mail')],
            [InlineKeyboardButton(text=f'📞 Коммуникация · {counts.get("comm", 0)}', callback_data='cat:comm'), InlineKeyboardButton(text=f'⏳ Ждём/контроль · {counts.get("wait", 0)}', callback_data='cat:wait')],
            [InlineKeyboardButton(text=f'🌈 Доп · {counts.get("extra", 0)}', callback_data='cat:extra'), InlineKeyboardButton(text=f'🤝 HR · {counts.get("hr", 0)}', callback_data='cat:hr')],
            [InlineKeyboardButton(text=f'❤️ Теодор · {counts.get("theodor", 0)}', callback_data='cat:theodor'), InlineKeyboardButton(text=f'🗂 Все · {counts.get("all", 0)}', callback_data='cat:all')],
            [InlineKeyboardButton(text='🔄 Обновить', callback_data='tasks:refresh')],
        ]
    )


def task_list_keyboard(tasks: list[Task]) -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []
    number_row: list[InlineKeyboardButton] = []
    for index, task in enumerate(tasks, start=1):
        number_row.append(InlineKeyboardButton(text=str(index), callback_data=f'task:view:{task.task_id}'))
        if len(number_row) == 4:
            rows.append(number_row)
            number_row = []
    if number_row:
        rows.append(number_row)
    rows.append([InlineKeyboardButton(text='⬅️ К дашборду', callback_data='tasks:refresh')])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def task_actions(task_id: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text='✅ Выполнено', callback_data=f'task:done:{task_id}'), InlineKeyboardButton(text='🟡 В работе', callback_data=f'task:progress:{task_id}')],
            [InlineKeyboardButton(text='⏰ Напомнить позже', callback_data=f'task:later:{task_id}'), InlineKeyboardButton(text='🔁 Перенести', callback_data=f'task:postpone:{task_id}')],
            [InlineKeyboardButton(text='💬 Комментарий', callback_data=f'task:comment:{task_id}')],
        ]
    )


def add_task_preview_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text='✅ Добавить в таблицу', callback_data='addtask:confirm'), InlineKeyboardButton(text='✏️ Написать заново', callback_data='addtask:rewrite')],
            [InlineKeyboardButton(text='❌ Отмена', callback_data='addtask:cancel')],
        ]
    )
