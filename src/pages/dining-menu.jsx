// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { Store, Plus, Edit2, Trash2, Book, Search, Check, Upload, X, Sparkles, Loader2 } from 'lucide-react';

import TabBar from '@/components/TabBar';
export default function DiningMenu(props) {
  const {
    toast
  } = useToast();
  const {
    navigateBack,
    navigateTo
  } = props.$w.utils;
  const [activeTab, setActiveTab] = useState('custom');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    price: '',
    image: ''
  });
  const [templates] = useState([{
    id: 1,
    name: '川菜精选套餐',
    description: '包含宫保鸡丁、麻婆豆腐、水煮牛肉等经典川菜',
    items: ['宫保鸡丁', '麻婆豆腐', '水煮牛肉', '回锅肉'],
    image: 'https://images.unsplash.com/photo-1566757033849-0d6560c6318a?w=500'
  }, {
    id: 2,
    name: '家常菜套餐',
    description: '适合家庭聚餐的温馨家常菜',
    items: ['红烧狮子头', '糖醋排骨', '清蒸鲈鱼', '家常豆腐'],
    image: 'https://images.unsplash.com/photo-1551888847-bd7d405c0b6e?w=500'
  }, {
    id: 3,
    name: '素食套餐',
    description: '健康美味的素食选择',
    items: ['麻婆豆腐', '家常豆腐', '清炒时蔬', '素炒面'],
    image: 'https://images.unsplash.com/photo-1552364088-0568b0c08e7c?w=500'
  }]);

  // 从 dishes 数据模型加载菜品数据
  const fetchDishes = async () => {
    setLoading(true);
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'dishes',
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
          orderBy: [{
            createdAt: 'desc'
          }],
          select: {
            name: true,
            image: true,
            cuisine: true,
            price: true,
            isCustom: true
          },
          getCount: true,
          pageSize: 200,
          pageNumber: 1
        }
      });
      setMenuItems((result.records || []).map(record => ({
        id: record._id,
        name: record.name || '',
        cuisine: record.cuisine || '',
        price: record.price || 0,
        image: record.image || '',
        isCustom: record.isCustom || false
      })));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '加载失败',
        description: error.message || '无法加载菜品数据，请重试'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDishes();
  }, []);
  const handleDelete = async itemId => {
    try {
      await props.$w.cloud.callDataSource({
        dataSourceName: 'dishes',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: itemId
                }
              }]
            }
          }
        }
      });
      setMenuItems(menuItems.filter(item => item.id !== itemId));
      toast({
        variant: 'default',
        title: '删除成功',
        description: '菜品已从菜单中删除'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '删除失败',
        description: error.message || '请重试'
      });
    }
  };
  const handleEdit = item => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      cuisine: item.cuisine,
      price: String(item.price),
      image: item.image
    });
    setShowAddModal(true);
  };
  const handleSave = async e => {
    e.preventDefault();
    try {
      if (editingItem) {
        // 更新已有菜品
        await props.$w.cloud.callDataSource({
          dataSourceName: 'dishes',
          methodName: 'wedaUpdateV2',
          params: {
            filter: {
              where: {
                $and: [{
                  _id: {
                    $eq: editingItem.id
                  }
                }]
              }
            },
            data: {
              name: formData.name,
              cuisine: formData.cuisine,
              price: parseFloat(formData.price),
              image: formData.image
            }
          }
        });
        setMenuItems(menuItems.map(item => item.id === editingItem.id ? {
          ...item,
          ...formData,
          price: parseFloat(formData.price)
        } : item));
        toast({
          variant: 'default',
          title: '修改成功',
          description: '菜品信息已更新'
        });
      } else {
        // 新增菜品
        const newItemData = {
          name: formData.name,
          cuisine: formData.cuisine,
          price: parseFloat(formData.price),
          image: formData.image,
          isCustom: true,
          businessType: 'dining'
        };
        await props.$w.cloud.callDataSource({
          dataSourceName: 'dishes',
          methodName: 'wedaCreateV2',
          params: {
            data: newItemData
          }
        });
        const newItem = {
          id: Date.now(),
          ...newItemData,
          price: parseFloat(formData.price)
        };
        setMenuItems([...menuItems, newItem]);
        toast({
          variant: 'default',
          title: '添加成功',
          description: '新菜品已添加到菜单'
        });
      }
      setShowAddModal(false);
      setEditingItem(null);
      setFormData({
        name: '',
        cuisine: '',
        price: '',
        image: ''
      });
      fetchDishes();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '保存失败',
        description: error.message || '请重试'
      });
    }
  };
  const handleApplyTemplate = async template => {
    try {
      toast({
        variant: 'default',
        title: '正在应用模板',
        description: '请稍候...'
      });
      // 这里可以添加实际的模板应用逻辑
      setTimeout(() => {
        toast({
          variant: 'default',
          title: '模板应用成功',
          description: `已应用${template.name}`
        });
        setShowTemplateModal(false);
      }, 1500);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '模板应用失败',
        description: error.message || '请重试'
      });
    }
  };
  const filteredItems = menuItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.cuisine.toLowerCase().includes(searchQuery.toLowerCase()));
  return <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FF8B4E] to-[#FF6B35]">
      <div className="max-w-6xl mx-auto p-6 pb-24">
        {/* 头部区域 */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Store className="h-10 w-10 text-[#FF8B4E]" />
              <h1 className="text-2xl font-bold text-[#FF6B35]" style={{
              fontFamily: 'Quicksand'
            }}>
                菜单管理
              </h1>
            </div>
            <Button onClick={navigateBack} className="bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-10 px-4 font-bold rounded-xl hover:bg-[#FF6B35] hover:text-white" style={{
            fontFamily: 'Nunito'
          }}>
              返回
            </Button>
          </div>

          {/* Tab 切换 */}
          <div className="flex gap-3 mb-6">
            <Button onClick={() => setActiveTab('custom')} className={`flex-1 h-12 font-bold rounded-xl ${activeTab === 'custom' ? 'bg-[#FF8B4E] text-white' : 'bg-white text-[#FF6B35] border-2 border-[#FF6B35]'}`} style={{
            fontFamily: 'Quicksand'
          }}>
              自定义菜单
            </Button>
            <Button onClick={() => setActiveTab('template')} className={`flex-1 h-12 font-bold rounded-xl ${activeTab === 'template' ? 'bg-[#FF8B4E] text-white' : 'bg-white text-[#FF6B35] border-2 border-[#FF6B35]'}`} style={{
            fontFamily: 'Quicksand'
          }}>
              预制模板
            </Button>
          </div>

          {/* 搜索栏 */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8B7355]" />
            <input type="text" placeholder="搜索菜品名称或菜系..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-[#FCEEB8] rounded-xl border-2 border-[#FF8B4E] focus:outline-none focus:border-[#FF6B35] text-[#8B7355]" style={{
            fontFamily: 'Nunito'
          }} />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Button onClick={() => setShowAddModal(true)} className="flex-1 bg-[#FF8B4E] text-white h-12 font-bold rounded-xl shadow-lg hover:bg-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
              <Plus className="h-5 w-5 mr-2" />
              添加菜品
            </Button>
            {activeTab === 'template' && <Button onClick={() => setShowTemplateModal(true)} className="flex-1 bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-12 font-bold rounded-xl shadow-lg hover:bg-[#FF6B35] hover:text-white" style={{
            fontFamily: 'Quicksand'
          }}>
                <Book className="h-5 w-5 mr-2" />
                应用模板
              </Button>}
          </div>
        </div>

        {/* 加载状态 */}
        {loading && <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-[#FF8B4E] animate-spin" />
            <span className="ml-3 text-[#8B7355] font-semibold" style={{
          fontFamily: 'Nunito'
        }}>
              加载菜品数据中...
            </span>
          </div>}

        {/* 自定义菜单内容 */}
        {!loading && activeTab === 'custom' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.length === 0 && <div className="col-span-full text-center py-16">
                <Store className="h-16 w-16 mx-auto mb-4 text-[#FCEEB8]" />
                <p className="text-[#8B7355] font-semibold" style={{
            fontFamily: 'Nunito'
          }}>
                  暂无菜品数据
                </p>
              </div>}
            {filteredItems.map(item => <div key={item.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                <div className="h-40 relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  {item.isCustom && <div className="absolute top-2 right-2 bg-[#FF6B35] text-white px-3 py-1 rounded-full text-xs font-bold" style={{
              fontFamily: 'Quicksand'
            }}>
                      自定义
                    </div>}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-[#FF6B35] mb-2" style={{
              fontFamily: 'Quicksand'
            }}>
                    {item.name}
                  </h3>
                  <p className="text-sm text-[#8B7355] mb-3" style={{
              fontFamily: 'Nunito'
            }}>
                    {item.cuisine}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-[#FF6B35]" style={{
                fontFamily: 'Quicksand'
              }}>
                      ¥{item.price}
                    </span>
                    <div className="flex gap-2">
                      <Button onClick={() => handleEdit(item)} className="bg-[#FCEEB8] text-[#FF6B35] h-8 w-8 p-0 rounded-lg hover:bg-[#FF6B35] hover:text-white">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => handleDelete(item.id)} className="bg-[#FCEEB8] text-[#FF6B35] h-8 w-8 p-0 rounded-lg hover:bg-[#E85A42] hover:text-white">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>)}
          </div>}

        {/* 预制模板内容 */}
        {activeTab === 'template' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => <div key={template.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer" onClick={() => handleApplyTemplate(template)}>
                <div className="h-40 relative">
                  <img src={template.image} alt={template.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-bold text-white" style={{
                fontFamily: 'Quicksand'
              }}>
                      {template.name}
                    </h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-[#8B7355] mb-3" style={{
              fontFamily: 'Nunito'
            }}>
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {template.items.slice(0, 3).map((item, index) => <span key={index} className="px-2 py-1 bg-[#FCEEB8] text-[#FF6B35] rounded-lg text-xs font-semibold" style={{
                fontFamily: 'Nunito'
              }}>
                        {item}
                      </span>)}
                    {template.items.length > 3 && <span className="px-2 py-1 bg-[#FCEEB8] text-[#FF6B35] rounded-lg text-xs font-semibold" style={{
                fontFamily: 'Nunito'
              }}>
                        +{template.items.length - 3}
                      </span>}
                  </div>
                </div>
              </div>)}
          </div>}
      </div>

      {/* 添加/编辑菜品弹窗 */}
      {showAddModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
                {editingItem ? '编辑菜品' : '添加菜品'}
              </h2>
              <Button onClick={() => {
            setShowAddModal(false);
            setEditingItem(null);
            setFormData({
              name: '',
              cuisine: '',
              price: '',
              image: ''
            });
          }} className="bg-transparent text-[#8B7355] h-8 w-8 p-0 hover:bg-[#FCEEB8] rounded-lg">
                <X className="h-6 w-6" />
              </Button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#8B7355] mb-2" style={{
              fontFamily: 'Quicksand'
            }}>
                  菜品名称 *
                </label>
                <input type="text" required value={formData.name} onChange={e => setFormData({
              ...formData,
              name: e.target.value
            })} className="w-full px-4 py-3 bg-[#FCEEB8] rounded-xl border-2 border-[#FF8B4E] focus:outline-none focus:border-[#FF6B35] text-[#8B7355]" style={{
              fontFamily: 'Nunito'
            }} placeholder="请输入菜品名称" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8B7355] mb-2" style={{
              fontFamily: 'Quicksand'
            }}>
                  菜系
                </label>
                <input type="text" value={formData.cuisine} onChange={e => setFormData({
              ...formData,
              cuisine: e.target.value
            })} className="w-full px-4 py-3 bg-[#FCEEB8] rounded-xl border-2 border-[#FF8B4E] focus:outline-none focus:border-[#FF6B35] text-[#8B7355]" style={{
              fontFamily: 'Nunito'
            }} placeholder="请输入菜系（如：四川菜系）" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8B7355] mb-2" style={{
              fontFamily: 'Quicksand'
            }}>
                  价格 (元) *
                </label>
                <input type="number" required step="0.01" value={formData.price} onChange={e => setFormData({
              ...formData,
              price: e.target.value
            })} className="w-full px-4 py-3 bg-[#FCEEB8] rounded-xl border-2 border-[#FF8B4E] focus:outline-none focus:border-[#FF6B35] text-[#8B7355]" style={{
              fontFamily: 'Nunito'
            }} placeholder="请输入价格" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8B7355] mb-2" style={{
              fontFamily: 'Quicksand'
            }}>
                  菜品图片
                </label>
                <div className="border-2 border-dashed border-[#FF8B4E] rounded-xl p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-2 text-[#FF8B4E]" />
                  <p className="text-sm text-[#8B7355]" style={{
                fontFamily: 'Nunito'
              }}>
                    点击上传菜品图片
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full bg-[#FF8B4E] text-white h-12 font-bold rounded-xl shadow-lg hover:bg-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
                <Check className="h-5 w-5 mr-2" />
                {editingItem ? '保存修改' : '添加菜品'}
              </Button>
            </form>
          </div>
        </div>}

      <TabBar activeTab="menu" navigateTo={navigateTo} onTabChange={tabId => console.log(tabId)} userRole="dining" />
    </div>;
}