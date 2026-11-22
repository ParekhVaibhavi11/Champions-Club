import React, { useEffect, useState } from 'react';
import { Plus, Pencil, X } from 'lucide-react';
import { adminService } from '../../services/adminService';

const emptyPlan = {
  name: '', tier: '', monthly_fee: '', court_discount_pct: 0, shop_discount_pct: 0,
  cafe_discount_pct: 0, free_court_hours_per_month: 0, max_daily_sessions: 2,
  description: '', is_active: true,
};

export const AdminMembershipPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState(emptyPlan);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadPlans = async () => {
    setLoading(true);
    try {
      const response = await adminService.getMembershipPlans();
      setPlans(response.data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Could not load membership plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPlans(); }, []);

  const openCreate = () => {
    setFormOpen(true);
    setEditingPlan(null);
    setForm(emptyPlan);
    setError('');
    setMessage('');
  };

  const openEdit = (plan) => {
    setFormOpen(true);
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      tier: plan.tier,
      monthly_fee: plan.monthly_fee,
      court_discount_pct: plan.court_discount_pct,
      shop_discount_pct: plan.shop_discount_pct,
      cafe_discount_pct: plan.cafe_discount_pct,
      free_court_hours_per_month: plan.free_court_hours_per_month,
      max_daily_sessions: plan.max_daily_sessions,
      description: plan.description || '',
      is_active: plan.is_active,
    });
    setError('');
    setMessage('');
  };

  const savePlan = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        tier: form.tier.trim().toUpperCase().replace(/\s+/g, '_'),
        monthly_fee: Number(form.monthly_fee),
        court_discount_pct: Number(form.court_discount_pct),
        shop_discount_pct: Number(form.shop_discount_pct),
        cafe_discount_pct: Number(form.cafe_discount_pct),
        free_court_hours_per_month: Number(form.free_court_hours_per_month),
        max_daily_sessions: Number(form.max_daily_sessions),
      };
      if (editingPlan) await adminService.updateMembershipPlan(editingPlan.id, payload);
      else await adminService.createMembershipPlan(payload);
      setMessage(editingPlan ? 'Membership plan updated.' : 'Membership plan added.');
      setEditingPlan(null);
      setFormOpen(false);
      await loadPlans();
    } catch (err) {
      setError(err.message || 'Could not save membership plan.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const fields = [
    ['name', 'Plan name', 'text'], ['tier', 'Tier code', 'text'], ['monthly_fee', 'Monthly price (₹)', 'number'],
    ['court_discount_pct', 'Court discount (%)', 'number'], ['shop_discount_pct', 'Gear Shop discount (%)', 'number'],
    ['cafe_discount_pct', 'Café discount (%)', 'number'], ['free_court_hours_per_month', 'Free court hours / month', 'number'],
    ['max_daily_sessions', 'Max sessions / day', 'number'],
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border bg-white p-6 shadow-sm">
        <div><h1 className="text-2xl font-black uppercase text-champion-dark">Membership Plans</h1><p className="mt-1 text-sm text-gray-500">Add plan tiers, update prices and benefits, or deactivate plans.</p></div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-champion-red px-4 py-2.5 text-xs font-black uppercase text-white"><Plus className="h-4 w-4" />Add plan</button>
      </header>

      {message && <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div>}
      {error && !editingPlan && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="p-4">Plan</th><th className="p-4">Tier</th><th className="p-4">Monthly fee</th><th className="p-4">Court</th><th className="p-4">Gear</th><th className="p-4">Café</th><th className="p-4">Free hours</th><th className="p-4">Status</th><th className="p-4"></th></tr></thead>
          <tbody className="divide-y">
            {!loading && plans.map((plan) => (
              <tr key={plan.id}>
                <td className="p-4"><strong>{plan.name}</strong><div className="max-w-xs text-xs text-gray-500">{plan.description}</div></td>
                <td className="p-4 font-mono text-xs">{plan.tier}</td>
                <td className="p-4 font-bold">₹{Number(plan.monthly_fee).toFixed(2)}</td>
                <td className="p-4">{Number(plan.court_discount_pct)}%</td>
                <td className="p-4">{Number(plan.shop_discount_pct)}%</td>
                <td className="p-4">{Number(plan.cafe_discount_pct)}%</td>
                <td className="p-4">{plan.free_court_hours_per_month}</td>
                <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${plan.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>{plan.is_active ? 'ACTIVE' : 'INACTIVE'}</span></td>
                <td className="p-4"><button type="button" onClick={() => openEdit(plan)} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold"><Pencil className="h-3.5 w-3.5" />Edit</button></td>
              </tr>
            ))}
            {loading && <tr><td colSpan={9} className="p-8 text-center text-gray-500">Loading membership plans…</td></tr>}
            {!loading && !plans.length && <tr><td colSpan={9} className="p-8 text-center text-gray-500">No membership plans found.</td></tr>}
          </tbody>
        </table>
      </section>

      {formOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) { setEditingPlan(null); setForm(emptyPlan); setFormOpen(false); } }}>
          <form onSubmit={savePlan} className="max-h-[90vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-champion-red">Admin plan settings</p><h2 className="mt-1 text-2xl font-black uppercase">{editingPlan ? 'Update plan' : 'Add membership plan'}</h2></div><button type="button" disabled={saving} onClick={() => { setEditingPlan(null); setForm(emptyPlan); setFormOpen(false); }} aria-label="Close" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X className="h-5 w-5" /></button></div>
            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map(([field, label, type]) => <label key={field} className="text-xs font-bold text-gray-600">{label}<input required type={type} min={type === 'number' ? (field === 'monthly_fee' ? '0.01' : '0') : undefined} step={field.includes('discount') || field === 'monthly_fee' ? '0.01' : type === 'number' ? '1' : undefined} max={field.includes('discount') ? '100' : undefined} value={form[field]} onChange={updateField(field)} className="mt-1 block w-full rounded-lg border p-3 text-sm text-gray-900" /></label>)}
              <label className="text-xs font-bold text-gray-600 sm:col-span-2">Description<textarea value={form.description} onChange={updateField('description')} rows={3} className="mt-1 block w-full rounded-lg border p-3 text-sm text-gray-900" /></label>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 sm:col-span-2"><input type="checkbox" checked={Boolean(form.is_active)} onChange={updateField('is_active')} className="h-4 w-4 accent-emerald-600" />Plan is active and visible to members</label>
            </div>
            <p className="text-xs text-gray-500">Tier code must be unique (for example, GOLD, SILVER, JUNIOR, or PLATINUM). Deactivate a plan to hide it from purchases while preserving its history.</p>
            <div className="flex justify-end gap-3"><button type="button" disabled={saving} onClick={() => { setEditingPlan(null); setForm(emptyPlan); setFormOpen(false); }} className="rounded-lg border px-4 py-2.5 text-sm font-bold text-gray-600">Cancel</button><button type="submit" disabled={saving} className="rounded-lg bg-champion-red px-5 py-2.5 text-sm font-black text-white disabled:opacity-50">{saving ? 'Saving…' : editingPlan ? 'Save changes' : 'Add plan'}</button></div>
          </form>
        </div>
      )}
    </div>
  );
};
