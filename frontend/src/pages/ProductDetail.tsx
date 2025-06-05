import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Supplier {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  imageUrl?: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  origin: string;
  categoryId: string;
  supplierId: Supplier;
  status: string;
  unitDisplay: string;
  quantity?: number;
}

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  userId: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

const BASE_IMAGE_URL = 'http://localhost:5000/uploads/products/';
const DEFAULT_IMAGE = '/default-image.png';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [thumbnail, setThumbnail] = useState<string>(DEFAULT_IMAGE);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/products/${id}`);
        const data: Product = res.data;
        setProduct(data);
        setThumbnail(data.images.length > 0 ? BASE_IMAGE_URL + data.images[0] : DEFAULT_IMAGE);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/reviews/product/${id}`);
        setReviews(res.data);
      } catch (err) {
        console.error('Lỗi khi lấy đánh giá:', err);
      }
    };

    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const getCartFromStorage = (): Product[] => {
    try {
      const cart = localStorage.getItem('cart');
      return cart ? JSON.parse(cart) : [];
    } catch {
      return [];
    }
  };

  const saveCartToStorage = (cart: Product[]) => {
    localStorage.setItem('cart', JSON.stringify(cart));
  };

  const addToCart = (goToCart: boolean) => {
    if (!product) return;
    let currentCart = getCartFromStorage();
    const existingProductIndex = currentCart.findIndex(item => item._id === product._id);

    if (existingProductIndex !== -1) {
      if (currentCart[existingProductIndex].quantity! < product.stock) {
        currentCart[existingProductIndex].quantity! += 1;
        alert('Đã tăng số lượng sản phẩm trong giỏ hàng.');
      } else {
        alert('Số lượng sản phẩm đã đạt giới hạn tồn kho.');
        return;
      }
    } else {
      if (product.stock > 0) {
        currentCart.push({ ...product, quantity: 1 });
        alert('Đã thêm sản phẩm vào giỏ hàng.');
      } else {
        alert('Sản phẩm tạm thời hết hàng.');
        return;
      }
    }

    saveCartToStorage(currentCart);
    window.dispatchEvent(new Event("cartUpdated")); // 🔔 cập nhật Navbar
    if (goToCart) navigate('/cart');
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div className="max-w-6xl w-full px-6 mx-auto">
      <p>
        <span>Trang chủ</span> / <span>Sản phẩm</span> / <span className="text-green-500">{product.name}</span>
      </p>

      <div className="flex flex-col md:flex-row gap-16 mt-4">
        <div className="flex gap-3">
          <div className="flex flex-col gap-3">
            {product.images.length > 0 ? product.images.map((image, index) => (
              <div
                key={index}
                onClick={() => setThumbnail(BASE_IMAGE_URL + image)}
                className={`border max-w-24 border-green-500 rounded overflow-hidden cursor-pointer ${thumbnail === BASE_IMAGE_URL + image ? 'ring-2 ring-green-500' : ''}`}
              >
                <img src={BASE_IMAGE_URL + image} alt={`Thumbnail ${index + 1}`} />
              </div>
            )) : (
              <div className="border max-w-24 border-green-500 rounded overflow-hidden cursor-pointer ring-2 ring-green-500">
                <img src={DEFAULT_IMAGE} alt="No image" />
              </div>
            )}
          </div>

          <div className="border border-gray-500/30 max-w-100 rounded overflow-hidden">
            <img src={thumbnail} alt="Selected product" className="max-w-md" />
          </div>
        </div>

        <div className="text-sm w-full md:w-1/2">
          <h1 className="text-3xl font-medium">{product.name}</h1>
          <div className="mt-6">
            <p className="text-2xl font-medium text-green-600">Giá: {product.price.toLocaleString()}₫</p>
            <span className="text-gray-500/70">(Đã bao gồm thuế VAT)</span>
          </div>

          <p className="text-base font-medium mt-6">Mô tả:</p>
          <p className="text-gray-500/70">{product.description}</p>

          <div className="mt-4 text-gray-500 text-sm space-y-1">
            <p><strong>Kho còn:</strong> {product.stock}</p>
            <p><strong>Đóng gói:</strong> {product.unitDisplay}</p>
            <p><strong>Xuất xứ:</strong> {product.origin}</p>
            <p><strong>Trạng thái:</strong> {product.status}</p>
          </div>

          <div className="flex items-center mt-10 gap-4 text-base">
            <button onClick={() => addToCart(false)} className="w-full py-3.5 font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition rounded">Thêm vào giỏ hàng</button>
            <button onClick={() => addToCart(true)} className="w-full py-3.5 font-medium bg-green-500 text-white hover:bg-green-400 transition rounded">Mua ngay</button>
          </div>
        </div>
      </div>

      {product.supplierId && (
        <div className="mt-12">
          <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-2xl shadow p-6">
            <div className="flex items-center gap-4 mb-4">
              {product.supplierId.imageUrl ? (
                <img
                  src={`http://localhost:5000/uploads/${product.supplierId.imageUrl}`}
                  alt="Ảnh nhà cung cấp"
                  className="w-16 h-16 rounded-full object-cover border border-green-300"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">N/A</div>
              )}
              <div>
                <h3 className="text-lg font-bold text-green-700">{product.supplierId.name}</h3>
                <p className="text-sm text-gray-500">{product.supplierId.address}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Đánh giá sản phẩm</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500 italic">Chưa có đánh giá nào.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white">
                <div className="flex items-center gap-3 mb-2">
                  {review.userId.avatarUrl ? (
                    <img
                      src={
                        review.userId.avatarUrl.startsWith("http") || review.userId.avatarUrl.startsWith("data:")
                          ? review.userId.avatarUrl
                          : `http://localhost:5000${review.userId.avatarUrl}`
                      }
                      className="w-10 h-10 rounded-full cursor-pointer object-cover"
                      alt="avatar"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-500">
                      N/A
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{review.userId.name}</p>
                    <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="text-yellow-500 text-sm mb-1">
                  {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
                </div>

                <p className="text-gray-700">
                  {review.comment ? review.comment : <i>(Không có nội dung)</i>}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
