// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
// @ts-ignore;
import { Calendar, Clock, Star, CheckCircle, Circle, AlertCircle, Plus, Filter, Search, Trophy, Gift, ArrowLeft, MoreVertical } from 'lucide-react';

// 模拟数据
const mockTasks = [{
  id: 'task_001',
  title: '周末大扫除',
  description: '进行家庭全面清洁，包括客厅、卧室、厨房、卫生间',
  assigneeId: 'user_002',
  assigneeName: '小明',
  assigneeAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming',
  creatorName: '爸爸',
  dueDate: '2026-05-10',
  status: 'pending',
  priority: 'high',
  points: 50,
  createdAt: '2026-05-01T10:00:00Z'
}, {
  id: 'task_002',
  title: '整理衣柜',
  description: '整理换季衣物，将冬季衣服收纳',
  assigneeId: 'user_003',
  assigneeName: '妈妈',
  assigneeAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mama',
  creatorName: '爸爸',
  dueDate: '2026-05-05',
  status: 'in_progress',
  priority: 'medium',
  points: 30,
  createdAt: '2026-05-01T09:00:00Z'
}, {
  id: 'task_003',
  title: '浇花',
  description: '给阳台的花花草草浇水',
  assigneeId: 'user_004',
  assigneeName: '爷爷',
  assigneeAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yeye',
  creatorName: '妈妈',
  dueDate: '2026-05-04',
  status: 'completed',
  priority: 'low',
  points: 10,
  completedAt: '2026-05-03T08:30:00Z',
  createdAt: '2026-04-30T10:00:00Z'
}, {
  id: 'task_004',
  title: '洗碗',
  description: '晚餐后收拾碗筷并清洗',
  assigneeId: 'user_002',
  assigneeName: '小明',
  assigneeAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming',
  creatorName: '爸爸',
  dueDate: '2026-05-03',
  status: 'completed',
  priority: 'medium',
  points: 15,
  completedAt: '2026-05-03T19:00:00Z',
  createdAt: '2026-05-03T12:00:00Z'
}, {
  id: 'task_005',
  title: '遛狗',
  description: '带家里的小狗出去散步30分钟',
  assigneeId: 'user_005',
  assigneeName: '奶奶',
  assigneeAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nainai',
  creatorName: '妈妈',
  dueDate: '2026-05-04',
  status: 'pending',
  priority: 'medium',
  points: 20,
  createdAt: '2026-05-02T15:00:00Z'
}, {
  id: 'task_006',
  title: '辅导作业',
  description: '检查并辅导孩子完成家庭作业',
  assigneeId: 'user_001',
  assigneeName: '爸爸',
  assigneeAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=baba',
  creatorName: '妈妈',
  dueDate: '2026-05-03',
  status: 'completed',
  priority: 'high',
  points: 25,
  completedAt: '2026-05-03T21:00:00Z',
  createdAt: '2026-05-03T08:00:00Z'
}];
const mockMembers = [{
  id: 'user_001',
  name: '爸爸',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=baba'
}, {
  id: 'user_002',
  name: '小明',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming'
}, {
  id: 'user_003',
  name: '妈妈',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mama'
}, {
  id: 'user_004',
  name: '爷爷',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yeye'
}, {
  id: 'user_005',
  name: '奶奶',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nainai'
}];
export default function FamilyTasks(props) {
  const {
    toast
  } = useToast();
  const {
    navigateBack,
    navigateTo
  } = props.$w.utils;
  const currentUser = props.$w.auth.currentUser;
  const [tasks, setTasks] = useState(mockTasks);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assigneeId: '',
    dueDate: '',
    priority: 'medium',
    points: 10
  });

  // 筛选任务
  const filteredTasks = tasks.filter(task => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // 统计
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  // 格式化日期
  const formatDate = dateStr => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  };

  // 获取状态颜色
  const getStatusColor = status => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-600';
      case 'in_progress':
        return 'bg-[#FF8B4E] text-white';
      case 'completed':
        return 'bg-[#9CCF4E] text-white';
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
        return '待处理';
      case 'in_progress':
        return '进行中';
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  };

  // 获取优先级颜色
  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-[#FF8B4E]';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  // 打开创建任务弹窗
  const handleCreateTask = () => {
    setSelectedTask(null);
    setTaskForm({
      title: '',
      description: '',
      assigneeId: '',
      dueDate: '',
      priority: 'medium',
      points: 10
    });
    setShowTaskDialog(true);
  };

  // 打开编辑任务弹窗
  const handleEditTask = task => {
    setSelectedTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      assigneeId: task.assigneeId,
      dueDate: task.dueDate,
      priority: task.priority,
      points: task.points
    });
    setShowTaskDialog(true);
  };

  // 查看任务详情
  const handleViewTask = task => {
    setSelectedTask(task);
    setShowDetailDialog(true);
  };

  // 提交任务表单
  const handleSubmitTask = () => {
    if (!taskForm.title.trim()) {
      toast({
        variant: 'destructive',
        title: '请输入任务标题'
      });
      return;
    }
    if (!taskForm.assigneeId) {
      toast({
        variant: 'destructive',
        title: '请选择执行人'
      });
      return;
    }
    if (!taskForm.dueDate) {
      toast({
        variant: 'destructive',
        title: '请选择截止日期'
      });
      return;
    }
    const member = mockMembers.find(m => m.id === taskForm.assigneeId);
    if (selectedTask) {
      // 编辑任务
      setTasks(tasks.map(t => t.id === selectedTask.id ? {
        ...t,
        ...taskForm,
        assigneeName: member.name,
        assigneeAvatar: member.avatar
      } : t));
      toast({
        title: '任务已更新'
      });
    } else {
      // 创建新任务
      const newTask = {
        id: `task_${Date.now()}`,
        ...taskForm,
        assigneeName: member.name,
        assigneeAvatar: member.avatar,
        creatorName: currentUser?.nickName || currentUser?.name || '我',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      setTasks([newTask, ...tasks]);
      toast({
        title: '任务已创建'
      });
    }
    setShowTaskDialog(false);
  };

  // 更新任务状态
  const handleUpdateStatus = (taskId, newStatus) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : null
        };
      }
      return t;
    }));
    toast({
      title: `任务已标记为${getStatusText(newStatus)}`
    });
  };

  // 删除任务
  const handleDeleteTask = taskId => {
    setTasks(tasks.filter(t => t.id !== taskId));
    toast({
      title: '任务已删除'
    });
  };
  return <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F0F1A] pb-20">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-[#E94560] to-[#FF8B4E] p-6 pt-12 rounded-b-3xl shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={navigateBack} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white" style={{
          fontFamily: 'Playfair Display'
        }}>
            家庭任务
          </h1>
          <button onClick={() => navigateTo({
          pageId: 'family-task-rewards',
          params: {}
        })} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
            <Gift className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/20 backdrop-blur rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{pendingCount}</p>
            <p className="text-xs text-white/80">待处理</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{inProgressCount}</p>
            <p className="text-xs text-white/80">进行中</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{completedCount}</p>
            <p className="text-xs text-white/80">已完成</p>
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="搜索任务..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-11" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl w-28 flex-shrink-0">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A2E] border-white/20">
              <SelectItem value="all" className="text-white">全部</SelectItem>
              <SelectItem value="pending" className="text-white">待处理</SelectItem>
              <SelectItem value="in_progress" className="text-white">进行中</SelectItem>
              <SelectItem value="completed" className="text-white">已完成</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl w-28 flex-shrink-0">
              <SelectValue placeholder="优先级" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A2E] border-white/20">
              <SelectItem value="all" className="text-white">全部</SelectItem>
              <SelectItem value="high" className="text-white">高</SelectItem>
              <SelectItem value="medium" className="text-white">中</SelectItem>
              <SelectItem value="low" className="text-white">低</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="px-4 space-y-3">
        {filteredTasks.length > 0 ? filteredTasks.map(task => <div key={task.id} onClick={() => handleViewTask(task)} className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition cursor-pointer">
              <div className="flex items-start gap-3">
                <button onClick={e => {
            e.stopPropagation();
            const nextStatus = task.status === 'pending' ? 'in_progress' : task.status === 'in_progress' ? 'completed' : 'pending';
            handleUpdateStatus(task.id, nextStatus);
          }} className="mt-1 flex-shrink-0">
                  {task.status === 'completed' ? <CheckCircle className="w-6 h-6 text-[#9CCF4E]" /> : task.status === 'in_progress' ? <Clock className="w-6 h-6 text-[#FF8B4E]" /> : <Circle className="w-6 h-6 text-gray-400" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold text-white truncate ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                      {task.title}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                  </div>
                  
                  {task.description && <p className="text-sm text-gray-400 truncate mb-2">{task.description}</p>}

                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <img src={task.assigneeAvatar} alt={task.assigneeName} className="w-4 h-4 rounded-full" />
                      <span>{task.assigneeName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                      <Star className="w-3 h-3" />
                      <span>{task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#FF8B4E]">
                      <Trophy className="w-3 h-3" />
                      <span>{task.points}分</span>
                    </div>
                  </div>
                </div>

                <button onClick={e => {
            e.stopPropagation();
            handleEditTask(task);
          }} className="p-2 hover:bg-white/10 rounded-lg transition">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>) : <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-500" />
            <p className="text-gray-400">暂无任务</p>
          </div>}
      </div>

      {/* 创建任务按钮 */}
      <button onClick={handleCreateTask} className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-[#E94560] to-[#FF8B4E] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* 任务表单弹窗 */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="bg-[#1A1A2E] border-white/20 text-white rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle style={{
            fontFamily: 'Playfair Display'
          }}>
              {selectedTask ? '编辑任务' : '创建任务'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedTask ? '修改任务信息' : '分配新的家庭任务'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">任务标题 *</label>
              <Input value={taskForm.title} onChange={e => setTaskForm({
              ...taskForm,
              title: e.target.value
            })} placeholder="请输入任务标题" className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 rounded-xl" />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">任务描述</label>
              <Input value={taskForm.description} onChange={e => setTaskForm({
              ...taskForm,
              description: e.target.value
            })} placeholder="请输入任务描述" className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 rounded-xl" />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">执行人 *</label>
              <Select value={taskForm.assigneeId} onValueChange={v => setTaskForm({
              ...taskForm,
              assigneeId: v
            })}>
                <SelectTrigger className="bg-white/10 border-white/20 rounded-xl">
                  <SelectValue placeholder="选择执行人" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A2E] border-white/20">
                  {mockMembers.map(member => <SelectItem key={member.id} value={member.id} className="text-white">
                      <div className="flex items-center gap-2">
                        <img src={member.avatar} alt={member.name} className="w-5 h-5 rounded-full" />
                        {member.name}
                      </div>
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">截止日期 *</label>
              <Input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({
              ...taskForm,
              dueDate: e.target.value
            })} className="bg-white/10 border-white/20 text-white rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">优先级</label>
                <Select value={taskForm.priority} onValueChange={v => setTaskForm({
                ...taskForm,
                priority: v
              })}>
                  <SelectTrigger className="bg-white/10 border-white/20 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A2E] border-white/20">
                    <SelectItem value="low" className="text-white">低</SelectItem>
                    <SelectItem value="medium" className="text-white">中</SelectItem>
                    <SelectItem value="high" className="text-white">高</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">奖励积分</label>
                <Input type="number" value={taskForm.points} onChange={e => setTaskForm({
                ...taskForm,
                points: parseInt(e.target.value) || 0
              })} className="bg-white/10 border-white/20 text-white rounded-xl" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDialog(false)} className="border-white/20 text-white hover:bg-white/10 rounded-xl">
              取消
            </Button>
            <Button onClick={handleSubmitTask} className="bg-gradient-to-r from-[#E94560] to-[#FF8B4E] rounded-xl">
              {selectedTask ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 任务详情弹窗 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-[#1A1A2E] border-white/20 text-white rounded-2xl max-w-md">
          {selectedTask && <>
              <DialogHeader>
                <DialogTitle style={{
              fontFamily: 'Playfair Display'
            }}>{selectedTask.title}</DialogTitle>
                <DialogDescription className="text-gray-400">{selectedTask.description || '暂无描述'}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                  <img src={selectedTask.assigneeAvatar} alt={selectedTask.assigneeName} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-400">执行人</p>
                    <p className="font-semibold text-white">{selectedTask.assigneeName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <p className="text-sm text-gray-400">截止日期</p>
                    <p className="font-semibold text-white">{formatDate(selectedTask.dueDate)}</p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-xl">
                    <p className="text-sm text-gray-400">奖励积分</p>
                    <p className="font-semibold text-[#FF8B4E]">{selectedTask.points}分</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {selectedTask.status !== 'completed' && <Button onClick={() => {
                handleUpdateStatus(selectedTask.id, 'completed');
                setShowDetailDialog(false);
              }} className="flex-1 bg-[#9CCF4E] hover:bg-[#8BC34A] rounded-xl">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      完成任务
                    </Button>}
                  <Button onClick={() => {
                setShowDetailDialog(false);
                handleEditTask(selectedTask);
              }} variant="outline" className="flex-1 border-white/20 rounded-xl">
                    编辑
                  </Button>
                </div>
              </div>
            </>}
        </DialogContent>
      </Dialog>
    </div>;
}