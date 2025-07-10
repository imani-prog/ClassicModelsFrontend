import { useEffect, useState } from 'react';

const CustomerCreditLimits = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:8081/customers')
      .then(res => res.json())
      .then(data => {
        const sortedCustomers = data
          .filter(customer => customer.creditLimit && customer.creditLimit > 0)
          .sort((a, b) => b.creditLimit - a.creditLimit);
        setCustomers(sortedCustomers);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load customers');
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center text-gray-600">Loading customers...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  const formatCreditLimit = (amount) => {
    if (amount >= 1000000) return `${(amount/1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount/1000).toFixed(0)}K`;
    return amount.toString();
  };

  const getCreditLimitColor = (creditLimit) => {
    if (creditLimit >= 100000) return 'text-green-600';
    if (creditLimit >= 50000) return 'text-blue-600';
    if (creditLimit >= 20000) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Credit Limits</h3>
        <div className="text-xs text-gray-500">Top</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-1 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-tight">Customer</th>
              <th className="px-1 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-tight w-16">Country</th>
              <th className="px-1 py-1.5 text-right text-xs font-medium text-gray-500 uppercase tracking-tight w-16">Limit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.slice(0, 8).map((customer, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-1 py-1.5 text-xs font-medium text-gray-900 truncate" title={customer.customerName}>
                  {customer.customerName}
                </td>
                <td className="px-1 py-1.5 text-xs text-gray-600 truncate">{customer.country}</td>
                <td className={`px-1 py-1.5 text-xs font-semibold text-right ${getCreditLimitColor(customer.creditLimit)}`}>
                  {formatCreditLimit(customer.creditLimit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerCreditLimits;

