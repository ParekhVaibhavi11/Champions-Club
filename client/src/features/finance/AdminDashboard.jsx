import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../../components/Badge';
import { adminService } from '../../services/adminService';

const metrics = [
  ['Today’s revenue', 'today_revenue', (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`],
  ['Bookings today', 'today_bookings', (value) => value],
  ['Active courts', 'active_courts', (value) => value],
  ['Active memberships', 'active_memberships', (value) => value],
  ['Open cafe tabs', 'open_cafe_tabs', (value) => value],
  ['Low stock products', 'low_stock_products', (value) => value],
];

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [error, setError] = useState('');
  const today = new Date();
  const end = today.toISOString().slice(0, 10);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 29);
  const start = startDate.toISOString().slice(0, 10);

  useEffect(() => {
    Promise.all([adminService.getSummary(), adminService.getRevenue(start, end)])
      .then(([summaryRes, revenueRes]) => { setSummary(summaryRes.data); setRevenue(revenueRes.data || []); })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-6 shadow-sm">
        <div><h1 className="text-2xl font-black uppercase text-champion-dark">Club Operations Dashboard</h1><p className="mt-1 text-xs text-gray-500">Owner: {user?.full_name} · Live club totals and last 30 days of recorded payments.</p></div>
        <Badge variant="admin">Administrator</Badge>
      </div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(([label, key, format]) => <article key={key} className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p><p className="mt-2 text-3xl font-black text-champion-dark">{summary ? format(summary[key]) : '—'}</p></article>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="mb-4 font-black uppercase text-champion-dark">Revenue by Department · 30 days</h2>{revenue.length ? <div className="space-y-3">{revenue.map((row) => <div key={row.department} className="flex items-center justify-between border-b pb-3 text-sm"><span className="font-semibold">{row.department}</span><span className="font-mono">₹{Number(row.revenue).toLocaleString('en-IN')} <span className="text-xs text-gray-400">({row.payment_count} payments)</span></span></div>)}</div> : <p className="text-sm text-gray-500">No recorded payments for this period.</p>}</section>
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-black uppercase text-champion-dark">Management</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link to="/admin/courts" className="rounded-xl border p-4 font-bold hover:border-champion-red">Courts & maintenance</Link>
            <Link to="/admin/orders" className="rounded-xl border p-4 font-bold hover:border-champion-red">Orders & Tabs (Shop/Café)</Link>
            <Link to="/admin/finance" className="rounded-xl border p-4 font-bold hover:border-champion-red">Finance ledger</Link>
            <Link to="/admin/hr" className="rounded-xl border p-4 font-bold hover:border-champion-red">Staff & shifts</Link>
          </div>
        </section>
      </div>
    </div>
  );
};
