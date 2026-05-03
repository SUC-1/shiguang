/**
 * 验证活动数据
 * @param {Object} data - 活动数据
 * @returns {Object} - 验证结果
 */
function validateActivityData(data) {
  const errors = [];

  // 验证活动名称
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push('活动名称不能为空');
  } else if (data.name.length > 100) {
    errors.push('活动名称不能超过100个字符');
  }

  // 验证开始时间
  if (!data.startTime) {
    errors.push('开始时间不能为空');
  } else {
    const startTime = new Date(data.startTime);
    if (isNaN(startTime.getTime())) {
      errors.push('开始时间格式不正确');
    }
  }

  // 验证结束时间
  if (!data.endTime) {
    errors.push('结束时间不能为空');
  } else {
    const endTime = new Date(data.endTime);
    if (isNaN(endTime.getTime())) {
      errors.push('结束时间格式不正确');
    }
  }

  // 验证时间逻辑
  if (data.startTime && data.endTime) {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    if (endTime <= startTime) {
      errors.push('结束时间必须晚于开始时间');
    }
  }

  // 验证活动地点
  if (!data.location || typeof data.location !== 'string' || data.location.trim() === '') {
    errors.push('活动地点不能为空');
  }

  // 验证最大参与人数
  if (typeof data.maxParticipants !== 'number' || data.maxParticipants < 1) {
    errors.push('最大参与人数必须至少为1人');
  } else if (data.maxParticipants > 1000) {
    errors.push('最大参与人数不能超过1000人');
  }

  // 验证家庭组ID
  if (!data.familyGroupId || typeof data.familyGroupId !== 'string') {
    errors.push('家庭组ID不能为空');
  }

  // 验证状态
  const validStatuses = ['planning', 'ongoing', 'completed', 'cancelled'];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push('活动状态无效');
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
 * 验证状态变更
 * @param {string} currentStatus - 当前状态
 * @param {string} newStatus - 新状态
 * @returns {Object} - 验证结果
 */
function validateStatusTransition(currentStatus, newStatus) {
  const errors = [];

  const validStatuses = ['planning', 'ongoing', 'completed', 'cancelled'];
  if (!validStatuses.includes(newStatus)) {
    errors.push('无效的活动状态');
    return { isValid: false, errors };
  }

  // 状态流转规则
  const validTransitions = {
    planning: ['ongoing', 'cancelled'],
    ongoing: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
  };

  if (currentStatus === newStatus) {
    errors.push('新状态不能与当前状态相同');
  } else if (!validTransitions[currentStatus]?.includes(newStatus)) {
    errors.push(`无法从"${currentStatus}"状态变更为"${newStatus}"状态`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateActivityData,
  validateActivityId,
  validateStatusTransition
};
