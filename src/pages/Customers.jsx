import { useEffect, useState } from 'react';
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
        if (window.confirm('Are you sure you want to delete this customer?')) {
            fetch(`http://localhost:8081/customers/${customerId}`, {
                method: 'DELETE'
            })
                .then((res) => {
                    if (!res.ok) throw new Error('Failed to delete customer');
                    fetchCustomers();
                })
                .catch((err) => {
                    alert(err.message);
                });
        }
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
            })
            .catch((err) => {
                alert(err.message);
            })
            .finally(() => setSaving(false));
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
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search customers"
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
                <table className="w-full border overflow-x-scroll border-blue-300">
                    <thead className="bg-[#f5f5f5] border-b-2 border-[#258cbf]">
                        <tr>
                            <th className="px-2 py-1 text-center whitespace-nowrap">Customer Name</th>
                            <th className="px-2 py-1 text-center whitespace-nowrap">Customer Number</th>
                            <th className="px-2 py-1 text-center whitespace-nowrap">Contact First Name</th>
                            <th className="px-2 py-1 text-center whitespace-nowrap">Contact Last Name</th>
                            <th className="px-2 py-1 text-center whitespace-nowrap">Phone</th>
                            <th className="px-2 py-1 text-center whitespace-nowrap">Address Line 1</th>
                            <th className="px-2 py-1 text-center whitespace-nowrap">Address Line 2</th>
                            <th className="px-2 py-1 text-center whitespace-nowrap">City</th>
                            <th className="px-2 py-1 text-center whitespace-nowrap">State</th>
                            <th className="px-2 py-1 text-center whitespace-nowrap">Country</th>
                            <th className="px-2 py-1 text-center whitespace-nowrap">Postal Code</th>
                            <th className="px-2 py-1 text-center whitespace-nowrap">Credit Limit</th>
                            <th className="px-2 py-1 text-center whitespace-nowrap">Sales Rep Employee Number</th>
                            <th className="px-2 py-1 text-center whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="border-t-2 font-medium text-center border-[#42befb] px-2 py-1 whitespace-nowrap">{customer.customerName}</td>
                                <td className="border-t-2 font-medium text-center border-[#42befb] px-2 py-1 whitespace-nowrap">{customer.id}</td>
                                <td className="border-t-2 font-medium text-center border-[#42befb] px-2 py-1 whitespace-nowrap">{customer.contactFirstName}</td>
                                <td className="border-t-2 font-medium text-center border-[#42befb] px-2 py-1 whitespace-nowrap">{customer.contactLastName}</td>
                                <td className="border-t-2 font-medium text-center border-[#42befb] px-2 py-1 whitespace-nowrap">{customer.phone}</td>
                                <td className="border-t-2 font-medium text-center border-[#42befb] px-2 py-1 whitespace-nowrap">{customer.addressLine1}</td>
                                <td className="border-t-2 font-medium text-center border-[#42befb] px-2 py-1 whitespace-nowrap">{customer.addressLine2 || ''}</td>
                                <td className="border-t-2 font-medium text-center border-[#42befb] px-2 py-1 whitespace-nowrap">{customer.city}</td>
                                <td className="border-t-2 font-medium text-center border-[#42befb] px-2 py-1 whitespace-nowrap">{customer.state || ''}</td>
                                <td className="border-t-2 font-medium text-center border-[#42befb] px-2 py-1 whitespace-nowrap">{customer.country}</td>
                                <td className="border-t-2 font-medium text-center border-[#42befb] px-2 py-1 whitespace-nowrap">{customer.postalCode}</td>
                                <td className="border-t-2 font-medium text-center border-[#42befb] px-2 py-1 whitespace-nowrap">{customer.creditLimit}</td>
                                <td className="border-t-2 font-medium text-center border-[#42befb] px-2 py-1 whitespace-nowrap">{customer.salesRepEmployeeNumber ? customer.salesRepEmployeeNumber.id : ''}</td>
                                <td className="border-t-2 font-medium text-center border-[#42befb] px-2 py-1 whitespace-nowrap">
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
            )}
        </div>
    )
}

export default Customers