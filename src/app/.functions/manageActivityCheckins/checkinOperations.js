const {
  validateCheckinData,
  validateActivityId,
  validateCheckinId
} = require('./validators');

/**
 * 活动签到
 * @param {Object} params - 签到参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 签到结果
 */
async function checkin(params, context) {
  const { activityId, checkinLocation = '', checkinPhoto = '', notes = '' } = params;
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

  // 检查活动状态
  if (activity.status === 'completed') {
    throw new Error('活动已结束，无法签到');
  }
  if (activity.status === 'cancelled') {
    throw new Error('活动已取消，无法签到');
  }
  if (activity.status === 'planning') {
    throw new Error('活动尚未开始，无法签到');
  }

  // 检查用户是否已报名
  const registration = await context.callDataSource({
    dataSourceName: 'family_activity_participants',
    methodName: 'wedaGetRecordsV2',
    params: {
      filter: {
        where: {
          $and: [
            { activityId: { $eq: activityId } },
            { userId: { $eq: userId } },
            { status: { $in: ['registered', 'attended'] } }
          ]
        }
      },
      pageSize: 1,
      pageNumber: 1
    }
  });

  if (!registration || !registration.records || registration.records.length === 0) {
    throw new Error('您尚未报名此活动，请先报名');
  }

  // 检查是否已经签到
  const existingCheckin = await context.callDataSource({
    dataSourceName: 'family_activity_checkins',
    methodName: 'wedaGetRecordsV2',
    params: {
      filter: {
        where: {
          $and: [
            { activityId: { $eq: activityId } },
            { userId: { $eq: userId } }
          ]
        }
      },
      pageSize: 1,
      pageNumber: 1
    }
  });

  if (existingCheckin && existingCheckin.records && existingCheckin.records.length > 0) {
    throw new Error('您已经签到过了');
  }

  // 获取用户信息
  const user = await context.callDataSource({
    dataSourceName: 'users',
    methodName: 'wedaGetItemV2',
    params: {
      filter: {
        where: { _id: { $eq: userId } }
      }
    }
  });

  // 创建签到记录
  const result = await context.callDataSource({
    dataSourceName: 'family_activity_checkins',
    methodName: 'wedaCreateV2',
    params: {
      data: {
        activityId: activityId,
        userId: userId,
        nickname: user?.nickname || user?.name || '匿名用户',
        avatar: user?.avatar || '',
        checkinTime: new Date().toISOString(),
        checkinLocation: checkinLocation,
        checkinPhoto: checkinPhoto,
        notes: notes
      }
    }
  });

  // 更新报名状态为已参加
  await context.callDataSource({
    dataSourceName: 'family_activity_participants',
    methodName: 'wedaUpdateV2',
    params: {
      filter: {
        where: {
          $and: [
            { activityId: { $eq: activityId } },
            { userId: { $eq: userId } }
          ]
        }
      },
      data: {
        status: 'attended'
      }
    }
  });

  return {
    success: true,
    message: '签到成功',
    data: result
  };
}

/**
 * 获取签到列表
 * @param {Object} params - 查询参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 签到列表
 */
async function getCheckins(params, context) {
  const {
    activityId,
    pageSize = 100,
    pageNumber = 1
  } = params;

  // 验证活动ID
  const idValidation = validateActivityId(activityId);
  if (!idValidation.isValid) {
    throw new Error(idValidation.errors.join('; '));
  }

  // 检查活动是否存在
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

  // 查询签到列表
  const result = await context.callDataSource({
    dataSourceName: 'family_activity_checkins',
    methodName: 'wedaGetRecordsV2',
    params: {
      filter: {
        where: { activityId: { $eq: activityId } }
      },
      orderBy: [{ checkinTime: 'asc' }],
      pageSize,
      pageNumber,
      getCount: true,
      select: { $master: true }
    }
  });

  // 添加排名信息
  const checkinsWithRank = (result.records || []).map((checkin, index) => ({
    ...checkin,
    rank: index + 1
  }));

  return {
    success: true,
    data: checkinsWithRank,
    total: result.total,
    pageSize,
    pageNumber
  };
}

/**
 * 获取签到统计
 * @param {Object} params - 查询参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 签到统计
 */
async function getCheckinStats(params, context) {
  const { activityId } = params;

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

  // 获取报名人数
  const registrations = await context.callDataSource({
    dataSourceName: 'family_activity_participants',
    methodName: 'wedaGetRecordsV2',
    params: {
      filter: {
        where: {
          $and: [
            { activityId: { $eq: activityId } },
            { status: { $in: ['registered', 'attended'] } }
          ]
        }
      },
      getCount: true,
      pageSize: 1,
      pageNumber: 1
    }
  });

  // 获取签到人数
  const checkins = await context.callDataSource({
    dataSourceName: 'family_activity_checkins',
    methodName: 'wedaGetRecordsV2',
    params: {
      filter: {
        where: { activityId: { $eq: activityId } }
      },
      getCount: true,
      pageSize: 1,
      pageNumber: 1
    }
  });

  const registeredCount = registrations?.total || 0;
  const checkedInCount = checkins?.total || 0;
  const notCheckedInCount = registeredCount - checkedInCount;
  const checkinRate = registeredCount > 0 ? Math.round((checkedInCount / registeredCount) * 100) : 0;

  return {
    success: true,
    data: {
      activityId,
      activityName: activity.name,
      maxParticipants: activity.maxParticipants,
      registeredCount,
      checkedInCount,
      notCheckedInCount,
      checkinRate
    }
  };
}

