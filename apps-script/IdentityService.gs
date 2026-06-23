function getUsersSheet_() {
  return baFoxGetSheetByName_(BA_FOX_CONFIG.SHEETS.USERS);
}

function usersSheetHeaders_() {
  return [
    'userId',
    'email',
    'displayName',
    'title',
    'accessRole',
    'status',
    'department',
    'defaultOwnerLabel',
    'accentColor',
    'canSeeAll',
    'createdAt',
    'updatedAt'
  ];
}

function identityTruthy_(value) {
  var normalized = baFoxSafeString(value).toLowerCase();
  return value === true || ['true', 'yes', '1', 'да'].indexOf(normalized) !== -1;
}

function normalizeWorkspaceEmail_(email) {
  return baFoxSafeString(email).toLowerCase();
}

function isAllowedWorkspaceEmail_(email) {
  var normalized = normalizeWorkspaceEmail_(email);
  var allowedDomain = normalizeWorkspaceEmail_(BA_FOX_CONFIG.ALLOWED_WORKSPACE_DOMAIN || 'mfstream.io');
  return Boolean(normalized) && normalized.slice(-1 * ('@' + allowedDomain).length) === '@' + allowedDomain;
}

function identityEnforcementMode_() {
  var mode = baFoxSafeString(BA_FOX_CONFIG.IDENTITY_ENFORCEMENT_MODE || 'profile_only').toLowerCase();
  return ['off', 'profile_only', 'soft', 'enforced'].indexOf(mode) !== -1 ? mode : 'profile_only';
}

function identityVisibilityMode_() {
  if (BA_FOX_CONFIG.VISIBILITY_ENFORCEMENT === true || identityEnforcementMode_() === 'enforced') {
    return 'enforced';
  }
  return identityEnforcementMode_();
}

function backendIdentityEnforced_(identityMode) {
  return identityEnforcementMode_() === 'enforced' && identityMode === 'google_token_verified';
}

function backendIdentityEnforcementStatus_(identityMode) {
  if (backendIdentityEnforced_(identityMode)) {
    return 'enforced';
  }
  if (identityMode === 'google_token_verified') {
    return 'partial';
  }
  return identityEnforcementMode_() === 'enforced' ? 'enforced_requires_token' : 'partial';
}

function configuredGoogleClientId_() {
  if (baFoxSafeString(BA_FOX_CONFIG.GOOGLE_CLIENT_ID)) {
    return baFoxSafeString(BA_FOX_CONFIG.GOOGLE_CLIENT_ID);
  }
  if (typeof PropertiesService === 'undefined') {
    return '';
  }
  try {
    return baFoxSafeString(PropertiesService.getScriptProperties().getProperty('GOOGLE_CLIENT_ID'));
  } catch (err) {
    return '';
  }
}

function requestIdentityToken_(request) {
  var normalized = baFoxNormalizeRequest(request);
  return baFoxSafeString(
    normalized.idToken
    || normalized.identityToken
    || normalized.credential
    || normalized.googleCredential
  );
}

function usersSheetStatus_() {
  var sheet = getUsersSheet_();
  if (!sheet) {
    return {
      sheet: BA_FOX_CONFIG.SHEETS.USERS,
      exists: false,
      status: 'missing',
      headerColumns: 0,
      dataRows: 0,
      expectedHeaders: usersSheetHeaders_()
    };
  }
  return {
    sheet: BA_FOX_CONFIG.SHEETS.USERS,
    exists: true,
    status: sheet.getLastRow() <= 1 ? 'headers_only' : 'has_data',
    headerColumns: sheet.getLastColumn(),
    dataRows: Math.max(sheet.getLastRow() - 1, 0),
    expectedHeaders: usersSheetHeaders_()
  };
}

