import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard"; // Đường dẫn đúng đến ProductCard

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  categoryId: string;
}

const SearchPage = () => {
  const [params] = useSearchParams();
  const keyword = params.get("keyword") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/products/search?keyword=${encodeURIComponent(keyword)}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Lỗi khi tìm kiếm sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    if (keyword.trim()) {
      fetchResults();
    }
  }, [keyword]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Kết quả cho từ khóa: "{keyword}"</h2>

      {loading ? (
        <p>Đang tải kết quả...</p>
      ) : products.length === 0 ? (
        <p>Không tìm thấy sản phẩm nào phù hợp.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
