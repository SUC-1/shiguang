// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Calendar, MapPin, Users, Clock, ArrowLeft, Image as ImageIcon, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';

import { TabBar } from '@/components/TabBar';
export default function FamilyActivityDetail(props) {
  const {
    toast
  } = useToast();
  const navigateTo = props.$w.utils.navigateTo;
  const navigateBack = props.$w.utils.navigateBack;
  const currentUser = props.$w.auth.currentUser || {};
  const activityId = props.$w.page.dataset.params?.id;
  const [activity, setActivity] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('activities');

  // 获取活动详情
  const fetchActivityDetail = async () => {
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'family_activities',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: activityId
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      if (result) {
        setActivity({
          id: result._id,
          name: result.name,
          description: result.description,
          coverImage: result.coverImage,
          startTime: result.startTime,
          endTime: result.endTime,
          location: result.location,
          maxParticipants: result.maxParticipants,
          status: result.status,
          createdBy: result.createdBy
        });
      }
    } catch (error) {
      console.error('获取活动详情失败:', error);
      toast({
        variant: 'destructive',
        title: '获取活动详情失败',
        description: error.message || '请稍后重试'
      });
    }
  };

  // 获取参与者列表
  const fetchParticipants = async () => {
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'family_activity_participants',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                activityId: {
                  $eq: activityId
                }
              }, {
                status: {
                  $in: ['registered', 'attended']
                }
              }]
            }
          },
          orderBy: [{
            registeredAt: 'asc'
          }],
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 100,
          pageNumber: 1
        }
      });
      if (result && result.records) {
        const participantList = result.records.map(p => ({
          id: p._id,
          userId: p.userId,
          nickname: p.nickname,
          avatar: p.avatar,
          status: p.status,
          registeredAt: p.registeredAt,
          notes: p.notes
        }));
        setParticipants(participantList);

        // 检查当前用户是否已报名
        const userRegistered = participantList.some(p => p.userId === currentUser.userId);
        setIsRegistered(userRegistered);
      }
    } catch (error) {
      console.error('获取参与者列表失败:', error);
    }
  };

  // 获取活动照片
  const fetchPhotos = async () => {
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'family_activity_photos',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              activityId: {
                $eq: activityId
              }
            }
          },
          orderBy: [{
            uploadedAt: 'desc'
          }],
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 50,
          pageNumber: 1
        }
      });
      if (result && result.records) {
        setPhotos(result.records.map(p => ({
          id: p._id,
          url: p.url,
          thumbnailUrl: p.thumbnailUrl,
          description: p.description,
          uploaderNickname: p.uploaderNickname,
          uploadedAt: p.uploadedAt
        })));
      }
    } catch (error) {
      console.error('获取活动照片失败:', error);
    }
  };

  // 获取签到列表
  const fetchCheckins = async () => {
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'family_activity_checkins',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              activityId: {
                $eq: activityId
              }
            }
          },
          orderBy: [{
            checkinTime: 'asc'
          }],
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 100,
          pageNumber: 1
        }
      });
      if (result && result.records) {
        const checkinList = result.records.map(c => ({
          id: c._id,
          userId: c.userId,
          nickname: c.nickname,
          avatar: c.avatar,
          checkinTime: c.checkinTime,
          checkinLocation: c.checkinLocation,
          checkinPhoto: c.checkinPhoto,
          notes: c.notes
        }));
        setCheckins(checkinList);

        // 检查当前用户是否已签到
        const userCheckedIn = checkinList.some(c => c.userId === currentUser.userId);
        setHasCheckedIn(userCheckedIn);
      }
    } catch (error) {
      console.error('获取签到列表失败:', error);
    }
  };

  // 活动签到
  const handleCheckin = async () => {
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'family_activity_checkins',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            activityId: activityId,
            userId: currentUser.userId,
            nickname: currentUser.nickName || currentUser.name || '匿名用户',
            avatar: currentUser.avatarUrl || '',
            checkinTime: new Date().toISOString(),
            checkinLocation: '',
            checkinPhoto: '',
            notes: ''
          }
        }
      });
      if (result && result.id) {
        toast({
          variant: 'default',
          title: '签到成功',
          description: '您已成功签到'
        });
        setHasCheckedIn(true);
        await fetchCheckins();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '签到失败',
        description: error.message || '请稍后重试'
      });
    }
  };

  // 报名参加活动
  const handleRegister = async () => {
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'family_activity_participants',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            activityId: activityId,
            userId: currentUser.userId,
            nickname: currentUser.nickName || currentUser.name || '匿名用户',
            avatar: currentUser.avatarUrl || '',
            status: 'registered',
            registeredAt: new Date().toISOString(),
            notes: ''
          }
        }
      });
      if (result && result.id) {
        toast({
          variant: 'default',
          title: '报名成功',
          description: '您已成功报名参加此活动'
        });
        setIsRegistered(true);
        await fetchParticipants();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '报名失败',
        description: error.message || '请稍后重试'
      });
    }
  };

  // 取消报名
  const handleCancelRegistration = async () => {
    try {
      // 查找当前用户的报名记录
      const participant = participants.find(p => p.userId === currentUser.userId);
      if (!participant) return;
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'family_activity_participants',
        methodName: 'wedaUpdateV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: participant.id
              }
            }
          },
          data: {
            status: 'cancelled'
          }
        }
      });
      if (result) {
        toast({
          variant: 'default',
          title: '取消成功',
          description: '您已取消报名参加此活动'
        });
        setIsRegistered(false);
        await fetchParticipants();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '取消失败',
        description: error.message || '请稍后重试'
      });
    }
  };

  // 页面初始化
  useEffect(() => {
    if (!activityId) {
      navigateBack();
      return;
    }
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchActivityDetail(), fetchParticipants(), fetchPhotos(), fetchCheckins()]);
      setLoading(false);
    };
    loadData();
  }, [activityId]);

  // 格式化日期
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  // 格式化时间
  const formatTime = dateString => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取状态样式
  const getStatusStyle = status => {
    switch (status) {
      case 'ongoing':
        return 'bg-[#9CCF4E] text-white';
      case 'planning':
        return 'bg-[#FF8B4E] text-white';
      case 'completed':
        return 'bg-[#8B7355] text-white';
      case 'cancelled':
        return 'bg-[#E85A42] text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  // 获取状态文本
  const getStatusText = status => {
    switch (status) {
      case 'ongoing':
        return '进行中';
      case 'planning':
        return '筹备中';
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
      default:
        return '未知';
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FFEDD5] to-[#FFF8E7] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF8B4E]" />
      </div>
    );
  }
  if (!activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FFEDD5] to-[#FFF8E7] flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-16 w-16 text-[#E85A42] mb-4" />
        <h2 className="text-xl font-bold text-[#FF6B35] mb-2" style={{
        fontFamily: 'Quicksand'
      }}>
          活动不存在
        </h2>
        <p className="text-sm text-[#8B7355] mb-4" style={{
        fontFamily: 'Nunito'
      }}>
          该活动可能已被删除或您没有权限查看
        </p>
        <Button className="bg-[#FF8B4E] text-white h-12 px-6 rounded-xl" onClick={() => navigateTo({
        pageId: 'family-activities',
        params: {}
      })}>
          返回活动列表
        </Button>
      </div>;
  }
  const isFull = participants.length >= activity.maxParticipants;
  const canRegister = activity.status === 'planning' || activity.status === 'ongoing';
  return <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FFEDD5] to-[#FFF8E7] pb-24">
      {/* 头部图片 */}
      <div className="relative h-64">
        <img src={activity.coverImage || 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200'} alt={activity.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Button className="absolute top-4 left-4 bg-white/90 text-[#FF6B35] h-10 w-10 p-0 rounded-full" onClick={() => navigateBack()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(activity.status)}`}>
          {getStatusText(activity.status)}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl font-bold text-white mb-2" style={{
          fontFamily: 'Quicksand'
        }}>
            {activity.name}
          </h1>
        </div>
      </div>

      {/* 活动信息 */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          {/* 时间地点 */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 text-[#8B7355]" style={{
            fontFamily: 'Nunito'
          }}>
              <div className="w-10 h-10 bg-[#FCEEB8] rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-[#FF8B4E]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#FF6B35]">{formatDate(activity.startTime)}</p>
                <p className="text-xs">{formatTime(activity.startTime)} - {formatTime(activity.endTime)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[#8B7355]" style={{
            fontFamily: 'Nunito'
          }}>
              <div className="w-10 h-10 bg-[#FCEEB8] rounded-full flex items-center justify-center">
                <MapPin className="h-5 w-5 text-[#FF8B4E]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#FF6B35]">{activity.location}</p>
                <p className="text-xs">活动地点</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[#8B7355]" style={{
            fontFamily: 'Nunito'
          }}>
              <div className="w-10 h-10 bg-[#FCEEB8] rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-[#FF8B4E]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#FF6B35]">{participants.length}/{activity.maxParticipants} 人</p>
                <p className="text-xs">{isFull ? '已满员' : '还可报名'}</p>
              </div>
            </div>
          </div>

          {/* 活动描述 */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#FF6B35] mb-2" style={{
            fontFamily: 'Quicksand'
          }}>
              活动详情
            </h3>
            <p className="text-sm text-[#8B7355] leading-relaxed" style={{
            fontFamily: 'Nunito'
          }}>
              {activity.description}
            </p>
          </div>

          {/* 报名按钮 */}
          {canRegister && <div className="mb-6">
              {isRegistered ? <Button className="w-full bg-[#E85A42] text-white h-14 rounded-xl font-bold" onClick={handleCancelRegistration}>
                  <XCircle className="h-5 w-5 mr-2" />
                  取消报名
                </Button> : isFull ? <Button className="w-full bg-gray-400 text-white h-14 rounded-xl font-bold cursor-not-allowed" disabled>
                  <AlertCircle className="h-5 w-5 mr-2" />
                  已满员
                </Button> : <Button className="w-full bg-[#9CCF4E] text-white h-14 rounded-xl font-bold hover:bg-[#8BC34A]" onClick={handleRegister}>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  立即报名
                </Button>}
            </div>}

          {/* 签到按钮（仅对进行中活动且已报名用户显示） */}
          {activity.status === 'ongoing' && isRegistered && !hasCheckedIn && <div className="mb-6">
              <Button className="w-full bg-[#FF8B4E] text-white h-14 rounded-xl font-bold hover:bg-[#FF6B35]" onClick={handleCheckin}>
                <MapPin className="h-5 w-5 mr-2" />
                活动签到
              </Button>
            </div>}

          {/* 已签到提示 */}
          {hasCheckedIn && <div className="mb-6 bg-[#9CCF4E] text-white rounded-xl p-4 text-center">
              <CheckCircle className="h-6 w-6 mx-auto mb-1" />
              <p className="font-bold">您已签到</p>
            </div>}

          {/* 照片入口 */}
          {photos.length > 0 && <div className="flex items-center justify-between bg-[#FCEEB8] rounded-xl p-4 cursor-pointer hover:bg-[#FFEDD5] transition-colors" onClick={() => navigateTo({
          pageId: 'family-activity-photos',
          params: {
            id: activityId
          }
        })}>
              <div className="flex items-center gap-3">
                <ImageIcon className="h-6 w-6 text-[#FF8B4E]" />
                <div>
                  <p className="text-sm font-semibold text-[#FF6B35]" style={{
                fontFamily: 'Quicksand'
              }}>
                    活动相册
                  </p>
                  <p className="text-xs text-[#8B7355]" style={{
                fontFamily: 'Nunito'
              }}>
                    {photos.length} 张照片
                  </p>
                </div>
              </div>
              <div className="flex -space-x-2">
                {photos.slice(0, 3).map((photo, index) => <img key={index} src={photo.thumbnailUrl || photo.url} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />)}
                {photos.length > 3 && <div className="w-8 h-8 rounded-full bg-[#FF8B4E] text-white text-xs flex items-center justify-center border-2 border-white">
                    +{photos.length - 3}
                  </div>}
              </div>
            </div>}
        </div>

        {/* 签到列表 */}
        {checkins.length > 0 && <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
                <MapPin className="h-5 w-5 inline mr-2" />已签到成员
              </h3>
              <span className="text-sm text-[#8B7355]" style={{
            fontFamily: 'Nunito'
          }}>
                {checkins.length} 人
              </span>
            </div>
            <div className="space-y-3">
              {checkins.map((checkin, index) => <div key={checkin.id} className="flex items-center gap-3 p-3 bg-[#FCEEB8] rounded-xl">
                  <div className="relative">
                    <img src={checkin.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${checkin.userId}`} alt={checkin.nickname} className="w-10 h-10 rounded-full object-cover" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#9CCF4E] rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#FF6B35]" style={{
                fontFamily: 'Quicksand'
              }}>
                      {checkin.nickname}
                    </p>
                    <p className="text-xs text-[#8B7355]" style={{
                fontFamily: 'Nunito'
              }}>
                      {formatTime(checkin.checkinTime)} 签到
                      {checkin.checkinLocation && ` · ${checkin.checkinLocation}`}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-[#9CCF4E] text-white">
                    第{index + 1}位
                  </span>
                </div>)}
            </div>
          </div>}

        {/* 参与者列表 */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
              已报名成员
            </h3>
            <span className="text-sm text-[#8B7355]" style={{
            fontFamily: 'Nunito'
          }}>
              {participants.length} 人
            </span>
          </div>
          
          {participants.length > 0 ? <div className="space-y-3">
              {participants.map((participant, index) => <div key={participant.id} className="flex items-center gap-3 p-3 bg-[#FCEEB8] rounded-xl">
                  <div className="relative">
                    <img src={participant.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.userId}`} alt={participant.nickname} className="w-10 h-10 rounded-full object-cover" />
                    {index === 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF8B4E] rounded-full flex items-center justify-center">
                        <span className="text-white text-[8px]">👑</span>
                      </div>}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#FF6B35]" style={{
                fontFamily: 'Quicksand'
              }}>
                      {participant.nickname}
                    </p>
                    {participant.notes && <p className="text-xs text-[#8B7355]" style={{
                fontFamily: 'Nunito'
              }}>
                        {participant.notes}
                      </p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${participant.status === 'attended' ? 'bg-[#9CCF4E] text-white' : 'bg-[#FF8B4E] text-white'}`}>
                    {participant.status === 'attended' ? '已参加' : '已报名'}
                  </span>
                </div>)}
            </div> : <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-3 text-[#FF8B4E] opacity-50" />
              <p className="text-sm text-[#8B7355]" style={{
            fontFamily: 'Nunito'
          }}>
                暂无人报名，快来成为第一个吧！
              </p>
            </div>}
        </div>
      </div>

      {/* 底部导航栏 */}
      <TabBar activeTab={activeTab} navigateTo={navigateTo} onTabChange={tabId => {
      setActiveTab(tabId);
      if (tabId === 'home') {
        navigateTo({
          pageId: 'famaily-home',
          params: {}
        });
      } else if (tabId === 'chef') {
        navigateTo({
          pageId: 'family-chef',
          params: {}
        });
      } else if (tabId === 'member') {
        navigateTo({
          pageId: 'family-member',
          params: {}
        });
      }
    }} userRole="family" />
    </div>;
}