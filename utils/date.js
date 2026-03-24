/**
 * 日期格式化工具类
 * @description 提供统一的日期格式化功能
 * @author 玄枢
 * @date 2026-03-24
 */

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 格式化时间为 HH:mm 格式
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的时间字符串
 */
function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 获取完整日期时间字符串 (用于显示)
 * @param {Date} date - 日期对象
 * @returns {object} 包含日期和时间的对象
 */
function formatDateTime(date) {
  return {
    date: formatDate(date),
    time: formatTime(date),
    weekday: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
  };
}

/**
 * 获取周数
 * @param {Date} date - 日期对象
 * @returns {number} 周数
 */
function getWeekNumber(date) {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const dayOfWeek = firstDay.getDay();
  const firstWeekDay = dayOfWeek === 0 ? 7 : dayOfWeek;
  return Math.ceil(((date - firstDay) / 86400000 + firstWeekDay) / 7);
}

module.exports = {
  formatDate,
  formatTime,
  formatDateTime,
  getWeekNumber
};