function normalizeUserRecord_(row, rowNumber) {
  row = row || [];
  return {
    rowNumber: rowNumber || null,
    userId: baFoxSafeString(row[BA_FOX_CONFIG.USERS_COLUMNS.USER_ID - 1]),
    email: normalizeWorkspaceEmail_(row[BA_FOX_CONFIG.USERS_COLUMNS.EMAIL - 1]),
    displayName: baFoxSafeString(row[BA_FOX_CONFIG.USERS_COLUMNS.DISPLAY_NAME - 1]),
    title: baFoxSafeString(row[BA_FOX_CONFIG.USERS_COLUMNS.TITLE - 1]),
    accessRole: baFoxSafeString(row[BA_FOX_CONFIG.USERS_COLUMNS.ACCESS_ROLE - 1]).toLowerCase() || 'member',
    status: baFoxSafeString(row[BA_FOX_CONFIG.USERS_COLUMNS.STATUS - 1]).toLowerCase() || 'active',
    department: baFoxSafeString(row[BA_FOX_CONFIG.USERS_COLUMNS.DEPARTMENT - 1]),
    defaultOwnerLabel: baFoxSafeString(row[BA_FOX_CONFIG.USERS_COLUMNS.DEFAULT_OWNER_LABEL - 1]),
    accentColor: baFoxSafeString(row[BA_FOX_CONFIG.USERS_COLUMNS.ACCENT_COLOR - 1]),
    canSeeAll: identityTruthy_(row[BA_FOX_CONFIG.USERS_COLUMNS.CAN_SEE_ALL - 1]),
    createdAt: baFoxSafeString(row[BA_FOX_CONFIG.USERS_COLUMNS.CREATED_AT - 1]),
    updatedAt: baFoxSafeString(row[BA_FOX_CONFIG.USERS_COLUMNS.UPDATED_AT - 1])
  };
}

function getUsers_() {
  var sheet = getUsersSheet_();
  if (!sheet || sheet.getLastRow() < 2) {
    return [];
  }

  var values = sheet.getDataRange().getValues();
  return values.slice(1).map(function(row, index) {
    return normalizeUserRecord_(row, index + 2);
  }).filter(function(user) {
    return Boolean(user.email || user.userId || user.displayName);
  });
}

function findUserByEmail_(email) {
  var normalized = normalizeWorkspaceEmail_(email);
  if (!normalized) {
    return null;
  }
  var users = getUsers_();
  for (var index = 0; index < users.length; index += 1) {
    if (users[index].email === normalized) {
      return users[index];
    }
  }
  return null;
}

function findUserByUserId_(userId) {
  var normalized = baFoxSafeString(userId).toLowerCase();
  if (!normalized) {
    return null;
  }
  var users = getUsers_();
  for (var index = 0; index < users.length; index += 1) {
    if (baFoxSafeString(users[index].userId).toLowerCase() === normalized) {
      return users[index];
    }
  }
  return null;
}

function findUserByOwnerLabel_(label) {
  var normalized = baFoxSafeString(label).toLowerCase();
  if (!normalized) {
    return {
      user: null,
      matches: [],
      ambiguous: false,
      warning: 'OWNER_LABEL_MISSING'
    };
  }
  var matches = getUsers_().filter(function(user) {
    return baFoxSafeString(user.defaultOwnerLabel).toLowerCase() === normalized;
  });
  if (matches.length === 1) {
    return {
      user: matches[0],
      matches: matches,
      ambiguous: false,
      warning: ''
    };
  }
  return {
    user: null,
    matches: matches,
    ambiguous: matches.length > 1,
    warning: matches.length > 1 ? 'OWNER_LABEL_AMBIGUOUS' : 'OWNER_LABEL_NOT_FOUND'
  };
}

function activeUserEmail_() {
  if (typeof Session === 'undefined' || !Session.getActiveUser) {
    return '';
  }
  try {
    return normalizeWorkspaceEmail_(Session.getActiveUser().getEmail());
  } catch (err) {
    return '';
  }
}

