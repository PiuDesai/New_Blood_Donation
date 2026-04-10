import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTestTypes, bookBloodTest, getMyBookings } from '../../api/api';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { Input } from '../../components/Common/Input';
import { Loader2, MapPin, User, Phone, FileText, Activity, ExternalLink, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const sanitizePatientName = (value = "", { forSubmit = false } = {}) => {
  // Keep only letters and spaces so patient name can't contain numbers.
  const cleaned = String(value).replace(/[^A-Za-z\s]/g, "");
  if (!forSubmit) return cleaned.replace(/\s{2,}/g, " ");
  return cleaned.replace(/\s{2,}/g, " ").trim();
};

const HomeBloodTest = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    testType: '',
    patientName: sanitizePatientName(user?.name || '', { forSubmit: true }),
    phone: user?.phone || '',
    address: user?.location?.address || '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [testData, bookingData] = await Promise.all([
        getTestTypes(),
        getMyBookings()
      ]);
      setTests(testData.tests);
      setBookings(bookingData);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await bookBloodTest(formData);
      toast.success('Home test booked successfully!');
      setFormData({
        testType: '',
        patientName: sanitizePatientName(user?.name || '', { forSubmit: true }),
        phone: user?.phone || '',
        address: user?.location?.address || '',
      });
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Booking Form */}
        <Card className="p-6 h-fit">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FileText className="text-red-600" /> Book a Home Blood Test
          </h2>
          <form onSubmit={handleBooking} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Select Test Type</label>
              <select
                className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-red-600 outline-none"
                value={formData.testType}
                onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                required
              >
                <option value="">Choose a test...</option>
                {tests.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <Input
              label="Patient Name"
              icon={User}
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: sanitizePatientName(e.target.value) })}
              onKeyDown={(e) => {
                // Block direct number entry (keeps UX aligned with sanitized value).
                if (e.key.length === 1 && /[0-9]/.test(e.key)) e.preventDefault();
              }}
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData("text");
                setFormData((prev) => ({ ...prev, patientName: sanitizePatientName(text) }));
              }}
              inputMode="text"
              required
            />

            <Input
              label="Contact Phone"
              icon={Phone}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />

            <Input
              label="Full Address"
              icon={MapPin}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Processing...' : 'Confirm Home Booking'}
            </Button>
          </form>
        </Card>

        {/* My Bookings */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="text-blue-600" /> My Test Status
          </h2>
          {bookings.length === 0 ? (
            <p className="text-gray-400 italic">No tests booked yet.</p>
          ) : (
            bookings.map(b => (
              <Card key={b._id} className="p-5 border-l-4 border-l-red-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{b.testType}</h3>
                    <p className="text-xs text-gray-500 mb-2">{new Date(b.createdAt).toLocaleDateString()}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full font-bold uppercase text-[10px] ${
                        b.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' :
                        b.status === 'Accepted' ? 'bg-blue-100 text-blue-600' :
                        b.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {b.status}
                      </span>

                      <a 
                        href={b.mapLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold hover:bg-gray-200"
                      >
                        <ExternalLink size={10} /> View Location
                      </a>
                    </div>
                  </div>
                  
                  {b.status === 'Completed' && b.reportUrl && (
                    <a 
                      href={b.reportUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center gap-1 text-blue-600 text-xs font-bold hover:underline"
                    >
                      <Download size={14} /> Report
                    </a>
                  )}
                </div>

                {b.status === 'Accepted' && b.assignedPerson && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-[10px] uppercase font-black text-blue-600 mb-1">Technician Details</p>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-bold text-gray-800">{b.assignedPerson}</p>
                      <p className="text-sm font-bold text-blue-600">{b.assignedContact}</p>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeBloodTest;
