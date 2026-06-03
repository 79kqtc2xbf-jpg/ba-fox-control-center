# Stage 11 ChatGPT Task Intake Plan

## Goal

Allow Lisa to send tasks through ChatGPT in natural language while preserving safe write boundaries.

## Architecture Options

### Option A: Structured JSON For Manual Paste

ChatGPT converts notes into task JSON. Lisa reviews and pastes/imports manually.

This is the safest first option.

### Option B: Future Connector/API Call

ChatGPT calls a BA Fox endpoint only if a connector or approved API bridge exists.

Required guards:

- `ACTION_TOKEN`
- `SAFE_WRITE_MODE=true`
- allowlisted fields only
- AuditLog

### Option C: Batch Task Import

ChatGPT prepares a batch import for Google Sheets review.

Batch import must remain review-first. No direct batch write route should be added until a separate safety stage.

## Safe JSON Schema

```json
{
  "title": "",
  "organization": "",
  "nextAction": "",
  "deadline": "",
  "priority": "",
  "category": "",
  "source": "ChatGPT"
}
```

Only `title` and `nextAction` are required for task creation.

## Examples

### Raw Note To Task

Input:

```text
Напомни написать Chanda по встрече завтра.
```

Output:

```json
{
  "title": "Написать Chanda по встрече",
  "organization": "Chanda",
  "nextAction": "Написать Chanda по встрече",
  "deadline": "tomorrow",
  "priority": "",
  "category": "communication",
  "source": "ChatGPT"
}
```

### Meeting Notes To Tasks

Input:

```text
После звонка: отправить deck Sber, уточнить KYC у партнера, проверить дату следующей встречи.
```

Output:

```json
[
  {
    "title": "Отправить deck Sber",
    "organization": "Sber",
    "nextAction": "Отправить deck Sber",
    "deadline": "",
    "priority": "",
    "category": "presentation",
    "source": "ChatGPT"
  },
  {
    "title": "Уточнить KYC у партнера",
    "organization": "",
    "nextAction": "Уточнить KYC у партнера",
    "deadline": "",
    "priority": "",
    "category": "documents",
    "source": "ChatGPT"
  }
]
```

### Daily Plan To Tasks

ChatGPT can split a daily plan into single-action tasks and mark uncertain fields blank.

### Follow-Up List To Tasks

Each follow-up should become one task with category `communication` or `waiting`.

## Stage 11.1+ Implementation Notes

- Start with manual JSON export/import.
- Add validation before any endpoint call.
- Keep batch operations out of the write API until separately approved.
