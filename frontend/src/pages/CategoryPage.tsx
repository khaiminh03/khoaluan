import React, { useEffect, useState } from "react";
import axios from "axios";

interface Category {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

const AddCategory: React.FC = () => {
  const [form, setForm] = useState({ name: "", description: "" });
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [editId, setEditId] = useState<string | null>(null); // ✅ trạng thái sửa

  // Thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Chọn file ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewImage(URL.createObjectURL(selected));
    }
  };

  // Lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Không thể lấy danh mục:", err);
    }
  };

  // Gửi form thêm hoặc sửa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      if (file) formData.append("image", file);

      if (editId) {
        // ✅ cập nhật danh mục
        await axios.put(`http://localhost:5000/categories/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessage("✅ Đã cập nhật danh mục!");
      } else {
        // ✅ thêm danh mục mới
        await axios.post("http://localhost:5000/categories", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessage("✅ Danh mục đã được thêm!");
      }

      // Reset form
      setForm({ name: "", description: "" });
      setFile(null);
      setPreviewImage(null);
      setEditId(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      setMessage("❌ Thao tác thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Bấm nút "Sửa"
  const handleEdit = (category: Category) => {
    setEditId(category._id);
    setForm({
      name: category.name,
      description: category.description || "",
    });
    setPreviewImage(category.imageUrl ? `http://localhost:5000${category.imageUrl}` : null);
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="bg-white border border-gray-500/30 rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {editId ? "CHỈNH SỬA DANH MỤC" : "THÊM DANH MỤC SẢN PHẨM"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tên danh mục */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-500/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nhập tên danh mục..."
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Mô tả</label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              className="w-full border border-gray-500/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Thêm mô tả (không bắt buộc)..."
            />
          </div>

          {/* Upload ảnh */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Ảnh danh mục</label>
            <div className="flex items-center gap-6">
              <label
                htmlFor="upload"
                className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg px-4 py-2 cursor-pointer text-sm text-gray-700"
              >
                Chọn ảnh
                <input type="file" id="upload" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              {previewImage && (
                <img
                  src={previewImage}
                  alt="preview"
                  className="h-20 rounded-md border border-gray-500/30 shadow-sm object-contain"
                />
              )}
            </div>
          </div>

          {/* Nút Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : editId ? "Cập nhật danh mục" : "Lưu danh mục"}
            </button>
          </div>

          {/* Hủy sửa */}
          {editId && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setForm({ name: "", description: "" });
                  setFile(null);
                  setPreviewImage(null);
                }}
                className="text-sm text-gray-600 underline hover:text-red-600"
              >
                ❌ Hủy chỉnh sửa
              </button>
            </div>
          )}
        </form>

        {/* Thông báo */}
        {message && (
          <div
            className={`mt-6 text-center font-medium ${
              message.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </div>
        )}
      </div>

      {/* Danh sách danh mục */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">📂 Danh sách danh mục</h3>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có danh mục nào.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <li
                key={cat._id}
                className="border border-gray-300 p-4 rounded-xl flex gap-4 items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {cat.imageUrl && (
                    <img
                      src={`http://localhost:5000${cat.imageUrl}`}
                      alt={cat.name}
                      className="h-16 w-16 object-contain rounded-md border"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-800">{cat.name}</h4>
                    {cat.description && <p className="text-sm text-gray-500">{cat.description}</p>}
                  </div>
                </div>
                <button
                  onClick={() => handleEdit(cat)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Sửa
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AddCategory;
