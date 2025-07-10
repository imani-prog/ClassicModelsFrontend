import { useEffect, useState } from 'react';
import { FaArrowLeft, FaBuilding, FaCalendarAlt, FaChartLine, FaCheckCircle, FaClipboardList, FaClock, FaCreditCard, FaDollarSign, FaEdit, FaExclamationTriangle, FaMapMarkerAlt, FaShoppingCart, FaTrash, FaUser } from 'react-icons/fa';
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

                    const customerOrders = ordersData.filter(order => 
                        String(order.customerNumber?.id || order.customerNumber) === String(customerId)
                    );
            
                    const customerPayments = paymentsData
                        .map(payment => ({
                            customerId: payment.id.customerNumber,
                            amount: payment.amount,
                            date: payment.paymentDate
                        }))
                        .filter(payment => String(payment.customerId) === String(customerId));

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

    //logic for action buttons
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
            ? (customerStats.totalPayments / (customerStats.totalOrders * 1000))
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
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => navigate('/customers')}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200"
                            >
                                <FaArrowLeft className="text-sm" /> 
                                <span className="font-medium">Back to Customers</span>
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                                    <FaUser className="text-white text-xl" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {customer.customerName}
                                    </h1>
                                    <div className="flex items-center gap-4 mt-1">
                                        <p className="text-gray-600 font-medium">ID: {customer.id}</p>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getAccountStatusColor()}`}>
                                            {customerStats.accountStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Link 
                                to={`/customers/${customerId}/edit`}
                                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                            >
                                <FaEdit className="text-sm" /> Edit
                            </Link>
                            <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium">
                                <FaTrash className="text-sm" /> Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* Unified Customer Details Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Form Header with Quick Stats */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-semibold text-gray-900">Customer Details</h2>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-gray-200">
                                    <FaShoppingCart className="text-blue-600 text-sm" />
                                    <span className="text-sm font-medium text-gray-600">{customerStats.totalOrders} Orders</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-gray-200">
                                    <FaDollarSign className="text-green-600 text-sm" />
                                    <span className="text-sm font-medium text-gray-600">Ksh {customerStats.totalPayments.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-gray-200">
                                    <FaChartLine className="text-purple-600 text-sm" />
                                    <span className="text-sm font-medium text-gray-600">{getCreditUtilization().toFixed(1)}% Credit</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Single Form Container */}
                    <div className="p-8">
                        <div className="space-y-8">
                            
                            {/* Contact & Basic Information Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                        <FaUser className="text-blue-600 text-sm" />
                                        Contact Information
                                    </h3>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <p className="font-medium text-gray-900">{customer.contactFirstName}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <p className="font-medium text-gray-900">{customer.contactLastName}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="font-medium text-gray-900">{customer.phone}</p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="font-medium text-gray-900">{customer.email || 'Not Provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                        <FaBuilding className="text-purple-600 text-sm" />
                                        Business Information
                                    </h3>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-lg font-bold text-green-600">Ksh {customer.creditLimit?.toLocaleString() || 'N/A'}</span>
                                                <span className="text-sm text-gray-600">{getCreditUtilization().toFixed(1)}% used</span>
                                            </div>
                                            <div className="w-full bg-gray-300 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full transition-all duration-500 ${
                                                        getCreditUtilization() > 80 ? 'bg-red-500' :
                                                        getCreditUtilization() > 50 ? 'bg-yellow-500' : 'bg-green-500'
                                                    }`}
                                                    style={{ width: `${Math.min(getCreditUtilization(), 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sales Representative</label>
                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="font-medium text-gray-900">
                                                {customer.salesRepEmployeeNumber?.id || 'Not Assigned'}
                                            </p>
                                            {!customer.salesRepEmployeeNumber?.id && (
                                                <p className="text-orange-600 text-sm mt-1">⚠️ Needs assignment</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Order Date</label>
                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                                            <FaCalendarAlt className="text-gray-400 text-sm" />
                                            <p className="font-medium text-gray-900">{formatDate(customerStats.lastOrderDate)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200"></div>

                            {/* Address Information Row */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                                    <FaMapMarkerAlt className="text-green-600 text-sm" />
                                    Address Information
                                </h3>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="font-medium text-gray-900">{customer.addressLine1}</p>
                                            {customer.addressLine2 && <p className="text-gray-600 mt-1">{customer.addressLine2}</p>}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <p className="font-medium text-gray-900">{customer.city}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <p className="font-medium text-gray-900">{customer.state}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <p className="font-medium text-gray-900">{customer.postalCode}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <span className="inline-block bg-blue-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
                                                    {customer.country}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Account Status & Activity Row */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                                    <FaChartLine className="text-indigo-600 text-sm" />
                                    Account Activity & Status
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FaCheckCircle className={`text-sm ${customerStats.accountStatus === 'Active' ? 'text-green-500' : 'text-orange-500'}`} />
                                            <h4 className="font-medium text-gray-700">Account Status</h4>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {customerStats.accountStatus === 'Active' ? 'Recently active' : 'Needs attention'}
                                        </p>
                                    </div>
                                    
                                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FaDollarSign className="text-green-500 text-sm" />
                                            <h4 className="font-medium text-gray-700">Credit Health</h4>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {getCreditUtilization() > 80 ? 'High utilization' :
                                             getCreditUtilization() > 50 ? 'Moderate usage' : 'Low utilization'}
                                        </p>
                                    </div>
                                    
                                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FaClock className="text-purple-500 text-sm" />
                                            <h4 className="font-medium text-gray-700">Relationship</h4>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {customerStats.totalOrders > 10 ? 'Long-term' :
                                             customerStats.totalOrders > 3 ? 'Regular' : 'New customer'}
                                        </p>
                                    </div>
                                    
                                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FaCreditCard className="text-orange-500 text-sm" />
                                            <h4 className="font-medium text-gray-700">Next Action</h4>
                                        </div>
                                        <p className="text-sm text-gray-600">{getBusinessInsights().nextAction}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Integrated Quick Actions Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Available Actions</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link 
                                to={customer.salesRepEmployeeNumber?.id ? `/employees/${customer.salesRepEmployeeNumber.id}` : '/employees'}
                                className="group flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 border border-cyan-200 rounded-lg transition-all duration-200 hover:shadow-md"
                            >
                                <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center text-white">
                                    <FaUser className="text-sm" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-cyan-800">
                                        {customer.salesRepEmployeeNumber?.id ? 'Contact Sales Rep' : 'Assign Sales Rep'}
                                    </h4>
                                    <p className="text-sm text-cyan-600">
                                        {customer.salesRepEmployeeNumber?.id ? 'View representative details' : 'Assign a sales representative'}
                                    </p>
                                </div>
                                <FaArrowLeft className="text-cyan-400 transform rotate-180 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link 
                                to="/products"
                                className="group flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 rounded-lg transition-all duration-200 hover:shadow-md"
                            >
                                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                                    <FaShoppingCart className="text-sm" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-purple-800">Browse Products</h4>
                                    <p className="text-sm text-purple-600">View catalog and recommendations</p>
                                </div>
                                <FaArrowLeft className="text-purple-400 transform rotate-180 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link 
                                to={`/orders?customer=${customerId}`}
                                className="group flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border border-emerald-200 rounded-lg transition-all duration-200 hover:shadow-md"
                            >
                                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                                    <FaClipboardList className="text-sm" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-emerald-800">Create New Order</h4>
                                    <p className="text-sm text-emerald-600">Start a new order for this customer</p>
                                </div>
                                <FaArrowLeft className="text-emerald-400 transform rotate-180 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Integrated Advanced Analytics Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <FaChartLine className="text-indigo-600 text-sm" />
                                Customer Analytics & Insights
                            </h3>
                            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                getBusinessInsights().riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                                getBusinessInsights().riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                                {getBusinessInsights().riskLevel.toUpperCase()} RISK
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {/* Enhanced Quick Actions with Dynamic Logic */}
                        <div>
                            <h4 className="text-md font-semibold text-gray-900 mb-4">Smart Actions</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                        <FaCreditCard className="text-white text-sm" />
                                                    ) : (
                                                        <FaDollarSign className="text-white text-sm" />
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
                                                                paymentsLogic.colorScheme === 'green' 
                                                                    ? 'bg-green-100 text-green-700' 
                                                                    : 'bg-orange-100 text-orange-700'
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
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <div className={`w-2 h-2 rounded-full ${
                                                                paymentsLogic.paymentHealth === 'good' ? 'bg-green-400' :
                                                                paymentsLogic.paymentHealth === 'fair' ? 'bg-yellow-400' : 'bg-red-400'
                                                            }`}></div>
                                                            <span className="text-xs text-gray-500">
                                                                {paymentsLogic.paymentHealth === 'good' ? 'Healthy payments' :
                                                                 paymentsLogic.paymentHealth === 'fair' ? 'Moderate health' : 'Needs attention'}
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
                        </div>

                        {/* Business Intelligence Metrics */}
                        <div className="border-t border-gray-200 pt-6">
                            <h4 className="text-md font-semibold text-gray-900 mb-4">Business Intelligence</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Account Health Score */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h5 className="font-semibold text-blue-800">Account Health</h5>
                                        <div className={`w-3 h-3 rounded-full ${
                                            customerStats.accountStatus === 'Active' && customerStats.totalOrders > 0 ? 'bg-green-400' :
                                            customerStats.totalOrders > 0 ? 'bg-yellow-400' : 'bg-red-400'
                                        }`}></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-blue-600">Orders:</span>
                                            <span className="font-semibold text-blue-800">{customerStats.totalOrders}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-blue-600">Status:</span>
                                            <span className="font-semibold text-blue-800">{customerStats.accountStatus}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-blue-600">Credit Usage:</span>
                                            <span className="font-semibold text-blue-800">{getCreditUtilization().toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Behavior Analysis */}
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h5 className="font-semibold text-green-800">Payment Behavior</h5>
                                        <FaDollarSign className="text-green-600 text-lg" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-600">Total Paid:</span>
                                            <span className="font-semibold text-green-800">Ksh {customerStats.totalPayments.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-600">Last Payment:</span>
                                            <span className="font-semibold text-green-800">{formatDate(customerStats.lastPaymentDate)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-600">Payment Health:</span>
                                            <span className={`font-semibold ${
                                                getPaymentsButtonLogic().paymentHealth === 'good' ? 'text-green-700' :
                                                getPaymentsButtonLogic().paymentHealth === 'fair' ? 'text-yellow-700' : 'text-red-700'
                                            }`}>
                                                {getPaymentsButtonLogic().paymentHealth?.toUpperCase() || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Opportunity Analysis */}
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h5 className="font-semibold text-purple-800">Growth Opportunity</h5>
                                        <FaChartLine className="text-purple-600 text-lg" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-purple-600">Relationship:</span>
                                            <span className="font-semibold text-purple-800">
                                                {customerStats.totalOrders > 10 ? 'Long-term' :
                                                 customerStats.totalOrders > 3 ? 'Regular' : 'New'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-purple-600">Opportunity:</span>
                                            <span className="font-semibold text-purple-800">
                                                {getBusinessInsights().opportunity === 'new_customer' ? 'New Customer' :
                                                 getBusinessInsights().opportunity === 'payment_setup' ? 'Payment Setup' : 'Growth'}
                                            </span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-purple-600">Next Action:</span>
                                            <div className="mt-1 p-2 bg-purple-200 rounded text-xs font-semibold text-purple-800">
                                                {getBusinessInsights().nextAction}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetail; 