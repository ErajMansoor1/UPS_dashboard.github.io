import React from 'react';
import { Line, GlobalMetrics } from '../types';
import { exportToCSV, exportToExcel } from '../utils/export';
import { Download, FileText, Table } from 'lucide-react';
import { format } from 'date-fns';

interface ExportButtonsProps {
  lines: Line[];
  metrics: GlobalMetrics;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ lines, metrics }) => {
  const handleExportCSV = () => {
    const data = {
      lines,
      metrics,
      timestamp: new Date().toISOString(),
    };
    
    const filename = `UPS_Dashboard_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    exportToCSV(data, filename);
  };

  const handleExportExcel = () => {
    const data = {
      lines,
      metrics,
      timestamp: new Date().toISOString(),
    };
    
    const filename = `UPS_Dashboard_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xls`;
    exportToExcel(data, filename);
  };

  return (
    <div className="card-3d p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Download className="w-5 h-5" />
        Export Data
      </h3>
      
      <div className="space-y-3">
        <button
          onClick={handleExportCSV}
          className="w-full btn-3d bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={lines.length === 0}
        >
          <FileText className="w-5 h-5" />
          Export to CSV
        </button>
        
        <button
          onClick={handleExportExcel}
          className="w-full btn-3d bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={lines.length === 0}
        >
          <Table className="w-5 h-5" />
          Export to Excel
        </button>
      </div>
      
      {lines.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
          Add some UPS lines to enable data export
        </p>
      )}
      
      <div className="mt-4 text-xs text-gray-400 dark:text-gray-500 space-y-1">
        <p>• CSV format compatible with Power BI</p>
        <p>• Excel format includes summary metrics</p>
        <p>• All calculated fields included automatically</p>
      </div>
    </div>
  );
};
