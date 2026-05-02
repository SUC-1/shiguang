/**
 * manageDishes 云函数
 * 功能：菜品管理，支持添加菜品、查询菜品列表、更新菜品、删除菜品
 */

const { createDish, queryDishes, findDishById, updateDish, deleteDish } = require('./dishOperations');
const {
  validateDishName,
  validatePrice,
  validateBusinessType,
  validateDishId,
  validateNutrition,
  validateIngredients,
  validatePagination,
  validateQueryType
} = require('./validators');

/**
 * 处理添加菜品
 * @param {object} event - 事件数据
 * @returns {object} 创建结果
 */
async function handleCreateDish(event) {
  // 验证必需参数
  const nameValidation = validateDishName(event.name);
  if (!nameValidation.valid) {
    return { success: false, message: nameValidation.message };
  }

  const priceValidation = validatePrice(event.price);
  if (!priceValidation.valid) {
    return { success: false, message: priceValidation.message };
  }

  const businessTypeValidation = validateBusinessType(event.businessType);
  if (!businessTypeValidation.valid) {
    return { success: false, message: businessTypeValidation.message };
  }

  // 验证可选参数
  const nutritionValidation = validateNutrition(event.nutrition);
  if (!nutritionValidation.valid) {
    return { success: false, message: nutritionValidation.message };
  }

  const ingredientsValidation = validateIngredients(event.ingredients);
  if (!ingredientsValidation.valid) {
    return { success: false, message: ingredientsValidation.message };
  }

  // 创建菜品
  try {
    const dish = await createDish({
      name: event.name,
      image: event.image,
      cuisine: event.cuisine,
      price: event.price,
      isCustom: event.isCustom,
      nutrition: event.nutrition,
      ingredients: event.ingredients,
      businessType: event.businessType
    });

    return {
      success: true,
      message: '菜品添加成功',
      dish
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || '菜品添加失败'
    };
  }
}

/**
 * 处理查询菜品列表
 * @param {object} event - 事件数据
 * @returns {object} 查询结果
 */
async function handleQueryDishes(event) {
  // 验证查询类型
  const queryTypeValidation = validateQueryType(event.queryType);
  if (!queryTypeValidation.valid) {
    return { success: false, message: queryTypeValidation.message };
  }

  // 根据 queryType 验证对应参数
  if (event.queryType === 'byCuisine') {
    if (!event.cuisine || typeof event.cuisine !== 'string' || event.cuisine.trim() === '') {
      return { success: false, message: '按菜系查询时，菜系不能为空' };
    }
  } else if (event.queryType === 'byBusinessType') {
    const validation = validateBusinessType(event.businessType);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
  } else if (event.queryType === 'byIsCustom') {
    if (event.isCustom === undefined || typeof event.isCustom !== 'boolean') {
      return { success: false, message: '按是否自定义查询时，isCustom 必须为布尔值' };
    }
  }

  // 验证分页参数
  const pagination = validatePagination(event.page, event.pageSize);

  // 查询菜品
  try {
    const data = await queryDishes({
      queryType: event.queryType,
      cuisine: event.cuisine,
      businessType: event.businessType,
      isCustom: event.isCustom,
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
      message: error.message || '查询菜品失败'
    };
  }
}

/**
 * 处理更新菜品
 * @param {object} event - 事件数据
 * @returns {object} 更新结果
 */
async function handleUpdateDish(event) {
  // 验证必需参数
  const dishIdValidation = validateDishId(event.dishId);
  if (!dishIdValidation.valid) {
    return { success: false, message: dishIdValidation.message };
  }

  // 验证至少提供一个更新字段
  const hasUpdate =
    event.name !== undefined ||
    event.image !== undefined ||
    event.cuisine !== undefined ||
    event.price !== undefined ||
    event.isCustom !== undefined ||
    event.nutrition !== undefined ||
    event.ingredients !== undefined;

  if (!hasUpdate) {
    return { success: false, message: '至少提供一个要更新的字段' };
  }

  // 验证各字段
  if (event.name !== undefined) {
    const validation = validateDishName(event.name);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
  }

  if (event.price !== undefined) {
    const validation = validatePrice(event.price);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
  }

  if (event.nutrition !== undefined) {
    const validation = validateNutrition(event.nutrition);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
  }

  if (event.ingredients !== undefined) {
    const validation = validateIngredients(event.ingredients);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
  }

  // 更新菜品
  try {
    const dish = await updateDish(event.dishId, {
      name: event.name,
      image: event.image,
      cuisine: event.cuisine,
      price: event.price,
      isCustom: event.isCustom,
      nutrition: event.nutrition,
      ingredients: event.ingredients
    });

    return {
      success: true,
      message: '菜品更新成功',
      dish
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || '菜品更新失败'
    };
  }
}

/**
 * 处理删除菜品
 * @param {object} event - 事件数据
 * @returns {object} 删除结果
 */
async function handleDeleteDish(event) {
  // 验证必需参数
  const dishIdValidation = validateDishId(event.dishId);
  if (!dishIdValidation.valid) {
    return { success: false, message: dishIdValidation.message };
  }

  // 删除菜品
  try {
    await deleteDish(event.dishId);

    return {
      success: true,
      message: '菜品删除成功'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || '菜品删除失败'
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
      case 'create':
        return await handleCreateDish(event);

      case 'query':
        return await handleQueryDishes(event);

      case 'update':
        return await handleUpdateDish(event);

      case 'delete':
        return await handleDeleteDish(event);

      default:
        return {
          success: false,
          message: '不支持的操作类型，必须是 create、query、update 或 delete'
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