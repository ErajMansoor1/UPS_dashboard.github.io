import { Line, GlobalMetrics, ExportData } from '../types';
import { format } from 'date-fns';

class AutoSaveManager {
  private saveInterval: NodeJS.Timeout | null = null;
  private lastSaveTime: number = 0;
  private readonly SAVE_DELAY = 5000; // 5 seconds after last change

  startAutoSave(lines: Line[], metrics: GlobalMetrics): void {
    // Clear existing interval
    if (this.saveInterval) {
      clearTimeout(this.saveInterval);
    }

    // Set new save timeout
    this.saveInterval = setTimeout(() => {
      this.saveToExcel(lines, metrics);
    }, this.SAVE_DELAY);
  }

  private saveToExcel(lines: Line[], metrics: GlobalMetrics): void {
    try {
      const data: ExportData = {
        lines,
        metrics,
        timestamp: new Date().toISOString(),
      };

      const csvContent = this.generateCSVContent(data);
      const filename = `UPS_Dashboard_AutoSave_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`;
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      this.lastSaveTime = Date.now();
      console.log(`Auto-saved data to ${filename}`);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  private generateCSVContent(data: ExportData): string {
    const separator = ',';
    
    // Add timestamp header
    let csvContent = `UPS Dashboard Auto-Save Report\n`;
    csvContent += `Generated: ${format(new Date(data.timestamp), 'yyyy-MM-dd HH:mm:ss')}\n\n`;
    
    // Headers
    const headers = [
      'Line ID',
      'Line Name',
      'Company Unit',
      'Location',
      'Line Side Name',
      'UPS Count',
      'Total KVA',
      'UPS Serial Numbers',
      'Stations Count',
      'Manual Total Value (W)',
      'Calculated Load (W)',
      'UPS Max Load (W)',
      'Load Difference (W)',
      'Load Percentage',
      'Status',
      'Maintenance Status',
      'Active',
      'Last Updated'
    ];

    csvContent += headers.join(separator) + '\n';

    // Data rows
    data.lines.forEach(line => {
      const upsSerials = line.upsUnits.map(ups => ups.serialNumber).join('; ');
      const totalKva = line.upsUnits.reduce((sum, ups) => sum + ups.kva, 0);
      const calculatedLoad = line.stations.reduce((sum, station) => 
        sum + (station.assetWatts * station.assetQuantity), 0
      );
      
      const row = [
        `"${line.lineId}"`,
        `"${line.lineName}"`,
        `"${line.companyUnitName}"`,
        `"${line.location}"`,
        `"${line.lineSideName}"`,
        line.upsUnits.length,
        totalKva,
        `"${upsSerials}"`,
        line.stations.length,
        line.viewTotalValue,
        calculatedLoad,
        line.upsMaxLoadWatt.toFixed(0),
        line.totalLoadDifference.toFixed(0),
        line.loadPercentage.toFixed(1) + '%',
        `"${line.status}"`,
        `"${(line.maintenanceStatus || 'operational').charAt(0).toUpperCase() + (line.maintenanceStatus || 'operational').slice(1)}"`,
        line.isActive ? 'Yes' : 'No',
        format(new Date(line.timestamp), 'yyyy-MM-dd HH:mm:ss')
      ];
      
      csvContent += row.join(separator) + '\n';
    });

    // Summary section
    csvContent += '\n' + 'SUMMARY METRICS'.padEnd(50, '=') + '\n';
    csvContent += ['Metric', 'Value'].join(separator) + '\n';
    csvContent += ['Total Load Watt', data.metrics.totalLoadWatt.toFixed(0)].join(separator) + '\n';
    csvContent += ['Total Load Per UPS Watt', data.metrics.totalLoadPerUpsWatt.toFixed(0)].join(separator) + '\n';
    csvContent += ['UPS Max Load Watt', data.metrics.upsMaxLoadWatt.toFixed(0)].join(separator) + '\n';
    csvContent += ['Total Difference', data.metrics.totalDifference.toFixed(0)].join(separator) + '\n';
    csvContent += ['Active Lines', data.metrics.activeCount].join(separator) + '\n';
    csvContent += ['Inactive Lines', data.metrics.inactiveCount].join(separator) + '\n';
    csvContent += ['High Load Lines', data.metrics.highLoadCount].join(separator) + '\n';
    csvContent += ['Maintenance Required', data.metrics.maintenanceCount].join(separator) + '\n';
    csvContent += ['Faulty UPS', data.metrics.faultyCount].join(separator) + '\n';

    return csvContent;
  }

  stopAutoSave(): void {
    if (this.saveInterval) {
      clearTimeout(this.saveInterval);
      this.saveInterval = null;
    }
  }

  getLastSaveTime(): number {
    return this.lastSaveTime;
  }
}

export const autoSaveManager = new AutoSaveManager();