function verifyGoogleIdentityToken_(idToken) {
  var token = baFoxSafeString(idToken);
  var clientId = configuredGoogleClientId_();
  var clientIdConfigured = Boolean(clientId);
  if (!token) {
    return {
      ok: false,
      mode: 'missing_token',
      claims: null,
      error: 'MISSING_TOKEN',
      message: 'Google identity token is missing.',
      clientIdConfigured: clientIdConfigured
    };
  }
  if (typeof UrlFetchApp === 'undefined') {
    return {
      ok: false,
      mode: 'google_token_invalid',
      claims: null,
      error: 'URL_FETCH_UNAVAILABLE',
      message: 'Apps Script UrlFetchApp is not available for token verification.',
      clientIdConfigured: clientIdConfigured
    };
  }

  try {
    var response = UrlFetchApp.fetch(
      'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token),
      { muteHttpExceptions: true }
    );
    var status = response.getResponseCode();
    var body = response.getContentText();
    var claims = body ? JSON.parse(body) : {};
    if (status < 200 || status >= 300 || claims.error) {
      return {
        ok: false,
        mode: 'google_token_invalid',
        claims: claims,
        error: claims.error || 'TOKENINFO_REJECTED',
        message: claims.error_description || 'Google tokeninfo rejected the identity token.',
        email: normalizeWorkspaceEmail_(claims.email),
        clientIdConfigured: clientIdConfigured
      };
    }
    if (clientId && claims.aud !== clientId) {
      return {
        ok: false,
        mode: 'google_token_invalid',
        claims: claims,
        error: 'AUDIENCE_MISMATCH',
        message: 'Google identity token audience does not match configured client ID.',
        email: normalizeWorkspaceEmail_(claims.email),
        clientIdConfigured: clientIdConfigured
      };
    }
    if (!baFoxSafeString(claims.email)) {
      return {
        ok: false,
        mode: 'google_token_invalid',
        claims: claims,
        error: 'EMAIL_MISSING',
        message: 'Google identity token does not include email.',
        clientIdConfigured: clientIdConfigured
      };
    }
    if (claims.email_verified !== undefined && String(claims.email_verified) !== 'true') {
      return {
        ok: false,
        mode: 'google_token_invalid',
        claims: claims,
        error: 'EMAIL_NOT_VERIFIED',
        message: 'Google identity token email is not verified.',
        email: normalizeWorkspaceEmail_(claims.email),
        clientIdConfigured: clientIdConfigured
      };
    }
    return {
      ok: true,
      mode: 'google_token_verified',
      claims: claims,
      email: normalizeWorkspaceEmail_(claims.email),
      clientIdConfigured: clientIdConfigured
    };
  } catch (err) {
    return {
      ok: false,
      mode: 'google_token_invalid',
      claims: null,
      error: 'TOKEN_VERIFICATION_FAILED',
      message: err && err.message ? err.message : 'Google identity token verification failed.',
      clientIdConfigured: clientIdConfigured
    };
  }
}

function safeTokenVerificationDiagnostics_(tokenResult, usersSheetStatus, overrides) {
  var result = tokenResult || {};
  var claims = result.claims || {};
  var clientId = configuredGoogleClientId_();
  var expectedAudienceConfigured = Boolean(clientId || result.clientIdConfigured);
  var tokenAudience = baFoxSafeString(claims.aud);
  var audienceMatches = '';
  if (expectedAudienceConfigured && tokenAudience) {
    audienceMatches = tokenAudience === clientId;
  }
  var email = normalizeWorkspaceEmail_(result.email || claims.email);
  var domainAllowed = email ? isAllowedWorkspaceEmail_(email) : false;
  var userRegistered = false;
  if (email && domainAllowed && usersSheetStatus && usersSheetStatus.exists) {
    userRegistered = Boolean(findUserByEmail_(email));
  }
  var emailVerified = '';
  if (claims.email_verified !== undefined) {
    emailVerified = String(claims.email_verified) === 'true';
  }
  var diagnostics = {
    ok: result.ok === true,
    mode: result.mode || 'missing_token',
    error: result.error || '',
    message: result.message || '',
    audienceMatches: audienceMatches,
    expectedAudienceConfigured: expectedAudienceConfigured,
    tokenAudience: tokenAudience,
    email: email,
    emailVerified: emailVerified,
    domainAllowed: domainAllowed,
    userRegistered: userRegistered
  };
  Object.keys(overrides || {}).forEach(function(key) {
    diagnostics[key] = overrides[key];
  });
  return diagnostics;
}

