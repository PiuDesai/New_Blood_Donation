import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Eye, CheckCircle2, Trash2, HeartPulse } from "lucide-react";

import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";
import { getErrorMessage } from "../../api/axios";
import { getPendingBloodBanks, approveBloodBank, getUserDetails, removeUser } from "../../api/authAPI";

const PendingBloodBanks = () => {
  const [loading, setLoading] = useState(true);
  const [banks, setBanks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const res = await getPendingBloodBanks();
      if (res.success) setBanks(res.bloodbanks || []);
      else throw new Error(res?.message || "Failed to load blood banks");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await approveBloodBank(id);
      if (!res?.success) throw new Error(res?.message || "Approve failed");
      toast.success("Blood bank approved");
      fetchBanks();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleView = async (id) => {
    setDetailsLoading(true);
    try {
      const res = await getUserDetails(id);
      if (!res?.success) throw new Error(res?.message || "Failed to load user details");
      setSelected(res.user);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleRemove = async (id) => {
    const ok = window.confirm("Deactivate this blood bank?");
    if (!ok) return;
    try {
      const res = await removeUser(id);
      if (!res?.success) throw new Error(res?.message || "Remove failed");
      toast.success("Blood bank deactivated");
      fetchBanks();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const rows = useMemo(
    () =>
      banks.map((b) => ({
        id: b._id,
        name: b.name,
        email: b.email,
        phone: b.phone,
        city: b.location?.city || "—",
        licenseInfo: b.licenseInfo || "—",
        createdAt: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—",
      })),
    [banks]
  );

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Pending Blood Banks</h2>
          <p className="text-gray-500 text-sm font-bold">Approve or manage blood bank requests</p>
        </div>
        <Button variant="secondary" onClick={fetchBanks} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <HeartPulse size={18} />
            </div>
            <div>
              <div className="font-black text-gray-900">Blood Bank Requests</div>
              <div className="text-xs font-bold text-gray-400">{rows.length} pending</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400 font-bold">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-gray-400 font-bold">No pending blood banks</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-4 font-black">Name</th>
                  <th className="px-6 py-4 font-black">Email</th>
                  <th className="px-6 py-4 font-black">Phone</th>
                  <th className="px-6 py-4 font-black">City</th>
                  <th className="px-6 py-4 font-black">Created</th>
                  <th className="px-6 py-4 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/60">
                    <td className="px-6 py-4">
                      <div className="font-black text-gray-900">{r.name}</div>
                      <div className="text-xs font-bold text-gray-400">{r.licenseInfo}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700">{r.email}</td>
                    <td className="px-6 py-4 font-bold text-gray-700">{r.phone}</td>
                    <td className="px-6 py-4 font-bold text-gray-700">{r.city}</td>
                    <td className="px-6 py-4 font-bold text-gray-700">{r.createdAt}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(r.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 font-black hover:bg-gray-50"
                          disabled={detailsLoading}
                        >
                          <Eye size={16} />
                          View
                        </button>
                        <button
                          onClick={() => handleApprove(r.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-green-600 text-white font-black hover:bg-green-700"
                        >
                          <CheckCircle2 size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRemove(r.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600 text-white font-black hover:bg-red-700"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selected && (
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-black tracking-tight">View Details</h3>
              <p className="text-gray-500 text-sm font-bold">{selected.name}</p>
            </div>
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Close
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Contact</div>
              <div className="mt-2 font-black text-gray-900">{selected.email}</div>
              <div className="mt-1 font-bold text-gray-700">{selected.phone}</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Location</div>
              <div className="mt-2 font-black text-gray-900">City: {selected.location?.city || "—"}</div>
              <div className="mt-1 font-bold text-gray-700">State: {selected.location?.state || "—"}</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 md:col-span-2">
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest">License</div>
              <div className="mt-2 font-bold text-gray-700 break-words">{selected.licenseInfo || "—"}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PendingBloodBanks;