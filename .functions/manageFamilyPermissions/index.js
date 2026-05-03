const { handlePermissionOperation } = require('./permissionOperations');
const { validatePermissionParams } = require('./validators');

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
    const validation = validatePermissionParams(event, action);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    // 根据操作类型路由到不同的处理函数
    switch (action) {
      case 'create':
        return await handlePermissionOperation('create', { ...event, currentUserOpenId: OPENID });
      
      case 'query':
        return await handlePermissionOperation('query', { ...event, currentUserOpenId: OPENID });
      
      case 'update':
        return await handlePermissionOperation('update', { ...event, currentUserOpenId: OPENID });
      
      case 'delete':
        return await handlePermissionOperation('delete', { ...event, currentUserOpenId: OPENID });
      
      case 'assign':
        return await handlePermissionOperation('assign', { ...event, currentUserOpenId: OPENID });
      
      case 'verify':
        return await handlePermissionOperation('verify', { ...event, currentUserOpenId: OPENID });
      
      default:
        return { success: false, message: '不支持的操作类型' };
    }
  } catch (error) {
    console.error('权限管理错误:', error);
    return { success: false, message: '服务器内部错误', error: error.message };
  }
};