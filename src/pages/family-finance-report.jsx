// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { TrendingUp, TrendingDown, PieChart, BarChart3, Calendar, Users, Wallet, Download, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';

import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';

// 成员映射
const memberMap = {
  'u001': {
    name: '爸爸',
    avatar: '👨'
  },
  'u002': {
    name: '妈妈',
    avatar: '👩'
  },
  'u003': {
    name: '爷爷',
    avatar: '👴'
  },
  'u004': {
    name: '奶奶',
    avatar: '👵'
  },
  'u005': {
    name: '宝宝',
    avatar: '👶'
  }
};

// 分类颜色
const categoryColors = {
  '餐饮': '#FF8B4E',
  '房租': '#6366F1',
  '教育': '#9CCF4E',
  '交通': '#E94560',
  '购物': '#EC4899',
  '娱乐': '#F59E0B',
  '医疗': '#14B8A6',
  '通讯': '#8B5CF6',
  '工资': '#9CCF4E',
  '奖金': '#9CCF4E',
  '理财': '#9CCF4E',
  '红包': '#9CCF4E',
  '兼职': '#9CCF4E',
  '其他收入': '#9CCF4E',
  '其他支出': '#6B7280'
};
export default function FamilyFinanceReport(props) {
  const {
    navigateTo
  } = props.$w.utils;
  const currentUser = props.$w.auth.currentUser;
  const [timeRange, setTimeRange] = useState('month');
  const [chartType, setChartType] = useState('bar');
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
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
          memberMap[m.user_id] = {
            name: m.nick_name || m.name || '家庭成员',
            avatar: m.avatar_url || '👤'
          };
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
        loadData(groupId);
      } else {
        setLoading(false);
      }
    };
    initData();
  }, []);
  useEffect(() => {
    if (familyGroupId) {
      loadData(familyGroupId);
    }
  }, [timeRange, familyGroupId]);
  const loadData = async groupId => {
    if (!groupId) return;
    try {
      setLoading(true);
      const db = props.$w.database;

      // 根据时间范围筛选数据
      const now = new Date();
      let startDate = '';
      if (timeRange === 'week') {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        startDate = weekStart.toISOString().split('T')[0];
      } else if (timeRange === 'month') {
        startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      } else {
        startDate = `${now.getFullYear()}-01-01`;
      }
      const result = await db.collection('family_finance_records').where({
        family_id: groupId,
        date: db.command.gte(startDate)
      }).orderBy('date', 'desc').get();

      // 转换数据格式
      const formattedRecords = result.data.map(record => ({
        id: record._id,
        type: record.type,
        category: record.category,
        amount: record.amount,
        date: record.date,
        member: familyMembers[record.member_id]?.name || familyMembers[record.user_id]?.name || '未知',
        member_id: record.member_id || record.user_id
      }));
      setRecords(formattedRecords);
    } catch (error) {
      console.error('加载财务数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 计算统计数据
  const totalIncome = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const balance = totalIncome - totalExpense;
  const avgIncome = records.length > 0 ? totalIncome / Math.max(1, records.filter(r => r.type === 'income').length) : 0;
  const avgExpense = records.length > 0 ? totalExpense / Math.max(1, records.filter(r => r.type === 'expense').length) : 0;

  // 按月统计数据
  const monthlyData = (() => {
    const months = {};
    records.forEach(record => {
      const month = record.date.substring(0, 7);
      if (!months[month]) {
        months[month] = {
          month: month + '月',
          income: 0,
          expense: 0
        };
      }
      if (record.type === 'income') {
        months[month].income += record.amount;
      } else {
        months[month].expense += record.amount;
      }
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  })();

  // 按分类统计数据
  const categoryData = (() => {
    const categories = {};
    records.filter(r => r.type === 'expense').forEach(record => {
      if (!categories[record.category]) {
        categories[record.category] = {
          name: record.category,
          value: 0,
          color: categoryColors[record.category] || '#6B7280'
        };
      }
      categories[record.category].value += record.amount;
    });
    return Object.values(categories).sort((a, b) => b.value - a.value);
  })();

  // 按成员统计数据
  const memberData = (() => {
    const members = {};
    records.forEach(record => {
      const memberName = record.member;
      if (!members[memberName]) {
        members[memberName] = {
          name: memberName,
          income: 0,
          expense: 0,
          avatar: familyMembers[record.member_id]?.avatar || '👤'
        };
      }
      if (record.type === 'income') {
        members[memberName].income += record.amount;
      } else {
        members[memberName].expense += record.amount;
      }
    });
    return Object.values(members);
  })();

  // 最近交易记录
  const recentTransactions = records.slice(0, 5);

  // 格式化金额
  const formatAmount = amount => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // 自定义Tooltip
  const CustomTooltip = ({
    active,
    payload,
    label
  }) => {
    if (active && payload && payload.length) {
      return <div className="bg-[#1A1A2E] border border-[#2A2A4E] rounded-xl p-3 shadow-xl">
          <p className="text-gray-400 text-sm mb-2">{label}</p>
          {payload.map((entry, index) => <p key={index} className="text-sm" style={{
          color: entry.color
        }}>
              {entry.name}: {formatAmount(entry.value)}
            </p>)}
        </div>;
    }
    return null;
  };
  return <div className="min-h-screen bg-[#0F0F1A] text-white pb-20" style={{
    fontFamily: 'Nunito, sans-serif'
  }}>
      {/* 头部 */}
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] p-6 rounded-b-3xl shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{
          fontFamily: 'Playfair Display, serif'
        }}>
            财务报表
          </h1>
          <Button variant="outline" className="border-[#2A2A4E] text-gray-400 rounded-xl">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
        </div>

        {/* 时间筛选 */}
        <div className="flex gap-2 mb-4">
          {['week', 'month', 'year'].map(range => <Button key={range} variant={timeRange === range ? 'default' : 'ghost'} onClick={() => setTimeRange(range)} className={timeRange === range ? 'bg-[#FF8B4E] text-white rounded-xl' : 'text-gray-400 hover:text-white'}>
              {range === 'week' ? '本周' : range === 'month' ? '本月' : '本年'}
            </Button>)}
        </div>

        {/* 核心指标 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#9CCF4E]/10 rounded-2xl p-4 border border-[#9CCF4E]/20">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="h-5 w-5 text-[#9CCF4E]" />
              <span className="text-gray-400 text-sm">总收入</span>
            </div>
            <p className="text-2xl font-bold text-[#9CCF4E]">{formatAmount(totalIncome)}</p>
            <p className="text-xs text-gray-500 mt-1">月均 {formatAmount(avgIncome)}</p>
          </div>
          <div className="bg-[#E85A42]/10 rounded-2xl p-4 border border-[#E85A42]/20">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownRight className="h-5 w-5 text-[#E85A42]" />
              <span className="text-gray-400 text-sm">总支出</span>
            </div>
            <p className="text-2xl font-bold text-[#E85A42]">{formatAmount(totalExpense)}</p>
            <p className="text-xs text-gray-500 mt-1">月均 {formatAmount(avgExpense)}</p>
          </div>
        </div>

        {/* 结余 */}
        <div className="mt-3 bg-[#0F0F1A]/50 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">结余</span>
            <span className={`text-xl font-bold ${balance >= 0 ? 'text-[#FF8B4E]' : 'text-[#E94560]'}`}>
              {formatAmount(balance)}
            </span>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="p-4 space-y-6">
        {/* 收支趋势图 */}
        <div className="bg-[#1A1A2E] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{
            fontFamily: 'Playfair Display, serif'
          }}>
              收支趋势
            </h3>
            <div className="flex gap-1">
              <Button variant={chartType === 'bar' ? 'default' : 'ghost'} size="icon" className={`h-8 w-8 rounded-lg ${chartType === 'bar' ? 'bg-[#FF8B4E]' : 'text-gray-400'}`} onClick={() => setChartType('bar')}>
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button variant={chartType === 'line' ? 'default' : 'ghost'} size="icon" className={`h-8 w-8 rounded-lg ${chartType === 'line' ? 'bg-[#FF8B4E]' : 'text-gray-400'}`} onClick={() => setChartType('line')}>
                <TrendingUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A4E" />
                  <XAxis dataKey="month" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} tickFormatter={v => `${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="income" name="收入" fill="#9CCF4E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="支出" fill="#E85A42" radius={[4, 4, 0, 0]} />
                </BarChart> : <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A4E" />
                  <XAxis dataKey="month" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} tickFormatter={v => `${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="income" name="收入" stroke="#9CCF4E" strokeWidth={2} dot={{
                fill: '#9CCF4E'
              }} />
                  <Line type="monotone" dataKey="expense" name="支出" stroke="#E85A42" strokeWidth={2} dot={{
                fill: '#E85A42'
              }} />
                </LineChart>}
            </ResponsiveContainer>
          </div>
        </div>

        {/* 支出分类饼图 */}
        <div className="bg-[#1A1A2E] rounded-2xl p-4">
          <h3 className="font-semibold mb-4" style={{
          fontFamily: 'Playfair Display, serif'
        }}>
            支出分类
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>

          {/* 图例 */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((item, index) => <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{
              backgroundColor: item.color
            }} />
                <span className="text-gray-400">{item.name}</span>
                <span className="ml-auto text-white">{formatAmount(item.value)}</span>
              </div>)}
          </div>
        </div>

        {/* 成员分摊 */}
        <div className="bg-[#1A1A2E] rounded-2xl p-4">
          <h3 className="font-semibold mb-4" style={{
          fontFamily: 'Playfair Display, serif'
        }}>
            <Users className="h-5 w-5 inline mr-2" />
            成员收支
          </h3>
          
          <div className="space-y-3">
            {memberData.map((member, index) => <div key={index} className="flex items-center gap-4 p-3 bg-[#0F0F1A] rounded-xl">
                <span className="text-2xl">{member.avatar}</span>
                <div className="flex-1">
                  <p className="font-semibold text-white">{member.name}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm">
                    <span className="text-[#9CCF4E]">+{formatAmount(member.income)}</span>
                    <span className="text-[#E85A42]">-{formatAmount(member.expense)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${member.income - member.expense >= 0 ? 'text-[#FF8B4E]' : 'text-[#E94560]'}`}>
                    {member.income - member.expense >= 0 ? '+' : ''}{formatAmount(member.income - member.expense)}
                  </p>
                </div>
              </div>)}
          </div>
        </div>

        {/* 最近交易 */}
        <div className="bg-[#1A1A2E] rounded-2xl p-4">
          <h3 className="font-semibold mb-4" style={{
          fontFamily: 'Playfair Display, serif'
        }}>
            最近交易
          </h3>
          
          <div className="space-y-2">
            {recentTransactions.map(tx => <div key={tx.id} className="flex items-center gap-3 p-3 bg-[#0F0F1A] rounded-xl">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-[#9CCF4E]/20' : 'bg-[#E85A42]/20'}`}>
                  {tx.type === 'income' ? <ArrowUpRight className="h-4 w-4 text-[#9CCF4E]" /> : <ArrowDownRight className="h-4 w-4 text-[#E85A42]" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{tx.category}</p>
                  <p className="text-xs text-gray-500">{tx.member} · {tx.date}</p>
                </div>
                <span className={`font-semibold ${tx.type === 'income' ? 'text-[#9CCF4E]' : 'text-[#E85A42]'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                </span>
              </div>)}
          </div>
        </div>
      </div>

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
          <Wallet className="h-6 w-6" />
          <span className="text-xs">预算</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center gap-1 text-gray-400 h-14" onClick={() => navigateTo({
        pageId: 'family-finance-report',
        params: {}
      })}>
          <TrendingUp className="h-6 w-6 text-[#FF8B4E]" />
          <span className="text-xs">报表</span>
        </Button>
      </div>
    </div>;
}