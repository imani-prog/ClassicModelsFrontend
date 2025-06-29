import { FaEdit, FaEye, FaTrash } from 'react-icons/fa';

const EnhancedProductTable = ({ 
    products, 
    loading,
    error,
    onViewClick,
    onEditClick,
    onDeleteClick,
    selectedProducts = [],
    onSelectProduct,
    onSelectAllProducts
}) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-gray-600">Loading products...</div>
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

    if (products.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                    <div className="text-lg mb-2">No products found</div>
                    <div className="text-sm">Try adjusting your search or filters</div>
                </div>
            </div>
        );
    }

    const columns = [
        { key: 'productCode', label: 'Product Code' },
        { key: 'productName', label: 'Product Name' },
        { key: 'productLine', label: 'Product Line' },
        { key: 'productVendor', label: 'Vendor' },
        { key: 'productScale', label: 'Scale' },
        { key: 'buyPrice', label: 'Buy Price' },
        { key: 'msrp', label: 'MSRP' },
        { key: 'quantityInStock', label: 'Stock' }
    ];

    const formatProductLine = (productLine) => {
        if (typeof productLine === 'object') {
            return productLine.productLine || productLine.textDescription || '';
        }
        return productLine || '';
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-1 overflow-auto border border-blue-300 rounded">
                <table className="w-full min-w-max">
                    <thead className="bg-[#f5f5f5] border-b-2 border-[#258cbf] sticky top-0 z-30">
                        <tr>
                            <th className="px-1 py-1 text-center whitespace-nowrap w-12">
                                <div className="flex items-center justify-center gap-1">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => onSelectAllProducts(e.target.checked)}
                                        checked={products.length > 0 && selectedProducts.length === products.length}
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
                            <th className="px-1 py-1 text-center whitespace-nowrap sticky right-0 bg-[#f5f5f5] z-40 text-xs font-bold text-black w-20">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => {
                            const isSelected = selectedProducts.includes(product.productCode);
                            return (
                                <tr key={product.productCode} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                                    <td className="border-t-2 text-center border-[#42befb] px-1 py-1.5 whitespace-nowrap w-12">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => onSelectProduct(product.productCode, e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                    </td>
                                    {columns.map((col) => (
                                        <td key={col.key} className="border-t-2 text-center border-[#42befb] px-1 py-1.5 whitespace-nowrap text-xs">
                                            {col.key === 'productLine'
                                                ? formatProductLine(product[col.key])
                                                : col.key === 'buyPrice' || col.key === 'msrp'
                                                ? `Ksh ${parseFloat(product[col.key] || 0).toLocaleString()}`
                                                : product[col.key] || '-'
                                            }
                                        </td>
                                    ))}
                                    <td className="border-t-2 text-center border-[#42befb] px-1 py-1.5 whitespace-nowrap sticky right-0 bg-white z-20">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded transition-colors"
                                                onClick={() => onViewClick(product)}
                                                title="View Product"
                                            >
                                                <FaEye className="w-3 h-3" />
                                            </button>
                                            <button
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white p-1.5 rounded transition-colors"
                                                onClick={() => onEditClick(product)}
                                                title="Edit Product"
                                            >
                                                <FaEdit className="w-3 h-3" />
                                            </button>
                                            <button
                                                className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded transition-colors"
                                                onClick={() => onDeleteClick(product.productCode)}
                                                title="Delete Product"
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

export default EnhancedProductTable;
