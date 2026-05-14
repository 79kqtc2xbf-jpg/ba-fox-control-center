from aiogram import Router, F
from aiogram.filters import Command, CommandStart
from aiogram.types import CallbackQuery, Message

from bot.config import settings
from bot.keyboards import main_menu, task_actions, task_list_keyboard
from services.google_sheets import GoogleSheetsTaskStore, Task
from services.report_builder import build_daily_report

router = Router()
store = GoogleSheetsTaskStore(settings.google_sheet_id)


def _task_name(task: Task) -> str:
    org = f'{task.organization} — ' if task.organization else ''
    return f'{org}{task.title}'


def _is_open(task: Task) -> bool:
    return task.status not in {'Выполнено'}


def _is_high(task: Task) -> bool:
    return task.priority.strip().lower() == 'высокий'


def _is_wait(task: Task) -> bool:
    text = f'{task.category} {task.status} {task.deadline}'.lower()
    return 'wait' in text or 'ждём' in text or 'ждем' in text or task.status in {'Ждём ответ', 'Пуш'}


def _is_document(task: Task) -> bool:
    return 'документац' in task.category.lower()


def _is_mail(task: Task) -> bool:
    return 'письм' in task.category.lower() or task.status == 'Пуш'


def _is_communication(task: Task) -> bool:
    return 'коммуникац' in task.category.lower() or 'напоминания' in task.category.lower()


def _short_items(tasks: list[Task], limit: int = 4) -> list[str]:
    return [f'• {_task_name(task)}' for task in tasks[:limit]]


def _compact_task_index(tasks: list[Task]) -> list[str]:
    lines: list[str] = []
    for index, task in enumerate(tasks, start=1):
        status_icon = {
            'Выполнено': '✅',
            'В работе': '🟡',
            'Ждём ответ': '⏳',
            'Пуш': '📣',
            'Перенести': '🔁',
        }.get(task.status, '▫️')
        priority_icon = '🔥 ' if _is_high(task) else ''
        lines.append(f'{index}. {status_icon} {priority_icon}{_task_name(task)}')
    return lines


def build_task_list_text(tasks: list[Task]) -> str:
    if not tasks:
        return 'На сегодня задач пока нет. Пришли план в ChatGPT, и я появлюсь с чек-листом 🦊'

    open_tasks = [task for task in tasks if _is_open(task)]
    done_tasks = [task for task in tasks if task.status == 'Выполнено']
    high_open = [task for task in open_tasks if _is_high(task)]
    wait_tasks = [task for task in open_tasks if _is_wait(task)]
    mail_tasks = [task for task in open_tasks if _is_mail(task)]
    doc_tasks = [task for task in open_tasks if _is_document(task)]
    communication_tasks = [task for task in open_tasks if _is_communication(task)]

    focus_tasks = high_open[:3] or open_tasks[:3]
    urgent_tasks = [
        task for task in high_open
        if task not in focus_tasks and task.status not in {'Ждём ответ'}
    ][:3]
    later_tasks = [
        task for task in open_tasks
        if task.priority.strip().lower() in {'низкий', 'средний'} and task not in wait_tasks
    ][:3]

    lines = [
        '🦊 <b>EA Fox Brief на день</b>',
        f'Открыто: <b>{len(open_tasks)}</b> · закрыто: <b>{len(done_tasks)}</b> · всего: <b>{len(tasks)}</b>',
        '',
    ]

    if focus_tasks:
        lines.append('🔥 <b>Главный фокус</b>')
        lines.extend(_short_items(focus_tasks, 3))
        lines.append('')

    if urgent_tasks:
        lines.append('⚠️ <b>Срочно / сегодня</b>')
        lines.extend(_short_items(urgent_tasks, 3))
        lines.append('')

    if wait_tasks:
        lines.append('⏳ <b>Ждём / контроль / пуш</b>')
        lines.extend(_short_items(wait_tasks, 4))
        if len(wait_tasks) > 4:
            lines.append(f'• ещё {len(wait_tasks) - 4} в контроле')
        lines.append('')

    lines.append('📌 <b>Разбивка</b>')
    lines.append(f'📄 Документы: {len(doc_tasks)} · 💌 Письма/пуши: {len(mail_tasks)} · 📞 Коммуникация: {len(communication_tasks)}')
    lines.append('')

    if later_tasks:
        lines.append('🌿 <b>Можно после главного</b>')
        lines.extend(_short_items(later_tasks, 3))
        lines.append('')

    lines.append('🗂 <b>Индекс задач</b>')
    lines.extend(_compact_task_index(tasks))
    lines.append('')
    lines.append('Нажми номер задачи ниже, чтобы открыть шаги и кнопки статуса.')
    return '\n'.join(lines)


def build_task_card_text(task: Task) -> str:
    return (
        f'📌 <b>{task.title}</b>\n'
        f'ID: <code>{task.task_id}</code>\n'
        f'Категория: {task.category}\n'
        f'Организация: {task.organization}\n'
        f'Приоритет: {task.priority}\n'
        f'Дедлайн: {task.deadline}\n'
        f'Статус: {task.status}\n\n'
        f'<b>Шаги для Лизы:</b>\n{task.steps}'
    )


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
    text = build_task_list_text(tasks)
    keyboard = task_list_keyboard(tasks) if tasks else None
    await message.answer(text, reply_markup=keyboard)


@router.callback_query(F.data == 'tasks:refresh')
async def refresh_tasks(callback: CallbackQuery) -> None:
    tasks = await store.get_today_tasks()
    text = build_task_list_text(tasks)
    keyboard = task_list_keyboard(tasks) if tasks else None
    await callback.message.answer(text, reply_markup=keyboard)
    await callback.answer('Список обновлён')


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


@router.callback_query(F.data.startswith('task:view:'))
async def view_task(callback: CallbackQuery) -> None:
    _, _, task_id = callback.data.split(':', maxsplit=2)
    tasks = await store.get_today_tasks()
    task = next((item for item in tasks if item.task_id == task_id), None)
    if not task:
        await callback.answer('Задача не найдена', show_alert=True)
        return

    await callback.message.answer(build_task_card_text(task), reply_markup=task_actions(task.task_id))
    await callback.answer('Открыла задачу')


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
