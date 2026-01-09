import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaUserShield, FaCog, FaSearch, FaPlus, FaTrash, FaTimes, FaEdit, FaEye } from "react-icons/fa";
import { getAllUsers, createUser, updateUser, deleteUser } from "../../api";
import { getAllSettings, updateMultipleSettings, initializeDefaultSettings } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useSystem } from "../../context/SystemContext";
import SettingsBg from "../../assets/accsettbg.png";

export default function SettingsContent() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { user: currentUser } = useAuth();
  const { systemSettings, refreshSystemSettings } = useSystem();

  const [systemInfo, setSystemInfo] = useState({
    systemName: "Dormitory Management System",
    version: "1.0.0",
    contactEmail: "admin@dorm.com",
    contactPhone: "+63 123 456 7890",
    address: "123 Dormitory Street, City, Country"
  });
  const [systemLoading, setSystemLoading] = useState(false);

  const [userForm, setUserForm] = useState({
    username: "", email: "", password: "", fullName: "", phone: "", role: "staff", status: "active"
  });

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "system") {
      // Sync with global system settings
      setSystemInfo({
        systemName: systemSettings.systemName || "Dormitory Management System",
        version: systemSettings.version || "1.0.0",
        contactEmail: systemSettings.contactEmail || "admin@dorm.com",
        contactPhone: systemSettings.contactPhone || "+63 123 456 7890",
        address: systemSettings.address || "123 Dormitory Street, City, Country"
      });
      fetchSystemSettings();
    }
  }, [activeTab, systemSettings]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      setSystemLoading(true);
      const settings = await getAllSettings();
      console.log("Fetched settings:", settings);
      
      // Update systemInfo with fetched settings
      setSystemInfo({
        systemName: settings.systemName || "Dormitory Management System",
        version: settings.version || "1.0.0",
        contactEmail: settings.contactEmail || "admin@dorm.com",
        contactPhone: settings.contactPhone || "+63 123 456 7890",
        address: settings.address || "123 Dormitory Street, City, Country"
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      // If settings don't exist, initialize them
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        try {
          await initializeDefaultSettings();
          toast.success("Default settings initialized");
          fetchSystemSettings(); // Retry fetching
        } catch (initError) {
          console.error("Error initializing settings:", initError);
          toast.error("Failed to initialize settings");
        }
      } else {
        toast.error("Failed to load system settings");
      }
    } finally {
      setSystemLoading(false);
    }
  };

  const handleSaveSystemSettings = async () => {
    try {
      setSystemLoading(true);
      console.log("Saving settings:", systemInfo);
      
      await updateMultipleSettings(systemInfo);
      
      // Refresh the global system settings context
      refreshSystemSettings();
      
      toast.success("System settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(`Failed to save settings: ${error.message}`);
    } finally {
      setSystemLoading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = { ...userForm };
      if (editingUser && !userForm.password?.trim()) delete userData.password;
      
      editingUser ? await updateUser(editingUser.id, userData) : await createUser(userData);
      toast.success(editingUser ? "User updated" : "User created");
      setShowUserModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.message || "Operation failed");
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-r from-[#f7b094] to-[#dd7255] rounded-2xl px-4 md:px-8 py-10 flex flex-col gap-6 w-full min-h-screen font-sans">
      
      {/* HEADER SECTION - ALIGNED WITH PAYMENTS */}
      <div
        className="bg-cover bg-center shadow-[8px_8px_0px_rgba(75,21,13,0.15)] rounded-3xl text-white py-10 px-8 md:px-16 border-2 border-[#4b150d] relative overflow-hidden"
        style={{ backgroundImage: `linear-gradient(rgba(75,21,13,0.4), rgba(75,21,13,0.4)), url(${SettingsBg})` }}
      >
        <div className="relative z-10">
          <h1 className="font-[BoldMilk] tracking-[8px] md:tracking-[12px] text-2xl md:text-4xl uppercase drop-shadow-md">
            System Settings
          </h1>
          <p className="font-[LightMilk] opacity-90 mt-2 tracking-widest uppercase text-[10px] md:text-xs">
            Manage Staff Access & Configurations
          </p>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="bg-white/90 backdrop-blur-md shadow-[10px_10px_0px_rgba(75,21,13,0.1)] rounded-[2.5rem] p-6 md:p-8 border-2 border-[#4b150d]">
        
        {/* TOOLBAR */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
          <div className="flex gap-2">
            {["users", "system"].map((t) => (
              <button
                key={t}
                disabled={t === "system" && currentUser?.role !== "admin"}
                onClick={() => setActiveTab(t)}
                className={`px-6 py-2 rounded-xl font-[BoldMilk] text-[10px] uppercase border-2 transition-all ${
                  activeTab === t 
                  ? "bg-[#4b150d] text-white border-[#4b150d]" 
                  : "bg-white text-[#4b150d] border-[#4b150d]/10 hover:border-[#4b150d]/40 disabled:opacity-30"
                }`}
              >
                {t === "users" ? "Staff List" : "System Config"} {t === "system" && currentUser?.role !== "admin" && "🔒"}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {activeTab === "users" && (
              <>
                <div className="relative flex-1 md:w-80">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4b150d] opacity-40" />
                  <input
                    type="text"
                    placeholder="Search staff name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#4b150d]/5 border-2 border-[#4b150d]/20 rounded-2xl focus:outline-none focus:border-[#4b150d]"
                  />
                </div>
                {currentUser?.role === "admin" && (
                  <button 
                    onClick={() => { setEditingUser(null); setUserForm({username:"", email:"", password:"", fullName:"", phone:"", role:"staff", status:"active"}); setShowUserModal(true); }}
                    className="bg-[#4b150d] text-white px-6 py-3 rounded-2xl font-[BoldMilk] shadow-[4px_4px_0px_rgba(0,0,0,0.2)] hover:bg-[#330101] transition-all flex items-center gap-2 uppercase text-xs tracking-widest"
                  >
                    <FaPlus /> Add User
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* DATA CONTAINER */}
        <div className="bg-white rounded-2xl border-2 border-[#4b150d] overflow-hidden">
          {activeTab === "users" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#4b150d] text-[#efd4c4]">
                  <tr>
                    <th className="py-5 px-6 text-left font-[BoldMilk] uppercase text-[10px] tracking-widest">User Profile</th>
                    <th className="py-5 px-6 text-left font-[BoldMilk] uppercase text-[10px] tracking-widest">Contact</th>
                    <th className="py-5 px-6 text-left font-[BoldMilk] uppercase text-[10px] tracking-widest">Role</th>
                    <th className="py-5 px-6 text-left font-[BoldMilk] uppercase text-[10px] tracking-widest">Status</th>
                    <th className="py-5 px-6 text-center font-[BoldMilk] uppercase text-[10px] tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#4b150d]/10">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#4b150d]/5 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-[BoldMilk] text-[#4b150d] text-lg uppercase">{u.fullName}</div>
                        <div className="font-[LightMilk] text-[10px] text-[#4b150d] opacity-60 uppercase">@{u.username}</div>
                      </td>
                      <td className="py-4 px-6 font-[LightMilk] text-[#4b150d] text-xs italic">{u.email}</td>
                      <td className="py-4 px-6">
                        <span className={`font-[BoldMilk] text-[9px] px-4 py-1.5 rounded-full border-2 uppercase tracking-wider ${u.role === 'admin' ? 'bg-red-500 text-white border-red-600' : 'bg-green-500 text-white border-green-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                          <span className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase">{u.status}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center gap-2">
                          {currentUser?.role === "admin" && (
                            <button onClick={() => { setEditingUser(u); setUserForm({...u, password:""}); setShowUserModal(true); }} className="text-blue-600 p-2 hover:bg-blue-50 rounded-xl transition-all">
                              <FaEdit size={16} />
                            </button>
                          )}
                          {currentUser?.role === "staff" && u.id === currentUser?.id && (
                            <button onClick={() => { setEditingUser(u); setUserForm({...u, password:""}); setShowUserModal(true); }} className="text-blue-600 p-2 hover:bg-blue-50 rounded-xl transition-all" title="Edit your profile">
                              <FaEdit size={16} />
                            </button>
                          )}
                          {currentUser?.role === "admin" && u.id !== currentUser?.id && (
                            <button onClick={() => deleteUser(u.id).then(fetchUsers)} className="text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all">
                              <FaTrash size={14} />
                            </button>
                          )}
                          {currentUser?.role === "staff" && u.id !== currentUser?.id && (
                            <span className="text-[#4b150d] opacity-30 text-xs font-[BoldMilk] uppercase tracking-wider">
                              Admin Only
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : systemLoading ? (
            <div className="text-center py-24 font-[BoldMilk] text-[#4b150d] animate-pulse">
              Loading system settings...
            </div>
          ) : (
            <div className="p-10 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-[BoldMilk]">
                {[
                  { label: "System Name", key: "systemName" },
                  { label: "Version", key: "version" },
                  { label: "Contact Email", key: "contactEmail" },
                  { label: "Contact Phone", key: "contactPhone" }
                ].map((item) => (
                  <div key={item.key} className="flex flex-col gap-3">
                    <label className="text-[10px] text-[#4b150d] uppercase opacity-60 ml-1">{item.label}</label>
                    <input 
                      value={systemInfo[item.key]}
                      onChange={(e) => setSystemInfo({...systemInfo, [item.key]: e.target.value})}
                      className="w-full px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl focus:border-[#4b150d] outline-none transition-all"
                    />
                  </div>
                ))}
                <div className="md:col-span-2 flex flex-col gap-3">
                   <label className="text-[10px] text-[#4b150d] uppercase opacity-60 ml-1">Physical Address</label>
                   <textarea 
                    value={systemInfo.address}
                    onChange={(e) => setSystemInfo({...systemInfo, address: e.target.value})}
                    className="w-full px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl focus:border-[#4b150d] outline-none h-24"
                   />
                </div>
              </div>
              <button 
                onClick={handleSaveSystemSettings}
                disabled={systemLoading}
                className="mt-10 bg-[#4b150d] text-white px-12 py-5 rounded-3xl font-[BoldMilk] shadow-xl hover:bg-[#330101] transition-all uppercase text-sm tracking-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {systemLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL - MATCHES THE "NEW TRANSACTION" STYLE EXACTLY */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-[2.5rem] border-4 border-[#4b150d] shadow-[15px_15px_0px_rgba(0,0,0,0.2)] p-10 w-full max-w-xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-10">
              <h2 className="font-[BoldMilk] text-[#4b150d] text-4xl uppercase tracking-tighter">
                {editingUser ? 
                  (currentUser?.role === "staff" && editingUser.id === currentUser?.id ? "Edit Profile" : "Edit User") 
                  : "New Account"}
              </h2>
              <button onClick={() => setShowUserModal(false)} className="text-[#4b150d] opacity-40 hover:opacity-100 transition-opacity">
                <FaTimes size={28}/>
              </button>
            </div>
            
            <form onSubmit={handleUserSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Full Name</label>
                <input required value={userForm.fullName} onChange={e => setUserForm({...userForm, fullName: e.target.value})} className="w-full px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] focus:border-[#4b150d] outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-3">
                  <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Username</label>
                  <input required value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} className="w-full px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] focus:border-[#4b150d] outline-none" />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Role</label>
                  <select 
                    value={userForm.role} 
                    onChange={e => setUserForm({...userForm, role: e.target.value})} 
                    disabled={currentUser?.role === "staff"}
                    className={`w-full px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d] rounded-2xl font-[BoldMilk] uppercase text-sm outline-none appearance-none ${currentUser?.role === "staff" ? "opacity-50 cursor-not-allowed" : ""}`} 
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234b150d'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.2rem' }}
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                  {currentUser?.role === "staff" && (
                    <p className="text-xs text-[#4b150d] opacity-60 ml-1">Role cannot be changed by staff users</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Email Address</label>
                <input type="email" required value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] focus:border-[#4b150d] outline-none" />
              </div>

              <div className="flex flex-col gap-3">
                <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Password {editingUser && "(Leave blank to keep current)"}</label>
                <input type="password" required={!editingUser} value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] focus:border-[#4b150d] outline-none" />
              </div>

              <div className="flex justify-end items-center gap-8 mt-4">
                  <button type="button" onClick={() => setShowUserModal(false)} className="font-[BoldMilk] text-[#4b150d] opacity-40 hover:opacity-100 uppercase text-sm tracking-widest transition-opacity">Cancel</button>
                  <button type="submit" className="bg-[#4b150d] text-white px-12 py-5 rounded-3xl font-[BoldMilk] shadow-xl hover:bg-[#330101] active:scale-95 transition-all uppercase text-sm tracking-[2px]">
                    {editingUser ? "Update User" : "Create User"}
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}