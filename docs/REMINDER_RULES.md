# BA Fox — Reminder Rules

## Current approved rule

Lisa confirmed the reminder logic:

```text
Рабочие — только будние.
Личные — каждый день.
```

## Work reminders

Work / EA reminders should run only on weekdays:

```text
Monday, Tuesday, Wednesday, Thursday, Friday
```

Default work reminder time:

```text
10:00 Europe/Amsterdam
```

Purpose:

- open BA Fox;
- review today's EA focus;
- start with urgent document tasks;
- then move to emails, follow-ups, pushes and controlled blockers.

## Personal reminders

Personal reminders should run every day.

Default personal reminder time:

```text
14:00 Europe/Amsterdam
```

Current personal task block:

- order Nikita's shampoo, conditioner and styling gel;
- open oils and record a review;
- buy / order a kettle;
- order cat litter;
- check the Tuleo diffuser.

## Implementation note

When creating or updating reminders:

- work reminders must use weekday-only recurrence;
- personal reminders must use daily recurrence;
- do not mix work and personal tasks in the same reminder;
- keep work and personal task lists visually separate in reports and bot logic.
