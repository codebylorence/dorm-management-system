import { useState } from "react";
import { Link } from "react-router-dom";
import PayHisBg from "../../assets/adminpayhis.png";

export default function payhiscards() {
  const [searchTerm, setSearchTerm] = useState("");

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
      unit: "102",
      name: "Matthew Karl Batista",
      phone: "09198765432",
      date: "June 8, 2025",
      payment: "Electricity & Water Bill",
      amount: "₱2,500",
      status: "Unpaid",
    },
    {
      unit: "103",
      name: "Aldjon de Lacruz",
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

  const filteredHistory = history.filter(
    (entry) =>
      entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.payment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-r from-[#f7b094] to-[#dd7255] rounded-2xl px-6 py-10 flex flex-col gap-6 w-full h-full">
      {/* Header */}
      <div
        className="bg-cover bg-center shadow-[15px_13px_0px_#330101] rounded-2xl text-white py-6 px-6 md:px-20"
        style={{ backgroundImage: `url(${PayHisBg})` }}
      >
        <h1 className="font-[BoldMilk] tracking-[10px] md:tracking-[15px] text-[24px] md:text-[30px] text-white uppercase">
          Payment History Overview
        </h1>
      </div>

      {/* Table */}
      <div className="bg-gradient-to-r from-[#fee8da] to-[#efd4c4] shadow-[15px_13px_0px_#330101] rounded-2xl px-4 py-6 overflow-x-auto">
        {/* Search Bar */}
      <div className="flex">
        <input
          type="text"
          placeholder="Search by name, unit, or payment..."
          className="w-full bg-white px-4 py-2 border border-[#4b150d] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4b150d]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="bg-[#4b150d] text-[#efd4c4] uppercase text-sm font-medium">
              <th className="py-3 px-4 text-left">Unit No.</th>
              <th className="py-3 px-4 text-left">Full Name</th>
              <th className="py-3 px-4 text-left">Phone No.</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Payment</th>
              <th className="py-3 px-4 text-left">Amount</th>
              <th className="py-3 px-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((entry, index) => (
              <tr
                key={index}
                className="bg-white text-[#4b150d] text-sm rounded-xl shadow"
              >
                <td className="py-3 px-4">{entry.unit}</td>
                <td className="py-3 px-4">
                  <Link
                    to="/admintenantprof"
                    className="text-blue-700 underline hover:text-blue-900"
                  >
                    {entry.name}
                  </Link>
                </td>
                <td className="py-3 px-4">{entry.phone}</td>
                <td className="py-3 px-4">{entry.date}</td>
                <td className="py-3 px-4">{entry.payment}</td>
                <td className="py-3 px-4">{entry.amount}</td>
                <td className="py-3 px-4">
                  <select
                    value={entry.status}
                    onChange={(e) => handleStatusChange(index, e.target.value)}
                    className={`rounded px-3 py-1 ${getStatusStyle(
                      entry.status
                    )}`}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Late">Late</option>
                  </select>
                </td>
              </tr>
            ))}

            {filteredHistory.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-600">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
