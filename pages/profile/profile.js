/**
 * 个人中心页面
 */

const app = getApp();

Page({
  data: {
    userInfo: {
      nickName: '',
      avatar: '',
      level: 1,
      starlightPoints: 0,
      crystalDiamonds: 0
    }
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      const userInfo = app.globalData.userInfo || {
        nickName: '未设置昵称',
        avatar: '',
        level: 1,
        starlightPoints: 0,
        crystalDiamonds: 0
      };

      this.setData({ userInfo });
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  },

  // 导航到我的任务
  goToMyTasks() {
    wx.navigateTo({ url: '/pages/task/Index' });
  },

  // 导航到我的优惠券
  goToMyCoupons() {
    wx.navigateTo({ url: '/pages/coupon/My' });
  },

  // 导航到我的装饰
  goToMyDecorations() {
    wx.navigateTo({ url: '/pages/decoration/My' });
  },

  // 导航到设置
  goToSettings() {
    wx.navigateTo({ url: '/pages/settings/Index' });
  },

  // 导航关于我们
  goToAbout() {
    wx.navigateTo({ url: '/pages/about/Index' });
  },

  // 导航到意见反馈
  goToFeedback() {
    wx.navigateTo({ url: '/pages/feedback/Index' });
  }
});
