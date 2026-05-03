/**
 * 验证照片数据
 * @param {Object} data - 照片数据
 * @returns {Object} - 验证结果
 */
function validatePhotoData(data) {
  const errors = [];

  // 验证活动ID
  if (!data.activityId || typeof data.activityId !== 'string') {
    errors.push('活动ID不能为空');
  }

  // 验证照片URL
  if (!data.url || typeof data.url !== 'string' || data.url.trim() === '') {
    errors.push('照片URL不能为空');
  } else if (!isValidUrl(data.url)) {
    errors.push('照片URL格式不正确');
  }

  // 验证缩略图URL（可选）
  if (data.thumbnailUrl && !isValidUrl(data.thumbnailUrl)) {
    errors.push('缩略图URL格式不正确');
  }

  // 验证描述（可选）
  if (data.description && typeof data.description !== 'string') {
    errors.push('照片描述格式不正确');
  } else if (data.description && data.description.length > 500) {
    errors.push('照片描述不能超过500个字符');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 验证照片ID
 * @param {string} photoId - 照片ID
 * @returns {Object} - 验证结果
 */
function validatePhotoId(photoId) {
  const errors = [];

  if (!photoId || typeof photoId !== 'string') {
    errors.push('照片ID不能为空');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 验证活动ID
 * @param {string} activityId - 活动ID
 * @returns {Object} - 验证结果
 */
function validateActivityId(activityId) {
  const errors = [];

  if (!activityId || typeof activityId !== 'string') {
    errors.push('活动ID不能为空');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 验证URL格式
 * @param {string} url - URL字符串
 * @returns {boolean} - 是否有效
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  validatePhotoData,
  validatePhotoId,
  validateActivityId
};
