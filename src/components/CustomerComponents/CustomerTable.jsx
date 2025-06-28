const CustomerTable = ({ 
    customers, 
    columns,
    visibleColumnStart,
    columnsPerView,
    loading,
    error,
    onEditClick,
    onDeleteClick,
    currentPage = 1,
    itemsPerPage = 10,
    selectedCustomers = [],
    onSelectCustomer,
    onSelectAllCustomers
}) => {
    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <div className="relative w-full h-full flex flex-col">
            <div className="flex-1 overflow-auto border border-blue-300 rounded">
                <table className="w-full min-w-max">
                    <thead className="bg-[#f5f5f5] border-b-2 border-[#258cbf] sticky top-0 z-30">
                        <tr>
                            <th className="px-2 py-2 text-center whitespace-nowrap w-20">
                                <div className="flex items-center justify-center gap-1">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => onSelectAllCustomers(e.target.checked)}
                                        checked={customers.length > 0 && selectedCustomers.length === customers.length}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-xs font-medium">Select All</span>
                                </div>
                            </th>
                            <th className="px-2 py-2 text-center whitespace-nowrap w-16">
                                #
                            </th>
                            {columns.slice(visibleColumnStart, visibleColumnStart + columnsPerView).map((col) => (
                                <th key={col.key} className="px-2 py-2 text-center whitespace-nowrap">
                                    {col.label}
                                </th>
                            ))}
                            <th className="px-2 py-2 text-center whitespace-nowrap sticky right-0 bg-[#f5f5f5] z-40">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer, index) => {
                            const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                            const isSelected = selectedCustomers.includes(customer.id || customer.customerNumber);
                            return (
                                <tr key={customer.id || customer.customerNumber} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                                    <td className="border-t-2 text-center border-[#42befb] px-2 py-2 whitespace-nowrap w-20">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => onSelectCustomer(customer.id || customer.customerNumber, e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                    </td>
                                    <td className="border-t-2 font-medium text-center border-[#42befb] px-2 py-2 whitespace-nowrap w-16 text-gray-600">
                                        {rowNumber}
                                    </td>
                                    {columns.slice(visibleColumnStart, visibleColumnStart + columnsPerView).map((col) => (
                                        <td key={col.key} className="border-t-2 font-medium text-center border-[#42befb] px-2 py-2 whitespace-nowrap">
                                            {col.key === 'salesRepEmployeeNumber'
                                                ? (customer.salesRepEmployeeNumber ? customer.salesRepEmployeeNumber.employeeNumber : '')
                                                : customer[col.key]
                                            }
                                        </td>
                                    ))}
                                    <td className="border-t-2 font-medium text-center border-[#42befb] px-2 py-2 whitespace-nowrap sticky right-0 bg-white z-20">
                                        <button
                                            className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                                            onClick={() => onEditClick(customer)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                                            onClick={() => onDeleteClick(customer.id)}
                                        >
                                            Delete
                                        </button>
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

export default CustomerTable;
