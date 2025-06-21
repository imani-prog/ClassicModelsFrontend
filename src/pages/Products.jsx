import { useEffect, useState } from 'react';
import { IoScale, IoSearch } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

function Modal({ open, onClose, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white border border-blue-300 rounded-lg p-6 w-full max-w-md shadow-md relative">
                <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl" onClick={onClose} type="button">&times;</button>
                {children}
            </div>
        </div>
    );
}

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewProduct, setViewProduct] = useState(null);
    const [editProduct, setEditProduct] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showEdit, setShowEdit] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [searchCode, setSearchCode] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searchError, setSearchError] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
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
    const [addError, setAddError] = useState('');
    const [addSuccess, setAddSuccess] = useState('');
    const [globalAddSuccess, setGlobalAddSuccess] = useState('');
    const [globalAddError, setGlobalAddError] = useState('');
    const navigate = useNavigate();

    const fetchProducts = () => {
        setLoading(true);
        fetch('http://localhost:8081/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchProducts();
    }, []);

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
                fetchProducts();
            })
            .catch(err => {
                alert(err.message);
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
                fetchProducts();
            })
            .catch(err => {
                alert(err.message);
            });
    };

    const handleProductSearch = () => {
        setSearchError('');
        setSearchSuccess('');
        setSearchResult(null);
        if (!searchCode.trim()) {
            setSearchError('Please enter a product code.');
            return;
        }
        setSearchLoading(true);
        fetch(`http://localhost:8081/products/${encodeURIComponent(searchCode.trim())}`)
            .then(res => {
                if (!res.ok) throw new Error('Product not found');
                return res.json();
            })
            .then(data => {
                setSearchResult(data);
                setSearchSuccess('Product found.');
            })
            .catch(err => {
                setSearchError(err.message);
            })
            .finally(() => setSearchLoading(false));
    };

    const handleSearchEditInput = (e) => {
        const { name, value } = e.target;
        setSearchResult(prev => ({ ...prev, [name]: value }));
    };

    const handleSearchEditSave = (e) => {
        e.preventDefault();
        setSaving(true);
        setSearchError('');
        setSearchSuccess('');
        fetch(`http://localhost:8081/products/${searchResult.productCode}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(searchResult)
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to update product');
                return res.json();
            })
            .then(() => {
                setSearchSuccess('Product updated successfully.');
                fetchProducts();
            })
            .catch(err => {
                setSearchError(err.message);
            })
            .finally(() => setSaving(false));
    };

    const handleCloseSearchResult = () => {
        setSearchResult(null);
        setSearchError('');
        setSearchSuccess('');
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
        setAddError('');
        setAddSuccess('');
        setGlobalAddError('');
        setGlobalAddSuccess('');
    };

    const handleCloseAddModal = () => {
        setShowAdd(false);
        setAddError('');
        setAddSuccess('');
        setGlobalAddError('');
        setGlobalAddSuccess('');
    };

    const handleAddInput = (e) => {
        const { name, value } = e.target;
        setAddForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSave = (e) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError('');
        setAddSuccess('');
        setGlobalAddError('');
        setGlobalAddSuccess('');
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
                setAddSuccess(''); // Clear modal success
                setGlobalAddSuccess('Product added successfully.');
                setShowAdd(false);
                fetchProducts();
                setTimeout(() => setGlobalAddSuccess(''), 3000);
            })
            .catch(err => {
                setAddError(err.message);
                setGlobalAddError(err.message);
                setTimeout(() => setGlobalAddError(''), 4000);
            })
            .finally(() => setAddLoading(false));
    };

    useEffect(() => {
        if (addSuccess) {
            const timer = setTimeout(() => setAddSuccess(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [addSuccess]);

    return (
        <div className="max-w-7xl mx-auto px-2 py-6">
            {/* Global Add Feedback */}
            {globalAddSuccess && <div className="text-green-600 mb-2 text-center font-semibold">{globalAddSuccess}</div>}
            {globalAddError && <div className="text-red-500 mb-2 text-center font-semibold">{globalAddError}</div>}
            <h1 className="text-3xl font-bold text-center mb-6">Products</h1>
            <div className="flex items-center justify-between mb-4">
                <div className="relative flex gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Search by product code"
                        value={searchCode}
                        onChange={e => setSearchCode(e.target.value)}
                        className="border-2 border-black rounded-md py-2 pl-10 pr-4"
                    />
                    <span className="absolute left-3 top-2.5">
                        <IoSearch className="w-5 h-5" />
                    </span>
                    <button
                        onClick={handleProductSearch}
                        className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                        disabled={searchLoading}
                    >
                        {searchLoading ? 'Searching...' : 'Search'}
                    </button>
                </div>
                <button onClick={handleAddProduct} className="bg-[#4a90e2] cursor-pointer text-white px-8 py-1.5 rounded hover:bg-blue-400 transition">
                    Add Product
                </button>
            </div>
            {searchError && <div className="text-red-500 mb-2">{searchError}</div>}
            {searchSuccess && <div className="text-green-600 mb-2">{searchSuccess}</div>}
            {searchResult && (
                <div className="border border-blue-300 rounded-lg p-6 w-full max-w-lg mx-auto mb-6 bg-white shadow relative">
                    <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl" onClick={handleCloseSearchResult} type="button">&times;</button>
                    <form onSubmit={handleSearchEditSave}>
                        <h2 className="text-xl font-bold mb-4">Edit Product</h2>
                        <div className="grid grid-cols-1 gap-2">
                            <input name="productName" value={searchResult.productName || ''} onChange={handleSearchEditInput} required placeholder="Product Name" className="border p-2 rounded" />
                            <input name="productLine" value={typeof searchResult.productLine === 'object' ? (searchResult.productLine.productLine || searchResult.productLine.textDescription || '') : (searchResult.productLine || '')} onChange={handleSearchEditInput} required placeholder="Product Line" className="border p-2 rounded" />
                            <input name="productVendor" value={searchResult.productVendor || ''} onChange={handleSearchEditInput} required placeholder="Product Vendor" className="border p-2 rounded" />
                            <input name="productScale" value={searchResult.productScale || ''} onChange={handleSearchEditInput} required placeholder="Product Scale" className="border p-2 rounded" />
                            <input name="buyPrice" value={searchResult.buyPrice || ''} onChange={handleSearchEditInput} required placeholder="Buy Price" className="border p-2 rounded" />
                            <input name="msrp" value={searchResult.msrp || ''} onChange={handleSearchEditInput} required placeholder="MSRP" className="border p-2 rounded" />
                            <input name="quantityInStock" value={searchResult.quantityInStock || ''} onChange={handleSearchEditInput} required placeholder="Quantity In Stock" className="border p-2 rounded" />
                            <textarea name="productDescription" value={searchResult.productDescription || ''} onChange={handleSearchEditInput} placeholder="Product Description" className="border p-2 rounded" />
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button type="submit" disabled={saving} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button type="button" onClick={handleCloseSearchResult} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition">Close</button>
                        </div>
                    </form>
                </div>
            )}
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border border-blue-300 text-sm">
                        <thead className="bg-gray-100 border-b-2 border-[#258cbf]">
                            <tr>
                                <th className="px-2 py-1 text-center">Product Code</th>
                                <th className="px-2 py-1 text-center">Product Name</th>
                                <th className="px-2 py-1 text-center">Product Line</th>
                                <th className="px-2 py-1 text-center">Product Vendor</th>
                                <th className="px-2 py-1 text-center">Product Scale</th>
                                <th className="px-2 py-1 text-center">Buy Price</th>
                                <th className="px-2 py-1 text-center">MSRP</th>
                                <th className="px-2 py-1 text-center">Quantity In Stock</th>
                                <th className="px-2 py-1 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="border-t font-medium text-center border-[#42befb] px-2 py-1">{product.productCode}</td>
                                    <td className="border-t font-medium text-center border-[#42befb] px-2 py-1">{product.productName}</td>
                                    <td className="border-t font-medium text-center border-[#42befb] px-2 py-1">{
                                        typeof product.productLine === 'object'
                                            ? (product.productLine.productLine || product.productLine.textDescription || '')
                                            : product.productLine
                                    }</td>
                                    <td className="border-t font-medium text-center border-[#42befb] px-2 py-1">{product.productVendor}</td>
                                    <td className="border-t font-medium text-center border-[#42befb] px-2 py-1">{product.productScale}</td>
                                    <td className="border-t font-medium text-center border-[#42befb] px-2 py-1">{product.buyPrice}</td>
                                    <td className="border-t font-medium text-center border-[#42befb] px-2 py-1">{product.msrp}</td>
                                    <td className="border-t font-medium text-center border-[#42befb] px-2 py-1">{product.quantityInStock}</td>
                                    <td className="border-t font-medium text-center border-[#42befb] px-2 py-1 flex flex-col gap-1 md:flex-row md:gap-2 justify-center items-center">
                                        <button className="bg-[#4a90e2] text-white px-3 py-0.5 rounded hover:bg-blue-400 transition" onClick={() => handleView(product)}>
                                            View
                                        </button>
                                        <button className="bg-yellow-500 text-white px-3 py-0.5 rounded hover:bg-yellow-600 transition" onClick={() => handleEdit(product)}>
                                            Edit
                                        </button>
                                        <button className="bg-red-500 text-white px-3 py-0.5 rounded hover:bg-red-600 transition" onClick={() => handleDelete(product.productCode)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {/* View Modal */}
            {viewProduct && (
                <>
                    {/* White translucent overlay, not covering sidebar (assume sidebar width 220px) */}
                    <div className="fixed inset-0 z-40 bg-white bg-opacity-70" style={{ left: '220px', pointerEvents: 'auto' }}></div>
                    <Modal open={!!viewProduct} onClose={() => setViewProduct(null)}>
                        <div className="w-90 left-70 mx-auto px-4 py-4">
                            <div className='flex flex-col items-center p-3 rounded-xl bg-[#234566] justify-center mb-4'>
                                <h2 className='text-2xl font-bold text-white'>Good afternoon, Tim✨</h2>
                                <p className='text-white'>Here is the latest on {viewProduct.productName}</p>
                                <p className='text-white'>{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <div className='flex border-2 p-3 rounded-md border-[#9adcfd] flex-col mt-4'>
                                <h3 className="text-2xl font-semibold">{viewProduct.productName}</h3>
                                <p className="text-gray-600"> <strong>Description</strong> {viewProduct.productDescription} </p>
                                <p> <strong>Vendor:</strong> {viewProduct.productVendor} </p>
                                <p className='flex flex-row items-center gap-1'><IoScale className='text-black w-5 h-5' /> <strong>Scale:</strong> {viewProduct.productScale} </p>
                                <p> <strong>Price:</strong> Kshs {viewProduct.buyPrice} </p>
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
                </>
            )}
            {/* Edit Modal */}
            <Modal open={showEdit} onClose={() => setShowEdit(false)}>
                <form onSubmit={handleEditSave}>
                    <h2 className="text-xl font-bold mb-4">Edit Product</h2>
                    <div className="grid grid-cols-1 gap-2">
                        <div className="grid grid-cols-2 gap-2 items-center">
                            <span className="font-semibold text-right pr-2">Product Name:</span>
                            <input name="productName" value={editForm.productName || ''} onChange={handleEditInput} required placeholder="Product Name" className="border p-2 rounded w-full" />
                            <span className="font-semibold text-right pr-2">Product Line:</span>
                            <input name="productLine" value={typeof editForm.productLine === 'object' ? (editForm.productLine.productLine || editForm.productLine.textDescription || '') : (editForm.productLine || '')} onChange={handleEditInput} required placeholder="Product Line" className="border p-2 rounded w-full" />
                            <span className="font-semibold text-right pr-2">Product Vendor:</span>
                            <input name="productVendor" value={editForm.productVendor || ''} onChange={handleEditInput} required placeholder="Product Vendor" className="border p-2 rounded w-full" />
                            <span className="font-semibold text-right pr-2">Product Scale:</span>
                            <input name="productScale" value={editForm.productScale || ''} onChange={handleEditInput} required placeholder="Product Scale" className="border p-2 rounded w-full" />
                            <span className="font-semibold text-right pr-2">Buy Price:</span>
                            <input name="buyPrice" value={editForm.buyPrice || ''} onChange={handleEditInput} required placeholder="Buy Price" className="border p-2 rounded w-full" />
                            <span className="font-semibold text-right pr-2">MSRP:</span>
                            <input name="msrp" value={editForm.msrp || ''} onChange={handleEditInput} required placeholder="MSRP" className="border p-2 rounded w-full" />
                            <span className="font-semibold text-right pr-2">Quantity In Stock:</span>
                            <input name="quantityInStock" value={editForm.quantityInStock || ''} onChange={handleEditInput} required placeholder="Quantity In Stock" className="border p-2 rounded w-full" />
                            <span className="font-semibold text-right pr-2">Product Description:</span>
                            <textarea name="productDescription" value={editForm.productDescription || ''} onChange={handleEditInput} placeholder="Product Description" className="border p-2 rounded w-full" />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button type="submit" disabled={saving} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </Modal>
            {/* Delete Confirmation */}
            {showConfirmDelete && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white border border-blue-300 rounded-lg p-6 w-full max-w-sm shadow-md flex flex-col items-center">
                        <p className="mb-4 text-lg font-semibold text-gray-800">Are you sure you want to delete this product?</p>
                        <div className="flex gap-4">
                            <button onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Delete</button>
                            <button onClick={() => setShowConfirmDelete(false)} className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Add Product Modal */}
            <Modal open={showAdd} onClose={() => { setShowAdd(false); setAddError(''); setAddSuccess(''); setGlobalAddError(''); setGlobalAddSuccess(''); }}>
                <form onSubmit={handleAddSave}>
                    <h2 className="text-xl font-bold mb-4">Add Product</h2>
                    {addError && <div className="text-red-500 mb-2">{addError}</div>}
                    <div className="grid grid-cols-1 gap-2">
                        <div className="grid grid-cols-2 gap-2 items-center">
                            <span className="font-semibold text-right pr-2">Product Code:</span>
                            <input name="productCode" value={addForm.productCode} onChange={handleAddInput} required placeholder="Product Code" className="border p-2 rounded w-full" />
                            <span className="font-semibold text-right pr-2">Product Name:</span>
                            <input name="productName" value={addForm.productName} onChange={handleAddInput} required placeholder="Product Name" className="border p-2 rounded w-full" />
                            <span className="font-semibold text-right pr-2">Product Line:</span>
                            <input name="productLine" value={addForm.productLine} onChange={handleAddInput} required placeholder="Product Line" className="border p-2 rounded w-full" />
                            <span className="font-semibold text-right pr-2">Product Vendor:</span>
                            <input name="productVendor" value={addForm.productVendor} onChange={handleAddInput} required placeholder="Product Vendor" className="border p-2 rounded w-full" />
                            <span className="font-semibold text-right pr-2">Product Scale:</span>
                            <input name="productScale" value={addForm.productScale} onChange={handleAddInput} required placeholder="Product Scale" className="border p-2 rounded w-full" />
                            <span className="font-semibold text-right pr-2">Buy Price:</span>
                            <input name="buyPrice" value={addForm.buyPrice} onChange={handleAddInput} required placeholder="Buy Price" className="border p-2 rounded w-full" />
                            <span className="font-semibold text-right pr-2">MSRP:</span>
                            <input name="msrp" value={addForm.msrp} onChange={handleAddInput} required placeholder="MSRP" className="border p-2 rounded w-full" />
                            <span className="font-semibold text-right pr-2">Quantity In Stock:</span>
                            <input name="quantityInStock" value={addForm.quantityInStock} onChange={handleAddInput} required placeholder="Quantity In Stock" className="border p-2 rounded w-full" />
                            <span className="font-semibold text-right pr-2">Product Description:</span>
                            <textarea name="productDescription" value={addForm.productDescription} onChange={handleAddInput} placeholder="Product Description" className="border p-2 rounded w-full" />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button type="submit" disabled={addLoading} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                            {addLoading ? 'Saving...' : 'Save Product'}
                        </button>
                        <button type="button" onClick={() => setShowAdd(false)} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition">Cancel</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Products;
