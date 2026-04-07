import { useState, useEffect } from 'react';
import { getAllTestBookings, acceptTestBooking, rejectTestBooking, uploadTestReport } from '../../api/api';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { Input } from '../../components/Common/Input';
import { Loader2, User, Phone, MapPin, ClipboardList, Upload, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const BloodBankBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending');
  const [showAcceptModal, setShowAcceptModal] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(null);

  const [acceptForm, setAcceptForm] = useState({ technician: '', contact: '' });
  const [reportUrl, setReportUrl] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllTestBookings(activeTab);
      setBookings(data);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      await acceptTestBooking({
        bookingId: showAcceptModal,
        assignedPerson: acceptForm.technician,
        assignedContact: acceptForm.contact
      });
      toast.success('Booking accepted!');
      setShowAcceptModal(null);
      setAcceptForm({ technician: '', contact: '' });
      fetchData();
    } catch (err) {
      toast.error('Failed to accept booking');
    }
  };

  const handleReject = async (bookingId) => {
    if (!window.confirm("Are you sure you want to reject this request?")) return;
    try {
      await rejectTestBooking({ bookingId });
      toast.success('Booking rejected');
      fetchData();
    } catch (err) {
      toast.error('Failed to reject booking');
    }
  };

  const handleUpload = async () => {
    try {
      await uploadTestReport({
        bookingId: showUploadModal,
        reportUrl: reportUrl
      });
      toast.success('Report uploaded!');
      setShowUploadModal(null);
      setReportUrl('');
      fetchData();
    } catch (err) {
      toast.error('Failed to upload report');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <ClipboardList className="text-red-600 w-8 h-8" /> Home Test Requests
        </h1>
        
        <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl overflow-x-auto max-w-full">
          {['Pending', 'Accepted', 'Rejected', 'Completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>
      ) : bookings.length === 0 ? (
        <div className="text-center p-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-bold italic">No {activeTab.toLowerCase()} requests found.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map(booking => (
            <Card key={booking._id} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase px-2 py-1 bg-red-50 text-red-600 rounded-md">
                  {booking.testType}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 leading-none">{booking.patientName}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{booking.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <MapPin size={16} className="text-red-600 mt-1 flex-shrink-0" />
                  <div className="flex-grow">
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{booking.address}</p>
                    <a 
                      href={booking.mapLink} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase hover:underline"
                    >
                      <ExternalLink size={12} /> View on Map
                    </a>
                  </div>
                </div>
              </div>

              {activeTab === 'Pending' && (
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => setShowAcceptModal(booking._id)} className="flex-1 text-[10px] py-2 uppercase font-black">
                    Accept
                  </Button>
                  <Button 
                    onClick={() => handleReject(booking._id)} 
                    variant="outline" 
                    className="flex-1 text-[10px] py-2 uppercase font-black border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Reject
                  </Button>
                </div>
              )}

              {activeTab === 'Accepted' && (
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-[9px] font-black text-blue-600 uppercase mb-1">Assigned Technician</p>
                    <p className="text-xs font-bold text-gray-800">{booking.assignedPerson} ({booking.assignedContact})</p>
                  </div>
                  <Button onClick={() => setShowUploadModal(booking._id)} variant="outline" className="w-full text-[10px] py-2 uppercase font-black border-blue-200 text-blue-600 hover:bg-blue-50">
                    Upload Report
                  </Button>
                </div>
              )}

              {activeTab === 'Rejected' && (
                <div className="flex items-center gap-2 text-red-600 font-black text-[10px] bg-red-50 p-2 rounded-lg justify-center uppercase">
                  <XCircle size={14} /> Request Rejected
                </div>
              )}

              {activeTab === 'Completed' && (
                <div className="flex items-center gap-2 text-green-600 font-black text-[10px] bg-green-50 p-2 rounded-lg justify-center uppercase">
                  <CheckCircle2 size={14} /> Test Completed
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Accept Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <Card className="max-w-md w-full p-8 space-y-6 shadow-2xl border-0">
            <div>
              <h3 className="text-2xl font-black text-gray-900">Accept Request</h3>
              <p className="text-xs text-gray-400 font-bold uppercase mt-1">Assign a technician for home visit</p>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Technician Name"
                placeholder="e.g. John Smith"
                value={acceptForm.technician}
                onChange={e => setAcceptForm({...acceptForm, technician: e.target.value})}
              />
              <Input
                label="Technician Contact"
                placeholder="e.g. 9876543210"
                value={acceptForm.contact}
                onChange={e => setAcceptForm({...acceptForm, contact: e.target.value})}
              />
              <div className="flex gap-4 pt-2">
                <Button onClick={() => setShowAcceptModal(null)} variant="outline" className="flex-1 uppercase font-black text-[10px]">Cancel</Button>
                <Button onClick={handleAccept} className="flex-1 uppercase font-black text-[10px]">Accept Request</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <Card className="max-w-md w-full p-8 space-y-6 shadow-2xl border-0">
            <div>
              <h3 className="text-2xl font-black text-gray-900">Deliver Report</h3>
              <p className="text-xs text-gray-400 font-bold uppercase mt-1">Upload PDF or report link</p>
            </div>

            <div className="space-y-4">
              <Input
                label="Report URL / Drive Link"
                placeholder="https://drive.google.com/..."
                icon={Upload}
                value={reportUrl}
                onChange={e => setReportUrl(e.target.value)}
              />
              <div className="flex gap-4 pt-2">
                <Button onClick={() => setShowUploadModal(null)} variant="outline" className="flex-1 uppercase font-black text-[10px]">Cancel</Button>
                <Button onClick={handleUpload} className="flex-1 uppercase font-black text-[10px]">Complete Test</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BloodBankBookings;
