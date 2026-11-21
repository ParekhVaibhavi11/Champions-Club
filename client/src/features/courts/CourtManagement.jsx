import React, { useEffect, useState } from 'react';
import { courtService } from '../../services/courtService';
import { Button } from '../../components/Button';

const emptyCourt = { sport_id: '', name: '', surface_type: '', hourly_rate_member: '', hourly_rate_guest: '' };

export const CourtManagement = () => {
  const [sports, setSports] = useState([]);
  const [courts, setCourts] = useState([]);
  const [form, setForm] = useState(emptyCourt);
  const [editingId, setEditingId] = useState(null);
  const [block, setBlock] = useState({ court_id: '', start_time: '', end_time: '', notes: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const [sportsRes, courtsRes] = await Promise.all([courtService.getSports(), courtService.getManageCourts()]);
    setSports(sportsRes.data || []);
    setCourts(courtsRes.data || []);
  };
  useEffect(() => { load().catch((err) => setError(err.message)); }, []);

  const submitCourt = async (event) => {
    event.preventDefault(); setError(''); setMessage('');
    try {
      const payload = { ...form, sport_id: Number(form.sport_id), hourly_rate_member: Number(form.hourly_rate_member), hourly_rate_guest: Number(form.hourly_rate_guest) };
      if (editingId) await courtService.updateCourt(editingId, { ...payload, is_active: form.is_active !== false });
      else await courtService.createCourt(payload);
      setForm(emptyCourt); setEditingId(null); setMessage(editingId ? 'Court updated.' : 'Court created.'); await load();
    } catch (err) { setError(err.message); }
  };

  const editCourt = (court) => {
    setEditingId(court.id);
    setForm({ sport_id: court.sport_id, name: court.name, surface_type: court.surface_type || '', hourly_rate_member: court.hourly_rate_member, hourly_rate_guest: court.hourly_rate_guest, is_active: court.is_active });
  };

  const submitBlock = async (event) => {
    event.preventDefault(); setError(''); setMessage('');
    try {
      const iso = (value) => new Date(value).toISOString();
      await courtService.addMaintenanceBlock(block.court_id, { start_time: iso(block.start_time), end_time: iso(block.end_time), notes: block.notes });
      setMessage('Maintenance time blocked on the court calendar.'); setBlock({ ...block, start_time: '', end_time: '', notes: '' });
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="space-y-6">
      <header><h1 className="text-2xl font-black uppercase text-champion-dark">Court Management</h1><p className="mt-1 text-sm text-gray-500">Configure courts, sports, rates, and maintenance windows.</p></header>
      {(message || error) && <div className={`rounded-xl p-3 text-sm ${error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{error || message}</div>}

      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={submitCourt} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-black uppercase">{editingId ? 'Edit Court' : 'Add Court'}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <select required value={form.sport_id} onChange={(e) => setForm({ ...form, sport_id: e.target.value })} className="rounded-lg border p-3 text-sm"><option value="">Choose sport</option>{sports.map((sport) => <option key={sport.id} value={sport.id}>{sport.name}</option>)}</select>
            <input required placeholder="Court name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border p-3 text-sm" />
            <input placeholder="Surface type" value={form.surface_type} onChange={(e) => setForm({ ...form, surface_type: e.target.value })} className="rounded-lg border p-3 text-sm" />
            <input required type="number" min="0" step="0.01" placeholder="Member rate / hour" value={form.hourly_rate_member} onChange={(e) => setForm({ ...form, hourly_rate_member: e.target.value })} className="rounded-lg border p-3 text-sm" />
            <input required type="number" min="0" step="0.01" placeholder="Guest rate / hour" value={form.hourly_rate_guest} onChange={(e) => setForm({ ...form, hourly_rate_guest: e.target.value })} className="rounded-lg border p-3 text-sm" />
          </div>
          {editingId && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active !== false} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Court active</label>}
          <div className="flex gap-2"><Button type="submit" variant="primary">{editingId ? 'Save Changes' : 'Create Court'}</Button>{editingId && <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setForm(emptyCourt); }}>Cancel</Button>}</div>
        </form>

        <form onSubmit={submitBlock} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-black uppercase">Schedule Maintenance</h2>
          <select required value={block.court_id} onChange={(e) => setBlock({ ...block, court_id: e.target.value })} className="w-full rounded-lg border p-3 text-sm"><option value="">Choose court</option>{courts.filter((court) => court.is_active).map((court) => <option key={court.id} value={court.id}>{court.name}</option>)}</select>
          <div className="grid gap-3 sm:grid-cols-2"><input required type="datetime-local" value={block.start_time} onChange={(e) => setBlock({ ...block, start_time: e.target.value })} className="rounded-lg border p-3 text-sm" /><input required type="datetime-local" value={block.end_time} onChange={(e) => setBlock({ ...block, end_time: e.target.value })} className="rounded-lg border p-3 text-sm" /></div>
          <input placeholder="Reason / notes (optional)" value={block.notes} onChange={(e) => setBlock({ ...block, notes: e.target.value })} className="w-full rounded-lg border p-3 text-sm" />
          <Button type="submit" variant="primary">Block Court Time</Button>
        </form>
      </div>

      <section className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="p-4">Court</th><th className="p-4">Sport</th><th className="p-4">Surface</th><th className="p-4">Rates (member / guest)</th><th className="p-4">Status</th><th className="p-4"></th></tr></thead><tbody className="divide-y">{courts.map((court) => <tr key={court.id}><td className="p-4 font-bold">{court.name}</td><td className="p-4">{court.sport_name}</td><td className="p-4">{court.surface_type || '—'}</td><td className="p-4">₹{court.hourly_rate_member} / ₹{court.hourly_rate_guest}</td><td className="p-4">{court.is_active ? 'Active' : 'Inactive'}</td><td className="p-4"><Button variant="outline" size="sm" onClick={() => editCourt(court)}>Edit</Button></td></tr>)}</tbody></table>
      </section>
    </div>
  );
};
