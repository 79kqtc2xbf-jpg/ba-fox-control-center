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
  if (!token) {
    return {
      ok: false,
      mode: 'missing_token',
      claims: null,
      error: 'MISSING_TOKEN',
      message: 'Google identity token is missing.'
    };
  }
  if (typeof UrlFetchApp === 'undefined') {
    return {
      ok: false,
      mode: 'google_token_invalid',
      claims: null,
      error: 'URL_FETCH_UNAVAILABLE',
      message: 'Apps Script UrlFetchApp is not available for token verification.'
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
        message: claims.error_description || 'Google tokeninfo rejected the identity token.'
      };
    }
    if (clientId && claims.aud !== clientId) {
      return {
        ok: false,
        mode: 'google_token_invalid',
        claims: claims,
        error: 'AUDIENCE_MISMATCH',
        message: 'Google identity token audience does not match configured client ID.'
      };
    }
    if (!baFoxSafeString(claims.email)) {
      return {
        ok: false,
        mode: 'google_token_invalid',
        claims: claims,
        error: 'EMAIL_MISSING',
        message: 'Google identity token does not include email.'
      };
    }
    if (claims.email_verified !== undefined && String(claims.email_verified) !== 'true') {
      return {
        ok: false,
        mode: 'google_token_invalid',
        claims: claims,
        error: 'EMAIL_NOT_VERIFIED',
        message: 'Google identity token email is not verified.'
      };
    }
    return {
      ok: true,
      mode: 'google_token_verified',
      claims: claims,
      email: normalizeWorkspaceEmail_(claims.email),
      clientIdConfigured: Boolean(clientId)
    };
  } catch (err) {
    return {
      ok: false,
      mode: 'google_token_invalid',
      claims: null,
      error: 'TOKEN_VERIFICATION_FAILED',
      message: err && err.message ? err.message : 'Google identity token verification failed.'
    };
  }
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

function safeUserSummary_(user) {
  return {
    userId: baFoxSafeString(user && user.userId),
    email: normalizeWorkspaceEmail_(user && user.email),
    displayName: baFoxSafeString(user && user.displayName),
    accessRole: baFoxSafeString(user && user.accessRole),
    defaultOwnerLabel: baFoxSafeString(user && user.defaultOwnerLabel),
    department: baFoxSafeString(user && user.department),
    status: baFoxSafeString(user && user.status)
  };
}

