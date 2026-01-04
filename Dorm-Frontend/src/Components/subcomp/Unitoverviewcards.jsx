import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaTrash, FaUsers, FaBed, FaEdit, FaCog } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useAuth } from "../../context/AuthContext";
import UnitsOverviewBG from "../../assets/unitsoverviewbg.png";
import Roombg from "../../assets/Roombg.png";
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
      console.error("Error fetching units:", error);
      toast.error("Failed to load units");
      setLoading(false);
    }
  };

  const handleAddUnit = async (e) => {
    e.preventDefault();
    
    // Additional security check - only admin can add units
    if (user?.role !== "admin") {
      toast.error("Only administrators can add units");
      setShowAddModal(false);
      return;
    }
    
    try {
      const data = await createUnit(newUnit);
      setUnits((prev) => [...prev, data]);
      setShowAddModal(false);
      setNewUnit({
        unitNumber: "",
        floor: 1,
        capacity: 1,
        rentPrice: "",
        description: "",
      });
      toast.success(`Unit ${data.unitNumber} created successfully!`);
    } catch (error) {
      console.error("Error adding unit:", error);
      toast.error(`Failed to create unit: ${error.message}`);
    }
  };

  const handleDeleteUnit = (unit) => {
    setConfirmDelete(unit);
  };

  const handleEditUnit = (unit) => {
    setEditingUnit({
      id: unit.id,
      unitNumber: unit.unitNumber,
      floor: unit.floor,
      capacity: unit.capacity,
      rentPrice: unit.rentPrice || "",
      description: unit.description || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateUnit = async (e) => {
    e.preventDefault();
    
    // Additional security check - only admin can edit units
    if (user?.role !== "admin") {
      toast.error("Only administrators can edit units");
      setShowEditModal(false);
      return;
    }
    
    try {
      const updatedUnit = await updateUnit(editingUnit.id, {
        unitNumber: editingUnit.unitNumber,
        floor: editingUnit.floor,
        capacity: editingUnit.capacity,
        rentPrice: editingUnit.rentPrice,
        description: editingUnit.description,
      });
      
      setUnits((prev) => 
        prev.map((unit) => 
          unit.id === editingUnit.id ? updatedUnit : unit
        )
      );
      
      setShowEditModal(false);
      setEditingUnit(null);
      toast.success(`Unit ${updatedUnit.unitNumber} updated successfully!`);
    } catch (error) {
      console.error("Error updating unit:", error);
      toast.error(`Failed to update unit: ${error.message}`);
    }
  };

  const confirmDeleteUnit = async () => {
    if (confirmDelete) {
      try {
        await deleteUnit(confirmDelete.id);
        setUnits((prev) => prev.filter((u) => u.id !== confirmDelete.id));
        toast.success(`Unit ${confirmDelete.unitNumber} deleted successfully!`);
        setConfirmDelete(null);
      } catch (error) {
        console.error("Error deleting unit:", error);
        toast.error(error.message || "Failed to delete unit");
      }
    }
  };

  const filteredUnits = units.filter((unit) =>
    unit.unitNumber.toLowerCase().includes(search.toLowerCase())
  );

  const groupByFloor = (floor) =>
    filteredUnits.filter((u) => u.floor === floor);

  const getFloorName = (floorNum) => {
    const floorNames = {
      1: "Ground Floor",
      2: "Second Floor",
      3: "Third Floor",
      4: "Fourth Floor",
    };
    return floorNames[floorNum] || `Floor ${floorNum}`;
  };

  const FloorBlock = ({ label, floorNum, units }) => {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-white text-xl font-bold px-4 py-3 rounded-md bg-[#3f0d0a] font-RegularMilk text-[18px] tracking-[3px]">
          {label}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {units.length === 0 ? (
            <p className="text-[#4b150d] col-span-full font-semibold">No units on this floor</p>
          ) : (
            units.map((unit) => (
              <Link
                key={unit.id}
                to={`/unit/${unit.unitNumber}`}
                className="relative bg-white/90 backdrop-blur-sm border-2 border-[#4b150d] rounded-xl flex flex-col gap-y-3 p-5 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer no-underline"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-[BoldMilk] text-2xl text-[#4b150d] hover:text-[#8b2d1a] transition-colors">
                    {unit.unitNumber}
                  </h3>
                  {user?.role === "admin" && configureMode && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleEditUnit(unit);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors shadow-md z-10"
                        title="Edit Unit"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteUnit(unit);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors shadow-md z-10"
                        title="Delete Unit"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-3 py-1.5 text-white rounded-lg text-sm font-bold shadow-md ${
                        unit.status === "occupied"
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                    >
                      {unit.status === "occupied" ? "OCCUPIED" : "VACANT"}
                    </span>
                    <span className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-md flex items-center gap-1">
                      <FaUsers size={12} />
                      {unit.tenantCount}
                    </span>
                  </div>

                  <div className="bg-[#fee8da] rounded-lg p-3 space-y-2">
                    {unit.capacity && (
                      <div className="flex items-center gap-2 text-[#4b150d]">
                        <FaBed className="text-[#8b2d1a]" />
                        <p className="text-sm font-semibold">
                          Capacity: <span className="font-bold">{unit.capacity}</span>
                        </p>
                      </div>
                    )}
                    {unit.rentPrice && (
                      <p className="text-sm font-semibold text-[#4b150d]">
                        Rent: <span className="font-bold text-[#8b2d1a]">₱{parseFloat(unit.rentPrice).toLocaleString()}</span>
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    );
  };

  const floors = [...new Set(units.map((u) => u.floor))].sort((a, b) => a - b);

  return (
    <div className="bg-gradient-to-r from-[#f7b094] to-[#dd7255] rounded-2xl px-6 md:px-12 py-10 flex flex-col gap-6 w-full h-full overflow-visible">
      <div
        className="bg-cover bg-center shadow-[15px_13px_0px_#330101] rounded-2xl text-white py-6 px-20"
        style={{ backgroundImage: `url(${UnitsOverviewBG})` }}
      >
        <h1 className="font-[BoldMilk] tracking-[10px] md:tracking-[15px] text-[24px] md:text-[30px] text-white uppercase">
          Units Overview
        </h1>
      </div>

      <div className="bg-gradient-to-r from-[#fee8da] to-[#efd4c4] shadow-[15px_13px_0px_#330101] rounded-2xl p-6 md:p-10 w-full h-full overflow-auto flex flex-col gap-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <input
            type="text"
            placeholder="Search unit number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-auto flex-grow px-4 py-2 rounded-lg border-2 border-[#4b150d] bg-white text-[#4b150d] font-semibold focus:outline-none focus:ring-2 focus:ring-[#db6747]"
          />
          
          <div className="flex gap-3">
            {/* Configure Button - Only visible for Admin */}
            {user?.role === "admin" && (
              <button
                onClick={() => setConfigureMode(!configureMode)}
                className={`px-4 py-2 rounded-lg transition-colors font-bold shadow-lg flex items-center gap-2 ${
                  configureMode 
                    ? "bg-orange-500 text-white hover:bg-orange-600" 
                    : "bg-gray-500 text-white hover:bg-gray-600"
                }`}
                title={configureMode ? "Exit Configure Mode" : "Enter Configure Mode"}
              >
                <FaCog size={16} />
                {configureMode ? "Exit Configure" : "Configure"}
              </button>
            )}
            
            {/* Add Unit Button - Only visible for Admin */}
            {user?.role === "admin" ? (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#4b150d] text-white px-6 py-2 rounded-lg hover:bg-[#6b1f11] transition-colors font-bold shadow-lg"
              >
                + Add Unit
              </button>
            ) : (
              <button
                disabled
                className="bg-gray-400 text-gray-600 px-6 py-2 rounded-lg cursor-not-allowed font-bold shadow-lg relative group"
                title="Only administrators can add units"
              >
                + Add Unit
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Admin access required
                </div>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p className="text-center text-[#4b150d] font-semibold">Loading units...</p>
        ) : (
          <div className="flex flex-col gap-6">
            {floors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#4b150d] font-semibold mb-4">No units found.</p>
                {user?.role === "admin" ? (
                  <p className="text-[#4b150d]">Add your first unit to get started!</p>
                ) : (
                  <p className="text-[#4b150d]">Contact an administrator to add units.</p>
                )}
              </div>
            ) : (
              floors.map((floorNum) => (
                <FloorBlock
                  key={floorNum}
                  label={getFloorName(floorNum)}
                  floorNum={floorNum}
                  units={groupByFloor(floorNum)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {showAddModal && user?.role === "admin" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold text-[#4b150d]">
                Add New Unit
              </h2>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                Admin Only
              </span>
            </div>
            <form onSubmit={handleAddUnit} className="space-y-4">
              <input
                type="text"
                placeholder="Unit Number (e.g., 101)"
                value={newUnit.unitNumber}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, unitNumber: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                required
              />
              <select
                value={newUnit.floor}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, floor: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                required
              >
                <option value={1}>Ground Floor</option>
                <option value={2}>Second Floor</option>
                <option value={3}>Third Floor</option>
                <option value={4}>Fourth Floor</option>
              </select>
              <input
                type="number"
                placeholder="Capacity (number of tenants)"
                value={newUnit.capacity}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, capacity: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                min="1"
                required
              />
              <input
                type="number"
                placeholder="Rent Price (optional)"
                value={newUnit.rentPrice}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, rentPrice: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                step="0.01"
              />
              <textarea
                placeholder="Description (optional)"
                value={newUnit.description}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, description: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                rows="2"
              />
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
                  Add Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingUnit && user?.role === "admin" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold text-[#4b150d]">
                Edit Unit {editingUnit.unitNumber}
              </h2>
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                Admin Only
              </span>
            </div>
            <form onSubmit={handleUpdateUnit} className="space-y-4">
              <input
                type="text"
                placeholder="Unit Number (e.g., 101)"
                value={editingUnit.unitNumber}
                onChange={(e) =>
                  setEditingUnit({ ...editingUnit, unitNumber: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                required
              />
              <select
                value={editingUnit.floor}
                onChange={(e) =>
                  setEditingUnit({ ...editingUnit, floor: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                required
              >
                <option value={1}>Ground Floor</option>
                <option value={2}>Second Floor</option>
                <option value={3}>Third Floor</option>
                <option value={4}>Fourth Floor</option>
              </select>
              <input
                type="number"
                placeholder="Capacity (number of tenants)"
                value={editingUnit.capacity}
                onChange={(e) =>
                  setEditingUnit({ ...editingUnit, capacity: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                min="1"
                required
              />
              <input
                type="number"
                placeholder="Rent Price (optional)"
                value={editingUnit.rentPrice}
                onChange={(e) =>
                  setEditingUnit({ ...editingUnit, rentPrice: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                step="0.01"
              />
              <textarea
                placeholder="Description (optional)"
                value={editingUnit.description}
                onChange={(e) =>
                  setEditingUnit({ ...editingUnit, description: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                rows="2"
              />
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUnit(null);
                  }}
                  className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Update Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4 text-[#4b150d]">
              Confirm Deletion
            </h2>
            <p className="mb-6 text-[#4b150d]">
              When you delete this unit, all existing information within it will
              also be deleted. Are you sure you want to delete Unit{" "}
              {confirmDelete.unitNumber}?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                No
              </button>
              <button
                onClick={confirmDeleteUnit}
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
