import React, { useState, useEffect } from 'react';
import { User, ActivityLog, Line } from '../types';
import { getUsers, createUser, updateUser, deleteUser, getActivityLogs, clearActivityLogs, getCurrentUser } from '../utils/auth';
import { loadLinesFromStorage, clearStorage } from '../utils/storage';
import { Plus, Trash2, Eye, EyeOff, Shield, Activity, Database, Users, History, Settings, Download, Home, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface AdminPanelProps {
  onClose: () => void;
  onNavigateToDashboard: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, onNavigateToDashboard }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'activity' | 'data' | 'settings'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'user' as 'admin' | 'user',
    isActive: true,
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [settings, setSettings] = useState({
    autoSave: true,
    saveInterval: 5, // in seconds
  });

  useEffect(() => {
    loadData();
    setCurrentUser(getCurrentUser());
    const savedSettings = localStorage.getItem('dashboard_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
      }
    }
  }, []);

  const loadData = () => {
    setUsers(getUsers());
    setActivityLogs(getActivityLogs());
    setLines(loadLinesFromStorage());
  };

  const handleCreateUser = () => {
    if (newUser.username && newUser.password) {
      createUser(newUser);
      setNewUser({ username: '', password: '', role: 'user', isActive: true });
      setIsUserModalOpen(false);
      loadData();
    }
  };

  const handleUpdateUser = (userId: string, updates: Partial<User>) => {
    updateUser(userId, updates);
    loadData();
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
      loadData();
    }
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all activity logs?')) {
      clearActivityLogs();
      loadData();
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all dashboard data? This action cannot be undone.')) {
      clearStorage();
      loadData();
    }
  };

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    localStorage.setItem('dashboard_settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const exportActivityLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity Name', 'Details'].join(','),
      ...activityLogs.map(log => [
        format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        log.username,
        log.action,
        log.entityType,
        log.entityName || '',
        `"${log.details}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity_logs_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const tabs = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'activity', label: 'Activity Logs', icon: History },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen">
      <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 p-6 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 p-4 rounded-2xl backdrop-blur-lg shadow-lg">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Admin Control Panel</h1>
                <p className="text-purple-200 mt-1">Complete System Management & Control</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onNavigateToDashboard}
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-xl transition-all duration-300 backdrop-blur-sm"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
              <button
                onClick={onClose}
                className="flex items-center gap-2 bg-red-500 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-xl transition-all duration-300 backdrop-blur-sm"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-8 py-5 font-semibold transition-all duration-300 whitespace-nowrap transform hover:-translate-y-1 ${
                  activeTab === tab.id
                    ? 'border-b-4 border-purple-600 text-purple-700 dark:text-purple-400 bg-white dark:bg-gray-800 shadow-2xl'
                    : 'text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50'
                }`}
              >
                <tab.icon className="w-6 h-6" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto min-h-[calc(100vh-200px)] bg-gray-100 dark:bg-gray-900/50">
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Create, edit, and manage user accounts</p>
                </div>
                <button
                  onClick={() => setIsUserModalOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Username</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Password</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-200">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span className="font-mono">
                              {showPasswords[user.id] ? user.password : '••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(user.id)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                              {showPasswords[user.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin' 
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm'
                              : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm'
                          }`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.isActive 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm'
                              : 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-sm'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {user.lastLogin ? format(new Date(user.lastLogin), 'MMM dd, yyyy HH:mm') : 'Never'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* An admin can act on other users, but not themselves. */}
                            {currentUser?.role === 'admin' && currentUser.id !== user.id && (
                              <>
                                <button
                                  onClick={() => handleUpdateUser(user.id, { isActive: !user.isActive })}
                                  className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                                    user.isActive
                                      ? 'text-red-600 hover:text-red-800 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                      : 'text-green-600 hover:text-green-800 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                                  }`}
                                  title={user.isActive ? 'Deactivate' : 'Activate'}
                                >
                                  <Activity className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-2 rounded-lg text-red-600 hover:text-red-800 dark:text-red-400 transition-all duration-200 hover:scale-105 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Activity Logs Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Logs</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor all system activities and user actions</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={exportActivityLogs}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={handleClearLogs}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear Logs
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden max-h-96 overflow-y-auto shadow-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {activityLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-200">
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {log.username}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            log.action === 'create' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                            log.action === 'update' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                            log.action === 'delete' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300'
                          }`}>
                            {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {activityLogs.length === 0 && (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No activity logs found
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Data Management Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Data Management</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor system data and perform maintenance operations</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">Total Lines</h4>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{lines.length}</p>
                  <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">UPS lines configured</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h4 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">Active Users</h4>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {users.filter(u => u.isActive).length}
                  </p>
                  <p className="text-green-700 dark:text-green-300 text-sm mt-2">Currently active</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h4 className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-2">Activity Logs</h4>
                  <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{activityLogs.length}</p>
                  <p className="text-purple-700 dark:text-purple-300 text-sm mt-2">Total activities</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800 shadow-lg">
                <h4 className="text-lg font-bold text-red-900 dark:text-red-100 mb-4">Danger Zone</h4>
                <div className="space-y-3">
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={handleClearData}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All Dashboard Data
                    </button>
                  )}
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    This will permanently delete all UPS lines, stations, and related data. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Configure system behavior and preferences</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Auto-Save Configuration</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Auto-save to Excel</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Automatically save data changes to Excel files</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={settings.autoSave}
                            onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                            className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Save Interval</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Time delay after changes before auto-save</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={settings.saveInterval}
                            onChange={(e) => handleSettingChange('saveInterval', parseInt(e.target.value, 10) || 1)}
                            className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                            min="1"
                        />
                        <span className="text-gray-600 dark:text-gray-400">seconds</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-end">
                    <button
                        onClick={handleSaveSettings}
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        Save Settings
                    </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Security Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Session Timeout</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Automatic logout after inactivity</p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-semibold">24 hours</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Activity Logging</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Track all user actions</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                      Enabled
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Creation Modal */}
        {isUserModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Create New User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'admin' | 'user' }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsUserModalOpen(false)}
                  className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
