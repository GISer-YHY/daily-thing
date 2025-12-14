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
    <div className="sticky top-0 z-30 mb-6 transition-all duration-300">
      <div className="bg-white/70 backdrop-blur-md border-b border-white/60 shadow-soft">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <button 
          onClick={handlePrev}
          className="p-2 rounded-full transition-colors text-slate-700 hover:bg-white/70 active:bg-white focus:outline-none focus:ring-2 focus:ring-violet-200/60"
          aria-label="前一天"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex flex-col items-center justify-center cursor-default">
          <div className="flex items-center space-x-2 font-extrabold text-lg md:text-xl">
            <Calendar size={18} className="hidden xs:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-700 via-fuchsia-600 to-cyan-600">
              {formattedDate}
            </span>
          </div>
          <div className="text-xs text-slate-500/80 font-medium">
            {currentDate}
          </div>
        </div>

        <button 
          onClick={handleNext}
          className="p-2 rounded-full transition-colors text-slate-700 hover:bg-white/70 active:bg-white focus:outline-none focus:ring-2 focus:ring-violet-200/60"
          aria-label="后一天"
        >
          <ChevronRight size={24} />
        </button>
        </div>
      </div>
    </div>
  );
};
