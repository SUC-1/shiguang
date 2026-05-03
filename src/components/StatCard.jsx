// @ts-ignore;
import React from 'react';

// 统计卡片组件
const StatCard = ({
  icon: Icon,
  label,
  value,
  color = '#FF8B4E',
  className = ''
}) => {
  return <div className={`bg-white rounded-2xl shadow-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="h-6 w-6" style={{
        color
      }} />}
        <span className="text-sm text-[#8B7355]" style={{
        fontFamily: 'Nunito'
      }}>
          {label}
        </span>
      </div>
      <p className="text-3xl font-bold" style={{
      fontFamily: 'Quicksand',
      color: color || '#FF6B35'
    }}>
        {value}
      </p>
    </div>;
};
export { StatCard };