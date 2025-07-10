import { useState } from 'react';
import { FaDollarSign } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

const PaymentForm = ({ showForm, onClose, onSubmit }) => {
    const [form, setForm] = useState({
        customerId: '',
        checkNo: '',
        amount: '',
        date: ''
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
                id: {
                    customerNumber: form.customerId,
                    checkNumber: form.checkNo
                },
                amount: parseFloat(form.amount),
                paymentDate: form.date
            };

            console.log('Sending payment payload:', payload);

            const response = await fetch('http://localhost:8081/payments/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            console.log('Payment response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Payment creation failed:', errorText);
                throw new Error(`Failed to add payment: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            setSuccess('Payment added successfully!');
            
            setForm({ customerId: '', checkNo: '', amount: '', date: '' });
            
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
                className="relative bg-white border border-blue-300 rounded-lg p-6 w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto z-10"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaDollarSign className="text-blue-600" />
                        Add New Payment
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
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID *</label>
                        <input 
                            name="customerId" 
                            value={form.customerId} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter customer ID"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Check Number *</label>
                        <input 
                            name="checkNo" 
                            value={form.checkNo} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. CHK-001"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                        <input 
                            name="amount" 
                            type="number" 
                            step="0.01" 
                            value={form.amount} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
                        <input 
                            name="date" 
                            type="date" 
                            value={form.date} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        {loading ? 'Saving...' : 'Save Payment'}
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

export default PaymentForm;
