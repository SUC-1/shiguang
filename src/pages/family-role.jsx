// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Heart, ChefHat, ArrowRight, Users, Loader2 } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';

export default function FamilyRole(props) {
  const {
    navigateTo
  } = props.$w.utils;
  const currentUser = props.$w.auth.currentUser || {};
  const {
    toast
  } = useToast();
  const [memberCount, setMemberCount] = useState(0);
  const [chefCount, setChefCount] = useState(0);
  const [memberUsers, setMemberUsers] = useState([]);
  const [chefUsers, setChefUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 获取角色用户数据 — 调用 manageUsers 云函数
  const fetchRoleUsers = async () => {
    try {
      const [memberResult, chefResult] = await Promise.all([props.$w.cloud.callFunction({
        name: 'manageUsers',
        data: {
          action: 'query',
          queryType: 'byRole',
          role: 'family_member',
          page: 1,
          pageSize: 10
        }
      }), props.$w.cloud.callFunction({
        name: 'manageUsers',
        data: {
          action: 'query',
          queryType: 'byRole',
          role: 'family_chef',
          page: 1,
          pageSize: 10
        }
      })]);
      if (memberResult.result && memberResult.result.success) {
        const users = memberResult.result.data && memberResult.result.data.users || [];
        const mappedUsers = users.map(u => ({
          _id: u._id,
          nickname: u.nickname,
          avatar: u.avatar,
          role: u.role,
          isActive: u.isActive
        }));
        setMemberCount(memberResult.result.data ? memberResult.result.data.total : mappedUsers.length);
        setMemberUsers(mappedUsers.slice(0, 3));
      }
      if (chefResult.result && chefResult.result.success) {
        const users = chefResult.result.data && chefResult.result.data.users || [];
        const mappedUsers = users.map(u => ({
          _id: u._id,
          nickname: u.nickname,
          avatar: u.avatar,
          role: u.role,
          isActive: u.isActive
        }));
        setChefCount(chefResult.result.data ? chefResult.result.data.total : mappedUsers.length);
        setChefUsers(mappedUsers.slice(0, 3));
      }
      if (!memberResult.result?.success && !chefResult.result?.success) {
        toast({
          variant: 'destructive',
          title: '获取用户数据失败',
          description: memberResult.result && memberResult.result.message || chefResult.result && chefResult.result.message || '请稍后重试'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '获取用户数据失败',
        description: error.message || '网络错误，请稍后重试'
      });
    }
  };

  // 角色切换 — 调用 manageUsers 云函数更新当前用户角色
  const handleSwitchRole = async newRole => {
    if (!currentUser.userId) {
      toast({
        variant: 'destructive',
        title: '切换角色失败',
        description: '未获取到当前用户信息，请先登录'
      });
      return;
    }
    try {
      const result = await props.$w.cloud.callFunction({
        name: 'manageUsers',
        data: {
          action: 'update',
          userId: currentUser.userId,
          role: newRole
        }
      });
      if (result.result && result.result.success) {
        toast({
          variant: 'default',
          title: '角色切换成功',
          description: `已切换为${newRole === 'family_member' ? '家庭成员' : '家庭大厨'}`
        });
        await fetchRoleUsers();
      } else {
        toast({
          variant: 'destructive',
          title: '角色切换失败',
          description: result.result && result.result.message || '请稍后重试'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '角色切换失败',
        description: error.message || '网络错误，请稍后重试'
      });
    }
  };

  // 页面初始化
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchRoleUsers();
      setLoading(false);
    };
    loadData();
  }, []);

  // 渲染头像列表
  const renderAvatarList = (users, maxShow) => {
    if (!users || users.length === 0) return null;
    const display = users.slice(0, maxShow);
    const remaining = users.length - maxShow;
    return <div className="flex items-center -space-x-2 mt-3">
        {display.map((user, index) => <div key={user._id || index} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm">
            {user.avatar ? <img src={user.avatar} alt={user.nickname} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#FF8B4E] flex items-center justify-center text-white text-xs font-bold">
                {(user.nickname || '?')[0]}
              </div>}
          </div>)}
        {remaining > 0 && <div className="w-8 h-8 rounded-full border-2 border-white bg-[#FF6B35] flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">+{remaining}</span>
          </div>}
      </div>;
  };

  // 渲染用户列表详情
  const renderUserList = (users, roleLabel) => {
    if (!users || users.length === 0) return <p className="text-sm text-[#8B7355]" style={{
      fontFamily: 'Nunito'
    }}>暂无注册{roleLabel}</p>;
    return <div className="space-y-2 mt-3">
        {users.map(user => <div key={user._id} className="flex items-center gap-3 bg-[#FCEEB8] rounded-xl px-3 py-2">
            <div className="w-8 h-8 rounded-full border-2 border-[#FF8B4E] overflow-hidden shadow-sm flex-shrink-0">
              {user.avatar ? <img src={user.avatar} alt={user.nickname} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#FF8B4E] flex items-center justify-center text-white text-xs font-bold">
                  {(user.nickname || '?')[0]}
                </div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#FF6B35] truncate" style={{
            fontFamily: 'Quicksand'
          }}>{user.nickname || '未命名'}</p>
              <p className={`text-xs font-semibold ${user.isActive ? 'text-[#9CCF4E]' : 'text-[#E85A42]'}`} style={{
            fontFamily: 'Nunito'
          }}>{user.isActive ? '在线' : '离线'}</p>
            </div>
          </div>)}
      </div>;
  };

  // 加载状态
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FF8B4E] to-[#FF6B35] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-white animate-spin" />
          <p className="text-white text-lg font-semibold" style={{
          fontFamily: 'Quicksand'
        }}>加载中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FF8B4E] to-[#FF6B35] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2" style={{
          fontFamily: 'Quicksand'
        }}>
            温馨家庭
          </h1>
          <p className="text-lg text-white opacity-90" style={{
          fontFamily: 'Nunito'
        }}>
            请选择您的角色
          </p>
          {currentUser.nickName && <p className="text-sm text-white opacity-80 mt-2" style={{
          fontFamily: 'Nunito'
        }}>
              当前用户：{currentUser.nickName || currentUser.name}
            </p>}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* 家庭成员卡片 */}
          <div onClick={() => navigateTo({
          pageId: 'family-member',
          params: {}
        })} className="bg-white rounded-3xl shadow-2xl p-8 cursor-pointer hover:shadow-3xl transition-all hover:scale-105 group">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FF8B4E] to-[#FF6B35] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#FF6B35]" style={{
              fontFamily: 'Quicksand'
            }}>家庭成员</h2>
              <p className="text-base text-[#8B7355] text-center" style={{
              fontFamily: 'Nunito'
            }}>点菜、留言、分享美食</p>
              {memberCount > 0 ? <div className="text-center">
                  <p className="text-sm text-[#8B7355]" style={{
                fontFamily: 'Nunito'
              }}>已注册 {memberCount} 位成员</p>
                  {renderAvatarList(memberUsers, 3)}
                </div> : <p className="text-sm text-[#8B7355]" style={{
              fontFamily: 'Nunito'
            }}>暂无注册成员</p>}
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm text-[#FF6B35] font-semibold" style={{
                fontFamily: 'Nunito'
              }}>进入点菜</span>
                <ArrowRight className="h-5 w-5 text-[#FF6B35] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* 家庭大厨卡片 */}
          <div onClick={() => navigateTo({
          pageId: 'family-chef',
          params: {}
        })} className="bg-white rounded-3xl shadow-2xl p-8 cursor-pointer hover:shadow-3xl transition-all hover:scale-105 group">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-[#9CCF4E] to-[#FF6B35] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <ChefHat className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#FF6B35]" style={{
              fontFamily: 'Quicksand'
            }}>家庭大厨</h2>
              <p className="text-base text-[#8B7355] text-center" style={{
              fontFamily: 'Nunito'
            }}>查看订单、准备食材、烹饪指导</p>
              {chefCount > 0 ? <div className="text-center">
                  <p className="text-sm text-[#8B7355]" style={{
                fontFamily: 'Nunito'
              }}>已注册 {chefCount} 位大厨</p>
                  {renderAvatarList(chefUsers, 3)}
                </div> : <p className="text-sm text-[#8B7355]" style={{
              fontFamily: 'Nunito'
            }}>暂无注册大厨</p>}
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm text-[#FF6B35] font-semibold" style={{
                fontFamily: 'Nunito'
              }}>进入管理</span>
                <ArrowRight className="h-5 w-5 text-[#FF6B35] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* 角色列表详情 */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-[#FF6B35] mb-3" style={{
            fontFamily: 'Quicksand'
          }}>
              <Heart className="h-5 w-5 inline mr-1" />成员列表
            </h3>
            {renderUserList(memberUsers, '成员')}
          </div>
          <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-[#FF6B35] mb-3" style={{
            fontFamily: 'Quicksand'
          }}>
              <ChefHat className="h-5 w-5 inline mr-1" />大厨列表
            </h3>
            {renderUserList(chefUsers, '大厨')}
          </div>
        </div>

        {/* 角色切换区域 */}
        {currentUser.userId && <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-[#FF6B35] mb-4" style={{
          fontFamily: 'Quicksand'
        }}>
              <Users className="h-5 w-5 inline mr-1" />切换我的角色
            </h3>
            <p className="text-sm text-[#8B7355] mb-4" style={{
          fontFamily: 'Nunito'
        }}>当前用户：{currentUser.nickName || currentUser.name || '未知'}</p>
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => handleSwitchRole('family_member')} className="bg-gradient-to-r from-[#FF8B4E] to-[#FF6B35] text-white h-12 px-4 font-bold rounded-xl hover:opacity-90 transition-opacity" style={{
            fontFamily: 'Quicksand'
          }}>切换为家庭成员</Button>
              <Button onClick={() => handleSwitchRole('family_chef')} className="bg-gradient-to-r from-[#9CCF4E] to-[#FF6B35] text-white h-12 px-4 font-bold rounded-xl hover:opacity-90 transition-opacity" style={{
            fontFamily: 'Quicksand'
          }}>切换为家庭大厨</Button>
            </div>
          </div>}

        <div className="text-center">
          <Button onClick={() => window.history.back()} className="bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-12 px-8 font-bold rounded-xl hover:bg-[#FF6B35] hover:text-white transition-colors" style={{
          fontFamily: 'Quicksand'
        }}>返回</Button>
        </div>
      </div>
    </div>;
}