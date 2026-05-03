const cloud = require('@cloudbase/node-sdk');

// 初始化云开发
const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV
});
const db = app.database();

const TRANSITION_COLLECTION = 'role_transitions';
const HISTORY_COLLECTION = 'role_histories';
const PERMISSION_COLLECTION = 'family_permissions';

// 角色流转规则
const ROLE_TRANSITION_RULES = {
  // 允许的角色变更路径
  allowedTransitions: {
    'guest': ['member'],
    'member': ['admin', 'guest'],
    'admin': ['member', 'guest', 'owner'],
    'owner': ['admin'] // 所有者只能降级为管理员
  },
  
  // 审批要求
  approvalRequired: {
    'member->admin': true,    // 成员升管理员需要审批
    'admin->owner': true,     // 管理员升所有者需要审批
    'owner->admin': true      // 所有者降级需要审批
  },
  
  // 可审批的角色
  approverRoles: ['admin', 'owner']
};

// 检查用户权限
async function checkUserPermission(userId, familyId, requiredPermission) {
  try {
    const userPermission = await db.collection(PERMISSION_COLLECTION)
      .where({
        userId: userId,
        familyId: familyId
      })
      .get();
    
    if (userPermission.data.length === 0) {
      return { hasPermission: false, message: '用户不在该家庭中' };
    }
    
    const permission = userPermission.data[0];
    if (permission.role === 'owner') {
      return { hasPermission: true, userRole: 'owner' };
    }
    
    if (permission.permissions[requiredPermission]) {
      return { hasPermission: true, userRole: permission.role };
    }
    
    return { hasPermission: false, message: '权限不足', userRole: permission.role };
  } catch (error) {
    throw new Error(`检查权限失败: ${error.message}`);
  }
}

// 申请角色变更
async function applyRoleTransition(params) {
  const { applicantId, targetUserId, familyId, targetRole, reason, currentUserOpenId } = params;
  
  // 验证申请人权限
  const permissionCheck = await checkUserPermission(currentUserOpenId, familyId, 'canInviteMembers');
  if (!permissionCheck.hasPermission) {
    return { success: false, message: permissionCheck.message };
  }
  
  // 获取目标用户当前角色
  const targetUserPermission = await db.collection(PERMISSION_COLLECTION)
    .where({
      userId: targetUserId,
      familyId: familyId
    })
    .get();
  
  if (targetUserPermission.data.length === 0) {
    return { success: false, message: '目标用户不在该家庭中' };
  }
  
  const currentRole = targetUserPermission.data[0].role;
  const transitionKey = `${currentRole}->${targetRole}`;
  
  // 检查是否允许的角色变更
  if (!ROLE_TRANSITION_RULES.allowedTransitions[currentRole]?.includes(targetRole)) {
    return { success: false, message: `不允许从 ${currentRole} 变更为 ${targetRole}` };
  }
  
  // 检查是否存在待处理的申请
  const pendingApplication = await db.collection(TRANSITION_COLLECTION)
    .where({
      targetUserId: targetUserId,
      familyId: familyId,
      status: 'pending'
    })
    .get();
  
  if (pendingApplication.data.length > 0) {
    return { success: false, message: '该用户已有待处理的角色变更申请' };
  }
  
  const now = new Date();
  const transitionData = {
    applicantId: currentUserOpenId,
    targetUserId,
    familyId,
    currentRole,
    targetRole,
    reason,
    status: ROLE_TRANSITION_RULES.approvalRequired[transitionKey] ? 'pending' : 'approved',
    appliedAt: now,
    effectiveAt: ROLE_TRANSITION_RULES.approvalRequired[transitionKey] ? null : now
  };
  
  const result = await db.collection(TRANSITION_COLLECTION).add(transitionData);
  const transitionId = result.id;
  
  // 如果不需要审批，直接生效
  if (!ROLE_TRANSITION_RULES.approvalRequired[transitionKey]) {
    await executeRoleTransition(transitionId, currentUserOpenId, '系统自动审批');
  }
  
  return {
    success: true,
    message: ROLE_TRANSITION_RULES.approvalRequired[transitionKey] 
      ? '角色变更申请已提交，等待审批' 
      : '角色变更已自动生效',
    transition: { ...transitionData, _id: transitionId }
  };
}

