import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DateHeaderProps {
  currentDate: string;
  onDateChange: (date: string) => void;
}

export const DateHeader: React.FC<DateHeaderProps> = ({ currentDate, onDateChange }) => {
  const dateObj = new Date(currentDate);
  
  const handlePrev = () => {
    const prev = new Date(dateObj);
    prev.setDate(prev.getDate() - 1);
    onDateChange(prev.toISOString().split('T')[0]);
  };

  const handleNext = () => {
    const next = new Date(dateObj);
    next.setDate(next.getDate() + 1);
    onDateChange(next.toISOString().split('T')[0]);
  };

  // Format date for display: "12月14日 星期六"
  const formattedDate = dateObj.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm mb-6 transition-all duration-300">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <button 
          onClick={handlePrev}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 active:bg-slate-200"
          aria-label="前一天"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex flex-col items-center justify-center cursor-default">
          <div className="flex items-center space-x-2 text-indigo-700 font-bold text-lg md:text-xl">
            <Calendar size={18} className="hidden xs:block" />
            <span>{formattedDate}</span>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            {currentDate}
          </div>
        </div>

        <button 
          onClick={handleNext}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 active:bg-slate-200"
          aria-label="后一天"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};