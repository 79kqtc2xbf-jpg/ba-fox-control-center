from __future__ import annotations

from datetime import date, datetime, timedelta

from aiogram import Router, F
from aiogram.filters import Command, CommandStart
from aiogram.types import CallbackQuery, Message

from bot.config import settings
from bot.keyboards import add_task_preview_keyboard, dashboard_keyboard, main_menu, reports_keyboard, task_actions, task_list_keyboard
from services.google_sheets import GoogleSheetsTaskStore, Task
from services.report_builder import build_daily_report

router = Router()
store = GoogleSheetsTaskStore(settings.google_sheet_id)

# MVP in-memory state. Good enough for local testing; later move to Redis/DB.
awaiting_task_text: set[int] = set()
pending_tasks: dict[int, Task] = {}


def _task_name(task: Task) -> str:
    org = f'{task.organization} — ' if task.organization else ''
    return f'{org}{task.title}'


def _is_open(task: Task) -> bool:
    return task.status not in {'Выполнено'}


def _is_high(task: Task) -> bool:
    return task.priority.strip().lower() == 'высокий'


def _is_push(task: Task) -> bool:
    return task.status == 'Пуш'


def _is_wait(task: Task) -> bool:
    text = f'{task.category} {task.status} {task.deadline}'.lower()
    return 'wait' in text or 'ждём' in text or 'ждем' in text or task.status in {'Ждём ответ', 'Пуш'}


def _is_document(task: Task) -> bool:
    return 'документац' in task.category.lower()


def _is_mail(task: Task) -> bool:
    return 'письм' in task.category.lower() or _is_push(task)


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


def _guess_category(raw: str) -> str:
    text = raw.lower()
    if any(word in text for word in ['документ', 'kyc', 'kyb', 'анкета', 'договор', 'выписк', 'пакет']):
        return '📄 Документация'
    if any(word in text for word in ['письмо', 'написать', 'ответить', 'пуш', 'follow', 'оффер', 'рассылк', 'remy bank']):
        return '💌 Письма'
    if any(word in text for word in ['созвон', 'звонок', 'встреч', 'коммуникац', 'контакт', 'канал', 'напомнить']):
        return '📞 Коммуникация'
    if any(word in text for word in ['собесед', 'кандидат', 'hr', 'дубна']):
        return '🤝 HR'
    if any(word in text for word in ['оплат', 'пошлин', 'офис', 'поддержк', 'инвойс']):
        return '🌈 Дополнительные задачи'
    if 'теодор' in text:
        return '❤️ Напоминания для Теодора'
    return '🌈 Дополнительные задачи'


def _guess_organization(raw: str) -> str:
    known = [
        'Bitazza', 'Betaza', 'BCEL', 'Super Rich Exchange', 'Super Rich', 'Niche', 'P3 Estates',
        'P3 Estate', 'GLN', 'BKL', 'JDB', 'APEC', 'Shobana', 'Flow official docs', 'Flow',
        'Prominds Laos', 'Prominds', 'Remy Bank', 'RaidX', 'Raidx', 'EcomCharge',
        'E com charge', 'E com', 'BOL', 'Kasikorn', 'Epay', 'Sansiri', 'SunSiri',
        'Trisara', 'Sber', 'Недвижимость',
    ]
    lower = raw.lower()
    aliases = {
        'betaza': 'Bitazza',
        'p3 estate': 'P3 Estates',
        'sunsiri': 'Sansiri',
        'raidx': 'RaidX',
        'e com charge': 'EcomCharge',
    }
    for item in known:
        if item.lower() in lower:
            return aliases.get(item.lower(), item)
    # Simple fallback: take text before dash if user wrote “Org — task”.
    for sep in [' — ', ' - ', ':']:
        if sep in raw:
            candidate = raw.split(sep, 1)[0].strip()
            if 2 <= len(candidate) <= 40:
                return aliases.get(candidate.lower(), candidate)
    return ''


def _guess_priority(raw: str) -> str:
    text = raw.lower()
    if any(word in text for word in ['срочно', 'важно', 'сегодня', 'до конца дня', 'обязательно']):
        return 'Высокий'
    if any(word in text for word in ['когда будет время', 'не срочно', 'потом', 'можно позже']):
        return 'Низкий'
    return 'Средний'


def _guess_deadline(raw: str) -> str:
    text = raw.lower()
    if 'завтра' in text:
        return 'Завтра'
    if any(word in text for word in ['сегодня', 'срочно', 'до конца дня']):
        return 'Сегодня'
    return 'Сегодня'


def _guess_status(raw: str) -> str:
    text = raw.lower()
    if any(word in text for word in ['блокер', 'blocked', 'не проходят', 'нет ответа от контакта', 'нет прозрачности']):
        return 'Блокер'
    if 'пуш' in text or 'напомнить' in text or 'follow' in text:
        return 'Пуш'
    if 'жд' in text or 'ожида' in text:
        return 'Ждём ответ'
    return 'Не начато'


