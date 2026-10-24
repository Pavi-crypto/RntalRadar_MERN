import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [role, setRole] = useState('tenant');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function validate() {
    if (form.name.trim().length < 2) return 'Enter your name (2+ characters).';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Enter a valid email address.';
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      return 'Password needs 8+ characters with a letter and a number.';
    return '';
  }

  async function submit(e) {
    e.preventDefault();
    const v = validate();
    setError(v);
    if (v) return;
    setBusy(true);
    try {
      await register({ ...form, name: form.name.trim(), email: form.email.trim(), role });
      toast(role === 'owner' ? 'List your first property!' : 'Radar on — save a search');
      navigate(role === 'owner' ? '/dashboard' : '/search');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Join RentalRadar</h1>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-blue-soft bg-white p-6">
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="grid grid-cols-2 gap-2">
            {[['tenant', "I'm hunting"], ['owner', "I'm listing"]].map(([r, label]) => (
              <button type="button" key={r} onClick={() => setRole(r)}
                className={`rounded-xl border px-3 py-2.5 font-semibold ${role === r ? 'border-blue2 bg-blue-soft text-blue2' : 'border-slate-200 text-slate-500'}`}>{label}</button>
            ))}
          </div>
          <label className="block"><span className="text-sm font-semibold">Name</span>
            <input value={form.name} onChange={set('name')} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue2" /></label>
          <label className="block"><span className="text-sm font-semibold">Email</span>
            <input type="email" value={form.email} onChange={set('email')} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue2" /></label>
          <label className="block"><span className="text-sm font-semibold">Phone (optional)</span>
            <input value={form.phone} onChange={set('phone')} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue2" /></label>
          <label className="block"><span className="text-sm font-semibold">Password</span>
            <input type="password" value={form.password} onChange={set('password')} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue2" /></label>
          <button disabled={busy} className="w-full rounded-xl bg-blue2 py-2.5 font-semibold text-white disabled:opacity-60">{busy ? 'Creating…' : 'Create account'}</button>
          <p className="text-center text-sm text-slate-500">Have one? <Link to="/login" className="font-semibold text-blue2 hover:underline">Log in</Link></p>
        </form>
      </div>
    </div>
  );
}
