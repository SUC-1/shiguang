/**
 * manageMessageBoards 云函数
 * 功能：留言板管理，支持发送留言、查询留言列表、删除留言
 */

const { createMessage, queryMessages, deleteMessage } = require('./messageOperations');
const {
  validateContent,
  validateSenderId,
  validateSenderName,
  validateRecipientType,
  validateCategory,
  validateMessageId,
  validatePagination,
  validateQueryType
} = require('./validators');

/**
 * 处理发送留言
 * @param {object} event - 事件数据
 * @returns {object} 发送结果
 */
async function handleSendMessage(event) {
  // 验证必需参数
  const contentValidation = validateContent(event.content);
  if (!contentValidation.valid) {
    return { success: false, message: contentValidation.message };
  }

  const senderIdValidation = validateSenderId(event.senderId);
  if (!senderIdValidation.valid) {
    return { success: false, message: senderIdValidation.message };
  }

  const senderNameValidation = validateSenderName(event.senderName);
  if (!senderNameValidation.valid) {
    return { success: false, message: senderNameValidation.message };
  }

  const recipientTypeValidation = validateRecipientType(event.recipientType);
  if (!recipientTypeValidation.valid) {
    return { success: false, message: recipientTypeValidation.message };
  }

  const categoryValidation = validateCategory(event.category);
  if (!categoryValidation.valid) {
    return { success: false, message: categoryValidation.message };
  }

  // 如果接收人类型为 member，验证接收人 ID
  if (event.recipientType === 'member' && !event.recipientId) {
    return { success: false, message: '指定接收人类型为 member 时，接收人 ID 不能为空' };
  }

  // 发送留言
  try {
    const messageInfo = await createMessage({
      content: event.content,
      backgroundColor: event.backgroundColor,
      senderId: event.senderId,
      senderName: event.senderName,
      recipientType: event.recipientType,
      recipientId: event.recipientId,
      category: event.category
    });

    return {
      success: true,
      message: '留言发送成功',
      messageInfo
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || '留言发送失败'
    };
  }
}

/**
 * 处理查询留言列表
 * @param {object} event - 事件数据
 * @returns {object} 查询结果
 */
async function handleQueryMessages(event) {
  // 验证查询类型
  const queryTypeValidation = validateQueryType(event.queryType);
  if (!queryTypeValidation.valid) {
    return { success: false, message: queryTypeValidation.message };
  }

  // 根据 queryType 验证对应参数
  if (event.queryType === 'bySender') {
    const validation = validateSenderId(event.senderId);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
  } else if (event.queryType === 'byRecipientType') {
    const validation = validateRecipientType(event.recipientType);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
  } else if (event.queryType === 'byCategory') {
    const validation = validateCategory(event.category);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
  }

  // 验证分页参数
  const pagination = validatePagination(event.page, event.pageSize);

  // 查询留言
  try {
    const data = await queryMessages({
      queryType: event.queryType,
      senderId: event.senderId,
      recipientType: event.recipientType,
      category: event.category,
      page: pagination.page,
      pageSize: pagination.pageSize
    });

    return {
      success: true,
      message: '查询成功',
      data
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || '查询留言失败'
    };
  }
}

/**
 * 处理删除留言
 * @param {object} event - 事件数据
 * @returns {object} 删除结果
 */
async function handleDeleteMessage(event) {
  // 验证必需参数
  const messageIdValidation = validateMessageId(event.messageId);
  if (!messageIdValidation.valid) {
    return { success: false, message: messageIdValidation.message };
  }

  // 删除留言
  try {
    await deleteMessage(event.messageId);

    return {
      success: true,
      message: '留言删除成功'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || '留言删除失败'
    };
  }
}

/**
 * 云函数主入口
 * @param {object} event - 事件数据
 * @param {object} context - 上下文数据
 * @returns {object} 响应结果
 */
exports.main = async function(event, context) {
  try {
    const { action } = event;

    if (!action) {
      return {
        success: false,
        message: '缺少必需参数 action'
      };
    }

    // 根据不同操作类型处理
    switch (action) {
      case 'send':
        return await handleSendMessage(event);

      case 'query':
        return await handleQueryMessages(event);

      case 'delete':
        return await handleDeleteMessage(event);

      default:
        return {
          success: false,
          message: '不支持的操作类型，必须是 send、query 或 delete'
        };
    }
  } catch (error) {
    console.error('云函数执行失败:', error);
    return {
      success: false,
      message: error.message || '云函数执行失败'
    };
  }
};