import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";
import { getAllUsers, createUser, updateUser, deleteUser, updateUserRole } from "../../api";
import { useAuth } from "../../context/AuthContext";
import SettingsBg from "../../assets/accsettbg.png";

export default function SettingsContent() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { user: currentUser } = useAuth();

  // System Info State
  const [systemInfo, setSystemInfo] = useState(() => {
    const saved = localStorage.getItem("systemInfo");
    return saved ? JSON.parse(saved) : {
      systemName: "Dorm Management System",
      version: "1.0.0",
      contactEmail: "admin@dorm.com",
      contactPhone: "+63 123 456 7890",
      address: "123 Dormitory Street, City, Country"
    };
  });

  // User Form State
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
    role: "staff",
    status: "active"
  });

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
    
    // Redirect staff users away from system tab
    if (activeTab === "system" && currentUser?.role === "staff") {
      setActiveTab("users");
      toast.error("Access denied. Only administrators can access system information.");
    }
  }, [activeTab, currentUser?.role]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare user data
      const userData = {
        username: userForm.username,
        email: userForm.email,
        fullName: userForm.fullName,
        phone: userForm.phone || "",
        role: userForm.role,
        status: userForm.status
      };

      // Only include password if it's provided (for create) or if editing and password is not empty
      if (!editingUser) {
        // Creating new user - password is required
        if (!userForm.password || userForm.password.trim() === "") {
          toast.error("Password is required");
          return;
        }
        userData.password = userForm.password;
      } else if (userForm.password && userForm.password.trim() !== "") {
        // Updating user - only include password if provided
        userData.password = userForm.password;
      }

      if (editingUser) {
        await updateUser(editingUser.id, userData);
        toast.success("User updated successfully");
      } else {
        await createUser(userData);
        toast.success("User created successfully");
      }
      setShowUserModal(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error(error.message || "Failed to save user");
    }
  };

  const handleEditUser = (user) => {
    // Staff can only edit their own profile
    if (currentUser?.role === "staff" && user.id !== currentUser?.id) {
      toast.error("You can only edit your own profile");
      return;
    }
    
    setEditingUser(user);
    setUserForm({
      username: user.username,
      email: user.email,
      password: "",
      fullName: user.fullName,
      phone: user.phone || "",
      role: user.role,
      status: user.status
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await deleteUser(userId);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    // Prevent users from changing their own role
    if (userId === currentUser?.id) {
      toast.error("You cannot change your own role");
      fetchUsers(); // Refresh to reset the dropdown
      return;
    }
    
    try {
      await updateUserRole(userId, newRole);
      toast.success("User role updated");
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error(error.message || "Failed to update role");
      fetchUsers(); // Refresh to reset the dropdown on error
    }
  };

  const handleSystemInfoSave = () => {
    // In a real app, this would call an API
    localStorage.setItem("systemInfo", JSON.stringify(systemInfo));
    toast.success("System information saved");
  };

  const resetForm = () => {
    setUserForm({
      username: "",
      email: "",
      password: "",
      fullName: "",
      phone: "",
      role: "staff",
      status: "active"
    });
    setEditingUser(null);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin": return "bg-red-500 text-white";
      case "staff": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "active": return "bg-green-400 text-white";
      case "inactive": return "bg-gray-400 text-white";
      case "suspended": return "bg-red-400 text-white";
      default: return "bg-gray-400 text-white";
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#f7b094] to-[#dd7255] rounded-2xl px-6 py-10 flex flex-col gap-6 w-full h-full">
      {/* Header */}
      <div
        className="bg-cover bg-center shadow-[15px_13px_0px_#330101] rounded-2xl text-white py-6 px-6 md:px-20"
        style={{ backgroundImage: `url(${SettingsBg})` }}
      >
        <h1 className="font-[BoldMilk] tracking-[10px] md:tracking-[15px] text-[24px] md:text-[30px] text-white uppercase">
          Settings
        </h1>
      </div>

      {/* Tabs */}
      <div className="bg-gradient-to-r from-[#fee8da] to-[#efd4c4] shadow-[15px_13px_0px_#330101] rounded-2xl p-4">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-2 rounded-lg font-[BoldMilk] transition-all ${
              activeTab === "users"
                ? "bg-[#db6747] text-white shadow-md"
                : "bg-white text-[#4b150d] hover:bg-gray-100"
            }`}
          >
            User Management
          </button>
          
          {/* System Information Tab - Only visible for Admin */}
          {currentUser?.role === "admin" ? (
            <button
              onClick={() => setActiveTab("system")}
              className={`px-6 py-2 rounded-lg font-[BoldMilk] transition-all ${
                activeTab === "system"
                  ? "bg-[#db6747] text-white shadow-md"
                  : "bg-white text-[#4b150d] hover:bg-gray-100"
              }`}
            >
              System Information
            </button>
          ) : (
            <button
              disabled
              className="px-6 py-2 rounded-lg font-[BoldMilk] bg-gray-300 text-gray-500 cursor-not-allowed relative group"
              title="Admin access required"
            >
              System Information
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Admin access required
              </div>
            </button>
          )}
        </div>

        {/* User Management Tab */}
        {activeTab === "users" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-[BoldMilk] text-[#4b150d] text-xl">Staff Users</h2>
              {currentUser?.role === "admin" && (
                <button
                  onClick={() => {
                    resetForm();
                    setShowUserModal(true);
                  }}
                  className="bg-[#db6747] text-white px-4 py-2 rounded-lg font-[BoldMilk] hover:bg-[#c44d30] transition-colors shadow-md"
                >
                  + Add User
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#4b150d]"></div>
                <p className="mt-4 text-[#4b150d] font-[LightMilk]">Loading users...</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#4b150d] text-[#efd4c4]">
                    <tr>
                      <th className="py-3 px-4 text-left">Username</th>
                      <th className="py-3 px-4 text-left">Full Name</th>
                      <th className="py-3 px-4 text-left">Email</th>
                      <th className="py-3 px-4 text-left">Role</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className={`border-b border-gray-200 hover:bg-gray-50 ${
                        user.id === currentUser?.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}>
                        <td className="py-3 px-4 text-[#4b150d]">
                          {user.username}
                          {user.id === currentUser?.id && (
                            <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[#4b150d]">{user.fullName}</td>
                        <td className="py-3 px-4 text-[#4b150d]">{user.email}</td>
                        <td className="py-3 px-4">
                          {currentUser?.role === "admin" ? (
                            user.id === currentUser?.id ? (
                              <span className={`rounded px-2 py-1 text-sm ${getRoleBadgeColor(user.role)}`} title="You cannot change your own role">
                                {user.role}
                              </span>
                            ) : (
                              <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                className={`rounded px-2 py-1 text-sm ${getRoleBadgeColor(user.role)} border-none`}
                              >
                                <option value="admin">Admin</option>
                                <option value="staff">Staff</option>
                              </select>
                            )
                          ) : (
                            <span className={`rounded px-2 py-1 text-sm ${getRoleBadgeColor(user.role)}`}>
                              {user.role}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`rounded px-2 py-1 text-sm ${getStatusBadgeColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-3">
                            {/* Staff can only edit their own account, Admin can edit anyone */}
                            {(currentUser?.role === "admin" || user.id === currentUser?.id) ? (
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title={user.id === currentUser?.id ? "Edit Your Profile" : "Edit User"}
                              >
                                <FaEdit className="text-lg" />
                              </button>
                            ) : (
                              <button
                                disabled
                                className="text-gray-400 cursor-not-allowed"
                                title="You can only edit your own profile"
                              >
                                <FaEdit className="text-lg" />
                              </button>
                            )}
                            
                            {/* Only admin can delete users, and not their own account */}
                            {currentUser?.role === "admin" && currentUser.id !== user.id && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Delete User"
                              >
                                <FaTrash className="text-lg" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* System Information Tab - Only accessible by Admin */}
        {activeTab === "system" && currentUser?.role === "admin" && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <h2 className="font-[BoldMilk] text-[#4b150d] text-xl">System Configuration</h2>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                Admin Only
              </span>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
              <div>
                <label className="block text-[#4b150d] font-[LightMilk] text-sm mb-2">System Name</label>
                <input
                  type="text"
                  value={systemInfo.systemName}
                  onChange={(e) => setSystemInfo({ ...systemInfo, systemName: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#4b150d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                />
              </div>
              <div>
                <label className="block text-[#4b150d] font-[LightMilk] text-sm mb-2">Version</label>
                <input
                  type="text"
                  value={systemInfo.version}
                  onChange={(e) => setSystemInfo({ ...systemInfo, version: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#4b150d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                />
              </div>
              <div>
                <label className="block text-[#4b150d] font-[LightMilk] text-sm mb-2">Contact Email</label>
                <input
                  type="email"
                  value={systemInfo.contactEmail}
                  onChange={(e) => setSystemInfo({ ...systemInfo, contactEmail: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#4b150d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                />
              </div>
              <div>
                <label className="block text-[#4b150d] font-[LightMilk] text-sm mb-2">Contact Phone</label>
                <input
                  type="text"
                  value={systemInfo.contactPhone}
                  onChange={(e) => setSystemInfo({ ...systemInfo, contactPhone: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#4b150d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                />
              </div>
              <div>
                <label className="block text-[#4b150d] font-[LightMilk] text-sm mb-2">Address</label>
                <textarea
                  value={systemInfo.address}
                  onChange={(e) => setSystemInfo({ ...systemInfo, address: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border-2 border-[#4b150d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                />
              </div>
              <button
                onClick={handleSystemInfoSave}
                className="bg-[#db6747] text-white px-6 py-2 rounded-lg font-[BoldMilk] hover:bg-[#c44d30] transition-colors shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Access Denied Message for Staff trying to access System tab */}
        {activeTab === "system" && currentUser?.role === "staff" && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8">
              <div className="text-red-500 text-6xl mb-4">🔒</div>
              <h3 className="font-[BoldMilk] text-[#4b150d] text-xl mb-2">Access Denied</h3>
              <p className="text-[#4b150d] mb-4">
                You don't have permission to access system information.
              </p>
              <p className="text-sm text-gray-600">
                Only administrators can view and modify system settings.
              </p>
              <button
                onClick={() => setActiveTab("users")}
                className="mt-4 bg-[#db6747] text-white px-6 py-2 rounded-lg font-[BoldMilk] hover:bg-[#c44d30] transition-colors"
              >
                Go to User Management
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-[15px_13px_0px_#330101]">
            <h3 className="font-[BoldMilk] text-[#4b150d] text-xl mb-4">
              {editingUser 
                ? (editingUser.id === currentUser?.id ? "Edit Your Profile" : "Edit User")
                : "Create New User"
              }
            </h3>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="block text-[#4b150d] font-[LightMilk] text-sm mb-2">Username</label>
                <input
                  type="text"
                  required
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#4b150d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                />
              </div>
              <div>
                <label className="block text-[#4b150d] font-[LightMilk] text-sm mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#4b150d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                />
              </div>
              <div>
                <label className="block text-[#4b150d] font-[LightMilk] text-sm mb-2">
                  Password {editingUser && "(leave blank to keep current)"}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#4b150d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                />
              </div>
              <div>
                <label className="block text-[#4b150d] font-[LightMilk] text-sm mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#4b150d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                />
              </div>
              <div>
                <label className="block text-[#4b150d] font-[LightMilk] text-sm mb-2">Phone</label>
                <input
                  type="text"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#4b150d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                />
              </div>
              <div>
                <label className="block text-[#4b150d] font-[LightMilk] text-sm mb-2">Role</label>
                {currentUser?.role === "staff" && editingUser?.id === currentUser?.id ? (
                  <input
                    type="text"
                    value={userForm.role}
                    disabled
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    title="You cannot change your own role"
                  />
                ) : (
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-[#4b150d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                    disabled={currentUser?.role === "staff"}
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                )}
              </div>
              <div>
                <label className="block text-[#4b150d] font-[LightMilk] text-sm mb-2">Status</label>
                {currentUser?.role === "staff" && editingUser?.id === currentUser?.id ? (
                  <input
                    type="text"
                    value={userForm.status}
                    disabled
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    title="You cannot change your own status"
                  />
                ) : (
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-[#4b150d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                    disabled={currentUser?.role === "staff"}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#db6747] text-white px-4 py-2 rounded-lg font-[BoldMilk] hover:bg-[#c44d30] transition-colors"
                >
                  {editingUser ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-[#4b150d] px-4 py-2 rounded-lg font-[BoldMilk] hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

