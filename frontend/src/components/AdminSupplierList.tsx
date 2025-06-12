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
      if (!res.ok) throw new Error("Không thể lấy danh sách nhà cung cấp");
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
      if (!res.ok) throw new Error("Duyệt nhà cung cấp thất bại");
      alert("✅ Duyệt thành công");
      fetchSuppliers();
    } catch (error: any) {
      alert(error.message || "Lỗi khi duyệt nhà cung cấp");
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  if (!token) {
    return (
      <div className="text-center text-red-500 font-semibold mt-10">
        Bạn cần đăng nhập với tài khoản admin để xem trang này.
      </div>
    );
  }

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="px-6 max-w-screen-xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 pb-2">
        DANH SÁCH ĐĂNG KÝ NHÀ CUNG CẤP
      </h1>
      {suppliers.length === 0 ? (
        <p className="text-gray-500 text-center py-6">
          Chưa có nhà cung cấp nào đăng ký.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full bg-white text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-xs font-semibold text-gray-600">
              <tr>
                <th className="px-5 py-3">Tên cửa hàng</th>
                <th className="px-5 py-3">Số điện thoại</th>
                <th className="px-5 py-3">Địa chỉ</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-center">Chức năng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {suppliers.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">{s.storeName}</td>
                  <td className="px-5 py-4">{s.phone}</td>
                  <td className="px-5 py-4">{s.address}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        s.isApproved
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {s.isApproved ? "Đã duyệt" : "Chờ duyệt"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {!s.isApproved && (
                      <button
                        onClick={() => approveSupplier(s._id)}
                        className="bg-red-500 text-white px-4 py-1.5 rounded-md hover:bg-red-600 transition text-sm font-semibold"
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
