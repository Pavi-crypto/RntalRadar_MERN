import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b border-blue-soft bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/search" className="flex items-center gap-2 font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue2 text-sm text-white">📡</span>
          RentalRadar
        </Link>
        <nav className="flex items-center gap-1 text-sm font-semibold">
          <Link to="/search" className="rounded-full px-3 py-2 text-slate-500 hover:text-blue2">Search</Link>
          {user?.role === 'tenant' && <Link to="/my-radar" className="rounded-full px-3 py-2 text-slate-500 hover:text-blue2">My radar</Link>}
          {user?.role === 'owner' && <Link to="/dashboard" className="rounded-full px-3 py-2 text-slate-500 hover:text-blue2">Dashboard</Link>}
          <Link to="/guide" className="rounded-full px-3 py-2 text-sm font-semibold opacity-60 hover:opacity-100">📖 Guide</Link>
          {user ? (
            <button onClick={() => { logout(); navigate('/'); }} className="ml-1 rounded-full border border-slate-200 px-4 py-1.5 text-slate-600 hover:border-blue2 hover:text-blue2">Log out</button>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-3 py-2 text-slate-500 hover:text-blue2">Log in</Link>
              <Link to="/register" className="rounded-full bg-blue2 px-4 py-2 text-white">Get started</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
