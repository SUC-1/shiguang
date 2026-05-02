// 验证工具模块

/**
 * 验证菜品名称
 * @param {string} name - 菜品名称
 * @returns {{ valid: boolean, message: string }}
 */
function validateDishName(name) {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return { valid: false, message: '菜品名称不能为空' };
  }
  if (name.length > 50) {
    return { valid: false, message: '菜品名称不能超过 50 个字符' };
  }
  return { valid: true, message: '' };
}

/**
 * 验证菜品价格
 * @param {number} price - 价格
 * @returns {{ valid: boolean, message: string }}
 */
function validatePrice(price) {
  if (price === undefined || price === null || typeof price !== 'number') {
    return { valid: false, message: '价格必须是数字' };
  }
  if (price < 0) {
    return { valid: false, message: '价格不能为负数' };
  }
  if (price > 99999) {
    return { valid: false, message: '价格不能超过 99999' };
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
 * 验证菜品 ID
 * @param {string} dishId - 菜品 ID
 * @returns {{ valid: boolean, message: string }}
 */
function validateDishId(dishId) {
  if (!dishId || typeof dishId !== 'string' || dishId.trim() === '') {
    return { valid: false, message: '菜品 ID 不能为空' };
  }
  return { valid: true, message: '' };
}

/**
 * 验证营养信息
 * @param {object} nutrition - 营养信息
 * @returns {{ valid: boolean, message: string }}
 */
function validateNutrition(nutrition) {
  if (!nutrition || typeof nutrition !== 'object') {
    return { valid: true, message: '' };
  }
  const { calories, protein, carbs, fat } = nutrition;
  if (calories !== undefined && (typeof calories !== 'number' || calories < 0)) {
    return { valid: false, message: '卡路里必须为非负数字' };
  }
  if (protein !== undefined && (typeof protein !== 'number' || protein < 0)) {
    return { valid: false, message: '蛋白质必须为非负数字' };
  }
  if (carbs !== undefined && (typeof carbs !== 'number' || carbs < 0)) {
    return { valid: false, message: '碳水化合物必须为非负数字' };
  }
  if (fat !== undefined && (typeof fat !== 'number' || fat < 0)) {
    return { valid: false, message: '脂肪必须为非负数字' };
  }
  return { valid: true, message: '' };
}

/**
 * 验证配料列表
 * @param {Array} ingredients - 配料列表
 * @returns {{ valid: boolean, message: string }}
 */
function validateIngredients(ingredients) {
  if (!ingredients) {
    return { valid: true, message: '' };
  }
  if (!Array.isArray(ingredients)) {
    return { valid: false, message: '配料必须是数组' };
  }
  for (let i = 0; i < ingredients.length; i++) {
    if (typeof ingredients[i] !== 'string' || ingredients[i].trim() === '') {
      return { valid: false, message: `第 ${i + 1} 个配料无效` };
    }
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
  const validTypes = ['all', 'byCuisine', 'byBusinessType', 'byIsCustom'];
  if (!queryType || !validTypes.includes(queryType)) {
    return { valid: false, message: `查询类型不正确，必须是 ${validTypes.join('、')}` };
  }
  return { valid: true, message: '' };
}

module.exports = {
  validateDishName,
  validatePrice,
  validateBusinessType,
  validateDishId,
  validateNutrition,
  validateIngredients,
  validatePagination,
  validateQueryType
};