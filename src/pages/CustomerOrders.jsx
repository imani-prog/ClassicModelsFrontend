import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaEdit, FaEye, FaShoppingCart } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';

const CustomerOrders = () => {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch customer details and orders in parallel
                const [customerRes, ordersRes] = await Promise.all([
                    fetch(`http://localhost:8081/customers/${customerId}`),
                    fetch(`http://localhost:8081/orders`)
                ]);

                if (!customerRes.ok) throw new Error('Customer not found');
                
                const customerData = await customerRes.json();
                const allOrders = await ordersRes.json();
                
                // Filter orders for this specific customer
                const customerOrders = allOrders.filter(order => 
                    String(order.customerNumber) === String(customerId)
                );

                setCustomer(customerData);
                setOrders(customerOrders);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        if (customerId) {
            fetchData();
        }
    }, [customerId]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
        } catch {
            return 'Invalid Date';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'shipped': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="p-6">Loading customer orders...</div>;
    if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(`/customers/${customerId}`)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                        <FaArrowLeft /> Back to Customer Details
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Orders for {customer?.customerName}
                        </h1>
                        <p className="text-gray-600">Customer ID: {customerId}</p>
                    </div>
                </div>
            </div>

            {/* Orders Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-600">
                        <FaShoppingCart className="text-lg" />
                        <div>
                            <div className="text-2xl font-bold">{orders.length}</div>
                            <div className="text-sm">Total Orders</div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-600">
                        <FaCalendarAlt className="text-lg" />
                        <div>
                            <div className="text-2xl font-bold">
                                {orders.filter(order => order.status === 'Shipped').length}
                            </div>
                            <div className="text-sm">Shipped</div>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-600">
                        <FaCalendarAlt className="text-lg" />
                        <div>
                            <div className="text-2xl font-bold">
                                {orders.filter(order => order.status === 'Pending').length}
                            </div>
                            <div className="text-sm">Pending</div>
                        </div>
                    </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-purple-600">
                        <FaCalendarAlt className="text-lg" />
                        <div>
                            <div className="text-2xl font-bold">
                                {orders.filter(order => order.status === 'Completed').length}
                            </div>
                            <div className="text-sm">Completed</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Order History</h2>
                </div>
                
                {orders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <FaShoppingCart className="mx-auto text-4xl mb-4 text-gray-300" />
                        <p>No orders found for this customer</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Required Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Shipped Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Comments
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{order.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(order.orderDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(order.requiredDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(order.shippedDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                {order.status || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {order.comments || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    to={`/orders/${order.id}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="View Order Details"
                                                >
                                                    <FaEye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    to={`/orders/${order.id}/edit`}
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                    title="Edit Order"
                                                >
                                                    <FaEdit className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Navigation Helper */}
            <div className="mt-6 flex justify-between items-center">
                <Link 
                    to={`/customers/${customerId}/payments`}
                    className="flex items-center gap-2 text-green-600 hover:text-green-800"
                >
                    View Payment History →
                </Link>
                <Link 
                    to="/orders"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                    View All Orders →
                </Link>
            </div>
        </div>
    );
};

export default CustomerOrders;
