import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaBox, FaChartPie, FaCreditCard, FaDollarSign, FaUsers } from 'react-icons/fa';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const BusinessAnalytics = () => {
    const [businessData, setBusinessData] = useState({
        creditLimits: [],
        productLines: [],
        payments: [],
        customers: []
    });

    // Color schemes for the charts - memoized for performance
    const colors = useMemo(() => ({
        creditLimits: ['#10B981', '#F59E0B', '#EF4444', '#6366F1'],
        productLines: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'],
        payments: ['#059669', '#0891B2', '#7C3AED', '#DC2626'],
        customers: ['#2563EB', '#7C2D12', '#059669', '#DC2626', '#8B5CF6', '#EC4899']
    }), []);

    // Fallback data - memoized to prevent recreation
    const fallbackData = useMemo(() => ({
        creditLimits: [
            { name: 'Low (0-50K)', value: 45, percentage: 37 },
            { name: 'Medium (50K-100K)', value: 38, percentage: 31 },
            { name: 'High (100K-200K)', value: 28, percentage: 23 },
            { name: 'Premium (200K+)', value: 11, percentage: 9 }
        ],
        productLines: [
            { name: 'Classic Cars', value: 38, percentage: 35 },
            { name: 'Motorcycles', value: 13, percentage: 12 },
            { name: 'Planes', value: 12, percentage: 11 },
            { name: 'Ships', value: 9, percentage: 8 },
            { name: 'Trains', value: 3, percentage: 3 },
            { name: 'Trucks and Buses', value: 11, percentage: 10 },
            { name: 'Vintage Cars', value: 24, percentage: 22 }
        ],
        payments: [
            { name: 'Small (0-10K)', value: 156, percentage: 52 },
            { name: 'Medium (10K-50K)', value: 98, percentage: 33 },
            { name: 'Large (50K-100K)', value: 32, percentage: 11 },
            { name: 'Huge (100K+)', value: 14, percentage: 4 }
        ],
        customers: [
            { name: 'USA', value: 36, percentage: 29 },
            { name: 'Germany', value: 13, percentage: 11 },
            { name: 'France', value: 12, percentage: 10 },
            { name: 'Spain', value: 5, percentage: 4 },
            { name: 'Australia', value: 5, percentage: 4 },
            { name: 'Others', value: 51, percentage: 42 }
        ]
    }), []);

    // Optimized data processing functions
    const processBusinessData = useCallback((customers, products, payments) => {
        const creditLimitRanges = { 'Low (0-50K)': 0, 'Medium (50K-100K)': 0, 'High (100K-200K)': 0, 'Premium (200K+)': 0 };
        const productLineCounts = {};
        const countryCounts = {};

        // Single optimized loop for customers
        if (customers?.length) {
            customers.forEach(customer => {
                // Credit limits processing
                const limit = parseFloat(customer.creditLimit) || 0;
                if (limit <= 50000) creditLimitRanges['Low (0-50K)']++;
                else if (limit <= 100000) creditLimitRanges['Medium (50K-100K)']++;
                else if (limit <= 200000) creditLimitRanges['High (100K-200K)']++;
                else creditLimitRanges['Premium (200K+)']++;

                // Countries processing
                const country = customer.country || 'Unknown';
                countryCounts[country] = (countryCounts[country] || 0) + 1;
            });
        }

        // Single optimized loop for products
        if (products?.length) {
            console.log('Processing products:', products.length, 'products'); // Debug log
            console.log('Sample product:', products[0]); // Debug log
            console.log('ProductLine type and value:', typeof products[0]?.productLine, products[0]?.productLine); // Debug log
            
            products.forEach(product => {
                // Handle productLine being an object or string
                let line = 'Other'; // Default fallback
                
                if (typeof product.productLine === 'string' && product.productLine.trim()) {
                    line = product.productLine.trim();
                } else if (typeof product.productLine === 'object' && product.productLine !== null) {
                    // If productLine is an object, try to extract meaningful data
                    const objKeys = Object.keys(product.productLine);
                    if (objKeys.length > 0) {
                        // Try common property names
                        line = product.productLine.name || 
                               product.productLine.productLine || 
                               product.productLine.type ||
                               product.productLine.category ||
                               `Unknown-${objKeys[0]}`;
                    }
                } else if (product.productCode) {
                    // Fallback to using product code pattern to guess category
                    const code = product.productCode.toUpperCase();
                    if (code.includes('MOTOR')) line = 'Motorcycles';
                    else if (code.includes('PLANE')) line = 'Planes';
                    else if (code.includes('SHIP')) line = 'Ships';
                    else if (code.includes('TRAIN')) line = 'Trains';
                    else if (code.includes('TRUCK') || code.includes('BUS')) line = 'Trucks and Buses';
                    else if (code.includes('VINTAGE')) line = 'Vintage Cars';
                    else line = 'Classic Cars'; // Default for cars
                }
                
                productLineCounts[line] = (productLineCounts[line] || 0) + 1;
            });
            console.log('Product line counts:', productLineCounts); // Debug log
        } else {
            console.log('No products data available'); // Debug log
        }

        // Process payments
        const paymentRanges = { 'Small (0-10K)': 0, 'Medium (10K-50K)': 0, 'Large (50K-100K)': 0, 'Huge (100K+)': 0 };
        if (payments?.length) {
            payments.forEach(payment => {
                const amount = parseFloat(payment.amount) || 0;
                if (amount <= 10000) paymentRanges['Small (0-10K)']++;
                else if (amount <= 50000) paymentRanges['Medium (10K-50K)']++;
                else if (amount <= 100000) paymentRanges['Large (50K-100K)']++;
                else paymentRanges['Huge (100K+)']++;
            });
        }

        // Fast data transformation with fallback
        const customerCount = customers?.length || 1;
        const productCount = products?.length || 1;
        const paymentCount = payments?.length || 1;

        // Ensure we have valid product lines data
        const productLinesData = Object.keys(productLineCounts).length > 0 
            ? Object.entries(productLineCounts)
                .map(([name, value]) => ({ name, value, percentage: Math.round((value / productCount) * 100) }))
                .sort((a, b) => b.value - a.value)
            : []; // Return empty array if no product data

        return {
            creditLimits: Object.entries(creditLimitRanges).map(([name, value]) => ({
                name, value, percentage: Math.round((value / customerCount) * 100)
            })),
            productLines: productLinesData,
            customers: Object.entries(countryCounts)
                .map(([name, value]) => ({ name, value, percentage: Math.round((value / customerCount) * 100) }))
                .sort((a, b) => b.value - a.value),
            payments: Object.entries(paymentRanges).map(([name, value]) => ({
                name, value, percentage: Math.round((value / paymentCount) * 100)
            }))
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchBusinessData = async () => {
            // Show fallback data immediately for instant UI
            setBusinessData(fallbackData);

            try {
                // Reduced timeout for faster fallback
                const timeout = 3000; // 3 seconds timeout
                
                const fetchWithTimeout = (url) => {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), timeout);
                    
                    return fetch(url, { signal: controller.signal })
                        .then(res => {
                            clearTimeout(timeoutId);
                            if (res.ok) {
                                return res.json();
                            } else {
                                console.warn(`API call failed for ${url}: ${res.status}`);
                                return null;
                            }
                        })
                        .catch((error) => {
                            console.warn(`API call error for ${url}:`, error.message);
                            return null;
                        });
                };

                console.log('Fetching data from APIs...'); // Debug log

                // Parallel API calls with immediate fallback
                const [customersRes, productsRes, paymentsRes] = await Promise.allSettled([
                    fetchWithTimeout('http://localhost:8081/customers'),
                    fetchWithTimeout('http://localhost:8081/products'),
                    fetchWithTimeout('http://localhost:8081/api/dashboard/top-payments')
                ]);

                console.log('API Results:', { 
                    customers: customersRes.status, 
                    products: productsRes.status, 
                    payments: paymentsRes.status 
                }); // Debug log

                if (!isMounted) return;

                // Extract successful responses
                const customers = customersRes.status === 'fulfilled' ? customersRes.value : null;
                const products = productsRes.status === 'fulfilled' ? productsRes.value : null;
                const payments = paymentsRes.status === 'fulfilled' ? paymentsRes.value : null;

                console.log('Extracted data:', { 
                    customersCount: customers?.length || 0, 
                    productsCount: products?.length || 0, 
                    paymentsCount: payments?.length || 0 
                }); // Debug log

                // Process data if we have any successful responses
                if (customers || products || payments) {
                    const processedData = processBusinessData(customers, products, payments);
                    
                    console.log('Processed Data:', processedData); // Debug log
                    
                    // Only update if we got better data than fallback
                    if (customers?.length > 0 || products?.length > 0) {
                        // Merge with fallback data to ensure all charts have data
                        setBusinessData({
                            creditLimits: processedData.creditLimits.length > 0 ? processedData.creditLimits : fallbackData.creditLimits,
                            productLines: processedData.productLines.length > 0 ? processedData.productLines : fallbackData.productLines,
                            payments: processedData.payments.length > 0 ? processedData.payments : fallbackData.payments,
                            customers: processedData.customers.length > 0 ? processedData.customers : fallbackData.customers
                        });
                    }
                } else {
                    console.log('No successful API responses, using fallback data');
                }
            } catch (error) {
                console.warn('API call failed, using fallback data:', error);
                // Fallback data is already set, no need to set again
            }
        };

        fetchBusinessData();

        return () => {
            isMounted = false;
        };
    }, [fallbackData, processBusinessData]);

    // Custom tooltip component - memoized for performance
    const CustomTooltip = useCallback(({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                    <p className="font-medium text-gray-900">{data.name}</p>
                    <p className="text-sm text-gray-600">
                        Count: <span className="font-medium">{data.value}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                        Percentage: <span className="font-medium">{data.payload.percentage}%</span>
                    </p>
                </div>
            );
        }
        return null;
    }, []);

    // Memoized chart components for better performance
    const ChartSection = useCallback(({ title, icon, data, colors, showCount = false }) => {
        // Ensure data is valid and not empty
        const validData = Array.isArray(data) && data.length > 0 ? data : [];
        
        return (
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                    {icon}
                    <h4 className="font-medium text-gray-700">{title}</h4>
                </div>
                {validData.length > 0 ? (
                    <>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={validData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    innerRadius={40}
                                    stroke="#fff"
                                    strokeWidth={2}
                                >
                                    {validData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className={`mt-3 space-y-1 ${validData.length > 4 ? 'max-h-20 overflow-y-auto' : ''}`}>
                            {validData.map((item, index) => (
                                <div key={item.name} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-3 h-3 rounded-full flex-shrink-0" 
                                            style={{ backgroundColor: colors[index % colors.length] }}
                                        ></div>
                                        <span className="text-gray-600 truncate">{item.name}</span>
                                    </div>
                                    <span className="font-medium text-gray-900 flex-shrink-0">
                                        {showCount ? `${item.value} customers` : `${item.percentage}%`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-48 text-gray-400">
                        <p>No data available</p>
                    </div>
                )}
            </div>
        );
    }, []);

    // Instantly show content - no loading state needed
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Business Analytics</h3>
                <FaChartPie className="text-gray-400" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartSection
                    title="Customer Credit Limits"
                    icon={<FaCreditCard className="text-blue-500 w-4 h-4" />}
                    data={businessData.creditLimits}
                    colors={colors.creditLimits}
                />
                
                <ChartSection
                    title="Product Line Distribution"
                    icon={<FaBox className="text-green-500 w-4 h-4" />}
                    data={businessData.productLines}
                    colors={colors.productLines}
                />
                
                <ChartSection
                    title="Payment Size Distribution"
                    icon={<FaDollarSign className="text-purple-500 w-4 h-4" />}
                    data={businessData.payments}
                    colors={colors.payments}
                />
                
                <ChartSection
                    title="Customer Distribution by Country"
                    icon={<FaUsers className="text-orange-500 w-4 h-4" />}
                    data={businessData.customers}
                    colors={colors.customers}
                    showCount={true}
                />
            </div>
        </div>
    );
};

export default BusinessAnalytics;
