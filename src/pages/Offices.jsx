import { useEffect, useState } from 'react';
import { FaBuilding, FaEdit, FaFilter, FaGlobe, FaList, FaPhone, FaPlus, FaTh, FaTrash } from 'react-icons/fa';
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

const Offices = () => {
    const [offices, setOffices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [form, setForm] = useState({
        officeCode: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        country: '',
        phone: '',
        postalCode: '',
        state: '',
        territory: ''
    });
    const [saving, setSaving] = useState(false);
    const [editModal, setEditModal] = useState({ open: false, office: null });
    const [editForm, setEditForm] = useState({
        officeCode: '', addressLine1: '', addressLine2: '', city: '', country: '', phone: '', postalCode: '', state: '', territory: ''
    });
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, office: null });
    const [successMsg, setSuccessMsg] = useState('');
    const [officeSearch, setOfficeSearch] = useState('');
    const [officeSearchResult, setOfficeSearchResult] = useState(null);
    const [officeNotFound, setOfficeNotFound] = useState(false);

    // New state for enhanced features
    const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'
    const [sortBy, setSortBy] = useState('code'); // 'code', 'city', 'country'
    const [filterCountry, setFilterCountry] = useState('');
    const [filterState, setFilterState] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const fetchOffices = () => {
        setLoading(true);
        fetch('http://localhost:8081/api/offices')
            .then((res) => res.json())
            .then((data) => {
                setOffices(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchOffices();
    }, []);

    // Enhanced filtering and sorting logic
    const filteredOffices = offices
        .filter(office => {
            // Text search filter
            const textMatch = officeSearch === '' || 
                office.officeCode?.toLowerCase().includes(officeSearch.toLowerCase()) ||
                office.city?.toLowerCase().includes(officeSearch.toLowerCase()) ||
                office.country?.toLowerCase().includes(officeSearch.toLowerCase());
            
            // Country filter
            const countryMatch = !filterCountry || office.country === filterCountry;
            
            // State filter
            const stateMatch = !filterState || office.state === filterState;
            
            return textMatch && countryMatch && stateMatch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'code':
                    return (a.officeCode || '').localeCompare(b.officeCode || '');
                case 'city':
                    return (a.city || '').localeCompare(b.city || '');
                case 'country':
                    return (a.country || '').localeCompare(b.country || '');
                default:
                    return 0;
            }
        });

    // Get unique values for filter options
    const uniqueCountries = [...new Set(offices.map(office => office.country).filter(Boolean))];
    const uniqueStates = [...new Set(offices.map(office => office.state).filter(Boolean))];

    // Calculate statistics
    const totalOffices = offices.length;
    const totalCountries = uniqueCountries.length;
    const officesWithStates = offices.filter(office => office.state).length;

    // Helper function to render office card
    const renderOfficeCard = (office, idx) => {
        return (
            <div key={office.officeCode || idx} className="bg-white border-2 border-[#42befb] rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex flex-col h-full">
                    <h2 className="text-xl font-bold text-center mb-3 text-blue-700">Office {office.officeCode}</h2>
                    <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-3 gap-1 text-sm">
                            <span className="font-medium text-gray-600">Code:</span>
                            <span className="col-span-2 font-semibold">{office.officeCode}</span>
                            
                            <span className="font-medium text-gray-600">City:</span>
                            <span className="col-span-2 font-semibold">{office.city}</span>
                            
                            <span className="font-medium text-gray-600">Address:</span>
                            <span className="col-span-2 font-semibold">{office.addressLine1}</span>
                            
                            {office.addressLine2 && (
                                <>
                                    <span className="font-medium text-gray-600"></span>
                                    <span className="col-span-2 font-semibold">{office.addressLine2}</span>
                                </>
                            )}
                            
                            <span className="font-medium text-gray-600">Country:</span>
                            <span className="col-span-2 font-semibold">{office.country}</span>
                            
                            {office.state && (
                                <>
                                    <span className="font-medium text-gray-600">State:</span>
                                    <span className="col-span-2 font-semibold">{office.state}</span>
                                </>
                            )}
                            
                            <span className="font-medium text-gray-600">Phone:</span>
                            <span className="col-span-2 font-semibold">{office.phone}</span>
                        </div>
                    </div>
                    <div className="flex justify-center gap-3 mt-4 pt-3 border-t">
                        <button
                            onClick={() => openEditModal(office)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded flex items-center gap-1 transition"
                        >
                            <FaEdit className="w-3 h-3" />
                            Edit
                        </button>
                        <button
                            onClick={() => openDeleteConfirm(office)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1 transition"
                        >
                            <FaTrash className="w-3 h-3" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Helper function to render office list row
    const renderOfficeListRow = (office, idx) => {
        return (
            <tr key={office.officeCode || idx} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold">{office.officeCode}</td>
                <td className="py-3 px-4">{office.city}</td>
                <td className="py-3 px-4">{office.country}</td>
                <td className="py-3 px-4">{office.state || '-'}</td>
                <td className="py-3 px-4">{office.addressLine1}</td>
                <td className="py-3 px-4">{office.phone}</td>
                <td className="py-3 px-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => openEditModal(office)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded flex items-center gap-1 transition text-xs"
                        >
                            <FaEdit className="w-3 h-3" />
                            Edit
                        </button>
                        <button
                            onClick={() => openDeleteConfirm(office)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded flex items-center gap-1 transition text-xs"
                        >
                            <FaTrash className="w-3 h-3" />
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddOffice = (e) => {
        e.preventDefault();
        setSaving(true);
        fetch('http://localhost:8081/api/offices/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                officeCode: form.officeCode,
                addressLine1: form.addressLine1,
                addressLine2: form.addressLine2,
                city: form.city,
                country: form.country,
                phone: form.phone,
                postalCode: form.postalCode,
                state: form.state,
                territory: form.territory
            })
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to save office');
                return res.json();
            })
            .then(() => {
                setShowAddForm(false);
                setForm({
                    officeCode: '',
                    addressLine1: '',
                    addressLine2: '',
                    city: '',
                    country: '',
                    phone: '',
                    postalCode: '',
                    state: '',
                    territory: ''
                });
                setSuccessMsg('Office added successfully!');
                fetchOffices();
                setTimeout(() => setSuccessMsg(''), 2000);
            })
            .catch((err) => {
                alert(err.message);
            })
            .finally(() => setSaving(false));
    };

    const openEditModal = (office) => {
        setEditForm({ ...office });
        setEditModal({ open: true, office });
        setEditError('');
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEditOffice = (e) => {
        e.preventDefault();
        setEditLoading(true);
        setEditError('');
        fetch(`http://localhost:8081/api/offices/${editModal.office.officeCode}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm)
        })
        .then(res => {
            if (!res.ok) throw new Error('Failed to update office');
            return res.json();
        })
        .then(() => {
            setEditModal({ open: false, office: null });
            setSuccessMsg('Office updated successfully!');
            fetchOffices();
            setTimeout(() => setSuccessMsg(''), 2000);
        })
        .catch(err => setEditError(err.message))
        .finally(() => setEditLoading(false));
    };

    const openDeleteConfirm = (office) => {
        setDeleteConfirm({ open: true, office });
        setDeleteError('');
    };

    const handleDeleteOffice = () => {
        setDeleteLoading(true);
        setDeleteError('');
        fetch(`http://localhost:8081/api/offices/${deleteConfirm.office.officeCode}`, {
            method: 'DELETE'
        })
        .then(res => {
            if (!res.ok) throw new Error('Failed to delete office');
            setDeleteConfirm({ open: false, office: null });
            setSuccessMsg('Office deleted successfully!');
            fetchOffices();
            setTimeout(() => setSuccessMsg(''), 2000);
        })
        .catch(err => setDeleteError(err.message))
        .finally(() => setDeleteLoading(false));
    };

    const handleOfficeSearch = () => {
        setOfficeNotFound(false);
        if (!officeSearch.trim()) {
            setOfficeSearchResult(null);
            return;
        }
        const term = officeSearch.trim().toLowerCase();
        const found = offices.find(office => 
            String(office.officeCode).toLowerCase() === term ||
            office.city?.toLowerCase() === term ||
            office.country?.toLowerCase() === term
        );
        if (found) {
            setOfficeSearchResult(found);
        } else {
            setOfficeSearchResult(null);
            setOfficeNotFound(true);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-2 h-full flex flex-col pt-2">
            {/* Global Success Messages */}
            {successMsg && <div className="text-green-600 mb-2 text-center font-semibold">{successMsg}</div>}
            
            {/* Header Section - Fixed height */}
            <div className='flex items-start justify-between mb-3 flex-shrink-0'>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold mb-1">Offices</h1>
                    <p className="text-gray-600 text-sm">Manage office locations and contact information</p>
                </div>
                
                {/* Quick Stats */}
                <div className="flex gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-center">
                        <div className="flex items-center gap-2 text-blue-600">
                            <FaBuilding className="text-lg" />
                            <div>
                                <div className="text-xl font-bold">{totalOffices}</div>
                                <div className="text-xs">Total Offices</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-center">
                        <div className="flex items-center gap-2 text-green-600">
                            <FaGlobe className="text-lg" />
                            <div>
                                <div className="text-xl font-bold">{totalCountries}</div>
                                <div className="text-xs">Countries</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 text-center">
                        <div className="flex items-center gap-2 text-purple-600">
                            <FaPhone className="text-lg" />
                            <div>
                                <div className="text-xl font-bold">{officesWithStates}</div>
                                <div className="text-xs">With State Info</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Search Section - Fixed height */}
            <div className="mb-3 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                        {/* Search Input */}
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                placeholder="Search by office code, city, or country"
                                value={officeSearch}
                                onChange={e => setOfficeSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleOfficeSearch()}
                                className="border-2 border-black bg-[#f5f5f5] rounded-md py-2 pl-10 pr-4"
                            />
                            <button
                                className="absolute left-3 top-2.5 hover:text-blue-600 transition-colors cursor-pointer"
                                onClick={handleOfficeSearch}
                                type="button"
                                title="Search"
                            >
                                <IoSearch className="w-5 h-5" />
                            </button>
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
                            <option value="code">Sort by Office Code</option>
                            <option value="city">Sort by City</option>
                            <option value="country">Sort by Country</option>
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
                                onClick={() => setViewMode('list')}
                                className={`p-2 transition ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                                type="button"
                                title="List View"
                            >
                                <FaList className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-[#4a90e2] items-center flex flex-row gap-2 cursor-pointer text-white px-6 py-2 rounded hover:bg-blue-400 transition"
                        >
                            <FaPlus className='text-black text-lg' />
                            Add Office
                        </button>
                    </div>
                </div>

                {/* Collapsible Filters */}
                {showFilters && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Filter by Country
                                </label>
                                <select
                                    value={filterCountry}
                                    onChange={e => setFilterCountry(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md py-2 px-3 bg-white"
                                >
                                    <option value="">All Countries</option>
                                    {uniqueCountries.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Filter by State
                                </label>
                                <select
                                    value={filterState}
                                    onChange={e => setFilterState(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md py-2 px-3 bg-white"
                                >
                                    <option value="">All States</option>
                                    {uniqueStates.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {officeNotFound && <div className="text-red-500 mb-2">Office not found.</div>}
                
                {/* Results Counter */}
                {!officeSearchResult && filteredOffices.length > 0 && (
                    <div className="text-sm text-gray-600 mb-2">
                        Showing {filteredOffices.length} of {offices.length} offices
                        {(filterCountry || filterState) && (
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
                    <div className="text-center py-4">Loading...</div>
                ) : error ? (
                    <div className="text-center text-red-500 py-4">{error}</div>
                ) : (
                    <div className="h-full overflow-auto">
                        {officeSearchResult ? (
                            // Single search result
                            <div className={viewMode === 'cards' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : ''}>
                                {viewMode === 'cards' ? (
                                    renderOfficeCard(officeSearchResult, 0)
                                ) : (
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Code</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">City</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Country</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">State</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Address</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Phone</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {renderOfficeListRow(officeSearchResult, 0)}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // All offices or filtered results
                            <>
                                {filteredOffices.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <FaBuilding className="mx-auto mb-4 text-4xl text-gray-300" />
                                        <p className="text-lg mb-2">No offices found</p>
                                        <p className="text-sm">
                                            {offices.length === 0 
                                                ? "Get started by adding your first office"
                                                : "Try adjusting your search criteria or filters"
                                            }
                                        </p>
                                    </div>
                                ) : viewMode === 'cards' ? (
                                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                        {filteredOffices.map((office, idx) => renderOfficeCard(office, idx))}
                                    </div>
                                ) : (
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                                                <tr>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Code</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">City</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Country</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">State</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Address</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Phone</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredOffices.map((office, idx) => renderOfficeListRow(office, idx))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Add Office Modal */}
            <Modal open={showAddForm} onClose={() => {
                setShowAddForm(false);
                setForm({
                    officeCode: '',
                    addressLine1: '',
                    addressLine2: '',
                    city: '',
                    country: '',
                    phone: '',
                    postalCode: '',
                    state: '',
                    territory: ''
                });
            }}>
                <form onSubmit={handleAddOffice}>
                    <h2 className="text-xl font-bold mb-4">Add Office</h2>
                    <div className="grid grid-cols-2 gap-3 items-center">
                        <label className="font-medium text-gray-700">Office Code:</label>
                        <input name="officeCode" value={form.officeCode} onChange={handleInputChange} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Address Line 1:</label>
                        <input name="addressLine1" value={form.addressLine1} onChange={handleInputChange} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Address Line 2:</label>
                        <input name="addressLine2" value={form.addressLine2} onChange={handleInputChange} className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">City:</label>
                        <input name="city" value={form.city} onChange={handleInputChange} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Country:</label>
                        <input name="country" value={form.country} onChange={handleInputChange} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Phone:</label>
                        <input name="phone" value={form.phone} onChange={handleInputChange} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Postal Code:</label>
                        <input name="postalCode" value={form.postalCode} onChange={handleInputChange} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">State:</label>
                        <input name="state" value={form.state} onChange={handleInputChange} className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Territory:</label>
                        <input name="territory" value={form.territory} onChange={handleInputChange} className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button type="submit" disabled={saving} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                            {saving ? 'Saving...' : 'Save Office'}
                        </button>
                        <button type="button" onClick={() => {
                            setShowAddForm(false);
                            setForm({
                                officeCode: '',
                                addressLine1: '',
                                addressLine2: '',
                                city: '',
                                country: '',
                                phone: '',
                                postalCode: '',
                                state: '',
                                territory: ''
                            });
                        }} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition">Cancel</button>
                    </div>
                </form>
            </Modal>

            {/* Edit Office Modal */}
            <Modal open={editModal.open} onClose={() => setEditModal({ open: false, office: null })}>
                <form onSubmit={handleEditOffice}>
                    <h2 className="text-xl font-bold mb-4">Edit Office</h2>
                    {editError && <div className="text-red-500 mb-2">{editError}</div>}
                    <div className="grid grid-cols-2 gap-3 items-center">
                        <label className="font-medium text-gray-700">Office Code:</label>
                        <input name="officeCode" value={editForm.officeCode} onChange={handleEditInputChange} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Address Line 1:</label>
                        <input name="addressLine1" value={editForm.addressLine1} onChange={handleEditInputChange} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Address Line 2:</label>
                        <input name="addressLine2" value={editForm.addressLine2} onChange={handleEditInputChange} className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">City:</label>
                        <input name="city" value={editForm.city} onChange={handleEditInputChange} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Country:</label>
                        <input name="country" value={editForm.country} onChange={handleEditInputChange} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Phone:</label>
                        <input name="phone" value={editForm.phone} onChange={handleEditInputChange} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Postal Code:</label>
                        <input name="postalCode" value={editForm.postalCode} onChange={handleEditInputChange} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">State:</label>
                        <input name="state" value={editForm.state} onChange={handleEditInputChange} className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Territory:</label>
                        <input name="territory" value={editForm.territory} onChange={handleEditInputChange} className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button type="submit" disabled={editLoading} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                            {editLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={() => setEditModal({ open: false, office: null })} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition">Cancel</button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, office: null })}>
                <div>
                    <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                    <p className="mb-4">Are you sure you want to delete <strong>Office {deleteConfirm.office?.officeCode}</strong>?</p>
                    {deleteError && <div className="text-red-500 mb-2">{deleteError}</div>}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setDeleteConfirm({ open: false, office: null })}
                            disabled={deleteLoading}
                            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteOffice}
                            disabled={deleteLoading}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                        >
                            {deleteLoading ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Offices;
