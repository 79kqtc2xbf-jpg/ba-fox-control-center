function baFoxOk(data) {
  return {
    ok: true,
    data: data || {},
    error: null
  };
}

function baFoxError(code, message, details) {
  return {
    ok: false,
    data: null,
    error: {
      code: code || 'ERROR',
      message: message || 'Something went wrong.',
      details: details || null
    }
  };
}

function baFoxNormalizeRequest(request) {
  if (!request) {
    return {};
  }
  if (typeof request === 'string') {
    try {
      return JSON.parse(request);
    } catch (err) {
      return {};
    }
  }
  return request;
}

function baFoxSafeString(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function baFoxRequired(request, fields) {
  var missing = [];
  fields.forEach(function(field) {
    if (!baFoxSafeString(request[field])) {
      missing.push(field);
    }
  });
  return missing;
}

function baFoxValidateEnum(value, allowedValues) {
  return allowedValues.indexOf(value) !== -1;
}

function baFoxValidateTaskType(taskType) {
  return baFoxValidateEnum(taskType, BA_FOX_CONFIG.TASK_TYPES);
}

function baFoxValidateStatus(status) {
  return BA_FOX_CONFIG.FINAL_STATUSES.concat(BA_FOX_CONFIG.OPEN_STATUSES).indexOf(status) !== -1;
}

function baFoxValidateCommentMode(mode) {
  return baFoxValidateEnum(mode, BA_FOX_CONFIG.COMMENT_MODES);
}
