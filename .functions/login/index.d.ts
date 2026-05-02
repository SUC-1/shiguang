interface LoginEvent {
  loginType: 'wechat' | 'phone';
  phoneNumber?: string;
  verificationCode?: string;
  openid?: string;
  nickname?: string;
  avatar?: string;
  action: 'login' | 'bindPhone' | 'selectIdentity';
  identity?: 'family' | 'dining';
}

interface UserInfo {
  openid?: string;
  nickname?: string;
  phone?: string;
  role?: 'family' | 'dining' | null;
  avatar?: string;
  isActive?: boolean;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user?: UserInfo;
  needBinding?: boolean;
  needIdentitySelection?: boolean;
}

export declare function main(event: LoginEvent, context: any): Promise<LoginResponse>;