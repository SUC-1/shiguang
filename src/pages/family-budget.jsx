// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { ChevronDown, ChevronUp, Plus, X, Check, TrendingDown, PieChart, Calendar } from 'lucide-react';

// 预算设置页面
const FamilyBudgetPage = props => {
  const {
    toast
  } = useToast();
  const {
    navigateTo,
    navigateBack
  } = props.$w.utils;
  const currentUser = props.$w.auth.currentUser;
  const [budget, setBudget] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [familyGroupId, setFamilyGroupId] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [categoryAmounts, setCategoryAmounts] = useState({});
  const [totalBudget, setTotalBudget] = useState('');
  const [isEditing, setIsEditing] = useState(false);

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

  // 获取当前预算
  const fetchBudget = async groupId => {
    try {
      const targetGroupId = groupId || familyGroupId;
      if (!targetGroupId) return;
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'family_budgets',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                familyGroupId: {
                  $eq: targetGroupId
                }
              }, {
                year: {
                  $eq: year
                }
              }, {
                month: {
                  $eq: month
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
        const budgetData = result.records[0];
        setBudget(budgetData);
        setTotalBudget(budgetData.totalBudget.toString());
        if (budgetData.categoryBudgets) {
          try {
            const parsed = JSON.parse(budgetData.categoryBudgets);
            setCategoryAmounts(parsed);
          } catch (e) {
            console.error('解析分类预算失败:', e);
          }
        }
      } else {
        setBudget(null);
        setTotalBudget('');
        setCategoryAmounts({});
      }
    } catch (error) {
      console.error('获取预算失败:', error);
    }
  };

  // 获取支出分类
  const fetchCategories = async () => {
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'finance_categories',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              type: {
                $eq: 'expense'
              }
            }
          },
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
          icon: c.icon,
          color: c.color
        })));
      }
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  // 获取本月实际支出
  const fetchMonthExpenses = async groupId => {
    try {
      const targetGroupId = groupId || familyGroupId;
      if (!targetGroupId) return {};
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'family_finance_records',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                familyGroupId: {
                  $eq: targetGroupId
                }
              }, {
                type: {
                  $eq: 'expense'
                }
              }, {
                recordDate: {
                  $gte: startDate
                }
              }, {
                recordDate: {
                  $lte: endDate
                }
              }]
            }
          },
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 500,
          pageNumber: 1
        }
      });
      if (result && result.records) {
        const expenses = {};
        result.records.forEach(r => {
          if (!expenses[r.category]) expenses[r.category] = 0;
          expenses[r.category] += r.amount;
        });
        return expenses;
      }
      return {};
    } catch (error) {
      console.error('获取支出失败:', error);
      return {};
    }
  };

  // 页面初始化
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const groupId = await fetchFamilyGroup();
      await Promise.all([fetchBudget(groupId), fetchCategories()]);
      setLoading(false);
    };
    loadData();
  }, [currentMonth]);

  // 保存预算
  const handleSave = async () => {
    if (!totalBudget || parseFloat(totalBudget) <= 0) {
      toast({
        variant: 'destructive',
        title: '请设置总预算'
      });
      return;
    }
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const budgetData = {
        familyGroupId: familyGroupId,
        year,
        month,
        totalBudget: parseFloat(totalBudget),
        categoryBudgets: JSON.stringify(categoryAmounts),
        status: 'active',
        createdBy: currentUser.userId
      };
      if (budget) {
        await props.$w.cloud.callDataSource({
          dataSourceName: 'family_budgets',
          methodName: 'wedaUpdateV2',
          params: {
            filter: {
              _id: {
                $eq: budget._id
              }
            },
            data: budgetData
          }
        });
        toast({
          title: '预算更新成功'
        });
      } else {
        await props.$w.cloud.callDataSource({
          dataSourceName: 'family_budgets',
          methodName: 'wedaCreateV2',
          params: {
            data: budgetData
          }
        });
        toast({
          title: '预算设置成功'
        });
      }
      setIsEditing(false);
      await fetchBudget();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '保存失败',
        description: error.message
      });
    }
  };

  // 更新分类预算
  const updateCategoryBudget = (category, amount) => {
    setCategoryAmounts(prev => ({
      ...prev,
      [category]: amount ? parseFloat(amount) : 0
    }));
  };

  // 切换月份
  const changeMonth = delta => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };
  const monthStr = currentMonth.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long'
  });
  const totalBudgetNum = parseFloat(totalBudget) || 0;
  const totalCategoryBudget = Object.values(categoryAmounts).reduce((sum, v) => sum + (v || 0), 0);
  return <div className="min-h-screen bg-gradient-to-br from-[#FFF8E7] via-[#FFFAF0] to-[#FFF5E6] pb-20">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-[#9CCF4E] to-[#8BC34A] p-6 pt-12 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" className="text-white p-0" onClick={() => navigateBack()}>
            <ChevronDown className="h-6 w-6 rotate-90" />
          </Button>
          <h1 className="text-xl font-bold text-white" style={{
          fontFamily: 'Quicksand'
        }}>预算设置</h1>
          <Button className="bg-white text-[#9CCF4E] h-9 px-4 rounded-xl font-bold" onClick={() => navigateTo({
          pageId: 'family-finance-report',
          params: {}
        })}>
            报表
          </Button>
        </div>
        
        {/* 月份选择 */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button onClick={() => changeMonth(-1)} className="text-white/80 hover:text-white">
            <ChevronDown className="h-5 w-5 rotate-90" />
          </button>
          <div className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            <span className="font-bold">{monthStr}</span>
          </div>
          <button onClick={() => changeMonth(1)} className="text-white/80 hover:text-white">
            <ChevronDown className="h-5 w-5 -rotate-90" />
          </button>
        </div>
      </div>

      {loading ? <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9CCF4E] mx-auto"></div>
          <p className="text-[#8B7355] mt-2">加载中...</p>
        </div> : <div className="p-4 space-y-4">
          {/* 总预算卡片 */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>本月预算</h3>
              {!isEditing && <Button variant="outline" className="h-8 text-[#9CCF4E] border-[#9CCF4E]" onClick={() => setIsEditing(true)}>
                  编辑
                </Button>}
            </div>
            
            {isEditing ? <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#8B7355] mb-2">总预算金额</label>
                  <Input type="number" placeholder="请输入预算金额" className="h-12 text-lg" value={totalBudget} onChange={e => setTotalBudget(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 h-10 bg-[#9CCF4E]" onClick={handleSave}>
                    <Check className="h-4 w-4 mr-1" />保存
                  </Button>
                  <Button variant="outline" className="h-10" onClick={() => setIsEditing(false)}>
                    取消
                  </Button>
                </div>
              </div> : <div className="text-center">
                <p className="text-4xl font-bold text-[#FF6B35]">¥{totalBudgetNum.toLocaleString()}</p>
                <p className="text-sm text-[#8B7355] mt-2">
                  {totalCategoryBudget > 0 ? `已分配 ¥${totalCategoryBudget.toLocaleString()}` : '点击编辑设置预算'}
                </p>
              </div>}
          </div>

          {/* 分类预算 */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
                <PieChart className="h-5 w-5 inline mr-2" />分类预算
              </h3>
              {isEditing && <span className="text-sm text-[#8B7355]">点击金额修改</span>}
            </div>
            
            <div className="space-y-3">
              {categories.map(cat => {
            const budgetAmount = categoryAmounts[cat.name] || 0;
            const percentage = totalBudgetNum > 0 ? (budgetAmount / totalBudgetNum * 100).toFixed(0) : 0;
            return <div key={cat.id} className="flex items-center gap-3 p-3 bg-[#FFF8E7] rounded-xl">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{
                backgroundColor: `${cat.color}20`
              }}>
                      {cat.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#FF6B35]">{cat.name}</span>
                        {isEditing ? <Input type="number" className="w-24 h-8 text-right" placeholder="0" value={budgetAmount || ''} onChange={e => updateCategoryBudget(cat.name, e.target.value)} /> : <span className="font-bold text-[#FF6B35]">¥{budgetAmount.toLocaleString()}</span>}
                      </div>
                      {!isEditing && totalBudgetNum > 0 && <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{
                    width: `${percentage}%`,
                    backgroundColor: cat.color
                  }} />
                        </div>}
                    </div>
                  </div>;
          })}
            </div>
            
            {isEditing && <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8B7355]">分类预算合计</span>
                  <span className={`font-bold ${totalCategoryBudget > totalBudgetNum ? 'text-[#E85A42]' : 'text-[#9CCF4E]'}`}>
                    ¥{totalCategoryBudget.toLocaleString()} / ¥{totalBudgetNum.toLocaleString()}
                  </span>
                </div>
                {totalCategoryBudget > totalBudgetNum && <p className="text-xs text-[#E85A42] mt-1">分类预算总和不能超过总预算</p>}
              </div>}
          </div>

          {/* 快捷金额按钮 */}
          {isEditing && <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-[#FF6B35] mb-4" style={{
          fontFamily: 'Quicksand'
        }}>快速设置总预算</h3>
              <div className="grid grid-cols-3 gap-3">
                {[5000, 8000, 10000, 15000, 20000, 30000].map(amount => <button key={amount} className={`py-3 rounded-xl font-bold transition-all ${totalBudgetNum === amount ? 'bg-[#9CCF4E] text-white' : 'bg-[#FCEEB8] text-[#FF6B35]'}`} onClick={() => setTotalBudget(amount.toString())}>
                    ¥{amount.toLocaleString()}
                  </button>)}
              </div>
            </div>}
        </div>}
    </div>;
};
export default FamilyBudgetPage;