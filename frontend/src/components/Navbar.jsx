import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold transition-opacity hover:opacity-80">
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01"/><path d="M10 10h.01"/><path d="M14 10h.01"/><path d="M18 10h.01"/><path d="M8 14h8"/></svg>
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">typex</span>
        </Link>
        {user && (
          <div className="flex items-center gap-4">
            <Link 
              to="/leaderboard"
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-800 text-gray-400 hover:text-amber-400 transition-colors"
              title="Leaderboards"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h20M3 4v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4M8 12v6M12 8v10M16 10v8"/></svg>
            </Link>
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-800 text-gray-400 hover:text-violet-400 transition-colors"
              title="Profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-800 text-gray-400 hover:text-rose-400 transition-colors"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
