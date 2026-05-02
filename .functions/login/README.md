# login 云函数

用户登录与身份绑定云函数，支持微信一键授权登录、手机号验证码登录、绑定手机号和选择身份功能。

## 功能说明

### 1. 微信登录 (loginType: wechat, action: login)
- 通过微信 openid 进行登录
- 如果用户不存在，自动创建新用户
- 如果未绑定手机号，返回 needBinding: true
- 如果未选择身份，返回 needIdentitySelection: true

### 2. 手机号登录 (loginType: phone, action: login)
- 通过手机号和验证码进行登录
- 验证手机号格式和验证码有效性
- 如果用户不存在，自动创建新用户
- 如果未选择身份，返回 needIdentitySelection: true

### 3. 绑定手机号 (action: bindPhone)
- 需要传入 openid、手机号和验证码
- 验证手机号格式和验证码有效性
- 绑定成功后检查是否需要选择身份

### 4. 选择身份 (action: selectIdentity)
- 需要传入 openid 和 identity (family 或 dining)
- 更新用户的身份角色信息

## 调用示例

### 微信登录
```javascript
const result = await tcb.cloud.callFunction({
  name: 'login',
  data: {
    loginType: 'wechat',
    action: 'login',
    openid: 'wx_openid_here', // 可选，未传入会自动获取
    nickname: '用户昵称',
    avatar: '头像URL'
  }
});
// 返回示例：需要绑定手机号
// {
//   success: true,
//   message: '登录成功，需要绑定手机号',
//   user: { openid: 'wx_openid_here', nickname: '用户昵称', ... },
//   needBinding: true,
//   needIdentitySelection: false
// }
```

### 手机号登录
```javascript
const result = await tcb.cloud.callFunction({
  name: 'login',
  data: {
    loginType: 'phone',
    action: 'login',
    phoneNumber: '13800138000',
    verificationCode: '123456'
  }
});
// 返回示例：需要选择身份
// {
//   success: true,
//   message: '登录成功，需要选择身份',
//   user: { phone: '13800138000', ... },
//   needBinding: false,
//   needIdentitySelection: true
// }
```

### 绑定手机号
```javascript
const result = await tcb.cloud.callFunction({
  name: 'login',
  data: {
    loginType: 'wechat',
    action: 'bindPhone',
    openid: 'wx_openid_here',
    phoneNumber: '13800138000',
    verificationCode: '123456'
  }
});
```

### 选择身份
```javascript
const result = await tcb.cloud.callFunction({
  name: 'login',
  data: {
    loginType: 'wechat',
    action: 'selectIdentity',
    openid: 'wx_openid_here',
    identity: 'family' // 或 'dining'
  }
});
```

## 数据模型说明

该函数依赖于 `users` 数据模型（数据库集合），包含以下字段：
- `openid`: 微信 openid
- `nickname`: 用户昵称
- `phone`: 手机号
- `role`: 身份角色 (family/dining)
- `avatar`: 头像
- `isActive`: 是否激活
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

## 注意事项

1. 验证码验证目前是模拟验证，实际项目中需要对接短信服务商
2. 手机号验证使用正则表达式：`1[3-9]开头的11位数字`
3. 微信 openid 未传入时，会尝试从微信上下文自动获取
4. 所有数据库操作都有错误处理，返回友好的错误信息

## 响应格式

```javascript
{
  success: boolean,  // 是否成功
  message: string,   // 操作结果消息
  user: object,      // 用户信息对象
  needBinding: boolean,    // 是否需要绑定手机号
  needIdentitySelection: boolean  // 是否需要选择身份
}
```