import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaTrash, FaPlus, FaSearch, FaTimes, FaEdit } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useAuth } from "../../context/AuthContext";
import TenantsBg from "../../assets/tenantsoverviewbg.png";
import { getAllTenants, createTenant, deleteTenant, updateTenant, getAllUnits } from "../../api";

export default function TenantOverviewCards() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);
  const [editingTenant, setEditingTenant] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [newTenant, setNewTenant] = useState({
    unit: "",
    fullName: "",
    phone: "",
    email: "",
    address: "",
    moveInDate: "",
    gender: "",
    dateOfBirth: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
  });

  const [editTenant, setEditTenant] = useState({
    unit: "",
    fullName: "",
    phone: "",
    email: "",
    address: "",
    moveInDate: "",
    gender: "",
    dateOfBirth: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tenantsData, unitsData] = await Promise.all([
        getAllTenants(),
        getAllUnits()
      ]);
      setTenants(tenantsData);
      setUnits(unitsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.fullName.toLowerCase().includes(search.toLowerCase()) ||
      tenant.unit.includes(search)
  );

  const handleView = (tenant) => navigate(`/unit/${tenant.unit}`);

  const handleDelete = (tenant) => {
    setTenantToDelete(tenant);
    setShowDeleteModal(true);
  };

  const handleEdit = (tenant) => {
    // Check permissions - tenants can only edit their own info
    if (user?.role !== "admin" && user?.role !== "staff" && user?.id !== tenant.userId) {
      toast.error("You can only edit your own information");
      return;
    }

    setEditingTenant(tenant);
    setEditTenant({
      unit: tenant.unit || "",
      fullName: tenant.fullName || "",
      phone: tenant.phone || "",
      email: tenant.email || "",
      address: tenant.address || "",
      moveInDate: tenant.moveInDate ? tenant.moveInDate.split('T')[0] : "",
      gender: tenant.gender || "",
      dateOfBirth: tenant.dateOfBirth ? tenant.dateOfBirth.split('T')[0] : "",
      emergencyContactName: tenant.emergencyContactName || "",
      emergencyContactRelationship: tenant.emergencyContactRelationship || "",
      emergencyContactPhone: tenant.emergencyContactPhone || "",
    });
    setShowEditModal(true);
  };

  const confirmDelete = async () => {
    if (tenantToDelete) {
      try {
        await deleteTenant(tenantToDelete.id);
        setTenants((prev) => prev.filter((t) => t.id !== tenantToDelete.id));
        toast.success(`Tenant ${tenantToDelete.fullName} deleted successfully!`);
        setTenantToDelete(null);
        setShowDeleteModal(false);
      } catch (error) {
        toast.error("Failed to delete tenant");
      }
    }
  };

  const handleAddTenant = async (e) => {
    e.preventDefault();
    try {
      console.log("Tenant form data:", newTenant);
      
      // Validate required fields
      if (!newTenant.unit || !newTenant.fullName || !newTenant.phone || !newTenant.moveInDate) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      const tenantData = {
        unit: newTenant.unit,
        fullName: newTenant.fullName.trim(),
        phone: newTenant.phone.trim(),
        email: newTenant.email?.trim() || null,
        address: newTenant.address?.trim() || null,
        moveInDate: newTenant.moveInDate,
        gender: newTenant.gender || null,
        dateOfBirth: newTenant.dateOfBirth || null,
        emergencyContactName: newTenant.emergencyContactName?.trim() || null,
        emergencyContactRelationship: newTenant.emergencyContactRelationship?.trim() || null,
        emergencyContactPhone: newTenant.emergencyContactPhone?.trim() || null,
        status: 'active'
      };
      
      console.log("Sending tenant data:", tenantData);
      
      const data = await createTenant(tenantData);
      console.log("Tenant created successfully:", data);
      
      setTenants((prev) => [...prev, data]);
      toast.success(`Tenant ${data.fullName} added successfully!`);
      setShowAddModal(false);
      setNewTenant({
        unit: "", fullName: "", phone: "", email: "", address: "",
        moveInDate: "", gender: "", dateOfBirth: "",
        emergencyContactName: "", emergencyContactRelationship: "", emergencyContactPhone: "",
      });
    } catch (error) {
      console.error("Error creating tenant:", error);
      toast.error(`Failed to add tenant: ${error.message}`);
    }
  };

  const handleEditTenant = async (e) => {
    e.preventDefault();
    try {
      console.log("Edit tenant form data:", editTenant);
      
      // Check permissions again
      if (user?.role !== "admin" && user?.role !== "staff" && user?.id !== editingTenant.userId) {
        toast.error("You can only edit your own information");
        return;
      }
      
      // Validate required fields
      if (!editTenant.unit || !editTenant.fullName || !editTenant.phone || !editTenant.moveInDate) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      const tenantData = {
        fullName: editTenant.fullName.trim(),
        phone: editTenant.phone.trim(),
        email: editTenant.email?.trim() || null,
        address: editTenant.address?.trim() || null,
        moveInDate: editTenant.moveInDate,
        gender: editTenant.gender || null,
        dateOfBirth: editTenant.dateOfBirth || null,
        emergencyContactName: editTenant.emergencyContactName?.trim() || null,
        emergencyContactRelationship: editTenant.emergencyContactRelationship?.trim() || null,
        emergencyContactPhone: editTenant.emergencyContactPhone?.trim() || null,
      };

      // Only admin/staff can change unit assignment
      if (user?.role === "admin" || user?.role === "staff") {
        tenantData.unit = editTenant.unit;
      }
      
      console.log("Updating tenant data:", tenantData);
      
      const updatedTenant = await updateTenant(editingTenant.id, tenantData);
      console.log("Tenant updated successfully:", updatedTenant);
      
      // Update the tenant in the list
      setTenants((prev) => prev.map(t => t.id === editingTenant.id ? updatedTenant : t));
      toast.success(`Tenant ${updatedTenant.fullName} updated successfully!`);
      setShowEditModal(false);
      setEditingTenant(null);
      setEditTenant({
        unit: "", fullName: "", phone: "", email: "", address: "",
        moveInDate: "", gender: "", dateOfBirth: "",
        emergencyContactName: "", emergencyContactRelationship: "", emergencyContactPhone: "",
      });
    } catch (error) {
      console.error("Error updating tenant:", error);
      toast.error(`Failed to update tenant: ${error.message}`);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#f7b094] to-[#dd7255] rounded-2xl px-4 md:px-8 py-10 flex flex-col gap-6 w-full min-h-screen font-sans">
      
      {/* HEADER */}
      <div
        className="bg-cover bg-center shadow-[8px_8px_0px_rgba(75,21,13,0.15)] rounded-3xl text-white py-10 px-8 md:px-16 border-2 border-[#4b150d] relative overflow-hidden"
        style={{ backgroundImage: `linear-gradient(rgba(75,21,13,0.4), rgba(75,21,13,0.4)), url(${TenantsBg})` }}
      >
        <div className="relative z-10">
          <h1 className="font-[BoldMilk] tracking-[8px] md:tracking-[12px] text-2xl md:text-4xl uppercase drop-shadow-md">
            Tenants Management
          </h1>
          <p className="font-[LightMilk] opacity-90 mt-2 tracking-widest uppercase text-[10px]">Resident Records & Directory</p>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="bg-white/90 backdrop-blur-md shadow-[10px_10px_0px_rgba(75,21,13,0.1)] rounded-[2.5rem] p-6 md:p-8 border-2 border-[#4b150d]">
        
        {/* TOOLBAR */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
          <div className="relative flex-1 w-full md:max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4b150d] opacity-40" />
            <input
              type="text"
              placeholder="Search by name or unit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#4b150d]/5 border-2 border-[#4b150d]/20 rounded-2xl focus:outline-none focus:border-[#4b150d]"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#4b150d] text-white px-8 py-3 rounded-2xl font-[BoldMilk] shadow-[4px_4px_0px_rgba(0,0,0,0.2)] hover:bg-[#330101] transition-all flex items-center gap-2 uppercase text-xs tracking-widest"
          >
            <FaPlus /> Add Tenant
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border-2 border-[#4b150d] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-[#4b150d] text-[#efd4c4]">
                <tr className="uppercase text-[10px] tracking-widest font-[BoldMilk]">
                  <th className="py-5 px-6 text-left">Unit</th>
                  <th className="py-5 px-6 text-left">Full Name</th>
                  <th className="py-5 px-6 text-left">Contact</th>
                  <th className="py-5 px-6 text-left">Move-In</th>
                  <th className="py-5 px-6 text-left">Status</th>
                  <th className="py-5 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4b150d]/10">
                {loading ? (
                  <tr><td colSpan="6" className="py-20 text-center font-[BoldMilk] animate-pulse">Loading...</td></tr>
                ) : filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-[#4b150d]/5 transition-colors">
                    <td className="py-4 px-6 font-[BoldMilk] text-[#4b150d]">#{tenant.unit}</td>
                    <td className="py-4 px-6 font-[BoldMilk] text-[#4b150d]">{tenant.fullName}</td>
                    <td className="py-4 px-6 text-xs text-[#4b150d] opacity-70">
                      <div>{tenant.phone}</div>
                      <div className="italic">{tenant.email || "No Email"}</div>
                    </td>
                    <td className="py-4 px-6 text-sm text-[#4b150d]">
                      {tenant.moveInDate ? new Date(tenant.moveInDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={tenant.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            await updateTenant(tenant.id, { status: newStatus });
                            setTenants(tenants.map(t => t.id === tenant.id ? { ...t, status: newStatus } : t));
                            toast.success(`Status updated`);
                          } catch (error) { toast.error("Failed update"); }
                        }}
                        className={`font-[BoldMilk] text-[9px] px-3 py-1 rounded-full border-2 uppercase tracking-wider ${
                          tenant.status === "active" ? "bg-green-500 text-white border-green-600" : "bg-gray-400 text-white border-gray-500"
                        }`}
                      >
                        <option value="active">ACTIVE</option>
                        <option value="inactive">INACTIVE</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleView(tenant)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><FaEye /></button>
                        {/* Tenants can edit their own info, Admin/Staff can edit any tenant */}
                        {(user?.role === "admin" || user?.role === "staff" || user?.id === tenant.userId) && (
                          <button onClick={() => handleEdit(tenant)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><FaEdit /></button>
                        )}
                        {/* Only Admin can delete tenants */}
                        {user?.role === "admin" && (
                          <button onClick={() => handleDelete(tenant)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><FaTrash /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* NEW TRANSACTION STYLE MODAL FOR ADDING TENANT */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-[2.5rem] border-4 border-[#4b150d] shadow-[15px_15px_0px_rgba(0,0,0,0.2)] p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-start mb-8">
              <h2 className="font-[BoldMilk] text-[#4b150d] text-3xl md:text-4xl uppercase tracking-tighter leading-tight">New Tenant Registration</h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#4b150d] opacity-40 hover:opacity-100 transition-opacity"><FaTimes size={28}/></button>
            </div>
            
            <form onSubmit={handleAddTenant} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Select Unit</label>
                <select 
                  required className="w-full px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d] rounded-2xl font-[BoldMilk] uppercase text-sm focus:ring-4 focus:ring-[#4b150d]/10 outline-none appearance-none"
                  value={newTenant.unit}
                  onChange={(e) => setNewTenant({ ...newTenant, unit: e.target.value })}
                >
                  <option value="">Choose Unit...</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.unitNumber}>Unit {unit.unitNumber} - {unit.status.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Full Name *</label>
                  <input type="text" required className="px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] outline-none focus:border-[#4b150d]" 
                    value={newTenant.fullName} onChange={(e) => setNewTenant({ ...newTenant, fullName: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Phone Number *</label>
                  <input type="tel" required className="px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] outline-none focus:border-[#4b150d]" 
                    value={newTenant.phone} onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Email Address</label>
                  <input type="email" className="px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] outline-none focus:border-[#4b150d]" 
                    value={newTenant.email} onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Date of Birth</label>
                  <input type="date" className="px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] outline-none focus:border-[#4b150d]" 
                    value={newTenant.dateOfBirth} onChange={(e) => setNewTenant({ ...newTenant, dateOfBirth: e.target.value })} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Address</label>
                <textarea className="px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] outline-none focus:border-[#4b150d] resize-none" 
                  rows="3" value={newTenant.address} onChange={(e) => setNewTenant({ ...newTenant, address: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Move-In Date</label>
                  <input type="date" required className="px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] outline-none focus:border-[#4b150d]" 
                    value={newTenant.moveInDate} onChange={(e) => setNewTenant({ ...newTenant, moveInDate: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Gender</label>
                  <select className="px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] outline-none focus:border-[#4b150d]"
                    value={newTenant.gender} onChange={(e) => setNewTenant({ ...newTenant, gender: e.target.value })}>
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="border-t-2 border-[#4b150d]/10 pt-6 mt-2">
                <h3 className="font-[BoldMilk] text-[10px] text-[#4b150d] opacity-50 uppercase mb-4 tracking-[2px]">Emergency Contact Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input type="text" placeholder="Contact Name" className="px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] outline-none focus:border-[#4b150d]" 
                    value={newTenant.emergencyContactName} onChange={(e) => setNewTenant({ ...newTenant, emergencyContactName: e.target.value })} />
                  <input type="text" placeholder="Relationship (e.g., Mother, Brother)" className="px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] outline-none focus:border-[#4b150d]" 
                    value={newTenant.emergencyContactRelationship} onChange={(e) => setNewTenant({ ...newTenant, emergencyContactRelationship: e.target.value })} />
                </div>
                <div className="mt-5">
                  <input type="tel" placeholder="Emergency Contact Phone" className="w-full px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] outline-none focus:border-[#4b150d]" 
                    value={newTenant.emergencyContactPhone} onChange={(e) => setNewTenant({ ...newTenant, emergencyContactPhone: e.target.value })} />
                </div>
              </div>

              <div className="flex justify-end items-center gap-8 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="font-[BoldMilk] text-[#4b150d] opacity-40 hover:opacity-100 uppercase text-xs tracking-widest transition-opacity">Cancel</button>
                <button type="submit" className="bg-[#4b150d] text-white px-10 py-5 rounded-3xl font-[BoldMilk] shadow-xl hover:bg-[#330101] active:scale-95 transition-all uppercase text-xs tracking-[2px]">Register Tenant</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TENANT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-[2.5rem] border-4 border-[#4b150d] shadow-[15px_15px_0px_rgba(0,0,0,0.2)] p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-start mb-8">
              <h2 className="font-[BoldMilk] text-[#4b150d] text-3xl md:text-4xl uppercase tracking-tighter leading-tight">
                {user?.role === "tenant" ? "Edit My Information" : "Edit Tenant Information"}
              </h2>
              <button onClick={() => {
                setShowEditModal(false);
                setEditingTenant(null);
                setEditTenant({
                  unit: "", fullName: "", phone: "", email: "", address: "",
                  moveInDate: "", gender: "", dateOfBirth: "",
                  emergencyContactName: "", emergencyContactRelationship: "", emergencyContactPhone: "",
                });
              }} className="text-[#4b150d] opacity-40 hover:opacity-100 transition-opacity"><FaTimes size={28}/></button>
            </div>
            
            <form onSubmit={handleEditTenant} className="flex flex-col gap-6">
              {/* Unit selection - only admin/staff can change unit */}
              <div className="flex flex-col gap-2">
                <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">
                  Select Unit {user?.role === "tenant" && "(Contact admin to change unit)"}
                </label>
                <select 
                  required 
                  disabled={user?.role === "tenant"}
                  className={`w-full px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d] rounded-2xl font-[BoldMilk] uppercase text-sm focus:ring-4 focus:ring-[#4b150d]/10 outline-none appearance-none ${
                    user?.role === "tenant" ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  value={editTenant.unit}
                  onChange={(e) => setEditTenant({ ...editTenant, unit: e.target.value })}
                >
                  <option value="">Choose Unit...</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.unitNumber}>Unit {unit.unitNumber} - {unit.status.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Full Name *</label>
                  <input type="text" required className="px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] outline-none focus:border-[#4b150d]" 
                    value={editTenant.fullName} onChange={(e) => setEditTenant({ ...editTenant, fullName: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Phone Number *</label>
                  <input type="tel" required className="px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] outline-none focus:border-[#4b150d]" 
                    value={editTenant.phone} onChange={(e) => setEditTenant({ ...editTenant, phone: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Email Address</label>
                  <input type="email" className="px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] outline-none focus:border-[#4b150d]" 
                    value={editTenant.email} onChange={(e) => setEditTenant({ ...editTenant, email: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Date of Birth</label>
                  <input type="date" className="px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] outline-none focus:border-[#4b150d]" 
                    value={editTenant.dateOfBirth} onChange={(e) => setEditTenant({ ...editTenant, dateOfBirth: e.target.value })} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Address</label>
                <textarea className="px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] outline-none focus:border-[#4b150d] resize-none" 
                  rows="3" value={editTenant.address} onChange={(e) => setEditTenant({ ...editTenant, address: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Move-In Date</label>
                  <input type="date" required className="px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] outline-none focus:border-[#4b150d]" 
                    value={editTenant.moveInDate} onChange={(e) => setEditTenant({ ...editTenant, moveInDate: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Gender</label>
                  <select className="px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] outline-none focus:border-[#4b150d]"
                    value={editTenant.gender} onChange={(e) => setEditTenant({ ...editTenant, gender: e.target.value })}>
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="border-t-2 border-[#4b150d]/10 pt-6 mt-2">
                <h3 className="font-[BoldMilk] text-[10px] text-[#4b150d] opacity-50 uppercase mb-4 tracking-[2px]">Emergency Contact Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input type="text" placeholder="Contact Name" className="px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] outline-none focus:border-[#4b150d]" 
                    value={editTenant.emergencyContactName} onChange={(e) => setEditTenant({ ...editTenant, emergencyContactName: e.target.value })} />
                  <input type="text" placeholder="Relationship (e.g., Mother, Brother)" className="px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] outline-none focus:border-[#4b150d]" 
                    value={editTenant.emergencyContactRelationship} onChange={(e) => setEditTenant({ ...editTenant, emergencyContactRelationship: e.target.value })} />
                </div>
                <div className="mt-5">
                  <input type="tel" placeholder="Emergency Contact Phone" className="w-full px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] outline-none focus:border-[#4b150d]" 
                    value={editTenant.emergencyContactPhone} onChange={(e) => setEditTenant({ ...editTenant, emergencyContactPhone: e.target.value })} />
                </div>
              </div>

              <div className="flex justify-end items-center gap-8 mt-6">
                <button type="button" onClick={() => {
                  setShowEditModal(false);
                  setEditingTenant(null);
                  setEditTenant({
                    unit: "", fullName: "", phone: "", email: "", address: "",
                    moveInDate: "", gender: "", dateOfBirth: "",
                    emergencyContactName: "", emergencyContactRelationship: "", emergencyContactPhone: "",
                  });
                }} className="font-[BoldMilk] text-[#4b150d] opacity-40 hover:opacity-100 uppercase text-xs tracking-widest transition-opacity">Cancel</button>
                <button type="submit" className="bg-[#4b150d] text-white px-10 py-5 rounded-3xl font-[BoldMilk] shadow-xl hover:bg-[#330101] active:scale-95 transition-all uppercase text-xs tracking-[2px]">Update Tenant</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex justify-center items-center p-4">
          <div className="bg-white rounded-[2rem] border-4 border-[#4b150d] p-10 max-w-sm text-center shadow-[15px_15px_0px_rgba(0,0,0,0.2)]">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-200"><FaTrash size={24}/></div>
            <h2 className="font-[BoldMilk] text-[#4b150d] text-2xl uppercase mb-2 leading-tight">Remove Tenant?</h2>
            <p className="font-[LightMilk] text-sm text-gray-500 mb-8 px-4">This will clear the resident profile and free up Unit {tenantToDelete?.unit}.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 font-[BoldMilk] text-[#4b150d] opacity-50 uppercase text-xs">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-[BoldMilk] shadow-lg uppercase text-xs">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}