from aiogram import Router, F
from aiogram.filters import Command, CommandStart
from aiogram.types import CallbackQuery, Message

from bot.config import settings
from bot.keyboards import main_menu, task_actions
from services.google_sheets import GoogleSheetsTaskStore
from services.report_builder import build_daily_report

router = Router()
store = GoogleSheetsTaskStore(settings.google_sheet_id)


@router.message(CommandStart())
async def start(message: Message) -> None:
    await message.answer(
        'Привет, Лиза 💛 Я Executive Fox 🦊\n'
        'Буду помогать с задачами, напоминаниями и итогами BA.\n\n'
        f'Твой Telegram chat ID: <code>{message.chat.id}</code>\n'
        'Он нужен для расписания напоминаний.',
        reply_markup=main_menu(),
    )


@router.message(Command('myid'))
async def my_id(message: Message) -> None:
    await message.answer(
        f'Твой Telegram chat ID: <code>{message.chat.id}</code>\n\n'
        'Вставь его в файл .env в строку:\n'
        f'<code>TELEGRAM_OWNER_CHAT_ID={message.chat.id}</code>'
    )


@router.message(F.text == '🗓 Задачи на сегодня')
async def today_tasks(message: Message) -> None:
    tasks = await store.get_today_tasks()
    if not tasks:
        await message.answer('На сегодня задач пока нет. Пришли план в ChatGPT, и я появлюсь с чек-листом 🦊')
        return

    for task in tasks:
        text = (
            f'📌 <b>{task.title}</b>\n'
            f'Категория: {task.category}\n'
            f'Организация: {task.organization}\n'
            f'Приоритет: {task.priority}\n'
            f'Дедлайн: {task.deadline}\n'
            f'Статус: {task.status}\n\n'
            f'<b>Шаги для Лизы:</b>\n{task.steps}'
        )
        await message.answer(text, reply_markup=task_actions(task.task_id))


@router.message(F.text == '📝 Собрать итоги')
async def daily_summary(message: Message) -> None:
    tasks = await store.get_today_tasks()
    report = build_daily_report(tasks)
    await message.answer('Черновик итогов для проверки:')
    await message.answer(f'<pre>{report}</pre>')
    await message.answer('Проверь текст. После правок можно будет копировать или позже добавить отправку в рабочий чат после подтверждения.')


@router.message(F.text == '✅ Выполненные')
async def completed_tasks(message: Message) -> None:
    tasks = await store.get_today_tasks()
    completed = [task for task in tasks if task.status == 'Выполнено']
    if not completed:
        await message.answer('Пока нет задач со статусом ✅ Выполнено.')
        return
    lines = ['✅ Выполненные задачи:']
    lines.extend(f'• {task.organization} — {task.title}' for task in completed)
    await message.answer('\n'.join(lines))


@router.message(F.text == '⏰ Напоминания')
async def reminders(message: Message) -> None:
    tasks = await store.get_open_tasks()
    if not tasks:
        await message.answer('Все задачи закрыты. Лисичка довольна 🦊')
        return
    lines = ['⏰ Открытые задачи для контроля:']
    lines.extend(f'• {task.title} — {task.next_reminder or "без времени"}' for task in tasks)
    await message.answer('\n'.join(lines))


@router.message(F.text == '📥 Отчёты встреч')
async def meetings_inbox(message: Message) -> None:
    await message.answer('Раздел отчётов встреч готовится. Сюда будут попадать Read AI, Gemini и Zoom summaries.')


@router.message(F.text == '⚙️ Настройки')
async def settings_info(message: Message) -> None:
    await message.answer(
        'Настройки MVP:\n'
        '• База: Google Sheets\n'
        '• Режим напоминаний: Комбо\n'
        '• Основной вход: ChatGPT\n'
        '• Интерфейс задач: Telegram\n\n'
        f'Твой Telegram chat ID: <code>{message.chat.id}</code>'
    )


@router.callback_query(F.data.startswith('task:'))
async def task_callback(callback: CallbackQuery) -> None:
    _, action, task_id = callback.data.split(':', maxsplit=2)

    status_map = {
        'done': 'Выполнено',
        'progress': 'В работе',
        'later': 'Не начато',
        'postpone': 'Перенести',
    }

    if action == 'comment':
        await callback.answer('Комментарий пока в MVP через текст следующим сообщением.', show_alert=True)
        return

    status = status_map.get(action)
    if not status:
        await callback.answer('Неизвестное действие', show_alert=True)
        return

    await store.update_task_status(task_id=task_id, status=status)  # type: ignore[arg-type]
    await callback.answer(f'Статус обновлён: {status}')
    await callback.message.answer(f'🦊 Принято: задача {task_id} → {status}')
