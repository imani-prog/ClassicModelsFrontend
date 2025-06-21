import { useEffect, useState } from 'react';
import { IoScale } from 'react-icons/io5';

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
            <div className='flex flex-col items-center p-3 rounded-xl bg-[#234566] justify-center mb-4'>
                <h2 className='text-2xl font-bold text-white'>Good afternoon, Tim✨</h2>
                <p className='text-white'>Here is the latest on {product.productName}</p>
                <p className='text-white'>{today}</p>
            </div>
            <div className='flex border-2 p-3 rounded-md border-[#9adcfd] flex-col mt-4'>
                <h3 className="text-2xl font-semibold">{product.productName}</h3>
                <p className="text-gray-600"> <strong>Description</strong> {product.productDescription} </p>
                <p> <strong>Vendor:</strong> {product.productVendor} </p>
                <p className='flex flex-row items-center gap-1'><IoScale className='text-black w-5 h-5' /> <strong>Scale:</strong> {product.productScale} </p>
                <p> <strong>Price:</strong> Kshs {product.buyPrice} </p>
                <div className='flex items-center justify-between'>
                    <p> <strong>Stock:</strong> {product.quantityInStock} </p>
                </div>
                <p> <strong>Product Line:</strong> {
                    typeof product.productLine === 'object'
                        ? (product.productLine.productLine || product.productLine.textDescription || '')
                        : product.productLine
                } </p>
            </div>
        </div>
    );
};

export default ProductCard;