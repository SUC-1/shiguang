// 登录云函数主入口

const { initCloudBase, findUserByOpenid, findUserByPhone, createUser, updateUser, formatUserInfo } = require('./userOperations');
const { validatePhoneNumber, validateVerificationCode, validateRequiredParams } = require('./validators');

/**
 * 处理微信登录
 * @param {object} event - 事件数据
 * @returns {object} 登录结果
 */
async function handleWechatLogin(event) {
  const app = initCloudBase();
  const { openid, nickname, avatar } = event;

  // 获取微信上下文（如果未传入 openid）
  let wxContext = null;
  if (!openid) {
    wxContext = await app.auth().getWXContext();
  }
  const userOpenid = openid || wxContext?.openid;

  if (!userOpenid) {
    return {
      success: false,
      message: '获取微信 openid 失败'
    };
  }

  // 根据 openid 查询用户
  let user = await findUserByOpenid(app, userOpenid);

  // 如果用户不存在，创建新用户
  if (!user) {
    user = await createUser(app, {
      openid: userOpenid,
      nickname: nickname || null,
      avatar: avatar || null,
      phone: null,
      role: null
    });
  }

  // 检查是否需要绑定手机号
  if (!user.phone) {
    return {
      success: true,
      message: '登录成功，需要绑定手机号',
      user: formatUserInfo(user),
      needBinding: true,
      needIdentitySelection: false
    };
  }

  // 检查是否需要选择身份
  if (!user.role) {
    return {
      success: true,
      message: '登录成功，需要选择身份',
      user: formatUserInfo(user),
      needBinding: false,
      needIdentitySelection: true
    };
  }

  // 返回完整用户信息
  return {
    success: true,
    message: '登录成功',
    user: formatUserInfo(user),
    needBinding: false,
    needIdentitySelection: false
  };
}

/**
 * 处理手机号登录
 * @param {object} event - 事件数据
 * @returns {object} 登录结果
 */
async function handlePhoneLogin(event) {
  const app = initCloudBase();
  const { phoneNumber, verificationCode } = event;

  // 验证手机号格式
  if (!validatePhoneNumber(phoneNumber)) {
    return {
      success: false,
      message: '手机号格式不正确'
    };
  }

  // 验证验证码
  if (!validateVerificationCode(verificationCode)) {
    return {
      success: false,
      message: '验证码不正确或已过期'
    };
  }

  // 根据 phone 查询用户
  let user = await findUserByPhone(app, phoneNumber);

  // 如果用户不存在，创建新用户
  if (!user) {
    user = await createUser(app, {
      openid: null,
      nickname: null,
      avatar: null,
      phone: phoneNumber,
      role: null
    });
  }

  // 检查是否需要选择身份
  if (!user.role) {
    return {
      success: true,
      message: '登录成功，需要选择身份',
      user: formatUserInfo(user),
      needBinding: false,
      needIdentitySelection: true
    };
  }

  // 返回完整用户信息
  return {
    success: true,
    message: '登录成功',
    user: formatUserInfo(user),
    needBinding: false,
    needIdentitySelection: false
  };
}

/**
 * 处理绑定手机号
 * @param {object} event - 事件数据
 * @returns {object} 绑定结果
 */
async function handleBindPhone(event) {
  const app = initCloudBase();
  const { openid, phoneNumber, verificationCode } = event;

  // 验证必需参数
  if (!validateRequiredParams(event, ['openid', 'phoneNumber', 'verificationCode'])) {
    return {
      success: false,
      message: '缺少必需参数'
    };
  }

  // 验证手机号格式
  if (!validatePhoneNumber(phoneNumber)) {
    return {
      success: false,
      message: '手机号格式不正确'
    };
  }

  // 验证验证码
  if (!validateVerificationCode(verificationCode)) {
    return {
      success: false,
      message: '验证码不正确或已过期'
    };
  }

  // 根据 openid 查询用户
  let user = await findUserByOpenid(app, openid);
  if (!user) {
    return {
      success: false,
      message: '用户不存在'
    };
  }

  // 更新用户手机号
  await updateUser(app, user._id, { phone: phoneNumber });
  user.phone = phoneNumber;

  // 检查是否需要选择身份
  if (!user.role) {
    return {
      success: true,
      message: '绑定手机号成功，需要选择身份',
      user: formatUserInfo(user),
      needBinding: false,
      needIdentitySelection: true
    };
  }

  return {
    success: true,
    message: '绑定手机号成功',
    user: formatUserInfo(user),
    needBinding: false,
    needIdentitySelection: false
  };
}

/**
 * 处理选择身份
 * @param {object} event - 事件数据
 * @returns {object} 选择结果
 */
async function handleSelectIdentity(event) {
  const app = initCloudBase();
  const { openid, identity } = event;

  // 验证必需参数
  if (!validateRequiredParams(event, ['openid', 'identity'])) {
    return {
      success: false,
      message: '缺少必需参数'
    };
  }

  // 验证身份类型
  if (!['family', 'dining'].includes(identity)) {
    return {
      success: false,
      message: '身份类型不正确，必须是 family 或 dining'
    };
  }

  // 根据 openid 查询用户
  let user = await findUserByOpenid(app, openid);
  if (!user) {
    return {
      success: false,
      message: '用户不存在'
    };
  }

  // 更新用户身份
  await updateUser(app, user._id, { role: identity });
  user.role = identity;

  return {
    success: true,
    message: '选择身份成功',
    user: formatUserInfo(user),
    needBinding: false,
    needIdentitySelection: false
  };
}

/**
 * 云函数主入口
 * @param {object} event - 事件数据
 * @param {object} context - 上下文数据
 * @returns {object} 响应结果
 */
exports.main = async function(event, context) {
  try {
    const { loginType, action } = event;

    // 验证必需参数
    if (!loginType || !action) {
      return {
        success: false,
        message: '缺少必需参数 loginType 或 action'
      };
    }

    // 根据不同操作类型处理
    switch (action) {
      case 'login':
        if (loginType === 'wechat') {
          return await handleWechatLogin(event);
        } else if (loginType === 'phone') {
          return await handlePhoneLogin(event);
        } else {
          return {
            success: false,
            message: '不支持的登录类型，必须是 wechat 或 phone'
          };
        }

      case 'bindPhone':
        return await handleBindPhone(event);

      case 'selectIdentity':
        return await handleSelectIdentity(event);

      default:
        return {
          success: false,
          message: '不支持的操作类型，必须是 login、bindPhone 或 selectIdentity'
        };
    }
  } catch (error) {
    console.error('云函数执行失败:', error);
    return {
      success: false,
      message: error.message || '云函数执行失败'
    };
  }
};