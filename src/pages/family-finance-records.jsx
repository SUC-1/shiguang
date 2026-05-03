// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, useToast } from '@/components/ui';
// @ts-ignore;
import { Calendar, TrendingUp, TrendingDown, Plus, Filter, Search, ArrowUpRight, ArrowDownRight, Wallet, PiggyBank, X, DollarSign } from 'lucide-react';

// 模拟数据
const mockRecords = [{
  id: '1',
  type: 'income',
  amount: 5000,
  category: '工资',
  date: '2026-05-01',
  notes: '月工资',
  member: '爸爸',
  createdAt: '2026-05-01T10:00:00'
}, {
  id: '2',
  type: 'expense',
  amount: 1200,
  category: '餐饮',
  date: '2026-05-02',
  notes: '家庭聚餐',
  member: '妈妈',
  createdAt: '2026-05-02T18:30:00'
}, {
  id: '3',
  type: 'expense',
  amount: 800,
  category: '教育',
  date: '2026-05-03',
  notes: '兴趣班费用',
  member: '爸爸',
  createdAt: '2026-05-03T15:20:00'
}, {
  id: '4',
  type: 'income',
  amount: 300,
  category: '理财',
  date: '2026-05-03',
  notes: '理财收益',
  member: '妈妈',
  createdAt: '2026-05-03T09:00:00'
}, {
  id: '5',
  type: 'expense',
  amount: 450,
  category: '交通',
  date: '2026-05-01',
  notes: '油费',
  member: '爸爸',
  createdAt: '2026-05-01T14:00:00'
}, {
  id: '6',
  type: 'expense',
  amount: 2000,
  category: '房租',
  date: '2026-05-01',
  notes: '月租',
  member: '妈妈',
  createdAt: '2026-05-01T08:00:00'
}, {
  id: '7',
  type: 'income',
  amount: 500,
  category: '红包',
  date: '2026-04-30',
  notes: '生日红包',
  member: '爷爷',
  createdAt: '2026-04-30T20:00:00'
}, {
  id: '8',
  type: 'expense',
  amount: 350,
  category: '医疗',
  date: '2026-04-28',
  notes: '感冒药',
  member: '宝宝',
  createdAt: '2026-04-28T11:00:00'
}];
const categories = {
  income: ['工资', '奖金', '理财', '红包', '兼职', '其他收入'],
  expense: ['餐饮', '交通', '教育', '房租', '医疗', '购物', '娱乐', '通讯', '其他支出']
};
const members = ['爸爸', '妈妈', '爷爷', '奶奶', '宝宝'];
export default function FamilyFinanceRecords(props) {
  const {
    toast
  } = useToast();
  const {
    navigateTo,
    navigateBack,
    page
  } = props.$w.utils;
  const currentUser = props.$w.auth.currentUser;
  const [records, setRecords] = useState(mockRecords);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    member: ''
  });

  // 计算统计数据
  const totalIncome = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const balance = totalIncome - totalExpense;

  // 筛选记录
  const filteredRecords = records.filter(record => {
    const matchSearch = record.notes.toLowerCase().includes(searchQuery.toLowerCase()) || record.category.includes(searchQuery) || record.member.includes(searchQuery);
    const matchType = typeFilter === 'all' || record.type === typeFilter;
    const matchCategory = categoryFilter === 'all' || record.category === categoryFilter;
    return matchSearch && matchType && matchCategory;
  });

  // 添加/编辑记录
  const handleSubmit = async () => {
    if (!formData.amount || !formData.category || !formData.member) {
      toast({
        variant: 'destructive',
        title: '提交失败',
        description: '请填写完整信息'
      });
      return;
    }
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      const newRecord = {
        id: editingRecord?.id || Date.now().toString(),
        ...formData,
        amount: parseFloat(formData.amount),
        createdAt: editingRecord?.createdAt || new Date().toISOString()
      };
      if (editingRecord) {
        setRecords(records.map(r => r.id === editingRecord.id ? newRecord : r));
        toast({
          title: '记录已更新'
        });
      } else {
        setRecords([newRecord, ...records]);
        toast({
          title: '记录已添加'
        });
      }
      setIsAddDialogOpen(false);
      setEditingRecord(null);
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        member: ''
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

  // 删除记录
  const handleDelete = id => {
    setRecords(records.filter(r => r.id !== id));
    toast({
      title: '记录已删除'
    });
  };

  // 打开编辑对话框
  const openEditDialog = record => {
    setEditingRecord(record);
    setFormData({
      type: record.type,
      amount: record.amount.toString(),
      category: record.category,
      date: record.date,
      notes: record.notes,
      member: record.member
    });
    setIsAddDialogOpen(true);
  };

  // 格式化金额
  const formatAmount = amount => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
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
            收支记录
          </h1>
          <Button className="bg-[#FF8B4E] hover:bg-[#FF6B35] rounded-xl h-10" onClick={() => {
          setEditingRecord(null);
          setFormData({
            type: 'expense',
            amount: '',
            category: '',
            date: new Date().toISOString().split('T')[0],
            notes: '',
            member: ''
          });
          setIsAddDialogOpen(true);
        }}>
            <Plus className="h-5 w-5 mr-1" />
            添加
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#9CCF4E]/20 rounded-2xl p-4 text-center backdrop-blur-sm">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-[#9CCF4E]" />
            <p className="text-xs text-gray-400 mb-1">收入</p>
            <p className="text-lg font-bold text-[#9CCF4E]">{formatAmount(totalIncome)}</p>
          </div>
          <div className="bg-[#E85A42]/20 rounded-2xl p-4 text-center backdrop-blur-sm">
            <TrendingDown className="h-6 w-6 mx-auto mb-2 text-[#E85A42]" />
            <p className="text-xs text-gray-400 mb-1">支出</p>
            <p className="text-lg font-bold text-[#E85A42]">{formatAmount(totalExpense)}</p>
          </div>
          <div className={`${balance >= 0 ? 'bg-[#FF8B4E]/20' : 'bg-[#E94560]/20'} rounded-2xl p-4 text-center backdrop-blur-sm`}>
            <Wallet className={`h-6 w-6 mx-auto mb-2 ${balance >= 0 ? 'text-[#FF8B4E]' : 'text-[#E94560]'}`} />
            <p className="text-xs text-gray-400 mb-1">结余</p>
            <p className={`text-lg font-bold ${balance >= 0 ? 'text-[#FF8B4E]' : 'text-[#E94560]'}`}>
              {formatAmount(balance)}
            </p>
          </div>
        </div>
      </div>

      {/* 筛选区域 */}
      <div className="p-4 space-y-3">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="搜索记录..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-[#1A1A2E] border-[#2A2A4E] text-white pl-10 rounded-xl h-11" />
        </div>

        {/* 筛选器 */}
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-[#1A1A2E] border-[#2A2A4E] text-white rounded-xl h-10 flex-1">
              <SelectValue placeholder="类型" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A2E] border-[#2A2A4E]">
              <SelectItem value="all" className="text-white">全部类型</SelectItem>
              <SelectItem value="income" className="text-[#9CCF4E]">收入</SelectItem>
              <SelectItem value="expense" className="text-[#E85A42]">支出</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-[#1A1A2E] border-[#2A2A4E] text-white rounded-xl h-10 flex-1">
              <SelectValue placeholder="类别" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A2E] border-[#2A2A4E]">
              <SelectItem value="all" className="text-white">全部分类</SelectItem>
              {[...categories.income, ...categories.expense].map(cat => <SelectItem key={cat} value={cat} className="text-white">{cat}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 记录列表 */}
      <div className="px-4 space-y-3">
        {filteredRecords.length > 0 ? filteredRecords.map(record => <div key={record.id} className="bg-[#1A1A2E] rounded-2xl p-4 flex items-center gap-4 hover:bg-[#16213E] transition-colors cursor-pointer" onClick={() => openEditDialog(record)}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${record.type === 'income' ? 'bg-[#9CCF4E]/20' : 'bg-[#E85A42]/20'}`}>
                {record.type === 'income' ? <ArrowUpRight className="h-6 w-6 text-[#9CCF4E]" /> : <ArrowDownRight className="h-6 w-6 text-[#E85A42]" />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white">{record.category}</span>
                  <span className={`font-bold ${record.type === 'income' ? 'text-[#9CCF4E]' : 'text-[#E85A42]'}`}>
                    {record.type === 'income' ? '+' : '-'}{formatAmount(record.amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{record.notes}</span>
                  <span className="text-gray-500">{record.date}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-[#2A2A4E] text-gray-300 px-2 py-0.5 rounded-full">
                    {record.member}
                  </span>
                </div>
              </div>

              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-[#E94560]" onClick={e => {
          e.stopPropagation();
          handleDelete(record.id);
        }}>
                <X className="h-4 w-4" />
              </Button>
            </div>) : <div className="text-center py-12">
            <Wallet className="h-16 w-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">暂无记录</p>
            <p className="text-sm text-gray-500 mt-1">点击上方添加按钮创建记录</p>
          </div>}
      </div>

      {/* 添加/编辑对话框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-[#1A1A2E] border-[#2A2A4E] text-white rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle style={{
            fontFamily: 'Playfair Display, serif'
          }}>
              {editingRecord ? '编辑记录' : '添加记录'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              填写收支记录的详细信息
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 类型选择 */}
            <div className="flex gap-2">
              <Button className={`flex-1 h-12 rounded-xl ${formData.type === 'income' ? 'bg-[#9CCF4E] text-white' : 'bg-[#2A2A4E] text-gray-400'}`} onClick={() => setFormData({
              ...formData,
              type: 'income',
              category: ''
            })}>
                <TrendingUp className="h-5 w-5 mr-2" />
                收入
              </Button>
              <Button className={`flex-1 h-12 rounded-xl ${formData.type === 'expense' ? 'bg-[#E85A42] text-white' : 'bg-[#2A2A4E] text-gray-400'}`} onClick={() => setFormData({
              ...formData,
              type: 'expense',
              category: ''
            })}>
                <TrendingDown className="h-5 w-5 mr-2" />
                支出
              </Button>
            </div>

            {/* 金额 */}
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input type="number" placeholder="金额" value={formData.amount} onChange={e => setFormData({
              ...formData,
              amount: e.target.value
            })} className="bg-[#0F0F1A] border-[#2A2A4E] text-white pl-10 rounded-xl h-12 text-lg" />
            </div>

            {/* 类别 */}
            <Select value={formData.category} onValueChange={value => setFormData({
            ...formData,
            category: value
          })}>
              <SelectTrigger className="bg-[#0F0F1A] border-[#2A2A4E] text-white rounded-xl h-12">
                <SelectValue placeholder="选择类别" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A2E] border-[#2A2A4E]">
                {(formData.type === 'income' ? categories.income : categories.expense).map(cat => <SelectItem key={cat} value={cat} className="text-white">{cat}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* 成员 */}
            <Select value={formData.member} onValueChange={value => setFormData({
            ...formData,
            member: value
          })}>
              <SelectTrigger className="bg-[#0F0F1A] border-[#2A2A4E] text-white rounded-xl h-12">
                <SelectValue placeholder="选择成员" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A2E] border-[#2A2A4E]">
                {members.map(member => <SelectItem key={member} value={member} className="text-white">{member}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* 日期 */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input type="date" value={formData.date} onChange={e => setFormData({
              ...formData,
              date: e.target.value
            })} className="bg-[#0F0F1A] border-[#2A2A4E] text-white pl-10 rounded-xl h-12" />
            </div>

            {/* 备注 */}
            <Textarea placeholder="备注（可选）" value={formData.notes} onChange={e => setFormData({
            ...formData,
            notes: e.target.value
          })} className="bg-[#0F0F1A] border-[#2A2A4E] text-white rounded-xl resize-none" rows={2} />
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
          <Wallet className="h-6 w-6 text-[#FF8B4E]" />
          <span className="text-xs">记录</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center gap-1 text-gray-400 h-14" onClick={() => navigateTo({
        pageId: 'family-finance-budget',
        params: {}
      })}>
          <PiggyBank className="h-6 w-6" />
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