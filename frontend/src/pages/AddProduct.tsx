import { useState, useEffect } from 'react';
import axios from 'axios';

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
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    setForm((prevForm) => ({
      ...prevForm,
      supplierId: userInfo._id || '',
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
  }, []);

  useEffect(() => {
    const slug = form.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/\u0300-\u036f/g, '')
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

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key !== 'images') {
        formData.append(key, String(value));
      }
    });
    form.images.forEach((file) => {
      formData.append('images', file);
    });

    try {
      await axios.post('http://localhost:5000/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Thêm sản phẩm thành công!');
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
        supplierId: form.supplierId,
        images: [],
      });
      setImageError(false);
    } catch (error) {
      console.error('Lỗi khi tạo sản phẩm:', error);
      alert('Thêm sản phẩm thất bại');
    }
  };

  return (
    <form
      className="space-y-6 max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-200"
      onSubmit={handleSubmit}
    >
      <h2 className="text-3xl font-semibold text-green-700 mb-6 text-center">THÊM SẢN PHẨM MỚI</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Tên sản phẩm</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Danh mục</label>
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
          >
            <option value="">Chọn danh mục</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">Mô tả sản phẩm</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Giá (VNĐ)</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Tồn kho</label>
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Số lượng</label>
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Đơn vị (kg, gói...)</label>
          <input
            type="text"
            name="unitType"
            value={form.unitType}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">Xuất xứ</label>
        <input
          type="text"
          name="origin"
          value={form.origin}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">Hình ảnh</label>
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

      <input type="hidden" name="supplierId" value={form.supplierId} />
      <input type="hidden" name="unitDisplay" value={form.unitDisplay} />

      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition duration-200"
      >
        + Thêm sản phẩm
      </button>
    </form>
  );
};

export default AddProduct;
