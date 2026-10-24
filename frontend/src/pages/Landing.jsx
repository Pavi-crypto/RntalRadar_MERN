import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex h-20 max-w-5xl items-center justify-between px-4">
        <Link to="/search" className="flex items-center gap-2.5 text-xl font-bold">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue2 text-lg text-white shadow-lg shadow-blue-300">📡</span> RentalRadar
        </Link>
        <Link to={user ? '/search' : '/register'} className="rounded-full bg-blue2 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5">
          {user ? 'Start searching' : 'Find your flat'}
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-4">
        <section className="reveal grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
          <div>
            <h1 className="text-5xl font-bold leading-[1.06] sm:text-6xl">
              Never miss a flat<br /><span className="text-blue2">again</span>.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-500">
              Good rentals go stale in hours and checking five portals daily is
              hopeless. RentalRadar searches by <strong>real distance</strong>, and runs
              your saved searches as background jobs that alert you the moment
              something fits.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/search" className="hover-lift rounded-full bg-blue2 px-8 py-4 font-semibold text-white shadow-xl shadow-blue-200">Search on the map →</Link>
              <Link to="/register" className="glass rounded-full px-8 py-4 font-semibold text-blue2">Save a search</Link>
            </div>
          </div>

          {/* radar map */}
          <div className="relative">
            <div className="glass overflow-hidden rounded-[2rem] p-4">
              <svg viewBox="0 0 400 320" className="w-full">
                <rect width="400" height="320" rx="20" fill="#f8fbff" />
                {Array.from({ length: 9 }).map((_, i) => <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="320" stroke="#e2e8f0" />)}
                {Array.from({ length: 7 }).map((_, i) => <line key={`h${i}`} x1="0" y1={i * 50} x2="400" y2={i * 50} stroke="#e2e8f0" />)}
                <path d="M0,130 Q120,100 220,150 T400,140" stroke="#cbd5e1" strokeWidth="8" fill="none" opacity=".7" />
                <g className="radar" style={{ transformOrigin: '200px 160px' }}>
                  <path d="M200,160 L200,60 A100,100 0 0,1 287,113 Z" fill="rgba(37,99,235,.15)" />
                </g>
                <circle cx="200" cy="160" r="100" fill="none" stroke="#2563eb" strokeDasharray="5 5" opacity=".5" />
                <circle cx="200" cy="160" r="60" fill="none" stroke="#2563eb" strokeDasharray="5 5" opacity=".4" />
                <circle cx="200" cy="160" r="8" fill="#2563eb" stroke="white" strokeWidth="3" />
                {[[120, 90, '₹24k'], [300, 80, '₹42k'], [310, 220, '₹16k'], [90, 230, '₹9.5k'], [260, 260, '₹27k']].map(([x, y, p], i) => (
                  <g key={i} className="pin" style={{ animationDelay: `${i * 0.15}s` }}>
                    <circle cx={x} cy={y} r="14" fill="#2563eb" />
                    <text x={x} y={y + 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="700">{p}</text>
                  </g>
                ))}
              </svg>
            </div>
            <span className="float absolute -left-3 top-10 rounded-2xl border border-blue-soft bg-white px-4 py-2 text-xs font-bold text-blue2 shadow-lg">🔔 2 new matches</span>
          </div>
        </section>

        <section className="reveal grid gap-5 pb-16 sm:grid-cols-3">
          {[
            ['📍', 'Distance, not areas', 'Pick a point and a radius — haversine math finds flats that are actually nearby.'],
            ['⏰', 'Saved-search jobs', 'A cron engine re-runs your searches every 10 minutes and queues alerts on new matches.'],
            ['📊', 'Owner dashboards', 'Views, inquiries and price history per listing — and a one-tap rented toggle.'],
          ].map(([icon, t, b]) => (
            <div key={t} className="rounded-2xl border border-blue-soft bg-white p-7 hover-lift">
              <span className="text-3xl">{icon}</span>
              <h3 className="mt-3 font-bold">{t}</h3>
              <p className="mt-2 text-sm text-slate-500">{b}</p>
            </div>
          ))}
        </section>
      </main>

      <div className="border-y border-blue-soft bg-white/70 py-4">
        <div className="marquee gap-10 text-xs font-bold uppercase tracking-[0.25em] text-blue2/60">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex gap-10 pr-10">
              {['HAVERSINE GEO-SEARCH', 'ALERT CRON EVERY 10 MIN', 'INQUIRY THREADS', 'PRICE HISTORY', 'SVG CITY MAP'].map((t) => (
                <span key={t} className="flex items-center gap-10">{t} <span>📍</span></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <footer className="py-10 text-center text-sm text-slate-400">RentalRadar — never miss a flat again.</footer>
    </div>
  );
}
