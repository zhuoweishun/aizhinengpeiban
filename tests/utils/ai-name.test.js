/**
 * AI 名字工具测试
 */

describe('AI Name Utility Tests', () => {
  beforeEach(() => {
    wx.clearStorageSync();
    jest.resetModules();
  });

  test('should return default name when no name saved', () => {
    const aiNameUtil = require('../../utils/ai-name.js');
    const name = aiNameUtil.getName();

    expect(name).toBe('瓜瓜');
  });

  test('should save and retrieve name', () => {
    const aiNameUtil = require('../../utils/ai-name.js');

    const result = aiNameUtil.setName('小可爱');
    expect(result).toBe(true);

    const savedName = aiNameUtil.getName();
    expect(savedName).toBe('小可爱');
  });

  test('should reject name that is too short', () => {
    const aiNameUtil = require('../../utils/ai-name.js');

    const result = aiNameUtil.setName('阿');
    expect(result).toBe(false);
  });

  test('should reject name that is too long', () => {
    const aiNameUtil = require('../../utils/ai-name.js');

    const result = aiNameUtil.setName('非常可爱的名字');
    expect(result).toBe(false);
  });

  test('should reject empty name', () => {
    const aiNameUtil = require('../../utils/ai-name.js');

    const result = aiNameUtil.setName('');
    expect(result).toBe(false);
  });

  test('should trim whitespace from name', () => {
    const aiNameUtil = require('../../utils/ai-name.js');

    const result = aiNameUtil.setName('  瓜瓜  ');
    expect(result).toBe(true);

    const savedName = aiNameUtil.getName();
    expect(savedName).toBe('瓜瓜');
  });

  test('should reset name to default', () => {
    const aiNameUtil = require('../../utils/ai-name.js');

    aiNameUtil.setName('测试名字');
    expect(aiNameUtil.hasName()).toBe(true);

    const resetResult = aiNameUtil.resetName();
    expect(resetResult).toBe(true);

    expect(aiNameUtil.hasName()).toBe(false);
    expect(aiNameUtil.getName()).toBe('瓜瓜');
  });

  test('should check if name is set', () => {
    const aiNameUtil = require('../../utils/ai-name.js');

    expect(aiNameUtil.hasName()).toBe(false);

    aiNameUtil.setName('测试');
    expect(aiNameUtil.hasName()).toBe(true);
  });

  test('should have correct default name constant', () => {
    const aiNameUtil = require('../../utils/ai-name.js');
    expect(aiNameUtil.DEFAULT_AI_NAME).toBe('瓜瓜');
  });
});
