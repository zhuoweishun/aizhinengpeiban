/**
 * 任务页面
 */

const app = getApp();

Page({
  data: {
    userPoints: {
      starlight: 0,
      crystal: 0
    },
    dailyTasks: [],
    weeklyTasks: [],
    dormitoryTasks: []
  },

  onLoad() {
    this.loadTasks();
  },

  onShow() {
    this.loadTasks();
  },

  // 加载任务列表
  async loadTasks() {
    try {
      wx.showLoading({ title: '加载中...' });

      const result = await wx.cloud.callFunction({
        name: 'task',
        data: {
          action: 'getDaily'
        }
      });

      if (result.result && result.result.success) {
        this.setData({
          userPoints: result.result.userPoints,
          dailyTasks: result.result.dailyTasks || [],
          weeklyTasks: result.result.weeklyTasks || [],
          dormitoryTasks: result.result.dormitoryTasks || []
        });
      }

      wx.hideLoading();
    } catch (error) {
      console.error('加载任务失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 领取奖励
  async claimReward(e) {
    try {
      const { index } = e.currentTarget.dataset;

      wx.showLoading({ title: '领取中...' });

      const result = await wx.cloud.callFunction({
        name: 'task',
        data: {
          action: 'claimReward',
          data: {
            taskType: 'daily',
            category: index
          }
        }
      });

      if (result.result && result.result.success) {
        wx.showToast({
          title: '领取成功',
          icon: 'success'
        });

        // 刷新任务列表
        this.loadTasks();
      } else {
        throw new Error(result.result?.message || '领取失败');
      }

      wx.hideLoading();
    } catch (error) {
      console.error('领取奖励失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: error.message || '领取失败',
        icon: 'none'
      });
    }
  }
});
