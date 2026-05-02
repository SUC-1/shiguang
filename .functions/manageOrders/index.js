/**
 * manageOrders 云函数
 * 功能：订单管理，支持创建订单、查询订单列表、更新订单状态
 */

const { createOrder, queryOrders, findOrderById, updateOrderStatus } = require('./orderOperations');
const {
  validateDishes,
  validateUserName,
  validateBusinessType,
  validateStatus,
  validateOrderId,
  validatePagination,
  validateQueryType
} = require('./validators');

/**
 * 处理创建订单
 * @param {object} event - 事件数据
 * @returns {object} 创建结果
 */
async function handleCreateOrder(event) {
  // 验证必需参数
  const userNameValidation = validateUserName(event.userName);
  if (!userNameValidation.valid) {
    return { success: false, message: userNameValidation.message };
  }

  const dishesValidation = validateDishes(event.dishes);
  if (!dishesValidation.valid) {
    return { success: false, message: dishesValidation.message };
  }

  const businessTypeValidation = validateBusinessType(event.businessType);
  if (!businessTypeValidation.valid) {
    return { success: false, message: businessTypeValidation.message };
  }

  // 创建订单
  try {
    const order = await createOrder({
      userName: event.userName,
      dishes: event.dishes,
      message: event.message,
      boardColor: event.boardColor,
      businessType: event.businessType,
      syncTarget: event.syncTarget
    });

    return {
      success: true,
      message: '订单创建成功',
      order
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || '订单创建失败'
    };
  }
}

/**
 * 处理查询订单列表
 * @param {object} event - 事件数据
 * @returns {object} 查询结果
 */
async function handleQueryOrders(event) {
  // 验证查询类型
  const queryTypeValidation = validateQueryType(event.queryType);
  if (!queryTypeValidation.valid) {
    return { success: false, message: queryTypeValidation.message };
  }

  // 根据 queryType 验证对应参数
  if (event.queryType === 'byUser') {
    const validation = validateUserName(event.userName);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
  } else if (event.queryType === 'byStatus') {
    const validation = validateStatus(event.status);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
  } else if (event.queryType === 'byBusinessType') {
    const validation = validateBusinessType(event.businessType);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
  }

  // 验证分页参数
  const pagination = validatePagination(event.page, event.pageSize);

  // 查询订单
  try {
    const data = await queryOrders({
      queryType: event.queryType,
      userName: event.userName,
      status: event.status,
      businessType: event.businessType,
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
      message: error.message || '查询订单失败'
    };
  }
}

/**
 * 处理更新订单状态
 * @param {object} event - 事件数据
 * @returns {object} 更新结果
 */
async function handleUpdateOrderStatus(event) {
  // 验证必需参数
  const orderIdValidation = validateOrderId(event.orderId);
  if (!orderIdValidation.valid) {
    return { success: false, message: orderIdValidation.message };
  }

  const statusValidation = validateStatus(event.status);
  if (!statusValidation.valid) {
    return { success: false, message: statusValidation.message };
  }

  // 更新订单状态
  try {
    const order = await updateOrderStatus(event.orderId, event.status);

    return {
      success: true,
      message: '订单状态更新成功',
      order
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || '订单状态更新失败'
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
        return await handleCreateOrder(event);

      case 'query':
        return await handleQueryOrders(event);

      case 'updateStatus':
        return await handleUpdateOrderStatus(event);

      default:
        return {
          success: false,
          message: '不支持的操作类型，必须是 create、query 或 updateStatus'
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