import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight">
          HabitTracker
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="hover:text-indigo-200 transition-colors">
            Dashboard
          </Link>
          <Link to="/habits" className="hover:text-indigo-200 transition-colors">
            Habits
          </Link>
          <Link to="/categories" className="hover:text-indigo-200 transition-colors">
            Categories
          </Link>
          <span className="text-indigo-200 text-sm">
            {user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="bg-indigo-700 hover:bg-indigo-800 px-3 py-1 rounded text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