function getSafeActiveUsersForPreview_(request) {
  var identity = getCurrentUserProfile_(request || {}, {});
  if (identity.identityMode !== 'google_token_verified' || !profileCanManageUsers_(identity.profile)) {
    return baFoxError('ADMIN_REQUIRED', 'Admin profile is required for active user preview list.', {
      identityMode: identity.identityMode
    });
  }
  return baFoxOk({
    users: getUsers_().filter(function(user) {
      return user.status === 'active';
    }).map(safeUserSummary_)
  });
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
      tokenVerification: {
        ok: tokenResult.ok === true,
        mode: tokenResult.mode || 'missing_token',
        error: tokenResult.error || ''
      }
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
      tokenVerification: {
        ok: tokenResult.ok === true,
        mode: tokenResult.mode || 'missing_token',
        error: tokenResult.error || ''
      }
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
      tokenVerification: {
        ok: tokenResult.ok === true,
        mode: tokenResult.mode || 'missing_token',
        error: tokenResult.error || ''
      }
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
      tokenVerification: {
        ok: tokenResult.ok === true,
        mode: tokenResult.mode || 'missing_token',
        error: tokenResult.error || ''
      }
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
    tokenVerification: {
      ok: tokenResult.ok === true,
      mode: tokenResult.mode || 'missing_token',
      error: tokenResult.error || ''
    }
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

function taskIdentityValues_(task) {
  return [
    task.ownerEmail,
    task.ownerUserId,
    task.createdByEmail,
    task.createdByUserId,
    task.collaboratorEmails,
    task.collaboratorUserIds,
    task.owner
  ].map(function(value) {
    return baFoxSafeString(value).toLowerCase();
  }).join(' ');
}

function profileCanSeeTask_(profile, task) {
  if (!profileCanUseDashboard_(profile)) {
    return false;
  }
  if (profileCanSeeAll_(profile)) {
    return true;
  }
  var haystack = taskIdentityValues_(task || {});
  return Boolean(haystack) && (
    haystack.indexOf(normalizeWorkspaceEmail_(profile.email)) !== -1
    || haystack.indexOf(baFoxSafeString(profile.userId).toLowerCase()) !== -1
    || haystack.indexOf(baFoxSafeString(profile.defaultOwnerLabel).toLowerCase()) !== -1
  );
}

function baFoxSplitIdentityList_(value) {
  return baFoxSafeString(value).toLowerCase().split(/[,\n;]/).map(function(item) {
    return baFoxSafeString(item);
  }).filter(Boolean);
}

function buildTaskVisibilityReason_(profile, task) {
  if (!profileCanUseDashboard_(profile)) {
    return {
      visible: false,
      reason: 'dashboard_forbidden',
      legacyUnclassified: false
    };
  }
  if (profileCanSeeAll_(profile)) {
    return {
      visible: true,
      reason: 'canSeeAll',
      legacyUnclassified: !baFoxSafeString(task.ownerEmail)
        && !baFoxSafeString(task.ownerUserId)
        && !baFoxSafeString(task.createdByEmail)
        && !baFoxSafeString(task.createdByUserId)
        && !baFoxSafeString(task.collaboratorEmails)
        && !baFoxSafeString(task.collaboratorUserIds)
    };
  }

  var email = normalizeWorkspaceEmail_(profile.email);
  var userId = baFoxSafeString(profile.userId).toLowerCase();
  var ownerLabel = baFoxSafeString(profile.defaultOwnerLabel).toLowerCase();
  var taskOwnerLabel = baFoxSafeString(task.owner).toLowerCase();
  var legacyUnclassified = !baFoxSafeString(task.ownerEmail)
    && !baFoxSafeString(task.ownerUserId)
    && !baFoxSafeString(task.createdByEmail)
    && !baFoxSafeString(task.createdByUserId)
    && !baFoxSafeString(task.collaboratorEmails)
    && !baFoxSafeString(task.collaboratorUserIds);

  if (email && normalizeWorkspaceEmail_(task.ownerEmail) === email) {
    return { visible: true, reason: 'ownerEmail', legacyUnclassified: legacyUnclassified };
  }
  if (userId && baFoxSafeString(task.ownerUserId).toLowerCase() === userId) {
    return { visible: true, reason: 'ownerUserId', legacyUnclassified: legacyUnclassified };
  }
  if (ownerLabel && taskOwnerLabel === ownerLabel) {
    return { visible: true, reason: 'ownerLabel', legacyUnclassified: legacyUnclassified };
  }
  if (email && baFoxSplitIdentityList_(task.collaboratorEmails).indexOf(email) !== -1) {
    return { visible: true, reason: 'collaboratorEmail', legacyUnclassified: legacyUnclassified };
  }
  if (userId && baFoxSplitIdentityList_(task.collaboratorUserIds).indexOf(userId) !== -1) {
    return { visible: true, reason: 'collaboratorUserId', legacyUnclassified: legacyUnclassified };
  }
  if (email && normalizeWorkspaceEmail_(task.createdByEmail) === email) {
    return { visible: true, reason: 'createdBy', legacyUnclassified: legacyUnclassified };
  }
  if (userId && baFoxSafeString(task.createdByUserId).toLowerCase() === userId) {
    return { visible: true, reason: 'createdBy', legacyUnclassified: legacyUnclassified };
  }
  return {
    visible: false,
    reason: legacyUnclassified ? 'legacy_unclassified' : 'no_match',
    legacyUnclassified: legacyUnclassified
  };
}

function buildVisibilityPreview_(profile, tasks, options) {
  var settings = options || {};
  var reasonCounts = {
    canSeeAll: 0,
    ownerEmail: 0,
    ownerUserId: 0,
    ownerLabel: 0,
    collaboratorEmail: 0,
    collaboratorUserId: 0,
    createdBy: 0,
    legacyUnclassified: 0,
    noMatch: 0
  };
  var visible = 0;
  var legacyUnclassified = 0;
  (tasks || []).forEach(function(task) {
    var reason = buildTaskVisibilityReason_(profile, task);
    if (reason.visible) {
      visible += 1;
      if (reasonCounts[reason.reason] !== undefined) {
        reasonCounts[reason.reason] += 1;
      }
    } else if (reason.reason === 'no_match') {
      reasonCounts.noMatch += 1;
    }
    if (reason.legacyUnclassified) {
      legacyUnclassified += 1;
      reasonCounts.legacyUnclassified += 1;
    }
  });

  return {
    mode: 'dry_run',
    filteredByUser: false,
    wouldFilterInEnforcedMode: !profileCanSeeAll_(profile),
    effectiveUser: profile && (profile.email || profile.displayName || profile.userId) || '',
    effectiveUserId: profile && profile.userId || '',
    effectiveRole: profile && profile.accessRole || 'viewer',
    previewedByAdmin: settings.previewedByAdmin === true,
    totalTasks: (tasks || []).length,
    visibleIfEnforced: visible,
    hiddenIfEnforced: Math.max((tasks || []).length - visible, 0),
    legacyUnclassified: legacyUnclassified,
    reasonCounts: reasonCounts
  };
}

function getVisibleTasksForProfileDryRun_(profile, tasks) {
  return (tasks || []).filter(function(task) {
    return buildTaskVisibilityReason_(profile, task).visible;
  });
}

function baFoxGetVisibilityPreview(request) {
  var normalized = baFoxNormalizeRequest(request || {});
  var identity = getCurrentUserProfile_(normalized, {});
  var profile = identity.profile || getFallbackUserProfile_();
  var previewedByAdmin = false;
  if (baFoxSafeString(normalized.previewUserId || normalized.userId || normalized.email)) {
    if (identity.identityMode !== 'google_token_verified' || !profileCanManageUsers_(profile)) {
      return baFoxError('ADMIN_REQUIRED', 'Admin profile is required for impersonated visibility preview.', {
        identityMode: identity.identityMode
      });
    }
    var lookup = baFoxSafeString(normalized.previewUserId || normalized.userId).toLowerCase();
    var lookupEmail = normalizeWorkspaceEmail_(normalized.email);
    var users = getUsers_();
    for (var index = 0; index < users.length; index += 1) {
      if ((lookup && baFoxSafeString(users[index].userId).toLowerCase() === lookup)
        || (lookupEmail && users[index].email === lookupEmail)) {
        profile = applyRegisteredProfileFlags_(users[index], 'admin_visibility_preview');
        previewedByAdmin = true;
        break;
      }
    }
  }
  var storeResult = baFoxReadTasksRows();
  var tasks = baFoxNormalizeTaskRows_(storeResult);
  return baFoxOk({
    visibilityPreview: buildVisibilityPreview_(profile, tasks, {
      previewedByAdmin: previewedByAdmin
    })
  });
}

function identityDashboardMetadata_(request, routeName) {
  var identity = getCurrentUserProfile_(request || {}, {});
  var permissions = identity.permissions || profilePermissions_(identity.profile);
  var storeTasks = request && request.__normalizedTasks ? request.__normalizedTasks : null;
  return {
    identityMode: identity.identityMode,
    enforcementMode: identity.enforcementMode,
    visibilityMode: identityVisibilityMode_(),
    filteredByUser: false,
    effectiveRole: identity.profile && identity.profile.accessRole ? identity.profile.accessRole : 'viewer',
    canSeeAll: permissions.canSeeAll === true,
    canCreateTasks: permissions.canCreateTasks === true,
    canUseDashboard: permissions.canUseDashboard === true,
    canManageUsers: permissions.canManageUsers === true,
    route: routeName || '',
    limitations: identity.limitations || [],
    taskIdentitySchema: getTaskIdentitySchemaStatus_(),
    visibilityPreview: storeTasks ? buildVisibilityPreview_(identity.profile, storeTasks, {}) : null
  };
}
