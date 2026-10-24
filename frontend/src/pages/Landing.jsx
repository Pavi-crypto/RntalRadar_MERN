import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link to="/search" className="flex items-center gap-2 font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue2 text-sm text-white">📡</span> RentalRadar
        </Link>
        <Link to={user ? '/search' : '/register'} className="rounded-full bg-blue2 px-5 py-2 text-sm font-semibold text-white">
          {user ? 'Start searching' : 'Find your flat'}
        </Link>
      </header>
      <main className="mx-auto max-w-5xl px-4">
        <section className="py-24 text-center">
          <h1 className="mx-auto max-w-2xl text-5xl font-bold leading-tight">
            Never miss a flat <span className="text-blue2">again</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-500">
            Good rentals go stale in hours and checking five portals daily is
            hopeless. RentalRadar searches by real distance, and runs your saved
            searches as background jobs that alert you the moment something fits.
          </p>
          <div className="mt-9 flex justify-center gap-3">
            <Link to="/search" className="rounded-full bg-blue2 px-8 py-3 font-semibold text-white shadow-lg shadow-blue-200">Search on the map</Link>
            <Link to="/register" className="rounded-full border border-blue-soft bg-white px-8 py-3 font-semibold">Save a search</Link>
          </div>
        </section>
        <section className="grid gap-4 pb-24 sm:grid-cols-3">
          {[
            ['Distance, not areas', 'Pick a point on the map and a radius — haversine math finds flats that are actually nearby.'],
            ['Saved-search jobs', 'A cron engine re-runs your searches every 10 minutes and queues alerts on new matches.'],
            ['Owner dashboards', 'Views, inquiries and price history per listing — and a one-tap "rented" toggle.'],
          ].map(([t, b]) => (
            <div key={t} className="rounded-2xl border border-blue-soft bg-white p-6">
              <h3 className="font-bold">{t}</h3>
              <p className="mt-2 text-sm text-slate-500">{b}</p>
            </div>
          ))}
        </section>
      </main>
      <footer className="border-t border-blue-soft py-6 text-center text-sm text-slate-400">RentalRadar — never miss a flat again.</footer>
    </div>
  );
}
