import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaCalendarAlt, FaSearch, FaFilter, FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import { getAllPayments, getPaymentStatistics, getOverduePayments, updatePayment, createPayment, deletePayment } from "../../api";
import { getAllTenants } from "../../api";
import PaymentsBg from "../../assets/payhisbg.png";

export default function PaymentsContent() {
  const [payments, setPayments] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [overduePayments, setOverduePayments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unpaid, overdue, paid
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    tenantId: "",
    amount: "",
    paymentType: "Rent Bill",
    dueDate: "",
    status: "Unpaid",
    notes: ""
  });

  useEffect(() => {
    fetchData();
    fetchTenants();
  }, [filter, dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filter === "unpaid") filters.status = "Unpaid";
      if (filter === "paid") filters.status = "Paid";
      if (filter === "overdue") filters.status = "Late";
      
      // Add date range filters
      if (dateRange.startDate) filters.startDate = dateRange.startDate;
      if (dateRange.endDate) filters.endDate = dateRange.endDate;
      
      console.log('Fetching payment data with filters:', filters);
      
      const [paymentsData, statsData, overdueData] = await Promise.all([
        getAllPayments(filters),
        getPaymentStatistics(),
        getOverduePayments()
      ]);
      
      console.log('Payment data received:', {
        payments: paymentsData.length,
        statistics: statsData,
        overdue: overdueData.length
      });
      
      setPayments(paymentsData);
      setStatistics(statsData);
      setOverduePayments(overdueData);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const data = await getAllTenants();
      setTenants(data.filter(t => t.status === "active"));
    } catch (error) {
      console.error("Error fetching tenants:", error);
    }
  };

  const handleStatusUpdate = async (paymentId, newStatus) => {
    try {
      const payment = payments.find(p => p.id === paymentId);
      await updatePayment(paymentId, { status: newStatus });
      
      // Show detailed success message
      const statusMessages = {
        'Paid': `Payment marked as paid. Amount ₱${parseFloat(payment.amount).toFixed(2)} added to total collected.`,
        'Unpaid': `Payment marked as unpaid. Amount removed from total collected.`,
        'Late': `Payment marked as late. Amount removed from total collected.`,
        'Partial': `Payment marked as partial. Please update paid amount if needed.`
      };
      
      toast.success(statusMessages[newStatus] || "Payment status updated");
      fetchData(); // This will refresh both payments and statistics
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Failed to update payment status");
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    try {
      const selectedTenant = tenants.find(t => t.id === parseInt(paymentForm.tenantId));
      if (!selectedTenant) {
        toast.error("Please select a tenant");
        return;
      }

      const paymentData = {
        tenantId: parseInt(paymentForm.tenantId),
        unitNumber: selectedTenant.unit,
        tenantName: selectedTenant.fullName,
        amount: parseFloat(paymentForm.amount),
        paymentType: paymentForm.paymentType,
        dueDate: paymentForm.dueDate || new Date().toISOString(),
        status: paymentForm.status,
        notes: paymentForm.notes
      };

      await createPayment(paymentData);
      toast.success("Payment created successfully");
      setShowPaymentModal(false);
      setPaymentForm({
        tenantId: "",
        amount: "",
        paymentType: "Rent Bill",
        dueDate: "",
        status: "Unpaid",
        notes: ""
      });
      fetchData();
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error(error.message || "Failed to create payment");
    }
  };

  const handleDeletePayment = (payment) => {
    setConfirmDelete(payment);
  };

  const confirmDeletePayment = async () => {
    if (confirmDelete) {
      try {
        await deletePayment(confirmDelete.id);
        setPayments((prev) => prev.filter((p) => p.id !== confirmDelete.id));
        toast.success(`Payment for ${confirmDelete.tenantName} deleted successfully!`);
        setConfirmDelete(null);
        fetchData(); // Refresh data to update statistics
      } catch (error) {
        console.error("Error deleting payment:", error);
        toast.error(error.message || "Failed to delete payment");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount) => {
    return `₱${parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleDateRangePreset = (preset) => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    switch (preset) {
      case 'today':
        setDateRange({
          startDate: formatDate(today),
          endDate: formatDate(today)
        });
        break;
      case 'thisMonth':
        setDateRange({
          startDate: formatDate(startOfMonth),
          endDate: formatDate(endOfMonth)
        });
        break;
      case 'lastMonth':
        setDateRange({
          startDate: formatDate(startOfLastMonth),
          endDate: formatDate(endOfLastMonth)
        });
        break;
      case 'thisYear':
        setDateRange({
          startDate: formatDate(startOfYear),
          endDate: formatDate(today)
        });
        break;
      default:
        setDateRange({ startDate: "", endDate: "" });
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-400 text-white";
      case "Unpaid":
        return "bg-yellow-500 text-white";
      case "Late":
        return "bg-red-500 text-white";
      case "Partial":
        return "bg-blue-400 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.unitNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-r from-[#f7b094] to-[#dd7255] rounded-2xl px-6 py-10 flex flex-col gap-6 w-full h-full">
      {/* Header */}
      <div
        className="bg-cover bg-center shadow-[15px_13px_0px_#330101] rounded-2xl text-white py-6 px-6 md:px-20"
        style={{ backgroundImage: `url(${PaymentsBg})` }}
      >
        <h1 className="font-[BoldMilk] tracking-[10px] md:tracking-[15px] text-[24px] md:text-[30px] text-white uppercase">
          Payments Monitoring
        </h1>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-[#fee8da] to-[#efd4c4] shadow-[15px_13px_0px_#330101] rounded-2xl p-6">
            <h3 className="font-[LightMilk] text-[#4b150d] text-sm mb-2">Total Collected</h3>
            <p className="font-[BoldMilk] text-[#4b150d] text-2xl">{formatAmount(statistics.totalCollected)}</p>
          </div>
          <div className="bg-gradient-to-r from-[#fee8da] to-[#efd4c4] shadow-[15px_13px_0px_#330101] rounded-2xl p-6">
            <h3 className="font-[LightMilk] text-[#4b150d] text-sm mb-2">Due Today</h3>
            <p className="font-[BoldMilk] text-[#4b150d] text-2xl">{formatAmount(statistics.dueToday)}</p>
          </div>
          <div className="bg-gradient-to-r from-[#fee8da] to-[#efd4c4] shadow-[15px_13px_0px_#330101] rounded-2xl p-6">
            <h3 className="font-[LightMilk] text-[#4b150d] text-sm mb-2">Overdue</h3>
            <p className="font-[BoldMilk] text-[#4b150d] text-2xl">{formatAmount(statistics.overdue)}</p>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-gradient-to-r from-[#fee8da] to-[#efd4c4] shadow-[15px_13px_0px_#330101] rounded-2xl p-4">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h2 className="font-[BoldMilk] text-[#4b150d] text-xl">Payment Records</h2>
            {(dateRange.startDate || dateRange.endDate) && (
              <div className="bg-gradient-to-r from-[#fee8da] to-[#efd4c4] border-2 border-[#4b150d] rounded-xl px-4 py-2 shadow-md">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-[#4b150d]" />
                  <span className="text-[#4b150d] text-sm font-[BoldMilk]">
                    Date Filter Active
                  </span>
                </div>
                <div className="text-[#4b150d] text-xs font-[LightMilk] mt-1">
                  {dateRange.startDate && dateRange.endDate 
                    ? `${dateRange.startDate} to ${dateRange.endDate}`
                    : dateRange.startDate 
                    ? `From ${dateRange.startDate}`
                    : `Until ${dateRange.endDate}`
                  }
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-[#db6747] text-white px-6 py-3 rounded-lg font-[BoldMilk] hover:bg-[#c44d30] transition-colors shadow-md flex items-center gap-2"
          >
            <FaPlus />
            Add Payment
          </button>
        </div>
        <div className="flex flex-col gap-4 mb-4">
          {/* Status Filter Buttons */}
          <div className="bg-gradient-to-r from-[#fee8da] to-[#efd4c4] rounded-xl p-4 shadow-md border-2 border-[#4b150d]">
            <div className="flex items-center gap-2 mb-3">
              <FaFilter className="text-[#4b150d]" />
              <h3 className="font-[BoldMilk] text-[#4b150d] text-sm">Filter by Status</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-[BoldMilk] text-sm transition-colors ${
                  filter === "all"
                    ? "bg-[#db6747] text-white shadow-md"
                    : "bg-white text-[#4b150d] hover:bg-gray-100 border-2 border-[#4b150d]"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("unpaid")}
                className={`px-4 py-2 rounded-lg font-[BoldMilk] text-sm transition-colors ${
                  filter === "unpaid"
                    ? "bg-[#db6747] text-white shadow-md"
                    : "bg-white text-[#4b150d] hover:bg-gray-100 border-2 border-[#4b150d]"
                }`}
              >
                Unpaid
              </button>
              <button
                onClick={() => setFilter("overdue")}
                className={`px-4 py-2 rounded-lg font-[BoldMilk] text-sm transition-colors ${
                  filter === "overdue"
                    ? "bg-[#db6747] text-white shadow-md"
                    : "bg-white text-[#4b150d] hover:bg-gray-100 border-2 border-[#4b150d]"
                }`}
              >
                Overdue
              </button>
              <button
                onClick={() => setFilter("paid")}
                className={`px-4 py-2 rounded-lg font-[BoldMilk] text-sm transition-colors ${
                  filter === "paid"
                    ? "bg-[#db6747] text-white shadow-md"
                    : "bg-white text-[#4b150d] hover:bg-gray-100 border-2 border-[#4b150d]"
                }`}
              >
                Paid
              </button>
            </div>
          </div>

          {/* Minimal Date Range and Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            {/* Date Range - Only Start/End Dates */}
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-[#4b150d]" />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-2 py-1 bg-white border border-[#4b150d] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#db6747]"
                placeholder="Start Date"
              />
              <span className="text-[#4b150d] text-sm">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-2 py-1 bg-white border border-[#4b150d] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#db6747]"
                placeholder="End Date"
              />
              {(dateRange.startDate || dateRange.endDate) && (
                <button
                  onClick={() => setDateRange({ startDate: "", endDate: "" })}
                  className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                  title="Clear dates"
                >
                  <FaTimes size={10} />
                </button>
              )}
            </div>

            {/* Search - Shorter */}
            <div className="flex items-center gap-2">
              <FaSearch className="text-[#4b150d]" />
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 px-3 py-1 pl-8 bg-white border border-[#4b150d] rounded focus:outline-none focus:ring-1 focus:ring-[#db6747] text-sm"
                />
                <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FaTimes size={10} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#4b150d]"></div>
            <p className="mt-4 text-[#4b150d] font-[LightMilk]">Loading payments...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#4b150d] text-[#efd4c4]">
                <tr>
                  <th className="py-3 px-4 text-left">Unit</th>
                  <th className="py-3 px-4 text-left">Tenant</th>
                  <th className="py-3 px-4 text-left">Payment Type</th>
                  <th className="py-3 px-4 text-left">Amount</th>
                  <th className="py-3 px-4 text-left">Due Date</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-[#4b150d] font-[LightMilk]">{payment.unitNumber}</td>
                    <td className="py-3 px-4 text-[#4b150d] font-[LightMilk]">{payment.tenantName}</td>
                    <td className="py-3 px-4 text-[#4b150d] font-[LightMilk]">{payment.paymentType}</td>
                    <td className="py-3 px-4 text-[#4b150d] font-[BoldMilk]">{formatAmount(payment.amount)}</td>
                    <td className="py-3 px-4 text-[#4b150d] font-[LightMilk]">{formatDate(payment.dueDate)}</td>
                    <td className="py-3 px-4">
                      <span className={`rounded px-2 py-1 text-sm ${getStatusStyle(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={payment.status}
                          onChange={(e) => handleStatusUpdate(payment.id, e.target.value)}
                          className={`rounded px-2 py-1 text-sm ${getStatusStyle(payment.status)} border-none`}
                        >
                          <option value="Paid">Paid</option>
                          <option value="Unpaid">Unpaid</option>
                          <option value="Late">Late</option>
                          <option value="Partial">Partial</option>
                        </select>
                        <button
                          onClick={() => handleDeletePayment(payment)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-colors shadow-sm"
                          title="Delete Payment"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && !loading && (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-gray-600">
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Overdue Payments Alert */}
        {overduePayments.length > 0 && (
          <div className="mt-4 bg-red-100 border-2 border-red-500 rounded-xl p-4">
            <h3 className="font-[BoldMilk] text-red-800 mb-2">⚠️ Overdue Payments ({overduePayments.length})</h3>
            <div className="space-y-2">
              {overduePayments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="text-sm text-red-700">
                  <span className="font-[BoldMilk]">{payment.tenantName}</span> - Unit {payment.unitNumber} - {formatAmount(payment.amount)} (Due: {formatDate(payment.dueDate)})
                </div>
              ))}
              {overduePayments.length > 5 && (
                <p className="text-sm text-red-700 font-[LightMilk]">...and {overduePayments.length - 5} more</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-[15px_13px_0px_#330101] max-h-[90vh] overflow-y-auto">
            <h3 className="font-[BoldMilk] text-[#4b150d] text-xl mb-4">Create New Payment</h3>
            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div>
                <label className="block text-[#4b150d] font-[LightMilk] text-sm mb-2">Tenant *</label>
                <select
                  required
                  value={paymentForm.tenantId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, tenantId: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#4b150d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                >
                  <option value="">Select a tenant</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.fullName} - Unit {tenant.unit}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#4b150d] font-[LightMilk] text-sm mb-2">Payment Type *</label>
                <select
                  required
                  value={paymentForm.paymentType}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentType: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#4b150d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                >
                  <option value="Rent Bill">Rent Bill</option>
                  <option value="Electricity & Water Bill">Electricity & Water Bill</option>
                  <option value="Advance">Advance</option>
                  <option value="Deposit">Deposit</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[#4b150d] font-[LightMilk] text-sm mb-2">Amount (₱) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#4b150d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-[#4b150d] font-[LightMilk] text-sm mb-2">Due Date *</label>
                <input
                  type="date"
                  required
                  value={paymentForm.dueDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#4b150d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                />
              </div>
              <div>
                <label className="block text-[#4b150d] font-[LightMilk] text-sm mb-2">Status *</label>
                <select
                  required
                  value={paymentForm.status}
                  onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#4b150d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Late">Late</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>
              <div>
                <label className="block text-[#4b150d] font-[LightMilk] text-sm mb-2">Notes</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border-2 border-[#4b150d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#db6747] text-white px-4 py-2 rounded-lg font-[BoldMilk] hover:bg-[#c44d30] transition-colors"
                >
                  Create Payment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentForm({
                      tenantId: "",
                      amount: "",
                      paymentType: "Rent Bill",
                      dueDate: "",
                      status: "Unpaid",
                      notes: ""
                    });
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

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4 text-[#4b150d]">
              Confirm Deletion
            </h2>
            <p className="mb-6 text-[#4b150d]">
              Are you sure you want to delete this payment record?
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-[#4b150d]">
                <strong>Tenant:</strong> {confirmDelete.tenantName}
              </p>
              <p className="text-sm text-[#4b150d]">
                <strong>Unit:</strong> {confirmDelete.unitNumber}
              </p>
              <p className="text-sm text-[#4b150d]">
                <strong>Amount:</strong> {formatAmount(confirmDelete.amount)}
              </p>
              <p className="text-sm text-[#4b150d]">
                <strong>Type:</strong> {confirmDelete.paymentType}
              </p>
              <p className="text-sm text-[#4b150d]">
                <strong>Due Date:</strong> {formatDate(confirmDelete.dueDate)}
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePayment}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

