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

  // 获取角色用户数据 — 直接查询 users 数据模型
  const fetchRoleUsers = async () => {
    try {
      const [memberResult, chefResult] = await Promise.all([props.$w.cloud.callDataSource({
        dataSourceName: 'users',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                role: {
                  $eq: 'family_member'
                }
              }, {
                isActive: {
                  $eq: true
                }
              }]
            }
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 10,
          pageNumber: 1
        }
      }), props.$w.cloud.callDataSource({
        dataSourceName: 'users',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                role: {
                  $eq: 'family_chef'
                }
              }, {
                isActive: {
                  $eq: true
                }
              }]
            }
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 10,
          pageNumber: 1
        }
      })]);
      if (memberResult && memberResult.records) {
        const users = memberResult.records.map(u => ({
          _id: u._id,
          nickname: u.nickname,
          avatar: u.avatar,
          role: u.role,
          isActive: u.isActive
        }));
        setMemberCount(memberResult.total || users.length);
        setMemberUsers(users.slice(0, 3));
      }
      if (chefResult && chefResult.records) {
        const users = chefResult.records.map(u => ({
          _id: u._id,
          nickname: u.nickname,
          avatar: u.avatar,
          role: u.role,
          isActive: u.isActive
        }));
        setChefCount(chefResult.total || users.length);
        setChefUsers(users.slice(0, 3));
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '获取用户数据失败',
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

        <div className="grid md:grid-cols-2 gap-6">
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
            }}>
                家庭成员
              </h2>
              <p className="text-base text-[#8B7355] text-center" style={{
              fontFamily: 'Nunito'
            }}>
                点菜、留言、分享美食
              </p>
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
              }}>
                  进入点菜
                </span>
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
            }}>
                家庭大厨
              </h2>
              <p className="text-base text-[#8B7355] text-center" style={{
              fontFamily: 'Nunito'
            }}>
                查看订单、准备食材、烹饪指导
              </p>
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
              }}>
                  进入管理
                </span>
                <ArrowRight className="h-5 w-5 text-[#FF6B35] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button onClick={() => window.history.back()} className="bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-12 px-8 font-bold rounded-xl hover:bg-[#FF6B35] hover:text-white transition-colors" style={{
          fontFamily: 'Quicksand'
        }}>
            返回
          </Button>
        </div>
      </div>
    </div>;
}