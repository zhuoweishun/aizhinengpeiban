/**
 * 装饰商城页面
 */

const app = getApp();

Page({
  data: {
    items: [],
    userPoints: {
      starlight: 0,
      crystal: 0
    },
    currentCategory: 'all',
    totalItems: 0
  },

  onLoad() {
    this.loadShopItems();
  },

  // 加载商城物品
  async loadShopItems() {
    try {
      wx.showLoading({ title: '加载中...' });

      const result = await wx.cloud.callFunction({
        name: 'decoration',
        data: {
          action: 'getShop',
          data: {
            type: this.data.currentCategory === 'all' ? null : this.data.currentCategory
          }
        }
      });

      if (result.result && result.result.success) {
        this.setData({
          items: result.result.items || [],
          userPoints: result.result.userPoints,
          totalItems: result.result.totalItems || 0
        });
      }

      wx.hideLoading();
    } catch (error) {
      console.error('加载商城失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 选择分类
  selectCategory(e) {
    const { category } = e.currentTarget.dataset;
    this.setData({ currentCategory: category });
    this.loadShopItems();
  },

  // 购买物品
  async buyItem(e) {
    try {
      const { index } = e.currentTarget.dataset;
      const item = this.data.items[index];

      wx.showModal({
        title: '确认购买',
        content: `确定要购买 ${item.name} 吗？`,
        success: async (res) => {
          if (res.confirm) {
            await this.confirmBuy(item);
          }
        }
      });
    } catch (error) {
      console.error('购买失败:', error);
    }
  },

  // 确认购买
  async confirmBuy(item) {
    try {
      wx.showLoading({ title: '购买中...' });

      const result = await wx.cloud.callFunction({
        name: 'decoration',
        data: {
          action: 'buyItem',
          data: {
            itemId: item.itemId,
            currency: item.currency
          }
        }
      });

      if (result.result && result.result.success) {
        wx.showToast({
          title: '购买成功',
          icon: 'success'
        });

        // 刷新商城
        this.loadShopItems();
      } else {
        throw new Error(result.result?.message || '购买失败');
      }

      wx.hideLoading();
    } catch (error) {
      console.error('购买失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: error.message || '购买失败',
        icon: 'none'
      });
    }
  }
});
