// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { ChefHat, ShoppingCart, BookOpen, Play, Clock, Users, CheckCircle, ListChecks, Video, Image as ImageIcon, Info, Loader2, Flame } from 'lucide-react';

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
  const [dishesData, setDishesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState({});

  // 获取订单数据 — 调用 manageOrders 云函数
  const fetchOrders = async () => {
    try {
      const result = await props.$w.cloud.callFunction({
        name: 'manageOrders',
        data: {
          action: 'query',
          queryType: 'byBusinessType',
          businessType: 'family',
          page: 1,
          pageSize: 20
        }
      });
      if (result.result && result.result.success && result.result.data) {
        const fetchedOrders = (result.result.data.orders || []).map(order => ({
          id: order._id,
          userName: order.userName,
          dishes: (order.dishes || []).map(d => ({
            name: d.name,
            quantity: d.quantity,
            price: d.price,
            ingredients: []
          })),
          message: order.message,
          status: order.status,
          timestamp: new Date(order.createdAt),
          boardColor: order.boardColor || '#FF8B4E',
          total: order.total || 0
        }));
        setOrders(fetchedOrders);
      } else {
        toast({
          variant: 'destructive',
          title: '获取订单失败',
          description: result.result && result.result.message || '请稍后重试'
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

  // 获取菜品数据 — 调用 manageDishes 云函数
  const fetchDishes = async () => {
    try {
      const result = await props.$w.cloud.callFunction({
        name: 'manageDishes',
        data: {
          action: 'query',
          queryType: 'byBusinessType',
          businessType: 'family',
          page: 1,
          pageSize: 50
        }
      });
      if (result.result && result.result.success && result.result.data) {
        const fetched = (result.result.data.dishes || []).map(d => ({
          _id: d._id,
          name: d.name,
          image: d.image,
          cuisine: d.cuisine,
          price: d.price,
          isCustom: d.isCustom,
          nutrition: d.nutrition,
          ingredients: d.ingredients || [],
          businessType: d.businessType
        }));
        setDishesData(fetched);
      }
    } catch (error) {
      console.error('获取菜品失败:', error);
    }
  };

  // 页面初始化加载数据
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchOrders(), fetchDishes()]);
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
  // 订单状态更新 — 调用 manageOrders 云函数
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(prev => ({
      ...prev,
      [orderId]: true
    }));
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
          variant: 'default',
          title: '状态更新成功',
          description: newStatus === 'cooking' ? '开始烹饪' : '已完成烹饪'
        });
        await fetchOrders();
      } else {
        toast({
          variant: 'destructive',
          title: '状态更新失败',
          description: result.result && result.result.message || '请重试'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '状态更新失败',
        description: error.message || '网络错误，请重试'
      });
    } finally {
      setUpdatingStatus(prev => ({
        ...prev,
        [orderId]: false
      }));
    }
  };

  // 菜品状态更新 — 调用 manageDishes 云函数
  const handleDishUpdate = async (dishId, updates) => {
    try {
      const result = await props.$w.cloud.callFunction({
        name: 'manageDishes',
        data: {
          action: 'update',
          dishId: dishId,
          ...updates
        }
      });
      if (result.result && result.result.success) {
        toast({
          variant: 'default',
          title: '菜品更新成功',
          description: '菜品信息已更新'
        });
        await fetchDishes();
      } else {
        toast({
          variant: 'destructive',
          title: '菜品更新失败',
          description: result.result && result.result.message || '请重试'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '菜品更新失败',
        description: error.message || '网络错误，请重试'
      });
    }
  };

  // 菜品删除 — 调用 manageDishes 云函数
  const handleDishDelete = async dishId => {
    try {
      const result = await props.$w.cloud.callFunction({
        name: 'manageDishes',
        data: {
          action: 'delete',
          dishId: dishId
        }
      });
      if (result.result && result.result.success) {
        toast({
          variant: 'default',
          title: '菜品删除成功',
          description: '菜品已从列表中移除'
        });
        await fetchDishes();
      } else {
        toast({
          variant: 'destructive',
          title: '菜品删除失败',
          description: result.result && result.result.message || '请重试'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '菜品删除失败',
        description: error.message || '网络错误，请重试'
      });
    }
  };
  const handleShowCookingGuide = dish => {
    setActiveCooking(dish);
  };

  // 备菜清单汇总 — 从菜品数据中汇总配料
  const getIngredientSummary = () => {
    const summary = {};
    orders.forEach(order => {
      order.dishes.forEach(dish => {
        // 从 dishesData 中查找对应菜品的配料
        const dishInfo = dishesData.find(d => d.name === dish.name);
        const ingredients = dishInfo ? dishInfo.ingredients || [] : [];
        if (ingredients.length > 0) {
          ingredients.forEach(ingredient => {
            const match = ingredient.match(/(\d+)(.*)/);
            if (match) {
              const [_, amount, unit] = match;
              const name = ingredient.replace(match[0], '').trim() || ingredient;
              const qty = dish.quantity || 1;
              const multiplied = parseInt(amount) * qty;
              const existing = summary[name];
              if (existing) {
                const existingMatch = existing.amount.match(/^(\d+)/);
                const existingAmount = existingMatch ? parseInt(existingMatch[1]) : 0;
                summary[name] = {
                  name,
                  amount: `${existingAmount + multiplied}${unit || ''}`
                };
              } else {
                summary[name] = {
                  name,
                  amount: `${multiplied}${unit || ''}`
                };
              }
            } else {
              const qty = dish.quantity || 1;
              const existing = summary[ingredient];
              if (existing) {
                const existingMatch = existing.amount.match(/^(\d+)/);
                const existingAmount = existingMatch ? parseInt(existingMatch[1]) : 1;
                summary[ingredient] = {
                  name: ingredient,
                  amount: `${existingAmount + qty}份`
                };
              } else {
                summary[ingredient] = {
                  name: ingredient,
                  amount: `${qty}份`
                };
              }
            }
          });
        } else if (dish.ingredients && dish.ingredients.length > 0) {
          // 回退到订单中菜品自带的配料
          dish.ingredients.forEach(ingredient => {
            const match = ingredient.match(/(\d+)(.*)/);
            if (match) {
              const [_, amount, unit] = match;
              const name = ingredient.replace(match[0], '').trim() || ingredient;
              const qty = dish.quantity || 1;
              const multiplied = parseInt(amount) * qty;
              const existing = summary[name];
              if (existing) {
                const existingMatch = existing.amount.match(/^(\d+)/);
                const existingAmount = existingMatch ? parseInt(existingMatch[1]) : 0;
                summary[name] = {
                  name,
                  amount: `${existingAmount + multiplied}${unit || ''}`
                };
              } else {
                summary[name] = {
                  name,
                  amount: `${multiplied}${unit || ''}`
                };
              }
            } else {
              const qty = dish.quantity || 1;
              const existing = summary[ingredient];
              if (existing) {
                const existingMatch = existing.amount.match(/^(\d+)/);
                const existingAmount = existingMatch ? parseInt(existingMatch[1]) : 1;
                summary[ingredient] = {
                  name: ingredient,
                  amount: `${existingAmount + qty}份`
                };
              } else {
                summary[ingredient] = {
                  name: ingredient,
                  amount: `${qty}份`
                };
              }
            }
          });
        }
      });
    });
    return Object.values(summary);
  };
  const ingredientSummary = getIngredientSummary();
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
            <div className="flex items-center gap-2 text-sm text-[#8B7355]" style={{
            fontFamily: 'Nunito'
          }}>
              <Users className="h-4 w-4" />
              <span>{currentUser.nickName || currentUser.name || '大厨'}</span>
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
            {orders.length === 0 && <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <ShoppingCart className="h-12 w-12 text-[#FF8B4E] mx-auto mb-4" />
                <p className="text-[#8B7355] text-lg" style={{
            fontFamily: 'Nunito'
          }}>暂无订单数据</p>
              </div>}
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
                        <ShoppingCart className="h-4 w-4 text-[#FF6B35]" />
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
                    {order.status === 'pending' && <Button className="bg-[#FF8B4E] text-white h-10 px-4 font-bold rounded-xl shadow-lg hover:bg-[#FF6B35]" onClick={() => handleStatusChange(order.id, 'cooking')} disabled={updatingStatus[order.id]} style={{
                fontFamily: 'Quicksand'
              }}>
                        {updatingStatus[order.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : '开始烹饪'}
                      </Button>}
                    {order.status === 'cooking' && <Button className="bg-[#9CCF4E] text-white h-10 px-4 font-bold rounded-xl shadow-lg hover:bg-[#FF6B35]" onClick={() => handleStatusChange(order.id, 'completed')} disabled={updatingStatus[order.id]} style={{
                fontFamily: 'Quicksand'
              }}>
                        {updatingStatus[order.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : '完成烹饪'}
                      </Button>}
                    {order.status === 'completed' && <div className="flex items-center gap-2 text-sm text-[#9CCF4E]" style={{
                fontFamily: 'Nunito'
              }}>
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold">已完成</span>
                      </div>}
                  </div>
                  <Button className="bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-10 px-4 font-bold rounded-xl hover:bg-[#FF6B35] hover:text-white" onClick={() => setSelectedOrder(order)} style={{
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
            {ingredientSummary.length === 0 ? <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-[#FF8B4E] mx-auto mb-4" />
                <p className="text-[#8B7355] text-lg" style={{
            fontFamily: 'Nunito'
          }}>暂无备菜数据</p>
              </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              </div>}
          </div>}

        {/* 烹饪指导内容 */}
        {activeTab === 'tutorials' && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dishesData.length === 0 && <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <BookOpen className="h-12 w-12 text-[#FF8B4E] mx-auto mb-4" />
                <p className="text-[#8B7355] text-lg" style={{
            fontFamily: 'Nunito'
          }}>暂无烹饪教程</p>
              </div>}
            {dishesData.map((dish, index) => <div key={dish._id || index} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer" onClick={() => handleShowCookingGuide(dish)}>
                <div className="h-40 relative overflow-hidden">
                  <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-xl font-bold text-white" style={{
                fontFamily: 'Quicksand'
              }}>{dish.name}</h3>
                    {dish.cuisine && <span className="text-xs text-white/80 bg-[#FF6B35]/60 px-2 py-1 rounded-full" style={{
                fontFamily: 'Nunito'
              }}>{dish.cuisine}</span>}
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-[#8B7355] mb-4" style={{
              fontFamily: 'Nunito'
            }}>
                    {dish.nutrition && dish.nutrition.description ? dish.nutrition.description : `学习如何制作${dish.name}，提升厨艺水平`}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-[#8B7355] mb-4" style={{
              fontFamily: 'Nunito'
            }}>
                    {dish.nutrition && dish.nutrition.calories && <div className="flex items-center gap-1">
                        <Flame className="h-4 w-4" />
                        <span>{dish.nutrition.calories}卡</span>
                      </div>}
                    <div className="flex items-center gap-1">
                      <ShoppingCart className="h-4 w-4" />
                      <span>{(dish.ingredients || []).length}种配料</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${dish.isCustom ? 'bg-[#9CCF4E]/20 text-[#9CCF4E]' : 'bg-[#FF8B4E]/20 text-[#FF8B4E]'}`} style={{
                fontFamily: 'Nunito'
              }}>
                      {dish.isCustom ? '自定义' : '标准'}
                    </span>
                    <span className="text-lg font-bold text-[#FF6B35]" style={{
                fontFamily: 'Quicksand'
              }}>¥{dish.price}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-[#FF8B4E] text-white h-10 font-bold rounded-xl shadow-lg hover:bg-[#FF6B35]" style={{
                fontFamily: 'Quicksand'
              }} onClick={e => {
                e.stopPropagation();
                handleDishUpdate(dish._id, {
                  isCustom: !dish.isCustom
                });
              }}>
                      {dish.isCustom ? '设为标准' : '设为自定义'}
                    </Button>
                    <Button className="bg-white text-[#E85A42] border-2 border-[#E85A42] h-10 px-4 font-bold rounded-xl hover:bg-[#E85A42] hover:text-white" style={{
                fontFamily: 'Quicksand'
              }} onClick={e => {
                e.stopPropagation();
                handleDishDelete(dish._id);
              }}>
                      删除
                    </Button>
                  </div>
                </div>
              </div>)}
          </div>}
      </div>

      {/* 订单详情弹窗 */}
      {selectedOrder && <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
                {selectedOrder.userName} 的订单详情
              </h2>
              <Button className="bg-white text-gray-800 border-2 border-gray-300 rounded-xl p-2 hover:bg-gray-100" onClick={() => setSelectedOrder(null)}>
                X
              </Button>
            </div>

            <div className="space-y-6">
              {/* 点菜列表 */}
              <div className="bg-[#FCEEB8] rounded-xl p-4">
                <h3 className="text-lg font-semibold text-[#FF6B35] mb-3" style={{
              fontFamily: 'Quicksand'
            }}>
                  <ShoppingCart className="h-5 w-5 inline mr-2" />
                  点菜列表
                </h3>
                <div className="space-y-2">
                  {selectedOrder.dishes.map((dish, index) => <div key={index} className="flex items-center justify-between">
                      <p className="text-base text-[#8B7355]" style={{
                  fontFamily: 'Nunito'
                }}>{dish.name}</p>
                      <span className="text-sm font-semibold text-[#FF6B35]" style={{
                  fontFamily: 'Quicksand'
                }}>x{dish.quantity}</span>
                    </div>)}
                </div>
              </div>

              {/* 订单金额 */}
              <div className="bg-[#FCEEB8] rounded-xl p-4">
                <h3 className="text-lg font-semibold text-[#FF6B35] mb-3" style={{
              fontFamily: 'Quicksand'
            }}>
                  订单金额
                </h3>
                <p className="text-2xl font-bold text-[#FF6B35]" style={{
              fontFamily: 'Quicksand'
            }}>¥{selectedOrder.total || selectedOrder.dishes.reduce((sum, d) => sum + (d.price || 0) * (d.quantity || 1), 0)}</p>
              </div>

              {/* 留言 */}
              {selectedOrder.message && <div className="rounded-xl p-4" style={{
            backgroundColor: selectedOrder.boardColor
          }}>
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                      <Info className="h-4 w-4 text-[#FF6B35]" />
                    </div>
                    <p className="text-sm text-white" style={{
                fontFamily: 'Nunito'
              }}>{selectedOrder.message}</p>
                  </div>
                </div>}

              {/* 订单状态 */}
              <div className="bg-[#FCEEB8] rounded-xl p-4">
                <h3 className="text-lg font-semibold text-[#FF6B35] mb-3" style={{
              fontFamily: 'Quicksand'
            }}>
                  订单状态
                </h3>
                <div className="flex items-center gap-2">
                  {selectedOrder.status === 'pending' && <span className="text-[#FF8B4E] font-semibold" style={{
                fontFamily: 'Nunito'
              }}>待烹饪</span>}
                  {selectedOrder.status === 'cooking' && <span className="text-[#9CCF4E] font-semibold" style={{
                fontFamily: 'Nunito'
              }}>烹饪中</span>}
                  {selectedOrder.status === 'completed' && <span className="text-[#9CCF4E] font-semibold" style={{
                fontFamily: 'Nunito'
              }}>已完成</span>}
                  {selectedOrder.status === 'cancelled' && <span className="text-[#E85A42] font-semibold" style={{
                fontFamily: 'Nunito'
              }}>已取消</span>}
                </div>
              </div>
            </div>
          </div>
        </div>}

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
              {/* 菜品图片 */}
              {activeCooking.image && <div className="rounded-xl overflow-hidden">
                  <img src={activeCooking.image} alt={activeCooking.name} className="w-full h-48 object-cover" />
                </div>}

              {/* 菜系和营养信息 */}
              <div className="bg-[#FCEEB8] rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  {activeCooking.cuisine && <div>
                      <h3 className="text-sm text-[#8B7355]" style={{
                  fontFamily: 'Nunito'
                }}>菜系</h3>
                      <p className="text-base font-semibold text-[#FF6B35]" style={{
                  fontFamily: 'Quicksand'
                }}>{activeCooking.cuisine}</p>
                    </div>}
                  <div>
                    <h3 className="text-sm text-[#8B7355]" style={{
                  fontFamily: 'Nunito'
                }}>价格</h3>
                    <p className="text-base font-semibold text-[#FF6B35]" style={{
                  fontFamily: 'Quicksand'
                }}>¥{activeCooking.price}</p>
                  </div>
                </div>
                {activeCooking.nutrition && <div className="mt-4 pt-4 border-t border-[#FF8B4E]/30">
                    <h3 className="text-sm text-[#8B7355] mb-2" style={{
                fontFamily: 'Nunito'
              }}>营养信息</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {activeCooking.nutrition.calories && <div className="flex items-center gap-1">
                          <Flame className="h-4 w-4 text-[#FF8B4E]" />
                          <span className="text-sm text-[#8B7355]">{activeCooking.nutrition.calories}卡</span>
                        </div>}
                      {activeCooking.nutrition.protein && <span className="text-sm text-[#8B7355]">蛋白质 {activeCooking.nutrition.protein}g</span>}
                      {activeCooking.nutrition.carbs && <span className="text-sm text-[#8B7355]">碳水 {activeCooking.nutrition.carbs}g</span>}
                      {activeCooking.nutrition.fat && <span className="text-sm text-[#8B7355]">脂肪 {activeCooking.nutrition.fat}g</span>}
                    </div>
                    {activeCooking.nutrition.description && <p className="text-sm text-[#8B7355] mt-2" style={{
                fontFamily: 'Nunito'
              }}>{activeCooking.nutrition.description}</p>}
                  </div>}
              </div>

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
                }}>{ingredient}</p>
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