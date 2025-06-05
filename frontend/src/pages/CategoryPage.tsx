import React, { useState } from 'react';
import axios from 'axios';

const AddCategory: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewImage(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      if (file) {
        formData.append('image', file);
      }

      await axios.post('http://localhost:5000/categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Thêm danh mục thành công!');
      setForm({ name: '', description: '' });
      setFile(null);
      setPreviewImage(null);
    } catch (error) {
      console.error(error);
      setMessage('Thêm danh mục thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Thêm danh mục </h2>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Tên danh mục <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Mô tả</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">Hình ảnh</label>
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-4 cursor-pointer hover:bg-gray-50">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="fileUpload"
            />
            <label htmlFor="fileUpload" className="flex flex-col items-center cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-500 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-5 4l-3-3m0 0l-3 3m3-3V4" />
              </svg>
              <span className="text-sm text-gray-600">Chọn file ảnh</span>
            </label>
          </div>
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="mt-4 max-h-48 rounded-md shadow-md mx-auto"
            />
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Thêm danh mục'}
          </button>
        </div>
      </form>

      {/* Message */}
      {message && (
        <div className="text-center mt-6 text-lg font-medium text-green-600">
          {message}
        </div>
      )}
    </div>
  );
};

export default AddCategory;
