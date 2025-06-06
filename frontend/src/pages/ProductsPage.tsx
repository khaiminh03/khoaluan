import React, { useEffect, useState } from 'react';
import { Modal, Box, TextField, Button, Input } from '@mui/material';

interface Product {
  _id: string;
  name: string;
  categoryId: string;
  price: number;
  inStock: boolean;
  images: string[];
  category: string;
  supplierId: string;
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 Chi tiết sản phẩm</h2>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <img
            src={`http://localhost:5000/uploads/products/${product.images[0]}`}
            alt={product.name}
            className="w-full md:w-1/2 max-h-64 object-contain rounded-lg border"
          />
          <div className="flex-1 text-sm text-gray-700 space-y-2">
            <p><span className="font-medium text-gray-900">Tên:</span> {product.name}</p>
            <p><span className="font-medium text-gray-900">Giá:</span> {product.price.toLocaleString()}đ</p>
            <p><span className="font-medium text-gray-900">Xuất xứ:</span> {product.origin}</p>
            <p><span className="font-medium text-gray-900">Danh mục:</span> {product.category}</p>
            <p><span className="font-medium text-gray-900">Tồn kho:</span> {product.stock ?? 'Không rõ'}</p>
            <p><span className="font-medium text-gray-900">Đơn vị:</span> {product.unitType ?? 'Không rõ'}</p>
            <p><span className="font-medium text-gray-900">Mô tả:</span> {product.description ?? 'Không có mô tả'}</p>
          </div>
        </div>
        <div className="text-right mt-6">
          <button
            onClick={onClose}
            className="inline-flex items-center px-5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};


const EditProductModal = ({ open, onClose, product, onSave }: {
  open: boolean,
  onClose: () => void,
  product: Product,
  onSave: (updatedProduct: Product) => void
}) => {
  const [form, setForm] = useState<Product>(product);
  const [newImage, setNewImage] = useState<File | null>(null);

  useEffect(() => {
    setForm(product);
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    let updatedProduct = { ...form };
    if (newImage) {
      const formData = new FormData();
      formData.append('image', newImage);

      try {
        const response = await fetch(`http://localhost:5000/products/upload/${form._id}`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        updatedProduct.images = [data.filename];
      } catch (err) {
        console.error('Image upload failed:', err);
      }
    }
    onSave(updatedProduct);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        maxHeight: '80vh',
        overflowY: 'auto',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
        scrollbarGutter: 'stable'
      }}>
        <h2>Cập nhật sản phẩm</h2>

        <img
          src={`http://localhost:5000/uploads/products/${form.images?.[0]}`}
          alt="Hiện tại"
          style={{ maxWidth: '100%', marginBottom: 16 }}
        />

        <TextField fullWidth label="Tên" name="name" value={form.name || ''} onChange={handleChange} sx={{ mb: 2 }} />
        <TextField fullWidth label="Giá" name="price" type="number" value={form.price || 0} onChange={handleChange} sx={{ mb: 2 }} />
        <TextField fullWidth label="Xuất xứ" name="origin" value={form.origin || ''} onChange={handleChange} sx={{ mb: 2 }} />
        <TextField fullWidth label="Số lượng" name="quantity" type="number" value={form.quantity || 0} onChange={handleChange} sx={{ mb: 2 }} />
        <TextField fullWidth label="Tồn kho" name="stock" type="number" value={form.stock || 0} onChange={handleChange} sx={{ mb: 2 }} />
        <TextField fullWidth label="Đơn vị tính" name="unitType" value={form.unitType || ''} onChange={handleChange} sx={{ mb: 2 }} />
        <TextField fullWidth label="Mô tả" name="description" multiline rows={3} value={form.description || ''} onChange={handleChange} sx={{ mb: 2 }} />
        <Input type="file" onChange={handleFileChange} sx={{ mb: 2 }} />
        <Button variant="contained" onClick={handleSubmit}>Lưu</Button>
      </Box>
    </Modal>
  );
};

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      const userInfo = localStorage.getItem('user_info');
      if (!userInfo) throw new Error('User info not found');
      const parsedUserInfo = JSON.parse(userInfo);
      const supplierId = parsedUserInfo._id;
      const filteredProducts = data.filter((product: Product) => product.supplierId === supplierId);
      for (let product of filteredProducts) {
        const categoryName = await fetchCategory(product.categoryId);
        product.category = categoryName;
      }
      setProducts(filteredProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setEditOpen(true);
  };

  const handleViewClick = (product: Product) => {
    setViewProduct(product);
    setViewOpen(true);
  };

  const handleSave = async (updatedProduct: Product) => {
    try {
      await fetch(`http://localhost:5000/products/${updatedProduct._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
      setEditOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex-1 py-10 flex flex-col justify-between">
      <div className="w-full md:p-10 p-4">
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
                  <td className="px-4 py-3">{product.price}đ</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
                    <button
                      onClick={() => handleEditClick(product)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => handleViewClick(product)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                    >
                      Xem
                    </button>
                  </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProduct && (
        <EditProductModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          product={selectedProduct}
          onSave={handleSave}
        />
      )}

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

export default ProductsPage;
