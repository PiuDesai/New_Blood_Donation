import { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCheck, Trash2, AlertTriangle, FlaskConical, Droplets, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../api/api";
import { getErrorMessage } from "../api/axios";
import toast from "react-hot-toast";

const typeIcon = (type, isEmergency) => {
  if (isEmergency || type === "emergency_blood_request")
    return <AlertTriangle size={16} className="text-red-600" />;
  if (type === "booking_confirmed" || type === "report_ready")
    return <FlaskConical size={16} className="text-blue-500" />;
  if (type === "blood_request_fulfilled" || type === "nearby_donor_found")
    return <Droplets size={16} className="text-emerald-500" />;
  return <Info size={16} className="text-gray-400" />;
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const fetchErrorToastShown = useRef(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications({ limit: 15 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount ?? 0);
      fetchErrorToastShown.current = false;
    } catch (err) {
      setNotifications([]);
      setUnreadCount(0);
      if (!fetchErrorToastShown.current) {
        fetchErrorToastShown.current = true;
        toast.error(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Listen for real-time foreground notifications from firebase.js
    const handleNewNotification = (e) => {
      console.log("🔔 NotificationBell: Real-time update received", e.detail);
      // Immediately add to list or just refetch
      fetchNotifications();
      
      // Optionally show a toast if not already shown by firebase.js
      // toast.success("New notification received!");
    };

    window.addEventListener('new-notification', handleNewNotification);

    const interval = setInterval(fetchNotifications, 60000); // Poll every 1 minute as fallback
    
    return () => {
      window.removeEventListener('new-notification', handleNewNotification);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      const removed = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (removed && !removed.isRead) setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
        aria-label="Notifications"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-white text-[9px] font-black">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-14 w-96 bg-white rounded-3xl shadow-2xl shadow-gray-200/80 border border-gray-100 z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
              <div>
                <h4 className="font-black text-gray-900 text-lg tracking-tight">Notifications</h4>
                {unreadCount > 0 && (
                  <p className="text-xs text-red-500 font-bold">{unreadCount} unread</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1.5 text-xs font-black text-gray-400 hover:text-emerald-600 transition-colors uppercase tracking-widest"
                  >
                    <CheckCheck size={14} />
                    All read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-gray-50 text-gray-300 hover:text-gray-600 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 border-3 border-red-100 border-t-red-500 rounded-full animate-spin" />
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Loading…</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Bell size={36} className="text-gray-200" />
                  <p className="text-sm font-bold text-gray-400">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.isRead && handleMarkRead(n._id)}
                      className={`flex gap-4 px-6 py-4 cursor-pointer transition-colors group relative ${
                        n.isRead ? "bg-white hover:bg-gray-50/50" : "bg-red-50/30 hover:bg-red-50/60"
                      } ${n.isEmergency ? "border-l-4 border-l-red-500" : ""}`}
                    >
                      <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        n.isEmergency ? "bg-red-100" : "bg-gray-100"
                      }`}>
                        {typeIcon(n.type, n.isEmergency)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-black leading-snug ${n.isRead ? "text-gray-700" : "text-gray-900"}`}>
                            {n.title}
                          </p>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-2">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>

                      <button
                        onClick={(e) => handleDelete(n._id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-100 text-gray-300 hover:text-red-500 transition-all flex-shrink-0 mt-0.5"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-50 text-center">
                <button className="text-xs font-black text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors">
                  View All Notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
