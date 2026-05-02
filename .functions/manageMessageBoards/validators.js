// 验证工具模块

/**
 * 验证留言内容
 * @param {string} content - 留言内容
 * @returns {{ valid: boolean, message: string }}
 */
function validateContent(content) {
  if (!content || typeof content !== 'string' || content.trim() === '') {
    return { valid: false, message: '留言内容不能为空' };
  }
  if (content.length > 500) {
    return { valid: false, message: '留言内容不能超过 500 个字符' };
  }
  return { valid: true, message: '' };
}

/**
 * 验证发送人 ID
 * @param {string} senderId - 发送人 ID
 * @returns {{ valid: boolean, message: string }}
 */
function validateSenderId(senderId) {
  if (!senderId || typeof senderId !== 'string' || senderId.trim() === '') {
    return { valid: false, message: '发送人 ID 不能为空' };
  }
  return { valid: true, message: '' };
}

/**
 * 验证发送人昵称
 * @param {string} senderName - 发送人昵称
 * @returns {{ valid: boolean, message: string }}
 */
function validateSenderName(senderName) {
  if (!senderName || typeof senderName !== 'string' || senderName.trim() === '') {
    return { valid: false, message: '发送人昵称不能为空' };
  }
  return { valid: true, message: '' };
}

/**
 * 验证接收人类型
 * @param {string} recipientType - 接收人类型
 * @returns {{ valid: boolean, message: string }}
 */
function validateRecipientType(recipientType) {
  const validTypes = ['chef', 'all', 'member'];
  if (!recipientType || !validTypes.includes(recipientType)) {
    return { valid: false, message: `接收人类型不正确，必须是 ${validTypes.join('、')}` };
  }
  return { valid: true, message: '' };
}

/**
 * 验证留言分类
 * @param {string} category - 留言分类
 * @returns {{ valid: boolean, message: string }}
 */
function validateCategory(category) {
  const validCategories = ['order', 'daily', 'announcement'];
  if (!category || !validCategories.includes(category)) {
    return { valid: false, message: `留言分类不正确，必须是 ${validCategories.join('、')}` };
  }
  return { valid: true, message: '' };
}

/**
 * 验证留言 ID
 * @param {string} messageId - 留言 ID
 * @returns {{ valid: boolean, message: string }}
 */
function validateMessageId(messageId) {
  if (!messageId || typeof messageId !== 'string' || messageId.trim() === '') {
    return { valid: false, message: '留言 ID 不能为空' };
  }
  return { valid: true, message: '' };
}

/**
 * 验证分页参数
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @returns {{ valid: boolean, message: string, page: number, pageSize: number }}
 */
function validatePagination(page, pageSize) {
  const p = Math.max(1, Math.floor(page) || 1);
  const ps = Math.min(100, Math.max(1, Math.floor(pageSize) || 20));
  return { valid: true, message: '', page: p, pageSize: ps };
}

/**
 * 验证查询类型
 * @param {string} queryType - 查询类型
 * @returns {{ valid: boolean, message: string }}
 */
function validateQueryType(queryType) {
  const validTypes = ['all', 'bySender', 'byRecipientType', 'byCategory'];
  if (!queryType || !validTypes.includes(queryType)) {
    return { valid: false, message: `查询类型不正确，必须是 ${validTypes.join('、')}` };
  }
  return { valid: true, message: '' };
}

module.exports = {
  validateContent,
  validateSenderId,
  validateSenderName,
  validateRecipientType,
  validateCategory,
  validateMessageId,
  validatePagination,
  validateQueryType
};