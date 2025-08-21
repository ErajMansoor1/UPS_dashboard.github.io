import React from 'react';
import { Line } from '../types';
import { X, Package, Zap } from 'lucide-react';
import { LineDetailCards } from './LineDetailCards';

interface StationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  line: Line | null;
  activeCard?: string | null;
}

export const StationsModal: React.FC<StationsModalProps> = ({ isOpen, onClose, line, activeCard }) => {
  if (!isOpen || !line) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="popup-3d w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-3xl font-bold text-white">
              Line Details: {line.lineName}
            </h2>
            <p className="text-indigo-200 mt-1">
              {line.lineId} • {line.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors transform hover:scale-125"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="overflow-y-auto">
          <div className="p-8 space-y-10">
            {/* Line Performance Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Line Performance Summary
            </h3>
            <LineDetailCards line={line} activeCard={activeCard} />
          </div>

          {/* Stations Information */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Stations ({line.stations.length})
            </h3>
            {line.stations.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No stations configured for this line.
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  Edit the line to add stations and their assets.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {line.stations.map((station, index) => (
                  <div 
                    key={station.id}
                    className="card-3d p-6"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                        <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                          Station {index + 1}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {station.name || 'Unnamed Station'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Asset:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {station.assetName || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Quantity:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {station.assetQuantity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Watt/Asset:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {station.assetWatts} W
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Load:</span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {(station.assetQuantity * station.assetWatts).toLocaleString()} W
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* UPS Information */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              UPS Units ({line.upsUnits.length})
            </h3>
            
            {line.upsUnits.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No UPS units configured for this line.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {line.upsUnits.map((ups, index) => (
                  <div 
                    key={ups.id}
                    className="card-3d p-6"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-xl">
                        <Zap className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      </div>
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                        UPS Unit {index + 1}
                      </h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Serial:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{ups.serialNumber || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">KVA:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{ups.kva}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
