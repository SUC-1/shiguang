function validatePermissionParams(event, action) {
  const requiredFields = {
    create: ['userId', 'familyId', 'role'],
    query: ['queryType'],
    update: ['permissionId'],
    delete: ['permissionId'],
    assign: ['familyId', 'assignments'],
    verify: ['userId', 'familyId', 'requiredPermission']
  };

  const fields = requiredFields[action] || [];
  
  for (const field of fields) {
    if (event[field] === undefined || event[field] === null || event[field] === '') {
      return { valid: false, message: `缺少必填参数: ${field}` };
    }
  }

  // 特定操作的额外验证
  switch (action) {
    case 'create':
      if (!['owner', 'admin', 'member', 'guest'].includes(event.role)) {
        return { valid: false, message: '角色类型无效，必须是 owner、admin、member 或 guest' };
      }
      break;
    
    case 'query':
      if (!['all', 'byUser', 'byFamily', 'byRole'].includes(event.queryType)) {
        return { valid: false, message: '查询类型无效' };
      }
      if (event.queryType === 'byUser' && !event.userId) {
        return { valid: false, message: '按用户查询时需要提供 userId' };
      }
      if (event.queryType === 'byFamily' && !event.familyId) {
        return { valid: false, message: '按家庭查询时需要提供 familyId' };
      }
      if (event.queryType === 'byRole' && !event.role) {
        return { valid: false, message: '按角色查询时需要提供 role' };
      }
      break;
    
    case 'assign':
      if (!Array.isArray(event.assignments) || event.assignments.length === 0) {
        return { valid: false, message: 'assignments 必须是非空数组' };
      }
      for (const assignment of event.assignments) {
        if (!assignment.userId || !assignment.role) {
          return { valid: false, message: '每个 assignment 必须包含 userId 和 role' };
        }
        if (!['owner', 'admin', 'member', 'guest'].includes(assignment.role)) {
          return { valid: false, message: '角色类型无效' };
        }
      }
      break;
    
    case 'verify':
      const validPermissions = [
        'canManageDishes',
        'canManageTemplates', 
        'canManagePayments',
        'canInviteMembers',
        'canViewReports'
      ];
      if (!validPermissions.includes(event.requiredPermission)) {
        return { valid: false, message: '权限类型无效' };
      }
      break;
  }

  return { valid: true };
}

module.exports = {
  validatePermissionParams
};