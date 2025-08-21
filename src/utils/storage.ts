import { Line } from '../types';

const STORAGE_KEY = 'ups_dashboard_lines';

export const saveLinesToStorage = (lines: Line[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadLinesFromStorage = (): Line[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return [];
  }
};

export const clearStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};