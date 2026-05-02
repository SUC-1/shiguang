// 验证工具模块

/**
 * 验证用户名称
 * @param {string} nickname - 用户昵称
 * @returns {{ valid: boolean, message: string }}
 */
function validateNickname(nickname) {
  if (!nickname || typeof nickname !== 'string' || nickname.trim() === '') {
    return { valid: false, message: '用户昵称不能为空' };
  }
  if (nickname.length > 50) {
    return { valid: false, message: '用户昵称不能超过50个字符' };
  }
  return { valid: true, message: '' };
}

/**
 * 验证手机号
 * @param {string} phone - 手机号
 * @returns {{ valid: boolean, message: string }}
 */
function validatePhone(phone) {
  if (!phone || typeof phone !== 'string' || phone.trim() === '') {
    return { valid: false, message: '手机号不能为空' };
  }
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, message: '手机号格式不正确' };
  }
  return { valid: true, message: '' };
}

/**
 * 验证用户角色
 * @param {string} role - 用户角色
 * @returns {{ valid: boolean, message: string }}
 */
function validateRole(role) {
  const validRoles = ['family_member', 'family_chef', 'dining_manager'];
  if (!role || !validRoles.includes(role)) {
    return { valid: false, message: `用户角色不正确，必须是 ${validRoles.join('、')}` };
  }
  return { valid: true, message: '' };
}

/**
 * 验证用户 ID
 * @param {string} userId - 用户 ID
 * @returns {{ valid: boolean, message: string }}
 */
function validateUserId(userId) {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    return { valid: false, message: '用户 ID 不能为空' };
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
  const validTypes = ['all', 'byRole', 'byIsActive'];
  if (!queryType || !validTypes.includes(queryType)) {
    return { valid: false, message: `查询类型不正确，必须是 ${validTypes.join('、')}` };
  }
  return { valid: true, message: '' };
}

/**
 * 验证 OpenID
 * @param {string} openid - 微信 OpenID
 * @returns {{ valid: boolean, message: string }}
 */
function validateOpenid(openid) {
  if (!openid || typeof openid !== 'string' || openid.trim() === '') {
    return { valid: false, message: 'OpenID 不能为空' };
  }
  return { valid: true, message: '' };
}

module.exports = {
  validateNickname,
  validatePhone,
  validateRole,
  validateUserId,
  validatePagination,
  validateQueryType,
  validateOpenid
};