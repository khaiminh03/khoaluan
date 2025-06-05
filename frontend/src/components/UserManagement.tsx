import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";


interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  isBlocked?: boolean;
  phone?: string;
  address?: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get("http://localhost:5000/users/admin/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Lọc bỏ tài khoản admin
      setUsers(res.data.filter((user: User) => user.role !== "admin"));
    } catch (err) {
      toast.error("Lỗi khi tải danh sách người dùng");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (id: string, block: boolean) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.patch(
        `http://localhost:5000/users/admin/block/${id}`,
        { block },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(block ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản");
      fetchUsers();
    } catch (err) {
      toast.error("Thao tác thất bại");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
  <div className="bg-white shadow-md rounded-lg ">
    <h2 className="text-2xl font-semibold text-gray-800 mb-6">👥 Quản lý người dùng</h2>

    {loading ? (
      <div className="text-center text-gray-500">Đang tải dữ liệu...</div>
    ) : (
      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3">#</th>
              <th scope="col" className="px-6 py-3">Ảnh</th>
              <th scope="col" className="px-6 py-3">Tên</th>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">Vai trò</th>
              <th scope="col" className="px-6 py-3">Trạng thái</th>
              <th scope="col" className="px-6 py-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={user._id}
                className="border-t hover:bg-gray-50 transition duration-150"
              >
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4">
                  <img
                    src={user.avatarUrl || "/default-avatar.png"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full shadow object-cover border"
                  />
                </td>
                <td className="px-6 py-4 font-medium">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4 capitalize">{user.role}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      user.isBlocked
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {user.isBlocked ? "Bị khóa" : "Hoạt động"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => toggleBlock(user._id, !user.isBlocked)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      user.isBlocked
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                  >
                    {user.isBlocked ? "Mở khóa" : "Khóa"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
</div>
  );
};

export default UserManagement;
