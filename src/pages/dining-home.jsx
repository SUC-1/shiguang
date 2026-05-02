// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { Store, ShoppingCart, Utensils, QrCode, TrendingUp, Users, Clock, CheckCircle, Sparkles, Loader2 } from 'lucide-react';

import TabBar from '@/components/TabBar';
export default function DiningHome(props) {
  const {
    toast
  } = useToast();
  const {
    navigateTo
  } = props.$w.utils;
  const currentUser = props.$w.auth.currentUser || {};
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const formatTime = date => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return `${diff}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    return `${Math.floor(diff / 3600)}小时前`;
  };
  const getStatusColor = status => {
    switch (status) {
      case 'pending':
        return '#FF8B4E';
      case 'cooking':
        return '#9CCF4E';
      case 'completed':
        return '#FF6B35';
      default:
        return '#8B7355';
    }
  };
  const getStatusText = status => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'cooking':
        return '烹饪中';
      case 'completed':
        return '已完成';
      default:
        return '未知';
    }
  };

  // 获取统计数据
  const fetchStats = async () => {
    try {
      // 获取餐饮端所有订单
      const allOrdersResult = await props.$w.cloud.callDataSource({
        dataSourceName: 'orders',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                businessType: {
                  $eq: 'dining'
                }
              }]
            }
          },
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 200,
          pageNumber: 1
        }
      });

      // 获取今日订单（今日0点之后创建的）
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayOrdersResult = await props.$w.cloud.callDataSource({
        dataSourceName: 'orders',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                businessType: {
                  $eq: 'dining'
                }
              }, {
                createdAt: {
                  $gte: todayStart.getTime()
                }
              }]
            }
          },
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 1,
          pageNumber: 1
        }
      });
      const allOrders = allOrdersResult.records || [];
      const todayCount = todayOrdersResult.total || 0;
      const completedOrders = allOrders.filter(o => o.status === 'completed').length;
      const pendingOrders = allOrders.filter(o => o.status === 'pending').length;
      const totalRevenue = allOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.total || 0), 0);
      const todayOrders = allOrders.filter(o => {
        const created = new Date(o.createdAt);
        return created >= todayStart;
      });
      const todayRevenue = todayOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.total || 0), 0);
      setStats({
        totalOrders: allOrdersResult.total || allOrders.length,
        todayOrders: todayCount,
        completedOrders: completedOrders,
        pendingOrders: pendingOrders,
        totalRevenue: totalRevenue,
        todayRevenue: todayRevenue
      });
    } catch (e) {
      toast({
        title: '获取统计数据失败',
        description: e.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 获取最新订单
  const fetchRecentOrders = async () => {
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'orders',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                businessType: {
                  $eq: 'dining'
                }
              }]
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 5,
          pageNumber: 1
        }
      });
      const orders = (result.records || []).map(record => ({
        id: record._id,
        customerName: record.userName,
        dishes: Array.isArray(record.dishes) ? record.dishes : [],
        total: record.total || 0,
        status: record.status || 'pending',
        timestamp: new Date(record.createdAt)
      }));
      setRecentOrders(orders);
    } catch (e) {
      toast({
        title: '获取订单列表失败',
        description: e.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 更新订单状态
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const result = await props.$w.cloud.callFunction({
        name: 'manageOrders',
        data: {
          action: 'updateStatus',
          orderId: orderId,
          status: newStatus
        }
      });
      if (result.result && result.result.success) {
        toast({
          title: '订单状态已更新',
          description: `订单已更新为${getStatusText(newStatus)}`
        });
        fetchRecentOrders();
        fetchStats();
      } else {
        toast({
          title: '更新失败',
          description: result.result && result.result.message || '请稍后重试',
          variant: 'destructive'
        });
      }
    } catch (e) {
      toast({
        title: '更新失败',
        description: e.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 初始加载
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchRecentOrders()]);
      setLoading(false);
    };
    loadData();
  }, []);
  return <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FF8B4E] to-[#FF6B35]">
      <div className="max-w-6xl mx-auto p-6 pb-24">
        {/* 头部欢迎区域 */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Store className="h-10 w-10 text-[#FF8B4E]" />
            <div>
              <h1 className="text-2xl font-bold text-[#FF6B35]" style={{
              fontFamily: 'Quicksand'
            }}>
                餐饮小食管理
              </h1>
              <p className="text-sm text-[#8B7355]" style={{
              fontFamily: 'Nunito'
            }}>
                欢迎回来，{currentUser.nickName || '商家'}
              </p>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-[#FF8B4E] to-[#FF6B35] rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium" style={{
                fontFamily: 'Nunito'
              }}>总订单</span>
              </div>
              <p className="text-3xl font-bold" style={{
              fontFamily: 'Quicksand'
            }}>{loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats.totalOrders}</p>
            </div>
            <div className="bg-gradient-to-br from-[#9CCF4E] to-[#7AB84E] rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium" style={{
                fontFamily: 'Nunito'
              }}>今日订单</span>
              </div>
              <p className="text-3xl font-bold" style={{
              fontFamily: 'Quicksand'
            }}>{loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats.todayOrders}</p>
            </div>
            <div className="bg-gradient-to-br from-[#FF6B35] to-[#E85A42] rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium" style={{
                fontFamily: 'Nunito'
              }}>已完成</span>
              </div>
              <p className="text-3xl font-bold" style={{
              fontFamily: 'Quicksand'
            }}>{loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats.completedOrders}</p>
            </div>
            <div className="bg-gradient-to-br from-[#FCEEB8] to-[#FFB34E] rounded-2xl p-4 text-[#FF6B35]">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium" style={{
                fontFamily: 'Nunito'
              }}>待处理</span>
              </div>
              <p className="text-3xl font-bold" style={{
              fontFamily: 'Quicksand'
            }}>{loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats.pendingOrders}</p>
            </div>
          </div>

          {/* 营收信息 */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gradient-to-br from-[#8B7355] to-[#6B5345] rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium" style={{
                fontFamily: 'Nunito'
              }}>总营收</span>
              </div>
              <p className="text-2xl font-bold" style={{
              fontFamily: 'Quicksand'
            }}>¥{loading ? 0 : stats.totalRevenue}</p>
            </div>
            <div className="bg-gradient-to-br from-[#E85A42] to-[#C94A32] rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-medium" style={{
                fontFamily: 'Nunito'
              }}>今日营收</span>
              </div>
              <p className="text-2xl font-bold" style={{
              fontFamily: 'Quicksand'
            }}>¥{loading ? 0 : stats.todayRevenue}</p>
            </div>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Button onClick={() => navigateTo({
          pageId: 'dining-menu',
          params: {}
        })} className="bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-24 font-bold rounded-2xl hover:bg-[#FF6B35] hover:text-white shadow-lg" style={{
          fontFamily: 'Quicksand'
        }}>
            <div className="flex flex-col items-center gap-2">
              <Utensils className="h-8 w-8" />
              <span className="text-sm">菜单管理</span>
            </div>
          </Button>
          <Button onClick={() => navigateTo({
          pageId: 'dining-qrcode',
          params: {}
        })} className="bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-24 font-bold rounded-2xl hover:bg-[#FF6B35] hover:text-white shadow-lg" style={{
          fontFamily: 'Quicksand'
        }}>
            <div className="flex flex-col items-center gap-2">
              <QrCode className="h-8 w-8" />
              <span className="text-sm">收款码</span>
            </div>
          </Button>
          <Button onClick={() => navigateTo({
          pageId: 'dining-orders',
          params: {}
        })} className="bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-24 font-bold rounded-2xl hover:bg-[#FF6B35] hover:text-white shadow-lg" style={{
          fontFamily: 'Quicksand'
        }}>
            <div className="flex flex-col items-center gap-2">
              <ShoppingCart className="h-8 w-8" />
              <span className="text-sm">订单管理</span>
            </div>
          </Button>
          <Button className="bg-[#FCEEB8] text-[#FF6B35] h-24 font-bold rounded-2xl shadow-lg" style={{
          fontFamily: 'Quicksand'
        }}>
            <div className="flex flex-col items-center gap-2">
              <TrendingUp className="h-8 w-8" />
              <span className="text-sm">数据分析</span>
            </div>
          </Button>
        </div>

        {/* 最新订单 */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
              最新订单
            </h2>
            <Button onClick={() => navigateTo({
            pageId: 'dining-orders',
            params: {}
          })} className="bg-[#FF8B4E] text-white h-8 px-4 font-bold rounded-xl hover:bg-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
              查看全部
            </Button>
          </div>

          {loading ? <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-[#FF6B35] animate-spin" />
            </div> : recentOrders.length === 0 ? <div className="text-center py-12 text-[#8B7355]" style={{
          fontFamily: 'Nunito'
        }}>
              暂无订单数据
            </div> : <div className="space-y-4">
            {recentOrders.map(order => <div key={order.id} className="bg-[#FCEEB8] rounded-2xl p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-[#FF8B4E]" />
                    <div>
                      <h3 className="text-lg font-bold text-[#FF6B35]" style={{
                    fontFamily: 'Quicksand'
                  }}>
                        {order.customerName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-[#8B7355]" style={{
                    fontFamily: 'Nunito'
                  }}>
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(order.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-full text-sm font-semibold text-white" style={{
                  fontFamily: 'Nunito',
                  backgroundColor: getStatusColor(order.status)
                }}>
                      {getStatusText(order.status)}
                    </div>
                    {(order.status === 'pending' || order.status === 'cooking') && <Button onClick={() => {
                  const newStatus = order.status === 'pending' ? 'cooking' : 'completed';
                  handleUpdateOrderStatus(order.id, newStatus);
                }} className="h-8 px-3 text-sm font-bold rounded-xl bg-[#FF6B35] text-white hover:bg-[#E85A42]" style={{
                  fontFamily: 'Quicksand'
                }}>
                        {order.status === 'pending' ? '开始烹饪' : '完成订单'}
                      </Button>}
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {order.dishes.map((dish, index) => <div key={index} className="flex items-center justify-between text-sm" style={{
                fontFamily: 'Nunito'
              }}>
                      <span className="text-[#8B7355]">{dish.name}</span>
                      <span className="font-semibold text-[#FF6B35]">x{dish.quantity}</span>
                    </div>)}
                </div>

                <div className="flex items-center justify-between pt-3 border-t-2 border-dashed border-[#FF8B4E]">
                  <span className="text-lg font-bold text-[#8B7355]" style={{
                fontFamily: 'Quicksand'
              }}>
                    合计:
                  </span>
                  <span className="text-2xl font-bold text-[#FF6B35]" style={{
                fontFamily: 'Quicksand'
              }}>
                    ¥{order.total}
                  </span>
                </div>
              </div>)}
          </div>}
        </div>
      </div>

      <TabBar activeTab="home" navigateTo={navigateTo} onTabChange={tabId => console.log(tabId)} userRole="dining" />
    </div>;
}