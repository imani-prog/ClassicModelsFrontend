import { useEffect, useState } from 'react';
import { IoBarChart, IoCalendar, IoCard, IoCheckmarkCircle, IoCube, IoEye, IoHeart, IoHeartOutline, IoInformationCircle, IoPricetag, IoRefresh, IoScale, IoShareSocial, IoStorefront, IoTrendingDown, IoTrendingUp, IoWarning } from 'react-icons/io5';

const ProductCard = ({ productCode = null }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [viewCount, setViewCount] = useState(0);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [priceHistory, setPriceHistory] = useState([]);
    const [stockMovement, setStockMovement] = useState('stable');
    const [lastUpdated, setLastUpdated] = useState(new Date());

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
                const productData = productCode ? data : (Array.isArray(data) && data.length > 0 ? data[0] : null);
                setProduct(productData);
                
                // Simulate enhanced data
                if (productData) {
                    // Simulate view count increment
                    setViewCount(prev => prev + 1);
                    
                    // Simulate price history (last 5 entries)
                    const currentPrice = parseFloat(productData.buyPrice);
                    const mockPriceHistory = [
                        { date: '2025-06-01', price: currentPrice * 0.95 },
                        { date: '2025-06-10', price: currentPrice * 0.98 },
                        { date: '2025-06-20', price: currentPrice * 1.02 },
                        { date: '2025-06-25', price: currentPrice * 0.99 },
                        { date: '2025-07-01', price: currentPrice }
                    ];
                    setPriceHistory(mockPriceHistory);
                    
                    // Determine stock movement trend
                    const stock = productData.quantityInStock;
                    if (stock > 50) setStockMovement('increasing');
                    else if (stock < 20) setStockMovement('decreasing');
                    else setStockMovement('stable');
                    
                    // Set random favorite status (simulate user preference)
                    setIsFavorite(Math.random() > 0.7);
                    
                    setLastUpdated(new Date());
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [productCode]);

    // Helper functions
    const toggleFavorite = () => setIsFavorite(!isFavorite);
    
    const refreshData = () => {
        setViewCount(prev => prev + 1);
        setLastUpdated(new Date());
    };
    
    const getStockStatus = () => {
        if (!product) return { status: 'unknown', color: 'gray' };
        const stock = product.quantityInStock;
        if (stock > 100) return { status: 'Excellent', color: 'green' };
        if (stock > 50) return { status: 'Good', color: 'blue' };
        if (stock > 10) return { status: 'Low Stock', color: 'yellow' };
        return { status: 'Critical', color: 'red' };
    };
    
    const getPriceGrowth = () => {
        if (priceHistory.length < 2) return 0;
        const current = priceHistory[priceHistory.length - 1].price;
        const previous = priceHistory[priceHistory.length - 2].price;
        return ((current - previous) / previous * 100).toFixed(2);
    };
    
    const shareProduct = () => {
        if (navigator.share) {
            navigator.share({
                title: product.productName,
                text: `Check out this product: ${product.productName}`,
                url: window.location.href,
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(`${product.productName} - ${window.location.href}`);
            alert('Product link copied to clipboard!');
        }
    };

    const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;
    if (!product) return <div className="p-4">No product found.</div>;

    return (
        <div className="w-full max-w-4xl mx-auto mt-4 px-4 py-8 relative z-10">
            {/* Header Card - Enhanced with more info */}
            <div className='flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-[#234566] to-[#1a3548] justify-center mb-6 shadow-xl relative overflow-hidden'>
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
                </div>
                
                <div className="relative z-10 text-center">
                    <h2 className='text-3xl font-bold text-white mb-2 flex items-center gap-2 justify-center'>
                        Good afternoon, Tim✨
                        <button onClick={refreshData} className="ml-2 p-2 hover:bg-white/20 rounded-full transition-colors">
                            <IoRefresh className="text-white w-5 h-5" />
                        </button>
                    </h2>
                    <p className='text-blue-100 text-center text-lg'>Here is the latest on {product.productName}</p>
                    <div className="flex items-center justify-center gap-6 mt-3">
                        <p className='text-blue-200 text-sm font-medium flex items-center gap-2'>
                            <IoCalendar className="w-4 h-4" />
                            {today}
                        </p>
                        <div className="flex items-center gap-2 text-blue-200 text-sm">
                            <IoEye className="w-4 h-4" />
                            {viewCount} views
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Product Card - Significantly expanded */}
            <div className='bg-white border-2 p-8 rounded-xl border-[#9adcfd] shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1'>
                {/* Header with actions */}
                <div className="flex items-center justify-between mb-8 border-b-2 border-gray-100 pb-6">
                    <h3 className="text-3xl font-bold text-gray-800">{product.productName}</h3>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={toggleFavorite}
                            className={`p-3 rounded-full transition-all duration-200 transform hover:scale-110 ${isFavorite ? 'text-red-500 bg-red-50 shadow-md' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                        >
                            {isFavorite ? <IoHeart className="w-6 h-6" /> : <IoHeartOutline className="w-6 h-6" />}
                        </button>
                        <button 
                            onClick={shareProduct}
                            className="p-3 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200 transform hover:scale-110"
                        >
                            <IoShareSocial className="w-6 h-6" />
                        </button>
                        <button 
                            onClick={() => setShowAnalytics(!showAnalytics)}
                            className={`p-3 rounded-full transition-all duration-200 transform hover:scale-110 ${showAnalytics ? 'text-green-500 bg-green-50 shadow-md' : 'text-gray-400 hover:text-green-500 hover:bg-green-50'}`}
                        >
                            <IoBarChart className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Basic Info */}
                    <div className="space-y-6">
                        <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 border border-gray-100">
                            <IoInformationCircle className='text-blue-500 w-6 h-6 mt-1 flex-shrink-0' />
                            <div className="flex-1">
                                <span className="font-bold text-gray-700 text-lg">Description:</span>
                                <p className="text-gray-600 mt-2 leading-relaxed text-base">{product.productDescription}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 border border-gray-100">
                            <IoStorefront className='text-green-500 w-6 h-6 flex-shrink-0' />
                            <div>
                                <span className="font-bold text-gray-700 text-lg">Vendor:</span>
                                <span className="ml-3 text-gray-800 font-medium text-base">{product.productVendor}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 border border-gray-100">
                            <IoScale className='text-purple-500 w-6 h-6 flex-shrink-0' />
                            <div>
                                <span className="font-bold text-gray-700 text-lg">Scale:</span>
                                <span className="ml-3 text-gray-800 font-medium text-base">{product.productScale}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 border border-gray-100">
                            <IoCard className='text-indigo-500 w-6 h-6 flex-shrink-0' />
                            <div>
                                <span className="font-bold text-gray-700 text-lg">Product Line:</span>
                                <span className="ml-3 px-3 py-2 bg-indigo-100 text-indigo-800 rounded-lg text-base font-medium">
                                    {typeof product.productLine === 'object'
                                        ? (product.productLine.productLine || product.productLine.textDescription || '')
                                        : product.productLine
                                    }
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Enhanced Info */}
                    <div className="space-y-6">
                        {/* Price Section with Growth */}
                        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-lg">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <IoPricetag className='text-green-600 w-6 h-6' />
                                    <span className="font-bold text-gray-700 text-lg">Current Price</span>
                                </div>
                                {getPriceGrowth() != 0 && (
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getPriceGrowth() > 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                                        {getPriceGrowth() > 0 ? <IoTrendingUp className="w-5 h-5" /> : <IoTrendingDown className="w-5 h-5" />}
                                        <span className="text-sm font-bold">{Math.abs(getPriceGrowth())}%</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-3xl font-bold text-green-600 mb-2">Ksh {product.buyPrice}</div>
                            <div className="text-sm text-gray-600">Last updated: {lastUpdated.toLocaleTimeString()}</div>
                        </div>

                        {/* Enhanced Stock Status */}
                        <div className="p-6 bg-white rounded-xl border-2 border-gray-200 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <IoCube className='text-orange-500 w-6 h-6' />
                                    <span className="font-bold text-gray-700 text-lg">Inventory Status</span>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${stockMovement === 'increasing' ? 'text-green-600 bg-green-100' : stockMovement === 'decreasing' ? 'text-red-600 bg-red-100' : 'text-gray-600 bg-gray-100'}`}>
                                    {stockMovement === 'increasing' ? <IoTrendingUp className="w-4 h-4" /> : 
                                     stockMovement === 'decreasing' ? <IoTrendingDown className="w-4 h-4" /> :
                                     <IoCheckmarkCircle className="w-4 h-4" />}
                                    <span className="text-sm font-bold capitalize">{stockMovement}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl font-bold text-gray-800">{product.quantityInStock} units</span>
                                <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
                                    getStockStatus().color === 'green' ? 'bg-green-100 text-green-800' :
                                    getStockStatus().color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                    getStockStatus().color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {getStockStatus().color === 'red' ? <IoWarning className="w-4 h-4" /> : 
                                     <IoCheckmarkCircle className="w-4 h-4" />}
                                    {getStockStatus().status}
                                </div>
                            </div>
                            
                            {/* Stock level indicator */}
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                <div 
                                    className={`h-3 rounded-full transition-all duration-500 ${
                                        getStockStatus().color === 'green' ? 'bg-green-500' :
                                        getStockStatus().color === 'blue' ? 'bg-blue-500' :
                                        getStockStatus().color === 'yellow' ? 'bg-yellow-500' :
                                        'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.min((product.quantityInStock / 150) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <div className="text-xs text-gray-500 text-center">
                                {Math.min((product.quantityInStock / 150) * 100, 100).toFixed(0)}% of optimal stock level
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 rounded-xl text-center border border-blue-200 hover:shadow-md transition-shadow">
                                <div className="text-2xl font-bold text-blue-600">{Math.floor(Math.random() * 50) + 10}</div>
                                <div className="text-sm text-blue-600 font-medium">Monthly Sales</div>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-xl text-center border border-purple-200 hover:shadow-md transition-shadow">
                                <div className="text-2xl font-bold text-purple-600">{(Math.random() * 5).toFixed(1)}★</div>
                                <div className="text-sm text-purple-600 font-medium">Rating</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytics Panel */}
                {showAnalytics && (
                    <div className="mt-8 pt-8 border-t-2 border-gray-200 animate-fadeIn">
                        <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                            <IoBarChart className="text-green-500 w-7 h-7" />
                            Product Analytics Dashboard
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                                <h5 className="font-bold text-gray-700 mb-4 text-lg">Price History</h5>
                                <div className="space-y-2">
                                    {priceHistory.slice(-3).map((entry, index) => (
                                        <div key={index} className="flex justify-between text-sm border-b border-gray-200 pb-2">
                                            <span className="text-gray-600 font-medium">{entry.date}</span>
                                            <span className="font-bold">Ksh {entry.price.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                                <h5 className="font-bold text-gray-700 mb-4 text-lg">Performance</h5>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">Revenue Impact</span>
                                        <span className="font-bold text-green-600">+{(Math.random() * 15).toFixed(1)}%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">Profit Margin</span>
                                        <span className="font-bold">{(Math.random() * 30 + 20).toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                                <h5 className="font-bold text-gray-700 mb-4 text-lg">Market Position</h5>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">Category Rank</span>
                                        <span className="font-bold">#{Math.floor(Math.random() * 10) + 1}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">Demand Level</span>
                                        <span className="font-bold text-blue-600">
                                            {['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;