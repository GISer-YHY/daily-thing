import React from 'react';
import { Task } from '../types';
import { CheckCircle, Circle, Edit3, Trash2 } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onContentChange: (id: string, content: string) => void;
  onNameChange: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onContentChange, onNameChange, onDelete }) => {
  return (
    <div className={`
      relative overflow-hidden rounded-2xl border transition-all duration-300 group backdrop-blur-md
      ${task.completed ? 'bg-emerald-50/70 border-emerald-200/50 shadow-soft' : 'bg-white/70 border-white/60 shadow-soft hover:shadow-glow'}
    `}>
      {/* Header / Title Section */}
      <div className="flex items-center justify-between p-4 border-b border-white/50 gap-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task.id);
            }}
            className={`
              transition-colors duration-300 flex-shrink-0 focus:outline-none
              ${task.completed ? 'text-emerald-600' : 'text-slate-300 hover:text-violet-600'}
            `}
          >
            {task.completed ? (
              <CheckCircle size={26} className="text-emerald-600" />
            ) : (
              <Circle size={26} className="text-slate-300 group-hover:text-violet-500 transition-colors" />
            )}
          </button>
          
          <input
            type="text"
            value={task.name}
            onChange={(e) => onNameChange(task.id, e.target.value)}
            placeholder="输入任务名称"
            className={`
              font-extrabold text-lg leading-tight bg-transparent border-b border-transparent focus:border-violet-300/80 focus:outline-none w-full py-0.5
              transition-all duration-200
              ${task.completed ? 'text-emerald-800 line-through decoration-emerald-300' : 'text-slate-800 placeholder-slate-400'}
            `}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div className="flex items-center space-x-1 flex-shrink-0">
           <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap mr-1 hidden xs:inline-block border ${task.completed ? 'bg-emerald-100/70 text-emerald-700 border-emerald-200/50' : 'bg-white/60 text-slate-600 border-slate-200/50'}`}>
             {task.completed ? '已打卡' : '待办'}
           </span>
           <button 
             type="button"
             onClick={(e) => {
               e.stopPropagation();
               onDelete(task.id);
             }}
             className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-rose-200/60"
             title="删除任务"
           >
             <Trash2 size={18} />
           </button>
        </div>
      </div>

      {/* Content / Input Section */}
      <div className="p-4 bg-white/45">
        <div className="flex items-start space-x-2">
          <Edit3 size={18} className="text-slate-400 mt-1 flex-shrink-0" />
          <div className="w-full">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              内容 / 记录
            </label>
            <textarea
              value={task.content}
              onChange={(e) => onContentChange(task.id, e.target.value)}
              placeholder={`点击此处记录详细情况...`}
              className="w-full min-h-[100px] bg-transparent border border-transparent focus:border-violet-200/70 focus:bg-white/80 rounded-xl focus:ring-2 focus:ring-violet-200/60 p-2 text-slate-700 placeholder-slate-400 resize-none text-base leading-relaxed transition-all"
            />
          </div>
        </div>
      </div>
      
      {/* Decorative progress bar at bottom */}
      <div className={`h-1 w-full ${task.completed ? 'bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500' : 'bg-slate-100/80'}`} />
    </div>
  );
};
