const ProductStats = ({ products }) => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + (parseFloat(product.buyPrice) || 0) * (parseInt(product.quantityInStock) || 0), 0);
    const lowStockProducts = products.filter(product => (parseInt(product.quantityInStock) || 0) < 10).length;
    const productLines = [...new Set(products.map(product => 
        typeof product.productLine === 'object' 
            ? (product.productLine.productLine || product.productLine.textDescription || '') 
            : product.productLine
    ).filter(Boolean))].length;

    return (
        <div className="flex gap-4">
            {/* Total Products */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-center">
                <div className="flex items-center gap-2 text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <div>
                        <div className="text-xl font-bold">{totalProducts}</div>
                        <div className="text-xs">Total Products</div>
                    </div>
                </div>
            </div>

            {/* Total Inventory Value */}
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-center">
                <div className="flex items-center gap-2 text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <div>
                        <div className="text-xl font-bold">Ksh {totalValue.toLocaleString()}</div>
                        <div className="text-xs">Inventory Value</div>
                    </div>
                </div>
            </div>

            {/* Low Stock Alert */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 text-center">
                <div className="flex items-center gap-2 text-orange-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                        <div className="text-xl font-bold">{lowStockProducts}</div>
                        <div className="text-xs">Low Stock</div>
                    </div>
                </div>
            </div>

            {/* Product Lines */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 text-center">
                <div className="flex items-center gap-2 text-purple-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <div>
                        <div className="text-xl font-bold">{productLines}</div>
                        <div className="text-xs">Product Lines</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductStats;
