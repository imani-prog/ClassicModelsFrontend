import { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { IoSearch } from 'react-icons/io5';

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
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search office"
                        className="border-2 border-black bg-[#f5f5f5] rounded-md py-2 pl-13 pr-4"
                    />
                    <span className="absolute  left-3 top-2.5 ">
                        <IoSearch className="w-5 h-5" />
                    </span>
                </div>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {offices.map((office, idx) => (
                        <div key={idx} className="border-2 border-[#42befb] flex flex-col  w-70 rounded-lg p-4 hover:shadow-lg transition-shadow">
                            <h2 className="text-2xl text-center font-semibold mb-2">Office {office.officeCode}</h2>
                            <p className='font-semibold'>Office Code: {office.officeCode}</p>
                            <p className='font-semibold'>{office.city}</p>
                            <p className='font-semibold'>{office.addressLine1}</p>
                            <p className='font-semibold'>{office.addressLine2 || 'N/A'}</p>
                            <p className='font-semibold'>{office.country}</p>
                            <p className='font-semibold'>{office.state || 'N/A'}</p>
                            <p className='font-semibold'>{office.phone}</p>
                        </div>
                    ))}
                </div>
            )}
            
        </div>
    );
};

export default Offices;
