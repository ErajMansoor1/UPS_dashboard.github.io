import React from 'react';
import { Line } from '../types';
import { formatWatts, formatNumber } from '../utils/calculations';
import { Zap, Battery, Percent, ShieldAlert, Package, Database } from 'lucide-react';

interface LineDetailCardsProps {
  line: Line;
  activeCard?: string | null;
}

const Card: React.FC<{ title: string; value: string; icon: React.ElementType; color: string; description: string }> = ({ title, value, icon: Icon, color, description }) => (
  <div className="card-3d p-6 text-left">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 truncate">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {value}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
      <div className={`${color} rounded-full p-3 text-white flex-shrink-0 ml-4 shadow-lg`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

const getRelevantCardTitles = (summaryCardTitle: string | null | undefined): string[] | null => {
  if (!summaryCardTitle) {
    return null; // show all
  }
  switch (summaryCardTitle) {
    case 'Line Total Equipments':
      return ['Total Equipments'];
    case 'Equipments Total Load':
      return ['Total Load', 'Load Percentage'];
    case 'Per UPS Max Load':
      return ['Max Capacity'];
    case 'Per UPS KVA':
      return ['Total KVA'];
    case 'Total KVA':
      return ['Total KVA'];
    case 'Total Difference':
      return ['Available Capacity', 'Load Percentage'];
    case 'High Load Lines':
      return ['Load Percentage', 'Available Capacity', 'Total Load', 'Max Capacity'];
    default:
      // For 'Maintenance Required', 'Active Lines', 'Inactive Lines', show all
      return null;
  }
};

export const LineDetailCards: React.FC<LineDetailCardsProps> = ({ line, activeCard }) => {
  const totalEquipments = line.stations.reduce((sum, station) => sum + station.assetQuantity, 0);
  const totalKva = line.upsUnits.reduce((sum, ups) => sum + ups.kva, 0);

  const getDifferenceState = () => {
    if (line.loadPercentage >= 95 || line.totalLoadDifference < 0) {
      return {
        color: 'bg-red-500',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        description: 'Line is Overloaded'
      };
    }
    if (line.loadPercentage >= 80) {
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
      title: 'Total Load',
      value: formatWatts(line.totalLoadWattPerLine),
      icon: Battery,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      description: 'Current power consumption',
    },
    {
      title: 'Max Capacity',
      value: formatWatts(line.upsMaxLoadWatt),
      icon: Zap,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      description: 'Maximum supported load',
    },
    {
      title: 'Load Percentage',
      value: `${line.loadPercentage.toFixed(1)}%`,
      icon: Percent,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      description: 'Current load vs max capacity',
    },
    {
      title: 'Available Capacity',
      value: formatWatts(Math.abs(line.totalLoadDifference)),
      icon: ShieldAlert,
      color: differenceState.color,
      bgColor: differenceState.bgColor,
      description: differenceState.description,
    },
    {
      title: 'Total Equipments',
      value: formatNumber(totalEquipments),
      icon: Package,
      color: 'bg-teal-500',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      description: 'Total assets on this line',
    },
    {
      title: 'Total KVA',
      value: `${totalKva.toFixed(1)} KVA`,
      icon: Database,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      description: 'Total KVA of all UPS units',
    },
  ];

  const relevantCardTitles = getRelevantCardTitles(activeCard);
  const displayedCards = relevantCardTitles
    ? cards.filter(card => relevantCardTitles.includes(card.title))
    : cards;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayedCards.map((card, index) => (
        <Card
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color}
          description={card.description}
        />
      ))}
    </div>
  );
};
