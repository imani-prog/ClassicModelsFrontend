import { useState } from 'react';
import { FaBox } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

const ProductForm = ({ showForm, onClose, onSubmit }) => {
    const [form, setForm] = useState({
        productName: '',
        productLine: '',
        productScale: '',
        productVendor: '',
        productDescription: '',
        quantityInStock: '',
        buyPrice: '',
        msrp: ''
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
                quantityInStock: form.quantityInStock ? parseInt(form.quantityInStock) : 0,
                buyPrice: form.buyPrice ? parseFloat(form.buyPrice) : 0,
                msrp: form.msrp ? parseFloat(form.msrp) : 0
            };

            const response = await fetch('http://localhost:8081/products/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to add product');
            }

            const result = await response.json();
            setSuccess('Product added successfully!');
            
            setForm({
                productName: '',
                productLine: '',
                productScale: '',
                productVendor: '',
                productDescription: '',
                quantityInStock: '',
                buyPrice: '',
                msrp: ''
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
                className="relative bg-white border border-blue-300 rounded-lg p-6 w-full max-w-3xl shadow-lg max-h-[90vh] overflow-y-auto z-10"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaBox className="text-blue-600" />
                        Add New Product
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                        <input 
                            name="productName" 
                            value={form.productName} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter product name"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Line *</label>
                        <select 
                            name="productLine" 
                            value={form.productLine} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select product line</option>
                            <option value="Classic Cars">Classic Cars</option>
                            <option value="Motorcycles">Motorcycles</option>
                            <option value="Planes">Planes</option>
                            <option value="Ships">Ships</option>
                            <option value="Trains">Trains</option>
                            <option value="Trucks and Buses">Trucks and Buses</option>
                            <option value="Vintage Cars">Vintage Cars</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Scale *</label>
                        <input 
                            name="productScale" 
                            value={form.productScale} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 1:10, 1:18, 1:24"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Vendor *</label>
                        <input 
                            name="productVendor" 
                            value={form.productVendor} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter vendor name"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity in Stock *</label>
                        <input 
                            name="quantityInStock" 
                            type="number" 
                            min="0" 
                            value={form.quantityInStock} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Buy Price *</label>
                        <input 
                            name="buyPrice" 
                            type="number" 
                            step="0.01" 
                            min="0" 
                            value={form.buyPrice} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">MSRP *</label>
                        <input 
                            name="msrp" 
                            type="number" 
                            step="0.01" 
                            min="0" 
                            value={form.msrp} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                        />
                    </div>
                    
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Description</label>
                        <textarea 
                            name="productDescription" 
                            value={form.productDescription} 
                            onChange={handleInputChange} 
                            rows="4" 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter product description..."
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
                        {loading ? 'Saving...' : 'Save Product'}
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

export default ProductForm;
