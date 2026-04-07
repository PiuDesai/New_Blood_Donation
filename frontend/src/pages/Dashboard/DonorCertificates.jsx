import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyCampRegistrations, getCampCertificateData } from "../../api/api";
import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";
import { ArrowLeft, Award, Loader2, Printer } from "lucide-react";
import toast from "react-hot-toast";
import { dashboardPath } from "../../utils/rolePaths";

const DonorCertificates = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyCampRegistrations();
        setRows(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Could not load certificates");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const completed = rows.filter((r) => r.participation?.status === "completed");

  const openCert = async (campId) => {
    try {
      const data = await getCampCertificateData(campId);
      setPreview(data);
    } catch {
      toast.error("Certificate not available yet");
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <Button
        onClick={() => navigate(dashboardPath("donor"))}
        variant="ghost"
        className="flex items-center gap-2 text-gray-400 hover:text-red-600 font-black uppercase text-xs tracking-widest"
      >
        <ArrowLeft size={16} /> Back
      </Button>

      <Card variant="glass" className="p-10 border-none shadow-2xl shadow-gray-100/50">
        <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-2 flex items-center gap-3">
          <Award className="text-amber-500" size={32} /> Camp donation certificates
        </h3>
        <p className="text-gray-500 font-bold text-sm mb-10">
          Issued after you confirm a camp donation recorded by the blood bank.
        </p>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin w-10 h-10 text-red-600" />
          </div>
        ) : completed.length === 0 ? (
          <p className="text-gray-400 font-bold text-center py-16">No certificates yet. Complete a camp donation to receive one.</p>
        ) : (
          <div className="space-y-4">
            {completed.map(({ camp, participation }) => (
              <div
                key={camp._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-3xl bg-white border border-gray-100 gap-4"
              >
                <div>
                  <p className="font-black text-gray-900 text-lg">{camp.name}</p>
                  <p className="text-xs text-gray-500 font-bold">
                    {new Date(camp.date).toLocaleDateString()} · Code {participation.certificateCode}
                  </p>
                </div>
                <Button className="bg-red-600 h-11 text-xs" onClick={() => openCert(camp._id)}>
                  View / print
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-10 shadow-2xl print:shadow-none print:max-w-none">
            <div id="certificate-print" className="text-center space-y-6 border-4 border-red-100 p-8 rounded-2xl">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-red-600">Certificate of donation</p>
              <h2 className="text-2xl font-black text-gray-900">{preview.donorName}</h2>
              <p className="text-gray-600 font-bold text-sm">
                Donated blood group <span className="text-red-600">{preview.bloodGroup}</span> at camp
              </p>
              <p className="text-xl font-black text-gray-900">{preview.campName}</p>
              <p className="text-sm text-gray-500 font-bold">
                {preview.campLocation} · {preview.campDate && new Date(preview.campDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">Organized by {preview.bloodBankName || "Blood bank"}</p>
              <p className="text-xs text-gray-400 font-mono">{preview.certificateCode}</p>
              <p className="text-xs text-gray-400">
                Issued {preview.issuedAt && new Date(preview.issuedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-3 mt-8 print:hidden">
              <Button variant="outline" className="flex-1" onClick={() => setPreview(null)}>
                Close
              </Button>
              <Button
                className="flex-1 bg-red-600 gap-2"
                onClick={() => window.print()}
              >
                <Printer size={18} /> Print
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorCertificates;
