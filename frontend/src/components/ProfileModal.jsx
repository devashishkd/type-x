import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

const ProfileModal = ({ onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/me');
        setProfile(data.user);
      } catch (err) {
        toast.error('Failed to load profile stats');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {profile.username[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{profile.username}</h2>
              <p className="text-sm text-gray-400">Player Profile & Stats</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading stats...</div>
        ) : (
          <div className="p-6 grid md:grid-cols-2 gap-6">
            
            {/* 1v1 Stats */}
            <div className="bg-[#111827] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <h3 className="text-white font-semibold tracking-wide">1v1 MATCHES</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">AVG WPM</p>
                  <p className="text-2xl font-bold text-cyan-400">{profile.stats1v1?.avgWpm || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">ACCURACY</p>
                  <p className="text-2xl font-bold text-white">{profile.stats1v1?.avgAccuracy || 0}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">BEST WPM</p>
                  <p className="text-lg font-semibold text-gray-300">{profile.stats1v1?.bestWpm || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">GAMES / WINS</p>
                  <p className="text-lg font-semibold text-gray-300">{profile.stats1v1?.gamesPlayed || 0} / {profile.stats1v1?.wins || 0}</p>
                </div>
              </div>
            </div>

            {/* Multiplayer Stats */}
            <div className="bg-[#111827] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                <h3 className="text-white font-semibold tracking-wide">MULTIPLAYER</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">AVG WPM</p>
                  <p className="text-2xl font-bold text-violet-400">{profile.statsMultiplayer?.avgWpm || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">ACCURACY</p>
                  <p className="text-2xl font-bold text-white">{profile.statsMultiplayer?.avgAccuracy || 0}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">BEST WPM</p>
                  <p className="text-lg font-semibold text-gray-300">{profile.statsMultiplayer?.bestWpm || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">GAMES / WINS</p>
                  <p className="text-lg font-semibold text-gray-300">{profile.statsMultiplayer?.gamesPlayed || 0} / {profile.statsMultiplayer?.wins || 0}</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
