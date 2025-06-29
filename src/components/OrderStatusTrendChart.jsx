import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
// Icons as simple SVG components
const TrendingUp = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m3 17 6-6 4 4 8-8" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 7-4 4-4-4" />
  </svg>
);

const TrendingDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m3 7 6 6 4-4 8 8" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 17-4-4-4 4" />
  </svg>
);

const Package = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0V8a2 2 0 00-2-2H6a2 2 0 00-2 2v4m16 0H4" />
  </svg>
);

const CheckCircle = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Clock = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const OrderStatusTrendChart = () => {
  const [trendData, setTrendData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    shipped: { total: 0, trend: 0 },
    completed: { total: 0, trend: 0 },
    pending: { total: 0, trend: 0 }
  });

  useEffect(() => {
    fetch('http://localhost:8081/api/dashboard/order-status-trend')
      .then((res) => res.json())
      .then((data) => {
        const allDates = new Set();
        const trendMap = {};

        // Step 1: Gather all available dates and normalize data
        data.forEach((entry) => {
          const date = entry.date;
          allDates.add(date);

          trendMap[date] = {
            date,
            shipped: entry.shipped || 0,
            completed: entry.completed || 0,
            pending: entry.pending || 0,
          };
        });

        // Step 2: Ensure every date has all keys with better date formatting
        const normalized = Array.from(allDates)
          .sort()
          .map((date) => {
            return {
              date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              fullDate: date,
              shipped: trendMap[date]?.shipped || 0,
              completed: trendMap[date]?.completed || 0,
              pending: trendMap[date]?.pending || 0,
            };
          });

        // Calculate summary stats
        const totals = normalized.reduce((acc, day) => ({
          shipped: acc.shipped + day.shipped,
          completed: acc.completed + day.completed,
          pending: acc.pending + day.pending
        }), { shipped: 0, completed: 0, pending: 0 });

        // Calculate trends (comparing last 3 days vs first 3 days)
        const firstHalf = normalized.slice(0, 3);
        const secondHalf = normalized.slice(-3);
        
        const firstHalfTotals = firstHalf.reduce((acc, day) => ({
          shipped: acc.shipped + day.shipped,
          completed: acc.completed + day.completed,
          pending: acc.pending + day.pending
        }), { shipped: 0, completed: 0, pending: 0 });

        const secondHalfTotals = secondHalf.reduce((acc, day) => ({
          shipped: acc.shipped + day.shipped,
          completed: acc.completed + day.completed,
          pending: acc.pending + day.pending
        }), { shipped: 0, completed: 0, pending: 0 });

        setSummaryStats({
          shipped: { 
            total: totals.shipped, 
            trend: secondHalfTotals.shipped - firstHalfTotals.shipped 
          },
          completed: { 
            total: totals.completed, 
            trend: secondHalfTotals.completed - firstHalfTotals.completed 
          },
          pending: { 
            total: totals.pending, 
            trend: secondHalfTotals.pending - firstHalfTotals.pending 
          }
        });

        setTrendData(normalized);
      })
      .catch((err) => {
        console.error('Error fetching trend data:', err);
      });
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-2 border-gray-200 text-gray-800 p-4 rounded-xl shadow-2xl backdrop-blur-sm">
          <p className="font-bold text-gray-900 mb-3 text-center border-b border-gray-200 pb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-3 mb-2 last:mb-0">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full shadow-sm" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium text-gray-700">{entry.name}:</span>
              </div>
              <span className="font-bold text-gray-900">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // eslint-disable-next-line no-unused-vars
  const StatCard = ({ title, value, trend, icon: Icon, color }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col space-y-3">
        {/* Icon and Value Row */}
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-md ${color.bg}`}>
            <Icon className={`w-5 h-5 ${color.text}`} />
          </div>
          <div className="flex items-center gap-1">
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : trend < 0 ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : null}
            <span className={`text-sm font-semibold ${
              trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {trend > 0 ? `+${trend}` : trend}
            </span>
          </div>
        </div>
        
        {/* Title and Number */}
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-sm font-medium text-gray-600">{title}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Order Status Trends</h3>
        <p className="text-sm text-gray-600">Performance overview for the last 7 days</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Shipped Orders"
          value={summaryStats.shipped.total}
          trend={summaryStats.shipped.trend}
          icon={Package}
          color={{ bg: 'bg-blue-100', text: 'text-blue-600' }}
        />
        <StatCard
          title="Completed Orders"
          value={summaryStats.completed.total}
          trend={summaryStats.completed.trend}
          icon={CheckCircle}
          color={{ bg: 'bg-green-100', text: 'text-green-600' }}
        />
        <StatCard
          title="Pending Orders"
          value={summaryStats.pending.total}
          trend={summaryStats.pending.trend}
          icon={Clock}
          color={{ bg: 'bg-orange-100', text: 'text-orange-600' }}
        />
      </div>

      {/* Enhanced Chart Container */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-5 border border-gray-200">
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <LineChart 
              data={trendData}
              margin={{ top: 15, right: 15, left: 5, bottom: 15 }}
            >
              <defs>
                <linearGradient id="shippedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="50%" stopColor="#10B981" stopOpacity={0.1}/>
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3}/>
                  <stop offset="50%" stopColor="#F59E0B" stopOpacity={0.1}/>
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
                
                {/* Drop shadow filters for enhanced visual appeal */}
                <filter id="dropshadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                </filter>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="2 4" 
                stroke="#E5E7EB" 
                strokeOpacity={0.3}
                horizontal={true}
                vertical={false}
              />
              
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#6B7280', fontWeight: '500' }}
                dy={8}
                interval={0}
              />
              
              <YAxis 
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#6B7280', fontWeight: '500' }}
                dx={-8}
                domain={[0, 'dataMax + 1']}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Legend 
                verticalAlign="top" 
                align="right"
                iconType="circle"
                wrapperStyle={{
                  paddingBottom: '15px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151'
                }}
              />
              
              <Line
                type="monotone"
                dataKey="shipped"
                stroke="#3B82F6"
                name="Shipped"
                strokeWidth={3}
                fill="url(#shippedGradient)"
                dot={{ 
                  r: 5, 
                  fill: '#3B82F6',
                  strokeWidth: 3,
                  stroke: '#ffffff',
                  filter: 'drop-shadow(0px 2px 4px rgba(59, 130, 246, 0.3))'
                }}
                activeDot={{ 
                  r: 7, 
                  fill: '#3B82F6',
                  strokeWidth: 3,
                  stroke: '#ffffff',
                  filter: 'drop-shadow(0px 2px 8px rgba(59, 130, 246, 0.5))'
                }}
                connectNulls={false}
                animationDuration={1500}
                animationEasing="ease-in-out"
                strokeDasharray="0"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#10B981"
                name="Completed"
                strokeWidth={3}
                fill="url(#completedGradient)"
                dot={{ 
                  r: 5, 
                  fill: '#10B981',
                  strokeWidth: 3,
                  stroke: '#ffffff',
                  filter: 'drop-shadow(0px 2px 4px rgba(16, 185, 129, 0.3))'
                }}
                activeDot={{ 
                  r: 7, 
                  fill: '#10B981',
                  strokeWidth: 3,
                  stroke: '#ffffff',
                  filter: 'drop-shadow(0px 2px 8px rgba(16, 185, 129, 0.5))'
                }}
                connectNulls={false}
                animationDuration={1500}
                animationEasing="ease-in-out"
                strokeDasharray="0"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              <Line
                type="monotone"
                dataKey="pending"
                stroke="#F59E0B"
                name="Pending"
                strokeWidth={3}
                fill="url(#pendingGradient)"
                dot={{ 
                  r: 5, 
                  fill: '#F59E0B',
                  strokeWidth: 3,
                  stroke: '#ffffff',
                  filter: 'drop-shadow(0px 2px 4px rgba(245, 158, 11, 0.3))'
                }}
                activeDot={{ 
                  r: 7, 
                  fill: '#F59E0B',
                  strokeWidth: 3,
                  stroke: '#ffffff',
                  filter: 'drop-shadow(0px 2px 8px rgba(245, 158, 11, 0.5))'
                }}
                connectNulls={false}
                animationDuration={1500}
                animationEasing="ease-in-out"
                strokeDasharray="0"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusTrendChart;