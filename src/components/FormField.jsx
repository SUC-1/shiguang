// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { AlertCircle } from 'lucide-react';

// 表单字段组件 - 带验证状态
const FormField = ({
  label,
  error,
  required = false,
  children,
  className = ''
}) => {
  return <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-semibold text-[#FF6B35] mb-2" style={{
      fontFamily: 'Quicksand'
    }}>
        {label}
        {required && <span className="text-[#E85A42] ml-1">*</span>}
      </label>
      {children}
      {error && <div className="flex items-center gap-1 mt-1 text-sm text-[#E85A42]">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>}
    </div>;
};
export { FormField };