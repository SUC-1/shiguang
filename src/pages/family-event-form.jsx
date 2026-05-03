// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button, Input, Textarea, Label, Badge, Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Calendar, Clock, MapPin, Users, Bell, Save, Loader2 } from 'lucide-react';

export default function FamilyEventForm(props) {
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;
  const {
    navigateTo,
    navigateBack
  } = $w.utils;
  const currentUser = $w.auth.currentUser || {};
  const params = $w.page.dataset.params || {};
  const eventId = params.eventId;
  const isEdit = !!eventId;
  const preselectedDate = params.date;
  const [loading, setLoading] = useState(false);
  const [familyGroupId, setFamilyGroupId] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'activity',
    startDate: preselectedDate || '',
    startTime: '09:00',
    endDate: preselectedDate || '',
    endTime: '10:00',
    location: '',
    isAllDay: false,
    reminderType: '15min',
    reminderEnabled: true
  });
  const eventTypes = [{
    value: 'activity',
    label: '家庭活动',
    color: 'bg-[#FF8B4E]'
  }, {
    value: 'birthday',
    label: '生日纪念',
    color: 'bg-pink-500'
  }, {
    value: 'holiday',
    label: '节日假期',
    color: 'bg-purple-500'
  }, {
    value: 'meeting',
    label: '家庭会议',
    color: 'bg-blue-500'
  }, {
    value: 'other',
    label: '其他',
    color: 'bg-gray-500'
  }];
  const reminderOptions = [{
    value: '0min',
    label: '准时提醒'
  }, {
    value: '5min',
    label: '提前5分钟'
  }, {
    value: '15min',
    label: '提前15分钟'
  }, {
    value: '30min',
    label: '提前30分钟'
  }, {
    value: '1hour',
    label: '提前1小时'
  }, {
    value: '1day',
    label: '提前1天'
  }, {
    value: '1week',
    label: '提前1周'
  }];

  // 获取家庭组和成员
  const fetchFamilyData = async () => {
    try {
      const membershipResult = await $w.cloud.callDataSource({
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
      if (membershipResult?.records?.length > 0) {
        const groupId = membershipResult.records[0].familyGroupId;
        setFamilyGroupId(groupId);

        // 获取家庭成员
        const membersResult = await $w.cloud.callDataSource({
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
        if (membersResult?.records) {
          setFamilyMembers(membersResult.records.map(m => ({
            id: m.userId,
            nickname: m.nickname || m.name || '未知用户',
            avatar: m.avatar,
            role: m.role
          })));
        }
      }
    } catch (error) {
      console.error('获取家庭数据失败:', error);
    }
  };

  // 获取事件详情（编辑模式）
  const fetchEventDetail = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'family_events',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: eventId
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      if (result) {
        const startTime = new Date(result.startTime);
        const endTime = new Date(result.endTime);
        setFormData({
          title: result.title || '',
          description: result.description || '',
          eventType: result.eventType || 'activity',
          startDate: startTime.toISOString().split('T')[0],
          startTime: startTime.toTimeString().slice(0, 5),
          endDate: endTime.toISOString().split('T')[0],
          endTime: endTime.toTimeString().slice(0, 5),
          location: result.location || '',
          isAllDay: result.isAllDay || false,
          reminderType: result.reminderType || '15min',
          reminderEnabled: result.reminderEnabled !== false
        });

        // 获取已选择的参与者
        const participantsResult = await $w.cloud.callDataSource({
          dataSourceName: 'family_event_participants',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                eventId: {
                  $eq: eventId
                }
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
        if (participantsResult?.records) {
          setSelectedMembers(participantsResult.records.map(p => p.userId));
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '获取事件详情失败',
        description: error.message
      });
    }
  };
  useEffect(() => {
    fetchFamilyData();
    if (isEdit) {
      fetchEventDetail();
    }
  }, [eventId]);

  // 处理表单提交
  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        variant: 'destructive',
        title: '请填写事件标题'
      });
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast({
        variant: 'destructive',
        title: '请选择开始和结束时间'
      });
      return;
    }
    if (!familyGroupId) {
      toast({
        variant: 'destructive',
        title: '未找到家庭组信息'
      });
      return;
    }
    setLoading(true);
    try {
      const startTime = new Date(`${formData.startDate}T${formData.isAllDay ? '00:00' : formData.startTime}`);
      const endTime = new Date(`${formData.endDate}T${formData.isAllDay ? '23:59' : formData.endTime}`);
      if (endTime <= startTime) {
        toast({
          variant: 'destructive',
          title: '结束时间必须晚于开始时间'
        });
        setLoading(false);
        return;
      }
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        eventType: formData.eventType,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        location: formData.location.trim(),
        isAllDay: formData.isAllDay,
        reminderType: formData.reminderType,
        reminderEnabled: formData.reminderEnabled,
        familyGroupId: familyGroupId,
        createdBy: currentUser.userId,
        createdByName: currentUser.nickName || currentUser.name || '未知用户'
      };
      let result;
      if (isEdit) {
        result = await $w.cloud.callDataSource({
          dataSourceName: 'family_events',
          methodName: 'wedaUpdateV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: eventId
                }
              }
            },
            data: eventData
          }
        });
      } else {
        result = await $w.cloud.callDataSource({
          dataSourceName: 'family_events',
          methodName: 'wedaCreateV2',
          params: {
            data: eventData
          }
        });
      }
      const newEventId = isEdit ? eventId : result?.id;

      // 保存参与者
      if (newEventId) {
        // 删除旧参与者
        if (isEdit) {
          const oldParticipants = await $w.cloud.callDataSource({
            dataSourceName: 'family_event_participants',
            methodName: 'wedaGetRecordsV2',
            params: {
              filter: {
                where: {
                  eventId: {
                    $eq: newEventId
                  }
                }
              },
              select: {
                $master: true
              },
              getCount: true,
              pageSize: 100,
              pageNumber: 1
            }
          });
          for (const p of oldParticipants?.records || []) {
            await $w.cloud.callDataSource({
              dataSourceName: 'family_event_participants',
              methodName: 'wedaDeleteV2',
              params: {
                filter: {
                  where: {
                    _id: {
                      $eq: p._id
                    }
                  }
                }
              }
            });
          }
        }

        // 添加新参与者
        for (const memberId of selectedMembers) {
          const member = familyMembers.find(m => m.id === memberId);
          await $w.cloud.callDataSource({
            dataSourceName: 'family_event_participants',
            methodName: 'wedaCreateV2',
            params: {
              data: {
                eventId: newEventId,
                userId: memberId,
                nickname: member?.nickname || '未知用户',
                avatar: member?.avatar || '',
                status: 'pending'
              }
            }
          });
        }

        // 创建提醒
        if (formData.reminderEnabled) {
          await createReminder(newEventId, startTime);
        }
      }
      toast({
        variant: 'default',
        title: isEdit ? '事件更新成功' : '事件创建成功'
      });
      navigateBack();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: isEdit ? '更新失败' : '创建失败',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // 创建提醒
  const createReminder = async (eventId, eventTime) => {
    try {
      const reminderMinutes = {
        '0min': 0,
        '5min': 5,
        '15min': 15,
        '30min': 30,
        '1hour': 60,
        '1day': 1440,
        '1week': 10080
      };
      const reminderTime = new Date(eventTime);
      reminderTime.setMinutes(reminderTime.getMinutes() - (reminderMinutes[formData.reminderType] || 15));
      await $w.cloud.callDataSource({
        dataSourceName: 'family_event_reminders',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            eventId: eventId,
            userId: currentUser.userId,
            reminderTime: reminderTime.toISOString(),
            reminderType: formData.reminderType,
            isSent: false
          }
        }
      });
    } catch (error) {
      console.error('创建提醒失败:', error);
    }
  };

  // 切换成员选择
  const toggleMember = memberId => {
    setSelectedMembers(prev => prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]);
  };
  return <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FFF5F0] to-[#FCEEB8] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF8B4E] to-[#FF6B35] rounded-b-[2rem] shadow-lg p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-white hover:bg-white/20 p-2" onClick={navigateBack}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEdit ? '编辑事件' : '新建事件'}
            </h1>
            <p className="text-white/80 text-sm">安排家庭日程</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 mt-6 space-y-6">
        {/* 事件标题 */}
        <div className="space-y-2">
          <Label className="text-[#FF6B35] font-bold flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            事件标题 *
          </Label>
          <Input value={formData.title} onChange={e => setFormData({
          ...formData,
          title: e.target.value
        })} placeholder="请输入事件标题" className="h-12 rounded-xl border-2 border-[#FCEEB8] focus:border-[#FF8B4E] bg-white" />
        </div>

        {/* 事件类型 */}
        <div className="space-y-2">
          <Label className="text-[#FF6B35] font-bold">事件类型</Label>
          <div className="flex flex-wrap gap-2">
            {eventTypes.map(type => <button key={type.value} onClick={() => setFormData({
            ...formData,
            eventType: type.value
          })} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${formData.eventType === type.value ? `${type.color} text-white shadow-lg` : 'bg-white text-[#8B7355] border-2 border-[#FCEEB8]'}`}>
                {type.label}
              </button>)}
          </div>
        </div>

        {/* 全天事件 */}
        <div className="flex items-center gap-3 p-4 bg-white rounded-xl">
          <Checkbox id="allDay" checked={formData.isAllDay} onCheckedChange={checked => setFormData({
          ...formData,
          isAllDay: checked
        })} />
          <Label htmlFor="allDay" className="text-[#FF6B35] font-semibold cursor-pointer">
            全天事件
          </Label>
        </div>

        {/* 时间设置 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[#FF6B35] font-bold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              开始日期
            </Label>
            <Input type="date" value={formData.startDate} onChange={e => setFormData({
            ...formData,
            startDate: e.target.value
          })} className="h-12 rounded-xl border-2 border-[#FCEEB8] focus:border-[#FF8B4E] bg-white" />
          </div>
          {!formData.isAllDay && <div className="space-y-2">
              <Label className="text-[#FF6B35] font-bold">开始时间</Label>
              <Input type="time" value={formData.startTime} onChange={e => setFormData({
            ...formData,
            startTime: e.target.value
          })} className="h-12 rounded-xl border-2 border-[#FCEEB8] focus:border-[#FF8B4E] bg-white" />
            </div>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[#FF6B35] font-bold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              结束日期
            </Label>
            <Input type="date" value={formData.endDate} onChange={e => setFormData({
            ...formData,
            endDate: e.target.value
          })} className="h-12 rounded-xl border-2 border-[#FCEEB8] focus:border-[#FF8B4E] bg-white" />
          </div>
          {!formData.isAllDay && <div className="space-y-2">
              <Label className="text-[#FF6B35] font-bold">结束时间</Label>
              <Input type="time" value={formData.endTime} onChange={e => setFormData({
            ...formData,
            endTime: e.target.value
          })} className="h-12 rounded-xl border-2 border-[#FCEEB8] focus:border-[#FF8B4E] bg-white" />
            </div>}
        </div>

        {/* 地点 */}
        <div className="space-y-2">
          <Label className="text-[#FF6B35] font-bold flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            地点
          </Label>
          <Input value={formData.location} onChange={e => setFormData({
          ...formData,
          location: e.target.value
        })} placeholder="请输入事件地点（选填）" className="h-12 rounded-xl border-2 border-[#FCEEB8] focus:border-[#FF8B4E] bg-white" />
        </div>

        {/* 描述 */}
        <div className="space-y-2">
          <Label className="text-[#FF6B35] font-bold">事件描述</Label>
          <Textarea value={formData.description} onChange={e => setFormData({
          ...formData,
          description: e.target.value
        })} placeholder="请输入事件描述（选填）" rows={4} className="rounded-xl border-2 border-[#FCEEB8] focus:border-[#FF8B4E] bg-white resize-none" />
        </div>

        {/* 提醒设置 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox id="reminder" checked={formData.reminderEnabled} onCheckedChange={checked => setFormData({
            ...formData,
            reminderEnabled: checked
          })} />
            <Label htmlFor="reminder" className="text-[#FF6B35] font-bold flex items-center gap-2 cursor-pointer">
              <Bell className="w-4 h-4" />
              开启提醒
            </Label>
          </div>
          {formData.reminderEnabled && <Select value={formData.reminderType} onValueChange={value => setFormData({
          ...formData,
          reminderType: value
        })}>
              <SelectTrigger className="h-12 rounded-xl border-2 border-[#FCEEB8] focus:border-[#FF8B4E] bg-white">
                <SelectValue placeholder="选择提醒时间" />
              </SelectTrigger>
              <SelectContent>
                {reminderOptions.map(option => <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>}
        </div>

        {/* 参与成员 */}
        <div className="space-y-3">
          <Label className="text-[#FF6B35] font-bold flex items-center gap-2">
            <Users className="w-4 h-4" />
            参与成员
          </Label>
          <div className="grid grid-cols-4 gap-3">
            {familyMembers.map(member => <button key={member.id} onClick={() => toggleMember(member.id)} className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${selectedMembers.includes(member.id) ? 'bg-[#FF8B4E] text-white' : 'bg-white text-[#8B7355]'}`}>
                <img src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} alt={member.nickname} className="w-12 h-12 rounded-full object-cover border-2 border-white" />
                <span className="text-xs font-semibold truncate w-full text-center">
                  {member.nickname}
                </span>
              </button>)}
          </div>
          {selectedMembers.length > 0 && <p className="text-sm text-[#8B7355] text-center">
              已选择 {selectedMembers.length} 位成员
            </p>}
        </div>

        {/* Submit Button */}
        <Button className="w-full h-14 bg-gradient-to-r from-[#FF8B4E] to-[#FF6B35] text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all" onClick={handleSubmit} disabled={loading}>
          {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Save className="w-6 h-6 mr-2" />}
          {isEdit ? '保存修改' : '创建事件'}
        </Button>
      </div>
    </div>;
}