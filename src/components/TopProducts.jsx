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
    <div className="bg-white p-6 rounded-lg shadow w-full h-full">
      <h3 className="text-lg font-bold mb-4 text-center">Top Products by Price</h3>
      <div className="overflow-x-auto">
        <table className="w-full border border-blue-300">
          <thead className="bg-[#f5f5f5] border-b-2 border-[#258cbf]">
            <tr>
              <th className="px-3 py-2 text-center whitespace-nowrap">Name</th>
              <th className="px-3 py-2 text-center whitespace-nowrap">Buy Price</th>
              <th className="px-3 py-2 text-center whitespace-nowrap">Quantity</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {products.map((p, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="border-t-2 text-center font-medium border-[#42befb] px-3 py-2 whitespace-nowrap">{p.name}</td>
                <td className="border-t-2 text-center font-medium border-[#42befb] px-3 py-2 whitespace-nowrap">Kshs {p.price}</td>
                <td className="border-t-2 text-center font-medium border-[#42befb] px-3 py-2 whitespace-nowrap">{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopProducts;