def _status_from_section_header(raw: str) -> str | None:
    text = raw.strip().lower()
    if not text:
        return None
    if 'to do' in text or text == 'todo':
        return 'Не начато'
    if 'in progress' in text:
        return 'В работе'
    if 'done' in text or 'almost' in text:
        return 'Выполнено'
    if 'blocked' in text or 'blocker' in text:
        return 'Блокер'
    return None


def _split_manual_task_input(raw: str) -> list[tuple[str, str | None]]:
    """Split one Telegram message into separate task rows.

    Supports Lisa's usual format with section headers:
    TO DO / IN PROGRESS / DONE / BLOCKED.
    """
    result: list[tuple[str, str | None]] = []
    current_status: str | None = None

    for line in raw.splitlines():
        cleaned = line.strip()
        if not cleaned:
            continue

        header_status = _status_from_section_header(cleaned.strip('🟡🟢⚫✅🔄⚠️: '))
        if header_status:
            current_status = header_status
            continue

        cleaned = cleaned.lstrip('•-–—* ').strip()
        if not cleaned:
            continue

        result.append((cleaned, current_status))

    if not result and raw.strip():
        result.append((raw.strip(), None))

    return result


def _build_steps(category: str, organization: str, title: str) -> str:
    if 'Документац' in category:
        return (
            '1. Открыть папку/переписку по задаче.\n'
            '2. Проверить, что уже есть.\n'
            '3. Найти недостающее.\n'
            '4. Дособрать или запросить документы.\n'
            '5. Обновить статус в боте.'
        )
    if 'Письм' in category:
        return (
            '1. Найти последнюю переписку.\n'
            '2. Проверить контекст и кому мы должны ответить.\n'
            '3. Подготовить короткий текст.\n'
            '4. Отправить письмо/пуш.\n'
            '5. Обновить статус.'
        )
    if 'Коммуникац' in category or 'Напоминания' in category:
        return (
            '1. Найти нужный контакт/чат.\n'
            '2. Сформулировать короткое сообщение.\n'
            '3. Отправить или передать на согласование.\n'
            '4. Зафиксировать ответ/следующий шаг.\n'
            '5. Обновить статус.'
        )
    return (
        '1. Уточнить контекст задачи.\n'
        '2. Сделать первый практический шаг.\n'
        '3. Зафиксировать результат.\n'
        '4. Обновить статус в боте.'
    )


def parse_free_task(raw: str, status_override: str | None = None) -> Task:
    today = date.today().isoformat()
    stamp = datetime.now().strftime('%Y%m%d%H%M%S%f')
    category = _guess_category(raw)
    organization = _guess_organization(raw)
    title = raw.strip()
    if organization and title.lower().startswith(organization.lower()):
        title = title[len(organization):].lstrip(' —-:') or raw.strip()

    return Task(
        task_id=f'EA-MANUAL-{stamp}',
        task_date=today,
        category=category,
        organization=organization,
        title=title[:180],
        steps=_build_steps(category, organization, title),
        source='Telegram manual fast-add',
        priority=_guess_priority(raw),
        deadline=_guess_deadline(raw),
        reminder_mode='Комбо',
        status=status_override or _guess_status(raw),
        next_reminder=(datetime.now() + timedelta(hours=1)).strftime('%Y-%m-%d %H:%M'),
        result='',
        channel='Telegram',
    )


def build_add_task_preview(task: Task) -> str:
    return (
        '🦊 <b>Я поняла задачу так:</b>\n\n'
        f'Категория: {task.category}\n'
        f'Организация: {task.organization or "—"}\n'
        f'Задача: <b>{task.title}</b>\n'
        f'Приоритет: {task.priority}\n'
        f'Дедлайн: {task.deadline}\n'
        f'Статус: {task.status}\n\n'
        f'<b>Шаги:</b>\n{task.steps}\n\n'
        'Добавить в таблицу?'
    )


async def _delete_user_message_safely(message: Message) -> None:
    try:
        await message.delete()
    except Exception:
        # In private chats this should usually work. If Telegram refuses deletion,
        # silently continue so task creation is not blocked.
        return


def build_dashboard_text(tasks: list[Task]) -> str:
    if not tasks:
        return 'На сегодня задач пока нет. Пришли план в ChatGPT, и я появлюсь с чек-листом 🦊'

    open_tasks = [task for task in tasks if _is_open(task)]
    done_tasks = [task for task in tasks if task.status == 'Выполнено']
    push_tasks = [task for task in open_tasks if _is_push(task)]
    focus_pool = [task for task in open_tasks if _is_high(task) and not _is_push(task)]
    urgent_pool = [task for task in open_tasks if _is_high(task) and not _is_push(task)]

    focus_tasks = focus_pool[:3] or [task for task in open_tasks if not _is_push(task)][:3]
    urgent_tasks = [task for task in urgent_pool if task not in focus_tasks][:2]

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
        lines.extend(_short_items(push_tasks, 4))
        if len(push_tasks) > 4:
            lines.append(f'• ещё {len(push_tasks) - 4}')
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
            'Блокер': '⚫',
        }.get(task.status, '▫️')
        priority_icon = '🔥 ' if _is_high(task) and not _is_push(task) else ''
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


