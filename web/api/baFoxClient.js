(function (global) {
  const READ_ONLY_ROUTES = Object.freeze([
    'scaffoldInfo',
    'today',
    'open',
    'pushes',
    'dashboard',
    'fullDashboard',
    'cleanupAudit',
    'safetyStatus',
  ]);
  const WRITE_ROUTES = Object.freeze([
    'taskAction',
  ]);
  const JSONP_TIMEOUT_MS = 10000;
  const RATE_LIMIT_MESSAGE = 'Google Sheets временно ограничил чтение. BA Fox повторит попытку позже.';
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
      const message = response.error && response.error.message
        ? response.error.message
        : 'Read-only endpoint returned an error.';
      const error = new Error(message);
      error.code = response.error && response.error.code;
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
    validateReadSafety(data && data.today);
    validateReadSafety(data && data.open);
    validateReadSafety(data && data.pushes);
    validateCleanupAudit(data && data.cleanupAudit);
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

  function backoffDelayMs(error, attempt) {
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
        reject(new Error('Read-only JSONP endpoint timed out. URL: ' + script.src));
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
      validateReadSafety(dashboard.today);
      validateReadSafety(dashboard.open);
      validateReadSafety(dashboard.pushes);
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
        if (!isRateLimitError(firstError)) {
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
      const diagnosticMessage = clientError && clientError.message
        ? clientError.message
        : 'Unknown endpoint error.';
      return global.BAFoxUiState.error(route, clientError, {
        isMock: true,
        fallbackData: fallback,
        message: rateLimited
          ? RATE_LIMIT_MESSAGE
          : 'Live endpoint error: ' + diagnosticMessage,
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
    getOpenTasks: function (options) {
      return readRoute('open', options || {});
    },
    getPushTasks: function (options) {
      return readRoute('pushes', options || {});
    },
    getDashboard: function (options) {
      return readRoute('dashboard', options || {});
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
        throw new Error('Safe task actions are disabled in mock mode.');
      }
      return getJsonp('taskAction', options || {});
    },
  });
}(window));
