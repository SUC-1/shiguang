// 留言板操作模块

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
 * 发送留言
 * @param {object} messageData - 留言数据
 * @returns {object} 创建的留言信息
 */
async function createMessage(messageData) {
  const app = initCloudBase();
  try {
    const collection = app.database().collection('message_boards');
    const now = new Date().toISOString();

    const newMessage = {
      content: messageData.content,
      backgroundColor: messageData.backgroundColor || '#FF8B4E',
      senderId: messageData.senderId,
      senderName: messageData.senderName,
      recipientType: messageData.recipientType,
      recipientId: messageData.recipientId || '',
      category: messageData.category,
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.add(newMessage);
    return {
      _id: result.id || result._id,
      ...newMessage
    };
  } catch (error) {
    console.error('发送留言失败:', error);
    throw new Error('发送留言失败');
  }
}

/**
 * 查询留言列表
 * @param {object} queryParams - 查询参数
 * @returns {object} 分页结果
 */
async function queryMessages(queryParams) {
  const app = initCloudBase();
  try {
    const collection = app.database().collection('message_boards');
    const { queryType, page, pageSize } = queryParams;

    // 构建查询条件
    let query = {};
    switch (queryType) {
      case 'bySender':
        query.senderId = queryParams.senderId;
        break;
      case 'byRecipientType':
        query.recipientType = queryParams.recipientType;
        break;
      case 'byCategory':
        query.category = queryParams.category;
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
      messages: result.data || [],
      total,
      page,
      pageSize,
      hasMore: skip + pageSize < total
    };
  } catch (error) {
    console.error('查询留言失败:', error);
    throw new Error('查询留言失败');
  }
}

/**
 * 根据 ID 查找留言
 * @param {string} messageId - 留言 ID
 * @returns {object|null} 留言信息或 null
 */
async function findMessageById(messageId) {
  const app = initCloudBase();
  try {
    const collection = app.database().collection('message_boards');
    const result = await collection.doc(messageId).get();
    return result.data || null;
  } catch (error) {
    console.error('查询留言失败:', error);
    return null;
  }
}

/**
 * 删除留言
 * @param {string} messageId - 留言 ID
 * @returns {boolean} 是否删除成功
 */
async function deleteMessage(messageId) {
  const app = initCloudBase();
  try {
    // 先查找留言是否存在
    const existingMessage = await findMessageById(messageId);
    if (!existingMessage) {
      throw new Error('留言不存在');
    }

    const collection = app.database().collection('message_boards');
    await collection.doc(messageId).delete();
    return true;
  } catch (error) {
    console.error('删除留言失败:', error);
    throw new Error(error.message || '删除留言失败');
  }
}

module.exports = {
  initCloudBase,
  createMessage,
  queryMessages,
  findMessageById,
  deleteMessage
};