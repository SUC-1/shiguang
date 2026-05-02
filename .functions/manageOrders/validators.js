// 验证工具模块

/**
 * 验证菜品列表
 * @param {Array} dishes - 菜品列表
 * @returns {{ valid: boolean, message: string }}
 */
function validateDishes(dishes) {
  if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
    return { valid: false, message: '菜品列表不能为空' };
  }

  for (let i = 0; i < dishes.length; i++) {
    const dish = dishes[i];
    if (!dish.name || typeof dish.name !== 'string' || dish.name.trim() === '') {
      return { valid: false, message: `第 ${i + 1} 个菜品的名称无效` };
    }
    if (!dish.quantity || typeof dish.quantity !== 'number' || dish.quantity < 1) {
      return { valid: false, message: `第 ${i + 1} 个菜品的数量无效` };
    }
    if (!dish.price || typeof dish.price !== 'number' || dish.price < 0) {
      return { valid: false, message: `第 ${i + 1} 个菜品的价格无效` };
    }
  }

  return { valid: true, message: '' };
}

/**
 * 验证用户名称
 * @param {string} userName - 用户名称
 * @returns {{ valid: boolean, message: string }}
 */
function validateUserName(userName) {
  if (!userName || typeof userName !== 'string' || userName.trim() === '') {
    return { valid: false, message: '用户名称不能为空' };
  }
  return { valid: true, message: '' };
}

/**
 * 验证业务类型
 * @param {string} businessType - 业务类型
 * @returns {{ valid: boolean, message: string }}
 */
function validateBusinessType(businessType) {
  if (!businessType || !['family', 'dining'].includes(businessType)) {
    return { valid: false, message: '业务类型不正确，必须是 family 或 dining' };
  }
  return { valid: true, message: '' };
}

/**
 * 验证订单状态
 * @param {string} status - 订单状态
 * @returns {{ valid: boolean, message: string }}
 */
function validateStatus(status) {
  const validStatuses = ['pending', 'cooking', 'completed', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    return { valid: false, message: `订单状态不正确，必须是 ${validStatuses.join('、')}` };
  }
  return { valid: true, message: '' };
}

/**
 * 验证订单 ID
 * @param {string} orderId - 订单 ID
 * @returns {{ valid: boolean, message: string }}
 */
function validateOrderId(orderId) {
  if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
    return { valid: false, message: '订单 ID 不能为空' };
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
  const validTypes = ['all', 'byUser', 'byStatus', 'byBusinessType'];
  if (!queryType || !validTypes.includes(queryType)) {
    return { valid: false, message: `查询类型不正确，必须是 ${validTypes.join('、')}` };
  }
  return { valid: true, message: '' };
}

module.exports = {
  validateDishes,
  validateUserName,
  validateBusinessType,
  validateStatus,
  validateOrderId,
  validatePagination,
  validateQueryType
};