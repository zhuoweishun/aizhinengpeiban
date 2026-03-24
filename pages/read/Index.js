/**
 * 读给你听页面
 */

Page({
  data: {
    contents: [
      { id: 1, icon: '💌', title: '情书读给你听', description: '温暖的情话陪伴你' },
      { id: 2, icon: '📜', title: '诗歌朗诵', description: '优美诗词陶冶心灵' },
      { id: 3, icon: '📚', title: '文章精选', description: '好文分享给你' },
      { id: 4, icon: '🎭', title: '故事会', description: '精彩故事不间断' }
    ]
  },

  playStory(e) {
    const { id } = e.currentTarget.dataset;
    wx.showToast({ title: '开始播放', icon: 'none' });
  }
});
