// 验证工具模块

/**
 * 验证手机号格式
 * @param {string} phone - 手机号
 * @returns {boolean} 是否有效
 */
function validatePhoneNumber(phone) {
  if (!phone) return false;
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证验证码有效性（模拟验证）
 * @param {string} code - 验证码
 * @returns {boolean} 是否有效
 */
function validateVerificationCode(code) {
  if (!code) return false;
  // 实际项目中应该对接短信服务商验证
  // 这里做模拟验证：验证码应该是4-6位数字
  const codeRegex = /^\d{4,6}$/;
  return codeRegex.test(code);
}

/**
 * 验证必需参数
 * @param {object} params - 参数对象
 * @param {array} requiredFields - 必需字段列表
 * @returns {boolean} 是否所有必需字段都存在
 */
function validateRequiredParams(params, requiredFields) {
  return requiredFields.every(field => params[field] !== undefined && params[field] !== null);
}

module.exports = {
  validatePhoneNumber,
  validateVerificationCode,
  validateRequiredParams
};