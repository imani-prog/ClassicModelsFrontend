import { FaFilter, FaPlus, FaSortAmountDown, FaTrash } from 'react-icons/fa';
import { IoSearch } from 'react-icons/io5';

const EnhancedProductSearch = ({ 
    searchError,
    searchSuccess,
    onOpenAddForm,
    selectedProducts = [],
    onBulkDelete,
    
    globalSearch,
    onGlobalSearchChange,
    sortBy,
    onSortChange,
    showFilters,
    onToggleFilters,
    filterVendor,
    onFilterVendorChange,
    filterProductLine,
    onFilterProductLineChange,
    vendors,
    productLines,
    filteredCount,
    totalCount
}) => {
    return (
        <div className="space-y-4">
            {/*Search Bar with Controls */}
            <div className="flex items-center gap-4 flex-wrap">
                {/* Main Search Bar */}
                <div className="relative flex-1 min-w-80">
                    <input
                        type="text"
                        placeholder="Search products (name, code, vendor, product line...)"
                        value={globalSearch}
                        onChange={(e) => onGlobalSearchChange(e.target.value)}
                        className="w-full border-2 border-gray-300 bg-white rounded-md py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
                    />
                    <IoSearch className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                    <FaSortAmountDown className="text-gray-600" />
                    <select
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="border-2 border-gray-300 bg-white rounded-md py-2 px-3 focus:border-blue-500 focus:outline-none"
                    >
                        <option value="productName">Sort by Name</option>
                        <option value="productCode">Sort by Code</option>
                        <option value="buyPrice">Sort by Price</option>
                        <option value="quantityInStock">Sort by Stock</option>
                        <option value="productVendor">Sort by Vendor</option>
                    </select>
                </div>

                {/* Filter Toggle */}
                <button
                    onClick={() => onToggleFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md border-2 transition-colors ${
                        showFilters 
                            ? 'bg-blue-100 border-blue-300 text-blue-700' 
                            : 'bg-gray-100 border-gray-300 text-gray-700'
                    }`}
                >
                    <FaFilter />
                    Filters
                </button>

                {/* Bulk Delete Button */}
                {selectedProducts.length > 0 && (
                    <button
                        className="bg-red-500 items-center flex flex-row gap-2 cursor-pointer text-white px-6 py-2 rounded hover:bg-red-600 transition"
                        onClick={onBulkDelete}
                    >
                        <FaTrash className='text-white text-sm' />
                        Delete ({selectedProducts.length})
                    </button>
                )}

                {/* Add Product Button */}
                <button
                    className="bg-[#4a90e2] items-center flex flex-row gap-2 cursor-pointer text-white px-6 py-2 rounded hover:bg-blue-400 transition"
                    onClick={onOpenAddForm}
                >
                    <FaPlus className='text-black text-lg' />
                    Add Product
                </button>
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 font-medium">
                    Showing {filteredCount} of {totalCount} products
                    {(globalSearch || filterVendor || filterProductLine) && (
                        <span className="ml-2 text-blue-600">(filtered)</span>
                    )}
                </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Vendor Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Filter by Vendor
                            </label>
                            <select
                                value={filterVendor}
                                onChange={(e) => onFilterVendorChange(e.target.value)}
                                className="w-full border border-gray-300 bg-white rounded-md py-2 px-3 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">All Vendors</option>
                                {vendors.map(vendor => (
                                    <option key={vendor} value={vendor}>{vendor}</option>
                                ))}
                            </select>
                        </div>

                        {/* Product Line Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Filter by Product Line
                            </label>
                            <select
                                value={filterProductLine}
                                onChange={(e) => onFilterProductLineChange(e.target.value)}
                                className="w-full border border-gray-300 bg-white rounded-md py-2 px-3 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">All Product Lines</option>
                                {productLines.map(line => (
                                    <option key={line} value={line}>{line}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {(filterVendor || filterProductLine) && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                            <button
                                onClick={() => {
                                    onFilterVendorChange('');
                                    onFilterProductLineChange('');
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Search Error/Success Messages */}
            {searchError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-600 text-sm">{searchError}</p>
                </div>
            )}
            {searchSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-green-600 text-sm">{searchSuccess}</p>
                </div>
            )}
        </div>
    );
};

export default EnhancedProductSearch;
