const cloud = require('@cloudbase/node-sdk');

// 初始化云开发
const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV
});
const db = app.database();

const PERMISSION_COLLECTION = 'family_permissions';

// 默认权限配置
const DEFAULT_PERMISSIONS = {
  owner: {
    canManageDishes: true,
    canManageTemplates: true,
    canManagePayments: true,
    canInviteMembers: true,
    canViewReports: true
  },
  admin: {
    canManageDishes: true,
    canManageTemplates: true,
    canManagePayments: true,
    canInviteMembers: true,
    canViewReports: true
  },
  member: {
    canManageDishes: false,
    canManageTemplates: false,
    canManagePayments: false,
    canInviteMembers: false,
    canViewReports: true
  },
  guest: {
    canManageDishes: false,
    canManageTemplates: false,
    canManagePayments: false,
    canInviteMembers: false,
    canViewReports: false
  }
};

// 检查用户是否有权限操作
async function checkUserPermission(currentUserOpenId, familyId, requiredPermission) {
  try {
    const userPermission = await db.collection(PERMISSION_COLLECTION)
      .where({
        userId: currentUserOpenId,
        familyId: familyId
      })
      .get();
    
    if (userPermission.data.length === 0) {
      return { hasPermission: false, message: '用户不在该家庭中' };
    }
    
    const permission = userPermission.data[0];
    if (permission.role === 'owner') {
      return { hasPermission: true };
    }
    
    if (permission.permissions[requiredPermission]) {
      return { hasPermission: true };
    }
    
    return { hasPermission: false, message: '权限不足' };
  } catch (error) {
    throw new Error(`检查权限失败: ${error.message}`);
  }
}

// 创建权限记录
async function createPermission(params) {
  const { userId, familyId, role, currentUserOpenId } = params;
  
  // 检查当前用户是否有权限创建权限记录
  const permissionCheck = await checkUserPermission(currentUserOpenId, familyId, 'canInviteMembers');
  if (!permissionCheck.hasPermission) {
    return { success: false, message: permissionCheck.message };
  }
  
  // 检查是否已存在权限记录
  const existingPermission = await db.collection(PERMISSION_COLLECTION)
    .where({
      userId: userId,
      familyId: familyId
    })
    .get();
  
  if (existingPermission.data.length > 0) {
    return { success: false, message: '该用户已在该家庭中存在权限记录' };
  }
  
  const permissions = DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.member;
  const now = new Date();
  
  const permissionData = {
    userId,
    familyId,
    permissions,
    role,
    createdAt: now,
    updatedAt: now
  };
  
  const result = await db.collection(PERMISSION_COLLECTION).add(permissionData);
  
  return {
    success: true,
    message: '权限记录创建成功',
    permission: { ...permissionData, _id: result.id }
  };
}

// 查询权限记录
async function queryPermissions(params) {
  const { queryType, userId, familyId, role, page = 1, pageSize = 20, currentUserOpenId } = params;
  
  let query = db.collection(PERMISSION_COLLECTION);
  
  switch (queryType) {
    case 'byUser':
      query = query.where({ userId });
      break;
    case 'byFamily':
      // 检查用户是否有权限查看该家庭权限
      const familyCheck = await checkUserPermission(currentUserOpenId, familyId, 'canViewReports');
      if (!familyCheck.hasPermission) {
        return { success: false, message: familyCheck.message };
      }
      query = query.where({ familyId });
      break;
    case 'byRole':
      query = query.where({ role });
      break;
    case 'all':
    default:
      // 只能查询当前用户有权限的家庭
      const userPermissions = await db.collection(PERMISSION_COLLECTION)
        .where({ userId: currentUserOpenId })
        .get();
      
      const familyIds = userPermissions.data.map(p => p.familyId);
      if (familyIds.length === 0) {
        return { success: true, data: { permissions: [], total: 0, page, pageSize, hasMore: false } };
      }
      
      query = query.where({
        familyId: db.command.in(familyIds)
      });
      break;
  }
  
  const totalResult = await query.count();
  const total = totalResult.total;
  
  const permissions = await query
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get();
  
  return {
    success: true,
    message: '查询成功',
    data: {
      permissions: permissions.data,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total
    }
  };
}

