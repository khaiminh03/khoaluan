import React, { useEffect, useState } from "react";

interface Supplier {
  _id: string;
  storeName: string;
  phone: string;
  address: string;
  isApproved: boolean;
}

const AdminSupplierList: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("accessToken");

  const fetchSuppliers = async () => {
    if (!token) {
      alert("Bạn chưa đăng nhập hoặc hết phiên làm việc");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/store-profiles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Không thể lấy danh sách nhà cung cấp");
      }
      const data = await res.json();
      setSuppliers(data);
    } catch (error: any) {
      alert(error.message || "Lỗi khi lấy dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const approveSupplier = async (id: string) => {
    if (!token) {
      alert("Bạn chưa đăng nhập hoặc hết phiên làm việc");
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:5000/store-profiles/${id}/approve`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        throw new Error("Duyệt nhà cung cấp thất bại");
      }
      alert("✅ Duyệt thành công");
      fetchSuppliers();
    } catch (error: any) {
      alert(error.message || "Lỗi khi duyệt nhà cung cấp");
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  if (loading) return <div className="text-center text-gray-500">Đang tải dữ liệu...</div>;

  if (!token)
    return (
      <div className="text-center text-red-500 font-semibold">
        Bạn cần đăng nhập với tài khoản admin để xem trang này.
      </div>
    );

  return (
    <div className=" bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Danh sách đăng ký nhà cung cấp</h1>
      {suppliers.length === 0 ? (
        <p className="text-gray-500">Chưa có nhà cung cấp nào đăng ký.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="py-3 px-4 border">Tên cửa hàng</th>
                <th className="py-3 px-4 border">Số điện thoại</th>
                <th className="py-3 px-4 border">Địa chỉ</th>
                <th className="py-3 px-4 border">Trạng thái</th>
                <th className="py-3 px-4 border">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 border-b">
                  <td className="py-2 px-4 border">{s.storeName}</td>
                  <td className="py-2 px-4 border">{s.phone}</td>
                  <td className="py-2 px-4 border">{s.address}</td>
                  <td className="py-2 px-4 border">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        s.isApproved
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {s.isApproved ? "Đã duyệt" : "Chờ duyệt"}
                    </span>
                  </td>
                  <td className="py-2 px-4 border">
                    {!s.isApproved && (
                      <button
                        onClick={() => approveSupplier(s._id)}
                        className="bg-indigo-500 text-white px-4 py-1 rounded hover:bg-indigo-600 transition"
                      >
                        Duyệt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSupplierList;
