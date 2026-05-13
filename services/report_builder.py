from __future__ import annotations

from collections import defaultdict
from services.google_sheets import Task


def build_daily_report(tasks: list[Task]) -> str:
    """Build Lisa-style #итоги #ba draft from tasks."""
    completed = [task for task in tasks if task.status == 'Выполнено']
    waiting = [task for task in tasks if task.status in {'Ждём ответ', 'Пуш'}]
    postponed = [task for task in tasks if task.status == 'Перенести']

    by_category: dict[str, list[Task]] = defaultdict(list)
    for task in completed:
        by_category[task.category].append(task)

    lines: list[str] = ['#итоги #ba', '', 'Выполнено:']

    if not completed:
        lines.append('• Пока нет закрытых задач — нужно обновить статусы.')
    else:
        for category, items in by_category.items():
            lines.append('')
            lines.append(category)
            for task in items:
                result = task.result or task.title
                org = f'{task.organization} — ' if task.organization else ''
                lines.append(f'• {org}{result}')

    if waiting:
        lines.extend(['', '⛔️ Wait list:'])
        for task in waiting:
            org = f'{task.organization} — ' if task.organization else ''
            lines.append(f'• {org}{task.title}')

    if postponed:
        lines.extend(['', '➡️ Перенос:'])
        for task in postponed:
            org = f'{task.organization} — ' if task.organization else ''
            lines.append(f'• {org}{task.title}')

    return '\n'.join(lines)
