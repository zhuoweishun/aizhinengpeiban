/**
 * 积分商城页面
 */

Page({
  data: {
    starlightPoints: 0,
    crystalDiamonds: 0,
    products: [
      { id: 1, icon: '🎫', name: '水晶折扣券', description: '满 100 减 10', price: 500 },
      { id: 2, icon: '🎁', name: '神秘礼物', description: '随机装饰品', price: 300 },
      { id: 3, icon: '👑', name: 'VIP 体验卡', description: '7 天会员体验', price: 1000 },
      { id: 4, icon: '🎨', name: '限定装饰品', description: '稀有装饰物品', price: 800 }
    ]
  },

  onLoad() {
    this.loadUserPoints();
  },

  async loadUserPoints() {
    // 加载用户积分
  },

  exchange(e) {
    const { id } = e.currentTarget.dataset;
    wx.showToast({ title: '兑换成功', icon: 'success' });
  }
});
