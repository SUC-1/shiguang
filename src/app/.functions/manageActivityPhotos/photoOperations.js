const {
  validatePhotoData,
  validatePhotoId,
  validateActivityId
} = require('./validators');

/**
 * 上传照片
 * @param {Object} params - 上传参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 上传结果
 */
async function uploadPhoto(params, context) {
  const { activityId, url, thumbnailUrl = '', description = '' } = params;
  const { userId } = context;

  // 验证数据
  const validation = validatePhotoData({ activityId, url, thumbnailUrl, description });
  if (!validation.isValid) {
    throw new Error(validation.errors.join('; '));
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
    throw new Error('您不是该家庭的成员，无法上传照片');
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

  // 创建照片记录
  const result = await context.callDataSource({
    dataSourceName: 'family_activity_photos',
    methodName: 'wedaCreateV2',
    params: {
      data: {
        activityId: activityId,
        url: url.trim(),
        thumbnailUrl: thumbnailUrl.trim() || url.trim(),
        description: description.trim(),
        uploadedBy: userId,
        uploaderNickname: user?.nickname || user?.name || '匿名用户',
        uploadedAt: new Date().toISOString()
      }
    }
  });

  return {
    success: true,
    message: '照片上传成功',
    data: result
  };
}

/**
 * 获取活动照片列表
 * @param {Object} params - 查询参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 照片列表
 */
async function getPhotos(params, context) {
  const {
    activityId,
    pageSize = 50,
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

  // 查询照片列表
  const result = await context.callDataSource({
    dataSourceName: 'family_activity_photos',
    methodName: 'wedaGetRecordsV2',
    params: {
      filter: {
        where: { activityId: { $eq: activityId } }
      },
      orderBy: [{ uploadedAt: 'desc' }],
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
 * 获取照片详情
 * @param {Object} params - 查询参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 照片详情
 */
async function getPhotoDetail(params, context) {
  const { photoId } = params;

  // 验证照片ID
  const idValidation = validatePhotoId(photoId);
  if (!idValidation.isValid) {
    throw new Error(idValidation.errors.join('; '));
  }

  const photo = await context.callDataSource({
    dataSourceName: 'family_activity_photos',
    methodName: 'wedaGetItemV2',
    params: {
      filter: {
        where: { _id: { $eq: photoId } }
      }
    }
  });

  if (!photo) {
    throw new Error('照片不存在');
  }

  return {
    success: true,
    data: photo
  };
}

/**
 * 更新照片信息
 * @param {Object} params - 更新参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 更新结果
 */
async function updatePhoto(params, context) {
  const { photoId, description } = params;
  const { userId } = context;

  // 验证照片ID
  const idValidation = validatePhotoId(photoId);
  if (!idValidation.isValid) {
    throw new Error(idValidation.errors.join('; '));
  }

  // 获取照片详情
  const photo = await context.callDataSource({
    dataSourceName: 'family_activity_photos',
    methodName: 'wedaGetItemV2',
    params: {
      filter: {
        where: { _id: { $eq: photoId } }
      }
    }
  });

  if (!photo) {
    throw new Error('照片不存在');
  }

  // 检查权限（只能更新自己上传的照片，或管理员可以更新任何人的）
  if (photo.uploadedBy !== userId) {
    // 获取活动信息
    const activity = await context.callDataSource({
      dataSourceName: 'family_activities',
      methodName: 'wedaGetItemV2',
      params: {
        filter: {
          where: { _id: { $eq: photo.activityId } }
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
      throw new Error('您没有权限更新此照片');
    }

    const userRole = membership.records[0].role;
    if (userRole !== 'admin') {
      throw new Error('只能更新自己上传的照片');
    }
  }

  // 更新照片
  const result = await context.callDataSource({
    dataSourceName: 'family_activity_photos',
    methodName: 'wedaUpdateV2',
    params: {
      filter: {
        where: { _id: { $eq: photoId } }
      },
      data: {
        description: description !== undefined ? description.trim() : photo.description
      }
    }
  });

  return {
    success: true,
    message: '照片更新成功',
    data: result
  };
}

/**
 * 删除照片
 * @param {Object} params - 删除参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 删除结果
 */
async function deletePhoto(params, context) {
  const { photoId } = params;
  const { userId } = context;

  // 验证照片ID
  const idValidation = validatePhotoId(photoId);
  if (!idValidation.isValid) {
    throw new Error(idValidation.errors.join('; '));
  }

  // 获取照片详情
  const photo = await context.callDataSource({
    dataSourceName: 'family_activity_photos',
    methodName: 'wedaGetItemV2',
    params: {
      filter: {
        where: { _id: { $eq: photoId } }
      }
    }
  });

  if (!photo) {
    throw new Error('照片不存在');
  }

  // 检查权限（只能删除自己上传的照片，或管理员可以删除任何人的）
  if (photo.uploadedBy !== userId) {
    // 获取活动信息
    const activity = await context.callDataSource({
      dataSourceName: 'family_activities',
      methodName: 'wedaGetItemV2',
      params: {
        filter: {
          where: { _id: { $eq: photo.activityId } }
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
      throw new Error('您没有权限删除此照片');
    }

    const userRole = membership.records[0].role;
    if (userRole !== 'admin') {
      throw new Error('只能删除自己上传的照片');
    }
  }

  // 删除照片
  const result = await context.callDataSource({
    dataSourceName: 'family_activity_photos',
    methodName: 'wedaDeleteV2',
    params: {
      filter: {
        where: { _id: { $eq: photoId } }
      }
    }
  });

  return {
    success: true,
    message: '照片删除成功',
    data: result
  };
}

/**
 * 批量上传照片
 * @param {Object} params - 上传参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 上传结果
 */
async function batchUploadPhotos(params, context) {
  const { activityId, photos } = params;
  const { userId } = context;

  // 验证活动ID
  const idValidation = validateActivityId(activityId);
  if (!idValidation.isValid) {
    throw new Error(idValidation.errors.join('; '));
  }

  if (!Array.isArray(photos) || photos.length === 0) {
    throw new Error('照片列表不能为空');
  }

  if (photos.length > 50) {
    throw new Error('单次最多上传50张照片');
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
    throw new Error('您不是该家庭的成员，无法上传照片');
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

  const uploaderNickname = user?.nickname || user?.name || '匿名用户';
  const uploadedAt = new Date().toISOString();

  // 批量创建照片记录
  const results = await Promise.all(
    photos.map(async (photo) => {
      const validation = validatePhotoData({
        activityId,
        url: photo.url,
        thumbnailUrl: photo.thumbnailUrl,
        description: photo.description
      });

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join('; '),
          url: photo.url
        };
      }

      try {
        const result = await context.callDataSource({
          dataSourceName: 'family_activity_photos',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              activityId: activityId,
              url: photo.url.trim(),
              thumbnailUrl: (photo.thumbnailUrl || photo.url).trim(),
              description: (photo.description || '').trim(),
              uploadedBy: userId,
              uploaderNickname: uploaderNickname,
              uploadedAt: uploadedAt
            }
          }
        });

        return {
          success: true,
          data: result
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          url: photo.url
        };
      }
    })
  );

  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;

  return {
    success: true,
    message: `上传完成：成功 ${successCount} 张，失败 ${failCount} 张`,
    data: {
      total: results.length,
      successCount,
      failCount,
      results
    }
  };
}

/**
 * 获取用户上传的照片
 * @param {Object} params - 查询参数
 * @param {Object} context - 云函数上下文
 * @returns {Promise<Object>} - 照片列表
 */
async function getUserPhotos(params, context) {
  const { userId } = context;
  const { pageSize = 20, pageNumber = 1 } = params;

  const result = await context.callDataSource({
    dataSourceName: 'family_activity_photos',
    methodName: 'wedaGetRecordsV2',
    params: {
      filter: {
        where: { uploadedBy: { $eq: userId } }
      },
      orderBy: [{ uploadedAt: 'desc' }],
      pageSize,
      pageNumber,
      getCount: true,
      select: { $master: true }
    }
  });

  // 获取活动详情
  const photosWithActivity = await Promise.all(
    (result.records || []).map(async (photo) => {
      const activity = await context.callDataSource({
        dataSourceName: 'family_activities',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: { _id: { $eq: photo.activityId } }
          }
        }
      });

      return {
        ...photo,
        activity: activity || null
      };
    })
  );

  return {
    success: true,
    data: photosWithActivity,
    total: result.total,
    pageSize,
    pageNumber
  };
}

module.exports = {
  uploadPhoto,
  getPhotos,
  getPhotoDetail,
  updatePhoto,
  deletePhoto,
  batchUploadPhotos,
  getUserPhotos
};
