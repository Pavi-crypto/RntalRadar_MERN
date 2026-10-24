import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import { Loading, Empty, ErrorState } from '../components/states.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function OwnerDashboard() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: '', type: '2BHK', rent: '', deposit: '', lat: '18.5074', lng: '73.8077', address: '', area: '' });

  async function load() {
    setError('');
    try { setData((await client.get('/listings/mine')).data); }
    catch (err) { setError(err.message); }
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    try {
      await client.post('/listings', {
        ...form,
        rent: Number(form.rent), deposit: Number(form.deposit),
        lat: Number(form.lat), lng: Number(form.lng),
      });
      toast('Listed — tenants with saved searches will be alerted');
      setShowNew(false);
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  if (error) return <div className="min-h-screen"><Navbar /><main className="mx-auto max-w-4xl px-4 py-10"><ErrorState message={error} onRetry={load} /></main></div>;
  if (!data) return <div className="min-h-screen"><Navbar /><Loading label="Opening the dashboard…" /></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Owner dashboard</h1>
          <button onClick={() => setShowNew(true)} className="rounded-full bg-blue2 px-5 py-2.5 text-sm font-semibold text-white">+ List property</button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[['Total views', data.totals.views], ['Inquiries', data.totals.inquiries], ['Available', data.totals.available]].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-blue-soft bg-white p-5">
              <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
              <p className="text-2xl font-bold text-blue2">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          {data.listings.length === 0 && <Empty title="No properties yet" hint="List your first flat — geo search does the marketing." />}
          {data.listings.map((l) => (
            <div key={l._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-soft bg-white p-4">
              <div>
                <Link to={`/listings/${l._id}`} className="font-bold hover:text-blue2">{l.title}</Link>
                <p className="text-xs text-slate-400">{l.type} · {l.area} · {l.views} views · {l.inquiries} inquiries</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-blue2">₹{l.rent.toLocaleString('en-IN')}</span>
                <button onClick={async () => { await client.patch(`/listings/${l._id}/rented`); toast(l.status === 'available' ? 'Marked rented' : 'Back on the market'); load(); }}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold ${l.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {l.status}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showNew && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/40 p-4" onClick={() => setShowNew(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={create} className="my-8 w-full max-w-md rounded-2xl bg-white p-6">
            <h2 className="text-lg font-bold">List a property</h2>
            <label className="mt-3 block"><span className="text-sm font-semibold">Title</span>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-blue2" /></label>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <label className="block"><span className="text-sm font-semibold">Type</span>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2 py-2 outline-none focus:border-blue2">
                  {['1RK', '1BHK', '2BHK', '3BHK', 'PG'].map((t) => <option key={t}>{t}</option>)}
                </select></label>
              <label className="block"><span className="text-sm font-semibold">Rent ₹</span>
                <input required type="number" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-2 py-2 outline-none focus:border-blue2" /></label>
              <label className="block"><span className="text-sm font-semibold">Deposit ₹</span>
                <input required type="number" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-2 py-2 outline-none focus:border-blue2" /></label>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="block"><span className="text-sm font-semibold">Area</span>
                <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Kothrud" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-blue2" /></label>
              <label className="block"><span className="text-sm font-semibold">Address</span>
                <input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Kothrud, Pune" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-blue2" /></label>
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-400">Pick the location on the mini-map (or type coordinates)</p>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <label className="block"><span className="text-xs text-slate-400">Lat</span>
                <input value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue2" /></label>
              <label className="block"><span className="text-xs text-slate-400">Lng</span>
                <input value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue2" /></label>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setShowNew(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 font-semibold text-slate-600">Cancel</button>
              <button className="flex-1 rounded-xl bg-blue2 py-2.5 font-semibold text-white">List it</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
