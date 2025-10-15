import { useEffect, useState } from "react";
import axios from "axios";

const UserManagement = () => {
  // 🔹 State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const token = localStorage.getItem("userToken");

  // 🔹 Fetch users on load
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/admin/users`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers(data);
      } catch (err) {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  // 🔹 Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Step 1: Send OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/send-otp`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(data.message);
      setPendingEmail(formData.email);
      setShowOtpModal(true);
    } catch (err) {
      alert(err.response?.data?.message || "Error sending OTP");
    }
  };

  // 🔹 Step 2: Verify OTP
  const handleOtpVerify = async () => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/verify-otp`,
        { email: pendingEmail, otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("User created successfully!");
      setUsers([...users, data.user]);

      // Reset states
      setFormData({ name: "", email: "", password: "", role: "customer" });
      setOtp("");
      setShowOtpModal(false);
      setPendingEmail("");
    } catch (err) {
      alert(err.response?.data?.message || "Invalid or expired OTP");
    }
  };

  // 🔹 Update user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${userId}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map((u) => (u._id === userId ? data.user : u)));
    } catch {
      alert("Error updating role");
    }
  };

  // 🔹 Delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers(users.filter((u) => u._id !== userId));
      } catch {
        alert("Error deleting user");
      }
    }
  };

  // ========================
  // 🧾 JSX Rendering
  // ========================
  return (
    <div className="p-6 mx-auto max-w-7xl">
      <h2 className="mb-6 text-2xl font-bold">User Management</h2>

      {/* Add New User Form */}
      <div className="p-6 mb-6 rounded-lg bg-white shadow">
        <h3 className="mb-4 text-lg font-bold">Add New User</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      </div>

      {/* User List Table */}
      <div className="overflow-x-auto shadow-md sm:rounded-lg bg-white">
        <table className="min-w-full text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900 whitespace-nowrap">
                  {user.name}
                </td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleRoleChange(user._id, e.target.value)
                    }
                    className="p-2 border rounded"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 bg-white rounded shadow-md w-96">
            <h2 className="text-lg font-semibold text-center mb-4">
              Enter OTP to Verify User
            </h2>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
              placeholder="Enter OTP"
            />
            <button
              onClick={handleOtpVerify}
              className="w-full p-2 mb-2 text-white bg-green-600 rounded hover:bg-green-700"
            >
              Verify OTP
            </button>
            <button
              onClick={() => setShowOtpModal(false)}
              className="w-full p-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
