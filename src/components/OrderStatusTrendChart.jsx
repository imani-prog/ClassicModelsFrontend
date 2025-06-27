import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
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
        <div className="bg-gray-900 text-white p-4 rounded-lg shadow-xl border border-gray-700">
          <p className="font-semibold text-blue-300 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">
                {entry.name}: <span className="font-bold">{entry.value}</span>
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const StatCard = ({ title, value, trend, icon: Icon, color }) => (
    <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color.bg}`}>
            <Icon className={`w-5 h-5 ${color.text}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {trend > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : trend < 0 ? (
            <TrendingDown className="w-4 h-4 text-red-500" />
          ) : null}
          <span className={`text-sm font-medium ${
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
          }`}>
            {trend > 0 ? `+${trend}` : trend}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl shadow-xl border border-slate-200 mt-8">
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Status Trends</h3>
        <p className="text-gray-600">Performance overview for the last 7 days</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
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

      {/* Enhanced Chart */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <LineChart 
              data={trendData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="shippedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#E5E7EB" 
                strokeOpacity={0.5}
              />
              
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                dy={10}
              />
              
              <YAxis 
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                dx={-10}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Legend 
                verticalAlign="top" 
                align="right"
                iconType="circle"
                wrapperStyle={{
                  paddingBottom: '20px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              />
              
              <Line
                type="monotone"
                dataKey="shipped"
                stroke="#3B82F6"
                name="Shipped"
                strokeWidth={3}
                dot={{ 
                  r: 6, 
                  fill: '#3B82F6',
                  strokeWidth: 3,
                  stroke: '#ffffff'
                }}
                activeDot={{ 
                  r: 8, 
                  fill: '#3B82F6',
                  strokeWidth: 3,
                  stroke: '#ffffff',
                  drop: true
                }}
              />
              
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#10B981"
                name="Completed"
                strokeWidth={3}
                dot={{ 
                  r: 6, 
                  fill: '#10B981',
                  strokeWidth: 3,
                  stroke: '#ffffff'
                }}
                activeDot={{ 
                  r: 8, 
                  fill: '#10B981',
                  strokeWidth: 3,
                  stroke: '#ffffff'
                }}
              />
              
              <Line
                type="monotone"
                dataKey="pending"
                stroke="#F59E0B"
                name="Pending"
                strokeWidth={3}
                dot={{ 
                  r: 6, 
                  fill: '#F59E0B',
                  strokeWidth: 3,
                  stroke: '#ffffff'
                }}
                activeDot={{ 
                  r: 8, 
                  fill: '#F59E0B',
                  strokeWidth: 3,
                  stroke: '#ffffff'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusTrendChart;