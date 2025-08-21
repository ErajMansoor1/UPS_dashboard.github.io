import { useState, useEffect, useRef } from 'react';
import { Line, Alert, User } from './types';
import { calculateLineMetrics, calculateGlobalMetrics, generateAlerts } from './utils/calculations';
import { saveLinesToStorage, loadLinesFromStorage } from './utils/storage';
import { initializeAuth, getCurrentUser, logout, isAuthenticated, logActivity } from './utils/auth';
// import { autoSaveManager } from './utils/autoSave';
import { useTheme } from './hooks/useTheme';
import { SummaryCards } from './components/SummaryCards';
import { LoadTrendChart } from './components/LoadTrendChart';
import { LinesTable } from './components/LinesTable';
import { LineModal } from './components/LineModal';
import { StationsModal } from './components/StationsModal';
import { Charts } from './components/Charts';
import { ExportButtons } from './components/ExportButtons';
import { AlertsPanel } from './components/AlertsPanel';
import { LoginModal } from './components/LoginModal';
import { AdminPanel } from './components/AdminPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { Sun, Moon, LogOut, Shield, History, User as UserIcon, Search } from 'lucide-react';

function App() {
  const [lines, setLines] = useState<Line[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [currentView, setCurrentView] = useState<'dashboard' | 'admin'>('dashboard');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [isLineModalOpen, setIsLineModalOpen] = useState(false);
  const [isStationsModalOpen, setIsStationsModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<Line | null>(null);
  const [viewingStationsLine, setViewingStationsLine] = useState<Line | null>(null);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const alertsPanelRef = useRef<HTMLDivElement>(null);
  const [selectedLineIdForSummary, setSelectedLineIdForSummary] = useState<string | 'all'>('all');

  // Initialize authentication system
  useEffect(() => {
    initializeAuth();
  }, []);

  // Check authentication status
  useEffect(() => {
    if (!isAuthenticated()) {
      setIsLoginModalOpen(true);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    if (isAuthenticated()) {
      const savedLines = loadLinesFromStorage();
      if (savedLines.length > 0) {
        const calculatedLines = savedLines.map(calculateLineMetrics);
        setLines(calculatedLines);
      }
    }
  }, []);

  // Save data whenever lines change
  useEffect(() => {
    if (lines.length > 0 && isAuthenticated()) {
      saveLinesToStorage(lines);
      
      // Trigger auto-save to Excel
      // const globalMetrics = calculateGlobalMetrics(lines);
      // autoSaveManager.startAutoSave(lines, globalMetrics);
    }
  }, [lines]);

  // Generate alerts whenever lines change
  useEffect(() => {
    const newAlerts = generateAlerts(lines);
    setAlerts(newAlerts);
  }, [lines]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    
    // Load data after successful login
    const savedLines = loadLinesFromStorage();
    if (savedLines.length > 0) {
      const calculatedLines = savedLines.map(calculateLineMetrics);
      setLines(calculatedLines);
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setLines([]);
    setAlerts([]);
    // autoSaveManager.stopAutoSave();
    setIsLoginModalOpen(true);
  };

  const handleAddLine = () => {
    setEditingLine(null);
    setIsLineModalOpen(true);
  };

  const handleEditLine = (line: Line) => {
    setEditingLine(line);
    setIsLineModalOpen(true);
  };

  const handleSaveLine = (lineData: Line) => {
    const calculatedLine = calculateLineMetrics(lineData);
    
    // Preserve maintenance notes
    calculatedLine.maintenanceNotes = lineData.maintenanceNotes;

    const user = getCurrentUser();
    if (editingLine) {
      // Update existing line
      setLines(prev => prev.map(line => 
        line.id === editingLine.id ? calculatedLine : line
      ));
      
      if (user) {
        logActivity({
          userId: user.id,
          username: user.username,
          action: 'update',
          entityType: 'line',
          entityId: calculatedLine.id,
          entityName: calculatedLine.lineName,
          details: `Updated UPS line: ${calculatedLine.lineName} (${calculatedLine.lineId})`,
        });
      }
    } else {
      // Add new line
      setLines(prev => [...prev, calculatedLine]);
      
      if (user) {
        logActivity({
          userId: user.id,
          username: user.username,
          action: 'create',
          entityType: 'line',
          entityId: calculatedLine.id,
          entityName: calculatedLine.lineName,
          details: `Created new UPS line: ${calculatedLine.lineName} (${calculatedLine.lineId})`,
        });
      }
    }
  };

  const handleDeleteLine = (id: string) => {
    const lineToDelete = lines.find(line => line.id === id);
    if (lineToDelete && window.confirm('Are you sure you want to delete this line? This action cannot be undone.')) {
      setLines(prev => prev.filter(line => line.id !== id));
      
      const user = getCurrentUser();
      if (user) {
        logActivity({
          userId: user.id,
          username: user.username,
          action: 'delete',
          entityType: 'line',
          entityId: id,
          entityName: lineToDelete.lineName,
          details: `Deleted UPS line: ${lineToDelete.lineName} (${lineToDelete.lineId})`,
        });
      }
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredLines.length === 1) {
      handleViewStations(filteredLines[0]);
    }
  };

  const handleViewStations = (line: Line) => {
    setViewingStationsLine(line);
    setIsStationsModalOpen(true);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleActiveAlertsClick = () => {
    alertsPanelRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSummaryCardClick = (cardTitle: string) => {
    // This handler is only called when a single line is selected.
    const selectedLine = lines.find(line => line.id === selectedLineIdForSummary);
    if (selectedLine) {
      setActiveCard(cardTitle);
      handleViewStations(selectedLine);
    }
  };

  const filteredLines = lines.filter(line => {
    const searchTermLower = searchTerm.toLowerCase();

    return (
      line.lineId.toLowerCase().includes(searchTermLower) ||
      line.lineName.toLowerCase().includes(searchTermLower) ||
      line.companyUnitName.toLowerCase().includes(searchTermLower) ||
      line.upsUnits.some(ups => ups.serialNumber.toLowerCase().includes(searchTermLower))
    );
  });

  const filteredLinesForSummary = selectedLineIdForSummary === 'all'
    ? filteredLines
    : filteredLines.filter(line => line.id === selectedLineIdForSummary);

  const globalMetrics = calculateGlobalMetrics(filteredLinesForSummary);

  // Show login modal if not authenticated
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => {}}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  // Render Admin Panel as separate view
  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AdminPanel 
          onClose={() => setCurrentView('dashboard')}
          onNavigateToDashboard={() => setCurrentView('dashboard')}
        />
      </div>
    );
  }

  // Main Dashboard View
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center py-4 gap-4">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Tecno Pack Electronics Logo" className="h-12 w-auto" />
              <div>
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 dark:from-blue-400 dark:to-teal-400 bg-clip-text text-transparent">
                  UPS Battery Backup, Health Check & Monitoring
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end flex-wrap">
              {/* User Info */}
              <div className="hidden lg:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-600/50 shadow-sm">
                <UserIcon className="w-4 h-4" />
                <span>Welcome, {currentUser?.username}</span>
                {currentUser?.role === 'admin' && (
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full text-xs font-medium shadow-sm">
                    Admin
                  </span>
                )}
              </div>

              {alerts.filter(a => !a.acknowledged).length > 0 && (
                <button
                  onClick={handleActiveAlertsClick}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse hover:animate-none hover:scale-105 transition-transform"
                  title="Click to view active alerts"
                >
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  {alerts.filter(a => !a.acknowledged).length} Active Alerts
                </button>
              )}

              {/* Action Buttons */}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => setIsHistoryPanelOpen(true)}
                  className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg border border-transparent hover:border-gray-200/50 dark:hover:border-gray-600/50"
                  title="View Activity History"
                >
                  <History className="w-5 h-5" />
                </button>
              )}

              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => setCurrentView('admin')}
                  className="p-2 rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-105 hover:shadow-lg border border-transparent hover:border-purple-200/50 dark:hover:border-purple-600/50"
                  title="Admin Panel"
                >
                  <Shield className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg border border-transparent hover:border-gray-200/50 dark:hover:border-gray-600/50"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-105 hover:shadow-lg border border-transparent hover:border-red-200/50 dark:hover:border-red-600/50"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-8 lg:space-y-12 w-full flex-grow">
        
        {/* Dashboard Title */}
        <div className="text-center">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-800 dark:text-white tracking-tight">
            UPS Backup & Health Monitoring
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A comprehensive overview of your entire UPS infrastructure's performance and status.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="card-3d p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search-bar" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Lines
            </label>
            <div className="relative">
              <input
                id="search-bar"
                type="text"
                placeholder="Search by Line ID, Name, Company, or UPS Serial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
          <div>
            <label htmlFor="summary-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter Dashboard View
            </label>
            <select
              id="summary-filter"
              value={selectedLineIdForSummary}
              onChange={(e) => setSelectedLineIdForSummary(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
            >
              <option value="all">All Lines</option>
              {filteredLines.map((line) => (
                <option key={line.id} value={line.id}>
                  {line.lineName} ({line.lineId})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <SummaryCards 
          metrics={globalMetrics} 
          onCardClick={selectedLineIdForSummary !== 'all' ? handleSummaryCardClick : undefined} 
        />

        {/* Main content grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left column (main content) */}
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            <LoadTrendChart lines={lines} />
            <Charts lines={filteredLinesForSummary} />
          </div>

          {/* Right column (sidebar) */}
          <div className="space-y-6 lg:space-y-8">
            <div ref={alertsPanelRef}>
              <AlertsPanel
                alerts={alerts}
                onAcknowledge={handleAcknowledgeAlert}
                onDismiss={handleDismissAlert}
              />
            </div>
            <ExportButtons lines={lines} metrics={globalMetrics} />
          </div>
        </div>

        {/* Lines Table */}
        <div>
          <LinesTable
            lines={filteredLines}
            onEdit={handleEditLine}
            onDelete={currentUser?.role === 'admin' ? handleDeleteLine : undefined}
            onAdd={handleAddLine}
            onViewStations={handleViewStations}
          />
        </div>

        {/* Footer Info */}
        <div className="card-3d text-center text-sm text-gray-500 dark:text-gray-400 p-6">
          <p>Professional UPS Management Dashboard • Real-time Load Monitoring • Automated Calculations</p>
          <p className="mt-1">
            Total Lines: {lines.length} • Active: {globalMetrics.activeCount} • Inactive: {globalMetrics.inactiveCount}
            • High Load: {globalMetrics.highLoadCount} • Maintenance: {globalMetrics.maintenanceCount}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-screen-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <img src="/logo.png" alt="Tecno Pack Electronics Logo" className="h-10 w-auto" />
            <span className="font-semibold text-lg text-gray-800 dark:text-white">
              UPS Backup & Health Monitoring
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Fahad Naeem. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <LineModal
        isOpen={isLineModalOpen}
        onClose={() => {
          setIsLineModalOpen(false);
          setEditingLine(null);
        }}
        onSave={handleSaveLine}
        line={editingLine}
      />

      <StationsModal
        isOpen={isStationsModalOpen}
        onClose={() => {
          setIsStationsModalOpen(false);
          setViewingStationsLine(null);
          setActiveCard(null);
        }}
        line={viewingStationsLine}
        activeCard={activeCard}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {}}
        onLogin={handleLogin}
      />


      <HistoryPanel
        isOpen={isHistoryPanelOpen}
        onClose={() => setIsHistoryPanelOpen(false)}
      />
    </div>
  );
}

export default App;
