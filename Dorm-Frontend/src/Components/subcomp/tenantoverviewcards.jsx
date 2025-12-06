import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaTrash } from "react-icons/fa";
import { toast } from 'react-toastify';
import TenantsBg from "../../assets/tenantsoverviewbg.png";
import { getAllTenants, createTenant, deleteTenant, updateTenant } from "../../api";
import { getAllUnits } from "../../api";

export default function tenantoverviewcards() {
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);
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

  // Fetch tenants and units from backend
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

  const handleView = (tenant) => {
    navigate(`/unit/${tenant.unit}`);
  };

  const handleDelete = (tenant) => {
    setTenantToDelete(tenant);
    setShowDeleteModal(true);
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
        console.error("Error deleting tenant:", error);
        toast.error("Failed to delete tenant");
      }
    }
  };

  const cancelDelete = () => {
    setTenantToDelete(null);
    setShowDeleteModal(false);
  };

  const handleAddTenant = async (e) => {
    e.preventDefault();
    try {
      const data = await createTenant(newTenant);
      setTenants((prev) => [...prev, data]);
      toast.success(`Tenant ${data.fullName} added successfully!`);
      setShowAddModal(false);
      setNewTenant({
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
    } catch (error) {
      console.error("Error adding tenant:", error);
      toast.error(`Failed to add tenant: ${error.message}`);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#f7b094] to-[#dd7255] rounded-2xl px-6 md:px-12 py-10 flex flex-col gap-6 w-full h-full overflow-visible">
      {/* Header */}
      <div
        className="bg-cover bg-center shadow-[15px_13px_0px_#330101] rounded-2xl text-white py-6 px-6 md:px-20"
        style={{ backgroundImage: `url(${TenantsBg})` }}
      >
        <h1 className="font-[BoldMilk] tracking-[10px] md:tracking-[15px] text-[24px] md:text-[30px] text-white uppercase">
          Tenants Management
        </h1>
      </div>

      {/* Search & Add Button */}
      <div className="bg-gradient-to-r from-[#fee8da] to-[#efd4c4] shadow-[15px_13px_0px_#330101] rounded-2xl p-6 md:p-10 w-full h-full overflow-auto">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name or unit number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-[#4b150d] bg-white text-[#4b150d] focus:outline-none focus:ring-2 focus:ring-[#db6747]"
          />
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#4b150d] text-white px-6 py-2 rounded-lg hover:bg-[#6b1f11] transition-colors font-semibold"
          >
            + Add Tenant
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-[#4b150d] text-[#efd4c4] uppercase text-sm font-LightMilk">
                <th className="py-3 px-4 text-left">Unit No.</th>
                <th className="py-3 px-4 text-left">Full Name</th>
                <th className="py-3 px-4 text-left">Phone No.</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Move-In Date</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-[#4b150d]">
                    Loading...
                  </td>
                </tr>
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-[#4b150d]">
                    No tenants found.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="bg-white">
                    <td className="py-3 px-4">{tenant.unit}</td>
                    <td className="py-3 px-4">{tenant.fullName}</td>
                    <td className="py-3 px-4">{tenant.phone}</td>
                    <td className="py-3 px-4">{tenant.email || "N/A"}</td>
                    <td className="py-3 px-4">
                      {tenant.moveInDate
                        ? new Date(tenant.moveInDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={tenant.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            await updateTenant(tenant.id, { status: newStatus });
                            setTenants(tenants.map(t => 
                              t.id === tenant.id ? { ...t, status: newStatus } : t
                            ));
                            toast.success(`Tenant status updated to ${newStatus}`);
                          } catch (error) {
                            toast.error("Failed to update status");
                          }
                        }}
                        className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                          tenant.status === "active"
                            ? "bg-green-200 text-green-800"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(tenant)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                          title="View"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDelete(tenant)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-[#4b150d]">
              Add New Tenant
            </h2>
            <form onSubmit={handleAddTenant} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={newTenant.unit}
                onChange={(e) =>
                  setNewTenant({ ...newTenant, unit: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747] bg-white text-[#4b150d]"
                required
              >
                <option value="">Select Unit Number</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.unitNumber}>
                    Unit {unit.unitNumber} - {unit.status === 'occupied' ? 'Occupied' : 'Vacant'} ({unit.tenantCount}/{unit.capacity})
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Full Name"
                value={newTenant.fullName}
                onChange={(e) =>
                  setNewTenant({ ...newTenant, fullName: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newTenant.phone}
                onChange={(e) =>
                  setNewTenant({ ...newTenant, phone: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                required
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={newTenant.email}
                onChange={(e) =>
                  setNewTenant({ ...newTenant, email: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
              />
              <textarea
                placeholder="Address (optional)"
                value={newTenant.address}
                onChange={(e) =>
                  setNewTenant({ ...newTenant, address: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                rows="2"
              />
              <input
                type="date"
                placeholder="Move-In Date"
                value={newTenant.moveInDate}
                onChange={(e) =>
                  setNewTenant({ ...newTenant, moveInDate: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
              />
              
              <select
                value={newTenant.gender}
                onChange={(e) =>
                  setNewTenant({ ...newTenant, gender: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747] bg-white text-[#4b150d]"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <input
                type="date"
                placeholder="Date of Birth"
                value={newTenant.dateOfBirth}
                onChange={(e) =>
                  setNewTenant({ ...newTenant, dateOfBirth: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
              />
              </div>

              <div className="border-t pt-4 col-span-full">
                <h3 className="text-sm font-semibold text-[#4b150d] mb-3">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Emergency Contact Name"
                  value={newTenant.emergencyContactName}
                  onChange={(e) =>
                    setNewTenant({ ...newTenant, emergencyContactName: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                />
                <input
                  type="text"
                  placeholder="Relationship (e.g., Mother, Father, Sibling)"
                  value={newTenant.emergencyContactRelationship}
                  onChange={(e) =>
                    setNewTenant({ ...newTenant, emergencyContactRelationship: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                />
                <input
                  type="tel"
                  placeholder="Emergency Contact Phone"
                  value={newTenant.emergencyContactPhone}
                  onChange={(e) =>
                    setNewTenant({ ...newTenant, emergencyContactPhone: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747] md:col-span-2"
                />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#4b150d] text-white px-4 py-2 rounded-md hover:bg-[#6b1f11]"
                >
                  Add Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && tenantToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4 text-[#4b150d]">
              Are you sure you want to delete this tenant?
            </h2>
            <p className="text-[#4b150d] mb-6">
              It will clear the tenant's details in their profile and remove them
              from their unit.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={cancelDelete}
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                No
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
