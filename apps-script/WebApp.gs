function doGet() {
  var output = {
    ok: true,
    app: 'BA Fox V2 Apps Script scaffold',
    version: BA_FOX_CONFIG.VERSION,
    dryRun: BA_FOX_CONFIG.DRY_RUN,
    message: 'Stage V2.2 scaffold only. Web/PWA hosting is not enabled here.'
  };

  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(event) {
  var body = event && event.postData && event.postData.contents;
  return ContentService
    .createTextOutput(JSON.stringify(baFoxError(
      'NOT_IMPLEMENTED',
      'Stage V2.2 does not expose live write endpoints.',
      { receivedBody: Boolean(body) }
    )))
    .setMimeType(ContentService.MimeType.JSON);
}
