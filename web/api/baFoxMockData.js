(function (global) {
  const scaffoldInfo = {
    version: 'v2.6a-mock-client',
    dryRun: true,
    readLiveSheets: true,
    liveAutomationEnabled: false,
    triggersEnabled: false,
    source: 'mock',
  };

  const tasks = [
    {
      id: 'MOCK-001',
      title: 'Подготовить пакет документов для партнера',
      organization: 'Demo Partner',
      priority: 'High',
      status: 'В работе',
      taskType: 'work',
      deadline: '2026-05-25',
      nextReminder: '',
      comment: 'Mock data only',
      archived: false,
    },
    {
      id: 'MOCK-002',
      title: 'Уточнить обратную связь по интеграции',
      organization: 'Demo Bank',
      priority: 'High',
      status: 'Ждём ответ',
      taskType: 'work',
      deadline: '2026-05-25',
      nextReminder: '2026-05-25',
      comment: 'Mock data only',
      archived: false,
    },
    {
      id: 'MOCK-003',
      title: 'Напомнить о следующем шаге',
      organization: 'Demo Vendor',
      priority: 'Medium',
      status: 'Пуш',
      taskType: 'work',
      deadline: '2026-05-25',
      nextReminder: '2026-05-25',
      comment: 'Mock data only',
      archived: false,
    },
    {
      id: 'MOCK-004',
      title: 'Проверить недостающий документ',
      organization: 'Demo Project',
      priority: 'High',
      status: 'Блокер',
      taskType: 'work',
      deadline: '2026-05-26',
      nextReminder: '',
      comment: 'Mock data only',
      archived: false,
    },
    {
      id: 'MOCK-005',
      title: 'Прояснить владельца задачи',
      organization: 'Demo Team',
      priority: 'Medium',
      status: 'Нужно уточнить',
      taskType: 'work',
      deadline: '2026-05-26',
      nextReminder: '',
      comment: 'Mock data only',
      archived: false,
    },
    {
      id: 'MOCK-006',
      title: 'Закрытый пример для истории',
      organization: 'Demo Archive',
      priority: 'Low',
      status: 'Выполнено',
      taskType: 'work',
      deadline: '2026-05-24',
      nextReminder: '',
      comment: 'Mock data only',
      archived: false,
    },
  ];

  const cleanupAudit = {
    summary: {
      rowsChecked: 24,
      duplicateGroups: 1,
      nearDuplicateGroups: 2,
      nonCanonicalStatuses: 3,
      nonCanonicalPriorities: 2,
      missingV2Fields: 4,
      vagueDates: 3,
      activeLegacyRows: 2,
      archiveCandidates: 1,
    },
    items: [
      {
        rowNumber: 7,
        taskId: 'MOCK-002',
        issueType: 'STATUS_NORMALIZATION',
        currentValue: 'Waiting',
        proposedValue: 'Ждём ответ',
        confidence: 0.85,
        suggestedAction: 'NORMALIZE',
        needsLisaApproval: true,
        notes: 'Demo-only suggestion. No cleanup action is available in the UI.',
      },
      {
        rowNumber: 12,
        taskId: 'MOCK-009',
        issueType: 'NEAR_DUPLICATE',
        currentValue: 'Demo Bank / Уточнить обратную связь',
        proposedValue: '',
        confidence: 0.75,
        suggestedAction: 'REVIEW_REQUIRED',
        needsLisaApproval: true,
        notes: 'Same organization and normalized title appear elsewhere. Review only.',
      },
      {
        rowNumber: 18,
        taskId: 'MOCK-014',
        issueType: 'CORRUPTED_FIELD',
        currentValue: 'Deadline: Сегодня',
        proposedValue: '',
        confidence: 0.65,
        suggestedAction: 'REVIEW_REQUIRED',
        needsLisaApproval: true,
        notes: 'Human-readable date should be reviewed before a machine control date is added.',
      },
      {
        rowNumber: 22,
        taskId: 'MOCK-006',
        issueType: 'ARCHIVE_CANDIDATE',
        currentValue: 'Выполнено',
        proposedValue: 'Архив',
        confidence: 0.65,
        suggestedAction: 'ARCHIVE_AFTER_APPROVAL',
        needsLisaApproval: true,
        notes: 'Suggestion only. The dashboard does not archive or modify rows.',
      },
    ],
  };

  function clone(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function success(data) {
    return {
      ok: true,
      data: data,
      error: null,
    };
  }

  function getTodayData(date) {
    return {
      date: date || '2026-05-25',
      dryRun: true,
      readLive: true,
      tasks: tasks.slice(0, 3),
    };
  }

  function getOpenData(taskType) {
    return {
      taskType: taskType || 'all',
      dryRun: true,
      readLive: true,
      tasks: tasks.filter(function (task) {
        const open = task.status !== 'Выполнено';
        const typeMatches = !taskType || taskType === 'all' || task.taskType === taskType;
        return open && typeMatches;
      }),
    };
  }

  function getPushData(dateRange) {
    return {
      dateRange: dateRange || 'today',
      dryRun: true,
      readLive: true,
      tasks: tasks.filter(function (task) {
        return ['Ждём ответ', 'Пуш'].includes(task.status);
      }),
    };
  }

  function getResponse(route, params) {
    const input = params || {};

    switch (route) {
      case 'scaffoldInfo':
        return success(clone(scaffoldInfo));
      case 'today':
        return success(clone(getTodayData(input.date)));
      case 'open':
        return success(clone(getOpenData(input.taskType)));
      case 'pushes':
        return success(clone(getPushData(input.dateRange)));
      case 'dashboard':
        return success({
          scaffoldInfo: clone(scaffoldInfo),
          today: clone(getTodayData(input.date)),
          open: clone(getOpenData(input.taskType)),
          pushes: clone(getPushData(input.dateRange)),
        });
      case 'cleanupAudit':
        return success(clone(cleanupAudit));
      default:
        return {
          ok: false,
          data: null,
          error: {
            code: 'MOCK_ROUTE_NOT_FOUND',
            message: 'Unknown read-only mock route.',
            details: { route: route },
          },
        };
    }
  }

  global.BAFoxMockData = Object.freeze({
    getResponse,
  });
}(window));
