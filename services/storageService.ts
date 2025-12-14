import { DayLog, DEFAULT_TASKS } from '../types';

// Default to Netlify Functions (/api). If deploying with a separate backend
// (e.g. a cloud VM), set `VITE_API_BASE_URL` to something like:
//   https://example.com/api
//   http://<server-ip>:3000/api
const API_BASE_URL = ((import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined) ?? '/api';

const joinUrl = (base: string, path: string) => {
  const normalizedBase = base.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

/**
 * Fetch daily log from the backend server
 */
export const getLogForDate = async (date: string): Promise<DayLog> => {
  try {
    const response = await fetch(joinUrl(API_BASE_URL, `/logs/${date}`));
    
    if (response.status === 404) {
      // If no log exists for this date, return a new initialized structure
      return {
        date,
        tasks: DEFAULT_TASKS.map((name, index) => ({
          id: `${date}-${index}`,
          name,
          completed: false,
          content: ''
        }))
      };
    }

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading logs from API:", error);
    // Rethrow to let the UI handle the error state
    throw error;
  }
};

/**
 * Save daily log to the backend server
 */
export const saveLog = async (log: DayLog): Promise<void> => {
  try {
    const response = await fetch(joinUrl(API_BASE_URL, '/logs'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(log),
      keepalive: true, // Allows request to complete even if page unloads
    });

    if (!response.ok) {
      throw new Error(`Failed to save log. Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error saving log to API:", error);
    throw error;
  }
};
