/**
 * 首页测试 - Index
 */

describe('Index Page Tests', () => {
  let pageInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    wx.__storage = {};

    // 设置全局 app
    global.__app = {
      globalData: { aiName: '瓜瓜', userInfo: { level: 1, companyDays: 5 }, hasDormitory: false }
    };

    global.getApp = jest.fn(() => global.__app);

    // 创建页面实例
    pageInstance = {
      data: {
        aiName: '瓜瓜',
        dailyQuote: '',
        currentDate: '',
        currentTime: '',
        companyDays: 0,
        userLevel: 1,
        hasDormitory: false
      },
      setData: function(updates) {
        Object.assign(this.data, updates);
      },
      onLoad: function() {
        this.updateDateTime();
        this.setDailyQuote();
        this.loadUserInfo();
      },
      onShow: function() {
        this.checkDormitoryStatus();
      },
      updateDateTime: function() {
        const now = new Date();
        this.setData({
          currentDate: `${now.getMonth() + 1}月${now.getDate()}日`,
          currentTime: `${now.getHours()}:${now.getMinutes()}`
        });
      },
      loadUserInfo: function() {
        const userInfo = getApp().globalData.userInfo || {};
        this.setData({
          userLevel: userInfo.level || 1,
          companyDays: userInfo.companyDays || 0
        });
      },
      checkDormitoryStatus: function() {
        const hasDormitory = getApp().globalData.hasDormitory || false;
        this.setData({ hasDormitory });
      },
      setDailyQuote: function() {
        const quotes = [
          '每一天都是新的开始，你值得拥有所有美好~ 💕',
          '累了就休息一下，我会一直陪着你~ 🤗',
          '你的感受很重要，记得好好照顾自己~ ✨',
          '无论发生什么，你都不是一个人~ 💖',
          '今天也要开心哦，你是最棒的~ 🌟',
          '慢慢来，一切都会好起来的~ 🌸',
          '你已经在做得很好了~ 🐾'
        ];
        const today = new Date().getDay();
        this.setData({ dailyQuote: quotes[today % quotes.length] });
      },
      quickChat: function() { wx.navigateTo({ url: '/pages/chat/Chat' }); },
      goToTasks: function() { wx.navigateTo({ url: '/pages/task/Index' }); },
      goToPointsShop: function() { wx.navigateTo({ url: '/pages/points/Shop' }); },
      goToCoupons: function() { wx.navigateTo({ url: '/pages/coupon/My' }); },
      goToMyPoints: function() { wx.navigateTo({ url: '/pages/points/My' }); },
      goToDecorationShop: function() { wx.navigateTo({ url: '/pages/decoration/Shop' }); },
      goToDormitory: function() {
        if (this.data.hasDormitory) {
          wx.navigateTo({ url: '/pages/dormitory/Index' });
        } else {
          wx.navigateTo({ url: '/pages/dormitory/Create' });
        }
      },
      goToMoodStats: function() { wx.navigateTo({ url: '/pages/mood/Statistics' }); },
      goToSummary: function() { wx.navigateTo({ url: '/pages/summary/Summary' }); },
      goToStories: function() { wx.navigateTo({ url: '/pages/stories/Stories' }); },
      goToRelax: function() { wx.navigateTo({ url: '/pages/relax/Index' }); },
      goToRead: function() { wx.navigateTo({ url: '/pages/read/Index' }); },
      goToProfile: function() { wx.navigateTo({ url: '/pages/profile/Index' }); },
      recordMood: function() {
        const records = wx.getStorageSync('moodRecords') || [];
        records.unshift({ id: Date.now(), mood: 'happy', label: '😊 开心' });
        wx.setStorageSync('moodRecords', records);
        wx.showToast({ title: '心情已记录', icon: 'success' });
      },
      hugTreeHole: function() {
        wx.showToast({ title: '🤗 瓜瓜抱抱你~', icon: 'none', duration: 2000 });
      }
    };
  });

  test('should initialize with default data', () => {
    expect(pageInstance.data).toEqual({
      aiName: '瓜瓜',
      dailyQuote: '',
      currentDate: '',
      currentTime: '',
      companyDays: 0,
      userLevel: 1,
      hasDormitory: false
    });
  });

  test('should set daily quote on load', () => {
    pageInstance.onLoad();
    expect(pageInstance.data.dailyQuote.length).toBeGreaterThan(0);
  });

  test('should load user info', () => {
    pageInstance.onLoad();
    expect(pageInstance.data.userLevel).toBe(1);
    expect(pageInstance.data.companyDays).toBe(5);
  });

  test('should navigate to chat', () => {
    pageInstance.quickChat();
    expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/chat/Chat' });
  });

  test('should navigate to dormitory create when no dormitory', () => {
    pageInstance.goToDormitory();
    expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/dormitory/Create' });
  });

  test('should navigate to dormitory index when has dormitory', () => {
    pageInstance.data.hasDormitory = true;
    pageInstance.goToDormitory();
    expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/dormitory/Index' });
  });

  test('should record mood', () => {
    pageInstance.recordMood();
    expect(wx.showToast).toHaveBeenCalledWith({ title: '心情已记录', icon: 'success' });
    expect(wx.setStorageSync).toHaveBeenCalled();
  });

  test('should hug tree hole', () => {
    pageInstance.hugTreeHole();
    expect(wx.showToast).toHaveBeenCalledWith({
      title: '🤗 瓜瓜抱抱你~',
      icon: 'none',
      duration: 2000
    });
  });
});
