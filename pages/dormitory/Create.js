/**
 * 创建宿舍页面
 */

const app = getApp();

Page({
  data: {
    dormitoryName: '',
    roomId: '',
    description: '',
    selectedStyle: 0,
    styles: [
      { name: '温馨', icon: '🏠' },
      { name: '可爱', icon: '🎀' },
      { name: '简约', icon: '🤍' },
      { name: '清新', icon: '🌿' },
      { name: '梦幻', icon: '🌸' },
      { name: '复古', icon: '🕰️' }
    ]
  },

  // 输入宿舍名称
  onNameInput(e) {
    this.setData({ dormitoryName: e.detail.value });
  },

  // 输入房间号
  onRoomInput(e) {
    this.setData({ roomId: e.detail.value });
  },

  // 输入简介
  onDescInput(e) {
    this.setData({ description: e.detail.value });
  },

  // 选择风格
  selectStyle(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ selectedStyle: index });
  },

  // 创建宿舍
  async createDormitory() {
    const { dormitoryName, roomId, description, selectedStyle } = this.data;

    // 验证输入
    if (!dormitoryName.trim()) {
      wx.showToast({ title: '请输入宿舍名称', icon: 'none' });
      return;
    }

    if (!roomId.trim()) {
      wx.showToast({ title: '请输入房间号', icon: 'none' });
      return;
    }

    try {
      wx.showLoading({ title: '创建中...' });

      const styles = ['温馨', '可爱', '简约', '清新', '梦幻', '复古'];

      const result = await wx.cloud.callFunction({
        name: 'dormitory',
        data: {
          action: 'create',
          data: {
            name: dormitoryName.trim(),
            roomId: roomId.trim(),
            description: description.trim(),
            style: styles[selectedStyle]
          }
        }
      });

      if (result.result && result.result.success) {
        wx.showToast({
          title: '创建成功',
          icon: 'success'
        });

        // 跳转到宿舍页面
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(result.result?.message || '创建失败');
      }

      wx.hideLoading();
    } catch (error) {
      console.error('创建宿舍失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: error.message || '创建失败',
        icon: 'none'
      });
    }
  }
});
