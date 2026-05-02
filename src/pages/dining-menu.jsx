// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { Store, Plus, Edit2, Trash2, Book, Search, Check, Upload, X, Sparkles, Loader2, ToggleLeft, ToggleRight, CheckSquare, Square, AlertTriangle } from 'lucide-react';

import TabBar from '@/components/TabBar';
export default function DiningMenu(props) {
  const {
    toast
  } = useToast();
  const {
    navigateTo,
    navigateBack
  } = props.$w.utils;
  const [activeTab, setActiveTab] = useState('custom');
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    price: '',
    image: '',
    nutrition: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      description: ''
    },
    ingredients: []
  });
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [applyingTemplate, setApplyingTemplate] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(null);
  const [batchOperating, setBatchOperating] = useState(false);

  // 获取菜品列表
  const fetchDishes = async () => {
    setLoading(true);
    try {
      const result = await props.$w.cloud.callFunction({
        name: 'manageDishes',
        data: {
          action: 'query',
          queryType: 'byBusinessType',
          businessType: 'dining',
          page: 1,
          pageSize: 50
        }
      });
      if (result.result && result.result.success) {
        const dishes = result.result.data.dishes.map(dish => ({
          id: dish._id,
          name: dish.name,
          cuisine: dish.cuisine || '',
          price: dish.price,
          image: dish.image || 'https://images.unsplash.com/photo-1551888847-bd7d405c0b6e?w=500',
          isCustom: dish.isCustom || false,
          nutrition: dish.nutrition || {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            description: ''
          },
          ingredients: dish.ingredients || []
        }));
        setMenuItems(dishes);
      } else {
        toast({
          variant: 'destructive',
          title: '获取菜品失败',
          description: result.result?.message || '请稍后重试'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '请求失败',
        description: error.message || '无法获取菜品列表'
      });
    } finally {
      setLoading(false);
    }
  };

  // 获取模板列表
  const fetchTemplates = async () => {
    setTemplateLoading(true);
    try {
      const result = await props.$w.cloud.callFunction({
        name: 'manageMenuTemplates',
        data: {
          action: 'query',
          queryType: 'all',
          page: 1,
          pageSize: 50
        }
      });
      if (result.result && result.result.success) {
        const tplList = result.result.data.templates.map(tpl => ({
          id: tpl._id,
          name: tpl.name,
          description: tpl.description || '',
          items: tpl.items || [],
          image: tpl.image || 'https://images.unsplash.com/photo-1566757033849-0d6560c6318a?w=500'
        }));
        setTemplates(tplList);
      } else {
        toast({
          variant: 'destructive',
          title: '获取模板失败',
          description: result.result?.message || '请稍后重试'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '请求失败',
        description: error.message || '无法获取模板列表'
      });
    } finally {
      setTemplateLoading(false);
    }
  };
  useEffect(() => {
    fetchDishes();
    fetchTemplates();
  }, []);
  const handleDelete = async itemId => {
    try {
      const result = await props.$w.cloud.callFunction({
        name: 'manageDishes',
        data: {
          action: 'delete',
          dishId: itemId
        }
      });
      if (result.result && result.result.success) {
        setMenuItems(menuItems.filter(item => item.id !== itemId));
        toast({
          variant: 'default',
          title: '删除成功',
          description: '菜品已从菜单中删除'
        });
      } else {
        toast({
          variant: 'destructive',
          title: '删除失败',
          description: result.result?.message || '请重试'
        });
      }
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
      image: item.image,
      nutrition: item.nutrition || {
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        description: ''
      },
      ingredients: item.ingredients || []
    });
    setShowAddModal(true);
  };
  const handleSave = async e => {
    e.preventDefault();
    try {
      if (editingItem) {
        // 更新菜品
        const nutritionData = formData.nutrition && (formData.nutrition.calories || formData.nutrition.protein || formData.nutrition.carbs || formData.nutrition.fat || formData.nutrition.description) ? {
          calories: formData.nutrition.calories ? parseFloat(formData.nutrition.calories) : undefined,
          protein: formData.nutrition.protein ? parseFloat(formData.nutrition.protein) : undefined,
          carbs: formData.nutrition.carbs ? parseFloat(formData.nutrition.carbs) : undefined,
          fat: formData.nutrition.fat ? parseFloat(formData.nutrition.fat) : undefined,
          description: formData.nutrition.description || undefined
        } : undefined;
        const result = await props.$w.cloud.callFunction({
          name: 'manageDishes',
          data: {
            action: 'update',
            dishId: editingItem.id,
            name: formData.name || undefined,
            cuisine: formData.cuisine || undefined,
            price: formData.price ? parseFloat(formData.price) : undefined,
            image: formData.image || undefined,
            nutrition: nutritionData,
            ingredients: formData.ingredients && formData.ingredients.length > 0 ? formData.ingredients : undefined
          }
        });
        if (result.result && result.result.success) {
          toast({
            variant: 'default',
            title: '修改成功',
            description: '菜品信息已更新'
          });
        } else {
          toast({
            variant: 'destructive',
            title: '修改失败',
            description: result.result?.message || '请重试'
          });
        }
      } else {
        // 新增菜品
        const nutritionData = formData.nutrition && (formData.nutrition.calories || formData.nutrition.protein || formData.nutrition.carbs || formData.nutrition.fat || formData.nutrition.description) ? {
          calories: formData.nutrition.calories ? parseFloat(formData.nutrition.calories) : undefined,
          protein: formData.nutrition.protein ? parseFloat(formData.nutrition.protein) : undefined,
          carbs: formData.nutrition.carbs ? parseFloat(formData.nutrition.carbs) : undefined,
          fat: formData.nutrition.fat ? parseFloat(formData.nutrition.fat) : undefined,
          description: formData.nutrition.description || undefined
        } : undefined;
        const result = await props.$w.cloud.callFunction({
          name: 'manageDishes',
          data: {
            action: 'create',
            name: formData.name,
            cuisine: formData.cuisine || '自定义',
            price: parseFloat(formData.price),
            image: formData.image || 'https://images.unsplash.com/photo-1551888847-bd7d405c0b6e?w=500',
            isCustom: true,
            businessType: 'dining',
            nutrition: nutritionData,
            ingredients: formData.ingredients && formData.ingredients.length > 0 ? formData.ingredients : undefined
          }
        });
        if (result.result && result.result.success) {
          toast({
            variant: 'default',
            title: '添加成功',
            description: '新菜品已添加到菜单'
          });
        } else {
          toast({
            variant: 'destructive',
            title: '添加失败',
            description: result.result?.message || '请重试'
          });
        }
      }
      setShowAddModal(false);
      setEditingItem(null);
      setFormData({
        name: '',
        cuisine: '',
        price: '',
        image: '',
        nutrition: {
          calories: '',
          protein: '',
          carbs: '',
          fat: '',
          description: ''
        },
        ingredients: []
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
    setApplyingTemplate(true);
    try {
      // 获取模板中的菜品名称列表
      const templateItems = template.items || [];
      // 查询现有菜品，避免重复添加
      const existingItems = menuItems.map(item => item.name);
      const newItems = templateItems.filter(name => !existingItems.includes(name));
      if (newItems.length === 0) {
        toast({
          variant: 'default',
          title: '无需添加',
          description: '模板中的菜品已全部存在于菜单中'
        });
        setApplyingTemplate(false);
        setShowTemplateModal(false);
        return;
      }
      // 逐个创建模板中的菜品
      let successCount = 0;
      let failCount = 0;
      for (const name of newItems) {
        try {
          const result = await props.$w.cloud.callFunction({
            name: 'manageDishes',
            data: {
              action: 'create',
              name: name,
              cuisine: template.name.includes('川菜') ? '四川菜系' : template.name.includes('家常') ? '自定义' : '八大菜系',
              price: 38,
              image: template.image || 'https://images.unsplash.com/photo-1551888847-bd7d405c0b6e?w=500',
              isCustom: false,
              businessType: 'dining'
            }
          });
          if (result.result && result.result.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch {
          failCount++;
        }
      }
      if (successCount > 0) {
        toast({
          variant: 'default',
          title: '模板应用成功',
          description: `已应用${template.name}，成功添加 ${successCount} 道菜品${failCount > 0 ? `，${failCount} 道失败` : ''}`
        });
        fetchDishes();
      } else {
        toast({
          variant: 'destructive',
          title: '模板应用失败',
          description: '所有菜品添加失败，请重试'
        });
      }
      setShowTemplateModal(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '模板应用失败',
        description: error.message || '请重试'
      });
    } finally {
      setApplyingTemplate(false);
    }
  };
  // 选择/取消选择单个菜品
  const toggleSelectItem = id => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 全选/取消全选当前过滤后的菜品
  const toggleSelectAll = () => {
    const filteredIds = new Set(filteredItems.map(item => item.id));
    const allSelected = filteredIds.size > 0 && filteredIds.every(id => selectedItems.has(id));
    if (allSelected) {
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        filteredIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    } else {
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        filteredIds.forEach(id => newSet.add(id));
        return newSet;
      });
    }
  };

  // 批量删除 — 调用 manageDishes 云函数
  const handleBatchDelete = async () => {
    if (selectedItems.size === 0) return;
    setBatchOperating(true);
    let successCount = 0;
    let failCount = 0;
    for (const id of selectedItems) {
      try {
        const result = await props.$w.cloud.callFunction({
          name: 'manageDishes',
          data: {
            action: 'delete',
            dishId: id
          }
        });
        if (result.result && result.result.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }
    if (successCount > 0) {
      toast({
        variant: 'default',
        title: '批量删除成功',
        description: `成功删除 ${successCount} 道菜品${failCount > 0 ? `，${failCount} 道失败` : ''}`
      });
      fetchDishes();
    } else {
      toast({
        variant: 'destructive',
        title: '批量删除失败',
        description: '所有菜品删除失败，请重试'
      });
    }
    setSelectedItems(new Set());
    setShowConfirmModal(null);
    setBatchOperating(false);
  };

  // 批量状态切换（上架/下架） — 调用 manageDishes 云函数
  const handleBatchToggleStatus = async () => {
    if (selectedItems.size === 0) return;
    setBatchOperating(true);
    const firstSelected = menuItems.find(item => selectedItems.has(item.id));
    const targetIsCustom = firstSelected ? !firstSelected.isCustom : true;
    let successCount = 0;
    let failCount = 0;
    for (const id of selectedItems) {
      try {
        const result = await props.$w.cloud.callFunction({
          name: 'manageDishes',
          data: {
            action: 'update',
            dishId: id,
            isCustom: targetIsCustom
          }
        });
        if (result.result && result.result.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }
    const actionLabel = targetIsCustom ? '下架' : '上架';
    if (successCount > 0) {
      toast({
        variant: 'default',
        title: `批量${actionLabel}成功`,
        description: `成功${actionLabel} ${successCount} 道菜品${failCount > 0 ? `，${failCount} 道失败` : ''}`
      });
      fetchDishes();
    } else {
      toast({
        variant: 'destructive',
        title: `批量${actionLabel}失败`,
        description: '所有操作失败，请重试'
      });
    }
    setSelectedItems(new Set());
    setShowConfirmModal(null);
    setBatchOperating(false);
  };

  // 删除模板 — 调用 manageMenuTemplates 云函数
  const handleDeleteTemplate = async templateId => {
    try {
      const result = await props.$w.cloud.callFunction({
        name: 'manageMenuTemplates',
        data: {
          action: 'delete',
          templateId: templateId
        }
      });
      if (result.result && result.result.success) {
        toast({
          variant: 'default',
          title: '删除模板成功',
          description: '模板已删除'
        });
        fetchTemplates();
      } else {
        toast({
          variant: 'destructive',
          title: '删除模板失败',
          description: result.result?.message || '请重试'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '删除模板失败',
        description: error.message || '请重试'
      });
    }
  };
  const filteredItems = menuItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.cuisine.toLowerCase().includes(searchQuery.toLowerCase()));
  const allFilteredSelected = filteredItems.length > 0 && filteredItems.every(item => selectedItems.has(item.id));
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

        {/* 自定义菜单内容 */}
        {activeTab === 'custom' && <>
            {loading ? <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#FF8B4E]" />
                <span className="ml-3 text-[#8B7355]" style={{
            fontFamily: 'Nunito'
          }}>加载菜品中...</span>
              </div> : filteredItems.length === 0 ? <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <Store className="h-12 w-12 mx-auto mb-3 text-[#FF8B4E]" />
                <p className="text-[#8B7355]" style={{
            fontFamily: 'Nunito'
          }}>暂无菜品数据</p>
              </div> : <>
                {/* 批量操作工具栏 */}
                {selectedItems.size > 0 && <div className="bg-[#FF6B35] rounded-2xl shadow-xl p-4 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold" style={{
                fontFamily: 'Quicksand'
              }}>已选 {selectedItems.size} 项</span>
                      <Button onClick={() => setSelectedItems(new Set())} className="bg-white/20 text-white h-8 px-3 text-sm font-semibold rounded-lg hover:bg-white/30">
                        取消选择
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setShowConfirmModal('toggleStatus')} disabled={batchOperating} className="bg-white text-[#FF6B35] h-9 px-4 font-bold rounded-lg hover:bg-[#FCEEB8] shadow">
                        {selectedItems.size > 0 && menuItems.find(i => selectedItems.has(i.id) && i.isCustom) !== undefined ? <><ToggleLeft className="h-4 w-4 mr-1" />上架</> : <><ToggleRight className="h-4 w-4 mr-1" />下架</>}
                      </Button>
                      <Button onClick={() => setShowConfirmModal('batchDelete')} disabled={batchOperating} className="bg-[#E85A42] text-white h-9 px-4 font-bold rounded-lg hover:bg-[#FF6B35] shadow">
                        <Trash2 className="h-4 w-4 mr-1" />批量删除
                      </Button>
                    </div>
                  </div>}

                {/* 全选栏 */}
                <div className="bg-white rounded-2xl shadow-xl p-4 mb-4 flex items-center gap-3 cursor-pointer" onClick={toggleSelectAll}>
                  {allFilteredSelected ? <CheckSquare className="h-5 w-5 text-[#FF6B35]" /> : <Square className="h-5 w-5 text-[#8B7355]" />}
                  <span className="text-sm font-semibold text-[#8B7355]" style={{
              fontFamily: 'Nunito'
            }}>全选（{filteredItems.length}项）</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map(item => <div key={item.id} className={`bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow ${selectedItems.has(item.id) ? 'ring-2 ring-[#FF6B35]' : ''}`}>
                      <div className="h-40 relative">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 cursor-pointer" onClick={e => {
                  e.stopPropagation();
                  toggleSelectItem(item.id);
                }}>
                          {selectedItems.has(item.id) ? <CheckSquare className="h-6 w-6 text-[#FF6B35] bg-white rounded" /> : <Square className="h-6 w-6 text-white/70 rounded" />}
                        </div>
                        {item.isCustom ? <div className="absolute top-2 right-2 bg-[#FF6B35] text-white px-3 py-1 rounded-full text-xs font-bold" style={{
                  fontFamily: 'Quicksand'
                }}>自定义</div> : <div className="absolute top-2 right-2 bg-[#9CCF4E] text-white px-3 py-1 rounded-full text-xs font-bold" style={{
                  fontFamily: 'Quicksand'
                }}>已上架</div>}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-[#FF6B35] mb-2" style={{
                  fontFamily: 'Quicksand'
                }}>{item.name}</h3>
                        <p className="text-sm text-[#8B7355] mb-3" style={{
                  fontFamily: 'Nunito'
                }}>{item.cuisine}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-[#FF6B35]" style={{
                    fontFamily: 'Quicksand'
                  }}>¥{item.price}</span>
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
                </div>
              </>}
          </>}

        {/* 预制模板内容 */}
        {activeTab === 'template' && <>
            {templateLoading ? <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#FF8B4E]" />
                <span className="ml-3 text-[#8B7355]" style={{
            fontFamily: 'Nunito'
          }}>加载模板中...</span>
              </div> : templates.length === 0 ? <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <Book className="h-12 w-12 mx-auto mb-3 text-[#FF8B4E]" />
                <p className="text-[#8B7355]" style={{
            fontFamily: 'Nunito'
          }}>暂无模板数据</p>
              </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => <div key={template.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                    <div className="h-40 relative cursor-pointer" onClick={() => handleApplyTemplate(template)}>
                      <img src={template.image} alt={template.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-lg font-bold text-white" style={{
                  fontFamily: 'Quicksand'
                }}>{template.name}</h3>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-[#8B7355] mb-3" style={{
                fontFamily: 'Nunito'
              }}>{template.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {template.items.slice(0, 3).map((item, index) => <span key={index} className="px-2 py-1 bg-[#FCEEB8] text-[#FF6B35] rounded-lg text-xs font-semibold" style={{
                  fontFamily: 'Nunito'
                }}>{item}</span>)}
                        {template.items.length > 3 && <span className="px-2 py-1 bg-[#FCEEB8] text-[#FF6B35] rounded-lg text-xs font-semibold" style={{
                  fontFamily: 'Nunito'
                }}>+{template.items.length - 3}</span>}
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleApplyTemplate(template)} disabled={applyingTemplate} className="flex-1 bg-[#FF8B4E] text-white h-9 font-bold rounded-lg shadow hover:bg-[#FF6B35]" style={{
                  fontFamily: 'Quicksand'
                }}>
                          {applyingTemplate ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : '应用模板'}
                        </Button>
                        <Button onClick={e => {
                  e.stopPropagation();
                  setShowConfirmModal({
                    type: 'deleteTemplate',
                    templateId: template.id,
                    templateName: template.name
                  });
                }} className="bg-[#FCEEB8] text-[#E85A42] h-9 w-9 p-0 rounded-lg hover:bg-[#E85A42] hover:text-white">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>)}
              </div>}
          </>}
      </div>

      {/* 添加/编辑菜品弹窗 */}
      {showAddModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md my-8">
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
              image: '',
              nutrition: {
                calories: '',
                protein: '',
                carbs: '',
                fat: '',
                description: ''
              },
              ingredients: []
            });
          }} className="bg-transparent text-[#8B7355] h-8 w-8 p-0 hover:bg-[#FCEEB8] rounded-lg">
                <X className="h-6 w-6" />
              </Button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#8B7355] mb-2" style={{
              fontFamily: 'Quicksand'
            }}>菜品名称 *</label>
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
            }}>菜系</label>
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
            }}>价格 (元) *</label>
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
            }}>菜品图片 URL</label>
                <input type="text" value={formData.image} onChange={e => setFormData({
              ...formData,
              image: e.target.value
            })} className="w-full px-4 py-3 bg-[#FCEEB8] rounded-xl border-2 border-[#FF8B4E] focus:outline-none focus:border-[#FF6B35] text-[#8B7355]" style={{
              fontFamily: 'Nunito'
            }} placeholder="请输入图片 URL" />
              </div>

              {/* 营养信息（可折叠） */}
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-[#8B7355]" style={{
              fontFamily: 'Quicksand'
            }}>
                  <Sparkles className="h-4 w-4 text-[#FF8B4E]" />
                  营养信息（选填）
                </summary>
                <div className="mt-3 space-y-3 border-t border-[#FF8B4E]/20 pt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#8B7355] mb-1" style={{
                    fontFamily: 'Quicksand'
                  }}>卡路里</label>
                      <input type="number" value={formData.nutrition.calories} onChange={e => setFormData({
                    ...formData,
                    nutrition: {
                      ...formData.nutrition,
                      calories: e.target.value
                    }
                  })} className="w-full px-3 py-2 bg-[#FCEEB8] rounded-lg border-2 border-[#FF8B4E] focus:outline-none focus:border-[#FF6B35] text-[#8B7355] text-sm" style={{
                    fontFamily: 'Nunito'
                  }} placeholder="kcal" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#8B7355] mb-1" style={{
                    fontFamily: 'Quicksand'
                  }}>蛋白质(g)</label>
                      <input type="number" value={formData.nutrition.protein} onChange={e => setFormData({
                    ...formData,
                    nutrition: {
                      ...formData.nutrition,
                      protein: e.target.value
                    }
                  })} className="w-full px-3 py-2 bg-[#FCEEB8] rounded-lg border-2 border-[#FF8B4E] focus:outline-none focus:border-[#FF6B35] text-[#8B7355] text-sm" style={{
                    fontFamily: 'Nunito'
                  }} placeholder="g" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#8B7355] mb-1" style={{
                    fontFamily: 'Quicksand'
                  }}>碳水(g)</label>
                      <input type="number" value={formData.nutrition.carbs} onChange={e => setFormData({
                    ...formData,
                    nutrition: {
                      ...formData.nutrition,
                      carbs: e.target.value
                    }
                  })} className="w-full px-3 py-2 bg-[#FCEEB8] rounded-lg border-2 border-[#FF8B4E] focus:outline-none focus:border-[#FF6B35] text-[#8B7355] text-sm" style={{
                    fontFamily: 'Nunito'
                  }} placeholder="g" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#8B7355] mb-1" style={{
                    fontFamily: 'Quicksand'
                  }}>脂肪(g)</label>
                      <input type="number" value={formData.nutrition.fat} onChange={e => setFormData({
                    ...formData,
                    nutrition: {
                      ...formData.nutrition,
                      fat: e.target.value
                    }
                  })} className="w-full px-3 py-2 bg-[#FCEEB8] rounded-lg border-2 border-[#FF8B4E] focus:outline-none focus:border-[#FF6B35] text-[#8B7355] text-sm" style={{
                    fontFamily: 'Nunito'
                  }} placeholder="g" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B7355] mb-1" style={{
                  fontFamily: 'Quicksand'
                }}>营养描述</label>
                    <input type="text" value={formData.nutrition.description} onChange={e => setFormData({
                  ...formData,
                  nutrition: {
                    ...formData.nutrition,
                    description: e.target.value
                  }
                })} className="w-full px-3 py-2 bg-[#FCEEB8] rounded-lg border-2 border-[#FF8B4E] focus:outline-none focus:border-[#FF6B35] text-[#8B7355] text-sm" style={{
                  fontFamily: 'Nunito'
                }} placeholder="简短描述营养特点" />
                  </div>
                </div>
              </details>

              {/* 配料（可折叠） */}
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-[#8B7355]" style={{
              fontFamily: 'Quicksand'
            }}>
                  <Book className="h-4 w-4 text-[#FF8B4E]" />
                  配料（选填）
                </summary>
                <div className="mt-3 border-t border-[#FF8B4E]/20 pt-3">
                  <div className="space-y-2">
                    {formData.ingredients.map((ingredient, index) => <div key={index} className="flex items-center gap-2">
                        <input type="text" value={ingredient} onChange={e => {
                    const newIngredients = [...formData.ingredients];
                    newIngredients[index] = e.target.value;
                    setFormData({
                      ...formData,
                      ingredients: newIngredients
                    });
                  }} className="flex-1 px-3 py-2 bg-[#FCEEB8] rounded-lg border-2 border-[#FF8B4E] focus:outline-none focus:border-[#FF6B35] text-[#8B7355] text-sm" style={{
                    fontFamily: 'Nunito'
                  }} placeholder="如：猪肉500g" />
                        <Button type="button" onClick={() => setFormData({
                    ...formData,
                    ingredients: formData.ingredients.filter((_, i) => i !== index)
                  })} className="text-[#E85A42] h-8 w-8 p-0 hover:bg-[#FCEEB8] rounded-lg">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>)}
                  </div>
                  <Button type="button" onClick={() => setFormData({
                ...formData,
                ingredients: [...formData.ingredients, '']
              })} className="mt-2 w-full bg-[#FCEEB8] text-[#FF8B4E] h-9 text-sm font-semibold rounded-lg hover:bg-[#FF8B4E] hover:text-white" style={{
                fontFamily: 'Quicksand'
              }}>
                    <Plus className="h-4 w-4 mr-1" />添加配料
                  </Button>
                </div>
              </details>

              <Button type="submit" className="w-full bg-[#FF8B4E] text-white h-12 font-bold rounded-xl shadow-lg hover:bg-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
                <Check className="h-5 w-5 mr-2" />
                {editingItem ? '保存修改' : '添加菜品'}
              </Button>
            </form>
          </div>
        </div>}

      {/* 确认对话框 */}
      {showConfirmModal && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-[#E85A42]" />
              <h2 className="text-xl font-bold text-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>确认操作</h2>
            </div>
            {showConfirmModal.type === 'batchDelete' && <p className="text-[#8B7355] mb-6" style={{
          fontFamily: 'Nunito'
        }}>
                确定要删除选中的 {selectedItems.size} 道菜品吗？此操作不可撤销。
              </p>}
            {showConfirmModal.type === 'toggleStatus' && <p className="text-[#8B7355] mb-6" style={{
          fontFamily: 'Nunito'
        }}>
                确定要{menuItems.find(i => selectedItems.has(i.id) && i.isCustom) !== undefined ? '上架' : '下架'}选中的 {selectedItems.size} 道菜品吗？
              </p>}
            {showConfirmModal.type === 'deleteTemplate' && <p className="text-[#8B7355] mb-6" style={{
          fontFamily: 'Nunito'
        }}>
                确定要删除模板「{showConfirmModal.templateName}」吗？此操作不可撤销。
              </p>}
            <div className="flex gap-3">
              <Button onClick={() => setShowConfirmModal(null)} className="flex-1 bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-10 font-bold rounded-xl hover:bg-[#FCEEB8]" style={{
            fontFamily: 'Quicksand'
          }}>
                取消
              </Button>
              <Button onClick={() => {
            if (showConfirmModal.type === 'batchDelete') {
              handleBatchDelete();
            } else if (showConfirmModal.type === 'toggleStatus') {
              handleBatchToggleStatus();
            } else if (showConfirmModal.type === 'deleteTemplate') {
              handleDeleteTemplate(showConfirmModal.templateId);
            }
          }} disabled={batchOperating} className="flex-1 bg-[#E85A42] text-white h-10 font-bold rounded-xl hover:bg-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
                {batchOperating ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : '确认'}
              </Button>
            </div>
          </div>
        </div>}

      <TabBar activeTab="menu" navigateTo={navigateTo} onTabChange={tabId => console.log(tabId)} userRole="dining" />
    </div>;
}