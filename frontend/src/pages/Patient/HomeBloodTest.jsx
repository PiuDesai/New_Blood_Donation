import { useState, useEffect } from "react";
import { FlaskConical, ArrowLeft, Calendar, Clock, MapPin, Home, Building2, CheckCircle2, Loader2, X, FileText, Phone, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Navigate } from "react-router-dom";
import { dashboardPath } from "../../utils/rolePaths";
import { useAuth } from "../../context/AuthContext";
import { bookBloodTest, getMyBookings, cancelBooking, getTestTypes } from "../../api/api";
import { getErrorMessage } from "../../api/axios";
import { Button } from "../../components/Common/Button";
import { Card } from "../../components/Common/Card";
import toast from "react-hot-toast";

const STATUS_STYLES = {
  pending:          "bg-amber-50 text-amber-600",
  confirmed:        "bg-blue-50 text-blue-600",
  sample_collected: "bg-indigo-50 text-indigo-600",
  processing:       "bg-purple-50 text-purple-600",
  report_ready:     "bg-emerald-50 text-emerald-600",
  cancelled:        "bg-gray-100 text-gray-400",
};

const STATUS_LABEL = {
  pending:          "Pending",
  confirmed:        "Confirmed",
  sample_collected: "Sample Collected",
  processing:       "Processing",
  report_ready:     "Report Ready",
  cancelled:        "Cancelled",
};

const TIME_SLOTS = [
  "6:00 AM - 8:00 AM",
  "8:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
];

