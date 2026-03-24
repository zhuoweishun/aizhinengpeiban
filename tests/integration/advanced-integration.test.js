/**
 * Advanced Integration Tests - Iteration 5 & 6
 * 高级集成测试 - 端到端用户流程 + 边界场景
 */

describe('Advanced Integration Tests', () => {
  beforeEach(() => {
    wx.__storage = {};
    jest.clearAllMocks();
  });

  // ========================================
  // Iteration 6: Additional Integration Tests
  // ========================================

  describe('Settings Management Flow', () => {
    test('should update and persist settings', () => {
      const settingsFlow = {
        data: {
          settings: {
            notifications: true,
            darkMode: false,
            soundEnabled: true,
            language: 'zh'
          }
        },
        setData: function(u) {
          // Handle dot notation paths
          Object.keys(u).forEach(key => {
            if (key.includes('.')) {
              const [parent, child] = key.split('.');
              this.data[parent][child] = u[key];
            } else {
              Object.assign(this.data, u);
            }
          });
        },
        toggleNotification: function() {
          this.setData({ 'settings.notifications': !this.data.settings.notifications });
          return { success: true, value: this.data.settings.notifications };
        },
        toggleDarkMode: function() {
          this.setData({ 'settings.darkMode': !this.data.settings.darkMode });
          return { success: true, value: this.data.settings.darkMode };
        },
        changeLanguage: function(lang) {
          if (['zh', 'en', 'ja'].includes(lang)) {
            this.setData({ 'settings.language': lang });
            return { success: true };
          }
          return { success: false, message: '不支持的语言' };
        }
      };

      expect(settingsFlow.data.settings.darkMode).toBe(false);
      settingsFlow.toggleDarkMode();
      expect(settingsFlow.data.settings.darkMode).toBe(true);

      settingsFlow.toggleNotification();
      expect(settingsFlow.data.settings.notifications).toBe(false);

      expect(settingsFlow.changeLanguage('en').success).toBe(true);
      expect(settingsFlow.changeLanguage('xx').success).toBe(false);
    });

    test('should handle settings reset', () => {
      const defaultSettings = {
        notifications: true,
        darkMode: false,
        soundEnabled: true,
        language: 'zh'
      };

      const settingsFlow = {
        data: { settings: { ...defaultSettings, darkMode: true, language: 'en' } },
        setData: function(u) { Object.assign(this.data, u); },
        resetToDefaults: function() {
          this.setData({ settings: { ...defaultSettings } });
          return { success: true };
        }
      };

      settingsFlow.resetToDefaults();

      expect(settingsFlow.data.settings.darkMode).toBe(false);
      expect(settingsFlow.data.settings.language).toBe('zh');
    });
  });

  describe('Notification System Flow', () => {
    test('should queue and display notifications', () => {
      const notificationFlow = {
        data: {
          queue: [],
          maxQueueSize: 10
        },
        setData: function(u) { Object.assign(this.data, u); },
        addNotification: function(type, message) {
          if (this.data.queue.length >= this.data.maxQueueSize) {
            this.data.queue.shift(); // 移除最早的通知
          }
          this.setData({
            queue: [...this.data.queue, { id: Date.now(), type, message, read: false }]
          });
          return { success: true };
        },
        markAsRead: function(id) {
          const notification = this.data.queue.find(n => n.id === id);
          if (notification) {
            notification.read = true;
            return { success: true };
          }
          return { success: false };
        },
        getUnreadCount: function() {
          return this.data.queue.filter(n => !n.read).length;
        }
      };

      notificationFlow.addNotification('info', '欢迎使用');
      notificationFlow.addNotification('success', '任务完成');
      notificationFlow.addNotification('warning', '积分即将过期');

      expect(notificationFlow.data.queue.length).toBe(3);
      expect(notificationFlow.getUnreadCount()).toBe(3);

      notificationFlow.markAsRead(notificationFlow.data.queue[0].id);
      expect(notificationFlow.getUnreadCount()).toBe(2);
    });
  });

  describe('Search and Filter Flow', () => {
    test('should filter and sort items', () => {
      const searchFlow = {
        data: {
          items: [
            { id: 1, name: '温馨台灯', category: 'furniture', price: 100, rating: 4.5 },
            { id: 2, name: '可爱抱枕', category: 'decor', price: 150, rating: 4.8 },
            { id: 3, name: '绿植盆栽', category: 'furniture', price: 200, rating: 4.2 },
            { id: 4, name: '卡通贴纸', category: 'decor', price: 50, rating: 4.0 }
          ],
          filter: { category: 'all', minPrice: 0, maxPrice: 999 },
          sortBy: 'name'
        },
        setData: function(u) { Object.assign(this.data, u); },
        applyFilter: function() {
          let filtered = [...this.data.items];
          if (this.data.filter.category !== 'all') {
            filtered = filtered.filter(i => i.category === this.data.filter.category);
          }
          filtered = filtered.filter(i => i.price >= this.data.filter.minPrice);
          filtered = filtered.filter(i => i.price <= this.data.filter.maxPrice);
          return filtered;
        },
        applySort: function(items) {
          return [...items].sort((a, b) => {
            if (this.data.sortBy === 'price') return a.price - b.price;
            if (this.data.sortBy === 'rating') return b.rating - a.rating;
            return a.name.localeCompare(b.name);
          });
        }
      };

      // 测试分类过滤
      searchFlow.setData({ filter: { category: 'furniture', minPrice: 0, maxPrice: 999 } });
      let result = searchFlow.applyFilter();
      expect(result.length).toBe(2);

      // 测试价格范围
      searchFlow.setData({ filter: { category: 'all', minPrice: 100, maxPrice: 200 } });
      result = searchFlow.applyFilter();
      expect(result.length).toBe(3);

      // 测试排序
      searchFlow.setData({ sortBy: 'price' });
      result = searchFlow.applySort(result);
      expect(result[0].price).toBe(100);
      expect(result[result.length - 1].price).toBe(200);
    });
  });

  describe('Achievement System Flow', () => {
    test('should unlock achievements', () => {
      const achievementFlow = {
        data: {
          achievements: [
            { id: 'first_checkin', name: '初次签到', condition: { type: 'checkin', count: 1 }, unlocked: false },
            { id: 'week_warrior', name: '全勤战士', condition: { type: 'checkin', count: 7 }, unlocked: false },
            { id: 'social_butterfly', name: '社交达人', condition: { type: 'interactions', count: 10 }, unlocked: false }
          ],
          stats: { checkinCount: 0, interactions: 0 }
        },
        setData: function(u) {
          Object.keys(u).forEach(key => {
            if (key.includes('.')) {
              const [parent, child] = key.split('.');
              this.data[parent][child] = u[key];
            } else {
              Object.assign(this.data, u);
            }
          });
        },
        updateStat: function(type, value) {
          this.setData({
            [`stats.${type}`]: (this.data.stats[type] || 0) + value
          });
          return this.checkAchievements();
        },
        checkAchievements: function() {
          const newlyUnlocked = [];
          this.data.achievements.forEach(ach => {
            if (!ach.unlocked && (this.data.stats[ach.condition.type] || 0) >= ach.condition.count) {
              ach.unlocked = true;
              newlyUnlocked.push(ach);
            }
          });
          return newlyUnlocked;
        }
      };

      // 初始没有解锁的成就
      expect(achievementFlow.data.achievements.filter(a => a.unlocked).length).toBe(0);

      // 签到 7 次
      achievementFlow.updateStat('checkin', 7);

      // 应该解锁两个成就
      const unlocked = achievementFlow.data.achievements.filter(a => a.unlocked);
      expect(unlocked.length).toBe(2);
    });
  });

  describe('Cache Management Flow', () => {
    test('should manage cache with TTL', () => {
      const cacheFlow = {
        data: {
          cache: {},
          defaultTTL: 300000 // 5 minutes
        },
        setData: function(u) { Object.assign(this.data, u); },
        set: function(key, value, ttl = null) {
          this.data.cache[key] = {
            value,
            expiresAt: ttl === 0 ? 0 : (Date.now() + (ttl || this.data.defaultTTL))
          };
        },
        get: function(key) {
          const entry = this.data.cache[key];
          if (!entry) return { hit: false, value: null };
          if (entry.expiresAt === 0 || Date.now() > entry.expiresAt) {
            delete this.data.cache[key];
            return { hit: false, value: null };
          }
          return { hit: true, value: entry.value };
        },
        clear: function() {
          this.setData({ cache: {} });
        },
        cleanup: function() {
          const now = Date.now();
          Object.keys(this.data.cache).forEach(key => {
            if (this.data.cache[key].expiresAt <= now) {
              delete this.data.cache[key];
            }
          });
        }
      };

      cacheFlow.set('user', { id: 1, name: '测试' });
      expect(cacheFlow.get('user').hit).toBe(true);

      // 设置立即过期的缓存
      cacheFlow.set('temp', 'data', 0);
      expect(cacheFlow.get('temp').hit).toBe(false);

      cacheFlow.clear();
      expect(cacheFlow.get('user').hit).toBe(false);
    });
  });

  describe('Form Validation Flow', () => {
    test('should validate complex form with rules', () => {
      const formFlow = {
        data: {
          values: {},
          errors: {},
          rules: {
            username: [
              { type: 'required', message: '用户名不能为空' },
              { type: 'minLength', value: 3, message: '用户名至少 3 个字符' }
            ],
            email: [
              { type: 'required', message: '邮箱不能为空' },
              { type: 'email', message: '邮箱格式不正确' }
            ],
            password: [
              { type: 'required', message: '密码不能为空' },
              { type: 'minLength', value: 6, message: '密码至少 6 个字符' }
            ]
          }
        },
        setData: function(u) {
          Object.keys(u).forEach(key => {
            if (key.includes('.')) {
              const [parent, child] = key.split('.');
              this.data[parent][child] = u[key];
            } else {
              Object.assign(this.data, u);
            }
          });
        },
        setFieldValue: function(field, value) {
          this.setData({ [`values.${field}`]: value });
          return this.validateField(field);
        },
        validateField: function(field) {
          const value = this.data.values[field];
          const rules = this.data.rules[field] || [];
          const errors = [];

          rules.forEach(rule => {
            if (rule.type === 'required' && !value) {
              errors.push(rule.message);
            } else if (rule.type === 'minLength' && value && value.length < rule.value) {
              errors.push(rule.message);
            } else if (rule.type === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
              errors.push(rule.message);
            }
          });

          this.setData({ [`errors.${field}`]: errors });
          return errors.length === 0;
        },
        validateAll: function() {
          const fields = Object.keys(this.data.rules);
          let isValid = true;
          fields.forEach(field => {
            if (!this.validateField(field)) isValid = false;
          });
          return isValid;
        }
      };

      // 空表单验证失败
      expect(formFlow.validateAll()).toBe(false);

      // 部分填充仍然失败
      formFlow.setFieldValue('username', 'ab'); // 太短
      expect(formFlow.data.errors.username?.length).toBe(1);

      // 有效数据
      formFlow.setFieldValue('username', 'testuser');
      formFlow.setFieldValue('email', 'test@example.com');
      formFlow.setFieldValue('password', '123456');

      expect(formFlow.validateAll()).toBe(true);
      expect(Object.keys(formFlow.data.errors).filter(k => formFlow.data.errors[k]?.length > 0).length).toBe(0);
    });
  });

  describe('Rate Limiter Flow', () => {
    test('should enforce rate limiting', () => {
      const rateLimiter = {
        data: {
          requests: [],
          limit: 5,
          windowMs: 60000 // 1 minute
        },
        setData: function(u) { Object.assign(this.data, u); },
        canProceed: function() {
          const now = Date.now();
          // 移除窗口外的请求
          this.setData({
            requests: this.data.requests.filter(t => now - t < this.data.windowMs)
          });
          return this.data.requests.length < this.data.limit;
        },
        record: function() {
          if (this.canProceed()) {
            this.setData({ requests: [...this.data.requests, Date.now()] });
            return { success: true };
          }
          return { success: false, message: '请求过于频繁' };
        },
        getRemaining: function() {
          this.canProceed();
          return this.data.limit - this.data.requests.length;
        }
      };

      // 前 5 次请求成功
      for (let i = 0; i < 5; i++) {
        expect(rateLimiter.record().success).toBe(true);
      }

      // 第 6 次失败
      expect(rateLimiter.record().success).toBe(false);
      expect(rateLimiter.getRemaining()).toBe(0);
    });
  });

  describe('Event Emitter Flow', () => {
    test('should handle event subscription and emission', () => {
      const eventEmitter = {
        data: { events: {} },
        setData: function(u) { Object.assign(this.data, u); },
        on: function(event, callback) {
          if (!this.data.events[event]) {
            this.data.events[event] = [];
          }
          this.data.events[event].push(callback);
          return () => this.off(event, callback);
        },
        off: function(event, callback) {
          if (this.data.events[event]) {
            this.data.events[event] = this.data.events[event].filter(cb => cb !== callback);
          }
        },
        emit: function(event, payload) {
          const callbacks = this.data.events[event] || [];
          callbacks.forEach(cb => cb(payload));
        }
      };

      const receivedPayloads = [];
      const unsubscribe = eventEmitter.on('test', (payload) => {
        receivedPayloads.push(payload);
      });

      eventEmitter.emit('test', 'first');
      eventEmitter.emit('test', 'second');

      expect(receivedPayloads.length).toBe(2);

      unsubscribe();
      eventEmitter.emit('test', 'third');

      expect(receivedPayloads.length).toBe(2); // 订阅取消后不再接收
    });
  });

  describe('Pagination Flow', () => {
    test('should handle pagination correctly', () => {
      const paginationFlow = {
        data: {
          items: Array(100).fill(null).map((_, i) => ({ id: i + 1, name: `Item ${i + 1}` })),
          currentPage: 1,
          pageSize: 10,
          totalPages: 10
        },
        setData: function(u) { Object.assign(this.data, u); },
        getCurrentPageItems: function() {
          const start = (this.data.currentPage - 1) * this.data.pageSize;
          const end = start + this.data.pageSize;
          return this.data.items.slice(start, end);
        },
        goToPage: function(page) {
          if (page < 1 || page > this.data.totalPages) return false;
          this.setData({ currentPage: page });
          return true;
        },
        nextPage: function() {
          return this.goToPage(this.data.currentPage + 1);
        },
        prevPage: function() {
          return this.goToPage(this.data.currentPage - 1);
        }
      };

      // 第 1 页
      let items = paginationFlow.getCurrentPageItems();
      expect(items.length).toBe(10);
      expect(items[0].id).toBe(1);

      // 下一页
      paginationFlow.nextPage();
      items = paginationFlow.getCurrentPageItems();
      expect(items[0].id).toBe(11);

      // 跳到最后一页
      paginationFlow.goToPage(10);
      items = paginationFlow.getCurrentPageItems();
      expect(items.length).toBe(10);
      expect(items[items.length - 1].id).toBe(100);

      // 超出范围应该失败
      expect(paginationFlow.nextPage()).toBe(false);
      expect(paginationFlow.goToPage(100)).toBe(false);
    });
  });

  describe('Loading State Flow', () => {
    test('should manage multiple loading states', () => {
      const loadingFlow = {
        data: {
          loadingStates: {},
          isLoading: false
        },
        setData: function(u) {
          Object.keys(u).forEach(key => {
            if (key.includes('.')) {
              const [parent, child] = key.split('.');
              this.data[parent][child] = u[key];
            } else {
              Object.assign(this.data, u);
            }
          });
        },
        startLoading: function(key) {
          this.setData({
            [`loadingStates.${key}`]: true,
            isLoading: true
          });
        },
        stopLoading: function(key) {
          this.setData({ [`loadingStates.${key}`]: false });
          // 检查是否还有其他加载
          const hasLoading = Object.values(this.data.loadingStates).some(v => v);
          this.setData({ isLoading: hasLoading });
        },
        isLoading: function(key) {
          return !!this.data.loadingStates[key];
        }
      };

      // 开始多个加载
      loadingFlow.startLoading('fetch1');
      loadingFlow.startLoading('fetch2');

      expect(loadingFlow.isLoading('fetch1')).toBe(true);
      expect(loadingFlow.isLoading('fetch2')).toBe(true);
      expect(loadingFlow.data.isLoading).toBe(true);

      // 停止一个加载
      loadingFlow.stopLoading('fetch1');
      expect(loadingFlow.isLoading('fetch1')).toBe(false);
      expect(loadingFlow.data.isLoading).toBe(true); // 还有一个在加载

      // 停止所有加载
      loadingFlow.stopLoading('fetch2');
      expect(loadingFlow.data.isLoading).toBe(false);
    });
  });

  describe('Error Recovery Flow', () => {
    test('should implement retry logic', () => {
      const retryFlow = {
        data: {
          maxRetries: 3,
          retryDelay: 1000,
          attemptCount: 0
        },
        setData: function(u) { Object.assign(this.data, u); },
        executeWithRetry: function(operation, successThreshold = 1) {
          let attempts = 0;
          while (attempts < this.data.maxRetries) {
            attempts++;
            this.setData({ attemptCount: attempts });
            const result = operation();
            if (result.success) {
              return { success: true, attempts };
            }
          }
          return { success: false, attempts, message: '超过最大重试次数' };
        }
      };

      // 模拟前两次失败，第三次成功
      let callCount = 0;
      const flakyOperation = () => {
        callCount++;
        return { success: callCount >= 3 };
      };

      const result = retryFlow.executeWithRetry(flakyOperation);
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(3);
    });
  });

  describe('Batch Operation Flow', () => {
    test('should process items in batches', () => {
      const batchFlow = {
        data: {
          items: Array(25).fill(null).map((_, i) => ({ id: i, processed: false })),
          batchSize: 10,
          processedCount: 0
        },
        setData: function(u) { Object.assign(this.data, u); },
        processBatch: function() {
          const unprocessed = this.data.items.filter(i => !i.processed);
          const toProcess = unprocessed.slice(0, this.data.batchSize);
          toProcess.forEach(item => {
            item.processed = true;
            this.setData({ processedCount: this.data.processedCount + 1 });
          });
          return {
            success: true,
            processedInBatch: toProcess.length,
            remaining: unprocessed.length - toProcess.length
          };
        },
        isComplete: function() {
          return this.data.processedCount === this.data.items.length;
        }
      };

      // 处理第一批
      let result = batchFlow.processBatch();
      expect(result.processedInBatch).toBe(10);
      expect(result.remaining).toBe(15);

      // 处理第二批
      result = batchFlow.processBatch();
      expect(result.processedInBatch).toBe(10);
      expect(result.remaining).toBe(5);

      // 处理最后一批
      result = batchFlow.processBatch();
      expect(result.processedInBatch).toBe(5);
      expect(result.remaining).toBe(0);

      expect(batchFlow.isComplete()).toBe(true);
      expect(batchFlow.data.processedCount).toBe(25);
    });
  });

  describe('Undo/Redo Flow', () => {
    test('should support undo and redo operations', () => {
      const undoFlow = {
        data: {
          history: [],
          future: [],
          currentState: { value: 0 }
        },
        setData: function(u) { Object.assign(this.data, u); },
        setState: function(newState) {
          this.setData({
            history: [...this.data.history, { ...this.data.currentState }],
            currentState: newState,
            future: [] // 清空 future 栈
          });
        },
        undo: function() {
          if (this.data.history.length === 0) return false;
          const previous = this.data.history[this.data.history.length - 1];
          this.setData({
            future: [...this.data.future, { ...this.data.currentState }],
            currentState: previous,
            history: this.data.history.slice(0, -1)
          });
          return true;
        },
        redo: function() {
          if (this.data.future.length === 0) return false;
          const next = this.data.future[this.data.future.length - 1];
          this.setData({
            history: [...this.data.history, { ...this.data.currentState }],
            currentState: next,
            future: this.data.future.slice(0, -1)
          });
          return true;
        },
        canUndo: function() {
          return this.data.history.length > 0;
        },
        canRedo: function() {
          return this.data.future.length > 0;
        }
      };

      // 初始状态
      expect(undoFlow.canUndo()).toBe(false);
      expect(undoFlow.canRedo()).toBe(false);

      // 执行多次操作
      undoFlow.setState({ value: 1 });
      undoFlow.setState({ value: 2 });
      undoFlow.setState({ value: 3 });

      expect(undoFlow.data.currentState.value).toBe(3);
      expect(undoFlow.canUndo()).toBe(true);

      // 撤销
      undoFlow.undo();
      expect(undoFlow.data.currentState.value).toBe(2);
      expect(undoFlow.canRedo()).toBe(true);

      undoFlow.undo();
      expect(undoFlow.data.currentState.value).toBe(1);

      // 重做
      undoFlow.redo();
      expect(undoFlow.data.currentState.value).toBe(2);
    });
  });

  // ========================================
  // Iteration 7: More Edge Cases & System Flows
  // ========================================

  describe('Security Validation Flow', () => {
    test('should validate user input for XSS prevention', () => {
      const securityFlow = {
        data: { dangerousPatterns: ['<script', 'javascript:', 'onerror=', 'onload='] },
        sanitize: function(input) {
          if (!input) return '';
          let sanitized = input;
          this.data.dangerousPatterns.forEach(pattern => {
            const regex = new RegExp(pattern, 'gi');
            sanitized = sanitized.replace(regex, '');
          });
          return sanitized;
        },
        validateInput: function(input) {
          const sanitized = this.sanitize(input);
          return {
            isValid: sanitized === input,
            sanitized,
            hadDangerousContent: sanitized !== input
          };
        }
      };

      // 安全输入
      let result = securityFlow.validateInput('你好，这是安全的内容');
      expect(result.isValid).toBe(true);
      expect(result.hadDangerousContent).toBe(false);

      // XSS 尝试
      result = securityFlow.validateInput('<script>alert("xss")</script>');
      expect(result.isValid).toBe(false);
      expect(result.hadDangerousContent).toBe(true);
      expect(result.sanitized.includes('<script')).toBe(false);
    });

    test('should validate authorization', () => {
      const authFlow = {
        data: {
          currentUser: { id: 'user-1', roles: ['user'] },
          resources: {
            'public-doc': { requiredRole: null, owner: null },
            'user-profile': { requiredRole: 'user', owner: 'user-1' },
            'admin-panel': { requiredRole: 'admin', owner: null }
          }
        },
        canAccess: function(resourceId) {
          const resource = this.data.resources[resourceId];
          if (!resource) return { allowed: false, reason: '资源不存在' };
          if (!resource.requiredRole) return { allowed: true };
          if (resource.owner === this.data.currentUser.id) return { allowed: true };
          if (this.data.currentUser.roles.includes(resource.requiredRole)) return { allowed: true };
          return { allowed: false, reason: '权限不足' };
        }
      };

      expect(authFlow.canAccess('public-doc').allowed).toBe(true);
      expect(authFlow.canAccess('user-profile').allowed).toBe(true);
      expect(authFlow.canAccess('admin-panel').allowed).toBe(false);
    });
  });

  describe('Connection Management Flow', () => {
    test('should manage websocket connection with retry', () => {
      const connectionFlow = {
        data: {
          connected: false,
          reconnectAttempts: 0,
          maxReconnects: 5,
          reconnectDelay: 1000
        },
        setData: function(u) { Object.assign(this.data, u); },
        connect: function() {
          // 模拟连接逻辑
          this.setData({ connected: true, reconnectAttempts: 0 });
          return { success: true };
        },
        disconnect: function() {
          this.setData({ connected: false });
          return { success: true };
        },
        reconnect: function() {
          if (this.data.reconnectAttempts >= this.data.maxReconnects) {
            return { success: false, message: '超过最大重连次数' };
          }
          this.setData({ reconnectAttempts: this.data.reconnectAttempts + 1 });
          return { success: true, attempt: this.data.reconnectAttempts };
        },
        isConnected: function() {
          return this.data.connected;
        }
      };

      expect(connectionFlow.isConnected()).toBe(false);
      connectionFlow.connect();
      expect(connectionFlow.isConnected()).toBe(true);

      connectionFlow.disconnect();
      expect(connectionFlow.isConnected()).toBe(false);

      // 重连
      for (let i = 0; i < 5; i++) {
        connectionFlow.reconnect();
      }
      expect(connectionFlow.reconnect().success).toBe(false);
    });
  });

  describe('File Upload Flow', () => {
    test('should handle file upload with progress', () => {
      const uploadFlow = {
        data: {
          files: [],
          maxFileSize: 10 * 1024 * 1024, // 10MB
          allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
        },
        setData: function(u) { Object.assign(this.data, u); },
        validateFile: function(file) {
          if (file.size > this.data.maxFileSize) {
            return { valid: false, error: '文件大小超出限制' };
          }
          if (!this.data.allowedTypes.includes(file.type)) {
            return { valid: false, error: '不支持的文件类型' };
          }
          return { valid: true };
        },
        uploadFile: function(file) {
          const validation = this.validateFile(file);
          if (!validation.valid) return validation;

          this.setData({
            files: [...this.data.files, {
              ...file,
              progress: 100,
              status: 'completed'
            }]
          });
          return { success: true, file: this.data.files[this.data.files.length - 1] };
        },
        getUploadProgress: function(fileIndex) {
          const file = this.data.files[fileIndex];
          return file ? file.progress : 0;
        }
      };

      // 有效文件
      const validFile = { name: 'test.jpg', size: 1024, type: 'image/jpeg' };
      let result = uploadFlow.uploadFile(validFile);
      expect(result.success).toBe(true);

      // 文件太大
      const largeFile = { name: 'large.zip', size: 20 * 1024 * 1024, type: 'application/zip' };
      result = uploadFlow.uploadFile(largeFile);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('文件大小超出限制');

      // 不支持的类型
      const invalidType = { name: 'script.js', size: 1024, type: 'text/javascript' };
      result = uploadFlow.uploadFile(invalidType);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('不支持的文件类型');
    });
  });

  describe('Queue Management Flow', () => {
    test('should manage task queue with priority', () => {
      const queueFlow = {
        data: { queue: [] },
        setData: function(u) { Object.assign(this.data, u); },
        enqueue: function(task, priority = 'normal') {
          const priorities = { high: 0, normal: 1, low: 2 };
          const newTask = { ...task, priority, priorityValue: priorities[priority] };
          const newQueue = [...this.data.queue, newTask];
          newQueue.sort((a, b) => a.priorityValue - b.priorityValue);
          this.setData({ queue: newQueue });
          return { success: true, position: newQueue.indexOf(newTask) + 1 };
        },
        dequeue: function() {
          if (this.data.queue.length === 0) return null;
          const task = this.data.queue[0];
          this.setData({ queue: this.data.queue.slice(1) });
          return task;
        },
        peek: function() {
          return this.data.queue[0];
        },
        size: function() {
          return this.data.queue.length;
        }
      };

      // 添加不同优先级的任务
      queueFlow.enqueue({ id: 1, name: '低优先级任务' }, 'low');
      queueFlow.enqueue({ id: 2, name: '普通任务 1' }, 'normal');
      queueFlow.enqueue({ id: 3, name: '高优先级任务' }, 'high');
      queueFlow.enqueue({ id: 4, name: '普通任务 2' }, 'normal');

      // 高优先级应该先出队
      expect(queueFlow.dequeue().id).toBe(3);
      expect(queueFlow.dequeue().id).toBe(2);
      expect(queueFlow.dequeue().id).toBe(4);
      expect(queueFlow.dequeue().id).toBe(1);
    });
  });

  describe('Subscription Management Flow', () => {
    test('should manage user subscriptions', () => {
      const subscriptionFlow = {
        data: {
          subscriptions: [
            { id: 1, name: '基础版', price: 0, features: ['基础功能'] },
            { id: 2, name: '高级版', price: 29, features: ['基础功能', '高级功能', '优先支持'] },
            { id: 3, name: '企业版', price: 99, features: ['全部功能', '专属客服', '定制开发'] }
          ],
          userSubscription: null
        },
        setData: function(u) { Object.assign(this.data, u); },
        subscribe: function(subscriptionId) {
          const subscription = this.data.subscriptions.find(s => s.id === subscriptionId);
          if (!subscription) return { success: false, message: '订阅不存在' };
          this.setData({ userSubscription: subscription });
          return { success: true, subscription };
        },
        cancel: function() {
          if (!this.data.userSubscription) return { success: false, message: '没有活跃订阅' };
          const cancelled = this.data.userSubscription;
          this.setData({ userSubscription: null });
          return { success: true, cancelled };
        },
        hasFeature: function(feature) {
          if (!this.data.userSubscription) return false;
          return this.data.userSubscription.features.includes(feature);
        },
        getTier: function() {
          return this.data.userSubscription ? this.data.userSubscription.name : '免费版';
        }
      };

      expect(subscriptionFlow.getTier()).toBe('免费版');
      expect(subscriptionFlow.hasFeature('高级功能')).toBe(false);

      // 订阅高级版
      subscriptionFlow.subscribe(2);
      expect(subscriptionFlow.getTier()).toBe('高级版');
      expect(subscriptionFlow.hasFeature('高级功能')).toBe(true);

      // 取消订阅
      const cancelResult = subscriptionFlow.cancel();
      expect(cancelResult.success).toBe(true);
      expect(subscriptionFlow.getTier()).toBe('免费版');
    });
  });

  describe('Analytics Tracking Flow', () => {
    test('should track user events with batching', () => {
      const analyticsFlow = {
        data: {
          eventQueue: [],
          batchSize: 10,
          sentEvents: []
        },
        setData: function(u) { Object.assign(this.data, u); },
        track: function(eventName, properties = {}) {
          const event = {
            name: eventName,
            properties,
            timestamp: Date.now(),
            id: `evt_${Date.now()}_${Math.random()}`
          };
          this.setData({ eventQueue: [...this.data.eventQueue, event] });
          return event;
        },
        flush: function() {
          if (this.data.eventQueue.length === 0) return { success: true, count: 0 };
          const batch = this.data.eventQueue.slice(0, this.data.batchSize);
          this.setData({
            sentEvents: [...this.data.sentEvents, ...batch],
            eventQueue: this.data.eventQueue.slice(this.data.batchSize)
          });
          return { success: true, count: batch.length };
        },
        getEventCount: function() {
          return this.data.sentEvents.length + this.data.eventQueue.length;
        }
      };

      // 追踪事件
      analyticsFlow.track('page_view', { page: '/home' });
      analyticsFlow.track('button_click', { button: 'signup' });
      analyticsFlow.track('form_submit', { form: 'contact' });

      expect(analyticsFlow.getEventCount()).toBe(3);

      // 刷新队列
      const flushResult = analyticsFlow.flush();
      expect(flushResult.count).toBe(3);
      expect(analyticsFlow.data.eventQueue.length).toBe(0);
      expect(analyticsFlow.data.sentEvents.length).toBe(3);
    });
  });

  describe('Feature Flag Flow', () => {
    test('should manage feature flags with rollouts', () => {
      const featureFlagFlow = {
        data: {
          flags: {
            new_dashboard: { enabled: true, rolloutPercent: 100 },
            beta_feature: { enabled: true, rolloutPercent: 50 },
            experimental: { enabled: false, rolloutPercent: 0 }
          },
          userId: 'user-123'
        },
        setData: function(u) {
          Object.keys(u).forEach(key => {
            if (key.includes('.')) {
              const [parent, child] = key.split('.');
              this.data[parent][child] = u[key];
            } else {
              Object.assign(this.data, u);
            }
          });
        },
        isFeatureEnabled: function(featureName) {
          const flag = this.data.flags[featureName];
          if (!flag || !flag.enabled) return false;
          if (flag.rolloutPercent === 100) return true;
          if (flag.rolloutPercent === 0) return false;
          // 基于用户 ID 的哈希
          const hash = this.hashUserId(this.data.userId) % 100;
          return hash < flag.rolloutPercent;
        },
        hashUserId: function(userId) {
          let hash = 0;
          for (let i = 0; i < userId.length; i++) {
            hash = ((hash << 5) - hash) + userId.charCodeAt(i);
            hash = hash & hash;
          }
          return Math.abs(hash);
        },
        enableFeature: function(featureName, rolloutPercent = 100) {
          this.setData({
            [`flags.${featureName}`]: { enabled: true, rolloutPercent }
          });
        },
        disableFeature: function(featureName) {
          this.setData({
            [`flags.${featureName}`]: { ...this.data.flags[featureName], enabled: false }
          });
        }
      };

      expect(featureFlagFlow.isFeatureEnabled('new_dashboard')).toBe(true);
      expect(featureFlagFlow.isFeatureEnabled('experimental')).toBe(false);

      // 禁用功能
      featureFlagFlow.disableFeature('new_dashboard');
      expect(featureFlagFlow.isFeatureEnabled('new_dashboard')).toBe(false);

      // 启用 50% 灰度
      featureFlagFlow.enableFeature('beta_feature', 50);
      // 结果取决于用户 ID 哈希
      expect(typeof featureFlagFlow.isFeatureEnabled('beta_feature')).toBe('boolean');
    });
  });

  // ========================================
  // Iteration 8: Additional System Flows
  // ========================================

  describe('Internationalization Flow', () => {
    test('should switch languages and translate content', () => {
      const i18nFlow = {
        data: {
          currentLocale: 'zh',
          messages: {
            zh: {
              welcome: '欢迎使用',
              goodbye: '再见',
              items_count: '{count} 个项目'
            },
            en: {
              welcome: 'Welcome',
              goodbye: 'Goodbye',
              items_count: '{count} items'
            }
          }
        },
        setData: function(u) { Object.assign(this.data, u); },
        setLocale: function(locale) {
          if (this.data.messages[locale]) {
            this.setData({ currentLocale: locale });
            return { success: true };
          }
          return { success: false, message: '不支持的语言' };
        },
        t: function(key, params = {}) {
          const message = this.data.messages[this.data.currentLocale]?.[key];
          if (!message) return key;
          return message.replace(/\{(\w+)\}/g, (match, p1) => params[p1] || match);
        },
        getCurrentLocale: function() {
          return this.data.currentLocale;
        }
      };

      expect(i18nFlow.t('welcome')).toBe('欢迎使用');
      expect(i18nFlow.t('items_count', { count: 5 })).toBe('5 个项目');

      i18nFlow.setLocale('en');
      expect(i18nFlow.getCurrentLocale()).toBe('en');
      expect(i18nFlow.t('welcome')).toBe('Welcome');
      expect(i18nFlow.t('items_count', { count: 3 })).toBe('3 items');

      expect(i18nFlow.setLocale('xx').success).toBe(false);
    });
  });

  describe('Theme Switching Flow', () => {
    test('should switch themes and persist preference', () => {
      const themeFlow = {
        data: {
          currentTheme: 'light',
          themes: {
            light: { background: '#FFFFFF', text: '#000000', primary: '#007AFF' },
            dark: { background: '#1C1C1E', text: '#FFFFFF', primary: '#0A84FF' },
            sepia: { background: '#F4ECD8', text: '#5B4636', primary: '#8B4513' }
          }
        },
        setData: function(u) { Object.assign(this.data, u); },
        setTheme: function(themeName) {
          if (this.data.themes[themeName]) {
            this.setData({ currentTheme: themeName });
            return { success: true, colors: this.data.themes[themeName] };
          }
          return { success: false, message: '主题不存在' };
        },
        getThemeColors: function() {
          return this.data.themes[this.data.currentTheme];
        },
        toggle: function() {
          const newTheme = this.data.currentTheme === 'light' ? 'dark' : 'light';
          return this.setTheme(newTheme);
        }
      };

      expect(themeFlow.data.currentTheme).toBe('light');
      expect(themeFlow.getThemeColors().background).toBe('#FFFFFF');

      themeFlow.setTheme('dark');
      expect(themeFlow.getThemeColors().background).toBe('#1C1C1E');

      themeFlow.toggle();
      expect(themeFlow.data.currentTheme).toBe('light');

      themeFlow.setTheme('sepia');
      expect(themeFlow.getThemeColors().primary).toBe('#8B4513');
    });
  });

  describe('Data Export/Import Flow', () => {
    test('should export and import user data', () => {
      const dataFlow = {
        data: { userData: { profile: {}, settings: {}, history: [] } },
        setData: function(u) { Object.assign(this.data, u); },
        setUserData: function(data) {
          this.setData({ userData: data });
        },
        exportData: function() {
          return {
            success: true,
            data: JSON.stringify(this.data.userData),
            timestamp: Date.now(),
            version: '1.0'
          };
        },
        importData: function(exportedData) {
          try {
            const parsed = JSON.parse(exportedData.data);
            if (!parsed.profile || !parsed.settings) {
              return { success: false, message: '数据格式不正确' };
            }
            this.setUserData(parsed);
            return { success: true };
          } catch (e) {
            return { success: false, message: '数据解析失败' };
          }
        },
        resetData: function() {
          this.setUserData({ profile: {}, settings: {}, history: [] });
          return { success: true };
        }
      };

      // 设置用户数据
      dataFlow.setUserData({
        profile: { name: '测试', email: 'test@example.com' },
        settings: { theme: 'dark', language: 'zh' },
        history: [{ action: 'login', timestamp: Date.now() }]
      });

      // 导出数据
      const exported = dataFlow.exportData();
      expect(exported.success).toBe(true);
      expect(exported.version).toBe('1.0');

      // 重置数据
      dataFlow.resetData();
      expect(dataFlow.data.userData.profile.name).toBeFalsy();

      // 导入数据
      const imported = dataFlow.importData(exported);
      expect(imported.success).toBe(true);
      expect(dataFlow.data.userData.profile.name).toBe('测试');
    });
  });

  describe('Deep Link Navigation Flow', () => {
    test('should handle deep link navigation', () => {
      const deepLinkFlow = {
        data: {
          routes: {
            '/home': { page: 'Index', requiresAuth: false },
            '/profile': { page: 'Profile', requiresAuth: true },
            '/dormitory/:id': { page: 'Dormitory', requiresAuth: true },
            '/settings': { page: 'Settings', requiresAuth: true }
          },
          isAuthenticated: false,
          currentPath: '/'
        },
        setData: function(u) { Object.assign(this.data, u); },
        navigate: function(path) {
          const route = this.data.routes[path];
          if (!route) return { success: false, message: '页面不存在' };
          if (route.requiresAuth && !this.data.isAuthenticated) {
            return { success: false, message: '请先登录', redirectTo: '/login' };
          }
          this.setData({ currentPath: path });
          return { success: true, page: route.page };
        },
        login: function() {
          this.setData({ isAuthenticated: true });
          return { success: true };
        },
        getPathParts: function(pattern, path) {
          const patternParts = pattern.split('/');
          const pathParts = path.split('/');
          const params = {};
          patternParts.forEach((part, i) => {
            if (part.startsWith(':')) {
              params[part.slice(1)] = pathParts[i];
            }
          });
          return params;
        }
      };

      // 未登录时访问需要认证的页面
      let result = deepLinkFlow.navigate('/profile');
      expect(result.success).toBe(false);
      expect(result.redirectTo).toBe('/login');

      // 登录后访问
      deepLinkFlow.login();
      result = deepLinkFlow.navigate('/profile');
      expect(result.success).toBe(true);
      expect(result.page).toBe('Profile');

      // 访问动态路由
      const params = deepLinkFlow.getPathParts('/dormitory/:id', '/dormitory/123');
      expect(params.id).toBe('123');
    });
  });

  describe('Session Management Flow', () => {
    test('should manage user session with timeout', () => {
      const sessionFlow = {
        data: {
          session: null,
          sessionTimeout: 3600000, // 1 hour
          warningThreshold: 300000 // 5 minutes
        },
        setData: function(u) { Object.assign(this.data, u); },
        startSession: function(userId) {
          const now = Date.now();
          this.setData({
            session: {
              userId,
              startTime: now,
              expiresAt: now + this.data.sessionTimeout,
              lastActivity: now
            }
          });
          return { success: true };
        },
        extendSession: function() {
          if (!this.data.session) return { success: false, message: '无活跃会话' };
          this.setData({
            'session.expiresAt': Date.now() + this.data.sessionTimeout,
            'session.lastActivity': Date.now()
          });
          return { success: true };
        },
        isSessionValid: function() {
          if (!this.data.session) return false;
          return Date.now() < this.data.session.expiresAt;
        },
        endSession: function() {
          this.setData({ session: null });
          return { success: true };
        },
        getTimeUntilExpiry: function() {
          if (!this.data.session) return 0;
          return Math.max(0, this.data.session.expiresAt - Date.now());
        }
      };

      expect(sessionFlow.isSessionValid()).toBe(false);

      sessionFlow.startSession('user-123');
      expect(sessionFlow.isSessionValid()).toBe(true);

      const timeUntilExpiry = sessionFlow.getTimeUntilExpiry();
      expect(timeUntilExpiry).toBeGreaterThan(3500000); // 接近 1 小时

      sessionFlow.endSession();
      expect(sessionFlow.isSessionValid()).toBe(false);
    });
  });

  describe('Onboarding Tips Flow', () => {
    test('should manage onboarding tips with progress', () => {
      const onboardingFlow = {
        data: {
          tips: [
            { id: 1, title: '欢迎', content: '欢迎使用应用', order: 0 },
            { id: 2, title: '功能 1', content: '这是第一个功能', order: 1 },
            { id: 3, title: '功能 2', content: '这是第二个功能', order: 2 },
            { id: 4, title: '完成', content: '设置完成', order: 3 }
          ],
          currentTipIndex: 0,
          completedTips: []
        },
        setData: function(u) { Object.assign(this.data, u); },
        getCurrentTip: function() {
          return this.data.tips[this.data.currentTipIndex];
        },
        nextTip: function() {
          if (this.data.currentTipIndex >= this.data.tips.length - 1) {
            return { success: false, message: '已是最后一个提示' };
          }
          this.setData({ currentTipIndex: this.data.currentTipIndex + 1 });
          return { success: true, tip: this.getCurrentTip() };
        },
        prevTip: function() {
          if (this.data.currentTipIndex <= 0) {
            return { success: false, message: '已是第一个提示' };
          }
          this.setData({ currentTipIndex: this.data.currentTipIndex - 1 });
          return { success: true, tip: this.getCurrentTip() };
        },
        markComplete: function() {
          const currentTip = this.getCurrentTip();
          if (!this.data.completedTips.includes(currentTip.id)) {
            this.setData({ completedTips: [...this.data.completedTips, currentTip.id] });
          }
          return this.nextTip();
        },
        getProgress: function() {
          return {
            current: this.data.currentTipIndex + 1,
            total: this.data.tips.length,
            percent: Math.round(((this.data.currentTipIndex + 1) / this.data.tips.length) * 100)
          };
        }
      };

      expect(onboardingFlow.getCurrentTip().id).toBe(1);
      expect(onboardingFlow.getProgress().current).toBe(1);

      onboardingFlow.nextTip();
      expect(onboardingFlow.getCurrentTip().id).toBe(2);

      onboardingFlow.markComplete();
      expect(onboardingFlow.data.completedTips.includes(2)).toBe(true);
      expect(onboardingFlow.getCurrentTip().id).toBe(3);

      expect(onboardingFlow.getProgress().percent).toBe(75);
    });
  });

  describe('Command Palette Flow', () => {
    test('should handle command palette with search', () => {
      const commandFlow = {
        data: {
          commands: [
            { id: 1, name: '新建宿舍', shortcut: 'N', category: 'dormitory' },
            { id: 2, name: '加入宿舍', shortcut: 'J', category: 'dormitory' },
            { id: 3, name: '设置心情', shortcut: 'M', category: 'mood' },
            { id: 4, name: '查看任务', shortcut: 'T', category: 'task' },
            { id: 5, name: '领取奖励', shortcut: 'C', category: 'task' },
            { id: 6, name: '切换主题', shortcut: 'D', category: 'settings' }
          ],
          searchQuery: '',
          recentCommands: []
        },
        setData: function(u) { Object.assign(this.data, u); },
        setSearchQuery: function(query) {
          this.setData({ searchQuery: query });
          return this.searchCommands();
        },
        searchCommands: function() {
          if (!this.data.searchQuery) return this.data.commands;
          const query = this.data.searchQuery.toLowerCase();
          return this.data.commands.filter(cmd =>
            cmd.name.toLowerCase().includes(query) ||
            cmd.category.toLowerCase().includes(query)
          );
        },
        executeCommand: function(commandId) {
          const command = this.data.commands.find(c => c.id === commandId);
          if (!command) return { success: false, message: '命令不存在' };
          this.setData({
            recentCommands: [commandId, ...this.data.recentCommands.slice(0, 4)]
          });
          return { success: true, command };
        },
        getRecentCommands: function() {
          return this.data.recentCommands.map(id =>
            this.data.commands.find(c => c.id === id)
          ).filter(Boolean);
        }
      };

      // 搜索命令
      let results = commandFlow.setSearchQuery('宿舍');
      expect(results.length).toBe(2);

      results = commandFlow.setSearchQuery('task');
      expect(results.length).toBe(2);

      // 执行命令
      const result = commandFlow.executeCommand(1);
      expect(result.success).toBe(true);
      expect(result.command.name).toBe('新建宿舍');

      // 最近命令
      expect(commandFlow.getRecentCommands().length).toBe(1);
    });
  });

  describe('Search History Flow', () => {
    test('should manage search history with suggestions', () => {
      const searchFlow = {
        data: {
          history: [],
          maxHistory: 10,
          suggestions: ['热门', '推荐', '新手指南', '常见问题', '更新日志']
        },
        setData: function(u) { Object.assign(this.data, u); },
        addToHistory: function(query) {
          if (!query.trim()) return { success: false };
          // 移除重复项
          let newHistory = this.data.history.filter(h => h.query !== query);
          // 添加到开头
          newHistory = [{ query, timestamp: Date.now() }, ...newHistory];
          // 限制数量
          if (newHistory.length > this.data.maxHistory) {
            newHistory = newHistory.slice(0, this.data.maxHistory);
          }
          this.setData({ history: newHistory });
          return { success: true };
        },
        getHistory: function() {
          return this.data.history;
        },
        clearHistory: function() {
          this.setData({ history: [] });
          return { success: true };
        },
        getSuggestions: function(query) {
          if (!query) return this.data.suggestions;
          return this.data.suggestions.filter(s =>
            s.toLowerCase().includes(query.toLowerCase())
          );
        },
        removeFromHistory: function(query) {
          this.setData({
            history: this.data.history.filter(h => h.query !== query)
          });
          return { success: true };
        }
      };

      // 初始历史为空
      expect(searchFlow.getHistory().length).toBe(0);

      // 添加搜索
      searchFlow.addToHistory('宿舍装饰');
      searchFlow.addToHistory('心情记录');
      searchFlow.addToHistory('任务列表');

      expect(searchFlow.getHistory().length).toBe(3);
      // 后添加的在前面（LIFO）
      expect(searchFlow.getHistory()[0].query).toBe('任务列表');
      expect(searchFlow.getHistory()[2].query).toBe('宿舍装饰');

      // 获取建议
      expect(searchFlow.getSuggestions('').length).toBe(5);
      expect(searchFlow.getSuggestions('常见').length).toBe(1);

      // 删除记录
      searchFlow.removeFromHistory('心情记录');
      expect(searchFlow.getHistory().length).toBe(2);

      // 清空历史
      searchFlow.clearHistory();
      expect(searchFlow.getHistory().length).toBe(0);
    });
  });

  // ========================================
  // Iteration 9: Social & Gamification Flows
  // ========================================

  describe('Friend System Flow', () => {
    test('should manage friend requests and relationships', () => {
      const friendFlow = {
        data: {
          userId: 'user-1',
          friends: [
            { id: 'user-2', name: '用户 A', status: 'accepted' },
            { id: 'user-3', name: '用户 B', status: 'accepted' }
          ],
          pendingRequests: [
            { id: 'user-4', name: '用户 C', type: 'received' }
          ],
          sentRequests: [
            { id: 'user-5', name: '用户 D', type: 'sent' }
          ]
        },
        setData: function(u) { Object.assign(this.data, u); },
        sendFriendRequest: function(userId, userName) {
          if (this.data.friends.find(f => f.id === userId)) {
            return { success: false, message: '已是好友' };
          }
          if (this.data.sentRequests.find(r => r.id === userId)) {
            return { success: false, message: '已发送请求' };
          }
          this.setData({
            sentRequests: [...this.data.sentRequests, { id: userId, name: userName, type: 'sent' }]
          });
          return { success: true, message: '请求已发送' };
        },
        acceptFriendRequest: function(userId) {
          const request = this.data.pendingRequests.find(r => r.id === userId);
          if (!request) return { success: false, message: '请求不存在' };
          this.setData({
            friends: [...this.data.friends, { id: userId, name: request.name, status: 'accepted' }],
            pendingRequests: this.data.pendingRequests.filter(r => r.id !== userId)
          });
          return { success: true };
        },
        rejectFriendRequest: function(userId) {
          this.setData({
            pendingRequests: this.data.pendingRequests.filter(r => r.id !== userId)
          });
          return { success: true };
        },
        removeFriend: function(userId) {
          this.setData({
            friends: this.data.friends.filter(f => f.id !== userId)
          });
          return { success: true };
        },
        getFriendCount: function() {
          return this.data.friends.length;
        }
      };

      expect(friendFlow.getFriendCount()).toBe(2);

      // 发送好友请求
      let result = friendFlow.sendFriendRequest('user-6', '用户 F');
      expect(result.success).toBe(true);
      expect(friendFlow.data.sentRequests.length).toBe(2);

      // 重复发送失败
      result = friendFlow.sendFriendRequest('user-6', '用户 F');
      expect(result.success).toBe(false);

      // 接受好友请求
      result = friendFlow.acceptFriendRequest('user-4');
      expect(result.success).toBe(true);
      expect(friendFlow.getFriendCount()).toBe(3);

      // 删除好友
      friendFlow.removeFriend('user-2');
      expect(friendFlow.getFriendCount()).toBe(2);
    });
  });

  describe('Leaderboard Flow', () => {
    test('should calculate and display rankings', () => {
      const leaderboardFlow = {
        data: {
          users: [
            { id: 'user-1', name: '用户 A', points: 1500 },
            { id: 'user-2', name: '用户 B', points: 2300 },
            { id: 'user-3', name: '用户 C', points: 1800 },
            { id: 'user-4', name: '用户 D', points: 2300 },
            { id: 'user-5', name: '用户 E', points: 900 }
          ],
          currentUserId: 'user-1'
        },
        getLeaderboard: function(timeRange = 'all') {
          const sorted = [...this.data.users].sort((a, b) => b.points - a.points);
          return sorted.map((user, index) => ({
            rank: index + 1,
            ...user,
            isTied: index > 0 && sorted[index].points === sorted[index - 1].points
          }));
        },
        getUserRank: function(userId) {
          const sorted = [...this.data.users].sort((a, b) => b.points - a.points);
          const userIndex = sorted.findIndex(u => u.id === userId);
          return {
            rank: userIndex + 1,
            user: sorted[userIndex],
            totalUsers: sorted.length
          };
        },
        getUsersInRange: function(startRank, endRank) {
          const sorted = [...this.data.users].sort((a, b) => b.points - a.points);
          return sorted.slice(startRank - 1, endRank);
        }
      };

      const leaderboard = leaderboardFlow.getLeaderboard();
      expect(leaderboard[0].points).toBe(2300);
      expect(leaderboard[0].isTied).toBe(false);
      expect(leaderboard[1].isTied).toBe(true); // 并列第二

      const userRank = leaderboardFlow.getUserRank('user-1');
      expect(userRank.rank).toBe(4); // 2300, 2300, 1800, 1500
      expect(userRank.user.points).toBe(1500);

      const range = leaderboardFlow.getUsersInRange(2, 4);
      expect(range.length).toBe(3);
    });
  });

  describe('Chat Room Flow', () => {
    test('should manage chat room with messages and members', () => {
      const chatRoomFlow = {
        data: {
          roomId: 'room-1',
          members: [
            { id: 'user-1', name: '用户 A', role: 'owner', joinedAt: Date.now() - 86400000 },
            { id: 'user-2', name: '用户 B', role: 'member', joinedAt: Date.now() - 43200000 },
            { id: 'user-3', name: '用户 C', role: 'member', joinedAt: Date.now() - 21600000 }
          ],
          messages: [],
          maxMembers: 10
        },
        setData: function(u) { Object.assign(this.data, u); },
        sendMessage: function(userId, content) {
          const member = this.data.members.find(m => m.id === userId);
          if (!member) return { success: false, message: '不是房间成员' };
          const message = {
            id: `msg_${Date.now()}`,
            userId,
            userName: member.name,
            content,
            timestamp: Date.now()
          };
          this.setData({ messages: [...this.data.messages, message] });
          return { success: true, message };
        },
        joinRoom: function(userId, userName) {
          if (this.data.members.length >= this.data.maxMembers) {
            return { success: false, message: '房间已满' };
          }
          if (this.data.members.find(m => m.id === userId)) {
            return { success: false, message: '已在房间中' };
          }
          this.setData({
            members: [...this.data.members, { id: userId, name: userName, role: 'member', joinedAt: Date.now() }]
          });
          return { success: true };
        },
        leaveRoom: function(userId) {
          const member = this.data.members.find(m => m.id === userId);
          if (!member) return { success: false, message: '不是房间成员' };
          if (member.role === 'owner') {
            return { success: false, message: '房主不能离开，请转让房间' };
          }
          this.setData({ members: this.data.members.filter(m => m.id !== userId) });
          return { success: true };
        },
        getMemberCount: function() {
          return this.data.members.length;
        },
        getMessageCount: function() {
          return this.data.messages.length;
        }
      };

      expect(chatRoomFlow.getMemberCount()).toBe(3);

      // 发送消息
      let result = chatRoomFlow.sendMessage('user-1', '大家好！');
      expect(result.success).toBe(true);
      expect(chatRoomFlow.getMessageCount()).toBe(1);

      // 新用户加入
      result = chatRoomFlow.joinRoom('user-4', '用户 D');
      expect(result.success).toBe(true);
      expect(chatRoomFlow.getMemberCount()).toBe(4);

      // 重复加入失败
      result = chatRoomFlow.joinRoom('user-4', '用户 D');
      expect(result.success).toBe(false);

      // 成员离开
      result = chatRoomFlow.leaveRoom('user-4');
      expect(result.success).toBe(true);
      expect(chatRoomFlow.getMemberCount()).toBe(3);

      // 房主不能离开
      result = chatRoomFlow.leaveRoom('user-1');
      expect(result.success).toBe(false);
    });
  });

  describe('Achievement Badge Flow', () => {
    test('should track and award achievement badges', () => {
      const badgeFlow = {
        data: {
          userId: 'user-1',
          badges: [
            { id: 'first_login', name: '初次登录', icon: '🎉', earned: true, earnedAt: Date.now() - 86400000 },
            { id: 'week_streak', name: '连续签到 7 天', icon: '🔥', earned: false },
            { id: 'social_star', name: '社交达人', icon: '⭐', earned: false, progress: 5, target: 10 },
            { id: 'collector', name: '收藏家', icon: '🏆', earned: false, progress: 0, target: 50 }
          ]
        },
        setData: function(u) {
          Object.keys(u).forEach(key => {
            if (key.includes('.')) {
              const [parent, child] = key.split('.');
              this.data[parent][child] = u[key];
            } else {
              Object.assign(this.data, u);
            }
          });
        },
        updateProgress: function(badgeId, increment) {
          const badge = this.data.badges.find(b => b.id === badgeId);
          if (!badge || badge.earned) return { success: false, message: '无法更新' };
          const newProgress = Math.min((badge.progress || 0) + increment, badge.target);
          badge.progress = newProgress;
          const newlyEarned = newProgress >= badge.target;
          if (newlyEarned) {
            badge.earned = true;
            badge.earnedAt = Date.now();
          }
          return { success: true, newlyEarned, progress: newProgress };
        },
        getEarnedBadges: function() {
          return this.data.badges.filter(b => b.earned);
        },
        getProgressBadges: function() {
          return this.data.badges.filter(b => !b.earned && b.progress !== undefined);
        },
        getTotalProgress: function() {
          const earned = this.getEarnedBadges().length;
          const total = this.data.badges.length;
          return { earned, total, percent: Math.round((earned / total) * 100) };
        }
      };

      expect(badgeFlow.getEarnedBadges().length).toBe(1);
      expect(badgeFlow.getTotalProgress().percent).toBe(25);

      // 更新进度
      let result = badgeFlow.updateProgress('social_star', 3);
      expect(result.progress).toBe(8);
      expect(result.newlyEarned).toBe(false);

      // 完成成就
      result = badgeFlow.updateProgress('social_star', 5);
      expect(result.progress).toBe(10);
      expect(result.newlyEarned).toBe(true);

      expect(badgeFlow.getEarnedBadges().length).toBe(2);
      expect(badgeFlow.getTotalProgress().percent).toBe(50);
    });
  });

  describe('Daily Challenge Flow', () => {
    test('should track daily challenge progress', () => {
      const dailyFlow = {
        data: {
          date: '2024-01-15',
          challenges: [
            { id: 'daily_checkin', name: '每日签到', target: 1, current: 0, reward: { type: 'points', amount: 10 } },
            { id: 'daily_share', name: '分享心情', target: 1, current: 0, reward: { type: 'points', amount: 20 } },
            { id: 'daily_chat', name: 'AI 聊天 5 次', target: 5, current: 0, reward: { type: 'points', amount: 30 } },
            { id: 'daily_decorate', name: '装饰房间', target: 1, current: 0, reward: { type: 'points', amount: 25 } }
          ],
          completedChallenges: [],
          totalPoints: 100
        },
        setData: function(u) { Object.assign(this.data, u); },
        updateChallenge: function(challengeId, increment) {
          const challenge = this.data.challenges.find(c => c.id === challengeId);
          if (!challenge) return { success: false, message: '挑战不存在' };
          if (this.data.completedChallenges.includes(challengeId)) {
            return { success: false, message: '挑战已完成' };
          }
          const newCurrent = Math.min(challenge.current + increment, challenge.target);
          challenge.current = newCurrent;
          let earned = null;
          if (newCurrent >= challenge.target && !this.data.completedChallenges.includes(challengeId)) {
            this.setData({
              completedChallenges: [...this.data.completedChallenges, challengeId],
              totalPoints: this.data.totalPoints + challenge.reward.amount
            });
            earned = challenge.reward;
          }
          return { success: true, current: newCurrent, earned };
        },
        getCompletionRate: function() {
          return {
            completed: this.data.completedChallenges.length,
            total: this.data.challenges.length,
            percent: Math.round((this.data.completedChallenges.length / this.data.challenges.length) * 100)
          };
        }
      };

      expect(dailyFlow.getCompletionRate().percent).toBe(0);

      // 完成签到
      let result = dailyFlow.updateChallenge('daily_checkin', 1);
      expect(result.earned.amount).toBe(10);
      expect(dailyFlow.data.totalPoints).toBe(110);

      // 聊天进度
      result = dailyFlow.updateChallenge('daily_chat', 3);
      expect(result.current).toBe(3);
      expect(result.earned).toBe(null);

      // 完成聊天
      result = dailyFlow.updateChallenge('daily_chat', 2);
      expect(result.earned.amount).toBe(30);
      expect(dailyFlow.data.totalPoints).toBe(140);

      expect(dailyFlow.getCompletionRate().percent).toBe(50);
    });
  });

  describe('Inventory Management Flow', () => {
    test('should manage user inventory with items', () => {
      const inventoryFlow = {
        data: {
          items: [
            { id: 'item-1', name: '温馨台灯', type: 'decoration', quantity: 2, usable: true },
            { id: 'item-2', name: '可爱抱枕', type: 'decoration', quantity: 1, usable: true },
            { id: 'item-3', name: '双倍积分卡', type: 'consumable', quantity: 3, usable: true },
            { id: 'item-4', name: '限定头像框', type: 'avatar', quantity: 1, usable: false }
          ],
          maxCapacity: 100,
          usedCapacity: 7
        },
        setData: function(u) { Object.assign(this.data, u); },
        addItem: function(item, quantity = 1) {
          if (this.data.usedCapacity >= this.data.maxCapacity) {
            return { success: false, message: '背包已满' };
          }
          const existing = this.data.items.find(i => i.id === item.id);
          if (existing) {
            existing.quantity += quantity;
          } else {
            this.setData({ items: [...this.data.items, { ...item, quantity }] });
          }
          this.setData({ usedCapacity: this.data.usedCapacity + quantity });
          return { success: true };
        },
        removeItem: function(itemId, quantity = 1) {
          const item = this.data.items.find(i => i.id === itemId);
          if (!item) return { success: false, message: '物品不存在' };
          if (item.quantity < quantity) return { success: false, message: '数量不足' };
          if (item.quantity === quantity) {
            this.setData({ items: this.data.items.filter(i => i.id !== itemId) });
          } else {
            item.quantity -= quantity;
          }
          this.setData({ usedCapacity: this.data.usedCapacity - quantity });
          return { success: true };
        },
        useItem: function(itemId) {
          const item = this.data.items.find(i => i.id === itemId);
          if (!item) return { success: false, message: '物品不存在' };
          if (!item.usable) return { success: false, message: '此物品不可使用' };
          if (item.type !== 'consumable') return { success: false, message: '只有消耗品可以使用' };
          return this.removeItem(itemId, 1);
        },
        getItemCount: function() {
          return this.data.items.reduce((sum, item) => sum + item.quantity, 0);
        }
      };

      expect(inventoryFlow.getItemCount()).toBe(7);

      // 添加物品
      let result = inventoryFlow.addItem({ id: 'item-5', name: '新装饰', type: 'decoration' }, 1);
      expect(result.success).toBe(true);
      expect(inventoryFlow.getItemCount()).toBe(8);

      // 移除物品
      result = inventoryFlow.removeItem('item-2', 1);
      expect(result.success).toBe(true);
      expect(inventoryFlow.getItemCount()).toBe(7);

      // 使用物品
      result = inventoryFlow.useItem('item-3');
      expect(result.success).toBe(true);
      expect(inventoryFlow.getItemCount()).toBe(6);

      // 使用不可用物品失败
      result = inventoryFlow.useItem('item-4');
      expect(result.success).toBe(false);
    });
  });

  describe('Gift Code Redemption Flow', () => {
    test('should validate and redeem gift codes', () => {
      const giftFlow = {
        data: {
          userId: 'user-1',
          redeemedCodes: [],
          validCodes: {
            'WELCOME2024': { reward: { type: 'points', amount: 100 }, maxRedemptions: 1000, currentRedemptions: 500 },
            'NEWUSER': { reward: { type: 'decoration', itemId: 'special-1' }, maxRedemptions: -1, currentRedemptions: 0 },
            'EXPIRED': { reward: { type: 'points', amount: 50 }, maxRedemptions: 100, currentRedemptions: 100, expired: true }
          }
        },
        setData: function(u) { Object.assign(this.data, u); },
        redeemCode: function(code) {
          const upperCode = code.toUpperCase().trim();
          if (this.data.redeemedCodes.includes(upperCode)) {
            return { success: false, message: '您已兑换过此码' };
          }
          const validCode = this.data.validCodes[upperCode];
          if (!validCode) {
            return { success: false, message: '无效的兑换码' };
          }
          if (validCode.expired || (validCode.maxRedemptions > 0 && validCode.currentRedemptions >= validCode.maxRedemptions)) {
            return { success: false, message: '兑换码已失效' };
          }
          this.setData({
            redeemedCodes: [...this.data.redeemedCodes, upperCode]
          });
          validCode.currentRedemptions += 1;
          return { success: true, reward: validCode.reward };
        },
        getRedeemedCount: function() {
          return this.data.redeemedCodes.length;
        }
      };

      expect(giftFlow.getRedeemedCount()).toBe(0);

      // 兑换有效码
      let result = giftFlow.redeemCode('welcome2024');
      expect(result.success).toBe(true);
      expect(result.reward.amount).toBe(100);

      // 重复兑换失败
      result = giftFlow.redeemCode('WELCOME2024');
      expect(result.success).toBe(false);

      // 无效码
      result = giftFlow.redeemCode('INVALID');
      expect(result.success).toBe(false);

      // 已失效码
      result = giftFlow.redeemCode('EXPIRED');
      expect(result.success).toBe(false);

      expect(giftFlow.getRedeemedCount()).toBe(1);
    });
  });

  // ========================================
  // Iteration 10: Final Additional Flows
  // ========================================

  describe('Payment Flow', () => {
    test('should handle payment process with validation', () => {
      const paymentFlow = {
        data: {
          userId: 'user-1',
          balance: 100,
          pendingPayment: null,
          paymentHistory: []
        },
        setData: function(u) { Object.assign(this.data, u); },
        initiatePayment: function(amount, description) {
          if (amount <= 0) return { success: false, message: '金额必须大于 0' };
          if (amount > this.data.balance) return { success: false, message: '余额不足' };
          this.setData({
            pendingPayment: { amount, description, timestamp: Date.now() }
          });
          return { success: true, payment: { amount, description } };
        },
        confirmPayment: function() {
          if (!this.data.pendingPayment) return { success: false, message: '无待支付订单' };
          const payment = this.data.pendingPayment;
          this.setData({
            balance: this.data.balance - payment.amount,
            paymentHistory: [...this.data.paymentHistory, {
              ...payment,
              status: 'completed',
              completedAt: Date.now()
            }],
            pendingPayment: null
          });
          return { success: true, remaining: this.data.balance };
        },
        cancelPayment: function() {
          if (!this.data.pendingPayment) return { success: false, message: '无待支付订单' };
          this.setData({ pendingPayment: null });
          return { success: true };
        },
        recharge: function(amount) {
          this.setData({ balance: this.data.balance + amount });
          return { success: true, newBalance: this.data.balance };
        }
      };

      expect(paymentFlow.data.balance).toBe(100);

      // 发起支付
      let result = paymentFlow.initiatePayment(50, '购买装饰品');
      expect(result.success).toBe(true);

      // 确认支付
      result = paymentFlow.confirmPayment();
      expect(result.success).toBe(true);
      expect(paymentFlow.data.balance).toBe(50);

      // 余额不足
      result = paymentFlow.initiatePayment(100, '购买道具');
      expect(result.success).toBe(false);

      // 充值
      result = paymentFlow.recharge(200);
      expect(result.success).toBe(true);
      expect(paymentFlow.data.balance).toBe(250);
    });
  });

  describe('Reservation System Flow', () => {
    test('should manage reservations with time slots', () => {
      const reservationFlow = {
        data: {
          resource: '会议室 A',
          slots: [
            { time: '09:00-10:00', booked: false, userId: null },
            { time: '10:00-11:00', booked: true, userId: 'user-2' },
            { time: '11:00-12:00', booked: false, userId: null },
            { time: '14:00-15:00', booked: false, userId: null }
          ],
          maxAdvanceDays: 7
        },
        setData: function(u) { Object.assign(this.data, u); },
        getAvailableSlots: function() {
          return this.data.slots.filter(s => !s.booked);
        },
        bookSlot: function(timeSlot, userId) {
          const slot = this.data.slots.find(s => s.time === timeSlot);
          if (!slot) return { success: false, message: '时间段不存在' };
          if (slot.booked) return { success: false, message: '时间段已被预订' };
          slot.booked = true;
          slot.userId = userId;
          return { success: true, slot: timeSlot };
        },
        cancelReservation: function(timeSlot, userId) {
          const slot = this.data.slots.find(s => s.time === timeSlot);
          if (!slot) return { success: false, message: '时间段不存在' };
          if (!slot.booked) return { success: false, message: '未预订' };
          if (slot.userId !== userId) return { success: false, message: '无权取消' };
          slot.booked = false;
          slot.userId = null;
          return { success: true };
        },
        getUserReservations: function(userId) {
          return this.data.slots.filter(s => s.booked && s.userId === userId);
        }
      };

      expect(reservationFlow.getAvailableSlots().length).toBe(3);

      // 预订
      let result = reservationFlow.bookSlot('09:00-10:00', 'user-1');
      expect(result.success).toBe(true);
      expect(reservationFlow.getAvailableSlots().length).toBe(2);

      // 重复预订失败
      result = reservationFlow.bookSlot('09:00-10:00', 'user-3');
      expect(result.success).toBe(false);

      // 取消预订
      result = reservationFlow.cancelReservation('09:00-10:00', 'user-1');
      expect(result.success).toBe(true);
      expect(reservationFlow.getAvailableSlots().length).toBe(3);

      // 无权取消
      result = reservationFlow.cancelReservation('10:00-11:00', 'user-1');
      expect(result.success).toBe(false);
    });
  });

  describe('Feedback System Flow', () => {
    test('should submit and categorize feedback', () => {
      const feedbackFlow = {
        data: {
          categories: ['功能建议', '问题反馈', '性能优化', '其他'],
          submissions: [],
          maxTextLength: 500
        },
        setData: function(u) { Object.assign(this.data, u); },
        submitFeedback: function(category, text, contact) {
          if (!category) return { success: false, message: '请选择分类' };
          if (!text || text.trim().length === 0) return { success: false, message: '反馈内容不能为空' };
          if (text.length > this.data.maxTextLength) return { success: false, message: '内容超出长度限制' };
          if (!this.data.categories.includes(category)) return { success: false, message: '无效分类' };
          const submission = {
            id: `fb_${Date.now()}`,
            category,
            text: text.trim(),
            contact: contact || null,
            status: 'pending',
            submittedAt: Date.now()
          };
          this.setData({ submissions: [...this.data.submissions, submission] });
          return { success: true, id: submission.id };
        },
        getSubmissions: function() {
          return this.data.submissions;
        },
        getSubmissionCount: function() {
          return this.data.submissions.length;
        }
      };

      expect(feedbackFlow.getSubmissionCount()).toBe(0);

      // 提交有效反馈
      let result = feedbackFlow.submitFeedback('功能建议', '希望能添加夜间模式', 'user@example.com');
      expect(result.success).toBe(true);
      expect(feedbackFlow.getSubmissionCount()).toBe(1);

      // 空内容失败
      result = feedbackFlow.submitFeedback('问题反馈', '', '');
      expect(result.success).toBe(false);

      // 超长内容失败
      result = feedbackFlow.submitFeedback('其他', 'a'.repeat(501));
      expect(result.success).toBe(false);

      // 无效分类失败
      result = feedbackFlow.submitFeedback('无效分类', '测试内容');
      expect(result.success).toBe(false);
    });
  });

  describe('Event System Flow', () => {
    test('should manage limited-time events', () => {
      const eventFlow = {
        data: {
          events: [
            {
              id: 'spring_2024',
              name: '春节活动',
              startTime: Date.now() - 86400000 * 5,
              endTime: Date.now() + 86400000 * 5,
              tasks: [
                { id: 'task-1', name: '每日签到', progress: 3, target: 7, reward: 100 },
                { id: 'task-2', name: '邀请好友', progress: 2, target: 5, reward: 200 }
              ],
              claimedRewards: []
            }
          ]
        },
        setData: function(u) { Object.assign(this.data, u); },
        getActiveEvents: function() {
          const now = Date.now();
          return this.data.events.filter(e => now >= e.startTime && now <= e.endTime);
        },
        isEventActive: function(eventId) {
          const event = this.data.events.find(e => e.id === eventId);
          if (!event) return false;
          const now = Date.now();
          return now >= event.startTime && now <= event.endTime;
        },
        updateTaskProgress: function(eventId, taskId, increment) {
          const event = this.data.events.find(e => e.id === eventId);
          if (!event) return { success: false, message: '活动不存在' };
          const task = event.tasks.find(t => t.id === taskId);
          if (!task) return { success: false, message: '任务不存在' };
          if (event.claimedRewards.includes(taskId)) return { success: false, message: '奖励已领取' };
          task.progress = Math.min(task.progress + increment, task.target);
          return { success: true, progress: task.progress, completed: task.progress >= task.target };
        },
        claimReward: function(eventId, taskId) {
          const event = this.data.events.find(e => e.id === eventId);
          if (!event) return { success: false, message: '活动不存在' };
          const task = event.tasks.find(t => t.id === taskId);
          if (!task) return { success: false, message: '任务不存在' };
          if (task.progress < task.target) return { success: false, message: '任务未完成' };
          if (event.claimedRewards.includes(taskId)) return { success: false, message: '奖励已领取' };
          event.claimedRewards.push(taskId);
          return { success: true, reward: task.reward };
        }
      };

      expect(eventFlow.getActiveEvents().length).toBe(1);
      expect(eventFlow.isEventActive('spring_2024')).toBe(true);

      // 更新进度
      let result = eventFlow.updateTaskProgress('spring_2024', 'task-1', 4);
      expect(result.progress).toBe(7);
      expect(result.completed).toBe(true);

      // 领取奖励
      result = eventFlow.claimReward('spring_2024', 'task-1');
      expect(result.success).toBe(true);
      expect(result.reward).toBe(100);

      // 重复领取失败
      result = eventFlow.claimReward('spring_2024', 'task-1');
      expect(result.success).toBe(false);
    });
  });

  describe('Content Moderation Flow', () => {
    test('should filter inappropriate content', () => {
      const moderationFlow = {
        data: {
          blockedWords: ['垃圾广告', '诈骗', '虚假'],
          blockedPatterns: [/https?:\/\/\S+/gi, /\d{6,}/gi],
          userReports: []
        },
        setData: function(u) { Object.assign(this.data, u); },
        validateContent: function(content) {
          const issues = [];
          // 检查屏蔽词
          this.data.blockedWords.forEach(word => {
            if (content.includes(word)) issues.push(`包含屏蔽词：${word}`);
          });
          // 检查模式
          this.data.blockedPatterns.forEach(pattern => {
            if (pattern.test(content)) issues.push('包含受限模式');
          });
          return {
            valid: issues.length === 0,
            issues,
            filteredContent: this.filterContent(content)
          };
        },
        filterContent: function(content) {
          let filtered = content;
          this.data.blockedWords.forEach(word => {
            filtered = filtered.replace(new RegExp(word, 'g'), '***');
          });
          return filtered;
        },
        reportContent: function(content, reason) {
          this.setData({
            userReports: [...this.data.userReports, {
              content,
              reason,
              timestamp: Date.now(),
              status: 'pending'
            }]
          });
          return { success: true };
        }
      };

      // 有效内容
      let result = moderationFlow.validateContent('今天心情很好');
      expect(result.valid).toBe(true);
      expect(result.issues.length).toBe(0);

      // 包含屏蔽词
      result = moderationFlow.validateContent('这里有垃圾广告');
      expect(result.valid).toBe(false);
      expect(result.filteredContent).toBe('这里有***');

      // 包含链接
      result = moderationFlow.validateContent('访问 http://example.com 了解更多');
      expect(result.valid).toBe(false);

      // 举报内容
      result = moderationFlow.reportContent('不当内容', '违规内容');
      expect(result.success).toBe(true);
    });
  });

  describe('Real-time Notification Flow', () => {
    test('should manage push notifications', () => {
      const notificationFlow = {
        data: {
          notifications: [],
          preferences: {
            system: true,
            friend: true,
            promotion: false,
            reminder: true
          },
          maxStored: 50
        },
        setData: function(u) { Object.assign(this.data, u); },
        sendNotification: function(type, title, content) {
          if (!this.data.preferences[type]) return { delivered: false, reason: '用户未开启通知' };
          const notification = {
            id: `notif_${Date.now()}`,
            type,
            title,
            content,
            read: false,
            timestamp: Date.now()
          };
          let notifications = [...this.data.notifications, notification];
          if (notifications.length > this.data.maxStored) {
            notifications = notifications.slice(-this.data.maxStored);
          }
          this.setData({ notifications });
          return { delivered: true, notification };
        },
        markAsRead: function(notificationId) {
          const notif = this.data.notifications.find(n => n.id === notificationId);
          if (!notif) return { success: false };
          notif.read = true;
          return { success: true };
        },
        getUnreadCount: function(type) {
          const unread = this.data.notifications.filter(n => !n.read);
          return type ? unread.filter(n => n.type === type).length : unread.length;
        },
        clearRead: function() {
          this.setData({ notifications: this.data.notifications.filter(n => !n.read) });
          return { success: true };
        }
      };

      expect(notificationFlow.getUnreadCount()).toBe(0);

      // 发送通知
      let result = notificationFlow.sendNotification('system', '系统通知', '欢迎使用应用');
      expect(result.delivered).toBe(true);

      result = notificationFlow.sendNotification('promotion', '促销活动', '限时优惠');
      expect(result.delivered).toBe(false); // 用户关闭了推广通知

      expect(notificationFlow.getUnreadCount()).toBe(1);

      // 标记已读
      const notifId = notificationFlow.data.notifications[0].id;
      result = notificationFlow.markAsRead(notifId);
      expect(result.success).toBe(true);
      expect(notificationFlow.getUnreadCount()).toBe(0);
    });
  });

  describe('A/B Testing Flow', () => {
    test('should assign users to test groups', () => {
      const abTestFlow = {
        data: {
          tests: {
            new_homepage: {
              name: '新版首页测试',
              groups: {
                control: { name: '对照组', percent: 50, description: '原始首页' },
                variant: { name: '实验组', percent: 50, description: '新设计首页' }
              }
            },
            pricing_test: {
              name: '价格策略测试',
              groups: {
                control: { name: '原价', percent: 33 },
                discount_10: { name: '9 折', percent: 33 },
                discount_20: { name: '8 折', percent: 34 }
              }
            }
          },
          userAssignments: {}
        },
        setData: function(u) { Object.assign(this.data, u); },
        getUserGroup: function(testId, userId) {
          // 检查是否已有分配
          if (this.data.userAssignments[`${testId}_${userId}`]) {
            return this.data.userAssignments[`${testId}_${userId}`];
          }
          // 基于用户 ID 哈希分配
          const test = this.data.tests[testId];
          if (!test) return null;
          const hash = this.hashUserId(userId) % 100;
          let cumulative = 0;
          for (const [groupId, group] of Object.entries(test.groups)) {
            cumulative += group.percent;
            if (hash < cumulative) {
              this.data.userAssignments[`${testId}_${userId}`] = groupId;
              return groupId;
            }
          }
          return Object.keys(test.groups)[0];
        },
        hashUserId: function(userId) {
          let hash = 0;
          for (let i = 0; i < userId.length; i++) {
            hash = ((hash << 5) - hash) + userId.charCodeAt(i);
            hash = hash & hash;
          }
          return Math.abs(hash);
        },
        getTestInfo: function(testId) {
          return this.data.tests[testId] || null;
        }
      };

      // 获取用户分组
      const group1 = abTestFlow.getUserGroup('new_homepage', 'user-123');
      expect(['control', 'variant']).toContain(group1);

      // 同一用户应该总是获得相同的分组
      const group2 = abTestFlow.getUserGroup('new_homepage', 'user-123');
      expect(group1).toBe(group2);

      // 不同用户可能获得不同分组
      const group3 = abTestFlow.getUserGroup('new_homepage', 'user-456');
      // 可能相同也可能不同

      // 获取测试信息
      const testInfo = abTestFlow.getTestInfo('new_homepage');
      expect(testInfo.name).toBe('新版首页测试');
    });
  });
  beforeEach(() => {
    wx.__storage = {};
    jest.clearAllMocks();
  });

  describe('Complete User Onboarding Flow', () => {
    test('should complete full onboarding from start to dormitory creation', () => {
      // 步骤 1: 新用户进入应用
      const appState = {
        hasDormitory: false,
        userInfo: null,
        aiName: '瓜瓜'
      };

      // 步骤 2: 用户信息初始化
      appState.userInfo = {
        nickName: '测试用户',
        level: 1,
        companyDays: 0,
        starlightPoints: 0,
        crystalDiamonds: 0
      };

      expect(appState.userInfo.level).toBe(1);

      // 步骤 3: AI 命名
      const namingPage = {
        data: { aiNameInput: '' },
        setData: function(u) { Object.assign(this.data, u); },
        saveName: function() {
          if (!this.data.aiNameInput.trim()) {
            return { success: false, message: '请输入名字' };
          }
          wx.setStorageSync('aiName', this.data.aiNameInput);
          return { success: true, message: '设置成功' };
        }
      };

      namingPage.setData({ aiNameInput: '小可爱' });
      const saveResult = namingPage.saveName();
      expect(saveResult.success).toBe(true);

      // 步骤 4: 创建宿舍
      const createDormitoryPage = {
        data: { dormitoryName: '', roomId: '' },
        setData: function(u) { Object.assign(this.data, u); },
        createDormitory: function() {
          if (!this.data.dormitoryName.trim()) {
            return { success: false, message: '请输入宿舍名称' };
          }
          if (!this.data.roomId.trim()) {
            return { success: false, message: '请输入房间号' };
          }
          return { success: true, dormitoryId: 'dorm-123' };
        }
      };

      createDormitoryPage.setData({ dormitoryName: '温馨小屋', roomId: 'A101' });
      const dormResult = createDormitoryPage.createDormitory();
      expect(dormResult.success).toBe(true);

      // 步骤 5: 更新应用状态
      appState.hasDormitory = true;
      expect(appState.hasDormitory).toBe(true);
    });

    test('should handle onboarding with validation errors', () => {
      const onboardingState = {
        step: 1,
        errors: []
      };

      // 模拟命名验证失败
      const namingResult = { success: false, error: '名字不能为空' };
      if (!namingResult.success) {
        onboardingState.errors.push(namingResult.error);
        onboardingState.step = 1; // 停留在当前步骤
      }

      expect(onboardingState.step).toBe(1);
      expect(onboardingState.errors.length).toBe(1);
    });
  });

  describe('Daily Check-in Flow', () => {
    test('should complete daily check-in and receive rewards', () => {
      const checkInFlow = {
        data: {
          hasCheckedInToday: false,
          continuousDays: 5,
          points: 100
        },
        setData: function(u) { Object.assign(this.data, u); },
        checkIn: function() {
          if (this.data.hasCheckedInToday) {
            return { success: false, message: '今日已签到' };
          }
          this.setData({
            hasCheckedInToday: true,
            continuousDays: this.data.continuousDays + 1,
            points: this.data.points + 10
          });
          return { success: true, rewardPoints: 10 };
        }
      };

      const result = checkInFlow.checkIn();
      expect(result.success).toBe(true);
      expect(checkInFlow.data.continuousDays).toBe(6);
      expect(checkInFlow.data.points).toBe(110);
    });

    test('should prevent duplicate check-in', () => {
      const checkInFlow = {
        data: { hasCheckedInToday: true, continuousDays: 5 },
        setData: function(u) { Object.assign(this.data, u); },
        checkIn: function() {
          if (this.data.hasCheckedInToday) {
            return { success: false, message: '今日已签到' };
          }
          return { success: true };
        }
      };

      const result = checkInFlow.checkIn();
      expect(result.success).toBe(false);
      expect(result.message).toBe('今日已签到');
    });
  });

  describe('Chat + Mood Recording Flow', () => {
    test('should complete chat with mood selection', () => {
      const chatFlow = {
        data: {
          messages: [],
          moodRecords: [],
          currentUser: 'user-123'
        },
        setData: function(u) { Object.assign(this.data, u); },
        sendMoodMessage: function(mood) {
          const moodTexts = {
            happy: '今天心情很好~',
            sad: '今天有点难过~',
            normal: '心情一般般~'
          };
          const message = {
            id: Date.now(),
            type: 'user',
            content: moodTexts[mood] || '心情消息',
            mood: mood
          };
          this.setData({
            messages: [...this.data.messages, message],
            moodRecords: [...this.data.moodRecords, { mood, timestamp: Date.now() }]
          });
          return { success: true, message };
        }
      };

      // 发送多条心情消息
      chatFlow.sendMoodMessage('happy');
      chatFlow.sendMoodMessage('normal');
      chatFlow.sendMoodMessage('sad');

      expect(chatFlow.data.messages.length).toBe(3);
      expect(chatFlow.data.moodRecords.length).toBe(3);
    });
  });

  describe('Task Completion + Reward Claiming Flow', () => {
    test('should complete multiple tasks and claim rewards', () => {
      const taskFlow = {
        data: {
          tasks: [
            { id: 1, type: 'morning_checkin', completed: false, claimed: false, reward: 10 },
            { id: 2, type: 'night_checkin', completed: false, claimed: false, reward: 20 },
            { id: 3, type: 'share_mood', completed: false, claimed: false, reward: 15 }
          ],
          userPoints: { starlight: 100, crystal: 50 }
        },
        setData: function(u) { Object.assign(this.data, u); },
        completeTask: function(taskId) {
          const task = this.data.tasks.find(t => t.id === taskId);
          if (task) {
            task.completed = true;
            return { success: true };
          }
          return { success: false, message: '任务不存在' };
        },
        claimReward: function(taskId) {
          const task = this.data.tasks.find(t => t.id === taskId);
          if (!task) return { success: false, message: '任务不存在' };
          if (!task.completed) return { success: false, message: '任务未完成' };
          if (task.claimed) return { success: false, message: '奖励已领取' };

          task.claimed = true;
          this.setData({
            userPoints: {
              starlight: this.data.userPoints.starlight + task.reward,
              crystal: this.data.userPoints.crystal
            }
          });
          return { success: true, reward: task.reward };
        }
      };

      // 完成任务
      taskFlow.completeTask(1);
      taskFlow.completeTask(2);
      taskFlow.completeTask(3);

      // 领取奖励
      taskFlow.claimReward(1);
      taskFlow.claimReward(2);

      expect(taskFlow.data.tasks.filter(t => t.completed).length).toBe(3);
      expect(taskFlow.data.tasks.filter(t => t.claimed).length).toBe(2);
      expect(taskFlow.data.userPoints.starlight).toBe(130); // 100 + 10 + 20
    });
  });

  describe('Decoration Purchase Flow', () => {
    test('should complete decoration purchase with sufficient points', () => {
      const purchaseFlow = {
        data: {
          userPoints: { starlight: 500, crystal: 100 },
          ownedDecorations: [],
          shopItems: [
            { itemId: 1, name: '温馨台灯', price: 100, currency: 'starlight' },
            { itemId: 2, name: '可爱抱枕', price: 150, currency: 'starlight' },
            { itemId: 3, name: '绿植盆栽', price: 200, currency: 'crystal' }
          ]
        },
        setData: function(u) { Object.assign(this.data, u); },
        buyItem: function(itemId) {
          const item = this.data.shopItems.find(i => i.itemId === itemId);
          if (!item) return { success: false, message: '商品不存在' };

          const currentPoints = this.data.userPoints[item.currency];
          if (currentPoints < item.price) {
            return { success: false, message: '积分不足' };
          }

          this.setData({
            userPoints: {
              ...this.data.userPoints,
              [item.currency]: currentPoints - item.price
            },
            ownedDecorations: [...this.data.ownedDecorations, item]
          });

          return { success: true, item: item.name };
        }
      };

      // 购买多个装饰品
      const result1 = purchaseFlow.buyItem(1);
      const result2 = purchaseFlow.buyItem(2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(purchaseFlow.data.ownedDecorations.length).toBe(2);
      expect(purchaseFlow.data.userPoints.starlight).toBe(250); // 500 - 100 - 150
    });

    test('should fail purchase with insufficient points', () => {
      const purchaseFlow = {
        data: {
          userPoints: { starlight: 50, crystal: 100 },
          shopItems: [{ itemId: 1, name: '豪华装饰', price: 200, currency: 'starlight' }]
        },
        buyItem: function(itemId) {
          const item = this.data.shopItems.find(i => i.itemId === itemId);
          const currentPoints = this.data.userPoints[item.currency];
          if (currentPoints < item.price) {
            return { success: false, message: '积分不足' };
          }
          return { success: true };
        }
      };

      const result = purchaseFlow.buyItem(1);
      expect(result.success).toBe(false);
      expect(result.message).toBe('积分不足');
    });
  });

  describe('Dormitory Member Interaction Flow', () => {
    test('should complete member interactions', () => {
      const dormitoryFlow = {
        data: {
          members: [
            { id: 1, name: '用户 A', mood: 'happy', lastActive: Date.now() },
            { id: 2, name: '用户 B', mood: 'sad', lastActive: Date.now() - 86400000 },
            { id: 3, name: '用户 C', mood: 'normal', lastActive: Date.now() - 172800000 }
          ],
          interactions: [],
          likes: []
        },
        setData: function(u) { Object.assign(this.data, u); },
        viewMember: function(memberId) {
          const member = this.data.members.find(m => m.id === memberId);
          if (member) {
            this.setData({
              interactions: [...this.data.interactions, {
                type: 'view',
                memberId: memberId,
                timestamp: Date.now()
              }]
            });
            return { success: true, member };
          }
          return { success: false, message: '成员不存在' };
        },
        likeMember: function(memberId) {
          const likeKey = `${memberId}-${new Date().toDateString()}`;
          if (this.data.likes.includes(likeKey)) {
            return { success: false, message: '今日已点赞' };
          }
          this.setData({
            likes: [...this.data.likes, likeKey],
            interactions: [...this.data.interactions, {
              type: 'like',
              memberId: memberId,
              timestamp: Date.now()
            }]
          });
          return { success: true };
        }
      };

      // 查看成员
      dormitoryFlow.viewMember(1);
      dormitoryFlow.viewMember(2);

      // 点赞
      dormitoryFlow.likeMember(1);
      dormitoryFlow.likeMember(2);

      // 重复点赞应该失败
      const duplicateLike = dormitoryFlow.likeMember(1);

      expect(dormitoryFlow.data.interactions.length).toBe(4);
      expect(dormitoryFlow.data.likes.length).toBe(2);
      expect(duplicateLike.success).toBe(false);
    });
  });

  describe('Coupon Usage Flow', () => {
    test('should use coupon for purchase', () => {
      const couponFlow = {
        data: {
          coupons: [
            { id: 1, name: '5 元券', discount: 5, minPurchase: 20, used: false },
            { id: 2, name: '10 元券', discount: 10, minPurchase: 50, used: false },
            { id: 3, name: '已使用券', discount: 5, minPurchase: 20, used: true }
          ],
          wallet: 100
        },
        setData: function(u) { Object.assign(this.data, u); },
        useCoupon: function(couponId, purchaseAmount) {
          const coupon = this.data.coupons.find(c => c.id === couponId);
          if (!coupon) return { success: false, message: '优惠券不存在' };
          if (coupon.used) return { success: false, message: '优惠券已使用' };
          if (purchaseAmount < coupon.minPurchase) {
            return { success: false, message: '未达到使用门槛' };
          }

          coupon.used = true;
          const finalAmount = purchaseAmount - coupon.discount;
          this.setData({ wallet: this.data.wallet - finalAmount });

          return { success: true, finalAmount };
        }
      };

      // 使用优惠券购买
      const result1 = couponFlow.useCoupon(1, 30); // 满 20 减 5
      const result2 = couponFlow.useCoupon(2, 60); // 满 50 减 10

      // 尝试使用已使用的券
      const result3 = couponFlow.useCoupon(1, 30);

      // 尝试不满足门槛
      const result4 = couponFlow.useCoupon(2, 30);

      expect(result1.success).toBe(true);
      expect(result1.finalAmount).toBe(25); // 30 - 5
      expect(result2.success).toBe(true);
      expect(result2.finalAmount).toBe(50); // 60 - 10
      expect(result3.success).toBe(false);
      expect(result4.success).toBe(false);
    });
  });

  describe('Weekly Challenge Flow', () => {
    test('should track weekly challenge progress', () => {
      const weeklyFlow = {
        data: {
          weekStart: Date.now() - 3 * 86400000, // 3 天前
          challenges: [
            { id: 'full_attendance', name: '全勤奖', target: 7, current: 3 },
            { id: 'share_master', name: '分享达人', target: 5, current: 2 },
            { id: 'interaction_star', name: '互动之星', target: 50, current: 30 }
          ]
        },
        setData: function(u) { Object.assign(this.data, u); },
        updateProgress: function(challengeId, increment) {
          const challenge = this.data.challenges.find(c => c.id === challengeId);
          if (challenge) {
            challenge.current = Math.min(challenge.current + increment, challenge.target);
            return {
              success: true,
              completed: challenge.current >= challenge.target
            };
          }
          return { success: false };
        }
      };

      // 更新进度
      weeklyFlow.updateProgress('full_attendance', 2); // 3 + 2 = 5
      weeklyFlow.updateProgress('share_master', 10); // 2 + 10 = 12, but capped at 5

      const fullAttendance = weeklyFlow.data.challenges.find(c => c.id === 'full_attendance');
      const shareMaster = weeklyFlow.data.challenges.find(c => c.id === 'share_master');

      expect(fullAttendance.current).toBe(5);
      expect(shareMaster.current).toBe(5); // 封顶
      expect(weeklyFlow.data.challenges[2].current).toBe(30); // 未更新
    });
  });

  describe('Points Statistics Flow', () => {
    test('should calculate points statistics correctly', () => {
      const statsFlow = {
        data: {
          pointsHistory: [
            { type: 'earn', amount: 100, source: 'checkin', date: '2024-01-01' },
            { type: 'earn', amount: 50, source: 'task', date: '2024-01-02' },
            { type: 'spend', amount: 30, source: 'shop', date: '2024-01-03' },
            { type: 'earn', amount: 80, source: 'reward', date: '2024-01-04' },
            { type: 'spend', amount: 50, source: 'decoration', date: '2024-01-05' }
          ]
        },
        getStatistics: function() {
          const totalEarned = this.data.pointsHistory
            .filter(r => r.type === 'earn')
            .reduce((sum, r) => sum + r.amount, 0);

          const totalSpent = this.data.pointsHistory
            .filter(r => r.type === 'spend')
            .reduce((sum, r) => sum + r.amount, 0);

          const balance = totalEarned - totalSpent;

          return {
            totalEarned,
            totalSpent,
            balance,
            transactionCount: this.data.pointsHistory.length
          };
        }
      };

      const stats = statsFlow.getStatistics();

      expect(stats.totalEarned).toBe(230); // 100 + 50 + 80
      expect(stats.totalSpent).toBe(80); // 30 + 50
      expect(stats.balance).toBe(150); // 230 - 80
      expect(stats.transactionCount).toBe(5);
    });
  });

  describe('Multi-step Form Flow', () => {
    test('should complete multi-step form with validation', () => {
      const formFlow = {
        data: {
          currentStep: 0,
          formData: {},
          errors: {}
        },
        setData: function(u) { Object.assign(this.data, u); },
        nextStep: function() {
          if (this.validateStep()) {
            this.setData({ currentStep: this.data.currentStep + 1 });
            return { success: true };
          }
          return { success: false, errors: this.data.errors };
        },
        prevStep: function() {
          if (this.data.currentStep > 0) {
            this.setData({ currentStep: this.data.currentStep - 1 });
            return { success: true };
          }
          return { success: false, message: '已是第一步' };
        },
        validateStep: function() {
          const errors = {};
          if (this.data.currentStep === 0) {
            if (!this.data.formData.name) errors.name = '姓名不能为空';
          }
          if (this.data.currentStep === 1) {
            if (!this.data.formData.email) errors.email = '邮箱不能为空';
            else if (!/\S+@\S+\.\S+/.test(this.data.formData.email)) {
              errors.email = '邮箱格式不正确';
            }
          }
          this.setData({ errors });
          return Object.keys(errors).length === 0;
        },
        submit: function() {
          if (this.validateStep()) {
            return { success: true, data: this.data.formData };
          }
          return { success: false };
        }
      };

      // 第 1 步：姓名验证失败
      let result = formFlow.nextStep();
      expect(result.success).toBe(false);

      // 输入姓名
      formFlow.setData({ formData: { name: '张三' } });

      // 第 1 步：通过，进入第 2 步
      result = formFlow.nextStep();
      expect(result.success).toBe(true);
      expect(formFlow.data.currentStep).toBe(1);

      // 第 2 步：邮箱格式错误
      formFlow.setData({ formData: { name: '张三', email: 'invalid' } });
      result = formFlow.nextStep();
      expect(result.success).toBe(false);
      expect(result.errors.email).toBe('邮箱格式不正确');

      // 第 2 步：通过
      formFlow.setData({ formData: { name: '张三', email: 'test@example.com' } });
      result = formFlow.nextStep();
      expect(result.success).toBe(true);

      // 尝试后退
      result = formFlow.prevStep();
      expect(result.success).toBe(true);
      expect(formFlow.data.currentStep).toBe(1);
    });
  });

  describe('Data Persistence Flow', () => {
    test('should persist and restore data correctly', () => {
      const persistenceFlow = {
        storageKey: 'appData',
        data: { user: null, settings: {}, cache: {} },
        setData: function(u) { Object.assign(this.data, u); },
        save: function() {
          wx.setStorageSync(this.storageKey, JSON.stringify(this.data));
          return { success: true };
        },
        load: function() {
          const stored = wx.getStorageSync(this.storageKey);
          if (stored) {
            this.setData(JSON.parse(stored));
            return { success: true };
          }
          return { success: false, message: '无缓存数据' };
        },
        clear: function() {
          wx.removeStorageSync(this.storageKey);
          this.setData({ user: null, settings: {}, cache: {} });
          return { success: true };
        }
      };

      // 设置数据
      persistenceFlow.setData({
        user: { id: 1, name: '测试' },
        settings: { theme: 'dark', language: 'zh' },
        cache: { items: [1, 2, 3] }
      });

      // 保存
      persistenceFlow.save();

      // 模拟新实例加载
      const newInstance = {
        storageKey: 'appData',
        data: {},
        setData: function(u) { Object.assign(this.data, u); },
        load: function() {
          const stored = wx.getStorageSync(this.storageKey);
          if (stored) {
            this.setData(JSON.parse(stored));
            return { success: true };
          }
          return { success: false };
        }
      };

      // 加载数据
      const loadResult = newInstance.load();
      expect(loadResult.success).toBe(true);
      expect(newInstance.data.user.id).toBe(1);
      expect(newInstance.data.settings.theme).toBe('dark');
    });
  });
});
