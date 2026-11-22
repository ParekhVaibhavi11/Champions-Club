import React, { useEffect, useState } from 'react';
import { courtService } from '../../services/courtService';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { 
  Pencil, 
  X, 
  Plus, 
  Wrench, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Layers,
  Clock
} from 'lucide-react';

const emptyCourt = { 
  sport_id: '', 
  name: '', 
  surface_type: '', 
  hourly_rate_member: '', 
  hourly_rate_guest: '',
  is_active: true
};

export const CourtManagement = () => {
  const [sports, setSports] = useState([]);
  const [courts, setCourts] = useState([]);
  const [createForm, setCreateForm] = useState(emptyCourt);
  const [block, setBlock] = useState({ court_id: '', start_time: '', end_time: '', notes: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Edit Court Modal State
  const [editingCourt, setEditingCourt] = useState(null);
  const [editForm, setEditForm] = useState(emptyCourt);
  const [modalError, setModalError] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const load = async () => {
    const [sportsRes, courtsRes] = await Promise.all([courtService.getSports(), courtService.getManageCourts()]);
    setSports(sportsRes.data || []);
    setCourts(courtsRes.data || []);
  };

  useEffect(() => { 
    load().catch((err) => setError(err.message)); 
  }, []);

  const submitCreateCourt = async (event) => {
    event.preventDefault(); 
    setError(''); 
    setMessage('');
    try {
      const payload = { 
        ...createForm, 
        sport_id: Number(createForm.sport_id), 
        hourly_rate_member: Number(createForm.hourly_rate_member), 
        hourly_rate_guest: Number(createForm.hourly_rate_guest) 
      };
      await courtService.createCourt(payload);
      setCreateForm(emptyCourt); 
      setMessage('Court created successfully.'); 
      await load();
    } catch (err) { 
      setError(err.response?.data?.message || err.message || 'Failed to create court.'); 
    }
  };

  const handleOpenEditModal = (court) => {
    setEditingCourt(court);
    setEditForm({ 
      sport_id: String(court.sport_id), 
      name: court.name, 
      surface_type: court.surface_type || '', 
      hourly_rate_member: court.hourly_rate_member, 
      hourly_rate_guest: court.hourly_rate_guest, 
      is_active: court.is_active !== false 
    });
    setModalError('');
  };

  const handleCloseEditModal = () => {
    setEditingCourt(null);
    setEditForm(emptyCourt);
    setModalError('');
  };

  const handleSaveEditedCourt = async (event) => {
    event.preventDefault(); 
    setModalError('');
    setModalSubmitting(true);
    try {
      const payload = { 
        ...editForm, 
        sport_id: Number(editForm.sport_id), 
        hourly_rate_member: Number(editForm.hourly_rate_member), 
        hourly_rate_guest: Number(editForm.hourly_rate_guest),
        is_active: editForm.is_active !== false
      };
      await courtService.updateCourt(editingCourt.id, payload);
      setMessage(`Court "${payload.name}" updated successfully.`);
      handleCloseEditModal();
      await load();
    } catch (err) { 
      setModalError(err.response?.data?.message || err.message || 'Failed to update court.'); 
    } finally {
      setModalSubmitting(false);
    }
  };

  const submitBlock = async (event) => {
    event.preventDefault(); 
    setError(''); 
    setMessage('');
    try {
      const iso = (value) => new Date(value).toISOString();
      await courtService.addMaintenanceBlock(block.court_id, { 
        start_time: iso(block.start_time), 
        end_time: iso(block.end_time), 
        notes: block.notes 
      });
      setMessage('Maintenance window scheduled successfully on the court calendar.'); 
      setBlock({ ...block, start_time: '', end_time: '', notes: '' });
    } catch (err) { 
      setError(err.response?.data?.message || err.message || 'Failed to schedule maintenance.'); 
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-black uppercase text-champion-dark tracking-tight">
          Court Management
        </h1>
        <p className="mt-1 text-sm text-gray-500 font-medium">
          Configure championship courts, sports disciplines, hourly rates, and schedule maintenance windows.
        </p>
      </header>

      {(message || error) && (
        <div className={`rounded-2xl p-4 text-sm font-bold flex items-center space-x-2.5 border ${
          error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {error ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{error || message}</span>
        </div>
      )}

      {/* Top Configuration Grids: Add Court & Schedule Maintenance */}
      <div className="grid gap-6 xl:grid-cols-2">
        
        {/* 1. Add Court Form */}
        <form onSubmit={submitCreateCourt} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
            <Plus className="w-5 h-5 text-champion-red" />
            <h2 className="font-black uppercase text-base text-champion-dark tracking-tight">Add New Court</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <select 
              required 
              value={createForm.sport_id} 
              onChange={(e) => setCreateForm({ ...createForm, sport_id: e.target.value })} 
              className="rounded-xl border border-gray-300 p-3 text-sm font-medium focus:ring-2 focus:ring-champion-red bg-white"
            >
              <option value="">Choose sport</option>
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>{sport.name}</option>
              ))}
            </select>
            <input 
              required 
              placeholder="Court name" 
              value={createForm.name} 
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} 
              className="rounded-xl border border-gray-300 p-3 text-sm font-medium focus:ring-2 focus:ring-champion-red" 
            />
            <input 
              placeholder="Surface type (e.g. Clay, Hard)" 
              value={createForm.surface_type} 
              onChange={(e) => setCreateForm({ ...createForm, surface_type: e.target.value })} 
              className="rounded-xl border border-gray-300 p-3 text-sm font-medium focus:ring-2 focus:ring-champion-red" 
            />
            <input 
              required 
              type="number" 
              min="0" 
              step="0.01" 
              placeholder="Member rate / hour (₹)" 
              value={createForm.hourly_rate_member} 
              onChange={(e) => setCreateForm({ ...createForm, hourly_rate_member: e.target.value })} 
              className="rounded-xl border border-gray-300 p-3 text-sm font-medium focus:ring-2 focus:ring-champion-red" 
            />
            <input 
              required 
              type="number" 
              min="0" 
              step="0.01" 
              placeholder="Guest rate / hour (₹)" 
              value={createForm.hourly_rate_guest} 
              onChange={(e) => setCreateForm({ ...createForm, hourly_rate_guest: e.target.value })} 
              className="rounded-xl border border-gray-300 p-3 text-sm font-medium focus:ring-2 focus:ring-champion-red sm:col-span-2" 
            />
          </div>
          <Button type="submit" variant="primary">Create Court</Button>
        </form>

        {/* 2. Schedule Maintenance Form */}
        <form onSubmit={submitBlock} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
            <Wrench className="w-5 h-5 text-champion-dark" />
            <h2 className="font-black uppercase text-base text-champion-dark tracking-tight">Schedule Maintenance</h2>
          </div>
          <select 
            required 
            value={block.court_id} 
            onChange={(e) => setBlock({ ...block, court_id: e.target.value })} 
            className="w-full rounded-xl border border-gray-300 p-3 text-sm font-medium focus:ring-2 focus:ring-champion-red bg-white"
          >
            <option value="">Choose court</option>
            {courts.filter((court) => court.is_active).map((court) => (
              <option key={court.id} value={court.id}>{court.name} ({court.sport_name})</option>
            ))}
          </select>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Start Time</label>
              <input 
                required 
                type="datetime-local" 
                value={block.start_time} 
                onChange={(e) => setBlock({ ...block, start_time: e.target.value })} 
                className="w-full rounded-xl border border-gray-300 p-3 text-sm font-medium focus:ring-2 focus:ring-champion-red" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">End Time</label>
              <input 
                required 
                type="datetime-local" 
                value={block.end_time} 
                onChange={(e) => setBlock({ ...block, end_time: e.target.value })} 
                className="w-full rounded-xl border border-gray-300 p-3 text-sm font-medium focus:ring-2 focus:ring-champion-red" 
              />
            </div>
          </div>
          <input 
            placeholder="Reason / notes (e.g. Net replacement, resurfacing)" 
            value={block.notes} 
            onChange={(e) => setBlock({ ...block, notes: e.target.value })} 
            className="w-full rounded-xl border border-gray-300 p-3 text-sm font-medium focus:ring-2 focus:ring-champion-red" 
          />
          <Button type="submit" variant="secondary">Block Court Time</Button>
        </form>
      </div>

      {/* Courts Roster Table */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-champion-red" />
            <h2 className="font-black uppercase text-base text-champion-dark tracking-tight">Active Courts Directory</h2>
          </div>
          <span className="text-xs font-bold text-gray-400 font-mono">Total Courts: {courts.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-extrabold border-b border-gray-100">
              <tr>
                <th className="p-4">Court Name</th>
                <th className="p-4">Sport</th>
                <th className="p-4">Surface</th>
                <th className="p-4">Hourly Rates (Member / Guest)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courts.map((court) => (
                <tr key={court.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4 font-bold text-champion-dark">{court.name}</td>
                  <td className="p-4 font-medium text-gray-700">{court.sport_name}</td>
                  <td className="p-4 text-gray-600">{court.surface_type || '—'}</td>
                  <td className="p-4 font-mono font-medium text-gray-800">
                    <span className="text-emerald-700 font-bold">₹{court.hourly_rate_member}</span>
                    <span className="text-gray-400 mx-1.5">/</span>
                    <span className="text-gray-900">₹{court.hourly_rate_guest}</span>
                  </td>
                  <td className="p-4">
                    <Badge variant={court.is_active ? 'junior' : 'default'}>
                      {court.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleOpenEditModal(court)}
                      className="border-gray-300 hover:border-champion-red hover:text-champion-red"
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1.5" />
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit Court Pop-up Modal */}
      {editingCourt && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={handleCloseEditModal}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseEditModal}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-champion-dark hover:bg-gray-100 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center space-x-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-champion-red flex items-center justify-center font-black flex-shrink-0">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-champion-red block">Court Configuration</span>
                <h2 className="text-xl sm:text-2xl font-black text-champion-dark uppercase tracking-tight">
                  Edit Court
                </h2>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1 mb-5">
              Update sport discipline, court name, surface type, hourly rates, and active booking availability for <strong className="text-gray-800">{editingCourt.name}</strong>.
            </p>

            {modalError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditedCourt} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Sport Discipline <span className="text-champion-red">*</span>
                </label>
                <select
                  required
                  value={editForm.sport_id}
                  onChange={(e) => setEditForm({ ...editForm, sport_id: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-champion-red bg-white"
                >
                  <option value="">Choose sport</option>
                  {sports.map((sport) => (
                    <option key={sport.id} value={sport.id}>
                      {sport.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Court Name <span className="text-champion-red">*</span>
                </label>
                <input
                  required
                  placeholder="e.g. Centre Court"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-champion-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Surface Type
                </label>
                <input
                  placeholder="e.g. Clay, Hard Court, Grass, Turf"
                  value={editForm.surface_type}
                  onChange={(e) => setEditForm({ ...editForm, surface_type: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-champion-red"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Member Rate (₹ / hr) <span className="text-champion-red">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={editForm.hourly_rate_member}
                    onChange={(e) => setEditForm({ ...editForm, hourly_rate_member: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-champion-red"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Guest Rate (₹ / hr) <span className="text-champion-red">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="40.00"
                    value={editForm.hourly_rate_guest}
                    onChange={(e) => setEditForm({ ...editForm, hourly_rate_guest: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-champion-red"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                    className="w-4 h-4 text-champion-red rounded focus:ring-champion-red cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-champion-dark block">Court Active & Bookable</span>
                    <span className="text-gray-500 text-[11px]">Uncheck to temporarily take court offline from booking availability matrix</span>
                  </div>
                </label>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCloseEditModal}
                  disabled={modalSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={modalSubmitting}
                >
                  {modalSubmitting ? 'Saving Changes...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
