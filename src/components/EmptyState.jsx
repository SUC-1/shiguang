// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Inbox, Search, FileX, AlertCircle } from 'lucide-react';
// @ts-ignore;
import { Button } from '@/components/ui';

const iconMap = {
  inbox: Inbox,
  search: Search,
  file: FileX,
  alert: AlertCircle
};
export function EmptyState({
  title = '暂无数据',
  description = '还没有任何内容',
  icon = 'inbox',
  actionText,
  onAction,
  className = ''
}) {
  const Icon = iconMap[icon] || Inbox;
  return <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="w-20 h-20 rounded-full bg-[#FFF5E6] flex items-center justify-center mb-4">
        <Icon className="h-10 w-10 text-[#FF8B4E]" />
      </div>
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
      {actionText && onAction && <Button onClick={onAction} className="bg-[#FF8B4E] hover:bg-[#FF6B35] text-white rounded-full px-6">
          {actionText}
        </Button>}
    </div>;
}
export function LoadingState({
  message = '加载中...',
  className = ''
}) {
  return <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-[#FFF5E6]"></div>
        <div className="absolute inset-0 rounded-full border-4 border-[#FF8B4E] border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm text-[#8B7355]" style={{
      fontFamily: 'Nunito'
    }}>
        {message}
      </p>
    </div>;
}
export function ErrorState({
  title = '加载失败',
  description = '请稍后重试',
  onRetry,
  className = ''
}) {
  return <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-red-500 mb-2" style={{
      fontFamily: 'Quicksand'
    }}>
        {title}
      </h3>
      <p className="text-sm text-[#8B7355] mb-4" style={{
      fontFamily: 'Nunito'
    }}>
        {description}
      </p>
      {onRetry && <Button onClick={onRetry} variant="outline" className="border-[#FF8B4E] text-[#FF8B4E] hover:bg-[#FFF5E6] rounded-full px-6">
          重新加载
        </Button>}
    </div>;
}