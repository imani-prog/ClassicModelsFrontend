import ConfirmDialog from '../components/CustomerComponents/ConfirmDialog';
import CustomerForm from '../components/CustomerComponents/CustomerForm';
import CustomerSearch from '../components/CustomerComponents/CustomerSearch';
import CustomerTable from '../components/CustomerComponents/CustomerTable';
import Pagination from '../components/CustomerComponents/Pagination';
import Toast from '../components/CustomerComponents/Toast';
import useCustomers from '../hooks/useCustomers';

const Customers = () => {
    const {
        // State
        customers,
        loading,
        error,
        showAddForm,
        form,
        editMode,
        saving,
        searchNumber,
        searchResult,
        searchError,
        searchEditMode,
        toast,
        confirmDialog,
        visibleColumnStart,
        columns,
        columnsPerView,
        
        // Pagination state
        currentPage,
        totalPages,
        totalCustomers,
        itemsPerPage,
        
        // Actions
        handleInputChange,
        handleAddCustomer,
        handleEditClick,
        handleDeleteClick,
        confirmDelete,
        cancelDelete,
        handleCloseForm,
        handleOpenForm,
        handleSearch,
        handleSearchEditClick,
        handleSearchInputChange,
        handleSearchSave,
        handleSearchClose,
        setSearchNumber,
        
        // Pagination actions
        handlePageChange,
        handleNextPage,
        handlePrevPage,
        handleFirstPage,
        handleLastPage,
        
        // Bulk selection
        selectedCustomers,
        handleSelectCustomer,
        handleSelectAllCustomers,
        handleBulkDelete
    } = useCustomers();

    return (
        <div className="max-w-6xl mx-auto px-2 h-full flex flex-col pt-2">
            {/* Header Section - Fixed height */}
            <div className='flex items-start justify-start mb-3 flex-shrink-0'>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold mb-1">Customers</h1>
                    <p className="text-gray-600 text-sm">Manage your customer database and information</p>
                </div>
            </div>
            
            {/* Search Section - Fixed height */}
            <div className="mb-3 flex-shrink-0">
                <CustomerSearch
                    searchNumber={searchNumber}
                    searchResult={searchResult}
                    searchError={searchError}
                    searchEditMode={searchEditMode}
                    onSearchNumberChange={(e) => setSearchNumber(e.target.value)}
                    onSearch={handleSearch}
                    onSearchInputChange={handleSearchInputChange}
                    onSearchEditClick={handleSearchEditClick}
                    onSearchSave={handleSearchSave}
                    onSearchClose={handleSearchClose}
                    showAddForm={showAddForm}
                    onOpenForm={handleOpenForm}
                    selectedCustomers={selectedCustomers}
                    onBulkDelete={handleBulkDelete}
                />
            </div>

            {/* Table Section - Flexible height */}
            <div className="flex-1 min-h-0 mb-2">
                <CustomerTable
                    customers={customers}
                    columns={columns}
                    visibleColumnStart={visibleColumnStart}
                    columnsPerView={columnsPerView}
                    loading={loading}
                    error={error}
                    onEditClick={handleEditClick}
                    onDeleteClick={handleDeleteClick}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    selectedCustomers={selectedCustomers}
                    onSelectCustomer={handleSelectCustomer}
                    onSelectAllCustomers={handleSelectAllCustomers}
                />
            </div>

            {/* Pagination Section - Fixed height */}
            <div className="flex-shrink-0">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCustomers={totalCustomers}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onNextPage={handleNextPage}
                    onPrevPage={handlePrevPage}
                    onFirstPage={handleFirstPage}
                    onLastPage={handleLastPage}
                />
            </div>

            <CustomerForm
                showForm={showAddForm}
                form={form}
                editMode={editMode}
                saving={saving}
                onInputChange={handleInputChange}
                onSubmit={handleAddCustomer}
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