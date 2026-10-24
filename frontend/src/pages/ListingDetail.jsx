import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import client from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import { Loading, ErrorState } from '../components/states.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [listing, setListing] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ message: '', moveIn: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    client.get(`/listings/${id}`).then((r) => setListing(r.data)).catch((err) => setError(err.message));
    client.get(`/listings/${id}/similar`).then((r) => setSimilar(r.data)).catch(() => {});
  }, [id]);

  async function inquire(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await client.post(`/listings/${id}/inquiries`, {
        message: form.message,
        ...(form.moveIn ? { moveIn: form.moveIn } : {}),
      });
      toast('Inquiry sent — the owner will reply here');
      setForm({ message: '', moveIn: '' });
      const r = await client.get(`/listings/${id}`);
      setListing(r.data);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  if (error) return <div className="min-h-screen"><Navbar /><main className="mx-auto max-w-4xl px-4 py-10"><ErrorState message={error} onRetry={() => window.location.reload()} /></main></div>;
  if (!listing) return <div className="min-h-screen"><Navbar /><Loading label="Opening the listing…" /></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Link to="/search" className="text-sm text-slate-400 hover:text-blue2">← Search</Link>
        <div className="mt-3 rounded-2xl border border-blue-soft bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{listing.title}</h1>
              <p className="mt-1 text-sm text-slate-500">{listing.type} · {listing.address} · {listing.views} views · {listing.inquiryCount} interested</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {listing.amenities.map((a) => <span key={a} className="rounded-full bg-blue-soft px-2.5 py-1 text-xs font-semibold text-blue2">{a}</span>)}
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue2">₹{listing.rent.toLocaleString('en-IN')}<span className="text-sm font-medium text-slate-400">/mo</span></p>
              <p className="text-sm text-slate-400">deposit ₹{listing.deposit.toLocaleString('en-IN')}</p>
              <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase ${listing.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>{listing.status}</span>
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <section className="mt-6 rounded-2xl border border-blue-soft bg-white p-5">
            <h2 className="font-bold">Similar flats nearby</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {similar.map((c) => (
                <Link key={c._id} to={`/listings/${c._id}`} className="flex items-center justify-between rounded-xl border border-blue-soft p-3 text-sm hover:border-blue2">
                  <span><strong>{c.title.slice(0, 30)}</strong><br /><span className="text-xs text-slate-400">{c.type} · {c.distanceKm.toFixed(1)} km away</span></span>
                  <span className="font-bold text-blue2">₹{c.rent.toLocaleString('en-IN')}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-blue-soft bg-white p-5">
            <h2 className="font-bold">Price history</h2>
            <ul className="mt-2 space-y-1 text-sm text-slate-500">
              {listing.priceHistory.map((h, i) => (
                <li key={i} className="flex justify-between">
                  <span>{new Date(h.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="font-bold text-slate-700">₹{h.rent.toLocaleString('en-IN')}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-slate-500">Listed by <strong>{listing.owner?.name}</strong>{listing.owner?.phone && ` · 📞 ${listing.owner.phone}`}</p>
          </section>

          {user?.role === 'tenant' && listing.status === 'available' && (
            <form onSubmit={inquire} className="rounded-2xl border border-blue-soft bg-white p-5">
              <h2 className="font-bold">Interested?</h2>
              <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows="3"
                placeholder="Hi, is it available from…?" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue2" />
              <label className="mt-2 block"><span className="text-sm font-semibold">Move-in date (optional)</span>
                <input type="date" value={form.moveIn} onChange={(e) => setForm({ ...form, moveIn: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue2" /></label>
              <button disabled={busy} className="mt-3 w-full rounded-xl bg-blue2 py-2.5 font-semibold text-white disabled:opacity-60">{busy ? 'Sending…' : 'Send inquiry'}</button>
            </form>
          )}
          {!user && (
            <div className="rounded-2xl border border-blue-soft bg-white p-5">
              <h2 className="font-bold">Interested?</h2>
              <p className="mt-1 text-sm text-slate-500"><Link to="/login" className="font-semibold text-blue2">Log in</Link> to send an inquiry.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
