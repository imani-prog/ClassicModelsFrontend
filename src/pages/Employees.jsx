import { useEffect, useState } from 'react'; 
import { FaPlus } from 'react-icons/fa';
import { IoSearch } from 'react-icons/io5';
import { MdDelete, MdEdit } from 'react-icons/md';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
        emp.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
        emp.email?.toLowerCase().includes(search.toLowerCase()) ||
        String(emp.employeeNumber || '').includes(search)
    );

    // Build a map of employeeNumber to full name for quick lookup
    const employeeNumberToName = {};
    employees.forEach(emp => {
        const fullName = (emp.firstName && emp.lastName)
            ? `${emp.firstName} ${emp.lastName}`
            : (emp.employeeName || '');
        employeeNumberToName[String(emp.employeeNumber)] = fullName;
    });

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className='items-center justify-center w-full flex flex-col mb-6'>
                <h1 className="text-3xl font-bold text-center mb-6">Employees</h1>
                <button className="bg-[#4a90e2] flex flex-row items-center gap-2 cursor-pointer text-white px-8 py-1.5 rounded hover:bg-blue-400 transition">
                    <FaPlus className='text-black text-lg' />
                    Add Employee
                </button>
            </div>
            <div className="flex items-center justify-between mb-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search employee"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border-2 border-black bg-[#f5f5f5] rounded-md py-2 pl-13 pr-4"
                    />
                    <span className="absolute left-3 top-2.5 ">
                        <IoSearch className="w-5 h-5" />
                    </span>
                </div>
            </div>
            {loading && <div className="text-center">Loading...</div>}
            {error && <div className="text-red-500 text-center mb-2">{error}</div>}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {filteredEmployees.map((employee, idx) => {
                    let reportsToDisplay = '-';

                    if (employee.reportsTo) {
                        const supervisorName = employeeNumberToName[String(employee.reportsTo)];
                        reportsToDisplay = supervisorName ? supervisorName : `Employee #${employee.reportsTo}`;
                    }

                    return (
                        <div key={employee.employeeNumber || idx} className="border-2 border-[#42befb] flex flex-col items-center w-70 rounded-lg p-4 hover:shadow-lg transition-shadow">
                            <h2 className="text-2xl font-bold mb-2">{employee.firstName ? `${employee.firstName} ${employee.lastName}` : employee.employeeName}</h2>
                            <p className="text-lg font-semibold mb-2">{employee.jobTitle}</p>
                            <p>Office Code {employee.officeCode}</p>
                            <p>{employee.email}</p>
                            <p>Reports to {reportsToDisplay}</p>
                            <div className="flex flex-row gap-6 items-right mt-4">
                                <MdEdit className='w-7 h-7 cursor-pointer' />
                                <MdDelete className='w-7 h-7 cursor-pointer' />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Employees;
