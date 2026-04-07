import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Eye, Trash2, Users } from "lucide-react";

import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";
import { getAllDonors, getUserDetails, removeUser } from "../../api/authAPI";
import { getErrorMessage } from "../../api/axios";

const AllDonors = () => {
  const [loading, setLoading] = useState(true);
  const [donors, setDonors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const rows = useMemo(
    () =>
      donors.map((d) => ({
        id: d._id,
        name: d.name,
        email: d.email,
        phone: d.phone,
        bloodGroup: d.bloodGroup,
        city: d.location?.city || "—",
        approved: !!d.isApproved,
        active: !!d.isActive,
        createdAt: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—",
      })),
    [donors]
  );

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await getAllDonors();
      if (!res?.success) throw new Error(res?.message || "Failed to load donors");
      setDonors(res.donors || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

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
  const ok = window.confirm("Move Donor to pending?");
  if (!ok) return;

  try {
    const res = await removeUser(id);

    if (!res?.success) throw new Error(res?.message);

    toast.success("Moved to pending approvals");

    // ✅ REMOVE FROM UI
    setBanks((prev) => prev.filter((u) => u._id !== id));

    if (selected?._id === id) setSelected(null);

  } catch (err) {
    toast.error(getErrorMessage(err));
  }
};

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">All Donors</h2>
          <p className="text-gray-500 text-sm font-bold">Manage donor accounts</p>
        </div>
        <Button variant="secondary" onClick={fetchAll} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <div className="font-black text-gray-900">Donors</div>
              <div className="text-xs font-bold text-gray-400">{rows.length} total</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400 font-bold">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-gray-400 font-bold">No donors found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-4 font-black">Name</th>
                  <th className="px-6 py-4 font-black">Email</th>
                  <th className="px-6 py-4 font-black">Blood</th>
                  <th className="px-6 py-4 font-black">City</th>
                  <th className="px-6 py-4 font-black">Status</th>
                  <th className="px-6 py-4 font-black">Created</th>
                  <th className="px-6 py-4 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/60">
                    <td className="px-6 py-4">
                      <div className="font-black text-gray-900">{r.name}</div>
                      <div className="text-xs font-bold text-gray-400">{r.phone}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700">{r.email}</td>
                    <td className="px-6 py-4 font-black text-gray-900">{r.bloodGroup}</td>
                    <td className="px-6 py-4 font-bold text-gray-700">{r.city}</td>
                    <td className="px-6 py-4">
                      <span
                        className={[
                          "inline-flex items-center px-3 py-1 rounded-full text-xs font-black",
                          r.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500",
                        ].join(" ")}
                      >
                        {r.active ? "Active" : "Inactive"}
                      </span>
                      <span
                        className={[
                          "ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-black",
                          r.approved ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700",
                        ].join(" ")}
                      >
                        {r.approved ? "Approved" : "Pending"}
                      </span>
                    </td>
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
                          onClick={() => handleRemove(r.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600 text-white font-black hover:bg-red-700 disabled:opacity-50"
                          disabled={!r.active}
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
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Profile</div>
              <div className="mt-2 font-black text-gray-900">Blood: {selected.bloodGroup}</div>
              <div className="mt-1 font-bold text-gray-700">City: {selected.location?.city || "—"}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AllDonors;

