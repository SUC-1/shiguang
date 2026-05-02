// 菜品操作模块

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
 * 添加菜品
 * @param {object} dishData - 菜品数据
 * @returns {object} 创建的菜品信息
 */
async function createDish(dishData) {
  const app = initCloudBase();
  try {
    const collection = app.database().collection('dishes');
    const now = new Date().toISOString();

    const newDish = {
      name: dishData.name,
      image: dishData.image || '',
      cuisine: dishData.cuisine || '',
      price: dishData.price,
      isCustom: dishData.isCustom || false,
      nutrition: dishData.nutrition || {},
      ingredients: dishData.ingredients || [],
      businessType: dishData.businessType,
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.add(newDish);
    return {
      _id: result.id || result._id,
      ...newDish
    };
  } catch (error) {
    console.error('添加菜品失败:', error);
    throw new Error('添加菜品失败');
  }
}

/**
 * 查询菜品列表
 * @param {object} queryParams - 查询参数
 * @returns {object} 分页结果
 */
async function queryDishes(queryParams) {
  const app = initCloudBase();
  try {
    const collection = app.database().collection('dishes');
    const { queryType, page, pageSize } = queryParams;

    // 构建查询条件
    let query = {};
    switch (queryType) {
      case 'byCuisine':
        query.cuisine = queryParams.cuisine;
        break;
      case 'byBusinessType':
        query.businessType = queryParams.businessType;
        break;
      case 'byIsCustom':
        query.isCustom = queryParams.isCustom;
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
      dishes: result.data || [],
      total,
      page,
      pageSize,
      hasMore: skip + pageSize < total
    };
  } catch (error) {
    console.error('查询菜品失败:', error);
    throw new Error('查询菜品失败');
  }
}

/**
 * 根据 ID 查找菜品
 * @param {string} dishId - 菜品 ID
 * @returns {object|null} 菜品信息或 null
 */
async function findDishById(dishId) {
  const app = initCloudBase();
  try {
    const collection = app.database().collection('dishes');
    const result = await collection.doc(dishId).get();
    return result.data || null;
  } catch (error) {
    console.error('查询菜品失败:', error);
    return null;
  }
}

/**
 * 更新菜品
 * @param {string} dishId - 菜品 ID
 * @param {object} updateData - 更新数据
 * @returns {object} 更新后的菜品信息
 */
async function updateDish(dishId, updateData) {
  const app = initCloudBase();
  try {
    // 先查找菜品是否存在
    const existingDish = await findDishById(dishId);
    if (!existingDish) {
      throw new Error('菜品不存在');
    }

    const collection = app.database().collection('dishes');
    const now = new Date().toISOString();

    // 构建更新对象，只更新提供的字段
    const updateObj = { updatedAt: now };
    if (updateData.name !== undefined) updateObj.name = updateData.name;
    if (updateData.image !== undefined) updateObj.image = updateData.image;
    if (updateData.cuisine !== undefined) updateObj.cuisine = updateData.cuisine;
    if (updateData.price !== undefined) updateObj.price = updateData.price;
    if (updateData.isCustom !== undefined) updateObj.isCustom = updateData.isCustom;
    if (updateData.nutrition !== undefined) updateObj.nutrition = updateData.nutrition;
    if (updateData.ingredients !== undefined) updateObj.ingredients = updateData.ingredients;

    await collection.doc(dishId).update(updateObj);

    return {
      ...existingDish,
      ...updateObj
    };
  } catch (error) {
    console.error('更新菜品失败:', error);
    throw new Error('更新菜品失败');
  }
}

/**
 * 删除菜品
 * @param {string} dishId - 菜品 ID
 * @returns {boolean} 是否删除成功
 */
async function deleteDish(dishId) {
  const app = initCloudBase();
  try {
    // 先查找菜品是否存在
    const existingDish = await findDishById(dishId);
    if (!existingDish) {
      throw new Error('菜品不存在');
    }

    const collection = app.database().collection('dishes');
    await collection.doc(dishId).delete();
    return true;
  } catch (error) {
    console.error('删除菜品失败:', error);
    throw new Error(error.message || '删除菜品失败');
  }
}

module.exports = {
  initCloudBase,
  createDish,
  queryDishes,
  findDishById,
  updateDish,
  deleteDish
};