/**
 * 验证签到数据
 * @param {Object} data - 签到数据
 * @returns {Object} - 验证结果
 */
function validateCheckinData(data) {
  const errors = [];

  // 验证活动ID
  if (!data.activityId || typeof data.activityId !== 'string') {
    errors.push('活动ID不能为空');
  }

  // 验证用户ID
  if (!data.userId || typeof data.userId !== 'string') {
    errors.push('用户ID不能为空');
  }

  // 验证昵称
  if (!data.nickname || typeof data.nickname !== 'string' || data.nickname.trim() === '') {
    errors.push('用户昵称不能为空');
  }

  // 验证签到地点（可选）
  if (data.checkinLocation && typeof data.checkinLocation !== 'string') {
    errors.push('签到地点格式不正确');
  } else if (data.checkinLocation && data.checkinLocation.length > 200) {
    errors.push('签到地点不能超过200个字符');
  }

  // 验证备注（可选）
  if (data.notes && typeof data.notes !== 'string') {
    errors.push('备注格式不正确');
  } else if (data.notes && data.notes.length > 500) {
    errors.push('备注不能超过500个字符');
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
 * 验证签到ID
 * @param {string} checkinId - 签到ID
 * @returns {Object} - 验证结果
 */
function validateCheckinId(checkinId) {
  const errors = [];

  if (!checkinId || typeof checkinId !== 'string') {
    errors.push('签到ID不能为空');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateCheckinData,
  validateActivityId,
  validateCheckinId
};
