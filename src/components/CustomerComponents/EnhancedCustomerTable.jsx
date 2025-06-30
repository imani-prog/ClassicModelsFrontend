import { FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const EnhancedCustomerTable = ({ 
    customers, 
    loading,
    error,
    onEditClick,
    onDeleteClick,
    selectedCustomers = [],
    onSelectCustomer,
    onSelectAllCustomers
}) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-gray-600">Loading customers...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-red-500">Error: {error}</div>
            </div>
        );
    }

    if (customers.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                    <div className="text-lg mb-2">No customers found</div>
                    <div className="text-sm">Try adjusting your search or filters</div>
                </div>
            </div>
        );
    }

    const columns = [
        { key: 'customerName', label: 'Customer Name' },
        { key: 'id', label: 'Customer Number' },
        { key: 'contactFirstName', label: 'First Name' },
        { key: 'contactLastName', label: 'Last Name' },
        { key: 'phone', label: 'Phone' },
        { key: 'city', label: 'City' },
        { key: 'state', label: 'State' },
        { key: 'country', label: 'Country' },
        { key: 'creditLimit', label: 'Credit Limit' }
    ];

    return (
        <div className="w-full h-full flex flex-col bg-white rounded-lg shadow">
            <div className="flex-1 overflow-y-auto overflow-x-auto border border-blue-300 rounded">
                <table className="w-full min-w-max">
                    <thead className="bg-[#f5f5f5] border-b-2 border-[#258cbf] sticky top-0 z-30">
                        <tr>
                            <th className="px-1 py-1 text-center whitespace-nowrap w-12">
                                <div className="flex items-center justify-center gap-1">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => onSelectAllCustomers(e.target.checked)}
                                        checked={customers.length > 0 && selectedCustomers.length === customers.length}
                                        className="w-3 h-3"
                                    />
                                    <span className="text-xs font-bold text-black">Select</span>
                                </div>
                            </th>
                            {columns.map((col) => (
                                <th key={col.key} className="px-1 py-1 text-center whitespace-nowrap text-xs font-bold text-black">
                                    {col.label}
                                </th>
                            ))}
                            <th className="px-1 py-1 text-center whitespace-nowrap sticky right-0 bg-[#f5f5f5] z-40 text-xs font-bold text-black w-16">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => {
                            const isSelected = selectedCustomers.includes(customer.id || customer.customerNumber);
                            return (
                                <tr key={customer.id || customer.customerNumber} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                                    <td className="border-t-2 text-center border-[#42befb] px-1 py-1.5 whitespace-nowrap w-12">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => onSelectCustomer(customer.id || customer.customerNumber, e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                    </td>
                                    {columns.map((col) => (
                                        <td key={col.key} className="border-t-2 text-center border-[#42befb] px-1 py-1.5 whitespace-nowrap text-xs">
                                            {col.key === 'creditLimit'
                                                ? `Ksh ${parseFloat(customer[col.key] || 0).toLocaleString()}`
                                                : customer[col.key] || '-'
                                            }
                                        </td>
                                    ))}
                                    <td className="border-t-2 text-center border-[#42befb] px-1 py-1.5 whitespace-nowrap sticky right-0 bg-white z-20">
                                        <div className="flex items-center justify-center gap-1">
                                            <Link
                                                to={`/customers/${customer.id || customer.customerNumber}`}
                                                className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded transition-colors"
                                                title="View Details"
                                            >
                                                <FaEye className="w-3 h-3" />
                                            </Link>
                                            <button
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white p-1.5 rounded transition-colors"
                                                onClick={() => onEditClick(customer)}
                                                title="Edit Customer"
                                            >
                                                <FaEdit className="w-3 h-3" />
                                            </button>
                                            <button
                                                className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded transition-colors"
                                                onClick={() => onDeleteClick(customer.id)}
                                                title="Delete Customer"
                                            >
                                                <FaTrash className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EnhancedCustomerTable;
