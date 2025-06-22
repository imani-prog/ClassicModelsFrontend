import { useEffect, useState } from 'react';
import { IoSearch } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

function Modal({ open, onClose, children }) {
    if (!open) return null;
    return (
        <>
            {/* Overlay with white translucent opacity, not covering sidebar (assume sidebar width 220px) */}
            <div className="fixed inset-0 z-40  bg-opacity-50" style={{ left: '220px', pointerEvents: 'auto' }}></div>
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white border border-blue-300 rounded-lg p-6 w-full max-w-md shadow-md relative">
                    <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl" onClick={onClose} type="button">&times;</button>
                    {children}
                </div>
            </div>
        </>
    );
}

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [addForm, setAddForm] = useState({
        customerNumber: '',
        orderDate: '',
        requiredDate: '',
        shippedDate: '',
        status: '',
        comments: ''
    });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState('');
    const [addSuccess, setAddSuccess] = useState('');
    const [searchId, setSearchId] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searchError, setSearchError] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        fetch('http://localhost:8081/orders')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch orders');
                return res.json();
            })
            .then(data => {
                setOrders(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    // Add order handler
    const handleAddInput = (e) => {
        const { name, value } = e.target;
        setAddForm(prev => ({ ...prev, [name]: value }));
    };
    const handleAddSave = (e) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError('');
        setAddSuccess('');
        fetch('http://localhost:8081/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(addForm)
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to add order');
                return res.json();
            })
            .then(() => {
                setAddSuccess('Order added successfully.');
                setShowAdd(false);
                setAddForm({
                    customerNumber: '',
                    orderDate: '',
                    requiredDate: '',
                    shippedDate: '',
                    status: '',
                    comments: ''
                });
                setTimeout(() => setAddSuccess(''), 3000);
                // Refresh orders
                setLoading(true);
                fetch('http://localhost:8081/orders')
                    .then(res => res.json())
                    .then(data => setOrders(data))
                    .finally(() => setLoading(false));
            })
            .catch(err => {
                setAddError(err.message);
            })
            .finally(() => setAddLoading(false));
    };

    // Search order handler
    const handleSearch = () => {
        setSearchError('');
        setSearchResult(null);
        setIsEditing(false);
        if (!searchId.trim()) {
            setSearchError('Please enter an Order ID.');
            return;
        }
        setSearchLoading(true);
        fetch(`http://localhost:8081/orders/${searchId.trim()}`)
            .then(res => {
                if (!res.ok) throw new Error('Order not found');
                return res.json();
            })
            .then(data => {
                setSearchResult(data);
                setShowSearchModal(true);
            })
            .catch(err => setSearchError(err.message))
            .finally(() => setSearchLoading(false));
    };

    const handleSearchEditInput = (e) => {
        const { name, value } = e.target;
        setSearchResult(prev => ({ ...prev, [name]: value }));
    };

    const handleSearchEditSave = (e) => {
        e.preventDefault();
        setEditLoading(true);
        setSearchError('');
        // Prepare payload: map id to orderNumber, format dates, only send expected fields
        const {
            id, // eslint-disable-line
            customerNumber,
            orderDate,
            requiredDate,
            shippedDate,
            status,
            comments
        } = searchResult;
        // Helper to format date as YYYY-MM-DD
        const formatDate = (d) => {
            if (!d) return '';
            // If already in YYYY-MM-DD, return as is
            if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
            // Try to parse and format
            const dateObj = new Date(d);
            if (isNaN(dateObj)) return d;
            return dateObj.toISOString().slice(0, 10);
        };
        const payload = {
            orderNumber: id, // Backend may expect 'orderNumber' instead of 'id'
            customerNumber,
            orderDate: formatDate(orderDate),
            requiredDate: formatDate(requiredDate),
            shippedDate: shippedDate ? formatDate(shippedDate) : null,
            status,
            comments
        };
        fetch(`http://localhost:8081/orders/${id}`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => {
                if (!res.ok) throw new Error('Failed to update order');
                return res.json();
            })
            .then(() => {
                setShowSearchModal(false);
                setSearchResult(null);
                setSearchId('');
                setLoading(true);
                fetch('http://localhost:8081/orders')
                    .then(res => res.json())
                    .then(data => setOrders(data))
                    .finally(() => setLoading(false));
            })
            .catch(err => setSearchError(err.message))
            .finally(() => setEditLoading(false));
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className='items-center justify-center w-full flex flex-col mb-6'>
                <h1 className="text-3xl font-bold text-center mb-6">Orders</h1>
            </div>
            <div className="flex items-center justify-between mb-4">
                <div className="relative flex gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Search order by ID"
                        value={searchId}
                        onChange={e => setSearchId(e.target.value)}
                        className="border-2 border-black rounded-md py-2 pl-10 pr-4"
                    />
                    <span className="absolute left-3 top-2.5">
                        <IoSearch className="w-5 h-5" />
                    </span>
                    <button
                        onClick={handleSearch}
                        className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                        disabled={searchLoading}
                    >
                        {searchLoading ? 'Searching...' : 'Search'}
                    </button>
                </div>
                <button onClick={() => setShowAdd(true)} className="bg-[#4a90e2] cursor-pointer text-white px-8 py-1.5 rounded hover:bg-blue-400 transition">
                    Add Order
                </button>
            </div>
            {searchError && <div className="text-red-500 mb-2">{searchError}</div>}
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <table className="w-full border overflow-x-scroll border-blue-300">
                    <thead className="bg-[#f5f5f5] border-b-2 border-[#258cbf]">
                        <tr>
                            <th className="px-4 py-2 text-center whitespace-nowrap">Order ID</th>
                            <th className="px-4 py-2 text-center whitespace-nowrap">Customer ID</th>
                            <th className="px-4 py-2 text-center whitespace-nowrap">Order Date</th>
                            <th className="px-4 py-2 text-center whitespace-nowrap">Required Date</th>
                            <th className="px-4 py-2 text-center whitespace-nowrap">Shipping Date</th>
                            <th className="px-4 py-2 text-center whitespace-nowrap">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="border-t-2 font-medium text-center border-[#42befb] px-4 py-2 whitespace-nowrap">{order.id}</td>
                                <td className="border-t-2 font-medium text-center border-[#42befb] px-4 py-2 whitespace-nowrap">{order.customerNumber}</td>
                                <td className="border-t-2 font-medium text-center border-[#42befb] px-4 py-2 whitespace-nowrap">{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ''}</td>
                                <td className="border-t-2 font-medium text-center border-[#42befb] px-4 py-2 whitespace-nowrap">{order.requiredDate ? new Date(order.requiredDate).toLocaleDateString() : ''}</td>
                                <td className="border-t-2 font-medium text-center border-[#42befb] px-4 py-2 whitespace-nowrap">{order.shippedDate ? new Date(order.shippedDate).toLocaleDateString() : ''}</td>
                                <td className="border-t-2 font-medium text-center border-[#42befb]  py-2 whitespace-nowrap">
                                    <button className={`rounded-lg px-5 text-white py-0.5
                                    ${order.status === 'Shipped' ? 'bg-[#4a90e2]' : order.status === 'Pending' ? 'bg-[#5b7798] ' : 'bg-[#4a90e2]'}
                                     whitespace-nowrap`}>
                                        {order.status}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <Modal open={showAdd} onClose={() => setShowAdd(false)}>
                <form onSubmit={handleAddSave}>
                    <h2 className="text-xl font-bold mb-4">Add Order</h2>
                    {addError && <div className="text-red-500 mb-2">{addError}</div>}
                    {addSuccess && <div className="text-green-600 mb-2">{addSuccess}</div>}
                    <div className="grid grid-cols-1 gap-2">
                        <input name="customerNumber" value={addForm.customerNumber} onChange={handleAddInput} required placeholder="Customer ID" className="border p-2 rounded" />
                        <input name="orderDate" value={addForm.orderDate} onChange={handleAddInput} required placeholder="Order Date (YYYY-MM-DD)" className="border p-2 rounded" />
                        <input name="requiredDate" value={addForm.requiredDate} onChange={handleAddInput} required placeholder="Required Date (YYYY-MM-DD)" className="border p-2 rounded" />
                        <input name="shippedDate" value={addForm.shippedDate} onChange={handleAddInput} placeholder="Shipping Date (YYYY-MM-DD)" className="border p-2 rounded" />
                        <select name="status" value={addForm.status} onChange={handleAddInput} required className="border p-2 rounded">
                            <option value="" disabled>Select Status</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                        </select>
                        <textarea name="comments" value={addForm.comments} onChange={handleAddInput} placeholder="Comments" className="border p-2 rounded" />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button type="submit" disabled={addLoading} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                            {addLoading ? 'Saving...' : 'Save Order'}
                        </button>
                        <button type="button" onClick={() => setShowAdd(false)} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition">Close</button>
                    </div>
                </form>
            </Modal>
            <Modal open={showSearchModal} onClose={() => { setShowSearchModal(false); setIsEditing(false); }}>
                {searchResult && (
                    <form onSubmit={handleSearchEditSave}>
                        <h2 className="text-xl font-bold mb-4">Order Details</h2>
                        <div className="grid grid-cols-2 gap-2 items-center">
                            <span className="font-semibold text-right pr-2">Customer ID:</span>
                            {isEditing ? (
                                <input name="customerNumber" value={searchResult.customerNumber || ''} onChange={handleSearchEditInput} required className="border p-2 rounded w-full" />
                            ) : (
                                <span>{searchResult.customerNumber}</span>
                            )}
                            <span className="font-semibold text-right pr-2">Order Date:</span>
                            {isEditing ? (
                                <input name="orderDate" value={searchResult.orderDate || ''} onChange={handleSearchEditInput} required className="border p-2 rounded w-full" />
                            ) : (
                                <span>{searchResult.orderDate}</span>
                            )}
                            <span className="font-semibold text-right pr-2">Required Date:</span>
                            {isEditing ? (
                                <input name="requiredDate" value={searchResult.requiredDate || ''} onChange={handleSearchEditInput} required className="border p-2 rounded w-full" />
                            ) : (
                                <span>{searchResult.requiredDate}</span>
                            )}
                            <span className="font-semibold text-right pr-2">Shipping Date:</span>
                            {isEditing ? (
                                <input name="shippedDate" value={searchResult.shippedDate || ''} onChange={handleSearchEditInput} className="border p-2 rounded w-full" />
                            ) : (
                                <span>{searchResult.shippedDate}</span>
                            )}
                            <span className="font-semibold text-right pr-2">Status:</span>
                            {isEditing ? (
                                <select name="status" value={searchResult.status || ''} onChange={handleSearchEditInput} required className="border p-2 rounded w-full">
                                    <option value="" disabled>Select Status</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            ) : (
                                <span>{searchResult.status}</span>
                            )}
                            <span className="font-semibold text-right pr-2">Comments:</span>
                            {isEditing ? (
                                <textarea name="comments" value={searchResult.comments || ''} onChange={handleSearchEditInput} className="border p-2 rounded w-full" />
                            ) : (
                                <span>{searchResult.comments}</span>
                            )}
                        </div>
                        <div className="flex gap-2 mt-4">
                            {isEditing ? (
                                <button type="submit" disabled={editLoading} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                                    {editLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            ) : (
                                <button type="button" onClick={e => { e.preventDefault(); setIsEditing(true); }} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition">Edit</button>
                            )}
                            <button type="button" onClick={() => { setShowSearchModal(false); setIsEditing(false); }} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition">Close</button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    )
}

export default Orders