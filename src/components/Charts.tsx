import React from 'react';
import { Line } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { formatWatts } from '../utils/calculations';

interface ChartsProps {
  lines: Line[];
}

export const Charts: React.FC<ChartsProps> = ({ lines }) => {
  // Bar chart data
  const barChartData = lines.map(line => ({
    name: line.lineId,
    fullName: line.lineName,
    totalLoad: line.totalLoadWattPerLine,
    maxCapacity: line.upsMaxLoadWatt,
    difference: line.totalLoadDifference,
  }));

  // Pie chart data
  const activeCount = lines.filter(line => line.isActive).length;
  const inactiveCount = lines.length - activeCount;
  
  const pieChartData = [
    { name: 'Active', value: activeCount, color: '#10B981' },
    { name: 'Inactive', value: inactiveCount, color: '#6B7280' },
  ];

  // Status distribution data
  const statusCounts = lines.reduce((acc, line) => {
    acc[line.status] = (acc[line.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
    color: status === 'Active' ? '#10B981' : 
           status === 'Warning' ? '#F59E0B' : 
           status === 'Critical' ? '#EF4444' : '#6B7280'
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">
            {data.fullName} ({label})
          </p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-blue-600 dark:text-blue-400">Total Load:</span> {formatWatts(data.totalLoad)}
            </p>
            <p className="text-sm">
              <span className="text-green-600 dark:text-green-400">Max Capacity:</span> {formatWatts(data.maxCapacity)}
            </p>
            <p className="text-sm">
              <span className={data.difference < 0 ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}>
                Difference:
              </span> {formatWatts(Math.abs(data.difference))}
              {data.difference < 0 && ' ⚠️ Overloaded'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
      {/* Load Distribution Bar Chart */}
      <div className="card-3d p-6 col-span-1 md:col-span-2 xl:col-span-1">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Load Distribution by Line
        </h3>
        {lines.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
              <XAxis 
                dataKey="name" 
                stroke="var(--card-border)"
                fontSize={12}
                tick={{ fill: 'currentColor' }}
                className="text-gray-500 dark:text-gray-400"
              />
              <YAxis 
                stroke="var(--card-border)"
                fontSize={12}
                tick={{ fill: 'currentColor' }}
                className="text-gray-500 dark:text-gray-400"
                tickFormatter={(value) => formatWatts(value)}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }} />
              <Bar dataKey="totalLoad" fill="var(--primary-glow)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="maxCapacity" fill="var(--secondary-glow)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            No data available for chart
          </div>
        )}
      </div>

      {/* Active vs Inactive Pie Chart */}
      <div className="card-3d p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Line Status
        </h3>
        {lines.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke="var(--card-bg)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [value, 'Lines']}
                contentStyle={{
                  backgroundColor: 'var(--card-bg)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '8px',
                }}
              />
              <Legend 
                iconType="circle"
                formatter={(value) => <span className="text-gray-700 dark:text-gray-300">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            No data available for chart
          </div>
        )}
      </div>

      {/* Status Breakdown Pie Chart */}
      <div className="card-3d p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Status Breakdown
        </h3>
        {lines.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {statusChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke="var(--card-bg)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [value, 'Lines']}
                contentStyle={{
                  backgroundColor: 'var(--card-bg)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '8px',
                }}
              />
              <Legend 
                iconType="circle"
                formatter={(value) => <span className="text-gray-700 dark:text-gray-300">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            No data available for chart
          </div>
        )}
      </div>
    </div>
  );
};
