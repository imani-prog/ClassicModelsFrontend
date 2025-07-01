import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaEdit, FaEye, FaFilter, FaPlus, FaShoppingCart, FaUsers } from 'react-icons/fa';
import { IoSearch } from 'react-icons/io5';
import { Link, useLocation } from 'react-router-dom';

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

const Orders = () => {
    const location = useLocation();
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
    const [_searchId, setSearchId] = useState(''); // Used in modal for ID tracking
    const [searchResult, setSearchResult] = useState(null);
    const [_searchError, setSearchError] = useState(''); // Used in inline handlers
    const [editLoading, setEditLoading] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // New state for enhanced features
    const [sortBy, setSortBy] = useState('orderDate'); // 'orderDate', 'status', 'customer'
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [globalSearch, setGlobalSearch] = useState('');

    // Helper function to format dates as DD/MM/YYYY
    const formatDisplayDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            
            return `${day}/${month}/${year}`;
        } catch {
            return '';
        }
    };

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

    // Handle URL parameters for pre-filling customer data and edit mode
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const customerId = params.get('customer');
        const editOrderId = params.get('edit');
        
        if (customerId) {
            setAddForm(prev => ({ ...prev, customerNumber: customerId }));
            setShowAdd(true); // Automatically open the add order modal
        }
        
        if (editOrderId) {
            // Trigger edit mode for the specified order
            handleEditOrder(editOrderId);
        }
    }, [location.search]);

    // Enhanced filtering and sorting logic
    const filteredOrders = orders
        .filter(order => {
            // Global search filter
            const searchMatch = !globalSearch || 
                String(order.id).toLowerCase().includes(globalSearch.toLowerCase()) ||
                String(order.customerNumber).toLowerCase().includes(globalSearch.toLowerCase()) ||
                order.status?.toLowerCase().includes(globalSearch.toLowerCase()) ||
                formatDisplayDate(order.orderDate).toLowerCase().includes(globalSearch.toLowerCase()) ||
                order.comments?.toLowerCase().includes(globalSearch.toLowerCase());
            
            // Status filter
            const statusMatch = !filterStatus || order.status === filterStatus;
            
            // Date range filter
            let dateMatch = true;
            if (filterDateFrom || filterDateTo) {
                const orderDate = new Date(order.orderDate);
                if (filterDateFrom) {
                    const fromDate = new Date(filterDateFrom);
                    dateMatch = dateMatch && orderDate >= fromDate;
                }
                if (filterDateTo) {
                    const toDate = new Date(filterDateTo);
                    dateMatch = dateMatch && orderDate <= toDate;
                }
            }
            
            return searchMatch && statusMatch && dateMatch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'orderDate':
                    return new Date(b.orderDate) - new Date(a.orderDate); // Most recent first
                case 'status':
                    return (a.status || '').localeCompare(b.status || '');
                case 'customer':
                    return String(a.customerNumber).localeCompare(String(b.customerNumber));
                default:
                    return 0;
            }
        });

    // Calculate statistics
    const totalOrders = orders.length;
    const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {});

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
            id, 
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

    // Handle opening order for editing
    const handleEditOrder = async (orderId) => {
        try {
            const response = await fetch(`http://localhost:8081/orders/${orderId}`);
            if (!response.ok) throw new Error('Order not found');
            const orderData = await response.json();
            setSearchResult(orderData);
            setSearchId(orderId);
            setIsEditing(true);
            setShowSearchModal(true);
        } catch (err) {
            setSearchError(err.message);
        }
    };

    // Helper function to render order card
    return (
        <div className="max-w-6xl mx-auto px-2 h-full flex flex-col pt-2">
            {/* Global Add Feedback */}
            {addSuccess && <div className="text-green-600 mb-2 text-center font-semibold">{addSuccess}</div>}
            {addError && <div className="text-red-500 mb-2 text-center font-semibold">{addError}</div>}
            
            {/* Header Section - Fixed height */}
            <div className='flex items-start justify-between mb-3 flex-shrink-0'>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold mb-1">Orders</h1>
                    <p className="text-gray-600 text-sm">Manage your order tracking and status</p>
                </div>
                
                {/* Quick Stats */}
                <div className="flex gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-center">
                        <div className="flex items-center gap-2 text-blue-600">
                            <FaShoppingCart className="text-lg" />
                            <div>
                                <div className="text-xl font-bold">{totalOrders}</div>
                                <div className="text-xs">Total Orders</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-center">
                        <div className="flex items-center gap-2 text-green-600">
                            <FaCalendarAlt className="text-lg" />
                            <div>
                                <div className="text-xl font-bold">{statusCounts['Shipped'] || 0}</div>
                                <div className="text-xs">Shipped</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-center">
                        <div className="flex items-center gap-2 text-yellow-600">
                            <FaUsers className="text-lg" />
                            <div>
                                <div className="text-xl font-bold">{statusCounts['Pending'] || 0}</div>
                                <div className="text-xs">Pending</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 text-center">
                        <div className="flex items-center gap-2 text-purple-600">
                            <FaEdit className="text-lg" />
                            <div>
                                <div className="text-xl font-bold">{statusCounts['Completed'] || 0}</div>
                                <div className="text-xs">Completed</div>
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
                                placeholder="Search orders (ID, Customer, Status, Date)"
                                value={globalSearch}
                                onChange={e => setGlobalSearch(e.target.value)}
                                className="border-2 border-black bg-[#f5f5f5] rounded-md py-2 pl-10 pr-4 w-64"
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
                            <option value="orderDate">Sort by Order Date (Recent First)</option>
                            <option value="status">Sort by Status</option>
                            <option value="customer">Sort by Customer ID</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowAdd(true)}
                            className="bg-[#4a90e2] items-center flex flex-row gap-2 cursor-pointer text-white px-6 py-2 rounded hover:bg-blue-400 transition"
                        >
                            <FaPlus className='text-black text-lg' />
                            Add Order
                        </button>
                    </div>
                </div>

                {/* Collapsible Filters */}
                {showFilters && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status Filter
                                </label>
                                <select
                                    value={filterStatus}
                                    onChange={e => setFilterStatus(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md py-2 px-3 bg-white"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Order Date Range
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
                {filteredOrders.length > 0 && (
                    <div className="text-sm text-gray-600 mb-2">
                        Showing {filteredOrders.length} of {orders.length} orders
                        {(globalSearch || filterStatus || filterDateFrom || filterDateTo) && (
                            <span className="ml-2 text-blue-600">
                                (filtered)
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Content Section - Flexible height */}
            <div className="flex-1 min-h-0 mb-2">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center py-4">Loading...</div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-red-500 py-4">{error}</div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <FaShoppingCart className="text-6xl mb-4 text-gray-300" />
                        <h3 className="text-xl font-semibold mb-2">No orders found</h3>
                        <p className="text-center">
                            {orders.length === 0 
                                ? "No orders have been added yet. Click 'Add Order' to create your first order."
                                : "No orders match your current filters. Try adjusting your search criteria or filters."
                            }
                        </p>
                    </div>
                ) : (
                    <div className="h-full overflow-auto">
                        <table className="w-full border border-blue-300 text-sm">
                            <thead className="bg-gray-100 border-b-2 border-[#258cbf] sticky top-0 z-10">
                                <tr>
                                    <th className="px-2 py-1 text-center">Order ID</th>
                                    <th className="px-2 py-1 text-center">Customer ID</th>
                                    <th className="px-2 py-1 text-center">Order Date</th>
                                    <th className="px-2 py-1 text-center">Required Date</th>
                                    <th className="px-2 py-1 text-center">Shipping Date</th>
                                    <th className="px-2 py-1 text-center">Status</th>
                                    <th className="px-2 py-1 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order, idx) => (
                                    <tr key={`${order.id}-${idx}`} className="hover:bg-gray-50">
                                        <td className="border-t font-medium text-center border-[#42befb] px-2 py-1">{order.id}</td>
                                        <td className="border-t font-medium text-center border-[#42befb] px-2 py-1">{order.customerNumber}</td>
                                        <td className="border-t font-medium text-center border-[#42befb] px-2 py-1">{formatDisplayDate(order.orderDate)}</td>
                                        <td className="border-t font-medium text-center border-[#42befb] px-2 py-1">{formatDisplayDate(order.requiredDate)}</td>
                                        <td className="border-t font-medium text-center border-[#42befb] px-2 py-1">{formatDisplayDate(order.shippedDate)}</td>
                                        <td className="border-t font-medium text-center border-[#42befb] px-2 py-1">
                                            <button className={`rounded-lg px-3 text-white py-0.5 text-xs
                                            ${order.status === 'Shipped' ? 'bg-green-500' : order.status === 'Pending' ? 'bg-yellow-500' : 'bg-blue-500'}`}>
                                                {order.status}
                                            </button>
                                        </td>
                                        <td className="border-t font-medium text-center border-[#42befb] px-2 py-1">
                                            <div className="flex justify-center gap-2">
                                                <Link
                                                    to={`/orders/${order.id}`}
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                                                    title="View Order Details"
                                                >
                                                    <FaEye className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleEditOrder(order.id)}
                                                    className="text-yellow-600 hover:text-yellow-900 p-1 rounded-md hover:bg-yellow-50 transition-colors"
                                                    title="Edit Order"
                                                >
                                                    <FaEdit className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <Modal open={showAdd} onClose={() => setShowAdd(false)}>
                <form onSubmit={handleAddSave}>
                    <h2 className="text-xl font-bold mb-4">Add Order</h2>
                    {addError && <div className="text-red-500 mb-2">{addError}</div>}
                    {addSuccess && <div className="text-green-600 mb-2">{addSuccess}</div>}
                    <div className="grid grid-cols-2 gap-3 items-center">
                        <label className="font-medium text-gray-700">Customer ID:</label>
                        <input name="customerNumber" value={addForm.customerNumber} onChange={handleAddInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Order Date:</label>
                        <input name="orderDate" type="date" value={addForm.orderDate} onChange={handleAddInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Required Date:</label>
                        <input name="requiredDate" type="date" value={addForm.requiredDate} onChange={handleAddInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Shipping Date:</label>
                        <input name="shippedDate" type="date" value={addForm.shippedDate} onChange={handleAddInput} className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Status:</label>
                        <select name="status" value={addForm.status} onChange={handleAddInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="" disabled>Select Status</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                        </select>
                        
                        <label className="font-medium text-gray-700">Comments:</label>
                        <textarea name="comments" value={addForm.comments} onChange={handleAddInput} className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" />
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
                        <div className="grid grid-cols-2 gap-3 items-center">
                            <label className="font-medium text-gray-700">Customer ID:</label>
                            {isEditing ? (
                                <input name="customerNumber" value={searchResult.customerNumber || ''} onChange={handleSearchEditInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            ) : (
                                <span>{searchResult.customerNumber}</span>
                            )}
                            
                            <label className="font-medium text-gray-700">Order Date:</label>
                            {isEditing ? (
                                <input name="orderDate" type="date" value={searchResult.orderDate || ''} onChange={handleSearchEditInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            ) : (
                                <span>{searchResult.orderDate}</span>
                            )}
                            
                            <label className="font-medium text-gray-700">Required Date:</label>
                            {isEditing ? (
                                <input name="requiredDate" type="date" value={searchResult.requiredDate || ''} onChange={handleSearchEditInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            ) : (
                                <span>{searchResult.requiredDate}</span>
                            )}
                            
                            <label className="font-medium text-gray-700">Shipping Date:</label>
                            {isEditing ? (
                                <input name="shippedDate" type="date" value={searchResult.shippedDate || ''} onChange={handleSearchEditInput} className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            ) : (
                                <span>{searchResult.shippedDate}</span>
                            )}
                            
                            <label className="font-medium text-gray-700">Status:</label>
                            {isEditing ? (
                                <select name="status" value={searchResult.status || ''} onChange={handleSearchEditInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="" disabled>Select Status</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            ) : (
                                <span>{searchResult.status}</span>
                            )}
                            
                            <label className="font-medium text-gray-700">Comments:</label>
                            {isEditing ? (
                                <textarea name="comments" value={searchResult.comments || ''} onChange={handleSearchEditInput} className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" />
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