function getIdentityFromRequest_(request) {
  var idToken = requestIdentityToken_(request);
  if (idToken) {
    var tokenResult = verifyGoogleIdentityToken_(idToken);
    if (tokenResult.ok) {
      return {
        source: 'google_identity_token',
        identityMode: 'google_token_verified',
        email: tokenResult.email,
        tokenVerification: tokenResult
      };
    }
    return {
      source: 'google_identity_token',
      identityMode: tokenResult.mode || 'google_token_invalid',
      email: '',
      tokenVerification: tokenResult
    };
  }

  var activeEmail = activeUserEmail_();
  return {
    source: activeEmail ? 'apps_script_active_user' : 'none',
    identityMode: activeEmail ? 'active_user_email_available' : 'missing_token',
    email: activeEmail,
    tokenVerification: {
      ok: false,
      mode: 'missing_token',
      claims: null,
      error: 'MISSING_TOKEN',
      message: 'No Google identity token was provided by the frontend.'
    }
  };
}

function getFallbackUserProfile_() {
  return {
    userId: 'identity_missing',
    email: '',
    displayName: 'Не выполнен вход',
    title: '',
    accessRole: 'viewer',
    status: 'identity_missing',
    department: '',
    defaultOwnerLabel: '',
    accentColor: 'green',
    canSeeAll: false,
    isAuthenticated: false,
    isRegistered: false,
    isAllowedDomain: false
  };
}

function normalizeProfileRole_(profile) {
  return baFoxSafeString(profile && profile.accessRole || 'viewer').toLowerCase();
}

function profileCanSeeAll_(profile) {
  var role = normalizeProfileRole_(profile);
  return profile && (profile.canSeeAll === true || role === 'admin' || role === 'executive');
}

function profileCanWrite_(profile) {
  var role = normalizeProfileRole_(profile);
  return profile && profile.isRegistered === true && profile.status === 'active'
    && ['admin', 'executive', 'member'].indexOf(role) !== -1;
}

function profileCanManageUsers_(profile) {
  return profile && profile.isRegistered === true && profile.status === 'active' && normalizeProfileRole_(profile) === 'admin';
}

function profileCanUseDashboard_(profile) {
  var role = normalizeProfileRole_(profile);
  return profile && profile.isRegistered === true && profile.status === 'active'
    && ['admin', 'executive', 'member', 'viewer'].indexOf(role) !== -1;
}

function profilePermissions_(profile) {
  return {
    canSeeAll: profileCanSeeAll_(profile),
    canCreateTasks: profileCanWrite_(profile),
    canUseDashboard: profileCanUseDashboard_(profile),
    canManageUsers: profileCanManageUsers_(profile),
    canWrite: profileCanWrite_(profile)
  };
}

function identityResponseLimitations_(tokenResult) {
  var limitations = [
    'Dashboard visibility is identity-aware but not filtered by user unless enforcement mode is enforced.',
    'createTask, editTask, and taskAction still keep the existing action token path in non-enforced modes.',
    'Legacy tasks only have Owner label; robust member visibility needs ownerEmail/userId, collaborator, createdBy, and visibility columns.',
    'Token verification uses Google tokeninfo from Apps Script. This is real Google validation, but future hard enforcement should be QA-tested against deployed OAuth settings.'
  ];
  if (!configuredGoogleClientId_()) {
    limitations.push('GOOGLE_CLIENT_ID is not configured in Apps Script properties/config, so audience matching is not active.');
  }
  if (tokenResult && tokenResult.error) {
    limitations.push('Latest token verification status: ' + tokenResult.error + '.');
  }
  return limitations;
}

function applyRegisteredProfileFlags_(user, identitySource) {
  user.isAuthenticated = true;
  user.isRegistered = true;
  user.isAllowedDomain = true;
  user.identitySource = identitySource || '';
  return user;
}