/**
 * 检查用户是否已签到
 * @param {Object} params - 查询参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 检查结果
 */
async function checkCheckin(params, context) {
  const { activityId } = params;
  const { userId } = context;

  // 验证活动ID
  const idValidation = validateActivityId(activityId);
  if (!idValidation.isValid) {
    throw new Error(idValidation.errors.join('; '));
  }

  const result = await context.callDataSource({
    dataSourceName: 'family_activity_checkins',
    methodName: 'wedaGetRecordsV2',
    params: {
      filter: {
        where: {
          $and: [
            { activityId: { $eq: activityId } },
            { userId: { $eq: userId } }
          ]
        }
      },
      pageSize: 1,
      pageNumber: 1
    }
  });

  const checkin = result?.records?.[0];

  return {
    success: true,
    data: {
      hasCheckedIn: !!checkin,
      checkinId: checkin?._id || null,
      checkinTime: checkin?.checkinTime || null,
      checkinLocation: checkin?.checkinLocation || null
    }
  };
}

/**
 * 获取用户的签到记录
 * @param {Object} params - 查询参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 签到记录
 */
async function getUserCheckins(params, context) {
  const { userId } = context;
  const { pageSize = 20, pageNumber = 1 } = params;

  const result = await context.callDataSource({
    dataSourceName: 'family_activity_checkins',
    methodName: 'wedaGetRecordsV2',
    params: {
      filter: {
        where: { userId: { $eq: userId } }
      },
      orderBy: [{ checkinTime: 'desc' }],
      pageSize,
      pageNumber,
      getCount: true,
      select: { $master: true }
    }
  });

  // 获取活动详情
  const checkinsWithActivity = await Promise.all(
    (result.records || []).map(async (checkin) => {
      const activity = await context.callDataSource({
        dataSourceName: 'family_activities',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: { _id: { $eq: checkin.activityId } }
          }
        }
      });

      return {
        ...checkin,
        activity: activity || null
      };
    })
  );

  return {
    success: true,
    data: checkinsWithActivity,
    total: result.total,
    pageSize,
    pageNumber
  };
}

/**
 * 删除签到记录
 * @param {Object} params - 删除参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 删除结果
 */
async function deleteCheckin(params, context) {
  const { checkinId } = params;
  const { userId } = context;

  // 验证签到ID
  const idValidation = validateCheckinId(checkinId);
  if (!idValidation.isValid) {
    throw new Error(idValidation.errors.join('; '));
  }

  // 获取签到记录
  const checkin = await context.callDataSource({
    dataSourceName: 'family_activity_checkins',
    methodName: 'wedaGetItemV2',
    params: {
      filter: {
        where: { _id: { $eq: checkinId } }
      }
    }
  });

  if (!checkin) {
    throw new Error('签到记录不存在');
  }

  // 检查权限（只能删除自己的签到，或管理员可以删除任何人的）
  if (checkin.userId !== userId) {
    // 获取活动信息
    const activity = await context.callDataSource({
      dataSourceName: 'family_activities',
      methodName: 'wedaGetItemV2',
      params: {
        filter: {
          where: { _id: { $eq: checkin.activityId } }
        }
      }
    });

    if (!activity) {
      throw new Error('活动不存在');
    }

    // 检查是否是管理员
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
      throw new Error('您没有权限删除此签到记录');
    }

    const userRole = membership.records[0].role;
    if (userRole !== 'admin') {
      throw new Error('只能删除自己的签到记录');
    }
  }

  // 删除签到记录
  const result = await context.callDataSource({
    dataSourceName: 'family_activity_checkins',
    methodName: 'wedaDeleteV2',
    params: {
      filter: {
        where: { _id: { $eq: checkinId } }
      }
    }
  });

  // 更新报名状态为已报名（从已参加改回）
  await context.callDataSource({
    dataSourceName: 'family_activity_participants',
    methodName: 'wedaUpdateV2',
    params: {
      filter: {
        where: {
          $and: [
            { activityId: { $eq: checkin.activityId } },
            { userId: { $eq: checkin.userId } }
          ]
        }
      },
      data: {
        status: 'registered'
      }
    }
  });

  return {
    success: true,
    message: '签到记录删除成功',
    data: result
  };
}

module.exports = {
  checkin,
  getCheckins,
  getCheckinStats,
  checkCheckin,
  getUserCheckins,
  deleteCheckin
};
