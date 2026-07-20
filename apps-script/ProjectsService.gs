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

function baFoxProjectAllowedKeys_() {
  return [
    'route',
    'callback',
    'token',
    'idToken',
    'identityToken',
    'credential',
    'googleCredential',
    'projectId',
    'name',
    'department',
    'ownerEmail',
    'status',
    'description'
  ];
}

function baFoxFindProjectRow_(projectId) {
  var sheet = baFoxProjectsSheet_();
  if (!sheet) {
    return {
      ok: false,
      error: baFoxError('PROJECTS_SHEET_MISSING', 'Projects sheet is not available.', {})
    };
  }
  var values = sheet.getDataRange().getValues();
  var matches = [];
  for (var index = 1; index < values.length; index += 1) {
    if (baFoxSafeString(values[index][BA_FOX_CONFIG.PROJECT_COLUMNS.ID - 1]) === baFoxSafeString(projectId)) {
      matches.push({
        rowNumber: index + 1,
        row: values[index]
      });
    }
  }
  if (!matches.length) {
    return {
      ok: false,
      error: baFoxError('PROJECT_NOT_FOUND', 'Project was not found.', { projectId: projectId })
    };
  }
  if (matches.length !== 1) {
    return {
      ok: false,
      error: baFoxError('DUPLICATE_PROJECT_ID', 'Project id must match exactly one row.', {
        projectId: projectId,
        matches: matches.length
      })
    };
  }
  return {
    ok: true,
    sheet: sheet,
    rowNumber: matches[0].rowNumber,
    row: matches[0].row
  };
}

function baFoxUpdateProject_(request) {
  var normalized = baFoxNormalizeRequest(request || {});
  var rejectedKeys = Object.keys(normalized).filter(function(key) {
    return baFoxProjectAllowedKeys_().indexOf(key) === -1 && baFoxSafeString(normalized[key]);
  });
  if (rejectedKeys.length) {
    return baFoxError('FIELDS_NOT_ALLOWED', 'Only supported project fields can be updated.', {
      rejectedFields: rejectedKeys
    });
  }
  if (!baFoxSafeString(normalized.projectId)) {
    return baFoxError('VALIDATION_ERROR', 'Project id is required.', {});
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
    return baFoxError('WRITE_FORBIDDEN', 'Only admin or executive profiles can update projects.', {});
  }
  if (BA_FOX_CONFIG.SAFE_WRITE_MODE !== true) {
    return baFoxError('SAFE_WRITES_DISABLED', 'Safe writes are disabled.', {});
  }

  var match = baFoxFindProjectRow_(normalized.projectId);
  if (!match.ok) {
    return match.error;
  }
  var previous = baFoxNormalizeProjectRow_(match.row);
  var next = {
    name: Object.prototype.hasOwnProperty.call(normalized, 'name') ? baFoxSafeString(normalized.name) : previous.name,
    department: Object.prototype.hasOwnProperty.call(normalized, 'department') ? baFoxSafeString(normalized.department) : previous.department,
    ownerEmail: Object.prototype.hasOwnProperty.call(normalized, 'ownerEmail')
      ? normalizeWorkspaceEmail_(normalized.ownerEmail)
      : previous.ownerEmail,
    status: Object.prototype.hasOwnProperty.call(normalized, 'status') ? baFoxSafeString(normalized.status) : previous.status,
    description: Object.prototype.hasOwnProperty.call(normalized, 'description') ? baFoxSafeString(normalized.description) : previous.description
  };
  if (!next.name || !next.department) {
    return baFoxError('VALIDATION_ERROR', 'Project name and department are required.', {});
  }
  if (BA_FOX_CONFIG.PROJECT_STATUSES.indexOf(next.status) === -1) {
    return baFoxError('VALIDATION_ERROR', 'Project status is not allowed.', { status: next.status });
  }
  if ([next.name, next.department, next.ownerEmail, next.description].some(baFoxLooksLikeFormula_)) {
    return baFoxError('VALIDATION_ERROR', 'Formula-like values are not allowed.', {});
  }

  var owner = next.ownerEmail ? findUserByEmail_(next.ownerEmail) : null;
  var updatedAt = baFoxIsoNow();
  var updatedProject = {
    id: previous.id,
    name: next.name,
    department: next.department,
    ownerEmail: owner ? owner.email : next.ownerEmail,
    ownerUserId: owner ? owner.userId : '',
    status: next.status,
    description: next.description,
    createdAt: previous.createdAt,
    createdByEmail: previous.createdByEmail,
    updatedAt: updatedAt
  };
  var columns = BA_FOX_CONFIG.PROJECT_COLUMNS;
  [
    [columns.NAME, updatedProject.name],
    [columns.DEPARTMENT, updatedProject.department],
    [columns.OWNER_EMAIL, updatedProject.ownerEmail],
    [columns.OWNER_USER_ID, updatedProject.ownerUserId],
    [columns.STATUS, updatedProject.status],
    [columns.DESCRIPTION, updatedProject.description],
    [columns.UPDATED_AT, updatedProject.updatedAt]
  ].forEach(function(update) {
    match.sheet.getRange(match.rowNumber, update[0]).setValue(update[1]);
  });

  var changedFields = ['name', 'department', 'ownerEmail', 'status', 'description'].filter(function(field) {
    return baFoxSafeString(previous[field]) !== baFoxSafeString(updatedProject[field]);
  });
  var auditResult = baFoxAuditTaskAction({
    timestamp: updatedAt,
    actor: authorization.profile.email,
    taskId: previous.id,
    entityType: 'project',
    action: updatedProject.status === 'Archived' && previous.status !== 'Archived'
      ? 'archiveProject'
      : previous.status === 'Archived' && updatedProject.status !== 'Archived'
        ? 'restoreProject'
        : 'updateProject',
    routeAction: 'updateProject',
    source: 'web',
    result: 'success',
    changedFields: changedFields.join(','),
    previousValues: baFoxSafeJson_(previous),
    newValues: baFoxSafeJson_(updatedProject),
    errorCode: ''
  });

  return baFoxOk({
    project: updatedProject,
    changedFields: changedFields,
    auditResult: auditResult
  });
}
