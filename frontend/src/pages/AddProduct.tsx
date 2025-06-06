import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Category {
  _id: string;
  name: string;
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  price: number;
  quantity: number;
  unitType: string;
  unitDisplay: string;
  stock: number;
  origin: string;
  categoryId: string;
  supplierId: string;
  images: File[];
}

const AddProduct = () => {
  const [form, setForm] = useState<FormState>({
    name: '',
    slug: '',
    description: '',
    price: 0,
    quantity: 0,
    unitType: '',
    unitDisplay: '',
    stock: 0,
    origin: '',
    categoryId: '',
    supplierId: '',
    images: [],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    if (userInfo.role !== 'supplier') {
      alert('Bạn không có quyền thêm sản phẩm');
      navigate('/');
      return;
    }

    setUserRole(userInfo.role);
    setForm((prevForm) => ({
      ...prevForm,
      supplierId: userInfo._id,
    }));

    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/categories');
        setCategories(res.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh mục:', error);
      }
    };

    fetchCategories();
  }, [navigate]);

  useEffect(() => {
    const slug = form.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setForm((prev) => ({
      ...prev,
      slug,
    }));
  }, [form.name]);

  useEffect(() => {
    const { quantity, unitType } = form;
    if (quantity && unitType) {
      setForm((prev) => ({
        ...prev,
        unitDisplay: `${quantity}${unitType}`,
      }));
    }
  }, [form.quantity, form.unitType]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files);
    setForm((prevForm) => ({
      ...prevForm,
      images: fileArray,
    }));
    setImageError(fileArray.length === 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.images.length === 0) {
      setImageError(true);
      alert('Vui lòng chọn ít nhất 1 ảnh sản phẩm');
      return;
    }

    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    const supplierId = userInfo._id;

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('slug', form.slug);
    formData.append('description', form.description);
    formData.append('price', String(form.price));
    formData.append('quantity', String(form.quantity));
    formData.append('unitType', form.unitType);
    formData.append('unitDisplay', form.unitDisplay);
    formData.append('stock', String(form.stock));
    formData.append('origin', form.origin);
    formData.append('categoryId', form.categoryId);
    formData.append('supplierId', supplierId);

    form.images.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const res = await axios.post('http://localhost:5000/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Thêm sản phẩm thành công!');
      console.log(res.data);
      setForm({
        name: '',
        slug: '',
        description: '',
        price: 0,
        quantity: 0,
        unitType: '',
        unitDisplay: '',
        stock: 0,
        origin: '',
        categoryId: '',
        supplierId: supplierId,
        images: [],
      });
      setImageError(false);
    } catch (error) {
      console.error('Lỗi khi tạo sản phẩm:', error);
      alert('Thêm sản phẩm thất bại');
    }
  };

  if (userRole !== 'supplier') {
    return (
      <div className="text-center mt-20">
        <h2 className="text-xl">Bạn không có quyền thêm sản phẩm</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <form
  className="space-y-6 max-w-2xl mx-auto bg-white shadow-md rounded-xl p-6 mt-10"
  onSubmit={handleSubmit}
>
  <h2 className="text-2xl font-bold text-gray-800">Thêm sản phẩm</h2>

  {/* Tên sản phẩm */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
    <input
      type="text"
      name="name"
      value={form.name}
      onChange={handleChange}
      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
    />
  </div>

  {/* Mô tả */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
    <textarea
      name="description"
      value={form.description}
      onChange={handleChange}
      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
      rows={4}
    />
  </div>

  {/* Cặp: Giá + Tồn kho */}
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
      <input
        type="number"
        name="price"
        value={form.price}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho</label>
      <input
        type="number"
        name="stock"
        value={form.stock}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
      />
    </div>
  </div>

  {/* Cặp: Số lượng + Đơn vị */}
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
      <input
        type="number"
        name="quantity"
        value={form.quantity}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị (kg, gói...)</label>
      <input
        type="text"
        name="unitType"
        value={form.unitType}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
      />
    </div>
  </div>

  {/* Xuất xứ */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Xuất xứ</label>
    <input
      type="text"
      name="origin"
      value={form.origin}
      onChange={handleChange}
      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
    />
  </div>

  {/* Danh mục */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
    <select
      name="categoryId"
      value={form.categoryId}
      onChange={handleChange}
      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
    >
      <option value="">Chọn danh mục</option>
      {categories.map((cat) => (
        <option key={cat._id} value={cat._id}>
          {cat.name}
        </option>
      ))}
    </select>
  </div>

  {/* Hình ảnh */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
    <input
      type="file"
      name="images"
      multiple
      accept="image/*"
      onChange={handleImageChange}
      className="w-full text-sm text-gray-700"
    />
    {imageError && (
      <p className="text-red-500 text-sm mt-1">* Vui lòng chọn ít nhất 1 ảnh</p>
    )}
  </div>

  {/* Hidden fields */}
  <input type="hidden" name="supplierId" value={form.supplierId} />
  <input type="hidden" name="unitDisplay" value={form.unitDisplay} />

  {/* Submit */}
  <button
    type="submit"
    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition"
  >
    Thêm sản phẩm
  </button>
</form>

  );
};

export default AddProduct;
