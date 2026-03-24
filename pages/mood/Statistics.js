/**
 * 心情统计页面
 * @description 展示心情变化趋势和统计数据
 */

const app = getApp();
const dateUtil = require('../../utils/date.js');

// 心情配置
const MOOD_CONFIG = {
  happy: { icon: '😊', label: '开心', color: '#FFD93D' },
  normal: { icon: '😐', label: '平静', color: '#6BCB77' },
  sad: { icon: '😢', label: '难过', color: '#4D96FF' },
  tired: { icon: '😫', label: '疲惫', color: '#9D9D9D' },
  anxious: { icon: '😰', label: '焦虑', color: '#FF6B6B' }
};

Page({
  data: {
    records: [],
    weekDays: [],
    moodStats: [],
    recentRecords: [],
    currentMoodIcon: '😊',
    currentMoodText: '暂无数据',
    weekLabel: ''
  },

  onLoad() {
    this.loadMoodRecords();
  },

  onShow() {
    // 每次页面显示时刷新数据
    this.loadMoodRecords();
  },

  // 加载心情记录
  loadMoodRecords() {
    try {
      const records = wx.getStorageSync('moodRecords') || [];
      console.log('加载的心情记录:', records.length, '条');

      this.setData({ records });

      if (records.length === 0) {
        this.setData({
          currentMoodIcon: '📝',
          currentMoodText: '开始记录第一天的好心情吧~'
        });
        return;
      }

      // 计算统计数据
      this.calculateWeekDays(records);
      this.calculateMoodStats(records);
      this.calculateRecentRecords(records);
      this.updateCurrentMood(records);
    } catch (error) {
      console.error('加载心情记录失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 计算本周心情
  calculateWeekDays(records) {
    const today = new Date();
    const weekDays = [];
    const moodMap = {};

    // 将记录按日期映射
    records.forEach(record => {
      const dateStr = record.date;
      if (!moodMap[dateStr]) {
        moodMap[dateStr] = record;
      }
    });

    // 生成最近 7 天
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const dateStr = dateUtil.formatDate(date);
      const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
      const record = moodMap[dateStr];

      weekDays.push({
        date: dateStr,
        day: weekday,
        mood: record ? record.label.split(' ')[0] : '—',
        moodValue: record ? record.mood : null
      });
    }

    this.setData({ weekDays });
  },

  // 计算心情统计
  calculateMoodStats(records) {
    const stats = {
      happy: 0,
      normal: 0,
      sad: 0,
      tired: 0,
      anxious: 0
    };

    records.forEach(record => {
      if (stats[record.mood] !== undefined) {
        stats[record.mood]++;
      }
    });

    const total = records.length || 1;
    const moodStats = Object.keys(stats).map(type => ({
      type,
      icon: MOOD_CONFIG[type].icon,
      label: MOOD_CONFIG[type].label,
      count: stats[type],
      percent: Math.round((stats[type] / total) * 100)
    }));

    this.setData({ moodStats });
  },

  // 获取最近记录
  calculateRecentRecords(records) {
    const recent = records.slice(0, 10).map(record => ({
      ...record,
      icon: MOOD_CONFIG[record.mood]?.icon || '😐'
    }));

    this.setData({ recentRecords: recent });
  },

  // 更新当前心情
  updateCurrentMood(records) {
    // 获取今天的心情
    const today = dateUtil.formatDate(new Date());
    const todayRecord = records.find(r => r.date === today);

    if (todayRecord) {
      const config = MOOD_CONFIG[todayRecord.mood];
      this.setData({
        currentMoodIcon: config.icon,
        currentMoodText: config.label
      });
    } else {
      // 使用最近一条记录
      const recentRecord = records[0];
      if (recentRecord) {
        const config = MOOD_CONFIG[recentRecord.mood];
        this.setData({
          currentMoodIcon: config.icon,
          currentMoodText: `最近心情：${config.label}`
        });
      }
    }

    // 设置周标签
    const weekNum = dateUtil.getWeekNumber(new Date());
    this.setData({
      weekLabel: `第${weekNum}周`
    });
  }
});
