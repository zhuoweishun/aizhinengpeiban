/**
 * AI 命名页面
 * @description 让用户为 AI 助手设置名字
 */

const aiNameUtil = require('../../utils/ai-name.js');

Page({
  data: {
    aiNameInput: '',
    defaultNames: ['瓜瓜', '果果', '糖糖', '豆豆', '团团', '圆圆']
  },

  onLoad() {
    console.log('AI 命名页面加载~');
  },

  // 输入名字
  onInputChange(e) {
    this.setData({
      aiNameInput: e.detail.value
    });
  },

  // 选择默认名字
  selectDefaultName(e) {
    const { name } = e.currentTarget.dataset;
    this.setData({
      aiNameInput: name
    });
  },

  // 保存名字
  saveName() {
    const { aiNameInput } = this.data;

    if (!aiNameInput.trim()) {
      wx.showToast({
        title: '请输入名字',
        icon: 'none'
      });
      return;
    }

    try {
      // 保存 AI 名字
      aiNameUtil.saveName(aiNameInput.trim());

      wx.showToast({
        title: '名字设置成功~',
        icon: 'success'
      });

      // 延迟跳转到首页
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/index/Index'
        });
      }, 1500);
    } catch (error) {
      console.error('保存名字失败:', error);
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      });
    }
  }
});
