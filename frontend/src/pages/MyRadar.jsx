import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import { Loading, Empty, ErrorState } from '../components/states.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function MyRadar() {
  const toast = useToast();
  const [searches, setSearches] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [inquiries, setInquiries] = useState(null);
  const [error, setError] = useState('');
  const [thread, setThread] = useState(null);
  const [reply, setReply] = useState('');

  async function load() {
    setError('');
    try {
      const [s, a, i] = await Promise.all([client.get('/searches'), client.get('/alerts'), client.get('/inquiries/mine')]);
      setSearches(s.data);
      setAlerts(a.data);
      setInquiries(i.data);
    } catch (err) {
      setError(err.message);
    }
  }
  useEffect(() => { load(); }, []);

  async function openThread(inquiry) {
    try { setThread((await client.get(`/inquiries/${inquiry._id}`)).data); }
    catch (err) { toast(err.message, 'error'); }
  }

  async function sendReply() {
    try {
      await client.post(`/inquiries/${thread._id}/reply`, { message: reply });
      setThread((await client.get(`/inquiries/${thread._id}`)).data);
      setReply('');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  if (error) return <div className="min-h-screen"><Navbar /><main className="mx-auto max-w-4xl px-4 py-10"><ErrorState message={error} onRetry={load} /></main></div>;
  if (!searches) return <div className="min-h-screen"><Navbar /><Loading label="Tuning the radar…" /></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-bold">My radar</h1>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Saved searches ({searches.length})</h2>
            <button onClick={async () => { await client.post('/alerts/read', {}); toast('Alerts marked read'); load(); }} className="text-sm font-semibold text-blue2 hover:underline">Mark alerts read</button>
          </div>
          {searches.length === 0 && <Empty title="No searches saved" hint="Save one from the search page — the engine checks every 10 minutes." />}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {searches.map((s) => (
              <div key={s._id} className="rounded-2xl border border-blue-soft bg-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">🔔 {s.name}</h3>
                  {s.newMatches > 0 && <span className="rounded-full bg-blue2 px-2 py-0.5 text-xs font-bold text-white">{s.newMatches} new</span>}
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  last run {new Date(s.lastRunAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
                <button onClick={async () => { await client.delete(`/searches/${s._id}`); toast('Search removed'); load(); }}
                  className="mt-2 text-xs font-semibold text-slate-400 hover:text-red-600">remove</button>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-bold">Alerts ({alerts.length})</h2>
          {alerts.length === 0 && <p className="mt-2 text-sm text-slate-400">Nothing yet — new matches land here automatically.</p>}
          <div className="mt-3 space-y-2">
            {alerts.map((a) => (
              <div key={a._id} className={`flex items-center justify-between gap-3 rounded-2xl border p-4 ${a.read ? 'border-slate-100 bg-white' : 'border-blue2/30 bg-blue-soft/40'}`}>
                <div>
                  <Link to={`/listings/${a.listing?._id}`} className="font-bold hover:text-blue2">{a.listing?.title}</Link>
                  <p className="text-xs text-slate-400">{a.reason}</p>
                </div>
                <span className="shrink-0 font-bold text-blue2">₹{a.listing?.rent?.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-bold">My inquiries ({inquiries.length})</h2>
          <div className="mt-3 space-y-2">
            {inquiries.map((q) => (
              <button key={q._id} onClick={() => openThread(q)} className="w-full rounded-2xl border border-blue-soft bg-white p-4 text-left hover:border-blue2">
                <div className="flex items-center justify-between">
                  <span className="font-bold">{q.listing?.title}</span>
                  <span className="text-xs font-semibold text-slate-400">{q.replies.length} replies</span>
                </div>
                <p className="mt-1 truncate text-sm text-slate-500">{q.message}</p>
              </button>
            ))}
            {inquiries.length === 0 && <p className="text-sm text-slate-400">No inquiries yet.</p>}
          </div>
        </section>

        {thread && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setThread(null)}>
            <div onClick={(e) => e.stopPropagation()} className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6">
              <h3 className="font-bold">{thread.listing?.title}</h3>
              <p className="text-xs text-slate-400">with {thread.tenant?.name === JSON.parse(localStorage.getItem('rr2_user'))?.name ? 'you' : thread.tenant?.name}</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="rounded-xl bg-slate-100 p-3"><p className="font-semibold">{thread.tenant?.name}</p><p>{thread.message}</p></div>
                {thread.replies.map((r, i) => (
                  <div key={i} className="rounded-xl bg-blue-soft/50 p-3"><p className="font-semibold">{r.byName}</p><p>{r.message}</p></div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply…" className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue2" />
                <button onClick={sendReply} className="rounded-xl bg-blue2 px-4 py-2 text-sm font-semibold text-white">Send</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
