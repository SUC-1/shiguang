// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { Calendar, Plus, Search, Filter, TrendingUp, TrendingDown, Trash2, Edit2, X, Check, ChevronDown, ChevronUp } from 'lucide-react';

// 收支记录页面
const FamilyFinancePage = props => {
  const {
    toast
  } = useToast();
  const {
    navigateTo,
    navigateBack,
    page
  } = props.$w.utils;
  const currentUser = props.$w.auth.currentUser;
  const activityId = page.dataset.params?.activityId;
  const [records, setRecords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [familyGroupId, setFamilyGroupId] = useState(null);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    recordDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'wechat'
  });

  // 获取当前用户的家庭组
  const fetchFamilyGroup = async () => {
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'family_memberships',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                userId: {
                  $eq: currentUser.userId
                }
              }, {
                status: {
                  $eq: 'active'
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
      if (result && result.records && result.records.length > 0) {
        setFamilyGroupId(result.records[0].familyGroupId);
        return result.records[0].familyGroupId;
      }
      return null;
    } catch (error) {
      console.error('获取家庭组失败:', error);
      return null;
    }
  };

  // 获取收支记录
  const fetchRecords = async groupId => {
    try {
      const targetGroupId = groupId || familyGroupId;
      if (!targetGroupId) return;
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'family_finance_records',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              familyGroupId: {
                $eq: targetGroupId
              }
            }
          },
          orderBy: [{
            recordDate: 'desc'
          }],
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 100,
          pageNumber: 1
        }
      });
      if (result && result.records) {
        setRecords(result.records.map(r => ({
          id: r._id,
          familyGroupId: r.familyGroupId,
          userId: r.userId,
          nickname: r.nickname,
          type: r.type,
          category: r.category,
          amount: r.amount,
          description: r.description,
          recordDate: r.recordDate,
          paymentMethod: r.paymentMethod,
          status: r.status
        })));
      }
    } catch (error) {
      console.error('获取收支记录失败:', error);
    }
  };

  // 获取分类
  const fetchCategories = async () => {
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'finance_categories',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            sort: 'asc'
          }],
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 50,
          pageNumber: 1
        }
      });
      if (result && result.records) {
        setCategories(result.records.map(c => ({
          id: c._id,
          name: c.name,
          type: c.type,
          icon: c.icon,
          color: c.color
        })));
      }
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  // 页面初始化
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const groupId = await fetchFamilyGroup();
      await Promise.all([fetchRecords(groupId), fetchCategories()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // 添加/编辑记录
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.category || !formData.amount || !formData.recordDate) {
      toast({
        variant: 'destructive',
        title: '请填写完整信息'
      });
      return;
    }
    try {
      const recordData = {
        familyGroupId: familyGroupId,
        userId: currentUser.userId,
        nickname: currentUser.nickName || currentUser.name || '匿名用户',
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        recordDate: new Date(formData.recordDate).toISOString(),
        paymentMethod: formData.paymentMethod,
        status: 'confirmed'
      };
      if (editingRecord) {
        await props.$w.cloud.callDataSource({
          dataSourceName: 'family_finance_records',
          methodName: 'wedaUpdateV2',
          params: {
            filter: {
              _id: {
                $eq: editingRecord.id
              }
            },
            data: recordData
          }
        });
        toast({
          title: '修改成功'
        });
      } else {
        await props.$w.cloud.callDataSource({
          dataSourceName: 'family_finance_records',
          methodName: 'wedaCreateV2',
          params: {
            data: recordData
          }
        });
        toast({
          title: '添加成功'
        });
      }
      setShowAddForm(false);
      setEditingRecord(null);
      setFormData({
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        recordDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'wechat'
      });
      await fetchRecords();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '操作失败',
        description: error.message
      });
    }
  };

  // 删除记录
  const handleDelete = async recordId => {
    try {
      await props.$w.cloud.callDataSource({
        dataSourceName: 'family_finance_records',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            _id: {
              $eq: recordId
            }
          }
        }
      });
      toast({
        title: '删除成功'
      });
      await fetchRecords();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '删除失败',
        description: error.message
      });
    }
  };

  // 编辑记录
  const handleEdit = record => {
    setEditingRecord(record);
    setFormData({
      type: record.type,
      category: record.category,
      amount: record.amount.toString(),
      description: record.description || '',
      recordDate: new Date(record.recordDate).toISOString().split('T')[0],
      paymentMethod: record.paymentMethod || 'wechat'
    });
    setShowAddForm(true);
  };

  // 筛选记录
  const filteredRecords = records.filter(record => {
    const matchesSearch = !searchQuery || record.description?.toLowerCase().includes(searchQuery.toLowerCase()) || record.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || record.category === categoryFilter;
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const recordDate = new Date(record.recordDate);
      const now = new Date();
      if (dateFilter === 'today') {
        matchesDate = recordDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = recordDate >= weekAgo;
      } else if (dateFilter === 'month') {
        matchesDate = recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
      }
    }
    return matchesSearch && matchesType && matchesCategory && matchesDate;
  });

  // 按月份分组
  const groupedRecords = filteredRecords.reduce((groups, record) => {
    const month = new Date(record.recordDate).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long'
    });
    if (!groups[month]) groups[month] = [];
    groups[month].push(record);
    return groups;
  }, {});

  // 切换月份展开
  const toggleMonth = month => {
    setExpandedMonths(prev => ({
      ...prev,
      [month]: !prev[month]
    }));
  };

  // 计算统计
  const totalIncome = filteredRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = filteredRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);

  // 获取分类图标和颜色
  const getCategoryInfo = categoryName => {
    const cat = categories.find(c => c.name === categoryName);
    return cat || {
      icon: '📝',
      color: '#607D8B'
    };
  };
  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');
  return <div className="min-h-screen bg-gradient-to-br from-[#FFF8E7] via-[#FFFAF0] to-[#FFF5E6] pb-20">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-[#FF8B4E] to-[#FF6B35] p-6 pt-12 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" className="text-white p-0" onClick={() => navigateBack()}>
            <ChevronDown className="h-6 w-6 rotate-90" />
          </Button>
          <h1 className="text-xl font-bold text-white" style={{
          fontFamily: 'Quicksand'
        }}>家庭收支</h1>
          <Button className="bg-white text-[#FF6B35] h-9 px-4 rounded-xl font-bold" onClick={() => navigateTo({
          pageId: 'family-budget',
          params: {}
        })}>
            预算
          </Button>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
            <div className="flex items-center gap-2 text-white/80 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">收入</span>
            </div>
            <p className="text-2xl font-bold text-white">¥{totalIncome.toLocaleString()}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
            <div className="flex items-center gap-2 text-white/80 mb-1">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm">支出</span>
            </div>
            <p className="text-2xl font-bold text-white">¥{totalExpense.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B7355]" />
            <Input placeholder="搜索记录..." className="pl-9 bg-white border-none rounded-xl h-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Button className="bg-white text-[#FF6B35] h-10 px-3 rounded-xl" onClick={() => setShowAddForm(true)}>
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button variant={typeFilter === 'all' ? 'default' : 'outline'} className={`h-8 px-3 rounded-full text-sm whitespace-nowrap ${typeFilter === 'all' ? 'bg-[#FF6B35]' : 'bg-white text-[#8B7355]'}`} onClick={() => setTypeFilter('all')}>
            全部
          </Button>
          <Button variant={typeFilter === 'income' ? 'default' : 'outline'} className={`h-8 px-3 rounded-full text-sm whitespace-nowrap ${typeFilter === 'income' ? 'bg-[#9CCF4E]' : 'bg-white text-[#8B7355]'}`} onClick={() => setTypeFilter('income')}>
            收入
          </Button>
          <Button variant={typeFilter === 'expense' ? 'default' : 'outline'} className={`h-8 px-3 rounded-full text-sm whitespace-nowrap ${typeFilter === 'expense' ? 'bg-[#FF6B35]' : 'bg-white text-[#8B7355]'}`} onClick={() => setTypeFilter('expense')}>
            支出
          </Button>
          <select className="h-8 px-3 rounded-full text-sm bg-white border-none text-[#8B7355] cursor-pointer" value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
            <option value="all">全部时间</option>
            <option value="today">今天</option>
            <option value="week">本周</option>
            <option value="month">本月</option>
          </select>
        </div>
      </div>

      {/* 记录列表 */}
      <div className="px-4 space-y-4">
        {loading ? <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35] mx-auto"></div>
            <p className="text-[#8B7355] mt-2">加载中...</p>
          </div> : Object.keys(groupedRecords).length === 0 ? <div className="text-center py-12">
            <div className="text-6xl mb-4">💰</div>
            <p className="text-[#8B7355]">暂无收支记录</p>
            <Button className="mt-4 bg-[#FF6B35] text-white" onClick={() => setShowAddForm(true)}>
              添加第一笔记录
            </Button>
          </div> : Object.entries(groupedRecords).map(([month, monthRecords]) => <div key={month} className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-[#FCEEB8] cursor-pointer" onClick={() => toggleMonth(month)}>
                <span className="font-semibold text-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>{month}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[#8B7355]">
                    {monthRecords.length} 笔
                  </span>
                  {expandedMonths[month] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
              
              {expandedMonths[month] !== false && <div className="divide-y divide-[#FCEEB8]">
                  {monthRecords.map(record => {
            const catInfo = getCategoryInfo(record.category);
            return <div key={record.id} className="flex items-center gap-3 p-4 hover:bg-[#FFF8E7]">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{
                backgroundColor: `${catInfo.color}20`
              }}>
                          {catInfo.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#FF6B35]">{record.category}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${record.type === 'income' ? 'bg-[#9CCF4E]/20 text-[#9CCF4E]' : 'bg-[#FF6B35]/20 text-[#FF6B35]'}`}>
                              {record.type === 'income' ? '收入' : '支出'}
                            </span>
                          </div>
                          <p className="text-xs text-[#8B7355] mt-0.5">
                            {record.nickname} · {new Date(record.recordDate).toLocaleDateString()}
                            {record.description && ` · ${record.description}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${record.type === 'income' ? 'text-[#9CCF4E]' : 'text-[#FF6B35]'}`}>
                            {record.type === 'income' ? '+' : '-'}¥{record.amount.toLocaleString()}
                          </p>
                          <div className="flex gap-2 mt-1 justify-end">
                            <button onClick={() => handleEdit(record)} className="text-[#8B7355] hover:text-[#FF6B35]">
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleDelete(record.id)} className="text-[#8B7355] hover:text-[#E85A42]">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>;
          })}
                </div>}
            </div>)}
      </div>

      {/* 添加/编辑表单弹窗 */}
      {showAddForm && <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
                {editingRecord ? '编辑记录' : '添加记录'}
              </h3>
              <button onClick={() => {
            setShowAddForm(false);
            setEditingRecord(null);
          }}>
                <X className="h-5 w-5 text-[#8B7355]" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* 类型选择 */}
              <div className="flex gap-2">
                <button type="button" className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.type === 'income' ? 'bg-[#9CCF4E] text-white' : 'bg-[#FCEEB8] text-[#8B7355]'}`} onClick={() => setFormData({
              ...formData,
              type: 'income',
              category: ''
            })}>
                  <TrendingUp className="h-5 w-5 inline mr-1" />收入
                </button>
                <button type="button" className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.type === 'expense' ? 'bg-[#FF6B35] text-white' : 'bg-[#FCEEB8] text-[#8B7355]'}`} onClick={() => setFormData({
              ...formData,
              type: 'expense',
              category: ''
            })}>
                  <TrendingDown className="h-5 w-5 inline mr-1" />支出
                </button>
              </div>

              {/* 分类选择 */}
              <div>
                <label className="block text-sm text-[#8B7355] mb-2">分类</label>
                <div className="grid grid-cols-4 gap-2">
                  {(formData.type === 'income' ? incomeCategories : expenseCategories).map(cat => <button key={cat.id} type="button" className={`p-2 rounded-xl text-center transition-all ${formData.category === cat.name ? 'ring-2 ring-[#FF6B35]' : ''}`} style={{
                backgroundColor: `${cat.color}20`
              }} onClick={() => setFormData({
                ...formData,
                category: cat.name
              })}>
                      <div className="text-xl">{cat.icon}</div>
                      <div className="text-xs text-[#8B7355] mt-1">{cat.name}</div>
                    </button>)}
                </div>
              </div>

              {/* 金额 */}
              <div>
                <label className="block text-sm text-[#8B7355] mb-2">金额</label>
                <Input type="number" placeholder="请输入金额" className="h-12 text-lg" value={formData.amount} onChange={e => setFormData({
              ...formData,
              amount: e.target.value
            })} />
              </div>

              {/* 日期 */}
              <div>
                <label className="block text-sm text-[#8B7355] mb-2">日期</label>
                <Input type="date" className="h-12" value={formData.recordDate} onChange={e => setFormData({
              ...formData,
              recordDate: e.target.value
            })} />
              </div>

              {/* 支付方式 */}
              <div>
                <label className="block text-sm text-[#8B7355] mb-2">支付方式</label>
                <select className="w-full h-12 px-3 rounded-xl border bg-white" value={formData.paymentMethod} onChange={e => setFormData({
              ...formData,
              paymentMethod: e.target.value
            })}>
                  <option value="wechat">微信支付</option>
                  <option value="alipay">支付宝</option>
                  <option value="bank">银行卡</option>
                  <option value="cash">现金</option>
                  <option value="other">其他</option>
                </select>
              </div>

              {/* 描述 */}
              <div>
                <label className="block text-sm text-[#8B7355] mb-2">备注</label>
                <Input placeholder="添加备注..." value={formData.description} onChange={e => setFormData({
              ...formData,
              description: e.target.value
            })} />
              </div>

              {/* 提交按钮 */}
              <Button type="submit" className="w-full h-12 bg-[#FF6B35] text-white font-bold rounded-xl">
                <Check className="h-5 w-5 mr-2" />
                {editingRecord ? '保存修改' : '添加记录'}
              </Button>
            </form>
          </div>
        </div>}
    </div>;
};
export default FamilyFinancePage;