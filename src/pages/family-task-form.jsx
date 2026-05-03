// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { ChevronRight, Calendar, Clock, User, Star, AlertCircle, CheckCircle, Image } from 'lucide-react';

const {
  toast
} = useToast();
export default function FamilyTaskForm(props) {
  const {
    $w
  } = props;
  const {
    navigateTo,
    navigateBack
  } = $w.utils;
  const currentUser = $w.auth.currentUser;
  const taskId = $w.page.dataset.params?.taskId;
  const isEdit = !!taskId;
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    assigneeName: '',
    assigneeAvatar: '',
    points: 10,
    dueDate: '',
    dueTime: '',
    priority: 'medium',
    category: 'chore'
  });
  const [familyGroupId, setFamilyGroupId] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMemberPicker, setShowMemberPicker] = useState(false);

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

  // 获取任务详情（编辑模式）
  const fetchTaskDetail = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'family_tasks',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: taskId
              }
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
        const task = result.records[0];
        const dueDateTime = task.dueDate ? new Date(task.dueDate) : null;
        setFormData({
          title: task.title || '',
          description: task.description || '',
          assigneeId: task.assigneeId || '',
          assigneeName: task.assigneeName || '',
          assigneeAvatar: task.assigneeAvatar || '',
          points: task.points || 10,
          dueDate: dueDateTime ? dueDateTime.toISOString().split('T')[0] : '',
          dueTime: dueDateTime ? dueDateTime.toTimeString().slice(0, 5) : '',
          priority: task.priority || 'medium',
          category: task.category || 'chore'
        });
      }
    } catch (error) {
      console.error('获取任务详情失败:', error);
      toast({
        variant: 'destructive',
        title: '加载失败',
        description: '无法获取任务信息'
      });
    }
  };

  // 页面初始化
  useEffect(() => {
    const loadData = async () => {
      const groupId = await fetchFamilyGroup();
      if (groupId) {
        await fetchMembers(groupId);
      }
      if (isEdit) {
        await fetchTaskDetail();
      }
    };
    loadData();
  }, [taskId]);

  // 选择成员
  const handleSelectMember = member => {
    setFormData({
      ...formData,
      assigneeId: member.userId,
      assigneeName: member.nickName || member.name || '家庭成员',
      assigneeAvatar: member.avatarUrl || ''
    });
    setShowMemberPicker(false);
  };

  // 提交表单
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        variant: 'destructive',
        title: '验证失败',
        description: '请输入任务标题'
      });
      return;
    }
    if (!familyGroupId) {
      toast({
        variant: 'destructive',
        title: '保存失败',
        description: '未找到家庭组信息'
      });
      return;
    }
    setLoading(true);
    try {
      // 组合截止时间
      let dueDateTime = null;
      if (formData.dueDate) {
        dueDateTime = formData.dueTime ? `${formData.dueDate}T${formData.dueTime}:00` : `${formData.dueDate}T23:59:59`;
      }
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        assigneeId: formData.assigneeId || currentUser.userId,
        assigneeName: formData.assigneeName || currentUser.nickName || currentUser.name || '我',
        assigneeAvatar: formData.assigneeAvatar || currentUser.avatarUrl || '',
        creatorId: currentUser.userId,
        creatorName: currentUser.nickName || currentUser.name || '我',
        status: 'pending',
        points: parseInt(formData.points) || 0,
        dueDate: dueDateTime,
        priority: formData.priority,
        category: formData.category,
        familyGroupId: familyGroupId
      };
      if (isEdit) {
        await $w.cloud.callDataSource({
          dataSourceName: 'family_tasks',
          methodName: 'wedaUpdateV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: taskId
                }
              }
            },
            data: taskData
          }
        });
        toast({
          variant: 'default',
          title: '更新成功',
          description: '任务已更新'
        });
      } else {
        await $w.cloud.callDataSource({
          dataSourceName: 'family_tasks',
          methodName: 'wedaCreateV2',
          params: {
            data: taskData
          }
        });
        toast({
          variant: 'default',
          title: '创建成功',
          description: '新任务已创建'
        });
      }
      navigateBack();
    } catch (error) {
      console.error('保存任务失败:', error);
      toast({
        variant: 'destructive',
        title: '保存失败',
        description: error.message || '请稍后重试'
      });
    } finally {
      setLoading(false);
    }
  };

  // 积分选项
  const pointOptions = [5, 10, 15, 20, 30, 50, 100];
  return <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 pb-20">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-orange-400 to-amber-400 p-6 pt-12 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <button onClick={navigateBack} className="text-white">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <h1 className="text-xl font-bold text-white" style={{
          fontFamily: 'Quicksand'
        }}>
            {isEdit ? '编辑任务' : '创建任务'}
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* 任务标题 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{
          fontFamily: 'Quicksand'
        }}>
            任务标题 <span className="text-red-500">*</span>
          </label>
          <input type="text" value={formData.title} onChange={e => setFormData({
          ...formData,
          title: e.target.value
        })} placeholder="请输入任务标题" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all" style={{
          fontFamily: 'Nunito'
        }} />
        </div>

        {/* 任务描述 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{
          fontFamily: 'Quicksand'
        }}>
            任务描述
          </label>
          <textarea value={formData.description} onChange={e => setFormData({
          ...formData,
          description: e.target.value
        })} placeholder="请输入任务详细描述（可选）" rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none" style={{
          fontFamily: 'Nunito'
        }} />
        </div>

        {/* 分配给 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{
          fontFamily: 'Quicksand'
        }}>
            分配给
          </label>
          <button type="button" onClick={() => setShowMemberPicker(!showMemberPicker)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:border-orange-300 transition-all">
            <div className="flex items-center gap-3">
              {formData.assigneeAvatar ? <img src={formData.assigneeAvatar} alt="" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-orange-500" />
                </div>}
              <span style={{
              fontFamily: 'Nunito'
            }}>
                {formData.assigneeName || '选择家庭成员'}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* 成员选择器 */}
          {showMemberPicker && <div className="mt-3 p-3 bg-gray-50 rounded-xl space-y-2">
              {members.map(member => <button key={member._id} type="button" onClick={() => handleSelectMember(member)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-all">
                  <img src={member.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.userId}`} alt="" className="w-8 h-8 rounded-full object-cover" />
                  <span style={{
              fontFamily: 'Nunito'
            }}>{member.nickName || member.name || '家庭成员'}</span>
                  {formData.assigneeId === member.userId && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                </button>)}
            </div>}
        </div>

        {/* 截止日期和时间 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{
          fontFamily: 'Quicksand'
        }}>
            截止时间
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="date" value={formData.dueDate} onChange={e => setFormData({
              ...formData,
              dueDate: e.target.value
            })} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all" />
            </div>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="time" value={formData.dueTime} onChange={e => setFormData({
              ...formData,
              dueTime: e.target.value
            })} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all" />
            </div>
          </div>
        </div>

        {/* 奖励积分 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{
          fontFamily: 'Quicksand'
        }}>
            奖励积分
          </label>
          <div className="flex flex-wrap gap-2">
            {pointOptions.map(points => <button key={points} type="button" onClick={() => setFormData({
            ...formData,
            points
          })} className={`px-4 py-2 rounded-xl font-medium transition-all ${formData.points === points ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-orange-100'}`}>
                <Star className="w-4 h-4 inline mr-1" />
                {points}
              </button>)}
          </div>
        </div>

        {/* 优先级 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{
          fontFamily: 'Quicksand'
        }}>
            优先级
          </label>
          <div className="flex gap-2">
            {[{
            value: 'low',
            label: '低',
            color: 'bg-gray-100 text-gray-600'
          }, {
            value: 'medium',
            label: '中',
            color: 'bg-blue-100 text-blue-600'
          }, {
            value: 'high',
            label: '高',
            color: 'bg-red-100 text-red-600'
          }].map(priority => <button key={priority.value} type="button" onClick={() => setFormData({
            ...formData,
            priority: priority.value
          })} className={`flex-1 py-2 rounded-xl font-medium transition-all ${formData.priority === priority.value ? priority.color + ' shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {priority.label}
              </button>)}
          </div>
        </div>

        {/* 任务分类 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{
          fontFamily: 'Quicksand'
        }}>
            任务分类
          </label>
          <div className="flex flex-wrap gap-2">
            {[{
            value: 'chore',
            label: '家务'
          }, {
            value: 'study',
            label: '学习'
          }, {
            value: 'health',
            label: '健康'
          }, {
            value: 'social',
            label: '社交'
          }, {
            value: 'other',
            label: '其他'
          }].map(cat => <button key={cat.value} type="button" onClick={() => setFormData({
            ...formData,
            category: cat.value
          })} className={`px-4 py-2 rounded-xl font-medium transition-all ${formData.category === cat.value ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-orange-100'}`}>
                {cat.label}
              </button>)}
          </div>
        </div>

        {/* 提交按钮 */}
        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50" style={{
        fontFamily: 'Quicksand'
      }}>
          {loading ? '保存中...' : isEdit ? '保存修改' : '创建任务'}
        </button>
      </form>
    </div>;
}