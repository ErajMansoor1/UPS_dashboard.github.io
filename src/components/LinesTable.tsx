import React, { useState } from 'react';
import { Line } from '../types';
import { formatWatts } from '../utils/calculations';
import { Edit, Trash2, Plus, Eye } from 'lucide-react';
import { ReasonModal } from './ReasonModal';

interface LinesTableProps {
  lines: Line[];
  onEdit: (line: Line) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
  onViewStations: (line: Line) => void;
}

export const LinesTable: React.FC<LinesTableProps> = ({
  lines,
  onEdit,
  onDelete,
  onAdd,
  onViewStations
}) => {
  const [sortField, setSortField] = useState<keyof Line>('lineId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', reason: '' });

  const openReasonModal = (title: string, reason: string) => {
    setModalContent({ title, reason });
    setIsReasonModalOpen(true);
  };

  const closeReasonModal = () => {
    setIsReasonModalOpen(false);
  };

  const handleSort = (field: keyof Line) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedLines = [...lines].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle sorting for nested properties like upsUnits count
    if (sortField === 'upsUnits') {
      aValue = a.upsUnits.length;
      bValue = b.upsUnits.length;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
    }
  };

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'maintenance':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'faulty':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
    }
  };

  const getLoadPercentageColor = (percentage: number) => {
    if (percentage >= 95) return 'text-red-600 dark:text-red-400 font-bold';
    if (percentage >= 90) return 'text-red-500 dark:text-red-400 font-semibold';
    if (percentage >= 80) return 'text-orange-500 dark:text-orange-400 font-medium';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="card-3d overflow-hidden">
      <div className="p-6 border-b border-[var(--card-border)]">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            UPS Lines Management
          </h2>
          {onAdd && (
            <button
              onClick={onAdd}
              className="btn-3d bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Line
            </button>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100/50 dark:bg-gray-900/50">
            <tr>
              {[
                { key: 'lineId', label: 'Line ID' },
                { key: 'lineName', label: 'Line Name' },
                { key: 'companyUnitName', label: 'Company Unit' },
                { key: 'location', label: 'Location' },
                { key: 'upsUnits', label: 'UPS Count' },
                { key: 'loadPercentage', label: 'Load %' },
                { key: 'totalLoadWattPerLine', label: 'Load (W)' },
                { key: 'upsMaxLoadWatt', label: 'Max Capacity (W)' },
                { key: 'totalLoadDifference', label: 'Difference (W)' },
                { key: 'maintenanceStatus', label: 'UPS Status' },
                { key: 'status', label: 'Status' },
                { key: 'maintenanceNotes', label: 'Reason' },
              ].map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50"
                  onClick={() => handleSort(column.key as keyof Line)}
                >
                  {column.label}
                  {sortField === column.key && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                View
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--card-border)]">
            {sortedLines.map((line) => (
              <tr key={line.id} className="hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-300">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {line.lineId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {line.lineName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {line.companyUnitName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {line.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {line.upsUnits.length}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${getLoadPercentageColor(line.loadPercentage)}`}>
                  {line.loadPercentage.toFixed(1)}%
                  {line.loadPercentage >= 90 && (
                    <span className="ml-1" title="High Load Warning">⚠️</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatWatts(line.totalLoadWattPerLine)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatWatts(line.upsMaxLoadWatt)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                  line.totalLoadDifference < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                }`}>
                  {formatWatts(Math.abs(line.totalLoadDifference))}
                  {line.totalLoadDifference < 0 ? ' ⚠️' : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full cursor-pointer ${getMaintenanceStatusColor(line.maintenanceStatus || 'operational')}`}
                    onClick={() => openReasonModal('Maintenance Status Details', line.maintenanceNotes || 'No details provided.')}
                  >
                    {(line.maintenanceStatus || 'operational').charAt(0).toUpperCase() + (line.maintenanceStatus || 'operational').slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full cursor-pointer ${getStatusColor(line.status)}`}
                    onClick={() => openReasonModal('Status Details', line.maintenanceNotes || 'No details provided.')}
                  >
                    {line.status}
                  </span>
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white cursor-pointer"
                  onClick={() => openReasonModal('Full Reason', line.maintenanceNotes || 'No reason provided.')}
                >
                  {line.maintenanceNotes ? (
                    <div className="flex items-center">
                      <span>{`${line.maintenanceNotes.substring(0, 20)}...`}</span>
                      <Eye className="w-4 h-4 ml-2 text-blue-500" />
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                  <button
                    onClick={() => onViewStations(line)}
                    className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                    title="View Stations"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(line)}
                      className="p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 transition-colors"
                      title="Edit Line"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(line.id)}
                        className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                        title="Delete Line"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {lines.length === 0 && (
          <div className="text-center py-12 px-6">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No UPS lines found. Add your first line to get started.
            </p>
          </div>
        )}
      </div>
      <ReasonModal
        isOpen={isReasonModalOpen}
        onClose={closeReasonModal}
        title={modalContent.title}
        reason={modalContent.reason}
      />
    </div>
  );
};
