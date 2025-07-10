import { useState } from 'react';
import { FaBuilding } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

const OfficeForm = ({ showForm, onClose, onSubmit }) => {
    const [form, setForm] = useState({
        officeCode: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        country: '',
        phone: '',
        postalCode: '',
        state: '',
        territory: ''
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
            const response = await fetch('http://localhost:8081/api/offices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (!response.ok) {
                throw new Error('Failed to add office');
            }

            const result = await response.json();
            setSuccess('Office added successfully!');
            
            setForm({
                officeCode: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                country: '',
                phone: '',
                postalCode: '',
                state: '',
                territory: ''
            });
            
            if (onSubmit) {
                onSubmit(result);
            }

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
                className="relative bg-white border border-blue-300 rounded-lg p-6 w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto z-10"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaBuilding className="text-blue-600" />
                        Add New Office
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Office Code *</label>
                        <input 
                            name="officeCode" 
                            value={form.officeCode} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter office code"
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
                    
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                        <input 
                            name="addressLine2" 
                            value={form.addressLine2} 
                            onChange={handleInputChange} 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter secondary address (optional)"
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
                            placeholder="Enter state or province"
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
                    
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Territory</label>
                        <input 
                            name="territory" 
                            value={form.territory} 
                            onChange={handleInputChange} 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter territory"
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
                        {loading ? 'Saving...' : 'Save Office'}
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

export default OfficeForm;
