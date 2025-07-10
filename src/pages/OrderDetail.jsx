import { useEffect, useState } from 'react';
import { FaArrowLeft, FaBox, FaCalendarAlt, FaCheckCircle, FaClock, FaDollarSign, FaEdit, FaExclamationTriangle, FaMapMarkerAlt, FaShippingFast, FaShoppingCart, FaTruck, FaUser } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [trackingInfo, setTrackingInfo] = useState(null);

    // Handle edit order functionality
    const handleEditOrder = () => {
        // Navigate back to the orders page with edit parameter to trigger edit mode
        navigate(`/orders?edit=${orderId}`);
    };

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                setLoading(true);
                console.log('Fetching order with ID:', orderId);
                
                let orderData = null;
                
                try {
                    console.log('Attempting to fetch individual order...');
                    const orderRes = await fetch(`http://localhost:8081/orders/${orderId}`);
                    console.log('Individual order response status:', orderRes.status, orderRes.ok);
                    
                    if (orderRes.ok) {
                        orderData = await orderRes.json();
                        console.log('Individual order fetch successful:', orderData);
                        console.log('Order data structure:', JSON.stringify(orderData, null, 2));
                    } else {
                        console.log('Individual order fetch failed, trying fallback approach...');
                        throw new Error('Individual order fetch failed');
                    }
                } catch (individualFetchError) {
                    console.log('Individual fetch failed, using fallback:', individualFetchError.message);
                    
                    // Fallback: Fetch all orders and filter
                    const allOrdersRes = await fetch(`http://localhost:8081/orders`);
                    console.log('All orders response status:', allOrdersRes.status, allOrdersRes.ok);
                    
                    if (!allOrdersRes.ok) {
                        throw new Error(`Failed to fetch orders (Status: ${allOrdersRes.status})`);
                    }
                    
                    const allOrders = await allOrdersRes.json();
                    console.log('All orders received, count:', allOrders.length);
                    
                    // Find the specific order
                    orderData = allOrders.find(order => String(order.id) === String(orderId));
                    console.log('Found order:', orderData);
                    
                    if (!orderData) {
                        throw new Error(`Order with ID ${orderId} not found`);
                    }
                }
                console.log('Processing order data without orderdetails endpoint...');
                const mockOrderDetails = [];
                
                if (orderData.orderDetails || orderData.items || orderData.products) {
                    console.log('Order contains embedded details');
                    const details = orderData.orderDetails || orderData.items || orderData.products;
                    mockOrderDetails.push(...details);
                } else {
                    console.log('No embedded details found, creating basic order representation');
                    mockOrderDetails.push({
                        id: { orderNumber: orderData.id, productCode: 'UNKNOWN' },
                        productCode: 'Product Information',
                        quantityOrdered: 1,
                        priceEach: 0,
                        orderLineNumber: 1
                    });
                }
                
                console.log('Mock order details created:', mockOrderDetails);
                
                console.log('Mock order details created:', mockOrderDetails);
                const currentOrderDetails = mockOrderDetails;

                // Fetch customer data
                const customerId = orderData.customerNumber?.id || orderData.customerNumber;
                if (customerId) {
                    try {
                        const customerRes = await fetch(`http://localhost:8081/customers/${customerId}`);
                        if (customerRes.ok) {
                            const customerData = await customerRes.json();
                            setCustomer(customerData);
                            console.log('Customer data fetched:', customerData);
                        }
                    } catch (err) {
                        console.warn('Could not fetch customer data:', err);
                    }
                }

                const mockTrackingInfo = generateTrackingInfo(orderData);

                setOrder(orderData);
                setOrderDetails(currentOrderDetails);
                setTrackingInfo(mockTrackingInfo);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching order data:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrderData();
        }
    }, [orderId]);

    const generateTrackingInfo = (orderData) => {
        const orderDate = new Date(orderData.orderDate);
        const requiredDate = new Date(orderData.requiredDate);
        const shippedDate = orderData.shippedDate ? new Date(orderData.shippedDate) : null;
        const today = new Date();

        const status = shippedDate ? 'shipped' : 
                      today > requiredDate ? 'delayed' : 
                      'pending';

        // Generate tracking events
        const events = [
            {
                date: orderDate,
                status: 'Order Placed',
                description: 'Your order has been received and is being processed',
                icon: 'order',
                completed: true
            },
            {
                date: new Date(orderDate.getTime() + 24 * 60 * 60 * 1000),
                status: 'Processing',
                description: 'Order is being prepared for shipment',
                icon: 'processing',
                completed: status === 'shipped' || today > new Date(orderDate.getTime() + 24 * 60 * 60 * 1000)
            },
            {
                date: shippedDate || requiredDate,
                status: shippedDate ? 'Shipped' : 'Expected Ship Date',
                description: shippedDate ? 
                    `Package shipped and is on its way` : 
                    `Expected to ship by ${requiredDate.toLocaleDateString()}`,
                icon: 'shipped',
                completed: !!shippedDate
            }
        ];

        if (shippedDate) {
            const estimatedDelivery = new Date(shippedDate.getTime() + 3 * 24 * 60 * 60 * 1000);
            events.push({
                date: estimatedDelivery,
                status: 'Delivered',
                description: `Estimated delivery date`,
                icon: 'delivered',
                completed: today > estimatedDelivery
            });
        }

        return {
            status,
            currentStep: events.filter(e => e.completed).length,
            totalSteps: events.length,
            events,
            estimatedDelivery: shippedDate ? 
                new Date(shippedDate.getTime() + 3 * 24 * 60 * 60 * 1000) : 
                null
        };
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        try {
            return new Date(dateString).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric'
            });
        } catch {
            return 'Invalid Date';
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Not set';
        try {
            return new Date(dateString).toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Invalid Date';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'shipped': return 'bg-green-100 text-green-800 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'delayed': return 'bg-red-100 text-red-800 border-red-200';
            case 'delivered': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'shipped': return <FaShippingFast className="w-4 h-4" />;
            case 'pending': return <FaClock className="w-4 h-4" />;
            case 'delayed': return <FaExclamationTriangle className="w-4 h-4" />;
            case 'delivered': return <FaCheckCircle className="w-4 h-4" />;
            default: return <FaBox className="w-4 h-4" />;
        }
    };

    const getTrackingIcon = (iconType, completed) => {
        const baseClasses = `w-5 h-5 ${completed ? 'text-green-600' : 'text-gray-400'}`;
        
        switch (iconType) {
            case 'order': return <FaShoppingCart className={baseClasses} />;
            case 'processing': return <FaBox className={baseClasses} />;
            case 'shipped': return <FaTruck className={baseClasses} />;
            case 'delivered': return <FaCheckCircle className={baseClasses} />;
            default: return <FaClock className={baseClasses} />;
        }
    };

    const calculateOrderTotal = () => {
        return orderDetails.reduce((total, detail) => {
            const price = parseFloat(detail.priceEach) || 0;
            const quantity = parseInt(detail.quantityOrdered) || 0;
            return total + (price * quantity);
        }, 0);
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading order details...</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center justify-center">
            <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
                <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
                <p className="text-red-600 font-semibold text-lg mb-2">Error Loading Order</p>
                <p className="text-gray-600 mb-2">{error}</p>
                <p className="text-sm text-gray-500 mb-4">Order ID: {orderId}</p>
                <div className="flex gap-2 justify-center">
                    <button 
                        onClick={() => navigate('/orders')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Back to Orders
                    </button>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        </div>
    );
    
    if (!order) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center justify-center">
            <div className="text-center bg-white rounded-lg shadow-lg p-8">
                <FaShoppingCart className="text-gray-400 text-4xl mx-auto mb-4" />
                <p className="text-gray-600 font-semibold">Order not found</p>
                <button 
                    onClick={() => navigate('/orders')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Back to Orders
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => customer ? 
                                    navigate(`/customers/${customer.id}/orders`) : 
                                    navigate('/orders')
                                }
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-md transition-all duration-200"
                            >
                                <FaArrowLeft className="text-sm" /> 
                                <span className="font-medium text-sm">
                                    {customer ? `Back to ${customer.customerName} Orders` : 'Back to Orders'}
                                </span>
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                                    <FaShoppingCart className="text-white text-lg" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">
                                        Order #{order.id}
                                    </h1>
                                    <div className="flex items-center gap-3">
                                        <p className="text-gray-500 text-sm font-medium">
                                            {customer ? customer.customerName : `Customer ID: ${order.customerNumber?.id || order.customerNumber}`}
                                        </p>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(trackingInfo?.status)}`}>
                                            {getStatusIcon(trackingInfo?.status)}
                                            <span className="ml-1 capitalize">{trackingInfo?.status || 'Pending'}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleEditOrder}
                                className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-3 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-200 font-medium text-sm"
                            >
                                <FaEdit className="text-sm" /> Edit Order
                            </button>
                        </div>
                    </div>
                </div>

                {/* Order Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FaCalendarAlt className="text-blue-600 text-sm" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Order Date</p>
                                <p className="text-sm font-bold text-gray-800">{formatDate(order.orderDate)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <FaClock className="text-orange-600 text-sm" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Required Date</p>
                                <p className="text-sm font-bold text-orange-600">{formatDate(order.requiredDate)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <FaShippingFast className="text-green-600 text-sm" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Shipped Date</p>
                                <p className="text-sm font-bold text-green-600">{formatDate(order.shippedDate)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FaDollarSign className="text-purple-600 text-sm" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Order Total</p>
                                <p className="text-lg font-bold text-purple-600">Ksh {calculateOrderTotal().toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Order Tracking */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <FaTruck className="text-white text-sm" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">Order Tracking</h2>
                        </div>

                        {trackingInfo && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-gray-600">
                                        Progress: {trackingInfo.currentStep} of {trackingInfo.totalSteps} steps
                                    </span>
                                    <span className="text-sm font-medium text-blue-600">
                                        {Math.round((trackingInfo.currentStep / trackingInfo.totalSteps) * 100)}% Complete
                                    </span>
                                </div>
                                
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                                    <div 
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                                        style={{ width: `${(trackingInfo.currentStep / trackingInfo.totalSteps) * 100}%` }}
                                    ></div>
                                </div>

                                {trackingInfo.events.map((event, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                            event.completed 
                                                ? 'bg-green-100 border-green-500' 
                                                : 'bg-gray-100 border-gray-300'
                                        }`}>
                                            {getTrackingIcon(event.icon, event.completed)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className={`font-semibold ${
                                                    event.completed ? 'text-gray-800' : 'text-gray-500'
                                                }`}>
                                                    {event.status}
                                                </h4>
                                                <span className="text-xs text-gray-500">
                                                    {formatDateTime(event.date)}
                                                </span>
                                            </div>
                                            <p className={`text-sm ${
                                                event.completed ? 'text-gray-600' : 'text-gray-400'
                                            }`}>
                                                {event.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Customer & Shipping Info */}
                    <div className="space-y-4">
                        {/* Customer Info */}
                        {customer && (
                            <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                        <FaUser className="text-white text-sm" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Customer Information</h3>
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Customer</p>
                                        <Link 
                                            to={`/customers/${customer.id}`}
                                            className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            {customer.customerName}
                                        </Link>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Contact</p>
                                        <p className="text-sm text-gray-800">{customer.contactFirstName} {customer.contactLastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Phone</p>
                                        <p className="text-sm text-gray-800">{customer.phone}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Shipping Address */}
                        {customer && (
                            <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <FaMapMarkerAlt className="text-white text-sm" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Shipping Address</h3>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-800 font-medium">{customer.addressLine1}</p>
                                    {customer.addressLine2 && <p className="text-sm text-gray-600">{customer.addressLine2}</p>}
                                    <p className="text-sm text-gray-800">{customer.city}, {customer.state} {customer.postalCode}</p>
                                    <p className="text-sm text-gray-800 font-medium">{customer.country}</p>
                                </div>
                            </div>
                        )}

                        {/* Order Comments */}
                        {order.comments && (
                            <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                                        <FaEdit className="text-white text-sm" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Order Comments</h3>
                                </div>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{order.comments}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <FaBox className="text-white text-sm" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Order Items</h2>
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded-full">
                            {orderDetails.length} item{orderDetails.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Product</th>
                                    <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Quantity</th>
                                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Unit Price</th>
                                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderDetails.map((detail, index) => {
                                    const quantity = parseInt(detail.quantityOrdered) || 0;
                                    const unitPrice = parseFloat(detail.priceEach) || 0;
                                    const total = quantity * unitPrice;
                                    
                                    return (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-4 px-2">
                                                <div>
                                                    <p className="font-medium text-gray-800">
                                                        {detail.productCode?.productName || detail.productCode || 'Unknown Product'}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Code: {detail.id?.productCode || detail.productCode}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2 text-center">
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                                                    {quantity}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2 text-right">
                                                <span className="font-medium text-gray-800">
                                                    Ksh {unitPrice.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2 text-right">
                                                <span className="font-bold text-gray-800">
                                                    Ksh {total.toFixed(2)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-gray-300">
                                    <td colSpan="3" className="py-4 px-2 text-right font-bold text-gray-800">
                                        Order Total:
                                    </td>
                                    <td className="py-4 px-2 text-right">
                                        <span className="text-xl font-bold text-green-600">
                                            Ksh {calculateOrderTotal().toFixed(2)}
                                        </span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
