// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Loader2 } from 'lucide-react';
// @ts-ignore;
import { Button } from '@/components/ui';

export function ActionButton({
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'default',
  icon: Icon,
  className = ''
}) {
  const variants = {
    primary: 'bg-[#FF8B4E] hover:bg-[#FF6B35] text-white',
    secondary: 'bg-[#9CCF4E] hover:bg-[#8BC34A] text-white',
    danger: 'bg-[#E85A42] hover:bg-[#D14836] text-white',
    outline: 'border-2 border-[#FF8B4E] text-[#FF8B4E] hover:bg-[#FFF5E6] bg-transparent',
    ghost: 'text-[#FF6B35] hover:bg-[#FFF5E6] bg-transparent'
  };
  const sizes = {
    small: 'h-9 px-4 text-sm rounded-full',
    default: 'h-12 px-6 rounded-full',
    large: 'h-14 px-8 text-lg rounded-full'
  };
  return <Button onClick={onClick} disabled={disabled || loading} className={`
        ${variants[variant]}
        ${sizes[size]}
        font-bold transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95
        ${className}
      `} style={{
    fontFamily: 'Quicksand'
  }}>
      {loading ? <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          处理中...
        </> : <>
          {Icon && <Icon className="h-5 w-5 mr-2" />}
          {children}
        </>}
    </Button>;
}
export function FloatingActionButton({
  onClick,
  icon: Icon,
  label,
  className = ''
}) {
  return <button onClick={onClick} className={`
        fixed bottom-24 right-4 z-50
        bg-gradient-to-br from-[#FF8B4E] to-[#FF6B35]
        text-white rounded-full shadow-lg
        flex items-center gap-2 px-4 py-3
        hover:shadow-xl transition-all duration-200
        active:scale-95
        ${className}
      `} style={{
    fontFamily: 'Quicksand'
  }}>
      {Icon && <Icon className="h-5 w-5" />}
      {label && <span className="font-bold text-sm">{label}</span>}
    </button>;
}
export function IconButton({
  onClick,
  icon: Icon,
  label,
  active = false,
  className = ''
}) {
  return <button onClick={onClick} className={`
        flex flex-col items-center gap-1 p-2 rounded-xl
        transition-all duration-200
        ${active ? 'bg-[#FFF5E6] text-[#FF6B35]' : 'text-[#8B7355] hover:bg-[#FFF5E6] hover:text-[#FF6B35]'}
        ${className}
      `}>
      {Icon && <Icon className="h-6 w-6" />}
      {label && <span className="text-xs font-medium" style={{
      fontFamily: 'Nunito'
    }}>
          {label}
        </span>}
    </button>;
}