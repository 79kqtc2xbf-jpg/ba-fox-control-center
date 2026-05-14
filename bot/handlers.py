from aiogram import Router, F
from aiogram.filters import Command, CommandStart
from aiogram.types import CallbackQuery, Message

from bot.config import settings
from bot.keyboards import dashboard_keyboard, main_menu, task_actions, task_list_keyboard
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
    return 'коммуникац' in task.category.lower()


def _is_extra(task: Task) -> bool:
    return 'доп' in task.category.lower()


def _is_hr(task: Task) -> bool:
    return 'hr' in task.category.lower()


def _is_theodor(task: Task) -> bool:
    return 'теодор' in task.category.lower() or 'теодор' in task.organization.lower()


def _short_items(tasks: list[Task], limit: int = 3) -> list[str]:
    return [f'• {_task_name(task)}' for task in tasks[:limit]]


def _counts(tasks: list[Task]) -> dict[str, int]:
    open_tasks = [task for task in tasks if _is_open(task)]
    return {
        'all': len(open_tasks),
        'docs': len([task for task in open_tasks if _is_document(task)]),
        'mail': len([task for task in open_tasks if _is_mail(task)]),
        'comm': len([task for task in open_tasks if _is_communication(task)]),
        'wait': len([task for task in open_tasks if _is_wait(task)]),
        'extra': len([task for task in open_tasks if _is_extra(task)]),
        'hr': len([task for task in open_tasks if _is_hr(task)]),
        'theodor': len([task for task in open_tasks if _is_theodor(task)]),
    }


def _filter_tasks(tasks: list[Task], category_key: str) -> list[Task]:
    open_tasks = [task for task in tasks if _is_open(task)]
    if category_key == 'docs':
        return [task for task in open_tasks if _is_document(task)]
    if category_key == 'mail':
        return [task for task in open_tasks if _is_mail(task)]
    if category_key == 'comm':
        return [task for task in open_tasks if _is_communication(task)]
    if category_key == 'wait':
        return [task for task in open_tasks if _is_wait(task)]
    if category_key == 'extra':
        return [task for task in open_tasks if _is_extra(task)]
    if category_key == 'hr':
        return [task for task in open_tasks if _is_hr(task)]
    if category_key == 'theodor':
        return [task for task in open_tasks if _is_theodor(task)]
    return open_tasks


def build_dashboard_text(tasks: list[Task]) -> str:
    if not tasks:
        return 'На сегодня задач пока нет. Пришли план в ChatGPT, и я появлюсь с чек-листом 🦊'

    open_tasks = [task for task in tasks if _is_open(task)]
    done_tasks = [task for task in tasks if task.status == 'Выполнено']
    high_open = [task for task in open_tasks if _is_high(task)]
    push_tasks = [task for task in open_tasks if task.status == 'Пуш']

    focus_tasks = high_open[:3] or open_tasks[:3]
    urgent_tasks = [task for task in high_open if task not in focus_tasks][:2]

    lines = [
        '🦊 <b>EA Fox Dashboard</b>',
        f'Открыто: <b>{len(open_tasks)}</b> · закрыто: <b>{len(done_tasks)}</b> · всего: <b>{len(tasks)}</b>',
        '',
    ]

    if focus_tasks:
        lines.append('🔥 <b>Фокус</b>')
        lines.extend(_short_items(focus_tasks, 3))
        lines.append('')

    if urgent_tasks:
        lines.append('⚠️ <b>Срочно сегодня</b>')
        lines.extend(_short_items(urgent_tasks, 2))
        lines.append('')

    if push_tasks:
        lines.append('📣 <b>Пуш</b>')
        lines.extend(_short_items(push_tasks, 3))
        if len(push_tasks) > 3:
            lines.append(f'• ещё {len(push_tasks) - 3}')
        lines.append('')

    lines.append('Ниже — разделы задач. Нажми кнопку, чтобы открыть список по блоку.')
    return '\n'.join(lines)


def build_category_text(tasks: list[Task], category_key: str) -> str:
    titles = {
        'docs': '📄 Документы',
        'mail': '💌 Почта / пуши',
        'comm': '📞 Коммуникация',
        'wait': '⏳ Ждём / контроль',
        'extra': '🌈 Дополнительные задачи',
        'hr': '🤝 HR',
        'theodor': '❤️ Теодор',
        'all': '🗂 Все открытые задачи',
    }
    title = titles.get(category_key, '🗂 Задачи')
    if not tasks:
        return f'{title}\n\nЗдесь пока нет открытых задач.'

    lines = [f'<b>{title}</b> · {len(tasks)} шт.', '']
    for index, task in enumerate(tasks, start=1):
        status_icon = {
            'В работе': '🟡',
            'Ждём ответ': '⏳',
            'Пуш': '📣',
            'Перенести': '🔁',
        }.get(task.status, '▫️')
        priority_icon = '🔥 ' if _is_high(task) else ''
        lines.append(f'{index}. {status_icon} {priority_icon}{_task_name(task)}')
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
        'Буду помогать с задачами, напоминаниями и итогами EA.\n\n'
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
    text = build_dashboard_text(tasks)
    keyboard = dashboard_keyboard(_counts(tasks)) if tasks else None
    await message.answer(text, reply_markup=keyboard)


@router.callback_query(F.data == 'tasks:refresh')
async def refresh_tasks(callback: CallbackQuery) -> None:
    tasks = await store.get_today_tasks()
    text = build_dashboard_text(tasks)
    keyboard = dashboard_keyboard(_counts(tasks)) if tasks else None
    await callback.message.answer(text, reply_markup=keyboard)
    await callback.answer('Дашборд обновлён')


@router.callback_query(F.data.startswith('cat:'))
async def category_tasks(callback: CallbackQuery) -> None:
    _, category_key = callback.data.split(':', maxsplit=1)
    all_tasks = await store.get_today_tasks()
    tasks = _filter_tasks(all_tasks, category_key)
    text = build_category_text(tasks, category_key)
    keyboard = task_list_keyboard(tasks) if tasks else dashboard_keyboard(_counts(all_tasks))
    await callback.message.answer(text, reply_markup=keyboard)
    await callback.answer('Открыла раздел')


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
