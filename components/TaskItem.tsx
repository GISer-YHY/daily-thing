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
      relative overflow-hidden rounded-xl border transition-all duration-300 group
      ${task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}
    `}>
      {/* Header / Title Section */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100/50 gap-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task.id);
            }}
            className={`
              transition-colors duration-300 flex-shrink-0 focus:outline-none
              ${task.completed ? 'text-green-600' : 'text-slate-300 hover:text-indigo-500'}
            `}
          >
            {task.completed ? <CheckCircle size={26} fill="currentColor" className="text-white" /> : <Circle size={26} />}
          </button>
          
          <input
            type="text"
            value={task.name}
            onChange={(e) => onNameChange(task.id, e.target.value)}
            placeholder="输入任务名称"
            className={`
              font-bold text-lg leading-tight bg-transparent border-b border-transparent focus:border-indigo-300 focus:outline-none w-full py-0.5
              transition-all duration-200
              ${task.completed ? 'text-green-800 line-through decoration-green-300' : 'text-slate-800 placeholder-slate-400'}
            `}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div className="flex items-center space-x-1 flex-shrink-0">
           <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap mr-1 hidden xs:inline-block ${task.completed ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
             {task.completed ? '已打卡' : '待办'}
           </span>
           <button 
             type="button"
             onClick={(e) => {
               e.stopPropagation();
               onDelete(task.id);
             }}
             className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
             title="删除任务"
           >
             <Trash2 size={18} />
           </button>
        </div>
      </div>

      {/* Content / Input Section */}
      <div className="p-4 bg-white/50">
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
              className="w-full min-h-[100px] bg-transparent border border-transparent focus:border-indigo-100 focus:bg-white rounded-lg focus:ring-2 focus:ring-indigo-100 p-2 text-slate-700 placeholder-slate-400 resize-none text-base leading-relaxed transition-all"
            />
          </div>
        </div>
      </div>
      
      {/* Decorative progress bar at bottom */}
      <div className={`h-1 w-full ${task.completed ? 'bg-green-400' : 'bg-slate-100'}`} />
    </div>
  );
};