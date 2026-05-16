# BA Fox — Gmail Reconciliation Scenarios

## Purpose

This document describes how BA Fox should interpret Gmail activity against current EA tasks.

The goal is to convert email context into clear operational decisions:

```text
latest email → action owner → recommended status → next step → control date → follow-up draft
```

This is Stage 4.0.1 preparation. It does not implement the Telegram button yet.

## Core rule

BA Fox should not simply say:

```text
waiting / no answer / in progress
```

It should say:

```text
who owns the next action → what needs to happen → when to control → what to update in the task
```

## Reconciliation categories

Every checked task should fall into one of these buckets:

```text
🔥 Action is on us
📣 Push / counterparty owes reply
⏳ Wait list / fixed external dependency
⚠️ Blocker / managed risk
✅ Done / closed managerially
❓ Needs clarification
```

## Scenario 1 — Latest email is from counterparty

### Meaning

If the latest relevant email is incoming from a partner, bank, vendor or counterparty, Lisa/team likely owes the next action.

### Recommended status

```text
В работе
```

### Comment format

```text
Получен ответ от [counterparty] [date]; действие за нами: [next action]. Контроль: [date].
```

### Example

```text
Bitazza — получены additional KYB requirements; действие за нами: исправить формы и отправить пакет документов. Контроль: сегодня / следующий рабочий день.
```

### Telegram bucket

```text
🔥 Action is on us
```

## Scenario 2 — Latest email is from Lisa / MF team

### Meaning

If the last relevant message was sent by Lisa/team, the counterparty likely owes the next reply.

### Recommended status

```text
Пуш
```

or, if there is a clear agreed external review period:

```text
Ждём ответ
```

### Comment format

```text
Последнее письмо отправлено [date]; контроль ответа до [date], затем follow-up / альтернативный канал.
```

### Example

```text
BCEL — последнее наше уточнение по BCEL Pay / Lao QR отправлено 05.05; отправить follow-up и контролировать ответ до понедельника.
```

### Telegram bucket

```text
📣 Push / counterparty owes reply
```

## Scenario 3 — No relevant recent email found

### Meaning

If no relevant thread is found in Gmail, do not mark the task as invisible waiting.

Possible interpretations:

1. communication is in WhatsApp / Telegram / another channel;
2. wrong search keyword;
3. task is outdated;
4. task needs alternative contact;
5. interaction should be closed managerially.

### Recommended status

```text
Пуш
```

or:

```text
Нужно уточнить канал
```

or:

```text
Выполнено / закрыто управленчески
```

### Comment format

```text
Свежей Gmail-цепочки не найдено; проверить альтернативный канал / контакт. Если ответа нет после контроля — закрыть или эскалировать.
```

### Example

```text
P3 Estates — свежего входящего ответа в Gmail нет; следующий шаг: push + альтернативный senior contact.
```

### Telegram bucket

```text
📣 Push / alternative channel
```

## Scenario 4 — Email confirms vendor cannot provide requested product

### Meaning

If email confirms that the requested product/service is unavailable, this is not a dragging task. It is a result.

### Recommended status

```text
Выполнено
```

or:

```text
Wait list / зафиксировано
```

depending on whether the task is fully closed.

### Comment format

```text
Результат зафиксирован: [vendor] не предоставляет [product/service]. Дальнейшее действие не требуется / нужен альтернативный поставщик.
```

### Example

```text
JDB virtual card — зафиксировано, что у JDB виртуальной карты нет.
```

### Telegram bucket

```text
✅ Done / closed managerially
```

## Scenario 5 — Email shows internal dependency

### Meaning

If the email thread shows that the next step depends on an internal person, money, approval, document, or decision, the task should not be described as passive waiting.

### Recommended status

```text
В работе
```

or:

```text
Блокер
```

### Comment format

```text
Зависимость: [internal dependency]. Следующее действие: [remind / get approval / provide resource]. Контроль: [date].
```

### Example

```text
APEC — ожидается решение по Австралии; действие за нами: напомнить Андрею и проверить трек-статус.
```

### Telegram bucket

```text
⚠️ Blocker / managed risk
```

or:

```text
🔥 Action is on us
```

## Scenario 6 — Email shows external blocker

### Meaning

If external party, payment issue, support, platform or compliance blocks progress, show it as managed risk.

### Recommended status

```text
Блокер
```

or:

```text
Ждём ответ
```

only with a control date.

