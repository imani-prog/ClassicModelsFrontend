import { useEffect, useState } from 'react';
import { FaBuilding, FaEdit, FaFilter, FaList, FaPlus, FaTh, FaTrash, FaUsers } from 'react-icons/fa';
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

    // New state for enhanced features
    const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'
    const [sortBy, setSortBy] = useState('name'); // 'name', 'title', 'office'
    const [filterOffice, setFilterOffice] = useState('');
    const [filterJobTitle, setFilterJobTitle] = useState('');
    const [showFilters, setShowFilters] = useState(false);

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

    // Enhanced filtering and sorting logic
    const filteredEmployees = employees
        .filter(emp => {
            // Text search filter
            const textMatch = `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
                emp.email?.toLowerCase().includes(search.toLowerCase()) ||
                String(emp.id || '').includes(search);
            
            // Office filter
            const officeMatch = !filterOffice || emp.officeCode === filterOffice;
            
            // Job title filter
            const titleMatch = !filterJobTitle || emp.jobTitle?.toLowerCase().includes(filterJobTitle.toLowerCase());
            
            return textMatch && officeMatch && titleMatch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
                case 'title':
                    return (a.jobTitle || '').localeCompare(b.jobTitle || '');
                case 'office':
                    return (a.officeCode || '').localeCompare(b.officeCode || '');
                default:
                    return 0;
            }
        });

    // Get unique values for filter options
    const uniqueOffices = [...new Set(employees.map(emp => emp.officeCode).filter(Boolean))];
    const uniqueJobTitles = [...new Set(employees.map(emp => emp.jobTitle).filter(Boolean))];

    // Calculate statistics
    const totalEmployees = employees.length;
    const totalOffices = uniqueOffices.length;
    
    // Supervisors: employees who have at least one direct report
    const supervisors = employees.filter(emp => 
        employees.some(other => other.reportsTo === emp.id)
    ).length;
    
    // Alternative calculations (you can switch to any of these):
    
    // Option 1: Total number of direct reporting relationships
    // const totalDirectReports = employees.filter(emp => emp.reportsTo).length;
    
    // Option 2: Employees without a supervisor (top-level managers)
    // const topLevelManagers = employees.filter(emp => !emp.reportsTo).length;
    
    // Option 3: Average team size per supervisor
    // const avgTeamSize = supervisors > 0 ? 
    //     Math.round(employees.filter(emp => emp.reportsTo).length / supervisors) : 0;

    // Helper function to render employee card
    const renderEmployeeCard = (employee, idx) => {
        let reportsToDisplay = '-';
        if (employee.reportsTo) {
            const supervisorName = employeeIdToName[String(employee.reportsTo)];
            reportsToDisplay = supervisorName ? supervisorName : `Employee #${employee.reportsTo}`;
        }
        return (
            <div key={employee.id || idx} className="bg-white border-2 border-[#42befb] rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex flex-col h-full">
                    <h2 className="text-xl font-bold text-center mb-3 text-blue-700">{`${employee.firstName} ${employee.lastName}`}</h2>
                    <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-3 gap-1 text-sm">
                            <span className="font-medium text-gray-600">Position:</span>
                            <span className="col-span-2 font-semibold">{employee.jobTitle}</span>
                            
                            <span className="font-medium text-gray-600">Office:</span>
                            <span className="col-span-2 font-semibold">{employee.officeCode}</span>
                            
                            <span className="font-medium text-gray-600">Email:</span>
                            <span className="col-span-2 font-semibold break-all">{employee.email}</span>
                            
                            <span className="font-medium text-gray-600">Reports to:</span>
                            <span className="col-span-2 font-semibold">{reportsToDisplay}</span>
                        </div>
                    </div>
                    <div className="flex justify-center gap-3 mt-4 pt-3 border-t">
                        <button
                            onClick={() => openEditModal(employee)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded flex items-center gap-1 transition"
                        >
                            <FaEdit className="w-3 h-3" />
                            Edit
                        </button>
                        <button
                            onClick={() => openDeleteConfirm(employee)}
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

    // Helper function to render employee list row
    const renderEmployeeListRow = (employee, idx) => {
        let reportsToDisplay = '-';
        if (employee.reportsTo) {
            const supervisorName = employeeIdToName[String(employee.reportsTo)];
            reportsToDisplay = supervisorName ? supervisorName : `Employee #${employee.reportsTo}`;
        }
        return (
            <tr key={employee.id || idx} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold">{`${employee.firstName} ${employee.lastName}`}</td>
                <td className="py-3 px-4">{employee.jobTitle}</td>
                <td className="py-3 px-4">{employee.officeCode}</td>
                <td className="py-3 px-4">{employee.email}</td>
                <td className="py-3 px-4">{reportsToDisplay}</td>
                <td className="py-3 px-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => openEditModal(employee)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded flex items-center gap-1 transition text-xs"
                        >
                            <FaEdit className="w-3 h-3" />
                            Edit
                        </button>
                        <button
                            onClick={() => openDeleteConfirm(employee)}
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
            setSuccessMsg('Employee added successfully!');
            setTimeout(() => setSuccessMsg(''), 2000);
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
        <div className="max-w-6xl mx-auto px-2 h-full flex flex-col pt-2">
            {/* Global Success Messages */}
            {successMsg && <div className="text-green-600 mb-2 text-center font-semibold">{successMsg}</div>}
            
            {/* Header Section - Fixed height */}
            <div className='flex items-start justify-between mb-3 flex-shrink-0'>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold mb-1">Employees</h1>
                    <p className="text-gray-600 text-sm">Manage employee information and organizational structure</p>
                </div>
                
                {/* Quick Stats */}
                <div className="flex gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-center">
                        <div className="flex items-center gap-2 text-blue-600">
                            <FaUsers className="text-lg" />
                            <div>
                                <div className="text-xl font-bold">{totalEmployees}</div>
                                <div className="text-xs">Total Employees</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-center">
                        <div className="flex items-center gap-2 text-green-600">
                            <FaBuilding className="text-lg" />
                            <div>
                                <div className="text-xl font-bold">{totalOffices}</div>
                                <div className="text-xs">Office Locations</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 text-center">
                        <div className="flex items-center gap-2 text-purple-600">
                            <FaUsers className="text-lg" />
                            <div>
                                <div className="text-xl font-bold">{supervisors}</div>
                                <div className="text-xs">People Managers</div>
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
                                placeholder="Search by name or employee number"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleEmployeeSearch()}
                                className="border-2 border-black bg-[#f5f5f5] rounded-md py-2 pl-10 pr-4"
                            />
                            <button
                                className="absolute left-3 top-2.5 hover:text-blue-600 transition-colors cursor-pointer"
                                onClick={handleEmployeeSearch}
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
                            <option value="name">Sort by Name</option>
                            <option value="title">Sort by Job Title</option>
                            <option value="office">Sort by Office</option>
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
                            onClick={() => setShowAddModal(true)}
                            className="bg-[#4a90e2] items-center flex flex-row gap-2 cursor-pointer text-white px-6 py-2 rounded hover:bg-blue-400 transition"
                        >
                            <FaPlus className='text-black text-lg' />
                            Add Employee
                        </button>
                    </div>
                </div>

                {/* Collapsible Filters */}
                {showFilters && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Filter by Office
                                </label>
                                <select
                                    value={filterOffice}
                                    onChange={e => setFilterOffice(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md py-2 px-3 bg-white"
                                >
                                    <option value="">All Offices</option>
                                    {uniqueOffices.map(office => (
                                        <option key={office} value={office}>{office}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Filter by Job Title
                                </label>
                                <select
                                    value={filterJobTitle}
                                    onChange={e => setFilterJobTitle(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md py-2 px-3 bg-white"
                                >
                                    <option value="">All Job Titles</option>
                                    {uniqueJobTitles.map(title => (
                                        <option key={title} value={title}>{title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {notFound && <div className="text-red-500 mb-2">Employee not found.</div>}
                {error && <div className="text-red-500 mb-2">{error}</div>}
                
                {/* Results Counter */}
                {!searchResult && filteredEmployees.length > 0 && (
                    <div className="text-sm text-gray-600 mb-2">
                        Showing {filteredEmployees.length} of {employees.length} employees
                        {(filterOffice || filterJobTitle) && (
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
                ) : (
                    <div className="h-full overflow-auto">
                        {searchResult ? (
                            // Single search result
                            <div className={viewMode === 'cards' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : ''}>
                                {viewMode === 'cards' ? (
                                    renderEmployeeCard(searchResult, 0)
                                ) : (
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Name</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Job Title</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Office</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Email</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Reports To</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {renderEmployeeListRow(searchResult, 0)}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // All employees or filtered results
                            <>
                                {filteredEmployees.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <FaUsers className="mx-auto mb-4 text-4xl text-gray-300" />
                                        <p className="text-lg mb-2">No employees found</p>
                                        <p className="text-sm">
                                            {employees.length === 0 
                                                ? "Get started by adding your first employee"
                                                : "Try adjusting your search criteria or filters"
                                            }
                                        </p>
                                    </div>
                                ) : viewMode === 'cards' ? (
                                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                        {filteredEmployees.map((employee, idx) => renderEmployeeCard(employee, idx))}
                                    </div>
                                ) : (
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                                                <tr>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Name</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Job Title</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Office</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Email</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Reports To</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredEmployees.map((employee, idx) => renderEmployeeListRow(employee, idx))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
            {/* Add Employee Modal */}
            <Modal open={showAddModal} onClose={() => {
                setShowAddModal(false);
                setAddForm({ firstName: '', lastName: '', email: '', jobTitle: '', officeCode: '', reportsTo: '' });
                setAddError('');
            }}>
                <form onSubmit={handleAddEmployee}>
                    <h2 className="text-xl font-bold mb-4">Add New Employee</h2>
                    {addError && <div className="text-red-500 mb-2">{addError}</div>}
                    <div className="grid grid-cols-2 gap-3 items-center">
                        <label className="font-medium text-gray-700">First Name:</label>
                        <input name="firstName" value={addForm.firstName} onChange={handleAddInputChange} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Last Name:</label>
                        <input name="lastName" value={addForm.lastName} onChange={handleAddInputChange} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Email:</label>
                        <input name="email" type="email" value={addForm.email} onChange={handleAddInputChange} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Job Title:</label>
                        <input name="jobTitle" value={addForm.jobTitle} onChange={handleAddInputChange} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Office Code:</label>
                        <input name="officeCode" value={addForm.officeCode} onChange={handleAddInputChange} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Reports To:</label>
                        <select name="reportsTo" value={addForm.reportsTo} onChange={handleAddInputChange} className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select (optional)</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.firstName} {emp.lastName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button type="submit" disabled={addLoading} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                            {addLoading ? 'Saving...' : 'Save Employee'}
                        </button>
                        <button type="button" onClick={() => {
                            setShowAddModal(false);
                            setAddForm({ firstName: '', lastName: '', email: '', jobTitle: '', officeCode: '', reportsTo: '' });
                            setAddError('');
                        }} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition">Cancel</button>
                    </div>
                </form>
            </Modal>

            {/* Edit Employee Modal */}
            <Modal open={editModal.open} onClose={() => setEditModal({ open: false, employee: null })}>
                <form onSubmit={handleEditEmployee}>
                    <h2 className="text-xl font-bold mb-4">Edit Employee</h2>
                    {editError && <div className="text-red-500 mb-2">{editError}</div>}
                    <div className="grid grid-cols-2 gap-3 items-center">
                        <label className="font-medium text-gray-700">First Name:</label>
                        <input name="firstName" value={editForm.firstName} onChange={handleEditInputChange} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Last Name:</label>
                        <input name="lastName" value={editForm.lastName} onChange={handleEditInputChange} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Email:</label>
                        <input name="email" type="email" value={editForm.email} onChange={handleEditInputChange} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Job Title:</label>
                        <input name="jobTitle" value={editForm.jobTitle} onChange={handleEditInputChange} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Office Code:</label>
                        <input name="officeCode" value={editForm.officeCode} onChange={handleEditInputChange} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Reports To:</label>
                        <select name="reportsTo" value={editForm.reportsTo} onChange={handleEditInputChange} className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select (optional)</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.firstName} {emp.lastName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button type="submit" disabled={editLoading} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                            {editLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={() => setEditModal({ open: false, employee: null })} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition">Cancel</button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, employee: null })}>
                <div>
                    <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                    <p className="mb-4">Are you sure you want to delete <strong>{deleteConfirm.employee?.firstName} {deleteConfirm.employee?.lastName}</strong>?</p>
                    {deleteError && <div className="text-red-500 mb-2">{deleteError}</div>}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setDeleteConfirm({ open: false, employee: null })}
                            disabled={deleteLoading}
                            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteEmployee}
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

export default Employees;
