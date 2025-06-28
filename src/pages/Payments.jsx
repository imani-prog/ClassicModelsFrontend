import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaDollarSign, FaEdit, FaFilter, FaList, FaPlus, FaTh, FaTrash, FaUsers } from 'react-icons/fa';
import { IoSearch } from 'react-icons/io5';

function Modal({ open, onClose, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white border border-blue-300 rounded-lg p-6 w-full max-w-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
                <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl" onClick={onClose} type="button">&times;</button>
                {children}
            </div>
        </div>
    );
}


const formatDate = (d) => {
    if (!d) return '';
    
    // Helper function to format dates as DD/MM/YYYY
    const formatDisplayDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date)) return '';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // If already in YYYY-MM-DD format, convert to DD/MM/YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        return formatDisplayDate(d);
    }

    // If it's an 8-digit number (YYYYMMDD), convert to DD/MM/YYYY
    if (/^\d{8}$/.test(String(d))) {
        const s = String(d);
        const isoDate = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
        return formatDisplayDate(isoDate);
    }
    
    // Try to parse as date and format as DD/MM/YYYY
    const dateObj = new Date(d);
    if (!isNaN(dateObj)) return formatDisplayDate(dateObj);
    return d;
};

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editPayment, setEditPayment] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState('');
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({ customerId: '', checkNo: '', amount: '', date: '' });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState('');
    const [addSuccess, setAddSuccess] = useState('');

    // New state for enhanced features
    const [viewMode, setViewMode] = useState('table'); // 'cards' or 'table'
    const [sortBy, setSortBy] = useState('customerId'); // 'customerId', 'amount', 'date'
    const [filterAmountMin, setFilterAmountMin] = useState('');
    const [filterAmountMax, setFilterAmountMax] = useState('');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [globalSearch, setGlobalSearch] = useState('');

    useEffect(() => {
        fetch('http://localhost:8081/payments')
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch payments");
                return res.json();
            })
            .then(data => {
                const mappedPayments = data.map(payment => ({
                    customerId: payment.id.customerNumber,
                    checkNo: payment.id.checkNumber,
                    amount: payment.amount,
                    date: payment.paymentDate
                }));
                setPayments(mappedPayments);
            })
            .catch(err => {
                console.error("Error fetching payments:", err);
            });
    }, []);

    // Enhanced filtering and sorting logic
    const filteredPayments = payments
        .filter(payment => {
            // Global search filter
            const searchMatch = !globalSearch || 
                String(payment.customerId).toLowerCase().includes(globalSearch.toLowerCase()) ||
                String(payment.checkNo).toLowerCase().includes(globalSearch.toLowerCase()) ||
                String(payment.amount).includes(globalSearch) ||
                formatDate(payment.date).toLowerCase().includes(globalSearch.toLowerCase());
            
            // Amount range filter
            const amountMatch = (!filterAmountMin || parseFloat(payment.amount) >= parseFloat(filterAmountMin)) &&
                               (!filterAmountMax || parseFloat(payment.amount) <= parseFloat(filterAmountMax));
            
            // Date range filter
            let dateMatch = true;
            if (filterDateFrom || filterDateTo) {
                const paymentDate = new Date(payment.date);
                if (filterDateFrom) {
                    const fromDate = new Date(filterDateFrom);
                    dateMatch = dateMatch && paymentDate >= fromDate;
                }
                if (filterDateTo) {
                    const toDate = new Date(filterDateTo);
                    dateMatch = dateMatch && paymentDate <= toDate;
                }
            }
            
            return searchMatch && amountMatch && dateMatch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'customerId':
                    return String(a.customerId).localeCompare(String(b.customerId));
                case 'amount':
                    return parseFloat(b.amount) - parseFloat(a.amount); // High to low
                case 'date':
                    return new Date(b.date) - new Date(a.date); // Most recent first
                default:
                    return 0;
            }
        });

    // Calculate statistics
    const totalPayments = payments.length;
    const totalAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    const uniqueCustomers = [...new Set(payments.map(payment => payment.customerId))].length;

    // Helper function to render payment card
    const renderPaymentCard = (payment, idx) => {
        return (
            <div key={`${payment.customerId}-${payment.checkNo}-${idx}`} className="bg-white border-2 border-[#42befb] rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex flex-col h-full">
                    <h2 className="text-xl font-bold text-center mb-3 text-blue-700">Payment #{payment.checkNo}</h2>
                    <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-3 gap-1 text-sm">
                            <span className="font-medium text-gray-600">Customer ID:</span>
                            <span className="col-span-2 font-semibold">{payment.customerId}</span>
                            
                            <span className="font-medium text-gray-600">Check No:</span>
                            <span className="col-span-2 font-semibold">{payment.checkNo}</span>
                            
                            <span className="font-medium text-gray-600">Amount:</span>
                            <span className="col-span-2 font-semibold text-green-600">Kshs {payment.amount}</span>
                            
                            <span className="font-medium text-gray-600">Date:</span>
                            <span className="col-span-2 font-semibold">{formatDate(payment.date)}</span>
                        </div>
                    </div>
                    <div className="flex justify-center gap-3 mt-4 pt-3 border-t">
                        <button
                            onClick={() => handleEditClick(payment)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded flex items-center gap-1 transition"
                        >
                            <FaEdit className="w-3 h-3" />
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(payment.customerId, payment.checkNo)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1 transition"
                            disabled={deleteLoading}
                        >
                            <FaTrash className="w-3 h-3" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Edit button handler
    const handleEditClick = (payment) => {
        setEditPayment({ ...payment });
        setEditError('');
        setEditModalOpen(true);
    };

    // Edit form input handler
    const handleEditInput = (e) => {
        const { name, value } = e.target;
        setEditPayment(prev => ({ ...prev, [name]: value }));
    };

    // Save changes handler
    const handleEditSave = (e) => {
        e.preventDefault();
        setEditLoading(true);
        setEditError('');
        setEditSuccess('');
        const payload = {
            id: {
                customerNumber: editPayment.customerId,
                checkNumber: editPayment.checkNo
            },
            amount: editPayment.amount,
            paymentDate: editPayment.date
        };
        fetch(`http://localhost:8081/payments/${editPayment.customerId}/${editPayment.checkNo}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to update payment');
                return res.json();
            })
            .then(updated => {
                setPayments(payments => payments.map(p =>
                    p.customerId === updated.id.customerNumber && p.checkNo === updated.id.checkNumber
                        ? {
                            customerId: updated.id.customerNumber,
                            checkNo: updated.id.checkNumber,
                            amount: updated.amount,
                            date: updated.paymentDate
                        }
                        : p
                ));
                setEditSuccess('Payment updated successfully.');
                setTimeout(() => {
                    setEditSuccess('');
                    setEditModalOpen(false);
                }, 1500);
            })
            .catch(err => setEditError(err.message))
            .finally(() => setEditLoading(false));
    };

    // Delete button handler
    const handleDelete = (customerId, checkNo) => {
        if (!window.confirm('Are you sure you want to delete this payment?')) return;
        setDeleteLoading(true);
        setDeleteError('');
        setDeleteSuccess('');
        fetch(`http://localhost:8081/payments/${customerId}/${checkNo}`, {
            method: 'DELETE'
        })
            .then(res => {
                if (!res.ok && res.status !== 204) throw new Error('Failed to delete payment');
                setPayments(payments => payments.filter(p => !(p.customerId === customerId && p.checkNo === checkNo)));
                setDeleteSuccess('Payment deleted successfully.');
                setTimeout(() => setDeleteSuccess(''), 2000);
            })
            .catch(err => setDeleteError(err.message))
            .finally(() => setDeleteLoading(false));
    };

    return (
        <div className="max-w-6xl mx-auto px-2 h-full flex flex-col pt-2">
            {/* Global Success/Error Messages */}
            {deleteSuccess && <div className="text-green-600 mb-2 text-center font-semibold">{deleteSuccess}</div>}
            {deleteError && <div className="text-red-500 mb-2 text-center font-semibold">{deleteError}</div>}
            
            {/* Header Section - Fixed height */}
            <div className='flex items-start justify-between mb-3 flex-shrink-0'>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold mb-1">Payments</h1>
                    <p className="text-gray-600 text-sm">Manage customer payments and transactions</p>
                </div>
                
                {/* Quick Stats */}
                <div className="flex gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-center">
                        <div className="flex items-center gap-2 text-blue-600">
                            <FaDollarSign className="text-lg" />
                            <div>
                                <div className="text-xl font-bold">{totalPayments}</div>
                                <div className="text-xs">Total Payments</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-center">
                        <div className="flex items-center gap-2 text-green-600">
                            <FaCalendarAlt className="text-lg" />
                            <div>
                                <div className="text-xl font-bold">Kshs {totalAmount.toLocaleString()}</div>
                                <div className="text-xs">Total Amount</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 text-center">
                        <div className="flex items-center gap-2 text-purple-600">
                            <FaUsers className="text-lg" />
                            <div>
                                <div className="text-xl font-bold">{uniqueCustomers}</div>
                                <div className="text-xs">Unique Customers</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Search Section - Fixed height */}
            <div className="mb-3 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                        {/* Global Search Input */}
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                placeholder="Search payments (Customer ID, Check No, Amount, Date)"
                                value={globalSearch}
                                onChange={e => setGlobalSearch(e.target.value)}
                                className="border-2 border-black bg-[#f5f5f5] rounded-md py-2 pl-10 pr-4 w-80"
                            />
                            <IoSearch className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-3 py-2 rounded border-2 transition ${
                                showFilters 
                                    ? 'bg-blue-100 border-blue-300 text-blue-700' 
                                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                            }`}
                            type="button"
                            title="Toggle Filters"
                        >
                            <FaFilter className="w-4 h-4" />
                            Filters
                        </button>

                        {/* Sort Dropdown */}
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="border-2 border-gray-300 bg-gray-100 rounded-md py-2 px-3 text-gray-700"
                            title="Sort By"
                        >
                            <option value="customerId">Sort by Customer ID</option>
                            <option value="amount">Sort by Amount (High to Low)</option>
                            <option value="date">Sort by Date (Recent First)</option>
                        </select>

                        {/* View Mode Toggle */}
                        <div className="flex items-center border-2 border-gray-300 rounded-md bg-gray-100">
                            <button
                                onClick={() => setViewMode('cards')}
                                className={`p-2 transition ${viewMode === 'cards' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                                type="button"
                                title="Card View"
                            >
                                <FaTh className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 transition ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                                type="button"
                                title="Table View"
                            >
                                <FaList className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { 
                                setAddModalOpen(true); 
                                setAddError(''); 
                                setAddSuccess(''); 
                                setAddForm({ customerId: '', checkNo: '', amount: '', date: '' }); 
                            }}
                            className="bg-[#4a90e2] items-center flex flex-row gap-2 cursor-pointer text-white px-6 py-2 rounded hover:bg-blue-400 transition"
                        >
                            <FaPlus className='text-black text-lg' />
                            Add Payment
                        </button>
                    </div>
                </div>

                {/* Collapsible Filters */}
                {showFilters && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount Range
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filterAmountMin}
                                        onChange={e => setFilterAmountMin(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md py-2 px-3 bg-white"
                                        step="0.01"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filterAmountMax}
                                        onChange={e => setFilterAmountMax(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md py-2 px-3 bg-white"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date Range
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={filterDateFrom}
                                        onChange={e => setFilterDateFrom(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md py-2 px-3 bg-white"
                                    />
                                    <input
                                        type="date"
                                        value={filterDateTo}
                                        onChange={e => setFilterDateTo(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md py-2 px-3 bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Counter */}
                {filteredPayments.length > 0 && (
                    <div className="text-sm text-gray-600 mb-2">
                        Showing {filteredPayments.length} of {payments.length} payments
                        {(globalSearch || filterAmountMin || filterAmountMax || filterDateFrom || filterDateTo) && (
                            <span className="ml-2 text-blue-600">
                                (filtered)
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Content Section - Flexible height */}
            <div className="flex-1 min-h-0 mb-2">
                {filteredPayments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <FaDollarSign className="text-6xl mb-4 text-gray-300" />
                        <h3 className="text-xl font-semibold mb-2">No payments found</h3>
                        <p className="text-center">
                            {payments.length === 0 
                                ? "No payments have been added yet. Click 'Add Payment' to create your first payment record."
                                : "No payments match your current filters. Try adjusting your search criteria or filters."
                            }
                        </p>
                    </div>
                ) : viewMode === 'cards' ? (
                    <div className="h-full overflow-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-2">
                            {filteredPayments.map((payment, idx) => renderPaymentCard(payment, idx))}
                        </div>
                    </div>
                ) : (
                    <div className="h-full overflow-auto">
                        <table className="w-full border border-blue-300 text-sm">
                            <thead className="bg-gray-100 border-b-2 border-[#258cbf] sticky top-0 z-10">
                                <tr>
                                    <th className="px-2 py-1 text-center">Customer ID</th>
                                    <th className="px-2 py-1 text-center">Check No</th>
                                    <th className="px-2 py-1 text-center">Amount</th>
                                    <th className="px-2 py-1 text-center">Date</th>
                                    <th className="px-2 py-1 text-center sticky right-0 bg-gray-100">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.map((payment, idx) => (
                                    <tr key={`${payment.customerId}-${payment.checkNo}-${idx}`} className="hover:bg-gray-50">
                                        <td className="border-t font-medium text-center border-[#42befb] px-2 py-1">{payment.customerId}</td>
                                        <td className="border-t font-medium text-center border-[#42befb] px-2 py-1">{payment.checkNo}</td>
                                        <td className="border-t font-medium text-center border-[#42befb] px-2 py-1">Kshs {payment.amount}</td>
                                        <td className="border-t font-medium text-center border-[#42befb] px-2 py-1">{formatDate(payment.date)}</td>
                                        <td className="border-t font-medium text-center border-[#42befb] px-2 py-1 sticky right-0 bg-white">
                                            <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded mr-2" onClick={() => handleEditClick(payment)}>
                                                <FaEdit className="w-3 h-3 inline mr-1" />
                                                Edit
                                            </button>
                                            <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded" onClick={() => handleDelete(payment.customerId, payment.checkNo)} disabled={deleteLoading}>
                                                <FaTrash className="w-3 h-3 inline mr-1" />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
                {editPayment && (
                    <form onSubmit={handleEditSave}>
                        <h2 className="text-xl font-bold mb-4">Edit Payment</h2>
                        {editError && <div className="text-red-500 mb-2">{editError}</div>}
                        {editSuccess && <div className="text-green-600 mb-2">{editSuccess}</div>}
                        <div className="grid grid-cols-2 gap-3 items-center">
                            <label className="font-medium text-gray-700">Customer ID:</label>
                            <input name="customerId" value={editPayment.customerId} onChange={handleEditInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" readOnly />
                            
                            <label className="font-medium text-gray-700">Check No:</label>
                            <input name="checkNo" value={editPayment.checkNo} onChange={handleEditInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" readOnly />
                            
                            <label className="font-medium text-gray-700">Amount:</label>
                            <input name="amount" value={editPayment.amount} onChange={handleEditInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" type="number" step="0.01" />
                            
                            <label className="font-medium text-gray-700">Date:</label>
                            <input name="date" value={editPayment.date} onChange={handleEditInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" type="date" />
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button type="submit" disabled={editLoading} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                                {editLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button type="button" onClick={() => setEditModalOpen(false)} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition">Close</button>
                        </div>
                    </form>
                )}
            </Modal>
            <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)}>
                <form onSubmit={e => {
                    e.preventDefault();
                    setAddLoading(true);
                    setAddError('');
                    setAddSuccess('');
                    const payload = {
                        id: {
                            customerNumber: addForm.customerId,
                            checkNumber: addForm.checkNo
                        },
                        amount: addForm.amount,
                        paymentDate: addForm.date
                    };
                    fetch('http://localhost:8081/payments/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    })
                        .then(res => {
                            if (!res.ok) throw new Error('Failed to add payment');
                            return res.json();
                        })
                        .then(added => {
                            setPayments(payments => [
                                {
                                    customerId: added.id.customerNumber,
                                    checkNo: added.id.checkNumber,
                                    amount: added.amount,
                                    date: added.paymentDate
                                },
                                ...payments
                            ]);
                            setAddSuccess('Payment added successfully.');
                            setTimeout(() => {
                                setAddSuccess('');
                                setAddModalOpen(false);
                            }, 1500);
                        })
                        .catch(err => setAddError(err.message))
                        .finally(() => setAddLoading(false));
                }}>
                    <h2 className="text-xl font-bold mb-4">Add Payment</h2>
                    {addError && <div className="text-red-500 mb-2">{addError}</div>}
                    {addSuccess && <div className="text-green-600 mb-2">{addSuccess}</div>}
                    <div className="grid grid-cols-2 gap-3 items-center">
                        <label className="font-medium text-gray-700">Customer ID:</label>
                        <input name="customerId" value={addForm.customerId} onChange={e => setAddForm(f => ({ ...f, customerId: e.target.value }))} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Check No:</label>
                        <input name="checkNo" value={addForm.checkNo} onChange={e => setAddForm(f => ({ ...f, checkNo: e.target.value }))} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Amount:</label>
                        <input name="amount" value={addForm.amount} onChange={e => setAddForm(f => ({ ...f, amount: e.target.value }))} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" type="number" step="0.01" />
                        
                        <label className="font-medium text-gray-700">Date:</label>
                        <input name="date" value={addForm.date} onChange={e => setAddForm(f => ({ ...f, date: e.target.value }))} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" type="date" />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button type="submit" disabled={addLoading} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                            {addLoading ? 'Saving...' : 'Save Payment'}
                        </button>
                        <button type="button" onClick={() => setAddModalOpen(false)} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition">Close</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Payments;
