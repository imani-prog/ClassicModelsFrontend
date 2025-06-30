import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

const CustomerEdit = () => {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
                    setFormData({
                        customerName: data.customerName || '',
                        contactFirstName: data.contactFirstName || '',
                        contactLastName: data.contactLastName || '',
                        phone: data.phone || '',
                        addressLine1: data.addressLine1 || '',
                        addressLine2: data.addressLine2 || '',
                        city: data.city || '',
                        state: data.state || '',
                        postalCode: data.postalCode || '',
                        country: data.country || '',
                        creditLimit: data.creditLimit || '',
                        salesRepEmployeeNumber: data.salesRepEmployeeNumber?.id || ''
                    });
                    setLoading(false);
                })
                .catch(err => {
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [customerId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        fetch(`http://localhost:8081/customers/${customerId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...formData,
                creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : null,
                salesRepEmployeeNumber: formData.salesRepEmployeeNumber ? 
                    { id: parseInt(formData.salesRepEmployeeNumber) } : null
            })
        })
        .then(res => {
            if (!res.ok) throw new Error('Failed to update customer');
            return res.json();
        })
        .then(() => {
            navigate(`/customers/${customerId}`);
        })
        .catch(err => {
            setError(err.message);
            setSaving(false);
        });
    };

    if (loading) return <div className="p-6">Loading customer...</div>;
    if (error && !customer) return <div className="p-6 text-red-500">Error: {error}</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(`/customers/${customerId}`)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                        <FaArrowLeft /> Back to Details
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Edit Customer: {customer?.customerName}
                    </h1>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Customer Name *
                        </label>
                        <input
                            type="text"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Contact First Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact First Name *
                        </label>
                        <input
                            type="text"
                            name="contactFirstName"
                            value={formData.contactFirstName}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Contact Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Last Name *
                        </label>
                        <input
                            type="text"
                            name="contactLastName"
                            value={formData.contactLastName}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone *
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Address Line 1 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address Line 1 *
                        </label>
                        <input
                            type="text"
                            name="addressLine1"
                            value={formData.addressLine1}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Address Line 2 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address Line 2
                        </label>
                        <input
                            type="text"
                            name="addressLine2"
                            value={formData.addressLine2}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* City */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* State */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            State
                        </label>
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Postal Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Postal Code
                        </label>
                        <input
                            type="text"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Country */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country *
                        </label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Credit Limit */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Credit Limit
                        </label>
                        <input
                            type="number"
                            name="creditLimit"
                            value={formData.creditLimit}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Sales Rep Employee Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sales Rep Employee Number
                        </label>
                        <input
                            type="number"
                            name="salesRepEmployeeNumber"
                            value={formData.salesRepEmployeeNumber}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 mt-8">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded transition-colors"
                    >
                        <FaSave />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => navigate(`/customers/${customerId}`)}
                        className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition-colors"
                    >
                        <FaTimes />
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CustomerEdit;
