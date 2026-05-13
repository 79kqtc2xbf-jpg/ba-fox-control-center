from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from aiogram import Bot

from bot.config import settings
from services.google_sheets import GoogleSheetsTaskStore


async def send_open_task_reminders(bot: Bot, store: GoogleSheetsTaskStore) -> None:
    if not settings.telegram_owner_chat_id:
        return

    tasks = await store.get_open_tasks()
    if not tasks:
        await bot.send_message(settings.telegram_owner_chat_id, '🦊 Все задачи закрыты. Можно выдохнуть.')
        return

    lines = ['Лиза, проверяем открытые задачи 💛']
    for task in tasks:
        lines.append(f'• {task.title} — {task.status}')

    await bot.send_message(settings.telegram_owner_chat_id, '\n'.join(lines))


def build_scheduler(bot: Bot, store: GoogleSheetsTaskStore) -> AsyncIOScheduler:
    timezone = ZoneInfo(settings.timezone)
    scheduler = AsyncIOScheduler(timezone=timezone)

    # MVP: fixed checkpoint reminders. Task-level reminders come next.
    for time_value in [settings.midday_check_time, settings.push_check_time, settings.evening_report_time]:
        hour, minute = [int(part) for part in time_value.split(':')]
        scheduler.add_job(
            send_open_task_reminders,
            trigger='cron',
            hour=hour,
            minute=minute,
            args=[bot, store],
            id=f'checkpoint_{time_value}',
            replace_existing=True,
        )

    return scheduler
