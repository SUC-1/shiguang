// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, useToast } from '@/components/ui';
// @ts-ignore;
import { PiggyBank, Plus, Edit2, Trash2, TrendingUp, TrendingDown, Target, Users, X, DollarSign, Calendar } from 'lucide-react';

// 成员映射
const memberMap = {
  'u001': '爸爸',
  'u002': '妈妈',
  'u003': '爷爷',
  'u004': '奶奶',
  'u005': '宝宝'
};
const members = ['爸爸', '妈妈', '爷爷', '奶奶', '宝宝'];
const categories = ['餐饮', '教育', '交通', '房租', '娱乐', '购物', '医疗', '通讯', '其他'];
export default function FamilyFinanceBudget(props) {
  const {
    toast
  } = useToast();
  const {
    navigateTo
  } = props.$w.utils;
  const currentUser = props.$w.auth.currentUser;
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spentMap, setSpentMap] = useState({});
  const [familyGroupId, setFamilyGroupId] = useState(null);
  const [familyMembers, setFamilyMembers] = useState({});

  // 获取当前用户的家庭组
  const fetchFamilyGroup = async () => {
    try {
      const db = props.$w.database;
      const userId = currentUser?.userId || currentUser?._id;
      if (!userId) return null;
      const memberResult = await db.collection('family_memberships').where({
        user_id: userId,
        status: 'active'
      }).get();
      if (memberResult.data && memberResult.data.length > 0) {
        const membership = memberResult.data[0];
        setFamilyGroupId(membership.family_id);

        // 获取家庭成员列表
        const membersResult = await db.collection('family_memberships').where({
          family_id: membership.family_id,
          status: 'active'
        }).get();
        const memberMap = {};
        membersResult.data?.forEach(m => {
          memberMap[m.user_id] = m.nick_name || m.name || '家庭成员';
        });
        setFamilyMembers(memberMap);
        return membership.family_id;
      }
      return null;
    } catch (error) {
      console.error('获取家庭组失败:', error);
      return null;
    }
  };

  // 加载数据
  useEffect(() => {
    const initData = async () => {
      const groupId = await fetchFamilyGroup();
      if (groupId) {
        loadBudgets(groupId);
      } else {
        setLoading(false);
      }
    };
    initData();
  }, []);
  const loadBudgets = async groupId => {
    if (!groupId) return;
    try {
      setLoading(true);
      const db = props.$w.database;

      // 加载预算数据
      const budgetResult = await db.collection('family_finance_budgets').where({
        family_id: groupId
      }).get();

      // 加载支出记录计算已使用金额
      const recordsResult = await db.collection('family_finance_records').where({
        family_id: groupId,
        type: 'expense'
      }).get();

      // 按分类统计支出
      const spent = {};
      recordsResult.data?.forEach(record => {
        if (!spent[record.category]) {
          spent[record.category] = 0;
        }
        spent[record.category] += record.amount;
      });
      setSpentMap(spent);

      // 转换数据格式
      const formattedBudgets = budgetResult.data.map(budget => ({
        id: budget._id,
        category: budget.category,
        member: familyMembers[budget.member_id] || familyMembers[budget.user_id] || '未知',
        member_id: budget.member_id || budget.user_id,
        amount: budget.amount,
        spent: spent[budget.category] || 0,
        period: budget.period,
        color: budget.color,
        start_date: budget.start_date,
        end_date: budget.end_date
      }));
      setBudgets(formattedBudgets);
    } catch (error) {
      console.error('加载预算失败:', error);
      toast({
        variant: 'destructive',
        title: '加载失败',
        description: '无法获取预算数据'
      });
    } finally {
      setLoading(false);
    }
  };
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    member: '',
    amount: '',
    period: 'monthly'
  });

  // 计算总预算和已使用
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const usageRate = totalBudget > 0 ? (totalSpent / totalBudget * 100).toFixed(1) : 0;

  // 添加/编辑预算
  const handleSubmit = async () => {
    if (!formData.category || !formData.member || !formData.amount) {
      toast({
        variant: 'destructive',
        title: '提交失败',
        description: '请填写完整信息'
      });
      return;
    }
    setLoading(true);
    try {
      const db = props.$w.database;
      // 获取用户ID映射
      const userIdMap = {};
      Object.entries(familyMembers).forEach(([uid, name]) => {
        userIdMap[name] = uid;
      });
      const colors = ['#FF8B4E', '#9CCF4E', '#E94560', '#6366F1', '#F59E0B', '#EC4899'];
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      const budgetData = {
        family_id: familyGroupId,
        category: formData.category,
        user_id: userIdMap[formData.member] || currentUser?.userId || currentUser?._id,
        amount: parseFloat(formData.amount),
        period: formData.period,
        start_date: startDate,
        end_date: endDate,
        color: editingBudget?.color || colors[Math.floor(Math.random() * colors.length)],
        created_at: Date.now()
      };
      if (editingBudget) {
        // 更新预算
        await db.collection('family_finance_budgets').doc(editingBudget.id).update({
          ...budgetData,
          updated_at: Date.now()
        });
        toast({
          title: '预算已更新'
        });
      } else {
        // 添加预算
        await db.collection('family_finance_budgets').add(budgetData);
        toast({
          title: '预算已添加'
        });
      }

      // 重新加载数据
      await loadBudgets();
      setIsAddDialogOpen(false);
      setEditingBudget(null);
      setFormData({
        category: '',
        member: '',
        amount: '',
        period: 'monthly'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '操作失败',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // 删除预算
  const handleDelete = async id => {
    try {
      const db = props.$w.database;
      await db.collection('family_finance_budgets').doc(id).delete();
      setBudgets(budgets.filter(b => b.id !== id));
      toast({
        title: '预算已删除'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '删除失败',
        description: error.message
      });
    }
  };

  // 打开编辑对话框
  const openEditDialog = budget => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      member: budget.member,
      amount: budget.amount.toString(),
      period: budget.period
    });
    setIsAddDialogOpen(true);
  };

  // 格式化金额
  const formatAmount = amount => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      maximumFractionDigits: 0
    }).format(amount);
  };
  return <div className="min-h-screen bg-[#0F0F1A] text-white pb-20" style={{
    fontFamily: 'Nunito, sans-serif'
  }}>
      {/* 头部统计 */}
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] p-6 rounded-b-3xl shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{
          fontFamily: 'Playfair Display, serif'
        }}>
            预算设置
          </h1>
          <Button className="bg-[#FF8B4E] hover:bg-[#FF6B35] rounded-xl h-10" onClick={() => {
          setEditingBudget(null);
          setFormData({
            category: '',
            member: '',
            amount: '',
            period: 'monthly'
          });
          setIsAddDialogOpen(true);
        }}>
            <Plus className="h-5 w-5 mr-1" />
            添加预算
          </Button>
        </div>

        {/* 总预算概览 */}
        <div className="bg-[#0F0F1A]/50 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400">本月预算使用</span>
            <span className="text-sm text-gray-500">{usageRate}%</span>
          </div>
          
          {/* 进度条 */}
          <div className="h-3 bg-[#2A2A4E] rounded-full overflow-hidden mb-4">
            <div className={`h-full rounded-full transition-all duration-500 ${parseFloat(usageRate) > 90 ? 'bg-[#E94560]' : parseFloat(usageRate) > 70 ? 'bg-[#F59E0B]' : 'bg-[#9CCF4E]'}`} style={{
            width: `${Math.min(parseFloat(usageRate), 100)}%`
          }} />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400 mb-1">预算总额</p>
              <p className="text-lg font-bold text-white">{formatAmount(totalBudget)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">已使用</p>
              <p className="text-lg font-bold text-[#E85A42]">{formatAmount(totalSpent)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">剩余</p>
              <p className={`text-lg font-bold ${totalRemaining >= 0 ? 'text-[#9CCF4E]' : 'text-[#E94560]'}`}>
                {formatAmount(totalRemaining)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 预算列表 */}
      <div className="p-4 space-y-3">
        <h2 className="text-lg font-semibold mb-3" style={{
        fontFamily: 'Playfair Display, serif'
      }}>
          预算明细
        </h2>
        
        {budgets.length > 0 ? budgets.map(budget => {
        const percent = budget.amount > 0 ? (budget.spent / budget.amount * 100).toFixed(1) : 0;
        const isOverBudget = budget.spent > budget.amount;
        return <div key={budget.id} className="bg-[#1A1A2E] rounded-2xl p-4 hover:bg-[#16213E] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                backgroundColor: `${budget.color}20`
              }}>
                      <Target className="h-5 w-5" style={{
                  color: budget.color
                }} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{budget.category}</p>
                      <p className="text-xs text-gray-400">{budget.member} · {budget.period === 'monthly' ? '月度' : '年度'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-[#FF8B4E]" onClick={() => openEditDialog(budget)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-[#E94560]" onClick={() => handleDelete(budget.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 预算进度 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {formatAmount(budget.spent)} / {formatAmount(budget.amount)}
                    </span>
                    <span className={isOverBudget ? 'text-[#E94560]' : 'text-[#9CCF4E]'}>
                      {percent}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#2A2A4E] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-[#E94560]' : 'bg-[#9CCF4E]'}`} style={{
                width: `${Math.min(parseFloat(percent), 100)}%`
              }} />
                  </div>
                </div>

                {/* 剩余金额 */}
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-400">剩余</span>
                  <span className={budget.amount - budget.spent >= 0 ? 'text-[#9CCF4E]' : 'text-[#E94560]'}>
                    {formatAmount(budget.amount - budget.spent)}
                  </span>
                </div>
              </div>;
      }) : <div className="text-center py-12">
            <PiggyBank className="h-16 w-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">暂无预算</p>
            <p className="text-sm text-gray-500 mt-1">点击上方添加按钮创建预算</p>
          </div>}
      </div>

      {/* 添加/编辑对话框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-[#1A1A2E] border-[#2A2A4E] text-white rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle style={{
            fontFamily: 'Playfair Display, serif'
          }}>
              {editingBudget ? '编辑预算' : '添加预算'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              设置预算类别、成员和金额
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 类别选择 */}
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => <Button key={cat} variant={formData.category === cat ? 'default' : 'outline'} size="sm" onClick={() => setFormData({
              ...formData,
              category: cat
            })} className={formData.category === cat ? 'bg-[#FF8B4E] text-white' : 'border-[#2A2A4E] text-gray-400 hover:bg-[#2A2A4E]'}>
                  {cat}
                </Button>)}
            </div>

            {/* 成员选择 */}
            <div className="grid grid-cols-3 gap-2">
              {Object.values(familyMembers).length > 0 ? Object.values(familyMembers).map(member => <Button key={member} variant={formData.member === member ? 'default' : 'outline'} size="sm" onClick={() => setFormData({
              ...formData,
              member: member
            })} className={formData.member === member ? 'bg-[#9CCF4E] text-white' : 'border-[#2A2A4E] text-gray-400 hover:bg-[#2A2A4E]'}>
                  {member}
                </Button>) : <Button variant="outline" size="sm" onClick={() => setFormData({
              ...formData,
              member: currentUser?.nickName || currentUser?.name || '我'
            })} className="border-[#2A2A4E] text-gray-400 hover:bg-[#2A2A4E]">
                  {currentUser?.nickName || currentUser?.name || '我'}
                </Button>}
            </div>

            {/* 金额 */}
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input type="number" placeholder="预算金额" value={formData.amount} onChange={e => setFormData({
              ...formData,
              amount: e.target.value
            })} className="bg-[#0F0F1A] border-[#2A2A4E] text-white pl-10 rounded-xl h-12 text-lg" />
            </div>

            {/* 周期 */}
            <div className="flex gap-2">
              <Button className={`flex-1 h-12 rounded-xl ${formData.period === 'monthly' ? 'bg-[#FF8B4E] text-white' : 'bg-[#2A2A4E] text-gray-400'}`} onClick={() => setFormData({
              ...formData,
              period: 'monthly'
            })}>
                <Calendar className="h-5 w-5 mr-2" />
                月度
              </Button>
              <Button className={`flex-1 h-12 rounded-xl ${formData.period === 'yearly' ? 'bg-[#FF8B4E] text-white' : 'bg-[#2A2A4E] text-gray-400'}`} onClick={() => setFormData({
              ...formData,
              period: 'yearly'
            })}>
                <Calendar className="h-5 w-5 mr-2" />
                年度
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-[#2A2A4E] text-white hover:bg-[#2A2A4E] rounded-xl">
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="bg-[#FF8B4E] hover:bg-[#FF6B35] text-white rounded-xl">
              {loading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 底部导航 */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A2E] border-t border-[#2A2A4E] p-2 flex justify-around items-center pb-6">
        <Button variant="ghost" className="flex flex-col items-center gap-1 text-gray-400 h-14" onClick={() => navigateTo({
        pageId: 'family-finance-records',
        params: {}
      })}>
          <TrendingDown className="h-6 w-6" />
          <span className="text-xs">记录</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center gap-1 text-gray-400 h-14" onClick={() => navigateTo({
        pageId: 'family-finance-budget',
        params: {}
      })}>
          <PiggyBank className="h-6 w-6 text-[#FF8B4E]" />
          <span className="text-xs">预算</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center gap-1 text-gray-400 h-14" onClick={() => navigateTo({
        pageId: 'family-finance-report',
        params: {}
      })}>
          <TrendingUp className="h-6 w-6" />
          <span className="text-xs">报表</span>
        </Button>
      </div>
    </div>;
}