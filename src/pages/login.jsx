// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { useToast, Button, Input } from '@/components/ui';
// @ts-ignore;
import { Heart, Phone, Smartphone, ArrowRight, ShieldCheck, Lock, User, MessageCircle } from 'lucide-react';

export default function Login(props) {
  const {
    toast
  } = useToast();
  const {
    navigateTo
  } = props.$w.utils.navigateTo;
  const currentUser = props.$w.auth.currentUser || {};
  const [loginMethod, setLoginMethod] = useState('wechat'); // wechat | phone
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [showIdentitySelection, setShowIdentitySelection] = useState(false);
  const [showPhoneBinding, setShowPhoneBinding] = useState(false);
  const [loading, setLoading] = useState(false);

  // 发送验证码
  const handleSendCode = async () => {
    if (!phoneNumber || !/^1[3-9]\d{9}$/.test(phoneNumber)) {
      toast({
        variant: 'destructive',
        title: '手机号格式错误',
        description: '请输入正确的手机号码'
      });
      return;
    }
    try {
      // 调用云函数发送验证码
      // const result = await props.$w.cloud.callFunction({
      //   name: 'sendVerificationCode',
      //   data: { phoneNumber }
      // });

      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      toast({
        variant: 'default',
        title: '验证码已发送',
        description: '请查收短信验证码'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '发送失败',
        description: error.message || '请重试'
      });
    }
  };

  // 微信登录
  const handleWeChatLogin = async () => {
    setLoading(true);
    try {
      // 调用云函数进行微信登录
      // const result = await props.$w.cloud.callFunction({
      //   name: 'wechatLogin',
      //   data: {}
      // });

      // 模拟微信登录成功，检查是否需要绑定手机号
      const needBinding = true; // 模拟需要绑定手机号

      if (needBinding) {
        setShowPhoneBinding(true);
      } else {
        setShowIdentitySelection(true);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '微信登录失败',
        description: error.message || '请重试'
      });
    } finally {
      setLoading(false);
    }
  };

  // 手机号登录
  const handlePhoneLogin = async () => {
    setLoading(true);
    try {
      // 调用云函数进行手机号登录
      // const result = await props.$w.cloud.callFunction({
      //   name: 'phoneLogin',
      //   data: { phoneNumber, code: verificationCode }
      // });

      setShowIdentitySelection(true);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '登录失败',
        description: error.message || '请重试'
      });
    } finally {
      setLoading(false);
    }
  };

  // 绑定手机号
  const handleBindPhone = async () => {
    setLoading(true);
    try {
      // 调用云函数绑定手机号
      // const result = await props.$w.cloud.callFunction({
      //   name: 'bindPhoneNumber',
      //   data: { phoneNumber, code: verificationCode }
      // });

      setShowPhoneBinding(false);
      setShowIdentitySelection(true);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '绑定失败',
        description: error.message || '请重试'
      });
    } finally {
      setLoading(false);
    }
  };

  // 选择身份
  const handleSelectIdentity = async identity => {
    try {
      // 调用云函数保存用户身份
      // const result = await props.$w.cloud.callFunction({
      //   name: 'selectIdentity',
      //   data: { identity }
      // });

      toast({
        variant: 'default',
        title: '欢迎回来',
        description: identity === 'family' ? '欢迎来到温馨家庭' : '欢迎来到餐饮小食'
      });

      // 根据身份跳转到对应页面
      if (identity === 'family') {
        navigateTo({
          pageId: 'home',
          params: {}
        });
      } else {
        navigateTo({
          pageId: 'dining',
          params: {}
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '选择失败',
        description: error.message || '请重试'
      });
    }
  };

  // 渲染登录方式选择
  const renderLoginMethod = () => <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FF8B4E] to-[#FF6B35] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#FF8B4E] to-[#FF6B35] rounded-full mb-4 shadow-lg">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#FF6B35] mb-2" style={{
          fontFamily: 'Quicksand'
        }}>
            欢迎来到食光
          </h1>
          <p className="text-[#8B7355]" style={{
          fontFamily: 'Nunito'
        }}>
            记录每一餐的美好时光
          </p>
        </div>

        {/* 登录方式切换 */}
        <div className="flex gap-3 mb-6">
          <Button className={`flex-1 h-12 font-bold rounded-xl ${loginMethod === 'wechat' ? 'bg-[#FF8B4E] text-white' : 'bg-white text-[#FF6B35] border-2 border-[#FF6B35]'}`} onClick={() => setLoginMethod('wechat')} style={{
          fontFamily: 'Quicksand'
        }}>
            微信登录
          </Button>
          <Button className={`flex-1 h-12 font-bold rounded-xl ${loginMethod === 'phone' ? 'bg-[#FF8B4E] text-white' : 'bg-white text-[#FF6B35] border-2 border-[#FF6B35]'}`} onClick={() => setLoginMethod('phone')} style={{
          fontFamily: 'Quicksand'
        }}>
            手机登录
          </Button>
        </div>

        {/* 微信登录 */}
        {loginMethod === 'wechat' && <div className="space-y-4">
            <Button className="w-full h-14 bg-[#07C160] text-white font-bold rounded-xl shadow-lg hover:bg-[#06A850] flex items-center gap-3" onClick={handleWeChatLogin} disabled={loading} style={{
          fontFamily: 'Quicksand'
        }}>
              <Smartphone className="h-6 w-6" />
              <span>{loading ? '登录中...' : '微信一键授权登录'}</span>
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-[#FCEEB8] border-dashed"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-[#8B7355]" style={{
              fontFamily: 'Nunito'
            }}>
                  或使用手机号登录
                </span>
              </div>
            </div>
          </div>}

        {/* 手机号登录 */}
        {loginMethod === 'phone' && <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#8B7355]" style={{
            fontFamily: 'Nunito'
          }}>
                手机号码
              </label>
              <Input type="tel" placeholder="请输入手机号码" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="h-12 bg-[#FCEEB8] border-2 border-[#FF8B4E] rounded-xl focus:border-[#FF6B35]" style={{
            fontFamily: 'Nunito'
          }} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#8B7355]" style={{
            fontFamily: 'Nunito'
          }}>
                验证码
              </label>
              <div className="flex gap-3">
                <Input type="text" placeholder="请输入验证码" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} className="flex-1 h-12 bg-[#FCEEB8] border-2 border-[#FF8B4E] rounded-xl focus:border-[#FF6B35]" style={{
              fontFamily: 'Nunito'
            }} />
                <Button className={`h-12 px-6 font-bold rounded-xl ${countdown > 0 ? 'bg-[#FCEEB8] text-[#8B7355] cursor-not-allowed' : 'bg-[#FF8B4E] text-white hover:bg-[#FF6B35]'}`} onClick={handleSendCode} disabled={countdown > 0} style={{
              fontFamily: 'Quicksand'
            }}>
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </Button>
              </div>
            </div>

            <Button className="w-full h-14 bg-[#FF8B4E] text-white font-bold rounded-xl shadow-lg hover:bg-[#FF6B35]" onClick={handlePhoneLogin} disabled={loading || !phoneNumber || !verificationCode} style={{
          fontFamily: 'Quicksand'
        }}>
              {loading ? '登录中...' : '登录'}
            </Button>
          </div>}

        {/* 协议说明 */}
        <div className="mt-6 text-center text-xs text-[#8B7355]" style={{
        fontFamily: 'Nunito'
      }}>
          登录即表示您同意
          <button className="text-[#FF6B35] font-semibold hover:underline">
            《用户协议》
          </button>
          和
          <button className="text-[#FF6B35] font-semibold hover:underline">
            《隐私政策》
          </button>
        </div>
      </div>
    </div>;

  // 渲染手机号绑定
  const renderPhoneBinding = () => <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FF8B4E] to-[#FF6B35] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        {/* 头部 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#9CCF4E] to-[#FF8B4E] rounded-full mb-4 shadow-lg">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#FF6B35] mb-2" style={{
          fontFamily: 'Quicksand'
        }}>
            绑定手机号
          </h1>
          <p className="text-[#8B7355]" style={{
          fontFamily: 'Nunito'
        }}>
            为了您的账户安全，请绑定手机号
          </p>
        </div>

        {/* 表单 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#8B7355]" style={{
            fontFamily: 'Nunito'
          }}>
              手机号码
            </label>
            <Input type="tel" placeholder="请输入手机号码" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="h-12 bg-[#FCEEB8] border-2 border-[#FF8B4E] rounded-xl focus:border-[#FF6B35]" style={{
            fontFamily: 'Nunito'
          }} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#8B7355]" style={{
            fontFamily: 'Nunito'
          }}>
              验证码
            </label>
            <div className="flex gap-3">
              <Input type="text" placeholder="请输入验证码" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} className="flex-1 h-12 bg-[#FCEEB8] border-2 border-[#FF8B4E] rounded-xl focus:border-[#FF6B35]" style={{
              fontFamily: 'Nunito'
            }} />
              <Button className={`h-12 px-6 font-bold rounded-xl ${countdown > 0 ? 'bg-[#FCEEB8] text-[#8B7355] cursor-not-allowed' : 'bg-[#FF8B4E] text-white hover:bg-[#FF6B35]'}`} onClick={handleSendCode} disabled={countdown > 0} style={{
              fontFamily: 'Quicksand'
            }}>
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </Button>
            </div>
          </div>

          <Button className="w-full h-14 bg-[#FF8B4E] text-white font-bold rounded-xl shadow-lg hover:bg-[#FF6B35]" onClick={handleBindPhone} disabled={loading || !phoneNumber || !verificationCode} style={{
          fontFamily: 'Quicksand'
        }}>
            {loading ? '绑定中...' : '完成绑定'}
          </Button>
        </div>

        {/* 返回按钮 */}
        <Button variant="ghost" className="w-full mt-4 text-[#8B7355] hover:text-[#FF6B35]" onClick={() => setShowPhoneBinding(false)} style={{
        fontFamily: 'Nunito'
      }}>
          返回登录
        </Button>
      </div>
    </div>;

  // 渲染身份选择
  const renderIdentitySelection = () => <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FF8B4E] to-[#FF6B35] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        {/* 头部 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#FF8B4E] to-[#FF6B35] rounded-full mb-4 shadow-lg animate-bounce">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#FF6B35] mb-2" style={{
          fontFamily: 'Quicksand'
        }}>
            选择您的身份
          </h1>
          <p className="text-[#8B7355]" style={{
          fontFamily: 'Nunito'
        }}>
            请选择您在食光中的身份
          </p>
        </div>

        {/* 身份选项 */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#FCEEB8] to-[#FF8B4E] rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-[#FF6B35]" onClick={() => handleSelectIdentity('family')}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md">
                <Heart className="h-8 w-8 text-[#FF8B4E]" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#FF6B35] mb-1" style={{
                fontFamily: 'Quicksand'
              }}>
                  温馨家庭
                </h3>
                <p className="text-sm text-white" style={{
                fontFamily: 'Nunito'
              }}>
                  家庭成员点菜、留言
                </p>
              </div>
              <ArrowRight className="h-6 w-6 text-white" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#FCEEB8] to-[#9CCF4E] rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-[#FF6B35]" onClick={() => handleSelectIdentity('dining')}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md">
                <Smartphone className="h-8 w-8 text-[#9CCF4E]" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#FF6B35] mb-1" style={{
                fontFamily: 'Quicksand'
              }}>
                  餐饮小食
                </h3>
                <p className="text-sm text-white" style={{
                fontFamily: 'Nunito'
              }}>
                  餐厅管理、订单处理
                </p>
              </div>
              <ArrowRight className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* 安全提示 */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#8B7355]" style={{
        fontFamily: 'Nunito'
      }}>
          <ShieldCheck className="h-4 w-4" />
          <span>您的账户已通过安全验证</span>
        </div>
      </div>
    </div>;
  return <>
      {showIdentitySelection ? renderIdentitySelection() : showPhoneBinding ? renderPhoneBinding() : renderLoginMethod()}
    </>;
}