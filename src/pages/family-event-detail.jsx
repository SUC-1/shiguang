// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button, Card, CardContent, Badge, Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Calendar, Clock, MapPin, Users, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Bell, Share2, Loader2 } from 'lucide-react';

export default function FamilyEventDetail(props) {
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
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isParticipant, setIsParticipant] = useState(false);
  const [userResponse, setUserResponse] = useState(null);

  // 获取事件详情
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
        setEvent({
          id: result._id,
          title: result.title,
          description: result.description,
          eventType: result.eventType,
          startTime: result.startTime,
          endTime: result.endTime,
          location: result.location,
          isAllDay: result.isAllDay,
          reminderType: result.reminderType,
          reminderEnabled: result.reminderEnabled,
          createdBy: result.createdBy,
          createdByName: result.createdByName,
          createdAt: result.createdAt
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '获取事件详情失败',
        description: error.message
      });
    }
  };

  // 获取参与者列表
  const fetchParticipants = async () => {
    try {
      const result = await $w.cloud.callDataSource({
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
          orderBy: [{
            createdAt: 'asc'
          }],
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 50,
          pageNumber: 1
        }
      });
      if (result?.records) {
        const participantList = result.records.map(p => ({
          id: p._id,
          userId: p.userId,
          nickname: p.nickname,
          avatar: p.avatar,
          status: p.status,
          response: p.response,
          respondedAt: p.respondedAt
        }));
        setParticipants(participantList);

        // 检查当前用户是否已参与
        const userParticipant = participantList.find(p => p.userId === currentUser.userId);
        if (userParticipant) {
          setIsParticipant(true);
          setUserResponse(userParticipant.response);
        }
      }
    } catch (error) {
      console.error('获取参与者失败:', error);
    }
  };

  // 响应事件邀请
  const handleResponse = async response => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'family_event_participants',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                eventId: {
                  $eq: eventId
                }
              }, {
                userId: {
                  $eq: currentUser.userId
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
        await $w.cloud.callDataSource({
          dataSourceName: 'family_event_participants',
          methodName: 'wedaUpdateV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: result.records[0]._id
                }
              }
            },
            data: {
              response: response,
              respondedAt: new Date().toISOString(),
              status: response === 'accepted' ? 'confirmed' : 'declined'
            }
          }
        });
      } else {
        await $w.cloud.callDataSource({
          dataSourceName: 'family_event_participants',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              eventId: eventId,
              userId: currentUser.userId,
              nickname: currentUser.nickName || currentUser.name || '未知用户',
              avatar: currentUser.avatarUrl || '',
              status: response === 'accepted' ? 'confirmed' : 'declined',
              response: response,
              respondedAt: new Date().toISOString()
            }
          }
        });
      }
      setUserResponse(response);
      toast({
        variant: 'default',
        title: response === 'accepted' ? '已接受邀请' : '已拒绝邀请'
      });
      await fetchParticipants();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '操作失败',
        description: error.message
      });
    }
  };

  // 删除事件
  const handleDelete = async () => {
    if (!confirm('确定要删除这个事件吗？')) return;
    try {
      setLoading(true);

      // 删除参与者
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
          pageSize: 100,
          pageNumber: 1
        }
      });
      for (const p of participantsResult?.records || []) {
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

      // 删除提醒
      const remindersResult = await $w.cloud.callDataSource({
        dataSourceName: 'family_event_reminders',
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
          pageSize: 100,
          pageNumber: 1
        }
      });
      for (const r of remindersResult?.records || []) {
        await $w.cloud.callDataSource({
          dataSourceName: 'family_event_reminders',
          methodName: 'wedaDeleteV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: r._id
                }
              }
            }
          }
        });
      }

      // 删除事件
      await $w.cloud.callDataSource({
        dataSourceName: 'family_events',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: eventId
              }
            }
          }
        }
      });
      toast({
        variant: 'default',
        title: '事件已删除'
      });
      navigateBack();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '删除失败',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!eventId) {
      navigateBack();
      return;
    }
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchEventDetail(), fetchParticipants()]);
      setLoading(false);
    };
    loadData();
  }, [eventId]);
  const getEventTypeLabel = type => {
    const types = {
      activity: {
        label: '家庭活动',
        color: 'bg-[#FF8B4E]'
      },
      birthday: {
        label: '生日纪念',
        color: 'bg-pink-500'
      },
      holiday: {
        label: '节日假期',
        color: 'bg-purple-500'
      },
      meeting: {
        label: '家庭会议',
        color: 'bg-blue-500'
      },
      other: {
        label: '其他',
        color: 'bg-gray-500'
      }
    };
    return types[type] || types.other;
  };
  const getResponseStatus = response => {
    switch (response) {
      case 'accepted':
        return {
          label: '已接受',
          color: 'bg-[#9CCF4E]',
          icon: CheckCircle
        };
      case 'declined':
        return {
          label: '已拒绝',
          color: 'bg-[#E85A42]',
          icon: XCircle
        };
      case 'pending':
      default:
        return {
          label: '待回复',
          color: 'bg-[#FF8B4E]',
          icon: AlertCircle
        };
    }
  };
  const formatDateTime = (dateString, isAllDay) => {
    const date = new Date(dateString);
    if (isAllDay) {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FFF5F0] to-[#FCEEB8] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#FF8B4E] animate-spin" />
      </div>;
  }
  if (!event) {
    return <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FFF5F0] to-[#FCEEB8] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-[#E85A42] mx-auto mb-4" />
          <p className="text-[#8B7355] font-semibold">事件不存在或已被删除</p>
          <Button className="mt-4 bg-[#FF8B4E] text-white" onClick={navigateBack}>
            返回
          </Button>
        </div>
      </div>;
  }
  const eventType = getEventTypeLabel(event.eventType);
  const acceptedCount = participants.filter(p => p.response === 'accepted').length;
  const declinedCount = participants.filter(p => p.response === 'declined').length;
  const pendingCount = participants.filter(p => !p.response || p.response === 'pending').length;
  return <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FFF5F0] to-[#FCEEB8] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF8B4E] to-[#FF6B35] rounded-b-[2rem] shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-white hover:bg-white/20 p-2" onClick={navigateBack}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">事件详情</h1>
              <p className="text-white/80 text-sm">查看日程安排</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="text-white hover:bg-white/20 p-2" onClick={() => navigateTo({
            pageId: 'family-event-form',
            params: {
              eventId: eventId
            }
          })}>
              <Edit className="w-5 h-5" />
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/20 p-2" onClick={handleDelete}>
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Event Type Badge */}
        <div className="flex items-center gap-3">
          <Badge className={`${eventType.color} text-white px-4 py-2 text-sm`}>
            {eventType.label}
          </Badge>
          {event.reminderEnabled && <div className="flex items-center gap-1 text-white/80 text-sm">
              <Bell className="w-4 h-4" />
              <span>已设置提醒</span>
            </div>}
        </div>
      </div>

      {/* Event Info */}
      <div className="px-4 mt-6 space-y-6">
        {/* Title */}
        <Card className="bg-white rounded-3xl shadow-xl border-0 overflow-hidden">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-[#FF6B35] mb-4">{event.title}</h2>
            {event.description && <p className="text-[#8B7355] leading-relaxed">{event.description}</p>}
          </CardContent>
        </Card>

        {/* Time & Location */}
        <Card className="bg-white rounded-3xl shadow-xl border-0 overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FCEEB8] flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-[#FF8B4E]" />
              </div>
              <div>
                <p className="text-sm text-[#8B7355] mb-1">开始时间</p>
                <p className="font-bold text-[#FF6B35]">
                  {formatDateTime(event.startTime, event.isAllDay)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FCEEB8] flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-[#FF8B4E]" />
              </div>
              <div>
                <p className="text-sm text-[#8B7355] mb-1">结束时间</p>
                <p className="font-bold text-[#FF6B35]">
                  {formatDateTime(event.endTime, event.isAllDay)}
                </p>
              </div>
            </div>

            {event.location && <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FCEEB8] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-[#FF8B4E]" />
                </div>
                <div>
                  <p className="text-sm text-[#8B7355] mb-1">地点</p>
                  <p className="font-bold text-[#FF6B35]">{event.location}</p>
                </div>
              </div>}
          </CardContent>
        </Card>

        {/* Response Actions */}
        {!userResponse && <Card className="bg-white rounded-3xl shadow-xl border-0 overflow-hidden">
            <CardContent className="p-6">
              <p className="text-lg font-bold text-[#FF6B35] mb-4 text-center">
                是否参加此事件？
              </p>
              <div className="flex gap-4">
                <Button className="flex-1 h-14 bg-[#E85A42] text-white rounded-xl font-bold" onClick={() => handleResponse('declined')}>
                  <XCircle className="w-5 h-5 mr-2" />
                  不参加
                </Button>
                <Button className="flex-1 h-14 bg-[#9CCF4E] text-white rounded-xl font-bold" onClick={() => handleResponse('accepted')}>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  参加
                </Button>
              </div>
            </CardContent>
          </Card>}

        {userResponse && <Card className={`rounded-3xl shadow-xl border-0 overflow-hidden ${userResponse === 'accepted' ? 'bg-[#9CCF4E]' : 'bg-[#E85A42]'}`}>
            <CardContent className="p-6 text-center text-white">
              {userResponse === 'accepted' ? <>
                  <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-xl font-bold">您已确认参加</p>
                </> : <>
                  <XCircle className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-xl font-bold">您已拒绝参加</p>
                </>}
            </CardContent>
          </Card>}

        {/* Participants */}
        <Card className="bg-white rounded-3xl shadow-xl border-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#FF8B4E]" />
                <h3 className="text-lg font-bold text-[#FF6B35]">参与成员</h3>
              </div>
              <div className="flex gap-2 text-sm">
                <Badge className="bg-[#9CCF4E] text-white">{acceptedCount} 接受</Badge>
                <Badge className="bg-[#E85A42] text-white">{declinedCount} 拒绝</Badge>
                <Badge className="bg-[#FF8B4E] text-white">{pendingCount} 待回复</Badge>
              </div>
            </div>

            <div className="space-y-3">
              {participants.map(participant => {
              const status = getResponseStatus(participant.response);
              const StatusIcon = status.icon;
              return <div key={participant.id} className="flex items-center gap-3 p-3 bg-[#FCEEB8] rounded-xl">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback className="bg-[#FF8B4E] text-white">
                        {participant.nickname?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-[#FF6B35]">{participant.nickname}</p>
                      {participant.respondedAt && <p className="text-xs text-[#8B7355]">
                          {new Date(participant.respondedAt).toLocaleString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} 回复
                        </p>}
                    </div>
                    <Badge className={`${status.color} text-white flex items-center gap-1`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </Badge>
                  </div>;
            })}

              {participants.length === 0 && <p className="text-center text-[#8B7355] py-4">暂无参与成员</p>}
            </div>
          </CardContent>
        </Card>

        {/* Creator Info */}
        <Card className="bg-white rounded-3xl shadow-xl border-0 overflow-hidden">
          <CardContent className="p-6">
            <p className="text-sm text-[#8B7355] mb-2">创建者</p>
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-[#FF8B4E] text-white">
                  {event.createdByName?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-[#FF6B35]">{event.createdByName}</p>
                <p className="text-xs text-[#8B7355]">
                  {new Date(event.createdAt).toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}