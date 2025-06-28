const CustomerTable = ({ 
    customers, 
    columns,
    visibleColumnStart,
    columnsPerView,
    maxStart,
    loading,
    error,
    onScrollLeft,
    onScrollRight,
    onEditClick,
    onDeleteClick 
}) => {
    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <div className="relative w-full overflow-x-hidden">
            <div className="flex justify-end mb-2 gap-2">
                <button 
                    onClick={onScrollLeft} 
                    disabled={visibleColumnStart === 0} 
                    className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    {'<'}
                </button>
                <button 
                    onClick={onScrollRight} 
                    disabled={visibleColumnStart >= maxStart} 
                    className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    {'>'}
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border border-blue-300 min-w-max">
                    <thead className="bg-[#f5f5f5] border-b-2 border-[#258cbf]">
                        <tr>
                            {columns.slice(visibleColumnStart, visibleColumnStart + columnsPerView).map((col) => (
                                <th key={col.key} className="px-2 py-1 text-center whitespace-nowrap">
                                    {col.label}
                                </th>
                            ))}
                            <th className="px-2 py-1 text-center whitespace-nowrap sticky right-0 bg-[#f5f5f5] z-10">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => (
                            <tr key={customer.id || customer.customerNumber} className="hover:bg-gray-50">
                                {columns.slice(visibleColumnStart, visibleColumnStart + columnsPerView).map((col) => (
                                    <td key={col.key} className="border-t-2 font-medium text-center border-[#42befb] px-2 py-1 whitespace-nowrap">
                                        {col.key === 'salesRepEmployeeNumber'
                                            ? (customer.salesRepEmployeeNumber ? customer.salesRepEmployeeNumber.employeeNumber : '')
                                            : customer[col.key]
                                        }
                                    </td>
                                ))}
                                <td className="border-t-2 font-medium text-center border-[#42befb] px-2 py-1 whitespace-nowrap sticky right-0 bg-white z-10">
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomerTable;
