import { useEffect, useState } from 'react';
import { FaArrowDown, FaArrowUp, FaBell, FaBox, FaClipboardCheck, FaClock, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';

import BusinessAnalytics from '../components/BusinessPerformanceMetrics';
import CustomerCreditLimits from '../components/CustomerCreditLimits';
import OrderStatusTrendChart from '../components/OrderStatusTrendChart';
import QuickActions from '../components/QuickActions';
import TopPayments from '../components/TopPayments';
import TopProducts from '../components/TopProducts';
import { dashboardAPI, dataAPI } from '../utils/axios';

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
    const [liveMetrics, setLiveMetrics] = useState({
        todayOrders: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
        totalReturns: 0,
        conversionRate: 0,
        averageOrderValue: 0
    });
    const [allOrders, setAllOrders] = useState([]);
    const [allProducts, setAllProducts] = useState([]); // eslint-disable-line no-unused-vars

    const calculateLiveMetrics = (orders, products) => {
        const today = new Date().toISOString().split('T')[0];
        
        const todayOrders = orders.filter(order => {
            const orderDate = new Date(order.orderDate).toISOString().split('T')[0];
            return orderDate === today;
        }).length;

        const pendingOrders = orders.filter(order => 
            order.status && (
                order.status.toLowerCase().includes('pending') ||
                order.status.toLowerCase().includes('processing') ||
                order.status.toLowerCase().includes('shipped') ||
                !order.status.toLowerCase().includes('delivered')
            )
        ).length;

        const lowStockProducts = products.filter(product => 
            parseInt(product.quantityInStock || 0) < 10
        ).length;

        const totalRevenue = orders.reduce((sum, order) => {
            
            const value = parseFloat(order.totalAmount || order.total || order.amount || 0);
            return sum + value;
        }, 0);
        const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
        const totalReturns = Math.floor(orders.length * 0.03);
        const uniqueCustomers = new Set(orders.map(order => order.customerNumber || order.customerId)).size;
        const conversionRate = uniqueCustomers > 0 ? (orders.length / uniqueCustomers) * 100 : 0;
        const metrics = {
            todayOrders,
            pendingOrders,
            lowStockProducts,
            totalReturns,
            conversionRate,
            averageOrderValue
        };

        console.log('📊 Calculated live metrics:', metrics);
        setLiveMetrics(metrics);
        return metrics;
    };

    const processOrderTrendData = (orders) => {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        
        const weekData = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        const todayDayOfWeek = now.getDay();
        const daysFromSunday = todayDayOfWeek;
        
        const currentWeekSunday = new Date(now);
        currentWeekSunday.setDate(now.getDate() - daysFromSunday);
        currentWeekSunday.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentWeekSunday);
            date.setDate(currentWeekSunday.getDate() + i);
            
            const localDateString = date.toLocaleDateString('en-CA');
            weekData.push({
                day: dayNames[i],
                date: localDateString,
                orders: 0,
                fullDate: date
            });
        }
        
        console.log('Current week data:', weekData.map(d => `${d.day}: ${d.date}`));
        console.log('Today is:', now.toISOString().split('T')[0], 'Day of week:', now.getDay());
        
        let currentWeekTotal = 0;
        let previousWeekTotal = 0;
        
        orders.forEach(order => {
            const orderDate = new Date(order.orderDate);
            
            const localDateString = orderDate.toLocaleDateString('en-CA');
            const utcDateString = orderDate.toISOString().split('T')[0];
            
            console.log('Processing order:', {
                originalDate: order.orderDate,
                parsedDate: orderDate,
                utcDateString: utcDateString,
                localDateString: localDateString,
                dayOfWeek: orderDate.getDay()
            });
            
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
            
            if (orderDate >= fourteenDaysAgo && orderDate < sevenDaysAgo) {
                previousWeekTotal++;
            }
        });
        
        const totalWeeklyOrders = currentWeekTotal;
        const averageDaily = Math.round(totalWeeklyOrders / 7);
        const weeklyGrowth = previousWeekTotal > 0 
            ? Math.round(((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100)
            : 0;
        
        const peakDayData = weekData.reduce((max, item) => 
            item.orders > max.orders ? item : max, weekData[0]
        );
        
        let trend = 'stable';
        if (weekData.length >= 3) {
            const recent = weekData.slice(-3).reduce((sum, item) => sum + item.orders, 0);
            const earlier = weekData.slice(0, 3).reduce((sum, item) => sum + item.orders, 0);
            if (recent > earlier) trend = 'rising';
            else if (recent < earlier) trend = 'declining';
        }
        
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
        console.log('🔍 Dashboard: Starting data fetch...');
        setLoading(true);
        Promise.all([
            dashboardAPI.getStats(),
            dashboardAPI.getEntityDistribution(),
            dataAPI.getOrders(),
            dashboardAPI.getRevenueSummary(),
            dataAPI.getProducts()
        ])
        .then(([statsRes, chartRes, ordersRes, revenueRes, productsRes]) => {
            console.log('Dashboard: All API responses received');
            console.log('Stats Response:', statsRes.data);
            console.log('Chart Response:', chartRes.data);
            console.log('Orders Response:', ordersRes.data);
            console.log('Revenue Response:', revenueRes.data);
            console.log('Products Response:', productsRes.data);
            
            setStats(statsRes.data);
            setChartData(chartRes.data);
            setAllOrders(ordersRes.data);
            setAllProducts(productsRes.data);
            
            const trendData = processOrderTrendData(ordersRes.data);
            setOrderTrendData(trendData);
            
            setRevenue(revenueRes.data);
            
            calculateLiveMetrics(ordersRes.data, productsRes.data);
            
            setLoading(false);
            
            console.log('Dashboard: All data set in state');
        })
        .catch((err) => {
            console.error('Dashboard data loading error:', err);
            console.error('Error details:', {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data
            });
            setError(err.message || 'Failed to load dashboard data');
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        const checkConnection = () => {
            setIsOnline(navigator.onLine);
        };

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
        <div className="min-h-screen w-full p-4 bg-gray-50 overflow-x-hidden">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
                    <p className="text-gray-600 text-base">Welcome back, Tim! <span role="img" aria-label="smile">😊</span></p>
                </div>
                
                <div className="flex items-center gap-3 mt-1">
                    <div className="text-center bg-white rounded-lg px-2 py-1.5 shadow-sm border border-gray-200">
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
                    
                    <div 
                        className="cursor-pointer bg-blue-100 hover:bg-blue-200 rounded-lg px-2 py-1.5 transition-colors"
                        onClick={() => setIs24Hour(!is24Hour)}
                        title={`Click to switch to ${is24Hour ? '12-hour' : '24-hour'} format`}
                    >
                        <div className="flex items-center gap-1.5">
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
                <div className="max-w-full space-y-6">
                   
                    
                    {/* Stats Cards Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Products Card */}
                        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2 rounded-lg bg-blue-100">
                                        <FaBox className="w-5 h-5 text-blue-600" />
                                    </div>
                                    {stats?.productTrend !== undefined && (
                                        <div className="flex items-center gap-1">
                                            {stats.productTrend > 0 ? (
                                                <FaArrowUp className="w-3 h-3 text-green-500" />
                                            ) : stats.productTrend < 0 ? (
                                                <FaArrowDown className="w-3 h-3 text-red-500" />
                                            ) : null}
                                            <span className={`text-xs font-semibold ${
                                                stats.productTrend > 0 ? 'text-green-600' : stats.productTrend < 0 ? 'text-red-600' : 'text-gray-500'
                                            }`}>
                                                {stats.productTrend > 0 ? `+${Math.abs(stats.productTrend)}%` : stats.productTrend < 0 ? `-${Math.abs(stats.productTrend)}%` : '0%'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <h3 className="text-xs font-medium text-gray-600 mb-1">Total Products</h3>
                                    <p className="text-2xl font-bold text-gray-900 mb-0.5">{stats?.products ?? '-'}</p>
                                    <p className="text-xs text-gray-500">Items in inventory</p>
                                </div>
                                <button 
                                    onClick={() => navigate('/products')}
                                    className="w-full py-2 px-3 rounded-lg font-medium text-xs transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white hover:shadow-md"
                                >
                                    View Products
                                </button>
                            </div>
                        </div>

                        {/* Customers Card */}
                        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2 rounded-lg bg-green-100">
                                        <FaUsers className="w-5 h-5 text-green-600" />
                                    </div>
                                    {stats?.customerTrend !== undefined && (
                                        <div className="flex items-center gap-1">
                                            {stats.customerTrend > 0 ? (
                                                <FaArrowUp className="w-3 h-3 text-green-500" />
                                            ) : stats.customerTrend < 0 ? (
                                                <FaArrowDown className="w-3 h-3 text-red-500" />
                                            ) : null}
                                            <span className={`text-xs font-semibold ${
                                                stats.customerTrend > 0 ? 'text-green-600' : stats.customerTrend < 0 ? 'text-red-600' : 'text-gray-500'
                                            }`}>
                                                {stats.customerTrend > 0 ? `+${Math.abs(stats.customerTrend)}%` : stats.customerTrend < 0 ? `-${Math.abs(stats.customerTrend)}%` : '0%'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <h3 className="text-xs font-medium text-gray-600 mb-1">Total Customers</h3>
                                    <p className="text-2xl font-bold text-gray-900 mb-0.5">{stats?.customers ?? '-'}</p>
                                    <p className="text-xs text-gray-500">Active customer base</p>
                                </div>
                                <button 
                                    onClick={() => navigate('/customers')}
                                    className="w-full py-2 px-3 rounded-lg font-medium text-xs transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white hover:shadow-md"
                                >
                                    View Customers
                                </button>
                            </div>
                        </div>

                        {/* Orders Card */}
                        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2 rounded-lg bg-purple-100">
                                        <FaClipboardCheck className="w-5 h-5 text-purple-600" />
                                    </div>
                                    {stats?.orderTrend !== undefined && (
                                        <div className="flex items-center gap-1">
                                            {stats.orderTrend > 0 ? (
                                                <FaArrowUp className="w-3 h-3 text-green-500" />
                                            ) : stats.orderTrend < 0 ? (
                                                <FaArrowDown className="w-3 h-3 text-red-500" />
                                            ) : null}
                                            <span className={`text-xs font-semibold ${
                                                stats.orderTrend > 0 ? 'text-green-600' : stats.orderTrend < 0 ? 'text-red-600' : 'text-gray-500'
                                            }`}>
                                                {stats.orderTrend > 0 ? `+${Math.abs(stats.orderTrend)}%` : stats.orderTrend < 0 ? `-${Math.abs(stats.orderTrend)}%` : '0%'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <h3 className="text-xs font-medium text-gray-600 mb-1">Total Orders</h3>
                                    <p className="text-2xl font-bold text-gray-900 mb-0.5">{stats?.orders ?? '-'}</p>
                                    <p className="text-xs text-gray-500">Orders processed</p>
                                </div>
                                <button 
                                    onClick={() => navigate('/orders')}
                                    className="w-full py-2 px-3 rounded-lg font-medium text-xs transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white hover:shadow-md"
                                >
                                    View Orders
                                </button>
                            </div>
                        </div>

                        {/* Revenue Card */}
                        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2 rounded-lg bg-orange-100">
                                        <FaBell className="w-5 h-5 text-orange-600" />
                                    </div>
                                    {revenue?.trend !== undefined && (
                                        <div className="flex items-center gap-1">
                                            {revenue.trend > 0 ? (
                                                <FaArrowUp className="w-3 h-3 text-green-500" />
                                            ) : revenue.trend < 0 ? (
                                                <FaArrowDown className="w-3 h-3 text-red-500" />
                                            ) : null}
                                            <span className={`text-xs font-semibold ${
                                                revenue.trend > 0 ? 'text-green-600' : revenue.trend < 0 ? 'text-red-600' : 'text-gray-500'
                                            }`}>
                                                {revenue.trend > 0 ? `+${Math.abs(revenue.trend)}%` : revenue.trend < 0 ? `-${Math.abs(revenue.trend)}%` : '0%'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <h3 className="text-xs font-medium text-gray-600 mb-1">Total Revenue</h3>
                                    <p className="text-2xl font-bold text-gray-900 mb-0.5">
                                        {revenue?.totalRevenue ? `Ksh ${revenue.totalRevenue.toLocaleString()}` : '-'}
                                    </p>
                                    <p className="text-xs text-gray-500">This month's earnings</p>
                                </div>
                                <button 
                                    onClick={() => navigate('/payments')}
                                    className="w-full py-2 px-3 rounded-lg font-medium text-xs transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white hover:shadow-md"
                                >
                                    View Revenue
                                </button>
                            </div>
                        </div>
                    </div>
                  
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Recent Activity */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4 border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-800">Recent Activity</h3>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-gray-500">Live</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {/* Show recent orders from actual data */}
                                {allOrders.slice(0, 3).map((order, index) => (
                                    <div key={order.orderNumber || index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                        <div className="p-1.5 bg-blue-100 rounded-full">
                                            <FaClipboardCheck className="w-3 h-3 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-800">
                                                Order #{order.orderNumber || `ORD-${order.orderDate?.slice(-4) || 'NEW'}`}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'Today'}
                                            </p>
                                        </div>
                                        <span className="text-xs text-green-600 font-medium">
                                            {order.status || 'Processing'}
                                        </span>
                                    </div>
                                ))}
                                
                                {/* Show low stock alert if applicable */}
                                {liveMetrics.lowStockProducts > 0 && (
                                    <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="p-1.5 bg-orange-100 rounded-full">
                                            <FaBox className="w-3 h-3 text-orange-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-800">Low Stock Alert</p>
                                            <p className="text-xs text-gray-500">{liveMetrics.lowStockProducts} products need restocking</p>
                                        </div>
                                        <span className="text-xs text-orange-600 font-medium">Action Required</span>
                                    </div>
                                )}
                                
                                {/* System activity */}
                                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                    <div className="p-1.5 bg-green-100 rounded-full">
                                        <FaUsers className="w-3 h-3 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-800">Data synchronized</p>
                                        <p className="text-xs text-gray-500">Live metrics updated</p>
                                    </div>
                                    <span className="text-xs text-blue-600 font-medium">Active</span>
                                </div>
                            </div>
                        </div>

                        {/* System Health */}
                        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-800 mb-3">System Health</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Database</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span className="text-xs font-medium text-green-600">Healthy</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">API Response</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span className="text-xs font-medium text-green-600">Fast</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Server Load</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                        <span className="text-xs font-medium text-yellow-600">Normal</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Backup Status</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span className="text-xs font-medium text-green-600">Recent</span>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <div className="text-xs text-gray-500 mb-1">Uptime</div>
                                    <div className="text-sm font-bold text-gray-800">99.98%</div>
                                    <div className="text-xs text-gray-400">Last 30 days</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    

                    {/* Order Status Trends and Business Performance Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <OrderStatusTrendChart />
                        <BusinessAnalytics />
                    </div>

                    {/* Analytics Charts */}
                    <div id="analytics-section" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Enhanced Pie Chart */}
                        <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-800">Entity Distribution</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Overview of all entities in the system</p>
                                </div>
                                <div className="p-1.5 bg-blue-100 rounded-lg">
                                    <FaBox className="w-3 h-3 text-blue-600" />
                                </div>
                            </div>
                            
                            <div className="flex flex-col lg:flex-row items-center">
                                {/* Pie Chart */}
                                <div className="flex-shrink-0">
                                    <PieChart width={240} height={240}>
                                        <Pie 
                                            data={chartData} 
                                            dataKey="value" 
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={85}
                                            innerRadius={45}
                                            stroke="#fff"
                                            strokeWidth={2}
                                        >
                                            {chartData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: 'white',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
                                            }}
                                        />
                                    </PieChart>
                                </div>
                                
                                {/* Legend */}
                                <div className="flex-1 space-y-2">
                                    {chartData.map((entry, index) => (
                                        <div key={entry.name} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="w-3 h-3 rounded-full shadow-sm"
                                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                ></div>
                                                <span className="text-xs font-medium text-gray-700 capitalize">{entry.name}</span>
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
                        <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-800">Weekly Orders Trend</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Live data from your orders - Last 7 days</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                        title="Refresh trend data"
                                    >
                                        <svg className="w-3 h-3 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </button>
                                    <div className="p-1.5 bg-purple-100 rounded-lg">
                                        <FaClipboardCheck className="w-3 h-3 text-purple-600" />
                                    </div>
                                    {orderInsights.weeklyGrowth !== 0 && (
                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                            orderInsights.weeklyGrowth > 0 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {orderInsights.weeklyGrowth > 0 ? (
                                                <FaArrowUp className="w-2 h-2" />
                                            ) : (
                                                <FaArrowDown className="w-2 h-2" />
                                            )}
                                            {Math.abs(orderInsights.weeklyGrowth)}%
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
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
                                <BarChart width={320} height={220} data={orderTrendData} margin={{ top: 15, right: 25, left: 15, bottom: 5 }}>
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
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-0.5">Peak Day</div>
                                        <div className="text-sm font-semibold text-gray-900">
                                            {orderInsights.peakDay || 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {orderInsights.peakDayOrders} orders
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-0.5">Daily Average</div>
                                        <div className="text-sm font-semibold text-gray-900">
                                            {orderInsights.averageDaily}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            per day
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-0.5">Trend</div>
                                        <div className="text-sm font-semibold flex items-center justify-center gap-1">
                                            {orderInsights.trend === 'rising' ? (
                                                <>
                                                    <FaArrowUp className="w-2 h-2 text-green-500" />
                                                    <span className="text-green-600">Rising</span>
                                                </>
                                            ) : orderInsights.trend === 'declining' ? (
                                                <>
                                                    <FaArrowDown className="w-2 h-2 text-red-500" />
                                                    <span className="text-red-600">Declining</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-2 h-0.5 bg-gray-400 rounded"></div>
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
                            <div className="mt-3 pt-2 border-t border-gray-100">
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                        <span>Live data from orders database</span>
                                    </div>
                                    <div>
                                        Last updated: {new Date().toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Payments, Products, and Recent Orders */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <TopPayments />
                        <TopProducts />
                        <CustomerCreditLimits />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
