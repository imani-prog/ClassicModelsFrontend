import ConfirmDialog from '../components/CustomerComponents/ConfirmDialog';
import CustomerForm from '../components/CustomerComponents/CustomerForm';
import CustomerStats from '../components/CustomerComponents/CustomerStats';
import EnhancedCustomerSearch from '../components/CustomerComponents/EnhancedCustomerSearch';
import EnhancedCustomerTable from '../components/CustomerComponents/EnhancedCustomerTable';
import Toast from '../components/CustomerComponents/Toast';
import useAllCustomers from '../hooks/useAllCustomers';
import useCustomerEnhancements from '../hooks/useCustomerEnhancements';
import useCustomers from '../hooks/useCustomers';

const Customers = () => {
    // Get all customers for display and stats
    const {
        customers: allCustomers,
        loading: customersLoading,
        error: customersError,
        refreshCustomers
    } = useAllCustomers();

    // Get form and modal functionality from the original hook
    const {
        // State
        showAddForm,
        form,
        editMode,
        saving,
        searchResult,
        searchError,
        searchEditMode,
        toast,
        confirmDialog,
        
        // Actions
        handleInputChange,
        handleAddCustomer,
        handleEditClick,
        handleDeleteClick,
        confirmDelete,
        cancelDelete,
        handleCloseForm,
        handleOpenForm,
        handleSearchEditClick,
        handleSearchSave,
        handleSearchClose,
        
        // Bulk selection
        selectedCustomers,
        handleSelectCustomer,
        handleSelectAllCustomers,
        handleBulkDelete
    } = useCustomers();

    // Enhanced features based on all customers
    const {
        sortBy,
        filterCountry,
        filterState,
        showFilters,
        globalSearch,
        filteredCustomers,
        countries,
        states,
        setSortBy,
        setFilterCountry,
        setFilterState,
        setShowFilters,
        setGlobalSearch
    } = useCustomerEnhancements(allCustomers);

    return (
        <div className="max-w-6xl mx-auto px-2 h-full flex flex-col pt-2">
            {/* Header Section - Fixed height */}
            <div className='flex items-start justify-between mb-3 flex-shrink-0'>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold mb-1">Customers</h1>
                    <p className="text-gray-600 text-sm">Manage your customer database and information</p>
                </div>
                
                {/* Quick Stats */}
                <CustomerStats customers={allCustomers} />
            </div>
            
            {/* Search Section - Fixed height */}
            <div className="mb-3 flex-shrink-0">
                <EnhancedCustomerSearch
                    searchResult={searchResult}
                    searchError={searchError}
                    searchEditMode={searchEditMode}
                    onSearchEditClick={handleSearchEditClick}
                    onSearchSave={handleSearchSave}
                    onSearchClose={handleSearchClose}
                    showAddForm={showAddForm}
                    onOpenForm={handleOpenForm}
                    selectedCustomers={selectedCustomers}
                    onBulkDelete={handleBulkDelete}
                    // Enhanced props
                    globalSearch={globalSearch}
                    onGlobalSearchChange={setGlobalSearch}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    showFilters={showFilters}
                    onToggleFilters={setShowFilters}
                    filterCountry={filterCountry}
                    onFilterCountryChange={setFilterCountry}
                    filterState={filterState}
                    onFilterStateChange={setFilterState}
                    countries={countries}
                    states={states}
                    filteredCount={filteredCustomers.length}
                    totalCount={allCustomers.length}
                />
            </div>

            {/* Table Section - Flexible height */}
            <div className="flex-1 min-h-0 mb-2">
                <EnhancedCustomerTable
                    customers={filteredCustomers}
                    loading={customersLoading}
                    error={customersError}
                    onEditClick={handleEditClick}
                    onDeleteClick={handleDeleteClick}
                    selectedCustomers={selectedCustomers}
                    onSelectCustomer={handleSelectCustomer}
                    onSelectAllCustomers={handleSelectAllCustomers}
                />
            </div>

            <CustomerForm
                showForm={showAddForm}
                form={form}
                editMode={editMode}
                saving={saving}
                onInputChange={handleInputChange}
                onSubmit={(e) => {
                    handleAddCustomer(e).then(() => {
                        refreshCustomers();
                    });
                }}
                onClose={handleCloseForm}
            />

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
            />

            <ConfirmDialog
                show={confirmDialog.show}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </div>
    );
};

export default Customers;