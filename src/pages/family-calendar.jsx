// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ChevronLeft, ChevronRight, Plus, Calendar, List, Grid3X3, Clock, MapPin, Users, Bell, X } from 'lucide-react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';

// 模拟数据
const mockEvents = [{
  id: 'evt_001',
  title: '家庭聚会',
  description: '周末家庭聚餐，讨论近期事项',
  creatorId: 'user_001',
  creatorName: '爸爸',
  creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=father',
  startTime: '2026-05-04T18:00:00Z',
  endTime: '2026-05-04T21:00:00Z',
  location: '家里',
  color: '#FF8B4E',
  isAllDay: false,
  repeatType: 'weekly',
  repeatDays: '0',
  reminderMinutes: 60,
  attendees: ['user_002', 'user_003'],
  attendeeNames: ['妈妈', '小明'],
  status: 'active'
}, {
  id: 'evt_002',
  title: '小明钢琴课',
  description: '每周钢琴课程',
  creatorId: 'user_002',
  creatorName: '妈妈',
  creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mother',
  startTime: '2026-05-05T16:00:00Z',
  endTime: '2026-05-05T17:00:00Z',
  location: '艺术中心',
  color: '#9CCF4E',
  isAllDay: false,
  repeatType: 'weekly',
  repeatDays: '1,3,5',
  reminderMinutes: 30,
  attendees: ['user_003'],
  attendeeNames: ['小明'],
  status: 'active'
}, {
  id: 'evt_003',
  title: '爸爸出差',
  description: '前往北京出差3天',
  creatorId: 'user_001',
  creatorName: '爸爸',
  creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=father',
  startTime: '2026-05-06T08:00:00Z',
  endTime: '2026-05-08T18:00:00Z',
  location: '北京',
  color: '#E94560',
  isAllDay: true,
  repeatType: 'none',
  reminderMinutes: 1440,
  attendees: ['user_001'],
  attendeeNames: ['爸爸'],
  status: 'active'
}, {
  id: 'evt_004',
  title: '家庭大扫除',
  description: '周末全家一起大扫除',
  creatorId: 'user_002',
  creatorName: '妈妈',
  creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mother',
  startTime: '2026-05-10T09:00:00Z',
  endTime: '2026-05-10T12:00:00Z',
  location: '家里',
  color: '#4ECDC4',
  isAllDay: false,
  repeatType: 'monthly',
  repeatDays: '0',
  reminderMinutes: 60,
  attendees: ['user_001', 'user_002', 'user_003'],
  attendeeNames: ['爸爸', '妈妈', '小明'],
  status: 'active'
}, {
  id: 'evt_005',
  title: '小明家长会',
  description: '学期末家长会',
  creatorId: 'user_002',
  creatorName: '妈妈',
  creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mother',
  startTime: '2026-05-15T14:00:00Z',
  endTime: '2026-05-15T16:00:00Z',
  location: '学校',
  color: '#A78BFA',
  isAllDay: false,
  repeatType: 'none',
  reminderMinutes: 120,
  attendees: ['user_001', 'user_002'],
  attendeeNames: ['爸爸', '妈妈'],
  status: 'active'
}, {
  id: 'evt_006',
  title: '体检预约',
  description: '全家年度体检',
  creatorId: 'user_001',
  creatorName: '爸爸',
  creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=father',
  startTime: '2026-05-20T07:30:00Z',
  endTime: '2026-05-20T10:30:00Z',
  location: '市中心医院',
  color: '#F59E0B',
  isAllDay: false,
  repeatType: 'yearly',
  reminderMinutes: 1440,
  attendees: ['user_001', 'user_002', 'user_003'],
  attendeeNames: ['爸爸', '妈妈', '小明'],
  status: 'active'
}];
const mockMembers = [{
  id: 'user_001',
  name: '爸爸',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=father',
  color: '#FF8B4E'
}, {
  id: 'user_002',
  name: '妈妈',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mother',
  color: '#9CCF4E'
}, {
  id: 'user_003',
  name: '小明',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming',
  color: '#4ECDC4'
}];
const colorOptions = [{
  value: '#FF8B4E',
  label: '橙色'
}, {
  value: '#9CCF4E',
  label: '绿色'
}, {
  value: '#E94560',
  label: '红色'
}, {
  value: '#4ECDC4',
  label: '青色'
}, {
  value: '#A78BFA',
  label: '紫色'
}, {
  value: '#F59E0B',
  label: '黄色'
}, {
  value: '#3B82F6',
  label: '蓝色'
}, {
  value: '#EC4899',
  label: '粉色'
}];
const reminderOptions = [{
  value: '0',
  label: '不提醒'
}, {
  value: '5',
  label: '5分钟前'
}, {
  value: '15',
  label: '15分钟前'
}, {
  value: '30',
  label: '30分钟前'
}, {
  value: '60',
  label: '1小时前'
}, {
  value: '1440',
  label: '1天前'
}];
export default function FamilyCalendar(props) {
  const {
    toast
  } = useToast();
  const navigateTo = props.$w?.utils?.navigateTo || (() => {});
  const navigateBack = props.$w?.utils?.navigateBack || (() => {});
  const currentUser = props.$w?.auth?.currentUser || {
    userId: 'user_001',
    name: '爸爸',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=father'
  };
  const [currentDate, setCurrentDate] = useState(new Date('2026-05-03'));
  const [viewMode, setViewMode] = useState('month'); // month/week/day
  const [events, setEvents] = useState(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterMember, setFilterMember] = useState('all');
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '10:00',
    location: '',
    color: '#FF8B4E',
    isAllDay: false,
    repeatType: 'none',
    reminderMinutes: '30',
    attendees: []
  });

  // 获取日历数据
  const getDaysInMonth = date => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // 获取月初是周几
    const startDayOfWeek = firstDay.getDay();

    // 添加上月的日期
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({
        date: d,
        isCurrentMonth: false
      });
    }

    // 添加当月的日期
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        isCurrentMonth: true
      });
    }

    // 添加下月的日期补齐6行
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false
      });
    }
    return days;
  };
  const getWeekDays = date => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({
        date: d,
        isCurrentMonth: true
      });
    }
    return days;
  };
  const getDayEvents = date => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.startTime).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };
  const formatTime = dateStr => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const formatDate = date => {
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  const navigateMonth = direction => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };
  const navigateWeek = direction => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };
  const navigateDay = direction => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    setCurrentDate(newDate);
  };
  const handleDateClick = date => {
    setSelectedDate(date);
    setNewEvent({
      ...newEvent,
      startDate: date.toISOString().split('T')[0],
      endDate: date.toISOString().split('T')[0]
    });
    setShowCreateDialog(true);
  };
  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setShowEventDialog(true);
  };
  const handleCreateEvent = () => {
    if (!newEvent.title.trim()) {
      toast({
        variant: 'destructive',
        title: '创建失败',
        description: '请输入事件标题'
      });
      return;
    }
    const event = {
      id: `evt_${Date.now()}`,
      title: newEvent.title,
      description: newEvent.description,
      creatorId: currentUser.userId,
      creatorName: currentUser.nickName || currentUser.name || '我',
      creatorAvatar: currentUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.userId}`,
      startTime: newEvent.isAllDay ? `${newEvent.startDate}T00:00:00Z` : `${newEvent.startDate}T${newEvent.startTime}:00Z`,
      endTime: newEvent.isAllDay ? `${newEvent.endDate}T23:59:59Z` : `${newEvent.endDate}T${newEvent.endTime}:00Z`,
      location: newEvent.location,
      color: newEvent.color,
      isAllDay: newEvent.isAllDay,
      repeatType: newEvent.repeatType,
      reminderMinutes: parseInt(newEvent.reminderMinutes),
      attendees: newEvent.attendees,
      attendeeNames: newEvent.attendees.map(id => mockMembers.find(m => m.id === id)?.name || ''),
      status: 'active'
    };
    setEvents([...events, event]);
    setShowCreateDialog(false);
    setNewEvent({
      title: '',
      description: '',
      startDate: '',
      startTime: '09:00',
      endDate: '',
      endTime: '10:00',
      location: '',
      color: '#FF8B4E',
      isAllDay: false,
      repeatType: 'none',
      reminderMinutes: '30',
      attendees: []
    });
    toast({
      title: '创建成功',
      description: `事件「${event.title}」已创建`
    });
  };
  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter(e => e.id !== selectedEvent.id));
      setShowEventDialog(false);
      toast({
        title: '删除成功',
        description: `事件「${selectedEvent.title}」已删除`
      });
    }
  };
  const toggleAttendee = memberId => {
    setNewEvent(prev => ({
      ...prev,
      attendees: prev.attendees.includes(memberId) ? prev.attendees.filter(id => id !== memberId) : [...prev.attendees, memberId]
    }));
  };
  const isToday = date => {
    const today = new Date('2026-05-03');
    return date.toDateString() === today.toDateString();
  };
  const isSelected = date => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };
  const days = viewMode === 'month' ? getDaysInMonth(currentDate) : getWeekDays(currentDate);
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  return <div className="min-h-screen bg-[#0F0F1A] text-white pb-20">
      {/* 头部 */}
      <div className="bg-gradient-to-b from-[#1A1A2E] to-[#0F0F1A] p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={navigateBack} className="text-white">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold" style={{
          fontFamily: 'Playfair Display'
        }}>
            家庭日历
          </h1>
          <Button variant="ghost" size="icon" onClick={() => {
          setSelectedDate(new Date('2026-05-03'));
          setNewEvent({
            ...newEvent,
            startDate: '2026-05-03',
            endDate: '2026-05-03'
          });
          setShowCreateDialog(true);
        }} className="text-white">
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        {/* 日期导航 */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => {
          if (viewMode === 'month') navigateMonth(-1);else if (viewMode === 'week') navigateWeek(-1);else navigateDay(-1);
        }} className="text-white">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold" style={{
          fontFamily: 'Quicksand'
        }}>
            {formatDate(currentDate)}
          </h2>
          <Button variant="ghost" onClick={() => {
          if (viewMode === 'month') navigateMonth(1);else if (viewMode === 'week') navigateWeek(1);else navigateDay(1);
        }} className="text-white">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* 视图切换 */}
        <div className="flex gap-2 mb-4">
          <Button variant={viewMode === 'month' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('month')} className={viewMode === 'month' ? 'bg-[#FF8B4E]' : 'border-[#FF8B4E] text-[#FF8B4E]'}>
            <Grid3X3 className="h-4 w-4 mr-1" />月
          </Button>
          <Button variant={viewMode === 'week' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('week')} className={viewMode === 'week' ? 'bg-[#FF8B4E]' : 'border-[#FF8B4E] text-[#FF8B4E]'}>
            <Calendar className="h-4 w-4 mr-1" />周
          </Button>
          <Button variant={viewMode === 'day' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('day')} className={viewMode === 'day' ? 'bg-[#FF8B4E]' : 'border-[#FF8B4E] text-[#FF8B4E]'}>
            <List className="h-4 w-4 mr-1" />日
          </Button>
        </div>

        {/* 成员筛选 */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button variant={filterMember === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterMember('all')} className={filterMember === 'all' ? 'bg-[#9CCF4E]' : 'border-[#9CCF4E] text-[#9CCF4E]'}>
            全部
          </Button>
          {mockMembers.map(member => <Button key={member.id} variant={filterMember === member.id ? 'default' : 'outline'} size="sm" onClick={() => setFilterMember(member.id)} className={filterMember === member.id ? '' : 'border-white/30 text-white'} style={filterMember === member.id ? {
          backgroundColor: member.color
        } : {}}>
              <img src={member.avatar} alt={member.name} className="w-4 h-4 rounded-full mr-1" />
              {member.name}
            </Button>)}
        </div>
      </div>

      {/* 日历主体 */}
      <div className="p-4">
        {viewMode === 'month' && <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, index) => <div key={index} className="text-center text-sm font-medium text-[#8B7355] py-2">
                {day}
              </div>)}
            {days.map((day, index) => {
          const dayEvents = getDayEvents(day.date).filter(e => filterMember === 'all' || e.attendees.includes(filterMember));
          return <div key={index} onClick={() => handleDateClick(day.date)} className={`min-h-[80px] p-1 rounded-lg cursor-pointer transition-all ${day.isCurrentMonth ? 'bg-[#1A1A2E]' : 'bg-[#0F0F1A] opacity-50'} ${isToday(day.date) ? 'ring-2 ring-[#FF8B4E]' : ''} ${isSelected(day.date) ? 'bg-[#FF8B4E]/20' : ''}`}>
                  <div className={`text-sm mb-1 ${isToday(day.date) ? 'text-[#FF8B4E] font-bold' : ''}`}>
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => <div key={event.id} onClick={e => handleEventClick(event, e)} className="text-xs p-1 rounded truncate" style={{
                backgroundColor: event.color + '40',
                color: event.color
              }}>
                        {event.title}
                      </div>)}
                    {dayEvents.length > 2 && <div className="text-xs text-[#8B7355]">+{dayEvents.length - 2}</div>}
                  </div>
                </div>;
        })}
          </div>}

        {viewMode === 'week' && <div className="space-y-2">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {days.map((day, index) => <div key={index} className="text-center">
                  <div className="text-xs text-[#8B7355]">{weekDays[index]}</div>
                  <div className={`text-lg font-bold ${isToday(day.date) ? 'text-[#FF8B4E]' : ''}`}>
                    {day.date.getDate()}
                  </div>
                </div>)}
            </div>
            {days.map((day, index) => {
          const dayEvents = getDayEvents(day.date).filter(e => filterMember === 'all' || e.attendees.includes(filterMember));
          return <div key={index} onClick={() => handleDateClick(day.date)} className={`min-h-[60px] p-2 rounded-lg cursor-pointer ${day.isCurrentMonth ? 'bg-[#1A1A2E]' : 'bg-[#0F0F1A] opacity-50'}`}>
                  {dayEvents.length > 0 ? <div className="space-y-1">
                      {dayEvents.map(event => <div key={event.id} onClick={e => handleEventClick(event, e)} className="text-sm p-2 rounded flex items-center gap-2" style={{
                backgroundColor: event.color + '30',
                borderLeft: `3px solid ${event.color}`
              }}>
                          <span className="font-medium truncate">{event.title}</span>
                          {!event.isAllDay && <span className="text-xs opacity-70">
                              {formatTime(event.startTime)}
                            </span>}
                        </div>)}
                    </div> : <div className="text-sm text-[#8B7355] opacity-50">无事件</div>}
                </div>;
        })}
          </div>}

        {viewMode === 'day' && <div className="bg-[#1A1A2E] rounded-2xl p-4">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-[#FF8B4E]" style={{
            fontFamily: 'Playfair Display'
          }}>
                {currentDate.getDate()}
              </div>
              <div className="text-[#8B7355]">
                {currentDate.toLocaleDateString('zh-CN', {
              weekday: 'long',
              month: 'long',
              year: 'numeric'
            })}
              </div>
            </div>
            
            {getDayEvents(currentDate).filter(e => filterMember === 'all' || e.attendees.includes(filterMember)).length > 0 ? <div className="space-y-3">
                {getDayEvents(currentDate).filter(e => filterMember === 'all' || e.attendees.includes(filterMember)).map(event => <div key={event.id} onClick={e => handleEventClick(event, e)} className="p-4 rounded-xl cursor-pointer" style={{
            backgroundColor: event.color + '20',
            borderLeft: `4px solid ${event.color}`
          }}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold">{event.title}</h3>
                      <span className="text-sm" style={{
                color: event.color
              }}>
                        {event.isAllDay ? '全天' : `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`}
                      </span>
                    </div>
                    {event.location && <div className="flex items-center gap-1 text-sm text-[#8B7355] mb-1">
                        <MapPin className="h-3 w-3" />{event.location}
                      </div>}
                    {event.attendeeNames.length > 0 && <div className="flex items-center gap-1 text-sm text-[#8B7355]">
                        <Users className="h-3 w-3" />{event.attendeeNames.join(', ')}
                      </div>}
                  </div>)}
              </div> : <div className="text-center py-8 text-[#8B7355]">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>今日无事件</p>
                <Button variant="outline" size="sm" className="mt-4 border-[#FF8B4E] text-[#FF8B4E]" onClick={() => handleDateClick(currentDate)}>
                  <Plus className="h-4 w-4 mr-1" />添加事件
                </Button>
              </div>}
          </div>}
      </div>

      {/* 底部导航 */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A2E] border-t border-white/10 p-2 flex justify-around">
        <Button variant="ghost" onClick={() => navigateTo({
        pageId: 'family-calendar',
        params: {}
      })} className="text-[#FF8B4E]">
          <Calendar className="h-5 w-5" />
          <span className="text-xs">日历</span>
        </Button>
        <Button variant="ghost" onClick={() => navigateTo({
        pageId: 'family-events',
        params: {}
      })} className="text-white/60">
          <Bell className="h-5 w-5" />
          <span className="text-xs">提醒</span>
        </Button>
      </div>

      {/* 事件详情对话框 */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="bg-[#1A1A2E] text-white border-white/10">
          <DialogHeader>
            <DialogTitle style={{
            fontFamily: 'Playfair Display'
          }}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{
                backgroundColor: selectedEvent?.color
              }} />
                {selectedEvent?.title}
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedEvent?.description && <p className="text-[#8B7355]">{selectedEvent.description}</p>}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-[#FF8B4E]" />
                <span>
                  {selectedEvent?.isAllDay ? '全天事件' : `${formatTime(selectedEvent?.startTime)} - ${formatTime(selectedEvent?.endTime)}`}
                </span>
              </div>
              {selectedEvent?.location && <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-[#FF8B4E]" />
                  <span>{selectedEvent.location}</span>
                </div>}
              {selectedEvent?.attendeeNames?.length > 0 && <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-[#FF8B4E]" />
                  <span>{selectedEvent.attendeeNames.join(', ')}</span>
                </div>}
              {selectedEvent?.reminderMinutes > 0 && <div className="flex items-center gap-2 text-sm">
                  <Bell className="h-4 w-4 text-[#FF8B4E]" />
                  <span>提前 {selectedEvent.reminderMinutes} 分钟提醒</span>
                </div>}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <img src={selectedEvent?.creatorAvatar} alt={selectedEvent?.creatorName} className="w-6 h-6 rounded-full" />
              <span className="text-sm text-[#8B7355]">由 {selectedEvent?.creatorName} 创建</span>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="destructive" onClick={handleDeleteEvent} className="bg-[#E85A42]">
              删除
            </Button>
            <Button onClick={() => setShowEventDialog(false)} className="bg-[#FF8B4E]">
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 创建事件对话框 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#1A1A2E] text-white border-white/10 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{
            fontFamily: 'Playfair Display'
          }}>创建新事件</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-[#8B7355] mb-1 block">标题 *</label>
              <Input value={newEvent.title} onChange={e => setNewEvent({
              ...newEvent,
              title: e.target.value
            })} placeholder="输入事件标题" className="bg-[#0F0F1A] border-white/10 text-white" />
            </div>
            
            <div>
              <label className="text-sm text-[#8B7355] mb-1 block">描述</label>
              <Textarea value={newEvent.description} onChange={e => setNewEvent({
              ...newEvent,
              description: e.target.value
            })} placeholder="输入事件描述" className="bg-[#0F0F1A] border-white/10 text-white" />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="isAllDay" checked={newEvent.isAllDay} onChange={e => setNewEvent({
              ...newEvent,
              isAllDay: e.target.checked
            })} className="rounded" />
              <label htmlFor="isAllDay" className="text-sm">全天事件</label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm text-[#8B7355] mb-1 block">开始日期 *</label>
                <Input type="date" value={newEvent.startDate} onChange={e => setNewEvent({
                ...newEvent,
                startDate: e.target.value
              })} className="bg-[#0F0F1A] border-white/10 text-white" />
              </div>
              {!newEvent.isAllDay && <div>
                  <label className="text-sm text-[#8B7355] mb-1 block">开始时间</label>
                  <Input type="time" value={newEvent.startTime} onChange={e => setNewEvent({
                ...newEvent,
                startTime: e.target.value
              })} className="bg-[#0F0F1A] border-white/10 text-white" />
                </div>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm text-[#8B7355] mb-1 block">结束日期</label>
                <Input type="date" value={newEvent.endDate} onChange={e => setNewEvent({
                ...newEvent,
                endDate: e.target.value
              })} className="bg-[#0F0F1A] border-white/10 text-white" />
              </div>
              {!newEvent.isAllDay && <div>
                  <label className="text-sm text-[#8B7355] mb-1 block">结束时间</label>
                  <Input type="time" value={newEvent.endTime} onChange={e => setNewEvent({
                ...newEvent,
                endTime: e.target.value
              })} className="bg-[#0F0F1A] border-white/10 text-white" />
                </div>}
            </div>

            <div>
              <label className="text-sm text-[#8B7355] mb-1 block">地点</label>
              <Input value={newEvent.location} onChange={e => setNewEvent({
              ...newEvent,
              location: e.target.value
            })} placeholder="输入地点" className="bg-[#0F0F1A] border-white/10 text-white" />
            </div>

            <div>
              <label className="text-sm text-[#8B7355] mb-1 block">颜色</label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map(color => <div key={color.value} onClick={() => setNewEvent({
                ...newEvent,
                color: color.value
              })} className={`w-8 h-8 rounded-full cursor-pointer ${newEvent.color === color.value ? 'ring-2 ring-white' : ''}`} style={{
                backgroundColor: color.value
              }} title={color.label} />)}
              </div>
            </div>

            <div>
              <label className="text-sm text-[#8B7355] mb-1 block">重复</label>
              <Select value={newEvent.repeatType} onValueChange={value => setNewEvent({
              ...newEvent,
              repeatType: value
            })}>
                <SelectTrigger className="bg-[#0F0F1A] border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A2E] border-white/10">
                  <SelectItem value="none">不重复</SelectItem>
                  <SelectItem value="daily">每天</SelectItem>
                  <SelectItem value="weekly">每周</SelectItem>
                  <SelectItem value="monthly">每月</SelectItem>
                  <SelectItem value="yearly">每年</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-[#8B7355] mb-1 block">提醒</label>
              <Select value={newEvent.reminderMinutes} onValueChange={value => setNewEvent({
              ...newEvent,
              reminderMinutes: value
            })}>
                <SelectTrigger className="bg-[#0F0F1A] border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A2E] border-white/10">
                  {reminderOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-[#8B7355] mb-2 block">参与者</label>
              <div className="flex gap-2 flex-wrap">
                {mockMembers.map(member => <div key={member.id} onClick={() => toggleAttendee(member.id)} className={`flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer transition-all ${newEvent.attendees.includes(member.id) ? 'bg-[#FF8B4E]' : 'bg-[#0F0F1A] border border-white/10'}`}>
                    <img src={member.avatar} alt={member.name} className="w-5 h-5 rounded-full" />
                    <span className="text-sm">{member.name}</span>
                  </div>)}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-white/10">
              取消
            </Button>
            <Button onClick={handleCreateEvent} className="bg-[#FF8B4E]">
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}