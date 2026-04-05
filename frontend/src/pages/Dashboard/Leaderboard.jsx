import { useState, useEffect } from 'react';
import { getLeaderboard } from '../../api/api';
import { Card } from "../../components/Common/Card";
import { StarRating } from "../../components/Common/RatingComponent";
import { Loader2, Trophy, Medal, Star, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const getBadge = (points) => {
  if (points >= 100) return { name: 'Gold', color: 'bg-yellow-100 text-yellow-600 border-yellow-200' };
  if (points >= 50) return { name: 'Silver', color: 'bg-gray-100 text-gray-600 border-gray-200' };
  return { name: 'Bronze', color: 'bg-amber-100 text-amber-600 border-amber-200' };
};

const Leaderboard = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getLeaderboard();
      setDonors(data);
    } catch (err) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10">
      <div className="text-center">
        <h1 className="text-4xl font-black text-gray-900 flex items-center justify-center gap-3">
          <Trophy className="text-yellow-500 w-10 h-10" /> Top Life Savers
        </h1>
        <p className="text-gray-500 mt-2 font-medium">Ranked by points earned through donations</p>
      </div>

      <div className="space-y-4">
        {donors.map((donor, index) => {
          const badge = getBadge(donor.points);
          return (
            <Card key={donor._id} className={`p-5 flex items-center justify-between border-l-4 transition-transform hover:scale-[1.01] ${
              index === 0 ? 'border-yellow-400 bg-yellow-50/30' :
              index === 1 ? 'border-gray-300 bg-gray-50/30' :
              index === 2 ? 'border-amber-600 bg-amber-50/30' : 'border-red-100'
            }`}>
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 flex items-center justify-center font-black text-2xl text-gray-400 shrink-0">
                  {index === 0 ? <Medal className="text-yellow-500 w-10 h-10" /> :
                   index === 1 ? <Medal className="text-gray-400 w-10 h-10" /> :
                   index === 2 ? <Medal className="text-amber-600 w-10 h-10" /> : index + 1}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-xl text-gray-900">{donor.name}</h3>
                    <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase border ${badge.color}`}>
                      {badge.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <StarRating rating={donor.rating || 0} count={donor.reviews?.length || 0} />
                    <span className="text-xs text-gray-400 font-bold uppercase flex items-center gap-1">
                      <Award size={12} className="text-red-600" /> {donor.donorInfo?.donationCount || 0} Donations
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1 text-red-600 font-black text-3xl">
                  <Star className="fill-red-600 w-6 h-6" /> {donor.points}
                </div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Points</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;
