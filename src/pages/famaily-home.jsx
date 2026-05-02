// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { Heart, Clock, Users, ChefHat, ShoppingBag, MessageSquare, TrendingUp, Calendar, Star, ArrowRight } from 'lucide-react';

// @ts-ignore;
import TabBar from '@/components/TabBar';
export default function FamilyHome(props) {
  const {
    toast
  } = useToast();
  const {
    navigateTo
  } = props.$w.utils;
  const currentUser = props.$w.auth.currentUser || {};
  const [activeTab, setActiveTab] = useState('home');

  // 模拟数据
  const recentOrders = [{
    id: 1,
    userName: '小明',
    dishes: ['红烧狮子头 x2', '宫保鸡丁 x1'],
    status: 'cooking',
    timestamp: new Date(Date.now() - 180000)
  }, {
    id: 2,
    userName: '小红',
    dishes: ['麻婆豆腐 x1', '水煮牛肉 x2'],
    status: 'pending',
    timestamp: new Date(Date.now() - 360000)
  }];
  const todayStats = {
    totalOrders: 5,
    completedOrders: 3,
    cookingOrders: 1,
    pendingOrders: 1
  };
  const formatTime = date => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return `${diff}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    return `${Math.floor(diff / 3600)}小时前`;
  };
  return <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FF8B4E] to-[#FF6B35] pb-20">
      <div className="max-w-6xl mx-auto p-6">
        {/* 头部欢迎区 */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF8B4E] to-[#FF6B35] rounded-full flex items-center justify-center shadow-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#FF6B35]" style={{
                fontFamily: 'Quicksand'
              }}>
                  {currentUser.nickName || currentUser.name || '亲爱的用户'}
                </h1>
                <p className="text-base text-[#8B7355]" style={{
                fontFamily: 'Nunito'
              }}>
                  欢迎回到温馨家庭
                </p>
              </div>
            </div>
            <Button className="bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-12 px-4 font-bold rounded-xl hover:bg-[#FF6B35] hover:text-white" onClick={() => navigateTo({
            pageId: 'famaily-role',
            params: {}
          })} style={{
            fontFamily: 'Quicksand'
          }}>
              切换角色
            </Button>
          </div>
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
          <h2 className="text-xl font-bold text-[#FF6B35] mb-4" style={{
          fontFamily: 'Quicksand'
        }}>
            快捷操作
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => navigateTo({
            pageId: 'family-member',
            params: {}
          })} className="bg-gradient-to-br from-[#FF8B4E] to-[#FF6B35] text-white h-20 flex flex-col items-center justify-center gap-2 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <ChefHat className="h-8 w-8" />
              <span className="font-bold" style={{
              fontFamily: 'Quicksand'
            }}>开始点菜</span>
            </Button>
            <Button onClick={() => navigateTo({
            pageId: 'family-chef',
            params: {}
          })} className="bg-gradient-to-br from-[#9CCF4E] to-[#FF6B35] text-white h-20 flex flex-col items-center justify-center gap-2 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <MessageSquare className="h-8 w-8" />
              <span className="font-bold" style={{
              fontFamily: 'Quicksand'
            }}>查看订单</span>
            </Button>
          </div>
        </div>

        {/* 最新订单 */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
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
          }}>
              查看全部
            </Button>
          </div>

          <div className="space-y-4">
            {recentOrders.map(order => <div key={order.id} className="bg-[#FCEEB8] rounded-2xl p-4 border-2 border-[#FF8B4E] border-dashed">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#FF6B35]" />
                    <span className="text-lg font-semibold text-[#FF6B35]" style={{
                  fontFamily: 'Quicksand'
                }}>
                      {order.userName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#8B7355]" />
                    <span className="text-sm text-[#8B7355]" style={{
                  fontFamily: 'Nunito'
                }}>
                      {formatTime(order.timestamp)}
                    </span>
                  </div>
                </div>
                <div className="space-y-1 mb-3">
                  {order.dishes.map((dish, index) => <div key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#FF8B4E] rounded-full" />
                      <span className="text-sm text-[#8B7355]" style={{
                  fontFamily: 'Nunito'
                }}>
                        {dish}
                      </span>
                    </div>)}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'cooking' ? 'bg-[#FF8B4E] text-white' : order.status === 'pending' ? 'bg-[#FF6B35] text-white' : 'bg-[#9CCF4E] text-white'}`} style={{
                fontFamily: 'Nunito'
              }}>
                    {order.status === 'cooking' ? '烹饪中' : order.status === 'pending' ? '待处理' : '已完成'}
                  </span>
                  <Button className="bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-8 px-3 font-bold rounded-xl hover:bg-[#FF6B35] hover:text-white" style={{
                fontFamily: 'Nunito'
              }}>
                    详情
                  </Button>
                </div>
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