function getCurrentUserProfile_(request, context) {
  var identity = getIdentityFromRequest_(request || {});
  var activeEmail = identity.email;
  var usersSheetStatus = usersSheetStatus_();
  var enforcementMode = identityEnforcementMode_();
  var tokenResult = identity.tokenVerification || {};
  var limitations = identityResponseLimitations_(tokenResult);
  var tokenDiagnostics = safeTokenVerificationDiagnostics_(tokenResult, usersSheetStatus, {});

  if (!activeEmail) {
    var missingProfile = getFallbackUserProfile_();
    missingProfile.status = identity.identityMode === 'google_token_invalid' ? 'token_invalid' : 'identity_missing';
    return {
      identityMode: identity.identityMode || 'missing_token',
      profile: missingProfile,
      allowedDomain: BA_FOX_CONFIG.ALLOWED_WORKSPACE_DOMAIN,
      isBackendEnforced: backendIdentityEnforced_(identity.identityMode || 'missing_token'),
      enforcementMode: enforcementMode,
      backendEnforcementStatus: backendIdentityEnforcementStatus_(identity.identityMode || 'missing_token'),
      usersSheet: usersSheetStatus,
      limitations: limitations,
      permissions: profilePermissions_(missingProfile),
      canSeeAll: false,
      canCreateTasks: false,
      canUseDashboard: enforcementMode !== 'enforced',
      canManageUsers: false,
      tokenVerification: tokenDiagnostics
    };
  }

  if (!isAllowedWorkspaceEmail_(activeEmail)) {
    var outsideProfile = getFallbackUserProfile_();
    outsideProfile.email = activeEmail;
    outsideProfile.status = 'domain_not_allowed';
    outsideProfile.isAuthenticated = true;
    return {
      identityMode: 'domain_not_allowed',
      profile: outsideProfile,
      allowedDomain: BA_FOX_CONFIG.ALLOWED_WORKSPACE_DOMAIN,
      isBackendEnforced: backendIdentityEnforced_('domain_not_allowed'),
      enforcementMode: enforcementMode,
      backendEnforcementStatus: backendIdentityEnforcementStatus_('domain_not_allowed'),
      usersSheet: usersSheetStatus,
      limitations: limitations.concat(['Active user email is outside the allowed workspace domain.']),
      permissions: profilePermissions_(outsideProfile),
      canSeeAll: false,
      canCreateTasks: false,
      canUseDashboard: enforcementMode !== 'enforced',
      canManageUsers: false,
      tokenVerification: safeTokenVerificationDiagnostics_(tokenResult, usersSheetStatus, {
        email: activeEmail,
        domainAllowed: false,
        userRegistered: false
      })
    };
  }

  var user = findUserByEmail_(activeEmail);
  if (!user) {
    var unregisteredProfile = getFallbackUserProfile_();
    unregisteredProfile.email = activeEmail;
    unregisteredProfile.status = usersSheetStatus.exists ? 'user_not_registered' : 'users_sheet_missing';
    unregisteredProfile.isAuthenticated = true;
    unregisteredProfile.isAllowedDomain = true;
    return {
      identityMode: usersSheetStatus.exists ? 'user_not_registered' : 'users_sheet_missing',
      profile: unregisteredProfile,
      allowedDomain: BA_FOX_CONFIG.ALLOWED_WORKSPACE_DOMAIN,
      isBackendEnforced: backendIdentityEnforced_(usersSheetStatus.exists ? 'user_not_registered' : 'users_sheet_missing'),
      enforcementMode: enforcementMode,
      backendEnforcementStatus: backendIdentityEnforcementStatus_(usersSheetStatus.exists ? 'user_not_registered' : 'users_sheet_missing'),
      usersSheet: usersSheetStatus,
      limitations: limitations.concat(['User must be added to the Users sheet before role/profile enforcement.']),
      permissions: profilePermissions_(unregisteredProfile),
      canSeeAll: false,
      canCreateTasks: false,
      canUseDashboard: enforcementMode !== 'enforced',
      canManageUsers: false,
      tokenVerification: safeTokenVerificationDiagnostics_(tokenResult, usersSheetStatus, {
        email: activeEmail,
        domainAllowed: true,
        userRegistered: false
      })
    };
  }

  user = applyRegisteredProfileFlags_(user, identity.source);
  if (user.status !== 'active') {
    var inactivePermissions = profilePermissions_(user);
    return {
      identityMode: 'user_inactive',
      profile: user,
      allowedDomain: BA_FOX_CONFIG.ALLOWED_WORKSPACE_DOMAIN,
      isBackendEnforced: backendIdentityEnforced_('user_inactive'),
      enforcementMode: enforcementMode,
      backendEnforcementStatus: backendIdentityEnforcementStatus_('user_inactive'),
      usersSheet: usersSheetStatus,
      limitations: limitations.concat(['User exists in Users sheet but status is not active.']),
      permissions: inactivePermissions,
      canSeeAll: inactivePermissions.canSeeAll,
      canCreateTasks: false,
      canUseDashboard: enforcementMode !== 'enforced',
      canManageUsers: false,
      tokenVerification: safeTokenVerificationDiagnostics_(tokenResult, usersSheetStatus, {
        email: activeEmail,
        domainAllowed: true,
        userRegistered: true
      })
    };
  }

  var permissions = profilePermissions_(user);
  var identityMode = identity.identityMode === 'google_token_verified'
    ? 'google_token_verified'
    : 'active_user_email_registered';
  return {
    identityMode: identityMode,
    profile: user,
    allowedDomain: BA_FOX_CONFIG.ALLOWED_WORKSPACE_DOMAIN,
    isBackendEnforced: backendIdentityEnforced_(identityMode),
    enforcementMode: enforcementMode,
    backendEnforcementStatus: backendIdentityEnforcementStatus_(identityMode),
    usersSheet: usersSheetStatus,
    limitations: limitations,
    permissions: permissions,
    canSeeAll: permissions.canSeeAll,
    canCreateTasks: permissions.canCreateTasks,
    canUseDashboard: permissions.canUseDashboard,
    canManageUsers: permissions.canManageUsers,
    tokenVerification: safeTokenVerificationDiagnostics_(tokenResult, usersSheetStatus, {
      email: activeEmail,
      domainAllowed: true,
      userRegistered: true
    })
  };
}

