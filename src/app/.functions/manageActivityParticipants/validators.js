/**
 * 验证报名数据
 * @param {Object} data - 报名数据
 * @returns {Object} - 验证结果
 */
function validateRegistrationData(data) {
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

  // 验证状态
  const validStatuses = ['registered', 'attended', 'cancelled'];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push('无效的参与状态');
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
 * 验证参与者ID
 * @param {string} participantId - 参与者ID
 * @returns {Object} - 验证结果
 */
function validateParticipantId(participantId) {
  const errors = [];

  if (!participantId || typeof participantId !== 'string') {
    errors.push('参与者ID不能为空');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 验证备注
 * @param {string} notes - 备注内容
 * @returns {Object} - 验证结果
 */
function validateNotes(notes) {
  const errors = [];

  if (notes && typeof notes !== 'string') {
    errors.push('备注必须是字符串');
  } else if (notes && notes.length > 500) {
    errors.push('备注不能超过500个字符');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateRegistrationData,
  validateActivityId,
  validateParticipantId,
  validateNotes
};
