import { useEffect, useState } from 'react';
import { FaArrowLeft, FaClipboardList, FaDollarSign, FaEdit, FaTrash } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';

const CustomerDetail = () => {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (customerId) {
            fetch(`http://localhost:8081/customers/${customerId}`)
                .then(res => {
                    if (!res.ok) throw new Error('Customer not found');
                    return res.json();
                })
                .then(data => {
                    setCustomer(data);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [customerId]);

    if (loading) return <div className="p-6">Loading customer details...</div>;
    if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
    if (!customer) return <div className="p-6">Customer not found</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/customers')}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                        <FaArrowLeft /> Back to Customers
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {customer.customerName}
                    </h1>
                </div>
                <div className="flex gap-2">
                    <Link 
                        to={`/customers/${customerId}/edit`}
                        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                    >
                        <FaEdit /> Edit
                    </Link>
                    <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                        <FaTrash /> Delete
                    </button>
                </div>
            </div>

            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                    <div className="space-y-3">
                        <p><strong>Customer ID:</strong> {customer.id}</p>
                        <p><strong>Contact:</strong> {customer.contactFirstName} {customer.contactLastName}</p>
                        <p><strong>Phone:</strong> {customer.phone}</p>
                        <p><strong>Email:</strong> {customer.email || 'N/A'}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Address</h2>
                    <div className="space-y-2">
                        <p>{customer.addressLine1}</p>
                        {customer.addressLine2 && <p>{customer.addressLine2}</p>}
                        <p>{customer.city}, {customer.state} {customer.postalCode}</p>
                        <p>{customer.country}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Business Details</h2>
                    <div className="space-y-3">
                        <p><strong>Credit Limit:</strong> Ksh {customer.creditLimit?.toLocaleString() || 'N/A'}</p>
                        <p><strong>Sales Rep:</strong> {customer.salesRepEmployeeNumber?.id || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link 
                    to={`/customers/${customerId}/orders`}
                    className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition"
                >
                    <FaClipboardList className="text-blue-600 text-xl" />
                    <div>
                        <h3 className="font-semibold text-blue-800">View Orders</h3>
                        <p className="text-sm text-blue-600">See all orders for this customer</p>
                    </div>
                </Link>

                <Link 
                    to={`/customers/${customerId}/payments`}
                    className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition"
                >
                    <FaDollarSign className="text-green-600 text-xl" />
                    <div>
                        <h3 className="font-semibold text-green-800">Payment History</h3>
                        <p className="text-sm text-green-600">View payment records</p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default CustomerDetail;
