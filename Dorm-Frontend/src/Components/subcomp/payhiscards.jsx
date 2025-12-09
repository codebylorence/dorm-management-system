import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import PayHisBg from "../../assets/adminpayhis.png";
import { getAllPayments, updatePayment } from "../../api";

export default function payhiscards() {
  const [searchTerm, setSearchTerm] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch payments on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await getAllPayments();
      setHistory(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAmount = (amount) => {
    return `₱${parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

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

  const handleStatusChange = async (paymentId, newStatus) => {
    try {
      await updatePayment(paymentId, { status: newStatus });
      toast.success("Payment status updated successfully");
      // Refresh the payment list
      fetchPayments();
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Failed to update payment status");
    }
  };

  const filteredHistory = history.filter(
    (entry) =>
      entry.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.unitNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.paymentType?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="flex mb-4">
          <input
            type="text"
            placeholder="Search by name, unit, or payment..."
            className="w-full bg-white px-4 py-2 border border-[#4b150d] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4b150d]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#4b150d]"></div>
            <p className="mt-4 text-[#4b150d] font-[LightMilk]">Loading payments...</p>
          </div>
        ) : (
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
              {filteredHistory.map((entry) => (
                <tr
                  key={entry.id}
                  className="bg-white text-[#4b150d] text-sm rounded-xl shadow"
                >
                  <td className="py-3 px-4">{entry.unitNumber}</td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/tenantprof/${entry.tenantId}`}
                      className="text-blue-700 underline hover:text-blue-900"
                    >
                      {entry.tenantName}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    {entry.Tenant?.phone || "N/A"}
                  </td>
                  <td className="py-3 px-4">{formatDate(entry.paymentDate)}</td>
                  <td className="py-3 px-4">{entry.paymentType}</td>
                  <td className="py-3 px-4">{formatAmount(entry.amount)}</td>
                  <td className="py-3 px-4">
                    <select
                      value={entry.status}
                      onChange={(e) => handleStatusChange(entry.id, e.target.value)}
                      className={`rounded px-3 py-1 ${getStatusStyle(
                        entry.status
                      )}`}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Late">Late</option>
                      <option value="Partial">Partial</option>
                    </select>
                  </td>
                </tr>
              ))}

              {filteredHistory.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-600">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
