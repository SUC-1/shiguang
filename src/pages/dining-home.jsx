// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { Store, ShoppingCart, Utensils, QrCode, TrendingUp, Users, Clock, CheckCircle, Sparkles } from 'lucide-react';

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
    totalOrders: 128,
    todayOrders: 15,
    completedOrders: 120,
    pendingOrders: 8,
    totalRevenue: 15800,
    todayRevenue: 1800
  });
  const [recentOrders, setRecentOrders] = useState([{
    id: 1,
    customerName: '张三',
    dishes: [{
      name: '宫保鸡丁',
      quantity: 2
    }, {
      name: '麻婆豆腐',
      quantity: 1
    }],
    total: 88,
    status: 'pending',
    timestamp: new Date(Date.now() - 120000)
  }, {
    id: 2,
    customerName: '李四',
    dishes: [{
      name: '水煮牛肉',
      quantity: 1
    }, {
      name: '糖醋排骨',
      quantity: 2
    }],
    total: 158,
    status: 'cooking',
    timestamp: new Date(Date.now() - 300000)
  }, {
    id: 3,
    customerName: '王五',
    dishes: [{
      name: '清蒸鲈鱼',
      quantity: 1
    }],
    total: 98,
    status: 'completed',
    timestamp: new Date(Date.now() - 600000)
  }]);
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
            }}>{stats.totalOrders}</p>
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
            }}>{stats.todayOrders}</p>
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
            }}>{stats.completedOrders}</p>
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
            }}>{stats.pendingOrders}</p>
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

          <div className="space-y-4">
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
                  <div className="px-3 py-1 rounded-full text-sm font-semibold text-white" style={{
                fontFamily: 'Nunito',
                backgroundColor: getStatusColor(order.status)
              }}>
                    {getStatusText(order.status)}
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
          </div>
        </div>
      </div>

      <TabBar activeTab="home" navigateTo={navigateTo} onTabChange={tabId => console.log(tabId)} userRole="dining" />
    </div>;
}