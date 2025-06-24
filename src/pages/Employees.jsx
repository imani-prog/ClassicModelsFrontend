import { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { IoSearch } from 'react-icons/io5';
import { MdDelete, MdEdit } from 'react-icons/md';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        jobTitle: '',
        officeCode: '',
        reportsTo: '',
    });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState('');
    const [editModal, setEditModal] = useState({ open: false, employee: null });
    const [editForm, setEditForm] = useState({
        firstName: '', lastName: '', email: '', jobTitle: '', officeCode: '', reportsTo: ''
    });
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, employee: null });
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        setLoading(true);
        fetch('http://localhost:8081/employees')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch employees');
                return res.json();
            })
            .then(data => setEmployees(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const filteredEmployees = employees.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        emp.email?.toLowerCase().includes(search.toLowerCase()) ||
        String(emp.id || '').includes(search)
    );

    // Build a map of employee.id => full name
    const employeeIdToName = {};
    employees.forEach(emp => {
        const fullName = `${emp.firstName} ${emp.lastName}`;
        employeeIdToName[String(emp.id)] = fullName;
    });

    const handleAddInputChange = (e) => {
        const { name, value } = e.target;
        setAddForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddEmployee = (e) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError('');
        fetch('http://localhost:8081/employees/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...addForm,
                reportsTo: addForm.reportsTo ? Number(addForm.reportsTo) : null,
                officeCode: addForm.officeCode,
            })
        })
        .then(res => {
            if (!res.ok) throw new Error('Failed to add employee');
            return res.json();
        })
        .then(newEmp => {
            setEmployees(prev => [...prev, newEmp]);
            setShowAddModal(false);
            setAddForm({ firstName: '', lastName: '', email: '', jobTitle: '', officeCode: '', reportsTo: '' });
        })
        .catch(err => setAddError(err.message))
        .finally(() => setAddLoading(false));
    };

    const handleEmployeeSearch = () => {
        setNotFound(false);
        if (!search.trim()) {
            setSearchResult(null);
            return;
        }
        const term = search.trim().toLowerCase();
        const found = employees.find(emp =>
            `${emp.firstName} ${emp.lastName}`.toLowerCase() === term ||
            String(emp.id) === term
        );
        if (found) {
            setSearchResult(found);
        } else {
            setSearchResult(null);
            setNotFound(true);
        }
    };

    const openEditModal = (employee) => {
        setEditForm({
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            jobTitle: employee.jobTitle,
            officeCode: employee.officeCode,
            reportsTo: employee.reportsTo || '',
        });
        setEditModal({ open: true, employee });
        setEditError('');
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEditEmployee = (e) => {
        e.preventDefault();
        setEditLoading(true);
        setEditError('');
        fetch(`http://localhost:8081/employees/${editModal.employee.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...editForm,
                reportsTo: editForm.reportsTo ? Number(editForm.reportsTo) : null,
                officeCode: editForm.officeCode,
            })
        })
        .then(res => {
            if (!res.ok) throw new Error('Failed to update employee');
            return res.json();
        })
        .then(updatedEmp => {
            setEmployees(prev => prev.map(emp => emp.id === updatedEmp.id ? updatedEmp : emp));
            setEditModal({ open: false, employee: null });
            setSuccessMsg('Employee updated successfully!');
            setTimeout(() => setSuccessMsg(''), 2000);
        })
        .catch(err => setEditError(err.message))
        .finally(() => setEditLoading(false));
    };

    const openDeleteConfirm = (employee) => {
        setDeleteConfirm({ open: true, employee });
        setDeleteError('');
    };

    const handleDeleteEmployee = () => {
        setDeleteLoading(true);
        setDeleteError('');
        fetch(`http://localhost:8081/employees/${deleteConfirm.employee.id}`, {
            method: 'DELETE'
        })
        .then(res => {
            if (!res.ok) throw new Error('Failed to delete employee');
            setEmployees(prev => prev.filter(emp => emp.id !== deleteConfirm.employee.id));
            setDeleteConfirm({ open: false, employee: null });
            setSuccessMsg('Employee deleted successfully!');
            setTimeout(() => setSuccessMsg(''), 2000);
        })
        .catch(err => setDeleteError(err.message))
        .finally(() => setDeleteLoading(false));
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className='items-center justify-center w-full flex flex-col mb-6'>
                <h1 className="text-3xl font-bold text-center mb-6">Employees</h1>
                <button
                    className="bg-[#4a90e2] flex flex-row items-center gap-2 cursor-pointer text-white px-8 py-1.5 rounded hover:bg-blue-400 transition"
                    onClick={() => setShowAddModal(true)}
                >
                    <FaPlus className='text-black text-lg' />
                    Add Employee
                </button>
            </div>
            {/* Add Employee Modal */}
            {showAddModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
                        <button
                            className="absolute top-2 right-4 text-2xl text-gray-500 hover:text-black"
                            onClick={() => setShowAddModal(false)}
                        >
                            &times;
                        </button>
                        <h2 className="text-xl font-bold mb-4">Add New Employee</h2>
                        <form onSubmit={handleAddEmployee} className="flex flex-col gap-3">
                            <input
                                name="firstName"
                                value={addForm.firstName}
                                onChange={handleAddInputChange}
                                placeholder="First Name"
                                className="border rounded px-3 py-2"
                                required
                            />
                            <input
                                name="lastName"
                                value={addForm.lastName}
                                onChange={handleAddInputChange}
                                placeholder="Last Name"
                                className="border rounded px-3 py-2"
                                required
                            />
                            <input
                                name="email"
                                value={addForm.email}
                                onChange={handleAddInputChange}
                                placeholder="Email"
                                className="border rounded px-3 py-2"
                                required
                            />
                            <input
                                name="jobTitle"
                                value={addForm.jobTitle}
                                onChange={handleAddInputChange}
                                placeholder="Job Title"
                                className="border rounded px-3 py-2"
                                required
                            />
                            <input
                                name="officeCode"
                                value={addForm.officeCode}
                                onChange={handleAddInputChange}
                                placeholder="Office Code"
                                className="border rounded px-3 py-2"
                                required
                            />
                            <select
                                name="reportsTo"
                                value={addForm.reportsTo}
                                onChange={handleAddInputChange}
                                className="border rounded px-3 py-2"
                            >
                                <option value="">Reports To (optional)</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.firstName} {emp.lastName}
                                    </option>
                                ))}
                            </select>
                            {addError && <div className="text-red-500 text-sm">{addError}</div>}
                            <button
                                type="submit"
                                className="bg-blue-500 text-white rounded px-4 py-2 mt-2 hover:bg-blue-600 transition"
                                disabled={addLoading}
                            >
                                {addLoading ? 'Saving...' : 'Save'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Edit Employee Modal */}
            {editModal.open && (
                <div className="fixed inset-0 flex items-center justify-center  bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
                        <button
                            className="absolute top-2 right-4 text-2xl text-gray-500 hover:text-black"
                            onClick={() => setEditModal({ open: false, employee: null })}
                        >
                            &times;
                        </button>
                        <h2 className="text-xl font-bold mb-4">Edit Employee</h2>
                        <form onSubmit={handleEditEmployee} className="flex flex-col gap-3">
                            <input
                                name="firstName"
                                value={editForm.firstName}
                                onChange={handleEditInputChange}
                                placeholder="First Name"
                                className="border rounded px-3 py-2"
                                required
                            />
                            <input
                                name="lastName"
                                value={editForm.lastName}
                                onChange={handleEditInputChange}
                                placeholder="Last Name"
                                className="border rounded px-3 py-2"
                                required
                            />
                            <input
                                name="email"
                                value={editForm.email}
                                onChange={handleEditInputChange}
                                placeholder="Email"
                                className="border rounded px-3 py-2"
                                required
                            />
                            <input
                                name="jobTitle"
                                value={editForm.jobTitle}
                                onChange={handleEditInputChange}
                                placeholder="Job Title"
                                className="border rounded px-3 py-2"
                                required
                            />
                            <input
                                name="officeCode"
                                value={editForm.officeCode}
                                onChange={handleEditInputChange}
                                placeholder="Office Code"
                                className="border rounded px-3 py-2"
                                required
                            />
                            <select
                                name="reportsTo"
                                value={editForm.reportsTo}
                                onChange={handleEditInputChange}
                                className="border rounded px-3 py-2"
                            >
                                <option value="">Reports To (optional)</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.firstName} {emp.lastName}
                                    </option>
                                ))}
                            </select>
                            {editError && <div className="text-red-500 text-sm">{editError}</div>}
                            <button
                                type="submit"
                                className="bg-blue-500 text-white rounded px-4 py-2 mt-2 hover:bg-blue-600 transition"
                                disabled={editLoading}
                            >
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
                            onClick={() => setDeleteConfirm({ open: false, employee: null })}
                        >
                            &times;
                        </button>
                        <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                        <p>Are you sure you want to delete <b>{deleteConfirm.employee?.firstName} {deleteConfirm.employee?.lastName}</b>?</p>
                        {deleteError && <div className="text-red-500 text-sm mt-2">{deleteError}</div>}
                        <div className="flex gap-4 mt-6">
                            <button
                                className="bg-gray-300 text-black rounded px-4 py-2 hover:bg-gray-400 transition"
                                onClick={() => setDeleteConfirm({ open: false, employee: null })}
                                disabled={deleteLoading}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600 transition"
                                onClick={handleDeleteEmployee}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {successMsg && <div className="text-green-600 text-center mb-2">{successMsg}</div>}
            <div className="flex items-center justify-between mb-4">
                <div className="relative flex flex-row gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Search by name or employee number"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border-2 border-black bg-[#f5f5f5] rounded-md py-2 pl-13 pr-4"
                    />
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                        onClick={handleEmployeeSearch}
                    >
                        Search Employee
                    </button>
                    <span className="absolute left-3 top-2.5 ">
                        <IoSearch className="w-5 h-5" />
                    </span>
                </div>
            </div>
            {notFound && <div className="text-red-500 text-center mb-2">Employee not found.</div>}
            {loading && <div className="text-center">Loading...</div>}
            {error && <div className="text-red-500 text-center mb-2">{error}</div>}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {searchResult ? (
                    (() => {
                        const employee = searchResult;
                        let reportsToDisplay = '-';
                        if (employee.reportsTo) {
                            const supervisorName = employeeIdToName[String(employee.reportsTo)];
                            reportsToDisplay = supervisorName ? supervisorName : `Employee #${employee.reportsTo}`;
                        }
                        return (
                            <div key={employee.id} className="border-2 border-[#42befb] flex flex-col items-center w-70 rounded-lg p-4 hover:shadow-lg transition-shadow">
                                <h2 className="text-2xl font-bold mb-2">{`${employee.firstName} ${employee.lastName}`}</h2>
                                <p className="text-lg font-semibold mb-2">{employee.jobTitle}</p>
                                <p>Office Code {employee.officeCode}</p>
                                <p>{employee.email}</p>
                                <p>Reports to {reportsToDisplay}</p>
                                <div className="flex flex-row gap-6 items-right mt-4">
                                    <MdEdit className='w-7 h-7 cursor-pointer' onClick={() => openEditModal(employee)} />
                                    <MdDelete className='w-7 h-7 cursor-pointer' onClick={() => openDeleteConfirm(employee)} />
                                </div>
                            </div>
                        );
                    })()
                ) : (
                    filteredEmployees.map((employee, idx) => {
                        let reportsToDisplay = '-';
                        if (employee.reportsTo) {
                            const supervisorName = employeeIdToName[String(employee.reportsTo)];
                            reportsToDisplay = supervisorName ? supervisorName : `Employee #${employee.reportsTo}`;
                        }
                        return (
                            <div key={employee.id || idx} className="border-2 border-[#42befb] flex flex-col items-center w-70 rounded-lg p-4 hover:shadow-lg transition-shadow">
                                <h2 className="text-2xl font-bold mb-2">{`${employee.firstName} ${employee.lastName}`}</h2>
                                <p className="text-lg font-semibold mb-2">{employee.jobTitle}</p>
                                <p>Office Code {employee.officeCode}</p>
                                <p>{employee.email}</p>
                                <p>Reports to {reportsToDisplay}</p>
                                <div className="flex flex-row gap-6 items-right mt-4">
                                    <MdEdit className='w-7 h-7 cursor-pointer' onClick={() => openEditModal(employee)} />
                                    <MdDelete className='w-7 h-7 cursor-pointer' onClick={() => openDeleteConfirm(employee)} />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Employees;
