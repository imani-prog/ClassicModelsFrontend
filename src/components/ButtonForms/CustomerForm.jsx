import { useState } from 'react';
import { FaUsers } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

const CustomerForm = ({ showForm, onClose, onSubmit }) => {
    const [form, setForm] = useState({
        customerName: '',
        contactFirstName: '',
        contactLastName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        salesRepEmployeeNumber: '',
        creditLimit: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!showForm) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                ...form,
                creditLimit: form.creditLimit ? parseFloat(form.creditLimit) : null,
                salesRepEmployeeNumber: form.salesRepEmployeeNumber ? parseInt(form.salesRepEmployeeNumber) : null
            };

            const response = await fetch('http://localhost:8081/customers/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to add customer');
            }

            const result = await response.json();
            setSuccess('Customer added successfully!');
            
            // Reset form
            setForm({
                customerName: '',
                contactFirstName: '',
                contactLastName: '',
                phone: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                postalCode: '',
                country: '',
                salesRepEmployeeNumber: '',
                creditLimit: ''
            });
            
            // Call parent callback if provided
            if (onSubmit) {
                onSubmit(result);
            }

            // Auto close after success
            setTimeout(() => {
                setSuccess('');
                onClose();
            }, 1500);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
            <form 
                onSubmit={handleSubmit} 
                className="relative bg-white border border-blue-300 rounded-lg p-6 w-full max-w-4xl shadow-lg max-h-[90vh] overflow-y-auto z-10"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaUsers className="text-blue-600" />
                        Add New Customer
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-600 transition-colors text-2xl"
                    >
                        <IoMdClose />
                    </button>
                </div>

                {/* Messages */}
                {error && <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">{error}</div>}
                {success && <div className="text-green-600 mb-4 p-3 bg-green-50 rounded">{success}</div>}

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                        <input 
                            name="customerName" 
                            value={form.customerName} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter customer name"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact First Name *</label>
                        <input 
                            name="contactFirstName" 
                            value={form.contactFirstName} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter first name"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Last Name *</label>
                        <input 
                            name="contactLastName" 
                            value={form.contactLastName} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter last name"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input 
                            name="phone" 
                            type="tel" 
                            value={form.phone} 
                            onChange={handleInputChange} 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter phone number"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sales Rep Employee Number</label>
                        <input 
                            name="salesRepEmployeeNumber" 
                            type="number" 
                            value={form.salesRepEmployeeNumber} 
                            onChange={handleInputChange} 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Employee ID"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
                        <input 
                            name="creditLimit" 
                            type="number" 
                            step="0.01" 
                            value={form.creditLimit} 
                            onChange={handleInputChange} 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                        />
                    </div>
                    
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                        <input 
                            name="addressLine1" 
                            value={form.addressLine1} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter primary address"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                        <input 
                            name="addressLine2" 
                            value={form.addressLine2} 
                            onChange={handleInputChange} 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter secondary address"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                        <input 
                            name="city" 
                            value={form.city} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter city"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                        <input 
                            name="state" 
                            value={form.state} 
                            onChange={handleInputChange} 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter state"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                        <input 
                            name="postalCode" 
                            value={form.postalCode} 
                            onChange={handleInputChange} 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter postal code"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                        <input 
                            name="country" 
                            value={form.country} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter country"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium"
                    >
                        {loading ? 'Saving...' : 'Save Customer'}
                    </button>
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CustomerForm;
