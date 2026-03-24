/**
 * 宿舍称呼管理工具
 * @description 自动分配和管理舍友称呼
 * @author 墨衡
 * @date 2026-03-16
 */

/**
 * 自动分配称呼
 * @param {number} order - 加入顺序（从 1 开始）
 * @returns {string} 称呼
 */
function autoAssignTitle(order) {
  const titleMap = {
    1: '大当家',
    2: '二当家',
    3: '三当家',
    4: '四当家',
    5: '五当家',
    6: '六当家',
    7: '七当家',
    8: '八当家',
    9: '九当家',
    10: '十当家'
  };
  
  if (titleMap[order]) {
    return titleMap[order];
  }
  
  // 超过 10 人，按数字排序
  return `第${order}舍友`;
}

/**
 * 获取称呼列表
 * @param {number} capacity - 宿舍容量
 * @returns {Array} 称呼列表
 */
function getTitleList(capacity = 6) {
  const titles = [];
  for (let i = 1; i <= Math.min(capacity, 10); i++) {
    titles.push({
      order: i,
      title: autoAssignTitle(i)
    });
  }
  return titles;
}

/**
 * 验证自定义称呼
 * @param {string} customTitle - 自定义称呼
 * @returns {Object} 验证结果
 */
function validateCustomTitle(customTitle) {
  if (!customTitle || customTitle.trim() === '') {
    return {
      valid: true,
      message: ''
    };
  }
  
  const trimmed = customTitle.trim();
  
  if (trimmed.length > 10) {
    return {
      valid: false,
      message: '称呼不能超过 10 个字'
    };
  }
  
  // 检查是否包含不当内容（简化版）
  const forbiddenWords = ['管理员', '系统', '官方'];
  for (const word of forbiddenWords) {
    if (trimmed.includes(word)) {
      return {
        valid: false,
        message: '称呼包含不当内容'
      };
    }
  }
  
  return {
    valid: true,
    message: ''
  };
}

/**
 * 计算宿舍等级
 * @param {number} exp - 经验值
 * @returns {number} 等级
 */
function calculateLevel(exp) {
  // 简单等级计算：每 100 经验升一级
  return Math.floor(exp / 100) + 1;
}

/**
 * 计算升级所需经验
 * @param {number} level - 当前等级
 * @returns {number} 所需经验
 */
function getExpForLevel(level) {
  return level * 100;
}

/**
 * 获取纪念日里程碑
 * @param {number} days - 天数
 * @returns {Object} 里程碑信息
 */
function getAnniversaryMilestone(days) {
  const milestones = {
    0: { key: 'today', message: '今天是宿舍成立日！🎉', icon: '🎉' },
    1: { key: 'day1', message: '宿舍成立 1 天啦！', icon: '🌱' },
    7: { key: 'week', message: '宿舍成立 7 天啦！🎊', icon: '🎊' },
    14: { key: 'half_month', message: '宿舍成立 2 周啦！', icon: '🌟' },
    30: { key: 'month', message: '宿舍成立满月啦！🌙', icon: '🌙' },
    60: { key: 'two_months', message: '宿舍成立 2 个月啦！', icon: '💫' },
    100: { key: 'hundred', message: '宿舍成立 100 天！💯', icon: '💯' },
    365: { key: 'year', message: '宿舍成立一周年！🎂', icon: '🎂' }
  };
  
  // 查找最近的里程碑
  const milestoneDays = Object.keys(milestones).map(Number).sort((a, b) => b - a);
  
  for (const milestoneDay of milestoneDays) {
    if (days >= milestoneDay) {
      return {
        ...milestones[milestoneDay],
        days: days
      };
    }
  }
  
  return {
    days: days,
    message: `已相伴 ${days} 天`,
    icon: '💕'
  };
}

/**
 * 获取本周开始时间（周一）
 * @param {number} timestamp - 时间戳
 * @returns {number} 本周一开始时间戳
 */
function getWeekStart(timestamp) {
  const date = new Date(timestamp);
  const day = date.getDay(); // 0 = 周日，1 = 周一...
  const diff = day === 0 ? -6 : (1 - day); // 调整到周一
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

module.exports = {
  autoAssignTitle,
  getTitleList,
  validateCustomTitle,
  calculateLevel,
  getExpForLevel,
  getAnniversaryMilestone,
  getWeekStart
};
