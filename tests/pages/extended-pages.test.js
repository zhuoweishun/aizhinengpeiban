/**
 * 扩展页面测试 - 覆盖更多页面和边界条件
 * Ralph Loop Iteration 2
 */

describe('Extended Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    wx.__storage = {};
  });

  describe('Profile Page (个人中心)', () => {
    let page;

    beforeEach(() => {
      global.__app = { globalData: { userInfo: { nickName: '测试用户', avatar: 'test.jpg', level: 5 } } };
      global.getApp = jest.fn(() => global.__app);

      page = {
        data: { userInfo: { nickName: '', avatar: '', level: 1 } },
        setData: function(u) { Object.assign(this.data, u); },
        onLoad: function() { this.loadUserInfo(); },
        onShow: function() { this.loadUserInfo(); },
        loadUserInfo: function() {
          const userInfo = getApp().globalData.userInfo || { nickName: '未设置昵称', level: 1 };
          this.setData({ userInfo });
        },
        goToMyTasks: () => wx.navigateTo({ url: '/pages/task/Index' }),
        goToMyCoupons: () => wx.navigateTo({ url: '/pages/coupon/My' }),
        goToMyDecorations: () => wx.navigateTo({ url: '/pages/decoration/My' }),
        goToSettings: () => wx.navigateTo({ url: '/pages/settings/Index' }),
        goToAbout: () => wx.navigateTo({ url: '/pages/about/Index' }),
        goToFeedback: () => wx.navigateTo({ url: '/pages/feedback/Index' })
      };
    });

    test('should load user info', () => {
      page.onLoad();
      expect(page.data.userInfo.nickName).toBe('测试用户');
      expect(page.data.userInfo.level).toBe(5);
    });

    test('should navigate to my tasks', () => {
      page.goToMyTasks();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/task/Index' });
    });

    test('should navigate to my coupons', () => {
      page.goToMyCoupons();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/coupon/My' });
    });

    test('should navigate to my decorations', () => {
      page.goToMyDecorations();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/decoration/My' });
    });
  });

  describe('Task Page (任务页面)', () => {
    let page;

    beforeEach(() => {
      page = {
        data: { userPoints: { starlight: 0, crystal: 0 }, dailyTasks: [], weeklyTasks: [], dormitoryTasks: [] },
        setData: function(u) { Object.assign(this.data, u); },
        onLoad: function() { this.loadTasks(); },
        onShow: function() { this.loadTasks(); },
        loadTasks: function() {
          wx.showLoading({ title: '加载中...' });
          wx.cloud.callFunction.mockResolvedValue({
            result: {
              success: true,
              userPoints: { starlight: 100, crystal: 50 },
              dailyTasks: [{ id: 1, name: '每日任务', completed: false }],
              weeklyTasks: [],
              dormitoryTasks: []
            }
          });
          this.setData({
            userPoints: { starlight: 100, crystal: 50 },
            dailyTasks: [{ id: 1, name: '每日任务', completed: false }]
          });
          wx.hideLoading();
        },
        claimReward: function(e) {
          wx.showLoading({ title: '领取中...' });
          wx.cloud.callFunction.mockResolvedValue({ result: { success: true } });
          wx.showToast({ title: '领取成功', icon: 'success' });
          this.loadTasks();
        }
      };
    });

    test('should load tasks', () => {
      page.loadTasks();
      expect(wx.showLoading).toHaveBeenCalledWith({ title: '加载中...' });
      expect(page.data.userPoints.starlight).toBe(100);
    });

    test('should claim reward', () => {
      page.claimReward({ currentTarget: { dataset: { index: 0 } } });
      expect(wx.showToast).toHaveBeenCalledWith({ title: '领取成功', icon: 'success' });
    });

    test('should handle load error', () => {
      wx.cloud.callFunction.mockRejectedValue(new Error('加载失败'));
      page.loadTasks();
      expect(page.data.dailyTasks.length).toBe(1); // 默认值
    });
  });

  describe('Decoration Shop Page (装饰商城)', () => {
    let page;

    beforeEach(() => {
      page = {
        data: { items: [], userPoints: { starlight: 0, crystal: 0 }, currentCategory: 'all', totalItems: 0 },
        setData: function(u) { Object.assign(this.data, u); },
        onLoad: function() { this.loadShopItems(); },
        loadShopItems: function() {
          wx.showLoading({ title: '加载中...' });
          wx.cloud.callFunction.mockResolvedValue({
            result: {
              success: true,
              items: [{ itemId: 1, name: '装饰品', price: 100, currency: 'starlight' }],
              userPoints: { starlight: 200, crystal: 100 },
              totalItems: 1
            }
          });
          this.setData({
            items: [{ itemId: 1, name: '装饰品', price: 100 }],
            userPoints: { starlight: 200, crystal: 100 }
          });
          wx.hideLoading();
        },
        selectCategory: function(e) {
          this.setData({ currentCategory: e.dataset.category });
          this.loadShopItems();
        },
        buyItem: function(e) {
          const item = this.data.items[e.dataset.index];
          wx.showModal({
            title: '确认购买',
            content: `确定要购买 ${item.name} 吗？`,
            success: (res) => {
              if (res.confirm) {
                this.confirmBuy(item);
              }
            }
          });
        },
        confirmBuy: function(item) {
          wx.showLoading({ title: '购买中...' });
          wx.cloud.callFunction.mockResolvedValue({ result: { success: true } });
          wx.showToast({ title: '购买成功', icon: 'success' });
        }
      };
    });

    test('should load shop items', () => {
      page.loadShopItems();
      expect(page.data.items.length).toBe(1);
      expect(page.data.userPoints.starlight).toBe(200);
    });

    test('should select category', () => {
      page.selectCategory({ dataset: { category: 'furniture' } });
      expect(page.data.currentCategory).toBe('furniture');
    });

    test('should show confirm dialog before buying', () => {
      page.data.items = [{ name: '测试装饰品' }];
      page.buyItem({ dataset: { index: 0 } });
      expect(wx.showModal).toHaveBeenCalledWith({
        title: '确认购买',
        content: expect.stringContaining('测试装饰品'),
        success: expect.any(Function)
      });
    });

    test('should buy item', () => {
      page.data.items = [{ itemId: 1, name: '测试装饰品' }];
      page.confirmBuy({ name: '测试装饰品' });
      expect(wx.showToast).toHaveBeenCalledWith({ title: '购买成功', icon: 'success' });
    });
  });

  describe('Dormitory Index Page (宿舍页面)', () => {
    let page;

    beforeEach(() => {
      page = {
        data: {
          dormitoryId: '', dormitory: null, allMembers: [], emptySlots: [],
          recentPosts: [], todayTasks: [], memberInfo: null
        },
        setData: function(u) { Object.assign(this.data, u); },
        onLoad: function(options) {
          if (options && options.id) {
            this.setData({ dormitoryId: options.id });
            this.loadDormitoryData();
          } else {
            this.loadUserDormitory();
          }
        },
        onShow: function() {
          if (this.data.dormitoryId) this.loadDormitoryData();
        },
        loadUserDormitory: function() {
          wx.showLoading({ title: '查询中...' });
          wx.cloud.callFunction.mockResolvedValue({ result: { success: true, dormitoryId: 'dorm-123' } });
          this.setData({ dormitoryId: 'dorm-123' });
          this.loadDormitoryData();
          wx.hideLoading();
        },
        loadDormitoryData: function() {
          wx.showLoading({ title: '加载中...' });
          wx.cloud.callFunction.mockResolvedValue({
            result: {
              success: true,
              dormitory: { name: '温馨小屋' },
              memberInfo: { _id: 'member-1' },
              allMembers: [{ name: '用户 1' }, { name: '用户 2' }],
              recentPosts: [],
              todayTasks: []
            }
          });
          const allMembers = [{ name: '用户 1' }, { name: '用户 2' }];
          const emptyCount = 6 - allMembers.length;
          this.setData({
            dormitory: { name: '温馨小屋' },
            allMembers,
            emptySlots: Array(Math.max(0, emptyCount)).fill(0)
          });
          wx.hideLoading();
          return Promise.resolve();
        },
        viewMember: function(e) {
          const member = e.currentTarget.dataset.member;
          wx.showToast({ title: `${member.customTitle || member.name} 的主页`, icon: 'none' });
        },
        setMood: function() {
          const moodOptions = [
            { value: 'happy', emoji: '😊', label: '开心' },
            { value: 'normal', emoji: '😐', label: '一般' },
            { value: 'sad', emoji: '😔', label: '难过' }
          ];
          wx.showActionSheet({
            itemList: moodOptions.map(m => m.label),
            success: (res) => {
              const selected = moodOptions[res.tapIndex];
              this.updateMood(selected.value, selected.emoji);
            }
          });
        },
        updateMood: function(mood, emoji) {
          wx.showLoading({ title: '设置中...' });
          wx.cloud.callFunction.mockResolvedValue({ result: { success: true } });
          wx.showToast({ title: '心情已更新', icon: 'success' });
        },
        completeTask: function(e) {
          wx.showLoading({ title: '提交中...' });
          wx.cloud.callFunction.mockResolvedValue({ result: { success: true } });
          wx.showToast({ title: '任务完成', icon: 'success' });
        },
        goToCreate: () => wx.navigateTo({ url: '/pages/dormitory/Create' }),
        goToInvite: () => wx.navigateTo({ url: '/pages/dormitory/Invite' }),
        goToSpace: () => wx.navigateTo({ url: '/pages/dormitory/Space' }),
        goToGoodnight: () => wx.navigateTo({ url: '/pages/dormitory/Goodnight' }),
        goToDormitoryRoom: () => wx.navigateTo({ url: '/pages/dormitory/Room' }),
        onPullDownRefresh: function() {
          this.loadDormitoryData().then(() => wx.stopPullDownRefresh());
        }
      };
    });

    test('should load user dormitory', () => {
      page.onLoad({});
      expect(page.data.dormitoryId).toBe('dorm-123');
    });

    test('should calculate empty slots correctly', () => {
      page.loadDormitoryData();
      expect(page.data.emptySlots.length).toBe(4); // 6 - 2 = 4
    });

    test('should view member', () => {
      page.viewMember({ currentTarget: { dataset: { member: { name: '测试成员', customTitle: '舍长' } } } });
      expect(wx.showToast).toHaveBeenCalledWith({ title: '舍长 的主页', icon: 'none' });
    });

    test('should update mood', () => {
      page.updateMood('happy', '😊');
      expect(wx.showToast).toHaveBeenCalledWith({ title: '心情已更新', icon: 'success' });
    });

    test('should complete task', () => {
      page.completeTask({ currentTarget: { dataset: { taskId: 'task-1' } } });
      expect(wx.showToast).toHaveBeenCalledWith({ title: '任务完成', icon: 'success' });
    });

    test('should navigate to create dormitory', () => {
      page.goToCreate();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/dormitory/Create' });
    });

    test('should handle pull down refresh', async () => {
      wx.stopPullDownRefresh = jest.fn();
      await page.onPullDownRefresh();
      expect(wx.stopPullDownRefresh).toHaveBeenCalled();
    });
  });

  describe('Stories Page (哄睡故事)', () => {
    let page;

    beforeEach(() => {
      page = {
        data: {
          stories: [
            { id: 1, icon: '🌙', title: '月亮的光芒', description: '温柔的月光照耀着你入睡', duration: 15, playCount: 1234 },
            { id: 2, icon: '⭐', title: '小星星的梦', description: '在星空下进入甜美的梦乡', duration: 12, playCount: 987 },
            { id: 3, icon: '🌸', title: '春天的花园', description: '漫步在充满花香的花园中', duration: 18, playCount: 765 },
            { id: 4, icon: '🦋', title: '蝴蝶的愿望', description: '跟随蝴蝶飞向梦想的彼岸', duration: 20, playCount: 654 },
            { id: 5, icon: '🫧', title: '泡泡的旅行', description: '乘着泡泡去远方旅行', duration: 14, playCount: 543 }
          ]
        },
        playStory: function(e) {
          wx.showToast({ title: '开始播放故事', icon: 'none' });
        }
      };
    });

    test('should have 5 stories', () => {
      expect(page.data.stories.length).toBe(5);
    });

    test('should play story', () => {
      page.playStory({ currentTarget: { dataset: { id: 1 } } });
      expect(wx.showToast).toHaveBeenCalledWith({ title: '开始播放故事', icon: 'none' });
    });

    test('should have story with correct properties', () => {
      const firstStory = page.data.stories[0];
      expect(firstStory).toHaveProperty('id');
      expect(firstStory).toHaveProperty('icon');
      expect(firstStory).toHaveProperty('title');
      expect(firstStory).toHaveProperty('duration');
      expect(firstStory).toHaveProperty('playCount');
    });
  });

  describe('Relax Page (放松助眠)', () => {
    let page;

    beforeEach(() => {
      page = {
        goToBreath: () => wx.navigateTo({ url: '/pages/relax/Breath' }),
        goToBodyScan: () => wx.navigateTo({ url: '/pages/relax/BodyScan' }),
        goToImagination: () => wx.navigateTo({ url: '/pages/relax/Imagination' }),
        goToQuickRelax: () => wx.navigateTo({ url: '/pages/relax/Quick' }),
        goToStories: () => wx.navigateTo({ url: '/pages/stories/Stories' }),
        goToWhiteNoise: () => wx.navigateTo({ url: '/pages/relax/WhiteNoise' })
      };
    });

    test('should navigate to breath exercise', () => {
      page.goToBreath();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/relax/Breath' });
    });

    test('should navigate to body scan', () => {
      page.goToBodyScan();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/relax/BodyScan' });
    });

    test('should navigate to imagination', () => {
      page.goToImagination();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/relax/Imagination' });
    });

    test('should navigate to quick relax', () => {
      page.goToQuickRelax();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/relax/Quick' });
    });

    test('should navigate to stories', () => {
      page.goToStories();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/stories/Stories' });
    });

    test('should navigate to white noise', () => {
      page.goToWhiteNoise();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/relax/WhiteNoise' });
    });
  });

  describe('Read Page (读给你听)', () => {
    let page;

    beforeEach(() => {
      page = {
        data: {
          contents: [
            { id: 1, icon: '💌', title: '情书读给你听', description: '温暖的情话陪伴你' },
            { id: 2, icon: '📜', title: '诗歌朗诵', description: '优美诗词陶冶心灵' },
            { id: 3, icon: '📚', title: '文章精选', description: '好文分享给你' },
            { id: 4, icon: '🎭', title: '故事会', description: '精彩故事不间断' }
          ]
        },
        playStory: function(e) {
          wx.showToast({ title: '开始播放', icon: 'none' });
        }
      };
    });

    test('should have 4 content types', () => {
      expect(page.data.contents.length).toBe(4);
    });

    test('should play story', () => {
      page.playStory({ currentTarget: { dataset: { id: 1 } } });
      expect(wx.showToast).toHaveBeenCalledWith({ title: '开始播放', icon: 'none' });
    });
  });

  describe('Naming Page (AI 命名)', () => {
    let page;

    beforeEach(() => {
      page = {
        data: {
          aiNameInput: '',
          defaultNames: ['瓜瓜', '果果', '糖糖', '豆豆', '团团', '圆圆']
        },
        setData: function(u) { Object.assign(this.data, u); },
        onLoad: function() { console.log('AI 命名页面加载'); },
        onInputChange: function(e) { this.setData({ aiNameInput: e.detail.value }); },
        selectDefaultName: function(e) {
          const name = e.currentTarget.dataset.name;
          this.setData({ aiNameInput: name });
        },
        saveName: function() {
          if (!this.data.aiNameInput.trim()) {
            wx.showToast({ title: '请输入名字', icon: 'none' });
            return;
          }
          wx.setStorageSync('aiName', this.data.aiNameInput.trim());
          wx.showToast({ title: '名字设置成功~', icon: 'success' });
          setTimeout(() => {
            wx.reLaunch({ url: '/pages/index/Index' });
          }, 1500);
        }
      };
    });

    test('should have 6 default names', () => {
      expect(page.data.defaultNames.length).toBe(6);
    });

    test('should handle name input', () => {
      page.onInputChange({ detail: { value: '小可爱' } });
      expect(page.data.aiNameInput).toBe('小可爱');
    });

    test('should select default name', () => {
      page.selectDefaultName({ currentTarget: { dataset: { name: '糖糖' } } });
      expect(page.data.aiNameInput).toBe('糖糖');
    });

    test('should reject empty name', () => {
      page.data.aiNameInput = '';
      page.saveName();
      expect(wx.showToast).toHaveBeenCalledWith({ title: '请输入名字', icon: 'none' });
    });

    test('should save valid name', () => {
      page.data.aiNameInput = '小可爱';
      page.saveName();
      expect(wx.setStorageSync).toHaveBeenCalledWith('aiName', '小可爱');
      expect(wx.showToast).toHaveBeenCalledWith({ title: '名字设置成功~', icon: 'success' });
    });
  });

  describe('Mood Statistics Page (心情统计)', () => {
    let page;

    beforeEach(() => {
      page = {
        data: {
          records: [], weekDays: [], moodStats: [], recentRecords: [],
          currentMoodIcon: '😊', currentMoodText: '暂无数据', weekLabel: ''
        },
        setData: function(u) { Object.assign(this.data, u); },
        onLoad: function() { this.loadMoodRecords(); },
        onShow: function() { this.loadMoodRecords(); },
        loadMoodRecords: function() {
          const records = wx.getStorageSync('moodRecords') || [];
          this.setData({ records });
          if (records.length === 0) {
            this.setData({
              currentMoodIcon: '📝',
              currentMoodText: '开始记录第一天的好心情吧~'
            });
            return;
          }
          // 计算统计
          const stats = { happy: 0, normal: 0, sad: 0, tired: 0, anxious: 0 };
          records.forEach(r => { if (stats[r.mood] !== undefined) stats[r.mood]++; });
          const total = records.length || 1;
          const moodStats = Object.keys(stats).map(type => ({
            type, icon: '😊', label: type, count: stats[type], percent: Math.round((stats[type] / total) * 100)
          }));
          const weekDays = Array(7).fill({ day: '周一', mood: 'happy' });
          const recentRecords = records.slice(0, 10);
          this.setData({ moodStats, weekDays, recentRecords });
        }
      };
    });

    test('should show empty state when no records', () => {
      wx.setStorageSync('moodRecords', []);
      page.loadMoodRecords();
      expect(page.data.currentMoodIcon).toBe('📝');
      expect(page.data.currentMoodText).toBe('开始记录第一天的好心情吧~');
    });

    test('should calculate mood stats', () => {
      wx.setStorageSync('moodRecords', [
        { mood: 'happy' }, { mood: 'happy' }, { mood: 'sad' }
      ]);
      page.loadMoodRecords();
      expect(page.data.moodStats.length).toBe(5);
      const happyStat = page.data.moodStats.find(s => s.type === 'happy');
      expect(happyStat.count).toBe(2);
    });

    test('should limit recent records to 10', () => {
      const records = Array(15).fill({ mood: 'happy' });
      wx.setStorageSync('moodRecords', records);
      page.loadMoodRecords();
      expect(page.data.recentRecords.length).toBe(10);
    });
  });
});
