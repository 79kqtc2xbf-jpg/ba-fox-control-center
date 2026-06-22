// Product owner: Liza Kiseleva. Product concept and workflow architecture for BA Fox / MF Group Tracker.
// Stage 30 compatibility patch: explicit legacy direction mapping and safe unknown fallback.
(function () {
  const directionAliasRules = Object.freeze([
    {
      id: 'management',
      aliases: ['management', 'руководство', 'управление', 'teodor', 'theodor'],
    },
    {
      id: 'operations',
      aliases: ['operations', 'операции', 'ops', 'операц', 'communication', 'коммуникация'],
    },
    {
      id: 'finance',
      aliases: ['finance', 'финансы', 'платеж', 'платёж', 'bank', 'банк', 'kyb'],
    },
    {
      id: 'legal',
      aliases: [
        'legal',
        'юрид',
        'compliance',
        'комплаенс',
        'kyc',
        'contract',
        'договор',
        'document',
        'documents',
        'документ',
        'документы',
      ],
    },
    {
      id: 'sales',
      aliases: [
        'sales',
        'продажи',
        'partner',
        'partners',
        'партнер',
        'партнёр',
        'broker',
        'brokers',
        'брокер',
        'брокеры',
      ],
    },
    {
      id: 'marketing',
      aliases: [
        'marketing',
        'маркетинг',
        'presentation',
        'presentations',
        'презентац',
        'презентации',
        'deck',
        'дек',
        'offer',
      ],
    },
    {
      id: 'product_it',
      aliases: ['product', 'продукт', 'it', 'айти', 'tech', 'web', 'app', 'qa'],
    },
    {
      id: 'admin_ea',
      aliases: [
        'admin',
        'админ',
        'ea',
        'assistant',
        'отчёт',
        'отчет',
        'report',
        'reminder',
        'waiting',
        'ждут ответа',
        'напомнить',
      ],
    },
  ]);

  function normalize(value) {
    return String(value == null ? '' : value).trim().toLowerCase();
  }

  function taskDirectionRawValue(task) {
    return String((task && (task.department || task.direction || task.category || task.taskType)) || '').trim();
  }

  function patchedTaskDirectionKey(task) {
    const raw = normalize(taskDirectionRawValue(task));
    if (!raw || raw === 'без категории' || raw === 'none' || raw === 'unassigned' || raw === 'не назначено') {
      return 'unassigned';
    }

    const matched = directionAliasRules.find(function (direction) {
      return direction.id === raw || direction.aliases.some(function (alias) {
        return raw.includes(alias);
      });
    });

    return matched ? matched.id : 'unassigned';
  }

  function applyDirectionFallbackPatch() {
    window.taskDirectionKey = patchedTaskDirectionKey;
    window.BAFoxDirectionFallbackPatch = Object.freeze({
      stage: '30.1',
      unknownFallback: 'unassigned',
      loadedAt: new Date().toISOString(),
    });
  }

  setTimeout(applyDirectionFallbackPatch, 0);
  setTimeout(applyDirectionFallbackPatch, 100);
  window.addEventListener('load', applyDirectionFallbackPatch);
}());
