// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { ChevronDown, TrendingUp, TrendingDown, PieChart, BarChart3, Users, Calendar } from 'lucide-react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line, Legend } from 'recharts';

// 财务报表页面
const FamilyFinanceReportPage = props => {
  const {
    toast
  } = useToast();
  const {
    navigateTo,
    navigateBack
  } = props.$w.utils;
  const currentUser = props.$w.auth.currentUser;
  const [records, setRecords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [familyGroupId, setFamilyGroupId] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState('overview');
  const [chartType, setChartType] = useState('bar');

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
          pageSize: 500,
          pageNumber: 1
        }
      });
      if (result && result.records) {
        setRecords(result.records.map(r => ({
          id: r._id,
          userId: r.userId,
          nickname: r.nickname,
          type: r.type,
          category: r.category,
          amount: r.amount,
          recordDate: r.recordDate
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

  // 切换月份
  const changeMonth = delta => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };

  // 筛选当月数据
  const getMonthData = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return records.filter(r => {
      const date = new Date(r.recordDate);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  };

  // 获取最近6个月数据
  const getLast6MonthsData = () => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthRecords = records.filter(r => {
        const rDate = new Date(r.recordDate);
        return rDate.getFullYear() === year && rDate.getMonth() === month;
      });
      const income = monthRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
      const expense = monthRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
      data.push({
        month: date.toLocaleString('zh-CN', {
          month: 'short'
        }),
        income,
        expense,
        balance: income - expense
      });
    }
    return data;
  };

  // 获取分类统计数据
  const getCategoryStats = type => {
    const monthData = getMonthData();
    const filtered = monthData.filter(r => r.type === type);
    const stats = {};
    filtered.forEach(r => {
      if (!stats[r.category]) stats[r.category] = 0;
      stats[r.category] += r.amount;
    });
    return Object.entries(stats).map(([name, value]) => {
      const cat = categories.find(c => c.name === name);
      return {
        name,
        value,
        icon: cat?.icon || '📝',
        color: cat?.color || '#607D8B'
      };
    }).sort((a, b) => b.value - a.value);
  };

  // 获取成员消费排行
  const getMemberRanking = () => {
    const monthData = getMonthData().filter(r => r.type === 'expense');
    const stats = {};
    monthData.forEach(r => {
      if (!stats[r.nickname]) stats[r.nickname] = 0;
      stats[r.nickname] += r.amount;
    });
    return Object.entries(stats).map(([nickname, amount]) => ({
      nickname,
      amount
    })).sort((a, b) => b.amount - a.amount);
  };

  // 计算统计
  const monthData = getMonthData();
  const totalIncome = monthData.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = monthData.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const balance = totalIncome - totalExpense;
  const last6MonthsData = getLast6MonthsData();
  const expenseByCategory = getCategoryStats('expense');
  const incomeByCategory = getCategoryStats('income');
  const memberRanking = getMemberRanking();
  const monthStr = currentMonth.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long'
  });
  const COLORS = ['#FF6B35', '#9CCF4E', '#FF8B4E', '#E85A42', '#2196F3', '#9C27B0', '#FF9800', '#795548'];
  return <div className="min-h-screen bg-gradient-to-br from-[#FFF8E7] via-[#FFFAF0] to-[#FFF5E6] pb-20">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-[#E85A42] to-[#FF6B35] p-6 pt-12 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" className="text-white p-0" onClick={() => navigateBack()}>
            <ChevronDown className="h-6 w-6 rotate-90" />
          </Button>
          <h1 className="text-xl font-bold text-white" style={{
          fontFamily: 'Quicksand'
        }}>财务报表</h1>
          <div className="w-14"></div>
        </div>
        
        {/* 月份选择 */}
        <div className="flex items-center justify-center gap-4">
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

      {/* 视图切换 */}
      <div className="p-4">
        <div className="flex bg-white rounded-xl p-1">
          <button className={`flex-1 py-2 rounded-lg font-bold transition-all ${viewMode === 'overview' ? 'bg-[#FF6B35] text-white' : 'text-[#8B7355]'}`} onClick={() => setViewMode('overview')}>
            概览
          </button>
          <button className={`flex-1 py-2 rounded-lg font-bold transition-all ${viewMode === 'trend' ? 'bg-[#FF6B35] text-white' : 'text-[#8B7355]'}`} onClick={() => setViewMode('trend')}>
            趋势
          </button>
          <button className={`flex-1 py-2 rounded-lg font-bold transition-all ${viewMode === 'ranking' ? 'bg-[#FF6B35] text-white' : 'text-[#8B7355]'}`} onClick={() => setViewMode('ranking')}>
            排行
          </button>
        </div>
      </div>

      {loading ? <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35] mx-auto"></div>
          <p className="text-[#8B7355] mt-2">加载中...</p>
        </div> : <div className="px-4 space-y-4">
          {/* 概览视图 */}
          {viewMode === 'overview' && <>
              {/* 收支概览 */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="font-bold text-[#FF6B35] mb-4" style={{
            fontFamily: 'Quicksand'
          }}>收支概览</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-[#9CCF4E]/10 rounded-xl">
                    <TrendingUp className="h-6 w-6 mx-auto text-[#9CCF4E] mb-2" />
                    <p className="text-xs text-[#8B7355]">收入</p>
                    <p className="text-lg font-bold text-[#9CCF4E]">¥{totalIncome.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-[#FF6B35]/10 rounded-xl">
                    <TrendingDown className="h-6 w-6 mx-auto text-[#FF6B35] mb-2" />
                    <p className="text-xs text-[#8B7355]">支出</p>
                    <p className="text-lg font-bold text-[#FF6B35]">¥{totalExpense.toLocaleString()}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${balance >= 0 ? 'bg-[#9CCF4E]/10' : 'bg-[#E85A42]/10'}`}>
                    <PieChart className={`h-6 w-6 mx-auto mb-2 ${balance >= 0 ? 'text-[#9CCF4E]' : 'text-[#E85A42]'}`} />
                    <p className="text-xs text-[#8B7355]">结余</p>
                    <p className={`text-lg font-bold ${balance >= 0 ? 'text-[#9CCF4E]' : 'text-[#E85A42]'}`}>
                      ¥{balance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* 支出分类饼图 */}
              {expenseByCategory.length > 0 && <div className="bg-white rounded-2xl shadow-md p-6">
                  <h3 className="font-bold text-[#FF6B35] mb-4" style={{
            fontFamily: 'Quicksand'
          }}>支出分类</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPie>
                      <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" label={({
                name,
                percent
              }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {expenseByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={value => `¥${value.toLocaleString()}`} />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {expenseByCategory.slice(0, 6).map((cat, index) => <div key={cat.name} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{
                backgroundColor: COLORS[index % COLORS.length]
              }}></div>
                        <span className="text-[#8B7355]">{cat.icon} {cat.name}</span>
                        <span className="ml-auto font-bold text-[#FF6B35]">¥{cat.value.toLocaleString()}</span>
                      </div>)}
                  </div>
                </div>}

              {/* 收入分类饼图 */}
              {incomeByCategory.length > 0 && <div className="bg-white rounded-2xl shadow-md p-6">
                  <h3 className="font-bold text-[#9CCF4E] mb-4" style={{
            fontFamily: 'Quicksand'
          }}>收入分类</h3>
                  <div className="space-y-3">
                    {incomeByCategory.map((cat, index) => <div key={cat.name} className="flex items-center gap-3">
                        <div className="text-xl">{cat.icon}</div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="font-semibold text-[#FF6B35]">{cat.name}</span>
                            <span className="font-bold text-[#9CCF4E]">¥{cat.value.toLocaleString()}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-[#9CCF4E] rounded-full" style={{
                    width: `${totalIncome > 0 ? cat.value / totalIncome * 100 : 0}%`
                  }} />
                          </div>
                        </div>
                      </div>)}
                  </div>
                </div>}
            </>}

          {/* 趋势视图 */}
          {viewMode === 'trend' && <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>收支趋势</h3>
                <div className="flex gap-2">
                  <button className={`p-2 rounded-lg ${chartType === 'bar' ? 'bg-[#FF6B35] text-white' : 'bg-[#FCEEB8] text-[#8B7355]'}`} onClick={() => setChartType('bar')}>
                    <BarChart3 className="h-4 w-4" />
                  </button>
                  <button className={`p-2 rounded-lg ${chartType === 'line' ? 'bg-[#FF6B35] text-white' : 'bg-[#FCEEB8] text-[#8B7355]'}`} onClick={() => setChartType('line')}>
                    <TrendingUp className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                {chartType === 'bar' ? <BarChart data={last6MonthsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                    <XAxis dataKey="month" stroke="#8B7355" fontSize={12} />
                    <YAxis stroke="#8B7355" fontSize={12} />
                    <Tooltip formatter={value => `¥${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="income" name="收入" fill="#9CCF4E" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="支出" fill="#FF6B35" radius={[4, 4, 0, 0]} />
                  </BarChart> : <LineChart data={last6MonthsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                    <XAxis dataKey="month" stroke="#8B7355" fontSize={12} />
                    <YAxis stroke="#8B7355" fontSize={12} />
                    <Tooltip formatter={value => `¥${value.toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="income" name="收入" stroke="#9CCF4E" strokeWidth={2} dot={{
              fill: '#9CCF4E'
            }} />
                    <Line type="monotone" dataKey="expense" name="支出" stroke="#FF6B35" strokeWidth={2} dot={{
              fill: '#FF6B35'
            }} />
                    <Line type="monotone" dataKey="balance" name="结余" stroke="#E85A42" strokeWidth={2} strokeDasharray="5 5" dot={{
              fill: '#E85A42'
            }} />
                  </LineChart>}
              </ResponsiveContainer>
            </div>}

          {/* 排行视图 */}
          {viewMode === 'ranking' && <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-[#FF6B35] mb-4" style={{
          fontFamily: 'Quicksand'
        }}>
                <Users className="h-5 w-5 inline mr-2" />成员消费排行
              </h3>
              
              {memberRanking.length > 0 ? <div className="space-y-3">
                  {memberRanking.map((member, index) => <div key={member.nickname} className="flex items-center gap-3 p-3 bg-[#FFF8E7] rounded-xl">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-[#FFD700]' : index === 1 ? 'bg-[#C0C0C0]' : index === 2 ? 'bg-[#CD7F32]' : 'bg-[#FF6B35]'}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#FF6B35]">{member.nickname}</p>
                        <div className="h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FF8B4E] rounded-full" style={{
                  width: `${memberRanking[0] ? member.amount / memberRanking[0].amount * 100 : 0}%`
                }} />
                        </div>
                      </div>
                      <p className="font-bold text-[#FF6B35]">¥{member.amount.toLocaleString()}</p>
                    </div>)}
                </div> : <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-[#FF8B4E] opacity-50 mb-3" />
                  <p className="text-[#8B7355]">本月暂无消费记录</p>
                </div>}
            </div>}
        </div>}
    </div>;
};
export default FamilyFinanceReportPage;