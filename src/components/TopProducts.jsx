import { useEffect, useState } from 'react';

const TopProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:8081/api/dashboard/top-products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load top products');
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center text-gray-600">Loading top products...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="bg-white rounded-lg shadow-md p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Top Products</h3>
        <div className="text-xs text-gray-500">Highest</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-1 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-tight">Product</th>
              <th className="px-1 py-1.5 text-right text-xs font-medium text-gray-500 uppercase tracking-tight w-16">Price</th>
              <th className="px-1 py-1.5 text-right text-xs font-medium text-gray-500 uppercase tracking-tight w-12">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.slice(0, 8).map((p, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-1 py-1.5 text-xs font-medium text-gray-900 truncate" title={p.name}>{p.name}</td>
                <td className="px-1 py-1.5 text-xs font-semibold text-right text-blue-600">
                  {p.price >= 1000 ? `${(p.price/1000).toFixed(1)}K` : p.price || 0}
                </td>
                <td className="px-1 py-1.5 text-xs text-gray-600 text-right">{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopProducts;
