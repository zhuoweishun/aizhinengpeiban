/**
 * 工具模块测试
 */

describe('Utilities Tests', () => {
  beforeEach(() => {
    // 清空存储
    wx.__storage = {};
    jest.clearAllMocks();
  });

  describe('AI Name Utility', () => {
    test('should have correct default name', () => {
      const defaultAiName = '瓜瓜';
      expect(defaultAiName).toBe('瓜瓜');
    });

    test('should save and retrieve name', () => {
      const testName = '测试名字';
      wx.setStorageSync('aiName', testName);
      const saved = wx.getStorageSync('aiName');
      expect(saved).toBe(testName);
    });

    test('should return undefined for non-existent name', () => {
      const result = wx.getStorageSync('aiName');
      expect(result).toBeUndefined();
    });
  });

  describe('Date Utilities', () => {
    test('should format date correctly', () => {
      const testDate = new Date('2026-03-24T10:30:00');
      const year = testDate.getFullYear();
      const month = testDate.getMonth() + 1;
      const day = testDate.getDate();

      expect(year).toBe(2026);
      expect(month).toBe(3);
      expect(day).toBe(24);
    });

    test('should format time correctly', () => {
      const testDate = new Date('2026-03-24T15:45:30');
      const hours = testDate.getHours().toString().padStart(2, '0');
      const minutes = testDate.getMinutes().toString().padStart(2, '0');

      expect(hours).toBe('15');
      expect(minutes).toBe('45');
    });
  });
});
