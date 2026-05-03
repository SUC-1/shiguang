const {
  registerForActivity,
  cancelRegistration,
  getParticipants,
  getParticipantDetail,
  checkRegistration,
  getUserRegistrations
} = require('./participantOperations');

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
      case 'register':
        return await registerForActivity(params, extendedContext);
      
      case 'cancel':
        return await cancelRegistration(params, extendedContext);
      
      case 'getParticipants':
        return await getParticipants(params, extendedContext);
      
      case 'getParticipantDetail':
        return await getParticipantDetail(params, extendedContext);
      
      case 'checkRegistration':
        return await checkRegistration(params, extendedContext);
      
      case 'getUserRegistrations':
        return await getUserRegistrations(params, extendedContext);
      
      default:
        return {
          success: false,
          error: `未知的操作: ${action}`
        };
    }
  } catch (error) {
    console.error('manageActivityParticipants error:', error);
    return {
      success: false,
      error: error.message || '操作失败'
    };
  }
};
