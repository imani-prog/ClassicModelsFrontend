import { FaFilter, FaPlus, FaSortAmountDown, FaTrash } from 'react-icons/fa';
import { IoSearch } from 'react-icons/io5';

const EnhancedCustomerSearch = ({ 
    // Original search props (keeping for modal functionality)
    searchResult, 
    searchError, 
    searchEditMode,
    onSearchEditClick,
    onSearchSave,
    onSearchClose,
    showAddForm,
    onOpenForm,
    selectedCustomers = [],
    onBulkDelete,
    
    // Enhanced filter props
    globalSearch,
    onGlobalSearchChange,
    sortBy,
    onSortChange,
    showFilters,
    onToggleFilters,
    filterCountry,
    onFilterCountryChange,
    filterState,
    onFilterStateChange,
    countries,
    states,
    filteredCount,
    totalCount
}) => {
    return (
        <div className="space-y-4">
            {/* Single Search Bar with Controls */}
            <div className="flex items-center gap-4 flex-wrap">
                {/* Main Search Bar */}
                <div className="relative flex-1 min-w-80">
                    <input
                        type="text"
                        placeholder="Search customers (name, contact, phone, city, country, ID...)"
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
                        <option value="customerName">Sort by Name</option>
                        <option value="country">Sort by Country</option>
                        <option value="creditLimit">Sort by Credit Limit</option>
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
                {selectedCustomers.length > 0 && (
                    <button
                        className="bg-red-500 items-center flex flex-row gap-2 cursor-pointer text-white px-6 py-2 rounded hover:bg-red-600 transition"
                        onClick={onBulkDelete}
                    >
                        <FaTrash className='text-white text-sm' />
                        Delete ({selectedCustomers.length})
                    </button>
                )}

                {/* Add Customer Button */}
                {!showAddForm && !searchResult && (
                    <button
                        className="bg-[#4a90e2] items-center flex flex-row gap-2 cursor-pointer text-white px-6 py-2 rounded hover:bg-blue-400 transition"
                        onClick={onOpenForm}
                    >
                        <FaPlus className='text-black text-lg' />
                        Add Customer
                    </button>
                )}
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 font-medium">
                    Showing {filteredCount} of {totalCount} customers
                    {(globalSearch || filterCountry || filterState) && (
                        <span className="ml-2 text-blue-600">(filtered)</span>
                    )}
                </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Country Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Filter by Country
                            </label>
                            <select
                                value={filterCountry}
                                onChange={(e) => onFilterCountryChange(e.target.value)}
                                className="w-full border border-gray-300 bg-white rounded-md py-2 px-3 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">All Countries</option>
                                {countries.map(country => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                        </div>

                        {/* State Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Filter by State/Region
                            </label>
                            <select
                                value={filterState}
                                onChange={(e) => onFilterStateChange(e.target.value)}
                                className="w-full border border-gray-300 bg-white rounded-md py-2 px-3 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">All States/Regions</option>
                                {states.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {(filterCountry || filterState) && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                            <button
                                onClick={() => {
                                    onFilterCountryChange('');
                                    onFilterStateChange('');
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Search Error */}
            {searchError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-600 text-sm">{searchError}</p>
                </div>
            )}
            
            {/* Search Result Modal - keeping the original modal logic */}
            {searchResult && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onSearchClose}></div>
                    <div className="relative bg-white border border-blue-300 rounded-lg p-6 w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Customer Details (#{searchResult.id})
                            </h3>
                            <button
                                type="button"
                                onClick={onSearchClose}
                                className="text-gray-500 hover:text-red-600 transition-colors text-2xl"
                                title="Close"
                            >
                                ×
                            </button>
                        </div>
                        <div className="text-center text-gray-600">
                            Customer details for: {searchResult.customerName}
                        </div>
                        <div className="flex gap-2 mt-4 justify-end">
                            {!searchEditMode && (
                                <button 
                                    type="button" 
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition-colors" 
                                    onClick={onSearchEditClick}
                                >
                                    Edit
                                </button>
                            )}
                            {searchEditMode && (
                                <button 
                                    type="button" 
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                                    onClick={onSearchSave}
                                >
                                    Save Changes
                                </button>
                            )}
                            <button 
                                type="button" 
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                                onClick={onSearchClose}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnhancedCustomerSearch;
