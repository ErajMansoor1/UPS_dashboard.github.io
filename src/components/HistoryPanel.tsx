import React, { useState, useEffect } from 'react';
import { ActivityLog } from '../types';
import { getActivityLogs } from '../utils/auth';
import { History, User, Edit, Plus, Trash2, Eye, Calendar, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose }) => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'create' | 'update' | 'delete'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    if (isOpen) {
      loadActivityLogs();
    }
  }, [isOpen]);

  const loadActivityLogs = () => {
    const logs = getActivityLogs();
    setActivityLogs(logs);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return Plus;
      case 'update':
        return Edit;
      case 'delete':
        return Trash2;
      case 'login':
      case 'logout':
        return User;
      default:
        return Eye;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'update':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      case 'delete':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'login':
        return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20';
      case 'logout':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50';
    }
  };

  const filterLogsByDate = (logs: ActivityLog[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (dateFilter) {
      case 'today':
        return logs.filter(log => new Date(log.timestamp) >= today);
      case 'week':
        return logs.filter(log => new Date(log.timestamp) >= weekAgo);
      case 'month':
        return logs.filter(log => new Date(log.timestamp) >= monthAgo);
      default:
        return logs;
    }
  };

  const filteredLogs = filterLogsByDate(
    filter === 'all' 
      ? activityLogs 
      : activityLogs.filter(log => log.action === filter)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Activity History</h2>
                <p className="text-indigo-100">Track all dashboard changes and user activities</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-indigo-200 transition-colors text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Action:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Period:</span>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              Showing {filteredLogs.length} of {activityLogs.length} activities
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">No activity found</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                {filter !== 'all' || dateFilter !== 'all' 
                  ? 'Try adjusting your filters to see more activities'
                  : 'Activities will appear here as users interact with the dashboard'
                }
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {filteredLogs.map((log) => {
                const ActionIcon = getActionIcon(log.action);
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all"
                  >
                    <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
                      <ActionIcon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {log.username}
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                            {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                          </span>
                          {log.entityName && (
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              • {log.entityName}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {log.details}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>Entity: {log.entityType}</span>
                        {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
