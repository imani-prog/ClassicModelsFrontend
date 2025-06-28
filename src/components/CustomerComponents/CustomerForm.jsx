import { IoMdClose } from 'react-icons/io';

const CustomerForm = ({ 
    showForm, 
    form, 
    editMode, 
    saving, 
    onInputChange, 
    onSubmit, 
    onClose 
}) => {
    if (!showForm) return null;

    return (
        <div className="w-full flex items-center justify-center mb-8">
            <form onSubmit={onSubmit} className="relative bg-white border border-blue-300 rounded-lg p-6 w-full max-w-xl shadow-md flex flex-col gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-600 transition-colors text-2xl"
                    title="Close"
                >
                    <IoMdClose />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                        <input 
                            name="customerName" 
                            value={form.customerName} 
                            onChange={onInputChange} 
                            required 
                            className="border p-2 rounded" 
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Contact First Name *</label>
                        <input 
                            name="contactFirstName" 
                            value={form.contactFirstName} 
                            onChange={onInputChange} 
                            required 
                            className="border p-2 rounded" 
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Contact Last Name *</label>
                        <input 
                            name="contactLastName" 
                            value={form.contactLastName} 
                            onChange={onInputChange} 
                            required 
                            className="border p-2 rounded" 
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Phone *</label>
                        <input 
                            name="phone" 
                            value={form.phone} 
                            onChange={onInputChange} 
                            required 
                            className="border p-2 rounded" 
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                        <input 
                            name="addressLine1" 
                            value={form.addressLine1} 
                            onChange={onInputChange} 
                            required 
                            className="border p-2 rounded" 
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                        <input 
                            name="addressLine2" 
                            value={form.addressLine2} 
                            onChange={onInputChange} 
                            className="border p-2 rounded" 
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">City *</label>
                        <input 
                            name="city" 
                            value={form.city} 
                            onChange={onInputChange} 
                            required 
                            className="border p-2 rounded" 
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">State</label>
                        <input 
                            name="state" 
                            value={form.state} 
                            onChange={onInputChange} 
                            className="border p-2 rounded" 
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                        <input 
                            name="postalCode" 
                            value={form.postalCode} 
                            onChange={onInputChange} 
                            className="border p-2 rounded" 
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Country *</label>
                        <input 
                            name="country" 
                            value={form.country} 
                            onChange={onInputChange} 
                            required 
                            className="border p-2 rounded" 
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
                        <input 
                            name="creditLimit" 
                            value={form.creditLimit} 
                            onChange={onInputChange} 
                            className="border p-2 rounded" 
                            type="number" 
                            min="0" 
                            step="0.01" 
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Sales Rep Employee Number</label>
                        <input 
                            name="salesRepEmployeeNumber" 
                            value={form.salesRepEmployeeNumber} 
                            onChange={onInputChange} 
                            className="border p-2 rounded" 
                            type="number" 
                            min="0" 
                        />
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <button 
                        type="submit" 
                        disabled={saving} 
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    >
                        {saving ? (editMode ? 'Saving...' : 'Saving...') : (editMode ? 'Save Changes' : 'Save Customer')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CustomerForm;
