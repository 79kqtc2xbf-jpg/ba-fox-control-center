(function (global) {
  function loading(route) {
    return {
      status: 'loading',
      route: route,
      message: 'Загружаю задачи EA FOX...',
      data: null,
      error: null,
      isMock: false,
    };
  }

  function success(route, data, options) {
    const settings = options || {};
    return {
      status: 'success',
      route: route,
      message: settings.message || '',
      data: data,
      error: null,
      isMock: Boolean(settings.isMock),
    };
  }

  function empty(route, data, options) {
    const settings = options || {};
    return {
      status: 'empty',
      route: route,
      message: settings.message || 'Задач в этом разделе пока нет.',
      data: data,
      error: null,
      isMock: Boolean(settings.isMock),
    };
  }

  function error(route, clientError, options) {
    const settings = options || {};
    return {
      status: 'error',
      route: route,
      message: settings.message || 'Не удалось загрузить read-only данные EA FOX.',
      data: settings.fallbackData || null,
      error: clientError,
      isMock: Boolean(settings.isMock),
    };
  }

  function mock(route, data) {
    const taskList = data && data.tasks;
    if (Array.isArray(taskList) && taskList.length === 0) {
      return empty(route, data, {
        isMock: true,
        message: 'Demo mode: задач в этом разделе пока нет.',
      });
    }

    return success(route, data, {
      isMock: true,
      message: 'Demo mode / mock data',
    });
  }

  global.BAFoxUiState = Object.freeze({
    loading,
    success,
    empty,
    error,
    mock,
  });
}(window));
