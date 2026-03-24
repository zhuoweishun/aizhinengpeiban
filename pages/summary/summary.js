/**
 * 今日小确幸页面
 */

Page({
  data: {
    content: '',
    selectedMood: 2,
    moods: [
      { value: 'excited', emoji: '🤩', label: '兴奋' },
      { value: 'happy', emoji: '😊', label: '开心' },
      { value: 'normal', emoji: '😐', label: '平静' },
      { value: 'tired', emoji: '😫', label: '疲惫' },
      { value: 'sad', emoji: '😢', label: '难过' }
    ],
    history: []
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  selectMood(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ selectedMood: index });
  },

  submitHappiness() {
    const { content, selectedMood, moods } = this.data;

    if (!content.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    wx.showToast({
      title: '记录成功',
      icon: 'success'
    });

    this.setData({ content: '' });
  }
});
