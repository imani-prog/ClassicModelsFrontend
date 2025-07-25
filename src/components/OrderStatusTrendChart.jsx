import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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

const DollarSign = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

const TrendingChart = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const CreditCard = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const RevenueAnalyticsChart = () => {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: { total: 0, trend: 0 },
    avgOrderValue: { total: 0, trend: 0 },
    monthlyGrowth: { total: 0, trend: 0 }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Hardcoded revenue data for demonstration
        const hardcodedData = [
          { date: 'Jul 5', revenue: 2400, orders: 12, avgOrderValue: 200 },
          { date: 'Jul 6', revenue: 3200, orders: 15, avgOrderValue: 213 },
          { date: 'Jul 7', revenue: 1800, orders: 8, avgOrderValue: 225 },
          { date: 'Jul 8', revenue: 4100, orders: 18, avgOrderValue: 228 },
          { date: 'Jul 9', revenue: 3500, orders: 16, avgOrderValue: 219 },
          { date: 'Jul 10', revenue: 2900, orders: 13, avgOrderValue: 223 },
          { date: 'Jul 11', revenue: 3800, orders: 17, avgOrderValue: 224 }
        ];

        // Calculate summary statistics
        const totalRevenue = hardcodedData.reduce((sum, day) => sum + day.revenue, 0);
        const totalOrders = hardcodedData.reduce((sum, day) => sum + day.orders, 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Calculate trends (compare first half vs second half of week)
        const firstHalf = hardcodedData.slice(0, 3);
        const secondHalf = hardcodedData.slice(-3);
        
        const firstHalfRevenue = firstHalf.reduce((sum, day) => sum + day.revenue, 0);
        const secondHalfRevenue = secondHalf.reduce((sum, day) => sum + day.revenue, 0);
        const revenueTrend = firstHalfRevenue > 0 ? 
          Math.round(((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100) : 0;

        const firstHalfAvg = firstHalf.reduce((sum, day) => sum + day.avgOrderValue, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, day) => sum + day.avgOrderValue, 0) / secondHalf.length;
        const avgTrend = firstHalfAvg > 0 ? 
          Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100) : 0;

        // Monthly growth simulation
        const monthlyGrowth = 12; // Hardcoded positive growth

        setSummaryStats({
          totalRevenue: { 
            total: Math.round(totalRevenue), 
            trend: revenueTrend 
          },
          avgOrderValue: { 
            total: Math.round(avgOrderValue), 
            trend: avgTrend 
          },
          monthlyGrowth: { 
            total: monthlyGrowth, 
            trend: monthlyGrowth 
          }
        });

        setTrendData(hardcodedData);
      } catch (err) {
        console.error('Error loading revenue data:', err);
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
              <span className="font-bold text-gray-900">
                {entry.dataKey === 'revenue' ? `$${entry.value.toLocaleString()}` : `$${entry.value}`}
              </span>
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
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Revenue Analytics</h3>
        <p className="text-sm text-gray-600">Financial performance overview for the last 7 days</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Revenue"
          value={`$${summaryStats.totalRevenue.total.toLocaleString()}`}
          trend={summaryStats.totalRevenue.trend}
          icon={DollarSign}
          color={{ bg: 'bg-green-100', text: 'text-green-600' }}
        />
        <StatCard
          title="Avg Order Value"
          value={`$${summaryStats.avgOrderValue.total.toLocaleString()}`}
          trend={summaryStats.avgOrderValue.trend}
          icon={CreditCard}
          color={{ bg: 'bg-blue-100', text: 'text-blue-600' }}
        />
        <StatCard
          title="Monthly Growth"
          value={`${summaryStats.monthlyGrowth.total > 0 ? '+' : ''}${summaryStats.monthlyGrowth.total}%`}
          trend={summaryStats.monthlyGrowth.trend}
          icon={TrendingChart}
          color={{ bg: 'bg-purple-100', text: 'text-purple-600' }}
        />
      </div>

      {/* Enhanced Chart Container */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-xl p-2 border border-slate-200 shadow-inner">
        <div className="bg-white rounded-lg p-2 shadow-sm border border-slate-100">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="relative">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-500"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-300 animate-ping"></div>
              </div>
              <span className="ml-3 text-gray-600 font-medium">Loading revenue data...</span>
            </div>
          ) : (
            <div style={{ width: '100%', height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={trendData}
                  margin={{ top: 30, right: 30, left: 30, bottom: 50 }}
                  barCategoryGap="10%"
                >
                <defs>
                  <linearGradient id="revenueBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.8}/>
                  </linearGradient>
                  <linearGradient id="ordersBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid 
                  strokeDasharray="2 4" 
                  stroke="#E5E7EB" 
                  strokeOpacity={0.4}
                  horizontal={true}
                  vertical={false}
                />
                
                <XAxis 
                  dataKey="date" 
                  axisLine={{ stroke: '#374151', strokeWidth: 1 }}
                  tickLine={{ stroke: '#374151', strokeWidth: 1, length: 6 }}
                  tick={{ fontSize: 13, fill: '#374151', fontWeight: '600' }}
                  interval={0}
                  height={55}
                />
                
                <YAxis 
                  allowDecimals={false}
                  axisLine={{ stroke: '#374151', strokeWidth: 1 }}
                  tickLine={{ stroke: '#374151', strokeWidth: 1, length: 6 }}
                  tick={{ fontSize: 13, fill: '#374151', fontWeight: '600' }}
                  domain={[0, 'dataMax + 50']}
                  tickCount={8}
                  width={70}
                />
                
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '500',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value, name) => [
                    name === 'revenue' ? `$${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                />
                
                <Legend 
                  verticalAlign="top" 
                  align="right"
                  iconType="rect"
                  wrapperStyle={{
                    paddingBottom: '25px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151'
                  }}
                  iconSize={14}
                />
                
                <Bar
                  dataKey="revenue"
                  fill="url(#revenueBar)"
                  name="Revenue ($)"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={55}
                />
                
                <Bar
                  dataKey="orders"
                  fill="url(#ordersBar)"
                  name="Orders"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={55}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        </div>
      </div>

      {/* Business Insights Section */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Revenue Performance */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h4 className="font-semibold text-green-900 text-sm">Revenue Performance</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-green-700">Weekly Revenue:</span>
              <span className="text-sm font-bold text-green-900">
                ${summaryStats.totalRevenue.total.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-green-700">Revenue Growth:</span>
              <span className="text-sm font-bold text-green-900">
                {summaryStats.totalRevenue.trend > 0 ? '+' : ''}{summaryStats.totalRevenue.trend}%
              </span>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <h4 className="font-semibold text-blue-900 text-sm">Performance Insights</h4>
          </div>
          <div className="space-y-2">
            {summaryStats.monthlyGrowth.total > 5 ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-blue-700">Strong monthly growth trajectory ↗</span>
              </div>
            ) : summaryStats.monthlyGrowth.total < 0 ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-700">Revenue declining - review needed</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-xs text-blue-700">Stable revenue - opportunities ahead</span>
              </div>
            )}
            {summaryStats.avgOrderValue.trend > 0 ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-blue-700">Customer spending increasing ↗</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-xs text-blue-700">Monitor customer spending patterns</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalyticsChart;