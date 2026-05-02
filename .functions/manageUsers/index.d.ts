interface CreateParams {
  action: 'create';
  /** 微信 OpenID */
  openid: string;
  /** 用户昵称 */
  nickname: string;
  /** 手机号 */
  phone: string;
  /** 身份角色 */
  role: 'family_member' | 'family_chef' | 'dining_manager';
  /** 头像 URL */
  avatar?: string;
  /** 是否激活 */
  isActive?: boolean;
}

interface QueryParams {
  action: 'query';
  /** 查询方式 */
  queryType: 'all' | 'byRole' | 'byIsActive';
  /** 用户角色（queryType=byRole 时必填） */
  role?: 'family_member' | 'family_chef' | 'dining_manager';
  /** 启用状态（queryType=byIsActive 时必填） */
  isActive?: boolean;
  /** 分页页码，从 1 开始 */
  page?: number;
  /** 每页数量，默认 20 */
  pageSize?: number;
}

interface UpdateParams {
  action: 'update';
  /** 用户 ID */
  userId: string;
  /** 用户昵称 */
  nickname?: string;
  /** 手机号 */
  phone?: string;
  /** 身份角色 */
  role?: 'family_member' | 'family_chef' | 'dining_manager';
  /** 头像 URL */
  avatar?: string;
  /** 是否激活 */
  isActive?: boolean;
}

interface DeleteParams {
  action: 'delete';
  /** 用户 ID */
  userId: string;
}

interface UserInfo {
  _id: string;
  openid: string;
  nickname: string;
  phone: string;
  role: string;
  avatar: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResult {
  users: UserInfo[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface CreateUserResponse {
  success: boolean;
  message: string;
  user?: UserInfo;
}

interface QueryUsersResponse {
  success: boolean;
  message: string;
  data?: PaginatedResult;
}

interface UpdateUserResponse {
  success: boolean;
  message: string;
  user?: UserInfo;
}

interface DeleteUserResponse {
  success: boolean;
  message: string;
}

export declare function main(event: CreateParams | QueryParams | UpdateParams | DeleteParams, context: any): Promise<CreateUserResponse | QueryUsersResponse | UpdateUserResponse | DeleteUserResponse>;