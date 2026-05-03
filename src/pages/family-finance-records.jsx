// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Textarea } from '@/components/ui';
// @ts-ignore;
import { Wallet as WalletIcon, TrendingUp, TrendingDown, Plus, Search, Filter, Calendar, Tag, CreditCard, MoreHorizontal, ChevronLeft, ChevronRight, UtensilsCrossed, Car, ShoppingBag, GraduationCap, Heart, Gamepad2, Zap, Phone, Gift, ArrowUpRight, ArrowDownRight } from 'lucide-react';

import { useForm } from 'react-hook-form';

// 图标映射
const iconMap = {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  GraduationCap,
  Heart,
  Gamepad2,
  Zap,
  Phone,
  Gift,
  WalletIcon,
  MoreHorizontal,
  TrendingUp
};
export default function FamilyFinanceRecords(props) {
  const {
    toast
  } = useToast();
  const {
    navigateTo,
    navigateBack
  } = props.$w.utils;
  const currentUser = props.$w.auth.currentUser || {};
  const [records, setRecords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('thisMonth');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [familyGroupId, setFamilyGroupId] = useState(null);
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0
  });
  const form = useForm({
    defaultValues: {
      type: 'expense',
      category: '',
      amount: '',
      description: '',
      recordDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'wechat'
    }
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
      if (result?.records?.length > 0) {
        setFamilyGroupId(result.records[0].familyGroupId);
        return result.records[0].familyGroupId;
      }
      return null;
    } catch (error) {
      console.error('获取家庭组失败:', error);
      return null;
    }
  };

  // 获取分类列表
  const fetchCategories = async groupId => {
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'finance_categories',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                familyGroupId: {
                  $eq: groupId
                }
              }, {
                isActive: {
                  $eq: true
                }
              }]
            }
          },
          orderBy: [{
            sortOrder: 'asc'
          }],
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 100,
          pageNumber: 1
        }
      });
      if (result?.records) {
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

  // 获取收支记录
  const fetchRecords = async groupId => {
    try {
      const targetGroupId = groupId || familyGroupId;
      if (!targetGroupId) return;

      // 构建日期筛选条件
      let dateCondition = {};
      const now = new Date();
      if (dateFilter === 'today') {
        const today = now.toISOString().split('T')[0];
        dateCondition = {
          recordDate: {
            $gte: `${today}T00:00:00Z`,
            $lte: `${today}T23:59:59Z`
          }
        };
      } else if (dateFilter === 'thisWeek') {
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        dateCondition = {
          recordDate: {
            $gte: weekStart.toISOString()
          }
        };
      } else if (dateFilter === 'thisMonth') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        dateCondition = {
          recordDate: {
            $gte: monthStart.toISOString()
          }
        };
      }
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
              }, ...(typeFilter !== 'all' ? [{
                type: {
                  $eq: typeFilter
                }
              }] : []), ...(categoryFilter !== 'all' ? [{
                category: {
                  $eq: categoryFilter
                }
              }] : []), ...(dateFilter !== 'all' ? [dateCondition] : [])]
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
      if (result?.records) {
        const recordList = result.records.map(r => ({
          id: r._id,
          type: r.type,
          category: r.category,
          amount: r.amount,
          description: r.description,
          recordDate: r.recordDate,
          paymentMethod: r.paymentMethod,
          nickname: r.nickname,
          tags: r.tags || []
        }));
        setRecords(recordList);

        // 计算汇总
        const income = recordList.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
        const expense = recordList.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
        setSummary({
          income,
          expense,
          balance: income - expense
        });
      }
    } catch (error) {
      console.error('获取收支记录失败:', error);
      toast({
        variant: 'destructive',
        title: '获取记录失败',
        description: error.message
      });
    }
  };

  // 添加收支记录
  const onSubmit = async data => {
    try {
      if (!familyGroupId) {
        toast({
          variant: 'destructive',
          title: '添加失败',
          description: '未找到家庭组信息'
        });
        return;
      }
      await props.$w.cloud.callDataSource({
        dataSourceName: 'family_finance_records',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            familyGroupId: familyGroupId,
            userId: currentUser.userId,
            nickname: currentUser.nickName || currentUser.name || '匿名用户',
            type: data.type,
            category: data.category,
            amount: parseFloat(data.amount),
            description: data.description,
            recordDate: new Date(data.recordDate).toISOString(),
            paymentMethod: data.paymentMethod,
            tags: [],
            isRecurring: false
          }
        }
      });
      toast({
        variant: 'default',
        title: '添加成功',
        description: '收支记录已保存'
      });
      setIsAddDialogOpen(false);
      form.reset();
      await fetchRecords();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '添加失败',
        description: error.message
      });
    }
  };

  // 页面初始化
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const groupId = await fetchFamilyGroup();
      if (groupId) {
        await Promise.all([fetchCategories(groupId), fetchRecords(groupId)]);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // 筛选条件变化时重新获取数据
  useEffect(() => {
    if (familyGroupId) {
      fetchRecords();
    }
  }, [typeFilter, categoryFilter, dateFilter]);

  // 获取分类图标
  const getCategoryIcon = (categoryName, type) => {
    const category = categories.find(c => c.name === categoryName && c.type === type);
    const IconComponent = iconMap[category?.icon] || MoreHorizontal;
    return <IconComponent className="h-4 w-4" style={{
      color: category?.color || '#95A5A6'
    }} />;
  };

  // 获取分类颜色
  const getCategoryColor = (categoryName, type) => {
    const category = categories.find(c => c.name === categoryName && c.type === type);
    return category?.color || '#95A5A6';
  };

  // 格式化金额
  const formatAmount = amount => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // 格式化日期
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  };

  // 支付方式图标
  const getPaymentMethodIcon = method => {
    switch (method) {
      case 'wechat':
        return <span className="text-[#07C160] text-xs">微信</span>;
      case 'alipay':
        return <span className="text-[#1677FF] text-xs">支付宝</span>;
      case 'cash':
        return <span className="text-[#8B7355] text-xs">现金</span>;
      case 'card':
        return <span className="text-[#FF6B35] text-xs">银行卡</span>;
      default:
        return <span className="text-gray-500 text-xs">其他</span>;
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-[#FF8B4E]/5 via-[#FCEEB8]/10 to-[#9CCF4E]/5 pb-24">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-[#FF8B4E] to-[#FF6B35] rounded-b-[2rem] shadow-lg">
        <div className="px-6 pt-12 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-white h-10 w-10 p-0 rounded-full hover:bg-white/20" onClick={() => navigateBack()}>
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <h1 className="text-2xl font-bold text-white" style={{
              fontFamily: 'Quicksand'
            }}>
                收支记录
              </h1>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-[#FF6B35] h-10 px-4 rounded-xl font-bold hover:bg-[#FCEEB8]">
                  <Plus className="h-5 w-5 mr-1" />
                  记一笔
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-[#FF6B35]">记一笔</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                    <FormField control={form.control} name="type" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>类型</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择类型" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="expense">
                                <span className="flex items-center gap-2">
                                  <TrendingDown className="h-4 w-4 text-[#E85A42]" />
                                  支出
                                </span>
                              </SelectItem>
                              <SelectItem value="income">
                                <span className="flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4 text-[#9CCF4E]" />
                                  收入
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={form.control} name="category" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>分类</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择分类" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.filter(c => c.type === form.watch('type')).map(c => <SelectItem key={c.id} value={c.name}>
                                    <span className="flex items-center gap-2">
                                      {React.createElement(iconMap[c.icon] || MoreHorizontal, {
                              className: 'h-4 w-4',
                              style: {
                                color: c.color
                              }
                            })}
                                      {c.name}
                                    </span>
                                  </SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={form.control} name="amount" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>金额</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="请输入金额" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={form.control} name="recordDate" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>日期</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={form.control} name="paymentMethod" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>支付方式</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择支付方式" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="wechat">微信支付</SelectItem>
                              <SelectItem value="alipay">支付宝</SelectItem>
                              <SelectItem value="cash">现金</SelectItem>
                              <SelectItem value="card">银行卡</SelectItem>
                              <SelectItem value="other">其他</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={form.control} name="description" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>描述</FormLabel>
                          <FormControl>
                            <Textarea placeholder="请输入描述（选填）" className="resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <Button type="submit" className="w-full bg-gradient-to-r from-[#FF8B4E] to-[#FF6B35] text-white h-12 rounded-xl font-bold">
                      保存
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* 汇总卡片 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
              <p className="text-white/80 text-xs mb-1">本月收入</p>
              <p className="text-white font-bold text-lg" style={{
              fontFamily: 'Space Mono'
            }}>
                {formatAmount(summary.income)}
              </p>
              <ArrowUpRight className="h-4 w-4 text-white/60 mx-auto mt-1" />
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
              <p className="text-white/80 text-xs mb-1">本月支出</p>
              <p className="text-white font-bold text-lg" style={{
              fontFamily: 'Space Mono'
            }}>
                {formatAmount(summary.expense)}
              </p>
              <ArrowDownRight className="h-4 w-4 text-white/60 mx-auto mt-1" />
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
              <p className="text-white/80 text-xs mb-1">结余</p>
              <p className={`font-bold text-lg ${summary.balance >= 0 ? 'text-[#9CCF4E]' : 'text-[#E85A42]'}`} style={{
              fontFamily: 'Space Mono'
            }}>
                {formatAmount(summary.balance)}
              </p>
              <Wallet className="h-4 w-4 text-white/60 mx-auto mt-1" />
            </div>
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Search className="h-4 w-4 text-[#8B7355]" />
            <Input placeholder="搜索描述或分类..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 border-0 focus-visible:ring-0 p-0" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[100px] h-8 text-xs">
                <SelectValue placeholder="类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="income">收入</SelectItem>
                <SelectItem value="expense">支出</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[100px] h-8 text-xs">
                <SelectValue placeholder="分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[100px] h-8 text-xs">
                <SelectValue placeholder="时间" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部时间</SelectItem>
                <SelectItem value="today">今天</SelectItem>
                <SelectItem value="thisWeek">本周</SelectItem>
                <SelectItem value="thisMonth">本月</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 记录列表 */}
        {loading ? <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#FF8B4E] border-t-transparent rounded-full animate-spin" />
          </div> : records.length > 0 ? <div className="space-y-3">
            {records.filter(r => !searchQuery || r.description?.includes(searchQuery) || r.category?.includes(searchQuery)).map(record => <div key={record.id} className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                backgroundColor: `${getCategoryColor(record.category, record.type)}20`
              }}>
                        {getCategoryIcon(record.category, record.type)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#FF6B35]" style={{
                  fontFamily: 'Quicksand'
                }}>
                          {record.category}
                        </p>
                        <p className="text-xs text-[#8B7355]" style={{
                  fontFamily: 'Nunito'
                }}>
                          {record.description || '无描述'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${record.type === 'income' ? 'text-[#9CCF4E]' : 'text-[#E85A42]'}`} style={{
                fontFamily: 'Space Mono'
              }}>
                        {record.type === 'income' ? '+' : '-'}{formatAmount(record.amount)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#8B7355]">{formatDate(record.recordDate)}</span>
                        {getPaymentMethodIcon(record.paymentMethod)}
                      </div>
                    </div>
                  </div>
                  {record.nickname && <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-[#8B7355]">
                        记录人: {record.nickname}
                      </p>
                    </div>}
                </div>)}
          </div> : <div className="text-center py-12">
            <Wallet className="h-16 w-16 mx-auto mb-4 text-[#FF8B4E] opacity-30" />
            <p className="text-[#8B7355] mb-2" style={{
          fontFamily: 'Quicksand'
        }}>
              暂无收支记录
            </p>
            <p className="text-sm text-[#8B7355] opacity-60" style={{
          fontFamily: 'Nunito'
        }}>
              点击右上角"记一笔"开始记录
            </p>
          </div>}
      </div>
    </div>;
}