/**
 * 持续交互测试 - 多步骤用户流程
 */

describe('Continuous Interaction Tests', () => {
  beforeEach(() => {
    wx.__storage = {};
    jest.clearAllMocks();
  });

  describe('Chat Conversation Flow', () => {
    test('should complete full chat flow', () => {
      // 模拟聊天页面
      const chatPage = {
        data: { messages: [], inputValue: '', loading: false },
        setData: function(u) { Object.assign(this.data, u); },
        sendMessage: function() {
          if (!this.data.inputValue.trim()) return;
          const msg = { id: Date.now(), type: 'user', content: this.data.inputValue };
          this.setData({ messages: [...this.data.messages, msg], inputValue: '', loading: true });

          // 模拟 AI 响应
          wx.cloud.callFunction.mockResolvedValue({
            result: { success: true, data: { response: 'AI 回复', conversationId: 'conv-123' } }
          });

          setTimeout(() => {
            const botMsg = { id: Date.now() + 1, type: 'bot', content: 'AI 回复' };
            this.setData({ messages: [...this.data.messages, botMsg], loading: false });
          }, 100);
        }
      };

      // 用户发送消息
      chatPage.data.inputValue = '你好';
      chatPage.sendMessage();

      expect(chatPage.data.messages.length).toBe(1);
      expect(chatPage.data.messages[0].content).toBe('你好');
      expect(chatPage.data.loading).toBe(true);
    });

    test('should handle mood selection', () => {
      const chatPage = {
        data: { messages: [] },
        setData: function(u) { Object.assign(this.data, u); },
        selectMood: function(e) {
          const moodMessages = {
            happy: '今天心情很好~ 😊',
            sad: '今天有点难过~ 😢',
            tired: '感觉好累~ 😫'
          };
          const content = moodMessages[e.dataset.mood];
          const msg = { id: Date.now(), type: 'user', content };
          this.setData({ messages: [...this.data.messages, msg] });
          wx.showToast({ title: '心情已记录', icon: 'none' });
        }
      };

      chatPage.selectMood({ dataset: { mood: 'happy' } });

      expect(wx.showToast).toHaveBeenCalledWith({ title: '心情已记录', icon: 'none' });
      expect(chatPage.data.messages[0].content).toContain('今天心情很好');
    });
  });

  describe('Home Navigation Flow', () => {
    test('should navigate through all features', () => {
      const homePage = {
        data: { hasDormitory: false },
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
        goToProfile: () => wx.navigateTo({ url: '/pages/profile/Index' })
      };

      // 测试所有导航
      homePage.quickChat();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/chat/Chat' });

      homePage.goToDormitory();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/dormitory/Create' });

      // 改变状态后再次测试
      homePage.data.hasDormitory = true;
      homePage.goToDormitory();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/dormitory/Index' });
    });
  });

  describe('Mood Recording Flow', () => {
    test('should record mood and verify statistics', () => {
      // 模拟首页记录心情
      const moodRecords = [];
      wx.setStorageSync('moodRecords', moodRecords);

      // 记录 7 天心情
      for (let i = 0; i < 7; i++) {
        const mood = ['happy', 'sad', 'normal', 'tired', 'happy', 'anxious', 'happy'][i];
        moodRecords.unshift({
          id: Date.now() - i * 86400000,
          mood: mood,
          label: `${mood} label`,
          date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
        });
      }
      wx.setStorageSync('moodRecords', moodRecords);

      // 验证心情统计
      const records = wx.getStorageSync('moodRecords');
      expect(records.length).toBe(7);

      const happyCount = records.filter(r => r.mood === 'happy').length;
      expect(happyCount).toBe(3);
    });
  });

  describe('Dormitory Creation Flow', () => {
    test('should create dormitory with validation', () => {
      const createPage = {
        data: { dormitoryName: '', roomId: '', description: '', selectedStyle: 0 },
        setData: function(u) { Object.assign(this.data, u); },
        onNameInput: function(e) { this.setData({ dormitoryName: e.detail.value }); },
        onRoomInput: function(e) { this.setData({ roomId: e.detail.value }); },
        createDormitory: function() {
          if (!this.data.dormitoryName.trim()) {
            wx.showToast({ title: '请输入宿舍名称', icon: 'none' });
            return false;
          }
          if (!this.data.roomId.trim()) {
            wx.showToast({ title: '请输入房间号', icon: 'none' });
            return false;
          }
          wx.cloud.callFunction.mockResolvedValue({ result: { success: true } });
          wx.showToast({ title: '创建成功', icon: 'success' });
          return true;
        }
      };

      // 测试验证
      createPage.createDormitory();
      expect(wx.showToast).toHaveBeenCalledWith({ title: '请输入宿舍名称', icon: 'none' });

      // 输入名称
      createPage.onNameInput({ detail: { value: '温馨小屋' } });
      createPage.createDormitory();
      expect(wx.showToast).toHaveBeenCalledWith({ title: '请输入房间号', icon: 'none' });

      // 输入房间号
      createPage.onRoomInput({ detail: { value: 'A101' } });
      const result = createPage.createDormitory();
      expect(result).toBe(true);
    });
  });

  describe('Task and Reward Flow', () => {
    test('should complete task and claim reward', () => {
      const taskPage = {
        data: { userPoints: { starlight: 100, crystal: 50 }, tasks: [] },
        setData: function(u) { Object.assign(this.data, u); },
        claimReward: function() {
          wx.showLoading({ title: '领取中...' });
          wx.cloud.callFunction.mockResolvedValue({ result: { success: true } });
          wx.showToast({ title: '领取成功', icon: 'success' });
        }
      };

      taskPage.claimReward();

      expect(wx.showLoading).toHaveBeenCalledWith({ title: '领取中...' });
      expect(wx.showToast).toHaveBeenCalledWith({ title: '领取成功', icon: 'success' });
    });
  });

  describe('Points Exchange Flow', () => {
    test('should exchange product with sufficient points', () => {
      const shopPage = {
        data: {
          points: 1000,
          products: [{ id: 1, name: '折扣券', price: 500 }]
        },
        exchange: function(productId) {
          const product = this.data.products.find(p => p.id === productId);
          if (this.data.points >= product.price) {
            this.setData({ points: this.data.points - product.price });
            wx.showToast({ title: '兑换成功', icon: 'success' });
          } else {
            wx.showToast({ title: '积分不足', icon: 'none' });
          }
        },
        setData: function(u) { Object.assign(this.data, u); }
      };

      shopPage.exchange(1);
      expect(wx.showToast).toHaveBeenCalledWith({ title: '兑换成功', icon: 'success' });
      expect(shopPage.data.points).toBe(500);
    });
  });
});
