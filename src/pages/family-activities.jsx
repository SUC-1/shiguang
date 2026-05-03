// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Calendar, MapPin, Users, Plus, Search, Filter, ChevronRight, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
// @ts-ignore;
import { Button, Input, useToast } from '@/components/ui';

import { TabBar } from '@/components/TabBar';
export default function FamilyActivities(props) {
  const {
    toast
  } = useToast();
  const navigateTo = props.$w.utils.navigateTo;
  const currentUser = props.$w.auth.currentUser || {};
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('activities');
  const [familyGroupId, setFamilyGroupId] = useState(null);

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

  // 获取活动列表
  const fetchActivities = async groupId => {
    try {
      const targetGroupId = groupId || familyGroupId;
      if (!targetGroupId) {
        console.error('未找到家庭组');
        return;
      }
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'family_activities',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                familyGroupId: {
                  $eq: targetGroupId
                }
              }]
            }
          },
          orderBy: [{
            startTime: 'desc'
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
        // 获取每个活动的报名人数
        const activitiesWithParticipants = await Promise.all(result.records.map(async activity => {
          const participantsResult = await props.$w.cloud.callDataSource({
            dataSourceName: 'family_activity_participants',
            methodName: 'wedaGetRecordsV2',
            params: {
              filter: {
                where: {
                  $and: [{
                    activityId: {
                      $eq: activity._id
                    }
                  }, {
                    status: {
                      $in: ['registered', 'attended']
                    }
                  }]
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
          return {
            id: activity._id,
            name: activity.name,
            description: activity.description,
            coverImage: activity.coverImage,
            startTime: activity.startTime,
            endTime: activity.endTime,
            location: activity.location,
            maxParticipants: activity.maxParticipants,
            status: activity.status,
            participantCount: participantsResult?.total || 0,
            createdBy: activity.createdBy
          };
        }));
        setActivities(activitiesWithParticipants);
      }
    } catch (error) {
      console.error('获取活动列表失败:', error);
      toast({
        variant: 'destructive',
        title: '获取活动列表失败',
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
        await fetchActivities(groupId);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // 筛选活动
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase()) || activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 分类活动
  const ongoingActivities = filteredActivities.filter(a => a.status === 'ongoing' || a.status === 'planning');
  const completedActivities = filteredActivities.filter(a => a.status === 'completed');

  // 格式化日期
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
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

  // 活动卡片组件
  const ActivityCard = ({
    activity
  }) => <div className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow" onClick={() => navigateTo({
    pageId: 'family-activity-detail',
    params: {
      id: activity.id
    }
  })}>
      <div className="relative h-40">
        <img src={activity.coverImage || 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800'} alt={activity.name} className="w-full h-full object-cover" />
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(activity.status)}`}>
          {getStatusText(activity.status)}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-[#FF6B35] mb-2 line-clamp-1" style={{
        fontFamily: 'Quicksand'
      }}>
          {activity.name}
        </h3>
        <p className="text-sm text-[#8B7355] mb-3 line-clamp-2" style={{
        fontFamily: 'Nunito'
      }}>
          {activity.description}
        </p>
        <div className="flex items-center gap-4 text-xs text-[#8B7355]" style={{
        fontFamily: 'Nunito'
      }}>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(activity.startTime)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(activity.startTime)}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-[#8B7355]" style={{
        fontFamily: 'Nunito'
      }}>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {activity.location}
          </span>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#FCEEB8]">
          <span className="flex items-center gap-1 text-sm text-[#FF6B35]" style={{
          fontFamily: 'Quicksand'
        }}>
            <Users className="h-4 w-4" />
            {activity.participantCount}/{activity.maxParticipants}
          </span>
          <ChevronRight className="h-5 w-5 text-[#FF8B4E]" />
        </div>
      </div>
    </div>;
  return <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FFEDD5] to-[#FFF8E7] pb-24">
      {/* 头部区域 */}
      <div className="bg-white rounded-b-3xl shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
              家庭活动
            </h1>
            <p className="text-sm text-[#8B7355] mt-1" style={{
            fontFamily: 'Nunito'
          }}>
              记录美好时光，共享欢乐时刻
            </p>
          </div>
          <Button className="bg-[#FF8B4E] text-white h-12 px-4 rounded-xl shadow-lg hover:bg-[#FF6B35]" onClick={() => navigateTo({
          pageId: 'family-activity-form',
          params: {}
        })}>
            <Plus className="h-5 w-5 mr-1" />
            创建活动
          </Button>
        </div>
        
        {/* 搜索和筛选 */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#FF8B4E]" />
            <Input className="w-full bg-[#FCEEB8] border-2 border-[#FF8B4E] rounded-xl h-12 pl-10" placeholder="搜索活动名称" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <select className="bg-[#FCEEB8] border-2 border-[#FF8B4E] rounded-xl h-12 px-4 text-[#8B7355]" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">全部状态</option>
            <option value="planning">筹备中</option>
            <option value="ongoing">进行中</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
      </div>

      {/* 活动内容 */}
      <div className="px-4">
        {loading ? <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF8B4E]" />
          </div> : <>
            {/* 进行中活动 */}
            {ongoingActivities.length > 0 && <div className="mb-8">
                <h2 className="text-xl font-bold text-[#FF6B35] mb-4 flex items-center gap-2" style={{
            fontFamily: 'Quicksand'
          }}>
                  <CheckCircle className="h-6 w-6 text-[#9CCF4E]" />
                  进行中
                  <span className="text-sm font-normal text-[#8B7355]">({ongoingActivities.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ongoingActivities.map(activity => <ActivityCard key={activity.id} activity={activity} />)}
                </div>
              </div>}

            {/* 历史活动 */}
            {completedActivities.length > 0 && <div className="mb-8">
                <h2 className="text-xl font-bold text-[#FF6B35] mb-4 flex items-center gap-2" style={{
            fontFamily: 'Quicksand'
          }}>
                  <Clock className="h-6 w-6 text-[#8B7355]" />
                  历史活动
                  <span className="text-sm font-normal text-[#8B7355]">({completedActivities.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedActivities.map(activity => <ActivityCard key={activity.id} activity={activity} />)}
                </div>
              </div>}

            {/* 空状态 */}
            {filteredActivities.length === 0 && <div className="text-center py-20">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-[#FF8B4E] opacity-50" />
                <h3 className="text-lg font-bold text-[#FF6B35] mb-2" style={{
            fontFamily: 'Quicksand'
          }}>
                  暂无活动
                </h3>
                <p className="text-sm text-[#8B7355] mb-4" style={{
            fontFamily: 'Nunito'
          }}>
                  创建第一个家庭活动，记录美好时光
                </p>
                <Button className="bg-[#FF8B4E] text-white h-12 px-6 rounded-xl shadow-lg hover:bg-[#FF6B35]" onClick={() => navigateTo({
            pageId: 'family-activity-form',
            params: {}
          })}>
                  <Plus className="h-5 w-5 mr-2" />
                  创建活动
                </Button>
              </div>}
          </>}
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