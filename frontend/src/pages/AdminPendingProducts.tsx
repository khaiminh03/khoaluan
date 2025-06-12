import { useEffect, useState } from 'react';
import axios from 'axios';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  origin: string;
  images: string[];
  status: string;
}

const AdminPendingProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchPendingProducts = async () => {
    const res = await axios.get('http://localhost:5000/products/admin/pending');
    setProducts(res.data);
  };

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    await axios.patch(`http://localhost:5000/products/${id}/status`, { status });
    fetchPendingProducts(); // refresh list
  };

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">DUYỆT SẢN PHẨM</h2>
      {products.length === 0 && <p>Không có sản phẩm chờ duyệt.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p._id} className="border rounded p-4 shadow">
            <img src={`http://localhost:5000/uploads/products/${p.images[0]}`} alt={p.name} className="h-32 object-cover mb-3" />
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <p className="text-sm">Giá: {p.price}₫ | Tồn kho: {p.stock}</p>
            <p className="text-sm">Xuất xứ: {p.origin}</p>

            <div className="mt-3 flex gap-2">
              <button onClick={() => handleStatusChange(p._id, 'approved')} className="px-3 py-1 bg-green-600 text-white rounded">Duyệt</button>
              <button onClick={() => handleStatusChange(p._id, 'rejected')} className="px-3 py-1 bg-red-600 text-white rounded">Từ chối</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPendingProducts;
