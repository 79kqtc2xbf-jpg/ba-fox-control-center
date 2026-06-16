(function (global) {
  const READ_ONLY_ROUTES = Object.freeze([
    'scaffoldInfo',
    'inbox',
    'focus',
    'today',
    'open',
    'pushes',
    'completed',
    'dashboard',
    'workspaceDashboard',
    'fullDashboard',
    'cleanupAudit',
    'safetyStatus',
  ]);
  const WRITE_ROUTES = Object.freeze([
    'taskAction',
    'createTask',
    'editTask',
  ]);
  const TASK_ACTION_MESSAGES = Object.freeze({
    ACTION_NOT_ALLOWED: 'Это действие пока не включено для EA FOX Web.',
    SAFE_WRITES_DISABLED: 'Безопасная запись выключена. Действия доступны только для просмотра.',
    TASK_NOT_FOUND: 'Задача не найдена в таблице.',
    VALIDATION_ERROR: 'Не хватает данных для безопасного действия.',
    UNAUTHORIZED: 'Нет доступа для выполнения действия. Проверьте action token.',
  });
  const CREATE_TASK_MESSAGES = Object.freeze({
    FIELDS_NOT_ALLOWED: 'Проверьте поля задачи: часть данных не поддерживается текущей схемой.',
    SAFE_WRITES_DISABLED: 'Безопасная запись выключена. Создание задач недоступно.',
    TASKS_SHEET_MISSING: 'Лист Tasks недоступен.',
    TASK_APPEND_FAILED: 'Не удалось добавить задачу в Tasks.',
    UNAUTHORIZED: 'Нет доступа для создания задачи. Проверьте action token.',
    VALIDATION_ERROR: 'Введите название задачи',
  });
  const EDIT_TASK_MESSAGES = Object.freeze({
    FIELDS_NOT_ALLOWED: 'Можно обновить только разрешённые поля задачи.',
    DUPLICATE_TASK_ID: 'В таблице найдено несколько строк с этим ID. Обновление остановлено для безопасности.',
    NO_CHANGES: 'Нет изменений для сохранения.',
    SCHEMA_FIELD_MISSING: 'Это поле ещё не добавлено в схему Tasks.',
    SAFE_WRITES_DISABLED: 'Безопасная запись выключена. Обновление этапа недоступно.',
    TASK_NOT_FOUND: 'Задача не найдена в таблице.',
    TASKS_SHEET_MISSING: 'Лист Tasks недоступен.',
    UNAUTHORIZED: 'Нет доступа для обновления задачи. Проверьте action token.',
    VALIDATION_ERROR: 'Проверьте поля обновления этапа.',
  });
  const JSONP_TIMEOUT_MS = 25000;
  const RATE_LIMIT_MESSAGE = 'Google Sheets временно ограничил чтение. EA FOX повторит попытку позже.';
  const TIMEOUT_FALLBACK_MESSAGE = 'Google Sheets отвечает дольше обычного. Показываю временные данные, EA FOX повторит попытку при следующем обновлении.';
  let jsonpRequestSequence = 0;

  function assertRoute(route) {
    if (!READ_ONLY_ROUTES.includes(route) && !WRITE_ROUTES.includes(route)) {
      throw new Error('Unsupported route: ' + route);
    }
  }

  function buildRouteUrl(route, params) {
    assertRoute(route);
    const config = global.BAFoxConfig.getConfig();
    if (!config.endpoint) {
      throw new Error('No endpoint configured. Mock mode is required.');
    }

    const url = new URL(config.endpoint);
    url.searchParams.set('route', route);
    Object.keys(params || {}).forEach(function (key) {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
    return url.toString();
  }

  function validateResponseShape(response) {
    if (!response || typeof response.ok !== 'boolean') {
      throw new Error('Invalid endpoint response shape.');
    }
    if (!response.ok) {
      const code = typeof response.error === 'string'
        ? response.error
        : response.error && response.error.code;
      const message = response.error && response.error.message
        ? response.error.message
        : code || 'Read-only endpoint returned an error.';
      const error = new Error(message);
      error.code = code;
      error.details = response.error && response.error.details;
      throw error;
    }
    return response.data;
  }

  function validateScaffoldSafety(data) {
    const isSafe = data
      && data.dryRun === true
      && (data.readLiveSheets === true || data.readLive === true)
      && data.liveAutomationEnabled === false
      && data.triggersEnabled === false;

    if (!isSafe) {
      throw new Error('Endpoint returned unsafe or incomplete runtime flags.');
    }
  }

  function validateReadSafety(data) {
    if (!data || data.dryRun !== true || data.readLive !== true) {
      throw new Error('Endpoint returned unsafe or incomplete read flags.');
    }
  }

  function validateCleanupAudit(data) {
    const isValid = data
      && data.summary
      && Array.isArray(data.items)
      && typeof data.summary.rowsChecked === 'number';

    if (!isValid) {
      throw new Error('Cleanup audit response shape is incomplete.');
    }
  }

  function validateSafetyStatus(data) {
    const isValid = data
      && data.dryRun === true
      && data.readLive === true
      && data.sheets
      && data.counts
      && data.sheets.AuditLog
      && data.sheets.Reports
      && data.sheets.NotificationQueue;

    if (!isValid) {
      throw new Error('Safety status response shape is incomplete.');
    }
  }

  function validateFullDashboard(data) {
    validateScaffoldSafety(data && data.scaffoldInfo);
    if (data && data.inbox) {
      validateReadSafety(data.inbox);
    }
    if (data && data.focus) {
      validateReadSafety(data.focus);
    }
    validateReadSafety(data && data.today);
    validateReadSafety(data && data.open);
    validateReadSafety(data && data.pushes);
    if (data && data.completed) {
      validateReadSafety(data.completed);
    }
    validateCleanupAudit(data && data.cleanupAudit);
  }

  function validateWorkspaceDashboard(data) {
    validateScaffoldSafety(data && data.scaffoldInfo);
    validateReadSafety(data && data.inbox);
    validateReadSafety(data && data.focus);
    validateReadSafety(data && data.today);
    validateReadSafety(data && data.open);
    validateReadSafety(data && data.pushes);
  }

  function isRateLimitError(error) {
    const code = error && error.code;
    const message = String(error && error.message ? error.message : '').toLowerCase();
    return code === 'SHEETS_RATE_LIMITED'
      || message.includes('too many requests')
      || message.includes('rate limit')
      || message.includes('quota')
      || message.includes('429');
  }

  function isTimeoutError(error) {
    const code = error && error.code;
    const message = String(error && error.message ? error.message : '').toLowerCase();
    return code === 'JSONP_TIMEOUT'
      || message.includes('jsonp endpoint timed out')
      || message.includes('timed out');
  }

  function backoffDelayMs(error, attempt) {
    if (isTimeoutError(error)) {
      return attempt === 0 ? 900 : 1800;
    }
    const retryAfterSeconds = error && error.details && Number(error.details.retryAfterSeconds);
    if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
      return Math.min(retryAfterSeconds * 1000, 5000);
    }
    return attempt === 0 ? 1200 : 2500;
  }

  function wait(ms) {
    return new Promise(function (resolve) {
      global.setTimeout(resolve, ms);
    });
  }

  function isEmptyData(route, data) {
    if (route === 'cleanupAudit') {
      return data && Array.isArray(data.items) && data.items.length === 0;
    }
    if (route === 'fullDashboard') {
      return data && data.today && Array.isArray(data.today.tasks) && data.today.tasks.length === 0;
    }
    if (route === 'dashboard') {
      return data && data.today && Array.isArray(data.today.tasks) && data.today.tasks.length === 0;
    }
    return data && Array.isArray(data.tasks) && data.tasks.length === 0;
  }

  function getJsonp(route, params) {
    return new Promise(function (resolve, reject) {
      jsonpRequestSequence += 1;
      const callbackName = 'BAFoxJsonpCallback_' + Date.now() + '_' + jsonpRequestSequence;
      const query = Object.assign({}, params || {}, { callback: callbackName });
      const script = global.document.createElement('script');
      let timeoutId;

      function cleanup() {
        global.clearTimeout(timeoutId);
        delete global[callbackName];
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      }

      global[callbackName] = function (response) {
        cleanup();
        try {
          resolve(validateResponseShape(response));
        } catch (responseError) {
          reject(responseError);
        }
      };

      script.async = true;
      script.src = buildRouteUrl(route, query);
      script.onerror = function () {
        cleanup();
        reject(new Error('Read-only JSONP endpoint request failed. URL: ' + script.src));
      };
      timeoutId = global.setTimeout(function () {
        cleanup();
        const timeoutError = new Error('Read-only JSONP endpoint timed out. URL: ' + script.src);
        timeoutError.code = 'JSONP_TIMEOUT';
        reject(timeoutError);
      }, JSONP_TIMEOUT_MS);
      global.document.head.appendChild(script);
    });
  }

  async function readLive(route, params) {
    if (route === 'scaffoldInfo') {
      const scaffoldInfo = await getJsonp(route, params);
      validateScaffoldSafety(scaffoldInfo);
      return scaffoldInfo;
    }

    if (route === 'dashboard') {
      const dashboard = await getJsonp(route, params);
      validateScaffoldSafety(dashboard.scaffoldInfo);
      if (dashboard.inbox) {
        validateReadSafety(dashboard.inbox);
      }
      if (dashboard.focus) {
        validateReadSafety(dashboard.focus);
      }
      validateReadSafety(dashboard.today);
      validateReadSafety(dashboard.open);
      validateReadSafety(dashboard.pushes);
      if (dashboard.completed) {
        validateReadSafety(dashboard.completed);
      }
      return dashboard;
    }

    if (route === 'workspaceDashboard') {
      const dashboard = await getJsonp(route, params);
      validateWorkspaceDashboard(dashboard);
      return dashboard;
    }

    if (route === 'fullDashboard') {
      const fullDashboard = await getJsonp(route, params);
      validateFullDashboard(fullDashboard);
      return fullDashboard;
    }

    if (route === 'cleanupAudit') {
      const scaffoldInfo = await getJsonp('scaffoldInfo', {});
      validateScaffoldSafety(scaffoldInfo);
      const audit = await getJsonp(route, params);
      validateCleanupAudit(audit);
      return audit;
    }

    if (route === 'safetyStatus') {
      const safetyStatus = await getJsonp(route, params);
      validateSafetyStatus(safetyStatus);
      return safetyStatus;
    }

    const scaffoldInfo = await getJsonp('scaffoldInfo', {});
    validateScaffoldSafety(scaffoldInfo);
    const data = await getJsonp(route, params);
    validateReadSafety(data);
    return data;
  }

  function readMock(route, params) {
    const response = global.BAFoxMockData.getResponse(route, params);
    const data = validateResponseShape(response);
    return global.BAFoxUiState.mock(route, data);
  }

  async function readRoute(route, params) {
    assertRoute(route);
    const config = global.BAFoxConfig.getConfig();

    if (config.useMockData) {
      return readMock(route, params);
    }

    try {
      let data;
      try {
        data = await readLive(route, params);
      } catch (firstError) {
        if (!isRateLimitError(firstError) && !isTimeoutError(firstError)) {
          throw firstError;
        }
        await wait(backoffDelayMs(firstError, 0));
        data = await readLive(route, params);
      }
      if (isEmptyData(route, data)) {
        return global.BAFoxUiState.empty(route, data, {
          message: 'В этом разделе нет задач.',
        });
      }
      return global.BAFoxUiState.success(route, data);
    } catch (clientError) {
      const fallback = global.BAFoxMockData.getResponse(route, params).data;
      const rateLimited = isRateLimitError(clientError);
      const timedOut = isTimeoutError(clientError);
      const diagnosticMessage = clientError && clientError.message
        ? clientError.message
        : 'Unknown endpoint error.';
      if (global.console && typeof global.console.warn === 'function') {
        global.console.warn('BA FOX live read failed; showing fallback data.', {
          route: route,
          message: diagnosticMessage,
          error: clientError,
        });
      }
      return global.BAFoxUiState.error(route, clientError, {
        isMock: true,
        fallbackData: fallback,
        message: rateLimited
          ? RATE_LIMIT_MESSAGE
          : timedOut
            ? TIMEOUT_FALLBACK_MESSAGE
            : 'Не удалось обновить live-данные, показана последняя доступная версия / mock fallback.',
      });
    }
  }

  global.BAFoxClient = Object.freeze({
    READ_ONLY_ROUTES,
    buildRouteUrl,
    createLoadingState: global.BAFoxUiState.loading,
    getScaffoldInfo: function () {
      return readRoute('scaffoldInfo', {});
    },
    getTodayTasks: function (options) {
      return readRoute('today', options || {});
    },
    getInboxTasks: function (options) {
      return readRoute('inbox', options || {});
    },
    getFocusTasks: function (options) {
      return readRoute('focus', options || {});
    },
    getOpenTasks: function (options) {
      return readRoute('open', options || {});
    },
    getPushTasks: function (options) {
      return readRoute('pushes', options || {});
    },
    getCompletedTasks: function (options) {
      return readRoute('completed', options || {});
    },
    getDashboard: function (options) {
      return readRoute('dashboard', options || {});
    },
    getWorkspaceDashboard: function (options) {
      return readRoute('workspaceDashboard', options || {});
    },
    getFullDashboard: function (options) {
      return readRoute('fullDashboard', options || {});
    },
    getCleanupAudit: function () {
      return readRoute('cleanupAudit', {});
    },
    getSafetyStatus: function () {
      return readRoute('safetyStatus', {});
    },
    runTaskAction: async function (options) {
      const config = global.BAFoxConfig.getConfig();
      if (config.useMockData) {
        throw new Error('Безопасные действия отключены в демо-режиме.');
      }
      if (!config.actionToken) {
        const missingTokenError = new Error('Action token не настроен для безопасных действий.');
        missingTokenError.code = 'UNAUTHORIZED';
        throw missingTokenError;
      }
      try {
        return await getJsonp('taskAction', Object.assign({}, options || {}, {
          token: config.actionToken,
        }));
      } catch (error) {
        if (error && error.code && TASK_ACTION_MESSAGES[error.code]) {
          error.message = TASK_ACTION_MESSAGES[error.code];
        }
        throw error;
      }
    },
    createTask: async function (options) {
      const config = global.BAFoxConfig.getConfig();
      if (config.useMockData) {
        throw new Error('Создание задач отключено в demo mode.');
      }
      if (!config.actionToken) {
        const missingTokenError = new Error('Нет доступа для создания задачи. Проверьте action token.');
        missingTokenError.code = 'UNAUTHORIZED';
        throw missingTokenError;
      }
      try {
        return await getJsonp('createTask', Object.assign({}, options || {}, {
          token: config.actionToken,
        }));
      } catch (error) {
        if (error && error.code && CREATE_TASK_MESSAGES[error.code]) {
          error.message = CREATE_TASK_MESSAGES[error.code];
        }
        throw error;
      }
    },
    editTask: async function (options) {
      const config = global.BAFoxConfig.getConfig();
      if (config.useMockData) {
        throw new Error('Обновление задач отключено в demo mode.');
      }
      if (!config.actionToken) {
        const missingTokenError = new Error('Action token не настроен для безопасного обновления задач.');
        missingTokenError.code = 'UNAUTHORIZED';
        throw missingTokenError;
      }
      try {
        return await getJsonp('editTask', Object.assign({}, options || {}, {
          token: config.actionToken,
        }));
      } catch (error) {
        if (error && error.code && EDIT_TASK_MESSAGES[error.code]) {
          error.message = EDIT_TASK_MESSAGES[error.code];
        }
        throw error;
      }
    },
  });
}(window));
