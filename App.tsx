import React, { useState, useEffect, useRef } from 'react';
import { DayLog, Task } from './types';
import { getLogForDate, saveLog } from './services/storageService';
import { TaskItem } from './components/TaskItem';
import { DateHeader } from './components/DateHeader';
import { Loader2, Cloud, Check, Plus, AlertCircle } from 'lucide-react';

// Utility to get today's date string YYYY-MM-DD
const getTodayString = () => new Date().toISOString().split('T')[0];

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<string>(getTodayString());
  const [dayLog, setDayLog] = useState<DayLog | null>(null);
  const [isSaved, setIsSaved] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref to access the latest dayLog inside event listeners
  const dayLogRef = useRef<DayLog | null>(null);

  // Update ref whenever dayLog changes
  useEffect(() => {
    dayLogRef.current = dayLog;
  }, [dayLog]);

  // Load data when date changes (Async)
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setDayLog(null);
      setError(null);
      try {
        const log = await getLogForDate(currentDate);
        if (isMounted) {
          setDayLog(log);
          setIsSaved(true);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load data:", err);
          setError("无法连接到服务器，请检查网络或后端服务。");
          // Initialize empty state to allow UI to render even if offline/error
          setDayLog({ date: currentDate, tasks: [] }); 
        }
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [currentDate]);

  // Save data effect with debounce
  useEffect(() => {
    if (dayLog && !isSaved) {
      const timer = setTimeout(async () => {
        setIsSyncing(true);
        try {
          await saveLog(dayLog);
          setIsSaved(true);
          setError(null);
        } catch (err) {
          console.error("Auto-save failed:", err);
          setError("自动保存失败");
        } finally {
          setIsSyncing(false);
        }
      }, 1000); // Auto-save after 1 second of inactivity
      return () => clearTimeout(timer);
    }
  }, [dayLog, isSaved]);

  // Protection against accidental tab closing
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSaved && dayLogRef.current) {
        // Attempt to save immediately using keepalive fetch
        saveLog(dayLogRef.current).catch(console.error);
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSaved]);

  const updateLog = (newLog: DayLog) => {
    setDayLog(newLog);
    setIsSaved(false);
  };

  const handleTaskToggle = (taskId: string) => {
    if (!dayLog) return;
    const newTasks = dayLog.tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    updateLog({ ...dayLog, tasks: newTasks });
  };

  const handleContentChange = (taskId: string, content: string) => {
    if (!dayLog) return;
    const newTasks = dayLog.tasks.map(t => 
      t.id === taskId ? { ...t, content } : t
    );
    updateLog({ ...dayLog, tasks: newTasks });
  };

  const handleNameChange = (taskId: string, name: string) => {
    if (!dayLog) return;
    const newTasks = dayLog.tasks.map(t => 
      t.id === taskId ? { ...t, name } : t
    );
    updateLog({ ...dayLog, tasks: newTasks });
  };

  const handleAddTask = () => {
    if (!dayLog) return;
    const newTask: Task = {
      id: `${Date.now()}`,
      name: "",
      completed: false,
      content: ""
    };
    updateLog({ ...dayLog, tasks: [...dayLog.tasks, newTask] });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!dayLog) return;
    if (window.confirm('确定要删除这个任务吗？')) {
      const newTasks = dayLog.tasks.filter(t => t.id !== taskId);
      updateLog({ ...dayLog, tasks: newTasks });
    }
  };

  if (!dayLog && !error) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600" /></div>;

  const completedCount = dayLog ? dayLog.tasks.filter(t => t.completed).length : 0;
  const totalCount = dayLog ? dayLog.tasks.length : 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-32">
      {/* Sticky Header */}
      <DateHeader currentDate={currentDate} onDateChange={setCurrentDate} />

      <div className="max-w-2xl mx-auto px-4">
        
        {/* Title Area */}
        <header className="mb-6 px-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            每日进阶 <span className="text-indigo-600">.</span>
          </h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">记录博士之路与销售人生的每一个脚印</p>
        </header>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center text-sm border border-red-100">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-semibold text-slate-600">今日完成度</span>
            <span className="text-2xl font-bold text-indigo-600">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-700 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {dayLog && dayLog.tasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onToggle={handleTaskToggle} 
              onContentChange={handleContentChange}
              onNameChange={handleNameChange}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>

        {/* Add Task Button */}
        <button 
          onClick={handleAddTask}
          className="w-full py-4 mt-6 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 group focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
        >
          <Plus size={20} className="group-hover:scale-110 transition-transform"/>
          添加新任务
        </button>

        {/* Save Indicator - Fixed at bottom for visibility */}
        <div className="fixed bottom-6 right-6 z-40">
          <div className={`
            flex items-center px-4 py-2 rounded-full shadow-lg transition-all duration-300 backdrop-blur-md
            ${isSaved 
              ? 'bg-white/90 text-slate-600 border border-slate-200' 
              : 'bg-indigo-600 text-white'}
            ${error ? 'bg-red-500 text-white border-red-500' : ''}
          `}>
            {isSyncing ? (
               <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                <span className="text-xs font-bold">同步中...</span>
               </>
            ) : isSaved ? (
              <>
                <Check size={16} className="mr-2 text-green-500" />
                <span className="text-xs font-bold">已同步云端</span>
              </>
            ) : (
              <>
                <Cloud size={16} className="mr-2 animate-pulse" />
                <span className="text-xs font-bold">准备同步...</span>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;