/**
 * 首页 - 主菜单页面
 * @description 场景化入口，核心功能突出
 */

const app = getApp();
const loadingUtil = require('../../utils/loading.js');
const dateUtil = require('../../utils/date.js');

Page({
  data: {
    aiName: '瓜瓜',
    dailyQuote: '',
    currentDate: '',
    currentTime: '',
    companyDays: 0,
    userLevel: 1,
    hasDormitory: false
  },

  onLoad() {
    this.updateDateTime();
    this.setDailyQuote();
    this.loadUserInfo();

    // 每分钟更新时间
    this.timer = setInterval(() => {
      this.updateDateTime();
    }, 60000);
  },

  onShow() {
    this.checkDormitoryStatus();
  },

  onUnload() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  },

  // 更新日期时间
  updateDateTime() {
    const now = new Date();
    const { date, time, weekday } = dateUtil.formatDateTime(now);

    this.setData({
      currentDate: `${date.replace('-', '月').replace('-', '月')} ${weekday}`,
      currentTime: time
    });
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      // 从全局状态获取用户信息
      const userInfo = app.globalData.userInfo || {};
      this.setData({
        userLevel: userInfo.level || 1,
        companyDays: userInfo.companyDays || 0
      });
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  },

  // 检查宿舍状态
  async checkDormitoryStatus() {
    try {
      // 检查用户是否已加入宿舍
      const hasDormitory = app.globalData.hasDormitory || false;
      this.setData({ hasDormitory });
    } catch (error) {
      console.error('检查宿舍状态失败:', error);
    }
  },

  // 设置每日寄语
  setDailyQuote() {
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
    this.setData({
      dailyQuote: quotes[today % quotes.length]
    });
  },

  // 快捷聊天
  quickChat() {
    wx.navigateTo({ url: '/pages/chat/Chat' });
  },

  // 记录心情
  recordMood() {
    const moods = [
      { value: 'happy', label: '😊 开心' },
      { value: 'normal', label: '😐 平静' },
      { value: 'sad', label: '😢 难过' },
      { value: 'tired', label: '😫 疲惫' },
      { value: 'anxious', label: '😰 焦虑' }
    ];

    wx.showActionSheet({
      itemList: moods.map(m => m.label),
      success: (res) => {
        const selected = moods[res.tapIndex];
        // 轻触反馈
        loadingUtil.triggerLightVibrate();
        // 保存心情记录
        this.saveMoodRecord(selected);
      }
    });
  },

  // 保存心情记录
  saveMoodRecord(mood) {
    try {
      const records = wx.getStorageSync('moodRecords') || [];
      const newRecord = {
        id: Date.now(),
        mood: mood.value,
        label: mood.label,
        timestamp: new Date().toISOString(),
        date: dateUtil.formatDate(new Date())
      };

      // 添加新记录到开头
      records.unshift(newRecord);

      // 限制保存最近 365 条记录
      if (records.length > 365) {
        records.pop();
      }

      wx.setStorageSync('moodRecords', records);

      wx.showToast({
        title: `心情已记录~ ${mood.label}`,
        icon: 'success'
      });

      console.log('心情记录已保存:', newRecord);
    } catch (error) {
      console.error('保存心情记录失败:', error);
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      });
    }
  },

  // 抱抱树洞互动
  hugTreeHole() {
    // 轻触反馈
    loadingUtil.triggerLightVibrate();

    wx.showToast({
      title: '🤗 瓜瓜抱抱你~',
      icon: 'none',
      duration: 2000
    });
  },

  // 导航到积分商城
  goToPointsShop() {
    wx.navigateTo({ url: '/pages/points/Shop' });
  },

  // 导航到每日任务
  goToTasks() {
    wx.navigateTo({ url: '/pages/task/Index' });
  },

  // 导航到优惠券
  goToCoupons() {
    wx.navigateTo({ url: '/pages/coupon/My' });
  },

  // 导航到我的积分
  goToMyPoints() {
    wx.navigateTo({ url: '/pages/points/My' });
  },

  // 导航到装饰商城
  goToDecorationShop() {
    wx.navigateTo({ url: '/pages/decoration/Shop' });
  },

  // 导航到宿舍
  goToDormitory() {
    if (this.data.hasDormitory) {
      wx.navigateTo({ url: '/pages/dormitory/Index' });
    } else {
      wx.navigateTo({ url: '/pages/dormitory/Create' });
    }
  },

  // 导航到心情统计
  goToMoodStats() {
    wx.navigateTo({ url: '/pages/mood/Statistics' });
  },

  // 导航到今日小确幸
  goToSummary() {
    wx.navigateTo({ url: '/pages/summary/Summary' });
  },

  // 导航到哄睡故事
  goToStories() {
    wx.navigateTo({ url: '/pages/stories/Stories' });
  },

  // 导航到放松助眠
  goToRelax() {
    wx.navigateTo({ url: '/pages/relax/Index' });
  },

  // 导航到读给你听
  goToRead() {
    wx.navigateTo({ url: '/pages/read/Index' });
  },

  // 导航到个人中心
  goToProfile() {
    wx.navigateTo({ url: '/pages/profile/Index' });
  }
});
