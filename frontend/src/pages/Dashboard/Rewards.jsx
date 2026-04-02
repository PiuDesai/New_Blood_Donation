import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getRewardsList, claimReward, getMyRewards } from '../../api/api';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { Loader2, Gift, Star, Award, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Rewards = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rewardData, claimData] = await Promise.all([
        getRewardsList(),
        getMyRewards()
      ]);
      setRewards(rewardData);
      setClaims(claimData);
    } catch (err) {
      toast.error('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (rewardId) => {
    setClaiming(rewardId);
    try {
      await claimReward(rewardId);
      toast.success('Reward claimed successfully!');
      fetchData(); // Refresh list
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Claim failed');
    } finally {
      setClaiming(null);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-red-600 p-8 rounded-3xl text-white shadow-xl overflow-hidden relative">
        <div className="z-10">
          <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
            <Gift className="w-10 h-10" /> Reward Store
          </h1>
          <p className="text-red-100 font-bold opacity-80 uppercase tracking-widest text-xs">
            Redeem your life-saving points for health services
          </p>
        </div>
        
        <div className="z-10 bg-white/20 backdrop-blur-md p-4 px-8 rounded-2xl flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-widest opacity-80">Available Points</span>
          <div className="flex items-center gap-2 text-4xl font-black">
            <Star className="fill-white w-8 h-8" /> {user?.points || 0}
          </div>
        </div>

        {/* Abstract design elements */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-red-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map(reward => {
          const isAffordable = user?.points >= reward.requiredPoints;
          const isClaimed = claims.some(c => c.reward._id === reward._id);

          return (
            <Card key={reward._id} className="p-6 relative group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${
                  reward.type === 'test' ? 'bg-blue-100 text-blue-600' :
                  reward.type === 'discount' ? 'bg-green-100 text-green-600' :
                  'bg-amber-100 text-amber-600'
                }`}>
                  <Award className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 font-black text-red-600">
                    <Star className="w-4 h-4 fill-red-600" /> {reward.requiredPoints}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Required</span>
                </div>
              </div>

              <h3 className="text-lg font-black text-gray-900 mb-2">{reward.title}</h3>
              <p className="text-sm text-gray-500 mb-6 flex-grow">{reward.description}</p>

              {isClaimed ? (
                <div className="w-full py-3 bg-green-50 text-green-600 font-bold rounded-2xl flex items-center justify-center gap-2 border-2 border-green-100">
                  <CheckCircle2 className="w-5 h-5" /> Claimed
                </div>
              ) : (
                <Button 
                  onClick={() => handleClaim(reward._id)}
                  disabled={!isAffordable || claiming === reward._id}
                  variant={isAffordable ? 'primary' : 'outline'}
                  className="w-full mt-auto"
                >
                  {claiming === reward._id ? 'Redeeming...' : 
                   isAffordable ? 'Redeem Reward' : `Need ${reward.requiredPoints - (user?.points || 0)} more pts`}
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      {claims.length > 0 && (
        <div className="mt-16 space-y-6">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <Gift className="text-red-600" /> My Redeemed Rewards
          </h2>
          <div className="grid gap-4">
            {claims.map(claim => (
              <Card key={claim._id} className="p-4 flex items-center justify-between border-l-4 border-l-green-500">
                <div>
                  <h4 className="font-bold text-gray-900">{claim.reward.title}</h4>
                  <p className="text-xs text-gray-500">Redeemed on {new Date(claim.claimedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    claim.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {claim.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;
