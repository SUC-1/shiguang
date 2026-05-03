const { 
  validateActivityData, 
  validateActivityId, 
  validateStatusTransition 
} = require('./validators');

/**
 * 创建活动
 * @param {Object} params - 创建参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 创建结果
 */
async function createActivity(params, context) {
  const { data } = params;
  const { userId } = context;

  // 验证数据
  const validation = validateActivityData(data);
  if (!validation.isValid) {
    throw new Error(validation.errors.join('; '));
  }

  // 检查用户权限（必须是家庭成员）
  const membership = await context.callDataSource({
    dataSourceName: 'family_memberships',
    methodName: 'wedaGetRecordsV2',
    params: {
      filter: {
        where: {
          $and: [
            { userId: { $eq: userId } },
            { familyGroupId: { $eq: data.familyGroupId } },
            { status: { $eq: 'active' } }
          ]
        }
      },
      pageSize: 1,
      pageNumber: 1
    }
  });

  if (!membership || !membership.records || membership.records.length === 0) {
    throw new Error('您不是该家庭的成员，无法创建活动');
  }

  // 创建活动
  const result = await context.callDataSource({
    dataSourceName: 'family_activities',
    methodName: 'wedaCreateV2',
    params: {
      data: {
        ...data,
        createdBy: userId,
        status: data.status || 'planning'
      }
    }
  });

  return {
    success: true,
    message: '活动创建成功',
    data: result
  };
}

/**
 * 更新活动
 * @param {Object} params - 更新参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 更新结果
 */
async function updateActivity(params, context) {
  const { filter, data } = params;
  const { userId } = context;

  // 验证活动ID
  const activityId = filter?.where?._id?.$eq;
  const idValidation = validateActivityId(activityId);
  if (!idValidation.isValid) {
    throw new Error(idValidation.errors.join('; '));
  }

  // 获取活动详情
  const activity = await context.callDataSource({
    dataSourceName: 'family_activities',
    methodName: 'wedaGetItemV2',
    params: {
      filter: {
        where: { _id: { $eq: activityId } }
      }
    }
  });

  if (!activity) {
    throw new Error('活动不存在');
  }

  // 检查权限（只有创建者或管理员可以更新）
  const membership = await context.callDataSource({
    dataSourceName: 'family_memberships',
    methodName: 'wedaGetRecordsV2',
    params: {
      filter: {
        where: {
          $and: [
            { userId: { $eq: userId } },
            { familyGroupId: { $eq: activity.familyGroupId } },
            { status: { $eq: 'active' } }
          ]
        }
      },
      pageSize: 1,
      pageNumber: 1
    }
  });

  if (!membership || !membership.records || membership.records.length === 0) {
    throw new Error('您没有权限更新此活动');
  }

  const userRole = membership.records[0].role;
  if (activity.createdBy !== userId && userRole !== 'admin' && userRole !== 'chef') {
    throw new Error('只有活动创建者或家庭管理员可以更新活动');
  }

  // 如果活动已完成或已取消，不允许更新
  if (activity.status === 'completed' || activity.status === 'cancelled') {
    throw new Error('已完成或已取消的活动无法更新');
  }

  // 验证更新数据
  if (data.name || data.startTime || data.endTime || data.location || data.maxParticipants) {
    const validation = validateActivityData({ ...activity, ...data });
    if (!validation.isValid) {
      throw new Error(validation.errors.join('; '));
    }
  }

  // 更新活动
  const result = await context.callDataSource({
    dataSourceName: 'family_activities',
    methodName: 'wedaUpdateV2',
    params: {
      filter,
      data
    }
  });

  return {
    success: true,
    message: '活动更新成功',
    data: result
  };
}

/**
 * 删除活动
 * @param {Object} params - 删除参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 删除结果
 */
async function deleteActivity(params, context) {
  const { filter } = params;
  const { userId } = context;

  // 验证活动ID
  const activityId = filter?.where?._id?.$eq;
  const idValidation = validateActivityId(activityId);
  if (!idValidation.isValid) {
    throw new Error(idValidation.errors.join('; '));
  }

  // 获取活动详情
  const activity = await context.callDataSource({
    dataSourceName: 'family_activities',
    methodName: 'wedaGetItemV2',
    params: {
      filter: {
        where: { _id: { $eq: activityId } }
      }
    }
  });

  if (!activity) {
    throw new Error('活动不存在');
  }

  // 检查权限（只有创建者或管理员可以删除）
  const membership = await context.callDataSource({
    dataSourceName: 'family_memberships',
    methodName: 'wedaGetRecordsV2',
    params: {
      filter: {
        where: {
          $and: [
            { userId: { $eq: userId } },
            { familyGroupId: { $eq: activity.familyGroupId } },
            { status: { $eq: 'active' } }
          ]
        }
      },
      pageSize: 1,
      pageNumber: 1
    }
  });

  if (!membership || !membership.records || membership.records.length === 0) {
    throw new Error('您没有权限删除此活动');
  }

  const userRole = membership.records[0].role;
  if (activity.createdBy !== userId && userRole !== 'admin') {
    throw new Error('只有活动创建者或家庭管理员可以删除活动');
  }

  // 删除活动相关的报名记录
  await context.callDataSource({
    dataSourceName: 'family_activity_participants',
    methodName: 'wedaDeleteV2',
    params: {
      filter: {
        where: { activityId: { $eq: activityId } }
      }
    }
  });

  // 删除活动相关的签到记录
  await context.callDataSource({
    dataSourceName: 'family_activity_checkins',
    methodName: 'wedaDeleteV2',
    params: {
      filter: {
        where: { activityId: { $eq: activityId } }
      }
    }
  });

  // 删除活动相关的照片
  await context.callDataSource({
    dataSourceName: 'family_activity_photos',
    methodName: 'wedaDeleteV2',
    params: {
      filter: {
        where: { activityId: { $eq: activityId } }
      }
    }
  });

  // 删除活动
  const result = await context.callDataSource({
    dataSourceName: 'family_activities',
    methodName: 'wedaDeleteV2',
    params: { filter }
  });

  return {
    success: true,
    message: '活动删除成功',
    data: result
  };
}

