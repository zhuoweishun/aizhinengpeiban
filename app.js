/**
 * 瓜瓜陪伴微信小程序 - 主入口文件
 *
 * @author 玄枢
 * @date 2026-03-15
 * @description 小程序全局配置和生命周期管理
 */

// 引入 AI 名字管理工具
const aiNameUtil = require('./utils/ai-name.js');

App({
  /**
   * 全局数据
   */
  globalData: {
    userInfo: null,           // 用户信息
    themeColor: '#FF6B81',    // 主题色（温暖粉色）
    apiBase: '',              // API 基础地址（暂空，不使用付费 API）
    hasLogin: false,          // 登录状态
    aiName: '瓜瓜'            // AI 名字（默认值）
  },

  /**
   * 小程序启动时执行
   */
  onLaunch() {
    console.log('瓜瓜陪伴小程序启动啦~ 🐾');

    // 初始化云开发环境
    wx.cloud.init({
      env: 'cloud1-0ga8zde717e08345',
      traceUser: true
    });
    console.log('云开发已初始化 ☁️');

    // 检查 AI 名字（首次启动检测）
    this.checkAiName();

    // 检查登录状态
    this.checkLoginStatus();

    // 初始化本地存储数据
    this.initLocalStorage();
  },

  /**
   * 检查 AI 名字设置（首次启动检测）
   * @description 如果没有设置名字，跳转到命名页面
   */
  checkAiName() {
    const hasName = aiNameUtil.hasName();

    if (!hasName) {
      console.log('首次启动，跳转到命名页面~');
      // 重定向到命名页面
      wx.reLaunch({
        url: '/pages/naming/index'
      });
    } else {
      // 读取已保存的名字
      const name = aiNameUtil.getName();
      this.globalData.aiName = name;
      console.log('AI 名字已设置:', name);
    }
  },

  /**
   * 检查用户登录状态
   */
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.hasLogin = true;
    }
  },

  /**
   * 初始化本地存储数据
   * 用于存储聊天记录、心情日记等
   */
  initLocalStorage() {
    // 初始化聊天记录存储
    if (!wx.getStorageSync('chatHistory')) {
      wx.setStorageSync('chatHistory', []);
    }

    // 初始化心情记录存储
    if (!wx.getStorageSync('moodRecords')) {
      wx.setStorageSync('moodRecords', []);
    }

    // 初始化成就记录存储
    if (!wx.getStorageSync('achievements')) {
      wx.setStorageSync('achievements', []);
    }
  }
});
