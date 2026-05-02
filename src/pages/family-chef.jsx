// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { ChefHat, ShoppingCart, BookOpen, Play, Clock, Users, CheckCircle, ListChecks, Video, Image as ImageIcon, Info, MessageSquare } from 'lucide-react';

// @ts-ignore;
import TabBar from '@/components/TabBar';
export default function FamilyChef(props) {
  const {
    toast
  } = useToast();
  const {
    navigateBack,
    navigateTo
  } = props.$w.utils;
  const currentUser = props.$w.auth.currentUser || {};
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeCooking, setActiveCooking] = useState(null);

  // 模拟订单数据
  const mockOrders = [{
    id: 1,
    userName: '小明',
    dishes: [{
      name: '红烧狮子头',
      quantity: 2,
      ingredients: ['猪肉500g', '鸡蛋2个', '淀粉50g', '葱姜适量']
    }, {
      name: '宫保鸡丁',
      quantity: 1,
      ingredients: ['鸡胸肉300g', '花生米100g', '干辣椒10个', '花椒适量']
    }, {
      name: '清蒸鲈鱼',
      quantity: 1,
      ingredients: ['鲈鱼1条', '葱姜丝适量', '蒸鱼豉油2勺']
    }],
    message: '今天想吃清淡一点的，鱼要新鲜哦！',
    status: 'pending',
    timestamp: new Date(Date.now() - 180000),
    boardColor: '#FF8B4E'
  }, {
    id: 2,
    userName: '小红',
    dishes: [{
      name: '麻婆豆腐',
      quantity: 1,
      ingredients: ['豆腐400g', '肉末100g', '豆瓣酱2勺', '花椒粉适量']
    }, {
      name: '水煮牛肉',
      quantity: 2,
      ingredients: ['牛肉400g', '豆芽200g', '辣椒适量', '蒜苗2根']
    }],
    message: '要麻辣味浓郁的！',
    status: 'cooking',
    timestamp: new Date(Date.now() - 360000),
    boardColor: '#9CCF4E'
  }, {
    id: 3,
    userName: '爸爸',
    dishes: [{
      name: '糖醋排骨',
      quantity: 1,
      ingredients: ['排骨500g', '白糖3勺', '醋2勺', '生抽1勺']
    }],
    message: '少放糖',
    status: 'completed',
    timestamp: new Date(Date.now() - 720000),
    boardColor: '#E85A42'
  }];
  const formatTime = date => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return `${diff}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    return `${Math.floor(diff / 3600)}小时前`;
  };
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const updatedOrders = orders.map(order => order.id === orderId ? {
        ...order,
        status: newStatus
      } : order);
      setOrders(updatedOrders);
      toast({
        variant: 'default',
        title: '状态更新成功',
        description: newStatus === 'cooking' ? '开始烹饪' : '已完成烹饪'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '状态更新失败',
        description: error.message || '请重试'
      });
    }
  };
  const handleShowCookingGuide = dish => {
    setActiveCooking(dish);
  };

  // 备菜清单汇总
  const getIngredientSummary = () => {
    const summary = {};
    orders.forEach(order => {
      order.dishes.forEach(dish => {
        (dish.ingredients || []).forEach(ingredient => {
          const match = ingredient.match(/(\d+)(.*)/);
          if (match) {
            const [_, amount, unit] = match;
            const name = ingredient.replace(match[0], '').trim() || ingredient;
            summary[name] = (summary[name] || 0) + parseInt(amount) + unit;
          } else {
            summary[ingredient] = (summary[ingredient] || 0) + 1;
          }
        });
      });
    });
    return Object.entries(summary).map(([name, amount]) => ({
      name,
      amount
    }));
  };
  const ingredientSummary = getIngredientSummary();
  React.useEffect(() => {
    setOrders(mockOrders);
  }, []);
  return <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FF8B4E] to-[#FF6B35] pb-20">
      <div className="max-w-6xl mx-auto p-6">
        {/* 头部区域 */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ChefHat className="h-10 w-10 text-[#FF8B4E]" />
              <h1 className="text-2xl font-bold text-[#FF6B35]" style={{
              fontFamily: 'Quicksand'
            }}>
                家庭大厨工作台
              </h1>
            </div>
          </div>

          {/* Tab切换 */}
          <div className="flex gap-3">
            <Button className={activeTab === 'orders' ? 'flex-1 bg-[#FF8B4E] text-white h-12 font-bold rounded-xl' : 'flex-1 bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-12 font-bold rounded-xl'} onClick={() => setActiveTab('orders')} style={{
            fontFamily: 'Quicksand'
          }}>
              点菜汇总
            </Button>
            <Button className={activeTab === 'ingredients' ? 'flex-1 bg-[#FF8B4E] text-white h-12 font-bold rounded-xl' : 'flex-1 bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-12 font-bold rounded-xl'} onClick={() => setActiveTab('ingredients')} style={{
            fontFamily: 'Quicksand'
          }}>
              备菜清单
            </Button>
            <Button className={activeTab === 'tutorials' ? 'flex-1 bg-[#FF8B4E] text-white h-12 font-bold rounded-xl' : 'flex-1 bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-12 font-bold rounded-xl'} onClick={() => setActiveTab('tutorials')} style={{
            fontFamily: 'Quicksand'
          }}>
              烹饪指导
            </Button>
          </div>
        </div>

        {/* 点菜汇总内容 */}
        {activeTab === 'orders' && <div className="grid gap-4">
            {orders.map(order => <div key={order.id} className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-[#FF8B4E]" />
                    <h3 className="text-xl font-bold text-[#FF6B35]" style={{
                fontFamily: 'Quicksand'
              }}>
                      {order.userName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#8B7355]" style={{
              fontFamily: 'Nunito'
            }}>
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(order.timestamp)}</span>
                  </div>
                </div>

                <div className="bg-[#FCEEB8] rounded-xl p-4 mb-4">
                  <h4 className="text-lg font-semibold text-[#FF6B35] mb-3" style={{
              fontFamily: 'Quicksand'
            }}>
                    点菜列表
                  </h4>
                  <div className="space-y-2">
                    {order.dishes.map((dish, index) => <div key={index} className="flex items-center justify-between">
                        <p className="text-base text-[#8B7355]" style={{
                  fontFamily: 'Nunito'
                }}>
                          {dish.name}
                        </p>
                        <span className="text-sm font-semibold text-[#FF6B35]" style={{
                  fontFamily: 'Quicksand'
                }}>
                          x{dish.quantity}
                        </span>
                      </div>)}
                  </div>
                </div>

                {order.message && <div className="rounded-xl p-4 mb-4" style={{
            backgroundColor: order.boardColor
          }}>
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                        <MessageSquare className="h-4 w-4 text-[#FF6B35]" />
                      </div>
                      <p className="text-sm text-white" style={{
                fontFamily: 'Nunito'
              }}>
                        {order.message}
                      </p>
                    </div>
                  </div>}

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {order.status === 'pending' && <Button className="bg-[#FF8B4E] text-white h-10 px-4 font-bold rounded-xl shadow-lg hover:bg-[#FF6B35]" onClick={() => handleStatusChange(order.id, 'cooking')} style={{
                fontFamily: 'Quicksand'
              }}>
                        开始烹饪
                      </Button>}
                    {order.status === 'cooking' && <Button className="bg-[#9CCF4E] text-white h-10 px-4 font-bold rounded-xl shadow-lg hover:bg-[#FF6B35]" onClick={() => handleStatusChange(order.id, 'completed')} style={{
                fontFamily: 'Quicksand'
              }}>
                        完成烹饪
                      </Button>}
                    {order.status === 'completed' && <div className="flex items-center gap-2 text-sm text-[#9CCF4E]" style={{
                fontFamily: 'Nunito'
              }}>
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold">已完成</span>
                      </div>}
                  </div>
                  <Button className="bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-10 px-4 font-bold rounded-xl hover:bg-[#FF6B35] hover:text-white" style={{
              fontFamily: 'Quicksand'
            }}>
                    查看详情
                  </Button>
                </div>
              </div>)}
          </div>}

        {/* 备菜清单内容 */}
        {activeTab === 'ingredients' && <div className="bg-white rounded-3xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-[#FF6B35] mb-6" style={{
          fontFamily: 'Quicksand'
        }}>
              <ListChecks className="h-8 w-8 inline mr-2" />
              备菜清单汇总
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ingredientSummary.map((item, index) => <div key={index} className="bg-[#FCEEB8] rounded-xl p-4 border-2 border-[#FF8B4E] border-dashed">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="h-5 w-5 text-[#FF6B35]" />
                    <p className="text-lg font-semibold text-[#FF6B35]" style={{
                fontFamily: 'Quicksand'
              }}>
                      {item.name}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-[#FF6B35]" style={{
              fontFamily: 'Quicksand'
            }}>
                    {item.amount}
                  </p>
                </div>)}
            </div>
          </div>}

        {/* 烹饪指导内容 */}
        {activeTab === 'tutorials' && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(index => <div key={index} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                <div className="h-40 bg-gradient-to-br from-[#FF8B4E] to-[#FF6B35] flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-white" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#FF6B35] mb-2" style={{
              fontFamily: 'Quicksand'
            }}>
                    烹饪教程 {index}
                  </h3>
                  <p className="text-sm text-[#8B7355] mb-4" style={{
              fontFamily: 'Nunito'
            }}>
                    学习如何制作美味菜品，提升厨艺水平
                  </p>
                  <div className="flex items-center gap-2 text-sm text-[#8B7355] mb-4" style={{
              fontFamily: 'Nunito'
            }}>
                    <Play className="h-4 w-4" />
                    <span>15分钟</span>
                  </div>
                  <Button className="w-full bg-[#FF8B4E] text-white h-10 font-bold rounded-xl shadow-lg hover:bg-[#FF6B35]" style={{
              fontFamily: 'Quicksand'
            }}>
                    开始学习
                  </Button>
                </div>
              </div>)}
          </div>}
      </div>

      {/* 烹饪指导弹窗 */}
      {activeCooking && <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
                {activeCooking.name} - 烹饪指导
              </h2>
              <Button className="bg-white text-gray-800 border-2 border-gray-300 rounded-xl p-2 hover:bg-gray-100" onClick={() => setActiveCooking(null)}>
                X
              </Button>
            </div>

            <div className="space-y-6">
              {/* 详细配菜调料 */}
              <div className="bg-[#FCEEB8] rounded-xl p-4">
                <h3 className="text-lg font-semibold text-[#FF6B35] mb-3" style={{
              fontFamily: 'Quicksand'
            }}>
                  <ListChecks className="h-5 w-5 inline mr-2" />
                  详细配菜调料
                </h3>
                <div className="space-y-2">
                  {(activeCooking.ingredients || []).map((ingredient, index) => <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#FF8B4E] rounded-full" />
                      <p className="text-base text-[#8B7355]" style={{
                  fontFamily: 'Nunito'
                }}>
                        {ingredient}
                      </p>
                    </div>)}
                </div>
              </div>

              {/* 图文教程 */}
              <div>
                <h3 className="text-lg font-semibold text-[#FF6B35] mb-3" style={{
              fontFamily: 'Quicksand'
            }}>
                  <ImageIcon className="h-5 w-5 inline mr-2" />
                  图文教程
                </h3>
                <div className="bg-[#FCEEB8] rounded-xl p-4">
                  <p className="text-base text-[#8B7355]" style={{
                fontFamily: 'Nunito'
              }}>
                    下滑查看详细步骤...
                  </p>
                </div>
              </div>

              {/* 视频教程 */}
              <div>
                <h3 className="text-lg font-semibold text-[#FF6B35] mb-3" style={{
              fontFamily: 'Quicksand'
            }}>
                  <Video className="h-5 w-5 inline mr-2" />
                  视频教程
                </h3>
                <div className="bg-[#FCEEB8] rounded-xl p-4 flex items-center justify-center h-48">
                  <Play className="h-16 w-16 text-[#FF6B35]" />
                </div>
              </div>

              {/* 烹饪小贴士 */}
              <div className="bg-[#9CCF4E] rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-3" style={{
              fontFamily: 'Quicksand'
            }}>
                  <Info className="h-5 w-5 inline mr-2" />
                  烹饪小贴士
                </h3>
                <p className="text-sm text-white" style={{
              fontFamily: 'Nunito'
            }}>
                  注意火候控制，确保食材新鲜，调味适中...
                </p>
              </div>
            </div>
          </div>
        </div>}

      {/* 底部导航栏 */}
      <TabBar activeTab={activeTab} navigateTo={navigateTo} onTabChange={tabId => {
      setActiveTab(tabId);
      if (tabId === 'member') {
        navigateTo({
          pageId: 'family-member',
          params: {}
        });
      }
    }} userRole="family" />
    </div>;
}