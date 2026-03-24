/**
 * 云函数初始化工具
 * @description 提供统一的云函数初始化函数，减少重复代码
 */

const cloud = require('wx-server-sdk');

/**
 * 初始化云函数环境
 * @param {boolean} initDb - 是否初始化数据库引用
 * @returns {object} 包含常用对象的上下文 { OPENID, db, _, cloud }
 */
function initCloudFunction(initDb = true) {
  // 初始化云开发环境
  cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
  });

  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;

  const result = {
    OPENID,
    cloud
  };

  if (initDb) {
    result.db = cloud.database();
    result._ = result.db.command;
  }

  return result;
}

/**
 * 标准响应格式
 */
const response = {
  success: (data = {}, message = '操作成功') => ({
    success: true,
    message,
    data
  }),

  error: (message = '操作失败', errorCode = 'ERROR') => ({
    success: false,
    message,
    errorCode
  })
};

/**
 * 异步包装器，用于统一错误处理
 * @param {Function} fn - 云函数主函数
 * @returns {Function} 包装后的函数
 */
function wrapCloudFunction(fn) {
  return async (event, context) => {
    try {
      return await fn(event, context);
    } catch (error) {
      console.error('云函数执行错误:', error);
      return {
        success: false,
        message: error.message || '服务器错误',
        error: error.stack
      };
    }
  };
}

module.exports = {
  initCloudFunction,
  response,
  wrapCloudFunction
};
