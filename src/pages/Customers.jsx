import { FaPlus } from 'react-icons/fa';
import ConfirmDialog from '../components/CustomerComponents/ConfirmDialog';
import CustomerForm from '../components/CustomerComponents/CustomerForm';
import CustomerSearch from '../components/CustomerComponents/CustomerSearch';
import CustomerTable from '../components/CustomerComponents/CustomerTable';
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
        maxStart,
        
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
        handleScrollLeft,
        handleScrollRight,
        setSearchNumber
    } = useCustomers();

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className='items-center justify-center w-full flex flex-col mb-6'>
                <h1 className="text-3xl font-bold text-center mb-6">Customers</h1>
                {!showAddForm && (
                    <button
                        className="bg-[#4a90e2] items-center flex flex-row gap-2 cursor-pointer text-white px-8 py-1.5 rounded hover:bg-blue-400 transition"
                        onClick={handleOpenForm}
                    >
                        <FaPlus className='text-black text-lg' />
                        Add Customer
                    </button>
                )}
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
            />

            <CustomerTable
                customers={customers}
                columns={columns}
                visibleColumnStart={visibleColumnStart}
                columnsPerView={columnsPerView}
                maxStart={maxStart}
                loading={loading}
                error={error}
                onScrollLeft={handleScrollLeft}
                onScrollRight={handleScrollRight}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
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