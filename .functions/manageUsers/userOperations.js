// 用户操作模块

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
 * 创建用户
 * @param {object} userData - 用户数据
 * @returns {object} 创建的用户信息
 */
async function createUser(userData) {
  const app = initCloudBase();
  try {
    const usersCollection = app.database().collection('users');
    const now = new Date().toISOString();

    const newUser = {
      openid: userData.openid,
      nickname: userData.nickname,
      phone: userData.phone,
      role: userData.role,
      avatar: userData.avatar || '',
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      createdAt: now,
      updatedAt: now
    };

    const result = await usersCollection.add(newUser);
    return {
      _id: result.id || result._id,
      ...newUser
    };
  } catch (error) {
    console.error('创建用户失败:', error);
    throw new Error('创建用户失败');
  }
}

/**
 * 查询用户列表
 * @param {object} queryParams - 查询参数
 * @returns {object} 分页结果
 */
async function queryUsers(queryParams) {
  const app = initCloudBase();
  try {
    const usersCollection = app.database().collection('users');
    const { queryType, page, pageSize } = queryParams;

    // 构建查询条件
    let query = {};
    switch (queryType) {
      case 'byRole':
        query.role = queryParams.role;
        break;
      case 'byIsActive':
        query.isActive = queryParams.isActive;
        break;
      case 'all':
      default:
        break;
    }

    // 获取总数
    const countResult = await usersCollection.where(query).count();
    const total = countResult.total || 0;

    // 分页查询
    const skip = (page - 1) * pageSize;
    const result = await usersCollection
      .where(query)
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get();

    return {
      users: result.data || [],
      total,
      page,
      pageSize,
      hasMore: skip + pageSize < total
    };
  } catch (error) {
    console.error('查询用户失败:', error);
    throw new Error('查询用户失败');
  }
}

/**
 * 根据 ID 查找用户
 * @param {string} userId - 用户 ID
 * @returns {object|null} 用户信息或 null
 */
async function findUserById(userId) {
  const app = initCloudBase();
  try {
    const usersCollection = app.database().collection('users');
    const result = await usersCollection.doc(userId).get();
    return result.data || null;
  } catch (error) {
    console.error('查询用户失败:', error);
    return null;
  }
}

/**
 * 更新用户信息
 * @param {string} userId - 用户 ID
 * @param {object} updateData - 更新数据
 * @returns {object} 更新后的用户信息
 */
async function updateUser(userId, updateData) {
  const app = initCloudBase();
  try {
    // 先查找用户是否存在
    const existingUser = await findUserById(userId);
    if (!existingUser) {
      throw new Error('用户不存在');
    }

    const usersCollection = app.database().collection('users');
    const now = new Date().toISOString();

    const updateFields = {
      updatedAt: now
    };

    // 只更新提供的字段
    if (updateData.nickname !== undefined) updateFields.nickname = updateData.nickname;
    if (updateData.phone !== undefined) updateFields.phone = updateData.phone;
    if (updateData.role !== undefined) updateFields.role = updateData.role;
    if (updateData.avatar !== undefined) updateFields.avatar = updateData.avatar;
    if (updateData.isActive !== undefined) updateFields.isActive = updateData.isActive;

    await usersCollection.doc(userId).update(updateFields);

    return {
      ...existingUser,
      ...updateFields
    };
  } catch (error) {
    console.error('更新用户信息失败:', error);
    throw new Error('更新用户信息失败');
  }
}

/**
 * 删除用户
 * @param {string} userId - 用户 ID
 * @returns {boolean} 是否删除成功
 */
async function deleteUser(userId) {
  const app = initCloudBase();
  try {
    // 先查找用户是否存在
    const existingUser = await findUserById(userId);
    if (!existingUser) {
      throw new Error('用户不存在');
    }

    const usersCollection = app.database().collection('users');
    await usersCollection.doc(userId).delete();
    return true;
  } catch (error) {
    console.error('删除用户失败:', error);
    throw new Error('删除用户失败');
  }
}

module.exports = {
  initCloudBase,
  createUser,
  queryUsers,
  findUserById,
  updateUser,
  deleteUser
};