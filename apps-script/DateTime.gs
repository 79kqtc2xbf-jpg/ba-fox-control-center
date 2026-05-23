function baFoxNow() {
  return new Date();
}

function baFoxIsoNow() {
  return Utilities.formatDate(baFoxNow(), BA_FOX_CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function baFoxTodayDateString() {
  return Utilities.formatDate(baFoxNow(), BA_FOX_CONFIG.TIMEZONE, 'yyyy-MM-dd');
}

function baFoxDateOrToday(dateValue) {
  var value = baFoxSafeString(dateValue);
  if (value) {
    return value;
  }
  return baFoxTodayDateString();
}

function baFoxTaskDateValue(dateValue) {
  if (Object.prototype.toString.call(dateValue) === '[object Date]' && !isNaN(dateValue.getTime())) {
    return Utilities.formatDate(dateValue, BA_FOX_CONFIG.TIMEZONE, 'yyyy-MM-dd');
  }
  return baFoxSafeString(dateValue);
}

function baFoxBuildTaskId(prefixDate) {
  var dateText = baFoxDateOrToday(prefixDate).replace(/-/g, '');
  return 'BA-' + dateText + '-DRYRUN';
}
