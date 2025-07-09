import { useEffect, useState } from 'react';

const TopPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('http://localhost:8081/api/dashboard/top-payments')
            .then(res => res.json())
            .then(data => {
                setPayments(data);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load payments');
                setLoading(false);
            });
    }, []);

    if (loading) return <p className="text-gray-600 text-center">Loading payments...</p>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800">Top Payments</h3>
                <div className="text-xs text-gray-500">Highest</div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="px-1 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-tight w-20">Customer</th>
                            <th className="px-1 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-tight w-16">Check#</th>
                            <th className="px-1 py-1.5 text-right text-xs font-medium text-gray-500 uppercase tracking-tight">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {payments.slice(0, 8).map((payment, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                <td className="px-1 py-1.5 text-xs font-medium text-gray-900 truncate">{payment.customerNumber}</td>
                                <td className="px-1 py-1.5 text-xs text-gray-600 truncate">{payment.checkNumber}</td>
                                <td className="px-1 py-1.5 text-xs font-semibold text-right text-green-600">
                                    {payment.amount >= 1000 ? `${(payment.amount/1000).toFixed(0)}K` : payment.amount}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TopPayments;
