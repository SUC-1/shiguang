// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { ArrowRight } from 'lucide-react';
// @ts-ignore;
import { Button } from '@/components/ui';

// 操作卡片组件 - 用于快捷操作入口
const ActionCard = ({
  icon: Icon,
  title,
  description,
  onClick,
  color = '#FF8B4E',
  className = ''
}) => {
  return <div onClick={onClick} className={`bg-white rounded-2xl shadow-lg p-4 cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
        backgroundColor: `${color}20`
      }}>
          {Icon && <Icon className="h-6 w-6" style={{
          color
        }} />}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-[#FF6B35]" style={{
          fontFamily: 'Quicksand'
        }}>
            {title}
          </h3>
          {description && <p className="text-sm text-[#8B7355]" style={{
          fontFamily: 'Nunito'
        }}>
              {description}
            </p>}
        </div>
        <ArrowRight className="h-5 w-5 text-[#FF8B4E]" />
      </div>
    </div>;
};
export { ActionCard };