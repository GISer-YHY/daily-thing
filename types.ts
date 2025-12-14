export interface Task {
  id: string;
  name: string;
  completed: boolean;
  content: string;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  tasks: Task[];
  // Removed aiSummary as requested
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export const DEFAULT_TASKS = [
  "+1的销售人生",
  "科研绘图",
  "博士复习",
  "时间序列预测",
  "博士材料打印"
];