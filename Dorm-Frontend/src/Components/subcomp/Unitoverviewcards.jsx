import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaTrash, FaUsers, FaBed, FaEdit, FaCog } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useAuth } from "../../context/AuthContext";
import UnitsOverviewBG from "../../assets/unitsoverviewbg.png";
import { getAllUnits, createUnit, deleteUnit, updateUnit } from "../../api";

export default function Unitoverviewcards() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [configureMode, setConfigureMode] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [newUnit, setNewUnit] = useState({
    unitNumber: "",
    floor: 1,
    capacity: 1,
    rentPrice: "",
    description: "",
  });

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const data = await getAllUnits();
      setUnits(data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load units");
      setLoading(false);
    }
  };

  const handleAddUnit = async (e) => {
    e.preventDefault();
    if (user?.role !== "admin") return toast.error("Admin access required");
    try {
      const data = await createUnit(newUnit);
      setUnits((prev) => [...prev, data]);
      setShowAddModal(false);
      setNewUnit({ unitNumber: "", floor: 1, capacity: 1, rentPrice: "", description: "" });
      toast.success(`Unit ${data.unitNumber} created!`);
    } catch (error) {
      toast.error(`Failed: ${error.message}`);
    }
  };

  const handleUpdateUnit = async (e) => {
    e.preventDefault();
    if (user?.role !== "admin") return toast.error("Admin access required");
    try {
      const updatedUnit = await updateUnit(editingUnit.id, editingUnit);
      setUnits((prev) => prev.map((u) => (u.id === editingUnit.id ? updatedUnit : u)));
      setShowEditModal(false);
      setEditingUnit(null);
      
      // Show detailed success message if unit number was changed and related records were updated
      if (updatedUnit.updateInfo) {
        const { oldUnitNumber, newUnitNumber, tenantsUpdated, paymentsUpdated } = updatedUnit.updateInfo;
        let message = `Unit ${oldUnitNumber} updated to ${newUnitNumber}!`;
        
        if (tenantsUpdated > 0 || paymentsUpdated > 0) {
          message += ` Also updated ${tenantsUpdated} tenant record(s) and ${paymentsUpdated} payment record(s).`;
        }
        
        toast.success(message, { autoClose: 5000 });
      } else {
        toast.success(`Unit ${updatedUnit.unitNumber} updated!`);
      }
    } catch (error) {
      toast.error(`Update failed: ${error.message}`);
    }
  };

  const confirmDeleteUnit = async () => {
    try {
      await deleteUnit(confirmDelete.id);
      setUnits((prev) => prev.filter((u) => u.id !== confirmDelete.id));
      toast.success("Unit deleted");
      setConfirmDelete(null);
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const groupByFloor = (floor) =>
    units.filter(
      (u) =>
        u.floor === floor &&
        u.unitNumber.toLowerCase().includes(search.toLowerCase())
    );

  const floors = [...new Set(units.map((u) => u.floor))].sort((a, b) => a - b);

  const getFloorName = (floorNum) => {
    const floorNames = { 1: "Ground Floor", 2: "Second Floor", 3: "Third Floor", 4: "Fourth Floor" };
    return floorNames[floorNum] || `Floor ${floorNum}`;
  };

  // --- ENHANCED UI COMPONENTS ---

  const FloorBlock = ({ label, floorUnits }) => (
    <div className="flex flex-col gap-5 mt-4">
      <div className="flex items-center gap-4">
        <h2 className="text-white text-lg font-[BoldMilk] px-6 py-2 rounded-full bg-[#4b150d] tracking-[2px] shadow-[4px_4px_0px_rgba(75,21,13,0.2)]">
          {label}
        </h2>
        <div className="h-[2px] flex-grow bg-[#4b150d] opacity-20 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {floorUnits.length === 0 ? (
          <p className="text-[#4b150d] italic opacity-60 px-4">No units matching search on this floor.</p>
        ) : (
          floorUnits.map((unit) => (
            <Link
              key={unit.id}
              to={`/unit/${unit.unitNumber}`}
              className="group relative bg-white/80 backdrop-blur-md border-2 border-[#4b150d] rounded-2xl flex flex-col p-0 shadow-[6px_6px_0px_rgba(75,21,13,0.1)] hover:shadow-[10px_10px_20px_rgba(75,21,13,0.15)] transition-all duration-300 hover:-translate-y-2 overflow-hidden no-underline"
            >
              <div className={`h-2 w-full ${unit.status === "occupied" ? "bg-red-500" : "bg-green-500"}`}></div>

              <div className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-[BoldMilk] text-[#4b150d] opacity-50 uppercase tracking-tighter">Unit Number</p>
                    <h3 className="font-[BoldMilk] text-3xl text-[#4b150d]">{unit.unitNumber}</h3>
                  </div>
                  {user?.role === "admin" && configureMode && (
                    <div className="flex gap-2 z-20">
                      <button onClick={(e) => { e.preventDefault(); setEditingUnit(unit); setShowEditModal(true); }} className="bg-white border-2 border-blue-500 text-blue-500 p-2 rounded-xl hover:bg-blue-500 hover:text-white transition-colors">
                        <FaEdit size={14} />
                      </button>
                      <button onClick={(e) => { e.preventDefault(); setConfirmDelete(unit); }} className="bg-white border-2 border-red-500 text-red-500 p-2 rounded-xl hover:bg-red-500 hover:text-white transition-colors">
                        <FaTrash size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-[BoldMilk] border-2 ${unit.status === "occupied" ? "bg-red-50/50 text-red-600 border-red-200" : "bg-green-50/50 text-green-600 border-green-200"}`}>
                    <div className={`w-2 h-2 rounded-full ${unit.status === "occupied" ? "bg-red-500" : "bg-green-500"}`}></div>
                    {unit.status?.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-[BoldMilk] bg-blue-50/50 text-blue-600 border-2 border-blue-100">
                    <FaUsers size={10} /> {unit.tenantCount || 0} TENANTS
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-[#4b150d]/5 rounded-xl p-3 border border-[#4b150d]/10">
                    <p className="text-[9px] font-[BoldMilk] text-[#4b150d] opacity-50 uppercase">Capacity</p>
                    <div className="flex items-center gap-2 text-[#4b150d]">
                      <FaBed size={12} className="opacity-70" />
                      <span className="font-[BoldMilk] text-sm">{unit.capacity} Beds</span>
                    </div>
                  </div>
                  <div className="bg-[#4b150d]/5 rounded-xl p-3 border border-[#4b150d]/10">
                    <p className="text-[9px] font-[BoldMilk] text-[#4b150d] opacity-50 uppercase">Rent</p>
                    <p className="font-[BoldMilk] text-sm text-[#8b2d1a]">₱{parseFloat(unit.rentPrice || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#4b150d] py-2 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-white font-[BoldMilk] text-[10px] tracking-widest uppercase">View Full Details</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-r from-[#f7b094] to-[#dd7255] rounded-2xl px-6 md:px-12 py-10 flex flex-col gap-6 min-h-screen">

      <div
        className="bg-cover bg-center shadow-[8px_8px_0px_rgba(75,21,13,0.15)] rounded-3xl text-white py-10 px-8 md:px-16 border-2 border-[#4b150d] relative overflow-hidden"
        style={{ backgroundImage: `linear-gradient(rgba(75,21,13,0.4), rgba(75,21,13,0.4)), url(${UnitsOverviewBG})` }}
      >
        <div className="relative z-10">
          <h1 className="font-[BoldMilk] tracking-[8px] md:tracking-[12px] text-2xl md:text-4xl uppercase drop-shadow-md">
            Unit Overview
          </h1>
          <p className="font-[LightMilk] opacity-90 mt-2 tracking-widest uppercase text-[10px] md:text-xs">Unit Status & Tenant Occupation</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#fee8da] to-[#efd4c4] shadow-[10px_10px_0px_rgba(75,21,13,0.15)] rounded-3xl p-6 md:p-10 border-2 border-[#4b150d]">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <input
            type="text"
            placeholder="Search unit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-4 py-3 rounded-2xl border-2 border-[#4b150d] bg-white shadow-[3px_3px_0px_rgba(75,21,13,0.1)] focus:outline-none focus:ring-2 focus:ring-[#f7b094]"
          />
          <div className="flex gap-3">
            {user?.role === "admin" && (
              <>
                <button onClick={() => setConfigureMode(!configureMode)} className={`px-6 py-2 rounded-2xl font-bold shadow-[4px_4px_0px_rgba(0,0,0,0.15)] flex items-center gap-2 text-sm transition-all ${configureMode ? "bg-orange-500 text-white" : "bg-gray-500 text-white"}`}>
                  <FaCog className={configureMode ? "animate-spin-slow" : ""} /> {configureMode ? "Exit Config" : "Configure"}
                </button>
                <button onClick={() => setShowAddModal(true)} className="bg-[#4b150d] text-white px-8 py-2 rounded-2xl font-bold shadow-[4px_4px_0px_rgba(0,0,0,0.2)] text-sm hover:bg-[#330101] transition-colors">+ Unit</button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#4b150d]"></div></div>
        ) : (
          <div className="flex flex-col gap-10">
            {floors.length === 0 ? (
              <div className="text-center py-10 text-[#4b150d] font-[BoldMilk]">No Units Found</div>
            ) : (
              floors.map((f) => (
                <FloorBlock key={f} label={getFloorName(f)} floorUnits={groupByFloor(f)} />
              ))
            )}
          </div>
        )}
      </div>

      {/* MODALS - Re-integrated with Inputs */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-3xl border-2 border-[#4b150d] shadow-[12px_12px_0px_rgba(0,0,0,0.15)] p-8 w-full max-w-md">
            <h2 className="font-[BoldMilk] text-[#4b150d] text-2xl mb-6">
              {showEditModal ? `Edit Unit ${editingUnit?.unitNumber}` : "Add New Unit"}
            </h2>
            <form onSubmit={showEditModal ? handleUpdateUnit : handleAddUnit} className="space-y-4">
              <div className="space-y-2">
                <input
                  type="text" placeholder="Unit Number" required
                  className="w-full px-4 py-2 border-2 rounded-xl"
                  value={showEditModal ? editingUnit.unitNumber : newUnit.unitNumber}
                  onChange={(e) => showEditModal ? setEditingUnit({ ...editingUnit, unitNumber: e.target.value }) : setNewUnit({ ...newUnit, unitNumber: e.target.value })}
                />
                {showEditModal && (
                  <p className="text-xs text-orange-600 italic">
                    ⚠️ Changing unit number will automatically update all tenant and payment records
                  </p>
                )}
              </div>
              <select
                className="w-full px-4 py-2 border-2 rounded-xl"
                value={showEditModal ? editingUnit.floor : newUnit.floor}
                onChange={(e) => showEditModal ? setEditingUnit({ ...editingUnit, floor: parseInt(e.target.value) }) : setNewUnit({ ...newUnit, floor: parseInt(e.target.value) })}
              >
                <option value={1}>Ground Floor</option>
                <option value={2}>Second Floor</option>
                <option value={3}>Third Floor</option>
                <option value={4}>Fourth Floor</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Capacity" required className="px-4 py-2 border-2 rounded-xl"
                  value={showEditModal ? editingUnit.capacity : newUnit.capacity}
                  onChange={(e) => showEditModal ? setEditingUnit({ ...editingUnit, capacity: e.target.value }) : setNewUnit({ ...newUnit, capacity: e.target.value })}
                />
                <input type="number" placeholder="Rent Price" className="px-4 py-2 border-2 rounded-xl"
                  value={showEditModal ? editingUnit.rentPrice : newUnit.rentPrice}
                  onChange={(e) => showEditModal ? setEditingUnit({ ...editingUnit, rentPrice: e.target.value }) : setNewUnit({ ...newUnit, rentPrice: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="px-4 py-2 font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                <button type="submit" className="bg-[#4b150d] text-white px-8 py-2 rounded-xl shadow-lg">{showEditModal ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-3xl border-2 border-[#4b150d] p-8 max-w-sm text-center">
            <h2 className="font-[BoldMilk] text-red-600 text-xl mb-4">Delete Unit?</h2>
            <p className="text-gray-600 mb-6 text-sm">Are you sure you want to delete Unit {confirmDelete.unitNumber}? This cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 font-bold text-gray-400">No, Keep</button>
              <button onClick={confirmDeleteUnit} className="flex-1 bg-red-600 text-white py-2 rounded-xl font-bold">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}