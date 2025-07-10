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
// Icons SVG components
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
  const [loading, setLoading] = useState(true);
  const [summaryStats, setSummaryStats] = useState({
    shipped: { total: 0, trend: 0 },
    completed: { total: 0, trend: 0 },
    pending: { total: 0, trend: 0 }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8081/api/dashboard/order-status-trend');
        const data = await response.json();
        
        if (!data || data.length === 0) {
          setLoading(false);
          return;
        }

        const allDates = new Set();
        const trendMap = {};

        //Gather all available dates and normalize data
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

        //Sort dates and take only the last 7 days
        const sortedDates = Array.from(allDates).sort();
        const last7Days = sortedDates.slice(-7); // Get only the last 7 days
        
        const normalized = last7Days.map((date) => {
          const dateObj = new Date(date);
          return {
            date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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

        // Calculate trends
        const dataLength = normalized.length;
        const firstHalf = normalized.slice(0, Math.floor(dataLength / 2));
        const secondHalf = normalized.slice(-Math.floor(dataLength / 2));
        
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
      } catch (err) {
        console.error('Error fetching trend data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        {loading ? (
          <div className="flex items-center justify-center h-80">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading chart...</span>
          </div>
        ) : (
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={trendData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                {/*defs, grid, axes, tooltip, legend, and lines... */}
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
                  angle={0}
                  textAnchor="middle"
                  height={40}
                />
                
                <YAxis 
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6B7280', fontWeight: '500' }}
                  dx={-8}
                  domain={[0, (dataMax) => Math.max(dataMax + 2, 5)]}
                  tickCount={6}
                  interval={0}
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
                  dot={{ 
                    r: 5, 
                    fill: '#3B82F6',
                    strokeWidth: 2,
                    stroke: '#ffffff'
                  }}
                  activeDot={{ 
                    r: 7, 
                    fill: '#3B82F6',
                    strokeWidth: 2,
                    stroke: '#ffffff'
                  }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
                
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10B981"
                  name="Completed"
                  strokeWidth={3}
                  dot={{ 
                    r: 5, 
                    fill: '#10B981',
                    strokeWidth: 2,
                    stroke: '#ffffff'
                  }}
                  activeDot={{ 
                    r: 7, 
                    fill: '#10B981',
                    strokeWidth: 2,
                    stroke: '#ffffff'
                  }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
                
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke="#F59E0B"
                  name="Pending"
                  strokeWidth={3}
                  dot={{ 
                    r: 5, 
                    fill: '#F59E0B',
                    strokeWidth: 2,
                    stroke: '#ffffff'
                  }}
                  activeDot={{ 
                    r: 7, 
                    fill: '#F59E0B',
                    strokeWidth: 2,
                    stroke: '#ffffff'
                  }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Business Insights Section */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Order Processing Efficiency */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <h4 className="font-semibold text-blue-900 text-sm">Processing Efficiency</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-700">Completion Rate:</span>
              <span className="text-sm font-bold text-blue-900">
                {summaryStats.shipped.total + summaryStats.completed.total > 0 
                  ? Math.round(((summaryStats.shipped.total + summaryStats.completed.total) / 
                    (summaryStats.shipped.total + summaryStats.completed.total + summaryStats.pending.total)) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-700">Avg Daily Orders:</span>
              <span className="text-sm font-bold text-blue-900">
                {Math.round((summaryStats.shipped.total + summaryStats.completed.total + summaryStats.pending.total) / Math.min(trendData.length, 7))}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <h4 className="font-semibold text-orange-900 text-sm">Action Required</h4>
          </div>
          <div className="space-y-2">
            {summaryStats.pending.total > 5 ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-orange-700">High pending orders - Review required</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-orange-700">Pending orders under control</span>
              </div>
            )}
            {summaryStats.shipped.trend > 0 ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-orange-700">Shipping trend positive ↗</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-xs text-orange-700">Monitor shipping performance</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusTrendChart;