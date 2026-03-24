/**
 * 加载状态管理工具类
 * @description 提供统一的加载状态显示和隐藏功能
 * @author 玄枢
 * @date 2026-03-16
 */

let loadingCount = 0; // 加载计数器，防止重复显示

/**
 * 显示加载提示
 * @param {string} title - 加载提示文字
 */
const showLoading = (title = '加载中...') => {
  // 防止重复显示
  if (loadingCount > 0) {
    loadingCount++;
    return;
  }

  loadingCount = 1;
  wx.showLoading({
    title: title,
    mask: true // 添加遮罩，防止用户重复操作
  });
};

/**
 * 隐藏加载提示
 */
const hideLoading = () => {
  if (loadingCount > 0) {
    loadingCount--;
    if (loadingCount === 0) {
      wx.hideLoading();
    }
  }
};

/**
 * 强制隐藏加载提示（重置计数器）
 */
const forceHideLoading = () => {
  loadingCount = 0;
  wx.hideLoading();
};

/**
 * 显示提示消息后自动关闭
 * @param {string} title - 提示文字
 * @param {number} duration - 显示时长（毫秒）
 */
const showMessage = (title, duration = 1500) => {
  wx.showToast({
    title: title,
    icon: 'none',
    duration: duration
  });
};

/**
 * 显示成功消息
 * @param {string} title - 成功提示文字
 */
const showSuccessMessage = (title) => {
  wx.showToast({
    title: title,
    icon: 'success',
    duration: 1500
  });
};

/**
 * 显示错误消息
 * @param {string} title - 错误提示文字
 */
const showErrorMessage = (title) => {
  wx.showToast({
    title: title,
    icon: 'none',
    duration: 2000
  });
};

/**
 * 轻触反馈
 * @description 提供轻微的震动反馈，增强交互体验
 */
const triggerLightVibrate = () => {
  try {
    wx.vibrateShort({
      type: 'light',
      success: () => {},
      fail: () => {}
    });
  } catch (error) {
    console.error('震动反馈失败:', error);
  }
};

/**
 * 中度触反馈
 * @description 提供中度的震动反馈
 */
const triggerMediumVibrate = () => {
  try {
    wx.vibrateShort({
      type: 'medium',
      success: () => {},
      fail: () => {}
    });
  } catch (error) {
    console.error('震动反馈失败:', error);
  }
};

/**
 * 重触反馈
 * @description 提供强烈的震动反馈
 */
const triggerHeavyVibrate = () => {
  try {
    wx.vibrateShort({
      type: 'heavy',
      success: () => {},
      fail: () => {}
    });
  } catch (error) {
    console.error('震动反馈失败:', error);
  }
};

module.exports = {
  showLoading,
  hideLoading,
  forceHideLoading,
  showMessage,
  showSuccessMessage,
  showErrorMessage,
  triggerLightVibrate,
  triggerMediumVibrate,
  triggerHeavyVibrate
};
