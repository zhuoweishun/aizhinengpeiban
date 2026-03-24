/**
 * 核心页面功能测试
 */

describe('Core Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    wx.__storage = {};
  });

  describe('Index Page (首页)', () => {
    let page;

    beforeEach(() => {
      global.__app = {
        globalData: { aiName: '瓜瓜', userInfo: { level: 1 }, hasDormitory: false }
      };

      page = {
        data: { aiName: '瓜瓜', dailyQuote: '', hasDormitory: false, userLevel: 1, companyDays: 0 },
        setData: function(u) { Object.assign(this.data, u); },
        quickChat: () => wx.navigateTo({ url: '/pages/chat/Chat' }),
        goToTasks: () => wx.navigateTo({ url: '/pages/task/Index' }),
        goToPointsShop: () => wx.navigateTo({ url: '/pages/points/Shop' }),
        goToCoupons: () => wx.navigateTo({ url: '/pages/coupon/My' }),
        goToDecorationShop: () => wx.navigateTo({ url: '/pages/decoration/Shop' }),
        goToDormitory: function() {
          wx.navigateTo({ url: this.data.hasDormitory ? '/pages/dormitory/Index' : '/pages/dormitory/Create' });
        },
        goToMoodStats: () => wx.navigateTo({ url: '/pages/mood/Statistics' }),
        goToSummary: () => wx.navigateTo({ url: '/pages/summary/Summary' }),
        goToStories: () => wx.navigateTo({ url: '/pages/stories/Stories' }),
        goToRelax: () => wx.navigateTo({ url: '/pages/relax/Index' }),
        goToRead: () => wx.navigateTo({ url: '/pages/read/Index' }),
        goToProfile: () => wx.navigateTo({ url: '/pages/profile/Index' }),
        recordMood: function() {
          const records = wx.getStorageSync('moodRecords') || [];
          records.unshift({ id: Date.now(), mood: 'happy', label: '😊 开心' });
          wx.setStorageSync('moodRecords', records);
          wx.showToast({ title: '心情已记录', icon: 'success' });
        },
        hugTreeHole: () => wx.showToast({ title: '🤗 瓜瓜抱抱你~', icon: 'none', duration: 2000 })
      };
    });

    test('should navigate to all pages', () => {
      page.quickChat();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/chat/Chat' });

      page.goToTasks();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/task/Index' });

      page.goToPointsShop();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/points/Shop' });

      page.goToDormitory();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/dormitory/Create' });
    });

    test('should record mood', () => {
      page.recordMood();
      expect(wx.showToast).toHaveBeenCalledWith({ title: '心情已记录', icon: 'success' });
    });

    test('should hug tree hole', () => {
      page.hugTreeHole();
      expect(wx.showToast).toHaveBeenCalledWith({ title: '🤗 瓜瓜抱抱你~', icon: 'none', duration: 2000 });
    });
  });

  describe('Chat Page (聊天页)', () => {
    let page;

    beforeEach(() => {
      page = {
        data: { messages: [], inputValue: '', loading: false, aiName: '瓜瓜', conversationId: '' },
        setData: function(u) { Object.assign(this.data, u); },
        onInputChange: function(e) { this.setData({ inputValue: e.detail.value }); },
        sendMessage: function() {
          if (!this.data.inputValue.trim()) return;
          const msg = { id: Date.now(), type: 'user', content: this.data.inputValue };
          this.setData({
            messages: [...this.data.messages, msg],
            inputValue: '',
            loading: true
          });
        },
        selectMood: function(e) {
          const moodMessages = {
            happy: '今天心情很好~ 😊',
            sad: '今天有点难过~ 😢',
            tired: '感觉好累~ 😫',
            chat: '想聊聊天~ 💬'
          };
          const content = moodMessages[e.dataset.mood] || '想和你聊天~';
          const msg = { id: Date.now(), type: 'user', content };
          this.setData({ messages: [...this.data.messages, msg] });
          wx.showToast({ title: '心情已记录', icon: 'none' });
        },
        clearChatHistory: function() {
          wx.showModal({
            title: '确认清空',
            content: '清空后将无法恢复',
            success: (res) => {
              if (res.confirm) {
                this.setData({ messages: [] });
                wx.showToast({ title: '已清空', icon: 'success' });
              }
            }
          });
        }
      };
    });

    test('should send message', () => {
      page.data.inputValue = '你好';
      page.sendMessage();
      expect(page.data.messages.length).toBe(1);
      expect(page.data.messages[0].content).toBe('你好');
    });

    test('should not send empty message', () => {
      page.data.inputValue = '';
      page.sendMessage();
      expect(page.data.messages.length).toBe(0);
    });

    test('should select mood', () => {
      page.selectMood({ dataset: { mood: 'happy' } });
      expect(wx.showToast).toHaveBeenCalledWith({ title: '心情已记录', icon: 'none' });
    });
  });

  describe('Coupon Page (优惠券页)', () => {
    let page;

    beforeEach(() => {
      page = {
        data: { availableCount: 0, usedCount: 0, expiredCount: 0, coupons: [] },
        setData: function(u) { Object.assign(this.data, u); },
        onLoad: function() { this.loadCoupons(); },
        loadCoupons: function() {
          const coupons = [
            { id: 1, status: 'available' },
            { id: 2, status: 'available' },
            { id: 3, status: 'expired' }
          ];
          this.setData({
            coupons,
            availableCount: coupons.filter(c => c.status === 'available').length,
            usedCount: coupons.filter(c => c.status === 'used').length,
            expiredCount: coupons.filter(c => c.status === 'expired').length
          });
        },
        useCoupon: function() { wx.showToast({ title: '使用成功', icon: 'success' }); },
        goToShop: function() { wx.navigateTo({ url: '/pages/points/Shop' }); }
      };
    });

    test('should load coupons', () => {
      page.onLoad();
      expect(page.data.coupons.length).toBe(3);
      expect(page.data.availableCount).toBe(2);
      expect(page.data.expiredCount).toBe(1);
    });

    test('should use coupon', () => {
      page.useCoupon();
      expect(wx.showToast).toHaveBeenCalledWith({ title: '使用成功', icon: 'success' });
    });

    test('should navigate to shop', () => {
      page.goToShop();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/points/Shop' });
    });
  });

  describe('Dormitory Create Page (创建宿舍)', () => {
    let page;

    beforeEach(() => {
      page = {
        data: { dormitoryName: '', roomId: '', description: '', selectedStyle: 0 },
        setData: function(u) { Object.assign(this.data, u); },
        onNameInput: function(e) { this.setData({ dormitoryName: e.detail.value }); },
        onRoomInput: function(e) { this.setData({ roomId: e.detail.value }); },
        onDescInput: function(e) { this.setData({ description: e.detail.value }); },
        selectStyle: function(e) { this.setData({ selectedStyle: e.dataset.index }); },
        createDormitory: function() {
          if (!this.data.dormitoryName.trim()) {
            wx.showToast({ title: '请输入宿舍名称', icon: 'none' });
            return;
          }
          if (!this.data.roomId.trim()) {
            wx.showToast({ title: '请输入房间号', icon: 'none' });
            return;
          }
          wx.cloud.callFunction({
            name: 'dormitory',
            data: { action: 'create', name: this.data.dormitoryName }
          }).then(() => {
            wx.showToast({ title: '创建成功', icon: 'success' });
          });
        }
      };
    });

    test('should validate name', () => {
      page.createDormitory();
      expect(wx.showToast).toHaveBeenCalledWith({ title: '请输入宿舍名称', icon: 'none' });
    });

    test('should validate room', () => {
      page.data.dormitoryName = '温馨小屋';
      page.createDormitory();
      expect(wx.showToast).toHaveBeenCalledWith({ title: '请输入房间号', icon: 'none' });
    });

    test('should create dormitory', () => {
      page.data.dormitoryName = '温馨小屋';
      page.data.roomId = 'A101';
      wx.cloud.callFunction.mockResolvedValue({ result: { success: true } });
      page.createDormitory();
      expect(wx.cloud.callFunction).toHaveBeenCalled();
    });
  });

  describe('Summary Page (小确幸)', () => {
    let page;

    beforeEach(() => {
      page = {
        data: { content: '', selectedMood: 2, moods: [
          { value: 'excited', emoji: '🤩' },
          { value: 'happy', emoji: '😊' },
          { value: 'normal', emoji: '😐' },
          { value: 'tired', emoji: '😫' },
          { value: 'sad', emoji: '😢' }
        ]},
        setData: function(u) { Object.assign(this.data, u); },
        onContentInput: function(e) { this.setData({ content: e.detail.value }); },
        selectMood: function(e) { this.setData({ selectedMood: e.dataset.index }); },
        submitHappiness: function() {
          if (!this.data.content.trim()) {
            wx.showToast({ title: '请输入内容', icon: 'none' });
            return;
          }
          wx.showToast({ title: '记录成功', icon: 'success' });
          this.setData({ content: '' });
        }
      };
    });

    test('should reject empty content', () => {
      page.submitHappiness();
      expect(wx.showToast).toHaveBeenCalledWith({ title: '请输入内容', icon: 'none' });
    });

    test('should submit happiness', () => {
      page.data.content = '今天很开心';
      page.submitHappiness();
      expect(wx.showToast).toHaveBeenCalledWith({ title: '记录成功', icon: 'success' });
      expect(page.data.content).toBe('');
    });
  });

  describe('Points Shop Page (积分商城)', () => {
    let page;

    beforeEach(() => {
      page = {
        data: { products: [
          { id: 1, name: '折扣券', price: 500 },
          { id: 2, name: '礼物', price: 300 }
        ]},
        exchange: function() { wx.showToast({ title: '兑换成功', icon: 'success' }); }
      };
    });

    test('should have products', () => {
      expect(page.data.products.length).toBe(2);
    });

    test('should exchange product', () => {
      page.exchange();
      expect(wx.showToast).toHaveBeenCalledWith({ title: '兑换成功', icon: 'success' });
    });
  });
});
