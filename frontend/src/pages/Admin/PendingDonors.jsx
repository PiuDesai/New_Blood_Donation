import { useEffect, useState } from "react";
import { getPendingDonors, approveDonor } from "../../api/authAPI";

const PendingDonors = () => {
  const [donors, setDonors] = useState([]);

  const fetchDonors = async () => {
    const res = await getPendingDonors();
    if (res.success) {
      setDonors(res.donors);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleApprove = async (id) => {
    await approveDonor(id);
    fetchDonors(); // refresh list
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Pending Donors</h2>

      {donors.length === 0 ? (
        <p>No pending donors</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th>Name</th>
              <th>Email</th>
              <th>Blood</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {donors.map((d) => (
              <tr key={d._id} className="text-center border-t">
                <td>{d.name}</td>
                <td>{d.email}</td>
                <td>{d.bloodGroup}</td>

                <td>
                  <button
                    onClick={() => handleApprove(d._id)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Accept
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PendingDonors;