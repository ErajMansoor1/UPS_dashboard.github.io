export interface Station {
  id: string;
  name: string;
  assetName: string;
  assetQuantity: number;
  assetWatts: number; // Manual watts entry per asset
}

export interface UPS {
  id: string;
  serialNumber: string;
  kva: number;
  remarks?: string; // New field for remarks/reason
}

export interface Line {
  id: string;
  lineId: string; // e.g., "L1", "Line 1"
  lineName: string;
  companyUnitName: string;
  stations: Station[];
  location: string;
  lineSideName: string;
  upsUnits: UPS[];
  viewTotalValue: number; // Watts
  timestamp: string;
  isActive: boolean;
  maintenanceStatus: 'operational' | 'maintenance' | 'pending' | 'faulty';
  maintenanceDate?: string;
  maintenanceNotes?: string;
  // Calculated fields
  totalLoadWattPerLine: number;
  upsMaxLoadWatt: number;
  totalLoadDifference: number;
  status: 'Active' | 'Inactive' | 'Warning' | 'Critical';
  loadPercentage: number;
  alertLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export interface GlobalMetrics {
  totalLoadWatt: number;
  totalLoadPerUpsWatt: number;
  upsMaxLoadWatt: number;
  perUpsMaxLoadWatt: number;
  totalDifference: number;
  activeCount: number;
  inactiveCount: number;
  highLoadCount: number;
  maintenanceCount: number;
  faultyCount: number;
  criticalAlertCount: number;
  totalKva: number;
  perUpsKva: number;
  totalEquipments: number;
}

export interface Alert {
  id: string;
  lineId: string;
  lineName: string;
  type: 'high_load' | 'maintenance' | 'faulty' | 'overload' | 'offline';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface ExportData {
  lines: Line[];
  metrics: GlobalMetrics;
  timestamp: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout';
  entityType: 'line' | 'station' | 'ups' | 'user';
  entityId?: string;
  entityName?: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}
