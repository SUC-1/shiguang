// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { useToast, Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
// @ts-ignore;
import { Calendar, Clock, Star, Plus, ArrowLeft, Users, Gift, Repeat } from 'lucide-react';

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
const taskTemplates = [{
  title: '洗碗',
  description: '晚餐后收拾碗筷并清洗',
  points: 15,
  priority: 'medium'
}, {
  title: '整理房间',
  description: '收拾卧室，保持整洁',
  points: 20,
  priority: 'medium'
}, {
  title: '倒垃圾',
  description: '将家里垃圾倒掉',
  points: 10,
  priority: 'low'
}, {
  title: '浇花',
  description: '给植物浇水',
  points: 10,
  priority: 'low'
}, {
  title: '遛狗',
  description: '带宠物外出散步',
  points: 20,
  priority: 'medium'
}, {
  title: '辅导作业',
  description: '检查并辅导孩子完成作业',
  points: 25,
  priority: 'high'
}];
export default function FamilyTaskAssign(props) {
  const {
    toast
  } = useToast();
  const {
    navigateBack,
    navigateTo
  } = props.$w.utils;
  const currentUser = props.$w.auth.currentUser;
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assigneeId: '',
    dueDate: '',
    dueTime: '',
    priority: 'medium',
    points: 10,
    isRecurring: false,
    recurringType: 'weekly',
    recurringDays: []
  });
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  // 选择模板
  const handleSelectTemplate = template => {
    setTaskForm({
      ...taskForm,
      title: template.title,
      description: template.description,
      points: template.points,
      priority: template.priority
    });
    setShowTemplateDialog(false);
  };

  // 提交任务
  const handleSubmit = () => {
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
    toast({
      title: taskForm.isRecurring ? ' recurring任务已创建' : '任务已分配',
      description: `分配给 ${member.name}，奖励 ${taskForm.points} 积分`
    });

    // 返回任务列表
    setTimeout(() => {
      navigateTo({
        pageId: 'family-tasks',
        params: {}
      });
    }, 1000);
  };
  const priorityOptions = [{
    value: 'low',
    label: '低',
    color: 'text-green-400'
  }, {
    value: 'medium',
    label: '中',
    color: 'text-[#FF8B4E]'
  }, {
    value: 'high',
    label: '高',
    color: 'text-red-400'
  }];
  const recurringOptions = [{
    value: 'daily',
    label: '每天'
  }, {
    value: 'weekly',
    label: '每周'
  }, {
    value: 'monthly',
    label: '每月'
  }];
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
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
            分配任务
          </h1>
          <button onClick={() => setShowTemplateDialog(true)} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
            <Gift className="w-5 h-5 text-white" />
          </button>
        </div>
        <p className="text-white/80 text-sm">为家庭成员分配任务</p>
      </div>

      <div className="p-4 space-y-4">
        {/* 快速模板 */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">快速选择</h3>
            <button onClick={() => setShowTemplateDialog(true)} className="text-[#FF8B4E] text-sm">
              查看全部
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {taskTemplates.slice(0, 4).map((template, index) => <button key={index} onClick={() => handleSelectTemplate(template)} className="flex-shrink-0 px-3 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition">
                <p className="text-white text-sm font-medium">{template.title}</p>
                <p className="text-[#FF8B4E] text-xs">{template.points}分</p>
              </button>)}
          </div>
        </div>

        {/* 任务表单 */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">任务标题 *</label>
            <Input value={taskForm.title} onChange={e => setTaskForm({
            ...taskForm,
            title: e.target.value
          })} placeholder="请输入任务标题" className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 rounded-xl h-11" />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">任务描述</label>
            <Input value={taskForm.description} onChange={e => setTaskForm({
            ...taskForm,
            description: e.target.value
          })} placeholder="请输入任务描述（可选）" className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 rounded-xl h-11" />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">执行人 *</label>
            <Select value={taskForm.assigneeId} onValueChange={v => setTaskForm({
            ...taskForm,
            assigneeId: v
          })}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl h-11">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">截止日期 *</label>
              <Input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({
              ...taskForm,
              dueDate: e.target.value
            })} className="bg-white/10 border-white/20 text-white rounded-xl h-11" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">截止时间</label>
              <Input type="time" value={taskForm.dueTime} onChange={e => setTaskForm({
              ...taskForm,
              dueTime: e.target.value
            })} className="bg-white/10 border-white/20 text-white rounded-xl h-11" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">优先级</label>
              <Select value={taskForm.priority} onValueChange={v => setTaskForm({
              ...taskForm,
              priority: v
            })}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A2E] border-white/20">
                  {priorityOptions.map(opt => <SelectItem key={opt.value} value={opt.value} className="text-white">
                      <span className={opt.color}>{opt.label}</span>
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">奖励积分</label>
              <Input type="number" value={taskForm.points} onChange={e => setTaskForm({
              ...taskForm,
              points: parseInt(e.target.value) || 0
            })} className="bg-white/10 border-white/20 text-white rounded-xl h-11" />
            </div>
          </div>

          {/* 重复任务 */}
          <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-[#FF8B4E]" />
              <span className="text-white text-sm">重复任务</span>
            </div>
            <button onClick={() => setTaskForm({
            ...taskForm,
            isRecurring: !taskForm.isRecurring
          })} className={`w-12 h-6 rounded-full transition ${taskForm.isRecurring ? 'bg-[#9CCF4E]' : 'bg-gray-600'}`}>
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${taskForm.isRecurring ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {taskForm.isRecurring && <div className="space-y-3">
              <Select value={taskForm.recurringType} onValueChange={v => setTaskForm({
            ...taskForm,
            recurringType: v
          })}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A2E] border-white/20">
                  {recurringOptions.map(opt => <SelectItem key={opt.value} value={opt.value} className="text-white">
                      {opt.label}
                    </SelectItem>)}
                </SelectContent>
              </Select>

              {taskForm.recurringType === 'weekly' && <div className="flex gap-2 justify-between">
                  {weekDays.map((day, index) => <button key={index} onClick={() => {
              const days = taskForm.recurringDays.includes(index) ? taskForm.recurringDays.filter(d => d !== index) : [...taskForm.recurringDays, index];
              setTaskForm({
                ...taskForm,
                recurringDays: days
              });
            }} className={`w-9 h-9 rounded-full text-sm transition ${taskForm.recurringDays.includes(index) ? 'bg-[#FF8B4E] text-white' : 'bg-white/10 text-gray-400'}`}>
                      {day}
                    </button>)}
                </div>}
            </div>}
        </div>

        {/* 提交按钮 */}
        <Button onClick={handleSubmit} className="w-full h-14 bg-gradient-to-r from-[#E94560] to-[#FF8B4E] rounded-xl font-bold text-lg">
          <Plus className="w-5 h-5 mr-2" />
          分配任务
        </Button>
      </div>

      {/* 模板选择弹窗 */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="bg-[#1A1A2E] border-white/20 text-white rounded-2xl max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{
            fontFamily: 'Playfair Display'
          }}>选择任务模板</DialogTitle>
            <DialogDescription className="text-gray-400">
              选择一个预设任务快速创建
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            {taskTemplates.map((template, index) => <button key={index} onClick={() => handleSelectTemplate(template)} className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-xl text-left transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{template.title}</p>
                    <p className="text-sm text-gray-400">{template.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#FF8B4E] font-bold">{template.points}分</p>
                    <p className={`text-xs ${template.priority === 'high' ? 'text-red-400' : template.priority === 'medium' ? 'text-[#FF8B4E]' : 'text-green-400'}`}>
                      {template.priority === 'high' ? '高优先级' : template.priority === 'medium' ? '中优先级' : '低优先级'}
                    </p>
                  </div>
                </div>
              </button>)}
          </div>
        </DialogContent>
      </Dialog>
    </div>;
}