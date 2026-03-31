import { useEffect, useState } from "react";
import { getPendingBloodBanks, approveBloodBank } from "../../api/authAPI";

const PendingBloodBanks = () => {
  const [banks, setBanks] = useState([]);

  const fetchBanks = async () => {
    const res = await getPendingBloodBanks();
    if (res.success) {
      setBanks(res.bloodbanks);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleApprove = async (id) => {
    await approveBloodBank(id);
    fetchBanks();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Pending Blood Banks</h2>

      {banks.length === 0 ? (
        <p>No pending blood banks</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {banks.map((b) => (
              <tr key={b._id} className="text-center border-t">
                <td>{b.name}</td>
                <td>{b.email}</td>
                <td>{b.phone}</td>

                <td>
                  <button
                    onClick={() => handleApprove(b._id)}
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

export default PendingBloodBanks;