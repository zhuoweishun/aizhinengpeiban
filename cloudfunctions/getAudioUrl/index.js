// 云函数：获取临时文件 URL
// 用途：获取云存储文件的临时访问链接
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

/**
 * 获取临时文件 URL 云函数
 * @param {Array} event.fileList - 文件 ID 列表
 * @returns {Object} 包含临时 URL 的文件列表
 */
exports.main = async (event, context) => {
  const { fileList } = event;

  if (!fileList || !Array.isArray(fileList)) {
    return {
      success: false,
      message: '文件列表不能为空'
    };
  }

  try {
    const result = await cloud.getTempFileURL({ fileList });
    return {
      success: true,
      fileList: result.fileList
    };
  } catch (err) {
    console.error('获取临时文件 URL 失败:', err);
    return {
      success: false,
      message: '获取文件链接失败',
      error: err.message
    };
  }
};