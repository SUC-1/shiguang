// 用户操作模块

const tcb = require('@cloudbase/node-sdk');

/**
 * 初始化 CloudBase SDK
 */
function initCloudBase() {
  const app = tcb.init({
    // 如果未指定环境ID，会使用当前云函数所在环境
  });
  return app;
}

/**
 * 根据 openid 查询用户
 * @param {object} app - CloudBase 应用实例
 * @param {string} openid - 微信 openid
 * @returns {object|null} 用户信息或 null
 */
async function findUserByOpenid(app, openid) {
  if (!openid) return null;
  try {
    const usersCollection = app.database().collection('users');
    const result = await usersCollection.where({ openid }).limit(1).get();
    if (result.data.length > 0) {
      return result.data[0];
    }
    return null;
  } catch (error) {
    console.error('查询用户失败:', error);
    throw new Error('数据库查询失败');
  }
}

/**
 * 根据 phone 查询用户
 * @param {object} app - CloudBase 应用实例
 * @param {string} phone - 手机号
 * @returns {object|null} 用户信息或 null
 */
async function findUserByPhone(app, phone) {
  if (!phone) return null;
  try {
    const usersCollection = app.database().collection('users');
    const result = await usersCollection.where({ phone }).limit(1).get();
    if (result.data.length > 0) {
      return result.data[0];
    }
    return null;
  } catch (error) {
    console.error('查询用户失败:', error);
    throw new Error('数据库查询失败');
  }
}

/**
 * 创建新用户
 * @param {object} app - CloudBase 应用实例
 * @param {object} userData - 用户数据
 * @returns {object} 创建的用户信息
 */
async function createUser(app, userData) {
  try {
    const usersCollection = app.database().collection('users');
    const newUserData = {
      ...userData,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await usersCollection.add(newUserData);
    return {
      _id: result.id,
      ...newUserData
    };
  } catch (error) {
    console.error('创建用户失败:', error);
    throw new Error('创建用户失败');
  }
}

/**
 * 更新用户信息
 * @param {object} app - CloudBase 应用实例
 * @param {string} userId - 用户 ID
 * @param {object} updateData - 更新数据
 * @returns {boolean} 是否成功
 */
async function updateUser(app, userId, updateData) {
  try {
    const usersCollection = app.database().collection('users');
    await usersCollection.doc(userId).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('更新用户失败:', error);
    throw new Error('更新用户失败');
  }
}

/**
 * 格式化用户信息用于返回
 * @param {object} user - 用户对象
 * @returns {object} 格式化的用户信息
 */
function formatUserInfo(user) {
  return {
    openid: user.openid || null,
    nickname: user.nickname || null,
    phone: user.phone || null,
    role: user.role || null,
    avatar: user.avatar || null,
    isActive: user.isActive !== undefined ? user.isActive : true
  };
}

module.exports = {
  initCloudBase,
  findUserByOpenid,
  findUserByPhone,
  createUser,
  updateUser,
  formatUserInfo
};