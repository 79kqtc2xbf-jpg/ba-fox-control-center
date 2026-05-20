function baFoxSendNotificationDryRun(channel, payload) {
  if (!baFoxValidateEnum(channel, BA_FOX_CONFIG.NOTIFICATION_CHANNELS)) {
    return baFoxError('VALIDATION_ERROR', 'Invalid notification channel.', { channel: channel });
  }

  return baFoxOk({
    dryRun: true,
    channel: channel,
    payloadSummary: payload ? Object.keys(payload) : [],
    sent: false,
    message: 'Notifications are disabled in Stage V2.2 scaffold.'
  });
}
