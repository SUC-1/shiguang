/**
 * managePaymentQrcodes 云函数
 * 功能：付款二维码管理，支持创建收款码、查询收款码列表、更新收款码、删除收款码
 */

const {
  createQrcode,
  queryQrcodes,
  findQrcodeById,
  updateQrcode,
  deleteQrcode
} = require('./paymentQrcodeOperations');
const {
  validateQrCode,
  validateIsActive,
  validateDescription,
  validateQrcodeId,
  validatePagination,
  validateQueryType
} = require('./validators');

/**
 * 处理创建付款二维码
 * @param {object} event - 事件数据
 * @returns {object} 创建结果
 */
async function handleCreateQrcode(event) {
  // 验证必需参数
  const qrCodeValidation = validateQrCode(event.qrCode);
  if (!qrCodeValidation.valid) {
    return { success: false, message: qrCodeValidation.message };
  }

  // 验证可选参数
  const isActiveValidation = validateIsActive(event.isActive);
  if (!isActiveValidation.valid) {
    return { success: false, message: isActiveValidation.message };
  }

  const descriptionValidation = validateDescription(event.description);
  if (!descriptionValidation.valid) {
    return { success: false, message: descriptionValidation.message };
  }

  // 创建收款码
  try {
    const qrcode = await createQrcode({
      qrCode: event.qrCode,
      isActive: event.isActive,
      description: event.description
    });

    return {
      success: true,
      message: '付款二维码创建成功',
      qrcode
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || '付款二维码创建失败'
    };
  }
}

/**
 * 处理查询付款二维码列表
 * @param {object} event - 事件数据
 * @returns {object} 查询结果
 */
async function handleQueryQrcodes(event) {
  // 验证查询类型
  const queryTypeValidation = validateQueryType(event.queryType);
  if (!queryTypeValidation.valid) {
    return { success: false, message: queryTypeValidation.message };
  }

  // 根据 queryType 验证对应参数
  if (event.queryType === 'byIsActive') {
    const isActiveValidation = validateIsActive(event.isActive);
    if (!isActiveValidation.valid) {
      return { success: false, message: '按启用状态查询时，isActive 必须为布尔值' };
    }
  }

  // 验证分页参数
  const pagination = validatePagination(event.page, event.pageSize);

  // 查询收款码
  try {
    const data = await queryQrcodes({
      queryType: event.queryType,
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
      message: error.message || '查询付款二维码失败'
    };
  }
}

/**
 * 处理更新付款二维码
 * @param {object} event - 事件数据
 * @returns {object} 更新结果
 */
async function handleUpdateQrcode(event) {
  // 验证必需参数
  const qrcodeIdValidation = validateQrcodeId(event.qrcodeId);
  if (!qrcodeIdValidation.valid) {
    return { success: false, message: qrcodeIdValidation.message };
  }

  // 验证至少提供一个更新字段
  const hasUpdate =
    event.qrCode !== undefined ||
    event.isActive !== undefined ||
    event.description !== undefined;

  if (!hasUpdate) {
    return { success: false, message: '至少提供一个要更新的字段' };
  }

  // 验证各字段
  if (event.qrCode !== undefined) {
    const validation = validateQrCode(event.qrCode);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
  }

  if (event.isActive !== undefined) {
    const validation = validateIsActive(event.isActive);
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

  // 更新收款码
  try {
    const qrcode = await updateQrcode(event.qrcodeId, {
      qrCode: event.qrCode,
      isActive: event.isActive,
      description: event.description
    });

    return {
      success: true,
      message: '付款二维码更新成功',
      qrcode
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || '付款二维码更新失败'
    };
  }
}

/**
 * 处理删除付款二维码
 * @param {object} event - 事件数据
 * @returns {object} 删除结果
 */
async function handleDeleteQrcode(event) {
  // 验证必需参数
  const qrcodeIdValidation = validateQrcodeId(event.qrcodeId);
  if (!qrcodeIdValidation.valid) {
    return { success: false, message: qrcodeIdValidation.message };
  }

  // 删除收款码
  try {
    await deleteQrcode(event.qrcodeId);

    return {
      success: true,
      message: '付款二维码删除成功'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || '付款二维码删除失败'
    };
  }
}

/**
 * 云函数主入口
 * @param {any} event - 事件数据
 * @param {any} context - 上下文
 * @returns {Promise<any>}
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
        return await handleCreateQrcode(event);

      case 'query':
        return await handleQueryQrcodes(event);

      case 'update':
        return await handleUpdateQrcode(event);

      case 'delete':
        return await handleDeleteQrcode(event);

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