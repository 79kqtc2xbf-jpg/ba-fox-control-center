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
    accessRole: baFoxSafeString(row[BA_FOX_CONFIG.USERS_COLUMNS.ACCESS_ROLE - 1]) || 'member',
    status: baFoxSafeString(row[BA_FOX_CONFIG.USERS_COLUMNS.STATUS - 1]) || 'active',
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

function getCurrentUserProfile_(request, context) {
  var activeEmail = activeUserEmail_();
  var usersSheetStatus = usersSheetStatus_();
  var limitations = [
    'Backend profile route is available, but dashboard visibility is not filtered yet.',
    'createTask and taskAction are still protected by the existing action token, not by Google identity.',
    'Apps Script active user email may be blank depending on web app deployment settings.',
    'Token verification for Google Identity Services is not implemented in this stage.'
  ];

  if (!activeEmail) {
    return {
      identityMode: 'missing_active_user_email',
      profile: getFallbackUserProfile_(),
      allowedDomain: BA_FOX_CONFIG.ALLOWED_WORKSPACE_DOMAIN,
      isBackendEnforced: false,
      usersSheet: usersSheetStatus,
      limitations: limitations
    };
  }

  if (!isAllowedWorkspaceEmail_(activeEmail)) {
    var outsideProfile = getFallbackUserProfile_();
    outsideProfile.email = activeEmail;
    outsideProfile.status = 'domain_not_allowed';
    outsideProfile.isAuthenticated = true;
    return {
      identityMode: 'active_user_email_wrong_domain',
      profile: outsideProfile,
      allowedDomain: BA_FOX_CONFIG.ALLOWED_WORKSPACE_DOMAIN,
      isBackendEnforced: false,
      usersSheet: usersSheetStatus,
      limitations: limitations.concat(['Active user email is outside the allowed workspace domain.'])
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
      identityMode: usersSheetStatus.exists ? 'active_user_email_unregistered' : 'users_sheet_missing',
      profile: unregisteredProfile,
      allowedDomain: BA_FOX_CONFIG.ALLOWED_WORKSPACE_DOMAIN,
      isBackendEnforced: false,
      usersSheet: usersSheetStatus,
      limitations: limitations.concat(['User must be added to the Users sheet before role/profile enforcement.'])
    };
  }

  user.isAuthenticated = true;
  user.isRegistered = true;
  user.isAllowedDomain = true;
  return {
    identityMode: 'active_user_email_registered',
    profile: user,
    allowedDomain: BA_FOX_CONFIG.ALLOWED_WORKSPACE_DOMAIN,
    isBackendEnforced: false,
    usersSheet: usersSheetStatus,
    limitations: limitations
  };
}

function baFoxGetProfile(request) {
  return baFoxOk(getCurrentUserProfile_(request || {}, {}));
}
