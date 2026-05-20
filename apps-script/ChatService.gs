function baFoxBuildGoogleChatText(payload) {
  var title = baFoxSafeString(payload && payload.title) || 'BA Fox notification';
  var body = baFoxSafeString(payload && payload.body) || 'Dry-run scaffold message.';
  return title + '\n\n' + body;
}

function baFoxSendGoogleChatDryRun(payload) {
  return baFoxSendNotificationDryRun('google_chat', {
    text: baFoxBuildGoogleChatText(payload)
  });
}
