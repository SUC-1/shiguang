/**
 * manageMenuTemplates 云函数
 * 功能：菜单模板管理，支持创建模板、查询模板列表、更新模板、删除模板
 */

const {
  createTemplate,
  queryTemplates,
  findTemplateById,
  updateTemplate,
  deleteTemplate
} = require('./menuTemplateOperations');
const {
  validateTemplateName,
  validateDescription,
  validateItems,
  validateTemplateId,
  validatePagination,
  validateQueryType
} = require('./validators');

/**
 * 处理创建模板
 * @param {object} event - 事件数据
 * @returns {object} 创建结果
 */
async function handleCreateTemplate(event) {
  // 验证必需参数
  const nameValidation = validateTemplateName(event.name);
  if (!nameValidation.valid) {
    return { success: false, message: nameValidation.message };
  }

  const itemsValidation = validateItems(event.items);
  if (!itemsValidation.valid) {
    return { success: false, message: itemsValidation.message };
  }

  // 验证可选参数
  const descriptionValidation = validateDescription(event.description);
  if (!descriptionValidation.valid) {
    return { success: false, message: descriptionValidation.message };
  }

  // 创建模板
  try {
    const template = await createTemplate({
      name: event.name,
      description: event.description,
      items: event.items,
      image: event.image
    });

    return {
      success: true,
      message: '菜单模板创建成功',
      template
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || '菜单模板创建失败'
    };
  }
}

/**
 * 处理查询模板列表
 * @param {object} event - 事件数据
 * @returns {object} 查询结果
 */
async function handleQueryTemplates(event) {
  // 验证查询类型
  const queryTypeValidation = validateQueryType(event.queryType);
  if (!queryTypeValidation.valid) {
    return { success: false, message: queryTypeValidation.message };
  }

  // 根据 queryType 验证对应参数
  if (event.queryType === 'byName') {
    if (!event.name || typeof event.name !== 'string' || event.name.trim() === '') {
      return { success: false, message: '按名称查询时，模板名称不能为空' };
    }
  }

  // 验证分页参数
  const pagination = validatePagination(event.page, event.pageSize);

  // 查询模板
  try {
    const data = await queryTemplates({
      queryType: event.queryType,
      name: event.name,
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
      message: error.message || '查询菜单模板失败'
    };
  }
}

/**
 * 处理更新模板
 * @param {object} event - 事件数据
 * @returns {object} 更新结果
 */
async function handleUpdateTemplate(event) {
  // 验证必需参数
  const templateIdValidation = validateTemplateId(event.templateId);
  if (!templateIdValidation.valid) {
    return { success: false, message: templateIdValidation.message };
  }

  // 验证至少提供一个更新字段
  const hasUpdate =
    event.name !== undefined ||
    event.description !== undefined ||
    event.items !== undefined ||
    event.image !== undefined;

  if (!hasUpdate) {
    return { success: false, message: '至少提供一个要更新的字段' };
  }

  // 验证各字段
  if (event.name !== undefined) {
    const validation = validateTemplateName(event.name);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
  }

  if (event.description !== undefined) {
    const validation = validateDescription(event.description);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
  }

  if (event.items !== undefined) {
    const validation = validateItems(event.items);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
  }

  // 更新模板
  try {
    const template = await updateTemplate(event.templateId, {
      name: event.name,
      description: event.description,
      items: event.items,
      image: event.image
    });

    return {
      success: true,
      message: '菜单模板更新成功',
      template
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || '菜单模板更新失败'
    };
  }
}

/**
 * 处理删除模板
 * @param {object} event - 事件数据
 * @returns {object} 删除结果
 */
async function handleDeleteTemplate(event) {
  // 验证必需参数
  const templateIdValidation = validateTemplateId(event.templateId);
  if (!templateIdValidation.valid) {
    return { success: false, message: templateIdValidation.message };
  }

  // 删除模板
  try {
    await deleteTemplate(event.templateId);

    return {
      success: true,
      message: '菜单模板删除成功'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || '菜单模板删除失败'
    };
  }
}

/**
 * 云函数入口
 * @param {any} event - 事件数据
 * @param {any} context - 上下文
 * @returns {Promise<any>}
 */
exports.main = async (event, context) => {
  const { action } = event;

  switch (action) {
    case 'create':
      return await handleCreateTemplate(event);
    case 'query':
      return await handleQueryTemplates(event);
    case 'update':
      return await handleUpdateTemplate(event);
    case 'delete':
      return await handleDeleteTemplate(event);
    default:
      return {
        success: false,
        message: `不支持的操作类型: ${action}，支持 create / query / update / delete`
      };
  }
};