// 审批角色变更申请
async function approveRoleTransition(params) {
  const { transitionId, approvalComment, currentUserOpenId } = params;
  
  // 获取申请记录
  const transitionRecord = await db.collection(TRANSITION_COLLECTION)
    .doc(transitionId)
    .get();
  
  if (!transitionRecord.data) {
    return { success: false, message: '角色变更申请不存在' };
  }
  
  const { familyId, status, targetRole } = transitionRecord.data;
  
  if (status !== 'pending') {
    return { success: false, message: '该申请已处理，无法重复审批' };
  }
  
  // 检查审批人权限
  const permissionCheck = await checkUserPermission(currentUserOpenId, familyId, 'canInviteMembers');
  if (!permissionCheck.hasPermission || !ROLE_TRANSITION_RULES.approverRoles.includes(permissionCheck.userRole)) {
    return { success: false, message: '您没有权限审批此申请' };
  }
  
  // 更新申请状态
  const now = new Date();
  await db.collection(TRANSITION_COLLECTION).doc(transitionId).update({
    status: 'approved',
    approverId: currentUserOpenId,
    approvalComment,
    approvedAt: now,
    effectiveAt: now
  });
  
  // 执行角色变更
  await executeRoleTransition(transitionId, currentUserOpenId, approvalComment);
  
  const updatedRecord = await db.collection(TRANSITION_COLLECTION).doc(transitionId).get();
  
  return {
    success: true,
    message: '角色变更申请已批准',
    transition: updatedRecord.data
  };
}

// 拒绝角色变更申请
async function rejectRoleTransition(params) {
  const { transitionId, approvalComment, currentUserOpenId } = params;
  
  // 获取申请记录
  const transitionRecord = await db.collection(TRANSITION_COLLECTION)
    .doc(transitionId)
    .get();
  
  if (!transitionRecord.data) {
    return { success: false, message: '角色变更申请不存在' };
  }
  
  const { familyId, status } = transitionRecord.data;
  
  if (status !== 'pending') {
    return { success: false, message: '该申请已处理，无法重复操作' };
  }
  
  // 检查审批人权限
  const permissionCheck = await checkUserPermission(currentUserOpenId, familyId, 'canInviteMembers');
  if (!permissionCheck.hasPermission || !ROLE_TRANSITION_RULES.approverRoles.includes(permissionCheck.userRole)) {
    return { success: false, message: '您没有权限处理此申请' };
  }
  
  // 更新申请状态
  const now = new Date();
  await db.collection(TRANSITION_COLLECTION).doc(transitionId).update({
    status: 'rejected',
    approverId: currentUserOpenId,
    approvalComment,
    approvedAt: now
  });
  
  const updatedRecord = await db.collection(TRANSITION_COLLECTION).doc(transitionId).get();
  
  return {
    success: true,
    message: '角色变更申请已拒绝',
    transition: updatedRecord.data
  };
}

// 取消角色变更申请
async function cancelRoleTransition(params) {
  const { transitionId, currentUserOpenId } = params;
  
  // 获取申请记录
  const transitionRecord = await db.collection(TRANSITION_COLLECTION)
    .doc(transitionId)
    .get();
  
  if (!transitionRecord.data) {
    return { success: false, message: '角色变更申请不存在' };
  }
  
  const { applicantId, status } = transitionRecord.data;
  
  if (status !== 'pending') {
    return { success: false, message: '只能取消待审批的申请' };
  }
  
  // 检查是否是申请人或管理员
  if (applicantId !== currentUserOpenId) {
    const permissionCheck = await checkUserPermission(currentUserOpenId, transitionRecord.data.familyId, 'canInviteMembers');
    if (!permissionCheck.hasPermission) {
      return { success: false, message: '只能取消自己提交的申请' };
    }
  }
  
  // 更新申请状态
  await db.collection(TRANSITION_COLLECTION).doc(transitionId).update({
    status: 'cancelled',
    cancelledAt: new Date()
  });
  
  return {
    success: true,
    message: '角色变更申请已取消'
  };
}

