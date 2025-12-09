import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getAllPayments, getPaymentStatistics, getOverduePayments, updatePayment, createPayment } from "../../api";
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
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
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filter === "unpaid") filters.status = "Unpaid";
      if (filter === "paid") filters.status = "Paid";
      if (filter === "overdue") filters.status = "Late";
      
      const [paymentsData, statsData, overdueData] = await Promise.all([
        getAllPayments(filters),
        getPaymentStatistics(),
        getOverduePayments()
      ]);
      
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
      await updatePayment(paymentId, { status: newStatus });
      toast.success("Payment status updated");
      fetchData();
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-[BoldMilk] text-[#4b150d] text-xl">Payment Records</h2>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-[#db6747] text-white px-4 py-2 rounded-lg font-[BoldMilk] hover:bg-[#c44d30] transition-colors shadow-md"
          >
            + Add Payment
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-[BoldMilk] text-sm transition-all ${
                filter === "all"
                  ? "bg-[#db6747] text-white shadow-md"
                  : "bg-white text-[#4b150d] hover:bg-gray-100"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unpaid")}
              className={`px-4 py-2 rounded-lg font-[BoldMilk] text-sm transition-all ${
                filter === "unpaid"
                  ? "bg-[#db6747] text-white shadow-md"
                  : "bg-white text-[#4b150d] hover:bg-gray-100"
              }`}
            >
              Unpaid
            </button>
            <button
              onClick={() => setFilter("overdue")}
              className={`px-4 py-2 rounded-lg font-[BoldMilk] text-sm transition-all ${
                filter === "overdue"
                  ? "bg-[#db6747] text-white shadow-md"
                  : "bg-white text-[#4b150d] hover:bg-gray-100"
              }`}
            >
              Overdue
            </button>
            <button
              onClick={() => setFilter("paid")}
              className={`px-4 py-2 rounded-lg font-[BoldMilk] text-sm transition-all ${
                filter === "paid"
                  ? "bg-[#db6747] text-white shadow-md"
                  : "bg-white text-[#4b150d] hover:bg-gray-100"
              }`}
            >
              Paid
            </button>
          </div>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by name, unit, or payment type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 bg-white border-2 border-[#4b150d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747]"
          />
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
    </div>
  );
}

