// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { ArrowLeft, RefreshCw } from 'lucide-react';
// @ts-ignore;
import { Button } from '@/components/ui';

export function PageHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  showRefresh = false,
  onRefresh,
  loading = false,
  rightAction,
  className = ''
}) {
  return <div className={`bg-white shadow-sm sticky top-0 z-10 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && onBack && <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-[#FFF5E6] -ml-2">
                <ArrowLeft className="h-5 w-5 text-[#FF6B35]" />
              </Button>}
            <div>
              <h1 className="text-xl font-bold text-[#FF6B35]" style={{
              fontFamily: 'Quicksand'
            }}>
                {title}
              </h1>
              {subtitle && <p className="text-xs text-[#8B7355]" style={{
              fontFamily: 'Nunito'
            }}>
                  {subtitle}
                </p>}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {showRefresh && onRefresh && <Button variant="ghost" size="icon" onClick={onRefresh} disabled={loading} className="rounded-full hover:bg-[#FFF5E6]">
                <RefreshCw className={`h-5 w-5 text-[#FF8B4E] ${loading ? 'animate-spin' : ''}`} />
              </Button>}
            {rightAction}
          </div>
        </div>
      </div>
    </div>;
}
export function PageContainer({
  children,
  className = ''
}) {
  return <div className={`min-h-screen bg-[#FFF9E6] pb-20 ${className}`}>
      {children}
    </div>;
}
export function ContentCard({
  children,
  className = '',
  padding = 'normal'
}) {
  const paddingClass = {
    none: '',
    small: 'p-3',
    normal: 'p-4',
    large: 'p-6'
  }[padding];
  return <div className={`bg-white rounded-2xl shadow-md ${paddingClass} ${className}`}>
      {children}
    </div>;
}