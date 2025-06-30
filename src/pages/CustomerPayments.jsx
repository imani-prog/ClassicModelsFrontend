import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaDollarSign, FaEye, FaReceipt } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';

const CustomerPayments = () => {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
                                                onClick={() => {
                                                    // Could open a modal or navigate to payment detail
                                                    alert(`Payment Details:\nCheck: ${payment.checkNo}\nAmount: ${formatAmount(payment.amount)}\nDate: ${formatDate(payment.date)}`);
                                                }}
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
        </div>
    );
};

export default CustomerPayments;
