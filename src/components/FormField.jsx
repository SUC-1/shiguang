// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { AlertCircle } from 'lucide-react';

export function FormField({
  label,
  required = false,
  error,
  hint,
  children,
  className = ''
}) {
  return <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-sm font-semibold text-[#FF6B35]" style={{
      fontFamily: 'Quicksand'
    }}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>}
      <div className="relative">
        {children}
        {error && <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>}
      </div>
      {error && <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>}
      {hint && !error && <p className="text-xs text-[#8B7355]" style={{
      fontFamily: 'Nunito'
    }}>
          {hint}
        </p>}
    </div>;
}
export function FormSection({
  title,
  description,
  children,
  className = ''
}) {
  return <div className={`bg-white rounded-2xl p-6 shadow-md ${className}`}>
      {(title || description) && <div className="mb-4 pb-4 border-b border-[#FCEEB8]">
          {title && <h3 className="text-lg font-bold text-[#FF6B35]" style={{
        fontFamily: 'Quicksand'
      }}>
              {title}
            </h3>}
          {description && <p className="text-sm text-[#8B7355] mt-1" style={{
        fontFamily: 'Nunito'
      }}>
              {description}
            </p>}
        </div>}
      <div className="space-y-4">
        {children}
      </div>
    </div>;
}