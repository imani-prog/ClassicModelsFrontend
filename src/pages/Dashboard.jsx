import { useEffect, useState } from 'react';
import { FaArrowDown, FaArrowUp, FaBell, FaBox, FaClipboardCheck, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';

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

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch('http://localhost:8081/api/dashboard/stats').then(res => res.json()),
            fetch('http://localhost:8081/api/dashboard/entity-distribution').then(res => res.json()),
            fetch('http://localhost:8081/api/dashboard/order-trend').then(res => res.json()),
            fetch('http://localhost:8081/api/dashboard/notifications').then(res => res.json()),
        ])
        .then(([statsRes, chartRes, trendRes, notifRes]) => {
            setStats(statsRes);
            setChartData(chartRes);
            setOrderTrendData(trendRes);
            setNotifications(notifRes);
            setLoading(false);
        })
        .catch(err => {
            setError('Failed to load dashboard data');
            setLoading(false);
        });
    }, []);

    return (
        <div className="items-center justify-center min-h-screen w-full p-4">
            <div className="flex justify-between items-center relative">
                <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
                <div className="relative">
                    <FaBell className="text-2xl text-gray-600 cursor-pointer" onClick={() => setShowDropdown(!showDropdown)} />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                        {notifications.length}
                    </span>
                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded p-4 z-10">
                            {notifications.map((note, i) => (
                                <p key={i} className="text-sm text-gray-700 mb-2 border-b pb-1">{note}</p>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <p className="text-left text-lg mt-4">Welcome back Tim <span role="img" aria-label="smile">😊</span>,</p>

            {loading ? (
                <div className="text-center py-10">Loading dashboard...</div>
            ) : error ? (
                <div className="text-center text-red-500 py-10">{error}</div>
            ) : (
                <>
                <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-6">
                    {/* Products Card */}
                    <div>
                        <div className="border-3 border-[#57acee] rounded-lg p-10 text-center w-60">
                            <div className="flex justify-center items-center text-gray-700 mb-2 text-lg ">
                                <FaBox className="mr-2" />
                                Total Products
                            </div>
                            <p className="text-4xl font-bold">{stats?.products ?? '-'}</p>
                            <p className={`text-sm mt-2 ${stats?.productTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {stats?.productTrend >= 0 ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(stats?.productTrend ?? 0)}% this week
                            </p>
                        </div>
                        <div className='w-full items-center justify-center text-center'>
                            <button onClick={() => navigate('/products')} className='bg-[#4a90e2] cursor-pointer mt-5 rounded-lg text-white py-2 px-8'>
                                View Products
                            </button>
                        </div>
                    </div>

                    {/* Customers Card */}
                    <div>
                        <div className="border-3 border-[#57acee] rounded-lg p-10 text-center w-60">
                            <div className="flex justify-center text-gray-700 items-center mb-2 text-md ">
                                <FaUsers className="mr-2" />
                                Total Customers
                            </div>
                            <p className="text-4xl font-bold">{stats?.customers ?? '-'}</p>
                            <p className={`text-sm mt-2 ${stats?.customerTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {stats?.customerTrend >= 0 ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(stats?.customerTrend ?? 0)}% this week
                            </p>
                        </div>
                        <div className='w-full items-center justify-center text-center'>
                            <button onClick={() => navigate('/customers')} className='bg-[#4a90e2] cursor-pointer mt-5 rounded-lg text-white py-2 px-8'>
                                View Customers
                            </button>
                        </div>
                    </div>

                    {/* Orders Card */}
                    <div>
                        <div className="border-3 border-[#57acee] rounded-lg p-10 text-center w-60">
                            <div className="flex justify-center text-gray-700 items-center mb-2 text-lg">
                                <FaClipboardCheck className="mr-2" />
                                Total Orders
                            </div>
                            <p className="text-4xl font-bold">{stats?.orders ?? '-'}</p>
                            <p className={`text-sm mt-2 ${stats?.orderTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {stats?.orderTrend >= 0 ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(stats?.orderTrend ?? 0)}% this week
                            </p>
                        </div>
                        <div className='w-full cursor-pointer items-center justify-center text-center'>
                            <button onClick={() => navigate('/orders')} className='bg-[#4a90e2] mt-5 rounded-lg text-white py-2 px-8'>
                                View Orders
                            </button>
                        </div>
                    </div>
                </div>

                {/* Insights Section */}
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pie Chart */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Entity Distribution</h3>
                        <PieChart width={300} height={300}>
                            <Pie data={chartData} dataKey="value" outerRadius={100}>
                                {chartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </div>

                    {/* Bar Chart */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Weekly Orders Trend</h3>
                        <BarChart width={350} height={300} data={orderTrendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="orders" fill="#4a90e2" />
                        </BarChart>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white p-6 rounded-lg shadow col-span-1 md:col-span-2">
                        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                        <ul className="list-disc ml-6 space-y-2">
                            {notifications.map((note, i) => (
                                <li key={i} className="text-gray-700">{note}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
