import { IoMdClose } from 'react-icons/io';
import { IoSearch } from 'react-icons/io5';

const CustomerSearch = ({ 
    searchNumber, 
    searchResult, 
    searchError, 
    searchEditMode,
    onSearchNumberChange,
    onSearch,
    onSearchInputChange,
    onSearchEditClick,
    onSearchSave,
    onSearchClose 
}) => {
    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <div className="relative flex gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Search by customer number"
                        value={searchNumber}
                        onChange={onSearchNumberChange}
                        className="border-2 border-black bg-[#f5f5f5] rounded-md py-2 pl-13 pr-4"
                    />
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                        onClick={onSearch}
                        type="button"
                    >
                        Search
                    </button>
                    <span className="absolute left-3 top-2.5">
                        <IoSearch className="w-5 h-5" />
                    </span>
                </div>
            </div>
            
            {searchError && <p className="text-red-500">{searchError}</p>}
            
            {searchResult && (
                <form onSubmit={onSearchSave} className="relative bg-white border border-blue-300 rounded-lg p-6 mb-6 shadow-md flex flex-col gap-3 max-w-xl mx-auto">
                    <button
                        type="button"
                        onClick={onSearchClose}
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
                                value={searchResult.customerName || ''} 
                                onChange={searchEditMode ? onSearchInputChange : undefined} 
                                disabled={!searchEditMode} 
                                required 
                                className="border p-2 rounded" 
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Contact First Name *</label>
                            <input 
                                name="contactFirstName" 
                                value={searchResult.contactFirstName || ''} 
                                onChange={searchEditMode ? onSearchInputChange : undefined} 
                                disabled={!searchEditMode} 
                                required 
                                className="border p-2 rounded" 
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Contact Last Name *</label>
                            <input 
                                name="contactLastName" 
                                value={searchResult.contactLastName || ''} 
                                onChange={searchEditMode ? onSearchInputChange : undefined} 
                                disabled={!searchEditMode} 
                                required 
                                className="border p-2 rounded" 
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Phone *</label>
                            <input 
                                name="phone" 
                                value={searchResult.phone || ''} 
                                onChange={searchEditMode ? onSearchInputChange : undefined} 
                                disabled={!searchEditMode} 
                                required 
                                className="border p-2 rounded" 
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                            <input 
                                name="addressLine1" 
                                value={searchResult.addressLine1 || ''} 
                                onChange={searchEditMode ? onSearchInputChange : undefined} 
                                disabled={!searchEditMode} 
                                required 
                                className="border p-2 rounded" 
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                            <input 
                                name="addressLine2" 
                                value={searchResult.addressLine2 || ''} 
                                onChange={searchEditMode ? onSearchInputChange : undefined} 
                                disabled={!searchEditMode} 
                                className="border p-2 rounded" 
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">City *</label>
                            <input 
                                name="city" 
                                value={searchResult.city || ''} 
                                onChange={searchEditMode ? onSearchInputChange : undefined} 
                                disabled={!searchEditMode} 
                                required 
                                className="border p-2 rounded" 
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">State</label>
                            <input 
                                name="state" 
                                value={searchResult.state || ''} 
                                onChange={searchEditMode ? onSearchInputChange : undefined} 
                                disabled={!searchEditMode} 
                                className="border p-2 rounded" 
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                            <input 
                                name="postalCode" 
                                value={searchResult.postalCode || ''} 
                                onChange={searchEditMode ? onSearchInputChange : undefined} 
                                disabled={!searchEditMode} 
                                className="border p-2 rounded" 
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Country *</label>
                            <input 
                                name="country" 
                                value={searchResult.country || ''} 
                                onChange={searchEditMode ? onSearchInputChange : undefined} 
                                disabled={!searchEditMode} 
                                required 
                                className="border p-2 rounded" 
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
                            <input 
                                name="creditLimit" 
                                value={searchResult.creditLimit || ''} 
                                onChange={searchEditMode ? onSearchInputChange : undefined} 
                                disabled={!searchEditMode} 
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
                                value={searchResult.salesRepEmployeeNumber ? (searchResult.salesRepEmployeeNumber.id || searchResult.salesRepEmployeeNumber) : ''} 
                                onChange={searchEditMode ? onSearchInputChange : undefined} 
                                disabled={!searchEditMode} 
                                className="border p-2 rounded" 
                                type="number" 
                                min="0" 
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        {!searchEditMode && (
                            <button 
                                type="button" 
                                className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded" 
                                onClick={onSearchEditClick}
                            >
                                Edit
                            </button>
                        )}
                        {searchEditMode && (
                            <button 
                                type="submit" 
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                            >
                                Save Changes
                            </button>
                        )}
                    </div>
                </form>
            )}
        </>
    );
};

export default CustomerSearch;
