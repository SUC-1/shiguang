// @ts-ignore;
import React from 'react';

// 状态徽章组件
const StatusBadge = ({
  status,
  statusMap = {},
  className = ''
}) => {
  const defaultMap = {
    pending: {
      text: '待处理',
      color: '#FF8B4E'
    },
    cooking: {
      text: '烹饪中',
      color: '#FF6B35'
    },
    completed: {
      text: '已完成',
      color: '#9CCF4E'
    },
    cancelled: {
      text: '已取消',
      color: '#8B7355'
    },
    planning: {
      text: '筹备中',
      color: '#FF8B4E'
    },
    ongoing: {
      text: '进行中',
      color: '#9CCF4E'
    },
    registered: {
      text: '已报名',
      color: '#FF8B4E'
    },
    attended: {
      text: '已参加',
      color: '#9CCF4E'
    },
    active: {
      text: '活跃',
      color: '#9CCF4E'
    },
    inactive: {
      text: '未激活',
      color: '#8B7355'
    }
  };
  const map = {
    ...defaultMap,
    ...statusMap
  };
  const config = map[status] || {
    text: status,
    color: '#8B7355'
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${className}`} style={{
    backgroundColor: config.color
  }}>
      {config.text}
    </span>;
};
export { StatusBadge };