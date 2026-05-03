// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, useToast } from '@/components/ui';
// @ts-ignore;
import { PiggyBank, Plus, Edit2, Trash2, TrendingUp, TrendingDown, Target, Users, X, DollarSign, Calendar } from 'lucide-react';

// 模拟预算数据
const mockBudgets = [{
  id: '1',
  category: '餐饮',
  member: '全家',
  amount: 3000,
  spent: 1850,
  period: 'monthly',
  color: '#FF8B4E'
}, {
  id: '2',
  category: '教育',
  member: '宝宝',
  amount: 2000,
  spent: 800,
  period: 'monthly',
  color: '#9CCF4E'
}, {
  id: '3',
  category: '交通',
  member: '爸爸',
  amount: 1000,
  spent: 650,
  period: 'monthly',
  color: '#E94560'
}, {
  id: '4',
  category: '房租',
  member: '全家',
  amount: 5000,
  spent: 5000,
  period: 'monthly',
  color: '#6366F1'
}, {
  id: '5',
  category: '娱乐',
  member: '全家',
  amount: 800,
  spent: 320,
  period: 'monthly',
  color: '#F59E0B'
}, {
  id: '6',
  category: '购物',
  member: '妈妈',
  amount: 1500,
  spent: 980,
  period: 'monthly',
  color: '#EC4899'
}];
const members = ['全家', '爸爸', '妈妈', '宝宝', '爷爷', '奶奶'];
const categories = ['餐饮', '教育', '交通', '房租', '娱乐', '购物', '医疗', '通讯', '其他'];
export default function FamilyFinanceBudget(props) {
  const {
    toast
  } = useToast();
  const {
    navigateTo
  } = props.$w.utils;
  const [budgets, setBudgets] = useState(mockBudgets);
  const [loading, setLoading] = useState(false);
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
      await new Promise(resolve => setTimeout(resolve, 500));
      const colors = ['#FF8B4E', '#9CCF4E', '#E94560', '#6366F1', '#F59E0B', '#EC4899'];
      const newBudget = {
        id: editingBudget?.id || Date.now().toString(),
        ...formData,
        amount: parseFloat(formData.amount),
        spent: editingBudget?.spent || 0,
        color: editingBudget?.color || colors[Math.floor(Math.random() * colors.length)]
      };
      if (editingBudget) {
        setBudgets(budgets.map(b => b.id === editingBudget.id ? newBudget : b));
        toast({
          title: '预算已更新'
        });
      } else {
        setBudgets([...budgets, newBudget]);
        toast({
          title: '预算已添加'
        });
      }
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
  const handleDelete = id => {
    setBudgets(budgets.filter(b => b.id !== id));
    toast({
      title: '预算已删除'
    });
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
              {members.map(member => <Button key={member} variant={formData.member === member ? 'default' : 'outline'} size="sm" onClick={() => setFormData({
              ...formData,
              member: member
            })} className={formData.member === member ? 'bg-[#9CCF4E] text-white' : 'border-[#2A2A4E] text-gray-400 hover:bg-[#2A2A4E]'}>
                  {member}
                </Button>)}
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