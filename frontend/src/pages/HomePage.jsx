import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeUsers, setActiveUsers] = useState(0);

  // create room form state
  const [isPrivate, setIsPrivate] = useState(false);
  const [roomPassword, setRoomPassword] = useState('');
  const [creating, setCreating] = useState(false);

  // join by code state
  const [joinCode, setJoinCode] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joining, setJoining] = useState(false);



  const socket = useSocket();
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.emit('request_active_users');
    
    socket.on('active_users', (count) => {
      setActiveUsers(count);
    });

    // listen for match found
    socket.on('matchmaking:found', ({ roomId }) => {
      setIsSearching(false);
      toast.success('Match found!');
      navigate(`/lobby/${roomId}`);
    });

    return () => {
      socket.off('active_users');
      socket.off('matchmaking:found');
    };
  }, [socket, navigate]);

  const handlePlaySolo = () => {
    if (!socket) {
      toast.error('Connection not established. Please refresh.');
      return;
    }
    setIsSearching(true);
    socket.emit('matchmaking:join', (res) => {
      if (res?.error) {
        setIsSearching(false);
        toast.error(res.error);
      }
    });
  };

  const handleCancelSearch = () => {
    if (!socket) return;
    socket.emit('matchmaking:leave');
    setIsSearching(false);
  };

  // create a new room
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const generatedName = `${user?.username || 'User'}'s Room ${Math.floor(Math.random() * 10000)}`;
      const { data } = await api.post('/rooms/create', {
        name: generatedName,
        mode: 'multi',
        isPrivate,
        password: isPrivate ? roomPassword : undefined,
      });
      toast.success(`Room created! Code: ${data.room.roomId}`);
      navigate(`/lobby/${data.room.roomId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  // join a room by its code
  const handleJoinByCode = async (e) => {
    e.preventDefault();
    setJoining(true);
    try {
      const { data } = await api.post('/rooms/join', {
        roomId: joinCode.trim(),
        password: joinPassword || undefined,
      });
      toast.success('Joined room!');
      navigate(`/lobby/${data.room.roomId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join room');
    } finally {
      setJoining(false);
    }
  };

  // join a room from the list
  const handleJoinRoom = async (roomId) => {
    try {
      await api.post('/rooms/join', { roomId });
      toast.success('Joined room!');
      navigate(`/lobby/${roomId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join room');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Top Actions: Play Solo & Play 1v1 */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Solo Card */}
          <div className="bg-[#111827] border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all hover:border-violet-500/30">
            <h2 className="text-2xl font-bold text-white mb-2">Solo Practice</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-sm">
              Warm up your fingers or practice typing without the pressure of a live match.
            </p>
            <button
              onClick={() => navigate('/solo')}
              className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-lg rounded-xl transition-colors cursor-pointer"
            >
              Start Typing
            </button>
          </div>

          {/* 1v1 Card */}
          <div className="bg-violet-900/20 border border-violet-500/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden transition-all hover:border-violet-500/50">
            {/* Glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-violet-600/30 blur-3xl rounded-full pointer-events-none"></div>
            
            <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Play 1v1 Match</h2>
            <p className="text-violet-200/70 text-sm mb-6 max-w-sm relative z-10">
              Test your typing speed against another player in a real-time competitive battle.
            </p>

            {/* Active Users Badge */}
            <div className="absolute top-4 right-4 bg-black/40 border border-white/10 rounded-full px-3 py-1 flex items-center gap-2 z-10">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-green-400">{activeUsers} Online</span>
            </div>
            
            <div className="relative z-10">
              {isSearching ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mb-3"></div>
                  <p className="text-white font-medium mb-3 text-sm">Searching for opponent...</p>
                  <button
                    onClick={handleCancelSearch}
                    className="px-6 py-2 bg-gray-600/80 hover:bg-gray-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel Search
                  </button>
                </div>
              ) : (
                <button
                  onClick={handlePlaySolo}
                  className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-lg rounded-xl transition-colors cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                >
                  Find Match
                </button>
              )}
            </div>
          </div>
        </div>

        {/* top actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* join by code */}
          <form onSubmit={handleJoinByCode} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Join by Code</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="ABCD-1234"
                required
                className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <button
                type="submit"
                disabled={joining}
                className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors cursor-pointer"
              >
                Join
              </button>
            </div>
            <input
              type="text"
              value={joinPassword}
              onChange={(e) => setJoinPassword(e.target.value)}
              placeholder="Room password (if private)"
              className="mt-2 w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors text-sm"
            />
          </form>

          {/* create room section */}
          <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex flex-col h-full justify-between">
              <div>
                <h2 className="text-lg font-bold text-white mb-2">Create a Room</h2>
                <p className="text-gray-400 text-sm mb-5">Host a private match with friends or open it up for anyone to join.</p>
              </div>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/5">
                  <input
                    type="checkbox"
                    id="privateToggle"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="w-4 h-4 accent-violet-500 cursor-pointer"
                  />
                  <label htmlFor="privateToggle" className="text-sm font-medium text-gray-300 cursor-pointer select-none flex-1">
                    Require Password
                  </label>
                </div>

                {isPrivate && (
                  <input
                    type="text"
                    value={roomPassword}
                    onChange={(e) => setRoomPassword(e.target.value)}
                    placeholder="Enter password..."
                    required
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                  />
                )}

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-3 mt-2 bg-white text-gray-900 hover:bg-gray-200 disabled:opacity-50 font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {creating ? 'Creating...' : (
                    <>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                      Create Room
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default HomePage;
