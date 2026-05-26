(function (global) {
  const READ_ONLY_ROUTES = Object.freeze([
    'scaffoldInfo',
    'today',
    'open',
    'pushes',
    'dashboard',
  ]);
  const JSONP_TIMEOUT_MS = 10000;
  let jsonpRequestSequence = 0;

  function assertRoute(route) {
    if (!READ_ONLY_ROUTES.includes(route)) {
      throw new Error('Unsupported read-only route: ' + route);
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
      throw new Error(message);
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

  function isEmptyData(route, data) {
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
        reject(new Error('Read-only JSONP endpoint request failed.'));
      };
      timeoutId = global.setTimeout(function () {
        cleanup();
        reject(new Error('Read-only JSONP endpoint timed out.'));
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
      const data = await readLive(route, params);
      if (isEmptyData(route, data)) {
        return global.BAFoxUiState.empty(route, data, {
          message: 'В этом разделе нет задач.',
        });
      }
      return global.BAFoxUiState.success(route, data);
    } catch (clientError) {
      const fallback = global.BAFoxMockData.getResponse(route, params).data;
      return global.BAFoxUiState.error(route, clientError, {
        isMock: true,
        fallbackData: fallback,
        message: 'Endpoint недоступен или небезопасен. Показываю mock data.',
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
  });
}(window));
