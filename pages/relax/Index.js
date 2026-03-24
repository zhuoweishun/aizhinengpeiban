/**
 * 放松助眠页面
 */

Page({
  // 导航到深呼吸练习
  goToBreath() {
    wx.navigateTo({ url: '/pages/relax/Breath' });
  },

  // 导航到身体扫描
  goToBodyScan() {
    wx.navigateTo({ url: '/pages/relax/BodyScan' });
  },

  // 导航到想象疗法
  goToImagination() {
    wx.navigateTo({ url: '/pages/relax/Imagination' });
  },

  // 导航到快速放松
  goToQuickRelax() {
    wx.navigateTo({ url: '/pages/relax/Quick' });
  },

  // 导航到哄睡故事
  goToStories() {
    wx.navigateTo({ url: '/pages/stories/Stories' });
  },

  // 导航到白噪音
  goToWhiteNoise() {
    wx.navigateTo({ url: '/pages/relax/WhiteNoise' });
  }
});
