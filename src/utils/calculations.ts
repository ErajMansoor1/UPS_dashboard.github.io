import { Line, GlobalMetrics, Alert } from '../types';

export const calculateLineMetrics = (line: Line): Line => {
  // Calculate total load from stations' asset watts
  const stationsLoadWatt = line.stations.reduce((sum, station) => 
    sum + (station.assetWatts * station.assetQuantity), 0
  );
  
  // Use manual viewTotalValue if provided, otherwise use calculated stations load
  const totalLoadWattPerLine = line.viewTotalValue > 0 ? line.viewTotalValue : stationsLoadWatt;
  
  const totalKva = line.upsUnits.reduce((sum, ups) => sum + ups.kva, 0);
  const upsMaxLoadWatt = totalKva * 1000 * 0.9;
  const totalLoadDifference = upsMaxLoadWatt - totalLoadWattPerLine;
  const loadPercentage = upsMaxLoadWatt > 0 ? (totalLoadWattPerLine / upsMaxLoadWatt) * 100 : 0;
  
  let status: 'Active' | 'Inactive' | 'Warning' | 'Critical' = line.isActive ? 'Active' : 'Inactive';
  let alertLevel: 'none' | 'low' | 'medium' | 'high' | 'critical' = 'none';
  
  if (line.isActive) {
    if (loadPercentage >= 95) {
      status = 'Critical';
      alertLevel = 'critical';
    } else if (loadPercentage >= 90) {
      status = 'Critical';
      alertLevel = 'high';
    } else if (loadPercentage >= 80) {
      status = 'Warning';
      alertLevel = 'medium';
    } else if (loadPercentage >= 70) {
      status = 'Warning';
      alertLevel = 'low';
    }
  }

  // Check maintenance status
  if (line.maintenanceStatus === 'faulty') {
    status = 'Critical';
    alertLevel = 'critical';
  } else if (line.maintenanceStatus === 'maintenance' || line.maintenanceStatus === 'pending') {
    if (alertLevel === 'none') alertLevel = 'medium';
  }
  
  const updatedLine = {
    ...line,
    totalLoadWattPerLine,
    upsMaxLoadWatt,
    totalLoadDifference,
    loadPercentage,
    alertLevel,
    status,
    timestamp: new Date().toISOString(),
  };

  // Ensure maintenanceNotes are preserved
  updatedLine.maintenanceNotes = line.maintenanceNotes;

  return updatedLine;
};

export const calculateGlobalMetrics = (lines: Line[]): GlobalMetrics => {
  const totalLoadWatt = lines.reduce((sum, line) => sum + line.totalLoadWattPerLine, 0);
  const upsMaxLoadWatt = lines.reduce((sum, line) => sum + line.upsMaxLoadWatt, 0);
  const totalDifference = lines.reduce((sum, line) => sum + line.totalLoadDifference, 0);
  
  const totalUpsCount = lines.reduce((sum, line) => sum + line.upsUnits.length, 0);
  const totalLoadPerUpsWatt = totalUpsCount > 0 ? totalLoadWatt / totalUpsCount : 0;
  const perUpsMaxLoadWatt = totalUpsCount > 0 ? upsMaxLoadWatt / totalUpsCount : 0;
  
  const activeCount = lines.filter(line => line.isActive).length;
  const inactiveCount = lines.length - activeCount;
  const highLoadCount = lines.filter(line => line.loadPercentage >= 80).length;
  const maintenanceCount = lines.filter(line => 
    line.maintenanceStatus === 'maintenance' || line.maintenanceStatus === 'pending'
  ).length;
  const faultyCount = lines.filter(line => line.maintenanceStatus === 'faulty').length;
  const criticalAlertCount = lines.filter(line => line.alertLevel === 'critical').length;

  const totalKva = lines.reduce((sum, line) => {
    const lineKva = line.upsUnits.reduce((lineSum, ups) => lineSum + ups.kva, 0);
    return sum + lineKva;
  }, 0);
  
  const perUpsKva = totalUpsCount > 0 ? totalKva / totalUpsCount : 0;
  
  const totalEquipments = lines.reduce((sum, line) => {
    const lineEquipments = line.stations.reduce((lineSum, station) => lineSum + station.assetQuantity, 0);
    return sum + lineEquipments;
  }, 0);

  return {
    totalLoadWatt,
    totalLoadPerUpsWatt,
    upsMaxLoadWatt,
    perUpsMaxLoadWatt,
    totalDifference,
    activeCount,
    inactiveCount,
    highLoadCount,
    maintenanceCount,
    faultyCount,
    criticalAlertCount,
    totalKva,
    perUpsKva,
    totalEquipments,
  };
};

export const generateAlerts = (lines: Line[]): Alert[] => {
  const alerts: Alert[] = [];
  
  lines.forEach(line => {
    // High load alerts
    if (line.isActive && line.loadPercentage >= 95) {
      alerts.push({
        id: `${line.id}-overload`,
        lineId: line.lineId,
        lineName: line.lineName,
        type: 'overload',
        severity: 'critical',
        message: `Critical overload: ${line.loadPercentage.toFixed(1)}% capacity used`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    } else if (line.isActive && line.loadPercentage >= 80) {
      alerts.push({
        id: `${line.id}-high-load`,
        lineId: line.lineId,
        lineName: line.lineName,
        type: 'high_load',
        severity: line.loadPercentage >= 90 ? 'high' : 'medium',
        message: `High load warning: ${line.loadPercentage.toFixed(1)}% capacity used`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }
    
    // Maintenance alerts
    if (line.maintenanceStatus === 'maintenance') {
      alerts.push({
        id: `${line.id}-maintenance`,
        lineId: line.lineId,
        lineName: line.lineName,
        type: 'maintenance',
        severity: 'medium',
        message: `UPS under maintenance${line.maintenanceDate ? ` since ${new Date(line.maintenanceDate).toLocaleDateString()}` : ''}`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }
    
    if (line.maintenanceStatus === 'pending') {
      alerts.push({
        id: `${line.id}-pending`,
        lineId: line.lineId,
        lineName: line.lineName,
        type: 'maintenance',
        severity: 'medium',
        message: 'Maintenance pending - schedule required',
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }
    
    // Faulty UPS alerts
    if (line.maintenanceStatus === 'faulty') {
      alerts.push({
        id: `${line.id}-faulty`,
        lineId: line.lineId,
        lineName: line.lineName,
        type: 'faulty',
        severity: 'critical',
        message: `UPS malfunction detected${line.maintenanceNotes ? ` - ${line.maintenanceNotes}` : ''}`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }
    
    // Offline alerts
    if (!line.isActive && line.maintenanceStatus === 'operational') {
      alerts.push({
        id: `${line.id}-offline`,
        lineId: line.lineId,
        lineName: line.lineName,
        type: 'offline',
        severity: 'high',
        message: 'Line is offline but UPS status shows operational',
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }
  });
  
  return alerts.sort((a, b) => {
    const severityOrder: Record<Alert['severity'], number> = { critical: 4, high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
};

export const formatWatts = (watts: number): string => {
  if (watts >= 1000000) {
    return `${(watts / 1000000).toFixed(1)} MW`;
  } else if (watts >= 1000) {
    return `${(watts / 1000).toFixed(1)} kW`;
  }
  return `${watts.toFixed(0)} W`;
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};
