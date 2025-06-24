import { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { IoSearch } from 'react-icons/io5';
import { MdDelete, MdEdit } from 'react-icons/md';

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
                fetchOffices();
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
        const term = officeSearch.trim();
        const found = offices.find(office => String(office.officeCode) === term);
        if (found) {
            setOfficeSearchResult(found);
        } else {
            setOfficeSearchResult(null);
            setOfficeNotFound(true);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className='items-center justify-center w-full flex flex-col mb-6'>
                <h1 className="text-3xl font-bold text-center mb-6">Offices</h1>
                <button
                    className="bg-[#4a90e2] flex flex-row gap-2 items-center cursor-pointer text-white px-8 py-1.5 rounded hover:bg-blue-400 transition"
                    onClick={() => setShowAddForm((prev) => !prev)}
                >
                    <FaPlus className='text-black text-lg' />
                    Add Office
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAddOffice} className="bg-white border border-blue-300 rounded-lg p-6 mb-6 shadow-md flex flex-col gap-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="officeCode" value={form.officeCode} onChange={handleInputChange} required placeholder="Office Code" className="border p-2 rounded" />
                        <input name="addressLine1" value={form.addressLine1} onChange={handleInputChange} required placeholder="Address Line 1" className="border p-2 rounded" />
                        <input name="addressLine2" value={form.addressLine2} onChange={handleInputChange} placeholder="Address Line 2" className="border p-2 rounded" />
                        <input name="city" value={form.city} onChange={handleInputChange} required placeholder="City" className="border p-2 rounded" />
                        <input name="country" value={form.country} onChange={handleInputChange} required placeholder="Country" className="border p-2 rounded" />
                        <input name="phone" value={form.phone} onChange={handleInputChange} required placeholder="Phone" className="border p-2 rounded" />
                        <input name="postalCode" value={form.postalCode} onChange={handleInputChange} required placeholder="Postal Code" className="border p-2 rounded" />
                        <input name="state" value={form.state} onChange={handleInputChange} placeholder="State" className="border p-2 rounded" />
                        <input name="territory" value={form.territory} onChange={handleInputChange} placeholder="Territory" className="border p-2 rounded" />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button type="submit" disabled={saving} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                            {saving ? 'Saving...' : 'Save Office'}
                        </button>
                        <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="flex items-center justify-between mb-4">
                <div className="relative flex flex-row gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Search by office code"
                        value={officeSearch}
                        onChange={e => setOfficeSearch(e.target.value)}
                        className="border-2 border-black bg-[#f5f5f5] rounded-md py-2 pl-13 pr-4"
                    />
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                        onClick={handleOfficeSearch}
                    >
                        Search Office
                    </button>
                    <span className="absolute left-3 top-2.5 ">
                        <IoSearch className="w-5 h-5" />
                    </span>
                </div>
            </div>
            {officeNotFound && <div className="text-red-500 text-center mb-2">Office not found.</div>}

            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {officeSearchResult ? (
                        (() => {
                            const office = officeSearchResult;
                            return (
                                <div className="border-2 border-[#42befb] flex flex-col  w-70 rounded-lg p-4 hover:shadow-lg transition-shadow">
                                    <h2 className="text-2xl text-center font-semibold mb-2">Office {office.officeCode}</h2>
                                    <p className='font-semibold'>Office Code: {office.officeCode}</p>
                                    <p className='font-semibold'>{office.city}</p>
                                    <p className='font-semibold'>{office.addressLine1}</p>
                                    <p className='font-semibold'>{office.addressLine2 || 'N/A'}</p>
                                    <p className='font-semibold'>{office.country}</p>
                                    <p className='font-semibold'>{office.state || 'N/A'}</p>
                                    <p className='font-semibold'>{office.phone}</p>
                                    <div className="flex flex-row gap-6 items-right mt-4">
                                        <MdEdit className='w-7 h-7 cursor-pointer' onClick={() => openEditModal(office)} />
                                        <MdDelete className='w-7 h-7 cursor-pointer' onClick={() => openDeleteConfirm(office)} />
                                    </div>
                                </div>
                            );
                        })()
                    ) : (
                        offices.map((office, idx) => (
                            <div key={idx} className="border-2 border-[#42befb] flex flex-col  w-70 rounded-lg p-4 hover:shadow-lg transition-shadow">
                                <h2 className="text-2xl text-center font-semibold mb-2">Office {office.officeCode}</h2>
                                <p className='font-semibold'>Office Code: {office.officeCode}</p>
                                <p className='font-semibold'>{office.city}</p>
                                <p className='font-semibold'>{office.addressLine1}</p>
                                <p className='font-semibold'>{office.addressLine2 || 'N/A'}</p>
                                <p className='font-semibold'>{office.country}</p>
                                <p className='font-semibold'>{office.state || 'N/A'}</p>
                                <p className='font-semibold'>{office.phone}</p>
                                <div className="flex flex-row gap-6 items-right mt-4">
                                    <MdEdit className='w-7 h-7 cursor-pointer' onClick={() => openEditModal(office)} />
                                    <MdDelete className='w-7 h-7 cursor-pointer' onClick={() => openDeleteConfirm(office)} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            {successMsg && <div className="text-green-600 text-center mb-2">{successMsg}</div>}

            {/* Edit Office Modal */}
            {editModal.open && (
                <div className="fixed inset-0 flex items-center justify-center bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
                        <button
                            className="absolute top-2 right-4 text-2xl text-gray-500 hover:text-black"
                            onClick={() => setEditModal({ open: false, office: null })}
                        >
                            &times;
                        </button>
                        <h2 className="text-xl font-bold mb-4">Edit Office</h2>
                        <form onSubmit={handleEditOffice} className="flex flex-col gap-3">
                            <input name="officeCode" value={editForm.officeCode} onChange={handleEditInputChange} required placeholder="Office Code" className="border p-2 rounded" />
                            <input name="addressLine1" value={editForm.addressLine1} onChange={handleEditInputChange} required placeholder="Address Line 1" className="border p-2 rounded" />
                            <input name="addressLine2" value={editForm.addressLine2} onChange={handleEditInputChange} placeholder="Address Line 2" className="border p-2 rounded" />
                            <input name="city" value={editForm.city} onChange={handleEditInputChange} required placeholder="City" className="border p-2 rounded" />
                            <input name="country" value={editForm.country} onChange={handleEditInputChange} required placeholder="Country" className="border p-2 rounded" />
                            <input name="phone" value={editForm.phone} onChange={handleEditInputChange} required placeholder="Phone" className="border p-2 rounded" />
                            <input name="postalCode" value={editForm.postalCode} onChange={handleEditInputChange} required placeholder="Postal Code" className="border p-2 rounded" />
                            <input name="state" value={editForm.state} onChange={handleEditInputChange} placeholder="State" className="border p-2 rounded" />
                            <input name="territory" value={editForm.territory} onChange={handleEditInputChange} placeholder="Territory" className="border p-2 rounded" />
                            {editError && <div className="text-red-500 text-sm">{editError}</div>}
                            <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2 mt-2 hover:bg-blue-600 transition" disabled={editLoading}>
                                {editLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {deleteConfirm.open && (
                <div className="fixed inset-0 flex items-center justify-center bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
                        <button
                            className="absolute top-2 right-4 text-2xl text-gray-500 hover:text-black"
                            onClick={() => setDeleteConfirm({ open: false, office: null })}
                        >
                            &times;
                        </button>
                        <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                        <p>Are you sure you want to delete <b>Office {deleteConfirm.office?.officeCode}</b>?</p>
                        {deleteError && <div className="text-red-500 text-sm mt-2">{deleteError}</div>}
                        <div className="flex gap-4 mt-6">
                            <button
                                className="bg-gray-300 text-black rounded px-4 py-2 hover:bg-gray-400 transition"
                                onClick={() => setDeleteConfirm({ open: false, office: null })}
                                disabled={deleteLoading}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600 transition"
                                onClick={handleDeleteOffice}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Offices;
