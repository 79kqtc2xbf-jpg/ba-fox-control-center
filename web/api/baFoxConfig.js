(function (global) {
  const DEFAULT_CONFIG = Object.freeze({
    APPS_SCRIPT_ENDPOINT: '',
    BA_FOX_ACTION_TOKEN: '',
    USE_MOCK_DATA: true,
  });

  function getConfig() {
    const suppliedConfig = Object.assign(
      {},
      global.BA_FOX_CONFIG || {},
      global.BA_FOX_RUNTIME_CONFIG || {}
    );
    const endpoint = typeof suppliedConfig.APPS_SCRIPT_ENDPOINT === 'string'
      ? suppliedConfig.APPS_SCRIPT_ENDPOINT.trim()
      : DEFAULT_CONFIG.APPS_SCRIPT_ENDPOINT;
    const useMockData = !endpoint || suppliedConfig.USE_MOCK_DATA !== false;
    const actionToken = typeof suppliedConfig.BA_FOX_ACTION_TOKEN === 'string'
      ? suppliedConfig.BA_FOX_ACTION_TOKEN.trim()
      : DEFAULT_CONFIG.BA_FOX_ACTION_TOKEN;

    return Object.freeze({
      endpoint,
      actionToken,
      useMockData,
      hasEndpoint: Boolean(endpoint),
      hasActionToken: Boolean(actionToken),
    });
  }

  global.BAFoxConfig = Object.freeze({
    DEFAULT_CONFIG,
    getConfig,
    isMockMode: function () {
      return getConfig().useMockData;
    },
  });
}(window));
