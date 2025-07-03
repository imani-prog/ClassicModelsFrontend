import { useEffect, useState } from 'react';
import { IoCard, IoCube, IoInformationCircle, IoPricetag, IoScale, IoStorefront } from 'react-icons/io5';

const ProductCard = ({ productCode = null }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        setError('');
        // Fetch the latest product or by code if provided
        const url = productCode
            ? `http://localhost:8081/products/${encodeURIComponent(productCode)}`
            : 'http://localhost:8081/products';
        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error('Product not found');
                return res.json();
            })
            .then(data => {
                setProduct(productCode ? data : (Array.isArray(data) && data.length > 0 ? data[0] : null));
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [productCode]);

    const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;
    if (!product) return <div className="p-4">No product found.</div>;

    return (
        <div className="w-90 mt-4 left-70 absolute justify-start mx-auto px-4 py-8">
            <div className='flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-[#234566] to-[#1a3548] justify-center mb-4 shadow-lg'>
                <h2 className='text-2xl font-bold text-white mb-1'>Good afternoon, Tim✨</h2>
                <p className='text-blue-100 text-center'>Here is the latest on {product.productName}</p>
                <p className='text-blue-200 text-sm mt-1 font-medium'>{today}</p>
            </div>
            <div className='bg-white border-2 p-5 rounded-xl border-[#9adcfd] flex-col mt-4 shadow-md hover:shadow-lg transition-shadow duration-300'>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">{product.productName}</h3>
                
                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        <IoInformationCircle className='text-blue-500 w-5 h-5 mt-0.5 flex-shrink-0' />
                        <div>
                            <span className="font-semibold text-gray-700">Description:</span>
                            <p className="text-gray-600 mt-1">{product.productDescription}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        <IoStorefront className='text-green-500 w-5 h-5 flex-shrink-0' />
                        <div>
                            <span className="font-semibold text-gray-700">Vendor:</span>
                            <span className="ml-2 text-gray-800 font-medium">{product.productVendor}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        <IoScale className='text-purple-500 w-5 h-5 flex-shrink-0' />
                        <div>
                            <span className="font-semibold text-gray-700">Scale:</span>
                            <span className="ml-2 text-gray-800 font-medium">{product.productScale}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        <IoPricetag className='text-green-600 w-5 h-5 flex-shrink-0' />
                        <div>
                            <span className="font-semibold text-gray-700">Price:</span>
                            <span className="ml-2 text-green-600 font-bold text-lg">Ksh {product.buyPrice}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex items-center gap-3">
                            <IoCube className='text-orange-500 w-5 h-5 flex-shrink-0' />
                            <div>
                                <span className="font-semibold text-gray-700">Stock:</span>
                                <span className="ml-2 text-gray-800 font-medium">{product.quantityInStock}</span>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            product.quantityInStock > 100 ? 'bg-green-100 text-green-800' :
                            product.quantityInStock > 10 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                            {product.quantityInStock > 100 ? 'In Stock' :
                             product.quantityInStock > 10 ? 'Low Stock' :
                             'Very Low'}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        <IoCard className='text-indigo-500 w-5 h-5 flex-shrink-0' />
                        <div>
                            <span className="font-semibold text-gray-700">Product Line:</span>
                            <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-sm font-medium">
                                {typeof product.productLine === 'object'
                                    ? (product.productLine.productLine || product.productLine.textDescription || '')
                                    : product.productLine
                                }
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;