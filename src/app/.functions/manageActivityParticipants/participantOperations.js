const {
  validateRegistrationData,
  validateActivityId,
  validateParticipantId,
  validateNotes
} = require('./validators');

/**
 * 报名参加活动
 * @param {Object} params - 报名参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 报名结果
 */
async function registerForActivity(params, context) {
  const { activityId, notes = '' } = params;
  const { userId } = context;

  // 验证活动ID
  const idValidation = validateActivityId(activityId);
  if (!idValidation.isValid) {
    throw new Error(idValidation.errors.join('; '));
  }

  // 验证备注
  const notesValidation = validateNotes(notes);
  if (!notesValidation.isValid) {
    throw new Error(notesValidation.errors.join('; '));
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
    throw new Error('活动已结束，无法报名');
  }
  if (activity.status === 'cancelled') {
    throw new Error('活动已取消，无法报名');
  }

  // 检查用户是否是家庭成员
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
    throw new Error('您不是该家庭的成员，无法报名');
  }

  // 检查是否已报名
  const existingRegistration = await context.callDataSource({
    dataSourceName: 'family_activity_participants',
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

  if (existingRegistration && existingRegistration.records && existingRegistration.records.length > 0) {
    const existing = existingRegistration.records[0];
    if (existing.status === 'registered' || existing.status === 'attended') {
      throw new Error('您已经报名参加了此活动');
    }
    // 如果之前取消了，更新状态为已报名
    if (existing.status === 'cancelled') {
      const result = await context.callDataSource({
        dataSourceName: 'family_activity_participants',
        methodName: 'wedaUpdateV2',
        params: {
          filter: {
            where: { _id: { $eq: existing._id } }
          },
          data: {
            status: 'registered',
            registeredAt: new Date().toISOString(),
            notes: notes || existing.notes
          }
        }
      });

      return {
        success: true,
        message: '重新报名成功',
        data: result
      };
    }
  }

  // 检查报名人数是否已满
  const currentParticipants = await context.callDataSource({
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

  if (currentParticipants && currentParticipants.total >= activity.maxParticipants) {
    throw new Error('活动报名人数已满');
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

  // 创建报名记录
  const result = await context.callDataSource({
    dataSourceName: 'family_activity_participants',
    methodName: 'wedaCreateV2',
    params: {
      data: {
        activityId: activityId,
        userId: userId,
        nickname: user?.nickname || user?.name || '匿名用户',
        avatar: user?.avatar || '',
        status: 'registered',
        registeredAt: new Date().toISOString(),
        notes: notes
      }
    }
  });

  return {
    success: true,
    message: '报名成功',
    data: result
  };
}

/**
 * 取消报名
 * @param {Object} params - 取消参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 取消结果
 */
async function cancelRegistration(params, context) {
  const { participantId } = params;
  const { userId } = context;

  // 验证参与者ID
  const idValidation = validateParticipantId(participantId);
  if (!idValidation.isValid) {
    throw new Error(idValidation.errors.join('; '));
  }

  // 获取报名记录
  const participant = await context.callDataSource({
    dataSourceName: 'family_activity_participants',
    methodName: 'wedaGetItemV2',
    params: {
      filter: {
        where: { _id: { $eq: participantId } }
      }
    }
  });

  if (!participant) {
    throw new Error('报名记录不存在');
  }

  // 检查权限（只能取消自己的报名，或管理员可以取消任何人的）
  if (participant.userId !== userId) {
    // 获取活动信息
    const activity = await context.callDataSource({
      dataSourceName: 'family_activities',
      methodName: 'wedaGetItemV2',
      params: {
        filter: {
          where: { _id: { $eq: participant.activityId } }
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
      throw new Error('您没有权限取消此报名');
    }

    const userRole = membership.records[0].role;
    if (userRole !== 'admin' && activity.createdBy !== userId) {
      throw new Error('只能取消自己的报名');
    }
  }

  // 检查是否已经签到
  if (participant.status === 'attended') {
    throw new Error('您已经参加了此活动，无法取消报名');
  }

  // 更新报名状态为已取消
  const result = await context.callDataSource({
    dataSourceName: 'family_activity_participants',
    methodName: 'wedaUpdateV2',
    params: {
      filter: {
        where: { _id: { $eq: participantId } }
      },
      data: {
        status: 'cancelled'
      }
    }
  });

  return {
    success: true,
    message: '取消报名成功',
    data: result
  };
}

/**
 * 获取参与者列表
 * @param {Object} params - 查询参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 参与者列表
 */
async function getParticipants(params, context) {
  const {
    activityId,
    status = ['registered', 'attended'],
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

  // 查询参与者列表
  const result = await context.callDataSource({
    dataSourceName: 'family_activity_participants',
    methodName: 'wedaGetRecordsV2',
    params: {
      filter: {
        where: {
          $and: [
            { activityId: { $eq: activityId } },
            { status: { $in: status } }
          ]
        }
      },
      orderBy: [{ registeredAt: 'asc' }],
      pageSize,
      pageNumber,
      getCount: true,
      select: { $master: true }
    }
  });

  return {
    success: true,
    data: result.records || [],
    total: result.total,
    pageSize,
    pageNumber
  };
}

/**
 * 获取参与者详情
 * @param {Object} params - 查询参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 参与者详情
 */
async function getParticipantDetail(params, context) {
  const { participantId } = params;

  // 验证参与者ID
  const idValidation = validateParticipantId(participantId);
  if (!idValidation.isValid) {
    throw new Error(idValidation.errors.join('; '));
  }

  const participant = await context.callDataSource({
    dataSourceName: 'family_activity_participants',
    methodName: 'wedaGetItemV2',
    params: {
      filter: {
        where: { _id: { $eq: participantId } }
      }
    }
  });

  if (!participant) {
    throw new Error('报名记录不存在');
  }

  return {
    success: true,
    data: participant
  };
}

/**
 * 检查用户是否已报名
 * @param {Object} params - 查询参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 检查结果
 */
async function checkRegistration(params, context) {
  const { activityId } = params;
  const { userId } = context;

  // 验证活动ID
  const idValidation = validateActivityId(activityId);
  if (!idValidation.isValid) {
    throw new Error(idValidation.errors.join('; '));
  }

  const result = await context.callDataSource({
    dataSourceName: 'family_activity_participants',
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

  const participant = result?.records?.[0];

  return {
    success: true,
    data: {
      isRegistered: participant ? (participant.status === 'registered' || participant.status === 'attended') : false,
      status: participant?.status || null,
      participantId: participant?._id || null
    }
  };
}

/**
 * 获取用户的活动报名列表
 * @param {Object} params - 查询参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 报名列表
 */
async function getUserRegistrations(params, context) {
  const { userId } = context;
  const { status, pageSize = 20, pageNumber = 1 } = params;

  const filter = {
    where: {
      $and: [
        { userId: { $eq: userId } }
      ]
    }
  };

  if (status) {
    filter.where.$and.push({ status: { $eq: status } });
  }

  const result = await context.callDataSource({
    dataSourceName: 'family_activity_participants',
    methodName: 'wedaGetRecordsV2',
    params: {
      filter,
      orderBy: [{ registeredAt: 'desc' }],
      pageSize,
      pageNumber,
      getCount: true,
      select: { $master: true }
    }
  });

  // 获取活动详情
  const registrationsWithActivity = await Promise.all(
    (result.records || []).map(async (registration) => {
      const activity = await context.callDataSource({
        dataSourceName: 'family_activities',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: { _id: { $eq: registration.activityId } }
          }
        }
      });

      return {
        ...registration,
        activity: activity || null
      };
    })
  );

  return {
    success: true,
    data: registrationsWithActivity,
    total: result.total,
    pageSize,
    pageNumber
  };
}

module.exports = {
  registerForActivity,
  cancelRegistration,
  getParticipants,
  getParticipantDetail,
  checkRegistration,
  getUserRegistrations
};
