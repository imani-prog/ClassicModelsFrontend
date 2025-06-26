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
        <div className="bg-white p-6 rounded-lg shadow col-span-1 md:col-span-2">
            <h3 className="text-lg font-bold mb-4 text-left">Top Payments</h3>
            <div className="overflow-x-auto">
                <table className="w-1/2 border border-blue-300">
                    <thead className="bg-[#f5f5f5] border-b-2 border-[#258cbf]">
                        <tr>
                            <th className="px-2 py-2 text-center whitespace-nowrap">Customer Number</th>
                            <th className="px-2 py-2 text-center whitespace-nowrap">Check Number</th>
                            <th className="px-2 py-2 text-center whitespace-nowrap">Amount (Kshs)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {payments.map((payment, i) => (
                            <tr key={i}>
                                <td className="border-t-2 font-medium text-center border-[#42befb] px-2 py-1 whitespace-nowrap">
                                    {payment.customerNumber}
                                </td>
                                <td className="border-t-2 font-medium text-center border-[#42befb] px-2 py-1 whitespace-nowrap">
                                    {payment.checkNumber}
                                </td>
                                <td className="border-t-2 font-medium text-center border-[#42befb] px-2 py-1 whitespace-nowrap">
                                    Kshs {payment.amount.toLocaleString()}
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
