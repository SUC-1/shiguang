/**
 * manageUsers 云函数
 * 功能：用户管理，支持创建用户、查询用户列表、更新用户信息、删除用户
 */

const { createUser, queryUsers, findUserById, updateUser, deleteUser } = require('./userOperations');
const {
  validateNickname,
  validatePhone,
  validateRole,
  validateUserId,
  validatePagination,
  validateQueryType,
  validateOpenid
} = require('./validators');

/**
 * 处理创建用户
 * @param {object} event - 事件数据
 * @returns {object} 创建结果
 */
async function handleCreateUser(event) {
  // 验证必需参数
  const openidValidation = validateOpenid(event.openid);
  if (!openidValidation.valid) {
    return { success: false, message: openidValidation.message };
  }

  const nicknameValidation = validateNickname(event.nickname);
  if (!nicknameValidation.valid) {
    return { success: false, message: nicknameValidation.message };
  }

  const phoneValidation = validatePhone(event.phone);
  if (!phoneValidation.valid) {
    return { success: false, message: phoneValidation.message };
  }

  const roleValidation = validateRole(event.role);
  if (!roleValidation.valid) {
    return { success: false, message: roleValidation.message };
  }

  // 创建用户
  try {
    const user = await createUser({
      openid: event.openid,
      nickname: event.nickname,
      phone: event.phone,
      role: event.role,
      avatar: event.avatar,
      isActive: event.isActive
    });

    return {
      success: true,
      message: '用户创建成功',
      user
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || '用户创建失败'
    };
  }
}

/**
 * 处理查询用户列表
 * @param {object} event - 事件数据
 * @returns {object} 查询结果
 */
async function handleQueryUsers(event) {
  // 验证查询类型
  const queryTypeValidation = validateQueryType(event.queryType);
  if (!queryTypeValidation.valid) {
    return { success: false, message: queryTypeValidation.message };
  }

  // 根据 queryType 验证对应参数
  if (event.queryType === 'byRole') {
    const validation = validateRole(event.role);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
  } else if (event.queryType === 'byIsActive') {
    if (event.isActive === undefined || typeof event.isActive !== 'boolean') {
      return { success: false, message: '启用状态必须是布尔值' };
    }
  }

  // 验证分页参数
  const pagination = validatePagination(event.page, event.pageSize);

  // 查询用户
  try {
    const data = await queryUsers({
      queryType: event.queryType,
      role: event.role,
      isActive: event.isActive,
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
      message: error.message || '查询用户失败'
    };
  }
}

/**
 * 处理更新用户信息
 * @param {object} event - 事件数据
 * @returns {object} 更新结果
 */
async function handleUpdateUser(event) {
  // 验证必需参数
  const userIdValidation = validateUserId(event.userId);
  if (!userIdValidation.valid) {
    return { success: false, message: userIdValidation.message };
  }

  // 验证至少提供一个更新字段
  if (
    event.nickname === undefined &&
    event.phone === undefined &&
    event.role === undefined &&
    event.avatar === undefined &&
    event.isActive === undefined
  ) {
    return { success: false, message: '至少需要提供一个更新字段' };
  }

  // 验证提供的字段
  if (event.nickname !== undefined) {
    const validation = validateNickname(event.nickname);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
  }

  if (event.phone !== undefined) {
    const validation = validatePhone(event.phone);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
  }

  if (event.role !== undefined) {
    const validation = validateRole(event.role);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
  }

  if (event.isActive !== undefined && typeof event.isActive !== 'boolean') {
    return { success: false, message: '启用状态必须是布尔值' };
  }

  // 更新用户
  try {
    const user = await updateUser(event.userId, {
      nickname: event.nickname,
      phone: event.phone,
      role: event.role,
      avatar: event.avatar,
      isActive: event.isActive
    });

    return {
      success: true,
      message: '用户信息更新成功',
      user
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || '用户信息更新失败'
    };
  }
}

/**
 * 处理删除用户
 * @param {object} event - 事件数据
 * @returns {object} 删除结果
 */
async function handleDeleteUser(event) {
  // 验证必需参数
  const userIdValidation = validateUserId(event.userId);
  if (!userIdValidation.valid) {
    return { success: false, message: userIdValidation.message };
  }

  // 删除用户
  try {
    await deleteUser(event.userId);

    return {
      success: true,
      message: '用户删除成功'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || '用户删除失败'
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
        return await handleCreateUser(event);

      case 'query':
        return await handleQueryUsers(event);

      case 'update':
        return await handleUpdateUser(event);

      case 'delete':
        return await handleDeleteUser(event);

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