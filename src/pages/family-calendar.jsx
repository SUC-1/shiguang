// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button, Card, CardContent, Badge, Tabs, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, Users, Bell } from 'lucide-react';

export default function FamilyCalendar(props) {
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;
  const {
    navigateTo
  } = $w.utils;
  const currentUser = $w.auth.currentUser || {};
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [selectedDate, setSelectedDate] = useState(null);
  const [familyGroupId, setFamilyGroupId] = useState(null);

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
        setFamilyGroupId(result.records[0].familyGroupId);
        return result.records[0].familyGroupId;
      }
      return null;
    } catch (error) {
      console.error('获取家庭组失败:', error);
      return null;
    }
  };

  // 获取事件列表
  const fetchEvents = async groupId => {
    try {
      const targetGroupId = groupId || familyGroupId;
      if (!targetGroupId) return;
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'family_events',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                familyGroupId: {
                  $eq: targetGroupId
                }
              }, {
                startTime: {
                  $gte: startOfMonth.toISOString()
                }
              }, {
                startTime: {
                  $lte: endOfMonth.toISOString()
                }
              }]
            }
          },
          orderBy: [{
            startTime: 'asc'
          }],
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 100,
          pageNumber: 1
        }
      });
      if (result?.records) {
        const formattedEvents = result.records.map(event => ({
          id: event._id,
          title: event.title,
          description: event.description,
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
          eventType: event.eventType,
          isAllDay: event.isAllDay,
          createdBy: event.createdBy,
          createdByName: event.createdByName
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '获取日程失败',
        description: error.message
      });
    }
  };

  // 页面初始化
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const groupId = await fetchFamilyGroup();
      if (groupId) {
        await fetchEvents(groupId);
      }
      setLoading(false);
    };
    loadData();
  }, [currentDate]);

  // 获取月份天数
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // 获取月份第一天是星期几
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // 获取日期的事件
  const getEventsForDate = date => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.getDate() === date && eventDate.getMonth() === currentDate.getMonth() && eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  // 渲染月视图
  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
    const days = [];

    // 空白格子
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50/50 rounded-lg" />);
    }

    // 日期格子
    for (let date = 1; date <= daysInMonth; date++) {
      const dateEvents = getEventsForDate(date);
      const isToday = new Date().getDate() === date && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
      const isSelected = selectedDate === date;
      days.push(<div key={date} className={`h-24 p-2 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? 'border-[#FF6B35] bg-[#FFF5F0]' : isToday ? 'border-[#9CCF4E] bg-[#F0FFF4]' : 'border-transparent bg-white hover:bg-gray-50'}`} onClick={() => setSelectedDate(date)}>
          <div className={`text-sm font-bold mb-1 ${isToday ? 'text-[#9CCF4E]' : 'text-[#FF6B35]'}`}>
            {date}
          </div>
          <div className="space-y-1">
            {dateEvents.slice(0, 2).map((event, idx) => <div key={idx} className={`text-xs px-1.5 py-0.5 rounded truncate ${event.eventType === 'birthday' ? 'bg-pink-100 text-pink-700' : event.eventType === 'holiday' ? 'bg-purple-100 text-purple-700' : event.eventType === 'meeting' ? 'bg-blue-100 text-blue-700' : 'bg-[#FCEEB8] text-[#FF6B35]'}`}>
                {event.title}
              </div>)}
            {dateEvents.length > 2 && <div className="text-xs text-[#8B7355] pl-1">+{dateEvents.length - 2} 更多</div>}
          </div>
        </div>);
    }
    return days;
  };

  // 渲染周视图
  const renderWeekView = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      weekDays.push(day);
    }
    return <div className="space-y-4">
        {weekDays.map((day, index) => {
        const dayEvents = events.filter(event => {
          const eventDate = new Date(event.startTime);
          return eventDate.toDateString() === day.toDateString();
        });
        const isToday = day.toDateString() === new Date().toDateString();
        return <div key={index} className={`p-4 rounded-2xl border-2 ${isToday ? 'border-[#9CCF4E] bg-[#F0FFF4]' : 'border-transparent bg-white'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${isToday ? 'bg-[#9CCF4E] text-white' : 'bg-[#FCEEB8] text-[#FF6B35]'}`}>
                    {day.getDate()}
                  </div>
                  <div>
                    <p className="font-bold text-[#FF6B35]">
                      {['周日', '周一', '周二', '周三', '周四', '周五', '周六'][day.getDay()]}
                    </p>
                    <p className="text-sm text-[#8B7355]">
                      {day.getMonth() + 1}月
                    </p>
                  </div>
                </div>
                {dayEvents.length > 0 && <Badge className="bg-[#FF8B4E] text-white">
                    {dayEvents.length} 个事件
                  </Badge>}
              </div>

              <div className="space-y-2">
                {dayEvents.map((event, idx) => <div key={idx} className="p-3 bg-white rounded-xl border border-gray-100 hover:border-[#FF8B4E] cursor-pointer transition-all" onClick={() => navigateTo({
              pageId: 'family-event-detail',
              params: {
                eventId: event.id
              }
            })}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${event.eventType === 'birthday' ? 'bg-pink-500' : event.eventType === 'holiday' ? 'bg-purple-500' : event.eventType === 'meeting' ? 'bg-blue-500' : 'bg-[#FF8B4E]'}`} />
                        <span className="font-semibold text-[#FF6B35]">{event.title}</span>
                      </div>
                      <span className="text-xs text-[#8B7355]">
                        {new Date(event.startTime).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                      </span>
                    </div>
                    {event.location && <div className="flex items-center gap-1 mt-1 text-xs text-[#8B7355]">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </div>}
                  </div>)}
                {dayEvents.length === 0 && <p className="text-sm text-[#8B7355] text-center py-4">暂无事件</p>}
              </div>
            </div>;
      })}
      </div>;
  };

  // 月份导航
  const navigateMonth = direction => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  return <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FFF5F0] to-[#FCEEB8] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF8B4E] to-[#FF6B35] rounded-b-[2rem] shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">家庭日程</h1>
            <p className="text-white/80 text-sm">共享美好时光</p>
          </div>
          <Button className="bg-white text-[#FF6B35] rounded-full px-4 py-2 font-bold shadow-lg hover:bg-gray-100" onClick={() => navigateTo({
          pageId: 'family-event-form',
          params: {}
        })}>
            <Plus className="w-5 h-5 mr-1" />
            新建
          </Button>
        </div>

        {/* 月份导航 */}
        <div className="flex items-center justify-between bg-white/20 rounded-2xl p-3">
          <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="text-center">
            <p className="text-white font-bold text-lg">
              {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
            </p>
          </div>
          <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => navigateMonth(1)}>
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="px-4 mt-4">
        <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white rounded-xl p-1">
            <TabsTrigger value="month" className="rounded-lg data-[state=active]:bg-[#FF8B4E] data-[state=active]:text-white">
              <CalendarIcon className="w-4 h-4 mr-2" />
              月视图
            </TabsTrigger>
            <TabsTrigger value="week" className="rounded-lg data-[state=active]:bg-[#FF8B4E] data-[state=active]:text-white">
              <Clock className="w-4 h-4 mr-2" />
              周视图
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Calendar Content */}
      <div className="px-4 mt-4">
        {viewMode === 'month' ? <Card className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-0 overflow-hidden">
            <CardContent className="p-4">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['日', '一', '二', '三', '四', '五', '六'].map(day => <div key={day} className="text-center text-sm font-bold text-[#8B7355] py-2">
                    {day}
                  </div>)}
              </div>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {renderMonthView()}
              </div>
            </CardContent>
          </Card> : renderWeekView()}
      </div>

      {/* Selected Date Events */}
      {selectedDate && viewMode === 'month' && <div className="px-4 mt-4">
          <Card className="bg-white rounded-3xl shadow-xl border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#FF6B35]">
                  {currentDate.getMonth() + 1}月{selectedDate}日 事件
                </h3>
                <Button size="sm" className="bg-[#9CCF4E] text-white rounded-full" onClick={() => navigateTo({
              pageId: 'family-event-form',
              params: {
                date: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
              }
            })}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加
                </Button>
              </div>
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map((event, idx) => <div key={idx} className="p-3 bg-[#FCEEB8] rounded-xl cursor-pointer hover:bg-[#FF8B4E]/10 transition-all" onClick={() => navigateTo({
              pageId: 'family-event-detail',
              params: {
                eventId: event.id
              }
            })}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#FF6B35]">{event.title}</span>
                      <Badge className={`${event.eventType === 'birthday' ? 'bg-pink-500' : event.eventType === 'holiday' ? 'bg-purple-500' : event.eventType === 'meeting' ? 'bg-blue-500' : 'bg-[#FF8B4E]'} text-white`}>
                        {event.eventType === 'birthday' ? '生日' : event.eventType === 'holiday' ? '节日' : event.eventType === 'meeting' ? '会议' : event.eventType === 'activity' ? '活动' : '其他'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[#8B7355]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(event.startTime).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                      </span>
                      {event.location && <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </span>}
                    </div>
                  </div>)}
                {getEventsForDate(selectedDate).length === 0 && <p className="text-center text-[#8B7355] py-4">该日期暂无事件</p>}
              </div>
            </CardContent>
          </Card>
        </div>}
    </div>;
}