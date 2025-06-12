import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
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
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.filter((user: User) => user.role !== "admin"));
    } catch (err) {
      toast.error("Lỗi khi tải danh sách người dùng");
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(block ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản");
      fetchUsers();
    } catch (err) {
      toast.error("Thao tác thất bại");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="px-6 max-w-screen-xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 pb-2">
        QUẢN LÝ NGƯỜI DÙNG
      </h1>

      {loading ? (
        <div className="text-center text-gray-500">Đang tải dữ liệu...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full bg-white text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-xs font-semibold text-gray-600">
              <tr>
                <th className="px-5 py-3">STT</th>
                <th className="px-5 py-3">Ảnh</th>
                <th className="px-5 py-3">Tên</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Vai trò</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-center">Chức năng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4 font-medium">{index + 1}</td>
                  <td className="px-5 py-4">
                    <img
                      src={
                        user.avatarUrl?.startsWith("http") ||
                        user.avatarUrl?.startsWith("data:")
                          ? user.avatarUrl
                          : user.avatarUrl
                          ? `http://localhost:5000${user.avatarUrl}`
                          : assets.profile_icon
                      }
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover border border-gray-500/30 shadow-sm"
                    />
                  </td>
                  <td className="px-5 py-4">{user.name}</td>
                  <td className="px-5 py-4">{user.email}</td>
                  <td className="px-5 py-4 capitalize">{user.role}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.isBlocked
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.isBlocked ? "Bị khóa" : "Hoạt động"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => toggleBlock(user._id, !user.isBlocked)}
                      className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${
                        user.isBlocked
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-red-500 hover:bg-red-600"
                      } text-white`}
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
  );
};

export default UserManagement;
