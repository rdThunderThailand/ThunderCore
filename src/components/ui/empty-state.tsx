import React from 'react';
import { DatabaseZap } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  title = "ไม่มีข้อมูล", 
  message = "ไม่พบข้อมูลสำหรับช่วงเวลาหรือเงื่อนไขที่เลือก", 
  icon,
  className = ""
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center w-full h-full min-h-[200px] p-6 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200 ${className}`}>
      <div className="flex items-center justify-center w-12 h-12 mb-4 bg-gray-100 rounded-full text-gray-400">
        {icon || <DatabaseZap className="w-6 h-6" />}
      </div>
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 max-w-xs">{message}</p>
    </div>
  );
}
