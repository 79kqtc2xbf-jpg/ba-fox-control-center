from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Literal


TaskStatus = Literal['Не начато', 'В работе', 'Ждём ответ', 'Пуш', 'Выполнено', 'Перенести']


@dataclass
class Task:
    task_id: str
    task_date: str
    category: str
    organization: str
    title: str
    steps: str
    source: str
    priority: str
    deadline: str
    reminder_mode: str
    status: TaskStatus
    next_reminder: str
    result: str
    channel: str


class GoogleSheetsTaskStore:
    """Google Sheets adapter.

    MVP note:
    This class currently contains safe in-memory stubs so the Telegram bot skeleton
    can run before Google credentials are connected. The next implementation step is
    to replace these methods with Google Sheets API calls.
    """

    def __init__(self, spreadsheet_id: str):
        self.spreadsheet_id = spreadsheet_id

    async def get_today_tasks(self) -> list[Task]:
        today = date.today().isoformat()
        return [
            Task(
                task_id='DEMO-001',
                task_date=today,
                category='💌 Письма',
                organization='JDB',
                title='Проверить ответ по QR',
                steps='1. Открыть Gmail.\n2. Найти последнюю цепочку JDB.\n3. Проверить ответ.\n4. Если ответа нет — подготовить пуш.\n5. Отметить статус.',
                source='Demo',
                priority='Высокий',
                deadline='Сегодня',
                reminder_mode='Комбо',
                status='Не начато',
                next_reminder=(datetime.now() + timedelta(hours=1)).strftime('%Y-%m-%d %H:%M'),
                result='',
                channel='Telegram',
            )
        ]

    async def update_task_status(self, task_id: str, status: TaskStatus, comment: str = '') -> None:
        print(f'[GoogleSheetsTaskStore] update {task_id=} {status=} {comment=}')

    async def get_open_tasks(self) -> list[Task]:
        tasks = await self.get_today_tasks()
        return [task for task in tasks if task.status not in {'Выполнено'}]
