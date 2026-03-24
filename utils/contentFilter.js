/**
 * 内容过滤器工具
 * @description 检查内容是否包含敏感词，确保内容安全
 * @author 玄枢
 * @date 2026-03-15
 *
 * @note 当前为简化版本，仅包含基础检查功能
 *       生产环境建议接入第三方内容安全 API（如微信内容安全接口）
 */

/**
 * 检查内容是否包含敏感词
 * @param {string} content 待检查的内容
 * @returns {Object} { passed: boolean, message: string }
 *
 * @note 当前实现仅检查基础内容，未包含完整敏感词库
 *       建议在生产环境接入微信内容安全接口 (security.msgSecCheck)
 */
function checkContent(content) {
  if (!content || typeof content !== 'string') {
    return {
      passed: false,
      message: '内容不能为空'
    };
  }

  // 检查特殊字符（过多的表情符号或特殊符号）
  const specialCharCount = (content.match(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g) || []).length;
  if (specialCharCount > content.length * 0.5) {
    return {
      passed: false,
      message: '内容包含过多特殊字符'
    };
  }

  // 检查长度
  if (content.length > 1000) {
    return {
      passed: false,
      message: '内容长度超过限制'
    };
  }

  // 通过检查
  return {
    passed: true,
    message: '内容合规'
  };
}

/**
 * 清理内容（去除首尾空格和多余空白）
 * @param {string} content 原始内容
 * @returns {string} 清理后的内容
 */
function cleanContent(content) {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // 去除首尾空格
  let cleaned = content.trim();

  // 将多个连续空白字符替换为单个空格
  cleaned = cleaned.replace(/\s+/g, ' ');

  return cleaned;
}

module.exports = {
  checkContent,
  cleanContent
};
