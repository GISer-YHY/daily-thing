import { DayLog, DEFAULT_TASKS } from '../types';

// Use relative path '/api'. 
// In development (Vite), you might need a proxy in vite.config.ts or just rely on manual handling.
// In production (Netlify), netlify.toml will proxy this to http://8.148.218.240:3000/api
const API_BASE_URL = '/api';

/**
 * Fetch daily log from the backend server
 */
export const getLogForDate = async (date: string): Promise<DayLog> => {
  try {
    const response = await fetch(`${API_BASE_URL}/logs/${date}`);
    
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
    const response = await fetch(`${API_BASE_URL}/logs`, {
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