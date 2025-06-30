import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaCheckCircle, FaDollarSign, FaEye, FaInfoCircle, FaReceipt, FaTimes } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';

const CustomerPayments = () => {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch customer details and payments in parallel
                const [customerRes, paymentsRes] = await Promise.all([
                    fetch(`http://localhost:8081/customers/${customerId}`),
                    fetch(`http://localhost:8081/payments`)
                ]);

                if (!customerRes.ok) throw new Error('Customer not found');
                
                const customerData = await customerRes.json();
                const allPayments = await paymentsRes.json();
                
                // Map the payment data structure to match frontend expectations
                const mappedPayments = allPayments.map(payment => ({
                    customerId: payment.id.customerNumber,
                    checkNo: payment.id.checkNumber,
                    amount: payment.amount,
                    date: payment.paymentDate
                }));
                
                // Filter payments for this specific customer
                const customerPayments = mappedPayments.filter(payment => 
                    String(payment.customerId) === String(customerId)
                );

                setCustomer(customerData);
                setPayments(customerPayments);
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

    const formatAmount = (amount) => {
        return `Ksh ${parseFloat(amount || 0).toLocaleString()}`;
    };

    const getTotalPayments = () => {
        return payments.reduce((total, payment) => total + parseFloat(payment.amount || 0), 0);
    };

    const getAveragePayment = () => {
        if (payments.length === 0) return 0;
        return getTotalPayments() / payments.length;
    };

    const getLatestPayment = () => {
        if (payments.length === 0) return null;
        return payments.reduce((latest, payment) => {
            const paymentDate = new Date(payment.date);
            const latestDate = new Date(latest.date);
            return paymentDate > latestDate ? payment : latest;
        });
    };

    // Modal helper functions
    const openPaymentModal = (payment) => {
        setSelectedPayment(payment);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPayment(null);
    };

    const getPaymentAnalysis = (payment) => {
        const paymentDate = new Date(payment.date);
        const now = new Date();
        const daysAgo = Math.floor((now - paymentDate) / (1000 * 60 * 60 * 24));
        const amount = parseFloat(payment.amount);
        const averageAmount = getAveragePayment();

        let status = 'Normal';
        let statusColor = 'text-green-600';
        let statusBg = 'bg-green-50';
        let insights = [];

        // Payment recency analysis
        if (daysAgo <= 7) {
            insights.push('Recent payment - good cash flow indicator');
        } else if (daysAgo <= 30) {
            insights.push('Regular payment timing');
        } else if (daysAgo <= 90) {
            insights.push('Older payment - monitor payment frequency');
        } else {
            insights.push('Very old payment - review current payment status');
            status = 'Old Payment';
            statusColor = 'text-orange-600';
            statusBg = 'bg-orange-50';
        }

        // Amount analysis
        if (amount > averageAmount * 1.5) {
            insights.push('Above average payment amount');
            if (status === 'Normal') {
                status = 'High Value';
                statusColor = 'text-blue-600';
                statusBg = 'bg-blue-50';
            }
        } else if (amount < averageAmount * 0.5 && averageAmount > 0) {
            insights.push('Below average payment amount');
        } else {
            insights.push('Typical payment amount for this customer');
        }

        return { status, statusColor, statusBg, insights, daysAgo, amount };
    };

    if (loading) return <div className="p-6">Loading customer payments...</div>;
    if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

    const latestPayment = getLatestPayment();

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
                            Payment History for {customer?.customerName}
                        </h1>
                        <p className="text-gray-600">Customer ID: {customerId}</p>
                    </div>
                </div>
            </div>

            {/* Payment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-600">
                        <FaDollarSign className="text-lg" />
                        <div>
                            <div className="text-2xl font-bold">{formatAmount(getTotalPayments())}</div>
                            <div className="text-sm">Total Payments</div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-600">
                        <FaReceipt className="text-lg" />
                        <div>
                            <div className="text-2xl font-bold">{payments.length}</div>
                            <div className="text-sm">Total Transactions</div>
                        </div>
                    </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-purple-600">
                        <FaDollarSign className="text-lg" />
                        <div>
                            <div className="text-2xl font-bold">{formatAmount(getAveragePayment())}</div>
                            <div className="text-sm">Average Payment</div>
                        </div>
                    </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-orange-600">
                        <FaCalendarAlt className="text-lg" />
                        <div>
                            <div className="text-lg font-bold">
                                {latestPayment ? formatDate(latestPayment.date) : 'N/A'}
                            </div>
                            <div className="text-sm">Latest Payment</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Payment Records</h2>
                </div>
                
                {payments.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <FaDollarSign className="mx-auto text-4xl mb-4 text-gray-300" />
                        <p>No payments found for this customer</p>
                        <p className="text-sm mt-2">Payment records will appear here when transactions are made</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Check Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment Date
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {payments
                                    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date, newest first
                                    .map((payment, index) => (
                                    <tr key={`${payment.customerId}-${payment.checkNo}-${index}`} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {payment.checkNo}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(payment.date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                            {formatAmount(payment.amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                className="text-blue-600 hover:text-blue-900"
                                                title="View Payment Details"
                                                onClick={() => openPaymentModal(payment)}
                                            >
                                                <FaEye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Customer Credit Information */}
            {customer && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Credit Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-blue-600">Credit Limit</p>
                            <p className="text-xl font-bold text-blue-800">
                                {formatAmount(customer.creditLimit)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-blue-600">Payment Performance</p>
                            <p className="text-lg text-blue-800">
                                {payments.length > 0 ? 'Active Customer' : 'No Payment History'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Helper */}
            <div className="mt-6 flex justify-between items-center">
                <Link 
                    to={`/customers/${customerId}/orders`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                    ← View Order History
                </Link>
                <Link 
                    to="/payments"
                    className="flex items-center gap-2 text-green-600 hover:text-green-800"
                >
                    View All Payments →
                </Link>
            </div>

            {/* Payment Details Modal */}
            {showModal && selectedPayment && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-800">
                                Payment Details
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {(() => {
                                const analysis = getPaymentAnalysis(selectedPayment);
                                return (
                                    <div className="space-y-6">
                                        {/* Payment Status Badge */}
                                        <div className="flex items-center gap-3">
                                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${analysis.statusBg} ${analysis.statusColor}`}>
                                                {analysis.status}
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {analysis.daysAgo === 0 ? 'Today' : 
                                                 analysis.daysAgo === 1 ? '1 day ago' : 
                                                 `${analysis.daysAgo} days ago`}
                                            </span>
                                        </div>

                                        {/* Payment Information Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                                                        <FaReceipt className="w-4 h-4" />
                                                        <span className="font-medium">Check Number</span>
                                                    </div>
                                                    <p className="text-lg font-bold text-blue-800">
                                                        {selectedPayment.checkNo}
                                                    </p>
                                                </div>

                                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                    <div className="flex items-center gap-2 text-green-600 mb-2">
                                                        <FaDollarSign className="w-4 h-4" />
                                                        <span className="font-medium">Amount</span>
                                                    </div>
                                                    <p className="text-2xl font-bold text-green-800">
                                                        {formatAmount(selectedPayment.amount)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                                                        <FaCalendarAlt className="w-4 h-4" />
                                                        <span className="font-medium">Payment Date</span>
                                                    </div>
                                                    <p className="text-lg font-bold text-purple-800">
                                                        {formatDate(selectedPayment.date)}
                                                    </p>
                                                </div>

                                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                                                        <FaInfoCircle className="w-4 h-4" />
                                                        <span className="font-medium">Customer</span>
                                                    </div>
                                                    <p className="text-lg font-bold text-gray-800">
                                                        {customer?.customerName}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        ID: {selectedPayment.customerId}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Analysis and Insights */}
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 text-yellow-600 mb-3">
                                                <FaCheckCircle className="w-4 h-4" />
                                                <span className="font-medium">Payment Analysis</span>
                                            </div>
                                            <ul className="space-y-2">
                                                {analysis.insights.map((insight, index) => (
                                                    <li key={index} className="flex items-start gap-2 text-sm text-yellow-800">
                                                        <span className="text-yellow-600 mt-1">•</span>
                                                        {insight}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Comparison with Customer Averages */}
                                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                            <h4 className="font-medium text-indigo-800 mb-3">
                                                Customer Payment Context
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-indigo-600">This Payment:</span>
                                                    <p className="font-bold text-indigo-800">
                                                        {formatAmount(selectedPayment.amount)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-indigo-600">Customer Average:</span>
                                                    <p className="font-bold text-indigo-800">
                                                        {formatAmount(getAveragePayment())}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-indigo-600">Total Payments:</span>
                                                    <p className="font-bold text-indigo-800">
                                                        {payments.length} transactions
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-indigo-600">Total Value:</span>
                                                    <p className="font-bold text-indigo-800">
                                                        {formatAmount(getTotalPayments())}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerPayments;
