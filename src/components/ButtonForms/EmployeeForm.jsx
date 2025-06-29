import { useEffect, useState } from 'react';
import { FaUserTie } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

const EmployeeForm = ({ showForm, onClose, onSubmit }) => {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        jobTitle: '',
        officeCode: '',
        reportsTo: ''
    });
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (showForm) {
            // Fetch employees for "Reports To" dropdown
            fetch('http://localhost:8081/employees')
                .then(res => res.json())
                .then(data => setEmployees(data))
                .catch(err => console.error('Failed to fetch employees:', err));
        }
    }, [showForm]);

    if (!showForm) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                ...form,
                reportsTo: form.reportsTo || null
            };

            const response = await fetch('http://localhost:8081/employees/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to add employee');
            }

            const result = await response.json();
            setSuccess('Employee added successfully!');
            
            // Reset form
            setForm({
                firstName: '',
                lastName: '',
                email: '',
                jobTitle: '',
                officeCode: '',
                reportsTo: ''
            });
            
            // Call parent callback if provided
            if (onSubmit) {
                onSubmit(result);
            }

            // Auto close after success
            setTimeout(() => {
                setSuccess('');
                onClose();
            }, 1500);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
            <form 
                onSubmit={handleSubmit} 
                className="relative bg-white border border-blue-300 rounded-lg p-6 w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto z-10"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaUserTie className="text-blue-600" />
                        Add New Employee
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-600 transition-colors text-2xl"
                    >
                        <IoMdClose />
                    </button>
                </div>

                {/* Messages */}
                {error && <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">{error}</div>}
                {success && <div className="text-green-600 mb-4 p-3 bg-green-50 rounded">{success}</div>}

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input 
                            name="firstName" 
                            value={form.firstName} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter first name"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <input 
                            name="lastName" 
                            value={form.lastName} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter last name"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input 
                            name="email" 
                            type="email" 
                            value={form.email} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="employee@company.com"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                        <input 
                            name="jobTitle" 
                            value={form.jobTitle} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter job title"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Office Code *</label>
                        <input 
                            name="officeCode" 
                            value={form.officeCode} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter office code"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reports To</label>
                        <select 
                            name="reportsTo" 
                            value={form.reportsTo} 
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select manager (optional)</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.firstName} {emp.lastName} - {emp.jobTitle}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium"
                    >
                        {loading ? 'Saving...' : 'Save Employee'}
                    </button>
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EmployeeForm;
