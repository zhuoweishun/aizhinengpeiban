/**
 * 我的积分页面
 */

Page({
  data: {
    starlightPoints: 0,
    crystalDiamonds: 0,
    records: []
  },

  onLoad() {
    this.loadPoints();
    this.loadRecords();
  },

  async loadPoints() {
    // 加载用户积分
  },

  async loadRecords() {
    // 加载积分明细
    this.setData({
      records: [
        { id: 1, icon: '📋', title: '完成每日任务', createdAt: '2024-01-01 10:00', amount: 50 },
        { id: 2, icon: '✅', title: '每日签到', createdAt: '2024-01-01 09:00', amount: 10 },
        { id: 3, icon: '🎁', title: '兑换商品', createdAt: '2023-12-31 18:00', amount: -500 }
      ]
    });
  }
});
