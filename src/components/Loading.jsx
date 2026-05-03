// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Loader2 } from 'lucide-react';

// 加载状态组件
const Loading = ({
  message = '加载中...',
  fullScreen = false,
  size = 'default',
  className = ''
}) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    default: 'h-10 w-10',
    large: 'h-12 w-12'
  };
  const container = fullScreen ? 'min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FF8B4E] to-[#FF6B35] flex items-center justify-center' : 'flex items-center justify-center py-12';
  return <div className={`${container} ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className={`${sizeClasses[size]} text-white animate-spin`} />
        <p className="text-white text-lg font-semibold" style={{
        fontFamily: 'Quicksand'
      }}>
          {message}
        </p>
      </div>
    </div>;
};
export { Loading };