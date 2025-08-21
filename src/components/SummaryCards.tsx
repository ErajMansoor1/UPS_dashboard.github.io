import React from 'react';
import { GlobalMetrics } from '../types';
import { formatWatts, formatNumber } from '../utils/calculations';
import { Activity, Battery, AlertTriangle, Wrench, ShieldAlert, Database, Package, Zap, Power, PowerOff } from 'lucide-react';

interface SummaryCardsProps {
  metrics: GlobalMetrics;
  onCardClick?: (cardTitle: string) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  metrics, onCardClick,
}) => {
  const globalLoadPercentage = metrics.upsMaxLoadWatt > 0 ? (metrics.totalLoadWatt / metrics.upsMaxLoadWatt) * 100 : 0;

  const getDifferenceState = () => {
    if (globalLoadPercentage >= 95 || metrics.totalDifference < 0) {
      return {
        color: 'bg-red-500',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        description: 'System Overloaded'
      };
    }
    if (globalLoadPercentage >= 80) {
      return {
        color: 'bg-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        description: 'High load, nearing capacity'
      };
    }
    return {
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      description: 'Capacity available'
    };
  };

  const differenceState = getDifferenceState();

  const cards = [
    {
      title: 'Line Total Equipments',
      value: formatNumber(metrics.totalEquipments),
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      description: 'Total assets across all lines',
    },
    {
      title: 'Equipments Total Load',
      value: formatWatts(metrics.totalLoadPerUpsWatt),
      icon: Battery,
      color: 'bg-teal-500',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      description: 'Average load distribution per UPS',
    },
    {
      title: 'Per UPS Max Load',
      value: formatWatts(metrics.perUpsMaxLoadWatt),
      icon: Activity,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      description: 'Average max capacity per UPS',
    },
    {
      title: 'Per UPS KVA',
      value: `${metrics.perUpsKva.toFixed(1)} KVA`,
      icon: Database,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      description: 'Average KVA capacity per UPS unit',
    },
    {
      title: 'Total KVA',
      value: `${metrics.totalKva.toFixed(1)} KVA`,
      icon: Zap,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      description: 'Total KVA of all UPS units',
    },
    {
      title: 'Total Difference',
      value: formatWatts(Math.abs(metrics.totalDifference)),
      icon: AlertTriangle,
      color: differenceState.color,
      bgColor: differenceState.bgColor,
      description: differenceState.description,
    },
    {
      title: 'High Load Lines',
      value: formatNumber(metrics.highLoadCount),
      icon: ShieldAlert,
      color: metrics.highLoadCount > 0 ? 'bg-orange-500' : 'bg-green-500',
      bgColor: metrics.highLoadCount > 0 ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-green-50 dark:bg-green-900/20',
      description: 'Lines with >80% load capacity',
    },
    {
      title: 'Maintenance Required',
      value: formatNumber(metrics.maintenanceCount + metrics.faultyCount),
      icon: Wrench,
      color: (metrics.maintenanceCount + metrics.faultyCount) > 0 ? 'bg-yellow-500' : 'bg-green-500',
      bgColor: (metrics.maintenanceCount + metrics.faultyCount) > 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-green-50 dark:bg-green-900/20',
      description: 'UPS units needing attention',
    },
    {
      title: 'Active Lines',
      value: formatNumber(metrics.activeCount),
      icon: Power,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      description: 'Currently operational lines',
    },
    {
      title: 'Inactive Lines',
      value: formatNumber(metrics.inactiveCount),
      icon: PowerOff,
      color: 'bg-gray-500',
      bgColor: 'bg-gray-50 dark:bg-gray-800/50',
      description: 'Lines not in operation',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
      {cards.map((card, index) => (
        <button
          type="button"
          key={index}
          onClick={onCardClick ? () => onCardClick(card.title) : undefined}
          className={`card-3d p-4 lg:p-6 text-left transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl ${onCardClick ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 truncate">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {card.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {card.description}
              </p>
            </div>
            <div className={`${card.bgColor} rounded-full p-3 text-white flex-shrink-0 ml-4`}>
              <div className={`${card.color} rounded-full p-2 shadow-lg`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
