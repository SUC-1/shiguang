// 订单操作模块

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
 * 计算订单总金额
 * @param {Array} dishes - 菜品列表
 * @returns {number} 总金额
 */
function calculateTotal(dishes) {
  return dishes.reduce((sum, dish) => sum + dish.quantity * dish.price, 0);
}

/**
 * 创建订单
 * @param {object} orderData - 订单数据
 * @returns {object} 创建的订单信息
 */
async function createOrder(orderData) {
  const app = initCloudBase();
  try {
    const ordersCollection = app.database().collection('orders');
    const total = calculateTotal(orderData.dishes);
    const now = new Date().toISOString();

    const newOrder = {
      userName: orderData.userName,
      dishes: orderData.dishes,
      message: orderData.message || '',
      boardColor: orderData.boardColor || '#FF8B4E',
      status: 'pending',
      total,
      businessType: orderData.businessType,
      syncTarget: orderData.syncTarget || 'all',
      createdAt: now,
      updatedAt: now
    };

    const result = await ordersCollection.add(newOrder);
    return {
      _id: result.id || result._id,
      ...newOrder
    };
  } catch (error) {
    console.error('创建订单失败:', error);
    throw new Error('创建订单失败');
  }
}

/**
 * 查询订单列表
 * @param {object} queryParams - 查询参数
 * @returns {object} 分页结果
 */
async function queryOrders(queryParams) {
  const app = initCloudBase();
  try {
    const ordersCollection = app.database().collection('orders');
    const { queryType, page, pageSize } = queryParams;

    // 构建查询条件
    let query = {};
    switch (queryType) {
      case 'byUser':
        query.userName = queryParams.userName;
        break;
      case 'byStatus':
        query.status = queryParams.status;
        break;
      case 'byBusinessType':
        query.businessType = queryParams.businessType;
        break;
      case 'all':
      default:
        break;
    }

    // 获取总数
    const countResult = await ordersCollection.where(query).count();
    const total = countResult.total || 0;

    // 分页查询
    const skip = (page - 1) * pageSize;
    const result = await ordersCollection
      .where(query)
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get();

    return {
      orders: result.data || [],
      total,
      page,
      pageSize,
      hasMore: skip + pageSize < total
    };
  } catch (error) {
    console.error('查询订单失败:', error);
    throw new Error('查询订单失败');
  }
}

/**
 * 根据 ID 查找订单
 * @param {string} orderId - 订单 ID
 * @returns {object|null} 订单信息或 null
 */
async function findOrderById(orderId) {
  const app = initCloudBase();
  try {
    const ordersCollection = app.database().collection('orders');
    const result = await ordersCollection.doc(orderId).get();
    return result.data || null;
  } catch (error) {
    console.error('查询订单失败:', error);
    return null;
  }
}

/**
 * 更新订单状态
 * @param {string} orderId - 订单 ID
 * @param {string} newStatus - 新状态
 * @returns {object} 更新后的订单信息
 */
async function updateOrderStatus(orderId, newStatus) {
  const app = initCloudBase();
  try {
    // 先查找订单是否存在
    const existingOrder = await findOrderById(orderId);
    if (!existingOrder) {
      throw new Error('订单不存在');
    }

    const ordersCollection = app.database().collection('orders');
    const now = new Date().toISOString();

    await ordersCollection.doc(orderId).update({
      status: newStatus,
      updatedAt: now
    });

    return {
      ...existingOrder,
      status: newStatus,
      updatedAt: now
    };
  } catch (error) {
    console.error('更新订单状态失败:', error);
    throw new Error('更新订单状态失败');
  }
}

module.exports = {
  initCloudBase,
  calculateTotal,
  createOrder,
  queryOrders,
  findOrderById,
  updateOrderStatus
};