async def send_daily_summary(message: Message) -> None:
    tasks = await store.get_today_tasks()
    report = build_daily_report(tasks)
    await message.answer('Черновик итогов для проверки:')
    await message.answer(f'<pre>{report}</pre>')
    await message.answer('Проверь текст. После правок можно будет копировать или позже добавить отправку в рабочий чат после подтверждения.')


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


@router.message(F.text == '➕ Добавить задачу')
async def add_task_start(message: Message) -> None:
    awaiting_task_text.add(message.chat.id)
    await message.answer(
        'Напиши задачу как удобно — одним сообщением, без шаблона.\n\n'
        'Можно прислать одну задачу или список по строкам.\n'
        'Я сразу добавлю задачи в таблицу без отдельного подтверждения.\n\n'
        'Примеры:\n'
        '• BCEL завтра напомнить про PromptPay\n'
        '• Теодору сказать про EcomCharge\n'
        '• Bitazza дослать документы сегодня'
    )


@router.message(lambda message: message.chat.id in awaiting_task_text and message.text)
async def add_task_receive_text(message: Message) -> None:
    if not message.text:
        return

    awaiting_task_text.discard(message.chat.id)
    raw_text = message.text
    task_inputs = _split_manual_task_input(raw_text)
    created_tasks: list[Task] = []

    try:
        for task_text, status_override in task_inputs:
            task = parse_free_task(task_text, status_override=status_override)
            await store.append_task(task)
            created_tasks.append(task)
    except Exception as exc:
        await message.answer(
            '⚠️ Не смогла добавить задачу в таблицу.\n'
            f'Ошибка: <code>{type(exc).__name__}</code>\n\n'
            'Задачи не потеряны — пришли их сюда, и я помогу перенести вручную.'
        )
        return

    await _delete_user_message_safely(message)

    if len(created_tasks) == 1:
        task = created_tasks[0]
        await message.answer(
            f'✅ Добавила в таблицу: <b>{_task_name(task)}</b>\n'
            f'Статус: {task.status} · Категория: {task.category}'
        )
        return

    lines = [f'✅ Добавила в таблицу задач: <b>{len(created_tasks)}</b>', '']
    for task in created_tasks[:12]:
        lines.append(f'• {_task_name(task)} — {task.status}')
    if len(created_tasks) > 12:
        lines.append(f'• ещё {len(created_tasks) - 12}')
    await message.answer('\n'.join(lines))


@router.callback_query(F.data == 'addtask:confirm')
async def add_task_confirm(callback: CallbackQuery) -> None:
    task = pending_tasks.get(callback.message.chat.id)
    if not task:
        await callback.answer('Черновик задачи не найден. Нажми ➕ Добавить задачу ещё раз.', show_alert=True)
        return
    await store.append_task(task)
    pending_tasks.pop(callback.message.chat.id, None)
    await callback.answer('Задача добавлена')
    await callback.message.answer(f'✅ Добавила в таблицу: <b>{_task_name(task)}</b>')


@router.callback_query(F.data == 'addtask:rewrite')
async def add_task_rewrite(callback: CallbackQuery) -> None:
    pending_tasks.pop(callback.message.chat.id, None)
    awaiting_task_text.add(callback.message.chat.id)
    await callback.answer('Окей, напиши заново')
    await callback.message.answer('Напиши задачу заново как удобно. Я сразу добавлю её в таблицу без отдельного подтверждения.')


@router.callback_query(F.data == 'addtask:cancel')
async def add_task_cancel(callback: CallbackQuery) -> None:
    pending_tasks.pop(callback.message.chat.id, None)
    awaiting_task_text.discard(callback.message.chat.id)
    await callback.answer('Отменила')
    await callback.message.answer('Окей, задачу не добавляю.')


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


@router.message(F.text == '📥 Отчёты')
async def reports_menu(message: Message) -> None:
    await message.answer('Выбери, какой отчёт собрать:', reply_markup=reports_keyboard())


@router.message(F.text == '📝 Собрать итоги')
async def daily_summary(message: Message) -> None:
    await send_daily_summary(message)


@router.callback_query(F.data == 'reports:daily')
async def daily_summary_callback(callback: CallbackQuery) -> None:
    await callback.answer('Собираю итоги')
    await send_daily_summary(callback.message)


@router.callback_query(F.data == 'reports:meetings')
async def meetings_report_callback(callback: CallbackQuery) -> None:
    await callback.answer('Раздел готовится')
    await callback.message.answer('Раздел отчётов встреч готовится. Сюда будут попадать Read AI, Gemini и Zoom summaries.')


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
