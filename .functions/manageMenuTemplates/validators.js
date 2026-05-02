// 验证工具模块

/**
 * 验证模板名称
 * @param {string} name - 模板名称
 * @returns {{ valid: boolean, message: string }}
 */
function validateTemplateName(name) {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return { valid: false, message: '模板名称不能为空' };
  }
  if (name.length > 50) {
    return { valid: false, message: '模板名称不能超过 50 个字符' };
  }
  return { valid: true, message: '' };
}

/**
 * 验证描述
 * @param {string} description - 描述
 * @returns {{ valid: boolean, message: string }}
 */
function validateDescription(description) {
  if (!description) {
    return { valid: true, message: '' };
  }
  if (typeof description !== 'string') {
    return { valid: false, message: '描述必须是字符串' };
  }
  if (description.length > 500) {
    return { valid: false, message: '描述不能超过 500 个字符' };
  }
  return { valid: true, message: '' };
}

/**
 * 验证菜品列表
 * @param {Array} items - 菜品列表
 * @returns {{ valid: boolean, message: string }}
 */
function validateItems(items) {
  if (!items) {
    return { valid: false, message: '菜品列表不能为空' };
  }
  if (!Array.isArray(items)) {
    return { valid: false, message: '菜品列表必须是数组' };
  }
  if (items.length === 0) {
    return { valid: false, message: '菜品列表至少包含一个菜品' };
  }
  for (let i = 0; i < items.length; i++) {
    if (typeof items[i] !== 'string' || items[i].trim() === '') {
      return { valid: false, message: `第 ${i + 1} 个菜品名称无效` };
    }
  }
  return { valid: true, message: '' };
}

/**
 * 验证模板 ID
 * @param {string} templateId - 模板 ID
 * @returns {{ valid: boolean, message: string }}
 */
function validateTemplateId(templateId) {
  if (!templateId || typeof templateId !== 'string' || templateId.trim() === '') {
    return { valid: false, message: '模板 ID 不能为空' };
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
  const validTypes = ['all', 'byName'];
  if (!queryType || !validTypes.includes(queryType)) {
    return { valid: false, message: `查询类型不正确，必须是 ${validTypes.join('、')}` };
  }
  return { valid: true, message: '' };
}

module.exports = {
  validateTemplateName,
  validateDescription,
  validateItems,
  validateTemplateId,
  validatePagination,
  validateQueryType
};