import { useEffect, useState } from 'react';
import { FaArrowLeft, FaBuilding, FaCalendarAlt, FaChartLine, FaCheckCircle, FaClipboardList, FaClock, FaCreditCard, FaDollarSign, FaEdit, FaEnvelope, FaExclamationTriangle, FaMapMarkerAlt, FaPhone, FaShoppingCart, FaTrash, FaUser } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';

const CustomerDetail = () => {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [customerStats, setCustomerStats] = useState({
        totalOrders: 0,
        totalPayments: 0,
        lastOrderDate: null,
        lastPaymentDate: null,
        accountStatus: 'Active'
    });


    useEffect(() => {
        const fetchData = async () => {
            if (customerId) {
                try {
                    const [customerRes, ordersRes, paymentsRes] = await Promise.all([
                        fetch(`http://localhost:8081/customers/${customerId}`),
                        fetch(`http://localhost:8081/orders`),
                        fetch(`http://localhost:8081/payments`)
                    ]);

                    if (!customerRes.ok) throw new Error('Customer not found');
                    
                    const customerData = await customerRes.json();
                    const ordersData = await ordersRes.json();
                    const paymentsData = await paymentsRes.json();

                    // Process orders for this customer
                    const customerOrders = ordersData.filter(order => 
                        String(order.customerNumber?.id || order.customerNumber) === String(customerId)
                    );
                    

                    // Process payments for this customer
                    const customerPayments = paymentsData
                        .map(payment => ({
                            customerId: payment.id.customerNumber,
                            amount: payment.amount,
                            date: payment.paymentDate
                        }))
                        .filter(payment => String(payment.customerId) === String(customerId));

                    // Calculate stats
                    const stats = {
                        totalOrders: customerOrders.length,
                        totalPayments: customerPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
                        lastOrderDate: customerOrders.length > 0 ? 
                            customerOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))[0].orderDate : null,
                        lastPaymentDate: customerPayments.length > 0 ?
                            customerPayments.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date : null,
                        accountStatus: customerPayments.length > 0 ? 'Active' : 'Inactive'
                    };

                    setCustomer(customerData);
                    setCustomerStats(stats);
                    setLoading(false);
                } catch (err) {
                    setError(err.message);
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [customerId]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        try {
            return new Date(dateString).toLocaleDateString('en-GB');
        } catch {
            return 'Invalid Date';
        }
    };

    const getCreditUtilization = () => {
        if (!customer?.creditLimit || customerStats.totalPayments === 0) return 0;
        return Math.min((customerStats.totalPayments / customer.creditLimit) * 100, 100);
    };

    const getAccountStatusColor = () => {
        switch (customerStats.accountStatus) {
            case 'Active': return 'text-green-600 bg-green-100';
            case 'Inactive': return 'text-orange-600 bg-orange-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    // Enhanced logic for action buttons
    const getOrdersButtonLogic = () => {
        const hasOrders = customerStats.totalOrders > 0;
        const isRecent = customerStats.lastOrderDate && 
            new Date(customerStats.lastOrderDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
        
        return {
            hasData: hasOrders,
            isRecent,
            urgency: !hasOrders ? 'none' : isRecent ? 'low' : 'medium',
            actionText: hasOrders ? 'View Orders' : 'Create First Order',
            description: hasOrders 
                ? `${customerStats.totalOrders} order${customerStats.totalOrders === 1 ? '' : 's'} • Last: ${formatDate(customerStats.lastOrderDate)}`
                : 'No orders yet - start building relationship',
            icon: hasOrders ? 'view' : 'add',
            colorScheme: hasOrders ? 'blue' : 'indigo'
        };
    };

    const getPaymentsButtonLogic = () => {
        const hasPayments = customerStats.totalPayments > 0;
        const paymentRatio = hasPayments && customerStats.totalOrders > 0 
            ? (customerStats.totalPayments / (customerStats.totalOrders * 1000)) // Assuming avg order ~1000
            : 0;
        const isRecent = customerStats.lastPaymentDate && 
            new Date(customerStats.lastPaymentDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        return {
            hasData: hasPayments,
            isRecent,
            paymentHealth: paymentRatio > 0.8 ? 'good' : paymentRatio > 0.5 ? 'fair' : 'poor',
            urgency: !hasPayments ? 'high' : !isRecent ? 'medium' : 'low',
            actionText: hasPayments ? 'Payment History' : 'Set up Payments',
            description: hasPayments 
                ? `Ksh ${customerStats.totalPayments.toLocaleString()} total • Last: ${formatDate(customerStats.lastPaymentDate)}`
                : 'No payment records - set up payment tracking',
            icon: hasPayments ? 'view' : 'setup',
            colorScheme: hasPayments ? 'green' : 'orange',
            badge: !hasPayments ? 'Setup Required' : isRecent ? 'Recent Activity' : 'Needs Attention'
        };
    };

    const getBusinessInsights = () => {
        const ordersLogic = getOrdersButtonLogic();
        const paymentsLogic = getPaymentsButtonLogic();
        
        return {
            riskLevel: !paymentsLogic.hasData ? 'high' : 
                      !ordersLogic.isRecent && !paymentsLogic.isRecent ? 'medium' : 'low',
            opportunity: !ordersLogic.hasData ? 'new_customer' :
                        ordersLogic.hasData && !paymentsLogic.hasData ? 'payment_setup' :
                        'growth',
            nextAction: !ordersLogic.hasData ? 'Create first order' :
                       !paymentsLogic.hasData ? 'Set up payment tracking' :
                       'Review relationship health'
        };
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading customer details...</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center justify-center">
            <div className="text-center bg-white rounded-lg shadow-lg p-8">
                <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
                <p className="text-red-600 font-semibold text-lg mb-2">Error Loading Customer</p>
                <p className="text-gray-600">{error}</p>
            </div>
        </div>
    );
    
    if (!customer) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center justify-center">
            <div className="text-center bg-white rounded-lg shadow-lg p-8">
                <FaUser className="text-gray-400 text-4xl mx-auto mb-4" />
                <p className="text-gray-600 font-semibold">Customer not found</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
            <div className="max-w-5xl mx-auto">
                {/* Compact Header with enhanced design */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => navigate('/customers')}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-md transition-all duration-200"
                            >
                                <FaArrowLeft className="text-sm" /> 
                                <span className="font-medium text-sm">Back to Customers</span>
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                                    <FaUser className="text-white text-lg" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">
                                        {customer.customerName}
                                    </h1>
                                    <div className="flex items-center gap-3">
                                        <p className="text-gray-500 text-sm font-medium">ID: {customer.id}</p>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getAccountStatusColor()}`}>
                                            {customerStats.accountStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link 
                                to={`/customers/${customerId}/edit`}
                                className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-3 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-200 font-medium text-sm"
                            >
                                <FaEdit className="text-sm" /> Edit
                            </Link>
                            <button className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-200 font-medium text-sm">
                                <FaTrash className="text-sm" /> Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* Customer Statistics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FaShoppingCart className="text-blue-600 text-sm" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Total Orders</p>
                                <p className="text-lg font-bold text-gray-800">{customerStats.totalOrders}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <FaDollarSign className="text-green-600 text-sm" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Total Payments</p>
                                <p className="text-lg font-bold text-green-600">Ksh {customerStats.totalPayments.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FaChartLine className="text-purple-600 text-sm" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Credit Usage</p>
                                <p className="text-lg font-bold text-purple-600">{getCreditUtilization().toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <FaClock className="text-orange-600 text-sm" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Last Activity</p>
                                <p className="text-sm font-bold text-orange-600">{formatDate(customerStats.lastOrderDate || customerStats.lastPaymentDate)}</p>
                            </div>
                        </div>
                    </div>
                </div>

            {/* Compact Customer Information cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Contact Information Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <FaUser className="text-white text-sm" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Contact Information</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-start gap-2">
                            <FaUser className="text-gray-400 text-xs mt-1" />
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Contact Person</p>
                                <p className="text-sm text-gray-800 font-semibold">{customer.contactFirstName} {customer.contactLastName}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <FaPhone className="text-gray-400 text-xs mt-1" />
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Phone</p>
                                <p className="text-sm text-gray-800 font-semibold">{customer.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <FaEnvelope className="text-gray-400 text-xs mt-1" />
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Email</p>
                                <p className="text-sm text-gray-800 font-semibold">{customer.email || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Address Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                            <FaMapMarkerAlt className="text-white text-sm" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Address</h2>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-gray-800 font-medium">{customer.addressLine1}</p>
                        {customer.addressLine2 && <p className="text-sm text-gray-600">{customer.addressLine2}</p>}
                        <p className="text-sm text-gray-800 font-medium">{customer.city}, {customer.state} {customer.postalCode}</p>
                        <div className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold mt-2">
                            {customer.country}
                        </div>
                    </div>
                </div>

                {/* Business Details Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <FaBuilding className="text-white text-sm" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Business Details</h2>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">Credit Limit</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-green-600">Ksh {customer.creditLimit?.toLocaleString() || 'N/A'}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                    className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                                    style={{ width: `${Math.min(getCreditUtilization(), 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{getCreditUtilization().toFixed(1)}% utilized</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">Sales Representative</p>
                            <p className="text-sm text-gray-800 font-semibold">{customer.salesRepEmployeeNumber?.id || 'Not Assigned'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">Last Order</p>
                            <div className="flex items-center gap-1">
                                <FaCalendarAlt className="text-gray-400 text-xs" />
                                <p className="text-sm text-gray-800 font-semibold">{formatDate(customerStats.lastOrderDate)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Quick Actions with Advanced Logic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Dynamic Orders Button */}
                {(() => {
                    const ordersLogic = getOrdersButtonLogic();
                    const baseClasses = "group rounded-lg border p-4 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5";
                    const colorClasses = ordersLogic.colorScheme === 'blue' 
                        ? "bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200 hover:border-blue-300"
                        : "bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border-indigo-200 hover:border-indigo-300";
                    
                    return (
                        <Link 
                            to={`/customers/${customerId}/orders`}
                            className={`${baseClasses} ${colorClasses}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200 ${
                                    ordersLogic.colorScheme === 'blue' 
                                        ? "bg-gradient-to-br from-blue-500 to-blue-600" 
                                        : "bg-gradient-to-br from-indigo-500 to-indigo-600"
                                }`}>
                                    {ordersLogic.icon === 'add' ? (
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    ) : (
                                        <FaClipboardList className="text-white text-sm" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className={`text-lg font-bold ${
                                            ordersLogic.colorScheme === 'blue' ? 'text-blue-800' : 'text-indigo-800'
                                        }`}>
                                            {ordersLogic.actionText}
                                        </h3>
                                        {ordersLogic.urgency === 'medium' && (
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-semibold">
                                                Follow Up
                                            </span>
                                        )}
                                        {!ordersLogic.hasData && (
                                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
                                                New
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-sm font-medium ${
                                        ordersLogic.colorScheme === 'blue' ? 'text-blue-600' : 'text-indigo-600'
                                    }`}>
                                        {ordersLogic.description}
                                    </p>
                                    {ordersLogic.hasData && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <div className={`w-2 h-2 rounded-full ${
                                                ordersLogic.isRecent ? 'bg-green-400' : 'bg-orange-400'
                                            }`}></div>
                                            <span className="text-xs text-gray-500">
                                                {ordersLogic.isRecent ? 'Recent activity' : 'Needs attention'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className={`transition-colors duration-200 ${
                                    ordersLogic.colorScheme === 'blue' 
                                        ? 'text-blue-400 group-hover:text-blue-600' 
                                        : 'text-indigo-400 group-hover:text-indigo-600'
                                }`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    );
                })()}

                {/* Dynamic Payments Button */}
                {(() => {
                    const paymentsLogic = getPaymentsButtonLogic();
                    const baseClasses = "group rounded-lg border p-4 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5";
                    const colorClasses = paymentsLogic.colorScheme === 'green' 
                        ? "bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200 hover:border-green-300"
                        : "bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-orange-200 hover:border-orange-300";
                    
                    return (
                        <Link 
                            to={`/customers/${customerId}/payments`}
                            className={`${baseClasses} ${colorClasses}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200 ${
                                    paymentsLogic.colorScheme === 'green' 
                                        ? "bg-gradient-to-br from-green-500 to-green-600" 
                                        : "bg-gradient-to-br from-orange-500 to-orange-600"
                                }`}>
                                    {paymentsLogic.icon === 'setup' ? (
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    ) : (
                                        <FaCreditCard className="text-white text-sm" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className={`text-lg font-bold ${
                                            paymentsLogic.colorScheme === 'green' ? 'text-green-800' : 'text-orange-800'
                                        }`}>
                                            {paymentsLogic.actionText}
                                        </h3>
                                        {paymentsLogic.badge && (
                                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                                paymentsLogic.badge === 'Setup Required' 
                                                    ? 'bg-red-100 text-red-700'
                                                    : paymentsLogic.badge === 'Recent Activity'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {paymentsLogic.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-sm font-medium ${
                                        paymentsLogic.colorScheme === 'green' ? 'text-green-600' : 'text-orange-600'
                                    }`}>
                                        {paymentsLogic.description}
                                    </p>
                                    {paymentsLogic.hasData && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={`w-2 h-2 rounded-full ${
                                                paymentsLogic.paymentHealth === 'good' ? 'bg-green-400' :
                                                paymentsLogic.paymentHealth === 'fair' ? 'bg-yellow-400' : 'bg-red-400'
                                            }`}></div>
                                            <span className="text-xs text-gray-500">
                                                {paymentsLogic.paymentHealth === 'good' ? 'Healthy payments' :
                                                 paymentsLogic.paymentHealth === 'fair' ? 'Moderate activity' : 'Low activity'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className={`transition-colors duration-200 ${
                                    paymentsLogic.colorScheme === 'green' 
                                        ? 'text-green-400 group-hover:text-green-600' 
                                        : 'text-orange-400 group-hover:text-orange-600'
                                }`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    );
                })()}
            </div>

            {/* Additional Business Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Sales Representative Action */}
                <div className="group bg-gradient-to-br from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 border border-cyan-200 hover:border-cyan-300 rounded-lg p-4 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5">
                    <Link 
                        to={customer.salesRepEmployeeNumber?.id ? `/employees/${customer.salesRepEmployeeNumber.id}` : '/employees'}
                        className="block"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200">
                                <FaUser className="text-white text-sm" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold text-cyan-800">
                                        {customer.salesRepEmployeeNumber?.id ? 'Sales Representative' : 'Assign Sales Rep'}
                                    </h3>
                                    {!customer.salesRepEmployeeNumber?.id && (
                                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-semibold">
                                            Unassigned
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-cyan-600">
                                    {customer.salesRepEmployeeNumber?.id 
                                        ? `Employee ID: ${customer.salesRepEmployeeNumber.id}` 
                                        : 'No sales representative assigned yet'}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${
                                        customer.salesRepEmployeeNumber?.id ? 'bg-green-400' : 'bg-orange-400'
                                    }`}></div>
                                    <span className="text-xs text-gray-500">
                                        {customer.salesRepEmployeeNumber?.id ? 'Contact assigned rep' : 'Needs assignment'}
                                    </span>
                                </div>
                            </div>
                            <div className="text-cyan-400 group-hover:text-cyan-600 transition-colors duration-200">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Products & Recommendations */}
                <div className="group bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 hover:border-purple-300 rounded-lg p-4 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5">
                    <Link 
                        to="/products"
                        className="block"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold text-purple-800">Product Catalog</h3>
                                    {customerStats.totalOrders > 0 && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                                            Recommendations
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-purple-600">
                                    {customerStats.totalOrders > 0 
                                        ? 'View products and get recommendations' 
                                        : 'Browse product catalog for first order'}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                                    <span className="text-xs text-gray-500">
                                        {customerStats.totalOrders > 0 ? 'Based on order history' : 'Full catalog available'}
                                    </span>
                                </div>
                            </div>
                            <div className="text-purple-400 group-hover:text-purple-600 transition-colors duration-200">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Quick Order Creation */}
                <div className="group bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border border-emerald-200 hover:border-emerald-300 rounded-lg p-4 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5">
                    <Link 
                        to={`/orders?customer=${customerId}`}
                        className="block"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold text-emerald-800">Create New Order</h3>
                                    {customerStats.totalOrders === 0 && (
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-semibold">
                                            First Order
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-emerald-600">
                                    {customerStats.totalOrders === 0 
                                        ? 'Start building customer relationship' 
                                        : 'Quick order creation with customer details'}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${
                                        customerStats.totalOrders === 0 ? 'bg-yellow-400' : 'bg-green-400'
                                    }`}></div>
                                    <span className="text-xs text-gray-500">
                                        {customerStats.totalOrders === 0 ? 'Start customer journey' : 'Quick order process'}
                                    </span>
                                </div>
                            </div>
                            <div className="text-emerald-400 group-hover:text-emerald-600 transition-colors duration-200">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Business Intelligence Panel */}
            {(() => {
                const insights = getBusinessInsights();
                return (
                    <div className="mb-6 bg-white rounded-lg shadow-md border border-gray-100 p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">Business Intelligence</h2>
                            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                insights.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                                insights.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                                {insights.riskLevel.toUpperCase()} RISK
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    <h4 className="font-semibold text-gray-700 text-sm">Growth Opportunity</h4>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {insights.opportunity === 'new_customer' ? 'New customer - focus on first order' :
                                     insights.opportunity === 'payment_setup' ? 'Active customer - enable payment tracking' :
                                     'Established customer - explore growth opportunities'}
                                </p>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h4 className="font-semibold text-gray-700 text-sm">Recommended Action</h4>
                                </div>
                                <p className="text-sm text-gray-600">{insights.nextAction}</p>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                    <h4 className="font-semibold text-gray-700 text-sm">Revenue Potential</h4>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Credit limit: Ksh {customer.creditLimit?.toLocaleString() || 'N/A'} | 
                                    Used: {getCreditUtilization().toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Additional Customer Insights */}
            <div className="mt-6 bg-white rounded-lg shadow-md border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <FaChartLine className="text-white text-sm" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">Customer Insights</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <FaCheckCircle className={`text-sm ${customerStats.accountStatus === 'Active' ? 'text-green-500' : 'text-orange-500'}`} />
                            <h4 className="font-semibold text-gray-700 text-sm">Account Status</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                            {customerStats.accountStatus === 'Active' ? 
                                'Customer has recent transaction activity' : 
                                'No recent transaction activity detected'
                            }
                        </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <FaDollarSign className="text-green-500 text-sm" />
                            <h4 className="font-semibold text-gray-700 text-sm">Credit Health</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                            {getCreditUtilization() > 80 ? 'High credit utilization' :
                             getCreditUtilization() > 50 ? 'Moderate credit usage' :
                             'Low credit utilization'}
                        </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <FaClock className="text-blue-500 text-sm" />
                            <h4 className="font-semibold text-gray-700 text-sm">Relationship</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                            {customerStats.totalOrders > 10 ? 'Long-term customer' :
                             customerStats.totalOrders > 3 ? 'Regular customer' :
                             'New customer'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Customer Relationship Health & Action Plan */}
            <div className="mt-6 bg-white rounded-lg shadow-md border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">Relationship Health & Action Plan</h2>
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        getBusinessInsights().riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                        getBusinessInsights().riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                    }`}>
                        {(() => {
                            const insights = getBusinessInsights();
                            if (insights.riskLevel === 'low') return 'HEALTHY';
                            if (insights.riskLevel === 'medium') return 'MODERATE';
                            return 'NEEDS ATTENTION';
                        })()}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Relationship Metrics */}
                    <div className="space-y-4">
                        <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Relationship Metrics
                        </h3>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">Customer Lifecycle Stage</span>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    customerStats.totalOrders === 0 ? 'bg-blue-100 text-blue-700' :
                                    customerStats.totalOrders <= 3 ? 'bg-green-100 text-green-700' :
                                    customerStats.totalOrders <= 10 ? 'bg-purple-100 text-purple-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {customerStats.totalOrders === 0 ? 'Prospect' :
                                     customerStats.totalOrders <= 3 ? 'New Customer' :
                                     customerStats.totalOrders <= 10 ? 'Regular Customer' :
                                     'VIP Customer'}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">Payment Reliability</span>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    customerStats.totalPayments === 0 ? 'bg-red-100 text-red-700' :
                                    customerStats.totalPayments / Math.max(customerStats.totalOrders, 1) >= 0.8 ? 'bg-green-100 text-green-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {customerStats.totalPayments === 0 ? 'No Payment Data' :
                                     customerStats.totalPayments / Math.max(customerStats.totalOrders, 1) >= 0.8 ? 'Excellent' :
                                     'Needs Improvement'}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">Communication Status</span>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    customer.salesRepEmployeeNumber?.id ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                }`}>
                                    {customer.salesRepEmployeeNumber?.id ? 'Assigned Rep' : 'Needs Assignment'}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">Credit Utilization Health</span>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    getCreditUtilization() <= 30 ? 'bg-green-100 text-green-700' :
                                    getCreditUtilization() <= 70 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {getCreditUtilization() <= 30 ? 'Conservative' :
                                     getCreditUtilization() <= 70 ? 'Moderate' :
                                     'High Risk'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Action Items & Recommendations */}
                    <div className="space-y-4">
                        <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Recommended Actions
                        </h3>
                        
                        <div className="space-y-3">
                            {(() => {
                                const actions = [];
                                
                                // Priority actions based on customer state
                                if (customerStats.totalOrders === 0) {
                                    actions.push({
                                        priority: 'high',
                                        action: 'Schedule discovery call to understand customer needs',
                                        icon: '📞',
                                        timeline: 'This week'
                                    });
                                    actions.push({
                                        priority: 'high',
                                        action: 'Send product catalog and pricing information',
                                        icon: '📧',
                                        timeline: 'Next 2 days'
                                    });
                                }
                                
                                if (!customer.salesRepEmployeeNumber?.id) {
                                    actions.push({
                                        priority: 'medium',
                                        action: 'Assign dedicated sales representative',
                                        icon: '👥',
                                        timeline: 'This week'
                                    });
                                }
                                
                                if (customerStats.totalPayments === 0 && customerStats.totalOrders > 0) {
                                    actions.push({
                                        priority: 'high',
                                        action: 'Follow up on outstanding payments',
                                        icon: '💰',
                                        timeline: 'Urgent'
                                    });
                                }
                                
                                if (customerStats.lastOrderDate) {
                                    const daysSinceLastOrder = Math.floor(
                                        (new Date() - new Date(customerStats.lastOrderDate)) / (1000 * 60 * 60 * 24)
                                    );
                                    if (daysSinceLastOrder > 90) {
                                        actions.push({
                                            priority: 'medium',
                                            action: 'Re-engagement campaign - check satisfaction',
                                            icon: '🔄',
                                            timeline: 'This month'
                                        });
                                    }
                                }
                                
                                if (getCreditUtilization() > 80) {
                                    actions.push({
                                        priority: 'medium',
                                        action: 'Review credit limit increase opportunity',
                                        icon: '📈',
                                        timeline: 'Next review cycle'
                                    });
                                }
                                
                                // Default actions if none specific
                                if (actions.length === 0) {
                                    actions.push({
                                        priority: 'low',
                                        action: 'Schedule regular check-in call',
                                        icon: '✅',
                                        timeline: 'Monthly'
                                    });
                                    actions.push({
                                        priority: 'low',
                                        action: 'Review upselling opportunities',
                                        icon: '🎯',
                                        timeline: 'Quarterly'
                                    });
                                }
                                
                                return actions.map((item, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="text-lg">{item.icon}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm font-medium text-gray-800">{item.action}</p>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    item.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                    {item.priority.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">Timeline: {item.timeline}</p>
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

export default CustomerDetail;
