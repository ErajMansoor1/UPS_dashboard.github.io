import React, { useState } from 'react';
import { Line } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { formatWatts } from '../utils/calculations';
import { TrendingUp } from 'lucide-react';

interface LoadTrendChartProps {
  lines: Line[];

}

export const LoadTrendChart: React.FC<LoadTrendChartProps> = ({ lines }) => {
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const allLinesData = (lines || [])
    .filter(line => line.isActive)
    .sort((a, b) => a.lineId.localeCompare(b.lineId))
    .map(line => ({
      id: line.id,
      name: line.lineId,
      'Current Load (W)': line.totalLoadWattPerLine,
      'Max Capacity (W)': line.upsMaxLoadWatt,
      loadPercentage: line.loadPercentage,
      lineName: line.lineName,
    }));

  const chartData = selectedLineId
    ? allLinesData.filter(d => d.id === selectedLineId)
    : allLinesData;

  return (
    <div className="card-3d p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-blue-500" />
          Per-Line Load Overview
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors text-3xl font-mono"
          aria-expanded={isExpanded}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      {isExpanded && (
        <>
          <select
            value={selectedLineId || ''}
            onChange={(e) => setSelectedLineId(e.target.value === '' ? null : e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all mb-6 shadow-sm"
          >
            <option value="">Select a Line (Manual)</option>
            {lines.map((line) => (
              <option key={line.id} value={line.id}>
                {line.lineName} ({line.lineId})
              </option>
            ))}
          </select>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} className="stroke-gray-400 dark:stroke-gray-600" />
                <XAxis dataKey="name" tick={{ fill: 'currentColor' }} className="text-xs text-gray-600 dark:text-gray-400" />
                <YAxis
                  tickFormatter={(value) => formatWatts(value)}
                  tick={{ fill: 'currentColor' }}
                  className="text-xs text-gray-600 dark:text-gray-400"
                  width={80}
                  domain={[0, 15000]}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
                          <p className="font-bold text-gray-900 dark:text-white mb-2">
                            {data.lineName} ({label})
                          </p>
                          <div className="space-y-1 text-sm">
                            <p className="text-blue-700 dark:text-blue-300">
                              <span style={{ color: '#3B82F6' }}>■</span> Current Load:{' '}
                              <span className="font-semibold">{formatWatts(data['Current Load (W)'])}</span>
                            </p>
                            <p className="text-orange-700 dark:text-orange-300">
                              <span className="font-medium">Max Capacity:</span>{' '}
                              <span className="font-semibold">{formatWatts(data['Max Capacity (W)'])}</span>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Current Load (W)"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorLoad)"
                  strokeWidth={2}
                  style={{ filter: 'drop-shadow(0 0 10px #3B82F6)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              <p>No active lines to display in the chart.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
