// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Calendar, MapPin, Users, Clock, ChevronRight } from 'lucide-react';

// 活动卡片组件
const ActivityCard = ({
  activity,
  onClick
}) => {
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
  return <div className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group" onClick={onClick}>
      {/* 封面图片 */}
      <div className="relative h-40 overflow-hidden">
        <img src={activity.coverImage || 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800'} alt={activity.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(activity.status)}`}>
          {getStatusText(activity.status)}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-[#FF6B35] mb-2 line-clamp-1 group-hover:text-[#E85A42] transition-colors" style={{
        fontFamily: 'Quicksand'
      }}>
          {activity.name}
        </h3>
        <p className="text-sm text-[#8B7355] mb-3 line-clamp-2" style={{
        fontFamily: 'Nunito'
      }}>
          {activity.description}
        </p>
        
        {/* 时间地点信息 */}
        <div className="flex items-center gap-4 text-xs text-[#8B7355]" style={{
        fontFamily: 'Nunito'
      }}>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-[#FF8B4E]" />
            {formatDate(activity.startTime)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-[#FF8B4E]" />
            {formatTime(activity.startTime)}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-[#8B7355]" style={{
        fontFamily: 'Nunito'
      }}>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-[#FF8B4E]" />
            {activity.location}
          </span>
        </div>

        {/* 底部信息 */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#FCEEB8]">
          <span className="flex items-center gap-1 text-sm text-[#FF6B35]" style={{
          fontFamily: 'Quicksand'
        }}>
            <Users className="h-4 w-4" />
            {activity.participantCount || 0}/{activity.maxParticipants}
          </span>
          <ChevronRight className="h-5 w-5 text-[#FF8B4E] group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>;
};

// 活动列表组件
const ActivityList = ({
  activities,
  onActivityClick,
  emptyText = '暂无活动',
  emptyDescription = '创建第一个家庭活动，记录美好时光'
}) => {
  if (!activities || activities.length === 0) {
    return <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-[#FCEEB8] to-[#FF8B4E] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Calendar className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-lg font-bold text-[#FF6B35] mb-2" style={{
        fontFamily: 'Quicksand'
      }}>
          {emptyText}
        </h3>
        <p className="text-sm text-[#8B7355]" style={{
        fontFamily: 'Nunito'
      }}>
          {emptyDescription}
        </p>
      </div>;
  }
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {activities.map(activity => <ActivityCard key={activity.id} activity={activity} onClick={() => onActivityClick(activity)} />)}
    </div>;
};
export { ActivityCard, ActivityList };