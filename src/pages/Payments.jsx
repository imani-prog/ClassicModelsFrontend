import { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';

function Modal({ open, onClose, children }) {
    if (!open) return null;
    return (
        <>
            <div className="fixed inset-0 z-40  bg-opacity-30" style={{ left: '220px', pointerEvents: 'auto' }}></div>
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white border border-blue-300 rounded-lg p-6 w-full max-w-md shadow-md relative">
                    <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl" onClick={onClose} type="button">&times;</button>
                    {children}
                </div>
            </div>
        </>
    );
}


const formatDate = (d) => {
    if (!d) return '';
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;

    if (/^\d{8}$/.test(String(d))) {
        const s = String(d);
        return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
    }
    
    const dateObj = new Date(d);
    if (!isNaN(dateObj)) return dateObj.toLocaleDateString();
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
    const [searchCustomerId, setSearchCustomerId] = useState('');
    const [searchCheckNo, setSearchCheckNo] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searchError, setSearchError] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);

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
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className='items-center justify-center w-full flex flex-col mb-6'>
                <h1 className="text-3xl font-bold text-center mb-6">Payments</h1>
                <button className="bg-[#4a90e2] flex flex-row gap-2 items-center cursor-pointer text-white px-8 py-1.5 
                           rounded hover:bg-blue-400 transition" onClick={() => { setAddModalOpen(true); setAddError(''); setAddSuccess(''); setAddForm({ customerId: '', checkNo: '', amount: '', date: '' }); }}>
                    <FaPlus className='text-black text-lg' />
                    Add Payment
                </button>
            </div>
            <div className="flex items-center justify-between mb-4">
                <form className="flex gap-2 items-center" onSubmit={e => {
                    e.preventDefault();
                    setSearchError('');
                    setSearchResult(null);
                    if (!searchCustomerId.trim() && !searchCheckNo.trim()) {
                        setSearchError('Enter Customer ID or Check No');
                        return;
                    }
                    setSearchLoading(true);
                    if (searchCustomerId.trim() && searchCheckNo.trim()) {
                        // Search by both (exact match)
                        fetch(`http://localhost:8081/payments/${searchCustomerId.trim()}/${searchCheckNo.trim()}`)
                            .then(res => {
                                if (!res.ok) throw new Error('Payment not found');
                                return res.json();
                            })
                            .then(data => {
                                setSearchResult([
                                    {
                                        customerId: data.id.customerNumber,
                                        checkNo: data.id.checkNumber,
                                        amount: data.amount,
                                        date: data.paymentDate
                                    }
                                ]);
                                setShowSearchModal(true);
                            })
                            .catch(err => setSearchError(err.message))
                            .finally(() => setSearchLoading(false));
                    } else if (searchCustomerId.trim()) {
                        // Filter all payments by customerId
                        fetch('http://localhost:8081/payments')
                            .then(res => {
                                if (!res.ok) throw new Error('Failed to fetch payments');
                                return res.json();
                            })
                            .then(data => {
                                const matches = data.filter(p => String(p.id.customerNumber) === searchCustomerId.trim())
                                    .map(payment => ({
                                        customerId: payment.id.customerNumber,
                                        checkNo: payment.id.checkNumber,
                                        amount: payment.amount,
                                        date: payment.paymentDate
                                    }));
                                if (matches.length === 0) throw new Error('No payments found for this Customer ID');
                                setSearchResult(matches);
                                setShowSearchModal(true);
                            })
                            .catch(err => setSearchError(err.message))
                            .finally(() => setSearchLoading(false));
                    } else if (searchCheckNo.trim()) {
                        // Filter all payments by checkNo
                        fetch('http://localhost:8081/payments')
                            .then(res => {
                                if (!res.ok) throw new Error('Failed to fetch payments');
                                return res.json();
                            })
                            .then(data => {
                                const matches = data.filter(p => String(p.id.checkNumber) === searchCheckNo.trim())
                                    .map(payment => ({
                                        customerId: payment.id.customerNumber,
                                        checkNo: payment.id.checkNumber,
                                        amount: payment.amount,
                                        date: payment.paymentDate
                                    }));
                                if (matches.length === 0) throw new Error('No payments found for this Check No');
                                setSearchResult(matches);
                                setShowSearchModal(true);
                            })
                            .catch(err => setSearchError(err.message))
                            .finally(() => setSearchLoading(false));
                    }
                }}>
                    <input
                        type="text"
                        placeholder="Customer ID"
                        value={searchCustomerId}
                        onChange={e => setSearchCustomerId(e.target.value)}
                        className="border-2 border-black bg-[#f5f5f5] rounded-md py-2 pl-3 pr-2 w-32"
                    />
                    <input
                        type="text"
                        placeholder="Check No"
                        value={searchCheckNo}
                        onChange={e => setSearchCheckNo(e.target.value)}
                        className="border-2 border-black bg-[#f5f5f5] rounded-md py-2 pl-3 pr-2 w-32"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                        disabled={searchLoading}
                    >
                        {searchLoading ? 'Searching...' : 'Search'}
                    </button>
                </form>
                {searchError && <div className="text-red-500 ml-4">{searchError}</div>}
            </div>
            {deleteError && <div className="text-red-500 mb-2">{deleteError}</div>}
            {deleteSuccess && <div className="text-green-600 mb-2">{deleteSuccess}</div>}
            <table className="w-full border overflow-x-scroll border-blue-300">
                <thead className="bg-[#f5f5f5] border-b-2 border-[#258cbf]">
                    <tr>
                        <th className="px-4 py-2 text-center whitespace-nowrap">Customer ID</th>
                        <th className="px-4 py-2 text-center whitespace-nowrap">Check No</th>
                        <th className="px-4 py-2 text-center whitespace-nowrap">Amount</th>
                        <th className="px-4 py-2 text-center whitespace-nowrap">Date</th>
                        <th className="px-4 py-2 text-center whitespace-nowrap">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((payment, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                            <td className="border-t-2 font-medium text-center border-[#42befb] px-4 py-2 whitespace-nowrap">{payment.customerId}</td>
                            <td className="border-t-2 font-medium text-center border-[#42befb] px-4 py-2 whitespace-nowrap">{payment.checkNo}</td>
                            <td className="border-t-2 font-medium text-center border-[#42befb] px-4 py-2 whitespace-nowrap">Kshs {payment.amount}</td>
                            <td className="border-t-2 font-medium text-center border-[#42befb] px-4 py-2 whitespace-nowrap">{formatDate(payment.date)}</td>
                            <td className="border-t-2 font-medium text-center border-[#42befb] px-4 py-2 whitespace-nowrap">
                                <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded mr-2" onClick={() => handleEditClick(payment)}>Edit</button>
                                <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded" onClick={() => handleDelete(payment.customerId, payment.checkNo)} disabled={deleteLoading}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
                {editPayment && (
                    <form onSubmit={handleEditSave}>
                        <h2 className="text-xl font-bold mb-4">Edit Payment</h2>
                        {editError && <div className="text-red-500 mb-2">{editError}</div>}
                        {editSuccess && <div className="text-green-600 mb-2">{editSuccess}</div>}
                        <div className="grid grid-cols-2 gap-2 items-center">
                            <span className="font-semibold text-right pr-2">Customer ID:</span>
                            <input name="customerId" value={editPayment.customerId} onChange={handleEditInput} required className="border p-2 rounded w-full" readOnly />
                            <span className="font-semibold text-right pr-2">Check No:</span>
                            <input name="checkNo" value={editPayment.checkNo} onChange={handleEditInput} required className="border p-2 rounded w-full" readOnly />
                            <span className="font-semibold text-right pr-2">Amount:</span>
                            <input name="amount" value={editPayment.amount} onChange={handleEditInput} required className="border p-2 rounded w-full" type="number" step="0.01" />
                            <span className="font-semibold text-right pr-2">Date:</span>
                            <input name="date" value={editPayment.date} onChange={handleEditInput} required className="border p-2 rounded w-full" placeholder="Date (YYYY-MM-DD)" type="date" />
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
                    <div className="grid grid-cols-2 gap-2 items-center">
                        <span className="font-semibold text-right pr-2">Customer ID:</span>
                        <input name="customerId" value={addForm.customerId} onChange={e => setAddForm(f => ({ ...f, customerId: e.target.value }))} required className="border p-2 rounded w-full" />
                        <span className="font-semibold text-right pr-2">Check No:</span>
                        <input name="checkNo" value={addForm.checkNo} onChange={e => setAddForm(f => ({ ...f, checkNo: e.target.value }))} required className="border p-2 rounded w-full" />
                        <span className="font-semibold text-right pr-2">Amount:</span>
                        <input name="amount" value={addForm.amount} onChange={e => setAddForm(f => ({ ...f, amount: e.target.value }))} required className="border p-2 rounded w-full" type="number" step="0.01" />
                        <span className="font-semibold text-right pr-2">Date:</span>
                        <input name="date" value={addForm.date} onChange={e => setAddForm(f => ({ ...f, date: e.target.value }))} required className="border p-2 rounded w-full" placeholder="Date (YYYY-MM-DD)" type="date" />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button type="submit" disabled={addLoading} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                            {addLoading ? 'Saving...' : 'Save Payment'}
                        </button>
                        <button type="button" onClick={() => setAddModalOpen(false)} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition">Close</button>
                    </div>
                </form>
            </Modal>
            <Modal open={showSearchModal} onClose={() => setShowSearchModal(false)}>
                {searchResult && Array.isArray(searchResult) && searchResult.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Payment Details</h2>
                        <table className="w-full border border-blue-300 mb-4">
                            <thead className="bg-[#f5f5f5] border-b-2 border-[#258cbf]">
                                <tr>
                                    <th className="px-4 py-2 text-center whitespace-nowrap">Customer ID</th>
                                    <th className="px-4 py-2 text-center whitespace-nowrap">Check No</th>
                                    <th className="px-4 py-2 text-center whitespace-nowrap">Amount</th>
                                    <th className="px-4 py-2 text-center whitespace-nowrap">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {searchResult.map((result, idx) => (
                                    <tr key={idx}>
                                        <td className="border-t-2 text-center border-[#42befb] px-4 py-2 whitespace-nowrap">{result.customerId}</td>
                                        <td className="border-t-2 text-center border-[#42befb] px-4 py-2 whitespace-nowrap">{result.checkNo}</td>
                                        <td className="border-t-2 text-center border-[#42befb] px-4 py-2 whitespace-nowrap">Kshs {result.amount}</td>
                                        <td className="border-t-2 text-center border-[#42befb] px-4 py-2 whitespace-nowrap">{formatDate(result.date)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex gap-2 mt-4">
                            <button type="button" onClick={() => setShowSearchModal(false)} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition">Close</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Payments;
