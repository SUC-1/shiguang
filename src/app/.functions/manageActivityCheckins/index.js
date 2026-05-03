const {
  checkin,
  getCheckins,
  getCheckinStats,
  checkCheckin,
  getUserCheckins,
  deleteCheckin
} = require('./checkinOperations');

/**
 * 云函数入口
 * @param {Object} event - 事件对象
 * @param {Object} context - 上下文对象
 * @returns {Promise<Object>}
 */
module.exports = async function (event, context) {
  const { action, params } = event;

  try {
    // 获取当前用户信息
    const userId = context.userId || context.currentUser?.userId;
    if (!userId) {
      return {
        success: false,
        error: '用户未登录'
      };
    }

    // 扩展上下文，添加用户ID
    const extendedContext = {
      ...context,
      userId,
      callDataSource: context.callDataSource || context.app?.callDataSource
    };

    switch (action) {
      case 'checkin':
        return await checkin(params, extendedContext);
      
      case 'getCheckins':
        return await getCheckins(params, extendedContext);
      
      case 'getCheckinStats':
        return await getCheckinStats(params, extendedContext);
      
      case 'checkCheckin':
        return await checkCheckin(params, extendedContext);
      
      case 'getUserCheckins':
        return await getUserCheckins(params, extendedContext);
      
      case 'deleteCheckin':
        return await deleteCheckin(params, extendedContext);
      
      default:
        return {
          success: false,
          error: `未知的操作: ${action}`
        };
    }
  } catch (error) {
    console.error('manageActivityCheckins error:', error);
    return {
      success: false,
      error: error.message || '操作失败'
    };
  }
};