// 执行实际的角色变更
async function executeRoleTransition(transitionId, changedBy, reason) {
  const transitionRecord = await db.collection(TRANSITION_COLLECTION)
    .doc(transitionId)
    .get();
  
  if (!transitionRecord.data) {
    throw new Error('角色变更记录不存在');
  }
  
  const { targetUserId, familyId, currentRole, targetRole } = transitionRecord.data;
  
  // 更新用户权限记录
  await db.collection(PERMISSION_COLLECTION)
    .where({
      userId: targetUserId,
      familyId: familyId
    })
    .update({
      role: targetRole,
      updatedAt: new Date()
    });
  
  // 记录角色变更历史
  const historyData = {
    userId: targetUserId,
    familyId: familyId,
    fromRole: currentRole,
    toRole: targetRole,
    transitionId: transitionId,
    changedBy: changedBy,
    changedAt: new Date(),
    reason: reason
  };
  
  await db.collection(HISTORY_COLLECTION).add(historyData);
}

// 查询角色变更记录
async function queryRoleTransitions(params) {
  const { queryType, applicantId, targetUserId, familyId, status, page = 1, pageSize = 20, currentUserOpenId } = params;
  
  let query = db.collection(TRANSITION_COLLECTION);
  
  switch (queryType) {
    case 'pending':
      query = query.where({ status: 'pending' });
      break;
    case 'byApplicant':
      query = query.where({ applicantId });
      break;
    case 'byFamily':
      // 检查用户是否有权限查看该家庭申请
      const familyCheck = await checkUserPermission(currentUserOpenId, familyId, 'canViewReports');
      if (!familyCheck.hasPermission) {
        return { success: false, message: familyCheck.message };
      }
      query = query.where({ familyId });
      break;
    case 'byStatus':
      query = query.where({ status });
      break;
    case 'all':
    default:
      // 只能查询当前用户有权限的家庭
      const userPermissions = await db.collection(PERMISSION_COLLECTION)
        .where({ userId: currentUserOpenId })
        .get();
      
      const familyIds = userPermissions.data.map(p => p.familyId);
      if (familyIds.length === 0) {
        return { success: true, data: { transitions: [], total: 0, page, pageSize, hasMore: false } };
      }
      
      query = query.where({
        familyId: db.command.in(familyIds)
      });
      break;
  }
  
  const totalResult = await query.count();
  const total = totalResult.total;
  
  const transitions = await query
    .orderBy('appliedAt', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get();
  
  return {
    success: true,
    message: '查询成功',
    data: {
      transitions: transitions.data,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total
    }
  };
}

// 查询角色变更历史
async function queryRoleHistory(params) {
  const { userId, familyId, page = 1, pageSize = 20, currentUserOpenId } = params;
  
  // 检查用户权限
  const permissionCheck = await checkUserPermission(currentUserOpenId, familyId, 'canViewReports');
  if (!permissionCheck.hasPermission) {
    return { success: false, message: permissionCheck.message };
  }
  
  let query = db.collection(HISTORY_COLLECTION).where({ familyId });
  
  if (userId) {
    query = query.where({ userId });
  }
  
  const totalResult = await query.count();
  const total = totalResult.total;
  
  const histories = await query
    .orderBy('changedAt', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get();
  
  return {
    success: true,
    message: '查询成功',
    data: {
      histories: histories.data,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total
    }
  };
}

// 主处理函数
async function handleRoleTransitionOperation(operation, params) {
  switch (operation) {
    case 'apply':
      return await applyRoleTransition(params);
    case 'approve':
      return await approveRoleTransition(params);
    case 'reject':
      return await rejectRoleTransition(params);
    case 'cancel':
      return await cancelRoleTransition(params);
    case 'query':
      return await queryRoleTransitions(params);
    case 'history':
      return await queryRoleHistory(params);
    default:
      return { success: false, message: '不支持的操作类型' };
  }
}

module.exports = {
  handleRoleTransitionOperation,
  ROLE_TRANSITION_RULES
};