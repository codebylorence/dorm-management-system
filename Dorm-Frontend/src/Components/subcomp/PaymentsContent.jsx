import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaCalendarAlt, FaSearch, FaFilter, FaTimes, FaPlus, FaTrash, FaExclamationCircle, FaEdit } from "react-icons/fa";
import { getAllPayments, getPaymentStatistics, getOverduePayments, updatePayment, createPayment, deletePayment, updateOverduePayments } from "../../api";
import { getAllTenants } from "../../api";
import PaymentsBg from "../../assets/payhisbg.png";

export default function PaymentsContent() {
  const [payments, setPayments] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [overduePayments, setOverduePayments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    tenantId: "", amount: "", paymentType: "Rent Bill",
    dueDate: "", status: "Unpaid", notes: ""
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
      if (dateRange.startDate) filters.startDate = dateRange.startDate;
      if (dateRange.endDate) filters.endDate = dateRange.endDate;
      
      const [paymentsData, statsData, overdueData] = await Promise.all([
        getAllPayments(filters),
        getPaymentStatistics(),
        getOverduePayments()
      ]);
      
      setPayments(paymentsData);
      setStatistics(statsData);
      setOverduePayments(overdueData);
    } catch (error) {
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
      toast.success(`Payment marked as ${newStatus}`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update payment status");
    }
  };

  const handleUpdateOverdue = async () => {
    try {
      const result = await updateOverduePayments();
      toast.success(`Updated ${result.updatedCount || 0} overdue payments`);
      fetchData(); // Refresh the data
    } catch (error) {
      console.error("Error updating overdue payments:", error);
      toast.error("Failed to update overdue payments");
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    try {
      console.log("Form data:", paymentForm);
      console.log("Available tenants:", tenants);
      
      const selectedTenant = tenants.find(t => t.id === parseInt(paymentForm.tenantId));
      if (!selectedTenant) {
        toast.error("Please select a tenant");
        return;
      }
      
      console.log("Selected tenant:", selectedTenant);
      
      const paymentData = {
        tenantId: parseInt(paymentForm.tenantId),
        unitNumber: selectedTenant.unit,
        tenantName: selectedTenant.fullName,
        amount: parseFloat(paymentForm.amount),
        paymentType: paymentForm.paymentType,
        dueDate: paymentForm.dueDate,
        status: paymentForm.status,
        notes: paymentForm.notes || ""
      };
      
      console.log("Payment data to send:", paymentData);
      
      if (editingPayment) {
        // Update existing payment
        const result = await updatePayment(editingPayment.id, paymentData);
        console.log("Payment updated successfully:", result);
        toast.success("Payment updated successfully");
      } else {
        // Create new payment
        const result = await createPayment(paymentData);
        console.log("Payment created successfully:", result);
        toast.success("Payment created successfully");
      }
      
      setShowPaymentModal(false);
      setEditingPayment(null);
      setPaymentForm({ tenantId: "", amount: "", paymentType: "Rent Bill", dueDate: "", status: "Unpaid", notes: "" });
      fetchData();
    } catch (error) {
      console.error("Error with payment:", error);
      toast.error(error.message || `Failed to ${editingPayment ? 'update' : 'create'} payment`);
    }
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setPaymentForm({
      tenantId: payment.tenantId?.toString() || "",
      amount: payment.amount?.toString() || "",
      paymentType: payment.paymentType || "Rent Bill",
      dueDate: payment.dueDate ? payment.dueDate.split('T')[0] : "",
      status: payment.status || "Unpaid",
      notes: payment.notes || ""
    });
    setShowPaymentModal(true);
  };

  const confirmDeletePayment = async () => {
    if (confirmDelete) {
      try {
        await deletePayment(confirmDelete.id);
        toast.success(`Record deleted!`);
        setConfirmDelete(null);
        fetchData();
      } catch (error) {
        toast.error("Failed to delete payment");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const formatAmount = (amount) => {
    return `₱${parseFloat(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Paid": return "bg-green-500 text-white border-green-600";
      case "Unpaid": return "bg-amber-500 text-white border-amber-600";
      case "Late": return "bg-red-500 text-white border-red-600 animate-pulse";
      case "Partial": return "bg-blue-500 text-white border-blue-600";
      default: return "bg-gray-400 text-white border-gray-500";
    }
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.unitNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-r from-[#f7b094] to-[#dd7255] rounded-2xl px-4 md:px-8 py-10 flex flex-col gap-6 w-full min-h-screen font-sans">
      
      {/* HEADER SECTION */}
      <div
        className="bg-cover bg-center shadow-[8px_8px_0px_rgba(75,21,13,0.15)] rounded-3xl text-white py-10 px-8 md:px-16 border-2 border-[#4b150d] relative overflow-hidden"
        style={{ backgroundImage: `linear-gradient(rgba(75,21,13,0.4), rgba(75,21,13,0.4)), url(${PaymentsBg})` }}
      >
        <div className="relative z-10">
          <h1 className="font-[BoldMilk] tracking-[8px] md:tracking-[12px] text-2xl md:text-4xl uppercase drop-shadow-md">
            Payments Monitoring
          </h1>
          <p className="font-[LightMilk] opacity-90 mt-2 tracking-widest uppercase text-[10px] md:text-xs">Financial Overview & History</p>
        </div>
      </div>

      {/* STATISTICS */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Collected", val: statistics.totalCollected, color: "from-green-50 to-emerald-50", text: "text-emerald-700" },
            { label: "Due Today", val: statistics.dueToday, color: "from-blue-50 to-indigo-50", text: "text-indigo-700" },
            { label: "Overdue Balance", val: statistics.overdue, color: "from-red-50 to-orange-50", text: "text-red-700" },
          ].map((stat, idx) => (
            <div key={idx} className={`bg-gradient-to-br ${stat.color} border-2 border-[#4b150d] shadow-[6px_6px_0px_rgba(75,21,13,0.1)] rounded-2xl p-6 transition-all hover:-translate-y-1`}>
              <h3 className="font-[BoldMilk] text-[#4b150d] text-[10px] uppercase tracking-widest mb-1 opacity-60">{stat.label}</h3>
              <p className={`font-[BoldMilk] text-3xl ${stat.text}`}>{formatAmount(stat.val)}</p>
            </div>
          ))}
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="bg-white/90 backdrop-blur-md shadow-[10px_10px_0px_rgba(75,21,13,0.1)] rounded-[2.5rem] p-6 md:p-8 border-2 border-[#4b150d]">
        
        {/* TOOLBAR */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
          <div>
            <h2 className="font-[BoldMilk] text-[#4b150d] text-2xl uppercase tracking-tighter">Record Log</h2>
            <div className="h-1.5 w-12 bg-[#4b150d] rounded-full mt-1"></div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 md:w-80">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4b150d] opacity-40" />
              <input
                type="text"
                placeholder="Search tenant or unit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#4b150d]/5 border-2 border-[#4b150d]/20 rounded-2xl focus:outline-none focus:border-[#4b150d]"
              />
            </div>

            <button
              onClick={handleUpdateOverdue}
              className="bg-orange-500 text-white px-4 py-3 rounded-2xl font-[BoldMilk] shadow-[4px_4px_0px_rgba(0,0,0,0.2)] hover:bg-orange-600 transition-all flex items-center gap-2 uppercase text-xs tracking-widest"
              title="Update overdue payments"
            >
              <FaExclamationCircle /> Update Overdue
            </button>

            <button
              onClick={() => {
                setEditingPayment(null);
                setPaymentForm({ tenantId: "", amount: "", paymentType: "Rent Bill", dueDate: "", status: "Unpaid", notes: "" });
                setShowPaymentModal(true);
              }}
              className="bg-[#4b150d] text-white px-6 py-3 rounded-2xl font-[BoldMilk] shadow-[4px_4px_0px_rgba(0,0,0,0.2)] hover:bg-[#330101] transition-all flex items-center gap-2 uppercase text-xs tracking-widest"
            >
              <FaPlus /> Add Payment
            </button>
          </div>
        </div>

        {/* QUICK FILTERS */}
        <div className="flex flex-wrap gap-2 mb-8">
          {["all", "unpaid", "overdue", "paid"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-6 py-2 rounded-xl font-[BoldMilk] text-[10px] uppercase border-2 transition-all ${
                filter === t 
                ? "bg-[#4b150d] text-white border-[#4b150d]" 
                : "bg-white text-[#4b150d] border-[#4b150d]/10 hover:border-[#4b150d]/40"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border-2 border-[#4b150d] overflow-hidden">
          {loading ? (
            <div className="text-center py-24 font-[BoldMilk] text-[#4b150d] animate-pulse">LOADING DATA...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#4b150d] text-[#efd4c4]">
                  <tr>
                    <th className="py-5 px-6 text-left font-[BoldMilk] uppercase text-[10px] tracking-widest">Unit / Tenant</th>
                    <th className="py-5 px-6 text-left font-[BoldMilk] uppercase text-[10px] tracking-widest">Bill Type</th>
                    <th className="py-5 px-6 text-left font-[BoldMilk] uppercase text-[10px] tracking-widest">Amount</th>
                    <th className="py-5 px-6 text-left font-[BoldMilk] uppercase text-[10px] tracking-widest">Due Date</th>
                    <th className="py-5 px-6 text-left font-[BoldMilk] uppercase text-[10px] tracking-widest">Status</th>
                    <th className="py-5 px-6 text-center font-[BoldMilk] uppercase text-[10px] tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#4b150d]/10">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className={`hover:bg-[#4b150d]/5 transition-colors ${payment.status === 'Late' ? 'bg-red-50 border-l-4 border-red-500' : ''}`}>
                      <td className="py-4 px-6">
                        <div className="font-[BoldMilk] text-[#4b150d] text-lg flex items-center gap-2">
                          Unit {payment.unitNumber}
                          {payment.status === 'Late' && <FaExclamationCircle className="text-red-500 animate-pulse" size={14} />}
                        </div>
                        <div className="font-[LightMilk] text-[10px] text-[#4b150d] opacity-60 uppercase">{payment.tenantName}</div>
                      </td>
                      <td className="py-4 px-6 font-[LightMilk] text-[#4b150d] text-xs italic">{payment.paymentType}</td>
                      <td className="py-4 px-6 font-[BoldMilk] text-[#4b150d] text-lg">{formatAmount(payment.amount)}</td>
                      <td className="py-4 px-6 font-[LightMilk] text-[#4b150d] text-sm">{formatDate(payment.dueDate)}</td>
                      <td className="py-4 px-6">
                        <select
                          value={payment.status}
                          onChange={(e) => handleStatusUpdate(payment.id, e.target.value)}
                          className={`font-[BoldMilk] text-[9px] px-4 py-1.5 rounded-full border-2 shadow-sm uppercase tracking-wider ${getStatusStyle(payment.status)}`}
                        >
                          <option value="Paid">PAID</option>
                          <option value="Unpaid">UNPAID</option>
                          <option value="Late">LATE</option>
                          <option value="Partial">PARTIAL</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleEditPayment(payment)} 
                            className="text-blue-600 p-2 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit Payment"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button 
                            onClick={() => setConfirmDelete(payment)} 
                            className="text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Payment"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL - ENHANCED FROM IMAGE_FECC84.PNG */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-[2.5rem] border-4 border-[#4b150d] shadow-[15px_15px_0px_rgba(0,0,0,0.2)] p-10 w-full max-w-xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-10">
              <h2 className="font-[BoldMilk] text-[#4b150d] text-4xl uppercase tracking-tighter">
                {editingPayment ? "Edit Payment" : "New Transaction"}
              </h2>
              <button onClick={() => {
                setShowPaymentModal(false);
                setEditingPayment(null);
                setPaymentForm({ tenantId: "", amount: "", paymentType: "Rent Bill", dueDate: "", status: "Unpaid", notes: "" });
              }} className="text-[#4b150d] opacity-40 hover:opacity-100 transition-opacity">
                <FaTimes size={28}/>
              </button>
            </div>
            
            <form onSubmit={handleCreatePayment} className="flex flex-col gap-8">
              {/* Select Active Tenant */}
              <div className="flex flex-col gap-3">
                <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Select Active Tenant</label>
                <select 
                  required className="w-full px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d] rounded-2xl font-[BoldMilk] uppercase text-sm tracking-widest focus:ring-4 focus:ring-[#4b150d]/10 outline-none appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234b150d'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.2rem' }}
                  value={paymentForm.tenantId}
                  onChange={(e) => setPaymentForm({...paymentForm, tenantId: e.target.value})}
                >
                  <option value="">Choose a tenant...</option>
                  {tenants.map(t => <option key={t.id} value={t.id}>Unit {t.unit} - {t.fullName}</option>)}
                </select>
              </div>

              {/* Bill Type Selection */}
              <div className="flex flex-col gap-3">
                <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Bill Type</label>
                <select 
                  required className="w-full px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d] rounded-2xl font-[BoldMilk] uppercase text-sm tracking-widest focus:ring-4 focus:ring-[#4b150d]/10 outline-none appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234b150d'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.2rem' }}
                  value={paymentForm.paymentType}
                  onChange={(e) => setPaymentForm({...paymentForm, paymentType: e.target.value})}
                >
                  <option value="Rent Bill">Rent Bill</option>
                  <option value="Electricity & Water Bill">Electricity & Water Bill</option>
                  <option value="Advance">Advance</option>
                  <option value="Deposit">Deposit</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Amount and Due Date Row */}
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-3">
                  <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Amount (PHP)</label>
                  <input 
                    type="number" step="0.01" required
                    className="w-full px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] focus:border-[#4b150d] outline-none"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="font-[BoldMilk] text-[10px] text-[#4b150d] uppercase ml-1">Due Date</label>
                  <input 
                    type="date" required
                    className="w-full px-6 py-4 bg-[#4b150d]/5 border-2 border-[#4b150d]/10 rounded-2xl font-[BoldMilk] focus:border-[#4b150d] outline-none"
                    value={paymentForm.dueDate}
                    onChange={(e) => setPaymentForm({...paymentForm, dueDate: e.target.value})}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end items-center gap-8 mt-4">
                  <button type="button" onClick={() => {
                    setShowPaymentModal(false);
                    setEditingPayment(null);
                    setPaymentForm({ tenantId: "", amount: "", paymentType: "Rent Bill", dueDate: "", status: "Unpaid", notes: "" });
                  }} className="font-[BoldMilk] text-[#4b150d] opacity-40 hover:opacity-100 uppercase text-sm tracking-widest transition-opacity">Cancel</button>
                  <button type="submit" className="bg-[#4b150d] text-white px-12 py-5 rounded-3xl font-[BoldMilk] shadow-xl hover:bg-[#330101] active:scale-95 transition-all uppercase text-sm tracking-[2px]">
                    {editingPayment ? "Update Payment" : "Post Payment"}
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex justify-center items-center p-4">
            <div className="bg-white rounded-[2rem] border-4 border-[#4b150d] p-10 max-w-sm text-center shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-200">
                  <FaTrash size={24}/>
                </div>
                <h2 className="font-[BoldMilk] text-[#4b150d] text-2xl uppercase mb-2">Delete Record?</h2>
                <p className="font-[LightMilk] text-sm text-gray-500 mb-8">This will permanently remove the record for Unit {confirmDelete.unitNumber}.</p>
                <div className="flex gap-4">
                    <button onClick={() => setConfirmDelete(null)} className="flex-1 py-4 font-[BoldMilk] text-[#4b150d] opacity-50 uppercase text-xs">No, Keep</button>
                    <button onClick={confirmDeletePayment} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-[BoldMilk] shadow-lg uppercase text-xs">Yes, Delete</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}