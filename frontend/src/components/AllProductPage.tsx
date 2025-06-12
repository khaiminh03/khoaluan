import { useEffect, useState } from 'react';

interface Product {
  _id: string;
  name: string;
  categoryId: string;
  price: number;
  inStock: boolean;
  images: string[];
  category: string;
  supplierId: string;
  supplierName?: string;
  supplierPhone?: string;
  origin: string;
  description?: string;
  stock?: number;
  unitType?: string;
  quantity?: string;
}

const ViewProductModal = ({ open, onClose, product }: {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}) => {
  if (!product) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${open ? '' : 'hidden'}`}>
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Chi tiết sản phẩm</h2>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <img
            src={`http://localhost:5000/uploads/products/${product.images[0]}`}
            alt={product.name}
            className="w-full md:w-1/2 max-h-64 object-contain rounded-lg border border-gray-500/30"
          />
          <div className="flex-1 text-sm text-gray-700 space-y-2">
            <p><span className="font-medium text-gray-900">Tên:</span> {product.name}</p>
            <p><span className="font-medium text-gray-900">Giá:</span> {product.price.toLocaleString('vi-VN')}đ</p>
            <p><span className="font-medium text-gray-900">Xuất xứ:</span> {product.origin}</p>
            <p><span className="font-medium text-gray-900">Danh mục:</span> {product.category}</p>
            <p><span className="font-medium text-gray-900">Nhà cung cấp:</span> {product.supplierName ?? 'Không rõ'}</p>
            <p><span className="font-medium text-gray-900">SĐT nhà cung cấp:</span> {product.supplierPhone ?? 'Không rõ'}</p>
            <p><span className="font-medium text-gray-900">Tồn kho:</span> {product.stock ?? 'Không rõ'}</p>
            <p><span className="font-medium text-gray-900">Đơn vị:</span> {product.unitType ?? 'Không rõ'}</p>
            <p><span className="font-medium text-gray-900">Mô tả:</span> {product.description ?? 'Không có mô tả'}</p>
          </div>
        </div>
        <div className="text-right mt-6">
          <button
            onClick={onClose}
            className="inline-flex items-center px-5 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const AllProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  const fetchCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/categories/${categoryId}`);
      if (!response.ok) throw new Error('Failed to fetch category');
      const categoryData = await response.json();
      return categoryData.name;
    } catch (error) {
      console.error(error);
      return 'Unknown';
    }
  };

  const fetchSupplierInfo = async (supplierId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/store-profiles/by-user/${supplierId}`);
      if (!res.ok) throw new Error('Không thể lấy hồ sơ nhà cung cấp');
      const data = await res.json();
      return {
        name: data.storeName || 'Không rõ',
        phone: data.phone || 'Không rõ',
      };
    } catch (error) {
      console.error(error);
      return {
        name: 'Không rõ',
        phone: 'Không rõ',
      };
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();

      for (let product of data) {
        const [categoryName, supplierInfo] = await Promise.all([
          fetchCategory(product.categoryId),
          fetchSupplierInfo(product.supplierId),
        ]);
        product.category = categoryName;
        product.supplierName = supplierInfo.name;
        product.supplierPhone = supplierInfo.phone;
      }

      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleViewClick = (product: Product) => {
    setViewProduct(product);
    setViewOpen(true);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className="w-full">
        <h2 className="pb-4 text-lg font-medium">Tất cả sản phẩm</h2>
        <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="md:table-auto table-fixed w-full overflow-hidden">
            <thead className="text-gray-900 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">Sản phẩm</th>
                <th className="px-4 py-3 font-semibold truncate">Danh mục</th>
                <th className="px-4 py-3 font-semibold truncate hidden md:block">Giá</th>
                <th className="px-4 py-3 font-semibold truncate">Chức năng</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {products.map((product, index) => (
                <tr key={index} className="border-t border-gray-500/20">
                  <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                    <div className="border border-gray-300 rounded p-2">
                      <img
                        src={`http://localhost:5000/uploads/products/${product.images[0]}`}
                        alt={product.name}
                        className="w-16"
                      />
                    </div>
                    <span className="truncate max-sm:hidden w-full">{product.name}</span>
                  </td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3">{product.price.toLocaleString('vi-VN')}đ</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleViewClick(product)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                    >
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewProduct && (
        <ViewProductModal
          open={viewOpen}
          onClose={() => setViewOpen(false)}
          product={viewProduct}
        />
      )}
    </div>
  );
};

export default AllProductPage;
