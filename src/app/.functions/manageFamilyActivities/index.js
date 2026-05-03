const {
  createActivity,
  updateActivity,
  deleteActivity,
  getActivity,
  listActivities,
  updateActivityStatus
} = require('./activityOperations');

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
      case 'create':
        return await createActivity(params, extendedContext);
      
      case 'update':
        return await updateActivity(params, extendedContext);
      
      case 'delete':
        return await deleteActivity(params, extendedContext);
      
      case 'get':
        return await getActivity(params, extendedContext);
      
      case 'list':
        return await listActivities(params, extendedContext);
      
      case 'updateStatus':
        return await updateActivityStatus(params, extendedContext);
      
      default:
        return {
          success: false,
          error: `未知的操作: ${action}`
        };
    }
  } catch (error) {
    console.error('manageFamilyActivities error:', error);
    return {
      success: false,
      error: error.message || '操作失败'
    };
  }
};
