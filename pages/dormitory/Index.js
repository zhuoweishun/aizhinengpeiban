/**
 * 宿舍页面
 */

const app = getApp();

Page({
  data: {
    dormitoryId: '',
    dormitory: null,
    allMembers: [],
    emptySlots: [],
    recentPosts: [],
    todayTasks: [],
    memberInfo: null
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ dormitoryId: options.id });
      this.loadDormitoryData();
    } else {
      this.loadUserDormitory();
    }
  },

  onShow() {
    if (this.data.dormitoryId) {
      this.loadDormitoryData();
    }
  },

  // 查询用户所在的宿舍
  async loadUserDormitory() {
    try {
      wx.showLoading({ title: '查询中...' });

      const result = await wx.cloud.callFunction({
        name: 'dormitory',
        data: {
          action: 'getHome'
        }
      });

      if (result.result && result.result.success) {
        if (result.result.dormitoryId) {
          this.setData({ dormitoryId: result.result.dormitoryId });
          this.loadDormitoryData();
        }
      }

      wx.hideLoading();
    } catch (error) {
      console.error('查询宿舍失败:', error);
      wx.hideLoading();
    }
  },

  // 加载宿舍数据
  async loadDormitoryData() {
    try {
      wx.showLoading({ title: '加载中...' });

      const result = await wx.cloud.callFunction({
        name: 'dormitory',
        data: {
          action: 'getHome',
          data: {
            dormitoryId: this.data.dormitoryId
          }
        }
      });

      if (result.result && result.result.success) {
        const { dormitory, memberInfo, allMembers, recentPosts, todayTasks } = result.result;

        // 计算空位数
        const emptyCount = 6 - (allMembers?.length || 0);
        const emptySlots = Array(Math.max(0, emptyCount)).fill(0);

        this.setData({
          dormitory,
          memberInfo: memberInfo || null,
          allMembers: allMembers || [],
          recentPosts: recentPosts || [],
          todayTasks: todayTasks || [],
          emptySlots
        });
      }

      wx.hideLoading();
    } catch (error) {
      console.error('加载宿舍数据失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 查看舍友详情
  viewMember(e) {
    const { member } = e.currentTarget.dataset;
    wx.showToast({
      title: `${member.customTitle || member.name} 的主页`,
      icon: 'none'
    });
  },

  // 设置心情
  setMood() {
    const moodOptions = [
      { value: 'happy', emoji: '😊', label: '开心' },
      { value: 'normal', emoji: '😐', label: '一般' },
      { value: 'sad', emoji: '😔', label: '难过' },
      { value: 'sleepy', emoji: '🌙', label: '困了' },
      { value: 'excited', emoji: '🤩', label: '兴奋' },
      { value: 'tired', emoji: '😫', label: '累了' }
    ];

    wx.showActionSheet({
      itemList: moodOptions.map(m => m.label),
      success: async (res) => {
        const selected = moodOptions[res.tapIndex];
        await this.updateMood(selected.value, selected.emoji);
      }
    });
  },

  // 更新心情
  async updateMood(mood, moodEmoji) {
    try {
      wx.showLoading({ title: '设置中...' });

      const result = await wx.cloud.callFunction({
        name: 'dormitory',
        data: {
          action: 'updateMood',
          data: {
            memberId: this.data.memberInfo._id,
            mood,
            moodEmoji
          }
        }
      });

      if (result.result && result.result.success) {
        wx.showToast({
          title: '心情已更新',
          icon: 'success'
        });

        this.loadDormitoryData();
      }

      wx.hideLoading();
    } catch (error) {
      console.error('更新心情失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      });
    }
  },

  // 完成任务
  async completeTask(e) {
    try {
      const { taskId } = e.currentTarget.dataset;

      wx.showLoading({ title: '提交中...' });

      const result = await wx.cloud.callFunction({
        name: 'dormitory',
        data: {
          action: 'completeTask',
          data: {
            dormitoryId: this.data.dormitoryId,
            taskId
          }
        }
      });

      if (result.result && result.result.success) {
        wx.showToast({
          title: '任务完成',
          icon: 'success'
        });

        this.loadDormitoryData();
      }

      wx.hideLoading();
    } catch (error) {
      console.error('完成任务失败:', error);
      wx.hideLoading();
    }
  },

  // 导航
  goToCreate() {
    wx.navigateTo({ url: '/pages/dormitory/Create' });
  },

  goToInvite() {
    wx.navigateTo({ url: '/pages/dormitory/Invite' });
  },

  goToSpace() {
    wx.navigateTo({ url: '/pages/dormitory/Space' });
  },

  goToGoodnight() {
    wx.navigateTo({ url: '/pages/dormitory/Goodnight' });
  },

  goToDormitoryRoom() {
    wx.navigateTo({ url: '/pages/dormitory/Room' });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadDormitoryData().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});
