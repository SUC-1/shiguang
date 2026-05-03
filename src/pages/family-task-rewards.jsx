// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { ChevronRight, Star, Gift, Ticket, Crown, User, CheckCircle, Lock, Sparkles } from 'lucide-react';

const {
  toast
} = useToast();
export default function FamilyTaskRewards(props) {
  const {
    $w
  } = props;
  const {
    navigateTo,
    navigateBack
  } = $w.utils;
  const currentUser = $w.auth.currentUser;
  const [rewards, setRewards] = useState([]);
  const [pointsRank, setPointsRank] = useState([]);
  const [myPoints, setMyPoints] = useState(null);
  const [loading, setLoading] = useState(true);
  const [familyGroupId, setFamilyGroupId] = useState(null);
  const [activeTab, setActiveTab] = useState('rewards');
  const [categoryFilter, setCategoryFilter] = useState('all');

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

  // 获取奖励列表
  const fetchRewards = async groupId => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'family_task_rewards',
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
          orderBy: [{
            pointsRequired: 'asc'
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
        setRewards(result.records.map(r => ({
          id: r._id,
          name: r.name,
          description: r.description,
          imageUrl: r.imageUrl,
          pointsRequired: r.pointsRequired,
          stock: r.stock,
          category: r.category
        })));
      }
    } catch (error) {
      console.error('获取奖励列表失败:', error);
    }
  };

  // 获取积分排行
  const fetchPointsRank = async groupId => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'family_task_points',
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
            availablePoints: 'desc'
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
        const rankData = result.records.map(r => ({
          id: r._id,
          userId: r.userId,
          nickname: r.nickname,
          avatar: r.avatar,
          totalPoints: r.totalPoints,
          availablePoints: r.availablePoints,
          spentPoints: r.spentPoints,
          completedTasks: r.completedTasks
        }));
        setPointsRank(rankData);

        // 获取当前用户积分
        const myData = rankData.find(r => r.userId === currentUser.userId);
        if (myData) {
          setMyPoints(myData);
        }
      }
    } catch (error) {
      console.error('获取积分排行失败:', error);
    }
  };

  // 兑换奖励
  const handleRedeem = async reward => {
    if (!myPoints || myPoints.availablePoints < reward.pointsRequired) {
      toast({
        variant: 'destructive',
        title: '积分不足',
        description: `需要 ${reward.pointsRequired} 积分，您当前有 ${myPoints?.availablePoints || 0} 积分`
      });
      return;
    }
    if (reward.stock <= 0) {
      toast({
        variant: 'destructive',
        title: '库存不足',
        description: '该奖励已兑完'
      });
      return;
    }
    try {
      // 扣除积分
      await $w.cloud.callDataSource({
        dataSourceName: 'family_task_points',
        methodName: 'wedaUpdateV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: myPoints.id
              }
            }
          },
          data: {
            availablePoints: myPoints.availablePoints - reward.pointsRequired,
            spentPoints: myPoints.spentPoints + reward.pointsRequired,
            updatedAt: new Date().toISOString()
          }
        }
      });

      // 减少库存
      await $w.cloud.callDataSource({
        dataSourceName: 'family_task_rewards',
        methodName: 'wedaUpdateV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: reward.id
              }
            }
          },
          data: {
            stock: reward.stock - 1
          }
        }
      });
      toast({
        variant: 'default',
        title: '兑换成功！🎉',
        description: `恭喜您获得了「${reward.name}」`
      });

      // 刷新数据
      const groupId = await fetchFamilyGroup();
      if (groupId) {
        await Promise.all([fetchRewards(groupId), fetchPointsRank(groupId)]);
      }
    } catch (error) {
      console.error('兑换失败:', error);
      toast({
        variant: 'destructive',
        title: '兑换失败',
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
        await Promise.all([fetchRewards(groupId), fetchPointsRank(groupId)]);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // 筛选奖励
  const filteredRewards = rewards.filter(r => categoryFilter === 'all' || r.category === categoryFilter);

  // 获取分类图标
  const getCategoryIcon = category => {
    switch (category) {
      case 'privilege':
        return <Crown className="w-5 h-5" />;
      case 'gift':
        return <Gift className="w-5 h-5" />;
      case 'voucher':
        return <Ticket className="w-5 h-5" />;
      default:
        return <Gift className="w-5 h-5" />;
    }
  };

  // 获取分类名称
  const getCategoryName = category => {
    switch (category) {
      case 'privilege':
        return '特权';
      case 'gift':
        return '实物';
      case 'voucher':
        return '券';
      default:
        return '其他';
    }
  };
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
        }}>奖励中心</h1>
          <div className="w-10"></div>
        </div>

        {/* 我的积分卡片 */}
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm" style={{
              fontFamily: 'Nunito'
            }}>我的可用积分</p>
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-300" />
                <span className="text-3xl font-bold text-white">{myPoints?.availablePoints || 0}</span>
              </div>
            </div>
            <div className="text-right text-white/80">
              <p className="text-sm" style={{
              fontFamily: 'Nunito'
            }}>累计获得</p>
              <p className="font-bold">{myPoints?.totalPoints || 0}</p>
            </div>
          </div>
        </div>

        {/* Tab切换 */}
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('rewards')} className={`flex-1 py-2 rounded-xl font-medium transition-all ${activeTab === 'rewards' ? 'bg-white text-orange-500 shadow-md' : 'bg-white/30 text-white'}`}>
            奖励兑换
          </button>
          <button onClick={() => setActiveTab('rank')} className={`flex-1 py-2 rounded-xl font-medium transition-all ${activeTab === 'rank' ? 'bg-white text-orange-500 shadow-md' : 'bg-white/30 text-white'}`}>
            积分排行
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-4">
        {activeTab === 'rewards' ? <>
            {/* 分类筛选 */}
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {['all', 'privilege', 'gift', 'voucher', 'other'].map(cat => <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${categoryFilter === cat ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                  {cat === 'all' ? '全部' : getCategoryName(cat)}
                </button>)}
            </div>

            {/* 奖励列表 */}
            <div className="grid grid-cols-2 gap-4">
              {filteredRewards.map(reward => {
            const canRedeem = myPoints && myPoints.availablePoints >= reward.pointsRequired && reward.stock > 0;
            return <div key={reward.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    <div className="relative h-32 bg-gray-100">
                      <img src={reward.imageUrl} alt={reward.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-medium text-orange-500 flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        {reward.pointsRequired}
                      </div>
                      {reward.stock <= 3 && reward.stock > 0 && <div className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                          仅剩{reward.stock}份
                        </div>}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-800 mb-1 truncate" style={{
                  fontFamily: 'Quicksand'
                }}>
                        {reward.name}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3" style={{
                  fontFamily: 'Nunito'
                }}>
                        {reward.description}
                      </p>
                      <button onClick={() => handleRedeem(reward)} disabled={!canRedeem} className={`w-full py-2 rounded-xl font-medium text-sm transition-all ${canRedeem ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md hover:shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                        {reward.stock <= 0 ? '已兑完' : canRedeem ? '立即兑换' : '积分不足'}
                      </button>
                    </div>
                  </div>;
          })}
            </div>

            {filteredRewards.length === 0 && <div className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500" style={{
            fontFamily: 'Nunito'
          }}>暂无奖励</p>
              </div>}
          </> : <>
            {/* 积分排行 */}
            <div className="space-y-3">
              {pointsRank.map((member, index) => <div key={member.id} className={`bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 ${member.userId === currentUser.userId ? 'ring-2 ring-orange-300' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-600' : index === 1 ? 'bg-gray-100 text-gray-600' : index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
                    {index + 1}
                  </div>
                  <img src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.userId}`} alt={member.nickname} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800" style={{
                fontFamily: 'Quicksand'
              }}>
                      {member.nickname}
                      {member.userId === currentUser.userId && <span className="ml-2 text-xs text-orange-500">(我)</span>}
                    </h3>
                    <p className="text-xs text-gray-500" style={{
                fontFamily: 'Nunito'
              }}>
                      已完成 {member.completedTasks} 个任务
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-orange-500 font-bold">
                      <Star className="w-4 h-4" />
                      {member.availablePoints}
                    </div>
                    <p className="text-xs text-gray-400" style={{
                fontFamily: 'Nunito'
              }}>可用积分</p>
                  </div>
                </div>)}
            </div>

            {pointsRank.length === 0 && <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500" style={{
            fontFamily: 'Nunito'
          }}>暂无排行数据</p>
              </div>}
          </>}
      </div>
    </div>;
}