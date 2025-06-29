import { useState } from 'react';
import { IoScale } from 'react-icons/io5';
import ConfirmDialog from '../components/ProductComponents/ConfirmDialog';
import EnhancedProductSearch from '../components/ProductComponents/EnhancedProductSearch';
import EnhancedProductTable from '../components/ProductComponents/EnhancedProductTable';
import Modal from '../components/ProductComponents/Modal';
import ProductStats from '../components/ProductComponents/ProductStats';
import Toast from '../components/ProductComponents/Toast';
import useAllProducts from '../hooks/useAllProducts';
import useProductEnhancements from '../hooks/useProductEnhancements';

const Products = () => {
    // Get all products for display and stats
    const {
        products: allProducts,
        loading: productsLoading,
        error: productsError,
        refreshProducts
    } = useAllProducts();

    // Enhanced features based on all products
    const {
        sortBy,
        filterVendor,
        filterProductLine,
        showFilters,
        globalSearch,
        filteredProducts,
        vendors,
        productLines,
        setSortBy,
        setFilterVendor,
        setFilterProductLine,
        setShowFilters,
        setGlobalSearch
    } = useProductEnhancements(allProducts);

    // Local state for modals and forms
    const [viewProduct, setViewProduct] = useState(null);
    const [editProduct, setEditProduct] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showEdit, setShowEdit] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [searchSuccess, setSearchSuccess] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [addForm, setAddForm] = useState({
        productCode: '',
        productName: '',
        productLine: '',
        productVendor: '',
        productScale: '',
        buyPrice: '',
        msrp: '',
        quantityInStock: '',
        productDescription: ''
    });
    const [addLoading, setAddLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Toast helper
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // Product selection handlers
    const handleSelectProduct = (productCode, checked) => {
        if (checked) {
            setSelectedProducts(prev => [...prev, productCode]);
        } else {
            setSelectedProducts(prev => prev.filter(id => id !== productCode));
        }
    };

    const handleSelectAllProducts = (checked) => {
        if (checked) {
            setSelectedProducts(filteredProducts.map(product => product.productCode));
        } else {
            setSelectedProducts([]);
        }
    };

    const handleBulkDelete = () => {
        if (selectedProducts.length === 0) return;
        
        if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
            Promise.all(
                selectedProducts.map(productCode =>
                    fetch(`http://localhost:8081/products/${productCode}`, { method: 'DELETE' })
                )
            )
            .then(() => {
                showToast(`Successfully deleted ${selectedProducts.length} products`);
                setSelectedProducts([]);
                refreshProducts();
            })
            .catch(err => {
                showToast('Error deleting products: ' + err.message, 'error');
            });
        }
    };

    const handleView = (product) => {
        setViewProduct(product);
    };

    const handleEdit = (product) => {
        setEditProduct(product);
        setEditForm({ ...product });
        setShowEdit(true);
    };

    const handleEditInput = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSave = (e) => {
        e.preventDefault();
        setSaving(true);
        fetch(`http://localhost:8081/products/${editProduct.productCode}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm)
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to update product');
                return res.json();
            })
            .then(() => {
                setShowEdit(false);
                setEditProduct(null);
                setEditForm({});
                showToast('Product updated successfully');
                refreshProducts();
            })
            .catch(err => {
                showToast('Error updating product: ' + err.message, 'error');
            })
            .finally(() => setSaving(false));
    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setShowConfirmDelete(true);
    };

    const confirmDelete = () => {
        fetch(`http://localhost:8081/products/${deleteId}`, { method: 'DELETE' })
            .then(res => {
                if (!res.ok) throw new Error('Failed to delete product');
                setShowConfirmDelete(false);
                setDeleteId(null);
                showToast('Product deleted successfully');
                refreshProducts();
            })
            .catch(err => {
                showToast('Error deleting product: ' + err.message, 'error');
            });
    };

    const handleAddProduct = () => {
        setShowAdd(true);
        setAddForm({
            productCode: '',
            productName: '',
            productLine: '',
            productVendor: '',
            productScale: '',
            buyPrice: '',
            msrp: '',
            quantityInStock: '',
            productDescription: ''
        });
        setSearchError('');
        setSearchSuccess('');
    };

    const handleAddInput = (e) => {
        const { name, value } = e.target;
        setAddForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSave = (e) => {
        e.preventDefault();
        setAddLoading(true);
        setSearchError('');
        setSearchSuccess('');
        
        fetch('http://localhost:8081/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(addForm)
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to add product');
                return res.json();
            })
            .then(() => {
                showToast('Product added successfully');
                setShowAdd(false);
                refreshProducts();
            })
            .catch(err => {
                setSearchError(err.message);
                showToast('Error adding product: ' + err.message, 'error');
            })
            .finally(() => setAddLoading(false));
    };

    return (
        <div className="max-w-6xl mx-auto px-2 h-full flex flex-col pt-2">
            {/* Header Section - Fixed height */}
            <div className='flex items-start justify-between mb-3 flex-shrink-0'>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold mb-1">Products</h1>
                    <p className="text-gray-600 text-sm">Manage your product inventory</p>
                </div>
                
                {/* Quick Stats */}
                <ProductStats products={allProducts} />
            </div>
            
            {/* Search Section - Fixed height */}
            <div className="mb-3 flex-shrink-0">
                <EnhancedProductSearch
                    searchError={searchError}
                    searchSuccess={searchSuccess}
                    onOpenAddForm={handleAddProduct}
                    selectedProducts={selectedProducts}
                    onBulkDelete={handleBulkDelete}
                    // Enhanced props
                    globalSearch={globalSearch}
                    onGlobalSearchChange={setGlobalSearch}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    showFilters={showFilters}
                    onToggleFilters={setShowFilters}
                    filterVendor={filterVendor}
                    onFilterVendorChange={setFilterVendor}
                    filterProductLine={filterProductLine}
                    onFilterProductLineChange={setFilterProductLine}
                    vendors={vendors}
                    productLines={productLines}
                    filteredCount={filteredProducts.length}
                    totalCount={allProducts.length}
                />
            </div>

            {/* Table Section - Flexible height */}
            <div className="flex-1 min-h-0 mb-2">
                <EnhancedProductTable
                    products={filteredProducts}
                    loading={productsLoading}
                    error={productsError}
                    onViewClick={handleView}
                    onEditClick={handleEdit}
                    onDeleteClick={handleDelete}
                    selectedProducts={selectedProducts}
                    onSelectProduct={handleSelectProduct}
                    onSelectAllProducts={handleSelectAllProducts}
                />
            </div>
            {/* View Modal */}
            {viewProduct && (
                <Modal open={!!viewProduct} onClose={() => setViewProduct(null)}>
                    <div className="w-90 left-70 mx-auto px-4 py-4">
                        <div className='flex flex-col items-center p-3 rounded-xl bg-[#234566] justify-center mb-4'>
                            <h2 className='text-2xl font-bold text-white'>Good afternoon, Tim✨</h2>
                            <p className='text-white'>Here is the latest on {viewProduct.productName}</p>
                            <p className='text-white'>{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div className='flex border-2 p-3 rounded-md border-[#9adcfd] flex-col mt-4'>
                            <h3 className="text-2xl font-semibold">{viewProduct.productName}</h3>
                            <p className="text-gray-600"> <strong>Description:</strong> {viewProduct.productDescription} </p>
                            <p> <strong>Vendor:</strong> {viewProduct.productVendor} </p>
                            <p className='flex flex-row items-center gap-1'><IoScale className='text-black w-5 h-5' /> <strong>Scale:</strong> {viewProduct.productScale} </p>
                            <p> <strong>Price:</strong> Ksh {viewProduct.buyPrice} </p>
                            <div className='flex items-center justify-between'>
                                <p> <strong>Stock:</strong> {viewProduct.quantityInStock} </p>
                            </div>
                            <p> <strong>Product Line:</strong> {
                                typeof viewProduct.productLine === 'object'
                                    ? (viewProduct.productLine.productLine || viewProduct.productLine.textDescription || '')
                                    : viewProduct.productLine
                            } </p>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Edit Modal */}
            <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Product">
                <form onSubmit={handleEditSave}>
                    <div className="grid grid-cols-2 gap-3 items-center">
                        <label className="font-medium text-gray-700">Product Name:</label>
                        <input name="productName" value={editForm.productName || ''} onChange={handleEditInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Product Line:</label>
                        <input name="productLine" value={typeof editForm.productLine === 'object' ? (editForm.productLine.productLine || editForm.productLine.textDescription || '') : (editForm.productLine || '')} onChange={handleEditInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Product Vendor:</label>
                        <input name="productVendor" value={editForm.productVendor || ''} onChange={handleEditInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Product Scale:</label>
                        <input name="productScale" value={editForm.productScale || ''} onChange={handleEditInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Buy Price:</label>
                        <input name="buyPrice" value={editForm.buyPrice || ''} onChange={handleEditInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">MSRP:</label>
                        <input name="msrp" value={editForm.msrp || ''} onChange={handleEditInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Quantity In Stock:</label>
                        <input name="quantityInStock" value={editForm.quantityInStock || ''} onChange={handleEditInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Description:</label>
                        <textarea name="productDescription" value={editForm.productDescription || ''} onChange={handleEditInput} className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button type="submit" disabled={saving} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Add Product Modal */}
            <Modal open={showAdd} onClose={() => { setShowAdd(false); setSearchError(''); setSearchSuccess(''); }} title="Add Product">
                <form onSubmit={handleAddSave}>
                    {searchError && <div className="text-red-500 mb-2">{searchError}</div>}
                    <div className="grid grid-cols-2 gap-3 items-center">
                        <label className="font-medium text-gray-700">Product Code:</label>
                        <input name="productCode" value={addForm.productCode} onChange={handleAddInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Product Name:</label>
                        <input name="productName" value={addForm.productName} onChange={handleAddInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Product Line:</label>
                        <input name="productLine" value={addForm.productLine} onChange={handleAddInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Product Vendor:</label>
                        <input name="productVendor" value={addForm.productVendor} onChange={handleAddInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Product Scale:</label>
                        <input name="productScale" value={addForm.productScale} onChange={handleAddInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Buy Price:</label>
                        <input name="buyPrice" value={addForm.buyPrice} onChange={handleAddInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">MSRP:</label>
                        <input name="msrp" value={addForm.msrp} onChange={handleAddInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Quantity In Stock:</label>
                        <input name="quantityInStock" value={addForm.quantityInStock} onChange={handleAddInput} required className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <label className="font-medium text-gray-700">Description:</label>
                        <textarea name="productDescription" value={addForm.productDescription} onChange={handleAddInput} className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button type="submit" disabled={addLoading} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                            {addLoading ? 'Saving...' : 'Save Product'}
                        </button>
                        <button type="button" onClick={() => setShowAdd(false)} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition">Cancel</button>
                    </div>
                </form>
            </Modal>

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
            />

            <ConfirmDialog
                show={showConfirmDelete}
                onConfirm={confirmDelete}
                onCancel={() => setShowConfirmDelete(false)}
            />
        </div>
    );
};

export default Products;
