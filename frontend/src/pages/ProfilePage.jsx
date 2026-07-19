import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const ProfilePage = () => {
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

  if (!profile && !loading) {
    return (
      <div className="min-h-screen bg-[#090d16]">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <p className="text-gray-500 font-mono">Failed to load profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16]">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
          
          {/* Header */}
          <div className="flex items-center p-8 border-b border-gray-800 bg-gray-900/50">
            <div className="flex items-center gap-6">
              {profile ? (
                <div className="w-20 h-20 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-lg shadow-violet-900/50">
                  {profile.username[0].toUpperCase()}
                </div>
              ) : (
                <div className="w-20 h-20 bg-gray-800 rounded-full animate-pulse"></div>
              )}
              
              <div>
                {loading ? (
                  <div className="h-8 w-48 bg-gray-800 rounded animate-pulse mb-2"></div>
                ) : (
                  <h2 className="text-3xl font-bold text-white">{profile.username}</h2>
                )}
                <p className="text-sm text-gray-400 font-mono mt-1">Player Profile & Lifetime Stats</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-20 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500 mx-auto"></div>
            </div>
          ) : (
            <div className="p-8 grid md:grid-cols-2 gap-8 bg-[#090d16]/30">
              
              {/* 1v1 Stats */}
              <div className="bg-[#111827] border border-white/5 rounded-xl p-6 hover:border-cyan-500/30 transition-colors shadow-lg">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                  <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></span>
                  <h3 className="text-white font-bold tracking-wider text-lg">1v1 MATCHES</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1 tracking-widest">AVG WPM</p>
                    <p className="text-4xl font-bold text-cyan-400 font-mono">{profile.stats1v1?.avgWpm || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1 tracking-widest">ACCURACY</p>
                    <p className="text-4xl font-bold text-white font-mono">{profile.stats1v1?.avgAccuracy || 0}<span className="text-2xl text-gray-400">%</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1 tracking-widest">BEST WPM</p>
                    <p className="text-2xl font-semibold text-gray-300 font-mono">{profile.stats1v1?.bestWpm || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1 tracking-widest">GAMES / WINS</p>
                    <p className="text-2xl font-semibold text-gray-300 font-mono">
                      <span className="text-white">{profile.stats1v1?.gamesPlayed || 0}</span>
                      <span className="text-gray-600 mx-2">/</span>
                      <span className="text-emerald-400">{profile.stats1v1?.wins || 0}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Multiplayer Stats */}
              <div className="bg-[#111827] border border-white/5 rounded-xl p-6 hover:border-violet-500/30 transition-colors shadow-lg">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                  <span className="w-3 h-3 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"></span>
                  <h3 className="text-white font-bold tracking-wider text-lg">MULTIPLAYER</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1 tracking-widest">AVG WPM</p>
                    <p className="text-4xl font-bold text-violet-400 font-mono">{profile.statsMultiplayer?.avgWpm || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1 tracking-widest">ACCURACY</p>
                    <p className="text-4xl font-bold text-white font-mono">{profile.statsMultiplayer?.avgAccuracy || 0}<span className="text-2xl text-gray-400">%</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1 tracking-widest">BEST WPM</p>
                    <p className="text-2xl font-semibold text-gray-300 font-mono">{profile.statsMultiplayer?.bestWpm || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1 tracking-widest">GAMES / WINS</p>
                    <p className="text-2xl font-semibold text-gray-300 font-mono">
                      <span className="text-white">{profile.statsMultiplayer?.gamesPlayed || 0}</span>
                      <span className="text-gray-600 mx-2">/</span>
                      <span className="text-emerald-400">{profile.statsMultiplayer?.wins || 0}</span>
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
