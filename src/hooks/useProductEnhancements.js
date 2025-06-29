import { useMemo, useState } from 'react';

const useProductEnhancements = (products) => {
    const [sortBy, setSortBy] = useState('productName');
    const [filterVendor, setFilterVendor] = useState('');
    const [filterProductLine, setFilterProductLine] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [globalSearch, setGlobalSearch] = useState('');

    // Extract unique vendors and product lines for filter options
    const { vendors, productLines } = useMemo(() => {
        const vendorSet = new Set();
        const productLineSet = new Set();

        products.forEach(product => {
            if (product.productVendor) {
                vendorSet.add(product.productVendor);
            }
            
            const productLine = typeof product.productLine === 'object'
                ? (product.productLine.productLine || product.productLine.textDescription || '')
                : product.productLine;
            
            if (productLine) {
                productLineSet.add(productLine);
            }
        });

        return {
            vendors: Array.from(vendorSet).sort(),
            productLines: Array.from(productLineSet).sort()
        };
    }, [products]);

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let filtered = [...products];

        // Apply global search
        if (globalSearch) {
            const searchLower = globalSearch.toLowerCase();
            filtered = filtered.filter(product => {
                const productLine = typeof product.productLine === 'object'
                    ? (product.productLine.productLine || product.productLine.textDescription || '')
                    : product.productLine;

                return (
                    (product.productCode && product.productCode.toLowerCase().includes(searchLower)) ||
                    (product.productName && product.productName.toLowerCase().includes(searchLower)) ||
                    (product.productVendor && product.productVendor.toLowerCase().includes(searchLower)) ||
                    (productLine && productLine.toLowerCase().includes(searchLower)) ||
                    (product.productScale && product.productScale.toLowerCase().includes(searchLower)) ||
                    (product.productDescription && product.productDescription.toLowerCase().includes(searchLower))
                );
            });
        }

        // Apply vendor filter
        if (filterVendor) {
            filtered = filtered.filter(product => product.productVendor === filterVendor);
        }

        // Apply product line filter
        if (filterProductLine) {
            filtered = filtered.filter(product => {
                const productLine = typeof product.productLine === 'object'
                    ? (product.productLine.productLine || product.productLine.textDescription || '')
                    : product.productLine;
                return productLine === filterProductLine;
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'productCode':
                    aValue = a.productCode || '';
                    bValue = b.productCode || '';
                    break;
                case 'productName':
                    aValue = a.productName || '';
                    bValue = b.productName || '';
                    break;
                case 'buyPrice':
                    aValue = parseFloat(a.buyPrice) || 0;
                    bValue = parseFloat(b.buyPrice) || 0;
                    break;
                case 'quantityInStock':
                    aValue = parseInt(a.quantityInStock) || 0;
                    bValue = parseInt(b.quantityInStock) || 0;
                    break;
                case 'productVendor':
                    aValue = a.productVendor || '';
                    bValue = b.productVendor || '';
                    break;
                default:
                    aValue = a.productName || '';
                    bValue = b.productName || '';
            }

            if (typeof aValue === 'string') {
                return aValue.localeCompare(bValue);
            }
            return aValue - bValue;
        });

        return filtered;
    }, [products, globalSearch, filterVendor, filterProductLine, sortBy]);

    return {
        // Filter states
        sortBy,
        filterVendor,
        filterProductLine,
        showFilters,
        globalSearch,
        
        // Filter options
        vendors,
        productLines,
        
        // Filtered data
        filteredProducts,
        
        // Filter setters
        setSortBy,
        setFilterVendor,
        setFilterProductLine,
        setShowFilters,
        setGlobalSearch
    };
};

export default useProductEnhancements;
