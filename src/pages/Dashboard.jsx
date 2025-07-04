import { useEffect, useState } from 'react';
import { FaArrowDown, FaArrowUp, FaBell, FaBox, FaClipboardCheck, FaClock, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';
import BusinessAnalytics from '../components/BusinessPerformanceMetrics';
import OrderStatusTrendChart from '../components/OrderStatusTrendChart';
import QuickActions from '../components/QuickActions';
import TopPayments from '../components/TopPayments';
import TopProducts from '../components/TopProducts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA66CC', '#FF4444', '#33B5E5'];

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [orderTrendData, setOrderTrendData] = useState([]);
    const [revenue, setRevenue] = useState(null);
    const [is24Hour, setIs24Hour] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [orderInsights, setOrderInsights] = useState({
        totalWeeklyOrders: 0,
        weeklyGrowth: 0,
        peakDay: '',
        peakDayOrders: 0,
        averageDaily: 0,
        trend: 'stable'
    });


    // Function to process orders data into weekly trend
    const processOrderTrendData = (orders) => {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        
        // Create array for last 7 days in correct order (Sun, Mon, Tue, Wed, Thu, Fri, Sat)
        const weekData = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Get the current week that includes today (Sunday to Saturday)
        const todayDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const daysFromSunday = todayDayOfWeek; // How many days since last Sunday
        
        // Calculate Sunday of current week using local dates to avoid timezone issues
        const currentWeekSunday = new Date(now);
        currentWeekSunday.setDate(now.getDate() - daysFromSunday);
        currentWeekSunday.setHours(0, 0, 0, 0); // Set to start of day
        
        // Create the current week starting from Sunday and ending with Saturday
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentWeekSunday);
            date.setDate(currentWeekSunday.getDate() + i);
            // Use local date string to avoid timezone issues
            const localDateString = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
            weekData.push({
                day: dayNames[i],
                date: localDateString,
                orders: 0,
                fullDate: date
            });
        }
        
        // Debug: Log the week data to verify dates
        console.log('Current week data:', weekData.map(d => `${d.day}: ${d.date}`));
        console.log('Today is:', now.toISOString().split('T')[0], 'Day of week:', now.getDay());
        
        // Count orders for current week
        let currentWeekTotal = 0;
        let previousWeekTotal = 0;
        
        orders.forEach(order => {
            const orderDate = new Date(order.orderDate);
            
            // Use local date string for consistent matching
            const localDateString = orderDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
            const utcDateString = orderDate.toISOString().split('T')[0];
            
            // Debug: Log each order's date processing
            console.log('Processing order:', {
                originalDate: order.orderDate,
                parsedDate: orderDate,
                utcDateString: utcDateString,
                localDateString: localDateString,
                dayOfWeek: orderDate.getDay()
            });
            
            // Find which day this order belongs to in our week data (try local first, then UTC)
            let dayData = weekData.find(day => day.date === localDateString);
            if (!dayData) {
                dayData = weekData.find(day => day.date === utcDateString);
                if (dayData) {
                    console.log('Order matched using UTC date:', dayData.day, dayData.date);
                }
            } else {
                console.log('Order matched using local date:', dayData.day, dayData.date);
            }
            
            if (dayData) {
                currentWeekTotal++;
                dayData.orders++;
            } else {
                console.log('Order NOT matched to any day in current week');
            }
            
            // Count for previous week (8-14 days ago) for growth calculation
            if (orderDate >= fourteenDaysAgo && orderDate < sevenDaysAgo) {
                previousWeekTotal++;
            }
        });
        
        // Calculate insights
        const totalWeeklyOrders = currentWeekTotal;
        const averageDaily = Math.round(totalWeeklyOrders / 7);
        const weeklyGrowth = previousWeekTotal > 0 
            ? Math.round(((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100)
            : 0;
        
        // Find peak day
        const peakDayData = weekData.reduce((max, item) => 
            item.orders > max.orders ? item : max, weekData[0]
        );
        
        // Determine trend
        let trend = 'stable';
        if (weekData.length >= 3) {
            const recent = weekData.slice(-3).reduce((sum, item) => sum + item.orders, 0);
            const earlier = weekData.slice(0, 3).reduce((sum, item) => sum + item.orders, 0);
            if (recent > earlier) trend = 'rising';
            else if (recent < earlier) trend = 'declining';
        }
        
        // Update insights state
        setOrderInsights({
            totalWeeklyOrders,
            weeklyGrowth,
            peakDay: peakDayData.day,
            peakDayOrders: peakDayData.orders,
            averageDaily,
            trend
        });
        
        return weekData;
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch('http://localhost:8081/api/dashboard/stats').then(res => res.json()),
            fetch('http://localhost:8081/api/dashboard/entity-distribution').then(res => res.json()),
            fetch('http://localhost:8081/orders').then(res => res.json()), // Fetch real orders data
            fetch('http://localhost:8081/api/dashboard/revenue-summary').then(res => res.json()),
        ])
        .then(([statsRes, chartRes, ordersRes, revenueRes]) => {
            setStats(statsRes);
            setChartData(chartRes);
            
            // Process real orders data into trend format
            const trendData = processOrderTrendData(ordersRes);
            setOrderTrendData(trendData);
            
            setRevenue(revenueRes);
            setLoading(false);
        })
        .catch((err) => {
            console.error('Dashboard data loading error:', err);
            setError('Failed to load dashboard data');
            setLoading(false);
        });
    }, []);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Track online/offline status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Additional check with a small delay to ensure accurate status
        const checkConnection = () => {
            setIsOnline(navigator.onLine);
        };

        // Check connection status periodically (every 30 seconds)
        const connectionCheck = setInterval(checkConnection, 30000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(connectionCheck);
        };
    }, []);

    const formatTime = (date, is24Hour) => {
        if (is24Hour) {
            return date.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else {
            return date.toLocaleTimeString('en-US', { 
                hour12: true, 
                hour: 'numeric', 
                minute: '2-digit' 
            });
        }
    };

    return (
        <div className="min-h-screen w-full p-6 bg-gray-50 overflow-x-hidden">
            {/* Header with Quick Actions */}
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
                    <p className="text-gray-600 text-lg">Welcome back, Tim! <span role="img" aria-label="smile">😊</span></p>
                </div>
                
                {/* Small utility elements in the middle space */}
                <div className="flex items-center gap-4 mt-2">
                    {/* Current Date - Enhanced */}
                    <div className="text-center bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                        <div className="text-xs text-gray-500 font-medium">
                            {new Date().toLocaleDateString('en-US', { 
                                weekday: 'short'
                            })}
                        </div>
                        <div className="text-sm font-semibold text-gray-700">
                            {new Date().toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </div>
                    </div>
                    
                    {/* Time indicator with toggle */}
                    <div 
                        className="cursor-pointer bg-blue-100 hover:bg-blue-200 rounded-lg px-3 py-2 transition-colors"
                        onClick={() => setIs24Hour(!is24Hour)}
                        title={`Click to switch to ${is24Hour ? '12-hour' : '24-hour'} format`}
                    >
                        <div className="flex items-center gap-2">
                            <FaClock className="w-3 h-3 text-blue-600" />
                            <div className="text-center">
                                <div className="text-xs text-gray-500 font-medium">
                                    {is24Hour ? '24hr' : '12hr'}
                                </div>
                                <div className="text-sm font-semibold text-gray-700">
                                    {formatTime(currentTime, is24Hour)}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Quick status indicator */}
                    <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                            isOnline 
                                ? 'bg-green-400 animate-pulse' 
                                : 'bg-red-400'
                        }`}></div>
                        <span className={`text-xs font-medium transition-colors duration-300 ${
                            isOnline 
                                ? 'text-green-600' 
                                : 'text-red-600'
                        }`}>
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>
                
                <div className="mt-1">
                    <QuickActions />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600">Loading dashboard...</span>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <div className="text-red-600 text-lg font-medium">{error}</div>
                </div>
            ) : (
                <div className="max-w-full space-y-8">
                    {/* Stats Cards Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Products Card */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 rounded-xl bg-blue-100">
                                        <FaBox className="w-6 h-6 text-blue-600" />
                                    </div>
                                    {stats?.productTrend !== undefined && (
                                        <div className="flex items-center gap-1">
                                            {stats.productTrend > 0 ? (
                                                <FaArrowUp className="w-3 h-3 text-green-500" />
                                            ) : stats.productTrend < 0 ? (
                                                <FaArrowDown className="w-3 h-3 text-red-500" />
                                            ) : null}
                                            <span className={`text-sm font-semibold ${
                                                stats.productTrend > 0 ? 'text-green-600' : stats.productTrend < 0 ? 'text-red-600' : 'text-gray-500'
                                            }`}>
                                                {stats.productTrend > 0 ? `+${Math.abs(stats.productTrend)}%` : stats.productTrend < 0 ? `-${Math.abs(stats.productTrend)}%` : '0%'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Products</h3>
                                    <p className="text-3xl font-bold text-gray-900 mb-1">{stats?.products ?? '-'}</p>
                                    <p className="text-xs text-gray-500">Items in inventory</p>
                                </div>
                                <button 
                                    onClick={() => navigate('/products')}
                                    className="w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white hover:shadow-md"
                                >
                                    View Products
                                </button>
                            </div>
                        </div>

                        {/* Customers Card */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 rounded-xl bg-green-100">
                                        <FaUsers className="w-6 h-6 text-green-600" />
                                    </div>
                                    {stats?.customerTrend !== undefined && (
                                        <div className="flex items-center gap-1">
                                            {stats.customerTrend > 0 ? (
                                                <FaArrowUp className="w-3 h-3 text-green-500" />
                                            ) : stats.customerTrend < 0 ? (
                                                <FaArrowDown className="w-3 h-3 text-red-500" />
                                            ) : null}
                                            <span className={`text-sm font-semibold ${
                                                stats.customerTrend > 0 ? 'text-green-600' : stats.customerTrend < 0 ? 'text-red-600' : 'text-gray-500'
                                            }`}>
                                                {stats.customerTrend > 0 ? `+${Math.abs(stats.customerTrend)}%` : stats.customerTrend < 0 ? `-${Math.abs(stats.customerTrend)}%` : '0%'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Customers</h3>
                                    <p className="text-3xl font-bold text-gray-900 mb-1">{stats?.customers ?? '-'}</p>
                                    <p className="text-xs text-gray-500">Active customer base</p>
                                </div>
                                <button 
                                    onClick={() => navigate('/customers')}
                                    className="w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white hover:shadow-md"
                                >
                                    View Customers
                                </button>
                            </div>
                        </div>

                        {/* Orders Card */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 rounded-xl bg-purple-100">
                                        <FaClipboardCheck className="w-6 h-6 text-purple-600" />
                                    </div>
                                    {stats?.orderTrend !== undefined && (
                                        <div className="flex items-center gap-1">
                                            {stats.orderTrend > 0 ? (
                                                <FaArrowUp className="w-3 h-3 text-green-500" />
                                            ) : stats.orderTrend < 0 ? (
                                                <FaArrowDown className="w-3 h-3 text-red-500" />
                                            ) : null}
                                            <span className={`text-sm font-semibold ${
                                                stats.orderTrend > 0 ? 'text-green-600' : stats.orderTrend < 0 ? 'text-red-600' : 'text-gray-500'
                                            }`}>
                                                {stats.orderTrend > 0 ? `+${Math.abs(stats.orderTrend)}%` : stats.orderTrend < 0 ? `-${Math.abs(stats.orderTrend)}%` : '0%'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Orders</h3>
                                    <p className="text-3xl font-bold text-gray-900 mb-1">{stats?.orders ?? '-'}</p>
                                    <p className="text-xs text-gray-500">Orders processed</p>
                                </div>
                                <button 
                                    onClick={() => navigate('/orders')}
                                    className="w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white hover:shadow-md"
                                >
                                    View Orders
                                </button>
                            </div>
                        </div>

                        {/* Revenue Card */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 rounded-xl bg-orange-100">
                                        <FaBell className="w-6 h-6 text-orange-600" />
                                    </div>
                                    {revenue?.trend !== undefined && (
                                        <div className="flex items-center gap-1">
                                            {revenue.trend > 0 ? (
                                                <FaArrowUp className="w-3 h-3 text-green-500" />
                                            ) : revenue.trend < 0 ? (
                                                <FaArrowDown className="w-3 h-3 text-red-500" />
                                            ) : null}
                                            <span className={`text-sm font-semibold ${
                                                revenue.trend > 0 ? 'text-green-600' : revenue.trend < 0 ? 'text-red-600' : 'text-gray-500'
                                            }`}>
                                                {revenue.trend > 0 ? `+${Math.abs(revenue.trend)}%` : revenue.trend < 0 ? `-${Math.abs(revenue.trend)}%` : '0%'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Revenue</h3>
                                    <p className="text-3xl font-bold text-gray-900 mb-1">
                                        {revenue?.totalRevenue ? `Ksh ${revenue.totalRevenue.toLocaleString()}` : '-'}
                                    </p>
                                    <p className="text-xs text-gray-500">This month's earnings</p>
                                </div>
                                <button 
                                    onClick={() => navigate('/payments')}
                                    className="w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white hover:shadow-md"
                                >
                                    View Revenue
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Order Status Trends and Business Performance Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <OrderStatusTrendChart />
                        <BusinessAnalytics />
                    </div>

                    {/* Analytics Charts */}
                    <div id="analytics-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Enhanced Pie Chart */}
                        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">Entity Distribution</h3>
                                    <p className="text-sm text-gray-500 mt-1">Overview of all entities in the system</p>
                                </div>
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FaBox className="w-4 h-4 text-blue-600" />
                                </div>
                            </div>
                            
                            <div className="flex flex-col lg:flex-row items-center">
                                {/* Pie Chart */}
                                <div className="flex-shrink-0">
                                    <PieChart width={280} height={280}>
                                        <Pie 
                                            data={chartData} 
                                            dataKey="value" 
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            innerRadius={50}
                                            stroke="#fff"
                                            strokeWidth={3}
                                        >
                                            {chartData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: 'none',
                                                borderRadius: '12px',
                                                color: 'white',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                                            }}
                                        />
                                    </PieChart>
                                </div>
                                
                                {/* Legend */}
                                <div className="flex-1 space-y-3">
                                    {chartData.map((entry, index) => (
                                        <div key={entry.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="w-4 h-4 rounded-full shadow-sm"
                                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                ></div>
                                                <span className="text-sm font-medium text-gray-700 capitalize">{entry.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-gray-900">{entry.value}</div>
                                                <div className="text-xs text-gray-500">
                                                    {chartData.length > 0 ? Math.round((entry.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100) : 0}%
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Bar Chart with Real-time Data */}
                        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">Weekly Orders Trend</h3>
                                    <p className="text-sm text-gray-500 mt-1">Live data from your orders - Last 7 days</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                        title="Refresh trend data"
                                    >
                                        <svg className="w-4 h-4 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </button>
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <FaClipboardCheck className="w-4 h-4 text-purple-600" />
                                    </div>
                                    {orderInsights.weeklyGrowth !== 0 && (
                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                            orderInsights.weeklyGrowth > 0 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {orderInsights.weeklyGrowth > 0 ? (
                                                <FaArrowUp className="w-3 h-3" />
                                            ) : (
                                                <FaArrowDown className="w-3 h-3" />
                                            )}
                                            {Math.abs(orderInsights.weeklyGrowth)}%
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span className="text-gray-600">Orders</span>
                                    </div>
                                    <div className="text-gray-500">
                                        Total: <span className="font-semibold text-gray-900">
                                            {orderInsights.totalWeeklyOrders}
                                        </span>
                                    </div>
                                    <div className="text-gray-500">
                                        Daily Avg: <span className="font-semibold text-gray-900">
                                            {orderInsights.averageDaily}
                                        </span>
                                    </div>
                                    <div className="text-gray-500">
                                        Peak: <span className="font-semibold text-gray-900">
                                            {orderInsights.peakDay} ({orderInsights.peakDayOrders})
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-center">
                                <BarChart width={380} height={280} data={orderTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                                            <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.9}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.3} />
                                    <XAxis 
                                        dataKey="day" 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#6B7280', fontWeight: '500' }}
                                        height={60}
                                    />
                                    <YAxis 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#6B7280', fontWeight: '500' }}
                                        width={60}
                                    />
                                    <Tooltip 
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            border: 'none',
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                                        }}
                                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                        formatter={(value) => [
                                            `${value} order${value !== 1 ? 's' : ''}`,
                                            'Orders'
                                        ]}
                                        labelFormatter={(label) => {
                                            const dayData = orderTrendData.find(d => d.day === label);
                                            return dayData ? `${label} (${dayData.date})` : label;
                                        }}
                                    />
                                    <Bar 
                                        dataKey="orders" 
                                        fill="url(#orderGradient)"
                                        radius={[6, 6, 0, 0]}
                                        stroke="#2563EB"
                                        strokeWidth={1}
                                    />
                                </BarChart>
                            </div>
                            
                            {/* Enhanced Quick Stats */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Peak Day</div>
                                        <div className="text-sm font-semibold text-gray-900">
                                            {orderInsights.peakDay || 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {orderInsights.peakDayOrders} orders
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Daily Average</div>
                                        <div className="text-sm font-semibold text-gray-900">
                                            {orderInsights.averageDaily}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            per day
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Trend</div>
                                        <div className="text-sm font-semibold flex items-center justify-center gap-1">
                                            {orderInsights.trend === 'rising' ? (
                                                <>
                                                    <FaArrowUp className="w-3 h-3 text-green-500" />
                                                    <span className="text-green-600">Rising</span>
                                                </>
                                            ) : orderInsights.trend === 'declining' ? (
                                                <>
                                                    <FaArrowDown className="w-3 h-3 text-red-500" />
                                                    <span className="text-red-600">Declining</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-3 h-0.5 bg-gray-400 rounded"></div>
                                                    <span className="text-gray-600">Stable</span>
                                                </>
                                            )}
                                        </div>
                                        {orderInsights.weeklyGrowth !== 0 && (
                                            <div className="text-xs text-gray-400">
                                                {orderInsights.weeklyGrowth > 0 ? '+' : ''}{orderInsights.weeklyGrowth}% vs last week
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Data freshness indicator */}
                            <div className="mt-4 pt-3 border-t border-gray-100">
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        <span>Live data from orders database</span>
                                    </div>
                                    <div>
                                        Last updated: {new Date().toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Payments and Products */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <TopPayments />
                        <TopProducts />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
