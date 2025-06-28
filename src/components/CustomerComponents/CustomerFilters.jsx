import { FaFilter, FaSearch, FaSortAmountDown } from 'react-icons/fa';

const CustomerFilters = ({
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
        <div className="space-y-3">
            {/* Global Search and Controls */}
            <div className="flex items-center gap-4 flex-wrap">
                {/* Global Search */}
                <div className="relative flex-1 min-w-64">
                    <input
                        type="text"
                        placeholder="Search customers (name, contact, phone, city, country, ID...)"
                        value={globalSearch}
                        onChange={(e) => onGlobalSearchChange(e.target.value)}
                        className="w-full border-2 border-gray-300 bg-white rounded-md py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
                    />
                    <FaSearch className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
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

                {/* Results Counter */}
                <div className="text-sm text-gray-600 font-medium">
                    Showing {filteredCount} of {totalCount} customers
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
        </div>
    );
};

export default CustomerFilters;
