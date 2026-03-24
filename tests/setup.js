/**
 * 测试环境设置文件
 * 模拟微信小程序的全局 API
 */

// 模拟微信小程序全局对象
global.wx = {
  // 基础 API
  request: jest.fn((options) => {
    return Promise.resolve({ data: { success: true } });
  }),

  showToast: jest.fn((options) => {
    return Promise.resolve();
  }),

  showLoading: jest.fn((options) => {
    return Promise.resolve();
  }),

  hideLoading: jest.fn(),

  navigateTo: jest.fn((options) => {
    return Promise.resolve();
  }),

  navigateBack: jest.fn((options) => {
    return Promise.resolve();
  }),

  reLaunch: jest.fn((options) => {
    return Promise.resolve();
  }),

  switchTab: jest.fn((options) => {
    return Promise.resolve();
  }),

  showModal: jest.fn((options) => {
    if (options.success) {
      options.success({ confirm: true });
    }
    return Promise.resolve();
  }),

  showActionSheet: jest.fn((options) => {
    if (options.success) {
      options.success({ tapIndex: 0 });
    }
    return Promise.resolve();
  }),

  setStorageSync: jest.fn((key, value) => {
    global.wx.__storage[key] = value;
  }),

  getStorageSync: jest.fn((key) => {
    return global.wx.__storage[key];
  }),

  removeStorageSync: jest.fn((key) => {
    delete global.wx.__storage[key];
  }),

  clearStorageSync: jest.fn(() => {
    global.wx.__storage = {};
  }),

  // 云开发 API
  cloud: {
    init: jest.fn(),
    callFunction: jest.fn((options) => {
      const mockResponse = {
        result: {
          success: true,
          data: null,
          message: 'mock success'
        }
      };
      if (options.success) options.success(mockResponse);
      if (options.fail) options.fail(mockResponse);
      if (options.complete) options.complete();
      return Promise.resolve(mockResponse);
    }),
    database: jest.fn(() => ({
      collection: jest.fn((name) => ({
        add: jest.fn().mockResolvedValue({ _id: 'mock-id' }),
        doc: jest.fn((id) => ({
          get: jest.fn().mockResolvedValue({ data: {} }),
          set: jest.fn().mockResolvedValue({}),
          update: jest.fn().mockResolvedValue({}),
          remove: jest.fn().mockResolvedValue({})
        })),
        get: jest.fn().mockResolvedValue({ data: [] }),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        field: jest.fn().mockReturnThis()
      }))
    }))
  },

  createAnimation: jest.fn((options) => ({
    step: jest.fn().mockReturnThis(),
    export: jest.fn().mockReturnValue({})
  })),

  createSelectorQuery: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    selectAll: jest.fn().mockReturnThis(),
    boundingClientRect: jest.fn((cb) => {
      if (cb) cb({ left: 0, top: 0, width: 375, height: 667 });
      return jest.fn().mockReturnThis();
    }),
    exec: jest.fn((cb) => {
      if (cb) cb([{ left: 0, top: 0, width: 375, height: 667 }]);
    })
  })),

  getSystemInfoSync: jest.fn(() => ({
    screenWidth: 375,
    screenHeight: 812,
    windowWidth: 375,
    windowHeight: 667,
    pixelRatio: 2,
    platform: 'devtools'
  })),

  stopPullDownRefresh: jest.fn(),

  // 存储初始化
  __storage: {}
};

// 页面注册器
global.__pageInstances = {};
global.__app = null;

// 模拟 Page 函数 - 保存页面定义并在需要时创建实例
global.Page = (options) => {
  // 创建页面实例的工厂函数
  const createInstance = () => {
    const instance = {
      data: { ...options.data },
      setData: function(updates) {
        Object.assign(this.data, updates);
      }
    };

    // 绑定所有方法到实例
    for (const key in options) {
      if (typeof options[key] === 'function') {
        instance[key] = options[key].bind(instance);
      }
    }

    return instance;
  };

  return createInstance;
};

global.App = jest.fn((options) => {
  global.__app = options;
});

global.Component = jest.fn((options) => {
  console.log('[Component]', options);
});

global.getApp = jest.fn(() => global.__app);

global.getCurrentPages = jest.fn(() => []);

// 模拟 console
global.console = {
  ...global.console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// 清空存储
beforeEach(() => {
  wx.__storage = {};
  wx.request.mockClear();
  wx.showToast.mockClear();
  wx.showLoading.mockClear();
  wx.navigateTo.mockClear();
  wx.navigateBack.mockClear();
  wx.reLaunch.mockClear();
  wx.switchTab.mockClear();
  wx.cloud.callFunction.mockClear();
  wx.showModal.mockClear();
  wx.showActionSheet.mockClear();
  global.__pageInstances = {};
});

// 测试后清理
afterEach(() => {
  jest.clearAllMocks();
});
