function baFoxAuditEvent(action, entityType, entityId, details) {
  return {
    dryRun: true,
    event: {
      timestamp: baFoxIsoNow(),
      actor: baFoxSafeString(details && details.actor) || 'apps_script_scaffold',
      action: action,
      entityType: entityType,
      entityId: entityId || '',
      source: 'apps_script',
      notes: details || {}
    },
    message: 'Stage V2.2 scaffold does not append audit rows.'
  };
}
