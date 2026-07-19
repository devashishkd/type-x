import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState('1v1');
  const [leaderboard1v1, setLeaderboard1v1] = useState([]);
  const [leaderboardMulti, setLeaderboardMulti] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        const { data } = await api.get('/leaderboard');
        setLeaderboard1v1(data.leaderboard1v1 || []);
        setLeaderboardMulti(data.leaderboardMulti || []);
      } catch (err) {
        toast.error('Failed to load leaderboards');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboards();
  }, []);

  const activeData = activeTab === '1v1' ? leaderboard1v1 : leaderboardMulti;
  const statsKey = activeTab === '1v1' ? 'stats1v1' : 'statsMultiplayer';

  return (
    <div className="min-h-screen bg-[#090d16]">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-[#111827] rounded-xl overflow-hidden border border-white/5">
            <button
              onClick={() => setActiveTab('1v1')}
              className={`w-full flex items-center gap-3 px-6 py-4 text-left font-medium transition-colors ${
                activeTab === '1v1' 
                  ? 'bg-emerald-400 text-[#090d16]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              1v1 Matches
            </button>
            <button
              onClick={() => setActiveTab('multi')}
              className={`w-full flex items-center gap-3 px-6 py-4 text-left font-medium transition-colors ${
                activeTab === 'multi' 
                  ? 'bg-emerald-400 text-[#090d16]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Multiplayer
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <h1 className="text-4xl font-mono text-gray-200 mb-10 tracking-tight">
            All-time {activeTab === '1v1' ? '1v1' : 'Multiplayer'} Leaderboard
          </h1>

          {loading ? (
            <div className="text-gray-500 animate-pulse font-mono">Loading data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="text-gray-500 text-sm">
                    <th className="pb-4 font-normal w-16 text-center">#</th>
                    <th className="pb-4 font-normal">name</th>
                    <th className="pb-4 font-normal text-right">wpm</th>
                    <th className="pb-4 font-normal text-right">accuracy</th>
                    <th className="pb-4 font-normal text-right">games</th>
                    <th className="pb-4 font-normal text-right">wins</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300 text-sm">
                  {activeData.map((player, index) => {
                    const stats = player[statsKey];
                    return (
                      <tr 
                        key={player._id} 
                        className={`hover:bg-white/5 transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-[#111827]/50'}`}
                      >
                        <td className="py-4 text-center">
                          {index === 0 ? (
                            <svg className="w-5 h-5 mx-auto text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5.825 21 7.2 16.85 4 14.5h3.95L9.3 10.35l2.7 4.15H16l-3.2 2.35L14.175 21 10 18.05z"/></svg>
                          ) : (
                            <span className={index === 1 ? 'text-gray-300 font-bold' : index === 2 ? 'text-amber-600 font-bold' : 'text-gray-500'}>
                              {index + 1}
                            </span>
                          )}
                        </td>
                        <td className="py-4 flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-violet-900 flex items-center justify-center text-xs font-bold text-violet-300">
                            {player.username[0].toUpperCase()}
                          </div>
                          <span className="font-semibold">{player.username}</span>
                        </td>
                        <td className="py-4 text-right text-gray-200">{stats?.avgWpm || 0}</td>
                        <td className="py-4 text-right">{stats?.avgAccuracy || 0}%</td>
                        <td className="py-4 text-right">{stats?.gamesPlayed || 0}</td>
                        <td className="py-4 text-right text-gray-400">{stats?.wins || 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {activeData.length === 0 && (
                <div className="text-center py-12 text-gray-500 font-mono">
                  No players found for this mode.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
