import { useState, useEffect } from "react";
import { getDonorsNearby } from "../../api/api";
import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";
import { Loader2, Users, Phone, Mail, MapPin, Droplets, Filter } from "lucide-react";
import toast from "react-hot-toast";

const GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const BloodBankNearbyDonors = () => {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await getDonorsNearby(filterGroup || undefined);
      setPayload(data);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.userMessage || "Could not load donors";
      toast.error(msg);
      setPayload(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filterGroup]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Users className="text-blue-600 w-8 h-8" /> Donors in your area
          </h1>
          <p className="text-gray-500 font-bold text-sm mt-2 max-w-xl">
            Approved donors whose profile city or pincode matches your blood bank. Use phone or email to
            reach out when you need donors for drives or emergencies.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-2xl">
          <Filter className="w-4 h-4 text-gray-400 ml-2" />
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="bg-transparent text-sm font-bold text-gray-700 py-2 pr-8 pl-1 outline-none cursor-pointer"
          >
            <option value="">All blood groups</option>
            {GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {payload && (payload.city || payload.pincode) && (
        <p className="text-xs font-black uppercase tracking-widest text-blue-600">
          Matching by {payload.matchedBy}: {payload.city || payload.pincode} · {payload.count} donor
          {payload.count !== 1 ? "s" : ""}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
        </div>
      ) : !payload?.donors?.length ? (
        <Card className="p-12 text-center border-dashed border-2 border-gray-200">
          <p className="text-gray-500 font-bold">
            No donors found. Ensure your bank profile includes the same <strong>city</strong> or{" "}
            <strong>pincode</strong> as donors, and that donors are approved by admin.
          </p>
          <Button variant="outline" className="mt-6" onClick={load}>
            Refresh
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {payload.donors.map((d) => (
            <Card key={d._id} className="p-6 flex flex-col gap-4 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-lg font-black text-gray-900">{d.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-red-600 font-black text-sm">
                    <Droplets className="w-4 h-4" /> {d.bloodGroup}
                  </div>
                </div>
              </div>
              {d.location?.city && (
                <p className="text-xs text-gray-500 font-bold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {[d.location.city, d.location.state, d.location.pincode].filter(Boolean).join(" · ")}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-auto pt-2">
                {d.phone && (
                  <a href={`tel:${d.phone}`}>
                    <Button type="button" className="h-10 text-xs bg-blue-600 gap-2">
                      <Phone className="w-4 h-4" /> Call
                    </Button>
                  </a>
                )}
                {d.email && (
                  <a href={`mailto:${d.email}`}>
                    <Button type="button" variant="outline" className="h-10 text-xs gap-2">
                      <Mail className="w-4 h-4" /> Email
                    </Button>
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BloodBankNearbyDonors;
