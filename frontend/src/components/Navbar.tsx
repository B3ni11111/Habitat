import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();

  const navLink = (to: string, label: string) => {
    const active = pathname === to || (to === '/dashboard' && pathname === '/');
    return (
      <Link
        to={to}
        className={`text-sm font-medium transition-colors ${
          active ? 'text-gray-800' : 'text-stone-400 hover:text-gray-700'
        }`}
      >
        {label}
        {active && (
          <span className="block h-0.5 mt-0.5 rounded-full" style={{ backgroundColor: '#FF8C69' }} />
        )}
      </Link>
    );
  };

  return (
    <nav className="bg-white border-b border-stone-100 sticky top-0 z-10">
      <div className="max-w-[1400px] mx-auto px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black tracking-tight text-gray-800">Habitat</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-400 uppercase tracking-widest">
            beta
          </span>
        </div>
        <div className="flex items-center gap-8">
          {navLink('/dashboard', 'Dashboard')}
          {navLink('/explore', 'Explore')}
          {navLink('/friends', 'Friends')}
        </div>
      </div>
    </nav>
  );
}
