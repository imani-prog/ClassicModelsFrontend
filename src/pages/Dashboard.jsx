import { useEffect, useState } from 'react';
import { FaArrowDown, FaArrowUp, FaBox, FaClipboardCheck, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';
import OrderStatusTrendChart from '../components/OrderStatusTrendChart';
import RevenueCard from '../components/RevenueCard';
import TopPayments from '../components/TopPayments';
import TopProducts from '../components/TopProducts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA66CC', '#FF4444', '#33B5E5'];

const Dashboard = ({ isOpen, setIsOpen, darkMode, setDarkMode }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [orderTrendData, setOrderTrendData] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [revenue, setRevenue] = useState(null);


    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch('http://localhost:8081/api/dashboard/stats').then(res => res.json()),
            fetch('http://localhost:8081/api/dashboard/entity-distribution').then(res => res.json()),
            fetch('http://localhost:8081/api/dashboard/order-trend').then(res => res.json()),
            fetch('http://localhost:8081/api/dashboard/notifications').then(res => res.json()),
            fetch('http://localhost:8081/api/dashboard/revenue-summary').then(res => res.json()),
        ])
        .then(([statsRes, chartRes, trendRes, notifRes,revenueRes,]) => {
            setStats(statsRes);
            setChartData(chartRes);
            setOrderTrendData(trendRes);
            setNotifications(notifRes);
            setRevenue(revenueRes);
            setLoading(false);
        })
        .catch(err => {
            setError('Failed to load dashboard data');
            setLoading(false);
        });
    }, []);

    return (
       
        <div className="min-h-screen w-full p-4 overflow-x-hidden">
            <div className="flex justify-between items-center relative">
                <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
            </div>
            <p className="text-left text-lg mt-4">Welcome back Tim <span role="img" aria-label="smile">😊</span></p>

            {loading ? (
                <div className="text-center py-10">Loading dashboard...</div>
            ) : error ? (
                <div className="text-center text-red-500 py-10">{error}</div>
            ) : (
                <>
                <div className="max-w-7xl mx-auto px-2 mt-6">
                    {/* Stats Cards Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Products Card */}
                        <div className="flex flex-col">
                            <div className="border-3 border-[#57acee] rounded-lg p-6 text-center flex-1">
                                <div className="flex justify-center items-center text-gray-700 mb-2 text-lg">
                                    <FaBox className="mr-2" />
                                    Total Products
                                </div>
                                <p className="text-4xl font-bold">{stats?.products ?? '-'}</p>
                                <p className={`text-sm mt-2 flex items-center justify-center ${stats?.productTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {stats?.productTrend >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />} {Math.abs(stats?.productTrend ?? 0)}% this week
                                </p>
                            </div>
                            <div className="w-full text-center mt-4">
                                <button onClick={() => navigate('/products')} className="bg-[#4a90e2] cursor-pointer rounded-lg text-white py-2 px-8 w-full">
                                    View Products
                                </button>
                            </div>
                        </div>

                        {/* Customers Card */}
                        <div className="flex flex-col">
                            <div className="border-3 border-[#57acee] rounded-lg p-6 text-center flex-1">
                                <div className="flex justify-center text-gray-700 items-center mb-2 text-lg">
                                    <FaUsers className="mr-2" />
                                    Total Customers
                                </div>
                                <p className="text-4xl font-bold">{stats?.customers ?? '-'}</p>
                                <p className={`text-sm mt-2 flex items-center justify-center ${stats?.customerTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {stats?.customerTrend >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />} {Math.abs(stats?.customerTrend ?? 0)}% this week
                                </p>
                            </div>
                            <div className="w-full text-center mt-4">
                                <button onClick={() => navigate('/customers')} className="bg-[#4a90e2] cursor-pointer rounded-lg text-white py-2 px-8 w-full">
                                    View Customers
                                </button>
                            </div>
                        </div>

                        {/* Orders Card */}
                        <div className="flex flex-col">
                            <div className="border-3 border-[#57acee] rounded-lg p-6 text-center flex-1">
                                <div className="flex justify-center text-gray-700 items-center mb-2 text-lg">
                                    <FaClipboardCheck className="mr-2" />
                                    Total Orders
                                </div>
                                <p className="text-4xl font-bold">{stats?.orders ?? '-'}</p>
                                <p className={`text-sm mt-2 flex items-center justify-center ${stats?.orderTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {stats?.orderTrend >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />} {Math.abs(stats?.orderTrend ?? 0)}% this week
                                </p>
                            </div>
                            <div className="w-full text-center mt-4">
                                <button onClick={() => navigate('/orders')} className="bg-[#4a90e2] cursor-pointer rounded-lg text-white py-2 px-8 w-full">
                                    View Orders
                                </button>
                            </div>
                        </div>

                        {/* Revenue Card */}
                        <div className="flex flex-col">
                            <RevenueCard revenue={revenue} />
                        </div>
                    </div>
                    
                    <OrderStatusTrendChart />

                    {/* Insights Section */}
                    <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-full overflow-hidden">
                        {/* Pie Chart */}
                        <div className="bg-white p-6 rounded-lg shadow min-w-0">
                            <h3 className="text-lg font-semibold mb-4">Entity Distribution</h3>
                            <div className="flex justify-center">
                                <PieChart width={300} height={300}>
                                    <Pie data={chartData} dataKey="value" outerRadius={100}>
                                        {chartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </div>
                        </div>

                        {/* Bar Chart */}
                        <div className="bg-white p-6 rounded-lg shadow min-w-0">
                            <h3 className="text-lg font-semibold mb-4">Weekly Orders Trend</h3>
                            <div className="flex justify-center">
                                <BarChart width={350} height={300} data={orderTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="orders" fill="#4a90e2" />
                                </BarChart>
                            </div>
                        </div>
                    </div>

                    {/* Top Payments and Products Section */}
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-full overflow-hidden">
                        <div className="min-w-0">
                            <TopPayments />
                        </div>
                        <div className="min-w-0">
                            <TopProducts />
                        </div>
                    </div>
                </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
