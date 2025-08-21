import { User, ActivityLog } from '../types';
import { v4 as uuidv4 } from 'uuid';

const USERS_KEY = 'ups_dashboard_users';
const CURRENT_USER_KEY = 'ups_dashboard_current_user';
const ACTIVITY_LOG_KEY = 'ups_dashboard_activity_log';

// Default admin user
const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  username: 'admin',
  password: 'admin123',
  role: 'admin',
  createdAt: new Date().toISOString(),
  isActive: true,
};

export const initializeAuth = (): void => {
  const users = getUsers();
  if (users.length === 0) {
    saveUsers([DEFAULT_ADMIN]);
  }
};

export const getUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
};

export const saveUsers = (users: User[]): void => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

export const getCurrentUser = (): User | null => {
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const setCurrentUser = (user: User | null): void => {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (error) {
    console.error('Error setting current user:', error);
  }
};

export const login = (username: string, password: string): { success: boolean; user?: User; error?: string } => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password && u.isActive);
  
  if (user) {
    const updatedUser = { ...user, lastLogin: new Date().toISOString() };
    const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
    saveUsers(updatedUsers);
    setCurrentUser(updatedUser);
    
    logActivity({
      userId: user.id,
      username: user.username,
      action: 'login',
      entityType: 'user',
      details: 'User logged in successfully',
    });
    
    return { success: true, user: updatedUser };
  }
  
  return { success: false, error: 'Invalid username or password' };
};

export const logout = (): void => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    logActivity({
      userId: currentUser.id,
      username: currentUser.username,
      action: 'logout',
      entityType: 'user',
      details: 'User logged out',
    });
  }
  setCurrentUser(null);
};

export const createUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
  const newUser: User = {
    ...userData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  
  const users = getUsers();
  users.push(newUser);
  saveUsers(users);
  
  const currentUser = getCurrentUser();
  if (currentUser) {
    logActivity({
      userId: currentUser.id,
      username: currentUser.username,
      action: 'create',
      entityType: 'user',
      entityId: newUser.id,
      entityName: newUser.username,
      details: `Created new user: ${newUser.username}`,
    });
  }
  
  return newUser;
};

export const updateUser = (userId: string, updates: Partial<User>): boolean => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates };
    saveUsers(users);
    
    const currentUser = getCurrentUser();
    if (currentUser) {
      logActivity({
        userId: currentUser.id,
        username: currentUser.username,
        action: 'update',
        entityType: 'user',
        entityId: userId,
        entityName: users[userIndex].username,
        details: `Updated user: ${users[userIndex].username}`,
      });
    }
    
    return true;
  }
  
  return false;
};

export const deleteUser = (userId: string): boolean => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);
    saveUsers(users);
    
    const currentUser = getCurrentUser();
    if (currentUser) {
      logActivity({
        userId: currentUser.id,
        username: currentUser.username,
        action: 'delete',
        entityType: 'user',
        entityId: userId,
        entityName: deletedUser.username,
        details: `Deleted user: ${deletedUser.username}`,
      });
    }
    
    return true;
  }
  
  return false;
};

export const getActivityLogs = (): ActivityLog[] => {
  try {
    const stored = localStorage.getItem(ACTIVITY_LOG_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading activity logs:', error);
    return [];
  }
};

export const saveActivityLogs = (logs: ActivityLog[]): void => {
  try {
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Error saving activity logs:', error);
  }
};

export const logActivity = (activity: Omit<ActivityLog, 'id' | 'timestamp' | 'ipAddress'>): void => {
  const newLog: ActivityLog = {
    ...activity,
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    ipAddress: 'localhost', // In a real app, you'd get the actual IP
  };
  
  const logs = getActivityLogs();
  logs.unshift(newLog); // Add to beginning for newest first
  
  // Keep only last 1000 logs to prevent storage bloat
  if (logs.length > 1000) {
    logs.splice(1000);
  }
  
  saveActivityLogs(logs);
};

export const clearActivityLogs = (): void => {
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.role === 'admin') {
    saveActivityLogs([]);
    logActivity({
      userId: currentUser.id,
      username: currentUser.username,
      action: 'delete',
      entityType: 'user',
      details: 'Cleared all activity logs',
    });
  }
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin' || false;
};