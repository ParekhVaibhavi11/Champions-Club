import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';

const today = new Date().toISOString().slice(0, 10);

export const AdminFinance = () => {
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true); setError('');
    try { const response = await adminService.getLedger(from, to); setPayments(response.data || []); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const exportCsv = () => {
    const headings = ['Payment', 'Invoice', 'Department', 'Source ID', 'Amount', 'Method', 'Status', 'Customer', 'Collected By', 'Date'];
    const rows = payments.map((p) => [p.payment_no, p.invoice_no || '', p.source_type, p.source_id, p.amount, p.payment_method, p.status, p.customer_name || '', p.collected_by || '', new Date(p.created_at).toISOString()]);
    const csv = [headings, ...rows].map((row) => row.map((field) => `"${String(field).replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `champions-club-ledger-${from}-to-${to}.csv`; link.click(); URL.revokeObjectURL(url);
  };
  const total = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

  return <div className="space-y-6"><header className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border bg-white p-6 shadow-sm"><div><h1 className="text-2xl font-black uppercase text-champion-dark">Finance & Payment Ledger</h1><p className="mt-1 text-sm text-gray-500">Recorded cash, card, and UPI payments across club departments.</p></div><button onClick={exportCsv} disabled={!payments.length} className="rounded-lg bg-champion-dark px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40">Export CSV</button></header>
    <section className="flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-4"><label className="text-xs font-bold text-gray-600">From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 block rounded-lg border p-2" /></label><label className="text-xs font-bold text-gray-600">To<input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 block rounded-lg border p-2" /></label><button onClick={load} className="rounded-lg bg-champion-red px-4 py-2.5 text-xs font-bold text-white">Apply range</button><span className="ml-auto text-sm font-black">Total: ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></section>
    {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="p-4">Payment</th><th className="p-4">Invoice</th><th className="p-4">Department / Ref</th><th className="p-4">Customer</th><th className="p-4">Method</th><th className="p-4">Amount</th><th className="p-4">Date</th></tr></thead><tbody className="divide-y">{!loading && payments.map((p) => <tr key={p.id}><td className="p-4 font-mono text-xs">{p.payment_no}</td><td className="p-4 font-mono text-xs">{p.invoice_no || '—'}</td><td className="p-4">{p.source_type} · {p.source_id}</td><td className="p-4">{p.customer_name || 'Walk-in'}</td><td className="p-4">{p.payment_method}</td><td className="p-4 font-bold">₹{Number(p.amount).toFixed(2)}</td><td className="p-4 text-xs">{new Date(p.created_at).toLocaleString()}</td></tr>)}{!loading && !payments.length && <tr><td colSpan="7" className="p-8 text-center text-gray-500">No payments in this date range.</td></tr>}{loading && <tr><td colSpan="7" className="p-8 text-center text-gray-500">Loading ledger…</td></tr>}</tbody></table></div>
  </div>;
};
