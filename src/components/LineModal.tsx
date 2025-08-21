import React, { useState, useEffect } from 'react';
import { Line, Station, UPS } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface LineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (line: Line) => void;
  line?: Line | null;
}

export const LineModal: React.FC<LineModalProps> = ({ isOpen, onClose, onSave, line }) => {
  const [formData, setFormData] = useState<Partial<Line>>({
    lineId: '',
    lineName: '',
    companyUnitName: '',
    location: '',
    lineSideName: '',
    viewTotalValue: 0,
    isActive: true,
    maintenanceStatus: 'operational',
    maintenanceDate: '',
    maintenanceNotes: '',
    stations: [],
    upsUnits: [],
  });

  useEffect(() => {
    if (line) {
      setFormData(line);
    } else {
      setFormData({
        lineId: '',
        lineName: '',
        companyUnitName: '',
        location: '',
        lineSideName: '',
        viewTotalValue: 0,
        isActive: true,
        maintenanceStatus: 'operational',
        maintenanceDate: '',
        maintenanceNotes: '',
        stations: [],
        upsUnits: [],
      });
    }
  }, [line, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const lineData: Line = {
      id: line?.id || uuidv4(),
      lineId: formData.lineId || '',
      lineName: formData.lineName || '',
      companyUnitName: formData.companyUnitName || '',
      location: formData.location || '',
      lineSideName: formData.lineSideName || '',
      viewTotalValue: formData.viewTotalValue || 0,
      isActive: formData.isActive || false,
      maintenanceStatus: formData.maintenanceStatus || 'operational',
      maintenanceDate: formData.maintenanceDate || '',
      maintenanceNotes: formData.maintenanceNotes || '',
      stations: formData.stations || [],
      upsUnits: formData.upsUnits || [],
      timestamp: new Date().toISOString(),
      totalLoadWattPerLine: 0,
      upsMaxLoadWatt: 0,
      totalLoadDifference: 0,
      loadPercentage: 0,
      alertLevel: 'none',
      status: 'Inactive',
    };

    onSave(lineData);
    onClose();
  };

  const addStation = () => {
    const newStation: Station = {
      id: uuidv4(),
      name: '',
      assetName: '',
      assetQuantity: 0,
      assetWatts: 0,
    };
    setFormData(prev => ({
      ...prev,
      stations: [...(prev.stations || []), newStation]
    }));
  };

  const updateStation = (index: number, field: keyof Station, value: any) => {
    setFormData(prev => ({
      ...prev,
      stations: prev.stations?.map((station, i) => 
        i === index ? { ...station, [field]: value } : station
      ) || []
    }));
  };

  const removeStation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stations: prev.stations?.filter((_, i) => i !== index) || []
    }));
  };

  const addUPS = () => {
    const newUPS: UPS = {
      id: uuidv4(),
      serialNumber: '',
      kva: 0,
    };
    setFormData(prev => ({
      ...prev,
      upsUnits: [...(prev.upsUnits || []), newUPS]
    }));
  };

  const updateUPS = (index: number, field: keyof UPS, value: any) => {
    setFormData(prev => ({
      ...prev,
      upsUnits: prev.upsUnits?.map((ups, i) => 
        i === index ? { ...ups, [field]: value } : ups
      ) || []
    }));
  };

  const removeUPS = (index: number) => {
    setFormData(prev => ({
      ...prev,
      upsUnits: prev.upsUnits?.filter((_, i) => i !== index) || []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="popup-3d w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">
            {line ? 'Edit Line' : 'Add New Line'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors transform hover:scale-110"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Line ID *
              </label>
              <input
                type="text"
                value={formData.lineId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, lineId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                placeholder="e.g., L1, Line 1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Line Name *
              </label>
              <input
                type="text"
                value={formData.lineName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, lineName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Unit Name *
              </label>
              <input
                type="text"
                value={formData.companyUnitName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, companyUnitName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                placeholder="e.g., IT Department, Finance Unit"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Line Side Name *
              </label>
              <input
                type="text"
                value={formData.lineSideName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, lineSideName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Manual Total Value (Watts)
              </label>
              <input
                type="number"
                value={formData.viewTotalValue || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, viewTotalValue: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                min="0"
                placeholder="Leave 0 to auto-calculate from assets"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                If 0, will auto-calculate from station assets
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                UPS Maintenance Status *
              </label>
              <select
                value={formData.maintenanceStatus || 'operational'}
                onChange={(e) => setFormData(prev => ({ ...prev, maintenanceStatus: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                required
              >
                <option value="operational">Operational</option>
                <option value="maintenance">Under Maintenance</option>
                <option value="pending">Maintenance Pending</option>
                <option value="faulty">Faulty/Issues</option>
              </select>
            </div>
            {(formData.maintenanceStatus === 'maintenance' || formData.maintenanceStatus === 'pending') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maintenance Date
                </label>
                <input
                  type="date"
                  value={formData.maintenanceDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, maintenanceDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>
            )}
            {(formData.maintenanceStatus !== 'operational' || formData.isActive === false) && (
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason / Notes
                </label>
                <textarea
                  value={formData.maintenanceNotes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, maintenanceNotes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  rows={3}
                  placeholder="Provide a reason for the current status..."
                />
              </div>
            )}
            <div className="flex items-center lg:col-span-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive || false}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Active Line
              </label>
            </div>
          </div>

          {/* UPS Units Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                UPS Units
              </h3>
              <button
                type="button"
                onClick={addUPS}
                className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add UPS
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.upsUnits?.map((ups, index) => (
                <div key={ups.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Serial Number
                    </label>
                  <input
                    type="text"
                    value={ups.serialNumber}
                    onChange={(e) => updateUPS(index, 'serialNumber', e.target.value)}
                    placeholder="Serial Number"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  />
                  </div>
                  <div className="w-full sm:w-24">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Per UPS KVA
                    </label>
                  <input
                    type="number"
                    value={ups.kva}
                    onChange={(e) => updateUPS(index, 'kva', Number(e.target.value))}
                    placeholder="KVA"
                    min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeUPS(index)}
                    className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    title="Remove UPS"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Stations Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Stations (Max 50)
              </h3>
              <button
                type="button"
                onClick={addStation}
                disabled={(formData.stations?.length || 0) >= 50}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Station
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.stations?.map((station, index) => (
                <div key={station.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg space-y-3 bg-white dark:bg-gray-800/50">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Line Station {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeStation(index)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      title="Remove Station"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={station.name}
                    onChange={(e) => updateStation(index, 'name', e.target.value)}
                    placeholder="Station Name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  />
                  <input
                    type="text"
                    value={station.assetName}
                    onChange={(e) => updateStation(index, 'assetName', e.target.value)}
                    placeholder="Asset Name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={station.assetQuantity}
                        onChange={(e) => updateStation(index, 'assetQuantity', Number(e.target.value))}
                        placeholder="Qty"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Watts Per Equipment
                      </label>
                      <input
                        type="number"
                        value={station.assetWatts}
                        onChange={(e) => updateStation(index, 'assetWatts', Number(e.target.value))}
                        placeholder="Watts"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                      />
                    </div>
                  </div>
                  {station.assetQuantity > 0 && station.assetWatts > 0 && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                      Total: {(station.assetQuantity * station.assetWatts).toLocaleString()} W
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-3d bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {line ? 'Update Line' : 'Create Line'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
};