// 更新权限记录
async function updatePermission(params) {
  const { permissionId, permissions, role, currentUserOpenId } = params;
  
  // 获取要更新的权限记录
  const permissionRecord = await db.collection(PERMISSION_COLLECTION)
    .doc(permissionId)
    .get();
  
  if (!permissionRecord.data) {
    return { success: false, message: '权限记录不存在' };
  }
  
  const { familyId, userId } = permissionRecord.data;
  
  // 检查当前用户是否有权限修改
  const permissionCheck = await checkUserPermission(currentUserOpenId, familyId, 'canInviteMembers');
  if (!permissionCheck.hasPermission) {
    return { success: false, message: permissionCheck.message };
  }
  
  // 不能修改家庭创建者的权限
  if (permissionRecord.data.role === 'owner') {
    return { success: false, message: '不能修改家庭创建者的权限' };
  }
  
  const updateData = {
    updatedAt: new Date()
  };
  
  if (permissions) {
    updateData.permissions = { ...permissionRecord.data.permissions, ...permissions };
  }
  
  if (role) {
    updateData.role = role;
    updateData.permissions = DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.member;
  }
  
  await db.collection(PERMISSION_COLLECTION).doc(permissionId).update(updateData);
  
  const updatedPermission = await db.collection(PERMISSION_COLLECTION).doc(permissionId).get();
  
  return {
    success: true,
    message: '权限记录更新成功',
    permission: updatedPermission.data
  };
}

// 删除权限记录
async function deletePermission(params) {
  const { permissionId, currentUserOpenId } = params;
  
  // 获取要删除的权限记录
  const permissionRecord = await db.collection(PERMISSION_COLLECTION)
    .doc(permissionId)
    .get();
  
  if (!permissionRecord.data) {
    return { success: false, message: '权限记录不存在' };
  }
  
  const { familyId, userId, role } = permissionRecord.data;
  
  // 检查当前用户是否有权限删除
  const permissionCheck = await checkUserPermission(currentUserOpenId, familyId, 'canInviteMembers');
  if (!permissionCheck.hasPermission) {
    return { success: false, message: permissionCheck.message };
  }
  
  // 不能删除家庭创建者
  if (role === 'owner') {
    return { success: false, message: '不能删除家庭创建者' };
  }
  
  await db.collection(PERMISSION_COLLECTION).doc(permissionId).remove();
  
  return { success: true, message: '权限记录删除成功' };
}

// 分配权限（批量操作）
async function assignPermissions(params) {
  const { familyId, assignments, currentUserOpenId } = params;
  
  // 检查当前用户是否有权限分配权限
  const permissionCheck = await checkUserPermission(currentUserOpenId, familyId, 'canInviteMembers');
  if (!permissionCheck.hasPermission) {
    return { success: false, message: permissionCheck.message };
  }
  
  const results = [];
  
  for (const assignment of assignments) {
    const { userId, role, permissions } = assignment;
    
    try {
      // 检查是否已存在权限记录
      const existingPermission = await db.collection(PERMISSION_COLLECTION)
        .where({
          userId: userId,
          familyId: familyId
        })
        .get();
      
      const now = new Date();
      let result;
      
      if (existingPermission.data.length > 0) {
        // 更新现有记录
        const updateData = {
          role,
          permissions: permissions || DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.member,
          updatedAt: now
        };
        
        await db.collection(PERMISSION_COLLECTION)
          .doc(existingPermission.data[0]._id)
          .update(updateData);
        
        result = { userId, success: true, action: 'updated' };
      } else {
        // 创建新记录
        const permissionData = {
          userId,
          familyId,
          permissions: permissions || DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.member,
          role,
          createdAt: now,
          updatedAt: now
        };
        
        await db.collection(PERMISSION_COLLECTION).add(permissionData);
        result = { userId, success: true, action: 'created' };
      }
      
      results.push(result);
    } catch (error) {
      results.push({ userId, success: false, error: error.message });
    }
  }
  
  return {
    success: true,
    message: '权限分配完成',
    results
  };
}

// 验证用户权限
async function verifyPermission(params) {
  const { userId, familyId, requiredPermission } = params;
  
  const permissionRecord = await db.collection(PERMISSION_COLLECTION)
    .where({
      userId: userId,
      familyId: familyId
    })
    .get();
  
  if (permissionRecord.data.length === 0) {
    return { success: false, hasPermission: false, message: '用户不在该家庭中' };
  }
  
  const permission = permissionRecord.data[0];
  const hasPermission = permission.permissions[requiredPermission] || false;
  
  return {
    success: true,
    hasPermission,
    role: permission.role,
    permissions: permission.permissions
  };
}

// 主处理函数
async function handlePermissionOperation(operation, params) {
  switch (operation) {
    case 'create':
      return await createPermission(params);
    case 'query':
      return await queryPermissions(params);
    case 'update':
      return await updatePermission(params);
    case 'delete':
      return await deletePermission(params);
    case 'assign':
      return await assignPermissions(params);
    case 'verify':
      return await verifyPermission(params);
    default:
      return { success: false, message: '不支持的操作类型' };
  }
}

module.exports = {
  handlePermissionOperation,
  checkUserPermission,
  DEFAULT_PERMISSIONS
};