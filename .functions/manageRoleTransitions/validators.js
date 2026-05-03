function validateRoleTransitionParams(event, action) {
  const requiredFields = {
    apply: ['targetUserId', 'familyId', 'targetRole', 'reason'],
    approve: ['transitionId'],
    reject: ['transitionId'],
    cancel: ['transitionId'],
    query: ['queryType'],
    history: ['familyId']
  };

  const fields = requiredFields[action] || [];
  
  for (const field of fields) {
    if (event[field] === undefined || event[field] === null || event[field] === '') {
      return { valid: false, message: `缺少必填参数: ${field}` };
    }
  }

  // 特定操作的额外验证
  switch (action) {
    case 'apply':
      if (!['guest', 'member', 'admin', 'owner'].includes(event.targetRole)) {
        return { valid: false, message: '目标角色类型无效' };
      }
      if (event.reason && event.reason.length > 500) {
        return { valid: false, message: '变更原因不能超过500字符' };
      }
      break;
    
    case 'query':
      if (!['pending', 'byApplicant', 'byFamily', 'byStatus', 'all'].includes(event.queryType)) {
        return { valid: false, message: '查询类型无效' };
      }
      if (event.queryType === 'byApplicant' && !event.applicantId) {
        return { valid: false, message: '按申请人查询时需要提供 applicantId' };
      }
      if (event.queryType === 'byFamily' && !event.familyId) {
        return { valid: false, message: '按家庭查询时需要提供 familyId' };
      }
      if (event.queryType === 'byStatus' && !event.status) {
        return { valid: false, message: '按状态查询时需要提供 status' };
      }
      break;
    
    case 'history':
      if (event.userId && typeof event.userId !== 'string') {
        return { valid: false, message: 'userId 必须是字符串' };
      }
      break;
  }

  return { valid: true };
}

module.exports = {
  validateRoleTransitionParams
};