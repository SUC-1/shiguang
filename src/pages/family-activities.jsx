// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Calendar, MapPin, Users, Plus, Search, Filter, ChevronRight, Clock, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
// @ts-ignore;
import { Button, Input, useToast } from '@/components/ui';

import { TabBar } from '@/components/TabBar';
import { SkeletonCard, EmptyState, StatCard } from '@/components/SkeletonCard';
import { ActivityCard, ActivityList } from '@/components/ActivityCard';
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

  // 跳转到活动详情
  const handleActivityClick = activity => {
    navigateTo({
      pageId: 'family-activity-detail',
      params: {
        id: activity.id
      }
    });
  };

  // 刷新活动列表
  const handleRefresh = async () => {
    setLoading(true);
    const groupId = await fetchFamilyGroup();
    if (groupId) {
      await fetchActivities(groupId);
    }
    setLoading(false);
  };
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
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-12 px-3 rounded-xl border-[#FF8B4E] text-[#FF8B4E] hover:bg-[#FF8B4E] hover:text-white" onClick={handleRefresh}>
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button className="bg-[#FF8B4E] text-white h-12 px-4 rounded-xl shadow-lg hover:bg-[#FF6B35] hover:scale-105 transition-all" onClick={() => navigateTo({
            pageId: 'family-activity-form',
            params: {}
          })}>
              <Plus className="h-5 w-5 mr-1" />
              创建活动
            </Button>
          </div>
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
        {loading ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
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
                  {ongoingActivities.map(activity => <ActivityCard key={activity.id} activity={activity} onClick={() => handleActivityClick(activity)} />)}
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
                  {completedActivities.map(activity => <ActivityCard key={activity.id} activity={activity} onClick={() => handleActivityClick(activity)} />)}
                </div>
              </div>}

            {/* 空状态 */}
            {filteredActivities.length === 0 && <EmptyState icon={Calendar} title="暂无活动" description="创建第一个家庭活动，记录美好时光" actionLabel="创建活动" onAction={() => navigateTo({
          pageId: 'family-activity-form',
          params: {}
        })} />}
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