function baFoxGetProfile(request) {
  return baFoxOk(getCurrentUserProfile_(request || {}, {}));
}

function getVerifiedUserProfile_(request) {
  return getCurrentUserProfile_(request || {}, {});
}

function requireVerifiedProfile_(request, options) {
  var settings = options || {};
  var result = getVerifiedUserProfile_(request || {});
  var mode = identityEnforcementMode_();
  var requiresRegistered = settings.requireRegistered !== false;
  var requiresWrite = settings.requireWrite === true;
  var profile = result.profile || getFallbackUserProfile_();

  if (mode !== 'enforced') {
    return {
      ok: true,
      enforced: false,
      identity: result,
      profile: profile
    };
  }
  if (result.identityMode !== 'google_token_verified') {
    return {
      ok: false,
      enforced: true,
      identity: result,
      profile: profile,
      error: baFoxError('GOOGLE_TOKEN_REQUIRED', 'Verified Google identity token is required in enforced mode.', {
        identityMode: result.identityMode
      })
    };
  }
  if (!profile.isAuthenticated || (requiresRegistered && !profile.isRegistered) || profile.status !== 'active') {
    return {
      ok: false,
      enforced: true,
      identity: result,
      profile: profile,
      error: baFoxError('IDENTITY_REQUIRED', 'Verified active workspace user is required.', {
        identityMode: result.identityMode
      })
    };
  }
  if (requiresWrite && !profileCanWrite_(profile)) {
    return {
      ok: false,
      enforced: true,
      identity: result,
      profile: profile,
      error: baFoxError('WRITE_FORBIDDEN', 'This user cannot write tasks.', {
        accessRole: profile.accessRole
      })
    };
  }
  return {
    ok: true,
    enforced: true,
    identity: result,
    profile: profile
  };
}

function isUserAllowedForRoute_(profile, routeName, action) {
  if (!profile || profile.status !== 'active') {
    return false;
  }
  if (['dashboard', 'workspaceDashboard', 'fullDashboard', 'today', 'inbox', 'focus', 'open', 'pushes', 'completed'].indexOf(routeName) !== -1) {
    return profileCanUseDashboard_(profile);
  }
  if (['createTask', 'editTask', 'taskAction'].indexOf(routeName) !== -1) {
    return profileCanWrite_(profile);
  }
  if (routeName === 'users' || action === 'manageUsers') {
    return profileCanManageUsers_(profile);
  }
  return true;
}

