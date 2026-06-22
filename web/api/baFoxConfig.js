(function (global) {
  const DEFAULT_CONFIG = Object.freeze({
    APPS_SCRIPT_ENDPOINT: '',
    BA_FOX_ACTION_TOKEN: '',
    GOOGLE_CLIENT_ID: '',
    GOOGLE_ALLOWED_DOMAIN: 'mfstream.io',
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
    const googleClientId = typeof suppliedConfig.GOOGLE_CLIENT_ID === 'string'
      ? suppliedConfig.GOOGLE_CLIENT_ID.trim()
      : DEFAULT_CONFIG.GOOGLE_CLIENT_ID;
    const googleAllowedDomain = typeof suppliedConfig.GOOGLE_ALLOWED_DOMAIN === 'string'
      ? suppliedConfig.GOOGLE_ALLOWED_DOMAIN.trim().toLowerCase()
      : DEFAULT_CONFIG.GOOGLE_ALLOWED_DOMAIN;

    return Object.freeze({
      endpoint,
      actionToken,
      googleClientId,
      googleAllowedDomain,
      useMockData,
      hasEndpoint: Boolean(endpoint),
      hasActionToken: Boolean(actionToken),
      hasGoogleClientId: Boolean(googleClientId),
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