/**
 * 获取活动详情
 * @param {Object} params - 查询参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 活动详情
 */
async function getActivity(params, context) {
  const { filter } = params;

  const activity = await context.callDataSource({
    dataSourceName: 'family_activities',
    methodName: 'wedaGetItemV2',
    params: { filter }
  });

  if (!activity) {
    throw new Error('活动不存在');
  }

  // 获取报名人数
  const participants = await context.callDataSource({
    dataSourceName: 'family_activity_participants',
    methodName: 'wedaGetRecordsV2',
    params: {
      filter: {
        where: {
          $and: [
            { activityId: { $eq: activity._id } },
            { status: { $in: ['registered', 'attended'] } }
          ]
        }
      },
      getCount: true,
      pageSize: 1,
      pageNumber: 1
    }
  });

  return {
    success: true,
    data: {
      ...activity,
      participantCount: participants?.total || 0
    }
  };
}

/**
 * 获取活动列表
 * @param {Object} params - 查询参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 活动列表
 */
async function listActivities(params, context) {
  const { 
    filter = {}, 
    orderBy = [{ startTime: 'desc' }], 
    pageSize = 50, 
    pageNumber = 1 
  } = params;

  const result = await context.callDataSource({
    dataSourceName: 'family_activities',
    methodName: 'wedaGetRecordsV2',
    params: {
      filter,
      orderBy,
      pageSize,
      pageNumber,
      getCount: true,
      select: { $master: true }
    }
  });

  // 为每个活动获取报名人数
  const activitiesWithParticipants = await Promise.all(
    (result.records || []).map(async (activity) => {
      const participants = await context.callDataSource({
        dataSourceName: 'family_activity_participants',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [
                { activityId: { $eq: activity._id } },
                { status: { $in: ['registered', 'attended'] } }
              ]
            }
          },
          getCount: true,
          pageSize: 1,
          pageNumber: 1
        }
      });

      return {
        ...activity,
        participantCount: participants?.total || 0
      };
    })
  );

  return {
    success: true,
    data: activitiesWithParticipants,
    total: result.total,
    pageSize,
    pageNumber
  };
}

/**
 * 更新活动状态
 * @param {Object} params - 更新参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 更新结果
 */
async function updateActivityStatus(params, context) {
  const { activityId, status } = params;
  const { userId } = context;

  // 验证活动ID
  const idValidation = validateActivityId(activityId);
  if (!idValidation.isValid) {
    throw new Error(idValidation.errors.join('; '));
  }

  // 获取活动详情
  const activity = await context.callDataSource({
    dataSourceName: 'family_activities',
    methodName: 'wedaGetItemV2',
    params: {
      filter: {
        where: { _id: { $eq: activityId } }
      }
    }
  });

  if (!activity) {
    throw new Error('活动不存在');
  }

  // 验证状态流转
  const statusValidation = validateStatusTransition(activity.status, status);
  if (!statusValidation.isValid) {
    throw new Error(statusValidation.errors.join('; '));
  }

  // 检查权限
  const membership = await context.callDataSource({
    dataSourceName: 'family_memberships',
    methodName: 'wedaGetRecordsV2',
    params: {
      filter: {
        where: {
          $and: [
            { userId: { $eq: userId } },
            { familyGroupId: { $eq: activity.familyGroupId } },
            { status: { $eq: 'active' } }
          ]
        }
      },
      pageSize: 1,
      pageNumber: 1
    }
  });

  if (!membership || !membership.records || membership.records.length === 0) {
    throw new Error('您没有权限更新此活动状态');
  }

  const userRole = membership.records[0].role;
  if (activity.createdBy !== userId && userRole !== 'admin' && userRole !== 'chef') {
    throw new Error('只有活动创建者或家庭管理员可以更新活动状态');
  }

  // 更新状态
  const result = await context.callDataSource({
    dataSourceName: 'family_activities',
    methodName: 'wedaUpdateV2',
    params: {
      filter: {
        where: { _id: { $eq: activityId } }
      },
      data: { status }
    }
  });

  // 如果活动完成，更新所有报名者为已参加
  if (status === 'completed') {
    await context.callDataSource({
      dataSourceName: 'family_activity_participants',
      methodName: 'wedaUpdateV2',
      params: {
        filter: {
          where: {
            $and: [
              { activityId: { $eq: activityId } },
              { status: { $eq: 'registered' } }
            ]
          }
        },
        data: { status: 'attended' }
      }
    });
  }

  return {
    success: true,
    message: '活动状态更新成功',
    data: result
  };
}

module.exports = {
  createActivity,
  updateActivity,
  deleteActivity,
  getActivity,
  listActivities,
  updateActivityStatus
};
