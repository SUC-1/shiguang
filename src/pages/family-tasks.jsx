// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { Plus, Search, Filter, Clock, CheckCircle, Circle, AlertCircle, Star, Calendar, User, ChevronRight, MoreVertical, Trash2, Edit, Play } from 'lucide-react';

const {
  toast
} = useToast();
export default function FamilyTasks(props) {
  const {
    $w
  } = props;
  const {
    navigateTo,
    navigateBack
  } = $w.utils;
  const currentUser = $w.auth.currentUser;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [familyGroupId, setFamilyGroupId] = useState(null);
  const [members, setMembers] = useState([]);
  const [expandedTask, setExpandedTask] = useState(null);

  // 获取当前用户的家庭组
  const fetchFamilyGroup = async () => {
    try {
      const result = await $w.cloud.callDataSource({
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
        const groupId = result.records[0].familyGroupId;
        setFamilyGroupId(groupId);
        return groupId;
      }
      return null;
    } catch (error) {
      console.error('获取家庭组失败:', error);
      return null;
    }
  };

  // 获取家庭成员
  const fetchMembers = async groupId => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'family_memberships',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                familyGroupId: {
                  $eq: groupId
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
          pageSize: 50,
          pageNumber: 1
        }
      });
      if (result?.records) {
        setMembers(result.records);
      }
    } catch (error) {
      console.error('获取家庭成员失败:', error);
    }
  };

  // 获取任务列表
  const fetchTasks = async groupId => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'family_tasks',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              familyGroupId: {
                $eq: groupId
              }
            }
          },
          orderBy: [{
            createdAt: 'desc'
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
        setTasks(result.records.map(t => ({
          id: t._id,
          title: t.title,
          description: t.description,
          assigneeId: t.assigneeId,
          assigneeName: t.assigneeName,
          assigneeAvatar: t.assigneeAvatar,
          creatorId: t.creatorId,
          creatorName: t.creatorName,
          status: t.status,
          points: t.points,
          dueDate: t.dueDate,
          completedAt: t.completedAt,
          priority: t.priority,
          category: t.category,
          createdAt: t.createdAt
        })));
      }
    } catch (error) {
      console.error('获取任务列表失败:', error);
      toast({
        variant: 'destructive',
        title: '加载失败',
        description: '无法获取任务列表'
      });
    }
  };

  // 完成任务
  const handleCompleteTask = async task => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'family_tasks',
        methodName: 'wedaUpdateV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: task.id
              }
            }
          },
          data: {
            status: 'completed',
            completedAt: new Date().toISOString()
          }
        }
      });

      // 更新积分
      const pointsResult = await $w.cloud.callDataSource({
        dataSourceName: 'family_task_points',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                familyGroupId: {
                  $eq: familyGroupId
                }
              }, {
                userId: {
                  $eq: task.assigneeId
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
      if (pointsResult?.records?.length > 0) {
        const pointsRecord = pointsResult.records[0];
        await $w.cloud.callDataSource({
          dataSourceName: 'family_task_points',
          methodName: 'wedaUpdateV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: pointsRecord._id
                }
              }
            },
            data: {
              totalPoints: pointsRecord.totalPoints + task.points,
              availablePoints: pointsRecord.availablePoints + task.points,
              completedTasks: pointsRecord.completedTasks + 1,
              updatedAt: new Date().toISOString()
            }
          }
        });
      }
      toast({
        variant: 'default',
        title: '任务完成',
        description: `恭喜获得 ${task.points} 积分！`
      });
      await fetchTasks(familyGroupId);
    } catch (error) {
      console.error('完成任务失败:', error);
      toast({
        variant: 'destructive',
        title: '操作失败',
        description: error.message || '请稍后重试'
      });
    }
  };

  // 删除任务
  const handleDeleteTask = async taskId => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'family_tasks',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: taskId
              }
            }
          }
        }
      });
      toast({
        variant: 'default',
        title: '删除成功',
        description: '任务已删除'
      });
      await fetchTasks(familyGroupId);
    } catch (error) {
      console.error('删除任务失败:', error);
      toast({
        variant: 'destructive',
        title: '删除失败',
        description: error.message || '请稍后重试'
      });
    }
  };

  // 页面初始化
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const groupId = await fetchFamilyGroup();
      if (groupId) {
        await Promise.all([fetchTasks(groupId), fetchMembers(groupId)]);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // 筛选任务
  const filteredTasks = tasks.filter(task => {
    const matchSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchCategory = categoryFilter === 'all' || task.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  // 按状态分组
  const pendingTasks = filteredTasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  // 获取状态颜色
  const getStatusColor = status => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-600';
      case 'in_progress':
        return 'bg-blue-100 text-blue-600';
      case 'completed':
        return 'bg-green-100 text-green-600';
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // 获取状态文本
  const getStatusText = status => {
    switch (status) {
      case 'pending':
        return '待完成';
      case 'in_progress':
        return '进行中';
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
      default:
        return '未知';
    }
  };

  // 获取分类颜色
  const getCategoryColor = category => {
    switch (category) {
      case 'chore':
        return 'bg-amber-100 text-amber-600';
      case 'study':
        return 'bg-purple-100 text-purple-600';
      case 'health':
        return 'bg-green-100 text-green-600';
      case 'social':
        return 'bg-pink-100 text-pink-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // 获取分类文本
  const getCategoryText = category => {
    switch (category) {
      case 'chore':
        return '家务';
      case 'study':
        return '学习';
      case 'health':
        return '健康';
      case 'social':
        return '社交';
      default:
        return '其他';
    }
  };

  // 格式化日期
  const formatDate = dateStr => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return '已过期';
    if (days === 0) return '今天';
    if (days === 1) return '明天';
    if (days <= 7) return `${days}天后`;
    return date.toLocaleDateString('zh-CN');
  };

  // 渲染任务卡片
  const renderTaskCard = task => <div key={task.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-orange-100" onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}>
      <div className="flex items-start gap-3">
        <button onClick={e => {
        e.stopPropagation();
        if (task.status !== 'completed') {
          handleCompleteTask(task);
        }
      }} className={`mt-1 flex-shrink-0 ${task.status === 'completed' ? 'text-green-500' : 'text-orange-300 hover:text-green-500'}`}>
          {task.status === 'completed' ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold text-gray-800 ${task.status === 'completed' ? 'line-through opacity-60' : ''}`} style={{
            fontFamily: 'Quicksand'
          }}>
              {task.title}
            </h3>
            {task.points > 0 && <span className="flex items-center text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3 mr-1" />{task.points}
              </span>}
          </div>
          
          {task.description && expandedTask === task.id && <p className="text-sm text-gray-500 mb-2" style={{
          fontFamily: 'Nunito'
        }}>
              {task.description}
            </p>}
          
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {task.assigneeName && <span className="flex items-center">
                <User className="w-3 h-3 mr-1" />
                {task.assigneeName}
              </span>}
            {task.dueDate && <span className={`flex items-center ${new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'text-red-500' : ''}`}>
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(task.dueDate)}
              </span>}
            <span className={`px-2 py-0.5 rounded-full ${getCategoryColor(task.category)}`}>
              {getCategoryText(task.category)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button onClick={e => {
          e.stopPropagation();
          navigateTo({
            pageId: 'family-task-form',
            params: {
              taskId: task.id
            }
          });
        }} className="p-2 text-gray-400 hover:text-orange-500">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={e => {
          e.stopPropagation();
          handleDeleteTask(task.id);
        }} className="p-2 text-gray-400 hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>;
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-300 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-600 font-medium" style={{
          fontFamily: 'Quicksand'
        }}>加载中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 pb-20">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-orange-400 to-amber-400 p-6 pt-12 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button onClick={navigateBack} className="text-white">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <h1 className="text-xl font-bold text-white" style={{
          fontFamily: 'Quicksand'
        }}>家庭任务</h1>
          <button onClick={() => navigateTo({
          pageId: 'family-task-form',
          params: {}
        })} className="bg-white text-orange-500 p-2 rounded-full shadow-md">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* 搜索框 */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-300" />
          <input type="text" placeholder="搜索任务..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/90 backdrop-blur text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300" style={{
          fontFamily: 'Nunito'
        }} />
        </div>

        {/* 筛选标签 */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button onClick={() => setStatusFilter('all')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${statusFilter === 'all' ? 'bg-white text-orange-500 shadow-md' : 'bg-white/30 text-white'}`}>
            全部
          </button>
          <button onClick={() => setStatusFilter('pending')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${statusFilter === 'pending' ? 'bg-white text-orange-500 shadow-md' : 'bg-white/30 text-white'}`}>
            待完成
          </button>
          <button onClick={() => setStatusFilter('in_progress')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${statusFilter === 'in_progress' ? 'bg-white text-orange-500 shadow-md' : 'bg-white/30 text-white'}`}>
            进行中
          </button>
          <button onClick={() => setStatusFilter('completed')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${statusFilter === 'completed' ? 'bg-white text-orange-500 shadow-md' : 'bg-white/30 text-white'}`}>
            已完成
          </button>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="p-4">
        {/* 分类筛选 */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {['all', 'chore', 'study', 'health', 'social', 'other'].map(cat => <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${categoryFilter === cat ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
              {cat === 'all' ? '全部分类' : getCategoryText(cat)}
            </button>)}
        </div>

        {/* 待完成任务 */}
        {pendingTasks.length > 0 && <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center" style={{
          fontFamily: 'Quicksand'
        }}>
              <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
              待完成 ({pendingTasks.length})
            </h2>
            {pendingTasks.map(renderTaskCard)}
          </div>}

        {/* 已完成任务 */}
        {completedTasks.length > 0 && <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center" style={{
          fontFamily: 'Quicksand'
        }}>
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              已完成 ({completedTasks.length})
            </h2>
            {completedTasks.map(renderTaskCard)}
          </div>}

        {/* 空状态 */}
        {filteredTasks.length === 0 && <div className="text-center py-12">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2" style={{
          fontFamily: 'Quicksand'
        }}>
              暂无任务
            </h3>
            <p className="text-gray-500 mb-4" style={{
          fontFamily: 'Nunito'
        }}>
              点击右上角按钮创建新任务
            </p>
            <button onClick={() => navigateTo({
          pageId: 'family-task-form',
          params: {}
        })} className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:bg-orange-600 transition-all">
              创建任务
            </button>
          </div>}
      </div>
    </div>;
}