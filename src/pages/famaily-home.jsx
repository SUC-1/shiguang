// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { Heart, Clock, Users, ChefHat, ShoppingBag, MessageSquare, TrendingUp, Calendar, Star, ArrowRight, Loader2, RefreshCw, Wallet, CheckCircle, Inbox } from 'lucide-react';

// @ts-ignore;
import TabBar from '@/components/TabBar';
// @ts-ignore;
import { EmptyState, LoadingState } from '@/components/EmptyState';
// @ts-ignore;
import { ActionButton } from '@/components/ActionButton';
export default function FamilyHome(props) {
  const {
    toast
  } = useToast();
  const {
    navigateTo
  } = props.$w.utils;
  const currentUser = props.$w.auth.currentUser || {};
  const [activeTab, setActiveTab] = useState('home');
  const [recentOrders, setRecentOrders] = useState([]);
  const [todayStats, setTodayStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    cookingOrders: 0,
    pendingOrders: 0
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [familyGroup, setFamilyGroup] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [userPermissions, setUserPermissions] = useState(null);
  const [pendingTransitions, setPendingTransitions] = useState([]);

  // 获取家庭订单数据 — 直接查询 orders 数据模型
  const fetchOrders = async () => {
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'orders',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                businessType: {
                  $eq: 'family'
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
      });
      if (result && result.records) {
        const orders = result.records.map(order => ({
          id: order._id,
          userName: order.userName,
          dishes: (order.dishes || []).map(d => `${d.name} x${d.quantity}`),
          status: order.status,
          timestamp: new Date(order.createdAt),
          total: order.total || 0
        }));
        setRecentOrders(orders);
        const total = result.total || orders.length;
        const completed = orders.filter(o => o.status === 'completed').length;
        const cooking = orders.filter(o => o.status === 'cooking').length;
        const pending = orders.filter(o => o.status === 'pending').length;
        setTodayStats({
          totalOrders: total,
          completedOrders: completed,
          cookingOrders: cooking,
          pendingOrders: pending
        });
      } else {
        toast({
          variant: 'destructive',
          title: '获取订单失败',
          description: '请稍后重试'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '获取订单失败',
        description: error.message || '网络错误，请稍后重试'
      });
    }
  };

  // 获取最新留言 — 直接查询 message_boards 数据模型
  const fetchMessages = async () => {
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'message_boards',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {}
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 5,
          pageNumber: 1
        }
      });
      if (result && result.records) {
        const messages = result.records.map(msg => ({
          id: msg._id,
          content: msg.content,
          senderName: msg.senderName,
          backgroundColor: msg.backgroundColor || '#FF8B4E',
          category: msg.category,
          createdAt: new Date(msg.createdAt)
        }));
        setRecentMessages(messages);
      }
    } catch (error) {
      console.error('获取留言失败:', error);
    }
  };

  // 获取家庭组信息 — 查询 family_groups 数据模型
  const fetchFamilyGroup = async () => {
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'family_groups',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                status: {
                  $eq: 'active'
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
          pageSize: 1,
          pageNumber: 1
        }
      });
      if (result && result.records && result.records.length > 0) {
        const group = result.records[0];
        setFamilyGroup({
          id: group._id,
          name: group.name,
          description: group.description,
          coverImage: group.coverImage,
          maxMembers: group.maxMembers,
          inviteCode: group.inviteCode
        });
        return group;
      }
    } catch (error) {
      console.error('获取家庭组失败:', error);
    }
    return null;
  };

  // 获取用户权限 — 调用 manageFamilyPermissions 云函数
  const fetchUserPermissions = async () => {
    try {
      const group = await fetchFamilyGroup();
      if (!group) {
        console.error('未找到活跃的家庭组');
        return;
      }
      const result = await props.$w.cloud.callFunction({
        name: 'manageFamilyPermissions',
        data: {
          action: 'verify',
          userId: currentUser.userId,
          familyId: group._id,
          requiredPermission: 'canViewReports'
        }
      });
      if (result.result && result.result.success) {
        setUserPermissions({
          hasPermission: result.result.hasPermission,
          role: result.result.role,
          permissions: result.result.permissions
        });
      }
    } catch (error) {
      console.error('获取用户权限失败:', error);
    }
  };

  // 获取待审批的角色变更申请 — 调用 manageRoleTransitions 云函数
  const fetchPendingTransitions = async () => {
    try {
      const group = await fetchFamilyGroup();
      if (!group) {
        console.error('未找到活跃的家庭组');
        return;
      }
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

  // 获取家庭成员列表 — 查询 family_memberships 数据模型
  const fetchFamilyMembers = async groupId => {
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'family_memberships',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                familyGroupId: {
                  $eq: groupId
                }
              }, {
                status: {
                  $eq: 'active'
                }
              }]
            }
          },
          orderBy: [{
            joinDate: 'asc'
          }],
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 20,
          pageNumber: 1
        }
      });
      if (result && result.records) {
        setFamilyMembers(result.records.map(m => ({
          id: m._id,
          nickname: m.nickname,
          role: m.role,
          permissions: m.permissions || [],
          status: m.status
        })));
      }
    } catch (error) {
      console.error('获取家庭成员失败:', error);
    }
  };

  // 页面初始化加载数据
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const group = await fetchFamilyGroup();
      const promises = [fetchOrders(), fetchMessages()];
      if (group) {
        promises.push(fetchFamilyMembers(group._id));
        promises.push(fetchUserPermissions());
        promises.push(fetchPendingTransitions());
      }
      await Promise.all(promises);
      setLoading(false);
    };
    loadData();
  }, []);
  const formatTime = date => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return `${diff}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    return `${Math.floor(diff / 3600)}小时前`;
  };
  // 加载状态
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FF8B4E] to-[#FF6B35] flex items-center justify-center pb-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-white animate-spin" />
          <p className="text-white text-lg font-semibold" style={{
          fontFamily: 'Quicksand'
        }}>加载中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FF8B4E] to-[#FF6B35] pb-20">
      <div className="max-w-6xl mx-auto p-6">
        {/* 头部欢迎区 + 家庭组信息 */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {familyGroup && familyGroup.coverImage ? <img src={familyGroup.coverImage} alt={familyGroup.name} className="w-16 h-16 rounded-full object-cover shadow-lg" /> : <div className="w-16 h-16 bg-gradient-to-br from-[#FF8B4E] to-[#FF6B35] rounded-full flex items-center justify-center shadow-lg">
                  <Heart className="h-8 w-8 text-white" />
                </div>}
              <div>
                <h1 className="text-2xl font-bold text-[#FF6B35]" style={{
                fontFamily: 'Quicksand'
              }}>{familyGroup ? familyGroup.name : currentUser.nickName || currentUser.name || '亲爱的用户'}</h1>
                <p className="text-base text-[#8B7355]" style={{
                fontFamily: 'Nunito'
              }}>{familyGroup ? familyGroup.description : '欢迎回到温馨家庭'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button className="bg-white text-[#8B7355] h-10 w-10 p-0 rounded-xl hover:bg-[#FCEEB8]" onClick={() => {
              setLoading(true);
              const group = familyGroup;
              const promises = [fetchOrders(), fetchMessages()];
              if (group) {
                promises.push(fetchFamilyMembers(group.id));
                promises.push(fetchUserPermissions());
                promises.push(fetchPendingTransitions());
              }
              Promise.all(promises).finally(() => setLoading(false));
            }}>
                <RefreshCw className="h-5 w-5" />
              </Button>
              
              {/* 权限管理按钮（管理员可见） */}
              {userPermissions && (userPermissions.role === 'admin' || userPermissions.role === 'owner') && <Button className="bg-[#9CCF4E] text-white h-12 px-4 font-bold rounded-xl hover:bg-[#FF6B35] shadow-lg" onClick={() => navigateTo({
              pageId: 'family-role',
              params: {}
            })} style={{
              fontFamily: 'Quicksand'
            }}>
                  权限管理
                </Button>}
              
              <Button className="bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-12 px-4 font-bold rounded-xl hover:bg-[#FF6B35] hover:text-white" onClick={() => navigateTo({
              pageId: 'famaily-role',
              params: {}
            })} style={{
              fontFamily: 'Quicksand'
            }}>切换角色</Button>
            </div>
          </div>
          {familyGroup && <div className="mt-4 flex items-center gap-4 text-sm text-[#8B7355]" style={{
          fontFamily: 'Nunito'
        }}>
              <span>成员上限: {familyGroup.maxMembers || '不限'}</span>
              <span>邀请码: <span className="font-bold text-[#FF6B35]">{familyGroup.inviteCode || '无'}</span></span>
              <span>当前成员: {familyMembers.length}</span>
              
              {/* 权限状态显示 */}
              {userPermissions && <span>
                角色: <span className={`font-bold ${userPermissions.role === 'owner' ? 'text-[#FF6B35]' : userPermissions.role === 'admin' ? 'text-[#9CCF4E]' : 'text-[#FF8B4E]'}`}>{userPermissions.role === 'owner' ? '所有者' : userPermissions.role === 'admin' ? '管理员' : '成员'}</span>
              </span>}
              
              {/* 待审批申请数量（管理员可见） */}
              {userPermissions && (userPermissions.role === 'admin' || userPermissions.role === 'owner') && pendingTransitions.length > 0 && <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-[#E85A42] rounded-full animate-pulse"></span>
                待审批: <span className="font-bold text-[#E85A42]">{pendingTransitions.length}</span>
              </span>}
            </div>}
        </div>

        {/* 今日统计 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="h-6 w-6 text-[#FF8B4E]" />
              <span className="text-sm text-[#8B7355]" style={{
              fontFamily: 'Nunito'
            }}>总订单</span>
            </div>
            <p className="text-3xl font-bold text-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
              {todayStats.totalOrders}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-6 w-6 text-[#9CCF4E]" />
              <span className="text-sm text-[#8B7355]" style={{
              fontFamily: 'Nunito'
            }}>已完成</span>
            </div>
            <p className="text-3xl font-bold text-[#9CCF4E]" style={{
            fontFamily: 'Quicksand'
          }}>
              {todayStats.completedOrders}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ChefHat className="h-6 w-6 text-[#FF8B4E]" />
              <span className="text-sm text-[#8B7355]" style={{
              fontFamily: 'Nunito'
            }}>烹饪中</span>
            </div>
            <p className="text-3xl font-bold text-[#FF8B4E]" style={{
            fontFamily: 'Quicksand'
          }}>
              {todayStats.cookingOrders}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-6 w-6 text-[#FF6B35]" />
              <span className="text-sm text-[#8B7355]" style={{
              fontFamily: 'Nunito'
            }}>待处理</span>
            </div>
            <p className="text-3xl font-bold text-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
              {todayStats.pendingOrders}
            </p>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
              快捷操作
            </h2>
            {userPermissions && (userPermissions.role === 'admin' || userPermissions.role === 'owner') && pendingTransitions.length > 0 && <Button className="bg-[#E85A42] text-white h-8 px-3 rounded-lg text-sm font-bold hover:bg-[#FF6B35]" onClick={() => navigateTo({
            pageId: 'family-role',
            params: {}
          })}>
              处理申请 ({pendingTransitions.length})
            </Button>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Button onClick={() => navigateTo({
            pageId: 'family-member',
            params: {}
          })} className="bg-gradient-to-br from-[#FF8B4E] to-[#FF6B35] text-white h-20 flex flex-col items-center justify-center gap-2 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <ChefHat className="h-8 w-8" />
              <span className="font-bold text-xs" style={{
              fontFamily: 'Quicksand'
            }}>开始点菜</span>
            </Button>
            <Button onClick={() => navigateTo({
            pageId: 'family-chef',
            params: {}
          })} className="bg-gradient-to-br from-[#9CCF4E] to-[#FF6B35] text-white h-20 flex flex-col items-center justify-center gap-2 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <MessageSquare className="h-8 w-8" />
              <span className="font-bold text-xs" style={{
              fontFamily: 'Quicksand'
            }}>查看订单</span>
            </Button>
            
            {/* 家庭活动 */}
            <Button onClick={() => navigateTo({
            pageId: 'family-activities',
            params: {}
          })} className="bg-gradient-to-br from-[#E85A42] to-[#FF6B35] text-white h-20 flex flex-col items-center justify-center gap-2 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <Calendar className="h-8 w-8" />
              <span className="font-bold text-xs" style={{
              fontFamily: 'Quicksand'
            }}>家庭活动</span>
            </Button>
            
            {/* 财务管理 */}
            <Button onClick={() => navigateTo({
            pageId: 'family-finance-records',
            params: {}
          })} className="bg-gradient-to-br from-[#27AE60] to-[#9CCF4E] text-white h-20 flex flex-col items-center justify-center gap-2 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <Wallet className="h-8 w-8" />
              <span className="font-bold text-xs" style={{
              fontFamily: 'Quicksand'
            }}>财务管理</span>
            </Button>
            
            {/* 任务系统 */}
            <Button onClick={() => navigateTo({
            pageId: 'family-tasks',
            params: {}
          })} className="bg-gradient-to-br from-[#9B59B6] to-[#E74C3C] text-white h-20 flex flex-col items-center justify-center gap-2 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <CheckCircle className="h-8 w-8" />
              <span className="font-bold text-xs" style={{
              fontFamily: 'Quicksand'
            }}>任务系统</span>
            </Button>
            
            {/* 日程共享 */}
            <Button onClick={() => navigateTo({
            pageId: 'family-calendar',
            params: {}
          })} className="bg-gradient-to-br from-[#3498DB] to-[#2980B9] text-white h-20 flex flex-col items-center justify-center gap-2 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <Calendar className="h-8 w-8" />
              <span className="font-bold text-xs" style={{
              fontFamily: 'Quicksand'
            }}>日程共享</span>
            </Button>
          </div>
        </div>

        {/* 家庭成员列表 */}
        {familyMembers.length > 0 && <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
                <Users className="h-6 w-6 inline mr-2" />家庭成员
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#8B7355]" style={{
              fontFamily: 'Nunito'
            }}>{familyMembers.length} 位成员</span>
                
                {/* 角色统计 */}
                {userPermissions && (userPermissions.role === 'admin' || userPermissions.role === 'owner') && <div className="flex items-center gap-3 text-xs text-[#8B7355]">
                    <span>管理员: {familyMembers.filter(m => m.role === 'admin').length}</span>
                    <span>成员: {familyMembers.filter(m => m.role === 'member').length}</span>
                  </div>}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {familyMembers.map(member => <div key={member.id} className="flex items-center gap-2 bg-[#FCEEB8] rounded-xl px-3 py-2 shadow-sm">
                  <div className="w-8 h-8 bg-[#FF8B4E] rounded-full flex items-center justify-center text-white text-sm font-bold" style={{
              fontFamily: 'Quicksand'
            }}>{member.nickname ? member.nickname.charAt(0) : '?'}</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#FF6B35]" style={{
                fontFamily: 'Quicksand'
              }}>{member.nickname || '未命名'}</p>
                    <p className={`text-xs font-semibold ${member.role === 'owner' ? 'text-[#FF6B35]' : member.role === 'admin' ? 'text-[#9CCF4E]' : 'text-[#FF8B4E]'}`} style={{
                fontFamily: 'Nunito'
              }}>
                      {member.role === 'owner' ? '所有者' : member.role === 'admin' ? '管理员' : '成员'}
                    </p>
                  </div>
                  
                  {/* 权限管理入口（管理员可见） */}
                  {userPermissions && (userPermissions.role === 'admin' || userPermissions.role === 'owner') && member.role !== 'owner' && <Button className="bg-white text-[#8B7355] h-6 px-2 rounded-lg text-xs hover:bg-[#FF8B4E] hover:text-white" onClick={() => navigateTo({
              pageId: 'family-role',
              params: {}
            })}>
                      管理
                    </Button>}
                </div>)}
            </div>
          </div>}

        {/* 最新订单 */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
              <TrendingUp className="h-6 w-6 inline mr-2" />
              最新订单
            </h2>
            <Button onClick={() => navigateTo({
            pageId: 'family-chef',
            params: {}
          })} className="text-[#FF6B35] font-semibold hover:text-[#FF8B4E]" style={{
            fontFamily: 'Nunito'
          }}>查看全部</Button>
          </div>

          <div className="space-y-4">
            {recentOrders.length === 0 && <EmptyState icon="inbox" title="暂无订单" description="还没有订单，快去点菜吧" actionText="去点菜" onAction={() => navigateTo({
            pageId: 'family-member',
            params: {}
          })} />}
            {recentOrders.map(order => <div key={order.id} className="bg-[#FCEEB8] rounded-2xl p-4 border-2 border-[#FF8B4E] border-dashed">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#FF6B35]" />
                    <span className="text-lg font-semibold text-[#FF6B35]" style={{
                  fontFamily: 'Quicksand'
                }}>{order.userName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#8B7355]" />
                    <span className="text-sm text-[#8B7355]" style={{
                  fontFamily: 'Nunito'
                }}>{formatTime(order.timestamp)}</span>
                  </div>
                </div>
                <div className="space-y-1 mb-3">
                  {order.dishes.map((dish, index) => <div key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#FF8B4E] rounded-full" />
                      <span className="text-sm text-[#8B7355]" style={{
                  fontFamily: 'Nunito'
                }}>{dish}</span>
                    </div>)}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'cooking' ? 'bg-[#FF8B4E] text-white' : order.status === 'pending' ? 'bg-[#FF6B35] text-white' : order.status === 'cancelled' ? 'bg-[#E85A42] text-white' : 'bg-[#9CCF4E] text-white'}`} style={{
                fontFamily: 'Nunito'
              }}>
                    {order.status === 'cooking' ? '烹饪中' : order.status === 'pending' ? '待处理' : order.status === 'cancelled' ? '已取消' : '已完成'}
                  </span>
                  <Button className="bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-8 px-3 font-bold rounded-xl hover:bg-[#FF6B35] hover:text-white" onClick={() => navigateTo({
                pageId: 'family-chef',
                params: {}
              })} style={{
                fontFamily: 'Nunito'
              }}>详情</Button>
                </div>
              </div>)}
          </div>
        </div>

        {/* 最新留言 */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
              <MessageSquare className="h-6 w-6 inline mr-2" />
              最新留言
            </h2>
          </div>

          <div className="space-y-3">
            {recentMessages.length === 0 && <div className="text-center py-6">
                <MessageSquare className="h-10 w-10 text-[#FF8B4E] mx-auto mb-3" />
                <p className="text-[#8B7355]" style={{
              fontFamily: 'Nunito'
            }}>暂无留言</p>
              </div>}
            {recentMessages.map(msg => <div key={msg.id} className="rounded-2xl p-4" style={{
            backgroundColor: msg.backgroundColor
          }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white" style={{
                fontFamily: 'Quicksand'
              }}>{msg.senderName}</span>
                  <span className="text-xs text-white/70" style={{
                fontFamily: 'Nunito'
              }}>{formatTime(msg.createdAt)}</span>
                </div>
                <p className="text-sm text-white" style={{
              fontFamily: 'Nunito'
            }}>{msg.content}</p>
              </div>)}
          </div>
        </div>
      </div>

      {/* 底部导航栏 */}
      <TabBar activeTab={activeTab} navigateTo={navigateTo} onTabChange={tabId => {
      setActiveTab(tabId);
      if (tabId === 'member') {
        navigateTo({
          pageId: 'family-member',
          params: {}
        });
      } else if (tabId === 'chef') {
        navigateTo({
          pageId: 'family-chef',
          params: {}
        });
      }
    }} userRole="family" />
    </div>;
}