from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton


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
