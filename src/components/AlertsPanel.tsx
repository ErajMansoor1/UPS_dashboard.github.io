import React, { useState } from 'react';
import { Alert } from '../types';
import { AlertTriangle, Wrench, Zap, WifiOff, X, Check, Bell, BellOff } from 'lucide-react';

interface AlertsPanelProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onAcknowledge, onDismiss }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'high_load':
      case 'overload':
        return Zap;
      case 'maintenance':
        return Wrench;
      case 'faulty':
        return AlertTriangle;
      case 'offline':
        return WifiOff;
      default:
        return AlertTriangle;
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'high':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'low':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getSeverityBadgeColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' || alert.severity === filter
  );

  const unacknowledgedCount = alerts.filter(alert => !alert.acknowledged).length;

  return (
    <div className="card-3d">
      <div className="p-4 border-b border-[var(--card-border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {unacknowledgedCount > 0 ? (
                <Bell className="w-5 h-5 text-red-500 animate-pulse" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400" />
              )}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                System Alerts
              </h3>
            </div>
            {unacknowledgedCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unacknowledgedCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
        
        {isExpanded && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
              <button
                key={severity}
                onClick={() => setFilter(severity as any)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  filter === severity
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
                {severity !== 'all' && (
                  <span className="ml-1">
                    ({alerts.filter(a => a.severity === severity).length})
                  </span>
                )}
                {severity === 'all' && (
                  <span className="ml-1">({alerts.length})</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="max-h-96 overflow-y-auto">
          {filteredAlerts.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                {filter === 'all' ? 'No alerts at this time' : `No ${filter} severity alerts`}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                All systems operating normally
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {filteredAlerts.map((alert) => {
                const Icon = getAlertIcon(alert.type);
                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)} ${
                      alert.acknowledged ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {alert.lineName} ({alert.lineId})
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityBadgeColor(alert.severity)}`}>
                              {alert.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{alert.message}</p>
                          <p className="text-xs opacity-75">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {!alert.acknowledged && (
                          <button
                            onClick={() => onAcknowledge(alert.id)}
                            className="p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 transition-colors"
                            title="Acknowledge Alert"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDismiss(alert.id)}
                          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                          title="Dismiss Alert"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
