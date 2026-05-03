// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';

// 空状态组件
const EmptyState = ({
  icon: Icon,
  title = '暂无数据',
  description = '暂无相关内容',
  actionLabel,
  onAction,
  className = ''
}) => {
  return <div className={`text-center py-12 ${className}`}>
      {Icon && <Icon className="h-16 w-16 mx-auto mb-4 text-[#FF8B4E] opacity-50" />}
      <h3 className="text-lg font-bold text-[#FF6B35] mb-2" style={{
      fontFamily: 'Quicksand'
    }}>
        {title}
      </h3>
      <p className="text-sm text-[#8B7355] mb-4" style={{
      fontFamily: 'Nunito'
    }}>
        {description}
      </p>
      {actionLabel && onAction && <Button className="bg-[#FF8B4E] text-white h-12 px-6 rounded-xl shadow-lg hover:bg-[#FF6B35]" onClick={onAction}>
          {actionLabel}
        </Button>}
    </div>;
};
export { EmptyState };