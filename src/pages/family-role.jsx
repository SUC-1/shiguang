// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Heart, ChefHat, ArrowRight, Loader2, Users } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';

export default function FamilyRole(props) {
  const {
    toast
  } = useToast();
  const {
    navigateTo
  } = props.$w.utils;
  const currentUser = props.$w.auth.currentUser || {};
  const [loading, setLoading] = useState(true);
  const [memberCount, setMemberCount] = useState(0);
  const [chefCount, setChefCount] = useState(0);
  const [members, setMembers] = useState([]);
  const [chefs, setChefs] = useState([]);

  // 从 users 数据模型获取家庭成员角色数据
  useEffect(() => {
    fetchRoleUsers();
  }, []);
  const fetchRoleUsers = async () => {
    setLoading(true);
    try {
      // 查询 family_member 角色用户
      const memberResult = await props.$w.cloud.callDataSource({
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
          pageSize: 200,
          pageNumber: 1
        }
      });
      const memberRecords = memberResult.records || [];
      setMemberCount(memberRecords.length);
      setMembers(memberRecords.map(r => ({
        id: r._id,
        nickname: r.nickname,
        avatar: r.avatar,
        role: r.role
      })));

      // 查询 family_chef 角色用户
      const chefResult = await props.$w.cloud.callDataSource({
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
          pageSize: 200,
          pageNumber: 1
        }
      });
      const chefRecords = chefResult.records || [];
      setChefCount(chefRecords.length);
      setChefs(chefRecords.map(r => ({
        id: r._id,
        nickname: r.nickname,
        avatar: r.avatar,
        role: r.role
      })));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '加载失败',
        description: error.message || '获取角色数据失败'
      });
    } finally {
      setLoading(false);
    }
  };

  // 渲染用户头像列表（最多展示3个）
  const renderAvatarList = (users, maxShow = 3) => {
    if (!users || users.length === 0) return null;
    const showUsers = users.slice(0, maxShow);
    const remaining = users.length - maxShow;
    return <div className="flex items-center -space-x-2 mt-2">
        {showUsers.map((u, i) => <img key={u.id} src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nickname || '用户')}&size=80&background=FF8B4E&color=fff`} alt={u.nickname} className="w-8 h-8 rounded-full border-2 border-white object-cover" style={{
        zIndex: maxShow - i
      }} />)}
        {remaining > 0 && <div className="w-8 h-8 rounded-full border-2 border-white bg-[#FCEEB8] flex items-center justify-center text-xs text-[#FF6B35] font-bold" style={{
        zIndex: 0
      }}>
            +{remaining}
          </div>}
      </div>;
  };
  return <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FF8B4E] to-[#FF6B35] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* 头部 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{
          fontFamily: 'Quicksand'
        }}>
            温馨家庭
          </h1>
          <p className="text-lg text-white opacity-90" style={{
          fontFamily: 'Nunito'
        }}>
            {currentUser.nickName || currentUser.name || '用户'}，请选择您的角色
          </p>
        </div>

        {loading ? <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
            <span className="ml-2 text-white text-lg" style={{
          fontFamily: 'Nunito'
        }}>加载中...</span>
          </div> : <div className="grid md:grid-cols-2 gap-6">
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

                {/* 已注册成员统计 */}
                <div className="mt-2 w-full">
                  {memberCount > 0 ? <>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-[#8B7355]" style={{
                    fontFamily: 'Nunito'
                  }}>已注册成员</span>
                        <span className="text-[#FF6B35] font-bold" style={{
                    fontFamily: 'Quicksand'
                  }}>{memberCount} 人</span>
                      </div>
                      {renderAvatarList(members)}
                    </> : <p className="text-sm text-[#8B7355] text-center" style={{
                fontFamily: 'Nunito'
              }}>暂无注册成员</p>}
                </div>

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

                {/* 已注册大厨统计 */}
                <div className="mt-2 w-full">
                  {chefCount > 0 ? <>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-[#8B7355]" style={{
                    fontFamily: 'Nunito'
                  }}>已注册大厨</span>
                        <span className="text-[#FF6B35] font-bold" style={{
                    fontFamily: 'Quicksand'
                  }}>{chefCount} 人</span>
                      </div>
                      {renderAvatarList(chefs)}
                    </> : <p className="text-sm text-[#8B7355] text-center" style={{
                fontFamily: 'Nunito'
              }}>暂无注册大厨</p>}
                </div>

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
          </div>}

        <div className="mt-8 text-center">
          <Button onClick={() => props.$w.utils.navigateBack()} className="bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-12 px-8 font-bold rounded-xl hover:bg-[#FF6B35] hover:text-white transition-colors" style={{
          fontFamily: 'Quicksand'
        }}>
            返回
          </Button>
        </div>
      </div>
    </div>;
}