// @ts-ignore;
import React from 'react';

// 骨架屏卡片组件 - 用于列表加载
const SkeletonCard = ({
  className = ''
}) => {
  return <div className={`bg-white rounded-2xl p-4 shadow-sm ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="flex-1">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-3 w-16 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-100 rounded animate-pulse"></div>
        <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse"></div>
      </div>
    </div>;
};

// 骨架屏统计卡片
const SkeletonStatCard = ({
  className = ''
}) => {
  return <div className={`bg-white rounded-2xl p-4 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-3 w-12 bg-gray-100 rounded animate-pulse"></div>
      </div>
      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
    </div>;
};

// 骨架屏列表
const SkeletonList = ({
  count = 3,
  className = ''
}) => {
  return <div className={`space-y-3 ${className}`}>
      {Array.from({
      length: count
    }).map((_, i) => <SkeletonCard key={i} />)}
    </div>;
};

// 空状态组件
const EmptyState = ({
  icon: Icon,
  title = '暂无数据',
  description = '暂无相关内容',
  actionLabel,
  onAction
}) => {
  return <div className="flex flex-col items-center justify-center py-12 px-4">
      {Icon && <div className="w-20 h-20 bg-gradient-to-br from-[#FCEEB8] to-[#FF8B4E] rounded-full flex items-center justify-center mb-4 shadow-lg">
          <Icon className="h-10 w-10 text-white" />
        </div>}
      <h3 className="text-xl font-bold text-[#FF6B35] mb-2" style={{
      fontFamily: 'Quicksand'
    }}>
        {title}
      </h3>
      <p className="text-sm text-[#8B7355] text-center mb-4 max-w-xs" style={{
      fontFamily: 'Nunito'
    }}>
        {description}
      </p>
      {actionLabel && onAction && <button onClick={onAction} className="bg-gradient-to-r from-[#FF8B4E] to-[#FF6B35] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105" style={{
      fontFamily: 'Quicksand'
    }}>
          {actionLabel}
        </button>}
    </div>;
};

// 统计卡片组件
const StatCard = ({
  icon: Icon,
  label,
  value,
  color = '#FF8B4E',
  className = ''
}) => {
  return <div className={`bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-shadow ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
        backgroundColor: `${color}20`
      }}>
          <Icon className="h-5 w-5" style={{
          color
        }} />
        </div>
        <span className="text-sm text-[#8B7355]" style={{
        fontFamily: 'Nunito'
      }}>
          {label}
        </span>
      </div>
      <p className="text-3xl font-bold" style={{
      color,
      fontFamily: 'Quicksand'
    }}>
        {value}
      </p>
    </div>;
};

// 渐变按钮组件
const GradientButton = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = ''
}) => {
  const variants = {
    primary: 'from-[#FF8B4E] to-[#FF6B35]',
    secondary: 'from-[#9CCF4E] to-[#FF6B35]',
    danger: 'from-[#E85A42] to-[#FF6B35]'
  };
  return <button onClick={onClick} disabled={disabled} className={`bg-gradient-to-r ${variants[variant]} text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`} style={{
    fontFamily: 'Quicksand'
  }}>
      {children}
    </button>;
};

// 页面标题组件
const PageHeader = ({
  title,
  subtitle,
  action,
  onBack
}) => {
  return <div className="bg-white rounded-b-3xl shadow-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-2">
        {onBack && <button onClick={onBack} className="w-10 h-10 rounded-xl bg-[#FCEEB8] flex items-center justify-center hover:bg-[#FF8B4E] hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>}
        <h1 className="text-2xl font-bold text-[#FF6B35]" style={{
        fontFamily: 'Quicksand'
      }}>
          {title}
        </h1>
        {action}
      </div>
      {subtitle && <p className="text-sm text-[#8B7355]" style={{
      fontFamily: 'Nunito'
    }}>
          {subtitle}
        </p>}
    </div>;
};
export { SkeletonCard, SkeletonStatCard, SkeletonList, EmptyState, StatCard, GradientButton, PageHeader };