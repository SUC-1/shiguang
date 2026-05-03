// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { useToast, Button, Tabs, TabsContent, TabsList, TabsTrigger, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui';
// @ts-ignore;
import { Trophy, Gift, Star, ArrowLeft, Crown, Medal, Users, CheckCircle, Clock, ShoppingCart } from 'lucide-react';

// 模拟数据
const mockMemberPoints = [{
  userId: 'user_002',
  userName: '小明',
  userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming',
  totalPoints: 180,
  availablePoints: 50,
  spentPoints: 130,
  completedTasks: 12,
  rank: 1
}, {
  userId: 'user_001',
  userName: '爸爸',
  userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=baba',
  totalPoints: 150,
  availablePoints: 125,
  spentPoints: 25,
  completedTasks: 8,
  rank: 2
}, {
  userId: 'user_003',
  userName: '妈妈',
  userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mama',
  totalPoints: 120,
  availablePoints: 120,
  spentPoints: 0,
  completedTasks: 6,
  rank: 3
}, {
  userId: 'user_004',
  userName: '爷爷',
  userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yeye',
  totalPoints: 90,
  availablePoints: 0,
  spentPoints: 90,
  completedTasks: 5,
  rank: 4
}, {
  userId: 'user_005',
  userName: '奶奶',
  userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nainai',
  totalPoints: 60,
  availablePoints: 60,
  spentPoints: 0,
  completedTasks: 3,
  rank: 5
}];
const mockRewards = [{
  id: 'reward_001',
  name: '周末电影之夜',
  description: '周末全家一起看电影的特权',
  image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400',
  pointsRequired: 100,
  stock: 999,
  category: 'experience'
}, {
  id: 'reward_002',
  name: '冰淇淋券',
  description: '美味冰淇淋一份',
  image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400',
  pointsRequired: 50,
  stock: 20,
  category: 'item'
}, {
  id: 'reward_003',
  name: '多玩1小时游戏',
  description: '额外增加1小时游戏时间',
  image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400',
  pointsRequired: 80,
  stock: 999,
  category: 'privilege'
}, {
  id: 'reward_004',
  name: '选择晚餐',
  description: '可以优先选择晚餐吃什么',
  image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
  pointsRequired: 60,
  stock: 999,
  category: 'privilege'
}, {
  id: 'reward_005',
  name: '玩具汽车',
  description: '精美玩具汽车模型',
  image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  pointsRequired: 200,
  stock: 5,
  category: 'item'
}, {
  id: 'reward_006',
  name: '游乐园一日游',
  description: '全家一起去游乐园玩',
  image: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=400',
  pointsRequired: 500,
  stock: 2,
  category: 'experience'
}];
const mockExchanges = [{
  id: 'exchange_001',
  userName: '小明',
  userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming',
  rewardName: '冰淇淋券',
  rewardImage: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400',
  pointsSpent: 50,
  status: 'completed',
  exchangedAt: '2026-04-20T15:30:00Z'
}, {
  id: 'exchange_002',
  userName: '小明',
  userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming',
  rewardName: '多玩1小时游戏',
  rewardImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400',
  pointsSpent: 80,
  status: 'pending',
  exchangedAt: '2026-05-02T20:00:00Z'
}, {
  id: 'exchange_003',
  userName: '爷爷',
  userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yeye',
  rewardName: '周末电影之夜',
  rewardImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400',
  pointsSpent: 100,
  status: 'completed',
  exchangedAt: '2026-04-15T18:00:00Z'
}];
const categoryLabels = {
  privilege: '特权',
  item: '物品',
  experience: '体验'
};
const categoryColors = {
  privilege: 'bg-purple-500',
  item: 'bg-blue-500',
  experience: 'bg-green-500'
};
export default function FamilyTaskRewards(props) {
  const {
    toast
  } = useToast();
  const {
    navigateBack,
    navigateTo
  } = props.$w.utils;
  const currentUser = props.$w.auth.currentUser;
  const [activeTab, setActiveTab] = useState('ranking');
  const [showExchangeDialog, setShowExchangeDialog] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [memberPoints] = useState(mockMemberPoints);
  const [rewards] = useState(mockRewards);
  const [exchanges] = useState(mockExchanges);

  // 当前用户积分（模拟）
  const myPoints = memberPoints.find(m => m.userId === 'user_002') || memberPoints[0];

  // 格式化日期
  const formatDate = dateStr => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 兑换奖励
  const handleExchange = () => {
    if (!selectedReward) return;
    if (myPoints.availablePoints < selectedReward.pointsRequired) {
      toast({
        variant: 'destructive',
        title: '积分不足',
        description: `需要 ${selectedReward.pointsRequired} 积分，您当前只有 ${myPoints.availablePoints} 积分`
      });
      return;
    }
    if (selectedReward.stock <= 0) {
      toast({
        variant: 'destructive',
        title: '库存不足',
        description: '该奖励已兑完'
      });
      return;
    }
    toast({
      title: '兑换成功',
      description: `恭喜您成功兑换 "${selectedReward.name}"！`
    });
    setShowExchangeDialog(false);
  };

  // 获取排名图标
  const getRankIcon = rank => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-gray-400 font-bold">#{rank}</span>;
    }
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
            奖励中心
          </h1>
          <div className="w-9" />
        </div>

        {/* 我的积分卡片 */}
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 mt-4">
          <div className="flex items-center gap-4">
            <img src={myPoints.userAvatar} alt={myPoints.userName} className="w-14 h-14 rounded-full border-2 border-white" />
            <div className="flex-1">
              <p className="text-white font-semibold">{myPoints.userName}</p>
              <p className="text-white/80 text-sm">当前可用积分</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{myPoints.availablePoints}</p>
              <p className="text-white/60 text-xs">总积分 {myPoints.totalPoints}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 标签切换 */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-white/10 rounded-xl p-1">
            <TabsTrigger value="ranking" className="flex-1 rounded-lg data-[state=active]:bg-[#E94560] data-[state=active]:text-white">
              <Trophy className="w-4 h-4 mr-2" />
              排行榜
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex-1 rounded-lg data-[state=active]:bg-[#E94560] data-[state=active]:text-white">
              <Gift className="w-4 h-4 mr-2" />
              奖励列表
            </TabsTrigger>
            <TabsTrigger value="records" className="flex-1 rounded-lg data-[state=active]:bg-[#E94560] data-[state=active]:text-white">
              <Clock className="w-4 h-4 mr-2" />
              兑换记录
            </TabsTrigger>
          </TabsList>

          {/* 排行榜 */}
          <TabsContent value="ranking" className="mt-4 space-y-3">
            {memberPoints.map((member, index) => <div key={member.userId} className={`flex items-center gap-3 p-3 bg-white/10 backdrop-blur rounded-2xl border border-white/10 ${member.userId === 'user_002' ? 'ring-2 ring-[#FF8B4E]' : ''}`}>
                <div className="w-8 flex justify-center">
                  {getRankIcon(member.rank)}
                </div>
                <img src={member.userAvatar} alt={member.userName} className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <p className="font-semibold text-white">{member.userName}</p>
                  <p className="text-xs text-gray-400">完成任务 {member.completedTasks} 个</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#FF8B4E]">{member.totalPoints}</p>
                  <p className="text-xs text-gray-400">总积分</p>
                </div>
              </div>)}
          </TabsContent>

          {/* 奖励列表 */}
          <TabsContent value="rewards" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {rewards.map(reward => <div key={reward.id} className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden border border-white/10 hover:bg-white/15 transition cursor-pointer" onClick={() => {
              setSelectedReward(reward);
              setShowExchangeDialog(true);
            }}>
                  <div className="aspect-square relative">
                    <img src={reward.image} alt={reward.name} className="w-full h-full object-cover" />
                    <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs text-white ${categoryColors[reward.category]}`}>
                      {categoryLabels[reward.category]}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-white text-sm truncate">{reward.name}</h3>
                    <p className="text-xs text-gray-400 truncate mb-2">{reward.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[#FF8B4E] font-bold">{reward.pointsRequired}分</span>
                      <span className="text-xs text-gray-400">库存 {reward.stock}</span>
                    </div>
                  </div>
                </div>)}
            </div>
          </TabsContent>

          {/* 兑换记录 */}
          <TabsContent value="records" className="mt-4 space-y-3">
            {exchanges.length > 0 ? exchanges.map(exchange => <div key={exchange.id} className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur rounded-2xl border border-white/10">
                  <img src={exchange.rewardImage} alt={exchange.rewardName} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{exchange.rewardName}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <img src={exchange.userAvatar} alt={exchange.userName} className="w-4 h-4 rounded-full" />
                      <span>{exchange.userName}</span>
                      <span>·</span>
                      <span>{formatDate(exchange.exchangedAt)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#FF8B4E] font-bold">-{exchange.pointsSpent}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${exchange.status === 'completed' ? 'bg-[#9CCF4E]/20 text-[#9CCF4E]' : 'bg-[#FF8B4E]/20 text-[#FF8B4E]'}`}>
                      {exchange.status === 'completed' ? '已领取' : '待领取'}
                    </span>
                  </div>
                </div>) : <div className="text-center py-12">
                <Gift className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                <p className="text-gray-400">暂无兑换记录</p>
              </div>}
          </TabsContent>
        </Tabs>
      </div>

      {/* 兑换弹窗 */}
      <Dialog open={showExchangeDialog} onOpenChange={setShowExchangeDialog}>
        <DialogContent className="bg-[#1A1A2E] border-white/20 text-white rounded-2xl max-w-sm">
          {selectedReward && <>
              <DialogHeader>
                <DialogTitle style={{
              fontFamily: 'Playfair Display'
            }}>{selectedReward.name}</DialogTitle>
                <DialogDescription className="text-gray-400">{selectedReward.description}</DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <img src={selectedReward.image} alt={selectedReward.name} className="w-full h-40 object-cover rounded-xl mb-4" />
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400">所需积分</p>
                    <p className="text-2xl font-bold text-[#FF8B4E]">{selectedReward.pointsRequired}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">我的积分</p>
                    <p className="text-2xl font-bold text-white">{myPoints.availablePoints}</p>
                  </div>
                </div>

                <div className={`p-3 rounded-xl text-center ${myPoints.availablePoints >= selectedReward.pointsRequired ? 'bg-[#9CCF4E]/20 text-[#9CCF4E]' : 'bg-red-500/20 text-red-400'}`}>
                  {myPoints.availablePoints >= selectedReward.pointsRequired ? `积分充足，还剩 ${myPoints.availablePoints - selectedReward.pointsRequired} 积分` : `积分不足，还需 ${selectedReward.pointsRequired - myPoints.availablePoints} 积分`}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowExchangeDialog(false)} className="border-white/20 text-white hover:bg-white/10 rounded-xl">
                  取消
                </Button>
                <Button onClick={handleExchange} disabled={myPoints.availablePoints < selectedReward.pointsRequired || selectedReward.stock <= 0} className="bg-gradient-to-r from-[#E94560] to-[#FF8B4E] rounded-xl">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  立即兑换
                </Button>
              </DialogFooter>
            </>}
        </DialogContent>
      </Dialog>
    </div>;
}