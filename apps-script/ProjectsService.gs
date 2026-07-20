function baFoxProjectsSheet_() {
  return baFoxGetSheetByName_(BA_FOX_CONFIG.SHEETS.PROJECTS);
}

function baFoxNormalizeProjectRow_(row) {
  row = row || [];
  return {
    id: baFoxSafeString(row[BA_FOX_CONFIG.PROJECT_COLUMNS.ID - 1]),
    name: baFoxSafeString(row[BA_FOX_CONFIG.PROJECT_COLUMNS.NAME - 1]),
    department: baFoxSafeString(row[BA_FOX_CONFIG.PROJECT_COLUMNS.DEPARTMENT - 1]),
    ownerEmail: normalizeWorkspaceEmail_(row[BA_FOX_CONFIG.PROJECT_COLUMNS.OWNER_EMAIL - 1]),
    ownerUserId: baFoxSafeString(row[BA_FOX_CONFIG.PROJECT_COLUMNS.OWNER_USER_ID - 1]),
    status: baFoxSafeString(row[BA_FOX_CONFIG.PROJECT_COLUMNS.STATUS - 1]) || 'Active',
    description: baFoxSafeString(row[BA_FOX_CONFIG.PROJECT_COLUMNS.DESCRIPTION - 1]),
    createdAt: baFoxSafeString(row[BA_FOX_CONFIG.PROJECT_COLUMNS.CREATED_AT - 1]),
    createdByEmail: normalizeWorkspaceEmail_(row[BA_FOX_CONFIG.PROJECT_COLUMNS.CREATED_BY_EMAIL - 1]),
    updatedAt: baFoxSafeString(row[BA_FOX_CONFIG.PROJECT_COLUMNS.UPDATED_AT - 1])
  };
}

function baFoxListProjects_() {
  var sheet = baFoxProjectsSheet_();
  if (!sheet || sheet.getLastRow() < 2) {
    return [];
  }
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getValues()
    .map(baFoxNormalizeProjectRow_)
    .filter(function(project) {
      return Boolean(project.id || project.name);
    });
}

function baFoxProjectId_(now) {
  return 'PRJ-' + Utilities.formatDate(now, BA_FOX_CONFIG.TIMEZONE, 'yyyyMMdd-HHmmss')
    + '-' + Utilities.getUuid().slice(0, 6).toUpperCase();
}

function baFoxCreateProject_(request) {
  var normalized = baFoxNormalizeRequest(request || {});
  var name = baFoxSafeString(normalized.name);
  var department = baFoxSafeString(normalized.department);
  var description = baFoxSafeString(normalized.description);
  if (!name || !department) {
    return baFoxError('VALIDATION_ERROR', 'Project name and department are required.', {});
  }
  if ([name, department, description].some(baFoxLooksLikeFormula_)) {
    return baFoxError('VALIDATION_ERROR', 'Formula-like values are not allowed.', {});
  }

  var authorization = requireVerifiedProfile_(normalized, {
    requireRegistered: true,
    requireGoogleToken: true,
    alwaysEnforce: true
  });
  if (!authorization.ok) {
    return authorization.error;
  }
  if (!profileCanManageProjects_(authorization.profile)) {
    return baFoxError('WRITE_FORBIDDEN', 'Only admin or executive profiles can create projects.', {});
  }
  if (BA_FOX_CONFIG.SAFE_WRITE_MODE !== true) {
    return baFoxError('SAFE_WRITES_DISABLED', 'Safe writes are disabled.', {});
  }

  var sheet = baFoxProjectsSheet_();
  if (!sheet) {
    return baFoxError('PROJECTS_SHEET_MISSING', 'Projects sheet is not available.', {});
  }
  var now = baFoxNow();
  var timestamp = baFoxIsoNow();
  var ownerEmail = normalizeWorkspaceEmail_(normalized.ownerEmail);
  var owner = ownerEmail ? findUserByEmail_(ownerEmail) : null;
  var project = {
    id: baFoxProjectId_(now),
    name: name,
    department: department,
    ownerEmail: owner ? owner.email : ownerEmail,
    ownerUserId: owner ? owner.userId : '',
    status: BA_FOX_CONFIG.PROJECT_STATUSES.indexOf(normalized.status) !== -1 ? normalized.status : 'Active',
    description: description,
    createdAt: timestamp,
    createdByEmail: authorization.profile.email,
    updatedAt: timestamp
  };
  sheet.appendRow([
    project.id,
    project.name,
    project.department,
    project.ownerEmail,
    project.ownerUserId,
    project.status,
    project.description,
    project.createdAt,
    project.createdByEmail,
    project.updatedAt
  ]);
  return baFoxOk({ project: project });
}
