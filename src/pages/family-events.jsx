// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ChevronLeft, Bell, Calendar, Clock, MapPin, Users, Trash2, Edit, X, Plus, Check } from 'lucide-react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';

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
const mockReminders = [{
  id: 'rem_001',
  eventId: 'evt_001',
  reminderTime: '2026-05-04T17:00:00Z',
  isEnabled: true
}, {
  id: 'rem_002',
  eventId: 'evt_002',
  reminderTime: '2026-05-05T15:30:00Z',
  isEnabled: true
}, {
  id: 'rem_003',
  eventId: 'evt_003',
  reminderTime: '2026-05-06T07:00:00Z',
  isEnabled: true
}];
const reminderTimeOptions = [{
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
  value: '120',
  label: '2小时前'
}, {
  value: '1440',
  label: '1天前'
}, {
  value: '2880',
  label: '2天前'
}];
export default function FamilyEvents(props) {
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
  const [events, setEvents] = useState(mockEvents);
  const [reminders, setReminders] = useState(mockReminders);
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming/past/repeat
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventReminders, setEventReminders] = useState([]);
  const formatTime = dateStr => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const formatDate = dateStr => {
    const date = new Date(dateStr);
    const today = new Date('2026-05-03');
    const tomorrow = new Date('2026-05-04');
    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明天';
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
        weekday: 'short'
      });
    }
  };
  const getRelativeTime = dateStr => {
    const date = new Date(dateStr);
    const now = new Date('2026-05-03T12:00:00Z');
    const diff = date - now;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (minutes < 0) return '已过期';
    if (minutes < 60) return `${minutes}分钟后`;
    if (hours < 24) return `${hours}小时后`;
    return `${days}天后`;
  };
  const getUpcomingEvents = () => {
    const now = new Date('2026-05-03T12:00:00Z');
    return events.filter(event => new Date(event.startTime) >= now).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  };
  const getPastEvents = () => {
    const now = new Date('2026-05-03T12:00:00Z');
    return events.filter(event => new Date(event.startTime) < now).sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  };
  const getRepeatEvents = () => {
    return events.filter(event => event.repeatType !== 'none');
  };
  const handleOpenReminderSettings = event => {
    setSelectedEvent(event);
    const eventReminder = reminders.find(r => r.eventId === event.id);
    setEventReminders(eventReminder ? [eventReminder] : []);
    setShowReminderDialog(true);
  };
  const handleToggleReminder = reminderId => {
    setReminders(reminders.map(r => r.id === reminderId ? {
      ...r,
      isEnabled: !r.isEnabled
    } : r));
    toast({
      title: '设置已更新',
      description: '提醒设置已更改'
    });
  };
  const handleAddReminder = () => {
    if (!selectedEvent) return;
    const newReminder = {
      id: `rem_${Date.now()}`,
      eventId: selectedEvent.id,
      reminderTime: selectedEvent.startTime,
      isEnabled: true
    };
    setReminders([...reminders, newReminder]);
    toast({
      title: '提醒已添加',
      description: '您将在事件开始前收到提醒'
    });
  };
  const handleRemoveReminder = reminderId => {
    setReminders(reminders.filter(r => r.id !== reminderId));
    toast({
      title: '提醒已删除',
      description: '该事件的提醒已被移除'
    });
  };
  const getRepeatText = event => {
    const repeatTexts = {
      daily: '每天重复',
      weekly: '每周重复',
      monthly: '每月重复',
      yearly: '每年重复'
    };
    return repeatTexts[event.repeatType] || '';
  };
  const renderEventCard = (event, showReminder = true) => {
    const reminder = reminders.find(r => r.eventId === event.id);
    return <div key={event.id} className="bg-[#1A1A2E] rounded-2xl p-4 mb-3 cursor-pointer hover:ring-1 hover:ring-[#FF8B4E]/50 transition-all" onClick={() => navigateTo({
      pageId: 'family-calendar',
      params: {
        eventId: event.id
      }
    })}>
        <div className="flex items-start gap-3">
          <div className="w-1 h-full min-h-[60px] rounded-full" style={{
          backgroundColor: event.color
        }} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-white">{event.title}</h3>
              <span className="text-xs px-2 py-1 rounded-full" style={{
              backgroundColor: event.color + '30',
              color: event.color
            }}>
                {formatDate(event.startTime)}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-[#8B7355] mb-2">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {event.isAllDay ? '全天' : formatTime(event.startTime)}
              </span>
              {event.location && <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </span>}
            </div>

            {event.description && <p className="text-sm text-[#8B7355] mb-2 line-clamp-1">{event.description}</p>}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {event.attendeeNames.slice(0, 3).map((name, index) => <span key={index} className="text-xs bg-[#0F0F1A] px-2 py-1 rounded-full text-[#8B7355]">
                    {name}
                  </span>)}
                {event.attendeeNames.length > 3 && <span className="text-xs text-[#8B7355]">+{event.attendeeNames.length - 3}</span>}
              </div>
              
              {showReminder && <Button variant="ghost" size="sm" className={`h-7 ${reminder?.isEnabled ? 'text-[#9CCF4E]' : 'text-[#8B7355]'}`} onClick={e => {
              e.stopPropagation();
              handleOpenReminderSettings(event);
            }}>
                  <Bell className="h-4 w-4 mr-1" />
                  {reminder?.isEnabled ? '已设置' : '提醒'}
                </Button>}
            </div>

            {event.repeatType !== 'none' && <div className="mt-2 flex items-center gap-1 text-xs text-[#FF8B4E]">
                <RepeatIcon />
                {getRepeatText(event)}
              </div>}
          </div>
        </div>
      </div>;
  };
  const RepeatIcon = () => <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>;
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
            事件提醒
          </h1>
          <Button variant="ghost" size="icon" onClick={() => navigateTo({
          pageId: 'family-calendar',
          params: {}
        })} className="text-white">
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        {/* Tab 切换 */}
        <div className="flex gap-2">
          <Button variant={activeTab === 'upcoming' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('upcoming')} className={activeTab === 'upcoming' ? 'bg-[#FF8B4E]' : 'border-[#FF8B4E] text-[#FF8B4E]'}>
            即将到来
          </Button>
          <Button variant={activeTab === 'past' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('past')} className={activeTab === 'past' ? 'bg-[#FF8B4E]' : 'border-[#FF8B4E] text-[#FF8B4E]'}>
            历史事件
          </Button>
          <Button variant={activeTab === 'repeat' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('repeat')} className={activeTab === 'repeat' ? 'bg-[#FF8B4E]' : 'border-[#FF8B4E] text-[#FF8B4E]'}>
            重复事件
          </Button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-4">
        {activeTab === 'upcoming' && <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{
            fontFamily: 'Quicksand'
          }}>
                即将到来的事件
              </h2>
              <span className="text-sm text-[#8B7355]">
                {getUpcomingEvents().length} 个事件
              </span>
            </div>
            
            {getUpcomingEvents().length > 0 ? getUpcomingEvents().map(event => renderEventCard(event)) : <div className="text-center py-12 text-[#8B7355]">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">没有即将到来的事件</p>
                <p className="text-sm">点击右上角创建新事件</p>
              </div>}
          </div>}

        {activeTab === 'past' && <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{
            fontFamily: 'Quicksand'
          }}>
                历史事件
              </h2>
              <span className="text-sm text-[#8B7355]">
                {getPastEvents().length} 个事件
              </span>
            </div>
            
            {getPastEvents().length > 0 ? getPastEvents().map(event => renderEventCard(event, false)) : <div className="text-center py-12 text-[#8B7355]">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">暂无历史事件</p>
              </div>}
          </div>}

        {activeTab === 'repeat' && <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{
            fontFamily: 'Quicksand'
          }}>
                重复事件
              </h2>
              <span className="text-sm text-[#8B7355]">
                {getRepeatEvents().length} 个事件
              </span>
            </div>
            
            {getRepeatEvents().length > 0 ? getRepeatEvents().map(event => renderEventCard(event)) : <div className="text-center py-12 text-[#8B7355]">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">没有重复事件</p>
                <p className="text-sm">在日历中创建重复事件</p>
              </div>}
          </div>}
      </div>

      {/* 底部导航 */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A2E] border-t border-white/10 p-2 flex justify-around">
        <Button variant="ghost" onClick={() => navigateTo({
        pageId: 'family-calendar',
        params: {}
      })} className="text-white/60">
          <Calendar className="h-5 w-5" />
          <span className="text-xs">日历</span>
        </Button>
        <Button variant="ghost" onClick={() => navigateTo({
        pageId: 'family-events',
        params: {}
      })} className="text-[#FF8B4E]">
          <Bell className="h-5 w-5" />
          <span className="text-xs">提醒</span>
        </Button>
      </div>

      {/* 提醒设置对话框 */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent className="bg-[#1A1A2E] text-white border-white/10">
          <DialogHeader>
            <DialogTitle style={{
            fontFamily: 'Playfair Display'
          }}>
              提醒设置
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && <div className="space-y-4">
              <div className="bg-[#0F0F1A] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{
                backgroundColor: selectedEvent.color
              }} />
                  <h3 className="font-bold">{selectedEvent.title}</h3>
                </div>
                <div className="text-sm text-[#8B7355]">
                  {selectedEvent.isAllDay ? formatDate(selectedEvent.startTime) + ' 全天' : formatDate(selectedEvent.startTime) + ' ' + formatTime(selectedEvent.startTime)}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">提醒时间</h4>
                <div className="space-y-2">
                  {eventReminders.length > 0 ? eventReminders.map(reminder => <div key={reminder.id} className="flex items-center justify-between bg-[#0F0F1A] rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-[#FF8B4E]" />
                          <span className="text-sm">
                            {getRelativeTime(selectedEvent.startTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleToggleReminder(reminder.id)} className={`w-10 h-6 rounded-full transition-colors ${reminder.isEnabled ? 'bg-[#9CCF4E]' : 'bg-gray-600'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${reminder.isEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                          </button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#E85A42]" onClick={() => handleRemoveReminder(reminder.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>) : <div className="text-center py-4 text-[#8B7355]">
                      <p>暂无提醒设置</p>
                    </div>}
                </div>
                
                <Button variant="outline" className="w-full mt-3 border-[#FF8B4E] text-[#FF8B4E]" onClick={handleAddReminder}>
                  <Plus className="h-4 w-4 mr-1" />添加提醒
                </Button>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">快速设置</h4>
                <div className="grid grid-cols-3 gap-2">
                  {reminderTimeOptions.slice(0, 6).map(option => <Button key={option.value} variant="outline" size="sm" className="border-white/10 text-[#8B7355]" onClick={() => {
                handleAddReminder();
                setShowReminderDialog(false);
              }}>
                      {option.label}
                    </Button>)}
                </div>
              </div>
            </div>}

          <DialogFooter>
            <Button onClick={() => setShowReminderDialog(false)} className="bg-[#FF8B4E]">
              完成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}