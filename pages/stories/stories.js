/**
 * 哄睡故事页面
 */

Page({
  data: {
    stories: [
      { id: 1, icon: '🌙', title: '月亮的光芒', description: '温柔的月光照耀着你入睡', duration: 15, playCount: 1234 },
      { id: 2, icon: '⭐', title: '小星星的梦', description: '在星空下进入甜美的梦乡', duration: 12, playCount: 987 },
      { id: 3, icon: '🌸', title: '春天的花园', description: '漫步在充满花香的花园中', duration: 18, playCount: 765 },
      { id: 4, icon: '🦋', title: '蝴蝶的愿望', description: '跟随蝴蝶飞向梦想的彼岸', duration: 20, playCount: 654 },
      { id: 5, icon: '🫧', title: '泡泡的旅行', description: '乘着泡泡去远方旅行', duration: 14, playCount: 543 }
    ]
  },

  onLoad() {
    // 加载故事列表
  },

  // 播放故事
  playStory(e) {
    const { id } = e.currentTarget.dataset;
    wx.showToast({
      title: '开始播放故事',
      icon: 'none'
    });
    // TODO: 实现音频播放
  }
});
