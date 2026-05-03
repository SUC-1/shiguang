const {
  uploadPhoto,
  getPhotos,
  getPhotoDetail,
  updatePhoto,
  deletePhoto,
  batchUploadPhotos,
  getUserPhotos
} = require('./photoOperations');

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
      case 'upload':
        return await uploadPhoto(params, extendedContext);
      
      case 'getPhotos':
        return await getPhotos(params, extendedContext);
      
      case 'getPhotoDetail':
        return await getPhotoDetail(params, extendedContext);
      
      case 'updatePhoto':
        return await updatePhoto(params, extendedContext);
      
      case 'deletePhoto':
        return await deletePhoto(params, extendedContext);
      
      case 'batchUpload':
        return await batchUploadPhotos(params, extendedContext);
      
      case 'getUserPhotos':
        return await getUserPhotos(params, extendedContext);
      
      default:
        return {
          success: false,
          error: `未知的操作: ${action}`
        };
    }
  } catch (error) {
    console.error('manageActivityPhotos error:', error);
    return {
      success: false,
      error: error.message || '操作失败'
    };
  }
};
