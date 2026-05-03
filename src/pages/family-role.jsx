// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Heart, ChefHat, ArrowRight, Users, Loader2, RefreshCw } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';

import { ActionCard } from '@/components/ActionCard';
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
  const [registering, setRegistering] = useState(false);
  const [userPermissions, setUserPermissions] = useState(null);
  const [pendingTransitions, setPendingTransitions] = useState([]);
  const [showRoleManagement, setShowRoleManagement] = useState(false);
  const [showRoleTransition, setShowRoleTransition] = useState(false);
  const [roleTransitionForm, setRoleTransitionForm] = useState({
    targetUserId: '',
    targetRole: '',
    reason: ''
  });

  // 获取角色用户数据
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

  // 注册角色
  const handleRegisterRole = async role => {
    setRegistering(true);
    try {
      const openid = currentUser.userId;
      if (!openid) {
        toast({
          variant: 'destructive',
          title: '注册失败',
          description: '无法获取用户信息，请先登录'
        });
        setRegistering(false);
        return;
      }
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'users',
        methodName: 'wedaUpsertV2',
        params: {
          filter: {
            where: {
              $and: [{
                openid: {
                  $eq: openid
                }
              }]
            }
          },
          update: {
            openid,
            nickname: currentUser.nickName || currentUser.name || '',
            avatar: currentUser.avatarUrl || '',
            role,
            isActive: true
          },
          create: {
            openid,
            nickname: currentUser.nickName || currentUser.name || '',
            avatar: currentUser.avatarUrl || '',
            role,
            isActive: true
          }
        }
      });
      if (result && (result.count !== 0 || result.id)) {
        toast({
          variant: 'default',
          title: '注册成功',
          description: role === 'family_member' ? '已注册为家庭成员' : '已注册为家庭大厨'
        });
        await fetchRoleUsers();
        navigateTo({
          pageId: role === 'family_member' ? 'family-member' : 'family-chef',
          params: {}
        });
      } else {
        toast({
          variant: 'destructive',
          title: '注册失败',
          description: '请稍后重试'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '注册失败',
        description: error.message || '网络错误，请稍后重试'
      });
    } finally {
      setRegistering(false);
    }
  };

  // 查询用户权限
  const fetchUserPermissions = async () => {
    try {
      const result = await props.$w.cloud.callFunction({
        name: 'manageFamilyPermissions',
        data: {
          action: 'query',
          queryType: 'byUser',
          userId: currentUser.userId
        }
      });
      if (result.result && result.result.success) {
        setUserPermissions(result.result.data.permissions[0] || null);
      }
    } catch (error) {
      console.error('获取用户权限失败:', error);
    }
  };

  // 查询待审批的角色变更申请
  const fetchPendingTransitions = async () => {
    try {
      const result = await props.$w.cloud.callFunction({
        name: 'manageRoleTransitions',
        data: {
          action: 'query',
          queryType: 'pending'
        }
      });
      if (result.result && result.result.success) {
        setPendingTransitions(result.result.data.transitions || []);
      }
    } catch (error) {
      console.error('获取待审批申请失败:', error);
    }
  };

  // 申请角色变更
  const handleRoleTransition = async () => {
    if (!roleTransitionForm.targetUserId || !roleTransitionForm.targetRole || !roleTransitionForm.reason) {
      toast({
        variant: 'destructive',
        title: '申请失败',
        description: '请填写完整信息'
      });
      return;
    }
    try {
      const result = await props.$w.cloud.callFunction({
        name: 'manageRoleTransitions',
        data: {
          action: 'apply',
          targetUserId: roleTransitionForm.targetUserId,
          familyId: userPermissions?.familyId,
          targetRole: roleTransitionForm.targetRole,
          reason: roleTransitionForm.reason
        }
      });
      if (result.result && result.result.success) {
        toast({
          variant: 'default',
          title: '申请提交成功',
          description: result.result.message
        });
        setShowRoleTransition(false);
        setRoleTransitionForm({
          targetUserId: '',
          targetRole: '',
          reason: ''
        });
        await fetchPendingTransitions();
      } else {
        toast({
          variant: 'destructive',
          title: '申请失败',
          description: result.result?.message || '请重试'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '申请失败',
        description: error.message || '网络错误，请重试'
      });
    }
  };

  // 审批角色变更申请
  const handleApproveTransition = async (transitionId, approve) => {
    try {
      const result = await props.$w.cloud.callFunction({
        name: 'manageRoleTransitions',
        data: {
          action: approve ? 'approve' : 'reject',
          transitionId,
          approvalComment: approve ? '同意申请' : '拒绝申请'
        }
      });
      if (result.result && result.result.success) {
        toast({
          variant: 'default',
          title: approve ? '审批通过' : '审批拒绝',
          description: result.result.message
        });
        await fetchPendingTransitions();
        await fetchRoleUsers();
      } else {
        toast({
          variant: 'destructive',
          title: '审批失败',
          description: result.result?.message || '请重试'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '审批失败',
        description: error.message || '网络错误，请重试'
      });
    }
  };
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchRoleUsers(), fetchUserPermissions(), fetchPendingTransitions()]);
      setLoading(false);
    };
    loadData();
  }, []);
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
  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchRoleUsers(), fetchUserPermissions(), fetchPendingTransitions()]);
    setLoading(false);
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FF8B4E] to-[#FF6B35] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-white animate-spin" />
          <p className="text-white text-lg font-semibold" style={{
          fontFamily: 'Quicksand'
        }}>加载角色数据...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FF8B4E] to-[#FF6B35] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Button className="bg-white/20 text-white border-2 border-white/30 h-10 px-4 rounded-xl hover:bg-white/30" onClick={handleRefresh} title="刷新">
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{
          fontFamily: 'Quicksand'
        }}>温馨家庭</h1>
          <p className="text-lg text-white opacity-90" style={{
          fontFamily: 'Nunito'
        }}>请选择您的角色</p>
          {currentUser.nickName && <p className="text-sm text-white opacity-80 mt-2" style={{
          fontFamily: 'Nunito'
        }}>当前用户：{currentUser.nickName || currentUser.name}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
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

        {memberCount === 0 && chefCount === 0 && <div className="mt-8 bg-white rounded-3xl shadow-xl p-6 text-center">
            <Users className="h-10 w-10 text-[#FF8B4E] mx-auto mb-3" />
            <p className="text-[#8B7355] text-base mb-4" style={{
          fontFamily: 'Nunito'
        }}>您尚未注册任何角色，请选择下方角色进行注册</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => handleRegisterRole('family_member')} disabled={registering} className="bg-[#FF8B4E] text-white h-12 px-6 font-bold rounded-xl hover:bg-[#FF6B35] shadow-lg" style={{
            fontFamily: 'Quicksand'
          }}>
                {registering ? <Loader2 className="h-5 w-5 animate-spin" /> : '注册为家庭成员'}
              </Button>
              <Button onClick={() => handleRegisterRole('family_chef')} disabled={registering} className="bg-[#9CCF4E] text-white h-12 px-6 font-bold rounded-xl hover:bg-[#FF6B35] shadow-lg" style={{
            fontFamily: 'Quicksand'
          }}>
                {registering ? <Loader2 className="h-5 w-5 animate-spin" /> : '注册为家庭大厨'}
              </Button>
            </div>
          </div>}

        {userPermissions && (userPermissions.role === 'admin' || userPermissions.role === 'owner') && <div className="mt-6 text-center">
            <Button onClick={() => setShowRoleManagement(true)} className="bg-[#9CCF4E] text-white h-12 px-6 font-bold rounded-xl hover:bg-[#FF6B35] shadow-lg" style={{
          fontFamily: 'Quicksand'
        }}>角色管理</Button>
          </div>}

        {userPermissions && userPermissions.permissions?.canInviteMembers && <div className="mt-4 text-center">
            <Button onClick={() => setShowRoleTransition(true)} className="bg-[#FF8B4E] text-white h-12 px-6 font-bold rounded-xl hover:bg-[#FF6B35] shadow-lg" style={{
          fontFamily: 'Quicksand'
        }}>申请角色变更</Button>
          </div>}

        <div className="mt-8 text-center">
          <Button onClick={() => window.history.back()} className="bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-12 px-8 font-bold rounded-xl hover:bg-[#FF6B35] hover:text-white transition-colors" style={{
          fontFamily: 'Quicksand'
        }}>返回</Button>
        </div>

        {showRoleManagement && <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#FF6B35]" style={{
              fontFamily: 'Quicksand'
            }}>角色管理</h2>
                <Button className="bg-white text-gray-800 border-2 border-gray-300 rounded-xl p-2 hover:bg-gray-100" onClick={() => setShowRoleManagement(false)}>X</Button>
              </div>
              {pendingTransitions.length > 0 ? <div>
                  <h3 className="text-lg font-semibold text-[#FF6B35] mb-4" style={{
              fontFamily: 'Quicksand'
            }}>待审批申请</h3>
                  <div className="space-y-3">
                    {pendingTransitions.map(transition => <div key={transition._id} className="bg-[#FCEEB8] rounded-xl p-4 border border-[#FF8B4E]">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-[#FF6B35]" style={{
                      fontFamily: 'Quicksand'
                    }}>{transition.targetRole} 申请</p>
                            <p className="text-sm text-[#8B7355]" style={{
                      fontFamily: 'Nunito'
                    }}>原因: {transition.reason}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => handleApproveTransition(transition._id, true)} className="bg-[#9CCF4E] text-white h-8 px-3 rounded-lg text-sm">同意</Button>
                            <Button onClick={() => handleApproveTransition(transition._id, false)} className="bg-[#E85A42] text-white h-8 px-3 rounded-lg text-sm">拒绝</Button>
                          </div>
                        </div>
                      </div>)}
                  </div>
                </div> : <p className="text-center text-[#8B7355] py-4" style={{
            fontFamily: 'Nunito'
          }}>暂无待审批申请</p>}
            </div>
          </div>}

        {showRoleTransition && <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#FF6B35]" style={{
              fontFamily: 'Quicksand'
            }}>申请角色变更</h2>
                <Button className="bg-white text-gray-800 border-2 border-gray-300 rounded-xl p-2 hover:bg-gray-100" onClick={() => setShowRoleTransition(false)}>X</Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-[#FF6B35] mb-2 block" style={{
                fontFamily: 'Quicksand'
              }}>目标用户ID</label>
                  <input type="text" className="w-full border-2 border-[#FF8B4E] rounded-xl h-10 px-3 text-[#8B7355]" placeholder="请输入用户ID" value={roleTransitionForm.targetUserId} onChange={e => setRoleTransitionForm({
                ...roleTransitionForm,
                targetUserId: e.target.value
              })} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#FF6B35] mb-2 block" style={{
                fontFamily: 'Quicksand'
              }}>目标角色</label>
                  <select className="w-full border-2 border-[#FF8B4E] rounded-xl h-10 px-3 text-[#8B7355]" value={roleTransitionForm.targetRole} onChange={e => setRoleTransitionForm({
                ...roleTransitionForm,
                targetRole: e.target.value
              })}>
                    <option value="">请选择角色</option>
                    <option value="member">成员</option>
                    <option value="admin">管理员</option>
                    <option value="owner">所有者</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#FF6B35] mb-2 block" style={{
                fontFamily: 'Quicksand'
              }}>变更原因</label>
                  <textarea className="w-full border-2 border-[#FF8B4E] rounded-xl h-20 px-3 py-2 text-[#8B7355] resize-none" placeholder="请输入变更原因" value={roleTransitionForm.reason} onChange={e => setRoleTransitionForm({
                ...roleTransitionForm,
                reason: e.target.value
              })} />
                </div>
                <Button onClick={handleRoleTransition} className="w-full bg-[#FF8B4E] text-white h-12 font-bold rounded-xl shadow-lg hover:bg-[#FF6B35]" style={{
              fontFamily: 'Quicksand'
            }}>提交申请</Button>
              </div>
            </div>
          </div>}
      </div>
    </div>;
}