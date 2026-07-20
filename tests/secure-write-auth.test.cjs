const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function loadAppsScriptAuthorization() {
  const context = vm.createContext({
    BA_FOX_CONFIG: {
      ACTION_TOKEN: '',
      ALLOWED_WORKSPACE_DOMAIN: 'mfstream.io',
      IDENTITY_ENFORCEMENT_MODE: 'profile_only',
      USERS_COLUMNS: {},
    },
    console,
  });
  vm.runInContext(fs.readFileSync(path.join(root, 'apps-script/Validation.gs'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(root, 'apps-script/IdentityService.gs'), 'utf8'), context);
  context.baFoxActionTokenMatches_ = function (token) {
    return token === 'server-only-token';
  };
  return context;
}

function verifiedProfile(overrides) {
  return {
    identityMode: 'google_token_verified',
    profile: Object.assign({
      isAuthenticated: true,
      isRegistered: true,
      status: 'active',
      accessRole: 'member',
    }, overrides || {}),
  };
}

test('backend authorizes an active registered Google profile without a browser action token', function () {
  const context = loadAppsScriptAuthorization();
  context.getVerifiedUserProfile_ = function () {
    return verifiedProfile();
  };

  const result = context.requireAuthorizedSafeWrite_({ idToken: 'verified-google-token' });

  assert.equal(result.ok, true);
  assert.equal(result.authorizationMode, 'google_profile');
});

test('backend denies browser writes without Google identity or a server-side token', function () {
  const context = loadAppsScriptAuthorization();
  context.getVerifiedUserProfile_ = function () {
    return {
      identityMode: 'missing_token',
      profile: context.getFallbackUserProfile_(),
    };
  };

  const result = context.requireAuthorizedSafeWrite_({});

  assert.equal(result.ok, false);
  assert.equal(result.error.error.code, 'GOOGLE_TOKEN_REQUIRED');
});

test('backend keeps the server-side action token as a legacy integration fallback', function () {
  const context = loadAppsScriptAuthorization();
  context.getVerifiedUserProfile_ = function () {
    return {
      identityMode: 'missing_token',
      profile: context.getFallbackUserProfile_(),
    };
  };

  const result = context.requireAuthorizedSafeWrite_({ token: 'server-only-token' });

  assert.equal(result.ok, true);
  assert.equal(result.authorizationMode, 'legacy_action_token');
});

function loadWebClient(configOverrides) {
  const requests = [];
  const head = {
    appendChild(script) {
      script.parentNode = head;
      const url = new URL(script.src);
      requests.push(url);
      const callback = url.searchParams.get('callback');
      queueMicrotask(function () {
        context[callback]({
          ok: true,
          data: {
            taskId: 'TEST-1',
          },
          error: null,
        });
      });
    },
    removeChild(script) {
      script.parentNode = null;
    },
  };
  const context = vm.createContext({
    URL,
    console,
    clearTimeout,
    document: {
      createElement() {
        return {};
      },
      head,
    },
    setTimeout,
  });
  context.window = context;
  context.BAFoxConfig = {
    getConfig() {
      return Object.assign({
        endpoint: 'https://example.test/exec',
        actionToken: '',
        useMockData: false,
      }, configOverrides || {});
    },
  };
  context.BAFoxUiState = {
    loading() {},
  };
  context.BAFoxMockData = {};
  vm.runInContext(fs.readFileSync(path.join(root, 'web/api/baFoxClient.js'), 'utf8'), context);
  return { client: context.BAFoxClient, requests };
}

test('web client refuses writes before Google sign-in when no legacy token exists', async function () {
  const { client, requests } = loadWebClient();

  await assert.rejects(
    client.createTask({ title: 'Test' }),
    function (error) {
      return error && error.code === 'GOOGLE_TOKEN_REQUIRED';
    }
  );
  assert.equal(requests.length, 0);
});

test('web client sends Google identity for writes and does not add a token parameter', async function () {
  const { client, requests } = loadWebClient();

  const result = await client.createTask({
    title: 'Test',
    idToken: 'google-id-token',
  });

  assert.equal(result.taskId, 'TEST-1');
  assert.equal(requests.length, 1);
  assert.equal(requests[0].searchParams.get('route'), 'createTask');
  assert.equal(requests[0].searchParams.get('idToken'), 'google-id-token');
  assert.equal(requests[0].searchParams.has('token'), false);
});

test('Pages workflows cannot serialize BA_FOX_ACTION_TOKEN into the public bundle', function () {
  const workflowPaths = [
    '.github/workflows/pages.yml',
    '.github/workflows/deploy-web-pages.yml',
  ];

  workflowPaths.forEach(function (relativePath) {
    const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
    assert.equal(source.includes('BA_FOX_ACTION_TOKEN'), false, relativePath);
    assert.equal(source.includes('"BA_FOX_ACTION_TOKEN"'), false, relativePath);
  });
});
