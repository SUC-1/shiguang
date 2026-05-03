const { handleRoleTransitionOperation } = require('./roleTransitionOperations');
const { validateRoleTransitionParams } = require('./validators');

exports.main = async (event, context) => {
  try {
    // 获取微信上下文
    const wxContext = cloud.getWXContext();
    const { OPENID, APPID } = wxContext;
    
    if (!OPENID) {
      return { success: false, message: '用户未登录' };
    }

    const { action } = event;
    
    // 验证参数
    const validation = validateRoleTransitionParams(event, action);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    // 根据操作类型路由到不同的处理函数
    switch (action) {
      case 'apply':
        return await handleRoleTransitionOperation('apply', { ...event, currentUserOpenId: OPENID });
      
      case 'approve':
        return await handleRoleTransitionOperation('approve', { ...event, currentUserOpenId: OPENID });
      
      case 'reject':
        return await handleRoleTransitionOperation('reject', { ...event, currentUserOpenId: OPENID });
      
      case 'cancel':
        return await handleRoleTransitionOperation('cancel', { ...event, currentUserOpenId: OPENID });
      
      case 'query':
        return await handleRoleTransitionOperation('query', { ...event, currentUserOpenId: OPENID });
      
      case 'history':
        return await handleRoleTransitionOperation('history', { ...event, currentUserOpenId: OPENID });
      
      default:
        return { success: false, message: '不支持的操作类型' };
    }
  } catch (error) {
    console.error('角色流转管理错误:', error);
    return { success: false, message: '服务器内部错误', error: error.message };
  }
};