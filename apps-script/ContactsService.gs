function baFoxListContacts_(limit) {
  var sheet = baFoxGetSheetByName_(BA_FOX_CONFIG.SHEETS.CONTACTS);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var values = sheet.getDataRange().getValues();
  var headers = values[0].map(function(value) { return baFoxSafeString(value).toLowerCase(); });
  function value(row, names) {
    for (var index = 0; index < names.length; index += 1) {
      var column = headers.indexOf(names[index]);
      if (column !== -1) return baFoxSafeString(row[column]);
    }
    return '';
  }
  return values.slice(1).map(function(row) {
    return {
      displayName: value(row, ['display name', 'name', 'название']),
      organization: value(row, ['organization', 'организация']),
      role: value(row, ['role', 'роль']),
      status: value(row, ['status', 'статус'])
    };
  }).filter(function(contact) {
    return contact.displayName || contact.organization;
  }).filter(function(contact) {
    return !contact.status || ['active', 'активный'].indexOf(contact.status.toLowerCase()) !== -1;
  }).slice(0, Number(limit) || 100);
}
