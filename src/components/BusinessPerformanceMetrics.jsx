import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaChartLine, FaDollarSign, FaShoppingCart, FaTruck, FaUsers } from 'react-icons/fa';

const BusinessPerformanceMetrics = () => {
    const [metrics, setMetrics] = useState({
        monthlyRevenue: { current: 0, previous: 0, growth: 0 },
        averageOrderValue: { current: 0, previous: 0, growth: 0 },
        customerRetention: { rate: 0, trend: 0 },
        conversionRate: { rate: 0, trend: 0 },
        deliveryPerformance: { onTime: 0, delayed: 0, percentage: 0 },
        topSellingCategories: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call for business performance metrics
        setTimeout(() => {
            setMetrics({
                monthlyRevenue: { current: 125000, previous: 108000, growth: 15.7 },
                averageOrderValue: { current: 450, previous: 420, growth: 7.1 },
                customerRetention: { rate: 87, trend: 3.2 },
                conversionRate: { rate: 3.8, trend: -0.5 },
                deliveryPerformance: { onTime: 142, delayed: 8, percentage: 94.7 },
                topSellingCategories: [
                    { name: 'Electronics', sales: 45000, growth: 12 },
                    { name: 'Clothing', sales: 32000, growth: 8 },
                    { name: 'Home & Garden', sales: 28000, growth: 15 }
                ]
            });
            setLoading(false);
        }, 1000);
    }, []);

    // eslint-disable-next-line no-unused-vars
    const MetricCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${color.bg}`}>
                    <Icon className={`w-4 h-4 ${color.text}`} />
                </div>
                {trend !== undefined && (
                    <span className={`text-xs font-medium ${
                        trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}>
                        {trend > 0 ? `+${trend}%` : `${trend}%`}
                    </span>
                )}
            </div>
            <div>
                <p className="text-lg font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-600">{title}</p>
                {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Business Performance</h3>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-16 bg-gray-200 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Business Performance</h3>
                <FaChartLine className="text-gray-400" />
            </div>
            
            <div className="space-y-4">
                {/* Monthly Revenue */}
                <MetricCard
                    title="Monthly Revenue"
                    value={`Ksh ${metrics.monthlyRevenue.current.toLocaleString()}`}
                    subtitle="vs last month"
                    icon={FaDollarSign}
                    color={{ bg: 'bg-green-100', text: 'text-green-600' }}
                    trend={metrics.monthlyRevenue.growth}
                />

                {/* Average Order Value */}
                <MetricCard
                    title="Average Order Value"
                    value={`Ksh ${metrics.averageOrderValue.current}`}
                    subtitle="per transaction"
                    icon={FaShoppingCart}
                    color={{ bg: 'bg-blue-100', text: 'text-blue-600' }}
                    trend={metrics.averageOrderValue.growth}
                />

                {/* Customer Retention */}
                <MetricCard
                    title="Customer Retention"
                    value={`${metrics.customerRetention.rate}%`}
                    subtitle="returning customers"
                    icon={FaUsers}
                    color={{ bg: 'bg-purple-100', text: 'text-purple-600' }}
                    trend={metrics.customerRetention.trend}
                />

                {/* Delivery Performance */}
                <MetricCard
                    title="On-Time Delivery"
                    value={`${metrics.deliveryPerformance.percentage}%`}
                    subtitle={`${metrics.deliveryPerformance.onTime} on time, ${metrics.deliveryPerformance.delayed} delayed`}
                    icon={FaTruck}
                    color={{ bg: 'bg-orange-100', text: 'text-orange-600' }}
                />

                {/* Top Selling Categories */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <FaCalendarAlt className="text-gray-500 w-4 h-4" />
                        <h4 className="font-medium text-gray-700">Top Categories This Month</h4>
                    </div>
                    <div className="space-y-2">
                        {metrics.topSellingCategories.map((category, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{category.name}</p>
                                    <p className="text-xs text-gray-500">Ksh {category.sales.toLocaleString()}</p>
                                </div>
                                <span className="text-xs font-medium text-green-600">
                                    +{category.growth}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessPerformanceMetrics;
