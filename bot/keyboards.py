from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton

from services.google_sheets import Task


def main_menu() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text='\U0001f5d3 Задачи на сегодня'), KeyboardButton(text='\u2795 Добавить задачу')],
            [KeyboardButton(text='\u2705 Выполненные'), KeyboardButton(text='\u23f0 Напоминания')],
            [KeyboardButton(text='\U0001f4e5 Отчёты'), KeyboardButton(text='\u2699\ufe0f Настройки')],
        ],
        resize_keyboard=True,
        input_field_placeholder='Выбери действие \U0001f98a',
    )


def reports_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text='\U0001f4dd Собрать итоги', callback_data='reports:daily')],
            [InlineKeyboardButton(text='\U0001f4e5 Отчёты встреч', callback_data='reports:meetings')],
            [InlineKeyboardButton(text='\U0001f4ec Сверить почту', callback_data='reports:gmail')],
        ]
    )


def dashboard_keyboard(counts: dict[str, int]) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=f'\U0001f4c4 Документы · {counts.get("docs", 0)}', callback_data='cat:docs'), InlineKeyboardButton(text=f'\U0001f48c Почта/пуш · {counts.get("mail", 0)}', callback_data='cat:mail')],
            [InlineKeyboardButton(text=f'\U0001f4de Коммуникация · {counts.get("comm", 0)}', callback_data='cat:comm'), InlineKeyboardButton(text=f'\u23f3 Ждём/контроль · {counts.get("wait", 0)}', callback_data='cat:wait')],
            [InlineKeyboardButton(text=f'\U0001f308 Доп · {counts.get("extra", 0)}', callback_data='cat:extra'), InlineKeyboardButton(text=f'\U0001f91d HR · {counts.get("hr", 0)}', callback_data='cat:hr')],
            [InlineKeyboardButton(text=f'\u2764\ufe0f Теодор · {counts.get("theodor", 0)}', callback_data='cat:theodor'), InlineKeyboardButton(text=f'\U0001f5c2 Все · {counts.get("all", 0)}', callback_data='cat:all')],
            [InlineKeyboardButton(text='\U0001f504 Обновить', callback_data='tasks:refresh')],
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
    rows.append([InlineKeyboardButton(text='\u2b05\ufe0f К дашборду', callback_data='tasks:refresh')])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def task_actions(task_id: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text='\u2705 Выполнено', callback_data=f'task:done:{task_id}'), InlineKeyboardButton(text='\U0001f7e1 В работе', callback_data=f'task:progress:{task_id}')],
            [InlineKeyboardButton(text='\u23f0 Напомнить позже', callback_data=f'task:later:{task_id}'), InlineKeyboardButton(text='\U0001f501 Перенести', callback_data=f'task:postpone:{task_id}')],
            [InlineKeyboardButton(text='\U0001f4ac Комментарий', callback_data=f'task:comment:{task_id}')],
        ]
    )


def add_task_preview_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text='\u2705 Добавить в таблицу', callback_data='addtask:confirm'), InlineKeyboardButton(text='\u270f\ufe0f Написать заново', callback_data='addtask:rewrite')],
            [InlineKeyboardButton(text='\u274c Отмена', callback_data='addtask:cancel')],
        ]
    )
