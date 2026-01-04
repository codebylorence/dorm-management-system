import { useState } from "react";
import { Link } from "react-router-dom";
import unitprofbg from "../../assets/unitprofbg.png";
import tenantprofbg from "../../assets/tenantprofbg.png";
import payhisbg from '../../assets/payhisbg.png'

export default function ProfileCards() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "Lance Atendidas",
    email: "LanceAtendidas@gmail.com",
    phone: "57984598735493",
    nextduedate: "November 11, 2025",
    contractduration: "September 25, 2025 - September 25, 2026",
  });

  // --- Rent & Utility States ---
  const [rentAmount, setRentAmount] = useState(5000);
  const [isEditingRent, setIsEditingRent] = useState(false);

  // --- Modal States ---
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [modalTitle, setModalTitle] = useState("");

  const [history, setHistory] = useState([
    {
      unit: "101",
      name: "Lance Atendidas",
      phone: "09123456789",
      date: "June 10, 2025",
      payment: "Rent Bill",
      amount: "₱10,000",
      status: "Paid",
    },
    {
      unit: "101",
      name: "Lance Atendidas",
      phone: "09198765432",
      date: "June, 8, 2025",
      payment: "Electricity & Water Bill",
      amount: "₱2,500",
      status: "Unpaid",
    },
    {
      unit: "101",
      name: "Lance Atendidas",
      phone: "09111222333",
      date: "June 1, 2025",
      payment: "Advance",
      amount: "₱5,000",
      status: "Late",
    },
  ]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-400 text-white";
      case "Unpaid":
        return "bg-yellow-500 text-white";
      case "Late":
        return "bg-red-500 text-white";
      default:
        return "bg-white text-black";
    }
  };

  const handleStatusChange = (index, newStatus) => {
    const updated = [...history];
    updated[index].status = newStatus;
    setHistory(updated);
  };

  const [addLogModalVisible, setAddLogModalVisible] = useState(false);
  const [newLog, setNewLog] = useState({
    unit: "",
    name: "",
    phone: "",
    date: "",
    payment: "",
    amount: "",
    status: "Paid",
  });

  const openAddLogModal = () => setAddLogModalVisible(true);
  const closeAddLogModal = () => setAddLogModalVisible(false);

  const handleNewLogChange = (e) => {
    setNewLog({ ...newLog, [e.target.name]: e.target.value });
  };

  const addNewLog = () => {
    setHistory([...history, newLog]);
    setNewLog({
      unit: "",
      name: "",
      phone: "",
      date: "",
      payment: "",
      amount: "",
      status: "Paid",
    });
    closeAddLogModal();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = history.filter((entry) => {
    const lowerQuery = searchQuery.toLowerCase();
    const month = new Date(entry.date).toLocaleString("default", { month: "long" }).toLowerCase();
    const year = new Date(entry.date).getFullYear().toString();
    const paymentType = entry.payment.toLowerCase();

    return (
      month.includes(lowerQuery) ||
      year.includes(lowerQuery) ||
      paymentType.includes(lowerQuery)
    );
  });

  return (
    <div className="bg-gradient-to-r from-[#f7b094] to-[#dd7255] rounded-2xl w-full h-full px-6 md:px-12 pt-8 pb-8 flex flex-col gap-9">
      
      {/* Header */}
      <div
        className="bg-cover bg-center shadow-[15px_13px_0px_#330101] rounded-2xl text-white px-6 md:px-28 py-7 flex"
        style={{ backgroundImage: `url(${unitprofbg})` }}
      >
        <h1 className="text-[24px] md:text-[34px] font-BoldMilk tracking-[10px] md:tracking-[13px]">
          UNIT 1
        </h1>
      </div>

      {/* Tenant Profile */}
      <div
        className="bg-cover bg-center shadow-[15px_13px_0px_#efd4c4] rounded-2xl text-white px-6 md:px-12 py-8 flex flex-col gap-6"
        style={{ backgroundImage: `url(${tenantprofbg})` }}
      >
        <h1 className="text-[18px] md:text-[24px] font-MDMilk tracking-[5px]">
          TENANT PROFILE
        </h1>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-RegularMilk mb-1">Full Name</label>
              <input
                name="fullname"
                disabled={!isEditing}
                value={formData.fullname}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-[#4b150d] bg-white text-[#4b150d] focus:ring-2 focus:ring-[#db6747] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-RegularMilk mb-1">Email</label>
              <input
                name="email"
                disabled={!isEditing}
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-[#4b150d] bg-white text-[#4b150d] focus:ring-2 focus:ring-[#db6747] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-RegularMilk mb-1">Phone Number</label>
              <input
                name="phone"
                disabled={!isEditing}
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-[#4b150d] bg-white text-[#4b150d] focus:ring-2 focus:ring-[#db6747] focus:outline-none"
              />
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-RegularMilk mb-1">Next Due Date</label>
              <input
                name="nextduedate"
                disabled={!isEditing}
                value={formData.nextduedate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-[#4b150d] bg-white text-[#4b150d] text-center focus:ring-2 focus:ring-[#db6747] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-RegularMilk mb-1">Contract Duration</label>
              <input
                name="contractduration"
                disabled={!isEditing}
                value={formData.contractduration}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-[#4b150d] bg-white text-[#4b150d] text-center focus:ring-2 focus:ring-[#db6747] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <div className="flex justify-start md:justify-end ">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className=" px-10 md:px-20 py-3 bg-[#db6646] text-white rounded-lg shadow hover:bg-[#b9492c] transition cursor-pointer font-RegularMilk tracking-[2px]"
          >
            {isEditing ? "Save" : "Edit Profile"}
          </button>
        </div>

        {/* Bills Section */}
        <div className="flex flex-col gap-6 mt-6 mb-2">
          <div className="bg-[#fefefe] text-[#4b150d] p-6 rounded-lg shadow flex flex-col gap-4">
            <h2 className="text-2xl md:text-4xl tracking-[2px] font-RegularMilk">₱ 5,000</h2>
            <p className="text-base md:text-lg font-LightMilk tracking-[1px]">Rent Bill</p>
            <div className="flex flex-row flex-wrap justify-center md:justify-start gap-5 font-LightMilk text-sm">
              <button className="mt-4 px-4 py-2 bg-[#4b150d] text-white rounded hover:bg-[#2f0e07] transition cursor-pointer">
                View Proof of Payment
              </button>
              <button className="mt-4 px-4 py-2 bg-[#4b150d] text-white rounded hover:bg-[#2f0e07] transition cursor-pointer">
                View Bill
              </button>
              <button className="mt-4 px-4 py-2 bg-[#4b150d] text-white rounded hover:bg-[#2f0e07] transition cursor-pointer">
                Edit
              </button>
            </div>
          </div>

          <div className="bg-[#fefefe] text-[#4b150d] p-6 rounded-lg shadow flex flex-col gap-4">
            <h2 className="text-2xl md:text-4xl tracking-[2px] font-RegularMilk">₱ 5,000</h2>
            <p className="text-base md:text-lg font-LightMilk tracking-[1px]">Electricity and Water Bill</p>
            <div className="flex flex-row flex-wrap justify-center md:justify-start gap-5 font-LightMilk  text-sm">
              <button className="mt-4 px-4 py-2 bg-[#4b150d] text-white rounded hover:bg-[#2f0e07] transition cursor-pointer">
                View Proof of Payment
              </button>
              <button className="mt-4 px-4 py-2 bg-[#4b150d] text-white rounded hover:bg-[#2f0e07] transition cursor-pointer">
                View Bill
              </button>
              <button className="mt-4 px-4 py-2 bg-[#4b150d] text-white rounded hover:bg-[#2f0e07] transition cursor-pointer">
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-gradient-to-r from-[#fee8da] to-[#efd4c4] shadow-[15px_13px_0px_#330101] rounded-2xl px-6 py-6 overflow-x-auto flex flex-col ">
        <div
          className="bg-cover bg-center rounded-2xl text-white py-5 px-3 md:px-15 flex justify-center sm:justify-start text-center"
          style={{ backgroundImage: `url(${payhisbg})` }}
        >
          <h1 className="font-[LightMilk] md:font-[MDMilk] tracking-[1px] md:tracking-[6px] text-[15px] md:text-[25px] text-white">
            PAYMENT HISTORY
          </h1>
        </div>
        <div className="flex justify-between items-center mt-9">
          <input
            type="text"
            placeholder="Search by month, year or payment type"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white px-4 py-2 rounded border w-full md:w-1/2"
          />
          <button
            onClick={openAddLogModal}
            className="ml-4 px-6 py-2 bg-[#4b150d] text-base font-LightMilk text-white rounded hover:bg-[#2f0e07] transition"
          >
            + ADD LOG
          </button>
        </div>
        <table className="w-full border-separate border-spacing-y-3 ">
          <thead>
            <tr className="bg-[#4b150d] text-[#efd4c4] uppercase text-sm font-medium">
              <th className="py-3 px-4 text-left">Unit No.</th>
              <th className="py-3 px-4 text-left">Full Name</th>
              <th className="py-3 px-4 text-left">Phone No.</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Payment</th>
              <th className="py-3 px-4 text-left">Amount</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((entry, index) => (
              <tr key={index} className="bg-white text-[#4b150d] text-sm rounded-xl shadow">
                <td className="py-3 px-4">{entry.unit}</td>
                <td className="py-3 px-4">{entry.name}</td>
                <td className="py-3 px-4">{entry.phone}</td>
                <td className="py-3 px-4">{entry.date}</td>
                <td className="py-3 px-4">{entry.payment}</td>
                <td className="py-3 px-4">{entry.amount}</td>
                <td className="py-3 px-4">
                  <select
                    value={entry.status}
                    onChange={(e) => handleStatusChange(index, e.target.value)}
                    className={`rounded px-3 py-1 ${getStatusStyle(entry.status)}`}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Late">Late</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  <select
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "Delete") {
                        setHistory(history.filter((_, i) => i !== index));
                      } else if (value === "Edit") {
                        setNewLog(entry);
                        setAddLogModalVisible(true);
                      }
                    }}
                    className="rounded px-3 py-1 bg-gray-100"
                    defaultValue=""
                  >
                    <option value="" disabled>Actions</option>
                    <option value="Edit">Edit</option>
                    <option value="Delete">Delete</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Log Modal */}
      {addLogModalVisible && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Payment Log</h2>
            <div className="flex flex-col gap-3">
              <input name="unit" placeholder="Unit No." value={newLog.unit} onChange={handleNewLogChange} className="w-full px-3 py-2 border rounded" />
              <input name="name" placeholder="Full Name" value={newLog.name} onChange={handleNewLogChange} className="w-full px-3 py-2 border rounded" />
              <input name="phone" placeholder="Phone No." value={newLog.phone} onChange={handleNewLogChange} className="w-full px-3 py-2 border rounded" />
              <input name="date" placeholder="Date" type="date" value={newLog.date} onChange={handleNewLogChange} className="w-full px-3 py-2 border rounded" />
              <input name="payment" placeholder="Payment Type" value={newLog.payment} onChange={handleNewLogChange} className="w-full px-3 py-2 border rounded" />
              <input name="amount" placeholder="Amount" value={newLog.amount} onChange={handleNewLogChange} className="w-full px-3 py-2 border rounded" />
              <select name="status" value={newLog.status} onChange={handleNewLogChange} className="w-full px-3 py-2 border rounded">
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Late">Late</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={closeAddLogModal} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
              <button onClick={addNewLog} className="px-4 py-2 bg-[#4b150d] text-white rounded hover:bg-[#2f0e07]">Add Log</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
