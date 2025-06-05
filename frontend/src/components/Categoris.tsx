import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Category = {
  _id: string;
  name: string;
  description?: string;
  image: string;
};

const Categoris = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Lỗi khi tải danh mục:", err));
  }, []);

  return (
    <div className="mt-16">
      <p className="text-2xl md:text-3xl font-medium">DANH MỤC SẢN PHẨM</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 mt-6 gap-6">
        {categories.map((category) => (
          <div
            key={category._id}
            className="group cursor-pointer py-5 px-3 gap-2 rounded-lg flex flex-col justify-center items-center"
            style={{ backgroundColor: "#f3f4f6" }}
            onClick={() => {
              navigate(`/products/category/${category._id}`);
              scrollTo(0, 0);
            }}
          >
            <img
              src={`http://localhost:5000/uploads/categories/${category.image}`}
              alt={category.name}
              className="group-hover:scale-105 transition max-w-28"
            />
            <p className="text-sm font-medium">{category.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categoris;
