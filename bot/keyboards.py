from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton

from services.google_sheets import Task


def main_menu() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text='🗓 Задачи на сегодня'), KeyboardButton(text='📝 Собрать итоги')],
            [KeyboardButton(text='✅ Выполненные'), KeyboardButton(text='⏰ Напоминания')],
            [KeyboardButton(text='📥 Отчёты встреч'), KeyboardButton(text='⚙️ Настройки')],
        ],
        resize_keyboard=True,
        input_field_placeholder='Выбери действие 🦊',
    )


def task_list_keyboard(tasks: list[Task]) -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []

    # Compact task opener buttons: 1, 2, 3...
    number_row: list[InlineKeyboardButton] = []
    for index, task in enumerate(tasks, start=1):
        number_row.append(
            InlineKeyboardButton(text=str(index), callback_data=f'task:view:{task.task_id}')
        )
        if len(number_row) == 4:
            rows.append(number_row)
            number_row = []

    if number_row:
        rows.append(number_row)

    rows.append([InlineKeyboardButton(text='🔄 Обновить список', callback_data='tasks:refresh')])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def task_actions(task_id: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text='✅ Выполнено', callback_data=f'task:done:{task_id}'),
                InlineKeyboardButton(text='🟡 В работе', callback_data=f'task:progress:{task_id}'),
            ],
            [
                InlineKeyboardButton(text='⏰ Напомнить позже', callback_data=f'task:later:{task_id}'),
                InlineKeyboardButton(text='🔁 Перенести', callback_data=f'task:postpone:{task_id}'),
            ],
            [InlineKeyboardButton(text='💬 Комментарий', callback_data=f'task:comment:{task_id}')],
        ]
    )
