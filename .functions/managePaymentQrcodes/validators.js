// 验证工具模块

/**
 * 验证收款码图片地址
 * @param {string} qrCode - 收款码图片地址
 * @returns {{ valid: boolean, message: string }}
 */
function validateQrCode(qrCode) {
  if (!qrCode || typeof qrCode !== 'string' || qrCode.trim() === '') {
    return { valid: false, message: '收款码图片不能为空' };
  }
  return { valid: true, message: '' };
}

/**
 * 验证是否启用
 * @param {boolean} isActive - 是否启用
 * @returns {{ valid: boolean, message: string }}
 */
function validateIsActive(isActive) {
  if (isActive === undefined || typeof isActive !== 'boolean') {
    return { valid: false, message: '是否启用必须是布尔值' };
  }
  return { valid: true, message: '' };
}

/**
 * 验证说明
 * @param {string} description - 说明
 * @returns {{ valid: boolean, message: string }}
 */
function validateDescription(description) {
  if (!description) {
    return { valid: true, message: '' };
  }
  if (typeof description !== 'string') {
    return { valid: false, message: '说明必须是字符串' };
  }
  if (description.length > 500) {
    return { valid: false, message: '说明不能超过 500 个字符' };
  }
  return { valid: true, message: '' };
}

/**
 * 验证收款码 ID
 * @param {string} qrcodeId - 收款码 ID
 * @returns {{ valid: boolean, message: string }}
 */
function validateQrcodeId(qrcodeId) {
  if (!qrcodeId || typeof qrcodeId !== 'string' || qrcodeId.trim() === '') {
    return { valid: false, message: '收款码 ID 不能为空' };
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
  const validTypes = ['all', 'byIsActive'];
  if (!queryType || !validTypes.includes(queryType)) {
    return { valid: false, message: `查询类型不正确，必须是 ${validTypes.join('、')}` };
  }
  return { valid: true, message: '' };
}

module.exports = {
  validateQrCode,
  validateIsActive,
  validateDescription,
  validateQrcodeId,
  validatePagination,
  validateQueryType
};