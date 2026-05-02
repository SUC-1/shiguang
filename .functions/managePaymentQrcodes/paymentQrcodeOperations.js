// 付款二维码操作模块

const tcb = require('@cloudbase/node-sdk');

/**
 * 初始化 CloudBase SDK
 */
function initCloudBase() {
  const app = tcb.init({
    // 使用当前云函数所在环境
  });
  return app;
}

/**
 * 创建付款二维码
 * @param {object} qrcodeData - 收款码数据
 * @returns {object} 创建的收款码信息
 */
async function createQrcode(qrcodeData) {
  const app = initCloudBase();
  try {
    const collection = app.database().collection('payment_qrcodes');
    const now = new Date().toISOString();

    const newQrcode = {
      qrCode: qrcodeData.qrCode,
      isActive: qrcodeData.isActive !== undefined ? qrcodeData.isActive : true,
      description: qrcodeData.description || '',
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.add(newQrcode);
    return {
      _id: result.id || result._id,
      ...newQrcode
    };
  } catch (error) {
    console.error('创建付款二维码失败:', error);
    throw new Error('创建付款二维码失败');
  }
}

/**
 * 查询付款二维码列表
 * @param {object} queryParams - 查询参数
 * @returns {object} 分页结果
 */
async function queryQrcodes(queryParams) {
  const app = initCloudBase();
  try {
    const collection = app.database().collection('payment_qrcodes');
    const { queryType, page, pageSize } = queryParams;

    // 构建查询条件
    let query = {};
    switch (queryType) {
      case 'byIsActive':
        query.isActive = queryParams.isActive;
        break;
      case 'all':
      default:
        break;
    }

    // 获取总数
    const countResult = await collection.where(query).count();
    const total = countResult.total || 0;

    // 分页查询，按创建时间倒序
    const skip = (page - 1) * pageSize;
    const result = await collection
      .where(query)
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get();

    return {
      qrcodes: result.data || [],
      total,
      page,
      pageSize,
      hasMore: skip + pageSize < total
    };
  } catch (error) {
    console.error('查询付款二维码失败:', error);
    throw new Error('查询付款二维码失败');
  }
}

/**
 * 根据 ID 查找付款二维码
 * @param {string} qrcodeId - 收款码 ID
 * @returns {object|null} 收款码信息或 null
 */
async function findQrcodeById(qrcodeId) {
  const app = initCloudBase();
  try {
    const collection = app.database().collection('payment_qrcodes');
    const result = await collection.doc(qrcodeId).get();
    return result.data || null;
  } catch (error) {
    console.error('查询付款二维码失败:', error);
    return null;
  }
}

/**
 * 更新付款二维码
 * @param {string} qrcodeId - 收款码 ID
 * @param {object} updateData - 更新数据
 * @returns {object} 更新后的收款码信息
 */
async function updateQrcode(qrcodeId, updateData) {
  const app = initCloudBase();
  try {
    // 先查找收款码是否存在
    const existingQrcode = await findQrcodeById(qrcodeId);
    if (!existingQrcode) {
      throw new Error('付款二维码不存在');
    }

    const collection = app.database().collection('payment_qrcodes');
    const now = new Date().toISOString();

    // 构建更新对象，只更新提供的字段
    const updateObj = { updatedAt: now };
    if (updateData.qrCode !== undefined) updateObj.qrCode = updateData.qrCode;
    if (updateData.isActive !== undefined) updateObj.isActive = updateData.isActive;
    if (updateData.description !== undefined) updateObj.description = updateData.description;

    await collection.doc(qrcodeId).update(updateObj);

    return {
      ...existingQrcode,
      ...updateObj
    };
  } catch (error) {
    console.error('更新付款二维码失败:', error);
    throw new Error('更新付款二维码失败');
  }
}

/**
 * 删除付款二维码
 * @param {string} qrcodeId - 收款码 ID
 * @returns {boolean} 是否删除成功
 */
async function deleteQrcode(qrcodeId) {
  const app = initCloudBase();
  try {
    // 先查找收款码是否存在
    const existingQrcode = await findQrcodeById(qrcodeId);
    if (!existingQrcode) {
      throw new Error('付款二维码不存在');
    }

    const collection = app.database().collection('payment_qrcodes');
    await collection.doc(qrcodeId).delete();
    return true;
  } catch (error) {
    console.error('删除付款二维码失败:', error);
    throw new Error(error.message || '删除付款二维码失败');
  }
}

module.exports = {
  initCloudBase,
  createQrcode,
  queryQrcodes,
  findQrcodeById,
  updateQrcode,
  deleteQrcode
};