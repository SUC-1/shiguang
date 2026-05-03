// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button, Input } from '@/components/ui';
// @ts-ignore;
import { ShoppingCart, Search, Heart, MessageSquare, Expand, Check, X, ChefHat, Sparkles, Loader2, Users } from 'lucide-react';

// @ts-ignore;
import TabBar from '@/components/TabBar';
export default function FamilyMember(props) {
  const {
    toast
  } = useToast();
  const {
    navigateBack,
    navigateTo
  } = props.$w.utils;
  const currentUser = props.$w.auth.currentUser || {};
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [message, setMessage] = useState('');
  const [boardColor, setBoardColor] = useState('#FF8B4E');
  const [syncTarget, setSyncTarget] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNutrition, setShowNutrition] = useState(false);
  const [currentDish, setCurrentDish] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const handleAICopywriting = () => {
    navigateTo({
      pageId: 'ai-copywriting',
      params: {}
    });
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
      if (result.result && result.result.success) {
        const fetched = (result.result.data && result.result.data.dishes || []).map(d => ({
          id: d._id,
          name: d.name,
          image: d.image,
          cuisine: d.cuisine,
          price: d.price,
          nutrition: d.nutrition || {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            description: ''
          },
          ingredients: d.ingredients || []
        }));
        setMenuData(fetched);
      } else {
        toast({
          variant: 'destructive',
          title: '获取菜品失败',
          description: result.result && result.result.message || '请稍后重试'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '获取菜品失败',
        description: error.message || '网络错误，请稍后重试'
      });
    }
  };

  // 获取家庭成员数据 — 调用 manageUsers 云函数
  const fetchFamilyMembers = async () => {
    try {
      const result = await props.$w.cloud.callFunction({
        name: 'manageUsers',
        data: {
          action: 'query',
          queryType: 'byRole',
          role: 'family_member',
          page: 1,
          pageSize: 20
        }
      });
      if (result.result && result.result.success) {
        const users = result.result.data && result.result.data.users || [];
        setFamilyMembers(users.map(u => ({
          id: u._id,
          nickname: u.nickname,
          avatar: u.avatar,
          role: u.role,
          isActive: u.isActive
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
      setMembersLoading(true);
      await Promise.all([fetchDishes(), fetchFamilyMembers()]);
      setLoading(false);
      setMembersLoading(false);
    };
    loadData();
  }, []);
  const boardColors = [{
    color: '#FF8B4E',
    name: '温暖橙'
  }, {
    color: '#FF6B35',
    name: '亮橙'
  }, {
    color: '#E85A42',
    name: '深橙'
  }, {
    color: '#9CCF4E',
    name: '柔和绿'
  }, {
    color: '#FCEEB8',
    name: '奶油黄'
  }];
  const handleDishSelect = dish => {
    const isSelected = selectedDishes.some(d => d.id === dish.id);
    if (isSelected) {
      setSelectedDishes(selectedDishes.filter(d => d.id !== dish.id));
      toast({
        variant: 'default',
        title: '已取消选择',
        description: `${dish.name}`
      });
    } else {
      setSelectedDishes([...selectedDishes, dish]);
      toast({
        variant: 'default',
        title: '已选择菜品',
        description: `${dish.name}`
      });
    }
  };
  // 提交订单 — 调用 manageOrders 云函数
  const handleSubmitOrder = async () => {
    if (selectedDishes.length === 0) {
      toast({
        variant: 'destructive',
        title: '请选择菜品',
        description: '您还没有选择任何菜品'
      });
      return;
    }
    setSubmitting(true);
    try {
      const orderDishes = selectedDishes.map(d => ({
        name: d.name,
        quantity: 1,
        price: d.price || 0
      }));
      const total = orderDishes.reduce((sum, d) => sum + d.price * d.quantity, 0);
      const result = await props.$w.cloud.callFunction({
        name: 'manageOrders',
        data: {
          action: 'create',
          userName: currentUser.nickName || currentUser.name || '家庭成员',
          dishes: orderDishes,
          message: message || '',
          boardColor: boardColor,
          businessType: 'family',
          syncTarget: syncTarget
        }
      });
      if (result.result && result.result.success) {
        toast({
          variant: 'default',
          title: '订单提交成功',
          description: '已同步给大厨，等待烹饪完成'
        });
        setSelectedDishes([]);
        setMessage('');
      } else {
        toast({
          variant: 'destructive',
          title: '订单提交失败',
          description: result.result && result.result.message || '请重试'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '订单提交失败',
        description: error.message || '网络错误，请重试'
      });
    } finally {
      setSubmitting(false);
    }
  };
  const filteredDishes = menuData.filter(dish => dish.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
              <Heart className="h-10 w-10 text-[#FF8B4E]" />
              <h1 className="text-2xl font-bold text-[#FF6B35]" style={{
              fontFamily: 'Quicksand'
            }}>温馨家庭 - 点菜</h1>
            </div>
            <div className="flex items-center gap-4">
              <ShoppingCart className="h-6 w-6 text-[#FF8B4E]" />
              <span className="text-lg font-semibold text-[#FF6B35]" style={{
              fontFamily: 'Quicksand'
            }}>已选: {selectedDishes.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-[#FF8B4E]" />
            <Input className="flex-1 bg-[#FCEEB8] border-2 border-[#FF8B4E] rounded-xl h-12" placeholder="搜索菜品名称" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {/* 家庭成员展示区域 */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
              <Users className="h-6 w-6 inline mr-2" />家庭成员
            </h2>
            <span className="text-sm text-[#8B7355]" style={{
            fontFamily: 'Nunito'
          }}>{familyMembers.length} 位成员</span>
          </div>
          {membersLoading ? <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-[#FF8B4E]" />
            </div> : familyMembers.length === 0 ? <div className="text-center py-4">
              <Users className="h-10 w-10 mx-auto mb-2 text-[#FF8B4E]" />
              <p className="text-sm text-[#8B7355]" style={{
            fontFamily: 'Nunito'
          }}>暂无注册家庭成员</p>
            </div> : <div className="flex items-center gap-3 flex-wrap">
              {familyMembers.map(member => <div key={member.id} className="flex items-center gap-2 bg-[#FCEEB8] rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition-shadow">
                  {member.avatar ? <img src={member.avatar} alt={member.nickname} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 bg-[#FF8B4E] rounded-full flex items-center justify-center text-white text-sm font-bold" style={{
              fontFamily: 'Quicksand'
            }}>{member.nickname ? member.nickname.charAt(0) : '?'}</div>}
                  <div>
                    <p className="text-sm font-semibold text-[#FF6B35]" style={{
                fontFamily: 'Quicksand'
              }}>{member.nickname || '未命名'}</p>
                    <p className={`text-xs font-semibold ${member.isActive ? 'text-[#9CCF4E]' : 'text-[#E85A42]'}`} style={{
                fontFamily: 'Nunito'
              }}>{member.isActive ? '在线' : '离线'}</p>
                  </div>
                </div>)}
            </div>}
        </div>

        {/* 菜单网格区域 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {filteredDishes.length === 0 && <div className="col-span-full bg-white rounded-2xl shadow-xl p-8 text-center">
              <Heart className="h-12 w-12 text-[#FF8B4E] mx-auto mb-4" />
              <p className="text-[#8B7355] text-lg" style={{
            fontFamily: 'Nunito'
          }}>暂无菜品数据</p>
            </div>}
          {filteredDishes.map(dish => <div key={dish.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow relative">
              {/* 菜品图片 */}
              <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => {
            setModalImage(dish.image);
            setShowImageModal(true);
          }}>
                <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-2 shadow-md">
                  <Expand className="h-4 w-4 text-[#FF8B4E]" />
                </div>
              </div>

              {/* 已选择标识 */}
              {selectedDishes.some(d => d.id === dish.id) && <div className="absolute top-2 left-2 bg-[#FF6B35] rounded-full p-2 shadow-md">
                  <Check className="h-4 w-4 text-white" />
                </div>}

              {/* 菜品信息 */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-[#FF6B35] mb-2 cursor-pointer hover:text-[#E85A42] transition-colors" style={{
              fontFamily: 'Quicksand'
            }} onClick={() => {
              setCurrentDish(dish);
              setShowNutrition(true);
            }}>
                  {dish.name}
                </h3>
                <p className="text-sm text-[#8B7355] mb-3" style={{
              fontFamily: 'Nunito'
            }}>{dish.cuisine}</p>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-[#FF8B4E] rounded-full" />
                  <p className="text-xs text-[#8B7355]" style={{
                fontFamily: 'Nunito'
              }}>点击名称查看营养信息</p>
                </div>
                <Button className={selectedDishes.some(d => d.id === dish.id) ? 'w-full bg-[#9CCF4E] text-white h-10 font-bold rounded-xl shadow-lg' : 'w-full bg-[#FF8B4E] text-white h-10 font-bold rounded-xl shadow-lg hover:bg-[#FF6B35]'} onClick={() => handleDishSelect(dish)} style={{
              fontFamily: 'Quicksand'
            }}>
                  {selectedDishes.some(d => d.id === dish.id) ? '已选择' : '点菜'}
                </Button>
              </div>
            </div>)}
        </div>

        {/* 留言板区域 */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-[#FF6B35] mb-4" style={{
          fontFamily: 'Quicksand'
        }}>
            <MessageSquare className="h-6 w-6 text-[#FF8B4E] inline mr-2" />
            留言板
          </h2>

          <div className="mb-4">
            <label className="text-sm font-semibold text-[#8B7355] mb-2 block" style={{
            fontFamily: 'Nunito'
          }}>选择留言板颜色</label>
            <div className="flex gap-3">
              {boardColors.map(colorOption => <div key={colorOption.color} className={`w-12 h-12 rounded-full cursor-pointer border-4 transition-all ${boardColor === colorOption.color ? 'border-[#FF6B35] scale-110' : 'border-transparent hover:scale-105'}`} style={{
              backgroundColor: colorOption.color
            }} onClick={() => setBoardColor(colorOption.color)} title={colorOption.name} />)}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-semibold text-[#8B7355] mb-2 block" style={{
            fontFamily: 'Nunito'
          }}>同步给</label>
            <div className="flex gap-3">
              <Button className={syncTarget == 'all' ? 'flex-1 bg-[#FF8B4E] text-white h-10 font-bold rounded-xl' : 'flex-1 bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-10 font-bold rounded-xl'} onClick={() => setSyncTarget('all')} style={{
              fontFamily: 'Nunito'
            }}>
                大厨和所有人
              </Button>
              <Button className={syncTarget == 'chef' ? 'flex-1 bg-[#FF8B4E] text-white h-10 font-bold rounded-xl' : 'flex-1 bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-10 font-bold rounded-xl'} onClick={() => setSyncTarget('chef')} style={{
              fontFamily: 'Nunito'
            }}>
                只给大厨
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <Input className="w-full bg-[#FCEEB8] border-2 border-[#FF8B4E] rounded-xl h-32" placeholder="写下您的话..." value={message} onChange={e => setMessage(e.target.value)} />
          </div>

          <Button className="w-full bg-[#FF6B35] text-white h-14 text-lg font-bold rounded-xl shadow-lg hover:bg-[#E85A42]" onClick={handleSubmitOrder} disabled={submitting} style={{
          fontFamily: 'Quicksand'
        }}>
            {submitting ? <><Loader2 className="h-5 w-5 animate-spin inline mr-2" />提交中...</> : '提交订单'}
          </Button>
        </div>

        {/* 图片放大模态框 */}
        {showImageModal && <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl w-full">
              <Button className="absolute top-4 right-4 bg-white text-gray-800 rounded-full p-2 hover:bg-gray-100" onClick={() => setShowImageModal(false)}>
                <X className="h-6 w-6" />
              </Button>
              <img src={modalImage} alt="放大的图片" className="w-full rounded-2xl" />
            </div>
          </div>}

        {/* 营养信息模态框 */}
        {showNutrition && currentDish && <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#FF6B35]" style={{
              fontFamily: 'Quicksand'
            }}>
                  {currentDish.name}
                </h2>
                <Button className="bg-white text-gray-800 border-2 border-gray-300 rounded-xl p-2 hover:bg-gray-100" onClick={() => setShowNutrition(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {currentDish.nutrition && currentDish.nutrition.description && <p className="text-sm text-[#8B7355] mb-4" style={{
            fontFamily: 'Nunito'
          }}>{currentDish.nutrition.description}</p>}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#FCEEB8] rounded-xl p-4">
                  <p className="text-2xl font-bold text-[#FF6B35]" style={{
                fontFamily: 'Quicksand'
              }}>{currentDish.nutrition ? currentDish.nutrition.calories : 0} kcal</p>
                  <p className="text-sm text-[#8B7355]" style={{
                fontFamily: 'Nunito'
              }}>卡路里</p>
                </div>
                <div className="bg-[#FF8B4E] rounded-xl p-4">
                  <p className="text-2xl font-bold text-white" style={{
                fontFamily: 'Quicksand'
              }}>{currentDish.nutrition ? currentDish.nutrition.protein : 0}g</p>
                  <p className="text-sm text-white" style={{
                fontFamily: 'Nunito'
              }}>蛋白质</p>
                </div>
                <div className="bg-[#FF6B35] rounded-xl p-4">
                  <p className="text-2xl font-bold text-white" style={{
                fontFamily: 'Quicksand'
              }}>{currentDish.nutrition ? currentDish.nutrition.carbs : 0}g</p>
                  <p className="text-sm text-white" style={{
                fontFamily: 'Nunito'
              }}>碳水化合物</p>
                </div>
                <div className="bg-[#E85A42] rounded-xl p-4">
                  <p className="text-2xl font-bold text-white" style={{
                fontFamily: 'Quicksand'
              }}>{currentDish.nutrition ? currentDish.nutrition.fat : 0}g</p>
                  <p className="text-sm text-white" style={{
                fontFamily: 'Nunito'
              }}>脂肪</p>
                </div>
              </div>

              {/* 配料信息 */}
              {currentDish.ingredients && currentDish.ingredients.length > 0 && <div className="bg-[#FCEEB8] rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-[#FF6B35] mb-3" style={{
              fontFamily: 'Quicksand'
            }}>配料清单</h3>
                  <div className="space-y-2">
                    {currentDish.ingredients.map((ingredient, index) => <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#FF8B4E] rounded-full" />
                        <span className="text-sm text-[#8B7355]" style={{
                  fontFamily: 'Nunito'
                }}>{ingredient}</span>
                      </div>)}
                  </div>
                </div>}
            </div>
          </div>}
      </div>

      {/* 底部导航栏 */}
      <TabBar activeTab={activeTab} navigateTo={navigateTo} onTabChange={tabId => {
      setActiveTab(tabId);
      if (tabId === 'chef') {
        navigateTo({
          pageId: 'family-chef',
          params: {}
        });
      } else if (tabId === 'home') {
        navigateTo({
          pageId: 'family-home',
          params: {}
        });
      }
    }} userRole="family" />
    </div>;
}