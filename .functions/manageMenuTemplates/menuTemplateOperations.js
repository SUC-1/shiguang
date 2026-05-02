// 菜单模板操作模块

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
 * 创建菜单模板
 * @param {object} templateData - 模板数据
 * @returns {object} 创建的模板信息
 */
async function createTemplate(templateData) {
  const app = initCloudBase();
  try {
    const collection = app.database().collection('menu_templates');
    const now = new Date().toISOString();

    const newTemplate = {
      name: templateData.name,
      description: templateData.description || '',
      items: templateData.items,
      image: templateData.image || '',
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.add(newTemplate);
    return {
      _id: result.id || result._id,
      ...newTemplate
    };
  } catch (error) {
    console.error('创建菜单模板失败:', error);
    throw new Error('创建菜单模板失败');
  }
}

/**
 * 查询菜单模板列表
 * @param {object} queryParams - 查询参数
 * @returns {object} 分页结果
 */
async function queryTemplates(queryParams) {
  const app = initCloudBase();
  try {
    const collection = app.database().collection('menu_templates');
    const { queryType, page, pageSize } = queryParams;

    // 构建查询条件
    let query = {};
    switch (queryType) {
      case 'byName':
        query.name = queryParams.name;
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
      templates: result.data || [],
      total,
      page,
      pageSize,
      hasMore: skip + pageSize < total
    };
  } catch (error) {
    console.error('查询菜单模板失败:', error);
    throw new Error('查询菜单模板失败');
  }
}

/**
 * 根据 ID 查找菜单模板
 * @param {string} templateId - 模板 ID
 * @returns {object|null} 模板信息或 null
 */
async function findTemplateById(templateId) {
  const app = initCloudBase();
  try {
    const collection = app.database().collection('menu_templates');
    const result = await collection.doc(templateId).get();
    return result.data || null;
  } catch (error) {
    console.error('查询菜单模板失败:', error);
    return null;
  }
}

/**
 * 更新菜单模板
 * @param {string} templateId - 模板 ID
 * @param {object} updateData - 更新数据
 * @returns {object} 更新后的模板信息
 */
async function updateTemplate(templateId, updateData) {
  const app = initCloudBase();
  try {
    // 先查找模板是否存在
    const existingTemplate = await findTemplateById(templateId);
    if (!existingTemplate) {
      throw new Error('菜单模板不存在');
    }

    const collection = app.database().collection('menu_templates');
    const now = new Date().toISOString();

    // 构建更新对象，只更新提供的字段
    const updateObj = { updatedAt: now };
    if (updateData.name !== undefined) updateObj.name = updateData.name;
    if (updateData.description !== undefined) updateObj.description = updateData.description;
    if (updateData.items !== undefined) updateObj.items = updateData.items;
    if (updateData.image !== undefined) updateObj.image = updateData.image;

    await collection.doc(templateId).update(updateObj);

    return {
      ...existingTemplate,
      ...updateObj
    };
  } catch (error) {
    console.error('更新菜单模板失败:', error);
    throw new Error('更新菜单模板失败');
  }
}

/**
 * 删除菜单模板
 * @param {string} templateId - 模板 ID
 * @returns {boolean} 是否删除成功
 */
async function deleteTemplate(templateId) {
  const app = initCloudBase();
  try {
    // 先查找模板是否存在
    const existingTemplate = await findTemplateById(templateId);
    if (!existingTemplate) {
      throw new Error('菜单模板不存在');
    }

    const collection = app.database().collection('menu_templates');
    await collection.doc(templateId).delete();
    return true;
  } catch (error) {
    console.error('删除菜单模板失败:', error);
    throw new Error(error.message || '删除菜单模板失败');
  }
}

module.exports = {
  initCloudBase,
  createTemplate,
  queryTemplates,
  findTemplateById,
  updateTemplate,
  deleteTemplate
};