import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from './ProductCard';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  categoryId: string;
}

const ProductsByCategory = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Gọi song song 2 API: sản phẩm và tên danh mục
        const [productRes, categoryRes] = await Promise.all([
          axios.get(`http://localhost:5000/products/by-category-id/${categoryId}`),
          axios.get(`http://localhost:5000/categories/${categoryId}`)
        ]);

        setProducts(productRes.data);
        setCategoryName(categoryRes.data.name); 
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchData();
    }
  }, [categoryId]);

  return (
    <div className="mt-16 px-4">
      <p className="text-2xl font-medium ">
        {categoryName.toUpperCase()}
      </p>

      {loading ? (
        <p className="text-center text-gray-500 mt-6">Đang tải sản phẩm...</p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500 mt-6">Không có sản phẩm nào trong danh mục này.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mt-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsByCategory;
