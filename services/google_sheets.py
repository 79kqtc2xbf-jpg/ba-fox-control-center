from __future__ import annotations

import json
import os
from dataclasses import dataclass
from datetime import date
from typing import Dict, List, Literal, Optional, Tuple

from google.oauth2 import service_account
from googleapiclient.discovery import build

from bot.config import settings


TaskStatus = Literal['Не начато', 'В работе', 'Ждём ответ', 'Пуш', 'Выполнено', 'Перенести']

SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
TASKS_RANGE = 'Tasks!A:N'


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
    row_number: Optional[int] = None


class GoogleSheetsTaskStore:
    """Google Sheets adapter for BA Fox tasks."""

    def __init__(self, spreadsheet_id: str):
        self.spreadsheet_id = spreadsheet_id
        self._service = None

    def _get_credentials(self):
        if settings.google_service_account_json:
            data = json.loads(settings.google_service_account_json)
            return service_account.Credentials.from_service_account_info(data, scopes=SCOPES)

        file_path = settings.google_service_account_file
        if not os.path.exists(file_path):
            raise FileNotFoundError(
                f'Google service account file not found: {file_path}. '
                'Create service-account.json or set GOOGLE_SERVICE_ACCOUNT_JSON.'
            )
        return service_account.Credentials.from_service_account_file(file_path, scopes=SCOPES)

    def _sheets(self):
        if self._service is None:
            credentials = self._get_credentials()
            self._service = build('sheets', 'v4', credentials=credentials)
        return self._service.spreadsheets()

    @staticmethod
    def _row_to_task(row: List[str], row_number: int) -> Task:
        values = row + [''] * (14 - len(row))
        return Task(
            task_id=values[0],
            task_date=values[1],
            category=values[2],
            organization=values[3],
            title=values[4],
            steps=values[5],
            source=values[6],
            priority=values[7],
            deadline=values[8],
            reminder_mode=values[9],
            status=(values[10] or 'Не начато'),
            next_reminder=values[11],
            result=values[12],
            channel=values[13],
            row_number=row_number,
        )

    async def get_all_tasks(self) -> list[Task]:
        response = self._sheets().values().get(
            spreadsheetId=self.spreadsheet_id,
            range=TASKS_RANGE,
        ).execute()
        rows = response.get('values', [])
        if len(rows) <= 1:
            return []

        tasks: list[Task] = []
        for index, row in enumerate(rows[1:], start=2):
            if not row or not any(str(cell).strip() for cell in row):
                continue
            tasks.append(self._row_to_task(row, row_number=index))
        return tasks

    async def get_today_tasks(self) -> list[Task]:
        today = date.today().isoformat()
        tasks = await self.get_all_tasks()
        return [task for task in tasks if task.task_date in {today, '', 'Сегодня'}]

    async def update_task_status(self, task_id: str, status: TaskStatus, comment: str = '') -> None:
        tasks = await self.get_all_tasks()
        target = next((task for task in tasks if task.task_id == task_id), None)
        if not target or target.row_number is None:
            raise ValueError(f'Task not found: {task_id}')

        updates = [
            {
                'range': f'Tasks!K{target.row_number}',
                'values': [[status]],
            }
        ]
        if comment:
            updates.append({
                'range': f'Tasks!M{target.row_number}',
                'values': [[comment]],
            })

        self._sheets().values().batchUpdate(
            spreadsheetId=self.spreadsheet_id,
            body={
                'valueInputOption': 'USER_ENTERED',
                'data': updates,
            },
        ).execute()

    async def get_open_tasks(self) -> list[Task]:
        tasks = await self.get_today_tasks()
        return [task for task in tasks if task.status not in {'Выполнено'}]

    async def append_task(self, task: Task) -> None:
        row = [[
            task.task_id,
            task.task_date,
            task.category,
            task.organization,
            task.title,
            task.steps,
            task.source,
            task.priority,
            task.deadline,
            task.reminder_mode,
            task.status,
            task.next_reminder,
            task.result,
            task.channel,
        ]]
        self._sheets().values().append(
            spreadsheetId=self.spreadsheet_id,
            range=TASKS_RANGE,
            valueInputOption='USER_ENTERED',
            insertDataOption='INSERT_ROWS',
            body={'values': row},
        ).execute()
