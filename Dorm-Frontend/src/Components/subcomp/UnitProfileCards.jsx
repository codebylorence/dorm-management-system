import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaUser, FaPhone, FaEnvelope, FaCalendar, FaMapMarkerAlt, FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useAuth } from "../../context/AuthContext";
import unitprofbg from "../../assets/unitprofbg.png";
import tenantprofbg from "../../assets/tenantprofbg.png";
import { getAllTenants, updateTenant, deleteTenant } from "../../api";
import { getAllUnits } from "../../api";

export default function UnitProfileCards() {
  const { unitNumber } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unit, setUnit] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTenant, setEditingTenant] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  useEffect(() => {
    fetchUnitAndTenants();
  }, [unitNumber]);

  const fetchUnitAndTenants = async () => {
    try {
      // Fetch all units and tenants
      const [allUnits, allTenants] = await Promise.all([
        getAllUnits(),
        getAllTenants()
      ]);
      
      // Find the specific unit
      const currentUnit = allUnits.find(u => u.unitNumber === unitNumber);
      setUnit(currentUnit);
      
      // Filter tenants for this unit
      const unitTenants = allTenants.filter(t => t.unit === unitNumber && t.status === 'active');
      setTenants(unitTenants);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load unit information");
      setLoading(false);
    }
  };

  const handleEditTenant = (tenant) => {
    setEditingTenant({ ...tenant });
  };

  const handleSaveTenant = async () => {
    try {
      await updateTenant(editingTenant.id, editingTenant);
      setTenants(tenants.map(t => t.id === editingTenant.id ? editingTenant : t));
      toast.success("Tenant updated successfully!");
      setEditingTenant(null);
    } catch (error) {
      console.error("Error updating tenant:", error);
      toast.error("Failed to update tenant");
    }
  };

  const handleDeleteTenant = async (tenant) => {
    try {
      await deleteTenant(tenant.id);
      setTenants(tenants.filter(t => t.id !== tenant.id));
      toast.success(`Tenant ${tenant.fullName} removed from unit`);
      setShowDeleteModal(null);
    } catch (error) {
      console.error("Error deleting tenant:", error);
      toast.error("Failed to remove tenant");
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-[#f7b094] to-[#dd7255] rounded-2xl w-full h-full px-6 md:px-12 pt-8 pb-8 flex items-center justify-center">
        <p className="text-white text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#f7b094] to-[#dd7255] rounded-2xl w-full h-full px-6 md:px-12 pt-8 pb-8 flex flex-col gap-6">
      
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="bg-[#4b150d] text-white p-3 rounded-lg hover:bg-[#6b1f11] transition-colors"
          title="Back to Units"
        >
          <FaArrowLeft size={20} />
        </button>
        <div
          className="bg-cover bg-center shadow-[15px_13px_0px_#330101] rounded-2xl text-white px-6 md:px-28 py-7 flex flex-1"
          style={{ backgroundImage: `url(${unitprofbg})` }}
        >
          <h1 className="text-[24px] md:text-[34px] font-BoldMilk tracking-[10px] md:tracking-[13px]">
            UNIT {unitNumber}
          </h1>
        </div>
      </div>

      {/* Unit Info Summary */}
      <div className="bg-white/90 rounded-xl p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="bg-gradient-to-r from-[#fee8da] to-[#efd4c4] p-4 rounded-lg">
            <p className="text-sm text-[#4b150d] font-semibold">Total Tenants</p>
            <p className="text-3xl font-bold text-[#8b2d1a]">{tenants.length}</p>
          </div>
          <div className="bg-gradient-to-r from-[#fee8da] to-[#efd4c4] p-4 rounded-lg">
            <p className="text-sm text-[#4b150d] font-semibold">Status</p>
            <p className={`text-2xl font-bold ${tenants.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {tenants.length > 0 ? 'OCCUPIED' : 'VACANT'}
            </p>
          </div>
          <div className="bg-gradient-to-r from-[#fee8da] to-[#efd4c4] p-4 rounded-lg">
            <p className="text-sm text-[#4b150d] font-semibold">Capacity</p>
            <p className="text-3xl font-bold text-[#8b2d1a]">{unit?.capacity || 'N/A'}</p>
          </div>
          <div className="bg-gradient-to-r from-[#fee8da] to-[#efd4c4] p-4 rounded-lg">
            <p className="text-sm text-[#4b150d] font-semibold">Rent Price</p>
            <p className="text-2xl font-bold text-[#8b2d1a]">
              {unit?.rentPrice ? `₱${parseFloat(unit.rentPrice).toLocaleString()}` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Tenants List */}
      {tenants.length === 0 ? (
        <div className="bg-white/90 rounded-xl p-12 shadow-lg text-center">
          <p className="text-2xl text-[#4b150d] font-semibold">No tenants in this unit</p>
          <p className="text-[#8b2d1a] mt-2">This unit is currently vacant</p>
        </div>
      ) : (
        <div className="space-y-6">
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
              className="bg-cover bg-center shadow-[15px_13px_0px_#efd4c4] rounded-2xl text-white px-6 md:px-12 py-8"
              style={{ backgroundImage: `url(${tenantprofbg})` }}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-[18px] md:text-[24px] font-MDMilk tracking-[5px]">
                  TENANT PROFILE
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditTenant(tenant)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                    title="Edit Tenant"
                  >
                    <FaEdit size={16} />
                  </button>
                  {user?.role === "admin" && (
                    <button
                      onClick={() => setShowDeleteModal(tenant)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                      title="Remove Tenant"
                    >
                      <FaTrash size={16} />
                    </button>
                  )}
                </div>
              </div>

              {editingTenant && editingTenant.id === tenant.id ? (
                // Edit Mode
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-RegularMilk mb-1">Full Name</label>
                      <input
                        value={editingTenant.fullName}
                        onChange={(e) => setEditingTenant({...editingTenant, fullName: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-[#4b150d] bg-white text-[#4b150d] focus:ring-2 focus:ring-[#db6747] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-RegularMilk mb-1">Email</label>
                      <input
                        value={editingTenant.email || ''}
                        onChange={(e) => setEditingTenant({...editingTenant, email: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-[#4b150d] bg-white text-[#4b150d] focus:ring-2 focus:ring-[#db6747] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-RegularMilk mb-1">Phone Number</label>
                      <input
                        value={editingTenant.phone}
                        onChange={(e) => setEditingTenant({...editingTenant, phone: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-[#4b150d] bg-white text-[#4b150d] focus:ring-2 focus:ring-[#db6747] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-RegularMilk mb-1">Address</label>
                      <textarea
                        value={editingTenant.address || ''}
                        onChange={(e) => setEditingTenant({...editingTenant, address: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-[#4b150d] bg-white text-[#4b150d] focus:ring-2 focus:ring-[#db6747] focus:outline-none"
                        rows="3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-RegularMilk mb-1">Move-In Date</label>
                      <input
                        type="date"
                        value={editingTenant.moveInDate ? editingTenant.moveInDate.split('T')[0] : ''}
                        onChange={(e) => setEditingTenant({...editingTenant, moveInDate: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-[#4b150d] bg-white text-[#4b150d] focus:ring-2 focus:ring-[#db6747] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-RegularMilk mb-1">Gender</label>
                      <select
                        value={editingTenant.gender || ''}
                        onChange={(e) => setEditingTenant({...editingTenant, gender: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-[#4b150d] bg-white text-[#4b150d] focus:ring-2 focus:ring-[#db6747] focus:outline-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-RegularMilk mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={editingTenant.dateOfBirth ? editingTenant.dateOfBirth.split('T')[0] : ''}
                        onChange={(e) => setEditingTenant({...editingTenant, dateOfBirth: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-[#4b150d] bg-white text-[#4b150d] focus:ring-2 focus:ring-[#db6747] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="col-span-full border-t pt-4">
                    <h3 className="text-sm font-semibold text-white mb-3">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-RegularMilk mb-1">Name</label>
                        <input
                          value={editingTenant.emergencyContactName || ''}
                          onChange={(e) => setEditingTenant({...editingTenant, emergencyContactName: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-[#4b150d] bg-white text-[#4b150d] focus:ring-2 focus:ring-[#db6747] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-RegularMilk mb-1">Relationship</label>
                        <input
                          value={editingTenant.emergencyContactRelationship || ''}
                          onChange={(e) => setEditingTenant({...editingTenant, emergencyContactRelationship: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-[#4b150d] bg-white text-[#4b150d] focus:ring-2 focus:ring-[#db6747] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-RegularMilk mb-1">Phone</label>
                        <input
                          value={editingTenant.emergencyContactPhone || ''}
                          onChange={(e) => setEditingTenant({...editingTenant, emergencyContactPhone: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-[#4b150d] bg-white text-[#4b150d] focus:ring-2 focus:ring-[#db6747] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-span-full flex justify-end gap-4">
                    <button
                      onClick={() => setEditingTenant(null)}
                      className="px-6 py-2 bg-gray-300 text-[#4b150d] rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveTenant}
                      className="px-6 py-2 bg-[#db6646] text-white rounded-lg hover:bg-[#b9492c] transition-colors font-semibold"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center gap-3 text-white">
                        <FaUser className="text-[#fee8da]" size={20} />
                        <div>
                          <p className="text-xs font-LightMilk opacity-80">Full Name</p>
                          <p className="text-lg font-RegularMilk">{tenant.fullName}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center gap-3 text-white">
                        <FaEnvelope className="text-[#fee8da]" size={20} />
                        <div>
                          <p className="text-xs font-LightMilk opacity-80">Email</p>
                          <p className="text-lg font-RegularMilk">{tenant.email || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center gap-3 text-white">
                        <FaPhone className="text-[#fee8da]" size={20} />
                        <div>
                          <p className="text-xs font-LightMilk opacity-80">Phone Number</p>
                          <p className="text-lg font-RegularMilk">{tenant.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center gap-3 text-white">
                        <FaMapMarkerAlt className="text-[#fee8da]" size={20} />
                        <div>
                          <p className="text-xs font-LightMilk opacity-80">Address</p>
                          <p className="text-lg font-RegularMilk">{tenant.address || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center gap-3 text-white">
                        <FaCalendar className="text-[#fee8da]" size={20} />
                        <div>
                          <p className="text-xs font-LightMilk opacity-80">Move-In Date</p>
                          <p className="text-lg font-RegularMilk">
                            {tenant.moveInDate ? new Date(tenant.moveInDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-white/30 col-span-full">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Personal Information</h3>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-xs font-LightMilk opacity-80 text-white">Gender</p>
                      <p className="text-lg font-RegularMilk text-white capitalize">{tenant.gender || 'N/A'}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-xs font-LightMilk opacity-80 text-white">Date of Birth</p>
                      <p className="text-lg font-RegularMilk text-white">
                        {tenant.dateOfBirth ? new Date(tenant.dateOfBirth).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Emergency Contact</h3>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-xs font-LightMilk opacity-80 text-white">Name</p>
                      <p className="text-lg font-RegularMilk text-white">{tenant.emergencyContactName || 'N/A'}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-xs font-LightMilk opacity-80 text-white">Relationship</p>
                      <p className="text-lg font-RegularMilk text-white">{tenant.emergencyContactRelationship || 'N/A'}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-xs font-LightMilk opacity-80 text-white">Phone</p>
                      <p className="text-lg font-RegularMilk text-white">{tenant.emergencyContactPhone || 'N/A'}</p>
                    </div>
                  </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4 text-[#4b150d]">
              Remove Tenant?
            </h2>
            <p className="text-[#4b150d] mb-6">
              Are you sure you want to remove {showDeleteModal.fullName} from Unit {unitNumber}?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTenant(showDeleteModal)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
