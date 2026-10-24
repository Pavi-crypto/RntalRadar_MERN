import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) return setError('Enter your email and password.');
    setBusy(true);
    try {
      const u = await login(form.email, form.password);
      toast(u.role === 'owner' ? 'Dashboard ready' : 'Radar on');
      navigate(u.role === 'owner' ? '/dashboard' : '/search');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue2 text-xl text-white">📡</span>
          <h1 className="mt-3 text-2xl font-bold">Welcome back</h1>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-blue-soft bg-white p-6">
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <label className="block"><span className="text-sm font-semibold">Email</span>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue2" /></label>
          <label className="block"><span className="text-sm font-semibold">Password</span>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue2" /></label>
          <button disabled={busy} className="w-full rounded-xl bg-blue2 py-2.5 font-semibold text-white disabled:opacity-60">{busy ? 'Checking…' : 'Log in'}</button>
          <p className="text-center text-sm text-slate-500">New here? <Link to="/register" className="font-semibold text-blue2 hover:underline">Create an account</Link></p>
        </form>
        <p className="mt-4 text-center text-xs text-slate-400">Demo: tenant@demo.com · owner@demo.com · Demo@1234</p>
      </div>
    </div>
  );
}