function identityArrayContains_(items, value, normalizeEmail) {
  var target = normalizeEmail ? normalizeWorkspaceEmail_(value) : baFoxSafeString(value).toLowerCase();
  if (!target) {
    return false;
  }
  return (items || []).some(function(item) {
    var normalized = normalizeEmail ? normalizeWorkspaceEmail_(item) : baFoxSafeString(item).toLowerCase();
    return normalized === target;
  });
}

function taskIdentityList_(task, fieldName, normalizeEmail) {
  if (!task) {
    return [];
  }
  if (Array.isArray(task[fieldName])) {
    return task[fieldName];
  }
  return baFoxSplitIdentityList_(task[fieldName], normalizeEmail);
}

function profileCanSeeTask_(profile, task) {
  if (!profileCanUseDashboard_(profile) || profile.status !== 'active' || profile.isRegistered !== true) {
    return false;
  }
  if (profileCanSeeAll_(profile)) {
    return true;
  }
  var normalizedEmail = normalizeWorkspaceEmail_(profile.email);
  var userId = baFoxSafeString(profile.userId).toLowerCase();
  var ownerLabel = baFoxSafeString(profile.defaultOwnerLabel).toLowerCase();
  var normalizedTask = task || {};
  return Boolean(
    (normalizedEmail && normalizeWorkspaceEmail_(normalizedTask.ownerEmail) === normalizedEmail)
    || (userId && baFoxSafeString(normalizedTask.ownerUserId).toLowerCase() === userId)
    || (ownerLabel && baFoxSafeString(normalizedTask.ownerLabel || normalizedTask.owner).toLowerCase() === ownerLabel)
    || identityArrayContains_(taskIdentityList_(normalizedTask, 'collaboratorEmailList', true), normalizedEmail, true)
    || identityArrayContains_(taskIdentityList_(normalizedTask, 'collaboratorEmails', true), normalizedEmail, true)
    || identityArrayContains_(taskIdentityList_(normalizedTask, 'collaboratorUserIdList', false), userId, false)
    || identityArrayContains_(taskIdentityList_(normalizedTask, 'collaboratorUserIds', false), userId, false)
    || (normalizedEmail && normalizeWorkspaceEmail_(normalizedTask.createdByEmail) === normalizedEmail)
    || (userId && baFoxSafeString(normalizedTask.createdByUserId).toLowerCase() === userId)
  );
}

function identityDashboardMetadata_(request, routeName) {
  var identity = getCurrentUserProfile_(request || {}, {});
  var permissions = identity.permissions || profilePermissions_(identity.profile);
  var taskIdentitySchema = baFoxTaskIdentitySchemaStatus_();
  var visibilityMode = identityVisibilityMode_();
  var identityWarnings = [];
  if (!taskIdentitySchema.allPresent) {
    identityWarnings.push('TASK_IDENTITY_COLUMNS_OPTIONAL_OR_MISSING');
  }
  if (visibilityMode !== 'enforced') {
    identityWarnings.push('TASK_VISIBILITY_NOT_ENFORCED');
  }
  return {
    identityMode: identity.identityMode,
    enforcementMode: identity.enforcementMode,
    visibilityMode: visibilityMode,
    filteredByUser: false,
    taskIdentitySchema: taskIdentitySchema,
    optionalIdentityColumnsPresent: taskIdentitySchema.anyPresent,
    identityWarnings: identityWarnings,
    recommendedTaskIdentityColumns: taskIdentitySchema.recommendedTaskIdentityColumns,
    effectiveRole: identity.profile && identity.profile.accessRole ? identity.profile.accessRole : 'viewer',
    canSeeAll: permissions.canSeeAll === true,
    canCreateTasks: permissions.canCreateTasks === true,
    canUseDashboard: permissions.canUseDashboard === true,
    canManageUsers: permissions.canManageUsers === true,
    route: routeName || '',
    limitations: identity.limitations || []
  };
}