### Comment format

```text
Блокер: [issue]. Что делаем: [action]. Следующий контроль: [date].
```

### Example

```text
Пошлина США — оплата не проходит; написали в поддержку, параллельно ищем альтернативный способ оплаты. Контроль: понедельник.
```

### Telegram bucket

```text
⚠️ Blocker / managed risk
```

## Scenario 7 — Task is complete but not marked complete

### Meaning

If email confirms delivery, submission, acknowledgement or final decision, the task can be closed or moved to wait list.

### Recommended status

```text
Выполнено
```

or:

```text
Ждём ответ
```

if the submission is complete but external review remains.

### Comment format

```text
Этап закрыт: [what was sent/done]. Следующий статус: [external review / no further action].
```

### Example

```text
JDB documents — документы отправлены; текущий этап закрыт, дальше внешняя проверка.
```

### Telegram bucket

```text
✅ Done / closed managerially
```

or:

```text
⏳ Wait list / external review
```

## Scenario 8 — Task is high priority and no email movement

### Meaning

If a high-priority task has no recent email movement, it should surface as operational risk.

### Recommended status

```text
Пуш
```

or:

```text
В работе
```

if Lisa needs to prepare the first outgoing message.

### Comment format

```text
Свежего движения по почте нет; задача остаётся в фокусе. Следующее действие: [send / call / alternate channel].
```

### Example

```text
Super Rich — оффер не отправлен; действие за нами: подготовить и отправить оффер, затем перевести в Пуш.
```

### Telegram bucket

```text
🔥 Action is on us
```

## Scenario 9 — Thread is unclear or task context is unknown

### Meaning

If the task or email is unclear, do not force it into focus.

### Recommended status

```text
Нужно уточнить
```

### Comment format

```text
Найдено письмо/упоминание, но контекст задачи не подтверждён. Нужна проверка: что это за заявка / продукт / аккаунт.
```

### Example

```text
PayConnect — найдено письмо Update Your Application Information, но Lisa не помнит контекст. Не добавлять в активный фокус до уточнения.
```

### Telegram bucket

```text
❓ Needs clarification
```

## Scenario 10 — Interaction intentionally closed

### Meaning

If Lisa decides not to continue communication after no response, this is a managerial closure.

### Recommended status

```text
Выполнено
```

### Comment format

```text
Взаимодействие закрыто: ответа нет, дальше не продолжаем.
```

### Example

```text
Shobana / India — взаимодействие закрыто, дальше не продолжаем.
```

### Telegram bucket

```text
✅ Done / closed managerially
```

## Recommended reconciliation output format

For ChatGPT/manual hybrid MVP, return reconciliation like this:

```text
📬 Gmail reconciliation

🔥 Действие за нами
• [Task] — [email finding] → [next action] → [control date]

📣 Пуш / ответ за контрагентом
• [Task] — [last sent date] → [follow-up needed] → [control date]

⚠️ Блокеры / управление рисками
• [Task] — [blocker] → [what we do] → [next check]

⏳ Wait list / внешние зависимости
• [Task] — [fixed dependency / external review]

✅ Закрыть / закрыто управленчески
• [Task] — [closure reason]

❓ Нужно уточнить
• [Task] — [unclear context]
```

## Table update recommendation format

For each task, recommend updates as:

```text
Task: [organization / title]
Current status: [status]
Recommended status: [status]
Comment/result: [owner-style comment]
Next reminder/control: [date/time]
Confidence: high / medium / low
Needs Lisa confirmation: yes/no
```

## Status mapping summary

```text
Latest incoming from counterparty → В работе
Latest outgoing from Lisa/team → Пуш / Ждём ответ with control date
No Gmail movement → Пуш / alternative channel / clarify
Vendor says unavailable → Выполнено or Wait list
Internal dependency → В работе / Блокер
External blocker → Блокер with next action
Submitted and waiting review → Ждём ответ / Wait list
No response and Lisa closes → Выполнено
Unclear context → Нужно уточнить
```

## Approved MVP behavior

During hybrid MVP:

- ChatGPT performs Gmail analysis.
- Telegram bot shows tasks and status UI.
- Google Sheet remains source of truth.
- Sheet updates happen only after Lisa confirms.
- Emails are never auto-sent.
- Gmail API inside bot is deferred.

## Next step

After this scenarios document, prepare:

```text
Stage 4.0.2 — Follow-up template library
```