const HomeBloodTest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("book"); // 'book' | 'history'
  const [testTypes, setTestTypes] = useState([]);
  const [testsLoading, setTestsLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    testType: "",
    preferredDate: "",
    preferredTimeSlot: "8:00 AM - 10:00 AM",
    collectionType: "home_collection",
    address: user?.location?.address || "",
    patientName: user?.name || "",
    patientAge: "",
    contactPhone: user?.phone || "",
    notes: "",
  });

  const selectedTest = testTypes.find((t) => t.name === form.testType) || testTypes[0];

  useEffect(() => {
    setTestsLoading(true);
    getTestTypes()
      .then((data) => {
        if (data.tests?.length) {
          setTestTypes(data.tests);
          setForm((f) => ({ ...f, testType: f.testType || data.tests[0].name }));
        }
      })
      .catch((err) => {
        toast.error(getErrorMessage(err));
      })
      .finally(() => setTestsLoading(false));
  }, []);

  // Fetch booking history when tab switches
  useEffect(() => {
    if (tab !== "history") return;
    setLoadingHistory(true);
    getMyBookings()
      .then((data) => setBookings(data.bookings || []))
      .catch((err) => {
        toast.error(getErrorMessage(err));
        setBookings([]);
      })
      .finally(() => setLoadingHistory(false));
  }, [tab]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.testType || testTypes.length === 0) return toast.error("Test types could not be loaded. Refresh the page.");
    if (!form.preferredDate) return toast.error("Please select a preferred date");
    if (!form.patientName) return toast.error("Patient name is required");
    if (!form.patientAge) return toast.error("Patient age is required");
    if (!form.contactPhone) return toast.error("Contact phone is required");
    if (form.collectionType === "home_collection" && !form.address)
      return toast.error("Address is required for home collection");

    setSubmitting(true);
    try {
      await bookBloodTest({
        ...form,
        patientAge: Number(form.patientAge),
      });
      setShowSuccess(true);
      setForm((f) => ({ ...f, preferredDate: "", notes: "" }));
      setTimeout(() => setShowSuccess(false), 4000);
      toast.success("Blood test booked successfully! 🧪");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    setCancellingId(id);
    try {
      await cancelBooking(id);
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b))
      );
      toast.success("Booking cancelled");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  };

  if (user && String(user.role).toLowerCase() !== "patient") {
    return <Navigate to={dashboardPath(user.role)} replace />;
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Back */}
      <Button
        onClick={() => navigate(dashboardPath("patient"))}
        variant="ghost"
        className="flex items-center gap-2 text-gray-400 hover:text-red-600 font-black uppercase text-xs tracking-widest"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Button>

      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-100">
            <FlaskConical size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Home Blood Tests</h1>
            <p className="text-gray-400 font-bold">Book a test · Sample collected at your doorstep</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-3">
        {["book", "history"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
              tab === t
                ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                : "bg-gray-50 text-gray-400 hover:bg-gray-100"
            }`}
          >
            {t === "book" ? "Book a Test" : "My Bookings"}
          </button>
        ))}
      </div>

      {/* ─── BOOK TAB ─── */}
      <AnimatePresence mode="wait">
        {tab === "book" && (
          <motion.div
            key="book"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 text-emerald-700 p-6 rounded-3xl mb-6 shadow-sm"
              >
                <CheckCircle2 size={28} className="flex-shrink-0" />
                <div>
                  <p className="font-black text-lg">Booking Confirmed!</p>
                  <p className="text-sm font-bold text-emerald-600">Our technician will call you to confirm the appointment.</p>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
                  <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Test Details</h3>

                  {/* Test Type */}
                  <div className="space-y-2 mb-6">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Select Test</label>
                    <select
                      value={form.testType}
                      onChange={set("testType")}
                      disabled={testsLoading || testTypes.length === 0}
                      className="w-full h-14 bg-gray-50 rounded-2xl px-6 font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 outline-none transition-all disabled:opacity-60"
                    >
                      {testTypes.map((t) => (
                        <option key={t.name} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Collection Type */}
                  <div className="space-y-2 mb-6">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Collection Type</label>
                    <div className="flex gap-4">
                      {[
                        { value: "home_collection", label: "Home Collection", icon: Home },
                        { value: "lab_visit", label: "Visit Lab", icon: Building2 },
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, collectionType: value }))}
                          className={`flex-1 flex items-center justify-center gap-3 h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                            form.collectionType === value
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                              : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                          }`}
                        >
                          <Icon size={16} /> {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date + Time Slot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                        <Calendar size={12} /> Preferred Date
                      </label>
                      <input
                        type="date"
                        min={today}
                        value={form.preferredDate}
                        onChange={set("preferredDate")}
                        className="w-full h-14 bg-gray-50 rounded-2xl px-6 font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                        <Clock size={12} /> Time Slot
                      </label>
                      <select
                        value={form.preferredTimeSlot}
                        onChange={set("preferredTimeSlot")}
                        className="w-full h-14 bg-gray-50 rounded-2xl px-6 font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      >
                        {TIME_SLOTS.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Address (home collection only) */}
                  {form.collectionType === "home_collection" && (
                    <div className="space-y-2 mb-6">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                        <MapPin size={12} /> Collection Address
                      </label>
                      <textarea
                        value={form.address}
                        onChange={set("address")}
                        placeholder="Flat No., Building, Street, City, Pincode"
                        className="w-full h-24 bg-gray-50 rounded-2xl p-6 font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none"
                      />
                    </div>
                  )}
                </Card>

                {/* Patient Info */}
                <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
                  <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Patient Information</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                        <User size={12} /> Patient Name
                      </label>
                      <input
                        type="text"
                        value={form.patientName}
                        onChange={set("patientName")}
                        placeholder="Full name"
                        className="w-full h-14 bg-gray-50 rounded-2xl px-6 font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Age</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={form.patientAge}
                        onChange={set("patientAge")}
                        placeholder="e.g. 32"
                        className="w-full h-14 bg-gray-50 rounded-2xl px-6 font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                      <Phone size={12} /> Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={form.contactPhone}
                      onChange={set("contactPhone")}
                      placeholder="10-digit mobile number"
                      className="w-full h-14 bg-gray-50 rounded-2xl px-6 font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Special Notes (optional)</label>
                    <textarea
                      value={form.notes}
                      onChange={set("notes")}
                      placeholder="Any fasting instructions, medical history, or special requests..."
                      className="w-full h-20 bg-gray-50 rounded-2xl p-6 font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none"
                    />
                  </div>
                </Card>
              </div>

              {/* Summary Card */}
              <div className="space-y-6">
                <Card variant="glass" className="p-8 border-none shadow-2xl shadow-blue-100/40 sticky top-28">
                  <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tight">Booking Summary</h3>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400 font-bold">Test</span>
                      <span className="font-black text-gray-900 text-right max-w-[55%] leading-snug">{form.testType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400 font-bold">Collection</span>
                      <span className="font-black text-gray-900">
                        {form.collectionType === "home_collection" ? "Home" : "Lab Visit"}
                      </span>
                    </div>
                    {form.preferredDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400 font-bold">Date</span>
                        <span className="font-black text-gray-900">{form.preferredDate}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400 font-bold">Slot</span>
                      <span className="font-black text-gray-900 text-right text-xs">{form.preferredTimeSlot}</span>
                    </div>
                    <div className="border-t border-gray-50 pt-4 flex justify-between">
                      <span className="font-black text-gray-900">Total</span>
                      <span className="font-black text-blue-600 text-xl">₹{selectedTest?.price ?? 0}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || testsLoading || testTypes.length === 0}
                    className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <><Loader2 size={18} className="animate-spin" /> Booking…</>
                    ) : (
                      <><FlaskConical size={18} /> Confirm Booking</>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-4">
                    Free home collection · Reports in 24hrs
                  </p>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── HISTORY TAB ─── */}
        {tab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
              <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">My Bookings</h3>

              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading bookings…</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                  <FlaskConical size={48} className="text-gray-200" />
                  <p className="font-black text-xl text-gray-300">No bookings yet</p>
                  <p className="text-gray-400 font-bold text-sm">Book your first home blood test above.</p>
                  <Button onClick={() => setTab("book")} className="bg-blue-600 mt-2">Book a Test</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {bookings.map((booking, i) => (
                    <motion.div
                      key={booking._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-8 rounded-[2.5rem] bg-white border border-gray-50 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50/50 transition-all gap-6"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-xl shadow-blue-50 flex-shrink-0">
                          <FlaskConical size={26} />
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-lg leading-tight">{booking.testType}</p>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1.5">
                              <Calendar size={12} />
                              {new Date(booking.preferredDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock size={12} /> {booking.preferredTimeSlot}
                            </span>
                            <span className="flex items-center gap-1.5">
                              {booking.collectionType === "home_collection" ? <Home size={12} /> : <Building2 size={12} />}
                              {booking.collectionType === "home_collection" ? "Home" : "Lab Visit"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest ${STATUS_STYLES[booking.status] || "bg-gray-100 text-gray-500"}`}>
                          {STATUS_LABEL[booking.status] || booking.status}
                        </span>

                        {booking.status === "report_ready" && booking.reportUrl && (
                          <a
                            href={booking.reportUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-all"
                          >
                            <FileText size={14} /> Report
                          </a>
                        )}

                        {["pending", "confirmed"].includes(booking.status) && (
                          <button
                            onClick={() => handleCancel(booking._id)}
                            disabled={cancellingId === booking._id}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-50 text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all disabled:opacity-50"
                          >
                            {cancellingId === booking._id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <X size={13} />
                            )}
                            Cancel
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeBloodTest;
