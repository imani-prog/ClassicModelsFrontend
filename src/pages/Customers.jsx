import { useEffect, useRef, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { IoSearch } from 'react-icons/io5';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editCustomerId, setEditCustomerId] = useState(null);
    const [form, setForm] = useState({
        customerName: '',
        contactLastName: '',
        contactFirstName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        creditLimit: '',
        salesRepEmployeeNumber: ''
    });
    const [searchNumber, setSearchNumber] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searchError, setSearchError] = useState('');
    const [searchEditMode, setSearchEditMode] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const toastTimeout = useRef(null);
    const [confirmDialog, setConfirmDialog] = useState({ show: false, customerId: null });
    const [visibleColumnStart, setVisibleColumnStart] = useState(0);

    const columns = [
        { key: 'customerName', label: 'Customer Name' },
        { key: 'id', label: 'Customer Number' },
        { key: 'contactFirstName', label: 'Contact First Name' },
        { key: 'contactLastName', label: 'Contact Last Name' },
        { key: 'phone', label: 'Phone' },
        { key: 'addressLine1', label: 'Address Line 1' },
        { key: 'addressLine2', label: 'Address Line 2' },
        { key: 'city', label: 'City' },
        { key: 'state', label: 'State' },
        { key: 'country', label: 'Country' },
        { key: 'postalCode', label: 'Postal Code' },
        { key: 'creditLimit', label: 'Credit Limit' },
        { key: 'salesRepEmployeeNumber', label: 'Sales Rep Employee Number' }
    ];
    const columnsPerView = 13;
    const maxStart = columns.length - columnsPerView;

    const fetchCustomers = () => {
        setLoading(true);
        fetch('http://localhost:8081/customers')
            .then((res) => res.json())
            .then((data) => {
                setCustomers(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        toastTimeout.current = setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditClick = (customer) => {
        setForm({
            customerName: customer.customerName || '',
            contactLastName: customer.contactLastName || '',
            contactFirstName: customer.contactFirstName || '',
            phone: customer.phone || '',
            addressLine1: customer.addressLine1 || '',
            addressLine2: customer.addressLine2 || '',
            city: customer.city || '',
            state: customer.state || '',
            postalCode: customer.postalCode || '',
            country: customer.country || '',
            creditLimit: customer.creditLimit || '',
            salesRepEmployeeNumber: customer.salesRepEmployeeNumber ? customer.salesRepEmployeeNumber.id : ''
        });
        setEditCustomerId(customer.id);
        setEditMode(true);
        setShowAddForm(true);
    };

    const handleDeleteClick = (customerId) => {
        setConfirmDialog({ show: true, customerId });
    };

    const confirmDelete = () => {
        const customerId = confirmDialog.customerId;
        setConfirmDialog({ show: false, customerId: null });
        fetch(`http://localhost:8081/customers/${customerId}`, {
            method: 'DELETE'
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to delete customer');
                showToast('Customer deleted successfully!', 'success');
                fetchCustomers();
            })
            .catch((err) => {
                showToast(err.message, 'error');
            });
    };

    const cancelDelete = () => {
        setConfirmDialog({ show: false, customerId: null });
    };

    const handleAddCustomer = (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = {
            ...form,
            creditLimit: form.creditLimit ? parseFloat(form.creditLimit) : null,
            salesRepEmployeeNumber: form.salesRepEmployeeNumber ? { id: parseInt(form.salesRepEmployeeNumber) } : null
        };
        let url = 'http://localhost:8081/customers/save';
        let method = 'POST';
        if (editMode && editCustomerId) {
            url = `http://localhost:8081/customers/${editCustomerId}`;
            method = 'PUT';
        }
        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to save customer');
                return res.json();
            })
            .then(() => {
                setShowAddForm(false);
                setEditMode(false);
                setEditCustomerId(null);
                setForm({
                    customerName: '',
                    contactLastName: '',
                    contactFirstName: '',
                    phone: '',
                    addressLine1: '',
                    addressLine2: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: '',
                    creditLimit: '',
                    salesRepEmployeeNumber: ''
                });
                fetchCustomers();
                showToast(editMode ? 'Customer updated successfully!' : 'Customer added successfully!', 'success');
            })
            .catch((err) => {
                showToast(err.message, 'error');
            })
            .finally(() => setSaving(false));
    };

    const handleSearch = () => {
        setSearchError('');
        setSearchResult(null);
        if (!searchNumber) return;
        fetch(`http://localhost:8081/customers/${searchNumber}`)
            .then(res => {
                if (!res.ok) throw new Error('Customer not found');
                return res.json();
            })
            .then(data => {
                setSearchResult(data);
                setSearchEditMode(false);
            })
            .catch(err => {
                setSearchError(err.message);
            });
    };

    const handleSearchEditClick = () => {
        setSearchEditMode(true);
    };

    const handleSearchInputChange = (e) => {
        const { name, value } = e.target;
        setSearchResult(prev => ({ ...prev, [name]: value }));
    };

    const handleSearchSave = (e) => {
        e.preventDefault();
        fetch(`http://localhost:8081/customers/${searchResult.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...searchResult,
                creditLimit: searchResult.creditLimit ? parseFloat(searchResult.creditLimit) : null,
                salesRepEmployeeNumber: searchResult.salesRepEmployeeNumber ? { id: parseInt(searchResult.salesRepEmployeeNumber.id || searchResult.salesRepEmployeeNumber) } : null
            })
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to save changes');
                return res.json();
            })
            .then(() => {
                setSearchEditMode(false);
                fetchCustomers();
                showToast('Customer updated successfully!', 'success');
            })
            .catch(err => {
                showToast(err.message, 'error');
            });
    };

    const handleScrollLeft = () => {
        setVisibleColumnStart((prev) => Math.max(0, prev - columnsPerView));
    };

    const handleScrollRight = () => {
        setVisibleColumnStart((prev) => Math.min(maxStart, prev + columnsPerView));
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className='items-center justify-center w-full flex flex-col mb-6'>
                <h1 className="text-3xl font-bold text-center mb-6">Customers</h1>
                {!showAddForm && (
                    <button
                        className="bg-[#4a90e2] items-center flex flex-row gap-2 cursor-pointer text-white px-8 py-1.5 rounded hover:bg-blue-400 transition"
                        onClick={() => { setShowAddForm(true); setEditMode(false); setEditCustomerId(null); }}
                    >
                        <FaPlus className='text-black text-lg' />
                        Add Customer
                    </button>
                )}
            </div>
            {showAddForm && (
                <div className="w-full flex items-center justify-center mb-8">
                    <form onSubmit={handleAddCustomer} className="relative bg-white border border-blue-300 rounded-lg p-6 w-full max-w-xl shadow-md flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={() => { setShowAddForm(false); setEditMode(false); setEditCustomerId(null); }}
                            className="absolute top-2 right-2 text-gray-500 hover:text-red-600 transition-colors text-2xl"
                            title="Close"
                        >
                            <IoMdClose />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="customerName" value={form.customerName} onChange={handleInputChange} required placeholder="Customer Name" className="border p-2 rounded" />
                            <input name="contactFirstName" value={form.contactFirstName} onChange={handleInputChange} required placeholder="Contact First Name" className="border p-2 rounded" />
                            <input name="contactLastName" value={form.contactLastName} onChange={handleInputChange} required placeholder="Contact Last Name" className="border p-2 rounded" />
                            <input name="phone" value={form.phone} onChange={handleInputChange} required placeholder="Phone" className="border p-2 rounded" />
                            <input name="addressLine1" value={form.addressLine1} onChange={handleInputChange} required placeholder="Address Line 1" className="border p-2 rounded" />
                            <input name="addressLine2" value={form.addressLine2} onChange={handleInputChange} placeholder="Address Line 2" className="border p-2 rounded" />
                            <input name="city" value={form.city} onChange={handleInputChange} required placeholder="City" className="border p-2 rounded" />
                            <input name="state" value={form.state} onChange={handleInputChange} placeholder="State" className="border p-2 rounded" />
                            <input name="postalCode" value={form.postalCode} onChange={handleInputChange} placeholder="Postal Code" className="border p-2 rounded" />
                            <input name="country" value={form.country} onChange={handleInputChange} required placeholder="Country" className="border p-2 rounded" />
                            <input name="creditLimit" value={form.creditLimit} onChange={handleInputChange} placeholder="Credit Limit" className="border p-2 rounded" type="number" min="0" step="0.01" />
                            <input name="salesRepEmployeeNumber" value={form.salesRepEmployeeNumber} onChange={handleInputChange} placeholder="Sales Rep Employee Number" className="border p-2 rounded" type="number" min="0" />
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button type="submit" disabled={saving} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                                {saving ? (editMode ? 'Saving...' : 'Saving...') : (editMode ? 'Save Changes' : 'Save Customer')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            <div className="flex items-center justify-between mb-4">
                <div className="relative flex gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Search by customer number"
                        value={searchNumber}
                        onChange={e => setSearchNumber(e.target.value)}
                        className="border-2 border-black bg-[#f5f5f5] rounded-md py-2 pl-13 pr-4"
                    />
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                        onClick={handleSearch}
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
                <form onSubmit={handleSearchSave} className="relative bg-white border border-blue-300 rounded-lg p-6 mb-6 shadow-md flex flex-col gap-3 max-w-xl mx-auto">
                    <button
                        type="button"
                        onClick={() => { setSearchResult(null); setSearchEditMode(false); setSearchError(''); }}
                        className="absolute top-2 right-2 text-gray-500 hover:text-red-600 transition-colors text-2xl"
                        title="Close"
                    >
                        <IoMdClose />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="customerName" value={searchResult.customerName || ''} onChange={searchEditMode ? handleSearchInputChange : undefined} disabled={!searchEditMode} required placeholder="Customer Name" className="border p-2 rounded" />
                        <input name="contactFirstName" value={searchResult.contactFirstName || ''} onChange={searchEditMode ? handleSearchInputChange : undefined} disabled={!searchEditMode} required placeholder="Contact First Name" className="border p-2 rounded" />
                        <input name="contactLastName" value={searchResult.contactLastName || ''} onChange={searchEditMode ? handleSearchInputChange : undefined} disabled={!searchEditMode} required placeholder="Contact Last Name" className="border p-2 rounded" />
                        <input name="phone" value={searchResult.phone || ''} onChange={searchEditMode ? handleSearchInputChange : undefined} disabled={!searchEditMode} required placeholder="Phone" className="border p-2 rounded" />
                        <input name="addressLine1" value={searchResult.addressLine1 || ''} onChange={searchEditMode ? handleSearchInputChange : undefined} disabled={!searchEditMode} required placeholder="Address Line 1" className="border p-2 rounded" />
                        <input name="addressLine2" value={searchResult.addressLine2 || ''} onChange={searchEditMode ? handleSearchInputChange : undefined} disabled={!searchEditMode} placeholder="Address Line 2" className="border p-2 rounded" />
                        <input name="city" value={searchResult.city || ''} onChange={searchEditMode ? handleSearchInputChange : undefined} disabled={!searchEditMode} required placeholder="City" className="border p-2 rounded" />
                        <input name="state" value={searchResult.state || ''} onChange={searchEditMode ? handleSearchInputChange : undefined} disabled={!searchEditMode} placeholder="State" className="border p-2 rounded" />
                        <input name="postalCode" value={searchResult.postalCode || ''} onChange={searchEditMode ? handleSearchInputChange : undefined} disabled={!searchEditMode} placeholder="Postal Code" className="border p-2 rounded" />
                        <input name="country" value={searchResult.country || ''} onChange={searchEditMode ? handleSearchInputChange : undefined} disabled={!searchEditMode} required placeholder="Country" className="border p-2 rounded" />
                        <input name="creditLimit" value={searchResult.creditLimit || ''} onChange={searchEditMode ? handleSearchInputChange : undefined} disabled={!searchEditMode} placeholder="Credit Limit" className="border p-2 rounded" type="number" min="0" step="0.01" />
                        <input name="salesRepEmployeeNumber" value={searchResult.salesRepEmployeeNumber ? (searchResult.salesRepEmployeeNumber.id || searchResult.salesRepEmployeeNumber) : ''} onChange={searchEditMode ? handleSearchInputChange : undefined} disabled={!searchEditMode} placeholder="Sales Rep Employee Number" className="border p-2 rounded" type="number" min="0" />
                    </div>
                    <div className="flex gap-2 mt-4">
                        {!searchEditMode && (
                            <button type="button" className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded" onClick={handleSearchEditClick}>
                                Edit
                            </button>
                        )}
                        {searchEditMode && (
                            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                                Save Changes
                            </button>
                        )}
                    </div>
                </form>
            )}
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <div className="relative w-full overflow-x-hidden">
                    <div className="flex justify-end mb-2 gap-2">
                        <button onClick={handleScrollLeft} disabled={visibleColumnStart === 0} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">{'<'}</button>
                        <button onClick={handleScrollRight} disabled={visibleColumnStart >= maxStart} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">{'>'}</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border border-blue-300 min-w-max">
                            <thead className="bg-[#f5f5f5] border-b-2 border-[#258cbf]">
                                <tr>
                                    {columns.slice(visibleColumnStart, visibleColumnStart + columnsPerView).map((col) => (
                                        <th key={col.key} className="px-2 py-1 text-center whitespace-nowrap">{col.label}</th>
                                    ))}
                                    <th className="px-2 py-1 text-center whitespace-nowrap sticky right-0 bg-[#f5f5f5] z-10">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        {columns.slice(visibleColumnStart, visibleColumnStart + columnsPerView).map((col) => (
                                            <td key={col.key} className="border-t-2 font-medium text-center border-[#42befb] px-2 py-1 whitespace-nowrap">{
                                                col.key === 'salesRepEmployeeNumber'
                                                    ? (customer.salesRepEmployeeNumber ? customer.salesRepEmployeeNumber.id : '')
                                                    : customer[col.key]
                                            }</td>
                                        ))}
                                        <td className="border-t-2 font-medium text-center border-[#42befb] px-2 py-1 whitespace-nowrap sticky right-0 bg-white z-10">
                                            <button
                                                className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                                                onClick={() => handleEditClick(customer)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                                                onClick={() => handleDeleteClick(customer.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {toast.show && (
                <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded shadow-lg text-white transition-all ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {toast.message}
                </div>
            )}
            {confirmDialog.show && (
                <>
                    <div className="fixed inset-0 z-40 bg-gray-200 opacity-60 cursor-not-allowed"></div>
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm flex flex-col items-center">
                            <p className="mb-4 text-lg font-semibold text-gray-800">Are you sure you want to delete this customer?</p>
                            <div className="flex gap-4">
                                <button onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Delete</button>
                                <button onClick={cancelDelete} className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded">Cancel</button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default Customers