/**
 * 我的优惠券页面
 */

Page({
  data: {
    availableCount: 0,
    usedCount: 0,
    expiredCount: 0,
    coupons: []
  },

  onLoad() {
    this.loadCoupons();
  },

  async loadCoupons() {
    const coupons = [
      { id: 1, name: '水晶折扣券', description: '满 100 减 10', discountAmount: 10, minAmount: 100, validUntil: '2024-12-31', status: 'available' },
      { id: 2, name: '无门槛券', description: '无门槛使用', discountAmount: 5, minAmount: 0, validUntil: '2024-06-30', status: 'available' },
      { id: 3, name: '大额券', description: '满 200 减 30', discountAmount: 30, minAmount: 200, validUntil: '2024-01-01', status: 'expired' }
    ];

    this.setData({
      coupons,
      availableCount: coupons.filter(c => c.status === 'available').length,
      usedCount: coupons.filter(c => c.status === 'used').length,
      expiredCount: coupons.filter(c => c.status === 'expired').length
    });
  },

  useCoupon(e) {
    const { id } = e.currentTarget.dataset;
    wx.showToast({ title: '使用成功', icon: 'success' });
  },

  goToShop() {
    wx.navigateTo({ url: '/pages/points/Shop' });
  }
});
